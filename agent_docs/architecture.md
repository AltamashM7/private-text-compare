# Architecture

## Application

- Astro remains the static-first framework and production output remains static.
- The primary product interaction is the focused Preact island `src/components/TextCompareTool.tsx`, hydrated with `client:load` from the static index page.
- The island consumes the project-owned `compareTexts` API from `src/core/compare/`; JsDiff remains an internal core primitive and is not imported by UI code.
- Tailwind CSS 4 and the small global stylesheet provide the responsive visual layer without a component library.
- Framework-independent comparison/domain behavior remains under `src/core/` and is protected by Vitest.

## Directory ownership

- `src/pages/`: static route entry points and island composition.
- `src/components/`: necessary interactive Preact islands.
- `src/layouts/`: shared Astro document/layout structure.
- `src/styles/`: global styling foundation.
- `src/core/`: framework-independent comparison/domain logic and unit tests.
- `tests/browser/`: Playwright interaction and responsive visual QA.
- `agent_docs/`: durable project context and handoff state.
- `.github/workflows/`: verification and approved preview deployment automation.

## State and privacy

Compared text and option state live only in transient Preact component memory for the current page session. The comparator has no localStorage, sessionStorage, IndexedDB, cookie, URL-query, logging, analytics, backend, or fetch path for compared text. Refreshing the page clears entered text. The core engine remains deterministic and client-capable.

## Verification and Browser QA

GitHub Actions remains authoritative. `Verify project` runs committed-diff whitespace checking, `npm ci`, Astro/TypeScript checking, the Phase 1A core Vitest suite, and static build. Playwright then exercises the real comparator: controls, comparison output, ignore options, stale-result behavior, Swap, Clear, runtime/console errors, and horizontal overflow. Five standard viewports produce full-page screenshots in a meaningful compared-result state as the `browser-qa-screenshots` artifact.

## Development and deployment

The existing Cloudflare Pages Direct Upload architecture is unchanged. Same-repository PR previews remain gated behind `Verify project` and `Browser QA`, use branch `pr-<PR number>`, and receive an immutable URL plus stable alias. Live curl verification now checks durable Phase 1B product markers, HTTP 200, and `X-Robots-Tag: noindex`; browser interaction remains Playwright's responsibility.

Production deployment is still separately gated and not configured automatically. `compare.amosfot.in` remains planned only and is not attached; no DNS change is part of Phase 1B.
