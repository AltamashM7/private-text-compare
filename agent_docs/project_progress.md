# Project progress

## Completed

- Phase 0B cloud Builder capability proof completed; its smoke-test PR #1 was closed unmerged.
- Phase 0C cloud-native project foundation was accepted and squash-merged to `main`.
- Phase 0D Playwright Chromium browser QA and responsive screenshot artifacts were accepted and squash-merged to `main`.
- Phase 0E Cloudflare Pages Direct Upload PR-preview deployment was accepted and squash-merged to `main`.
- Phase 1A framework-independent comparison engine, project-owned result types, and Vitest gate were accepted and squash-merged to `main`.
- Phase 1B comparator interface was accepted and squash-merged; its documentation closeout established the Phase 1C starting baseline `5a15f5b87734818f44991c8995ab84b48c189024`.
- Phase 1C Copy + Export was accepted after Orchestrator review and Android Copy/Download QA, and PR #8 was squash-merged to `main` at `34109ee432372f2e806f4e70d4aa79a97aad1cfc`.
- The accepted Phase 1C adds local Copy diff, local `.diff` download, and local plain-text report download through framework-independent serializers that consume the project-owned `ComparisonResult` without rerunning JsDiff.
- Phase 1C preserves the privacy boundary: compared text, results, option snapshots, and generated export content remain transient and client-side; application clipboard access is write-only and user-initiated; no analytics, telemetry, backend, accounts, persistence, URL sharing, ads, or production deployment were added.
- Post-merge GitHub Actions run `32048962053` completed successfully on accepted `main`: `Verify project` success, `Browser QA` success, and `Deploy Cloudflare preview` skipped on `main` as intended.

## Current

- Phase 1C is finished and accepted.
- `main` at `34109ee432372f2e806f4e70d4aa79a97aad1cfc` is the clean accepted baseline for the next substantive phase.
- The current application remains static-first, client-side for compared-text processing/export, and free of backend/accounts/analytics/ads/persistence.
- No Phase 1D implementation has started.

## Next

- Phase 1D — launch/SEO readiness.
- At a high level, Phase 1D is expected to address useful static explanatory content, a privacy explanation, FAQ, metadata/canonical/social metadata where appropriate, robots/sitemap/indexability behavior, semantic/accessibility review, and SEO/performance/browser QA.
- The detailed Phase 1D implementation contract will be defined separately before any product changes begin.

## Known issues

- npm reports informational `allow-scripts` warnings for some transitive install scripts during `npm ci`; verification continues to complete successfully.
- Wrangler can print `fatal: bad object <real PR head>` in the shallow synthetic PR-merge checkout used for PR preview deployment; deployment and raw Cloudflare provenance verification still succeed against the explicit full real head SHA. This is a preview-pipeline quirk rather than an application blocker.
- The official upstream Geist OFL text contains one incidental trailing space; the repository copy removes that trailing whitespace so permanent `git diff --check` remains green. License wording is unchanged, and the two WOFF2 binaries remain exact upstream bytes.

## Deferred / future

- Input file import/upload and drag/drop.
- Additional copy/export formats, per-side/per-row copy, and filename customization.
- Production Cloudflare deployment and `compare.amosfot.in` custom-domain/DNS activation.
- Analytics and advertising.
- Backend, accounts, and authentication.
- Compared-text persistence/history and URL sharing unless explicitly reconsidered.
