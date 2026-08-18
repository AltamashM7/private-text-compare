# Architecture

## Application

- Astro remains static-first and production output remains static.
- `src/components/TextCompareTool.tsx` is the focused Preact comparator island; comparison/domain behavior stays framework-independent under `src/core/compare/` and export serialization under `src/core/export/`.
- `ThemeToggle.tsx` is the only other hydrated island. Phase 1D launch content remains static Astro HTML below the comparator.
- Compared text, comparison state, result rows, export strings, and option snapshots remain transient. The only approved persistence is the non-sensitive `private-text-compare-theme` value (`dark` or `light`).
- Copy remains explicit clipboard write only; downloads remain local Blob/object-URL actions. No compared text or export payload is sent to an application backend, persisted, logged, or encoded in URLs.

## Launch content and SEO

- `astro.config.mjs` defines the production site as `https://textcompare.amosfot.in`; this drives deterministic production canonical/social site identity at build time.
- `BaseLayout.astro` derives both the homepage canonical and the single `WebSite` JSON-LD URL from `Astro.site`, avoiding a second hardcoded production-host value in the layout.
- The accepted Phase 1D metadata remains deliberately narrow: exact title/description, canonical, Open Graph, Twitter summary metadata, favicon linkage, and exactly one `WebSite` JSON-LD object. There is no FAQPage, SoftwareApplication, rating/review, offer, SearchAction, meta keywords, Search Console token, or Open Graph image.
- `public/robots.txt` allows crawling and points to `https://textcompare.amosfot.in/sitemap.xml`; `public/sitemap.xml` contains only `https://textcompare.amosfot.in/`.
- The earlier `https://compare.amosfot.in/` value was a Phase 1D plan only, was never activated, and is superseded. Browser QA rejects that obsolete full origin without using the unsafe bare-host substring that is contained inside `textcompare.amosfot.in`.
- Product HTML contains no meta noindex. PR previews remain protected by deployment-layer `X-Robots-Tag: noindex`; production must be indexable.

## Visual system and assets

The accepted dark-default dual-theme visual system, self-hosted Geist Sans/Mono fonts, static CSS technical canvas, responsive comparator layout, launch-content presentation, and local SVG favicon are unchanged by Phase 1E-A. No new visual asset, hydration island, runtime dependency, analytics, tracking, or backend path is introduced.

## Verification

`Verify project` remains the permanent first gate and runs committed-diff whitespace checking for PR/push events, `npm ci`, Astro/TypeScript checking, all Vitest suites, and a static build. `Browser QA` still follows Verify and runs Playwright Chromium against the built site, including the existing 14 screenshot captures.

SEO/browser coverage requires the final production canonical, Open Graph URL, WebSite JSON-LD URL, robots sitemap, and sole sitemap location to use `https://textcompare.amosfot.in/`; it rejects localhost, `pages.dev`, and the obsolete full origin `https://compare.amosfot.in`.

Same-repository PR previews remain `Verify project → Browser QA → Deploy Cloudflare preview`. Preview deployment remains branch `pr-<number>`, uses Direct Upload, verifies HTTP 200 and current product markers, requires `X-Robots-Tag: noindex`, checks the generated production canonical metadata, and proves the exact full PR-head SHA through raw Cloudflare deployment metadata.

## Phase 1E production release path

Phase 1E-A extends the existing `.github/workflows/ci.yml`; it does not create a second release workflow or enable Cloudflare Git integration.

Normal events remain non-production:

```text
pull_request -> Verify -> Browser QA -> PR preview
push main    -> Verify -> Browser QA -> preview skipped
```

A production release is reachable only through a later deliberate manual dispatch:

```text
workflow_dispatch(target_sha)
    -> Verify exact-current-main guard
    -> Verify project
    -> Browser QA
    -> Deploy Cloudflare production
         -> reconfirm exact current main
         -> npm ci + exact static build
         -> verify Pages project + production_branch=main
         -> Direct Upload dist with branch=main + exact target_sha
         -> raw API full-SHA production provenance
         -> Pages custom-domain inspection/association
         -> bounded ACTIVE polling
         -> live HTTPS/canonical/crawling/indexability gates
```

### Exact-main guard

For `workflow_dispatch`, execution fails before normal verification unless all are true:

1. `github.ref == refs/heads/main`;
2. `target_sha` is a full 40-character commit SHA;
3. `target_sha == github.sha` for the dispatched revision;
4. after fetching `origin/main`, `target_sha` still equals the current remote main SHA.

The production job repeats the ref/SHA/current-main checks after its own exact-SHA checkout so a stale or moved main cannot be deployed.

### Cloudflare production deployment

The production job needs Browser QA and has `if: github.event_name == 'workflow_dispatch'`, so pull requests and normal pushes show it as skipped. Permissions remain `contents: read`. It reuses the existing pinned checkout/setup-node/Wrangler action SHAs, Wrangler `4.123.0`, repository Cloudflare secrets, and Pages project `private-text-compare`; no npm dependency is added.

The Direct Upload command design is:

`pages deploy dist --project-name=private-text-compare --branch=main --commit-hash=<exact target_sha>`

The job verifies the project exists and its `production_branch` is still exactly `main`. After deployment it requires raw Cloudflare API metadata for the deployment just created to prove `environment=production`, `branch=main`, the full 40-character `commit_hash` equals `target_sha`, and the deployment URL equals the Wrangler action output. Wrangler's seven-character display is not sufficient provenance.

### Custom-domain boundary

Only after exact production provenance succeeds does the job list Pages custom domains. If `compare.amosfot.in` unexpectedly exists on the project, the job fails without deleting or mutating it. If `textcompare.amosfot.in` is already associated, it is reused; otherwise it is added through the Pages Custom Domain API. No direct DNS create/edit/delete call exists in the workflow and no broader token permission is requested.

The job polls the Pages domain status for a bounded period and proceeds only when status is ACTIVE. If it remains initializing, pending, error, blocked, deactivated, or otherwise non-active, the job fails with safe status/validation details. A successful production deployment is not rolled back merely because domain activation is incomplete.

### Production indexability boundary

After the domain is ACTIVE, HTTPS verification requires:

- homepage HTTP 200 and current Private Text Compare product markers;
- canonical exactly `https://textcompare.amosfot.in/`;
- exactly one `WebSite` JSON-LD whose URL is exactly the production homepage;
- `robots.txt` HTTP 200 with the exact production sitemap directive;
- `sitemap.xml` HTTP 200 with exactly the production homepage;
- no localhost or `pages.dev` canonical;
- no HTML meta robots noindex;
- no `X-Robots-Tag: noindex` on the production custom domain.

Phase 1E-A only installs and reviews this path. It does not execute `workflow_dispatch`, deploy production, associate a custom domain, or change DNS. Phase 1E remains incomplete until a later accepted exact-main release passes every live gate.
