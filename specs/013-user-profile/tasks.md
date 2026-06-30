---

description: "Task list for feature implementation"
---

# Tasks: User Profile and Prediction History

**Input**: Design documents from `/specs/013-user-profile/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/profile-api.md, quickstart.md

**Tests**: Not requested in spec.md and no test framework exists in this repo (see research.md) — verification tasks reference `quickstart.md` manual scenarios instead of automated tests.

**Context**: Most of UC10 is already implemented (self-service `/profile`, `/history`, and the
backend Admin support routes). This task list is intentionally small: it fixes one data bug
(Foundational) and builds the one missing piece (the Admin frontend support view, US3), with
verification tasks for the already-built Stories 1 and 2.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

## Path Conventions

Web app: `backend/src/`, `frontend/src/` (per plan.md Structure Decision).

---

## Phase 1: Setup

**Purpose**: Confirm the existing dev environment is ready — no new dependencies or scaffolding needed for this feature.

- [X] T001 Confirm `backend` (`npm run dev`, port 4000) and `frontend` (`npm run dev`, port 5173) start cleanly against the current `backend/package.json` / `frontend/package.json` with no new dependencies required

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Fix the stats-scoping bug shared by both the self-service profile (US1) and the Admin support view (US3) — both render through the same `profileService`/`profileRepository`.

**⚠️ CRITICAL**: Must complete before validating US1 or building/validating US3.

- [X] T002 Filter `totalMatches`, `totalWins`, and the `totalGoldWon` aggregate in `getStats` to `MatchParticipation` rows whose `match.status === 'FINISHED'` in `backend/src/modules/profile/profile.repository.ts`

**Checkpoint**: `GET /api/v1/profile/me` now returns a `totalMatches` count that excludes `SCHEDULED`/`LIVE` participations (verify per `quickstart.md` "Backend-only check" section).

---

## Phase 3: User Story 1 - Registered user views own profile (Priority: P1) 🎯 MVP

**Goal**: A registered user opens `/profile` and sees correct account info and stats, with proper empty-state and auth-redirect handling.

**Independent Test**: Log in as a user with finished-match history, open `/profile`, verify all fields per `quickstart.md` Story 1+2 steps 1-2 and 4-5.

**Status**: Already implemented (`backend/src/modules/profile/`, `frontend/src/app/(main)/profile/page.tsx`); this phase is verification only, confirming the Phase 2 fix flows through correctly.

- [X] T003 [US1] Verify `/profile` renders display name, email, join date, all-time points, current-month rank (or "not ranked yet"), and stats — confirming `totalMatches` now reflects only `FINISHED` matches after T002 — per `quickstart.md` Story 1+2 steps 1-2, against `frontend/src/app/(main)/profile/page.tsx` and `frontend/src/components/profile/ProfileStatsCard.tsx`
- [X] T004 [US1] Verify empty-state rendering for a zero-participation user and login-redirect on session expiry per `quickstart.md` Story 1+2 steps 4-5, against `frontend/src/app/(main)/profile/page.tsx`

**Checkpoint**: User Story 1 is fully functional and verified independently.

---

## Phase 4: User Story 2 - Registered user views own prediction history (Priority: P1)

**Goal**: A registered user sees a 5-item recent-history preview on `/profile` with a link to a full paginated `/history` screen.

**Independent Test**: Log in as a user with 5+ finished matches, confirm the 5-item preview and link on `/profile`, then confirm full pagination on `/history` per `quickstart.md` Story 1+2 step 3.

**Status**: Already implemented (`frontend/src/app/(main)/history/page.tsx`, `frontend/src/components/profile/MatchHistoryList.tsx`); this phase is verification only.

- [X] T005 [US2] Verify the 5-item recent-history preview and "view all" link on `/profile` per `quickstart.md` Story 1+2 step 2, against `frontend/src/app/(main)/profile/page.tsx`
- [X] T006 [US2] Verify the full paginated `/history` screen (ordering, paging controls past 5 items) per `quickstart.md` Story 1+2 step 3, against `frontend/src/app/(main)/history/page.tsx`

**Checkpoint**: User Stories 1 AND 2 both verified working independently.

---

## Phase 5: User Story 3 - Admin views a user's profile/history for support (Priority: P2)

**Goal**: An authenticated Admin can open a target user's read-only profile/history from the admin user-management screen, reusing the existing self-service data shape and components.

**Independent Test**: Log in as Admin, open a user's detail from `/admin/users`, verify the same profile/stats/history content renders read-only; confirm a non-Admin gets `403` and a bad ID gets `404` per `quickstart.md` Story 3 steps 1-4.

**Status**: Backend routes already exist (`backend/src/modules/users/users.controller.ts`, `users.routes.ts`, guarded by `requireRole('ADMIN')` in `backend/src/routes/admin.routes.ts`) and need no changes. Only the frontend consumer is missing.

- [X] T007 [P] [US3] Add `getProfile(id: string)` and `getHistory(id: string, params?)` methods to `frontend/src/api/admin/users.ts`, reusing the `ProfileResponse` / `HistoryResponse` types exported from `frontend/src/api/profile.ts` (per `contracts/profile-api.md` — no parallel type declarations)
- [X] T008 [US3] Create `frontend/src/app/admin/users/[id]/page.tsx`: a read-only admin user-detail screen that calls the new `adminUsersApi.getProfile`/`getHistory` (T007) and renders the existing `frontend/src/components/profile/ProfileStatsCard.tsx` and `frontend/src/components/profile/MatchHistoryList.tsx` components verbatim (5-item preview + link, no edit controls), using `stitch_goalpredict_live_dashboard/admin_user_management/` for the surrounding admin shell/chrome only (depends on T007)
- [X] T009 [US3] Add a per-row "View profile" link/action in `frontend/src/app/admin/users/page.tsx` that navigates to `/admin/users/[id]` (depends on T008)
- [X] T010 [US3] Verify the Admin support view end-to-end, plus the `403` (non-Admin) and `404` (unknown user id) cases, per `quickstart.md` Story 3 steps 1-4, against `backend/src/modules/users/users.controller.ts` and the new `frontend/src/app/admin/users/[id]/page.tsx`

**Checkpoint**: All three user stories are independently functional and verified.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Repo-wide quality gates required by Constitution Principle V before reporting the feature done.

- [X] T011 [P] Run `npm run build` and `npm run lint` in `backend/`
- [X] T012 [P] Run `npm run build` and `npm run lint` in `frontend/`
- [X] T013 Run the full `specs/013-user-profile/quickstart.md` validation end-to-end (all three stories + the backend-only stats check) and record results

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup. **BLOCKS** Phase 3 and Phase 5 verification (both render stats through the fixed `getStats`).
- **User Story 1 (Phase 3)**: Depends on Phase 2 (needs the corrected stats to verify against).
- **User Story 2 (Phase 4)**: Depends on Phase 2 only (history pagination is unaffected by the stats fix, but Foundational still gates all story work per template convention). Independent of Phase 3.
- **User Story 3 (Phase 5)**: Depends on Phase 2 (reuses the same `profileService`). Independent of Phases 3 and 4's verification, but T008 depends on T007, and T009 depends on T008 within this phase.
- **Polish (Phase 6)**: Depends on Phases 3, 4, and 5 all being complete.

### Parallel Opportunities

- T011 and T012 (Phase 6) can run in parallel — different folders.
- T007 (Phase 5) has no dependency on Phases 3/4 and can start as soon as Phase 2 is done, in parallel with Phase 3/4 verification.
- T003 and T005 touch the same file (`frontend/src/app/(main)/profile/page.tsx`) but are read-only verification steps, not edits — they may be done in either order, just not literally simultaneously by two agents editing the same file (not applicable here since neither edits it).

---

## Parallel Example: Phase 5 kickoff alongside Phase 3/4 verification

```bash
# Once Phase 2 (T002) is done, these can run in parallel:
Task: "Add getProfile/getHistory methods to frontend/src/api/admin/users.ts"          # T007
Task: "Verify /profile stats and empty-state per quickstart.md"                       # T003/T004
Task: "Verify /profile 5-item preview and /history pagination per quickstart.md"      # T005/T006
```

---

## Implementation Strategy

### MVP First

The real "new MVP" here is small: complete Phase 1 → Phase 2 (the stats fix) → Phase 3 verification. That alone closes the only correctness gap in the already-shipped self-service profile (US1/US2 are otherwise done).

### Incremental Delivery

1. Phase 1 + Phase 2 → stats bug fixed, verify via the backend-only check in `quickstart.md`.
2. Phase 3 + Phase 4 → confirm US1/US2 fully correct (verification only, no new code expected).
3. Phase 5 → build and verify the missing Admin support view (US3) — the one piece of net-new code in this feature.
4. Phase 6 → gates + full quickstart pass, report done.

### Notes

- [P] tasks touch different files and have no blocking dependency on incomplete tasks.
- Commit after each task or logical group, per repository convention.
- Stop at any checkpoint to validate a story independently before continuing.

---

## Phase 7: Convergence

- [X] T014 Restyle the two card containers in `frontend/src/app/admin/users/[id]/page.tsx` (account-info section and history-card section) to use the `glass-panel` utility class, matching the convention used by sibling admin components (`frontend/src/components/admin/users/UserStatsCards.tsx`, `UserFilters.tsx`, `UserTable.tsx`) instead of the end-user `/profile` surface-container styling, per plan: UI baseline checklist (admin_user_management chrome reuse) (partial)
