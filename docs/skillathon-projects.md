# Skill-a-thon project archive

The [Skillathon gallery](https://hackbarna-skillathon.netlify.app/) belongs to **Skill-a-thon HackNight, March 19, 2026**, event slug `skillathon-hacknight-2026`. The source repository is `picsoung/skill-a-thon`; project data comes from the public, read-only `GET /api/projects` endpoint documented on the source site.

The November 18 snapshot contains 17 submissions, all created on March 19. This archive publishes **16 distinct projects**, with 29 submitted builder credits, 12 repository/Gist links, seven installation commands and four locally saved images.

## Selection and public fields

- OpenClaw Audit has two identical submissions from the same source account, under “bun” and “tomas.” The later record, `k97ee1gcesj563cyehvsznq881837h5z`, includes the repository, installation command and actual screenshot. It replaces the earlier `k977k4pmzv6y4mty69cp7yf82h8372ts` entry with a placeholder image. Account identity is used locally to verify the duplicate and is never exported. Matching titles from different accounts require review.
- Original names and collaborator order are retained. Exact repeats of the submitting author, repeated member names and the explicit self-reference “me.” are removed. Ambiguous abbreviations remain as submitted: for example, “Joe” alongside “Joe Tannoury,” and the differing spellings of Publius and Mohammed. No personal social profiles or portraits are inferred from names or repository ownership.
- Descriptions longer than the card summary remain in the project body. Short descriptions are not repeated under About. Source creation and modification dates are retained. Topic tags remain metadata; they are not treated as a verified technology stack.
- Royal Crown Lingo remains included as a published submission. No project is excluded merely because the organiser submitted it. Voting counts do not become awards or ranking fields.
- Every detail page links to its original submission, with a localized action label. Repository links remain project links. Installation commands are displayed as text and are never executed by the importer.
- Resume Intelligence Skills submitted a command combining `npx skills add` and `pip install`. The archive uses the `pip install` command documented in its [own README](https://github.com/maurogioberti/skill-a-thon-resume-analyzer#install). This narrow correction is recorded in the manifest.
- RoidReels specifies YouTube media without a URL, and Software Vendor Cost Optimizer specifies an image without a URL. Both use the existing missing-media presentation. No replacement demo is invented.

The public export contains only the project title, descriptive text, dates, tags, submitted builder names, public project links, installation text and verified image assets. Account emails, account IDs, vote totals and other unrecognized source fields remain outside the app and repository. The source site and its database are unchanged.

## Placement and indexing

Projects are Markdown files in `projects/skillathon-hacknight-2026/` and use the same detail layout as every other archived project. The event's existing collapsed Projects grid and the searchable main `/projects` archive pick them up automatically. The existing sitemap and server-rendered structured data include their localized detail routes. Community recaps remain in the event's separate collapsed Community posts section.

Archive search also includes the public event slug, so both “Skillathon” and “Skill-a-thon” find this event's projects.

`data/skillathon-import.json` records the public source project IDs, the omitted duplicate, the command correction, missing-media notes and SHA-256 checksums for the four local image assets.

## Reproducing the import

Keep the raw response and media capture outside Git. The private `projects.json` bundle contains `sourceUrl`, `endpoint`, `event`, `capturedAt` and `data` (the API response). The private `media.json` lists each captured image's public `sourceId`, `sourceUrl`, HTTP `status`, `${sourceId}.bin` filename and SHA-256 checksum; its bytes live in the adjacent `images/` directory. These images were read from the submitted public URLs.

```sh
node scripts/import-skillathon.mjs --snapshot /private/projects.json
node scripts/import-skillathon.mjs --snapshot /private/projects.json --media /private/media.json --apply
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test tests/skillathon-import.test.cjs
```

The first command reports the proposed selection. Applying validates the event identity, all public fields and the complete image batch before creating files. It checks image signatures and recorded hashes, rejects conflicts, and leaves identical files untouched on repeat runs. The importer reads the retained media capture, so repeating the import does not depend on remote image URLs continuing to work.
