# Events content

One MDX file per HackBarna event. Frontmatter holds all structured data; the body is reserved for future rich-content (recaps, embedded media) and is currently ignored at render time.

## Adding a new event

1. Create `events/<slug>.mdx`. The slug is what shows up in the URL: `/events/<slug>`.
2. Fill in the frontmatter. Required fields: `slug`, `name`, `year`, `active`, `eventType` (`hackathon` or `hacknight`), `startDate`, `endDate`, `location`.
3. Optional fields: `registrationUrl`, `imageUrl`, `timeZone`, `description.{en,es,...}`, `schedule.{en,es,...}`, `topic` (hacknight tagline), `sponsor` (hacknight "presented by"), `capacity`, `gallery` (hacknight photos), `projectLinks` (hacknight recap links).
4. Sponsor / judge / mentor / community sponsor lists go directly in the frontmatter as arrays. Empty arrays render a quiet "first call — pitch us" prompt on the event page for future events.

That's it. The build picks the file up automatically: no edits to `lib/events.ts`, no separate data files.

## Why MDX (and not plain JSON or YAML)

MDX files can hold structured frontmatter and optional rich-content body. Today we only parse frontmatter, but the extension means future event-specific recap content (paragraphs, photo essays, embedded videos) drops in without changing the file format. Same pattern as `legal/code-of-conduct/*.mdx` and `projects/*.md`.

## Past events

Editions before aisummit26 (v1-2024, aisummit25) live in `lib/events.ts` and `data/*.ts` and stay there — they're shipped artifacts. Their canonical URLs remain `/<locale>/<slug>` (not `/events/<slug>`). Any new event you add goes through this MDX flow and lives at `/<locale>/events/<slug>`.

## Sponsor / judge / mentor frontmatter shape

```yaml
sponsors:
  - name: Acme Corp
    logo: /logos/acme.png
    url: https://acme.example
    tier: gold # supergold | gold | silver | bronze
communitySponsors:
  - name: Local meetup
    logo: /logos/meetup.png
    url: https://meetup.example
judges:
  - name: First Last
    description: Role at Company
    image:
      src: /judges/first.jpeg
    links:
      linkedin: https://linkedin.com/in/...
      twitter: https://twitter.com/...
mentors:
  - name: First Last
    description: Role at Company
    image:
      src: /mentors/first.jpeg
    links:
      linkedin: https://linkedin.com/in/...
```

Empty arrays are explicit — set them to `[]` rather than omitting if you want the page to render the "first call" empty-state CTA.

Judge and mentor cards link to each person's profile: the UI picks the first available link in the order `linkedin → website → twitter → github`. A person with no `links` renders a non-clickable card.

## Challenges & prizes frontmatter shape

Both are localized like `schedule`/`faq` (`{ en: [...], es: [...] }`). Challenges are sponsored problem statements; each `sponsor` must match a `name` in this event's `sponsors:` list so the card can reuse that sponsor's logo and link. `prize` is the per-challenge reward (free text). The top-level `prizes` block is the overall award list, separate from the per-challenge prize.

```yaml
challenges:
  en:
    - title: Best Voice AI Agent
      sponsor: SLNG # must match a sponsors[].name above
      description: Build the most compelling real-time voice agent.
      prize: €2,000 in credits + swag
  es:
    - title: Mejor agente de voz IA
      sponsor: SLNG
      description: Crea el agente de voz en tiempo real más convincente.
      prize: €2,000 en créditos + merch
prizes:
  en:
    - place: Grand Prize # "2nd", "Best Rookie", ...
      title: Best Overall Project # optional
      value: €5,000 # optional
      description: Awarded to the top project across all challenges. # optional
  es:
    - place: Gran Premio
      title: Mejor proyecto general
      value: €5,000
      description: Para el mejor proyecto de todos los retos.
```

Like the people arrays, an empty/omitted `challenges`/`prizes` on an upcoming event renders an "announced soon" placeholder; on a past event the section is hidden.
