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
- The earlier `https://compare.amosfot.in/` value was a Phase 1D plan only, was never activated, and is superseded.
- Product HTML contains no meta noindex. PR previews remain protected by deployment-layer `X-Robots-Tag: noindex`; production is indexable.
- Cloudflare Managed robots.txt is disabled for this deployment arrangement so the repository-owned `public/robots.txt` is the authoritative crawler policy. Production release verification checks the live response against that exact approved repository policy.

## Visual system and assets

The accepted dark-default dual-theme visual system, self-hosted Geist Sans/Mono fonts, static CSS technical canvas, responsive comparator layout, launch-content presentation, and local SVG favicon are unchanged by Phase 1E. Production launch added no visual asset, hydration island, runtime dependency, analytics, tracking, backend path, or compared-text persistence.

## Verification

`Verify project` remains the permanent first gate for pull requests, main pushes, and valid production release events. It runs the dependency-free production-target resolver contract test, committed-diff whitespace checking where applicable, `npm ci`, Astro/TypeScript checking, all Vitest suites, and a static build. `Browser QA` follows Verify and runs Playwright Chromium against the built site, including the existing 14 screenshot captures.

Same-repository PR previews remain `Verify project → Browser QA → Deploy Cloudflare preview`. Preview deployment remains branch `pr-<number>`, uses Direct Upload, verifies HTTP 200 and current product markers, requires `X-Robots-Tag: noindex`, checks the generated production canonical metadata, and proves the exact full PR-head SHA through raw Cloudflare deployment metadata.

Unrelated `create` events do not perform meaningful verification or deployment work. Only branch-create events whose ref begins with `release/production/` enter Verify; the central resolver then accepts only the exact release-ref grammar and actor rules below. Invalid release-looking names fail at that guard.

## Phase 1E production release path

Phase 1E production launch is complete and accepted. Accepted launch code is exact main `c500ef51ebe749cb5efff369174e10417cd0a871`. The authoritative successful release is Actions run `32136540410`, Cloudflare deployment ID `0ea179a9-74bf-4ee1-bf17-a9d4286a541c`, immutable URL `https://0ea179a9.private-text-compare.pages.dev`, live at `https://textcompare.amosfot.in/`.

Normal events remain non-production:

```text
pull_request -> Verify -> Browser QA -> PR preview
push main    -> Verify -> Browser QA -> preview skipped
unrelated create -> meaningful jobs skipped
```

Approved production events are:

```text
workflow_dispatch(target_sha)
    -> pure resolver + exact-current-main guard
    -> Verify
    -> Browser QA
    -> pending commit-status receipt
    -> Deploy Cloudflare production
    -> final success/failure commit-status receipt

create release/production/<FULL_SHA>-r<N>
    -> pure resolver + exact-current-main guard
    -> Verify
    -> Browser QA
    -> pending commit-status receipt
    -> Deploy Cloudflare production
    -> final success/failure commit-status receipt
```

The connector-operable release-ref path is preferred; `workflow_dispatch(target_sha)` remains the fallback.

### Central release-target resolver

`.github/scripts/resolve-production-target.sh` is dependency-free, performs no network calls, handles no secrets, and prints only one resolved lowercase 40-character target SHA on stdout when valid.

For `workflow_dispatch` it requires actor exactly `AltamashM7`, a 40-character lowercase hexadecimal `target_sha`, equality with the event SHA, and the workflow separately requires `github.ref == refs/heads/main`.

For `create` it requires actor exactly `AltamashM7`, `ref_type == branch`, ref matching `^release/production/([0-9a-f]{40})-r([1-9][0-9]*)$`, and embedded SHA equal to the create-event SHA/branch tip. Retry suffixes preserve earlier attempts as immutable audit markers.

`.github/scripts/test-resolve-production-target.sh` invokes the real resolver without GitHub or Cloudflare access and covers the accepted valid and malformed trigger cases.

### Exact-current-main guard

After the pure resolver succeeds, Verify requires the resolved target commit to exist, fetches `origin/main`, and requires the target to equal current remote main. The production job repeats the resolver, proves its checkout equals that target, fetches `origin/main` again immediately before deployment, and refuses release if main advanced.

A create-triggered release may therefore use a release branch as the event ref, but cannot deploy feature-branch code, historical main, stale reviewed code, or a different commit hidden behind a release-looking name.

### Connector-readable release receipt

Release attempts publish GitHub Commit Status context `production/private-text-compare` against the resolved production target SHA. Only the two status-writing jobs receive job-local `statuses: write` plus `contents: read`; global workflow permission remains `contents: read` and no `contents: write` is granted.

After Verify succeeds, the pending receipt reports `pending` / `Production release running`. An `if: always()` finalizer reports `success` / `Production release verified` only when Verify, Browser QA, the pending-status job, and production all succeeded; otherwise it reports `failure` / `Production release failed` for a valid resolved target. Every receipt points to the exact Actions run URL.

The accepted production SHA currently carries `production/private-text-compare = success` pointing to run `32136540410`.

### Cloudflare production deployment

Production uses Cloudflare Pages Direct Upload controlled by GitHub Actions, not Cloudflare Git integration. The production job reuses the pinned checkout/setup-node/Wrangler actions, Wrangler `4.123.0`, repository Cloudflare secrets, Pages project `private-text-compare`, and deploys `dist` with branch `main` and the exact resolved current-main SHA.

The job verifies the Pages project and `production_branch == main`, then proves full 40-character production provenance through raw Cloudflare API metadata before custom-domain/live verification. The accepted release proved `environment=production`, `branch=main`, commit `c500ef51ebe749cb5efff369174e10417cd0a871` for deployment `0ea179a9-74bf-4ee1-bf17-a9d4286a541c`.

### Production DNS and custom-domain boundary

`textcompare.amosfot.in` is the production hostname. Pages custom-domain association remains idempotent through the Pages API; unexpected `compare.amosfot.in` association remains a hard failure. The old hostname is superseded and must not be introduced.

DNS itself remains manually managed to preserve least privilege. The required record is a proxied CNAME `textcompare -> private-text-compare.pages.dev` (TTL Auto at launch). The deployment API token remains Pages-scoped; DNS Write was deliberately not added. The GitHub Actions release path contains no direct DNS create/edit/delete operation.

The initial r1 release exposed the missing CNAME prerequisite through Cloudflare's `CNAME record not set` verification result. After the user manually created the record, later release attempts could verify the custom domain ACTIVE without broadening the deployment token.

### Production indexability boundary

After the domain is ACTIVE, production verification requires homepage HTTP 200/current product markers, canonical and sole `WebSite` JSON-LD URL exactly `https://textcompare.amosfot.in/`, repository-owned robots/sitemap responses, no localhost/`pages.dev` canonical, no HTML noindex, and no `X-Robots-Tag: noindex` on production. PR previews continue to require `X-Robots-Tag: noindex`.

The r2 release exposed a live `robots.txt` mismatch caused by Cloudflare Managed robots.txt. That managed feature was disabled for this deployment arrangement so repository `public/robots.txt` remains authoritative. The accepted r3 release then passed the complete HTTPS, canonical, structured-data, crawling-assets, sitemap, and indexability gate.

## Accepted production state

- Phase 1E is complete and accepted.
- Live URL: `https://textcompare.amosfot.in/`.
- Accepted code SHA: `c500ef51ebe749cb5efff369174e10417cd0a871`.
- Accepted release run: `32136540410`.
- Accepted deployment: `0ea179a9-74bf-4ee1-bf17-a9d4286a541c` / `https://0ea179a9.private-text-compare.pages.dev`.
- Android production QA was subsequently reported passed by the user.
- MVP functionality through production launch is complete; future product work remains separately scoped and explicitly approved.
