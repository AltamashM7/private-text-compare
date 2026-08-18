# Latest session work

## Phase 1E-A2 connector-operable production release trigger

### Accepted starting state

- Phase 1E-A was accepted and squash-merged as PR #11.
- Accepted Phase 1E-A `main`: `6052bf91886458f8e4dd0fa7a8cd3e5ee94ccedf`.
- Phase 1E-A established `https://textcompare.amosfot.in/` as the production host and installed an exact-current-main `workflow_dispatch` release path with the accepted Cloudflare Pages Direct Upload, raw full-SHA provenance, Pages custom-domain activation polling, and production indexability gates.
- Phase 1E-A did not deploy production, activate the custom domain, or alter DNS.

### Current Phase 1E-A2 work

- Branch: `phase-1e/release-trigger-bridge`.
- Phase 1E-A2 is review-only and adds a connector-operable release trigger without changing product/runtime application files.
- `workflow_dispatch(target_sha)` remains supported as fallback.
- The added GitHub `create` event becomes meaningful only for release-looking branch refs; unrelated branch/tag creates skip meaningful jobs.
- The exact accepted release-ref grammar is `^release/production/([0-9a-f]{40})-r([1-9][0-9]*)$`.
- Release actor must be exactly `AltamashM7`.
- The embedded branch SHA must equal the create-event SHA, and every actual release must still prove that target equals freshly fetched current `origin/main` before verification and again immediately before deployment.

### Pure release-target resolver

`.github/scripts/resolve-production-target.sh` is the shared deterministic resolver for both supported production triggers. It has no network calls, no secret handling, and prints only the resolved full lowercase 40-character target SHA on stdout when valid.

For `workflow_dispatch` it requires actor `AltamashM7`, a full lowercase 40-character `target_sha`, and equality between that input and the event SHA. The workflow separately preserves the `refs/heads/main` requirement.

For `create` it requires actor `AltamashM7`, `ref_type == branch`, the exact release-ref regex, and equality between the embedded SHA and event SHA.

`.github/scripts/test-resolve-production-target.sh` invokes the real helper and covers valid dispatch/r1/r2 plus invalid actor, tag create, ordinary/wrong-prefix/missing-suffix branches, r0, negative/garbage retry suffixes, uppercase/short SHA, branch/event SHA mismatch, dispatch/event SHA mismatch, and unsupported event. It performs no GitHub or Cloudflare request.

### Workflow event matrix

```text
pull_request main
  -> Verify -> Browser QA -> Cloudflare PR preview
  -> production/status-release jobs skipped

push main
  -> Verify -> Browser QA
  -> preview/production/status-release jobs skipped

workflow_dispatch
  -> resolver + refs/heads/main + exact-current-origin/main guard
  -> Verify -> Browser QA -> pending release status -> production -> final release status

valid release branch create
  -> resolver + exact-current-origin/main guard
  -> Verify -> Browser QA -> pending release status -> production -> final release status

unrelated create
  -> meaningful jobs skipped
```

Invalid refs that begin with `release/production/` enter Verify only so the central resolver can reject them explicitly; they cannot reach production.

### Connector-readable status receipt

The production receipt context is exactly `production/private-text-compare`, written against the resolved production target SHA.

The pending status is published after Verify succeeds:

- `pending`
- `Production release running`

An `if: always()` finalizer publishes:

- `success` / `Production release verified` only when Verify, Browser QA, the pending status job, and production all succeeded;
- otherwise `failure` / `Production release failed` when a valid release target was resolved.

Every receipt points to `${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}` so the Orchestrator can poll the target commit's statuses, discover the exact workflow run URL, then inspect jobs/logs independently.

Only the status-writing jobs receive `permissions: { contents: read, statuses: write }`. Global workflow permissions remain `contents: read`; no job receives `contents: write`.

### Production deployment boundary

The accepted Phase 1E-A production body is preserved except that its exact target SHA now comes from the shared resolver rather than directly from `inputs.target_sha`, allowing the same deployment path for dispatch and valid connector-created release refs.

The production job still needs Browser QA, checks out the event SHA, reruns the resolver, proves checkout == resolved target, fetches current `origin/main`, refuses stale/non-main targets, performs `npm ci` and the exact build, verifies Pages project and `production_branch == main`, uses pinned Wrangler `4.123.0` Direct Upload with branch `main` and the exact resolved SHA, proves raw full-SHA production provenance, only then handles the approved Pages custom domain, rejects unexpected `compare.amosfot.in`, performs no direct DNS mutation, waits the existing bounded period for ACTIVE, and requires all accepted live HTTPS/canonical/crawling/indexability gates including absence of production `X-Robots-Tag: noindex`.

PR preview behavior remains unchanged and continues to require `X-Robots-Tag: noindex`.

### A2 acceptance boundary

- Do not create any `release/production/...` branch during A2 review.
- Do not run `workflow_dispatch` during A2 review.
- Do not deploy production, mutate Pages custom-domain state, activate `textcompare.amosfot.in`, or touch DNS during A2 review.
- The A2 Draft PR must pass normal Verify → Browser QA → Cloudflare PR preview on the exact final head, including resolver contract tests, 58/58 unit tests, 41/41 browser tests, the existing screenshot artifact, exact preview provenance, HTTP 200, and preview noindex.
- Production and release-status jobs must be skipped on the A2 PR.
- Phase 1E remains incomplete until a later explicitly approved exact-current-main production attempt succeeds and the live production domain passes all gates.
