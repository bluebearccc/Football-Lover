# Tasks: Manage Users (012)

**Input**: Design documents from `specs/012-manage-users/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/api.md

**Tests**: Not explicitly requested — test tasks omitted. Use `quickstart.md` for manual validation.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1–US5)
- Paths use `backend/` and `frontend/` prefixes

---

## Phase 1: Setup

**Purpose**: Schema migration and shared infrastructure changes

- [x] T001 Add `banReason String? @map("ban_reason")` and `lastActiveAt DateTime? @map("last_active_at")` fields to User model in `backend/prisma/schema.prisma`, add `@@index([lastActiveAt])`
- [x] T002 Run `npm run prisma:migrate` in `backend/` with migration name `add-user-ban-reason-last-active`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core middleware changes that all user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Add LOCKED status check to `authenticate` middleware in `backend/src/middleware/auth.ts` — after JWT verification, query `user.status` by `req.user.id`; if `LOCKED`, throw `ApiError.forbidden('Tài khoản đã bị khoá')`. Use Prisma singleton from `backend/src/lib/prisma.ts`
- [x] T004 Create `lastActive` middleware in `backend/src/middleware/lastActive.ts` — on authenticated requests, update `user.lastActiveAt` only if current value is null or older than 5 minutes (throttled write). Register it after `authenticate` in `backend/src/routes/admin.routes.ts` and relevant public routes
- [x] T005 [P] Update `AdminUser` type in `frontend/src/api/admin/types.ts` — add `accuracy: number | null` and `banReason: string | null` fields to the `AdminUser` interface
- [x] T006 [P] Add `UserStats` interface to `frontend/src/api/admin/types.ts`: `{ totalUsers: number; onlineNow: number; lockedUsers: number; averageAccuracy: number }`

**Checkpoint**: Foundation ready — middleware enforces LOCKED check, tracks activity, frontend types updated

---

## Phase 3: User Story 1 — View and Search User List (Priority: P1) 🎯 MVP

**Goal**: Admin sees a paginated, searchable, filterable user table matching the Stitch mockup

**Independent Test**: Log in as Admin, navigate to `/admin/users`, verify table displays with data, search filters in real-time, status filter tabs work, pagination controls appear

### Implementation for User Story 1

- [x] T007 [US1] Update `publicSelect` in `backend/src/modules/users/users.repository.ts` to include `banReason` and `lastActiveAt` fields. Add a `listWithAccuracy` method that computes per-user prediction accuracy via Prisma raw query or aggregation (correct criteria / total criteria for finished matches)
- [x] T008 [US1] Update `usersService.list()` in `backend/src/modules/users/users.service.ts` to call the new `listWithAccuracy` method and return `accuracy` field in each user item
- [x] T009 [US1] Update `usersController.list()` in `backend/src/modules/users/users.controller.ts` to pass validated query params (no logic changes needed, ensure new fields pass through)
- [x] T010 [US1] Update `adminUsersApi.list()` in `frontend/src/api/admin/users.ts` to accept `status` filter param (already supported but verify typing)
- [x] T011 [P] [US1] Create `frontend/src/components/admin/users/UserFilters.tsx` — filter tabs (All Users / Active / Locked) + debounced search input (~300ms). Use Elite Pitch dark theme styling from mockup `code.html` (glass-panel, pill buttons with `bg-primary/20` active state, search with `bg-surface-container` border)
- [x] T012 [P] [US1] Create `frontend/src/components/admin/users/UserTable.tsx` — data table with columns: Name/ID (avatar initials + name + ID), Status (badge), Points, Accuracy (progress bar + percentage), Joined date, Actions (edit/reset/ban buttons). Style per mockup: `glass-panel`, `divide-y`, hover `translateX(4px)` micro-interaction
- [x] T013 [P] [US1] Create `frontend/src/components/admin/users/UserPagination.tsx` — pagination controls with page numbers, prev/next buttons, "Showing X to Y of Z users" text. Style per mockup: numbered page buttons with active `bg-primary` state
- [x] T014 [US1] Rewrite `frontend/src/app/admin/users/page.tsx` to match Stitch mockup layout: page header with title + subtitle, integrate `UserFilters`, `UserTable`, `UserPagination` components. Use Elite Pitch dark theme (`bg-background`, `text-on-background`, `glass-panel`). Implement debounced search state, status filter state, pagination state. Call `adminUsersApi.list()` with all params. Show empty state "Không có người dùng" when no results

**Checkpoint**: User Story 1 fully functional — Admin can view, search, filter, and paginate users

---

## Phase 4: User Story 2 — Ban and Unban Users (Priority: P1)

**Goal**: Admin can lock/unlock user accounts with a mandatory reason for locking

**Independent Test**: Lock an active user with a reason → verify status changes to LOCKED and user cannot log in. Unlock → verify status restored and user can log in again

### Implementation for User Story 2

- [x] T015 [US2] Update `setStatusSchema` in `backend/src/modules/users/users.dto.ts` — add `reason: z.string().trim().min(1).max(500).optional()` field. Add `.refine()` to require `reason` when `status === 'LOCKED'`
- [x] T016 [US2] Update `usersService.setStatus()` in `backend/src/modules/users/users.service.ts` — accept `reason` param, add guard to prevent locking Admin accounts (`user.role === 'ADMIN'` → throw `ApiError.badRequest`), pass `banReason` to repository
- [x] T017 [US2] Update `usersRepository.setStatus()` in `backend/src/modules/users/users.repository.ts` — accept optional `banReason` param, set `banReason` on lock (clear to `null` on unlock)
- [x] T018 [US2] Update `usersController.setStatus()` in `backend/src/modules/users/users.controller.ts` — pass `reason` from `req.body` to service, include reason in AdminLog description for USER_LOCK
- [x] T019 [P] [US2] Create `frontend/src/components/admin/users/ConfirmModal.tsx` — generic confirmation dialog (title, message, confirm/cancel buttons). Dark theme styling with `glass-panel` backdrop. Used for unban and password reset confirmations
- [x] T020 [P] [US2] Create `frontend/src/components/admin/users/BanModal.tsx` — ban confirmation modal with required textarea for ban reason (max 500 chars). Confirm button disabled until reason entered. Dark theme styling matching mockup
- [x] T021 [US2] Update `adminUsersApi` in `frontend/src/api/admin/users.ts` — modify `setStatus()` to accept optional `reason` param in the request body
- [x] T022 [US2] Wire ban/unban actions in `frontend/src/app/admin/users/page.tsx` — Ban button opens `BanModal`, Unban button opens `ConfirmModal`. On confirm, call API, refresh list, show success/error banner. Ban button shows only for non-Admin active users; Unban shows for locked users

**Checkpoint**: User Story 2 fully functional — Admin can lock with reason and unlock users, locked users blocked at login and middleware

---

## Phase 5: User Story 3 — Edit User Information (Priority: P2)

**Goal**: Admin can edit user's display name and role via a modal dialog

**Independent Test**: Click Edit on a user → modal shows current values → change display name and role → save → verify changes persist in table

### Implementation for User Story 3

- [x] T023 [US3] Create `editUserSchema` in `backend/src/modules/users/users.dto.ts` — `displayName: z.string().trim().min(2).max(50).optional()`, `role: z.nativeEnum(Role).optional()`, with `.refine()` requiring at least one field
- [x] T024 [US3] Add `update()` method to `usersRepository` in `backend/src/modules/users/users.repository.ts` — accepts `{ displayName?, role? }`, returns updated user with `publicSelect`
- [x] T025 [US3] Add `editUser()` method to `usersService` in `backend/src/modules/users/users.service.ts` — validates actor cannot demote own role, calls repository `update()`. Returns updated user
- [x] T026 [US3] Add `editUser()` handler to `usersController` in `backend/src/modules/users/users.controller.ts` — validates body, calls service, logs `USER_EDIT` and/or `USER_ROLE_CHANGE` to AdminLog
- [x] T027 [US3] Add `PATCH /:id` route to `backend/src/modules/users/users.routes.ts` with `validateBody(editUserSchema)` — place before `/:id/status` to avoid route conflicts
- [x] T028 [US3] Add `editUser(id, data)` method to `adminUsersApi` in `frontend/src/api/admin/users.ts` — PATCH to `/users/${id}` with `{ displayName?, role? }` body
- [x] T029 [P] [US3] Create `frontend/src/components/admin/users/EditUserModal.tsx` — modal with display name text input and role select (USER/ADMIN). Pre-populated with current values. Save button calls API. Self-demotion guard: if editing own account, role select disabled with tooltip. Dark theme styling
- [x] T030 [US3] Wire Edit action in `frontend/src/app/admin/users/page.tsx` — Edit button opens `EditUserModal` with selected user data. On save, refresh list, show success banner

**Checkpoint**: User Story 3 fully functional — Admin can edit display names and roles via modal

---

## Phase 6: User Story 4 — Admin-Initiated Password Reset (Priority: P2)

**Goal**: Admin can trigger a password reset email for any user

**Independent Test**: Click Reset Password on a user → confirm → verify success notification and email sent

### Implementation for User Story 4

- [x] T031 [US4] Add `adminResetPassword()` method to `usersService` in `backend/src/modules/users/users.service.ts` — looks up user by ID, calls existing `authService.forgotPassword({ email: user.email })` to trigger reset flow
- [x] T032 [US4] Add `resetPassword()` handler to `usersController` in `backend/src/modules/users/users.controller.ts` — calls service, logs `USER_PASSWORD_RESET` to AdminLog, returns success message
- [x] T033 [US4] Add `POST /:id/reset-password` route to `backend/src/modules/users/users.routes.ts`
- [x] T034 [US4] Add `resetPassword(id)` method to `adminUsersApi` in `frontend/src/api/admin/users.ts` — POST to `/users/${id}/reset-password`
- [x] T035 [US4] Wire Reset Password action in `frontend/src/app/admin/users/page.tsx` — Reset Password button opens `ConfirmModal` (from T019) with confirmation message. On confirm, call API, show success/error banner

**Checkpoint**: User Story 4 fully functional — Admin can trigger password resets for any user

---

## Phase 7: User Story 5 — User Overview Statistics (Priority: P3)

**Goal**: Stats cards at top of page showing total users, online now, locked accounts, average accuracy

**Independent Test**: Navigate to `/admin/users` → verify 4 stats cards display correct aggregate values

### Implementation for User Story 5

- [x] T036 [US5] Add `getStats()` method to `usersRepository` in `backend/src/modules/users/users.repository.ts` — queries: `COUNT(*)` total users, `COUNT(*) WHERE status=LOCKED`, `COUNT(*) WHERE lastActiveAt > now()-15min`, average prediction accuracy across all users with ≥ 1 prediction
- [x] T037 [US5] Add `getStats()` method to `usersService` in `backend/src/modules/users/users.service.ts` — calls repository, formats response
- [x] T038 [US5] Add `getStats()` handler to `usersController` in `backend/src/modules/users/users.controller.ts` — returns stats JSON
- [x] T039 [US5] Add `GET /stats` route to `backend/src/modules/users/users.routes.ts` — place before `/:id` to avoid route param conflict
- [x] T040 [US5] Add `getStats()` method to `adminUsersApi` in `frontend/src/api/admin/users.ts` — GET `/users/stats`
- [x] T041 [P] [US5] Create `frontend/src/components/admin/users/UserStatsCards.tsx` — 4-card bento grid per mockup: Total Users (primary icon, +% change), Online Now (secondary icon), Banned Accounts (tertiary icon), Avg Accuracy (primary-container icon). Each card: `glass-panel`, `p-card-padding`, `rounded-xl`, icon with tinted background, label-caps title, headline number. Responsive: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
- [x] T042 [US5] Integrate `UserStatsCards` into `frontend/src/app/admin/users/page.tsx` — fetch stats on page load, display above filters/table

**Checkpoint**: User Story 5 fully functional — Stats overview displays at top of user management page

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, build checks, and refinements

- [x] T043 [P] Run `npm run build` and `npm run lint` in `backend/` — fix any TypeScript or lint errors
- [x] T044 [P] Run `npm run build` and `npm run lint` in `frontend/` — fix any TypeScript or lint errors
- [x] T045 Verify responsive layout at breakpoints 480/768/1024/1440px in browser — ensure table scrolls horizontally on mobile, stats cards stack, touch targets ≥ 44×44px
- [x] T046 Run all validation scenarios from `specs/012-manage-users/quickstart.md` — verify API endpoints, frontend flows, and edge cases

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (migration must complete first)
- **User Stories (Phases 3–7)**: All depend on Phase 2 completion
  - US1 (Phase 3): No dependencies on other stories — **MVP**
  - US2 (Phase 4): No dependencies on other stories (can parallel with US1)
  - US3 (Phase 5): No dependencies on other stories (can parallel)
  - US4 (Phase 6): No dependencies on other stories (can parallel)
  - US5 (Phase 7): No dependencies on other stories (can parallel)
- **Polish (Phase 8)**: Depends on all user stories complete

### Within Each User Story

- Backend repository → service → controller → routes (sequential)
- Frontend API client → components → page integration (sequential)
- Backend and frontend tracks can run in parallel within a story

### Parallel Opportunities

- T005 + T006: Frontend type updates (different sections of same file, but independent additions)
- T011 + T012 + T013: Frontend components for US1 (separate files)
- T019 + T020: Modals for US2 (separate files)
- T043 + T044: Build/lint checks (separate folders)
- All user stories (Phases 3–7) can run in parallel after Phase 2

---

## Parallel Example: User Story 1

```
# Backend track (sequential):
T007 → T008 → T009

# Frontend track (parallel components, then sequential integration):
T010 (API client update)
T011 + T012 + T013 (parallel: filters, table, pagination components)
T014 (page integration — depends on T010, T011, T012, T013)

# Backend and frontend tracks can run in parallel
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Schema migration (T001–T002)
2. Complete Phase 2: Middleware + types (T003–T006)
3. Complete Phase 3: User list with search/filter/pagination (T007–T014)
4. **STOP and VALIDATE**: Test user list independently
5. Deploy/demo if ready — Admin can see and search all users

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 (list) → MVP — Admin can view/search/filter users
3. US2 (ban/unban) → Core moderation capability added
4. US3 (edit) → Role management and data correction added
5. US4 (password reset) → Support capability added
6. US5 (stats) → Overview dashboard added
7. Polish → Build verified, responsive tested, quickstart validated

---

## Phase 9: Convergence

**Purpose**: Close gaps identified by codebase assessment against spec, plan, and research decisions

- [x] T047 Register `trackLastActive` middleware on all public authenticated routes — import and add `trackLastActive` after `authenticate` in `backend/src/modules/public-matches/public-matches.routes.ts`, `backend/src/modules/leaderboard/leaderboard.routes.ts`, `backend/src/modules/notifications/notifications.routes.ts`, `backend/src/modules/chatbot/chatbot.routes.ts`, and `backend/src/modules/auth/auth.routes.ts` (the `/me` route) per FR-010, research #6 (partial)

---

## Notes

- Schema uses `LOCKED` (not "BANNED") — matches existing `UserStatus` enum
- Mockup label "Banned" → displayed as "Khoá" in Vietnamese UI
- "Add User" button from mockup is deferred — not implemented
- Accuracy is computed on-the-fly, not stored as a field
- `lastActiveAt` throttled to update at most once per 5 minutes per user
- All admin routes already guarded by `authenticate` + `requireRole('ADMIN')` in `admin.routes.ts`
