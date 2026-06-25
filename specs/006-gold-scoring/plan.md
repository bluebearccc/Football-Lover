# Implementation Plan: Gold Scoring & Payout

**Branch**: `006-gold-scoring` | **Date**: 2026-06-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/006-gold-scoring/spec.md`

## Summary

Implement the gold scoring engine that runs when a match transitions to FINISHED: compute per-participant scores, determine winners, calculate gold payout with floor rounding, update totalPoints, and send win/lose notifications — all within a single atomic transaction. Also fix two gaps in the existing scoring module (rounding mode + totalPoints reversal on cancellation), and add a public leaderboard endpoint for monthly win counts.

The scoring module (`backend/src/modules/scoring/`) is already 90% implemented. This plan covers the remaining gaps and the new leaderboard module.

## Technical Context

**Language/Version**: TypeScript 5.x (Node.js backend)

**Primary Dependencies**: Express 4.x, Prisma 6.x, Zod (validation)

**Storage**: PostgreSQL via Prisma ORM. Gold stored as `Decimal(12,2)`, never `number`.

**Testing**: Manual validation via API (see [quickstart.md](quickstart.md)); automated tests not yet established.

**Target Platform**: Linux/Windows server (Node.js)

**Project Type**: Web service (REST API backend)

**Performance Goals**: Scoring completes within 2 seconds for 50 participants × 10 criteria (SC-001).

**Constraints**: All gold arithmetic via `Prisma.Decimal`; floor rounding (ROUND_DOWN) for payout division; single `prisma.$transaction` for atomicity.

**Scale/Scope**: ~100 users, ~50 matches, 5–10 criteria/match, 5–20 concurrent users.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Spec-Driven Development — PASS

All changes trace to spec functional requirements (FR-GS-001 through FR-GS-018) which trace to SRS business rules (BR12–BR14, BR20, BR26–BR30).

### Principle II: Layered Architecture & Module Structure — PASS

- Existing scoring module follows `service → repository` pattern (no controller — invoked by matches service internally).
- New leaderboard module will follow the standard `controller → service → repository → routes → dto` pattern.

### Principle III: Contract-First APIs & Validation — PASS

- Existing endpoints already validated with Zod DTOs.
- New leaderboard endpoint will use Zod validation for query params.
- Errors use `ApiError` throughout.

### Principle IV: Frontend Discipline — N/A

No frontend changes — UI baseline N/A. This feature is backend-only. Frontend display of scoring results is handled by existing match detail screens (UC04) and future leaderboard screen (UC09).

### Principle V: Quality Gates & Traceability — PASS

After changes: `npm run build` (typecheck) and `npm run lint` in `backend/` must pass.

## Project Structure

### Documentation (this feature)

```text
specs/006-gold-scoring/
├── plan.md              # This file
├── research.md          # Phase 0: gap analysis and decisions
├── data-model.md        # Phase 1: entity details and state transitions
├── quickstart.md        # Phase 1: validation scenarios
├── contracts/
│   └── scoring-api.md   # Phase 1: API endpoint contracts
└── tasks.md             # Phase 2 output (via /speckit-tasks)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── modules/
│   │   ├── scoring/                    # EXISTING — 2 fixes needed
│   │   │   ├── scoring.service.ts      # No changes
│   │   │   ├── gold-payout.service.ts  # No changes
│   │   │   ├── notification.service.ts # No changes
│   │   │   └── scoring.repository.ts   # FIX: add totalPoints decrement in applyCancel
│   │   ├── matches/                    # EXISTING — no changes
│   │   │   ├── matches.service.ts      # Already triggers scoring/cancel correctly
│   │   │   └── ...
│   │   └── leaderboard/               # NEW module
│   │       ├── leaderboard.controller.ts
│   │       ├── leaderboard.service.ts
│   │       ├── leaderboard.repository.ts
│   │       ├── leaderboard.routes.ts
│   │       └── leaderboard.dto.ts
│   ├── utils/
│   │   └── decimal.ts                 # FIX: change ROUND_HALF_UP → ROUND_DOWN
│   └── routes/
│       └── index.ts                   # ADD: mount leaderboard routes
```

**Structure Decision**: Backend-only changes. Two fixes to existing files, one new module following the established layered pattern.

## Implementation Tasks

### Task 1: Fix rounding mode (FR-GS-004)

**File**: `backend/src/utils/decimal.ts` line 22
**Change**: `Prisma.Decimal.ROUND_HALF_UP` → `Prisma.Decimal.ROUND_DOWN`
**Impact**: Ensures `gold_won` is floored, sum of payouts never exceeds pool.

### Task 2: Add totalPoints decrement on cancellation (FR-GS-009, FR-GS-018)

**File**: `backend/src/modules/scoring/scoring.repository.ts` — `applyCancel` method
**Change**:
1. Before deleting MatchParticipation records, read them to get per-user scores
2. For each participation with `score > 0`, decrement `User.totalPoints` by that score
3. All within the existing `prisma.$transaction`

### Task 3: New leaderboard module (FR-GS-012, FR-GS-014)

**Files**: New `backend/src/modules/leaderboard/` with standard module structure.

**leaderboard.dto.ts**: Zod schema for query params (month, year, limit).

**leaderboard.repository.ts**: Query `MatchParticipation` for monthly wins:
- Filter: `is_winner = true`
- Join Match: check `status = FINISHED`
- Subquery/having: match must have ≥ 2 participations (BR29)
- Month boundary: use PostgreSQL `AT TIME ZONE 'Asia/Ho_Chi_Minh'` on the match scoring timestamp
- Group by user, count wins, order descending

**leaderboard.service.ts**: Validate month/year, delegate to repository, format response.

**leaderboard.controller.ts**: Handle GET request, call service.

**leaderboard.routes.ts**: Mount as public (no auth required).

### Task 4: Public match results endpoint

**Files**: Extend `backend/src/modules/public-matches/` with a results endpoint.
- `GET /api/v1/matches/:id/results` — returns participant list with scores, winners, gold for FINISHED matches.

### Task 5: Route mounting

**File**: `backend/src/routes/index.ts`
- Mount leaderboard routes at `/leaderboard`

### Task 6: Build & lint verification

Run `npm run build` and `npm run lint` in `backend/` to verify all changes typecheck and pass linting.

## Complexity Tracking

No constitution violations. All changes follow existing patterns.
