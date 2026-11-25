# OAuth registration and shared-profile review

20 November 2026. Recommendation: use organiser-created OAuth clients for the
current two-site identity rollout; reconsider self-registration when external
MCP onboarding is a product requirement. No production registration setting has
been changed by this work.

## Current evidence

Anonymous dynamic registration returned 201 when the local website client was
created. That proves public registration was enabled at that time. Discovery
continues to advertise a registration endpoint, but discovery alone does not
prove the current registration policy. Creating an app does not itself authorize
an account; the user must approve the requested connection.

The repository's `profiles` policies check the user ID (and an admin role), while
Digest's generated authentication middleware verifies the user token without a
client-ID restriction. These source policies do not establish that an approved
third-party app is confined to the consent screen's human-readable list. Live RLS
and all deployed endpoints have not been exhaustively audited. Do not infer that
all private data is currently exposed, or that displaying scope labels enforces
API permissions.

## Options

| Policy                                 | Benefits                                                                    | Costs and risks                                                                                              |
| -------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Organiser-created clients              | Controlled inventory, names and logo ownership; simple fit for our two apps | Manual onboarding; some external MCP tools expect dynamic registration                                       |
| Open self-registration                 | Low-friction MCP interoperability and third-party integrations              | App impersonation, consent phishing and registration spam; requires strong client-specific API/RLS isolation |
| Self-registration plus reviewed access | Supports an ecosystem while separating registration from approval           | Needs an organiser app registry, review/revocation operations, backend enforcement and tests                 |

An app name, home URL or logo can be copied. Only an organiser-controlled client-ID
registry may establish a trusted-app label. Every consent screen should show the
actual callback origin. HTTPS logos use no-referrer image requests and an initials
fallback; remote image rendering never runs as a server-side fetch.

Disabling dynamic registration prevents new automatic registrations. It does not
remove existing apps, revoke previous consents or invalidate issued tokens.
Review registered apps and grants separately before changing the rollout policy.
Preserve needed MCP clients or document how they are onboarded manually.

## Concrete isolation in this implementation

The new HackBarna community-profile API verifies issuer, ES256 signature,
audience, subject, expiry and account role. It accepts direct Digest sessions and
explicitly trusted first-party OAuth client IDs. An approved but untrusted OAuth
client is denied, even if it has the same user subject. CORS, mutation provenance,
field allowlists and optimistic revisions provide additional boundaries. Roles,
email, account IDs and project ownership cannot be changed through the profile
form. This protection is specific to the new API; it does not retrofit all
existing Digest policies.

For broader third-party use, audit live RLS and server/edge functions by client ID
and operation, including admin actions, newsletter/export/delete endpoints,
refresh/grant revocation, rate limits and token logging. Keep read-only MCP tools
separate from profile/account writes.

## Profile ownership and application responsibilities

Netlify holds the canonical community fields alongside the existing builder and
project catalog. HackBarna provides the editor and public-credit discovery.
Digest reads the same fields for its account presentation and links to the editor;
its subscription and login/security settings stay in Digest.

The existing archived builder pages are attribution snapshots. Saving a LinkedIn
or GitHub URL only finds public credits; it does not verify a claim or overwrite
those snapshots. Verified membership, public-profile overrides and project
editing/hiding remain the next phase. Before broadly rolling out the additional
profile store, connect it to the existing account export/deletion lifecycle and
verify cross-app behavior in a configured deployment.

## App logos

The consent screen renders `client.logo_uri` from the authorization server. Use a
short, publicly accessible HTTPS image URL in the client's `logo_uri` metadata
when registering a new app. Existing clients require an authorised OAuth Admin
API update; setting metadata on the consent page does not change the registered
client. A short human-facing client name such as “HackBarna” keeps the request
clear; environment names can stay in the organiser's inventory.

## Proposed closed-registration rollout

Keep OAuth sign-in enabled, but turn off dynamic client registration on the managed
Auth service (`allow_dynamic_registration = false` in Supabase's configuration
model). Editing a local `supabase/config.toml` does not by itself change Lovable
Cloud. The Lovable connection currently requires reauthentication; the managed
setting and deployed client inventory have not been inspected or changed.

Use one confidential production client for the exact
`https://www.hackbarna.com/auth/callback` redirect, one confidential preview client
for the fixed `https://codex-preview--hackbarna.netlify.app/auth/callback` redirect,
and keep the separate existing localhost development client. Netlify's dedicated
`codex/preview` branch supplies the stable hostname without custom DNS. A stable
trusted preview branch avoids registering an app
for every PR. Do not give its credentials to arbitrary PR builds, use wildcard
callbacks, or expose production client secrets in previews. Preview project data
must use its preview database.

Before closing registration, inventory existing clients, callbacks and grants,
including external MCP clients. Preserve reviewed clients and revoke unwanted
grants/clients deliberately; disabling registration is not revocation. Verify a
valid anonymous registration is rejected without creating a new client, and that
production, fixed-preview and local sign-in still work. Keep future app creation
behind organiser/admin access.

Enforce these boundaries independently of registration:

| Resource | Direct Digest session | Website/preview OAuth token | Other OAuth token |
| --- | --- | --- | --- |
| OIDC identity endpoint | Normal provider behavior | Requested identity claims | Only approved grants |
| Private Digest tables and storage | Existing ownership/role rules | Deny | Deny |
| Digest writes, admin actions, account export/deletion, API-key creation | Existing permissions; sensitive actions need appropriate reauthentication | Deny | Deny |
| Public event/community reads | Public-field rules | Public-field rules only | Public-field rules only |
| Website community-profile API | Own profile | Own profile for exact reviewed client IDs | Deny |

For private tables, add restrictive RLS constraints requiring a direct session
(`(auth.jwt() ->> 'client_id') IS NULL`) in addition to existing ownership/role
rules, covering reads and writes. An extra permissive policy would be ORed with
existing policies and would not close the gap. Preserve intentionally public
reads with explicit column/row restrictions. Audit views, security-definer RPCs,
storage and functions too; table RLS does not cover every access path.

The current Digest `account.functions.ts` export/deletion handlers use the shared
authentication middleware, which validates the subject but does not reject OAuth
client tokens. Add a non-generated direct-session guard to internal server
functions, and equivalent verified-claim checks in edge functions, before any
service-role access or side effect. Service-role calls bypass RLS. Do not edit the
generated Supabase integration to implement this boundary.

Test a normal user and an administrator with direct sessions, production/preview
OAuth tokens and an untrusted OAuth token. Verify denial through direct REST,
RPC, storage, server functions and edge functions, and confirm public MCP tools
still work. Include a foreign-account ownership test: a trusted client must never
gain another user's permissions. Changing consent UI or CORS alone is insufficient.

## References

- https://supabase.com/docs/guides/auth/oauth-server/getting-started
- https://supabase.com/docs/guides/auth/oauth-server/token-security
- https://supabase.com/docs/guides/self-hosting/self-hosted-oauth-server
