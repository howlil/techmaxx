# Engineering

## System
Astro server-rendered app on Cloudflare Workers with React 19 islands for UIArc source components. The app has an authenticated Muse ingest boundary, D1 persistence, and D1-backed reads; routes use typed fixtures only when no D1 binding is available.

## Structure
- `src/pages/`: route and page composition only.
- `src/layouts/`: Astro document and route metadata.
- `src/components/arc/`: UIArc source installed from the public registry.
- `src/components/app-shell/`: Astro shell and shared React heading and fixture-notice components.
- `src/features/opportunities/`: opportunity model, fixture repository, React view state, and presentational components.
- `src/features/scrape-runs/`: run fixtures and React history view.
- `src/features/muse-ingest/`: v1 Muse payload validation, bearer-token checks, D1 writes, idempotency, and live read mapping.
- `src/pages/api/`: server-only API route composition for ingestion.
- `migrations/`: D1 schema and indexes for runs, opportunities, and ingest receipts.
- `wrangler.deploy.jsonc`: explicit Worker deployment config kept separate from Astro's build discovery.
- `src/styles/`: Tailwind v4 import and semantic theme tokens.
- Dependencies point from Astro routes to feature entry points; React presentation composes UIArc components, while feature modules keep data rules and browser state. The API route depends on the Muse feature, never on React.

## Responsibilities
R1 (B1-B3): opportunities feature owns typed records, filtering semantics, and the opportunity view.
R2 (B4): scrape-runs feature owns run summaries and the history route.
R3 (B1-B4): app shell owns shared navigation and page framing.
R4 (C1): deployment policy must put Cloudflare Access in front of the Worker before live data is used.
R5 (live reads): opportunity and run repositories choose D1 when the binding exists and fixtures when it does not; a bound D1 error is not silently replaced with fixtures.
R6 (ingest): Muse feature owns authentication, payload validation, idempotency, and the atomic D1 batch write.

## State
S1: opportunity and run records | owner: D1 when bound, fixture repositories otherwise | D1 is the live source of truth; fixture records are immutable sample data.
S2: search, filters, sort, selected record, detail visibility | owner: feature React island; derived result list is recomputed.
S3: saved and reviewed IDs | owner: browser localStorage for this UI slice; replace with D1 only after schema approval.
S4: live opportunity and run records | owner: D1; one writer is the authenticated ingestion path, with upserts keyed by external IDs.

## Contracts
K1: page → opportunity feature → D1-or-fixture repository → render; feature rules do not depend on Astro request objects.
K2: UIArc Card selection opens its quick-look dialog; the dialog receives the same record as its card and exposes a close action.
K3: `/runs` renders the run feature's selected fixture summary.
K4: `POST /api/ingest/muse` → bearer auth → JSON/schema validation → idempotency lookup → one D1 batch → 202/200 result; invalid or unauthorized input never reaches the write.
K5: a missing D1 binding selects fixtures; a D1 read or write error is surfaced and never silently treated as fixture success.
DEC1 [two-way]: Astro owns the document and routes; React 19 islands own interactive feature views.
DEC2 [two-way]: install free UIArc source through the public shadcn registry; keep business rules and persistence in the app-owned feature modules.
D1: the v1 D1 schema and ingestion endpoint are implemented and migrated locally/remotely; real Muse transport compatibility, the production token, and Cloudflare Access policy remain external gates.
DEP1: Astro + Cloudflare adapter + Tailwind v4 + React integration | reuse | build fails closed when installation/configuration is incomplete | Cloudflare Workers | low exit cost.

## Flows
F1 (B1-B3): route loads typed fixtures → browser applies search/filter/sort → card selection reveals evidence detail → close returns to the list.
F2 (B4): /runs loads run fixtures → selecting a row updates the run summary.
F3: Muse/adapter → authenticated ingestion endpoint → validation → idempotency lookup → D1 batch → opportunity/run view. The endpoint is active locally and awaits verified Muse transport plus production secret/Access configuration.

## Guarantees
G1 (B1-B3,C3): fit score and scrape-quality grade remain separate fields and render separately.
G2 (X2): unknown eligibility stays reviewable; no automatic conversion to eligible.
G3 (C1,A3): no real records or credentials are shipped in the fixture app; deployment with live data is blocked until Cloudflare Access is configured.
G4 (K4): ingest authentication fails closed, payloads are bounded/allowlisted, and duplicate deliveries do not create new records.

## Challenge
| Flow | Failure / threat | Containment | Detection | Recovery |
|---|---|---|---|---|
| F1 | No matching records or malformed fixture | Empty state; typecheck/build catches shape errors | `bun run check` | Reset filters |
| F3 | Unauthorized, malformed, or duplicate ingest | Bearer auth, bounded allowlist validation, parameterized D1 batch, uniqueness/idempotency | Local endpoint smoke plus D1 migration proof; real Muse delivery still unverified | Retry same payload with same key; conflict requires a new key and corrected payload |

## Decisions
DEC3 [two-way]: use Cloudflare Workers target, not Pages, because future server endpoints and bindings belong in the Worker deployment.
DEC4 [two-way]: compose the app with free UIArc source components and semantic tokens; use native anchors for route navigation and keep the shell structure app-owned.
DEC5 [two-way]: disable Astro sessions and use the passthrough image service because this slice has no server session or image transforms; do not provision KV or Images bindings yet.
DEC6 [two-way]: keep deploy-only Wrangler config in `wrangler.deploy.jsonc` so Astro does not consume an incomplete binding config during its build; all D1 commands use that explicit config.

## Verification
- `bun run check` proves Astro/TypeScript diagnostics at iter.
- `bun run build` proves the Cloudflare Worker artifact builds at iter.
- `bun run db:migrate:local` and `bun run db:migrate:remote` prove the D1 migration applies in both targets.
- A bounded local HTTP smoke proves accepted ingest, duplicate replay, and missing-auth rejection; no browser harness or general test suite is added.

## Release
Not deployed. D1 migration is applied in the remote database, but before real data: verify Muse request capability, set `MUSE_INGEST_TOKEN`, configure Cloudflare Access to allow only the owner, then deploy and verify the public Worker URL.

## Assumptions / Risks
A1-A3 are in `.agents/product.md`. Main risks: Muse may not call the v1 endpoint directly; the production token is not configured; Access is external configuration and has not been applied.
