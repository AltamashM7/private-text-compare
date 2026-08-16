# Private Text Compare

Private Text Compare is a privacy-first, client-side text comparison and diff checker. The approved MVP is intended for immediate use without accounts, with compared text remaining in the browser and not being persisted by default.

## Status

The repository is establishing its cloud-native project foundation. Product comparison logic and the product interface have not been implemented yet.

## Technology

- Astro, static-first
- Preact for interaction only where needed
- Tailwind CSS 4 via the Vite plugin
- strict TypeScript
- framework-independent application logic under `src/core/`

## Verification

GitHub is the source of truth and GitHub Actions is the cloud build/check environment for the mobile-only development workflow. See `agent_docs/` for durable project architecture, decisions, and progress.
