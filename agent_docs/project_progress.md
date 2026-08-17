# Project progress

## Completed

- Phase 0B cloud Builder capability proof completed; its smoke-test PR #1 was closed unmerged.
- Phase 0C cloud-native project foundation was accepted and squash-merged to `main`.
- Phase 0D Playwright Chromium browser QA and responsive screenshot artifacts were accepted and squash-merged to `main`.
- Phase 0E Cloudflare Pages Direct Upload PR-preview deployment was accepted and squash-merged to `main`.
- Phase 1A framework-independent comparison engine, project-owned result types, and Vitest gate were accepted and squash-merged to `main`.
- Phase 1B functional comparator implementation passed technical review and the user's first Android functional QA.
- The first Phase 1B visual redesign passed technical/browser verification and established the accepted broad precision developer-editor, dark/light direction.

## Current

- Draft PR #6 remains the active Phase 1B branch. The user requested one further bounded visual refinement before final acceptance: replace system typography with self-hosted Geist Sans/Geist Mono and replace the simple uniform background grid with a layered technical canvas.
- Geist Sans and Geist Mono variable WOFF2 files are vendored from official `vercel/geist-font` tag `v1.7.1`, served same-origin, and accompanied by OFL/provenance documentation. No font package or runtime CDN was added.
- The technical canvas uses a theme-aware 28px minor grid, 112px major grid, aligned intersection nodes, restrained radial illumination, and spatial CSS masks. Mobile portrait/landscape reduce canvas intensity so the comparator remains primary.
- Comparator functionality, comparison semantics, theme persistence, and privacy behavior are unchanged. The only persisted state remains the non-sensitive `private-text-compare-theme`; compared text and results remain transient.
- Browser QA now includes a focused same-origin Geist/font-application test while preserving the existing functional/theme/privacy coverage and all ten Dark/Light responsive screenshots.
- Implementation-head CI, Browser QA, screenshot review, and preview deployment passed for the Geist/technical-canvas correction. Durable documentation and the final docs-inclusive verification cycle remain in progress.

## Next

- Complete final docs-inclusive GitHub Actions, screenshot, privacy/network, and Cloudflare preview verification on PR #6.
- Orchestrator independently reviews exact font provenance/license, absence of third-party runtime font delivery, typography application, technical-canvas CSS, CI, all ten screenshots, and preview.
- User performs the second/final Android visual QA focused on Geist rendering and the refined technical canvas in both themes.
- Merge only after explicit acceptance and authorization.

## Known issues

- npm reports informational `allow-scripts` warnings for some transitive install scripts during `npm ci`; existing verification continues to complete successfully.
- Wrangler can print `fatal: bad object <real PR head>` in the shallow synthetic PR-merge checkout; deployment and raw Cloudflare provenance verification still succeed against the explicit full real head SHA.
- The official upstream OFL text contains one incidental trailing space; the repository copy removes that trailing whitespace so permanent `git diff --check` remains green. The license wording is unchanged, and the two WOFF2 binaries remain exact upstream bytes.

## Deferred / future

- Copy-result and unified-diff/text-file export.
- Compared-text persistence/history and URL sharing.
- SEO article/FAQ expansion.
- Production Cloudflare deployment and `compare.amosfot.in` custom-domain/DNS activation.
- Analytics, advertising, backend, accounts, and authentication.
