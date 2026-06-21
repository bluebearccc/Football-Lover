# Tasks: Team Management (UC13)

**Input**: Design documents from `specs/002-team-management/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/teams-api.md

**Tests**: Not explicitly requested — test tasks omitted. Validation via quickstart.md scenarios.

**Organization**: Tasks grouped by user story. Existing code covers ~90% of CRUD; main new work is sync integration and frontend enhancements.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Paths are relative to repository root

---

## Phase 1: Setup

**Purpose**: Environment and configuration additions needed before implementation

- [x] T001 Add `apiFootballBaseUrl` to `backend/src/config/env.ts` — add `API_FOOTBALL_BASE_URL` env var with default `https://v3.football.api-sports.io`
- [x] T002 [P] Add `API_FOOTBALL_BASE_URL` to `backend/.env.example` with placeholder value

**Checkpoint**: Environment configuration ready for api-football integration

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared utilities needed by multiple user stories

- [x] T003 Create typed api-football HTTP client in `backend/src/modules/sync/api-football.client.ts` — typed fetch wrapper with `x-apisports-key` auth header, error handling for provider unavailability (502), and rate limit awareness. Expose methods: `getTeamsByLeague(leagueId, season)` and `getSquad(teamId)`. Use response shapes from `contracts/teams-api.md` and `research.md` R1.
- [x] T004 Add sync-related Zod schemas to `backend/src/modules/teams/teams.dto.ts` — add `syncTeamsSchema` with `leagueId: z.number().int().positive()` and `season: z.coerce.number().int().optional()`. Export `SyncTeamsInput` type.

**Checkpoint**: Foundation ready — api-football client and sync DTO available for user story implementation

---

## Phase 3: User Story 1 — Admin Creates a New Team (Priority: P1) MVP

**Goal**: Admin creates teams with duplicate name validation; teams become selectable for matches.

**Independent Test**: Create a team via admin UI → verify it appears in team list. Try duplicate name → verify rejection.

### Implementation for User Story 1

- [x] T005 [US1] Add duplicate active team name check in `backend/src/modules/teams/teams.service.ts` — in the `create` method, before saving, query for an existing active team with the same name (case-insensitive). If found, throw `ApiError.conflict('Tên đội đã tồn tại')`. Add a `findByName(name: string)` method to `backend/src/modules/teams/teams.repository.ts` that checks `{ name: { equals: name, mode: 'insensitive' }, isActive: true }`.
- [x] T006 [US1] Verify frontend create flow in `frontend/src/app/admin/teams/page.tsx` — confirm the existing create form correctly handles the 409 conflict error from the duplicate name check and displays the error message. No changes expected if the existing `ApiError` catch already works.

**Checkpoint**: Team creation with duplicate validation works end-to-end. MVP deliverable.

---

## Phase 4: User Story 2 — Admin Edits an Existing Team (Priority: P1)

**Goal**: Admin edits team name/short name/logo; changes persist and reflect in the UI.

**Independent Test**: Edit a team's name → verify the change appears in the team list.

### Implementation for User Story 2

- [x] T007 [US2] Add duplicate name check on update in `backend/src/modules/teams/teams.service.ts` — in the `update` method, if `input.name` is provided, check for another active team with the same name (excluding the current team's ID). If found, throw `ApiError.conflict('Tên đội đã tồn tại')`. Reuse the repository method from T005 with an optional `excludeId` parameter.
- [x] T008 [US2] Verify frontend edit flow in `frontend/src/app/admin/teams/page.tsx` — confirm the existing edit form correctly displays 409 conflict errors on duplicate name. No changes expected.

**Checkpoint**: Team editing with duplicate validation works. US1 + US2 deliver complete CRUD.

---

## Phase 5: User Story 3 — Admin Deactivates a Team (Priority: P2)

**Goal**: Deactivate teams referenced by matches (no hard delete); allow reactivation; deactivated teams visually distinguished.

**Independent Test**: Delete a team referenced by a match → verify it deactivates instead. Toggle reactivation.

### Implementation for User Story 3

- [x] T009 [US3] Verify deactivation behavior in `backend/src/modules/teams/teams.service.ts` — confirm the existing `remove` method correctly checks `isReferencedByMatch` and deactivates instead of deleting. Confirm `setActive` method exists for reactivation. No changes expected — already implemented per AC-13-02.
- [x] T010 [US3] Verify frontend deactivation UI in `frontend/src/app/admin/teams/page.tsx` — confirm the existing "Xoá" button handles the `{ deleted: false }` response correctly and the "Kích hoạt"/"Ngừng" toggle works for reactivation. Confirm deactivated teams show "Ngừng" badge. No changes expected.

**Checkpoint**: Deactivation and reactivation flow works. Deactivated teams are visually distinguished.

---

## Phase 6: User Story 4 — Admin Syncs Teams/Players from api-football (Priority: P2)

**Goal**: Admin selects a league, triggers blocking sync, sees progress indicator and sync summary.

**Independent Test**: Trigger sync for a league → verify teams/players appear with external IDs and sync summary displays counts.

### Implementation for User Story 4

- [x] T011 [US4] Rewrite sync service in `backend/src/modules/sync/sync.service.ts` — replace the stub with a real implementation. Implement `syncTeamsByLeague(leagueId, season)` that: (1) calls `apiFootballClient.getTeamsByLeague()`, (2) for each team upserts by `externalId` using `teamsRepository.upsertByExternalId()` — set `name`/`shortName` only on create, always update `logoUrl`, (3) for each team calls `apiFootballClient.getSquad()` and upserts players by `externalId`, (4) returns a `SyncResult` with counts of created/updated/unchanged teams and players. Wrap in `prisma.$transaction` for atomicity. Import and use the api-football client from T003.
- [x] T012 [US4] Add `upsertByExternalId` method to `backend/src/modules/teams/teams.repository.ts` — implement upsert logic: if team with `externalId` exists, update only `logoUrl` (preserve Admin-edited `name`/`shortName`); if not, create with all fields. Add `upsertPlayerByExternalId` method: if player with `externalId` exists, update `name`/`position`/`imageUrl`; if not, create with team association.
- [x] T013 [US4] Add sync route in `backend/src/modules/sync/sync.routes.ts` — replace or extend the existing `POST /matches` stub. Add `POST /teams` route that validates body with `syncTeamsSchema` (from T004) and calls `syncService.syncTeamsByLeague()`. Return the `SyncResult` JSON.
- [x] T014 [US4] Mount sync teams route — verify `backend/src/routes/admin.routes.ts` already mounts sync routes at `/admin/sync`. The new `POST /admin/sync/teams` endpoint should be accessible. No changes expected if sync routes are already mounted.
- [x] T015 [P] [US4] Add `sync` method to frontend API client in `frontend/src/api/admin/teams.ts` — add `sync(input: { leagueId: number; season?: number })` method that calls `POST /admin/sync/teams` and returns the `SyncResult` type. Add `SyncResult` interface to `frontend/src/api/admin/types.ts`.
- [x] T016 [US4] Create sync panel component in `frontend/src/components/admin/teams/TeamSyncPanel.tsx` — a card with: (1) a numeric input for league ID (label: "League ID (api-football)"), (2) an optional season input (defaults to current year), (3) a "Đồng bộ" button that triggers the sync, (4) a loading spinner/indicator while sync runs (blocking UX), (5) after completion: display sync summary showing teams created/updated and players created/updated. Handle errors (API key not configured, provider unavailable) with user-friendly messages. Follow the admin UI card pattern from `frontend/src/components/admin/ui`.
- [x] T017 [US4] Integrate sync panel into teams page in `frontend/src/app/admin/teams/page.tsx` — import and render `TeamSyncPanel` above the team list card. After sync completes, auto-reload the team list.

**Checkpoint**: Full sync flow works: Admin enters league ID → triggers sync → sees progress → gets summary → team list refreshes with synced teams.

---

## Phase 7: User Story 5 — Admin Views Team Player Roster (Priority: P3)

**Goal**: Admin clicks a team to see its player roster with names, positions, and images (or default avatars).

**Independent Test**: Click a synced team → verify player list renders with correct data and default avatars for missing images.

### Implementation for User Story 5

- [x] T018 [P] [US5] Create player roster component in `frontend/src/components/admin/teams/PlayerRoster.tsx` — renders a table/list of players with columns: image (with default avatar fallback using `DEFAULT_PLAYER_AVATAR` constant), name, position. Show empty state message "Chưa có cầu thủ nào" when player list is empty. Use `Player` type from `frontend/src/api/admin/types.ts`.
- [x] T019 [P] [US5] Add `DEFAULT_PLAYER_AVATAR` constant to `frontend/src/lib/format.ts` — add a default player avatar path alongside the existing `DEFAULT_TEAM_LOGO`.
- [x] T020 [US5] Create team detail page in `frontend/src/app/admin/teams/[id]/page.tsx` — a `'use client'` page that: (1) fetches team with players via `adminTeamsApi.get(id)`, (2) displays team info (name, short name, logo with default fallback, active status badge), (3) renders `PlayerRoster` component with the team's players, (4) provides a back link to the team list. Follow the admin dark theme and card pattern.

**Checkpoint**: Team detail page with player roster works. All 5 user stories are independently functional.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Quality gates and final validation

- [x] T021 [P] Run `npm run build` in `backend/` — verify TypeScript compilation passes with zero errors
- [x] T022 [P] Run `npm run build` in `frontend/` — verify Next.js build passes with zero errors
- [x] T023 [P] Run `npm run lint` in `backend/` — verify linting passes
- [x] T024 [P] Run `npm run lint` in `frontend/` — verify linting passes
- [ ] T025 Run quickstart.md validation scenarios V1–V11 — manually verify each scenario in the browser per `specs/002-team-management/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (T001 for env config)
- **US1 (Phase 3)**: Depends on Phase 2 (no — uses existing code, only adds name check)
- **US2 (Phase 4)**: Depends on T005 from US1 (reuses `findByName` repo method)
- **US3 (Phase 5)**: No new dependencies — verification only
- **US4 (Phase 6)**: Depends on Phase 2 (T003 api-football client, T004 sync DTO)
- **US5 (Phase 7)**: No dependencies on other stories — uses existing `adminTeamsApi.get()`
- **Polish (Phase 8)**: Depends on all desired stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start immediately (existing code + small addition)
- **US2 (P1)**: Depends on US1 T005 (shared `findByName` method)
- **US3 (P2)**: Independent — verification only
- **US4 (P2)**: Depends on Phase 2 (T003, T004) — independent of US1/US2/US3
- **US5 (P3)**: Independent — can start after Phase 2 or even in parallel with other stories

### Within Each User Story

- Repository methods before service logic
- Service logic before route handlers
- Backend before frontend (API must exist before UI calls it)
- Components before page integration

### Parallel Opportunities

- T001 and T002 (env config) can run in parallel
- T003 and T004 (api-football client and sync DTO) can run in parallel
- US1/US2 and US3 can run in parallel (different concerns)
- US4 backend (T011–T014) and US5 frontend (T018–T020) can run in parallel after Phase 2
- T015 and T016 can run in parallel (API client and component, different files)
- T018 and T019 can run in parallel (component and constants, different files)
- All polish tasks (T021–T024) can run in parallel

---

## Parallel Example: User Story 4

```text
# After Phase 2 completes, launch backend tasks:
T011: Rewrite sync service in backend/src/modules/sync/sync.service.ts
T012: Add upsert methods to backend/src/modules/teams/teams.repository.ts
  (T011 depends on T012 — run T012 first, then T011)

# In parallel with backend, launch frontend prep:
T015: Add sync method to frontend/src/api/admin/teams.ts
T016: Create TeamSyncPanel component (can start in parallel with T015)

# After all above complete:
T013: Add sync route (depends on T011)
T017: Integrate sync panel into teams page (depends on T016)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T002)
2. Complete Phase 3: US1 — Add duplicate name validation (T005–T006)
3. **STOP and VALIDATE**: Create teams, verify duplicate rejection
4. This delivers core team creation with data integrity

### Incremental Delivery

1. **US1 + US2** (P1): Team CRUD with duplicate validation → Test → Deploy
2. **US3** (P2): Deactivation verification → Test → Deploy (minimal work — existing code)
3. **Phase 2 + US4** (P2): api-football sync → Test → Deploy (main new feature)
4. **US5** (P3): Player roster view → Test → Deploy
5. **Polish**: Build/lint checks, quickstart validation

### Fast Path (Leverage Existing Code)

Since ~90% of CRUD is already built, the realistic fast path is:
1. T001–T004: Setup + Foundational (~30 min)
2. T005–T010: US1 + US2 + US3 verification (~1 hr)
3. T011–T017: US4 sync integration (~3 hrs — main effort)
4. T018–T020: US5 player roster (~1 hr)
5. T021–T025: Polish + validation (~30 min)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- US3 (Phase 5) is verification-only — existing code already implements deactivation
- US4 (Phase 6) is the main new development effort (api-football integration)
- US5 (Phase 7) is a new frontend page but uses existing backend endpoint
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently

---

## Phase 9: Convergence

- [x] T026 [US4] Track "unchanged" count in `backend/src/modules/sync/sync.service.ts` — for teams, compare `logoUrl` before/after upsert; if unchanged, increment `teamCounts.unchanged` instead of `teamCounts.updated`. For players, compare `name`/`position`/`imageUrl` before/after upsert; if all unchanged, increment `playerCounts.unchanged` instead of `playerCounts.updated`. Update `backend/src/modules/teams/teams.repository.ts` `upsertByExternalId` and `upsertPlayerByExternalId` to return whether values actually changed. per FR-013, US4/AC1 (partial)
- [x] T027 [P] [US4] Display "unchanged" counts in `frontend/src/components/admin/teams/TeamSyncPanel.tsx` — add two additional summary items "Đội không đổi" and "Cầu thủ không đổi" showing `result.teams.unchanged` and `result.players.unchanged` in the sync result display grid. per FR-013 (partial)
