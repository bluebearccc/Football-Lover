# Research: Match Viewing (004)

**Date**: 2026-06-22

## R1: Public vs. Admin Match Endpoints

**Decision**: Create a separate public matches module (`backend/src/modules/public-matches/`) with its own controller, service, repository, routes, and DTOs — mounted at `/api/v1/matches` without auth.

**Rationale**: The existing `matches` module is mounted under `/api/v1/admin/matches` with `authenticate + requireRole('ADMIN')`. Public endpoints need different logic: no auth, status-grouped sorting, prediction visibility rules (BR21/BR22), and different response shapes (include statistics, comments, public predictions). Sharing the repository layer for Prisma queries is acceptable, but the service and controller need independent logic.

**Alternatives considered**:
- Adding public routes to the existing admin module → rejected because it would require conditional auth middleware and mixing admin/public concerns in one controller.
- Creating a single shared service → rejected because public and admin list endpoints have different ordering (status-grouped vs. simple `matchTime desc`) and different include requirements.

## R2: Status-Grouped Sort Order

**Decision**: Implement status-grouped sorting at the service level by running a single query with `ORDER BY CASE status ... END, matchTime` via Prisma raw ordering or multiple queries per group.

**Rationale**: The clarified spec requires LIVE → SCHEDULED (soonest first) → FINISHED (most recent first) → CANCELLED. Prisma doesn't natively support `CASE` in `orderBy`, so the approach is:
1. Use `prisma.$queryRaw` with a `CASE WHEN` order clause, or
2. Execute separate queries per status group and merge in the service (simpler, pagination-aware).

Option 2 is simpler and avoids raw SQL, but complicates pagination. Option 1 keeps pagination simple with `skip/take`. Given that `$queryRaw` with status ordering is straightforward and the dataset is small (~50-100 matches), Option 1 with a Prisma `orderBy` array using a computed field is preferred. Alternatively, Prisma supports `orderBy` on enum fields sorted alphabetically — but the desired order doesn't match alphabetical enum order. The cleanest approach: query all matches for the page with `Prisma.sql` raw ordering in the repository.

**Final approach**: Use Prisma `$queryRaw` for the ordered list query to get correct status-grouped sorting with pagination, while keeping `findMany` for simpler queries.

## R3: Prediction Visibility Rules (BR21/BR22)

**Decision**: The public match detail service filters predictions based on match status and viewer identity at the service layer.

**Rationale**:
- SCHEDULED match: only return the current user's own predictions (if authenticated) or no predictions (if guest). Never expose other users' `selectedTeam`.
- LIVE/FINISHED match: return all predictions publicly.
- The service receives an optional `viewerId` (from JWT if present) and uses it to filter.
- Statistics (aggregated vote counts) are always public regardless of match status — they don't reveal individual predictions.

## R4: Frontend Routing and Component Structure

**Decision**: Create `/matches` (list) and `/matches/[id]` (detail) pages under `frontend/src/app/(main)/matches/`. Use the class diagram component structure: `MatchListPage → MatchFilterBar + MatchCard + MatchApiClient` and `MatchDetailPage → TeamInfoPanel + CriteriaList + StatsPanel + CommentList + MatchApiClient`.

**Rationale**: Follows UC03/UC04 frontend class diagrams. The `(main)` route group allows a shared layout with sidebar navigation (matching the Stitch mockup's side nav pattern). Pages are Server Components by default; filter bar and interactive elements use `'use client'`.

## R5: Token/Design System Gaps

**Decision**: No new tokens needed in `tailwind.config.ts`.

**Rationale**: The current `tailwind.config.ts` already includes all Elite Pitch colors, typography, spacing, and radius tokens used by both the `live_matches` and `match_details` mockups. The `live-glow` box-shadow is already present as `accent-glow`. The `glass` effect (backdrop-blur + semi-transparent bg) can be achieved with existing Tailwind utilities.
