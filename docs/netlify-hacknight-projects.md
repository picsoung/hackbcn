# Netlify HackNight project archive

The June 30, 2026 gallery at [hackbarna-netlify-hacknight.netlify.app](https://hackbarna-netlify-hacknight.netlify.app/) belongs to **HackNight #4: Build with Netlify**, event slug `hacknight-june-2026`.

The read-only snapshot taken on November 17 contains 27 submissions. This archive publishes 25 distinct projects:

- Source record 1 (`coolapp`, `cool stuff`, `cool desc`) is an apparent organiser test, excluded as confirmed by the organiser. The importer can include it with `--include-test-projects`.
- Records 22 and 23 are the same Salon Acquisition Fit Analyzer submission. The later record, 23, is retained.
- CommunityOS's submitted image-host link returns 404. DentAI's screenshot URL serves HTML. These two projects use the shared image fallback; no replacement screenshot was invented.
- The other 23 images are copied locally, with checksums in `data/netlify-hacknight-import.json`. RenovAI's animated GIF is preserved.
- CommunityOS's description repeats a form prompt, so its About section is omitted. Other descriptions and pitches retain the submitted text.

The source form asks for comma-separated team members. Those lists become separate builder credits; when absent, the submitted team/builder name is used. Team names remain as credit subtitles where different from the member name. The source gallery has no personal social profiles. The four submitted project repositories remain project links, without inferring their owners' identities. General topic tags are retained as metadata, without treating them as a technology stack. No awards are inferred.

Projects live in `projects/hacknight-june-2026/`, using the existing shared archive and detail components. They appear in the event's collapsed Projects section, the searchable main archive, the sitemap and server-rendered structured data. No live-wall configuration or production database migration is needed.

## Reproducing the import

Keep the original snapshot outside the repository. It must contain `sourceSite`, `sourceUrl`, `event`, `capturedAt`, and the source `projects` rows. Read PostgreSQL's timezone-less timestamps as UTC (`created_at AT TIME ZONE 'UTC'`); these match the original public gallery timestamps.

```sh
node scripts/import-netlify-hacknight.mjs --snapshot /private/snapshot.json
node scripts/import-netlify-hacknight.mjs --snapshot /private/snapshot.json --apply
node --test tests/netlify-hacknight-import.test.cjs
```

The first command only reports the proposed selection. Applying fetches public submitted images, validates their signatures and prepares the complete batch before writing. Repeating the same import leaves existing files unchanged; differing files require review rather than being overwritten. Only allowlisted public fields are exported, and email addresses in their text cause the import to stop. Source credentials, raw snapshots and private attendee data stay outside Git. The source site and database are unchanged.

## LinkedIn enrichment

Reviewed November 18, 2026 against the organiser-supplied attendee CSV. **22 of 27 builder credits across 21 project pages have a LinkedIn link.** This is name-based matching: the source gallery has no project email field, so an email join is unavailable.

Names are compared against the registered display name and first/last name. A first name is accepted only when it identifies one registered name across the entire list, including rows with blank LinkedIn fields. Multiple possible identities or conflicting profiles remain unlinked. Names, team subtitles, team order, project repositories and descriptions are unchanged. Only normalized personal LinkedIn URLs are exported; emails, phone numbers, guest IDs, attendance status and survey answers remain private.

Six shortened or variant credits have an explicit reviewed alias in `data/netlify-hacknight-maker-aliases.json`:

- Azaliia Razetdinova matches the registered Azaliya Razetdinova, with the same full surname.
- [Rob McW's public post](https://www.linkedin.com/posts/robertmcwhirter_i-built-a-kitesurf-forecast-app-in-90-minutes-activity-7480921096834326528-JuTh) identifies Bufa and its demo URL as Robert McWhirter's project.
- Javier Verdecia's supplied [LinkedIn profile](https://www.linkedin.com/in/javier-rodriguez-verdecia-2b9a10243/) displays Javier Rodriguez Verdecia.
- “Chloe and the bots” links to Chloe Beck, named in the [submitted pottery portfolio's author metadata](https://klininit.netlify.app/). The original group credit remains intact.
- The organiser confirmed Guido V on My Custom Chart is Guido Vezzoni.
- Al Ste-Marie's registered URL is unavailable. His [current profile](https://www.linkedin.com/in/al-unsoldgroup/) lists RenovAI, as does his [own project overview](https://unsold.group/al/projects/), so the current URL is used.

The organiser also supplied [Daniela Trifu's profile](https://www.linkedin.com/in/daniela-trifu/) for Cafenest. It displays the uniquely matching attendee's full name and a [post about this Netlify HackNight](https://www.linkedin.com/feed/update/urn:li:activity:7478114249131790336/). This reviewed addition fills a blank registration profile; it is recorded separately from URLs supplied in the CSV. The original “Daniela” credit is preserved.

These five credits still have no verified link:

| Project              | Submitted credit | Reason                                      |
| -------------------- | ---------------- | ------------------------------------------- |
| CoffeeLate           | Alejandro Chávez | No matching registered name.                |
| Conscious Living Hub | Hack Night 4     | Group credit does not identify an attendee. |
| DentAI               | mayantooth       | Team handle does not identify an attendee.  |
| Portfolio Maker      | Daniel           | Several possible registered identities.     |
| PrivacyRadar         | Joseph           | No matching registered name.                |

Run the enrichment after the initial archive import. It defaults to a report and validates the entire batch before `--write`, preserving existing links and rejecting conflicts. Repeating it makes no changes.

```sh
node scripts/enrich-netlify-hacknight-makers.cjs /private/attendees.csv
node scripts/enrich-netlify-hacknight-makers.cjs /private/attendees.csv --write
```

The original archive importer intentionally refuses to overwrite enriched files; do not replace them with an earlier unlinked snapshot.
