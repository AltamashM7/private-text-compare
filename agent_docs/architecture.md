# Architecture

## Application

- Astro remains the static-first framework and production output remains static.
- The primary comparison experience is the focused Preact island `src/components/TextCompareTool.tsx`, hydrated with `client:load` from the static index page.
- The island consumes the project-owned `compareTexts` API from `src/core/compare/`; JsDiff remains an internal core primitive and is not imported by UI code.
- A small `src/components/ThemeToggle.tsx` Preact island controls the non-sensitive visual theme preference without hydrating the rest of the static page.
- Tailwind CSS 4 remains available, while the product visual system is expressed primarily through a small semantic CSS-token layer in `src/styles/global.css` rather than framework-color classes scattered through the comparator.
- Framework-independent comparison/domain behavior remains under `src/core/` and is protected by Vitest.

## Visual system and themes

- The product uses an explicit dark-default dual-theme system: `html[data-theme="dark"]` and `html[data-theme="light"]` map the same semantic tokens for page/surface/border/text/action/focus and diff states.
- Dark is the first-visit default regardless of OS `prefers-color-scheme`. A small inline script in `BaseLayout.astro` runs in the document head before normal page paint, safely reads only `private-text-compare-theme`, and applies a valid saved `dark` or `light` value. Missing, malformed, unsupported, or unreadable preference state falls back to dark; unsupported stored values are discarded.
- The visual identity is a restrained precision/developer-editor utility: neutral chrome, thin borders, low elevation, shared editor surfaces, compact controls, and semantic diff color concentrated on changed text rather than general application decoration.
- Original and Changed inputs share one editor workspace. Results use one diff-editor surface with status and line-number gutters, aligned Original/Changed columns on wider screens, and connected paired rows on narrow screens.

## Directory ownership

- `src/pages/`: static route entry points and island composition.
- `src/components/`: necessary interactive Preact islands, currently the comparator and theme toggle.
- `src/layouts/`: shared Astro document/layout structure and pre-paint theme bootstrap.
- `src/styles/`: global semantic theme tokens and responsive visual system.
- `src/core/`: framework-independent comparison/domain logic and unit tests.
- `tests/browser/`: Playwright interaction, theme/privacy behavior, and responsive visual QA.
- `agent_docs/`: durable project context and handoff state.
- `.github/workflows/`: verification and approved preview deployment automation.

## State and privacy

Compared text, comparison options, result rows, statistics, and stale/result state remain transient Preact component memory for the current page session. They are not persisted to localStorage, sessionStorage, IndexedDB, cookies, history, or URLs and have no application fetch/XHR path. Refreshing the page clears entered text and results.

The sole approved browser persistence is the non-sensitive theme string under `private-text-compare-theme`, whose valid values are only `dark` and `light`. Theme persistence is isolated from comparison state and does not weaken the compared-text privacy boundary.

## Verification and Browser QA

GitHub Actions remains authoritative. `Verify project` runs committed-diff whitespace checking, `npm ci`, Astro/TypeScript checking, the Phase 1A core Vitest suite, and static build. Playwright exercises the real comparator controls and comparison output plus theme behavior: dark first visit independent of OS preference, pre-hydration dark document state, both toggle directions, saved preference reload, malformed-value fallback/cleanup, and proof that theme persistence does not preserve compared text or result state.

Responsive visual QA produces ten full-page screenshots in a deterministic compared-result state: Dark and Light at the five standard desktop/tablet/mobile viewports. Screenshots remain CI artifacts and are not committed.

## Development and deployment

The existing Cloudflare Pages Direct Upload architecture is unchanged. Same-repository PR previews remain gated behind `Verify project` and `Browser QA`, use branch `pr-<PR number>`, and receive an immutable deployment URL plus stable alias. Live curl verification targets the immutable deployment URL, checks current durable product markers, HTTP 200, and `X-Robots-Tag: noindex`; browser interaction and theming remain Playwright's responsibility.

Production deployment is still separately gated and not configured automatically. `compare.amosfot.in` remains planned only and is not attached; no DNS change is part of Phase 1B.
