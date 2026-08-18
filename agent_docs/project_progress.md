# Project progress

## Completed

- Phase 0B cloud Builder capability proof completed; its smoke-test PR #1 was closed unmerged.
- Phase 0C cloud-native project foundation was accepted and squash-merged to `main`.
- Phase 0D Playwright Chromium browser QA and responsive screenshot artifacts were accepted and squash-merged to `main`.
- Phase 0E Cloudflare Pages Direct Upload PR-preview deployment was accepted and squash-merged to `main`.
- Phase 1A framework-independent comparison engine, project-owned result types, and Vitest gate were accepted and squash-merged to `main`.
- Phase 1B comparator interface was accepted and squash-merged; its documentation closeout established the Phase 1C starting baseline `5a15f5b87734818f44991c8995ab84b48c189024`.
- Phase 1C Copy + Export was accepted after Orchestrator review and Android Copy/Download QA, and PR #8 was squash-merged to `main`.
- The Phase 1C documentation closeout was accepted and squash-merged, establishing the Phase 1D starting baseline `f60069455d85cb8d8be9eb1c85896fff7d249f25`.
- Post-closeout GitHub Actions run `32053292530` completed successfully on that exact `main` commit.

## Current

- Phase 1D — Launch / SEO Readiness is implemented on `phase-1d/launch-seo-readiness` / Draft PR #10 and remains unaccepted/unmerged.
- Starting Phase 1D baseline: `f60069455d85cb8d8be9eb1c85896fff7d249f25`.
- Verified Phase 1D implementation head: `2bf8387389d3869bf2ac77a78d40d3ab033da48c`.
- Final implementation-head GitHub Actions run `32055826893` completed successfully: Verify project success, Browser QA success, and Deploy Cloudflare preview success.
- Unit tests: 58/58 passed. Browser tests: 41/41 passed.
- Screenshot artifact `9296383518` contains 14 files: the existing 10 comparator captures plus 4 Phase 1D launch-content captures.
- Cloudflare immutable preview: `https://a025e542.private-text-compare.pages.dev`; PR alias: `https://pr-10.private-text-compare.pages.dev`.
- Cloudflare deployment ID: `a025e542-0df9-4d96-b54a-a38dacc11eb3`; raw deployment provenance verified the full implementation head `2bf8387389d3869bf2ac77a78d40d3ab033da48c` on preview branch `pr-10`.
- Live preview verification passed with HTTP 200 and `X-Robots-Tag: noindex`.
- The comparator remains the primary experience; new static How it works, Private by design, common-use, and FAQ content sits below the tool and adds no hydrated island.
- Astro now has the planned build-time production site `https://compare.amosfot.in`, which drives canonical/social URLs without activating production or DNS.
- Static launch metadata includes canonical, Open Graph, Twitter summary metadata, one `WebSite` JSON-LD object, and a local SVG favicon.
- Static `robots.txt` allows crawling and points to the production sitemap; `sitemap.xml` lists only the canonical homepage. PR previews remain protected by the existing Cloudflare `X-Robots-Tag: noindex` header.
- Focused Playwright coverage validates SEO metadata, structured data, semantic content, hydration/runtime-network boundaries, favicon/robots/sitemap responses, and four additional launch-content screenshots.
- No comparison/export core behavior, dependency, persistence, analytics/tracking, backend/account, CI workflow, production deployment, or custom-domain activation has been added.
- Production was not deployed. `compare.amosfot.in` remains inactive and no custom-domain/DNS activation has occurred.

## Next

- This documentation-only correction must pass the normal fresh final-head Verify → Browser QA → Cloudflare PR preview chain.
- Orchestrator verifies the documentation-only correction.
- Android/manual QA is performed only if requested by the Orchestrator.
- Phase 1D may proceed to merge only after explicit user approval.
- Squash-merge PR #10 only after that approval, then perform post-merge verification.
- Do not mark Phase 1D Completed before those acceptance steps are finished.

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
