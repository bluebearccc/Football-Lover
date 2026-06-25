# Tasks: Gold Scoring & Payout

**Input**: Design documents from `specs/006-gold-scoring/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/scoring-api.md

**Tests**: Not explicitly requested — test tasks omitted. Validation via quickstart.md scenarios.

**Organization**: Tasks grouped by user story. US1 (Scoring) and US2 (Payout) are grouped because they execute in the same atomic transaction. US4 (Notifications) is already fully implemented — no tasks needed.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/`
- **Modules**: `backend/src/modules/<name>/`
- **Routes**: `backend/src/routes/`
- **Utils**: `backend/src/utils/`

---

## Phase 1: Foundational Fix

**Purpose**: Fix the shared decimal utility that affects gold payout rounding for all stories

**⚠️ CRITICAL**: This fix must be applied before any scoring validation

- [x] T001 Change rounding mode from `ROUND_HALF_UP` to `ROUND_DOWN` in `splitTwoDecimals` function at `backend/src/utils/decimal.ts` line 22. Replace `Prisma.Decimal.ROUND_HALF_UP` with `Prisma.Decimal.ROUND_DOWN` to ensure floor rounding per FR-GS-004. This guarantees sum of payouts never exceeds the pool.

**Checkpoint**: `splitTwoDecimals(new Prisma.Decimal(100), 3)` should return `33.33` (not `33.34`).

---

## Phase 2: User Story 1+2 — Scoring & Gold Payout (Priority: P1) 🎯 MVP

**Goal**: When a match transitions to Finished, the system scores all participants and distributes gold. This is already implemented in `backend/src/modules/scoring/`. The rounding fix in Phase 1 is the only code change needed.

**Independent Test**: Create a match with criteria, have users predict, Admin sets all criterion results then calls `PUT /api/v1/admin/matches/:id/result`. Verify MatchParticipation records are created with correct scores, winners determined (highest score ≥ 1), and gold_won values use floor rounding.

### Implementation for US1+US2

- [x] T002 [US1] Verify scoring service idempotency: review `backend/src/modules/scoring/scoring.service.ts` — confirm `hasParticipations` guard at line 90 prevents duplicate scoring. No code change expected; document verification in commit message.
- [x] T003 [US2] Verify gold payout logic in `backend/src/modules/scoring/gold-payout.service.ts` — confirm pool calculation (`entry_gold × participants`), winner determination (highest score ≥ 1), and that `splitTwoDecimals` (now using ROUND_DOWN from T001) is called correctly. No code change expected; document verification.
- [x] T004 [US1] Verify criteria resolution gate in `backend/src/modules/matches/matches.service.ts` lines 112–119 — confirm `updateResult` blocks scoring when any criterion lacks `resultTeam`, throwing a 400 error listing unresolved criteria names per FR-GS-016. No code change expected.

**Checkpoint**: US1+US2 scoring, payout, and blocking logic verified. Test via `PUT /api/v1/admin/matches/:id/result` per quickstart.md Scenarios 1–4 and 6.

---

## Phase 3: User Story 3 — Match Cancellation Voids All Results (Priority: P2)

**Goal**: When Admin cancels a match (including a previously Finished one), void all MatchParticipation results and subtract totalPoints from each participant.

**Independent Test**: Score a match (Finished), then cancel it via `POST /api/v1/admin/matches/:id/cancel`. Verify participations deleted, predictions reset, totalPoints decremented, and MATCH_CANCELLED notifications created.

### Implementation for US3

- [x] T005 [US3] Update `applyCancel` method in `backend/src/modules/scoring/scoring.repository.ts` to subtract `User.totalPoints` before deleting participations. Within the existing `prisma.$transaction`: (1) Query existing MatchParticipation records for this match to get per-user scores, (2) For each participation with `score > 0`, decrement `User.totalPoints` by that score using `tx.user.update({ where: { id }, data: { totalPoints: { decrement: score } } })`, (3) Then proceed with existing deleteMany/updateMany/notification logic. This fulfills FR-GS-009 and FR-GS-017.

**Checkpoint**: Cancel a previously-scored match. Verify `User.totalPoints` decreased by each user's match score. Test via quickstart.md Scenario 5.

---

## Phase 4: User Story 5 — Leaderboard Win Count (Priority: P3)

**Goal**: Provide a public API endpoint returning monthly win-count rankings. Only wins from matches with ≥ 2 participants count. Month boundaries use Asia/Ho_Chi_Minh timezone.

**Independent Test**: Score multiple matches with various participant counts, then query `GET /api/v1/leaderboard?month=6&year=2026`. Verify rankings exclude wins from single-participant matches and respect timezone boundaries.

> **Note**: User Story 4 (Win/Lose Notifications) is already fully implemented in the scoring transaction (`backend/src/modules/scoring/notification.service.ts`). No tasks needed — MATCH_WON and MATCH_LOST notifications are created as part of `applyScoring`. Verified during US1+US2 checkpoint.

### Implementation for US5

- [x] T006 [P] [US5] Create `backend/src/modules/leaderboard/leaderboard.dto.ts` with Zod schema for leaderboard query params: `month` (number, 1–12, default current month), `year` (number, default current year), `limit` (number, 1–100, default 20). Export `leaderboardQuerySchema` and `LeaderboardQuery` type.
- [x] T007 [P] [US5] Create `backend/src/modules/leaderboard/leaderboard.repository.ts` with a `getMonthlyWins` method. Query `MatchParticipation` where `is_winner = true`, joined to `Match` where `status = FINISHED`. Use a subquery or having clause to filter matches with ≥ 2 participations (BR29). Use PostgreSQL `AT TIME ZONE 'Asia/Ho_Chi_Minh'` on the match's `created_at` (from the participation) or match scoring timestamp to determine month boundaries (FR-GS-014). Group by `user_id`, count wins, join `User` for `display_name` and `total_points`. Order by win count descending, then `total_points` descending as tiebreak. Limit results. Use Prisma `$queryRaw` for the timezone-aware query.
- [x] T008 [US5] Create `backend/src/modules/leaderboard/leaderboard.service.ts` that validates month/year params (throw `ApiError.badRequest` for invalid values), calls repository, and returns formatted rankings with `rank` field (computed from position, accounting for ties).
- [x] T009 [US5] Create `backend/src/modules/leaderboard/leaderboard.controller.ts` with a `getLeaderboard` handler that parses validated query params and calls the service. Response format per `contracts/scoring-api.md`: `{ month, year, timezone, rankings: [{ rank, userId, displayName, winCount, totalPoints }] }`.
- [x] T010 [US5] Create `backend/src/modules/leaderboard/leaderboard.routes.ts`. Export `leaderboardRoutes` as a Router. Mount `GET /` with `validateQuery(leaderboardQuerySchema)` and `wrap(leaderboardController.getLeaderboard)`. No auth required (public endpoint).
- [x] T011 [US5] Mount leaderboard routes in `backend/src/routes/index.ts` — add `import { leaderboardRoutes } from '../modules/leaderboard/leaderboard.routes'` and `router.use('/leaderboard', leaderboardRoutes)`.

**Checkpoint**: `GET /api/v1/leaderboard?month=6&year=2026` returns rankings. Test via quickstart.md Scenario 7.

---

## Phase 5: Public Match Results Endpoint

**Purpose**: Add a public endpoint to view scoring results for a finished match.

- [x] T012 [P] Add a `getMatchResults` method to `backend/src/modules/public-matches/public-matches.repository.ts` (or create if needed). Query `MatchParticipation` for a given match joined to `User` (for `display_name`), plus `Match` fields (`entry_gold`, `status`). Return null if match not found or status is not FINISHED.
- [x] T013 Add a `getMatchResults` handler to `backend/src/modules/public-matches/public-matches.controller.ts` (or the service+controller chain). Compute derived fields: `pool` (entry_gold × participantCount), `winnerCount`, `goldPerWinner`. Format gold values to 2 decimal places. Return 404 if match not FINISHED.
- [x] T014 Add route `GET /:id/results` to `backend/src/modules/public-matches/public-matches.routes.ts`. No auth required. Response format per `contracts/scoring-api.md`.

**Checkpoint**: `GET /api/v1/matches/:id/results` returns participant scores and gold for a FINISHED match. Returns 404 for non-FINISHED matches. Test via quickstart.md Scenario 8.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Build verification and final validation

- [x] T015 Run `npm run build` in `backend/` to verify all TypeScript compiles without errors (Principle V quality gate).
- [x] T016 Run `npm run lint` in `backend/` to verify no lint violations (Principle V quality gate).
- [x] T017 Run quickstart.md validation Scenarios 1–8 against the running backend to verify end-to-end behavior.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Foundational Fix)**: No dependencies — start immediately
- **Phase 2 (US1+US2 Scoring/Payout)**: Depends on Phase 1 (rounding fix)
- **Phase 3 (US3 Cancellation)**: Depends on Phase 1 only (independent of Phase 2)
- **Phase 4 (US5 Leaderboard)**: Depends on Phase 1 only (new module, no dependency on other phases)
- **Phase 5 (Public Results)**: Depends on Phase 1 only (reads MatchParticipation data)
- **Phase 6 (Polish)**: Depends on all previous phases

### User Story Dependencies

- **US1+US2 (P1)**: Can start after Phase 1 — no dependencies on other stories
- **US3 (P2)**: Can start after Phase 1 — independent of US1+US2 (modifies different method)
- **US4 (P2)**: Already complete — no tasks needed
- **US5 (P3)**: Can start after Phase 1 — completely independent (new module)

### Within Each Phase

- Tasks marked [P] can run in parallel
- Non-[P] tasks depend on preceding tasks within their phase

### Parallel Opportunities

- After Phase 1 completes, Phases 2, 3, 4, and 5 can ALL run in parallel
- Within Phase 4 (Leaderboard): T006 and T007 can run in parallel (different files)
- Within Phase 5: T012 can run in parallel with T006/T007 from Phase 4

---

## Parallel Example: Phase 4 (Leaderboard)

```text
# Launch DTO and repository in parallel (different files, no dependencies):
T006: "Create leaderboard.dto.ts with Zod schema"
T007: "Create leaderboard.repository.ts with monthly wins query"

# Then sequentially:
T008: "Create leaderboard.service.ts" (depends on T006, T007)
T009: "Create leaderboard.controller.ts" (depends on T008)
T010: "Create leaderboard.routes.ts" (depends on T009)
T011: "Mount routes in index.ts" (depends on T010)
```

---

## Implementation Strategy

### MVP First (US1+US2 Only)

1. Complete Phase 1: Fix rounding (1 line change)
2. Complete Phase 2: Verify scoring/payout (already implemented)
3. **STOP and VALIDATE**: Test Scenarios 1–4, 6 from quickstart.md
4. Core gold scoring is ready for use

### Incremental Delivery

1. Phase 1 → Rounding fix applied
2. Phase 2 → US1+US2 verified → Scoring/Payout works (MVP!)
3. Phase 3 → US3 → Cancellation with totalPoints reversal works
4. Phase 4 → US5 → Leaderboard endpoint available
5. Phase 5 → Public match results endpoint
6. Phase 6 → Build/lint pass, full validation

### Parallel Strategy

After Phase 1 (single line fix), all remaining phases are independent:
- Developer A: Phase 2 (verify) + Phase 3 (cancel fix)
- Developer B: Phase 4 (leaderboard module)
- Developer C: Phase 5 (public results endpoint)

---

## Notes

- Most scoring logic already exists in `backend/src/modules/scoring/`. This feature is primarily fixes + 1 new module.
- US4 (Notifications) requires zero code changes — it was built as part of the scoring transaction.
- The rounding fix (T001) is the only change that affects existing behavior.
- The totalPoints fix (T005) adds new behavior to an existing method.
- The leaderboard module (T006–T011) is entirely new code following existing patterns.
