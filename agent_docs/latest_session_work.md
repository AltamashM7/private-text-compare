# Latest session work

## Phase 1D Launch / SEO Readiness handoff

### Starting state

- Authoritative Phase 1D starting `main`: `f60069455d85cb8d8be9eb1c85896fff7d249f25`.
- Post-closeout main workflow run `32053292530` completed successfully on that exact commit.
- Implementation branch: `phase-1d/launch-seo-readiness`.
- Draft PR: #10, targeting `main`.
- Phase 1D remains unaccepted and unmerged until Orchestrator review and separate user approval.

### Static launch architecture

The accepted comparator/export path is unchanged. Phase 1D adds a separate static presentation/metadata layer:

```text
existing comparator islands
    ├─ ThemeToggle
    └─ TextCompareTool

static Astro launch layer
    ├─ explanatory content below comparator
    ├─ canonical/social metadata + WebSite JSON-LD
    ├─ favicon.svg
    ├─ robots.txt
    └─ sitemap.xml
```

- Astro `site` is configured as `https://compare.amosfot.in` for build-time canonical generation only.
- `BaseLayout.astro` emits static canonical, Open Graph, Twitter summary metadata, favicon linkage, and one deterministic `WebSite` JSON-LD object.
- No FAQPage, review/rating, offers, SearchAction, fake organization/person, Open Graph image, meta keywords, or Search Console verification metadata is added.
- Product HTML contains no meta noindex. Existing Cloudflare PR previews remain protected by deployment-layer `X-Robots-Tag: noindex`.

### Static page content

All new launch content is after `TextCompareTool` and requires no JavaScript:

- How it works: paste both versions, choose ignore options, compare/review/export.
- Private by design: compared text stays local to the browser session, is not uploaded to a Private Text Compare backend, transient comparison/export state clears on refresh, only theme may persist, clipboard is write-only/user-initiated, and downloads are local.
- Useful for quick before-and-after checks: restrained writing, study, code/configuration, AI rewrite, email/policy/business-text examples.
- Frequently asked questions: upload/storage, accounts, ignore-case, leading/trailing whitespace semantics, Copy/.diff/.txt export without retained history, and current lack of direct file import.

The existing Vercel-like precision/editor visual identity, dark-default dual themes, Geist fonts, technical canvas, and comparator placement remain intact. Launch presentation uses dividers, whitespace, restrained responsive grids, and mobile stacking rather than promotional cards or animation.

### Static launch assets

- `public/favicon.svg`: original 64×64-viewBox geometric diff/comparison mark; no external asset/font/raster reference.
- `public/robots.txt`: allows `/` and points to `https://compare.amosfot.in/sitemap.xml`.
- `public/sitemap.xml`: standard urlset containing only `https://compare.amosfot.in/`; no artificial lastmod and no preview URL.

### Verification coverage

`tests/browser/seo.spec.ts` exercises the built/static site and adds coverage for:

- exact homepage title and description;
- exact canonical, Open Graph, and Twitter summary values;
- parsed `WebSite` JSON-LD site name/URL and omission of fake rating/review/SearchAction data;
- favicon linkage plus successful local SVG response;
- robots and sitemap responses/content;
- no localhost/pages.dev canonical or sitemap values;
- one H1 and required static launch sections/FAQ;
- launch content adds no new hydrated island; the two accepted islands remain the only hydrated interaction;
- no HTML meta noindex;
- initial runtime requests remain same-origin;
- four focused launch screenshots: Dark/Light 1440×900 and Dark/Light 390×844.

The existing ten comparator screenshots and all earlier browser/unit suites remain untouched.

### Scope and privacy boundary

- No `src/core/compare/**` or `src/core/export/**` changes.
- No `TextCompareTool` comparison/export logic change.
- No npm dependency or lockfile change.
- No CI workflow or Cloudflare configuration change.
- No analytics, tracking, telemetry, backend, accounts, authentication, persistence/history, URL sharing, file import, new export format, PWA/service worker, third-party font/script/CDN, or new external runtime request.
- No production deployment and no `compare.amosfot.in` DNS/custom-domain activation.

### Acceptance boundary

- Phase 1D is implemented on Draft PR #10 but is not accepted overall.
- The exact final docs-inclusive PR head must complete the permanent Verify → Browser QA → Cloudflare preview chain before Builder completion is reported.
- Orchestrator independently reviews the final diff, metadata/schema choices, privacy/runtime boundaries, CI, visual artifacts, and preview provenance.
- Do not merge or mark PR #10 ready without separate explicit authorization.
