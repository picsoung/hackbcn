import type { CSSProperties } from 'react'

const COLORS = {
  ground: '#06060E',
  raised: '#0B0A16',
  violet: '#241242',
  pink: '#FF3D9A',
  cyan: '#4DE3E8',
  ink: '#E6E8F2',
  dim: '#9AA0BF',
  paper: '#EFEADF',
}

function PixelCorners({ color }: { color: string }) {
  const corner: CSSProperties = {
    position: 'absolute',
    width: 16,
    height: 16,
    background: color,
  }

  return (
    <>
      <div style={{ ...corner, left: 0, top: 0 }} />
      <div style={{ ...corner, right: 0, top: 0 }} />
      <div style={{ ...corner, left: 0, bottom: 0 }} />
      <div style={{ ...corner, right: 0, bottom: 0 }} />
    </>
  )
}

function PixelWordmark() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 46, height: 46, background: COLORS.pink, color: COLORS.ground, fontSize: 25, fontWeight: 900, lineHeight: 1 }}>H</div>
      <div style={{ display: 'flex', fontSize: 28, fontWeight: 900, letterSpacing: '-0.04em', color: COLORS.ink }}>HackBarna</div>
      <div style={{ display: 'flex', color: COLORS.cyan, fontSize: 20 }}>▮</div>
    </div>
  )
}

export function formatOgDate(startDate: string, endDate?: string) {
  const start = new Date(startDate)
  const end = endDate ? new Date(endDate) : start
  const month = new Intl.DateTimeFormat('en', { month: 'short', timeZone: 'UTC' })
  const sameDay = start.toISOString().slice(0, 10) === end.toISOString().slice(0, 10)
  const sameMonth = start.getUTCMonth() === end.getUTCMonth()
  const sameYear = start.getUTCFullYear() === end.getUTCFullYear()

  if (sameDay) return `${month.format(start)} ${start.getUTCDate()}, ${start.getUTCFullYear()}`
  if (sameMonth && sameYear) return `${month.format(start)} ${start.getUTCDate()}–${end.getUTCDate()}, ${end.getUTCFullYear()}`
  if (sameYear) return `${month.format(start)} ${start.getUTCDate()} – ${month.format(end)} ${end.getUTCDate()}, ${end.getUTCFullYear()}`
  return `${month.format(start)} ${start.getUTCDate()}, ${start.getUTCFullYear()} – ${month.format(end)} ${end.getUTCDate()}, ${end.getUTCFullYear()}`
}

export default function OpenGraphCard({ title, eyebrow, date, location, imageUrl, footer = 'hackbarna.com' }: { title: string; eyebrow?: string; date?: string; location?: string; imageUrl?: string; footer?: string }) {
  const details = [date, location].filter(Boolean)

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', overflow: 'hidden', background: COLORS.ground, color: COLORS.ink, fontFamily: 'Inter, Arial, sans-serif' }}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', opacity: 0.18, backgroundImage: 'linear-gradient(#4DE3E8 1px, transparent 1px), linear-gradient(90deg, #4DE3E8 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      <div style={{ position: 'absolute', left: 0, top: 0, width: 14, height: '100%', background: COLORS.pink }} />
      <div style={{ position: 'absolute', left: 14, top: 0, width: 6, height: '100%', background: COLORS.cyan }} />

      <div style={{ display: 'flex', width: '100%', padding: '54px 58px 48px 76px', gap: 52, position: 'relative' }}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 54%', minWidth: 0 }}>
          <PixelWordmark />
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 72 }}>
            {eyebrow && <div style={{ display: 'flex', alignSelf: 'flex-start', padding: '8px 13px', background: COLORS.cyan, color: COLORS.ground, fontSize: 17, fontWeight: 800, letterSpacing: '0.13em', textTransform: 'uppercase' }}>{eyebrow}</div>}
            <div style={{ display: 'flex', marginTop: eyebrow ? 20 : 0, fontSize: title.length > 28 ? 55 : 64, lineHeight: 1.02, fontWeight: 900, letterSpacing: '-0.045em', maxWidth: 600 }}>{title}</div>
            {details.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', marginTop: 34, gap: 10, fontSize: 24, lineHeight: 1.25 }}>
                {date && <div style={{ display: 'flex', color: COLORS.ink, fontWeight: 750 }}><span style={{ color: COLORS.pink, marginRight: 12 }}>■</span>{date}</div>}
                {location && <div style={{ display: 'flex', color: COLORS.dim, fontWeight: 600 }}><span style={{ color: COLORS.cyan, marginRight: 12 }}>■</span>{location}</div>}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', marginTop: 'auto', color: COLORS.dim, fontSize: 17, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{footer}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 43%', position: 'relative' }}>
          <div style={{ position: 'absolute', width: 410, height: 410, background: COLORS.violet, transform: 'translate(25px, 18px)' }} />
          <div style={{ display: 'flex', width: 430, height: 430, padding: 13, paddingBottom: 48, position: 'relative', background: COLORS.paper, transform: 'rotate(2deg)' }}>
            <PixelCorners color={COLORS.ground} />
            <div style={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden', position: 'relative', background: COLORS.raised }}>
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt="" width="404" height="369" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.pink, fontSize: 132, fontWeight: 900 }}>H</div>
              )}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', opacity: 0.17, backgroundImage: 'linear-gradient(90deg, transparent 50%, #06060E 50%), linear-gradient(transparent 50%, #06060E 50%)', backgroundSize: '6px 6px' }} />
            </div>
            <div style={{ position: 'absolute', left: 36, right: 36, bottom: 14, display: 'flex', justifyContent: 'space-between', color: COLORS.ground, fontSize: 13, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              <span>Barcelona</span><span style={{ color: COLORS.pink }}>build / ship / repeat</span>
            </div>
          </div>
          <div style={{ position: 'absolute', top: 62, right: -3, display: 'flex', padding: '8px 18px', background: COLORS.pink, color: COLORS.ground, fontSize: 15, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', transform: 'rotate(3deg)' }}>✦ HackBarna ✦</div>
        </div>
      </div>
    </div>
  )
}
