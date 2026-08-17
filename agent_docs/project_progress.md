# Project progress

## Completed

- Phase 0B cloud Builder capability proof completed; its smoke-test PR #1 was closed unmerged.
- Phase 0C cloud-native project foundation was accepted and squash-merged to `main`.
- Phase 0D Playwright Chromium browser QA and responsive screenshot artifacts were accepted and squash-merged to `main`.
- Phase 0E Cloudflare Pages Direct Upload PR-preview deployment was accepted and squash-merged to `main`.
- Phase 1A framework-independent comparison engine, project-owned result types, and Vitest gate were accepted and squash-merged to `main`.
- Phase 1B functional comparator implementation passed technical review and the user's first Android functional QA.

## Current

- Draft PR #6 remains the active Phase 1B branch and is undergoing the user-approved visual correction before acceptance/merge.
- The visual correction replaces the initial generic card/dashboard treatment with a precision developer-editor interface, shared Original/Changed workspace, compact diff editor, restrained semantic highlighting, and a dark-default Dark/Light theme system.
- The only new persisted state is the non-sensitive theme preference `private-text-compare-theme`; compared text and comparison result state remain transient and clear on reload.
- Browser QA now verifies functional flows, theme behavior/privacy boundaries, and Dark + Light screenshots at all five standard viewports.

## Next

- Complete final-head GitHub Actions, screenshot, privacy, and Cloudflare preview verification on PR #6.
- Orchestrator independently reviews the updated Phase 1B diff, theme persistence boundary, CI, all ten screenshots, and preview.
- User performs a second Android QA focused on the redesigned visual experience and both themes.
- Merge only after explicit acceptance and authorization.

## Known issues

- npm reports informational `allow-scripts` warnings for some transitive install scripts during `npm ci`; existing verification continues to complete successfully.
- Wrangler can print `fatal: bad object <real PR head>` in the shallow synthetic PR-merge checkout; deployment and raw Cloudflare provenance verification still succeed against the explicit full real head SHA.

## Deferred / future

- Copy-result and unified-diff/text-file export.
- Compared-text persistence/history and URL sharing.
- SEO article/FAQ expansion.
- Production Cloudflare deployment and `compare.amosfot.in` custom-domain/DNS activation.
- Analytics, advertising, backend, accounts, and authentication.
