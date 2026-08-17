# Project progress

## Completed

- Phase 0B cloud Builder capability proof completed; its smoke-test PR #1 was closed unmerged.
- Phase 0C cloud-native project foundation was accepted and squash-merged to `main`.
- Phase 0D Playwright Chromium browser QA and responsive screenshot artifacts were accepted and squash-merged to `main`.
- Phase 0E Cloudflare Pages Direct Upload PR-preview deployment was accepted and squash-merged to `main`.
- Phase 1A framework-independent comparison engine, project-owned result types, and Vitest gate were accepted and squash-merged to `main`.
- Phase 1B comparator interface was accepted and squash-merged into `main`; the Phase 1B documentation closeout established the authoritative Phase 1C baseline `5a15f5b87734818f44991c8995ab84b48c189024`.
- The accepted Phase 1B includes working Original/Changed comparison UI, line/inline rendering, ignore options, Swap/Clear, stale-result handling, responsive presentation, dark-default Dark/Light theming, theme-only persistence, self-hosted Geist typography, the precision developer/editor visual system, the layered CSS technical canvas, browser/screenshot QA, and transient compared-text privacy.
- Post-closeout GitHub Actions run `32041305660` completed successfully on `main`: `Verify project` success, `Browser QA` success, and `Deploy Cloudflare preview` skipped on `main` as intended.

## Current

- Phase 1C Copy + Export is implemented on `phase-1c/copy-export` / Draft PR #8 and remains unaccepted/unmerged.
- `src/core/export/` serializes the project-owned `ComparisonResult` into deterministic unified-diff and plain-text report strings without importing JsDiff, rerunning comparison, or using browser APIs.
- The comparator exposes exactly three result actions after a comparison: Copy diff, Download .diff, and Download .txt. Clipboard writing is explicit/user-initiated; downloads use local transient Blob/object-URL mechanics.
- Result option state is snapshotted transiently at Compare time for report generation. Compared text, results, option snapshots, export strings, and export feedback are not persisted or transmitted.
- Stale visible results keep all three export actions visible but disabled until Compare refreshes the comparison. Swap/Clear remove the result and therefore remove the actions.
- The implementation-head verification run `32042795012` passed 58/58 unit tests and 31/31 browser tests, deployed the exact head preview, and produced ten Dark/Light screenshot artifacts. Builder visual review found no clipping, overflow, overcrowding, theme/Geist/canvas regression, or disproportionate result-action styling.
- Source/privacy/dependency review confirms the comparison engine and package manifests remain unchanged; application clipboard access is write-only; no export persistence, sharing, telemetry, analytics, or application fetch/XHR path was added.
- Final handoff documentation is now committed. The resulting exact PR head must complete a fresh permanent Verify → Browser QA → Cloudflare preview run before Builder completion is reported.
- Android Copy/Download QA remains pending. Merge approval remains pending after Orchestrator review and user QA.

## Next

- Verify the exact final docs-inclusive PR head with the complete permanent GitHub Actions chain.
- Inspect the final ten Dark/Light screenshot artifact files and confirm the final docs-only mutation did not change rendered output.
- Verify final Cloudflare immutable URL, stable `pr-8` alias, HTTP/noindex checks, and raw full-head provenance.
- Orchestrator independently reviews source/diff, serializer semantics, privacy/source audit, CI, screenshots, and preview provenance.
- User performs Android Copy/Download QA.
- Merge only after separate explicit acceptance and authorization.

## Known issues

- npm reports informational `allow-scripts` warnings for some transitive install scripts during `npm ci`; verification continues to complete successfully.
- Wrangler can print `fatal: bad object <real PR head>` in the shallow synthetic PR-merge checkout used for PR preview deployment; deployment and raw Cloudflare provenance verification still succeed against the explicit full real head SHA. This is a preview-pipeline quirk, not a Phase 1C blocker.
- The official upstream Geist OFL text contains one incidental trailing space; the repository copy removes that trailing whitespace so permanent `git diff --check` remains green. License wording is unchanged, and the two WOFF2 binaries remain exact upstream bytes.

## Deferred / future

- Input file import/upload and drag/drop.
- Additional copy/export formats, per-side/per-row copy, and filename customization.
- SEO/static explanatory content and FAQ expansion.
- Production Cloudflare deployment and `compare.amosfot.in` custom-domain/DNS activation.
- Analytics and advertising.
- Backend, accounts, and authentication.
- Compared-text persistence/history and URL sharing unless explicitly reconsidered.
