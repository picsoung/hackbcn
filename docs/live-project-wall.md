# Event project lists

Project lists live at `/[locale]/events/[slug]/projects`, with each database
project at `/projects/<project>` under that event. The earlier `/wall` paths
permanently redirect to those URLs. Existing Markdown projects retain their
original URLs and event lists; the global project archive links to database
collections as well.

Pages render their content and project links on the server, before JavaScript
runs. Each list and detail has a specific canonical URL, description, social
metadata and JSON-LD. The dynamic sitemap includes both database and Markdown
projects. Submission forms and the projector leaderboard are excluded from
indexing. Search engines decide when to crawl and index published pages.

## Events and storage

The wall kit was imported from `hacknight-projects` at source commit `ed1b130`,
with media and judging fields brought over from production commit `83a6176`.
Enable a submission event in `lib/live/config.ts`. All projects are keyed by
`event_slug`, and uniqueness is scoped to that event. Setting `open: false`
closes submissions, votes and ranking-related share counts while preserving
project pages and final results. Share links still work.

Jev-a-thon (November 10, 2026) is closed. Its 22 projects and 296 vote records
are being migrated from the standalone app, superseding the earlier empty
production database plan. Project slugs, creator contact details, consent,
Jev answers, judging scores, usage notes, Lovable attribution, creation dates,
shares and vote records are preserved. All 17 referenced screenshots are copied
from the source's `screenshots` Blobs store to the destination's
`project-screenshots` store, with event-prefixed keys and SHA-256 verification.
Emails
and voter IDs never appear in public HTML, JSON or the sitemap. Exports
include only projects with explicit feature consent.

Netlify applies the committed schema migrations on deployment. Preview
branches have separate databases; preview QA fixtures never enter production.
After a migration has deployed, use a new timestamped migration for schema
changes. Never edit an applied migration.

Database and Jev clients initialize on demand, so builds need no runtime
credentials. Jev uses Netlify AI Gateway credentials and uncompressed JSON;
the SDK's automatic zstd encoding on Node 24 was rejected by the gateway.

## Data migration and cutover

The migration script fixes the source and destination Netlify project IDs.
It reads the source in a consistent, read-only transaction, validates every
project and vote, and defaults to a dry run. Credentials remain in memory.
Applying first saves a private snapshot outside the repository with mode 0600,
then backs up and copies the screenshots, imports in one transaction, remaps
project IDs, deduplicates votes, and verifies every project field and vote total
before committing. Replaying the same snapshot is
idempotent. Conflicting destination projects or inconsistent votes abort the
transaction. Do not commit database snapshots or copy them into public assets.

```bash
# Inspect and then rehearse on the isolated preview branch.
node scripts/migrate-hacknight-projects.mjs --target-branch codex/import-hacknight-project-wall
node scripts/migrate-hacknight-projects.mjs --target-branch codex/import-hacknight-project-wall --apply

# Once the production deploy has applied the schema, import fresh source data.
# This requires owner-approved production write access; see below.
node scripts/migrate-hacknight-projects.mjs --target-branch production --apply
```

Use `--snapshot /absolute/private/snapshot.json` to replay an exact backup.
The backup location and SHA-256 digest are printed, without private contents.
Screenshot backups sit beside the JSON backup in a `-screenshots` directory.
Keep the source database and Blobs store intact for recovery.

Netlify gives personal access tokens and the CLI read-only production access
by default. The script checks permissions before making backups or copying
data and stops if writes are unavailable. The database dashboard's
"Allow personal access tokens full access to the production database" control
can grant write access to connected tools. Changing it requires the owner's
explicit approval. For a one-off import, restore the read-only setting
immediately afterwards and close the import's database connections. Do not
save database credentials in backups or source files.

Only after verifying the production list, detail pages, sitemap and counts,
cut over `hacknight-projects.netlify.app` using the redirect bundle in
`netlify/legacy-hacknight-projects/`. Its `/p/<slug>` links preserve individual
project destinations; API redirects retain methods. The old domain's voter
cookies cannot transfer to hackbarna.com. The archived event is closed, so
this does not create a second voting window. Take a final source snapshot
after the redirect to detect any activity during the cutover.

## Checks

```bash
node --experimental-strip-types --test tests/live-wall.test.mjs tests/project-migration.test.mjs
node --test tests/event-listing.test.cjs tests/project-archive.test.cjs
npm run build
```

Check the deployed HTML without executing JavaScript: all project names and
links must be present, canonical and Open Graph URLs must match the page,
JSON-LD must parse, and the sitemap must include every project. Verify redirects,
unknown project 404s, archived-write rejection, category filters, mobile and
desktop layouts, and email redaction. The live-wall copy is currently English;
locale prefixes are preserved.
