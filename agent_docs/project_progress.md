# Project progress

## Completed

- Phase 0B cloud Builder capability proof completed; its smoke-test PR #1 was closed unmerged.
- Phase 0C cloud-native project foundation was accepted and squash-merged to `main`.
- Phase 0D Playwright Chromium browser QA and responsive screenshot artifacts were accepted and squash-merged to `main`.
- Phase 0E Cloudflare Pages Direct Upload PR-preview deployment was accepted and squash-merged to `main`.
- Phase 1A framework-independent comparison engine, project-owned result types, and Vitest gate were accepted and squash-merged to `main`.

## Current

- Phase 1B delivers the first usable Private Text Compare interface as a focused Preact island over the Phase 1A `compareTexts` API.
- Current scope includes Original/Changed inputs, Compare, both approved ignore options, Swap, Clear, line/inline result rendering, statistics, responsive behavior, accessibility fundamentals, real-product Playwright flows, and responsive screenshots.
- Compared text remains transient component state only.

## Next

- Orchestrator independent review of the Phase 1B Draft PR, browser interactions, screenshots, privacy boundaries, CI, and Cloudflare preview.
- User Android manual QA against the stable PR preview alias.
- After acceptance, proceed only to the next explicitly approved product phase.

## Known issues

- npm reports informational `allow-scripts` warnings for some transitive install scripts during `npm ci`; existing verification continues to complete successfully.

## Deferred / future

- Copy-result and unified-diff/text-file export.
- Local persistence/history and URL sharing.
- SEO article/FAQ expansion.
- Production Cloudflare deployment and `compare.amosfot.in` custom-domain/DNS activation.
- Analytics, advertising, backend, accounts, and authentication.
