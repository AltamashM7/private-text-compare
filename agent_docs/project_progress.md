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
- Final reviewed Phase 1D PR head `f500a8da340df2ade313e2c338fbb2b893a07fd2` passed run `32058578434`: Verify project job `95474316934` success, Browser QA job `95474444110` success, Deploy Cloudflare preview job `95474822433` success; 58/58 unit tests and 41/41 browser tests passed, and screenshot artifact `9297308830` contained 14 files.
- That final-head preview was `https://0a970779.private-text-compare.pages.dev` with deployment ID `0a970779-41cc-4449-ae00-bf01f232d076`; raw Cloudflare metadata proved the full final PR SHA on branch `pr-10`, and live verification passed HTTP 200 with `X-Robots-Tag: noindex`.
- The historical post-merge Phase 1D push-run ID is not independently retrievable through the Builder/Orchestrator connector interface; no run ID is invented or presented as verified for that event.

## Current

- Phase 1E — Production Release is current.
- Phase 1E-A is implemented for review on `phase-1e/production-release` / Draft PR #11 and is not accepted or merged.
- Starting Phase 1E-A baseline: accepted Phase 1D `main` `143fa60471f44b4b7c200b933580c3737896ceb3`.
- Production canonical host is `https://textcompare.amosfot.in/`. The earlier `https://compare.amosfot.in/` host was planned only, never activated, and is superseded; there is no legacy URL to migrate or redirect.
- Phase 1E-A prepares a manual `workflow_dispatch` release mechanism requiring an exact reviewed current-main `target_sha`. Pull requests and normal main pushes cannot run the production job.
- The prepared production path keeps Cloudflare Pages Direct Upload, verifies full deployment provenance from raw Cloudflare API metadata, then uses the Pages Custom Domain API idempotently and waits for `textcompare.amosfot.in` to become ACTIVE before live production/indexability checks.
- No direct DNS mutation, broader Cloudflare permissions, Cloudflare Git integration, dependency change, production deployment, or custom-domain activation is part of Phase 1E-A PR execution.
- Fresh PR #11 Verify → Browser QA → Cloudflare PR preview success is the required authoritative verification gate for the accepted Phase 1D tree plus the bounded Phase 1E-A changes. The production job must be skipped on the PR.

## Next

- Complete and inspect the exact final-head PR #11 verification chain and screenshot artifact.
- Orchestrator independently reviews PR #11. Do not mark ready or merge without separate explicit authorization.
- Phase 1E-A acceptance/merge still does not launch production.
- After an accepted Phase 1E-A merge, a later deliberate `workflow_dispatch` must target the exact current `main` SHA and pass production provenance, Pages-domain ACTIVE, HTTPS, canonical, crawling, and indexability gates.
- Do not mark Phase 1E completed until that exact-main production release and live-domain verification succeeds.

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
