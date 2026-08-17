# Architecture

## Application

- Astro remains the static-first framework and production output remains static.
- The primary comparison experience is the focused Preact island `src/components/TextCompareTool.tsx`, hydrated with `client:load` from the static index page.
- The island consumes the project-owned `compareTexts` API from `src/core/compare/`; JsDiff remains an internal core primitive and is not imported by UI code.
- Phase 1C adds `src/core/export/` as a framework-independent serializer layer downstream from `src/core/compare/`. It consumes project-owned `ComparisonResult` values and returns unified-diff or plain-text report strings without browser APIs or a second comparison pass.
- A small `src/components/ThemeToggle.tsx` Preact island controls the non-sensitive visual theme preference without hydrating the rest of the static page.
- Tailwind CSS 4 remains available, while the product visual system is expressed primarily through semantic CSS tokens and focused stylesheet layers rather than framework-color classes scattered through the comparator.
- Framework-independent comparison/domain/export behavior remains under `src/core/` and is protected by Vitest.

The Phase 1C data flow is:

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

Clipboard and Blob handling exists only at the UI/browser boundary. The UI calls the core serializers and then, after an explicit user action, either writes the generated unified diff with `navigator.clipboard.writeText(...)` or starts a local Blob download. Core export code does not know about Clipboard APIs, `Blob`, `document`, `window`, object URLs, storage, or network APIs.

## Visual system, typography, and themes

- The product uses an explicit dark-default dual-theme system: `html[data-theme="dark"]` and `html[data-theme="light"]` map the same semantic tokens for page/surface/border/text/action/focus and diff states.
- Dark is the first-visit default regardless of OS `prefers-color-scheme`. A small inline script in `BaseLayout.astro` runs in the document head before normal page paint, safely reads only `private-text-compare-theme`, and applies a valid saved `dark` or `light` value. Missing, malformed, unsupported, or unreadable preference state falls back to dark; unsupported stored values are discarded.
- Product/UI typography uses self-hosted Geist Sans. Editor/diff/code-like typography uses self-hosted Geist Mono. The two variable WOFF2 files are copied unmodified from the official `vercel/geist-font` release tag `v1.7.1`, are served from `/fonts/geist/` on the same Private Text Compare origin, and are preloaded above the fold. The repository retains the SIL Open Font License 1.1 and a concise provenance record. There is no runtime font CDN or third-party font request.
- `src/styles/refinement.css` layers the Geist typography and technical-canvas refinement after the established semantic theme system. Phase 1C also places compact secondary result actions in this refinement layer without redesigning the accepted comparator.
- The ambient technical canvas is CSS-only and theme-aware. It combines a faint minor grid, a stronger major grid at four minor cells, nodes aligned to major-grid intersections, a restrained radial tonal lift, and CSS masking that fades the pattern toward the sides and lower page. The treatment is static, pointer-inert, and subordinate to opaque editor/result surfaces; it uses no JavaScript renderer, image asset, canvas element, SVG background file, or animation.
- The visual identity remains a restrained precision/developer-editor utility: neutral chrome, thin borders, low elevation, shared editor surfaces, compact controls, and semantic diff color concentrated on changed text rather than general application decoration.
- Original and Changed inputs share one editor workspace. Results use one diff-editor surface with status and line-number gutters, aligned Original/Changed columns on wider screens, and connected paired rows on narrow screens.

## Directory ownership

- `src/pages/`: static route entry points and island composition.
- `src/components/`: necessary interactive Preact islands, currently the comparator and theme toggle; browser-only clipboard/download orchestration stays here.
- `src/layouts/`: shared Astro document/layout structure, font preloads, and pre-paint theme bootstrap.
- `src/styles/`: semantic theme tokens, responsive visual system, Geist typography, CSS-only technical canvas, and compact result-export controls.
- `src/core/compare/`: framework-independent comparison/domain logic and unit tests.
- `src/core/export/`: framework-independent deterministic serialization of `ComparisonResult` values and unit tests.
- `public/fonts/geist/`: the two vendored Geist variable WOFF2 assets plus retained OFL license and provenance record.
- `tests/browser/`: Playwright interaction, theme/privacy behavior, font/network assertions, export workflows, and responsive visual QA.
- `agent_docs/`: durable project context and handoff state.
- `.github/workflows/`: verification and approved preview deployment automation.

## Export semantics

Unified-diff export is comparison-aware rather than a second strict diff. It maps semantic `ComparisonRow` state directly, uses three semantic context rows before and after changed/added/removed regions, merges overlapping or touching context windows, and emits separate hunks for distant changes. Hunk range counts use Original/Changed line consumption rather than rendered diff-line count.

When ignore-case or ignore-surrounding-whitespace makes raw Original/Changed lines semantically unchanged, export preserves that decision. The `.diff` output may therefore not be a byte-for-byte patch capable of recreating raw Changed input when ignored raw differences exist. This is intentional: Phase 1C exports the user's active comparison result, not a source-control patch engine. No second JsDiff pass is permitted to reveal differences the user chose to ignore.

The comparison engine's existing trailing-newline model is preserved. No `\ No newline at end of file` markers are introduced.

## State and privacy

Compared text, comparison options, result rows, statistics, stale/result state, the result-option snapshot, and generated export strings remain transient in the current page session. They are not persisted to localStorage, sessionStorage, IndexedDB, cookies, history, or URLs and have no application fetch/XHR path. Refreshing the page clears entered text and results.

The sole approved browser persistence is the non-sensitive theme string under `private-text-compare-theme`, whose valid values are only `dark` and `light`. Theme persistence is isolated from comparison/export state and does not weaken the compared-text privacy boundary.

Phase 1C adds no export telemetry. Copy uses clipboard write only after an explicit click; application code never reads the clipboard. Download uses local Blob/object-URL mechanics only. No export payload is uploaded, transmitted, logged, retained in history, or encoded into a URL.

Font delivery does not add a privacy path: both Geist WOFF2 resources are part of the same static site and are requested from the current origin. The technical canvas is rendered entirely through CSS.

## Verification and Browser QA

GitHub Actions remains authoritative. `Verify project` runs committed-diff whitespace checking, `npm ci`, Astro/TypeScript checking, all core Vitest suites, and static build. Playwright exercises the real comparator controls and comparison output plus theme behavior: dark first visit independent of OS preference, pre-hydration dark document state, both toggle directions, saved preference reload, malformed-value fallback/cleanup, and proof that theme persistence does not preserve compared text or result state.

Phase 1C browser coverage proves export controls are absent without a result; exact unified-diff clipboard content after explicit activation; stale-result disabling/re-enable behavior; exact `.diff` and `.txt` filenames and contents through Playwright download events; Swap/Clear removal of export actions; approved storage remains theme-only; sessionStorage stays unused; and export actions produce no fetch/XHR application request.

A focused browser test waits for `document.fonts.ready`, verifies both Geist families resolve, checks computed UI/editor font-family mappings, proves both WOFF2 resources return HTTP 200 from the same origin, rejects known external font/CDN hosts in page resource entries, checks the technical-canvas structure, and preserves the no-horizontal-overflow/error checks.

Responsive visual QA produces ten full-page screenshots in a deterministic compared-result state: Dark and Light at the five standard desktop/tablet/mobile viewports. Screenshots remain CI artifacts and are not committed.

## Development and deployment

The existing Cloudflare Pages Direct Upload architecture is unchanged. Same-repository PR previews remain gated behind `Verify project` and `Browser QA`, use branch `pr-<PR number>`, and receive an immutable deployment URL plus stable alias. Live curl verification targets the immutable deployment URL, checks current durable product markers, HTTP 200, and `X-Robots-Tag: noindex`; browser interaction, same-origin font delivery, theming, and export workflows remain Playwright's responsibility.

Production deployment is still separately gated and not configured automatically. `compare.amosfot.in` remains planned only and is not attached; no DNS change is part of Phase 1C.
