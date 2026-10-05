# Private Text Compare

Private Text Compare is a privacy-first, client-side text comparison and diff checker. It is designed for immediate use without accounts, with compared text remaining in the browser and not being persisted by default.

**Live:** https://textcompare.amosfot.in/

## Status

The product is complete and live. The current production generation includes Original/Changed text comparison, line- and inline-level diff presentation, ignore-case and ignore-surrounding-whitespace options, Swap and Clear, stale-result safety, local Copy diff, local .diff download, and local plain-text report download.

The interface is responsive in Dark and Light themes, uses self-hosted Geist typography, and remains static-first. GitHub Actions covers type/build/unit/browser QA; Cloudflare Pages Direct Upload provides noindex PR previews and guarded exact-current-main production releases.

Compared text is not sent to an application backend or persisted by default. Analytics, ads, accounts, backend services, history, URL sharing, and file import are not part of the current product.

## Search and portfolio discovery

The site includes two bounded supporting guides:

- https://textcompare.amosfot.in/guides/compare-two-texts/
- https://textcompare.amosfot.in/guides/line-vs-word-diff/

The homepage and both guides link to the Amosfot Tools portfolio hub at https://tools.amosfot.in/ and preserve restrained cross-tool discovery.

## Current production

Current main before this documentation reconciliation: c71648799c6694765f2bd8fb1d097b32f61848d2.

The guarded release for that exact head succeeded in GitHub Actions run 33224830603. Exact Cloudflare production provenance was verified at https://a62856aa.private-text-compare.pages.dev while the public/canonical origin remains https://textcompare.amosfot.in/.

## Technology

- Astro, static-first
- Preact for interaction only where needed
- Tailwind CSS 4 via the Vite plugin
- strict TypeScript
- framework-independent comparison and export logic under src/core/
- Cloudflare Pages Direct Upload controlled by GitHub Actions

## Verification

GitHub is the source of truth. See agent_docs/ for durable architecture, decisions, SEO batch history, current progress, and handoff.
