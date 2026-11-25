# Account communication language

HackBarna account settings at `/{locale}/account#communication` offer English, Castellano and Catalan, plus “Not selected · all three languages”. The initial value is null, not an inferred English preference. This setting is private and separate from the public community profile. Digest shows the saved choice in its Account profile tab and links to the same editor; it does not keep a second copy. Digest's existing newsletter-language/subscription settings remain independent.

Invitations without a saved choice contain all three complete versions in one email. The renderer uses a single brand header, signature and reply footer, with a language-specific CTA in each section. Explicit saved choices can select one version for future messages. Website navigation language is never treated as a communication choice.

## Storage and access

`account_communications` stores the subject UUID, a private verified delivery address, the nullable language, optimistic revision and durable sync state. None of those contact fields enter public pages, the public profile object or the invitation preview. The existing shared-account CORS/client allowlist protects preference reads; writes require the verified website identity and the same-origin mutation checks. Browser input cannot select an account or delivery email. Digest reads preferences with its existing authenticated token and trusted HackBarna origin.

Saving a preference commits before calling Resend. A provider failure leaves it pending. Concurrent saves use revisions; a completed older sync cannot overwrite the newer preference's queue state. Scheduled work serializes deliveries with an advisory lock, uses row leases and retries provider errors with backoff and Retry-After support. Stored errors are generic codes, never response bodies, API keys or addresses.

## Resend

The account's `communication_language` custom property is a string: `en`, `es`, `ca`, or `all` when the preference is null. Its fallback is `all`. The property definition was created in the connected Resend account on November 25, 2026. No individual contacts were modified by setup.

An existing contact receives only a properties PATCH. Its subscription and segment memberships are untouched. If there is no contact, the new record is created with `unsubscribed: true`; choosing a language never subscribes someone. These operations never call an email-sending endpoint.

The canonical setting lives in HackBarna's private database, not in Resend. Resend is the delivery mirror. Raw registration exports are not bulk uploaded or used to invent preferences.

## Release configuration

Apply `20261125224553_account_communications` through the normal Netlify migration/deployment workflow. It has been applied to the local development database only. Set these as production Functions values:

- `HACKBARNA_RESEND_API_KEY`: secret API key with contact-property access.
- `HACKBARNA_CONTACT_DISPATCH_TOKEN`: separate random 32-byte secret, encoded as 64 hex characters.
- `HACKBARNA_CONTACT_SYNC_ENABLED=true`: enable only when releasing the feature.

The credentials are stored in Netlify's production Functions context. The enable flag is currently false; preview and local environments have no live provider credentials. `netlify/functions/contact-preferences.mjs` runs every five minutes after a production deployment and calls the token-protected Next endpoint. The API also attempts the signed-in account's sync after a save. No campaign or reminder is scheduled by this feature.

Verification: `node --test tests/profile-claim-email.test.mjs tests/communication-preferences.test.cjs`; run `tests/communication-preferences.integration.cjs` with `--conditions=react-server` against a disposable loopback PostgreSQL database named `hackbarna_test`. Provider calls in tests use doubles and send no mail.

References: [Resend custom contact properties](https://resend.com/docs/api-reference/contact-properties/create-contact-property), [updating a contact](https://resend.com/docs/api-reference/contacts/update-contact).
