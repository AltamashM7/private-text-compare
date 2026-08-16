# Architecture

## Application

- Astro is the static-first framework and production output is static.
- Preact is available only for necessary interactive islands; static content should remain Astro/HTML without gratuitous hydration.
- Tailwind CSS 4 is integrated through `@tailwindcss/vite`.
- TypeScript uses Astro's strict configuration with Preact JSX settings.
- Framework-independent application/domain logic belongs in `src/core/` and must not depend on Astro or Preact components.

## Directory ownership

- `src/pages/`: route entry points.
- `src/layouts/`: shared Astro document/layout structure.
- `src/styles/`: global styling foundation.
- `src/core/`: framework-independent application/domain logic.
- `tests/browser/`: Playwright browser-level QA for the built static application.
- `agent_docs/`: durable project context, architecture, decisions, progress, and handoff state.
- `.github/workflows/`: cloud verification only unless a later phase explicitly approves deployment.

## State and privacy

The approved MVP follows a local-first state principle. Compared user text stays client-side and is not persisted by default. No backend is approved for the MVP.

## Browser QA

GitHub Actions provides browser-level QA with Playwright Chromium against the built static Astro application served locally by Astro preview. The browser suite checks foundation rendering, browser runtime errors, console errors, and basic horizontal overflow across approved responsive viewports. Full-page desktop, tablet, and mobile screenshots are generated during CI and retained as GitHub Actions artifacts rather than committed repository assets. The Orchestrator can retrieve those artifacts for visual review. This cloud browser QA complements later Android manual QA after a preview deployment exists.

## Development and deployment

GitHub is the source of truth. GitHub Actions is the cloud build/check/browser-QA environment for the mobile-only workflow. Cloudflare is not configured. Deployment architecture is deferred to the Phase 0E comparison/decision.
