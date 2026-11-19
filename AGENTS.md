# Project instructions

- This is an Astro + TypeScript app for Cloudflare Workers, styled with Tailwind CSS v4.
- Keep workflows as independent modules under `src/features/<workflow>/`. Pages compose feature entry points; they do not own data rules or integrations.
- Keep Astro responsible for document and route composition. Use React 19 islands and locally installed UIArc source components for the app's controls, cards, dialogs, and data summaries; keep workflow data rules in their feature modules.
- Keep the opportunity scrape grade separate from personal fit. No scoring or grading formula is defined.
- Treat all current records as fixtures. Do not imply Muse is connected or that the sample opportunities are real.
- Do not add live Muse ingestion, D1 schemas/migrations, Cloudflare Access configuration, deployment, CI, or additional dependencies without explicit user approval.
- Preserve the monochrome paper-and-ink visual direction in `.agents/DESIGN.md`.
- Use `bun run check` and `bun run build` for the requested code diagnostics; do not add a test suite unless asked.
