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

Import `picsoung/hackbcn` from GitHub in Netlify and select `main` as the
production branch. The root `netlify.toml` sets Node 24, `npm run build`, and the
`.next` publish directory. Netlify automatically installs and updates its
[Next.js adapter](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/),
which handles server rendering, middleware, image optimization, and API routes.
Keep the standard Next.js build; the Open Graph and event routes need a server.

Before the first build, copy the existing environment variables from Vercel to
Netlify's project environment settings. See `.env.example` for the public
PostHog settings. Set the variables for production and any
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
2. Add `hackbarna.com` and `www.hackbarna.com` to the Netlify project, choose the
   existing primary domain, and apply Netlify's recommended DNS records with
   the current DNS provider. Preserve the Digest subdomain and email records.
3. Wait for HTTPS, then verify redirects, analytics, and any enabled auth flows
   on the custom domain. Disable Vercel deployments and
   remove the old domain assignment after Netlify is serving correctly.

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
