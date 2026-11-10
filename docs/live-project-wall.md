# Live project walls

The project wall is imported from `hacknight-projects`, using the kit in
`port/hackbcn` at source commit `ed1b130`. It runs inside this Next.js app.

Enable an event in `lib/live/config.ts`. Its event page then links to the wall.
Only configured events accept submissions or votes. Setting `open: false`
closes both actions while keeping the wall available to read.

For Jev-a-thon, the English routes are:

- `/en/events/hacknight-5-jevathon-2026/wall`
- `/en/events/hacknight-5-jevathon-2026/wall/<project>`
- `/en/events/hacknight-5-jevathon-2026/submit`
- `/en/events/hacknight-5-jevathon-2026/leaderboard`
- `/en/events/hacknight-5-jevathon-2026/jev`

The routes retain the current locale, and the wall copy is currently English.
Markdown project archives continue to use their existing routes.

## Database and Jev

Netlify detects `@netlify/database`, provisions the database, and applies the
committed migrations under `netlify/database/migrations/` during deployment.
Deploy Previews use their own database branches. `live_projects` and
`live_votes` are separate from the Markdown project archive and the standalone
voting site's database.

The new database starts empty. No projects, votes, voter IDs, or contact details
are imported from the standalone site. Use the standalone site for tonight's
voting and merge the integration after the event.

Jev uses Netlify AI Gateway's runtime `TYPESAFE_API_KEY` and
`TYPESAFE_BASE_URL`. Database and Jev clients initialize when a request needs
them, so `next build` does not require runtime credentials. Keep credentials
out of source control. Public queries omit creator email addresses, and the
export endpoint includes only projects with explicit feature consent.

After a migration has deployed, create a new timestamped migration for schema
changes. Do not edit or regenerate an applied migration.

## Local development and checks

```bash
npm ci
netlify dev
```

Netlify Dev provides a local database and the runtime integration. Check it
with `netlify database status`.

```bash
node --experimental-strip-types --test tests/live-wall.test.mjs
node --test tests/event-listing.test.cjs
npm run build
```

On the Deploy Preview, verify the empty wall, form validation, a synthetic
submission, project detail and share tools, voting with separate browser
cookies, the leaderboard, and the Jev lab. Public HTML and JSON must not expose
the test submitter's email. Use synthetic preview data only; production starts
empty when the PR is merged.
