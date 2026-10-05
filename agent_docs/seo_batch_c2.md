> Historical batch record. SEO Batch C2 was accepted and merged as PR #17; later guarded production releases carried the resulting changes live. Statements below about a Draft PR or production not being deployed describe the boundary of that original batch, not the current repository state.

# SEO Batch C2 — Amosfot Tools hub backlink

- Starting main: `7646dc20f27e4ffa6c9015009549acee8f70ae88`
- Branch: `phase-seo-c2/tools-hub-backlink`
- Hub URL: `https://tools.amosfot.in/`
- Exact anchor text: `Amosfot Tools`
- Routes receiving exactly one hub link:
  - `/`
  - `/guides/compare-two-texts/`
  - `/guides/line-vs-word-diff/`
- The hub link is first in the existing `portfolio-nav` link group.
- Existing Upload Ready and PDF Ready portfolio links are preserved.
- Titles, descriptions, canonicals, OG metadata, structured-data types/values, guide content, sitemap URLs, robots directives, and comparison behavior are unchanged.
- `scripts/verify-seo.mjs` requires exactly one crawlable hub anchor on each built HTML page while preserving all SEO A/B assertions.
- Browser QA verifies the link and mobile footer overflow without navigating to the external hub.
- Preview noindex, branded canonical/og:url, and exact provenance architecture are preserved; live preview checks also require the hub backlink on all three routes.
- Future guarded production verification also requires the hub backlink on homepage and both guides.
- Production is not deployed in C2.
- PR remains Draft/open/unmerged pending explicit approval.
