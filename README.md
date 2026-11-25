# HackBarna

![](./public/hackbcnlogo.png)
Repo hosting [HackBarna](https://hackbarna.com) website, forked from IvyHacks.

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

```bash
npm install
#or
bun install
```

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Netlify

The [hackbarna Netlify project](https://app.netlify.com/projects/hackbarna) is
connected to `picsoung/hackbcn`, with `main` as the production branch. The root
`netlify.toml` sets Node 24, `npm run build`, the `.next` publish directory, and
explicitly enables Netlify's automatically updated
[Next.js adapter](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/),
which handles server rendering, middleware, image optimization, and API routes.
Keep the standard Next.js build; the Open Graph and event routes need a server.

The existing public PostHog settings are configured in Netlify's project
environment settings. See `.env.example` for the variable names. Set new or
changed variables for production and any
preview contexts that need them; public Next.js values are embedded at build
time, so changes require a rebuild. Vercel Analytics has been removed; PostHog
continues to provide application analytics.

Deploy Previews and branch deploys use Netlify's `CONTEXT` and
`DEPLOY_PRIME_URL` for metadata and Open Graph URLs. Production metadata keeps
`https://hackbarna.com` as its base.

To finish the hosting migration:

1. Deploy and check the Netlify URL: `/` redirects to `/en`, all four locales
   render, `/en/sponsor` loads, `/_next/image` serves optimized images, and
   `/api/og?title=HackBarna` returns a PNG. If shared accounts are enabled, test
   auth after adding the preview callback URL to the Auth redirect allowlist.
2. Both custom domains are assigned to the Netlify project, with
   `www.hackbarna.com` as primary. In Cloudflare, change the apex `A` record
   from `76.76.21.21` to `75.2.60.5`, and change the `www` CNAME from
   `cname.vercel-dns.com` to `hackbarna.netlify.app`. Follow
   [Netlify's external DNS guidance](https://docs.netlify.com/manage/domains/configure-domains/configure-external-dns/).
   Preserve the Digest subdomain and email records.
3. Wait for HTTPS, then verify redirects, analytics, and any enabled auth flows
   on the custom domain. Disable Vercel deployments and
   remove the old domain assignment after Netlify is serving correctly.

The previous, separate Netlify app is now named `hackbarna-netlify-hacknight`.

## Sponsorship page and prospectus

The partner page is available at `/{locale}/sponsor` in English, Spanish,
Catalan, and French. Booking links use the personal calendar configured in
`data/sponsorship.json`. The English draft PDF uses the same offers, evidence,
and English translations as the page. Both historical PDFs remain available.

Edit partnership options, community figures, and source links in
`data/sponsorship.json`, and copy in the `partner.*` keys in
`i18n/{locale}.json`. The page and prospectus show two partnership options
without public prices, plus a separate invitation for venue hosts. Do not promote
event capacities as attendance or event-wide project totals as product usage.

Regenerate the draft PDF after changing shared content:

```bash
python3 -m venv .venv-sponsorship
.venv-sponsorship/bin/pip install -r scripts/requirements-sponsorship.txt
npm run sponsorship:pdf
```

The generator uses local Arial when available, or ReportLab's bundled Vera.
Set `SPONSORSHIP_FONT_DIR` to use another installation of Arial. Inspect the
rendered pages after regeneration; the PDF includes draft labels, source links,
and clickable meeting links. Its output is `public/sponsorship-2026-27-draft.pdf`.

The web page and four-page prospectus follow four sections: invitation with
audience figures, partner outcomes and event history, two partnership options,
and venue hosting. Each option has three practical benefits. A separate
Hackathon in a box callout offers full event organisation without adding a tier.
Formats and optional video production share one short note rather than separate
sections. Booking and download labels do not add decorative arrows. Audience percentages are rendered only from approved `audienceMetrics`
entries with a source and a localized cohort/definition (`basisKey`). Unconfirmed
audience and product-usage suggestions stay in the internal
`scripts/sponsorship-claims-review.json` until their scope and evidence are clear.

### Package review

The November 2026 package review compared [Junction](https://www.hackjunction.com/partners),
[Tech: Europe](https://partner.techeurope.io/distribution/),
[ETHGlobal Mumbai](https://ethglobal.com/events/mumbai/sponsor), and
[HackUPC](https://hackupc.com/). The public presentation offers two choices: support an event, or build an
activation around a partner's technology. Hack Nights and the flagship weekend
are formats for either conversation, rather than additional tiers. Venue hosts
have their own invitation and booking action. Booking is available in the hero
and each partnership option, without a second set of format-specific actions.
The managed-hackathon and venue actions have their own booking context.
`bookingTopics` in `data/sponsorship.json` maps these selections to editable
Cal.com `notes` prefills. Standard UTM tags retain the source button, including
for general and event-page bookings. No custom Cal fields are required. See
[Cal.com prefilling](https://cal.com/help/bookings/prefill-fields) and
[UTM tracking](https://cal.com/help/bookings/utm-tracking).

Professional filming and editing can be scoped into either partnership. The
production brief and budget are agreed with the partner; no fixed video inclusion
or price is promised publicly. Published competitor pages do not establish a
universal video tariff.

### Internal Hack Night budget

```bash
npm run sponsorship:budget -- --package presenting
npm run sponsorship:budget -- --pass four --basis-confirmed
npm run sponsorship:budget -- --revenue 4000 --collected 4000 --cost 2995.03 --extra-cost 200 --basis-confirmed
npm run sponsorship:test
```

The calculator reads historical draft scenarios from
`scripts/sponsorship-pricing.json`, not the public partnership options. Those
figures are internal planning inputs, not current sales commitments.

Use `--help` for all inputs. Amounts are euros; cost adjustments are per night,
while contracted and collected revenue are totals. The calculator keeps integer
cents, checks each night against the greater of €3,500 or cost plus €500, and
requires confirmation that all inputs share the same reconciled VAT basis.
The default historical budget assumes no inventory reuse. In-kind support only
reduces costs by the documented cash expense it avoids. Pass revenue is allocated
equally by night; calculate materially different nights separately. This is a
contribution forecast, not accounting net profit. Cost data stays in `scripts/`
and is never imported by the website.

## Shared HackBarna accounts

The website uses the existing Digest Lovable Cloud identity provider. Existing
Google/email accounts, user IDs and Digest subscriptions are preserved. The
website is an OIDC client with its own host-only, HttpOnly session. Digest keeps
its existing login and browser storage.

- `/<locale>/auth`: continue to the shared HackBarna sign-in.
- `/auth/start`: authorization code + S256 PKCE, state and nonce.
- `/auth/callback`: server-side code exchange and verified ES256 identity.
- `/<locale>/account`: private account summary and Digest preferences link.
- `/api/auth/session`: private, uncached account fields; never provider tokens.
- `/auth/signout`: same-origin POST revoking this website's session. Digest
  remains signed in; the provider currently has no discovered end-session URL.

Read [the implementation plan](docs/hackbarna-identity-implementation-plan.md)
for claiming profiles, team permissions, project revisions and Jev moderation.
These later phases are not enabled by the sign-in foundation alone.

### Configuration

Register a confidential OAuth client in the existing Lovable Cloud / Supabase
project `usfkgslefvtrtlwexnfo`. Use `client_secret_post`, ES256 ID tokens and one
exact callback per environment. For Netlify Dev the callback is
`http://localhost:8888/auth/callback`; production uses
`https://www.hackbarna.com/auth/callback`. The persistent preview branch is
`codex/preview`, deployed at `https://codex-preview--hackbarna.netlify.app`.
Register one separate preview client with the exact callback
`https://codex-preview--hackbarna.netlify.app/auth/callback`; Netlify already has
that callback configured specifically for this branch. Its client credentials
and a separate session key still need configuring before sign-in is available.
Push reviewed commits to that branch to update the same URL. Other PR previews
do not need individual OAuth clients. Do not use wildcard callbacks or expose
production credentials to previews. Only trusted preview code should receive
the preview client's credentials. Non-production deploys send a noindex header.

Set the four server-only environment variables in `.env.example`. Generate
`HACKBARNA_SESSION_KEY` from 32 random bytes (64 hexadecimal characters), keep it
stable within that environment, and store it as a secret. Rotating it invalidates
existing sessions. Never use a service-role key or a `NEXT_PUBLIC_` variable for
these values. The canonical issuer is the `.supabase.co/auth/v1` URL in discovery,
not Digest's `.lovable.cloud` frontend proxy.

Apply `netlify/database/migrations` to the linked local/preview database before
signing in. The identity tables contain private account metadata, session hashes
and AES-256-GCM encrypted rotating provider credentials. The raw opaque session
ID is only in a host-only cookie (`__Host-hb_session` on HTTPS). Sessions expire
after 14 days, support database-coordinated refresh and cannot be restored by a
refresh after logout. Periodically remove expired/revoked sessions in operations.

Account and authentication routes are dynamic and private. Public project and
builder pages remain cacheable, with navbar identity loaded separately on the
client. A missing configuration displays a temporary-unavailable state.

Use Node 24 and run `npm run test:auth`. The protocol tests use a signed local
provider fixture and cover callback/credential tampering, issuer/audience/nonce,
PKCE, replay, refresh races and revocation. A real existing Digest account must
also complete the registered local and preview flow before production rollout.

With Netlify Dev running on port 8888 and the local migration applied, run
`npm run test:auth:integration` to exercise the real Postgres store and HTTP
routes. It refuses a non-loopback database, uses a separate fixture account,
checks session encryption, refresh locks, account/public isolation and logout,
then removes that fixture. This verifies website sessions independently of a
real provider sign-in; it does not replace the existing-account OAuth check.

### Shared community profile

`/<locale>/account` now edits one community profile (name, photo, bio,
LinkedIn and GitHub) stored in `community_profiles`. Digest reads the same profile
for its navbar, consent screen and account view. Digest continues to hold login,
security and newsletter settings. The private profile API returns only community
fields and a revision number; it does not return emails, account IDs or credentials.

The authenticated `/api/account/profile` endpoint accepts the website session or
an ES256-verified direct Digest token from the fixed issuer. Third-party OAuth
clients are denied unless their exact client ID is explicitly trusted. Browser
origins are limited to Digest and the configured website; cookie mutations also
require same-origin provenance. Revision checks reject concurrent overwrites.

Digest defaults to `https://www.hackbarna.com`. Its optional
`VITE_HACKBARNA_PROFILE_ORIGIN` can point a trusted preview at the corresponding
HackBarna Deploy Preview; local development uses `http://localhost:8888`.
Never point that setting at an untrusted preview: Digest sends its account token
to the configured, validated HackBarna API.

`/<locale>/account/projects` lists verified projects with editing and visibility
controls. Exact, unambiguous private event-email evidence can verify a claim;
other claims go to an organiser. Editable LinkedIn/GitHub URLs grant no ownership.
Content edits require review; hiding takes effect immediately. See
[Project ownership](docs/project-ownership.md) and
[Account workspace](docs/account-workspace.md) for permissions and rollout.

Account and project-management interfaces support English, Castellano, Catalan
and French. The separate communication-language preference supports EN/ES/CA;
an unset preference keeps all three languages in invitations. See
[Communication preferences](docs/communication-preferences.md).

Run `npm run test:profile` and, with Netlify Dev running,
`npm run test:profile:integration`. Apply the community-profile migration locally
before testing. The integration check uses two isolated test accounts and removes
their profiles and sessions afterward.
