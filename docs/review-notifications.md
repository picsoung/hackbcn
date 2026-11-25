# Slack review alerts

The requested destination is **picsoung → #hackbarna**. This feature sends Slack alerts only. It does not add email subscriptions.

An alert is queued when a verified builder submits project details or a picture for review, or when a new ownership request needs manual verification. The Slack message includes the project, event, submitter’s display name, changed field names and an authenticated review link. It excludes email addresses, claim explanations, pending descriptions, picture URLs and private proof files. Unreviewed text uses Slack plain-text blocks and cannot create channel mentions. Link/media previews are disabled.

Profile edits, upload staging, voting and immediate Hide/Show actions require no review and generate no alerts. Exact event-email claims verified automatically also generate none. Repeating an existing pending claim does not create more alerts. Resubmission after rejection starts a new review request.

## Delivery

The outbox row is inserted in the same database transaction as the edit/claim. Provider outages never undo a successfully saved edit. The Netlify scheduled function invokes a secret-protected Next endpoint every five minutes, allowing the notification database logic to remain inside Next’s server runtime.

Each delivery uses a lease and unique event key. Before posting it rechecks the current revision/claim generation and status. Superseded or already-reviewed changes are cancelled. Changing the webhook cancels queued deliveries for the old destination. A transport failure can leave delivery unconfirmed; Slack incoming webhooks offer no idempotency key, so a retry after such a failure can very occasionally duplicate a post. Normal retries and concurrent workers do not re-send acknowledged messages.

Deliveries are serialized with a database advisory lock and paced at one message per second. HTTP 429/5xx responses retry with bounded backoff and Retry-After support; a 429 pauses delivery for the destination. Permanent HTTP failures and exhausted retries are recorded with generic error codes, never response bodies or webhook URLs. Scheduled work has a 15-second processing budget. No browser-provided URL, recipient or channel can control delivery.

## Enable on production

1. Apply `20261125094007_review_notifications` with the normal Netlify migration/deployment workflow.
2. Create the **HackBarna Reviews** Slack app using `slack-review-app-manifest.json`, or use an existing posting-only incoming webhook. Select the **picsoung** workspace and **#hackbarna** channel. The only requested permission is `incoming-webhook`; the app cannot read Slack history.
3. Store the webhook as `HACKBARNA_REVIEW_SLACK_WEBHOOK` in Netlify, scoped to **production Functions only**. Do not paste it in a PR, source file or a public chat.
4. Generate a separate 32-byte random value (64 hex characters) for `HACKBARNA_REVIEW_DISPATCH_TOKEN`, also scoped to production Functions. Never reuse the identity/session or project-claim keys.
5. Set `HACKBARNA_REVIEW_NOTIFICATIONS_ENABLED=true` only for production Functions. Keep local and preview values disabled. The production identity callback must use `https://www.hackbarna.com` (or the apex equivalent).
6. Deploy through preview, then the normal production release. The scheduled function `review-notifications` appears in Netlify Functions with a five-minute schedule. No alerts are live merely from editing the local repository.
7. Submit a small review request and confirm its Slack link opens the selected item after organiser sign-in. An app/webhook installation needs the workspace member’s Slack approval.

The dedicated **HackBarna Reviews** app (`A0CLU2L820N`) was created and installed on November 25, 2026, in **picsoung-dev** (`picsoung.slack.com`), after the workspace owner removed unused apps. It has a posting-only incoming webhook for the private **#hackbarna** channel. Its webhook and the separate dispatcher key are stored as Netlify secrets for the **hackbarna** site's production Functions only. A single connection test was acknowledged by Slack and verified in the channel. Automatic delivery remains disabled; set the production flag to `true` as part of the feature's production release. Preview, branch deploy and local contexts have no review notification variables configured.

Alerts cover new review requests after enablement. They do not automatically announce the existing backlog. Old rows in `review_notifications` are private delivery/audit records; destination credentials are never stored there.

## Validation

`node --test tests/review-notifications.test.cjs` checks production opt-in, endpoint restrictions, safe Slack formatting and the cron bridge. The PostgreSQL ownership integration also checks atomic enqueueing, stale cancellations, manual/automatic claims, retries, worker concurrency and dispatcher authentication. Provider HTTP calls use test doubles; no test posts to Slack.

References: [Slack incoming webhooks](https://docs.slack.dev/messaging/sending-messages-using-incoming-webhooks/) and [Netlify scheduled functions](https://docs.netlify.com/build/functions/scheduled-functions/).
