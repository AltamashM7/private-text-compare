# Architecture

## Application

- Astro remains the static-first framework and production output remains static.
- The primary comparison experience is the focused Preact island `src/components/TextCompareTool.tsx`, hydrated with `client:load` from the static index page.
- The island consumes the project-owned `compareTexts` API from `src/core/compare/`; JsDiff remains an internal core primitive and is not imported by UI code.
- A small `src/components/ThemeToggle.tsx` Preact island controls the non-sensitive visual theme preference without hydrating the rest of the static page.
- Tailwind CSS 4 remains available, while the product visual system is expressed primarily through semantic CSS tokens and focused stylesheet layers rather than framework-color classes scattered through the comparator.
- Framework-independent comparison/domain behavior remains under `src/core/` and is protected by Vitest.

## Visual system, typography, and themes

- The product uses an explicit dark-default dual-theme system: `html[data-theme="dark"]` and `html[data-theme="light"]` map the same semantic tokens for page/surface/border/text/action/focus and diff states.
- Dark is the first-visit default regardless of OS `prefers-color-scheme`. A small inline script in `BaseLayout.astro` runs in the document head before normal page paint, safely reads only `private-text-compare-theme`, and applies a valid saved `dark` or `light` value. Missing, malformed, unsupported, or unreadable preference state falls back to dark; unsupported stored values are discarded.
- Product/UI typography uses self-hosted Geist Sans. Editor/diff/code-like typography uses self-hosted Geist Mono. The two variable WOFF2 files are copied unmodified from the official `vercel/geist-font` release tag `v1.7.1`, are served from `/fonts/geist/` on the same Private Text Compare origin, and are preloaded above the fold. The repository retains the SIL Open Font License 1.1 and a concise provenance record. There is no runtime font CDN or third-party font request.
- `src/styles/refinement.css` layers the Geist typography and technical-canvas refinement after the established semantic theme system without changing comparator behavior.
- The ambient technical canvas is CSS-only and theme-aware. It combines a faint minor grid, a stronger major grid at four minor cells, nodes aligned to major-grid intersections, a restrained radial tonal lift, and CSS masking that fades the pattern toward the sides and lower page. The treatment is static, pointer-inert, and subordinate to opaque editor/result surfaces; it uses no JavaScript renderer, image asset, canvas element, SVG background file, or animation.
- The visual identity remains a restrained precision/developer-editor utility: neutral chrome, thin borders, low elevation, shared editor surfaces, compact controls, and semantic diff color concentrated on changed text rather than general application decoration.
- Original and Changed inputs share one editor workspace. Results use one diff-editor surface with status and line-number gutters, aligned Original/Changed columns on wider screens, and connected paired rows on narrow screens.

## Directory ownership

- `src/pages/`: static route entry points and island composition.
- `src/components/`: necessary interactive Preact islands, currently the comparator and theme toggle.
- `src/layouts/`: shared Astro document/layout structure, font preloads, and pre-paint theme bootstrap.
- `src/styles/`: semantic theme tokens, responsive visual system, Geist typography, and CSS-only technical canvas.
- `src/core/`: framework-independent comparison/domain logic and unit tests.
- `public/fonts/geist/`: the two vendored Geist variable WOFF2 assets plus retained OFL license and provenance record.
- `tests/browser/`: Playwright interaction, theme/privacy behavior, font/network assertions, and responsive visual QA.
- `agent_docs/`: durable project context and handoff state.
- `.github/workflows/`: verification and approved preview deployment automation.

## State and privacy

Compared text, comparison options, result rows, statistics, and stale/result state remain transient Preact component memory for the current page session. They are not persisted to localStorage, sessionStorage, IndexedDB, cookies, history, or URLs and have no application fetch/XHR path. Refreshing the page clears entered text and results.

The sole approved browser persistence is the non-sensitive theme string under `private-text-compare-theme`, whose valid values are only `dark` and `light`. Theme persistence is isolated from comparison state and does not weaken the compared-text privacy boundary.

Font delivery does not add a privacy path: both Geist WOFF2 resources are part of the same static site and are requested from the current origin. The technical canvas is rendered entirely through CSS.

## Verification and Browser QA

GitHub Actions remains authoritative. `Verify project` runs committed-diff whitespace checking, `npm ci`, Astro/TypeScript checking, the Phase 1A core Vitest suite, and static build. Playwright exercises the real comparator controls and comparison output plus theme behavior: dark first visit independent of OS preference, pre-hydration dark document state, both toggle directions, saved preference reload, malformed-value fallback/cleanup, and proof that theme persistence does not preserve compared text or result state.

A focused browser test waits for `document.fonts.ready`, verifies both Geist families resolve, checks computed UI/editor font-family mappings, proves both WOFF2 resources return HTTP 200 from the same origin, rejects known external font/CDN hosts in page resource entries, checks the technical-canvas structure, and preserves the no-horizontal-overflow/error checks.

Responsive visual QA produces ten full-page screenshots in a deterministic compared-result state: Dark and Light at the five standard desktop/tablet/mobile viewports. Screenshots remain CI artifacts and are not committed.

## Development and deployment

The existing Cloudflare Pages Direct Upload architecture is unchanged. Same-repository PR previews remain gated behind `Verify project` and `Browser QA`, use branch `pr-<PR number>`, and receive an immutable deployment URL plus stable alias. Live curl verification targets the immutable deployment URL, checks current durable product markers, HTTP 200, and `X-Robots-Tag: noindex`; browser interaction, same-origin font delivery, and theming remain Playwright's responsibility.

Production deployment is still separately gated and not configured automatically. `compare.amosfot.in` remains planned only and is not attached; no DNS change is part of Phase 1B.
