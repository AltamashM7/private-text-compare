# Project progress

## Completed

- Phase 0B cloud Builder capability proof completed; its smoke-test PR #1 was closed unmerged.
- Phase 0C cloud-native project foundation was accepted and squash-merged to `main`.
- Phase 0D Playwright Chromium browser QA and responsive screenshot artifacts were accepted and squash-merged to `main`.
- Phase 0E Cloudflare Pages Direct Upload PR-preview deployment was accepted and squash-merged to `main`.
- Phase 1A framework-independent comparison engine, project-owned result types, and Vitest gate were accepted and squash-merged to `main`.
- Phase 1B comparator interface was accepted and squash-merged into `main` at `3a5597d6188ccbf754ac3b1bff2c899f44874114`.
- The accepted Phase 1B includes:
  - working Original / Changed comparison UI;
  - line- and inline-level comparison rendering;
  - ignore-case;
  - ignore-surrounding-whitespace;
  - Swap;
  - Clear;
  - stale-result handling;
  - responsive desktop/mobile presentation;
  - dark-default Dark/Light theming;
  - theme-only localStorage persistence;
  - self-hosted Geist Sans and Geist Mono from pinned `vercel/geist-font` tag `v1.7.1`;
  - restrained precision developer/editor visual system;
  - layered CSS technical canvas;
  - browser QA and ten responsive Dark/Light screenshot variants;
  - privacy boundary preserving transient compared text and results.
- Post-merge GitHub Actions run `32026858819` completed successfully on merged `main`:
  - `Verify project`: success;
  - `Browser QA`: success;
  - `Deploy Cloudflare preview`: skipped on `main` as intended.

## Current

- Phase 1B is finished.
- `main` at `3a5597d6188ccbf754ac3b1bff2c899f44874114` is the clean baseline for the next product phase.
- No Phase 1C implementation has started yet.
- The accepted privacy contract remains unchanged: only the non-sensitive `private-text-compare-theme` preference may persist; compared text, results, and comparison history remain transient.

## Next

- Phase 1C is planned to add local Copy + Export functionality.
- The Orchestrator will provide the exact Phase 1C implementation contract separately after this documentation closeout is merged.

## Known issues

- npm reports informational `allow-scripts` warnings for some transitive install scripts during `npm ci`; existing verification continues to complete successfully.
- Wrangler can print `fatal: bad object <real PR head>` in the shallow synthetic PR-merge checkout used for PR preview deployment; deployment and raw Cloudflare provenance verification still succeed against the explicit full real head SHA. This is a preview-pipeline quirk, not a Phase 1B blocker.
- The official upstream OFL text contains one incidental trailing space; the repository copy removes that trailing whitespace so permanent `git diff --check` remains green. The license wording is unchanged, and the two WOFF2 binaries remain exact upstream bytes.

## Deferred / future

- SEO/static explanatory content and FAQ expansion.
- Production Cloudflare deployment and `compare.amosfot.in` custom-domain/DNS activation.
- Analytics and advertising.
- Backend, accounts, and authentication.
- Compared-text persistence/history and URL sharing unless explicitly reconsidered.
