# Production invitation preparation

Profile invitations are scheduled individually in Resend after the audience is reviewed. Preparing a campaign does not send mail, create newsletter subscriptions or grant memberships to profile-only matches.

`POST /api/internal/profile-invitations/prepare` is an operator endpoint. It requires the production-only `HACKBARNA_INVITATION_PREPARE_TOKEN` bearer credential and an unexpired `HACKBARNA_INVITATION_PREPARE_UNTIL` timestamp no more than 24 hours away. Keep the credential in memory and scope it to Functions. Preview builds cannot prepare production invitations. The endpoint never returns the existing invitation or ownership signing keys.

Supply reviewed recipient IDs, addresses and individual project credit positions with current roster digests. Only original individual submission emails corroborated by registration emails may include automatic proof inputs. Profile matches omit those inputs and remain subject to organiser review. Existing individual proofs must match; conflicts abort preparation rather than replacing evidence or revoking memberships. Preparation checks production opt-outs, verified memberships, project visibility and creator privacy, and returns signed opt-out URLs and saved language preferences in a private, non-cacheable response.

Before provider scheduling, recheck all known aliases against prior sent/scheduled invitations, contact opt-outs, suppressions and claimed identities in production and any previously published preview. Validate the returned production-signed opt-out links on the active production site. Pin each final payload and idempotency key in an owner-only ledger, save the returned provider ID immediately, and verify the scheduled recipient and timestamp. Never substitute an immediate send when the requested delivery time has passed.

## Preserving published preview privacy

If a preview was published directly, its database changes do not move with a normal production release. An organiser may configure a private `HACKBARNA_DEPLOYMENT_PRIVACY_PLAN` in the production Builds scope before releasing. The version-one JSON contains a `settings` array of `subjectKey`, `hidden` and `hiddenFields` values, with no credentials or email addresses. `HACKBARNA_OWNER_ID` must identify an existing verified account in production.

The npm prebuild step applies that plan only in the production context. It merges restrictions without unhiding anything, records privacy history, and stores a payload digest in `deployment_operations`. Repeating a completed plan has no effect, including after a later deliberate privacy change. A failure stops the build before publication. Remove the private plan environment variable after verifying the release; keep participant and privacy-request data outside the repository.
