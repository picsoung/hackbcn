# Builder profiles

Builder names and portraits on project details link to a localized `/[locale]/builders/[builder]` page. The page uses the shared navigation, portrait or initials fallback, social badges and project cards. It shows every published project attributed to that identity, newest event first, with event names on the cards. LinkedIn, GitHub and other supplied public social links remain separate external actions.

## Identity and privacy

- Canonical personal LinkedIn URLs join credits across events, including abbreviated or differently capitalized display names.
- An explicitly supplied personal GitHub profile joins GitHub-only credits. If a credit supplies both LinkedIn and GitHub, that pair can connect other GitHub-only credits to the same LinkedIn identity. A GitHub account associated with multiple LinkedIn identities never bridges those people or combines ambiguous credits.
- Names alone never join people. Credits without a usable identity get a profile scoped to their public project and credit position. Identical names can therefore have separate profiles. No profile or biography is inferred from a project repository owner.
- Conflicting social fields are omitted from the aggregate header; their original project credits retain the submitted links. Known portraits are reused by public profile identity. No biography or current job title is fabricated from a project-specific role.
- URLs derive from the public profile identity and a short digest, so changing a display name does not change a verified profile's URL. Credit-scoped URLs depend on their submitted project, position and name. No email, registration identifier or private source field is used to generate a profile or its URL.
- Only the existing public project catalog feeds profiles. Draft archive entries and hidden live submissions are excluded. Builder metadata is allowlisted; contact fields, credential-bearing URLs, repository links masquerading as personal profiles and unrecognized fields are discarded.

## Discovery

Pages and project grids are server rendered. Metadata includes a canonical URL, a `ProfilePage`/`Person` record and an `ItemList` of that builder's projects. Project structured data links its authors to their internal profiles and preserves their external social identities. The sitemap includes profile URLs in English, Spanish, Catalan and French. Unknown builder IDs return 404.

Colin Stark is a useful cross-event check: his profile contains a11y ally, Design One-Pager, Steve as a Service, ling0, Valuator and Travel Tetris, plus his verified local portrait, LinkedIn and GitHub. The organiser confirmed the Travel Tetris credit despite a different submission email. That narrow exception is recorded in `data/aisummit25-maker-aliases.json`; it does not relax name-based matching or grant account permissions.

The 2025 enrichment audit now suggests existing linked profiles for unresolved full-name matches. These candidates require review and never merge identities automatically. First-name-only matches and unlinked credit placeholders are not suggested. Reviewed exceptions remain scoped to the project and submitted maker name.

```sh
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test tests/builder-profiles.test.cjs tests/project-archive.test.cjs
npx tsc --noEmit --incremental false
```

No database migration or attendee-file import is required for this feature.

Verified portraits and remaining identity/photo gaps are recorded in the [builder portrait audit](builder-portrait-audit.md).
