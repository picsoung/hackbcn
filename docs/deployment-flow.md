# Preview, then production

```text
feature branch → PR → codex/preview → test the fixed preview
                                    ↓ release PR
                                   main → www.hackbarna.com
```

`codex/preview` is the integration branch and the GitHub default branch.
Netlify's production branch remains explicitly set to `main`.

| Stage              | Branch                                 | URL                                          |
| ------------------ | -------------------------------------- | -------------------------------------------- |
| Feature review     | A feature PR targeting `codex/preview` | Netlify PR Deploy Preview                    |
| Integrated preview | `codex/preview`                        | https://codex-preview--hackbarna.netlify.app |
| Production         | `main`                                 | https://www.hackbarna.com                    |

## Feature changes

Create feature branches from the latest `origin/codex/preview`. Open PRs against
`codex/preview`; GitHub selects that base by default. Both the **Promotion policy**
and **Build and test** checks must pass. The build check runs authentication and
core project/homepage regressions, TypeScript and the optimized Next.js build.
It uses no deployment credentials or live databases.

Merge the feature PR when ready. Netlify rebuilds the integration branch at the
same fixed URL. A feature PR's own Deploy Preview remains useful for reviewing
that change separately.

## Production releases

1. Wait for the `codex/preview` branch deploy to succeed. Check the affected pages
   and flows at the fixed preview URL, and note the tested commit in the PR.
2. Open a PR with base `main` and head `codex/preview` in this repository. Group
   all ready features in that release. New preview commits also update an open
   release PR, so recheck the final commit before merging.
3. Wait for both required checks and resolve review conversations. Only preview
   may be the source branch for a production PR; direct feature PRs fail the
   promotion check.
4. Use **Create a merge commit**. The production rule allows only that merge
   method, preserving the shared ancestry of these long-lived branches. Do not
   squash a release or delete/reset the preview branch afterward.
5. Netlify rebuilds `main` with production settings. Check the production deploy
   and affected flows after it finishes.

Both branches require PRs and passing checks, and block force pushes and deletion.
No additional reviewer is mandatory, so the owner can operate this flow alone.
These rules apply to administrators too. Administrators can edit the rules in
repository settings when an exceptional recovery is required; document that
exception rather than bypassing the normal flow silently.

## Data and configuration

Production and preview keep separate OAuth credentials, session keys and database
contexts. A release promotes code; it does not copy preview records into the
production database. Review database migrations for production compatibility
before releasing. The fixed preview callback is
`https://codex-preview--hackbarna.netlify.app/auth/callback`.

Netlify can build both `main` and `codex/preview`; changing GitHub's default branch
does not change the configured production branch. Keep production credentials
scoped to production, and give preview credentials only to reviewed code.

## Recovery and hotfixes

Route hotfix PRs through preview, then open a release PR as usual. Revert a bad
change through a feature PR into preview and promote the revert to main. If a
temporary Netlify rollback is needed, reconcile it with Git afterward; a later
Git deploy otherwise restores the branch's current code.

If main ever receives an authorised exceptional change, merge main back into
preview through a PR before the next release. Normal merge-commit releases do
not need branch resets or force pushes.

## Current CI boundary

The broader historical-import test suite has an existing Skill-a-thon assertion
that expects LinkedIn as a primary link where current data selects GitHub. It is
outside this workflow change. The required CI explicitly runs the established
authentication and core project/homepage regression suites above; it does not
claim that every historical-import test passes.
