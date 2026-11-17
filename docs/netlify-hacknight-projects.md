# Netlify HackNight project archive

The June 30, 2026 gallery at [hackbarna-netlify-hacknight.netlify.app](https://hackbarna-netlify-hacknight.netlify.app/) belongs to **HackNight #4: Build with Netlify**, event slug `hacknight-june-2026`.

The read-only snapshot taken on November 17 contains 27 submissions. This archive publishes 25 distinct projects:

- Source record 1 (`coolapp`, `cool stuff`, `cool desc`) is an apparent organiser test, excluded pending confirmation. The importer can include it with `--include-test-projects`.
- Records 22 and 23 are the same Salon Acquisition Fit Analyzer submission. The later record, 23, is retained.
- CommunityOS's submitted image-host link returns 404. DentAI's screenshot URL serves HTML. These two projects use the shared image fallback; no replacement screenshot was invented.
- The other 23 images are copied locally, with checksums in `data/netlify-hacknight-import.json`. RenovAI's animated GIF is preserved.
- CommunityOS's description repeats a form prompt, so its About section is omitted. Other descriptions and pitches retain the submitted text.

The source form asks for comma-separated team members. Those lists become separate builder credits; when absent, the submitted team/builder name is used. Team names remain as credit subtitles where different from the member name. No personal social profiles or portraits are inferred from names or project repositories. The four submitted project repositories remain project links. General topic tags are retained as metadata, without treating them as a technology stack. No awards are inferred.

Projects live in `projects/hacknight-june-2026/`, using the existing shared archive and detail components. They appear in the event's collapsed Projects section, the searchable main archive, the sitemap and server-rendered structured data. No live-wall configuration or production database migration is needed.

## Reproducing the import

Keep the original snapshot outside the repository. It must contain `sourceSite`, `sourceUrl`, `event`, `capturedAt`, and the source `projects` rows. Read PostgreSQL's timezone-less timestamps as UTC (`created_at AT TIME ZONE 'UTC'`); these match the original public gallery timestamps.

```sh
node scripts/import-netlify-hacknight.mjs --snapshot /private/snapshot.json
node scripts/import-netlify-hacknight.mjs --snapshot /private/snapshot.json --apply
node --test tests/netlify-hacknight-import.test.cjs
```

The first command only reports the proposed selection. Applying fetches public submitted images, validates their signatures and prepares the complete batch before writing. Repeating the same import leaves existing files unchanged; differing files require review rather than being overwritten. Only allowlisted public fields are exported, and email addresses in their text cause the import to stop. Source credentials, raw snapshots and private attendee data stay outside Git. The source site and database are unchanged.
