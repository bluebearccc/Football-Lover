# Research: Admin Dashboard

**Feature**: 011-admin-dashboard | **Date**: 2026-06-26

## R1: Admin Action Logging Strategy

**Decision**: Introduce an `AdminLog` model in Prisma schema with a lightweight logging middleware that intercepts admin route responses.

**Rationale**: The spec requires logging admin-triggered actions (match CRUD, criteria updates, user management) with 90-day retention. A dedicated database table is the simplest approach that integrates with the existing Prisma/PostgreSQL stack. No external logging service needed at this scale.

**Alternatives considered**:
- File-based logging (winston/pino to files) — rejected: harder to query for dashboard display, no built-in retention management
- Audit trail library (prisma-audit-log) — rejected: adds dependency complexity for a simple use case; the feature only needs admin-visible action logs, not field-level audit trails
- Existing Match/User tables — rejected: cannot derive admin action context (who did what, when) from entity state alone

**Implementation approach**:
- Express middleware (`admin-logger.ts`) placed after route handlers on admin routes to capture action, actor, and outcome
- Service method `adminLogService.create()` called by each admin controller action (match create/edit/settle, criteria update, user lock/unlock) after the action succeeds
- Cleanup: scheduled or on-read pruning of entries older than 90 days

## R2: Periodic Polling Strategy

**Decision**: Client-side `setInterval` with 30-second polling cycle calling the existing dashboard overview endpoint. Each section refreshes independently.

**Rationale**: The spec requires 30–60s auto-refresh. Client-side polling is the simplest approach that aligns with the existing REST architecture. No WebSocket infrastructure needed. The admin dashboard has low concurrent admin count (typically 1–3 admins), so server load from polling is negligible.

**Alternatives considered**:
- WebSocket/SSE push — rejected: over-engineered for 1–3 concurrent admins; adds infrastructure complexity
- React Query / SWR with refetchInterval — rejected: adds a new dependency; `useEffect` + `setInterval` achieves the same with zero new deps
- Service Worker background sync — rejected: unnecessary complexity

**Implementation approach**:
- `useEffect` with `setInterval(fetchDashboard, 30000)` in the admin page component
- Cleanup interval on unmount
- Show subtle "last updated" timestamp to give admin confidence data is fresh
- Independent error handling per section (one failing section doesn't block others)

## R3: Dynamic Traffic Chart Data

**Decision**: Backend aggregates prediction counts grouped by hour (last 24h) or by day (last 7d) from the Prediction table using Prisma raw query with `DATE_TRUNC`.

**Rationale**: Prediction count per time bucket is the most meaningful "traffic" metric for this platform. Hourly granularity for 24h view and daily for 7d view matches the mockup's bar chart. Raw SQL via `prisma.$queryRaw` is needed because Prisma's groupBy doesn't support date truncation natively.

**Alternatives considered**:
- Pre-aggregated materialized view — rejected: premature optimization for current scale
- Client-side aggregation (fetch all predictions, bucket in JS) — rejected: would send large payloads; aggregation belongs on the server
- Match count instead of prediction count — rejected: predictions represent user engagement better than match existence

## R4: League Popularity Breakdown

**Decision**: Derive league data from Match → Team relationship, counting predictions per match grouped by a league identifier. Since the current schema has no explicit `league` field on Match, use a pragmatic approach: group by match's teams' common league identifier from the api-football sync.

**Rationale**: The mockup shows "Top Performing Markets" with league names (Premier League, La Liga, etc.) and percentage bars. The current schema doesn't have a League entity, but matches synced from api-football carry league context via `externalId`. For v1, a simple grouping approach will be used.

**Alternatives considered**:
- Add League entity to schema — rejected: would require ER diagram update and stakeholder approval; deferred to a future schema iteration
- Hardcoded league list — rejected: not data-driven, breaks when new leagues are synced

**Implementation approach (v1 pragmatic)**:
- Since League entity doesn't exist yet, the "Top Performing Markets" section will initially show platform stats (active teams ratio, finished matches ratio, account safety, comment health) similar to the current implementation, but restructured as a stats panel
- Once a League entity is added in a future feature, the panel can be upgraded to show true league-based prediction breakdown
- This avoids introducing schema changes that aren't in the ER diagram (Constitution Principle I)

## R5: CSV Export

**Decision**: Server-side CSV generation endpoint that returns current dashboard metrics as a downloadable CSV file. No external library needed — CSV is simple enough to generate with string concatenation.

**Rationale**: CSV was chosen in spec clarification. Server-side generation ensures consistent formatting and avoids client-side data manipulation.

**Alternatives considered**:
- Client-side CSV generation (json2csv in browser) — rejected: requires shipping data + library to client; server-side is cleaner
- External library (csv-stringify, papaparse) — rejected: overkill for a simple metrics export; manual CSV string generation is sufficient for flat data

**Implementation approach**:
- New endpoint `GET /api/v1/admin/dashboard/export` returning `text/csv` with Content-Disposition header
- CSV includes: date range, metric name, metric value for each dashboard stat
- Accepts optional date range query params to match the filter

## R6: Date Range Filter

**Decision**: Query parameter-based filtering (`from`, `to` as ISO date strings) applied to all dashboard data endpoints. Frontend date picker UI sends the range to each API call.

**Rationale**: Simple, stateless approach that works with existing REST patterns. Each API call independently filters by the provided date range.

**Implementation approach**:
- Zod DTO for filter params: `{ from?: string (ISO date), to?: string (ISO date) }`
- Default: no filter (all-time for stats, last 24h for traffic chart)
- Applied to: overview stats, traffic chart, league breakdown, export
- Frontend: date picker component in the filter button area
