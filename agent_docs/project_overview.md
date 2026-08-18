# Project overview

Private Text Compare is a privacy-first, client-side text comparison and diff checker for people who need to quickly inspect differences between two pieces of text without creating an account or sending the compared content to an application backend.

## Product intent

The accepted MVP is an immediate-use comparison tool with a focused interface. Compared text is processed client-side and is not persisted by default. The project remains static-first so it can stay simple, fast, indexable, and inexpensive to operate.

Potential users include writers, editors, developers, students, reviewers, and anyone checking revisions or copied text. Privacy remains a core constraint. Advertising, analytics SDKs, tracking pixels, and behavioral tracking are not part of the current product.

## Current state

Phase 1E production launch is complete and accepted. Private Text Compare is live at `https://textcompare.amosfot.in/`.

The accepted MVP includes:

- responsive Original/Changed comparison with line- and inline-level diff presentation;
- ignore-case and ignore-surrounding-whitespace options, Swap, Clear, and stale-result safety;
- framework-independent comparison and export logic under `src/core/`;
- local Copy diff, `.diff` download, and plain-text report download actions;
- client-side-only handling of compared text, results, option snapshots, and generated export content;
- responsive dark-default Dark/Light presentation with self-hosted Geist typography;
- static launch guidance plus deterministic canonical, social, `WebSite` JSON-LD, favicon, robots, and sitemap metadata;
- permanent GitHub Actions verification with Vitest and Playwright Browser QA;
- gated Cloudflare Pages Direct Upload previews for same-repository pull requests, with preview noindex protection;
- an explicit exact-current-main Cloudflare Pages production-release path with full provenance, Pages-domain ACTIVE verification, live crawler/indexability gates, and connector-readable release receipts.

Accepted production code at launch is exact main `c500ef51ebe749cb5efff369174e10417cd0a871`. The authoritative successful production release is Actions run `32136540410`, deployment ID `0ea179a9-74bf-4ee1-bf17-a9d4286a541c`, immutable URL `https://0ea179a9.private-text-compare.pages.dev`. The custom production domain passed the full live verification gate and the user subsequently reported `android production QA passed.`

Production release remains deliberate rather than automatic. The preferred connector-operable trigger is `release/production/<FULL_SHA>-r<N>` and `workflow_dispatch(target_sha)` remains the fallback. Both routes must resolve and reconfirm the exact current `origin/main` SHA. Release attempts publish commit-status context `production/private-text-compare` against the exact target SHA.

Production DNS remains manually managed to preserve least privilege. `textcompare.amosfot.in` uses a proxied CNAME `textcompare -> private-text-compare.pages.dev`; the deployment token remains Pages-scoped and was not granted DNS Write. Cloudflare Managed robots.txt is disabled for this deployment arrangement so repository `public/robots.txt` remains authoritative and is checked by production release verification. The old `compare.amosfot.in` plan remains superseded and must not be introduced.

MVP functionality through production launch is complete. Analytics and advertising remain unimplemented. File import, backend/accounts/authentication, compared-text history/persistence, and URL sharing remain deferred unless separately scoped and explicitly approved.
