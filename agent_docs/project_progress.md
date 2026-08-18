# Project progress

## Completed

- Phase 0B cloud Builder capability proof completed; its smoke-test PR #1 was closed unmerged.
- Phase 0C cloud-native project foundation was accepted and squash-merged to `main`.
- Phase 0D Playwright Chromium browser QA and responsive screenshot artifacts were accepted and squash-merged to `main`.
- Phase 0E Cloudflare Pages Direct Upload PR-preview deployment was accepted and squash-merged to `main`.
- Phase 1A framework-independent comparison engine and Vitest gate were accepted and squash-merged.
- Phase 1B comparator interface was accepted and squash-merged.
- Phase 1C Copy + Export was accepted after Orchestrator review and Android QA, then squash-merged.
- Phase 1D Launch / SEO Readiness was explicitly accepted after final-head source/diff review, successful Verify project, successful Browser QA, successful Cloudflare PR preview with exact full-SHA provenance, responsive screenshot review, Android manual QA, and explicit user merge approval. PR #10 was squash-merged.
- Accepted Phase 1D `main`: `143fa60471f44b4b7c200b933580c3737896ceb3`. The squash commit tree matched the reviewed final PR tree exactly.
- Phase 1E-A production-release preparation was accepted and squash-merged as PR #11.
- Accepted Phase 1E-A `main`: `6052bf91886458f8e4dd0fa7a8cd3e5ee94ccedf`.
- Phase 1E-A established the production host `https://textcompare.amosfot.in/`, exact-current-main `workflow_dispatch` fallback, full Cloudflare production provenance, Pages custom-domain association/ACTIVE polling, and production indexability gates without running a production release.

## Current

- Phase 1E — Production Release remains current and incomplete.
- Phase 1E-A2 is the current review-only bridge work on `phase-1e/release-trigger-bridge`.
- Starting Phase 1E-A2 baseline is accepted Phase 1E-A `main` `6052bf91886458f8e4dd0fa7a8cd3e5ee94ccedf`.
- `workflow_dispatch(target_sha)` remains supported as a fallback release trigger.
- Phase 1E-A2 additionally prepares a connector-operable GitHub `create` trigger using release refs `release/production/<FULL_SHA>-r<N>` with exact actor/ref/SHA validation and fresh current-`origin/main` checks before verification and again immediately before deployment.
- The pure resolver lives at `.github/scripts/resolve-production-target.sh`; its dependency-free contract test invokes the real resolver during normal Verify.
- Valid production attempts publish commit-status context `production/private-text-compare` against the resolved target SHA. The status `target_url` points to the exact Actions run so the Orchestrator connector can discover and inspect the release run without user-supplied run IDs.
- Only status-writing jobs receive `statuses: write`; global workflow permissions remain `contents: read`, and no `contents: write` permission is introduced.
- The accepted Phase 1E-A Cloudflare Pages Direct Upload, full production provenance, Pages-domain, bounded ACTIVE polling, and live indexability logic otherwise remains unchanged.
- Phase 1E-A2 itself must not create a `release/production/...` branch, invoke `workflow_dispatch`, deploy production, associate/activate `textcompare.amosfot.in`, or alter DNS.

## Next

- The A2 Draft PR must pass the normal Verify → Browser QA → Cloudflare PR preview chain on its exact final head.
- Require resolver contract tests, `git diff --check`, `npm ci`, Astro/TypeScript check, 58/58 unit tests, 41/41 browser tests, static build, 14-screenshot artifact, exact full-SHA preview provenance, HTTP 200, and preview `X-Robots-Tag: noindex`.
- Production/status release jobs must be skipped on the A2 PR; no production status may falsely report PR success.
- Orchestrator independently reviews the A2 diff and CI. Do not mark ready or merge without separate explicit authorization.
- After A2 is separately accepted and merged, a later explicit user approval may authorize creation of `release/production/<EXACT_CURRENT_MAIN_SHA>-r1` (or a later retry suffix). Only that later release attempt may deploy production.
- Do not mark Phase 1E completed until an actual exact-current-main production release succeeds and `https://textcompare.amosfot.in/` passes full provenance, domain ACTIVE, HTTPS, canonical, crawling, and indexability verification.

## Known issues

- npm reports informational `allow-scripts` warnings for some transitive install scripts during `npm ci`; verification has continued to complete successfully.
- Wrangler can print `fatal: bad object <real PR head>` in the shallow synthetic PR-merge checkout used for PR preview deployment; raw Cloudflare metadata remains the authoritative full-SHA provenance proof.
- The official upstream Geist OFL text contains one incidental trailing space; the repository copy normalizes that whitespace while preserving the license wording and exact WOFF2 binaries.

## Deferred / future

- Input file import/upload and drag/drop.
- Additional copy/export formats, per-side/per-row copy, and filename customization.
- Analytics and advertising.
- Backend, accounts, and authentication.
- Compared-text persistence/history and URL sharing unless explicitly reconsidered.
