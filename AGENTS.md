# Builder operating contract

- GitHub is authoritative. Inspect current GitHub state before editing and prefer repository state over conversational claims.
- Never modify `main` directly. Use bounded feature branches and Draft PRs.
- Do not merge without explicit Orchestrator approval. The Orchestrator independently reviews diffs and CI.
- Do not silently expand scope. Update durable documentation when project state or durable decisions change.
- Keep the application static-first with Astro. Use Preact only where actual interactivity requires it.
- Framework-independent application/domain logic belongs under `src/core/`.
- Do not add a backend, accounts, or authentication unless explicitly approved.
- Compared user text must remain client-side and must not be persisted by default.
- MVP must not include analytics, ads, tracking pixels, or behavioral tracking.
- Cloudflare and deployment changes require a later explicitly approved phase.
