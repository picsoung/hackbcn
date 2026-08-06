# Product

## Register

brand

## Users

HackBarna serves a few overlapping audiences who arrive on the same homepage and need to find their answer fast.

- **Student hackers** — curious, time-poor, scanning to decide "is this community worth my time?" Want vibe, energy, who else shows up. Most likely to bounce if the homepage reads as corporate.
- **Professional developers & AI builders** — evaluating signal density: caliber of past events, partners, problem space, peer level. Will close the tab if the site reads as a student-only meetup.
- **Sponsors & partners** — checking whether the audience and surface area justify a check. Skim past editions, logos already on board, scale signals.
- **Mentors & judges** — deciding whether to spend a weekend or evening. Need to see who else is on the panel and that they'll be treated as marquee guests.
- **Returning community members** — already in. They check the homepage to find "what's the next thing?" — a hack night, a hackathon, a community evening. This audience is sticky and high-trust; not surfacing the next event punishes them.

All five arrive on the org homepage and need their proof within one scroll.

## Product Purpose

**HackBarna is a year-round Barcelona AI community**, not a single annual hackathon. The organisation hosts:

- An annual flagship hackathon (the AI Summit edition each fall).
- Monthly-ish hack nights at partner offices around Barcelona.
- A growing programme of community evenings, talks, and side events.

The org homepage is the **front door to the community**, not the landing page for one event. Each edition or programme has its own micro-identity (e.g. AI Summit's orange, AI Summit 26's port-side cartel) but they all live under the parent HackBarna brand.

Success is multi-funnel:
- Hackers and devs apply to upcoming events / sign up for the digest.
- Sponsors and partners discover the surface area.
- Returning members find the next thing happening.
- The community grows beyond any single event.

## Brand Personality

Warm, hand-placed, builder-coded. In three sentences:

- **Warm** — Barcelona-warm. Photographic, sun-lit, community-first. Not Silicon Valley cold, not AI-tool sterile. The texture of a real community: real faces, real evenings, real photographs.
- **Hand-placed** — composed, not generated. Polaroid stacks, asymmetric rotations, tape labels, captions in someone's voice. Visible craft as the antidote to template feel.
- **Builder-coded** — for people who ship. Tone is direct, slightly irreverent, never enterprise. Code references and dev shorthand (the `{HackBarna}` brand mark, terminal-style flourishes) are welcome where they earn their place — but warmth always wins over cleverness.

Tone in copy: confident, direct, slightly playful, never enterprise. Avoid jargon that doesn't earn its place.

## Anti-references

Avoid at all costs:

- **The AI-startup neon-on-black cliché.** Black/dark background, cyan glow, grid lines, "we use AI" boast, terminal mono as decoration. This was the trap individual event editions risked.
- **Generic SaaS landing.** Big gradient hero, three feature cards, testimonial slider, "Trusted by" logo strip. Even when this is brand-coherent in palette, the *structure* is the template.
- **The second-order "community brand landing" template.** Split hero with headline-with-colored-spans + subscribe form + photo collage right; marquee of grayscale logos; stats bar with big numbers on accent background; card grid for upcoming; card grid for past; plain footer with social icons. This is the 2024–2026 saturated lane. Most community/conference/meetup landings have converged on it. Average has been raised; distinctiveness has not.
- **Generic hackathon-template imagery.** Stock illustrations, blob shapes, "Hack. Learn. Win." cadence. The site should look like it was made by people who actually ship.
- **Corporate tech conference.** Dreamforce, AWS re:Invent, any event built around keynote stages and lanyards. HackBarna is a community organisation; it shouldn't dress up like an enterprise summit.
- **The hero-metric template.** Big number + small label tiles on a saturated background. Stats are real and worth surfacing — but not as a Webflow-template strip.

## Design Principles

1. **Photographic, polaroid-coded signature motif, now quantized.** The polaroid stack is still the brand's strongest distinctive move: hand-rotated photos, tape labels, captions in a real voice, asymmetric placement. Since the pixel direction (Aug 2026) the frame is bone rather than white and the photograph inside is dithered at rest, developing to full colour on hover. Photos are also load-bearing in a second way now: on a dark ground, real imagery is what keeps the site from reading as the neon-on-black cliché. A dark surface either carries a real photograph or is plain ramp ground.
2. **Hand-placed beats grid-snapped.** When you can vary rotation, position, scale, or alignment without breaking comprehension, vary it. Identical card grids are the AI-template fingerprint. Asymmetry is the antidote.
3. **Each audience finds proof within one scroll.** The five audiences (hackers, devs, sponsors, mentors, returning members) all land on the org homepage. Weave the proof: next event for returning members, partners for credibility, past photos for vibe, scale numbers for sponsors. Don't gate audiences behind tabs or sub-pages for first-touch.
4. **Two neon channels on coloured darks.** The palette is pink `#FF3D9A` and cyan `#4DE3E8` over violet- and indigo-tinted inks, with two drenched bands per page carrying near-black type. Colour must carry real surface area, never just accent marks — a near-monochrome HackBarna is a failed HackBarna. This runs deliberately at the neon-on-black anti-reference below, and is held off it by four rules: never pure black, no glow, no grid chrome, and a real photograph on every dark surface. A third accent hue is still the template fingerprint.

5. **Show the community, don't describe it.** Real photos, real names, real events, real partner logos. Marketing copy should get out of the way of the people, the work, and the dates. The homepage's job is to make the community legible in 15 seconds.
6. **Future surfaces before retrospective ones.** Returning visitors arrive looking for "the next thing." That signal should be the loudest above-the-fold element, not a dark-code conditional. If there's a next event, it has its own ribbon, its own card, its own home.

## Accessibility & Inclusion

- **WCAG 2.1 AA** baseline. Contrast on coral-on-cream and slate-on-white needs verification, not vibes.
- **Keyboard navigation** for the digest signup, every event card CTA, locale switcher, conduct link. No keyboard traps in mobile menu.
- **Visible focus rings**, tinted with `org-accent` and high-contrast against white/cream backgrounds.
- **Alt text** for every speaker/mentor portrait, every event photo, every sponsor logo. Captions in a real voice double as alt text when feasible.
- **Reduced motion**: every motion element (the partner marquee, photo hover rotations, scroll-triggered effects) must respect `prefers-reduced-motion: reduce`. The marquee is the immediate offender.
- **Internationalisation**: multi-locale site (Replexica EN/ES/CA/FR). Avoid English idioms that won't translate. When a headline is split across multiple i18n keys for inline highlighting, verify the order works in CAT/ES/FR syntax — the colored words may land in different positions.
