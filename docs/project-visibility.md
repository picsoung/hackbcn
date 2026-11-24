# Private projects and participation totals

A real project can be private while still contributing one project to its event
and the archive total. Its title, description, builders, links and media references
stay out of public cards, search, related projects, builder profiles, JSON-LD,
sitemaps, live APIs and exports. Its public detail page returns 404.

Counts use aggregate data, never placeholder cards or private records sent to the
browser. An event with only private projects still appears with its project total
and a short explanation. Search counts describe public matches only.

## Archived Markdown projects

Change the project's frontmatter from `status: published` to `status: private`.
Restore `published` to make it public again. A `draft` does not count as a built
project and stays inaccessible.

## Database-backed event projects

After the visibility migration is deployed, an organiser can run a parameterized
update using the exact event and project slugs:

```sql
UPDATE live_projects
SET visibility = 'private'
WHERE event_slug = $1 AND slug = $2
RETURNING event_slug, slug, visibility;
```

Use `public` to restore visibility. Existing and new submissions default to
`public`. This change does not add an unauthenticated visibility endpoint. The
planned verified-team editing flow can use the same field once ownership and
permissions are in place.

Test submissions such as Jev-a-thon's Kiki remain excluded from both listings and
totals through the existing event configuration. Keep those exclusions separate
from a real builder's privacy request.

## Verification

```sh
node --test tests/project-visibility.test.cjs
node --conditions=react-server tests/project-visibility.integration.cjs
node tests/project-visibility-routes.integration.mjs http://127.0.0.1:3100
```

The integration check requires Netlify Dev's loopback Postgres. It applies the
migrations in a new transaction-local schema, tests public/private/test records,
then rolls everything back. It refuses non-local database connections.

The HTTP check runs against a local production server in an isolated checkout.
It creates a temporary private project, verifies event totals and 404s in English
and French without exposing fixture data in the HTML, then removes the fixture.
