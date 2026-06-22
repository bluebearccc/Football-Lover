# Tasks: Match Management

**Input**: Design documents from `specs/003-match-management/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested — test tasks omitted.

**Organization**: Tasks are grouped by user story. The backend and frontend are **already substantially implemented** — tasks focus on closing gaps identified in `plan.md` Gap Analysis.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US3, US5)

## User Story Mapping

| Story | Spec Story | Title | Priority | Status |
|-------|-----------|-------|----------|--------|
| US1 | User Story 1 | Admin Creates a Match | P1 | ✅ Implemented |
| US2 | User Story 2 | Admin Edits a Scheduled Match | P1 | Partial — no edit form in frontend |
| US3 | User Story 3 | Admin Updates Results & Triggers Scoring | P1 | Partial — missing two-step validation |
| US4 | User Story 4 | Admin Cancels a Match | P2 | ✅ Implemented |
| US5 | User Story 5 | Admin Manages Prediction Criteria | P1 | ✅ Implemented |
| US6 | User Story 6 | External Data Sync | P3 | Partial — only team/player sync, no match sync |

---

## Phase 1: Setup

**Purpose**: No project initialization needed — modules, routes, schema, and pages all exist. This phase verifies the current state.

- [x] T001 Verify backend builds cleanly: run `npm run build` and `npm run lint` in `backend/`
- [x] T002 [P] Verify frontend builds cleanly: run `npm run build` and `npm run lint` in `frontend/`

**Checkpoint**: Existing codebase compiles and lints without errors

---

## Phase 2: Foundational (Shared Improvements)

**Purpose**: Backend enhancements that support multiple user stories

- [x] T003 Add `sortOrder` query param (asc|desc, default desc) to `listMatchesQuerySchema` in `backend/src/modules/matches/matches.dto.ts` and pass it through to `matchesRepository.list()` orderBy in `backend/src/modules/matches/matches.service.ts`
- [x] T004 [P] Update `matchesRepository.list()` in `backend/src/modules/matches/matches.repository.ts` to accept and apply the `sortOrder` param on `matchTime` ordering

**Checkpoint**: Backend supports sortable match list queries

---

## Phase 3: User Story 3 — Admin Updates Results & Triggers Scoring (Priority: P1) 🎯 MVP

**Goal**: Implement two-step "Finish & Score" process: Admin must set all criterion results before scoring can be triggered. Backend blocks scoring if any criteria lack a result_team. Frontend warns and disables the scoring button until all criteria are resolved.

**Independent Test**: Create a match with 2+ criteria, set result on only one criterion, attempt to score — should be blocked. Set all results, score — should succeed.

### Implementation for User Story 3

- [x] T005 [US3] Add pre-flight check in `matchesService.updateResult()` in `backend/src/modules/matches/matches.service.ts`: before calling `scoringService.scoreMatch()`, query all criteria for the match and throw `ApiError.badRequest()` if any criterion has `resultTeam === null`, listing the unresolved criteria names in the error message
- [x] T006 [US3] Update `matchesRepository` in `backend/src/modules/matches/matches.repository.ts` to add a `findCriteriaByMatch(matchId)` method that returns all criteria for a match (if not already reusable from existing methods)
- [x] T007 [US3] Update the match detail page in `frontend/src/app/admin/matches/[id]/page.tsx`: compute whether all criteria have a `resultTeam` set, disable the "Chốt kết quả" button when any are unresolved, and show a warning message listing which criteria still need results

**Checkpoint**: Two-step scoring validation works end-to-end — Admin cannot score until all criteria have results

---

## Phase 4: User Story 1 & 5 — Match List Filter & Criteria (Priority: P1)

**Goal**: Add status filter dropdown to the Admin match list page. US1 and US5 are already fully implemented; this phase adds the FR-022 filtering UI.

**Independent Test**: Navigate to `/admin/matches`, select "SCHEDULED" from the filter — only SCHEDULED matches appear. Clear the filter — all matches appear.

### Implementation for User Story 1/5

- [x] T008 [US1] Add a status filter `<Select>` dropdown to the match list page in `frontend/src/app/admin/matches/page.tsx`: include options for all MatchStatus values (SCHEDULED, LIVE, FINISHED, CANCELLED, POSTPONED) plus an "All" option, and pass the selected status to `adminMatchesApi.list({ status })`
- [x] T009 [US1] Add a sort direction toggle button in `frontend/src/app/admin/matches/page.tsx`: toggle between ascending/descending match_time, pass `sortOrder` param to the API call via `adminMatchesApi.list()`
- [x] T010 [P] [US1] Update `adminMatchesApi.list()` in `frontend/src/api/admin/matches.ts` to accept and pass the `sortOrder` query parameter

**Checkpoint**: Match list supports filtering by status and sorting by match_time direction

---

## Phase 5: User Story 2 — Admin Edits a Scheduled Match (Priority: P1)

**Goal**: Add an edit form on the match detail page that allows Admin to modify teams, match_time, and entry_gold for SCHEDULED matches. Uses the existing PATCH `/admin/matches/:id` endpoint.

**Independent Test**: Navigate to a SCHEDULED match detail page, change the entry gold, save — change persists on reload. Navigate to a LIVE match — edit form is hidden/disabled.

### Implementation for User Story 2

- [x] T011 [US2] Add an editable match info section to the match detail page in `frontend/src/app/admin/matches/[id]/page.tsx`: when match is SCHEDULED, show a form with team selects (home/away), datetime-local input for matchTime, number input for entryGold, and a "Lưu thay đổi" button; pre-populate with current values; hide or disable the form when status is not SCHEDULED
- [x] T012 [US2] Load the active teams list in the match detail page (reuse `adminTeamsApi.list()` from `frontend/src/api/admin/teams.ts`) to populate the team select dropdowns in the edit form
- [x] T013 [US2] Wire the edit form submission to `adminMatchesApi.update(matchId, input)` in `frontend/src/app/admin/matches/[id]/page.tsx`, show success/error banners, and reload match data after successful update

**Checkpoint**: SCHEDULED match details are editable; LIVE/FINISHED/CANCELLED matches show read-only info

---

## Phase 6: User Story 4 — Admin Cancels a Match (Priority: P2)

**Goal**: Already fully implemented. This phase validates the cancel flow works correctly with the new two-step scoring guard.

- [x] T014 [US4] Verify cancel flow works end-to-end: cancel a match with predictions, confirm status changes to CANCELLED, verify MATCH_CANCELLED notifications are created in the database, and confirm the match no longer allows result entry or scoring

**Checkpoint**: Cancel flow validated and consistent with scoring changes

---

## Phase 7: User Story 6 — External Data Sync (Priority: P3)

**Goal**: Extend api-football sync to include match fixtures and scores. Admin can trigger manual match sync. External data maps via `external_id`. Admin-edited data is preserved on conflict.

**Independent Test**: Trigger match sync for a league — new fixtures appear as SCHEDULED matches with external_id. Edit a synced match's time, re-sync — Admin-edited time is preserved.

### Implementation for User Story 6

- [x] T015 [US6] Add `getFixtures(leagueId, season)` and `getFixtureById(fixtureId)` methods to `backend/src/modules/sync/api-football.client.ts` to fetch match fixtures from the api-football API
- [x] T016 [US6] Add `syncMatchesByLeague(leagueId, season)` method to `backend/src/modules/sync/sync.service.ts`: fetch fixtures, upsert matches via external_id, preserve Admin-edited fields (check if field was manually changed before overwriting), return SyncResult counts
- [x] T017 [US6] Add `upsertMatchByExternalId(data)` method to `backend/src/modules/matches/matches.repository.ts`: find by external_id, create if new, update only non-Admin-edited fields if existing
- [x] T018 [US6] Add POST `/sync/matches` route in `backend/src/modules/sync/sync.routes.ts` with Zod validation schema (leagueId required, season optional) and wire to `syncService.syncMatchesByLeague()`
- [x] T019 [P] [US6] Add `syncMatches(leagueId, season)` method to the frontend API client: add to `frontend/src/api/admin/matches.ts` or create a dedicated sync API module
- [x] T020 [US6] Add a "Sync trận đấu" button and sync result display on the match list page in `frontend/src/app/admin/matches/page.tsx` (similar to existing team sync UI pattern)

**Checkpoint**: Match sync from api-football works end-to-end with conflict preservation

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup

- [x] T021 Run `npm run build` and `npm run lint` in `backend/` — fix any errors
- [x] T022 [P] Run `npm run build` and `npm run lint` in `frontend/` — fix any errors
- [x] T023 Run quickstart.md validation scenarios (all 7 scenarios) and verify expected outcomes
- [x] T024 [P] Verify match list page matches the Stitch mockup layout in `stitch_goalpredict_live_dashboard/admin_match_management/screen.png` — check spacing, component hierarchy, and visual alignment

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — verify current state
- **Foundational (Phase 2)**: Depends on Phase 1 passing
- **User Story 3 (Phase 3)**: Depends on Phase 2 — **MVP priority, implement first**
- **User Story 1/5 (Phase 4)**: Depends on Phase 2 — can run in parallel with Phase 3
- **User Story 2 (Phase 5)**: Depends on Phase 2 — can run in parallel with Phases 3–4
- **User Story 4 (Phase 6)**: Depends on Phase 3 (validates cancel works with new scoring guard)
- **User Story 6 (Phase 7)**: Depends on Phase 2 — independent of Phases 3–6, can run in parallel
- **Polish (Phase 8)**: Depends on all desired phases being complete

### User Story Dependencies

- **US3 (Scoring validation)**: Standalone — no dependency on other stories
- **US1/US5 (Filter UI)**: Standalone — can run in parallel with US3
- **US2 (Edit form)**: Standalone — can run in parallel with US3
- **US4 (Cancel validation)**: Depends on US3 (tests interaction with scoring guard)
- **US6 (Sync)**: Standalone — can run in parallel with all others

### Within Each User Story

- Backend changes before frontend changes (where both exist)
- Repository methods before service methods
- Service methods before controller/route wiring

### Parallel Opportunities

- T001 + T002 (build verification)
- T003 + T004 (foundational backend changes)
- Phase 3, Phase 4, Phase 5 can all run in parallel after Phase 2
- T021 + T022 (final build verification)
- T023 + T024 (final validation)

---

## Parallel Example: After Phase 2 Completes

```
# These can run simultaneously:
Agent A: Phase 3 (US3 — two-step scoring)  → T005, T006, T007
Agent B: Phase 4 (US1 — filter UI)         → T008, T009, T010
Agent C: Phase 5 (US2 — edit form)         → T011, T012, T013
```

---

## Implementation Strategy

### MVP First (User Story 3 Only)

1. Complete Phase 1: Verify builds pass
2. Complete Phase 2: Add sortOrder param
3. Complete Phase 3: Two-step scoring validation (US3)
4. **STOP and VALIDATE**: Test scoring guard end-to-end
5. This alone closes the most critical spec gap

### Incremental Delivery

1. Setup + Foundational → Baseline verified
2. US3 (scoring validation) → Core safety feature ✅
3. US1/US5 (filter UI) → Admin workflow improvement ✅
4. US2 (edit form) → Complete CRUD experience ✅
5. US4 (cancel validation) → Verify interaction ✅
6. US6 (match sync) → Automation layer ✅
7. Polish → Final build + mockup check

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Total tasks: 24 (including verification/validation tasks)
- Existing implementation is the foundation — tasks focus on gap-closing, not building from scratch
- US6 (match sync) is P3 and can be deferred without affecting core match management functionality

---

## Phase 9: Convergence

**Purpose**: Close remaining gaps identified by convergence assessment against spec.md, plan.md, and constitution.

- [x] T025 [US5] Add `isActive` Boolean field (default true) to the PredictionCriterion model in `backend/prisma/schema.prisma`, run `npx prisma migrate dev --name add-criterion-is-active`, and update `backend/src/modules/criteria/criteria.repository.ts` to filter by `isActive: true` when listing criteria for prediction submission per US5/AC4 (partial)
- [x] T026 [US5] Add a `deactivate(id)` method to `backend/src/modules/criteria/criteria.service.ts` that sets `isActive = false` on a criterion (allowed regardless of match status or existing predictions), and add a PATCH or POST endpoint in `backend/src/modules/criteria/criteria.routes.ts` to expose it per FR-014, US5/AC4 (partial)
- [x] T027 [US5] Update the criterion list in `frontend/src/app/admin/matches/[id]/page.tsx` to show a "Ẩn" (deactivate) button alongside the existing "Xoá" button, calling the new deactivate endpoint per US5/AC4 (partial)
- [x] T028 [US2] Add optional `startDate` and `endDate` fields to `updateMatchSchema` in `backend/src/modules/matches/matches.dto.ts` (both `z.coerce.date().optional()`) and pass them through in `matchesService.update()` per FR-005 (partial)
- [x] T029 [P] [US2] Add `startDate` and `endDate` datetime-local inputs to the edit form in `frontend/src/app/admin/matches/[id]/page.tsx`, pre-populated from match data, wired to `adminMatchesApi.update()` per FR-005 (partial)
- [x] T030 [US6] Add a `manuallyEditedAt` DateTime? field to the Match model in `backend/prisma/schema.prisma`, set it to `now()` when Admin edits via `matchesService.update()`, and skip overwriting fields in `upsertMatchByExternalId()` when `manuallyEditedAt` is non-null per FR-018 (partial)
- [x] T031 Run `npm run build` and `npm run lint` in both `backend/` and `frontend/` — fix any errors
