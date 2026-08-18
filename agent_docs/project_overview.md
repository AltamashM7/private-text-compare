# Project overview

Private Text Compare is a privacy-first, client-side text comparison and diff checker for people who need to quickly inspect differences between two pieces of text without creating an account or sending the compared content to an application backend.

## Product intent

The accepted MVP is an immediate-use comparison tool with a focused interface. Compared text is processed client-side and is not persisted by default. The project remains static-first so it can stay simple, fast, indexable, and inexpensive to operate.

Potential users include writers, editors, developers, students, reviewers, and anyone checking revisions or copied text. Privacy remains a core constraint. Advertising, analytics SDKs, tracking pixels, and behavioral tracking are not part of the current product.

## Current state

Accepted through Phase 1D:

- responsive Original/Changed comparison with line- and inline-level diff presentation;
- ignore-case and ignore-surrounding-whitespace options, Swap, Clear, and stale-result safety;
- framework-independent comparison and export logic under `src/core/`;
- local Copy diff, `.diff` download, and plain-text report download actions;
- client-side-only handling of compared text, results, option snapshots, and generated export content;
- responsive dark-default Dark/Light presentation with self-hosted Geist typography;
- static launch guidance plus deterministic canonical, social, WebSite JSON-LD, favicon, robots, and sitemap metadata;
- permanent GitHub Actions verification with Vitest and Playwright Browser QA;
- gated Cloudflare Pages Direct Upload previews for same-repository pull requests.

Phase 1E is the current release phase. Its approved production hostname is `https://textcompare.amosfot.in/`; the earlier `https://compare.amosfot.in/` plan was never activated and is superseded. Phase 1E-A prepares a manually gated exact-current-main Cloudflare Pages Direct Upload release path and Pages custom-domain verification path, but does not itself deploy production, activate a domain, or change DNS.

Phase 1E is not complete until a later accepted main SHA is deliberately released through the manual gate and the live production domain passes provenance, HTTPS, canonical, crawling, and indexability verification.
