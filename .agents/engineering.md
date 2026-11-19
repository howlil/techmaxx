# Engineering

## System
Astro server-rendered app on Cloudflare Workers with React 19 islands for UIArc source components. First slice is UI plus typed fixture data; no live ingest, D1 binding, or persisted server state.

## Structure
- `src/pages/`: route and page composition only.
- `src/layouts/`: Astro document and route metadata.
- `src/components/arc/`: UIArc source installed from the public registry.
- `src/components/app-shell/`: Astro shell and shared React heading and fixture-notice components.
- `src/features/opportunities/`: opportunity model, fixture repository, React view state, and presentational components.
- `src/features/scrape-runs/`: run fixtures and React history view.
- `src/styles/`: Tailwind v4 import and semantic theme tokens.
- Dependencies point from Astro routes to feature entry points; React presentation composes UIArc components, while feature modules keep fixture data and browser state.

## Responsibilities
R1 (B1-B3): opportunities feature owns typed records, filtering semantics, and the opportunity view.
R2 (B4): scrape-runs feature owns run summaries and the history route.
R3 (B1-B4): app shell owns shared navigation and page framing.
R4 (C1): deployment policy must put Cloudflare Access in front of the Worker before live data is used.

## State
S1: opportunity and run records | owner: fixture repositories for this slice | immutable sample data.
S2: search, filters, sort, selected record, detail visibility | owner: feature React island; derived result list is recomputed.
S3: saved and reviewed IDs | owner: browser localStorage for this UI slice; replace with D1 only after schema approval.
S4: future live opportunity records | owner: D1, not implemented; one writer is the authenticated ingestion path.

## Contracts
K1: page → opportunity feature → typed fixture repository → render; feature rules do not depend on Astro request objects.
K2: UIArc Card selection opens its quick-look dialog; the dialog receives the same record as its card and exposes a close action.
K3: `/runs` renders the run feature's selected fixture summary.
DEC1 [two-way]: Astro owns the document and routes; React 19 islands own interactive feature views.
DEC2 [two-way]: install free UIArc source through the public shadcn registry; keep business rules and persistence in the app-owned feature modules.
D1: D1 schema, ingestion endpoint, and production Access policy remain unimplemented until the user approves the schema/migration and the Muse transport is known.
DEP1: Astro + Cloudflare adapter + Tailwind v4 + React integration | reuse | build fails closed when installation/configuration is incomplete | Cloudflare Workers | low exit cost.

## Flows
F1 (B1-B3): route loads typed fixtures → browser applies search/filter/sort → card selection reveals evidence detail → close returns to the list.
F2 (B4): /runs loads run fixtures → selecting a row updates the run summary.
F3 (future): Muse/adapter → authenticated ingestion endpoint → validation → D1 transaction → opportunity/run view. Not active in this slice.

## Guarantees
G1 (B1-B3,C3): fit score and scrape-quality grade remain separate fields and render separately.
G2 (X2): unknown eligibility stays reviewable; no automatic conversion to eligible.
G3 (C1,A3): no real records or credentials are shipped in the fixture app; deployment with live data is blocked until Cloudflare Access is configured.

## Challenge
| Flow | Failure / threat | Containment | Detection | Recovery |
|---|---|---|---|---|
| F1 | No matching records or malformed fixture | Empty state; typecheck/build catches shape errors | `bun run check` | Reset filters |
| F3 (future) | Unauthorized or duplicate ingest | Server auth, validation, uniqueness/idempotency in an approved schema | API/D1 integration proof, not present yet | Retry after contract is approved |

## Decisions
DEC3 [two-way]: use Cloudflare Workers target, not Pages, because future server endpoints and bindings belong in the Worker deployment.
DEC4 [two-way]: compose the app with free UIArc source components and semantic tokens; use native anchors for route navigation and keep the shell structure app-owned.
DEC5 [two-way]: disable Astro sessions and use the passthrough image service because this slice has no server session or image transforms; do not provision KV or Images bindings yet.

## Verification
- `bun run check` proves Astro/TypeScript diagnostics at iter.
- `bun run build` proves the Cloudflare Worker artifact builds at iter.
- No test suite or browser harness is added for this UI-only fixture slice.

## Release
Not deployed. Before real data: approve D1 migration, verify Muse request capability, set ingestion secret, and configure Cloudflare Access to allow only the owner.

## Assumptions / Risks
A1-A3 are in `.agents/product.md`. Main risks: Muse may not call the endpoint directly; D1 semantics are not yet approved; Access is external configuration and has not been applied.
