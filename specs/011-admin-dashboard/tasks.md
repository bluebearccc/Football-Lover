# Tasks: Admin Dashboard

**Input**: Design documents from `specs/011-admin-dashboard/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Not requested — test tasks omitted.

**Organization**: Tasks grouped by user story. Existing dashboard implementation is enhanced, not rebuilt.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Schema migration and new module scaffolding

- [x] T001 Add `AdminLog` model to `backend/prisma/schema.prisma` with fields: id, adminId, action, description, entityType, entityId, status, createdAt; add `adminLogs AdminLog[]` relation to User model; add indexes on adminId, createdAt, action
- [x] T002 Run `npm run prisma:migrate` in `backend/` with migration name `add-admin-log` to create the admin_logs table
- [x] T003 [P] Create `backend/src/modules/admin-log/admin-log.repository.ts` — Prisma repository with methods: create, findMany (paginated, filterable by action/date), deleteOlderThan (90-day cleanup)
- [x] T004 [P] Create `backend/src/modules/admin-log/admin-log.dto.ts` — Zod schemas: CreateAdminLogInput (action, description, entityType?, entityId?, status), AdminLogQueryParams (page, pageSize, action?, from?, to?)
- [x] T005 Create `backend/src/modules/admin-log/admin-log.service.ts` — service with methods: logAction(adminId, data), getLogs(query), cleanupOldLogs()
- [x] T006 Create `backend/src/modules/admin-log/admin-log.controller.ts` — controller with handler: list (GET paginated logs)
- [x] T007 Create `backend/src/modules/admin-log/admin-log.routes.ts` — mount GET / with validation middleware; export `adminLogRoutes`

**Checkpoint**: AdminLog module scaffolded, migration applied, module ready for integration

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Wire up admin-log routes, create dashboard repository layer, add dashboard DTOs

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T008 Mount `adminLogRoutes` at `/logs` in `backend/src/routes/admin.routes.ts` (add import and `adminRoutes.use('/logs', adminLogRoutes)`)
- [x] T009 Create `backend/src/modules/dashboard/dashboard.repository.ts` — extract existing Prisma queries from `dashboard.service.ts` into repository methods: countUsers, countLockedUsers, countTeams, countActiveTeams, countMatches, countLiveOrScheduled, countFinishedMatches, countPredictions, countComments, countHiddenComments; add new methods: sumGoldPool, getTrafficByHour(from, to), getTrafficByDay(from, to)
- [x] T010 Create `backend/src/modules/dashboard/dashboard.dto.ts` — Zod schemas: DashboardQueryParams (from?, to?, period?: '24h' | '7d')
- [x] T011 Refactor `backend/src/modules/dashboard/dashboard.service.ts` — use repository methods instead of direct Prisma calls; add methods: getOverview(query), getTraffic(period, from?, to?), getExportData(from?, to?)
- [x] T012 Add `DashboardTrafficBucket` and `DashboardExportData` types to `frontend/src/api/admin/types.ts` — TrafficBucket: { bucket: string, count: number }; enhance DashboardOverview to include traffic: TrafficBucket[], totalGoldPool: string; add AdminLog type

**Checkpoint**: Foundation ready — dashboard uses repository layer, admin-log routes mounted, FE types defined

---

## Phase 3: User Story 1 — View Platform Overview Metrics (Priority: P1) 🎯 MVP

**Goal**: Admin sees four key metric cards with real data including gold pool total, with auto-refresh

**Independent Test**: Login as admin → navigate to /admin → verify four cards show accurate, auto-refreshing data

### Implementation for User Story 1

- [x] T013 [US1] Implement `sumGoldPool` in `backend/src/modules/dashboard/dashboard.repository.ts` — use `prisma.$queryRaw` to `SELECT COALESCE(SUM(gold_won), 0) FROM match_participations` with optional date range filter; return as string (Decimal)
- [x] T014 [US1] Update `backend/src/modules/dashboard/dashboard.service.ts` stats() method to include `totalGoldPool` field by calling `repository.sumGoldPool()`
- [x] T015 [US1] Update `backend/src/modules/dashboard/dashboard.controller.ts` overview handler to accept optional `from`, `to` query params via `DashboardQueryParams` Zod validation and pass to service
- [x] T016 [US1] Update `backend/src/modules/dashboard/dashboard.routes.ts` — add `validateQuery` middleware for the GET / route using `DashboardQueryParams`
- [x] T017 [US1] Update `frontend/src/api/admin/dashboard.ts` — modify `overview()` to accept optional `{ from?, to?, period? }` params and pass as query string
- [x] T018 [US1] Update `frontend/src/app/admin/page.tsx` — replace the 4th metric card ("Bình luận") with "Tổng Gold Pool" card showing `totalGoldPool` formatted to 2 decimal places with "GP" suffix; add trend indicator
- [x] T019 [US1] Add periodic polling to `frontend/src/app/admin/page.tsx` — implement `useEffect` with `setInterval(fetchDashboard, 30000)` that re-fetches overview data; cleanup on unmount; add "Cập nhật lần cuối" timestamp display

**Checkpoint**: Admin sees 4 metric cards (users, live matches, predictions, gold pool) with auto-refresh every 30s

---

## Phase 4: User Story 2 — Monitor Match Traffic and Platform Stats (Priority: P2)

**Goal**: Admin sees dynamic traffic bar chart with time range selector and platform stats panel

**Independent Test**: Verify traffic chart shows real hourly/daily data; switching time range updates chart; platform stats show accurate ratios

### Implementation for User Story 2

- [x] T020 [P] [US2] Implement `getTrafficByHour` in `backend/src/modules/dashboard/dashboard.repository.ts` — use `prisma.$queryRaw` with `DATE_TRUNC('hour', created_at)` on predictions table, group and count for last 24h, return array of `{ bucket, count }`
- [x] T021 [P] [US2] Implement `getTrafficByDay` in `backend/src/modules/dashboard/dashboard.repository.ts` — same approach with `DATE_TRUNC('day', created_at)` for last 7 days
- [x] T022 [US2] Update `backend/src/modules/dashboard/dashboard.service.ts` — add `getTraffic(period, from?, to?)` method that calls `getTrafficByHour` or `getTrafficByDay` based on period param
- [x] T023 [US2] Update `backend/src/modules/dashboard/dashboard.controller.ts` overview handler to include `traffic` in response by calling `service.getTraffic(period)`
- [x] T024 [US2] Update `frontend/src/app/admin/page.tsx` — replace static `CHART_BARS` array with dynamic bar heights computed from `traffic` response data; bars should scale relative to max value in the dataset
- [x] T025 [US2] Update `frontend/src/app/admin/page.tsx` — make the time range `<select>` functional: onChange triggers re-fetch with `period` param ('24h' or '7d'); update chart data accordingly

**Checkpoint**: Traffic chart shows real prediction data; time selector switches between hourly and daily views

---

## Phase 5: User Story 3 — Review Recent System Activity Logs (Priority: P3)

**Goal**: Admin sees a table of recent admin actions (not recent matches) with proper log entries

**Independent Test**: Perform admin action → verify it appears in "Hoạt động gần đây" table with correct timestamp, description, actor, status badge

### Implementation for User Story 3

- [x] T026 [US3] Add admin action logging calls to existing admin controllers — insert `adminLogService.logAction()` calls at the end of successful handlers in: `backend/src/modules/matches/matches.controller.ts` (create, update, settle/score, cancel), `backend/src/modules/criteria/criteria.controller.ts` (create, update), `backend/src/modules/users/users.controller.ts` (lock, unlock, role change)
- [x] T027 [US3] Add `getRecentLogs` method to `backend/src/modules/dashboard/dashboard.service.ts` — call `adminLogService.getLogs({ pageSize: 5 })` and return with admin display name
- [x] T028 [US3] Update `backend/src/modules/dashboard/dashboard.controller.ts` overview handler to include `recentLogs` in response (replacing or alongside `recentMatches`)
- [x] T029 [US3] Update `frontend/src/app/admin/page.tsx` "Hoạt động gần đây" table — replace `recentMatches` rendering with `recentLogs` data; display columns: timestamp (formatDateTime), event description, admin actor name, status badge (SUCCESS=green, WARNING=red, UPDATED=blue)
- [x] T030 [US3] Update `frontend/src/app/admin/page.tsx` "Xem tất cả" link — change href from `/admin/matches` to `/admin/logs`
- [x] T031 [US3] Create `frontend/src/app/admin/logs/page.tsx` — full paginated admin logs page with table (timestamp, action, description, admin, status), pagination controls, action filter dropdown, date range filter; use `adminLogApi.list()` from API client
- [x] T032 [US3] Add `adminLogApi` to `frontend/src/api/admin/dashboard.ts` — add `logs(params)` method that calls `GET /api/v1/admin/logs` with query params (page, pageSize, action, from, to)
- [x] T033 [US3] Add 90-day cleanup: in `backend/src/modules/admin-log/admin-log.service.ts` `getLogs()` method, trigger lazy cleanup by calling `repository.deleteOlderThan(90)` before returning results (runs at most once per request)

**Checkpoint**: Admin actions appear in dashboard log table; "View Full Logs" navigates to paginated logs page

---

## Phase 6: User Story 4 — Review Moderation Queue (Priority: P3)

**Goal**: Moderation queue panel shows hidden comments (already built) with proper empty state

**Independent Test**: Verify moderation panel shows hidden comments or "no pending items" empty state; "Đến Kiểm duyệt" link works

### Implementation for User Story 4

- [x] T034 [US4] Review and verify existing moderation queue in `frontend/src/app/admin/page.tsx` — confirm hidden comments display correctly with content preview, user name, timestamp, and "Xem xét" link to `/admin/comments`
- [x] T035 [US4] Verify empty state in moderation queue — when no hidden comments exist, confirm "Không có bình luận bị ẩn" message displays with "Hệ thống đang hoạt động bình thường" subtitle

**Checkpoint**: Moderation queue works as-is — no code changes needed if existing implementation passes verification

---

## Phase 7: User Story 5 — Filter and Export Dashboard Data (Priority: P4)

**Goal**: Admin can filter dashboard by date range and export data as CSV

**Independent Test**: Apply date filter → verify metrics update; click Export → verify CSV downloads with correct data

### Implementation for User Story 5

- [x] T036 [P] [US5] Create `backend/src/modules/dashboard/dashboard.service.ts` `getExportData(from?, to?)` method — aggregates stats into flat array of `{ metric, value, period }` objects suitable for CSV
- [x] T037 [P] [US5] Add `export` handler to `backend/src/modules/dashboard/dashboard.controller.ts` — calls `service.getExportData(from, to)`, generates CSV string with header row and data rows, sets `Content-Type: text/csv` and `Content-Disposition: attachment; filename="dashboard-export-YYYY-MM-DD.csv"` headers
- [x] T038 [US5] Add `GET /export` route to `backend/src/modules/dashboard/dashboard.routes.ts` with `DashboardQueryParams` validation
- [x] T039 [US5] Update `frontend/src/api/admin/dashboard.ts` — add `exportCsv(params?)` method that calls `GET /api/v1/admin/dashboard/export` with optional from/to params and triggers browser download via blob URL
- [x] T040 [US5] Update `frontend/src/app/admin/page.tsx` — make "Filter" button functional: onClick opens a date range picker (two date inputs for from/to); on apply, store date range in state and re-fetch all dashboard data with from/to params; on clear, reset to default (no filter)
- [x] T041 [US5] Update `frontend/src/app/admin/page.tsx` — replace "New Match" link in header with "Export Report" button; onClick calls `adminDashboardApi.exportCsv(currentFilter)` to trigger CSV download

**Checkpoint**: Date filter updates all dashboard sections; Export button downloads CSV with filtered data

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Quality gates, responsive verification, and final cleanup

- [x] T042 [P] Update `frontend/src/app/admin/layout.tsx` sidebar NAV array — add `{ href: '/admin/logs', label: 'Activity Logs', icon: 'history', exact: false }` entry
- [x] T043 [P] Verify responsive layout in `frontend/src/app/admin/page.tsx` — confirm metric cards stack to 1 column on mobile (<768px), chart and stats panel stack vertically, bottom nav bar shows on mobile; fix any layout issues
- [x] T044 Run `npm run build` in `backend/` — fix any TypeScript errors
- [x] T045 Run `npm run lint` in `backend/` — fix any linting errors
- [x] T046 Run `npm run build` in `frontend/` — fix any TypeScript errors
- [x] T047 Run `npm run lint` in `frontend/` — fix any linting errors
- [x] T048 Run quickstart.md validation scenarios V1–V10 against dev server

**Checkpoint**: All quality gates pass, feature complete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (migration must be applied first)
- **User Stories (Phase 3–7)**: All depend on Phase 2 completion
  - US1 (metrics + polling) can start first — provides the MVP
  - US2 (traffic chart) independent of US1
  - US3 (admin logs) independent of US1/US2 for backend; FE changes share page.tsx so should be sequential
  - US4 (moderation) independent — verification only
  - US5 (filter + export) depends on US1 (needs the filter state and polling infrastructure)
- **Polish (Phase 8)**: Depends on all user stories

### User Story Dependencies

- **US1 (P1)**: After Phase 2 — no story dependencies. **MVP target.**
- **US2 (P2)**: After Phase 2 — no story dependencies. Can parallel with US1 (backend tasks are separate files; FE edits same page.tsx so sequence after US1 FE tasks).
- **US3 (P3)**: After Phase 2 — no story dependencies. Backend logging calls touch existing controllers.
- **US4 (P3)**: After Phase 2 — verification only, no code changes expected.
- **US5 (P4)**: After US1 (shares page.tsx state/polling infrastructure).

### Within Each User Story

- Backend repository → service → controller → routes (sequential)
- Frontend API client → page component (sequential)
- Backend and frontend can be done in parallel where tasks touch different files

### Parallel Opportunities

- T003 & T004 (repository + dto scaffolding) can run in parallel
- T020 & T021 (traffic by hour + traffic by day) can run in parallel
- T036 & T037 (export service + export controller) can run in parallel
- T042 & T043 (sidebar nav + responsive check) can run in parallel
- T044–T047 (build + lint checks) can run in pairs (backend pair, frontend pair)

---

## Parallel Example: Phase 2 Foundation

```text
# These can run in parallel (different files):
Task T009: "Create dashboard.repository.ts"
Task T010: "Create dashboard.dto.ts"

# Then sequentially:
Task T011: "Refactor dashboard.service.ts to use repository" (depends on T009, T010)
```

## Parallel Example: User Story 2

```text
# These can run in parallel (different methods, same file but independent):
Task T020: "Implement getTrafficByHour in dashboard.repository.ts"
Task T021: "Implement getTrafficByDay in dashboard.repository.ts"

# Then sequentially:
Task T022: "Add getTraffic to dashboard.service.ts" (depends on T020, T021)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (migration + scaffolding)
2. Complete Phase 2: Foundational (repository layer, DTOs, types)
3. Complete Phase 3: User Story 1 (gold pool metric + auto-refresh)
4. **STOP and VALIDATE**: 4 metric cards display with real data, auto-refresh every 30s
5. This delivers immediate value — admin can monitor platform health

### Incremental Delivery

1. Setup + Foundational → repository layer, admin-log module ready
2. Add US1 → Gold pool metric + polling → **MVP!**
3. Add US2 → Dynamic traffic chart → enhanced analytics
4. Add US3 → Admin action logs → operational awareness
5. Add US4 → Verify moderation queue → quality check
6. Add US5 → Filter + export → power features
7. Polish → quality gates, responsive check, full validation

---

## Notes

- Existing admin dashboard page (`frontend/src/app/admin/page.tsx`) is ~425 lines and already implements ~60% of the spec
- US3 backend logging requires touching multiple existing controller files — coordinate to avoid conflicts
- The `page.tsx` file is shared across US1–US5 frontend tasks — sequence FE work within each story to avoid merge conflicts
- Gold values MUST use Prisma Decimal (not JS number) — return as string from API, format to 2 decimal places in FE
- All timestamps in Vietnam timezone (Asia/Ho_Chi_Minh) for display

---

## Phase 9: Convergence

**Purpose**: Close gaps between implemented code and spec/plan requirements identified by `/speckit-converge`

- [x] T049 Update `backend/src/modules/dashboard/dashboard.repository.ts` and `dashboard.service.ts` — add optional `from`/`to` date params to `stats()` and all count methods so the date filter actually filters backend data per FR-012 (partial)
- [x] T050 Update `backend/src/modules/dashboard/dashboard.controller.ts` `overview` handler — pass `req.query.from` and `req.query.to` to `dashboardService.stats(from, to)` and `dashboardService.getTraffic(period, from, to)` per FR-012 (partial)
- [x] T051 Update `backend/src/modules/dashboard/dashboard.service.ts` `getExportData()` — accept `from`/`to` params, include traffic data rows in the CSV output per FR-013 (partial)
- [x] T052 Update `backend/src/modules/dashboard/dashboard.controller.ts` `exportCsv` handler — pass `req.query.from` and `req.query.to` to `dashboardService.getExportData(from, to)` per FR-013 (partial)
- [x] T053 Update `frontend/src/app/admin/layout.tsx` NAV array — add entries for "Point Rules" (`/admin/matches` or placeholder) and "Analytics" (`/admin` or placeholder) to match FR-014 and the mockup sidebar per FR-014 (partial)
- [x] T054 Run `npm run build` in `backend/` and `frontend/` — fix any TypeScript errors introduced by convergence tasks
- [x] T055 Run `npm run lint` in `backend/` and `frontend/` — fix any linting errors introduced by convergence tasks
