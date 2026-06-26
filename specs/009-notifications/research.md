# Research: Win/Lose Notifications (009)

**Date**: 2026-06-26

## R1: Notification Creation Integration Point

**Decision**: Notification creation is already handled within the scoring transaction — no new creation logic needed.

**Rationale**: `backend/src/modules/scoring/scoring.repository.ts` already creates MATCH_WON/MATCH_LOST notifications inside `applyScoring()` (line 99–108) and MATCH_CANCELLED notifications inside `applyCancel()` (line 147–155), all within `prisma.$transaction`. The `notification.service.ts` in the same module builds the payloads. This is idempotent (guarded by `hasParticipations` check). UC14 only needs to add the **read-side** API and frontend.

**Alternatives considered**:
- Separate notification creation service called after scoring: rejected — would break transaction atomicity and require its own idempotency guard.
- Event-driven (emit event after scoring, listener creates notifications): overengineering for in-app-only notifications with no external delivery channel.

## R2: Backend Module Structure

**Decision**: Create a new `backend/src/modules/notifications/` module following the standard layered pattern (controller, service, repository, routes, dto).

**Rationale**: The UC14 class diagram defines `NotificationController`, `NotificationService`, and `NotificationRepository` as a read-side module separate from the scoring write-side. This aligns with the project's layered architecture (Constitution Principle II). The existing `scoring/notification.service.ts` handles write-side (building payloads); the new module handles read-side (list, mark read, count).

**Alternatives considered**:
- Adding read endpoints to the scoring module: rejected — scoring is admin-triggered; user-facing notification reads belong in their own module per the class diagram.

## R3: Frontend Component Architecture

**Decision**: Implement `NotificationBell` + `NotificationDropdown` + `NotificationItem` components in the nav bar, per the UC14 frontend class diagram.

**Rationale**: The frontend class diagram shows a bell → dropdown pattern (not a full page). The existing layout (`frontend/src/app/(main)/layout.tsx` line 77–81) already has a notification icon link in the top AppBar. This will be replaced with the `NotificationBell` component that toggles a `NotificationDropdown`. The `NotificationApiClient` handles API calls via `src/api/notifications.ts`.

**Alternatives considered**:
- Dedicated `/notifications` page: the layout currently links to `/notifications` but the class diagram specifies a dropdown from the bell. A dedicated page could be added later; dropdown is the MVP per the diagram.

## R4: API Endpoints

**Decision**: Four endpoints under `GET/PATCH /api/v1/notifications`, all requiring authentication.

**Rationale**: Derived from UC14 sequence diagram and class diagram:
1. `GET /notifications` — list user's notifications (paginated, newest first)
2. `GET /notifications/unread-count` — return unread count for badge
3. `PATCH /notifications/:id/read` — mark single notification as read
4. `PATCH /notifications/mark-all-read` — mark all as read (from clarification)

**Alternatives considered**:
- WebSocket for real-time count updates: deferred — polling on page load/navigation is sufficient for MVP.

## R5: Notification Message Templates

**Decision**: Keep the existing message templates in `scoring/notification.service.ts` as-is. They already follow SRS Section 5.3 patterns (Vietnamese).

**Rationale**: Current templates use score-based messages ("Bạn đoán đúng X tiêu chí"). The SRS templates use team-name-based messages ("Bạn đã THẮNG trận {home} vs {away}"). The current implementation is a valid interpretation that includes the score detail. Updating to include team names would require loading team data in the notification builder — consider as an enhancement. The current messages are functional and Vietnamese.

**Alternatives considered**:
- Rewriting templates to match SRS word-for-word with team names: possible enhancement but requires loading match+team data in the scoring notification builder. Can be deferred to a follow-up task.
