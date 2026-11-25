# Profile invitation campaign: 26 November 2026

Requested delivery: **Thursday 26 November 2026 at 09:02 Europe/Madrid**, equivalent to `2026-11-26T08:02:00Z`. This replaces the earlier proposed 10:00 slot. Never substitute an immediate send if the requested time has passed.

Status: **prepared, not queued**. Production still lacks the project-management routes, profile API, email logo and ownership tables. The website must go through preview and production before the campaign is queued. These are individual emails, not a newsletter subscription or an automation.

## Prepared audience

- 89 distinct, exact email matches, grouping 95 project credits across 69 projects.
- AI Summit 2026: 82 safe individual credits; 62 credits remain for review.
- Skill-a-thon: 13 safe individual credits; 16 credits remain for review.
- Jev-a-thon: all 23 real projects are held. Six creator emails have consistent registration evidence, but the Jev ownership import is not implemented. The Kiki test is excluded entirely.
- June Netlify and the original project submission CSV contain no individual email field; do not infer addresses from names, social profiles or repository owners.
- Resend contact and account-wide suppression checks found no opted-out or suppressed addresses among the 89 candidates. Recheck immediately before queueing, alongside production claims and invitation-specific opt-outs.

The private audience, uncertain-match report and individual HTML/text/API payloads are stored outside the repository with owner-only permissions. Nothing has been uploaded to a campaign or sent to participants. The recipient list must not be committed or exposed by the website.

All candidates currently have no saved communication-language choice, so each prepared email contains English, Castellano and Catalan. Use the saved preference for later messages. The organiser confirmed Reply-To `nico@hackbarna.com` and the footer `HackBarna · Barcelona, Spain`.

## Invitation-specific opt-out

`/{locale}/invitations/unsubscribe` offers a confirmation form in EN/ES/CA/FR. Opening the link or following its API redirect never changes preferences. An explicit form POST records an invitation-only suppression. The API also supports RFC 8058 one-click POSTs with `List-Unsubscribe=One-Click`; scheduled messages include the corresponding List-Unsubscribe headers.

Links carry a domain-separated, HMAC-signed recipient hash, never an address or account credential. `HACKBARNA_INVITATION_KEY` is an independent, stable 32-byte secret stored in Netlify's production Functions context. It is not shared with sessions or project-claim proofs. Keep it across releases: rotating it requires preserving old link verification and suppression lookups. No plaintext key is saved in the campaign files.

The `profile_invitation_opt_outs` migration stores only a keyed address hash and the first opt-out timestamp. Repeated requests are idempotent. Opting out cannot claim a profile, modify projects, change a communication language or change Digest newsletter subscriptions. A storage/configuration failure must stop delivery rather than treating the recipient as eligible.

## Queueing after release

1. Verify the production account/editor/profile routes, email logo and invitation opt-out page/API.
2. Import the reviewed production ownership evidence with the production claim key; verify roster digests and individual credit positions. Never apply local proof hashes under a different production key.
3. Recheck verified claims, invitation opt-outs, Resend contact opt-outs and account-wide suppressions. Exclude already claimed recipients and uncertain identities.
4. Use one `/emails` request per eligible person, with exactly one recipient, no CC/BCC, the reviewed HTML/plain text, confirmed Reply-To, opt-out headers and the explicit `scheduled_at` timestamp above.
5. Persist a private delivery ledger before each provider call. Pin the payload digest and use a stable campaign/recipient idempotency key. Record the returned email ID and verify its scheduled time. An uncertain response must be reconciled under the same key, never retried with a new identity.
6. Report accepted/held/failed counts and provider IDs privately. Do not call an email “scheduled” until Resend confirms it. No reminders are authorised.

Resend references: [scheduling](https://resend.com/docs/dashboard/emails/schedule-email), [send API](https://resend.com/docs/api-reference/emails/send-email), [suppressions](https://resend.com/docs/api-reference/suppressions/list-suppressions), [cancel a scheduled email](https://resend.com/docs/api-reference/emails/cancel-email).

## Organiser dashboard recommendation

Extend the existing `/{locale}/account/review` area rather than creating another account or role system. An allowlisted organiser should be able to:

- Search all public and hidden projects by event, project and builder.
- See unclaimed, pending, verified and revoked memberships, including verification method.
- Review content revisions and inspect visibility changes with their audit history.
- See invitation preparation, scheduling, delivery, opt-out and claim completion status; retry or cancel a specific invitation without starting another campaign.
- Review uncertain source matches before adding them to an audience.

Keep recipient addresses and registration evidence in organiser-only responses. Use the existing verified subject-ID allowlist, server-side checks on every request, noindex/private responses and audited mutations. The current review page handles claims and content decisions; the complete project/invitation overview is a recommended next increment, not implemented by this campaign preparation.
