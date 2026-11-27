# Organiser project and builder management

Open `/en/account/admin` (also available under `/es`, `/ca` and `/fr`). The **Organiser tools** account tab links here. Access requires a verified account whose immutable ID is in `HACKBARNA_ORGANISER_IDS`. Being a project owner or changing a social link does not confer organiser access.

The **All projects** list includes real public and hidden projects from every supported event. Search project names, descriptions, builders or event names; filter by event, visibility or verified claims. Results are paginated in groups of 25. Excluded test submissions stay excluded. Original creator contact details are never sent to these screens.

Choose **Edit** to change the name, description, image, website or demo video using the same editor as project owners. Organiser saves publish immediately, with a new revision and actor in `project_content_history`. A save replaces any pending proposal; its earlier revision remains in history. Project owners still submit edits for review. Hiding or showing a project is a separate action with its own concurrency check and visibility audit. Saving content never unhides a project.

The **Builders** list includes historical credits as well as claimed profiles, including builders whose only projects are hidden. Edit a display name, bio, avatar, LinkedIn or GitHub. Builder details link back to their editable projects.

## Creator privacy

Creator visibility is independent of project visibility:

- In a project editor, **Hide creators on this project** removes all builder credits from that project’s public data, lists, detail and author structured data. The project remains public, crawlable and counted. It no longer appears under its builders’ profiles.
- In a builder editor, **Hide this builder across all projects** removes that public builder page and the person’s credits across projects. The projects and other teammates remain visible. The builder URL returns 404 and is removed from the sitemap.
- Either hiding rule takes precedence. Restoring a builder does not expose credits on a project that still hides its creators, and restoring project credits does not expose a globally hidden builder.

The organiser directory retains the original credits and hidden profiles, marks hidden credits, and offers a status filter to find them. Existing team ownership, shared profile data and organiser access remain intact. Names, portraits and social URLs are filtered before public page props, search, builder catalogues and live-project/export/leaderboard API responses. Original team positions and canonical builder URLs are preserved for the remaining teammates; verified individual profile bindings still use the original private roster digest.

These controls hide HackBarna attribution, rather than deleting source records. Review project titles, descriptions, body text, images, videos and external links separately if they identify someone. Community posts are independent of project credits. Creator-privacy changes have revision checks and a private actor/history audit in `creator_privacy_history`.

Apply migration `20261127170000_creator_privacy` before using the new controls. It introduces no hidden subjects by default.

## Storage and account boundaries

- Older projects remain Markdown sources; approved database overrides are applied at read time. Submitted projects use `live_projects`. No source files are rewritten by the admin UI.
- Unclaimed builder corrections use `builder_profiles`, keyed by the existing source-derived builder slug. Overrides apply after identity grouping and never merge people, move credits or grant ownership.
- A builder is linked to a shared account only through a unique, verified, enabled email-evidence claim whose individual credit and roster digest still match. A social URL or an organiser-approved team claim alone is not an individual account binding.
- For such a claimed builder, edits update `community_profiles`, the same profile used by HackBarna and Digest. A verified member's profile takes precedence over earlier historical corrections.
- Builder saves record before/after content, actor, revision and target in private `builder_profile_history`. Stale saves and claim transitions return a conflict rather than silently overwriting a newer version.
- Profile editing does not change authentication, contact addresses, communication preferences or ownership claims.

Avatar uploads continue to use the existing Netlify Blobs image pipeline. An organiser may upload a replacement for an edited profile; another member cannot attach that staged upload. Public media checks recognise organiser-uploaded avatars only when attached to a published profile. Historical-profile avatars are served publicly only when the profile still appears in the public builder catalogue. Audit references are retained when discarding staged media.

Apply migration `20261127160000_organiser_builder_editing` before running the new code. Netlify applies it through the existing migration build step. Deploy previews use their own database branch; this feature does not change production records until released and used there.

## Verification

`node --conditions=react-server tests/organiser-editing.integration.cjs` uses loopback Postgres and a disposable schema, which is dropped even on failure. It covers organiser access, immediate archive publication, hidden records, owner review, stable builder identity, shared claimed-profile updates, avatar attachment and publication, audit history, stale writes and API CSRF/validation. It is part of CI.

After the production build, `node --conditions=react-server tests/organiser-routes.integration.cjs` starts an isolated HTTP server against the disposable CI database. It checks the authenticated project and builder editors, search, translated controls and non-organiser isolation in all four locales. Temporary test accounts are removed afterwards.
