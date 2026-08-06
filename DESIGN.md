---
name: HackBarna
description: Barcelona after midnight. Pixel forms, ordered dither, and neon on coloured darks.
colors:
  night-ink: "#06060E"
  night-raised: "#0B0A16"
  night-indigo: "#140F26"
  night-violet: "#241242"
  neon-pink: "#FF3D9A"
  neon-cyan: "#4DE3E8"
  sea-0: "#04080F"
  sea-1: "#07131F"
  sea-2: "#0B2030"
  sea-3: "#0E2A3C"
  screen: "#E6E8F2"
  screen-dim: "#9AA0BF"
  paper: "#EFEADF"
typography:
  display:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3.75rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.875rem, 3.5vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "normal"
  body-lead:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "normal"
  label:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0.3em"
rounded:
  none: "0px"
  step-sm: "3px"
  step: "4px"
  step-lg: "6px"
  pill: "9999px"
spacing:
  module: "4px"
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1.5rem"
  lg: "2.5rem"
  section: "4rem"
  section-lg: "6rem"
components:
  button-primary:
    backgroundColor: "{colors.neon-pink}"
    textColor: "{colors.night-ink}"
    rounded: "{rounded.step}"
    padding: "0.75rem 1.5rem"
  button-primary-hover:
    backgroundColor: "{colors.neon-cyan}"
    textColor: "{colors.night-ink}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.screen}"
    rounded: "{rounded.step}"
    padding: "0.75rem 1.5rem"
  chip-type:
    backgroundColor: "rgba(232, 82, 63, 0.15)"
    textColor: "{colors.neon-pink}"
    rounded: "{rounded.step-sm}"
    padding: "0.125rem 0.625rem"
  chip-hacknight:
    backgroundColor: "rgba(217, 169, 90, 0.15)"
    textColor: "{colors.neon-cyan}"
    rounded: "{rounded.step-sm}"
    padding: "0.125rem 0.625rem"
  card-event:
    backgroundColor: "{colors.night-raised}"
    textColor: "{colors.screen}"
    rounded: "{rounded.step}"
    padding: "1.5rem"
  input-email:
    backgroundColor: "{colors.night-raised}"
    textColor: "{colors.screen}"
    rounded: "{rounded.step-sm}"
    padding: "0 0.75rem"
    height: "2.5rem"
  polaroid:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.night-ink}"
    rounded: "{rounded.none}"
    padding: "0.5rem 0.5rem 2rem"
    width: "11rem"
  sponsor-plate:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.step-sm}"
    padding: "0.75rem 1rem"
  ribbon:
    backgroundColor: "{colors.night-ink}"
    textColor: "{colors.screen}"
    padding: "0.5rem 1rem"
  footer-inversion:
    backgroundColor: "{colors.neon-cyan}"
    textColor: "{colors.night-ink}"
    padding: "3rem 1.5rem"
---

# Design System: HackBarna

## 1. Overview

**Creative North Star: "Barcelona, after midnight"**

The system is one image held at low resolution, and the light source is signage rather than the sun. Nothing here is smooth. Grounds are coloured darks that step, corners are staircases, photographs are thresholded through an ordered Bayer tile, and the wordmark is drawn on the same 5-unit grid the signet is. The brand is a screen that cannot quite hold the city, and is more interesting for failing.

That failure is the voice. Glitch is not decoration: a scanline tears once on arrival and settles, the mark fringes magenta and cyan under the cursor, a photograph resolves from dither to full colour when you reach for it. Each fires on a change of state and then stops. The moment glitch becomes ambient it reads as costume.

**This palette runs deliberately at PRODUCT.md's first anti-reference** — *"the AI-startup neon-on-black cliché: black/dark background, cyan glow, grid lines, terminal mono as decoration."* It was chosen with that understood. Four things keep the palette from becoming the cliché, and none of them is optional:

1. **Never pure black.** Grounds are violet- and indigo-tinted inks that step. A coloured dark is not a void.
2. **No glow.** No coloured shadow, no bloom, no glass. This is the loudest tell. Texture comes from the dither; emphasis from the chromatic split on state.
3. **No grid lines, no matrix rain, no terminal chrome.**
4. **Every dark surface carries a real photograph or is plain ramp ground.** The dithered archive is the primary defence, so it is load-bearing rather than ornamental.

**Key Characteristics:**

- Coloured darks step through indigo and violet, punctuated by two drenched neon bands
- Drenched bands carry near-black type and nothing else
- Photographs keep their own hues; contrast posterises and the tile supplies the screen door
- No radius at all: every box loses its corner to a two-step staircase
- Two whites: warm paper for physical objects, cool screen white for everything rendered
- Glitch fires on state change and then stops

## 2. Colors

Coloured darks plus two neon channels. Every figure below is measured.

### Primary

- **Neon Pink** (`#FF3D9A`): the org accent **and** the drenched mid-page band. Holds **5.15–6.14:1** on every dark rung, so unlike the coral it replaces it never has to be swapped out on a band.
- **Neon Cyan** (`#4DE3E8`): aisummit26's accent, the org's punctuation, and the closing band. **10.86–12.95:1** on every dark rung, the most legible colour in the system.

### Secondary: the grounds

- **Night Ink** (`#06060E`) → **Night Raised** (`#0B0A16`) → **Night Indigo** (`#140F26`) → **Night Violet** (`#241242`). Violet-black through to violet, never pure black. Night Raised is the constant card colour.

### Tertiary: the sea register

**Sea 0–3** (`#04080F`, `#07131F`, `#0B2030`, `#0E2A3C`). The cooler rungs for the port-side edition, where cyan leads and pink is punctuation.

### Neutral: the two whites

- **Screen** (`#E6E8F2`): cool white, **16.53:1** on ink. Every rendered thing — headlines, body, UI, captions.
- **Screen Dim** (`#9AA0BF`): **7.84:1** on ink. Secondary type, valid down to violet at 6.58.
- **Paper** (`#EFEADF`): warm bone. **Physical objects only** — polaroid frames and sponsor plates. The warmth is the point: it separates the photographed object from the screen it is displayed on.

### Named Rules

**The Drenched Band Rule.** A neon band takes near-black type and nothing else. On pink, the cool white is 2.87:1, cyan is 2.25:1, and near-black at 70% is 4.18:1 — all fail. Only full near-black clears, at 6.14:1. Cyan is more forgiving and holds a dim tier down to 60% (4.71:1). **If a surface needs two levels of text colour, it cannot be pink**: that is why the stats band, which is a handful of large words, is the pink one, and the footer, which is a list of links plus a copyright line, is the cyan one.

**The Separation Rule.** Two drenched bands never touch. A dark rung always sits between them, so the page reads as punctuation rather than as a gradient.

**The No Glow Rule.** No coloured shadow, no bloom, no backdrop blur. On a neon palette this single rule decides whether the page reads as designed or as a template. The only hued shadow in the system is the chromatic split, and it exists solely as a hover and focus state.

**The Ring Follows The Fill Rule.** A focus ring must contrast with the surface it sits on, not with the page. On a pink or cyan fill the inset ring is near-black; on a dark fill it is cool white. A cool-white ring on pink is 2.87:1 and fails.

**The Warm Plate Rule.** Paper never lands on a drenched band — warm bone on cyan is 1.28:1. Sponsor plates sit on dark rungs only.

### A rule this system reverses

The previous palette banned pale cyan as a UI colour, on the grounds that pale cyan on near-black *is* the cliché. Cyan is now the highest-contrast accent here. The ban is lifted; the defence moved to the No Glow Rule and the requirement that dark surfaces carry real photographs.

## 3. Typography

**Display / Body:** Inter, via `next/font/google`, with `ui-sans-serif, system-ui, sans-serif` fallbacks.
**Label / Kicker:** the platform mono stack.
**Display artifact:** the pixel wordmark itself, a custom alphabet containing only the letters of "hackbarna".

**Character:** One neutral sans carries every reading size; the pixel voice lives entirely in the mark, the dither and the glitch. This is a deliberate choice rather than an omission: a bitmap face would have been the obvious move, and the obvious move here is Press Start 2P and its relatives, which are exactly the costume this system avoids. Inter is also load-bearing across four locales.

### Hierarchy

- **Display** (700, `clamp(2.25rem, 5vw, 3.75rem)`, line-height **1.15**): Hero headlines. Composed from multiple i18n keys so individual words carry pink.
- **Headline** (700, `clamp(1.875rem, 3.5vw, 3rem)`, line-height **1.1**): Section and event titles.
- **Title** (600, 1.125–1.5rem): Card headings. Shifts to pink on card hover.
- **Body** (400, 1rem, line-height **1.7**): Measure capped at 65–75ch.
- **Label** (mono, 0.75rem, uppercase, tracking 0.28–0.32em): Section kickers and metadata.

### Named Rules

**The Light-On-Dark Leading Rule.** Every reading size gains 0.05–0.1 line-height over its light-ground equivalent, because light type on a dark ground reads lighter than it is and closes up. Display went 1.1 → 1.15, body 1.625 → 1.7. Long-form adds more still via `.hb-prose`.

**The Kicker Restraint Rule.** The mono uppercase kicker is voice, but repeating it above every section turns it into AI scaffolding, and mono-on-dark is one of the named anti-references. Use it where a section genuinely opens a chapter. If three consecutive sections carry one, delete the middle.

**The Slash Rule.** Accent kickers open with a forward slash (`/ by the numbers`). It is now the *only* piece of dev shorthand in the system: the `{HackBarna}` brace mark was retired when the pixel lockup arrived, because the lockup is the wordmark and carrying both was redundant.

**The No-Gradient-Text Rule.** Highlight words are solid pink or solid cyan. `background-clip: text` is prohibited.

## 4. Elevation

Flat. Bands separate by ramp step, never by shadow. Shadow carries one meaning: **this is a physical object resting on the wall** — a polaroid, or a card you can press. Nothing else casts one.

The system's real depth cue is not shadow at all, it is the ladder: a section is "above" another because it is colder, not because it floats.

### Shadow Vocabulary

- **Card rest** (`0 1px 2px 0 rgb(0 0 0 / 0.05)`): Event cards, sponsor plates.
- **Card hover** (`0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`): Paired with a title colour shift, never a translate.
- **Photo object** (`0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`): Polaroids.

### Named Rules

**The Stepped Corner Rule.** Boxes have no radius. Each corner is a two-step staircase at the module (`.hb-px`, `--px-step` of 3px on chips and buttons, 4px default, 6px on large photo frames). Three consequences, and they are the parts that get missed:

- `clip-path` **erases box-shadow**, which is how every focus ring here is drawn. Never put `.hb-px` on an `<a>` or `<button>` that carries a `ring-offset-*` ring. Either the interactive element stays unclipped and an inner div carries the fill and the clip (the polaroid, the partner marquee), or the element is clipped and its ring goes `ring-inset` in a colour that contrasts with its own fill (every button).
- A clipped element **cannot render a border**. Bordered cards nest two clipped layers: an outer one in the border colour with 1px of padding, an inner one carrying the fill.
- Clipped surfaces use `filter: drop-shadow()` rather than `box-shadow`, so the lift follows the staircase.

**The Pixel Rule Rule.** Decorative dividers are `.hb-rule`: 2px tall, dashed at module scale. Structural 1px borders — the nav edge, card borders, section boundaries — stay solid. A dashed line there reads as noise, not as voice.

**The Constant Card Rule.** Cards are always Night Raised, whatever band they sit on. Against the drenched pink they are 5.61:1 and against cyan 12.60:1, both well past the 3:1 that non-text UI needs. The payoff is that pink type stays legible inside a card (5.97:1) even when sitting on a band that would have killed it.

**The No Ambient Glow Rule.** No coloured shadows, no glow, no `shadow-neon`. That token has been deleted from the config.

## 5. Components

### The mark

Full lockup and knot signet, served as static SVG from `public/brand/` in two tones: **light** for every dark rung, **dark** for the drenched bands. Files rather than inlined paths, because the lockup is 14KB of coordinates and the navbar is a client component. `drop-shadow()` follows an `<img>`'s alpha, so the chromatic split still works on a file-served mark.

### Polaroid (signature component, carried over)

A warm paper frame with 8px sides and a 32px chin, a square dithered photograph, and a caption in someone's voice. Every instance carries a hand-set `rotate` between -6° and +5° and a `translateY` off the baseline, passed as props, never randomized. On hover or focus it straightens, scales to 1.06, **and the photograph develops from dither to full colour.**

- **Corner style:** square (0px). The only truly square component.
- **Caption:** near-black at 70% *on the warm paper frame*. Not a light tone, which would be light-on-light.
- **Tape:** optional strip at -3° in pink or cyan, both carrying near-black marks.
- **Focus:** pink ring offset against the page ground. The ring lives on the unclipped wrapper, never on the clipped paper.

### Dither (signature treatment)

`.hb-dither` wraps an image with `.hb-dither-img` and a `.hb-dither-tex` overlay: an ordered 4x4 Bayer tile at 6px in `mix-blend-mode: overlay`, over `contrast(1.45) saturate(1.2) brightness(0.96)`. Both layers resolve on hover.

**The photograph keeps its own colours.** An earlier pass ran the archive through `grayscale` and `sepia`, which turned every cover the same shade of orange and read as a filter preset rather than as a resolution. Contrast posterises, the tile supplies the screen door, and the hues stay true. The hover target must be an identity chain of the *same* functions (`contrast(1) saturate(1) brightness(1)`), never `none`, or it will not interpolate.

**Photographs only.** Transparent marks (partner logos) take the tint half via `.hb-logo-develop` and skip the tile, because a rectangular texture paints a grey block behind a transparent logo.

### Buttons

- **Shape:** 2px. Never pill, never large-radius.
- **Primary:** pink fill, near-black label, shifting to cyan on hover. Colour transition only, no lift.
- **Secondary:** a 10% light wash, cool-white label.
- **Focus:** 2px ring, inset on any clipped or neon fill, in a colour that contrasts with the fill rather than the page.

### Chips

2px radius, `0.125rem 0.625rem`. Hackathon pink at 15%; hack night **cyan at 15%** — the old `bg-purple-100 text-purple-700` was a second accent hue and is gone.

### Cards

Night Raised, stepped corners, a 1px border built as a second clipped layer, 24px padding, dithered media band edge to edge. Featured swaps the border layer to pink at 50%, so flagging costs no extra size.

### Inputs

40px, Night Raised fill, indigo border, cool-white text, dim placeholder. The digest input and its button remain welded into one control: the system's only joined pair. Focus shifts the border to pink with a 1px inset ring.

### Hero

The hero points forward. Its visual slot belongs to the **next event**: one large polaroid with pink tape, its name as the caption, and beneath it a `/ next up` kicker, a mono date line, the venue, and a pink **Register** CTA. The brand H1 keeps the left column and the positioning.

When nothing is scheduled the component falls back to the three-past-polaroid stack, so the hero is never empty. Retrospective imagery is the fallback, never the default: PRODUCT.md principle 6 is explicit that the next thing is what a returning member came for.

### Navigation and ribbon

A Night Raised bar under a Night Ink ribbon. The ribbon carries the next event and is the loudest thing above the fold, per PRODUCT.md's "future surfaces before retrospective ones". Its `NEW` badge is the site's **one arrival glitch**: two copies of the badge tear sideways on three passes, then settle. No blur, no glass, no translucency.

### Sponsor plate

A warm paper tile with stepped corners behind every partner logo, on the event page **and** the homepage marquee. Not decoration: most partner marks are dark monochrome, and a dark mark on near-black is invisible. Logos sit at full opacity with no tint at rest — a greyed-out logo strip is the template move, and these are paying partners. The plate echoes the polaroid frame, so the strip reads as a sticker sheet.

## 6. Do's and Don'ts

### Do:

- **Do** close the page on the cyan band.
- **Do** put a real photograph on dark surfaces, or leave them as plain ramp ground.
- **Do** dither photographs at rest and let them develop on hover or focus.
- **Do** put near-black type, and only near-black type, on a drenched band.
- **Do** keep a dark rung between any two drenched bands.
- **Do** give boxes the stepped corner, not a radius. Check the focus ring survives it.
- **Do** add 0.05–0.1 line-height over the light-ground equivalent on every reading size.
- **Do** put a warm paper plate behind partner and sponsor logos, at full opacity, on dark rungs only.
- **Do** guard every motion primitive with `prefers-reduced-motion`, and check the static fallback is legible, not hidden.
- **Do** set focus-ring offset colours to the actual band the element sits on.

### Don't:

- **Don't** build **the AI-startup neon-on-black cliché**: dark background, cyan glow, grid lines, terminal mono as decoration. This palette runs at that anti-reference on purpose, so the line is thin and the four guards in the Overview are what hold it: never pure black, no glow, no grid chrome, and a real photograph on every dark surface.
- **Don't** build a **generic SaaS landing**: big gradient hero, three feature cards, testimonial slider, "Trusted by" strip.
- **Don't** reproduce the **second-order "community brand landing" template**: split hero plus subscribe form plus photo collage, logo marquee, big-number stats bar, card grid, card grid, plain footer. Every new surface must break at least one of those beats.
- **Don't** use **the hero-metric template**. The stats grid is a standing approved exception for the org homepage only.
- **Don't** ship **identical card grids**.
- **Don't** use `border-left` or `border-right` above 1px as a coloured stripe.
- **Don't** use `background-clip: text` with a gradient.
- **Don't** add glassmorphism, backdrop blur, or a translucent sticky nav.
- **Don't** let glitch run ambiently. It fires on a state change, on one element, and stops.
- **Don't** use chromatic aberration at rest. Hover and focus only.
- **Don't** put a cool-white or cyan glyph on the pink band. Only near-black clears there.
- **Don't** introduce a third accent hue, and never add a glow to the two you have.
- **Don't** interpolate between rungs with a gradient.
- **Don't** tint photographs. Quantize them and leave the hues alone; grayscale and sepia turn the whole archive one colour.
- **Don't** put `.hb-px` on an element with an offset focus ring. `clip-path` deletes the ring silently.
- **Don't** lead the hero with past events while something is upcoming.
- **Don't** nest a card inside a card.
- **Don't** use em dashes in copy.
- **Don't** touch `app/[locale]/[eventSlug]/**`, `lib/themes.ts`, or the legacy component set. Past editions are shipped history and are structurally excluded: the night tokens live under `[data-register]`, which those routes never carry.
