# Latest session work

## Phase 1C Copy + Export handoff

### Starting state and purpose

- Authoritative starting `main`: `5a15f5b87734818f44991c8995ab84b48c189024`.
- The preceding main workflow run `32041305660` passed `Verify project` and `Browser QA`; PR preview deployment was skipped on `main` as intended.
- Phase 1C is implemented on `phase-1c/copy-export` / Draft PR #8.
- The bounded goal is local output only: Copy diff, Download .diff, and Download .txt after a current comparison. No input/import, sharing, persistence, backend, telemetry, production deployment, or custom-domain work is included.

### Export architecture

`src/core/export/` is a small framework-independent layer downstream from `src/core/compare/`:

```text
transient inputs
    ↓
compareTexts
    ↓
ComparisonResult
    ├─ UI rendering
    └─ core export serializers
          ├─ unified diff string
          └─ plain-text report string
```

- Public serializers are `serializeUnifiedDiff(result)` and `serializeComparisonReport(result, options)`.
- The export module imports only project-owned comparison types. It does not import JsDiff or `diff`, rerun comparison, or use Preact, Astro, DOM, clipboard, Blob/object-URL, storage, or network APIs.
- `TextCompareTool.tsx` retains a transient `{ ignoreCase, ignoreSurroundingWhitespace }` snapshot at Compare time for report generation rather than adding UI state to `ComparisonResult`.
- Browser-only clipboard and Blob mechanics stay at the Preact/UI boundary; the UI always uses core serializer output rather than constructing export syntax itself.
- The four Phase 1A comparison-engine files remain byte-identical to the starting main baseline.

### Unified diff behavior

- Fixed LF-only headers are `--- original.txt` and `+++ changed.txt`, with no timestamps or metadata.
- Semantic row mapping is authoritative: unchanged uses Original-side raw text prefixed by one space; changed emits Original `-` then Changed `+`; removed emits Original `-`; added emits Changed `+`.
- Hunk calculations use semantic line consumption: unchanged/changed consume 1 Original + 1 Changed; removed consumes Original only; added consumes Changed only.
- Each difference receives three semantic `ComparisonRow` context rows before and after it. Windows that overlap or touch merge; distant changed regions become separate hunks.
- Hunk headers use explicit deterministic `START,COUNT` ranges, including `,1`. A zero-count side uses the preceding consumed position, allowing forms such as `@@ -0,0 +1,2 @@` for insertion into an originally empty region and `@@ -1,2 +0,0 @@` for deletion into an empty Changed region.
- No semantic differences returns exactly the two fixed headers plus the final LF after `+++ changed.txt`.
- Tabs, spaces, Unicode, emoji, punctuation, and raw line text are preserved. Existing Phase 1A LF/CRLF normalization and trailing-blank-line model are retained; no `\ No newline at end of file` marker is added.
- Ignore options remain authoritative. If raw text differs only in something the user chose to ignore, export keeps that row semantically unchanged. Therefore the `.diff` represents the active comparison result and is not promised as a byte-for-byte source-control patch when ignored raw differences exist; no second strict diff is run.

### Plain-text report behavior

The deterministic LF-only report uses this stable structure:

```text
Private Text Compare report
===========================

Summary
Original lines: N
Changed lines: N
Unchanged lines: N
Changed rows: N
Added lines: N
Removed lines: N

Comparison options
Ignore case: on/off
Ignore surrounding whitespace: on/off

Differences
...
```

- Changed rows emit `- Original N: <raw text>` followed by `+ Changed N: <raw text>`.
- Removed rows emit Original only; added rows emit Changed only; unchanged rows are omitted from Differences.
- With no semantic differences, the Differences section says exactly `No differences under the selected comparison options.` while Summary and Comparison options remain present.
- No timestamp, browser/device metadata, URL, generated ID, or user-derived filename is included.

### Local browser actions and stale safety

- Deterministic filenames are `private-text-compare.diff` and `private-text-compare-report.txt`.
- `.diff` uses `text/x-diff;charset=utf-8`; `.txt` uses `text/plain;charset=utf-8`.
- Copy diff writes exactly `serializeUnifiedDiff(result)` with `navigator.clipboard.writeText(...)` only after an explicit button click. Application code never reads the clipboard.
- Copy success changes the label to `Copied` and announces `Unified diff copied to clipboard.` through the existing status/live region.
- Clipboard denial is caught without changing the comparison and announces `Clipboard access was blocked. Download the .diff file instead.` No clipboard-read fallback or external service exists.
- Downloads use a transient Blob, `URL.createObjectURL`, a temporary local download anchor, and immediate object-URL revocation. They announce `Unified diff downloaded.` or `Text report downloaded.` without modifying the result.
- No result means no export actions. Current result means all three actions enabled. Editing an input or comparison option keeps the old visible result but real-disables all three actions until Compare refreshes it. Swap and Clear remove the result and therefore remove the export actions.

### Privacy, source, and dependency audit

- Compared text, `ComparisonResult`, option snapshots, serialized strings, and export state remain transient in memory only.
- No Phase 1C localStorage/sessionStorage/IndexedDB/cookie/history/URL persistence was added. The sole approved persistence remains `private-text-compare-theme` with only `dark`/`light` values.
- No Phase 1C `fetch`, XHR, WebSocket, sendBeacon, sharing API, URL-state, telemetry, analytics, logging, or server path was added. Browser QA also observes no fetch/XHR application request during export workflows.
- Application clipboard access is write-only; clipboard reading appears only in Playwright test code to verify the exact copied payload.
- No Google Analytics, GTM, PostHog, Plausible, Sentry, or export telemetry was introduced.
- `package.json` and `package-lock.json` remain byte-identical to starting main. No new npm dependency or config change was required.
- Existing Cloudflare Pages Direct Upload architecture and production branch metadata are unchanged; Phase 1C is PR-preview only.

### Tests and implementation-head verification

- Added 31 deterministic export serializer unit tests. Together with the unchanged 27 comparison tests, the unit suite is 58/58 passed.
- Added six Playwright export workflow tests while preserving all prior browser QA, for 31/31 browser tests passed.
- New browser tests prove: actions absent before a result; exact Copy diff payload and success status; stale disable/re-enable; exact `.diff` filename/content; exact `.txt` filename/content; Swap/Clear action removal; approved storage only; no sessionStorage; no page/console errors; and no export fetch/XHR request.
- The existing ten deterministic Dark/Light screenshots remain at 1440x900, 1024x768, 768x1024, 390x844, and 844x390. The implementation-head artifact was inspected: controls stay subordinate to stats/diff, labels do not clip, 390 portrait and 844x390 landscape remain comfortable, both themes/Geist/technical canvas remain coherent, and no horizontal overflow or new dashboard/card styling was introduced.

Verified implementation-head evidence before this final handoff-doc mutation:

- implementation head: `ec12dcba874827998c73e25fff408f073491d93d`;
- run: `32042795012`;
- `Verify project` job `95424983706`: success, 58/58 unit tests;
- `Browser QA` job `95425030898`: success, 31/31 browser tests;
- screenshot artifact `browser-qa-screenshots`: ID `9292263016`, digest `sha256:4f69b35ebd20cfa5d8e64e48039e5af093f4625b86806ca8c196a501edf3bc51`, ten files;
- `Deploy Cloudflare preview` job `95425182588`: success;
- immutable preview: `https://1ea8f9e0.private-text-compare.pages.dev`;
- stable PR alias: `https://pr-8.private-text-compare.pages.dev`;
- deployment ID: `1ea8f9e0-46b7-4d18-9e83-572553201793`;
- raw Cloudflare provenance matched branch `pr-8` and full commit `ec12dcba874827998c73e25fff408f073491d93d`;
- live preview passed HTTP 200, durable product/privacy markers, and `X-Robots-Tag: noindex`.

A first earlier CI attempt exposed only a test-typing issue: `tests/browser/export.spec.ts` imported `node:fs/promises`, while this project intentionally has no Node typings dependency. The test was changed to Playwright `Download.createReadStream()` rather than adding a dependency or config. Product logic was not changed by that correction.

### Commit sequence through verified implementation head

- `903e8261e3c90b50b623543f7c5c4bf6e8cfe98a` — `core: add deterministic comparison export serializers`
- `79556a1b69a2f538d8dbb96bd22d1437a5610ff9` — `core: implement deterministic comparison serializers`
- `b5c8071329375528bcb651ea1cc319b5d03cd3b0` — `test: cover deterministic comparison export serializers`
- `824f592e9f1693fb5e51176da05114d6f6c3d1f7` — `feat: add local copy and download actions`
- `40483ed7bc8c3965a837b95731b4c7c36d962f23` — `feat: integrate compact result export controls`
- `ed8b02aa8aad601f917bcaf5ad5f854802a2e6a9` — `test: verify local copy export and download workflows`
- `dfbc9a24512db745fe30c2720dbdf593ca93254d` — `docs: record Phase 1C export architecture`
- `2b2c8dd46a488caa9127f07bf066f61ee3b34fe8` — `docs: record Phase 1C export decisions`
- `09baece5d0e0d22abe954edf3724ea0c54b763d3` — `docs: document Phase 1C export data flow`
- `c9a2d0c4d353cdb9d9c3be4b927d23acc8d0f70f` — `docs: mark Phase 1C copy export active`
- `ec12dcba874827998c73e25fff408f073491d93d` — `test: read export downloads without new node dependency`

This handoff documentation commit follows those implementation commits. GitHub PR metadata is authoritative for its resulting final head SHA. That exact docs-inclusive head must receive a fresh permanent Verify → Browser QA → Cloudflare preview run before Builder completion is reported.

### Acceptance boundary

- Phase 1C is implemented but not accepted overall.
- Draft PR #8 must remain Draft and unmerged.
- Android Copy/Download QA remains pending and is performed by the user after Orchestrator review.
- Orchestrator independently reviews source/diff, serializer semantics, privacy/dependency audit, final-head CI, all ten screenshots, and Cloudflare provenance.
- Merge requires separate explicit user authorization after those reviews.
