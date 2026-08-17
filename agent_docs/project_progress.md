# Project progress

## Completed

- Phase 0B cloud Builder capability proof completed; its smoke-test PR #1 was closed unmerged.
- Phase 0C cloud-native project foundation was accepted and squash-merged to `main`.
- Phase 0D Playwright Chromium browser QA and responsive screenshot artifacts were accepted and squash-merged to `main`.

## Current

- Phase 0E is establishing the first Cloudflare Pages Direct Upload preview path for same-repository pull requests after normal verification and Browser QA.
- The goal is to prove a real preview deployment, immutable URL, stable `pr-<number>` alias, live HTTP content verification, `X-Robots-Tag: noindex`, and Android-accessible manual QA without enabling production deployment.
- Product implementation has not started.

## Next

- Orchestrator independent review of the Phase 0E Draft PR, lockfile provenance, CI/deployment logs, Cloudflare metadata, live preview, and noindex behavior.
- User Android manual QA against the stable preview alias.
- Production deployment and `compare.amosfot.in` activation remain separately deferred/gated.
- Product implementation only after its later explicitly approved phase.

## Known issues

- npm reports informational `allow-scripts` warnings for transitive install scripts during `npm ci`; lock generation, install, check, and build complete successfully.

## Deferred / future

- Text comparison logic and product UI.
- Unit testing framework.
- Additional browser/product-specific QA beyond the foundation smoke suite.
- Accessibility-scanner automation.
- Production Cloudflare deployment and custom-domain/DNS activation.
- Analytics, advertising, backend, accounts, and authentication.
