# Private Text Compare

Private Text Compare is a privacy-first, client-side text comparison and diff checker. It is designed for immediate use without accounts, with compared text remaining in the browser and not being persisted by default.

## Status

The current product includes working Original/Changed text comparison, line- and inline-level diff presentation, ignore-case and ignore-surrounding-whitespace options, Swap and Clear, stale-result safety, local Copy diff, local `.diff` download, and local plain-text report download.

The interface is responsive in Dark and Light themes, uses self-hosted Geist typography, and remains static-first. Permanent GitHub Actions verification covers type/build/unit/browser QA, while Cloudflare Pages Direct Upload provides gated pull-request previews.

## Technology

- Astro, static-first
- Preact for interaction only where needed
- Tailwind CSS 4 via the Vite plugin
- strict TypeScript
- framework-independent comparison and export logic under `src/core/`

## Verification

GitHub is the source of truth and GitHub Actions is the shared build/check environment. See `agent_docs/` for durable project architecture, decisions, and progress.
