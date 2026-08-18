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
- Phase 1E-A production-release preparation was accepted and squash-merged as PR #11 at `6052bf91886458f8e4dd0fa7a8cd3e5ee94ccedf`.
- Phase 1E-A2 connector-operable release bridge was accepted and squash-merged as PR #12. Accepted launch code / current main at release: `c500ef51ebe749cb5efff369174e10417cd0a871`.
- Phase 1E — Production Release is COMPLETE and accepted. The authoritative successful release is create-event run `32136540410` from `release/production/c500ef51ebe749cb5efff369174e10417cd0a871-r3`.
- Accepted production deployment: ID `0ea179a9-74bf-4ee1-bf17-a9d4286a541c`, immutable URL `https://0ea179a9.private-text-compare.pages.dev`, raw provenance `environment=production`, `branch=main`, commit `c500ef51ebe749cb5efff369174e10417cd0a871`.
- Production hostname `https://textcompare.amosfot.in/` was verified ACTIVE and passed HTTPS 200, product-marker, exact canonical, `WebSite` JSON-LD, repository `robots.txt`, sitemap, and indexability verification. Production carries no HTML or `X-Robots-Tag` noindex.
- Accepted release run Browser QA passed 41/41 tests; its 14-screenshot artifact is `9324239705`, digest `sha256:c9de6841fd722980163b5123f77daec95565cbcef8cd860a3830791ff14c2715`. Verify passed 58/58 unit tests.
- Current commit-status context `production/private-text-compare` reports success for the accepted production SHA and points to run `32136540410`.
- The user subsequently reported `android production QA passed.` Android production QA is therefore included in Phase 1E launch acceptance.

## Production launch operational lessons

- r1 (`32134142784`) successfully deployed and proved exact main, but custom-domain activation remained pending because Cloudflare reported `CNAME record not set`; its final production receipt correctly became failure and it was not accepted. The required production CNAME was then manually created without granting DNS Write to the deployment token.
- r2 (`32135637703`) successfully deployed/proved exact main and verified the custom domain ACTIVE, but live `robots.txt` differed from the repository-owned exact contract; its final receipt correctly became failure. Cloudflare Managed robots.txt was disabled so repository `public/robots.txt` remains authoritative.
- r3 (`32136540410`) passed Verify, Browser QA, pending release receipt, exact production deployment/provenance, domain ACTIVE, full live indexability gates, and final success receipt; it is the accepted launch release.

## Current

- MVP functionality through production launch is complete and live at `https://textcompare.amosfot.in/`.
- Production remains explicit and exact-current-main gated. Preferred trigger: `release/production/<FULL_SHA>-r<N>`; fallback: `workflow_dispatch(target_sha)`.
- Production uses Cloudflare Pages Direct Upload controlled by GitHub Actions. PR previews remain noindex; production is indexable.
- Production DNS is manually managed as a proxied CNAME `textcompare -> private-text-compare.pages.dev`. The deployment token remains Pages-scoped; DNS Write was not added.
- Cloudflare Managed robots.txt is disabled for this deployment arrangement so repository `public/robots.txt` remains the authoritative crawler policy checked by release verification.
- `compare.amosfot.in` remains superseded and must not be introduced.
- No analytics, ads, accounts, backend, or compared-text persistence were introduced by production launch.

## Next

- No new product phase is established by this closeout.
- Future product work must be separately scoped and explicitly approved.
- Preserve the accepted production/privacy/deployment boundaries unless a later approved decision changes them.

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
