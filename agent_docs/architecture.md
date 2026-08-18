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
- Product HTML contains no meta noindex. PR previews remain protected by deployment-layer `X-Robots-Tag: noindex`; production must be indexable.

## Visual system and assets

The accepted dark-default dual-theme visual system, self-hosted Geist Sans/Mono fonts, static CSS technical canvas, responsive comparator layout, launch-content presentation, and local SVG favicon are unchanged by Phase 1E-A2. No new visual asset, hydration island, runtime dependency, analytics, tracking, or backend path is introduced.

## Verification

`Verify project` remains the permanent first gate for pull requests, main pushes, and valid production release events. It runs the dependency-free production-target resolver contract test, committed-diff whitespace checking where applicable, `npm ci`, Astro/TypeScript checking, all Vitest suites, and a static build. `Browser QA` follows Verify and runs Playwright Chromium against the built site, including the existing 14 screenshot captures.

Same-repository PR previews remain `Verify project → Browser QA → Deploy Cloudflare preview`. Preview deployment remains branch `pr-<number>`, uses Direct Upload, verifies HTTP 200 and current product markers, requires `X-Robots-Tag: noindex`, checks the generated production canonical metadata, and proves the exact full PR-head SHA through raw Cloudflare deployment metadata.

Unrelated `create` events do not perform meaningful verification or deployment work. Only branch-create events whose ref begins with `release/production/` enter Verify; the central resolver then accepts only the exact release-ref grammar and actor rules below. Invalid release-looking names fail at that guard.

## Phase 1E production release path

Phase 1E-A was accepted and squash-merged as PR #11. Accepted Phase 1E-A `main` is `6052bf91886458f8e4dd0fa7a8cd3e5ee94ccedf`.

Phase 1E-A2 keeps the same `.github/workflows/ci.yml` and accepted Cloudflare production logic while adding a connector-operable release entry point and a commit-status receipt. `workflow_dispatch` remains supported as fallback.

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

### Central release-target resolver

`.github/scripts/resolve-production-target.sh` is dependency-free, performs no network calls, handles no secrets, and prints only one resolved lowercase 40-character target SHA on stdout when valid.

For `workflow_dispatch` it requires:

- actor exactly `AltamashM7`;
- `target_sha` exactly 40 lowercase hexadecimal characters;
- `target_sha == github.sha`.

The workflow separately retains the `github.ref == refs/heads/main` requirement.

For `create` it requires:

- actor exactly `AltamashM7`;
- `ref_type == branch`;
- ref exactly matching `^release/production/([0-9a-f]{40})-r([1-9][0-9]*)$`;
- embedded SHA exactly equal to the create-event SHA/branch tip.

The retry suffix lets the Orchestrator use `-r2`, `-r3`, and later attempts without deleting earlier release audit branches.

`.github/scripts/test-resolve-production-target.sh` invokes the real resolver without GitHub or Cloudflare access and covers valid dispatch/r1/r2 plus invalid actor, ref type, ordinary/wrong/malformed branches, invalid retry suffixes, uppercase/short/mismatched SHAs, mismatched dispatch input, and unsupported events.

### Exact-current-main guard

After the pure resolver succeeds, Verify requires the resolved target commit to exist, fetches `origin/main`, and requires the target to equal current remote main. The production job repeats the resolver, proves its checkout equals that target, fetches `origin/main` again immediately before deployment, and refuses release if main advanced.

A create-triggered release therefore may use the release branch as the event ref, but can never deploy feature-branch code, historical main, stale reviewed code, or a different commit hidden behind a release-looking name.

### Connector-readable release receipt

Release attempts publish GitHub Commit Status context `production/private-text-compare` against the resolved production target SHA. Only the two status-writing jobs receive job-local `statuses: write` plus `contents: read`; global workflow permission remains `contents: read` and no `contents: write` is granted.

After Verify succeeds, the pending receipt is:

- state `pending`;
- description `Production release running`.

An `if: always()` finalizer publishes:

- state `success`, description `Production release verified` only when Verify, Browser QA, the pending-status job, and production all succeeded;
- otherwise state `failure`, description `Production release failed`, when a valid target was resolved.

Every receipt uses the exact Actions run URL `${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}` as `target_url`. This makes the run discoverable through commit-status polling by the Orchestrator connector.

### Cloudflare production deployment

The production job still needs Browser QA and additionally requires the pending receipt. It is reachable only for `workflow_dispatch` or a release-looking branch `create` event that has already passed Verify. Pull requests, main pushes, and unrelated creates cannot deploy production.

It reuses the accepted Phase 1E-A pinned checkout/setup-node/Wrangler actions, Wrangler `4.123.0`, repository Cloudflare secrets, Pages project `private-text-compare`, and Direct Upload command:

`pages deploy dist --project-name=private-text-compare --branch=main --commit-hash=<resolved exact target SHA>`

The job verifies the project exists and `production_branch == main`, proves full 40-character production provenance through raw Cloudflare API metadata, and only then inspects Pages custom domains.

### Custom-domain and indexability boundary

Accepted Phase 1E-A behavior is unchanged: unexpected `compare.amosfot.in` association fails without mutation; `textcompare.amosfot.in` is reused if already present or associated idempotently through the Pages API if absent; no direct DNS create/edit/delete call exists and Cloudflare permissions are not broadened. Domain status is polled for the existing bounded period and must become ACTIVE.

After ACTIVE, HTTPS verification still requires homepage HTTP 200/current product markers, canonical and sole `WebSite` JSON-LD URL exactly `https://textcompare.amosfot.in/`, exact robots/sitemap responses, no localhost/`pages.dev` canonical, no HTML noindex, and no `X-Robots-Tag: noindex` on production. PR previews continue to require `X-Robots-Tag: noindex`.

Phase 1E-A2 is review-only. Its PR must not create a `release/production/...` branch, run `workflow_dispatch`, deploy production, associate/activate the custom domain, or alter DNS. Phase 1E remains incomplete until a later explicitly approved exact-current-main production release passes every live gate.
