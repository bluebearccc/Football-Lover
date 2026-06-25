# Tasks: Prediction Criteria Management

**Input**: Design documents from `specs/005-prediction-criteria/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested — test tasks omitted. Validation via quickstart.md scenarios.

**Organization**: Tasks grouped by user story. Existing implementation covers ~80% — tasks focus on identified gaps from research.md.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Schema Migration)

**Purpose**: Add `createdAt` field to PredictionCriterion for creation-order sorting

- [x] T001 Add `createdAt DateTime @default(now()) @map("created_at")` field to `PredictionCriterion` model in `backend/prisma/schema.prisma`
- [x] T002 Run `npx prisma migrate dev --name add_criterion_created_at` in `backend/` to generate and apply migration

**Checkpoint**: `prediction_criteria` table has `created_at` column; `npx prisma generate` succeeds

---

## Phase 2: Foundational (Repository Ordering Fix)

**Purpose**: Change criteria ordering from alphabetical to creation-order across all repositories — blocks correct display for all user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 [P] Change `orderBy: { name: 'asc' }` to `orderBy: { createdAt: 'asc' }` in `findByMatch()` method in `backend/src/modules/criteria/criteria.repository.ts`
- [x] T004 [P] Change `orderBy: { name: 'asc' }` to `orderBy: { createdAt: 'asc' }` in `findActiveByMatch()` method in `backend/src/modules/criteria/criteria.repository.ts`
- [x] T005 [P] Change `criteria: { where: { isActive: true }, orderBy: { name: 'asc' } }` to `orderBy: { createdAt: 'asc' }` in `findDetailedPublic()` include in `backend/src/modules/public-matches/public-matches.repository.ts`

**Checkpoint**: Criteria returned in creation order from both admin and public endpoints

---

## Phase 3: User Story 1 — Admin Creates Criteria (Priority: P1) 🎯 MVP

**Goal**: Admin creates binary HOME/AWAY prediction criteria per match with name and optional description

**Independent Test**: Login as Admin → navigate to SCHEDULED match → add criterion → verify it appears in list with correct creation order

**Status**: Already implemented. Create endpoint, Zod validation, and admin UI form all exist. Phase 1+2 complete the remaining gap (creation-order display).

**Checkpoint**: No additional tasks needed — creation flow works after Phase 1+2 changes

---

## Phase 4: User Story 2 — Admin Edits Criteria (Priority: P1)

**Goal**: Admin edits criterion name/description while match is SCHEDULED; edits blocked for non-SCHEDULED matches

**Independent Test**: Create a criterion → edit its name → verify update persists; try editing on a LIVE match → verify 400 error

**Status**: Backend edit endpoint works (PATCH /:id with assertEditable). Frontend lacks inline edit UI — currently Admin can only create, not edit in the UI.

### Implementation for User Story 2

- [x] T006 [US2] Add inline edit state and UI to the criteria list in `frontend/src/app/admin/matches/[id]/page.tsx`: when Admin clicks a criterion name, show editable text inputs for name and description with Save/Cancel buttons; call `adminCriteriaApi.update()` on save; only show edit controls when match is SCHEDULED

**Checkpoint**: Admin can click criterion name → edit inline → save → see updated name without page reload

---

## Phase 5: User Story 5 — Users View Criteria on Match Details (Priority: P1)

**Goal**: Users and guests see active criteria on match detail page, ordered by creation time, with vote statistics visible after match start

**Independent Test**: View match detail page → verify active criteria listed in creation order; verify deactivated criteria hidden; verify stats appear after match starts

**Status**: Fully implemented. `CriteriaList` component at `frontend/src/components/matches/CriteriaList.tsx` renders criteria. Public API at `/api/v1/matches/:id` filters `isActive: true`. Phase 2 fixes ordering.

**Checkpoint**: No additional tasks needed — user-facing criteria display works after Phase 2 ordering fix

---

## Phase 6: User Story 3 — Admin Deactivates/Reactivates Criteria (Priority: P2)

**Goal**: Admin can deactivate criteria (soft-delete) and reactivate them while match is SCHEDULED; both operations blocked for non-SCHEDULED matches

**Independent Test**: Deactivate a criterion on SCHEDULED match → verify hidden from users; reactivate → verify visible again; try on LIVE match → verify 400 error

### Implementation for User Story 3

- [x] T007 [US3] Add `assertEditable` guard to `deactivate()` method in `backend/src/modules/criteria/criteria.service.ts`: fetch the criterion's match, call `assertEditable(match)` before setting `isActive: false`
- [x] T008 [US3] Add `reactivate()` method to `backend/src/modules/criteria/criteria.service.ts`: find criterion, ensure it exists, fetch match, call `assertEditable(match)`, verify `isActive === false` (throw 400 if already active), then update `isActive: true`
- [x] T009 [US3] Add `reactivate` handler to `backend/src/modules/criteria/criteria.controller.ts`: call `criteriaService.reactivate(req.params.id)` and return 200 with criterion
- [x] T010 [US3] Add `POST /:id/reactivate` route to `backend/src/modules/criteria/criteria.routes.ts` using `wrap(criteriaController.reactivate)`
- [x] T011 [US3] Add `reactivate(id: string)` method to `adminCriteriaApi` in `frontend/src/api/admin/matches.ts`: `POST /criteria/${id}/reactivate`
- [x] T012 [US3] Add reactivate button to inactive criteria in `frontend/src/app/admin/matches/[id]/page.tsx`: show "Hiện lại" button next to "Đã ẩn" badge for inactive criteria when match is SCHEDULED; call `adminCriteriaApi.reactivate()` and reload

**Checkpoint**: Deactivate criterion → "Đã ẩn" badge shown with "Hiện lại" button → click to reactivate → criterion active again. Both operations return 400 on non-SCHEDULED match.

---

## Phase 7: User Story 4 — Admin Sets Criterion Results (Priority: P2)

**Goal**: Admin sets result_team (HOME/AWAY) for each criterion when match is FINISHED

**Independent Test**: On FINISHED match → set criterion results → verify resultTeam and resolvedAt saved; try on SCHEDULED match → verify blocked

**Status**: Fully implemented. `setCriterionResult` endpoint exists in matches module (`PUT /api/v1/admin/matches/criteria/:criterionId/result`). Frontend admin detail page has HOME/AWAY result buttons per criterion. `setCriterionResultSchema` Zod DTO validates input.

**Checkpoint**: No additional tasks needed — result-setting flow is complete

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Validate, lint, and verify end-to-end

- [x] T013 [P] Run `npm run build` in `backend/` and fix any TypeScript errors
- [x] T014 [P] Run `npm run build` in `frontend/` and fix any TypeScript errors
- [x] T015 [P] Run `npm run lint` in `backend/` and fix any lint issues
- [x] T016 [P] Run `npm run lint` in `frontend/` and fix any lint issues
- [x] T017 Run quickstart.md validation scenarios to verify end-to-end feature correctness

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (schema migration must complete before repository can reference `createdAt`)
- **US1 (Phase 3)**: Depends on Phase 2 — no additional tasks
- **US2 (Phase 4)**: Depends on Phase 2 — frontend edit UI
- **US5 (Phase 5)**: Depends on Phase 2 — no additional tasks
- **US3 (Phase 6)**: Depends on Phase 2 — can run in parallel with US2 (different files)
- **US4 (Phase 7)**: Already complete — no additional tasks
- **Polish (Phase 8)**: Depends on all user story phases

### User Story Dependencies

- **US1 (P1)**: No dependencies on other stories — ready after Phase 2
- **US2 (P1)**: No dependencies on other stories — frontend-only task
- **US5 (P1)**: No dependencies on other stories — ready after Phase 2
- **US3 (P2)**: No dependencies on other stories — backend + frontend tasks
- **US4 (P2)**: Already complete — no dependencies

### Within Each User Story

- Backend changes before frontend changes
- Service logic before controller/route wiring
- API client before UI component

### Parallel Opportunities

- T003, T004, T005 (Phase 2) can run in parallel — different methods/files
- T006 (US2) and T007–T012 (US3) can run in parallel — different features, different code paths
- T013–T016 (Polish) can all run in parallel — independent lint/build checks

---

## Parallel Example: User Story 3

```text
# Backend tasks can run sequentially (same files):
T007 → T008 → T009 → T010

# Frontend tasks after backend is ready:
T011 → T012

# But US3 backend + US2 frontend can run in parallel:
Stream A: T007 → T008 → T009 → T010 → T011 → T012
Stream B: T006 (US2 frontend edit)
```

---

## Implementation Strategy

### MVP First (P1 Stories Only)

1. Complete Phase 1: Schema migration (T001–T002)
2. Complete Phase 2: Ordering fix (T003–T005)
3. Complete Phase 4: Inline edit UI (T006)
4. **STOP and VALIDATE**: US1 + US2 + US5 all working — Admin can create/edit criteria, users can view them
5. Run build + lint gates

### Incremental Delivery

1. Schema + Ordering → P1 stories ready (MVP)
2. Add US3 (deactivate/reactivate) → P2 increment
3. US4 already complete → no additional work
4. Polish → final validation

### Total Effort Estimate

| Phase | Tasks | New Code | Extends Existing |
|-------|-------|----------|-----------------|
| Setup | 2 | Migration only | Schema |
| Foundational | 3 | None | 2 repository files |
| US2 (edit UI) | 1 | ~60 lines | 1 frontend page |
| US3 (deactivate/reactivate) | 6 | ~80 lines | 4 backend + 2 frontend files |
| Polish | 5 | None | Validation only |
| **Total** | **17** | **~140 lines** | **9 files** |

---

## Phase 9: Convergence

- [x] T018 [US4] Add match-status validation to `setCriterionResult()` in `backend/src/modules/matches/matches.service.ts`: after finding the criterion, fetch the match via `matchesRepository.findById(criterion.matchId)`, verify `match.status === MatchStatus.FINISHED`, throw `ApiError.badRequest` if not FINISHED — per FR-006, US4/AC3 (partial)

---

## Notes

- 3 of 5 user stories (US1, US4, US5) require zero additional implementation tasks — already fully working
- US2 needs only a frontend inline edit UI (1 task)
- US3 is the main new work: reactivation endpoint + deactivation lock enforcement (6 tasks)
- No test tasks generated (not requested in spec); validation via quickstart.md
- Commit after each phase checkpoint
