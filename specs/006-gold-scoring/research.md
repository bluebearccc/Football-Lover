# Research: Gold Scoring & Payout

**Date**: 2026-06-23 | **Feature**: 006-gold-scoring

## Existing Implementation Audit

### Decision: Scoring module already exists and is largely complete

**Rationale**: The `backend/src/modules/scoring/` module contains four files that implement the core scoring, payout, notification, and repository layers:
- `scoring.service.ts` — orchestrates scoring with idempotency guard
- `gold-payout.service.ts` — pool calculation, winner determination, gold distribution
- `notification.service.ts` — builds MATCH_WON/MATCH_LOST notification plans
- `scoring.repository.ts` — atomic transaction applying all changes

The match service (`modules/matches/matches.service.ts`) already triggers scoring via `updateResult()` and cancellation via `cancel()`. Criteria resolution is validated before allowing scoring (line 112–119).

**Alternatives considered**: Building from scratch — rejected because the implementation closely matches the spec requirements (BR12, BR13, BR26–BR28, BR30).

## Gap Analysis

### Gap 1: Rounding mode mismatch

**Decision**: Change `ROUND_HALF_UP` to `ROUND_DOWN` (floor) in `splitTwoDecimals`

**Rationale**: Spec clarification (Session 2026-06-23) explicitly chose floor rounding. Current code at `backend/src/utils/decimal.ts:22` uses `Prisma.Decimal.ROUND_HALF_UP`. Floor rounding ensures total payouts never exceed the pool.

**Location**: `backend/src/utils/decimal.ts` line 22 — change `ROUND_HALF_UP` → `ROUND_DOWN`

### Gap 2: totalPoints not subtracted on cancellation

**Decision**: Add `User.totalPoints` decrement in `applyCancel` transaction

**Rationale**: Spec FR-GS-009 and clarification Q4 require subtracting each participant's match score from `User.totalPoints` when a match is cancelled. Current `applyCancel` deletes participations and resets predictions but does not touch `User.totalPoints`.

**Location**: `backend/src/modules/scoring/scoring.repository.ts` — `applyCancel` method needs to:
1. Read existing MatchParticipation records before deleting to get per-user scores
2. Decrement `User.totalPoints` by each participant's score within the transaction

### Gap 3: No leaderboard query endpoint

**Decision**: Create a leaderboard service + endpoint as part of this feature (minimal version)

**Rationale**: FR-GS-012 and FR-GS-014 require the leaderboard to only count wins from matches with ≥ 2 participants, computed in Asia/Ho_Chi_Minh timezone. No leaderboard code exists yet. This is a new module or an extension of the existing dashboard.

**Approach**: Add a `leaderboard` module (`backend/src/modules/leaderboard/`) with a public GET endpoint that queries MatchParticipation for monthly wins. The query will:
- Filter by `is_winner = true`
- Join to Match to check participant count ≥ 2
- Group by user, count wins in the current month (Asia/Ho_Chi_Minh)
- Sort descending by win count

### Gap 4: No notification reading endpoints

**Decision**: Defer to a separate feature (UC14 Notifications)

**Rationale**: The scoring module already creates notification records. Reading/marking-read notifications is a distinct user-facing feature (UC14) that spans beyond gold scoring. Creating notifications is in-scope; reading them is not.

**Alternatives considered**: Building a minimal notification read endpoint — rejected to keep feature scope focused on scoring/payout.

## Technology Decisions

### Decimal Rounding

**Decision**: Use `Prisma.Decimal.ROUND_DOWN` (floor) for gold payout division

**Rationale**: Per clarification, remainder from indivisible splits is silently discarded. `ROUND_DOWN` truncates toward zero, ensuring `sum(payouts) <= pool` always holds.

### Timezone Handling for Leaderboard

**Decision**: Use `date-fns-tz` (already in project dependencies) for Asia/Ho_Chi_Minh month boundary calculation

**Rationale**: Leaderboard month boundaries must be computed in Asia/Ho_Chi_Minh timezone (UTC+7). The backend stores timestamps in UTC; the leaderboard query needs to convert match finish times to local TZ to determine which month they belong to. PostgreSQL's `AT TIME ZONE` can handle this at the query level.

**Alternatives considered**: Computing in JS with manual offset — rejected because PostgreSQL `AT TIME ZONE` is more efficient for aggregate queries.

### Transaction Scope

**Decision**: Keep single-transaction approach for both scoring and cancellation

**Rationale**: All scoring writes (participations, predictions, notifications, user totalPoints, match status) must be atomic. The existing `prisma.$transaction` approach is correct. Cancellation needs the same atomicity, now including totalPoints decrement.
