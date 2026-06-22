# Tasks: Match Viewing

**Input**: Design documents from `specs/004-match-viewing/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not requested — no test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup

**Purpose**: Create module directories and file skeletons for the public match viewing feature

- [x] T001 Create backend public-matches module directory `backend/src/modules/public-matches/`
- [x] T002 [P] Create frontend matches components directory `frontend/src/components/matches/`
- [x] T003 [P] Create frontend route group and page directories `frontend/src/app/(main)/matches/` and `frontend/src/app/(main)/matches/[id]/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backend module skeleton and frontend API client — MUST be complete before any user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Create Zod validation schemas for public match list query params (status, from, to, page, pageSize) in `backend/src/modules/public-matches/public-matches.dto.ts`
- [x] T005 [P] Create public matches repository with `listPublic` method (status-grouped ORDER BY using Prisma, includes homeTeam/awayTeam, counts for criteria/participations) and `findDetailedPublic` method (includes criteria, statistics, visible comments, participations count) in `backend/src/modules/public-matches/public-matches.repository.ts`
- [x] T006 [P] Create public matches routes file with GET `/` and GET `/:id` route stubs in `backend/src/modules/public-matches/public-matches.routes.ts`
- [x] T007 Mount public matches routes at `/api/v1/matches` (no auth) in `backend/src/routes/index.ts`
- [x] T008 [P] Create MatchApiClient with `listMatches(filters)` and `getMatch(id)` methods in `frontend/src/api/matches.ts`
- [x] T009 [P] Create shared `(main)` layout with sidebar navigation, top app bar, and mobile bottom nav bar matching `stitch_goalpredict_live_dashboard/live_matches/code.html` nav structure in `frontend/src/app/(main)/layout.tsx`

**Checkpoint**: Backend routes mounted, frontend API client ready — user story implementation can begin

---

## Phase 3: User Story 1 — Browse Match List (Priority: P1) 🎯 MVP

**Goal**: Display a public, paginated, status-grouped match list with filter tabs accessible to all visitors

**Independent Test**: Open `/matches` page, verify match cards show team names/logos/time/status, filter tabs work, pagination navigates between pages, empty/error states display correctly

### Implementation for User Story 1

- [x] T010 [US1] Implement `listPublic` method in public-matches service with status-grouped sorting (LIVE → SCHEDULED → FINISHED → CANCELLED), status filter, date range filter, and pagination logic in `backend/src/modules/public-matches/public-matches.service.ts`
- [x] T011 [US1] Implement `list` handler in public-matches controller calling service.listPublic and returning paginated response in `backend/src/modules/public-matches/public-matches.controller.ts`
- [x] T012 [US1] Wire GET `/` route to controller.list with validateQuery middleware in `backend/src/modules/public-matches/public-matches.routes.ts`
- [x] T013 [P] [US1] Create MatchFilterBar component with status tabs (ALL / LIVE / SCHEDULED / FINISHED) and date filter, matching the filter bar in `stitch_goalpredict_live_dashboard/live_matches/code.html`, in `frontend/src/components/matches/MatchFilterBar.tsx`
- [x] T014 [P] [US1] Create MatchCard component displaying home/away team names, logos (with default placeholder fallback), match time (Vietnam TZ), status badge, and score, matching the match card layout in `stitch_goalpredict_live_dashboard/live_matches/code.html`, in `frontend/src/components/matches/MatchCard.tsx`
- [x] T015 [P] [US1] Create Pagination component with page navigation controls (previous/next, page numbers) in `frontend/src/components/matches/Pagination.tsx`
- [x] T016 [US1] Create MatchListPage assembling MatchFilterBar, MatchCard grid, and Pagination, with loading/empty/error states (Vietnamese messages), calling MatchApiClient.listMatches, in `frontend/src/app/(main)/matches/page.tsx`

**Checkpoint**: Match list fully functional — visitors can browse, filter, and paginate matches

---

## Phase 4: User Story 2 — View Match Details (Priority: P1)

**Goal**: Display full match detail page with teams, scores, criteria, voting statistics, and comments for any visitor

**Independent Test**: Navigate to `/matches/{id}`, verify scoreboard header (teams/logos/score/status/time), criteria list, stats bars, comments section, and 404 handling

### Implementation for User Story 2

- [x] T017 [US2] Implement `getDetailedPublic` method in public-matches service loading match with homeTeam, awayTeam, active criteria, statistics, visible comments (ordered by createdAt ASC), participant count, and computed goldPool in `backend/src/modules/public-matches/public-matches.service.ts`
- [x] T018 [US2] Implement `getById` handler in public-matches controller returning detailed match or 404 ApiError in `backend/src/modules/public-matches/public-matches.controller.ts`
- [x] T019 [US2] Wire GET `/:id` route to controller.getById with UUID param validation in `backend/src/modules/public-matches/public-matches.routes.ts`
- [x] T020 [P] [US2] Create TeamInfoPanel component showing team logo (with placeholder fallback), name, and score, matching the scoreboard header in `stitch_goalpredict_live_dashboard/match_details/code.html`, in `frontend/src/components/matches/TeamInfoPanel.tsx`
- [x] T021 [P] [US2] Create CriteriaList component listing active prediction criteria with name and description, with empty state ("Chưa có tiêu chí dự đoán"), in `frontend/src/components/matches/CriteriaList.tsx`
- [x] T022 [P] [US2] Create StatsPanel component displaying HOME vs AWAY vote progress bars per criterion, matching the stat bars in `stitch_goalpredict_live_dashboard/match_details/code.html`, in `frontend/src/components/matches/StatsPanel.tsx`
- [x] T023 [P] [US2] Create CommentList component showing comments with user displayName, content, and formatted timestamp (Vietnam TZ), with empty state ("Chưa có bình luận"), in `frontend/src/components/matches/CommentList.tsx`
- [x] T024 [US2] Create MatchDetailPage assembling scoreboard (TeamInfoPanel × 2 + score center with status/time), tabbed sections (Overview/Stats/Predictions/Comments), CriteriaList, StatsPanel, CommentList, with loading and 404 states, calling MatchApiClient.getMatch, in `frontend/src/app/(main)/matches/[id]/page.tsx`

**Checkpoint**: Match detail fully functional — visitors can view complete match information

---

## Phase 5: User Story 3 — Guest vs. Authenticated View Differences (Priority: P2)

**Goal**: Hide prediction/comment action controls for guests; show them for authenticated users on eligible matches

**Independent Test**: View match detail as Guest (no predict/comment buttons), login, revisit same SCHEDULED match (predict buttons appear), visit LIVE match (predict buttons locked)

### Implementation for User Story 3

- [x] T025 [US3] Add optional JWT extraction middleware (tryAuthenticate) that attaches userId to request if valid token present but does not reject if absent, in `backend/src/middleware/auth.ts`
- [x] T026 [US3] Apply tryAuthenticate middleware to GET `/api/v1/matches/:id` route so the service receives an optional viewerId in `backend/src/modules/public-matches/public-matches.routes.ts`
- [x] T027 [US3] Pass viewerId from controller to service.getDetailedPublic so the response can include the user's own prediction state in `backend/src/modules/public-matches/public-matches.controller.ts`
- [x] T028 [US3] Update MatchDetailPage to conditionally render prediction action buttons (visible only when user is authenticated) and comment action area (visible only when user is authenticated) based on auth state from session context, and lock prediction actions when match status is not SCHEDULED, in `frontend/src/app/(main)/matches/[id]/page.tsx`

**Checkpoint**: Auth-gated actions work — guests see read-only view, users see actions on eligible matches

---

## Phase 6: User Story 4 — Prediction Visibility Rules (Priority: P2)

**Goal**: Hide other users' predictions before kickoff (SCHEDULED), reveal all predictions after match starts (LIVE/FINISHED) per BR21/BR22

**Independent Test**: On SCHEDULED match with other users' predictions: guest sees no predictions, logged-in user sees only own. On LIVE/FINISHED match: all predictions visible to everyone.

### Implementation for User Story 4

- [x] T029 [US4] Add prediction filtering logic to `getDetailedPublic` in service: for SCHEDULED matches include only the requesting user's own predictions (empty array for guests); for LIVE/FINISHED include all predictions with user displayName; for CANCELLED return empty array in `backend/src/modules/public-matches/public-matches.service.ts`
- [x] T030 [US4] Include prediction data in the match detail API response (include user.displayName, criterionId, selectedTeam, isCorrect) in `backend/src/modules/public-matches/public-matches.repository.ts`
- [x] T031 [P] [US4] Create PredictionsList component displaying user predictions per criterion (user name, selected team badge) with proper visibility messaging ("Dự đoán sẽ hiển thị khi trận đấu bắt đầu" for SCHEDULED) in `frontend/src/components/matches/PredictionsList.tsx`
- [x] T032 [US4] Integrate PredictionsList into the Predictions tab of MatchDetailPage, passing match status and predictions data in `frontend/src/app/(main)/matches/[id]/page.tsx`

**Checkpoint**: All prediction visibility rules enforced — fairness compliance 100%

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Quality gates, edge cases, and responsive refinements

- [x] T033 [P] Verify responsive layout at breakpoints 480/768/1024/1440 for match list and detail pages, ensure touch targets ≥ 44×44px on mobile, in `frontend/src/app/(main)/matches/page.tsx` and `frontend/src/app/(main)/matches/[id]/page.tsx`
- [x] T034 [P] Add alt text for team logos and player images, add keyboard navigation for filter tabs and pagination controls for WCAG 2.1 AA compliance in `frontend/src/components/matches/MatchCard.tsx`, `frontend/src/components/matches/MatchFilterBar.tsx`, `frontend/src/components/matches/Pagination.tsx`
- [x] T035 [P] Handle edge cases: CANCELLED match display (badge + no action buttons), missing team logos (placeholder), no criteria (empty state), no comments (empty state) across all components in `frontend/src/components/matches/`
- [x] T036 Run `npm run build` in `backend/` and `frontend/` to verify typecheck passes (Principle V)
- [x] T037 Run `npm run lint` in `backend/` and `frontend/` to verify lint passes (Principle V)
- [x] T038 Run quickstart.md validation scenarios end-to-end per `specs/004-match-viewing/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **US1 Match List (Phase 3)**: Depends on Foundational — can start after Phase 2
- **US2 Match Detail (Phase 4)**: Depends on Foundational — can start after Phase 2 (shares backend files with US1, so sequential is practical)
- **US3 Guest vs Auth (Phase 5)**: Depends on US2 (enhances detail page)
- **US4 Prediction Visibility (Phase 6)**: Depends on US2 and US3 (needs viewerId plumbing from US3)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: After Foundational → independently testable as MVP
- **US2 (P1)**: After Foundational → shares backend module with US1 but independently testable (detail page works without list)
- **US3 (P2)**: After US2 → adds auth-conditional rendering to detail page
- **US4 (P2)**: After US3 → uses viewerId from US3's tryAuthenticate middleware

### Within Each User Story

- Backend service before controller
- Controller before routes wiring
- Frontend components (parallel) before page assembly
- Page assembly integrates all components

### Parallel Opportunities

- T002, T003 can run in parallel with T001 (different directories)
- T005, T006, T008, T009 can run in parallel (different files)
- T013, T014, T015 can run in parallel (independent components)
- T020, T021, T022, T023 can run in parallel (independent components)
- T033, T034, T035 can run in parallel (different concern areas)

---

## Parallel Example: User Story 1

```
# Launch all frontend components in parallel:
Task T013: "MatchFilterBar component in frontend/src/components/matches/MatchFilterBar.tsx"
Task T014: "MatchCard component in frontend/src/components/matches/MatchCard.tsx"
Task T015: "Pagination component in frontend/src/components/matches/Pagination.tsx"

# Then assemble:
Task T016: "MatchListPage in frontend/src/app/(main)/matches/page.tsx" (depends on T013, T014, T015)
```

## Parallel Example: User Story 2

```
# Launch all frontend components in parallel:
Task T020: "TeamInfoPanel in frontend/src/components/matches/TeamInfoPanel.tsx"
Task T021: "CriteriaList in frontend/src/components/matches/CriteriaList.tsx"
Task T022: "StatsPanel in frontend/src/components/matches/StatsPanel.tsx"
Task T023: "CommentList in frontend/src/components/matches/CommentList.tsx"

# Then assemble:
Task T024: "MatchDetailPage in frontend/src/app/(main)/matches/[id]/page.tsx" (depends on T020-T023)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (Match List)
4. **STOP and VALIDATE**: Browse `/matches`, verify cards, filters, pagination, empty/error states
5. Deploy/demo if ready — users can already discover matches

### Incremental Delivery

1. Setup + Foundational → Backend module mounted, API client ready
2. US1 (Match List) → Test independently → Deploy (MVP!)
3. US2 (Match Detail) → Test independently → Deploy (users can now view details)
4. US3 (Guest vs Auth) → Test independently → Deploy (auth-gated actions)
5. US4 (Prediction Visibility) → Test independently → Deploy (fairness rules enforced)
6. Polish → Build/lint gates, responsive, accessibility → Final validation

### Single Developer Strategy

Complete phases sequentially: 1 → 2 → 3 → 4 → 5 → 6 → 7. Within each phase, leverage [P] parallelism for component creation (e.g., build all US2 components in one pass, then assemble the page).

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- No schema migration needed — feature is read-only against existing data
- Backend shares `public-matches` module across US1 (list) and US2 (detail) — methods added incrementally
- Mockup visual conflicts with spec are resolved in plan.md Complexity Tracking (spec wins for behavior, mockup wins for layout)
- All dates/times must be formatted for Vietnam locale and Asia/Ho_Chi_Minh timezone (FR-013)
- Gold values displayed to 2 decimal places

---

## Phase 8: Convergence

- [x] T039 Fix pagination in `listPublic` to fetch all matching records from DB (no Prisma `skip`), sort in memory by status group (LIVE→SCHEDULED→FINISHED→CANCELLED), then apply skip/take manually so page 2+ returns correct status-grouped results per FR-003a, FR-003b (partial)
- [x] T040 [P] Add date range filter inputs (from/to) to MatchFilterBar and wire them through MatchListPage to the `matchesApi.listMatches` call per FR-003 (partial)
