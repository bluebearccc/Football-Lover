# Feature Specification: Win/Lose Notifications

**Feature Branch**: `009-notifications`

**Created**: 2026-06-26

**Status**: Draft

**Input**: User description: "notifications"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Receive win/lose notification after match ends (Priority: P1)

As a registered user who placed predictions on a match, I want to receive an in-app notification when the match finishes so that I immediately know whether I won or lost and how much gold I earned.

**Why this priority**: This is the core value of the notification feature — informing users of match outcomes is the primary trigger for all notifications, directly tied to the prediction and gold scoring flow.

**Independent Test**: Can be fully tested by completing a match scoring flow and verifying a notification appears for each participant with the correct win/lose type and gold amount.

**Acceptance Scenarios**:

1. **Given** a match becomes Finished and scoring completes, **When** the system processes results, **Then** each participant who won receives a MATCH_WON notification with the message "Bạn đã THẮNG trận {home} vs {away} và nhận {gold} gold."
2. **Given** a match becomes Finished and scoring completes, **When** the system processes results, **Then** each participant who lost receives a MATCH_LOST notification with the message "Bạn đã thua trận {home} vs {away}."
3. **Given** a notification is created, **When** it is stored, **Then** it is linked to the relevant match and marked as unread by default.

---

### User Story 2 - View notifications list (Priority: P1)

As a registered user, I want to view a list of all my notifications so that I can review match outcomes I may have missed.

**Why this priority**: Users need a central place to access their notifications. Without a list view, generated notifications have no visibility.

**Independent Test**: Can be fully tested by logging in as a user with existing notifications and verifying the notification list displays with correct types, messages, and read/unread states.

**Acceptance Scenarios**:

1. **Given** a user is authenticated and has notifications, **When** the user opens the notifications view, **Then** all their notifications are displayed in reverse chronological order (newest first).
2. **Given** a user is authenticated and has no notifications, **When** the user opens the notifications view, **Then** a friendly empty state message is shown.
3. **Given** a user has both read and unread notifications, **When** viewing the list, **Then** unread notifications are visually distinguished from read ones.
4. **Given** a user clicks on a notification in the list, **When** the notification references a match, **Then** the user is navigated to that match's detail page and the notification is automatically marked as read.

---

### User Story 3 - Mark notifications as read (Priority: P2)

As a registered user, I want to mark individual notifications as read so that I can keep track of which outcomes I have already reviewed.

**Why this priority**: Read/unread state management is important for usability but is secondary to the core creation and viewing of notifications.

**Independent Test**: Can be fully tested by clicking to mark an unread notification as read (individually or in bulk) and verifying its state changes and persists across page loads.

**Acceptance Scenarios**:

1. **Given** a user has an unread notification, **When** the user marks it as read, **Then** the notification's read state is persisted and reflected in the UI immediately.
2. **Given** a user marks a notification as read, **When** the user refreshes or revisits the page, **Then** the notification remains marked as read.
3. **Given** a user has multiple unread notifications, **When** the user selects "Mark all as read", **Then** all unread notifications are marked as read in a single action and the UI reflects the change immediately.

---

### User Story 4 - Receive cancellation notification (Priority: P2)

As a registered user who placed predictions on a match, I want to receive a notification when a match is cancelled so that I know the results have been voided.

**Why this priority**: Cancellation is an important but less frequent event compared to normal match completion. Users must be informed that their predictions and results are voided.

**Independent Test**: Can be fully tested by cancelling a match with participants and verifying each receives a MATCH_CANCELLED notification.

**Acceptance Scenarios**:

1. **Given** a match becomes Cancelled, **When** the status changes, **Then** each participant receives a MATCH_CANCELLED notification with the message "Trận {home} vs {away} đã bị hủy, kết quả không được tính."
2. **Given** a match is cancelled, **When** notifications are sent, **Then** the match's participation results are voided alongside the notification.

---

### User Story 5 - Unread notification count indicator (Priority: P3)

As a registered user, I want to see a count of my unread notifications in the navigation so that I know at a glance if there are new outcomes to review.

**Why this priority**: A badge/count indicator enhances discoverability but is a polish feature on top of the core notification list.

**Independent Test**: Can be fully tested by verifying the navigation badge shows the correct unread count that updates when notifications are marked as read or new ones arrive.

**Acceptance Scenarios**:

1. **Given** a user has unread notifications, **When** viewing any page, **Then** the navigation displays a badge with the unread notification count.
2. **Given** a user marks notifications as read, **When** the count changes, **Then** the badge updates to reflect the current unread count.
3. **Given** a user has zero unread notifications, **When** viewing any page, **Then** no badge or a "0" indicator is shown.

---

### Edge Cases

- What happens when a user who did not participate in a match tries to view notifications for it? They should not receive any notifications for that match.
- How does the system handle duplicate notification creation if the scoring process runs more than once? Notification creation must be idempotent — only one notification per user per match event.
- What happens if a match is cancelled after it was already scored as Finished? The cancellation should generate MATCH_CANCELLED notifications and void prior results, but should not duplicate notifications if win/lose ones already exist.
- What if the user's account is locked? Notifications are still generated (they will see them if unlocked), but no action is needed from the system beyond storage.

## Clarifications

### Session 2026-06-26

- Q: Should users be able to mark all notifications as read at once? → A: Yes, include "Mark all as read" as a bulk action alongside individual marking.
- Q: Can users delete notifications, and should old notifications have a retention policy? → A: No deletion — notifications are permanent read-only history.
- Q: When a user clicks on a notification, what should happen? → A: Navigate to the match detail page and auto-mark the notification as read.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST create a MATCH_WON notification for each match participant who won when a match scoring completes.
- **FR-002**: System MUST create a MATCH_LOST notification for each match participant who lost when a match scoring completes.
- **FR-003**: System MUST create a MATCH_CANCELLED notification for each match participant when a match is cancelled.
- **FR-004**: Notification creation MUST be idempotent — running the process multiple times for the same match event MUST NOT create duplicate notifications.
- **FR-005**: Each notification MUST include a title, body, type (MATCH_WON / MATCH_LOST / MATCH_CANCELLED), reference to the related match, and a read/unread state defaulting to unread.
- **FR-006**: Notification messages MUST use the Vietnamese message templates defined in the SRS: win includes gold amount, lose is a simple loss message, cancel notes results are voided.
- **FR-007**: Authenticated users MUST be able to retrieve their own notifications in reverse chronological order.
- **FR-008**: Authenticated users MUST be able to mark individual notifications as read, and the read state MUST be persisted.
- **FR-008a**: Authenticated users MUST be able to mark all their unread notifications as read in a single bulk action.
- **FR-008b**: Clicking on a notification MUST navigate the user to the related match detail page and automatically mark the notification as read.
- **FR-009**: Authenticated users MUST be able to retrieve a count of their unread notifications.
- **FR-010**: Notifications MUST only be visible to the user they belong to — users MUST NOT see other users' notifications.
- **FR-011**: Unauthenticated users MUST NOT be able to access any notification endpoints.

### Key Entities

- **Notification**: Represents an in-app message sent to a user about a match outcome. Key attributes: type (MATCH_WON, MATCH_LOST, MATCH_CANCELLED), title, body, match reference, read/unread state, creation timestamp. Belongs to a single User and optionally references a Match.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of match participants receive a notification within 5 seconds of match scoring or cancellation completing.
- **SC-002**: Users can view their notification list and identify unread items within 2 seconds of opening the notifications view.
- **SC-003**: Marking a notification as read takes effect in under 1 second and persists across sessions.
- **SC-004**: Zero duplicate notifications are created when the scoring or cancellation process runs multiple times for the same match.
- **SC-005**: The unread notification count displayed in navigation is accurate and updates within 3 seconds of any change.

## Assumptions

- Users have already been authenticated through the existing authentication system (UC02) before accessing notifications.
- Match scoring and gold payout (UC06/FR-09) already exist and trigger the notification creation as a downstream effect.
- Match cancellation flow (UC13) already exists and triggers cancellation notifications.
- Notifications are in-app only — no push notifications, email notifications, or external messaging channels are in scope for this feature.
- Notifications are permanent and cannot be deleted by users — they serve as a read-only match outcome history.
- The Notification data entity and its schema already exist in the database (as defined in the SRS entity list and Prisma schema).
- The Vietnamese language message templates from the SRS are the definitive notification content.
