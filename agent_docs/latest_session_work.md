# Latest session work

## Phase 1E-A production-release preparation handoff

### Accepted starting state

- Phase 1D Launch / SEO Readiness is accepted and squash-merged.
- Accepted Phase 1D `main`: `143fa60471f44b4b7c200b933580c3737896ceb3`.
- The squash commit tree matched the reviewed final PR #10 tree exactly.
- Acceptance followed final-head source/diff review, Verify success, Browser QA success, Cloudflare preview success with exact provenance, responsive screenshot review, Android manual QA, and explicit user merge approval.
- Final reviewed PR #10 head `f500a8da340df2ade313e2c338fbb2b893a07fd2` passed workflow run `32058578434`: Verify job `95474316934`, Browser QA job `95474444110`, and preview job `95474822433` all succeeded; 58/58 unit tests and 41/41 browser tests passed.
- Final-head screenshot artifact `9297308830` contained 14 files. Final-head preview deployment `0a970779-41cc-4449-ae00-bf01f232d076` at `https://0a970779.private-text-compare.pages.dev` proved the full PR-head SHA on `pr-10` and passed HTTP 200/noindex verification.
- The historical post-merge Phase 1D push-run ID is not independently retrievable through the available Builder/Orchestrator connector interface, so no such run ID is invented or presented as verified.

### Current Phase 1E-A work

- Branch: `phase-1e/production-release`.
- Draft PR: #11 targeting `main`.
- Starting baseline remains `143fa60471f44b4b7c200b933580c3737896ceb3`.
- Production hostname is now `https://textcompare.amosfot.in/`.
- `https://compare.amosfot.in/` was planned only, never activated, and is superseded; no redirect or migration is required.

Phase 1E-A changes only launch-origin configuration/tests, the existing GitHub Actions workflow, and durable documentation. Comparison/export behavior, UI/theme/fonts, privacy/storage semantics, dependencies, and lockfile are unchanged.

### Canonical/SEO update

- Astro `site` is `https://textcompare.amosfot.in`.
- `BaseLayout.astro` derives both canonical and WebSite JSON-LD site root from `Astro.site`, reducing duplicate hostname state.
- `robots.txt` points to `https://textcompare.amosfot.in/sitemap.xml`.
- `sitemap.xml` contains only `https://textcompare.amosfot.in/`.
- Browser SEO tests require canonical, `og:url`, WebSite JSON-LD, robots, and sitemap values for the new host; localhost/Pages preview origins remain rejected.
- The obsolete host check uses the full origin `https://compare.amosfot.in` / URL-origin comparison rather than the unsafe bare hostname substring contained inside `textcompare.amosfot.in`.
- Phase 1D metadata/schema restrictions remain unchanged.

### Manual release architecture

The existing `.github/workflows/ci.yml` now declares required `workflow_dispatch.inputs.target_sha`. Verify project and Browser QA still run for pull requests, main pushes, and manual dispatches. The existing preview job remains same-repository PR-only.

The manual dispatch guard requires `refs/heads/main`, a full 40-character SHA, exact equality with `github.sha`, and a fresh `origin/main` fetch proving the input is still current main. The production job repeats that exact-current-main check after checking out the dispatched SHA.

`Deploy Cloudflare production` has `needs: browser-qa` and runs only when `github.event_name == 'workflow_dispatch'`. It reuses the existing pinned actions, Wrangler `4.123.0`, existing Cloudflare secrets, and Pages project `private-text-compare`. The prepared Direct Upload command associates `dist` with branch `main` and exact `target_sha`.

After deployment, raw Cloudflare deployment API metadata must prove the full 40-character target SHA, production environment, main branch, and exact deployment URL. Only then may the workflow inspect Pages custom domains. An unexpected `compare.amosfot.in` association fails without mutation; `textcompare.amosfot.in` is added only if absent, then polled for a bounded period until ACTIVE. There are no DNS mutation calls and no permission broadening.

Once ACTIVE, live gates require production HTTP 200, product markers, exact canonical and WebSite JSON-LD URL, exact robots/sitemap responses, no localhost/Pages canonical, no HTML noindex, and no `X-Robots-Tag: noindex`. PR previews continue to require `X-Robots-Tag: noindex`.

### Acceptance boundary

- Phase 1E-A PR #11 is review-only and must remain Draft/unmerged until separate authorization.
- This PR must run only the normal Verify → Browser QA → Cloudflare PR preview chain; its production job must be skipped.
- No `workflow_dispatch` is to be run during Phase 1E-A PR verification.
- No production deployment, Pages custom-domain association, domain activation, or DNS change occurs in this PR.
- Fresh final-head PR #11 CI is the authoritative verification of the accepted Phase 1D tree plus these bounded Phase 1E-A changes.
- Phase 1E is not complete after Phase 1E-A merge; completion requires a later exact-current-main manual production release and successful live-domain/provenance/indexability verification.
