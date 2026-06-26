# Tasks: Win/Lose Notifications (UC14)

**Input**: Design documents from `specs/009-notifications/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/notifications-api.md

**Tests**: Not explicitly requested — test tasks omitted.

**Organization**: Tasks grouped by user story. Notification **creation** (write-side) is already implemented in `backend/src/modules/scoring/`. This feature implements the **read-side**: list, mark-read, count endpoints and frontend components.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Create module directory structure and shared type definitions

- [x] T001 Create notifications module directory at `backend/src/modules/notifications/`
- [x] T002 Create Zod validation schemas and response DTOs in `backend/src/modules/notifications/notifications.dto.ts` — define `NotificationDto`, `NotificationListResponse`, `UnreadCountResponse`, `MarkAllReadResponse`, and query params schema (page, pageSize) per `contracts/notifications-api.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backend data access layer and route mounting — MUST be complete before user story work

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Implement `NotificationRepository` in `backend/src/modules/notifications/notifications.repository.ts` — methods: `findByUser(userId, page, pageSize)` returning paginated notifications ordered by createdAt DESC, `countUnread(userId)` returning unread count, `markRead(id, userId)` updating single notification isRead=true (scoped to user), `markAllRead(userId)` updating all unread for user, `findById(id, userId)` for ownership check. Use Prisma singleton from `src/lib/prisma.ts`.
- [x] T004 Implement `NotificationService` in `backend/src/modules/notifications/notifications.service.ts` — methods: `list(userId, page, pageSize)`, `unreadCount(userId)`, `markRead(id, userId)` (throw ApiError.notFound if not found/not owned), `markAllRead(userId)`. Delegates to repository; no direct Prisma calls.
- [x] T005 Implement `NotificationController` in `backend/src/modules/notifications/notifications.controller.ts` — handlers: `list(req, res, next)` extracts userId from req.user + query params, `unreadCount(req, res, next)`, `markRead(req, res, next)` extracts id from params, `markAllRead(req, res, next)`. Uses validateQuery for pagination params. Returns JSON responses per contracts.
- [x] T006 Create route definitions in `backend/src/modules/notifications/notifications.routes.ts` — mount all 4 endpoints with `authenticate` middleware: `GET /` (list), `GET /unread-count`, `PATCH /:id/read`, `PATCH /mark-all-read`. Use async handler pattern with `.catch(next)`.
- [x] T007 Mount notification routes in `backend/src/routes/index.ts` — add `router.use('/notifications', notificationRoutes)` import and registration.
- [x] T008 [P] Create frontend API client in `frontend/src/api/notifications.ts` — implement `notificationsApi` object with methods: `list(page?, pageSize?)`, `unreadCount()`, `markRead(id)`, `markAllRead()`. Use `apiFetch` from `src/api/client.ts` with session token. Follow the pattern in `src/api/leaderboard.ts`.

**Checkpoint**: Backend notification endpoints operational, frontend API client ready. All story implementations can now proceed.

---

## Phase 3: User Story 1+2 — View Notifications List (Priority: P1) 🎯 MVP

**Goal**: Users can view their notifications in a dropdown from the navigation bell icon, with newest-first ordering and read/unread visual distinction. (US1 "Receive notification" is already implemented in scoring — this phase delivers the viewing experience.)

**Independent Test**: Log in as a user who participated in a scored match. Click the bell icon in the top nav. Verify notification list appears in a dropdown with correct win/lose/cancel messages, ordered newest first, with unread items visually distinct.

### Implementation

- [x] T009 [P] [US2] Create `NotificationItem` component in `frontend/src/components/notifications/NotificationItem.tsx` — displays single notification with type icon (trophy for WON, thumbs-down for LOST, cancel for CANCELLED), title, body, timestamp, read/unread visual state (bold/unbold or background color), and onClick handler that navigates to `/matches/{matchId}` and triggers mark-as-read. Follow UC14 frontend class diagram: props are type, title, body, isRead, matchId, onClick.
- [x] T010 [P] [US2] Create `NotificationDropdown` component in `frontend/src/components/notifications/NotificationDropdown.tsx` — renders list of `NotificationItem` components, empty state message ("Không có thông báo") when no notifications, and a "Đánh dấu tất cả đã đọc" button at top. Calls `notificationsApi.list()` on mount. Implements `loadMore()` for pagination. Positioned as absolute dropdown below the bell icon, with max-height scroll.
- [x] T011 [US2] Create `NotificationBell` component in `frontend/src/components/notifications/NotificationBell.tsx` — renders bell icon with toggle to show/hide `NotificationDropdown`. Calls `notificationsApi.unreadCount()` on mount and displays badge with count. Closes dropdown when clicking outside. Follow UC14 frontend class diagram structure: NotificationBell → NotificationDropdown → NotificationItem.
- [x] T012 [US2] Replace static notification link in `frontend/src/app/(main)/layout.tsx` (lines 77–81) with the `NotificationBell` component — remove the current `<Link href="/notifications">` and replace with the interactive bell+dropdown. Ensure it works in both desktop and mobile views.

**Checkpoint**: Users can click the bell, see their notifications in a dropdown, and click through to match details. Core notification viewing experience is complete.

---

## Phase 4: User Story 3 — Mark Notifications as Read (Priority: P2)

**Goal**: Users can mark individual notifications as read (via click-through) and mark all as read with a single bulk action.

**Independent Test**: Open the notification dropdown, click a notification — it navigates to match detail and the notification becomes read. Use "Mark all as read" button — all notifications update to read state. Refresh the page — read states persist.

### Implementation

- [x] T013 [US3] Add mark-read-on-click behavior in `NotificationItem` onClick in `frontend/src/components/notifications/NotificationItem.tsx` — when clicked, call `notificationsApi.markRead(id)` then navigate to match detail via `router.push()`. Update local state to show item as read immediately (optimistic update).
- [x] T014 [US3] Add "Mark all as read" button handler in `frontend/src/components/notifications/NotificationDropdown.tsx` — calls `notificationsApi.markAllRead()`, updates all items to read state locally, and triggers badge count refresh on the parent `NotificationBell`.
- [x] T015 [US3] Wire up state refresh in `NotificationBell` in `frontend/src/components/notifications/NotificationBell.tsx` — after any mark-read action (single or bulk), re-fetch unread count to update the badge. Accept a callback or use shared state between Bell and Dropdown.

**Checkpoint**: Mark-read (individual + bulk) works end-to-end. Read state persists across page loads.

---

## Phase 5: User Story 4 — Cancellation Notifications (Priority: P2)

**Goal**: When a match is cancelled, participants receive a MATCH_CANCELLED notification that appears in their notification list.

**Independent Test**: As admin, cancel a match with participants. Log in as a participant — MATCH_CANCELLED notification appears in the dropdown with the cancellation message.

### Implementation

- [x] T016 [US4] Verify MATCH_CANCELLED notifications render correctly in `NotificationItem` — ensure the cancel type gets the appropriate icon/styling and the body message ("Trận ... đã bị huỷ. Kết quả của trận này không được tính.") displays properly. No new code expected if T009 handles all 3 types — this is a verification/fix task.

**Checkpoint**: Cancellation notifications display correctly alongside win/lose notifications.

---

## Phase 6: User Story 5 — Unread Notification Count Badge (Priority: P3)

**Goal**: Navigation bar shows a badge with the count of unread notifications, updated when notifications are marked as read or new ones arrive.

**Independent Test**: Log in as a user with unread notifications. Verify badge shows correct count. Mark a notification as read — badge decreases. Mark all as read — badge disappears.

### Implementation

- [x] T017 [US5] Polish badge display in `NotificationBell` in `frontend/src/components/notifications/NotificationBell.tsx` — show red/primary badge with count when >0, hide badge when 0. Ensure badge styling follows Elite Pitch design tokens (use `bg-error` or `bg-primary` for badge background, `text-on-error` for text). Touch target ≥ 44×44px for mobile.
- [x] T018 [US5] Add periodic refresh or re-fetch on navigation in `NotificationBell` — re-fetch unread count when user navigates between pages (using `usePathname` change detection) so the badge stays current without requiring a full page reload.

**Checkpoint**: Badge accurately reflects unread count and updates in response to user actions and navigation.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, build checks, and quality assurance

- [x] T019 Run `npm run build` and `npm run lint` in `backend/` — fix any TypeScript or lint errors
- [x] T020 [P] Run `npm run build` and `npm run lint` in `frontend/` — fix any TypeScript or lint errors
- [x] T021 Run quickstart.md validation scenarios — verify all 9 scenarios pass end-to-end
- [x] T022 Verify responsive layout — test notification bell and dropdown at breakpoints 480/768/1024/1440px, ensure dropdown is accessible on mobile

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US1+US2 (Phase 3)**: Depends on Phase 2 — core viewing experience
- **US3 (Phase 4)**: Depends on Phase 3 (needs dropdown/item components to add mark-read behavior)
- **US4 (Phase 5)**: Depends on Phase 3 (needs NotificationItem to verify cancel type rendering)
- **US5 (Phase 6)**: Depends on Phase 3 (needs NotificationBell to polish badge)
- **Polish (Phase 7)**: Depends on all user story phases

### User Story Dependencies

- **US1+US2 (P1)**: Can start after Foundational — no story dependencies
- **US3 (P2)**: Depends on US2 components existing (NotificationItem, NotificationDropdown)
- **US4 (P2)**: Can run in parallel with US3 after US2 completes
- **US5 (P3)**: Can run in parallel with US3/US4 after US2 completes

### Within Each User Story

- Repository before service before controller before routes (backend)
- API client before components (frontend)
- Parent components before child integration

### Parallel Opportunities

- T009 and T010 can run in parallel (different component files)
- T019 and T020 can run in parallel (different packages)
- US3, US4, and US5 can all run in parallel after US2 completes
- T008 (frontend API client) can run in parallel with T003–T007 (backend module)

---

## Parallel Example: Phase 2 (Foundational)

```
# Backend module files can be written in sequence (each depends on prior layer):
T003 → T004 → T005 → T006 → T007

# Frontend API client can run in parallel with backend:
T008 (parallel with T003–T007)
```

## Parallel Example: Phase 3 (US1+US2)

```
# Components can be built in parallel:
T009 (NotificationItem) ‖ T010 (NotificationDropdown skeleton)

# Then integrate:
T011 (NotificationBell — combines Item + Dropdown)
T012 (Layout integration — depends on T011)
```

---

## Implementation Strategy

### MVP First (US1+US2 Only)

1. Complete Phase 1: Setup (T001–T002)
2. Complete Phase 2: Foundational (T003–T008)
3. Complete Phase 3: US1+US2 — View Notifications (T009–T012)
4. **STOP and VALIDATE**: Users can see their notifications in the bell dropdown
5. This alone delivers the core value of UC14

### Incremental Delivery

1. Setup + Foundational → Backend API ready
2. US1+US2 → Notification list viewable in dropdown (MVP!)
3. US3 → Mark as read (individual + bulk)
4. US4 → Cancellation notification display verified
5. US5 → Unread badge polished with auto-refresh
6. Polish → Build verification + responsive check

---

## Phase 8: Convergence

- [x] T023 Update `buildResultNotifications` in `backend/src/modules/scoring/notification.service.ts` to accept match context (home team name, away team name) and update `buildPlan` in `backend/src/modules/scoring/scoring.service.ts` to pass this context; change win message to "Bạn đã THẮNG trận {home} vs {away} và nhận {gold} gold." and lose message to "Bạn đã thua trận {home} vs {away}." per FR-006, US1/AC1, US1/AC2 (partial)
- [x] T024 Update `loadForScoring` in `backend/src/modules/scoring/scoring.repository.ts` to include home/away team names in the select, and update `applyCancel` to load team names and change cancel notification message to "Trận {home} vs {away} đã bị hủy, kết quả không được tính." per FR-006, US4/AC1 (partial)
- [x] T025 Add Escape key handler in `frontend/src/components/notifications/NotificationBell.tsx` to close the dropdown when the user presses Escape per plan: WCAG constraints (partial)
- [x] T026 Run `npm run build` and `npm run lint` in both `backend/` and `frontend/` to verify T023–T025 compile cleanly

---

## Notes

- Notification **creation** is already implemented in `backend/src/modules/scoring/` — T001–T022 only cover the read-side
- The Prisma `Notification` model already exists — no database migration needed
- The scoring module's `notification.service.ts` (write-side) is separate from the new `notifications` module (read-side)
- Frontend class diagram specifies bell → dropdown pattern, not a dedicated page
- Vietnamese UI text throughout; message templates already set in scoring module
