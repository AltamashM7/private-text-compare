# Project overview

Private Text Compare is a privacy-first, client-side text comparison and diff checker for people who need to quickly inspect differences between two pieces of text without creating an account or sending the compared content to an application backend.

## Product intent

The accepted MVP foundation is an immediate-use comparison tool with a small, focused interface. Compared text is processed client-side and is not persisted by default. The project remains static-first so it can stay simple, fast, indexable, and inexpensive to operate.

Potential users include writers, editors, developers, students, reviewers, and anyone checking revisions or copied text. Launch, discoverability, and future growth work may build on the accepted product foundation, while privacy remains a core constraint. Advertising, analytics SDKs, tracking pixels, and behavioral tracking are not part of the current product.

## Current state

The accepted product foundation includes:

- a working responsive Original/Changed comparator with line- and inline-level diff presentation;
- ignore-case and ignore-surrounding-whitespace options, Swap, Clear, and stale-result safety;
- a framework-independent comparison engine under `src/core/compare/`;
- framework-independent unified-diff and plain-text report serializers under `src/core/export/`;
- local Copy diff, `.diff` download, and plain-text report download actions;
- client-side-only handling of compared text, results, option snapshots, and generated export content;
- a responsive dark-default Dark/Light interface with self-hosted Geist typography;
- permanent GitHub Actions verification with Vitest and Playwright Browser QA;
- gated Cloudflare Pages Direct Upload previews for same-repository pull requests.

Production deployment, the planned custom domain, analytics/ads, backend/accounts, compared-text persistence/history, URL sharing, and file-import features remain separately gated future work.
