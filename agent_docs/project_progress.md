# Project progress

## Completed

- Phase 0B cloud Builder capability proof completed; its smoke-test PR #1 was closed unmerged.
- Phase 0C cloud-native project foundation was accepted and squash-merged to `main`.
- Phase 0D Playwright Chromium browser QA and responsive screenshot artifacts were accepted and squash-merged to `main`.
- Phase 0E Cloudflare Pages Direct Upload PR-preview deployment was accepted and squash-merged to `main`.
- Phase 1A framework-independent comparison engine, project-owned result types, and Vitest gate were accepted and squash-merged to `main`.
- Phase 1B comparator interface was accepted and squash-merged into `main`; the Phase 1B documentation closeout then established authoritative Phase 1C baseline `5a15f5b87734818f44991c8995ab84b48c189024`.
- The accepted Phase 1B includes working Original/Changed comparison UI, line/inline rendering, ignore options, Swap/Clear, stale-result handling, responsive presentation, dark-default Dark/Light theming, theme-only persistence, self-hosted Geist typography, the precision developer/editor visual system, the layered CSS technical canvas, browser/screenshot QA, and transient compared-text privacy.
- Post-closeout GitHub Actions run `32041305660` completed successfully on `main`: `Verify project` success, `Browser QA` success, and `Deploy Cloudflare preview` skipped on `main` as intended.

## Current

- Phase 1C Copy + Export is active on `phase-1c/copy-export` / Draft PR #8.
- `src/core/export/` serializes the project-owned `ComparisonResult` into deterministic unified-diff and plain-text report strings without importing JsDiff or browser APIs.
- The comparator exposes three result actions only when a result exists: Copy diff, Download .diff, and Download .txt. Clipboard writes are explicit/user-initiated; downloads are local Blob downloads.
- Result option state is snapshotted transiently at Compare time for report generation. No export payload or option snapshot is persisted.
- Stale visible results keep all three export actions visible but disabled until Compare refreshes the result. Swap/Clear remove the result and therefore remove the actions.
- Browser coverage for exact clipboard/download payloads, stale safety, storage/network behavior, and Swap/Clear is being verified together with all existing browser tests and responsive screenshots.
- Phase 1C remains unaccepted. Android Copy/Download QA and merge approval remain pending after Builder and Orchestrator verification.

## Next

- Complete permanent final-head GitHub Actions verification and Cloudflare PR preview for PR #8.
- Inspect all ten Dark/Light screenshot artifacts for export-control integration at desktop/tablet/mobile portrait/mobile landscape sizes.
- Orchestrator independently reviews source/diff, serializer semantics, privacy/source audit, CI, screenshots, and preview provenance.
- User performs Android Copy/Download QA.
- Merge only after explicit acceptance and authorization.

## Known issues

- npm reports informational `allow-scripts` warnings for some transitive install scripts during `npm ci`; existing verification continues to complete successfully.
- Wrangler can print `fatal: bad object <real PR head>` in the shallow synthetic PR-merge checkout used for PR preview deployment; deployment and raw Cloudflare provenance verification still succeed against the explicit full real head SHA. This is a preview-pipeline quirk, not a Phase 1C blocker.
- The official upstream OFL text contains one incidental trailing space; the repository copy removes that trailing whitespace so permanent `git diff --check` remains green. The license wording is unchanged, and the two WOFF2 binaries remain exact upstream bytes.

## Deferred / future

- Input file import/upload and drag/drop.
- Additional copy/export formats, per-side/per-row copy, and filename customization.
- SEO/static explanatory content and FAQ expansion.
- Production Cloudflare deployment and `compare.amosfot.in` custom-domain/DNS activation.
- Analytics and advertising.
- Backend, accounts, and authentication.
- Compared-text persistence/history and URL sharing unless explicitly reconsidered.
