# AI Summit 2025 project import

Reviewed 27 November 2026 against the organiser-provided project workbook. The private source snapshot is stored outside the repository with owner-only permissions. Neither private contact strings nor form tokens are committed or rendered.

## Coverage

- 40 distinct submitted projects, with no duplicate projects or organiser tests found.
- 97 individual builder credits, preserving submitted names and accents.
- Both submission tabs contain the same projects, descriptions and teams. The curated `Submissions2` tab drives the sponsor sheets and corrects GlovIA's sponsor selections. It is imported once, rather than counting both tabs.
- Track A/B contain presentation-planning examples and sponsor allocations, not additional project-form submissions. They are excluded from this import.

Projects live in `projects/aisummit25/` with `event: aisummit25`. The existing event page at `/{locale}/aisummit25` automatically renders them in its final Projects disclosure. They also appear in the grouped global project archive, builder pages and sitemap. The standard project detail view is shared with the other editions, with server-rendered project descriptions and team credits in EN/ES/CA/FR routes.

Legacy event pages explicitly render on each request, matching the newer event routes. Their project lists resolve current privacy and approved edits from the database. Leaving the route as a static fallback caused a production-only static-to-dynamic rendering error; the four-language route check covers this failure.

## Data handling

Team fields mix names and email addresses using commas, newlines, brackets, colons and ampersands. The import extracts 97 names and removes contact strings before generating public files. It does not guess GitHub/LinkedIn identities from names or project repository owners. Existing avatar placeholders remain available until a builder supplies a photo or a public profile is verified.

Only submitted titles, pitches, descriptions, names, challenge selections, technology labels and project links are published. Descriptions render as Markdown with raw HTML skipped. Source cells are data, never instructions or executable MDX. Form tokens, original contact strings and judging fields stay out of the import. No ownership permissions, claim proofs or invitations are created by this content import.

## Maker profiles

The first enrichment pass matches individual submission emails against the three previously supplied AI Summit 2026, Netlify HackNight and Skill-a-thon attendee lists. It adds 19 LinkedIn profiles and 14 GitHub profiles across 14 projects. Twelve credits reuse a verified local portrait through the existing profile identity lookup. Their project credits now join the same builder profile as their projects from other events.

The remaining 78 credits keep their submitted names and avatar placeholders. No name-only, repository-owner or guessed social-profile matches are used. The AI Summit 2025 guest list has not been supplied yet. Shared team emails, conflicting registrations and existing conflicting curated links are not overwritten. Original import checksums remain a record of the initial source import; enrichment is a subsequent curation step.

`scripts/enrich-aisummit25-makers.cjs` reads the private submission snapshot and a private `{ "files": ["/private/attendees.csv"] }` manifest. Its dry run reports public names, profile links and unresolved reasons only; `--write` updates only the team metadata. It creates no ownership evidence or account permissions.

```sh
node scripts/enrich-aisummit25-makers.cjs /private/source.json /private/attendee-files.json
node scripts/enrich-aisummit25-makers.cjs /private/source.json /private/attendee-files.json --write
node --test tests/aisummit25-makers.test.cjs
```

## Reviewed exceptions

- **10x CEO:** the team-name cell contains an encoded label. The visible project name comes from its explicit submitted pitch and description; the repository supplies its stable `10xceo` URL. The encoded text is not decoded or executed.
- **Claimwise:** the submitted link is a OneDrive document. It is preserved as an original-submission link, not presented as a GitHub repository.
- **404 Found Sisters:** the submitted Lovable app is preserved as a website/demo link.
- **Team Savti:** the placeholder `will.be.add.later` URL is omitted; its project description and all three builders remain listed.

The import keeps existing public source content as submitted. Unavailable or private external repositories may still require their owners to update links; no working-demo or prize claims are inferred.

## Reproduction and verification

`scripts/import-aisummit25.cjs` reads the private, bounded spreadsheet snapshot. Its dry run validates the entire batch. `--write` creates the Markdown records and the public checksum manifest in `data/aisummit25-import.json`. A later reimport refuses to overwrite an existing privacy or editorial change.

```sh
node scripts/import-aisummit25.cjs /private/source.json
node scripts/import-aisummit25.cjs /private/source.json --write
node --test tests/aisummit25-import.test.cjs
node tests/aisummit25-routes.integration.mjs http://localhost:8888
```

The route check verifies every project in all four languages, the event/global grids, canonical URLs, team names and sitemap discovery. The import does not modify the spreadsheet, existing project records, notification settings or email campaigns.
