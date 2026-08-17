# Project progress

## Completed

- Phase 0B cloud Builder capability proof completed; its smoke-test PR #1 was closed unmerged.
- Phase 0C cloud-native project foundation was accepted and squash-merged to `main`.
- Phase 0D Playwright Chromium browser QA and responsive screenshot artifacts were accepted and squash-merged to `main`.
- Phase 0E Cloudflare Pages Direct Upload PR-preview deployment was accepted and squash-merged to `main`.

## Current

- Phase 1A is implementing the first real framework-independent text comparison domain engine under `src/core/`.
- The Phase 1A contract covers line-level matching, positional changed-line pairing, inline segments, ignore-case and ignore-surrounding-whitespace options, newline normalization, statistics, and deterministic Vitest verification.
- The visual scaffold remains unchanged; comparator UI is not part of Phase 1A.

## Next

- Orchestrator independent review of the Phase 1A Draft PR, core contract, tests, lockfile provenance, CI, and unchanged preview page.
- Phase 1B interactive Preact comparator UI after Phase 1A acceptance.

## Known issues

- npm reports informational `allow-scripts` warnings for some transitive install scripts during `npm ci`; prior lock generation, install, checks, builds, browser QA, and previews complete successfully.

## Deferred / future

- Interactive comparator UI, textareas, controls, result rendering, copy/export, and local storage.
- SEO expansion.
- Production Cloudflare deployment and `compare.amosfot.in` custom-domain/DNS activation.
- Analytics, advertising, backend, accounts, and authentication.
