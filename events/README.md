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
