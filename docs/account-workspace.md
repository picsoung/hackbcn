# Account workspace

The personal workspace uses the existing HackBarna identity and brand, with a small navigation bar shared across three surfaces:

- `/{locale}/account`: account-owned name, bio, LinkedIn, GitHub and photo. Sign-in and Digest preferences link to Digest.
- `/{locale}/account/projects`: verified projects with Edit, Hide/Make public and View actions. Event-email matches appear separately. Manual claims open under “Missing a project?”. Verified requests no longer duplicate the project list.
- `/{locale}/account/review`: organiser-only content review, ownership review and a collapsed event-match import. Non-organisers receive a 404 and never receive these records.

The focused editor at `/{locale}/account/projects/edit?project=…` currently edits the name, short description, project picture, website/demo and video link. Teams, awards, source identifiers, event assignments and ownership are outside this form. Profile links cannot grant project access.

## Verified public profiles

A saved community profile updates the public builder page and project-detail credit only after an unambiguous email claim binds the account to that exact original credit. Pending/revoked claims, disabled or stale roster evidence and conflicting accounts never apply public profile changes. An organiser-approved project membership alone cannot identify which teammate's profile to change; that needs an explicit credit assignment in a later organiser flow.

The builder directory groups the original reviewed source credits before applying display changes. Editing a name or social link therefore keeps the existing builder URL and cannot merge another builder's identity. A cleared avatar/link is respected, and only public fields reach page components. The builder's saved bio appears on their profile page. Hidden projects never enter the public binding lookup.

## Edit publication

This first editor uses **organiser review for every content revision**. The planned automated Jev conduct gate is still pending. The UI says “Send for review”. An expandable explanation describes the manual review, the retained approved version and the separate visibility controls. Only feedback on rejected revisions is returned to builders; approval notes stay private to organisers. Approval notes are optional, while requesting changes requires useful feedback.

`project_content` separates the latest submitted content from approved public content. `project_content_history` records immutable content and decision snapshots. Verified members share the editor; revision checks and conditional SQL updates reject concurrent stale writes. Organiser decisions also check the expected revision.

Public archive and submitted-project readers overlay only approved fields. Pending/rejected content, reviewer notes and actor IDs remain private. Hiding uses the separate visibility controls and takes effect immediately. Approval never changes visibility. Project totals and original attribution remain intact.

## Local validation and rollout

Apply the new `20261124210831_project_editing` migration with `netlify db migrations apply`. The existing shared community-profile migration is also required for the profile page. The workspace migrations are applied locally, on the stable preview and in production following the approved release #74 on November 26, 2026.

Run the ownership integration against **PostgreSQL 17**, as CI does:

```sh
TEST_DATABASE_URL=postgres://hackbarna:local-ci-only@127.0.0.1:5432/hackbarna_test \
  node --conditions=react-server tests/project-ownership.integration.cjs
```

Use a disposable loopback database. The test creates and removes its own schema and covers automatic/manual claims, team permissions, pending-content isolation, concurrent writes, stale decisions and approval while hidden. Netlify's embedded development database does not reproduce concurrent PostgreSQL transactions reliably, so it is suitable for the signed-in browser flow but not these concurrency assertions.

Profile persistence and access boundaries are checked with `node --conditions=react-server tests/community-profile.integration.cjs` while Netlify Dev runs at port 8888. That test creates and removes its own accounts, verifies that social-link matches grant no ownership, and checks that organiser records stay inaccessible.

## Uploaded pictures

The profile form supports file uploads, GitHub photos and an optional image URL. The project form supports uploading, previewing, replacing and removing its picture. New uploads use the `community-media` Netlify Blobs store; the database stores private ownership metadata and image references. Storage credentials stay on the server. Existing external images are preserved until the user replaces them.

Uploads require a verified server session and same-origin request. Project uploads also require a verified project membership. Limits are 4 MB per upload, 24 megapixels of decoded input and 20 upload attempts per account per hour. JPEG, PNG and WebP files are decoded, oriented, resized and re-encoded to WebP, stripping embedded metadata. Avatars are 512px square; project pictures fit within 1600 × 1200px.

An opaque `/api/media/:id` route checks references and visibility on every read. A staged avatar stays private until saved to its owner’s profile. A project picture stays private until its revision is approved and the project is public. Verified teammates and organisers can inspect held project images. Hiding a project also denies anonymous image requests, with no-store responses. Uploaded media cannot be attached to another person’s profile or another project.

Replacing or removing a staged upload discards its bytes. Referenced profile, project and revision-history images are protected from discard. Discard retains the upload reservation so it cannot reset the hourly limit. The `account_image_uploads` migration is applied locally and in the released preview/production databases.
