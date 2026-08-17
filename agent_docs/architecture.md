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
- `.github/workflows/`: cloud verification and explicitly approved deployment automation.

## State and privacy

The approved MVP follows a local-first state principle. Compared user text stays client-side and is not persisted by default. No backend is approved for the MVP.

## Browser QA

GitHub Actions provides browser-level QA with Playwright Chromium against the built static Astro application served locally by Astro preview. The browser suite checks foundation rendering, browser runtime errors, console errors, and basic horizontal overflow across approved responsive viewports. Full-page desktop, tablet, and mobile screenshots are generated during CI and retained as GitHub Actions artifacts rather than committed repository assets. The Orchestrator can retrieve those artifacts for visual review. This cloud browser QA complements Android manual QA against Cloudflare preview deployments.

## Development and deployment

GitHub is the source of truth and GitHub Actions is authoritative for build, verification, browser QA, and approved deployment automation. Cloudflare Pages Direct Upload is the selected hosting model; Cloudflare Git integration is intentionally not used.

Same-repository pull requests targeting `main` may receive a Cloudflare Pages preview only after `Verify project` and `Browser QA` succeed. Preview deployments use the deterministic branch convention `pr-<PR number>`, producing an immutable deployment URL plus a stable branch alias suitable for Android manual QA. Fork-originated pull requests are explicitly excluded from the deployment job and therefore do not receive Cloudflare deployment credentials.

The Cloudflare Pages project's production branch metadata is `main`, but Phase 0E does not configure or execute production deployment. Production release remains separately gated and non-automatic. The planned future production custom domain is `compare.amosfot.in`; it is not attached in Phase 0E and no DNS change is part of this phase.
