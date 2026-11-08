#!/usr/bin/env python3
"""Build the English draft from the same offers and translations as the website.

Requires reportlab and Pillow. Run from any directory. Optionally set
SPONSORSHIP_FONT_DIR to a directory containing Arial.ttf and Arial Bold.ttf.
Never overwrites either historical public/sponsorship*.pdf file.
"""
import json
import os
import re
from html import escape
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit
from xml.etree import ElementTree

from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / 'data/sponsorship.json').read_text())
COPY = json.loads((ROOT / 'i18n/en.json').read_text())
W, H = 842, 595
INK, RAISED, VIOLET = '#06060E', '#140F26', '#241242'
WHITE, DIM, PINK, CYAN, PAPER = '#E6E8F2', '#9AA0BF', '#FF3D9A', '#4DE3E8', '#EFEADF'
OUTPUT = ROOT / 'public' / DATA['prospectusUrl'].lstrip('/')

font_dir = Path(os.environ.get('SPONSORSHIP_FONT_DIR', '/System/Library/Fonts/Supplemental'))
if (font_dir / 'Arial.ttf').exists() and (font_dir / 'Arial Bold.ttf').exists():
    pdfmetrics.registerFont(TTFont('HB', str(font_dir / 'Arial.ttf')))
    pdfmetrics.registerFont(TTFont('HB-Bold', str(font_dir / 'Arial Bold.ttf')))
else:
    # ReportLab's bundled Vera fonts keep the euro glyph and Unicode text portable.
    import reportlab
    fonts = Path(reportlab.__file__).parent / 'fonts'
    pdfmetrics.registerFont(TTFont('HB', str(fonts / 'Vera.ttf')))
    pdfmetrics.registerFont(TTFont('HB-Bold', str(fonts / 'VeraBd.ttf')))
pdfmetrics.registerFontFamily('HB', normal='HB', bold='HB-Bold')

c = canvas.Canvas(str(OUTPUT), pagesize=(W, H), pageCompression=1, invariant=1)
c.setTitle('HackBarna partnerships 2026-27 | Draft')
c.setAuthor('HackBarna')
c.setSubject('Partnership options, event formats, and venue hosting with HackBarna.')

def text(key):
    return COPY['partner.' + key].replace('–', '-').replace('—', '-')

def paragraph(value, x, top, width, size=12, color=WHITE, bold=False, leading=None):
    style = ParagraphStyle('hb', fontName='HB-Bold' if bold else 'HB', fontSize=size,
                           leading=leading or size * 1.45, textColor=HexColor(color))
    p = Paragraph(escape(value), style)
    _, height = p.wrap(width, H)
    if top + height > (H - 9 if top >= H - 31 else H - 38):
        raise ValueError(f'Text exceeds page bounds: {value[:70]}')
    p.drawOn(c, x, H - top - height)
    return top + height

def label(value, x=42, top=88, color=CYAN):
    return paragraph(value.upper(), x, top, W - x - 42, 9, color, True)

def rule(top, x=42, width=W-84, color=DIM):
    c.setStrokeColor(HexColor(color)); c.setLineWidth(.5)
    c.line(x, H-top, x+width, H-top)

def wordmark(x=42, top=32, width=145, color=WHITE):
    # Draw the repository's actual pixel wordmark as vector paths, not a font approximation.
    root = ElementTree.parse(ROOT / 'public/brand/wordmark-white.svg').getroot()
    scale = width / 485
    c.saveState(); c.translate(x, H-top); c.scale(scale, -scale); c.setFillColor(HexColor(color))
    for element in root.iter('{http://www.w3.org/2000/svg}path'):
        tokens = re.findall(r'[A-Za-z]|[-+]?(?:\d*\.\d+|\d+)', element.attrib['d'])
        path = c.beginPath(); i = 0; cx = cy = sx = sy = 0
        while i < len(tokens):
            command = tokens[i]; i += 1
            if command == 'Z': path.close(); cx, cy = sx, sy; continue
            arity = {'M': 2, 'L': 2, 'H': 1, 'V': 1, 'C': 6}.get(command)
            if arity is None: raise ValueError(f'Unsupported wordmark path command: {command}')
            values = list(map(float, tokens[i:i+arity])); i += arity
            if command == 'M': cx, cy = values; sx, sy = values; path.moveTo(cx, cy)
            elif command == 'L': cx, cy = values; path.lineTo(cx, cy)
            elif command == 'H': cx = values[0]; path.lineTo(cx, cy)
            elif command == 'V': cy = values[0]; path.lineTo(cx, cy)
            elif command == 'C': path.curveTo(*values); cx, cy = values[-2:]
        c.drawPath(path, fill=1, stroke=0, fillMode=0)
    c.restoreState()

def page(number, background=INK):
    c.setFillColor(HexColor(background)); c.rect(0, 0, W, H, fill=1, stroke=0)
    wordmark()
    paragraph('PARTNERSHIPS / 2026-27', W-230, 39, 190, 9, CYAN, True)
    rule(H-31)
    paragraph('DRAFT  |  Partnership scope and production are shaped together.', 42, H-25, 690, 7, DIM)
    paragraph(f'{number:02d} / 04', W-82, H-25, 50, 7, DIM)

def photo(src, x, top, width, height):
    c.saveState()
    p=c.beginPath(); p.rect(x, H-top-height, width, height); c.clipPath(p, stroke=0)
    image = ImageReader(str(ROOT / 'public' / src.lstrip('/')))
    iw, ih = image.getSize()
    scale = max(width / iw, height / ih)
    c.drawImage(image, x+(width-iw*scale)/2, H-top-ih*scale, width=iw*scale, height=ih*scale, mask='auto')
    c.restoreState()

def booking_url(source):
    parts=urlsplit(DATA['bookingUrl'])
    query=dict(parse_qsl(parts.query))
    query.update(utm_source='hackbarna',utm_medium='prospectus',utm_campaign='sponsorship-2026-27',utm_content=source)
    notes=DATA['bookingTopics'].get(source)
    if notes: query['notes']=notes
    return urlunsplit((parts.scheme,parts.netloc,parts.path,urlencode(query),parts.fragment))

def booking(x=42, top=480, title=None, source='prospectus'):
    width=186; height=34
    c.setFillColor(HexColor(PINK)); c.rect(x, H-top-height, width, height, fill=1, stroke=0)
    paragraph(title or text('book'), x+14, top+8, width-28, 11, INK, True)
    c.linkURL(booking_url(source), (x, H-top-height, x+width, H-top), relative=0)

def finish(): c.showPage()

# 1 / Invitation and audience
page(1)
paragraph(text('hero.title') + ' ' + text('hero.accent'),42,100,750,40,WHITE,True,46)
paragraph(text('hero.body'),42,176,430,12,DIM)
booking(x=570,top=190)
stats=DATA['communityStats']
latest=DATA['evidence'][-1]
metrics=[(str(stats['hackNightAverageBuilders']), text('audience.hacknightAverage')),
         (str(latest['hackers']), text('audience.hackers')),
         (f"{stats['mailingListSubscribers']:,}{stats['mailingListQualifier']}",text('audience.mailingList'))]
metrics += [(f"{metric['value']}%",text(metric['labelKey'])) for metric in DATA.get('audienceMetrics',[]) if metric['status']=='approved' and metric.get('source') and metric.get('basisKey')]
for i,(value,description) in enumerate(metrics):
    x=42+i*194
    paragraph(value,x,257,180,21,WHITE,True)
    paragraph(description,x,290,180,9,DIM)
c.setFillColor(HexColor(PAPER)); c.rect(38,H-518,766,181,fill=1,stroke=0)
photo(DATA['photos']['hero'],42,341,758,173)
paragraph(text('hero.caption'),42,525,750,8,DIM)
finish()

# 2 / Partner outcomes
page(2)
paragraph(text('stories.title'),42,92,750,30,WHITE,True)
for i,story in enumerate(DATA['cases']):
    x=42+i*392
    label(story['partner'],x,160,PINK)
    paragraph(text(f"case.{story['id']}.summary"),x,191,355,12,DIM)
    top=paragraph(text('partner.events'),x,340,355,10,WHITE,True)
    for event in story['events']:
        top=paragraph(event['name'],x,top+8,355,10,DIM)
        c.linkURL('https://hackbarna.com/en'+event['path'],(x,H-top,x+355,H-top+15),relative=0)
    top=paragraph(text('source.link'),x,top+14,355,10,WHITE,True)
    c.linkURL(story['source'],(x,H-top,x+355,H-top+15),relative=0)
rule(474)
paragraph(f"{latest['outputCount']} {text('audience.projects')}",42,491,750,12,CYAN)
c.linkURL('https://hackbarna.com/en'+latest['eventPath'],(42,H-513,450,H-491),relative=0)
finish()

# 3 / Two ways to participate
page(3,RAISED)
paragraph(text('packages.title'),42,92,750,30,WHITE,True)
for i,option in enumerate(DATA['partnershipOptions']):
    x=42+i*392; width=355
    rule(160,x,width,PINK if option['id']=='technology' else DIM)
    paragraph(text(f"option.{option['id']}.name"),x,182,width,25,WHITE,True,30)
    top=240
    for feature in option['features']:
        top=paragraph('+ '+text(f"option.{option['id']}.{feature}"),x,top,width,12,DIM)+15
    booking(x=x,top=350,title=text(f"option.{option['id']}.cta"),source=f"option-{option['id']}")
paragraph(text('packages.details'),42,403,750,9,DIM)
rule(433)
paragraph(text('managed.title'),42,449,750,18,WHITE,True)
paragraph(text('managed.body'),42,485,505,10,DIM)
booking(x=600,top=490,title=text('managed.cta'),source='managed-hackathon')
finish()

# 4 / Venue hosts
page(4,RAISED)
paragraph(text('venue.title'),42,105,750,34,WHITE,True)
paragraph(text('venue.body'),42,179,680,14,DIM)
booking(top=267,title=text('venue.cta'),source='host-venue')
paragraph(DATA['bookingUrl'].removeprefix('https://'),250,276,450,12,WHITE)
c.linkURL(booking_url('host-venue'),(250,H-295,750,H-270),relative=0)
photo(DATA['photos']['hero'],42,341,758,173)
paragraph(text('hero.caption'),42,525,750,8,DIM)
finish()
c.save()
print(OUTPUT)
