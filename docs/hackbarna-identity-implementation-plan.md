# Shared HackBarna identity, claims and submissions

Status: implementation started, 19 November 2026.

## Agreed product decisions

- One existing Lovable Cloud / Supabase account across `hackbarna.com` and `digest.hackbarna.com`. Preserve Digest user IDs, Google login, passwords and subscriptions.
- Every verified project member can edit, hide and restore an approved project. A person controls their own builder profile. Membership verification and awards remain organiser controlled.
- Any signed-in HackBarna user can submit while an event's submission window is open. Closing submissions does not lock existing projects against their verified team's edits.
- Each event chooses automatic or organiser-reviewed publication. Automatic publication is the default, after the code-of-conduct check passes.
- Jev flags and uncertainty hold a submission privately for organiser review. An outage saves the submission privately for retry; it never grants publication.
- Edits create revisions. The previous approved revision stays public until a replacement passes. Hiding takes effect immediately and is independent of moderation results.
- Emails, registration records, claim evidence, tokens and review notes stay private. Signing in or claiming does not subscribe anyone to newsletters.

## Current implementation and evidence

The main website uses Next.js 14 on Netlify with Netlify Postgres. Historical projects are Markdown and the Jev-a-thon is database-backed. Public builder pages currently derive identities from reviewed social links; these need persistent internal IDs before ownership can be edited safely.

Digest lives in `/Users/picsoung/Dev/hackathons/bcnstartups`, uses TanStack Start on Lovable, and stores sessions in localStorage. Google authentication uses Lovable's managed broker. Its private `profiles` records reference the existing `auth.users.id` and contain email, so they must not become a public builder endpoint.

Digest already implements `/.lovable/oauth/consent`. The live backend publishes OAuth/OIDC discovery, an authorization-code endpoint, refresh-token support, S256 PKCE and an ES256 public signing key. Its canonical issuer is the `.supabase.co/auth/v1` URL advertised by discovery, while frontend API calls use a `.lovable.cloud` proxy. Discovery is evidence of capabilities, not proof that a new client can complete sign-in.

There is an uncommitted shared-cookie authentication prototype in the website checkout. Back it up before adapting it. The implementation below supersedes its broad `.hackbarna.com` cookie design. Unrelated local brand assets, automation scripts and settings must remain untouched.

The existing Jev integration categorises ideas; it is not a code-of-conduct classifier. The current submission endpoint has no authenticated-account requirement and saves projects when categorisation fails. A separate publication gate is required.

## Architecture

### Existing identity provider, individual website sessions

Register the main website as an OAuth/OIDC client of the existing Digest provider. Use the authorization-code flow with S256 PKCE, state and nonce. Keep Digest's localStorage and managed Google broker intact. The existing consent route may need product copy suitable for the website client without changing permissions for existing MCP clients.

The website exchanges codes on its server, validates issuer, signature, audience, nonce and expiry with a maintained OIDC library, and establishes an opaque, host-only HttpOnly session. Store access and rotating refresh credentials encrypted in the server database. Never expose them to client components, URLs, browser storage, logs or public project data. Store only a digest of the random session identifier.

Production, local development and Deploy Previews use separate registered clients and exact redirect URIs. Production credentials must not be available in untrusted previews. Resolve the issuer and public keys from a fixed configured provider; callback query parameters cannot select them.

Website logout immediately revokes its local session and clears the cookie. Do not promise cross-app logout until provider revocation is proven: live discovery currently advertises no end-session endpoint. Test Digest global logout and website token refresh before adding a global-sign-out action.

### Community records in Netlify Postgres

- `identity_accounts`: existing provider issuer + subject, with private account metadata and lifecycle timestamps.
- `identity_sessions`: random-session digest, account, encrypted provider credentials, token expiry, absolute session expiry, revocation and refresh coordination.
- `builders`: stable UUID, optional claimed account, public name/bio/avatar/social fields, visibility and existing URL aliases.
- `project_records`: stable UUID, source reference (`archive:<slug>` or submitted event/slug), event, visibility, approved revision and update timestamps.
- `project_members`: project + builder, accepted/verified status, evidence reference and verification timestamps. The submitting user is verified for their own new project; invited teammates become members only after accepting.
- `project_revisions`: immutable submitted content, author, base revision, moderation state and decision references.
- `profile_claims` and `team_invitations`: hashed, expiring, single-use credentials and intended verified identity. Keep raw contact evidence in private storage only.
- `project_moderation`: content hash, rule IDs, relevant excerpts, Jev model/policy versions, disposition and organiser override.
- `project_audit`: who changed what and when; visibility changes are separate from content approval.
- `event_submission_settings`: open/close dates, explicit enabled flag, publication mode, current moderation-policy version and allowed media.

All mutation endpoints validate the server session and current verified membership. Browser user metadata and a submitted user ID never grant access. Public queries select approved revisions and visible records only. Digest keeps its own preferences and subscription data; the common key is the existing verified Auth user ID.

Historical content is imported as source snapshots. Database records and revisions hold subsequent user changes. Preserve existing public URLs and use aliases when consolidating a verified builder's old URLs. Never merge people solely by display name or repository ownership.

## Claiming existing builder profiles

1. Privately prepare the reviewed mapping between imported builder credits, original submissions and individual registration emails.
2. Permit automatic proof only when the contact evidence identifies that individual unambiguously. Shared team emails, conflicting registrations and incompatible account names require review. Preply's shared Alvaro email cannot establish Abel's or Alex's ownership.
3. Prepare a branded invitation linking to a specific builder claim. The token expires, is single-use and is consumed only by an authenticated confirmation POST, not by opening an email link.
4. Reuse the existing account. If its verified email differs, verify the event address within the claim process or use a reviewed authenticated personal social identity; do not create a duplicate builder automatically.
5. Show the profile and project memberships being attached before confirmation. Attach only that builder's verified credits.
6. Expose an organiser queue for uncertain and disputed claims, with recorded evidence and decisions.

Prepare outreach for review; send invitations only when explicitly instructed. Newsletter consent remains independent.

## Editing and visibility

- Own-profile edits can change public fields and visibility, but cannot claim another person or overwrite somebody else's contact information.
- Any verified project member may submit a content revision or hide the project. Changes record the actor; other members can see the history and restore a previously approved revision.
- Unverified credits remain visible as historical attribution where already published, but do not grant editing rights.
- Use optimistic revision checks so simultaneous editors do not silently overwrite each other.
- A moderation job checks the content hash/base revision before applying its result. It cannot publish a stale edit or undo a later hide action.
- Exclude hidden profiles/credits/projects and held revisions consistently from cards, search, related items, public APIs, JSON-LD, sitemap and cached public pages. Search-engine copies may take time to disappear.

## Future-event submission and moderation

1. Show submission availability from server-validated event settings.
2. Require a verified account, create a private draft, prefill the submitter's builder identity and allow draft saving.
3. Collect title, pitch, description, demo/repository links, supported media and team invitations. Participation is not restricted to the Luma attendee export.
4. On submit, validate fields and queue a dedicated Jev assessment against the versioned HackBarna code of conduct. Treat project text as untrusted input, not model instructions.
5. Return a structured `pass` or `review` result with rule references and supporting content, never a public project score. Low confidence and service failure remain private.
6. In automatic events, publish only the current passing revision. In reviewed events, send passing submissions to the organiser queue too.
7. Organisers approve, request changes or reject a held revision. Keep the decision and policy/model versions for audit.
8. Apply the same check to material content edits. Preserve the last approved revision while an edit is held.

The code of conduct includes sexual imagery and doxxing as well as harassment. Passing an external URL to Jev does not inspect that page or its media. Verify supported media moderation before enabling automatic publication of uploads; unsupported media requires a separate check or human review. The UI must describe the actual coverage rather than promising all external demos are safe.

## Delivery sequence and acceptance checks

### Phase 0: plan and safe baseline

- [x] Record the decisions, existing architecture and verified provider metadata.
- [x] Back up the uncommitted auth prototype and record unrelated local changes.
- [x] Use an identity feature branch; keep the builder-profile PR independently reviewable.

### Phase 1: working shared identity

- [x] Add OIDC client configuration and a maintained authorization-code client.
- [x] Add the server session migration, authenticated encryption and session persistence.
- [x] Implement start, callback, current-session and same-origin POST sign-out endpoints.
- [x] Adapt the account page, sign-in shell and navbar to server-managed identity, preserving EN/ES/CA/FR and existing brand components.
- [x] Register the local redirect client and configure credentials outside Git. Dynamic registration returned 201 for the confidential client and exact `http://localhost:8888/auth/callback` callback.
- [ ] Register a separate preview client and exact callback; configure preview-only secrets.
- [x] Prove that an existing Digest account returns the same subject on the website, including the managed Google flow, real refresh, local logout and return sign-in.
- [x] Test state/nonce/PKCE failures, callback replay, bad signatures/issuer/audience, expired sessions, refresh races, revocation, unsafe return paths, cookie scope and public-page account-data isolation.
- [x] Test authenticated and signed-out views locally, including the account screen at phone width. A missing provider/client configuration yields an honest temporary-unavailable state, never a fake signed-in session.
- [ ] Verify the complete flow on a configured Deploy Preview before production rollout.

### Phase 2: claim and manage existing profiles

- [ ] Add persistent builder/project/member records and import reviewed public source snapshots idempotently.
- [ ] Add claim records, private contact-evidence import, verified claim confirmation and organiser review.
- [ ] Add account-owned profile editing, project editing, immediate hide/restore and revision history.
- [ ] Verify permission checks for unrelated users, unverified teammates, shared emails and concurrent changes.
- [ ] Verify every public representation and cache respects visibility.

### Phase 3: future submissions and Jev gate

- [ ] Add event settings and the authenticated draft/team-invitation flow.
- [ ] Add the dedicated code-of-conduct classifier, durable retries and organiser review queue.
- [ ] Test automatic/reviewed events, closed windows, outages, uncertain results, stale jobs, edited content and hide-versus-publish races.
- [ ] Verify media handling and moderation coverage before enabling uploads.

### Phase 4: pilot and rollout

- [ ] Pilot claims with a small set of unambiguous individual contacts, including an existing Digest user and a multi-builder project.
- [ ] Review and explicitly authorise the prepared invitation batch before sending.
- [ ] Complete production client configuration and migration, verify login/claims/visibility, then enable broadly.
- [ ] Monitor failed claims, publication delays and moderation false positives; keep organiser overrides and rollback available.

## Implementation boundaries

Implement and verify Phase 1 first, then proceed through the data and user flows in dependency order. Schema or scaffolding alone does not complete a phase. Record completed checks and actual external blockers here. Production account invitations, migrations and rollout require a concrete reviewed result; nothing in this plan authorises sending messages by itself.

## Verification record: 19 November 2026

- Work is on `codex/hackbarna-shared-identity`. The previous uncommitted draft is backed up privately under `~/.codex/backups/hackbarna/shared-identity-2026-11-19/`; unrelated local assets/settings/scripts remain separate.
- `npm run test:auth`: 22 protocol/session tests pass, using real ES256 signatures and an injected provider transport.
- TypeScript and lint pass for the website authentication implementation. The production Next.js build passes in an isolated copy with no provider secrets.
- 37 existing builder, project, live-wall and homepage tests pass.
- Migration `20261119202717_shared_identity_sessions` is applied to local development Postgres. Local database/HTTP integration checks pass for encryption, versioned refresh leases, account rendering, public-page isolation, issuer binding, expiry, cross-origin sign-out rejection and immediate session revocation. The isolated test account and its sessions are removed afterward.
- Signed-out production-build checks pass in EN/ES/CA/FR. Private routes are uncached/noindex; a missing configuration honestly disables sign-in. Account metadata does not enter public homepage HTML.
- The user approved the local website client. The real managed-Google flow completed against the existing Digest account, with the provider subject retained in the local account/session. Forcing only the local stored access-expiry timestamp exercised a real provider refresh; the credential version advanced and the same account remained signed in. Browser logout revoked that session in Postgres immediately, and reopening the private account page required sign-in. Returning through Digest then signed in without another Google login or consent prompt.
- Phone-width account checks show no horizontal overflow and 44px-or-larger primary action targets. A failed Google portrait exposed an image-error event firing before hydration; the shared avatar now detects this and shows initials, also preserving the normal onError fallback.
- A separate small Digest change on `codex/hackbarna-shared-identity` replaces event-search wording with a scope-based account-access explanation and labels continued sign-in. It preserves the existing consent logic, account storage and Google broker. Deployment remains separate from local code verification.

## Verification record: 20 November 2026

- The shared-profile follow-up is on `codex/shared-profile-and-consent` in both repositories, based on the merged identity changes.
- The website now stores an account-owned community profile and shows read-only project credits matched by social URLs. Name, avatar, bio, LinkedIn and GitHub are editable. Digest reads the same profile for its navbar, account and consent screen, and links to the website editor; its security and subscription settings remain in Digest.
- The community-profile migration is applied only to the local database. Six profile/JWT tests, the 22 existing auth tests and 37 project/builder/homepage tests pass. The real local database/HTTP integration verifies isolation, revision conflicts, field/body limits, CORS/CSRF, private/public separation and revoked sessions; fixture accounts and profiles are removed afterward.
- Website type checks, targeted lint and the production build pass. The real signed-in local account saves a profile and displays a matching project credit. At a 390px viewport, the account page has no horizontal overflow. The redesigned consent screen was inspected with a clearly labelled UI-only fixture; local Vite does not provide Lovable's managed Google broker, so this is not an end-to-end hosted Digest sign-in verification. The fixture is removed from the implementation.
- Digest type checks, five branding/profile boundary tests, targeted lint for the new components/helpers/consent route, and the production build pass. The existing account/navbar files retain unrelated formatting/type-style lint findings. Build-generated MCP route and deploy-config edits were restored; neither app's dependency lockfile was broadly regenerated.
- A persistent Netlify branch deploy is configured for `codex/preview` at `https://codex-preview--hackbarna.netlify.app`. Its exact OAuth callback is set in that branch's environment. Production OAuth credentials remain scoped to production; a separate provider client and preview session key still need provisioning. The first preview uses current `main` plus non-production noindex headers, leaving the uncommitted profile/consent work separate.
- Public app-registration risks and the organiser-created-client recommendation are documented in `docs/oauth-app-registration-review.md`. Production registration settings are unchanged. The new profile API rejects untrusted OAuth client IDs; this does not replace a live audit of existing Digest RLS and endpoint policies.
- Verified claims, public archive overrides and project editing/hiding remain unimplemented. Connect the additional profile store to account export/deletion and verify the two configured deployments before a broad production rollout.

## References

- [Supabase OAuth setup](https://supabase.com/docs/guides/auth/oauth-server/getting-started)
- [Authorization-code and PKCE flows](https://supabase.com/docs/guides/auth/oauth-server/oauth-flows)
- [openid-client](https://github.com/panva/openid-client)
- Existing Digest auth: `src/pages/Auth.tsx`, `src/integrations/lovable/index.ts`, `src/routes/[.]lovable.oauth.consent.tsx` in `picsoung/bcnstartups`.
- Existing website imports, identity rules and email findings: `docs/builder-profiles.md`, `docs/attendee-email-audit.md` and `docs/builder-portrait-audit.md`.
