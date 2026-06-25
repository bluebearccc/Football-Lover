# Tasks: Statistics & Leaderboard

**Input**: Design documents from `specs/008-stats-leaderboard/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/leaderboard-api.md, quickstart.md

**Tests**: Not explicitly requested — test tasks omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Tailwind tokens and frontend API client needed by all leaderboard UI work

- [X] T001 Add podium gradient color tokens (`podium-gold: #FFD700`, `podium-silver: #C0C0C0`, `podium-bronze: #CD7F32`) to `frontend/tailwind.config.ts`
- [X] T002 [P] Create leaderboard API client with `getLeaderboard(query)` and `getMyRank(query)` methods in `frontend/src/api/leaderboard.ts`, following the pattern in `frontend/src/api/matches.ts`

---

## Phase 2: Foundational (Backend Leaderboard Extension)

**Purpose**: Extend the existing `backend/src/modules/leaderboard/` module with accuracy, win streak, pagination, tiebreaker, and `/me` endpoint — MUST complete before any user story frontend work

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Extend `leaderboard.dto.ts` in `backend/src/modules/leaderboard/leaderboard.dto.ts`: add `page` (int, default 1, min 1) and `pageSize` (int, default 20, min 1, max 100) to query schema replacing the current `limit` param; add response type interfaces for `RankedEntry` (with `accuracy: number | null` and `winStreak: number` fields) and `LeaderboardPageResult` (with `total`, `page`, `pageSize` pagination metadata)
- [X] T004 Extend leaderboard repository SQL in `backend/src/modules/leaderboard/leaderboard.repository.ts`: (1) add accuracy subquery — `COUNT(is_correct=true) / NULLIF(COUNT(is_correct IS NOT NULL), 0)` from `predictions` table per user, (2) add win streak calculation via window function — order participations by `match_time` DESC, count consecutive `is_winner=true` from most recent, (3) change `ORDER BY` to `winCount DESC, accuracy DESC` for tiebreaker, (4) add `OFFSET` param for pagination, (5) add a `countMonthlyRankedUsers(month, year)` method returning total count for pagination, (6) add a `findUserRank(userId, month, year)` method returning the single user's rank/stats
- [X] T005 Extend leaderboard service in `backend/src/modules/leaderboard/leaderboard.service.ts`: update `getLeaderboard()` to use new repository methods and return `LeaderboardPageResult` with pagination metadata (`total`, `page`, `pageSize`); add `getMyRank(userId, query)` method calling `findUserRank`; update `RankedEntry` to include `accuracy` and `winStreak`
- [X] T006 Extend leaderboard controller in `backend/src/modules/leaderboard/leaderboard.controller.ts`: add `getMe` handler that reads `req.user.id` from auth middleware and calls `leaderboardService.getMyRank()`; update existing `getLeaderboard` handler to pass `page`/`pageSize` from validated query
- [X] T007 Extend leaderboard routes in `backend/src/modules/leaderboard/leaderboard.routes.ts`: add `GET /me` route with `authenticate` middleware (import from `../../middleware/auth.ts`) and `validateQuery` using the same query schema (month/year only); keep existing `GET /` public

**Checkpoint**: Backend leaderboard API now returns accuracy, winStreak, pagination metadata, and supports `/me` for authenticated users

---

## Phase 3: User Story 1 — View Monthly Win-Count Leaderboard (Priority: P1) 🎯 MVP

**Goal**: Any visitor can view a paginated monthly leaderboard with rank, display name, points, win streak, accuracy; logged-in users see their row highlighted

**Independent Test**: Open `/leaderboard` → verify ranking table shows users sorted by monthly wins with accuracy tiebreaker, pagination works, logged-in user row is highlighted

### Implementation for User Story 1

- [X] T008 [P] [US1] Create `LeaderboardFilters` component in `frontend/src/components/leaderboard/LeaderboardFilters.tsx`: render filter tabs (Global active with primary styling, Friends/Weekly/All-Time shown but disabled/grayed out as placeholders); follow the tab bar markup from `stitch_goalpredict_live_dashboard/leaderboard/code.html` (line 184–189)
- [X] T009 [P] [US1] Create `LeaderboardTable` component in `frontend/src/components/leaderboard/LeaderboardTable.tsx`: render glass-card ranking table with columns Rank, Predictor (avatar placeholder + displayName), Points (totalPoints), Win Streak (fire icons per mockup), Accuracy (percentage badge); highlight current user row with `bg-primary-container/5 border-y-2 border-primary active-glow` styling; include pagination controls (Previous/Next + page numbers) following mockup markup (line 345–359); accept `rankings`, `currentUserId`, `page`, `totalPages`, `onPageChange` props
- [X] T010 [US1] Create leaderboard page in `frontend/src/app/(main)/leaderboard/page.tsx`: `'use client'` component that calls `leaderboardApi.getLeaderboard()` on mount and on page change; optionally calls `leaderboardApi.getMyRank()` if user is logged in; renders page header ("Leaderboard" + subtitle), `LeaderboardFilters`, and `LeaderboardTable`; handle loading state (spinner), error state (retry button), and empty state (no-data message "Chưa có dữ liệu bảng xếp hạng"); use `session.getToken()` to detect login state for highlight and `/me` call
- [X] T011 [US1] Add leaderboard link to sidebar navigation in `frontend/src/app/(main)/layout.tsx`: add "Bảng xếp hạng" nav item with `leaderboard` icon pointing to `/leaderboard`, following the existing nav item pattern; mark it active when route matches

**Checkpoint**: Leaderboard page fully functional with ranking table, pagination, current-user highlight, and navigation link

---

## Phase 4: User Story 2 — Prediction Statistics Visibility (Priority: P2)

**Goal**: Aggregate vote counts per criterion are shown only for matches that have started (LIVE/FINISHED), hidden for SCHEDULED matches to prevent bandwagon influence

**Independent Test**: Open a SCHEDULED match → "Thống kê" tab shows empty/hidden message; open a LIVE/FINISHED match → tab shows vote bars per criterion

### Implementation for User Story 2

- [X] T012 [US2] Filter statistics in `backend/src/modules/public-matches/public-matches.service.ts`: in the `getDetail()` method (or equivalent that returns match detail with statistics), check `match.status` — if `SCHEDULED` or `POSTPONED`, return `statistics: []` instead of actual vote counts; keep actual data for `LIVE`, `FINISHED`, `CANCELLED`
- [X] T013 [US2] Update `StatsPanel` in `frontend/src/components/matches/StatsPanel.tsx`: add `matchStatus` prop; when status is `SCHEDULED` or `POSTPONED`, show a message "Thống kê sẽ hiển thị sau khi trận đấu bắt đầu" instead of "Chưa có thống kê dự đoán"; update the parent `frontend/src/app/(main)/matches/[id]/page.tsx` to pass `match.status` to `StatsPanel`

**Checkpoint**: Stats tab correctly hides vote counts for pre-kickoff matches, shows them for started/finished matches

---

## Phase 5: User Story 3 — Leaderboard Podium for Top 3 (Priority: P3)

**Goal**: Top 3 predictors shown in a prominent podium layout with rank badges, avatars, display names, and points above the ranking table

**Independent Test**: With ≥ 3 users having wins, open `/leaderboard` → verify podium cards for 1st (gold border, trophy icon, largest), 2nd (silver, left), 3rd (bronze, right) with correct data; with < 3 winners, podium adapts

### Implementation for User Story 3

- [X] T014 [US3] Create `Podium` component in `frontend/src/components/leaderboard/Podium.tsx`: render top-3 podium cards in a `grid grid-cols-1 md:grid-cols-3` layout per mockup (line 192–231); 1st place center/tallest with gold border + `active-glow` + trophy icon (`emoji_events`), 2nd place left with silver border + medal icon, 3rd place right with bronze border + medal icon; use podium gradient tokens from T001; show avatar placeholder (default image), displayName, totalPoints; handle < 3 winners by rendering only available cards without empty placeholders; accept `topThree: RankedEntry[]` prop
- [X] T015 [US3] Integrate `Podium` into leaderboard page in `frontend/src/app/(main)/leaderboard/page.tsx`: render `Podium` component between the filters and the ranking table, passing the first 3 entries from the rankings array; exclude top-3 users from the `LeaderboardTable` if they are already shown in the podium (or keep them with a visual indicator — follow mockup which shows separate podium + table starting from rank 4)

**Checkpoint**: Podium displays top 3 with correct visual treatment, table starts from rank 4+

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Build verification and validation across all stories

- [X] T016 [P] Run `npm run build` and `npm run lint` in `backend/` — fix any TypeScript or lint errors
- [X] T017 [P] Run `npm run build` and `npm run lint` in `frontend/` — fix any TypeScript or lint errors
- [X] T018 Run quickstart.md validation scenarios: verify all 6 scenarios (leaderboard API, /me endpoint, stats visibility, frontend leaderboard page, match stats tab, edge cases)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Can start in parallel with Setup (backend work, no frontend dependency)
- **User Story 1 (Phase 3)**: Depends on Phase 1 (T001, T002) AND Phase 2 (T003–T007)
- **User Story 2 (Phase 4)**: Depends on Phase 2 only (backend filter) — can run in parallel with US1
- **User Story 3 (Phase 5)**: Depends on Phase 1 (T001 podium tokens) AND Phase 3 (T010 leaderboard page exists)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational + Setup — no dependency on other stories
- **User Story 2 (P2)**: Depends on Foundational only — fully independent of US1 and US3
- **User Story 3 (P3)**: Depends on US1 (integrates into the leaderboard page created in T010)

### Within Each User Story

- T008, T009 can run in parallel (different component files)
- T010 depends on T008, T009 (page imports both components)
- T011 is independent of T008–T010 (different file)
- T012, T013 are sequential (backend filter first, then frontend update)
- T014 is independent, T015 depends on T010 + T014

### Parallel Opportunities

- T001 and T002 can run in parallel (different files)
- T003–T007 are sequential within the backend module (each builds on prior)
- T008 and T009 can run in parallel (different component files)
- T012 and T008/T009 can run in parallel (different projects — backend vs frontend)
- T016 and T017 can run in parallel (different packages)

---

## Parallel Example: User Story 1

```text
# After Phase 2 completes, launch US1 component work in parallel:
T008: "Create LeaderboardFilters in frontend/src/components/leaderboard/LeaderboardFilters.tsx"
T009: "Create LeaderboardTable in frontend/src/components/leaderboard/LeaderboardTable.tsx"

# Then sequentially:
T010: "Create leaderboard page" (imports T008 + T009)
T011: "Add nav link" (can also be parallel with T010)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T002)
2. Complete Phase 2: Foundational backend extension (T003–T007)
3. Complete Phase 3: User Story 1 (T008–T011)
4. **STOP and VALIDATE**: Leaderboard page works with ranking table, pagination, user highlight
5. Deploy/demo if ready — core UC09 value delivered

### Incremental Delivery

1. Setup + Foundational → Backend API ready with full data
2. Add User Story 1 → Leaderboard page functional (MVP!)
3. Add User Story 2 → Stats visibility enforced for fairness
4. Add User Story 3 → Podium visual enhancement
5. Polish → Build verified, quickstart validated

### Parallel Strategy

With capacity for parallel work:
1. T001 + T002 (Setup) in parallel with T003–T007 (Foundational)
2. Once both complete: T008 + T009 (US1 components) in parallel with T012 (US2 backend)
3. T010 (US1 page) + T013 (US2 frontend) + T014 (US3 Podium) sequentially after their deps
4. T015 (US3 integration) after T010 + T014
5. T016 + T017 (build checks) in parallel

---

## Notes

## Phase 7: Convergence

- [X] T019 Fix stale month/year defaults in `backend/src/modules/leaderboard/leaderboard.dto.ts`: replace module-level `const now = new Date()` with dynamic Zod defaults using `.default(() => new Date().getMonth() + 1)` and `.default(() => new Date().getFullYear())` in both `leaderboardQuerySchema` and `leaderboardMeQuerySchema`, so defaults reflect the current month per-request rather than freezing at server start per FR-001 (partial)
- [X] T020 [P] Fix misleading empty-state message in `frontend/src/app/(main)/leaderboard/page.tsx`: when `tableRankings` is empty but `topThree.length > 0` (all ranked users shown in podium), skip rendering `LeaderboardTable` entirely instead of showing "Chưa có dữ liệu bảng xếp hạng" below the populated podium per FR-009 (partial)
- [X] T021 [P] Run `npm run build` in both `backend/` and `frontend/` to verify convergence fixes pass typecheck

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- No Prisma migration needed — all data derived from existing entities
- Existing `StatsPanel` component already handles empty state; only needs status-aware messaging
- Existing leaderboard module provides the base; tasks extend rather than replace
- The `/me` endpoint requires `authenticate` middleware but the main `GET /` remains public
- Mockup filter tabs (Friends/Weekly/All-Time) are rendered but disabled in v1 per spec assumptions
