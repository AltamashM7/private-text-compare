# Project overview

Private Text Compare is a privacy-first, client-side text comparison and diff checker for people who need to quickly inspect differences between two pieces of text without creating an account or sending the compared content to an application backend.

## Product intent

The accepted MVP is an immediate-use comparison tool with a focused interface. Compared text is processed client-side and is not persisted by default. The project remains static-first so it can stay simple, fast, indexable, and inexpensive to operate.

Potential users include writers, editors, developers, students, reviewers, and anyone checking revisions or copied text. Privacy remains a core constraint. Advertising, analytics SDKs, tracking pixels, and behavioral tracking are not part of the current product.

## Current state

Accepted through Phase 1E-A:

- responsive Original/Changed comparison with line- and inline-level diff presentation;
- ignore-case and ignore-surrounding-whitespace options, Swap, Clear, and stale-result safety;
- framework-independent comparison and export logic under `src/core/`;
- local Copy diff, `.diff` download, and plain-text report download actions;
- client-side-only handling of compared text, results, option snapshots, and generated export content;
- responsive dark-default Dark/Light presentation with self-hosted Geist typography;
- static launch guidance plus deterministic canonical, social, WebSite JSON-LD, favicon, robots, and sitemap metadata;
- permanent GitHub Actions verification with Vitest and Playwright Browser QA;
- gated Cloudflare Pages Direct Upload previews for same-repository pull requests;
- production host `https://textcompare.amosfot.in/` and a reviewed exact-current-main Cloudflare Pages production-release path with full provenance, Pages-domain activation, and live indexability gates.

Accepted Phase 1E-A main is `6052bf91886458f8e4dd0fa7a8cd3e5ee94ccedf`. Phase 1E-A prepared production release but did not itself deploy production, activate the custom domain, or alter DNS.

Phase 1E-A2 is the current review-only work. It retains `workflow_dispatch(target_sha)` as a fallback and adds a connector-operable GitHub `create` trigger using retry-safe release refs `release/production/<EXACT_CURRENT_MAIN_SHA>-r<N>`. Both entry points share one dependency-free resolver, require actor `AltamashM7`, and must prove the resolved target is still exact current `origin/main` before verification and again immediately before deployment.

Valid production attempts also publish GitHub Commit Status context `production/private-text-compare` against the exact target SHA with the exact Actions run URL. This receipt lets the Orchestrator discover and inspect a release run through the connected GitHub interface without requiring the user to provide a run ID. Only the status writer jobs receive `statuses: write`; no `contents: write` is granted.

Phase 1E-A2 does not itself create a release trigger branch, run `workflow_dispatch`, deploy production, activate `textcompare.amosfot.in`, or modify DNS. Phase 1E is not complete until a later explicitly approved exact-current-main release succeeds and the live production domain passes provenance, domain ACTIVE, HTTPS, canonical, crawling, and indexability verification.
