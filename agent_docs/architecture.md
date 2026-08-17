# Architecture

## Application

- Astro is the static-first framework and production output is static.
- Preact is available only for necessary interactive islands; static content should remain Astro/HTML without gratuitous hydration.
- Tailwind CSS 4 is integrated through `@tailwindcss/vite`.
- TypeScript uses Astro's strict configuration with Preact JSX settings.
- Framework-independent application/domain logic belongs in `src/core/` and must not depend on Astro or Preact components.
- The text comparison domain now lives under `src/core/compare/`. JsDiff is used only as a low-level diff primitive and is wrapped behind project-owned types and `compareTexts`; UI code must consume the core API rather than JsDiff directly.
- Vitest provides deterministic unit verification for core domain behavior.

## Directory ownership

- `src/pages/`: route entry points.
- `src/layouts/`: shared Astro document/layout structure.
- `src/styles/`: global styling foundation.
- `src/core/`: framework-independent application/domain logic and its colocated unit tests.
- `tests/browser/`: Playwright browser-level QA for the built static application.
- `agent_docs/`: durable project context, architecture, decisions, progress, and handoff state.
- `.github/workflows/`: cloud verification and explicitly approved deployment automation.

## State and privacy

The approved MVP follows a local-first state principle. Compared user text stays client-side and is not persisted by default. The comparison engine has no persistence, logging, network, DOM, Astro, or Preact dependency. No backend is approved for the MVP.

## Verification and Browser QA

GitHub Actions is authoritative for deterministic verification. Core Vitest tests run in `Verify project` before the static build; a failure therefore blocks the downstream browser and preview stages. Playwright Chromium then exercises the built static Astro application served locally by Astro preview. The browser suite checks foundation rendering, browser runtime errors, console errors, and basic horizontal overflow across approved responsive viewports. Full-page desktop, tablet, and mobile screenshots are generated during CI and retained as GitHub Actions artifacts rather than committed repository assets. The existing browser/deployment architecture is unchanged by Phase 1A.

## Development and deployment

GitHub is the source of truth and GitHub Actions is authoritative for build, verification, browser QA, and approved deployment automation. Cloudflare Pages Direct Upload is the selected hosting model; Cloudflare Git integration is intentionally not used.

Same-repository pull requests targeting `main` may receive a Cloudflare Pages preview only after `Verify project` and `Browser QA` succeed. Preview deployments use the deterministic branch convention `pr-<PR number>`, producing an immutable deployment URL plus a stable branch alias suitable for Android manual QA. Fork-originated pull requests are explicitly excluded from the deployment job and therefore do not receive Cloudflare deployment credentials.

The Cloudflare Pages project's production branch metadata is `main`, but production deployment is not configured or executed. Production release remains separately gated and non-automatic. The planned future production custom domain is `compare.amosfot.in`; it is not attached and no DNS change is part of Phase 1A.
