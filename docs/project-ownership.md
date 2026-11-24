# Claiming and managing projects

The website reuses the existing Digest account. `/en/account/projects` (also
available in ES/CA/FR) shows verified projects and lets any verified teammate hide
or restore the project. Totals continue to include private projects. Community
posts are managed separately.

## Ownership verification

- A verified account email may match an individual original submission email and
  a reviewed attendee record. The account sees its matched credits and
  confirms the claim with a POST. Merely visiting the page does not claim anything.
- Source team order and the current public roster must agree. Shared team emails,
  conflicting registrations, incompatible names/profiles and missing original
  individual emails do not grant automatic rights.
- Other people can request a review using their existing account. Organisers check
  individual evidence and approve, reject or revoke the request. Editable names,
  LinkedIn/GitHub URLs, browser metadata and a request's account ID never grant
  ownership.
- Rejected/revoked claims cannot bypass review by requesting again. Revocation
  disables the corresponding automatic proof. Replacing or removing imported
  evidence revokes affected automatic memberships; identical reimports preserve
  them. Organiser-approved memberships remain separate.

Current preparation supports AI Summit 2026 and Skill-a-thon. Skill-a-thon source
emails identify submitters only, so their teammates require separate review. June
Netlify has no original individual email field and remains a review case. These
boundaries follow the [attendee audit](attendee-email-audit.md).

## Private configuration and import

Set these server-only values separately for local, trusted preview and production:

- `HACKBARNA_PROJECT_CLAIM_KEY`: 32 random bytes encoded as 64 hexadecimal
  characters, separate from the session encryption key. It keys exact email
  lookups; raw submission/attendee emails are not stored in proof records.
- `HACKBARNA_ORGANISER_IDS`: comma-separated verified Digest account UUIDs. An
  empty allowlist grants no organiser access. Do not use names, email domains or
  editable user metadata as roles.

Use the original private snapshots and organiser-supplied CSV files. Save the
prepared proof file outside the repository; the script refuses an in-repo output
and creates the file with owner-only permissions. It prints counts only.

The attendee input may also be a private JSON manifest containing a `files` array
of absolute CSV paths. Original submission ownership still comes from that
event's source; another event's registration can corroborate the same individual's
exact email and consistent identity. Conflicting saved registrations require review.

```sh
node scripts/prepare-project-claim-evidence.cjs \
  aisummit26 /private/attendees.csv /private/submissions.json /private/ai-claims.json

node scripts/prepare-project-claim-evidence.cjs \
  skillathon-hacknight-2026 /private/attendees.csv /private/projects.json /private/skill-claims.json
```

After deploying the migration, a signed-in allowlisted organiser can import that
file from the Ownership review section on My projects. The file's key fingerprint
must match the current environment. Prepare a new file for another environment or
after rotating the lookup key. Never commit the key, original contacts, prepared
proofs or identity account records.

The importer validates the current project/roster, individual credit positions and
unique per-project email proofs. It rejects plaintext contact fields and replaces
the evidence for the explicitly listed projects atomically. Projects with no safe
matches remain in the batch so stale proofs are disabled as well.

No invitations or other messages are sent by this flow. Newsletter subscriptions
are independent of account/claim actions.

## Runtime visibility and permissions

Archived Markdown remains the source snapshot. A database override controls
runtime visibility, so a verified owner can hide or restore it without a Git push.
Drafts and removed test submissions cannot be restored through this flow.
Submitted projects retain their existing visibility column. Public catalogs,
builder pages, detail pages, related items and sitemaps resolve visibility before
rendering; database errors fail closed.

Mutations require the website's server session, a verified account email and an
explicit same-origin JSON request. Every visibility change checks current verified
membership in its transaction. Version checks reject stale simultaneous changes.
Changes record the actor and revision in a private audit table. Owner/review pages
are uncached and noindex; private claim/evidence fields never enter public cards or
JSON-LD. Account deletion removes claims and preserves anonymized visibility
history and the project's existing privacy state.

## Verification

```sh
node --test tests/project-ownership.test.cjs
node --conditions=react-server tests/project-ownership.integration.cjs
```

The integration test refuses remote databases, creates a dedicated schema, tests
real transactions and concurrent teammates, and drops the schema afterward. CI
provides a disposable PostgreSQL database and also runs the existing project,
identity, privacy and rendered-route checks.

For local integration, run Netlify Dev first, or provide `TEST_DATABASE_URL`
pointing to a disposable loopback PostgreSQL instance.

Content editing, team invitations, additional-email verification and submission
moderation are subsequent flows; this change manages ownership and visibility.
