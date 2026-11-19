# AI Summit 2026 content audit

Reviewed 16 November 2026. Scope: AI Summit 2026 only. Other editions will be reviewed separately.

| Content            | Before                                            | Result                                                                             |
| ------------------ | ------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Projects           | No published records                              | 65 distinct projects, with team credits, descriptions, repositories and demo links |
| Community posts    | 13 sourced posts in the existing event disclosure | All 13 retained; missing Yazide portrait added and professional headline verified  |
| Gallery            | No gallery; renderer limited to hack nights       | Four event photos, credited to Keig Studio, including portrait framing             |
| Event introduction | Invitation to a future event                      | Past-event recap in English and Spanish                                            |

Challenges is closed by default, with a keyboard-accessible toggle. All eleven challenges remain mounted in the server HTML for discovery while collapsed.

The [official aftermovie](https://youtu.be/Z3qFd-oT8Xo), titled “HackBarna AI Summit 2026 - After movie” on the HackBarna YouTube channel, is embedded in the event's recap section. Playback loads on demand, with a direct YouTube link in the server-rendered page.

## Project provenance and exclusions

Source: [organiser submission workbook](https://docs.google.com/spreadsheets/d/1iuQEeDBq-1PO6nsZ_yVuc1epTUQ06mzHhyYWmiGNRzU/edit), tab `HackBarna AI Summit 26 — Project Submission`.

The 70 populated source rows include three obvious tests (`NicoTest`, `NicoTest2`, and `-`) and two repeated projects (`Grootguard` and `preply_project_learning-`). The later submission is retained for each repeated project. Similar names such as `polsTV` and `PolTV` have different repositories and remain separate projects.

The import includes only project names, pitches, descriptions, team member names, challenge labels and submitted links. Email columns, enriched personal/company information, submission tokens and internal judging data are omitted. Participant descriptions render as Markdown with raw HTML skipped, rather than executing as MDX. No awards or profile identities are inferred.

### Maker profiles

On 17 November 2026, the original submission emails were joined privately to the organiser-provided Hacker attendee export dated 24 September 2026. Matching uses trimmed, case-insensitive email equality. Display names, email aliases and repository ownership are not used to guess a match. The existing 65 archived projects are identified by their submitted repository links, retaining the later submission for repeated projects.

Of 144 maker credits, 110 have an unambiguous email match. Their submitted public profiles supply 109 LinkedIn links and 83 GitHub links across 60 updated project pages. Names, portraits, project content and team order are preserved. The remaining 28 credits have no matching attendee email. Six credits across `FIREGUARD_HACKBARNA_TeamFedora` and `preply_project_learning-` reuse an email for several teammates and were left unchanged in that initial pass pending individual confirmation.

The import script is `scripts/enrich-aisummit26-makers.cjs`. It validates the complete batch before writing, rejects conflicting duplicate attendee profiles, and writes only normalized LinkedIn and GitHub URLs into the existing public team metadata. The attendee CSV, private submission join data, emails, email hashes and guest identifiers are not part of the application or repository.

Records live in `projects/aisummit26/`. Their event keys connect them to the event's final Projects disclosure and to the searchable global archive. Each project has a stable detail URL and is included in the existing sitemap. All project cards, descriptions, maker names and ItemList JSON-LD remain in the initial server HTML when the disclosure is closed.

## Community posts

The existing thirteen entries in `data/testimonials.ts` already connect to this event and render in a closed-by-default Community posts disclosure. All thirteen public post URLs were checked: each resolved successfully and its public metadata identified the author and referenced the event or project. Eight now point directly to LinkedIn's canonical post URL, with the previous URL retained as `sourceUrl`. Existing professional titles and portraits are reused. Yazide's missing portrait and current headline were verified through his [LinkedIn profile](https://www.linkedin.com/in/yazide/).

## Photo provenance

Source: the organiser's `HackBarna 2026 pictures` folder. These original filenames identify the selected images:

| Local image             | Original filename                                      |
| ----------------------- | ------------------------------------------------------ |
| `awards.jpg`            | `AISM26 - 19 20 Sept Hackaton - Keig Studio - 185.jpg` |
| `team-presentation.jpg` | `AISM26 - 19 20 Sept Hackaton - Keig Studio - 142.jpg` |
| `building-together.jpg` | `AISM26 - 19 20 Sept Hackaton - Keig Studio - 491.jpg` |
| `hack-time.jpg`         | `AISM26 - 19 20 Sept Hackaton - Keig Studio - 401.jpg` |

The gallery credits [Keig Studio](https://keig-studio.com/). Files are hosted locally and served through Next.js image optimisation. Explicit dimensions preserve portrait and landscape framing. The private source folder is not linked from the public gallery.

## Remaining editorial limits

- Repository and demo links are preserved as submitted. Some projects may since have become unavailable or private.
- Historical posts mention the event's original submission totals. The 65-record archive count reflects the reviewed source rows after test and duplicate removal.
- This change does not infer prize winners from photos or testimonials. Organiser-confirmed awards can be added separately.

## Validation

- TypeScript and targeted lint pass, along with 37 content, archive, event-listing, live-wall and migration tests.
- All 65 new project detail URLs return successful responses locally. The global archive HTML and sitemap include all 65 projects.
- The event's initial HTML includes all 65 cards and matching ItemList JSON-LD. Community posts and Projects stay collapsed on a fresh visit and open for their anchor links.
- Desktop and 390px/320px viewport checks cover the gallery, disclosures, team credits, links and long project text. Gallery photos retain their original aspect ratios, all thirteen author/logo images load, and keyboard Enter/Space toggles work.

## Reviewed identity follow-up — 19 November 2026

The organiser supplied LinkedIn profiles for Pietro Baffico, Melissa Orphali, Marta Quiros Dinares and Abel Romero Martinez. These add five LinkedIn project credits across Bussola, ARCA, PreviousAI, Fireguard and TitanAI Searcher. Abel’s two full-name credits now share one builder identity. The subsequent [email audit](attendee-email-audit.md) found that the first-name-only “abel” credit uses Alvaro’s shared team email, which differs from Abel’s registration, so it remains separate.

Melissa’s and Marta’s registered LinkedIn URLs exactly match the organiser-supplied accounts. Their registration records also supply their GitHub links, which are now included. Their submission emails had no exact match in the attendee export, so the original strict email join did not assign those records. No email or private registration field is published. The four signed-in profile portraits are checked in locally. AI Summit now has 114 LinkedIn credits, 85 GitHub credits and 112 pictured credits out of 144; see the [portrait audit](builder-portrait-audit.md) for sources.
