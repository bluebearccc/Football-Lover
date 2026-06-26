# Feature Specification: Manage Users

**Feature Branch**: `012-manage-users`

**Created**: 2026-06-26

**Status**: Draft

**Input**: User description: "manage-users"

## Clarifications

### Session 2026-06-26

- Q: Should Admin provide a ban reason when banning a user? → A: Required — Admin must provide a ban reason (enforced, stored with the ban action).
- Q: How should the edit form appear when Admin clicks Edit on a user? → A: Modal dialog — edit form opens as a modal overlay on top of the user table.
- Q: Should user search be real-time or submit-based? → A: Real-time with debounce — filters as Admin types, with a short delay to avoid excessive requests.
- Q: Where should user management audit logs be stored and viewed? → A: Reuse the existing AdminLog entity from admin-dashboard; viewable in the admin dashboard logs panel.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View and Search User List (Priority: P1)

As an Admin, I want to view a paginated list of all registered users with key information (name, email, status, points, accuracy, join date) so that I can oversee system participants and quickly find specific users.

**Why this priority**: The user list is the foundation of all user management operations. Without it, no other management action is possible.

**Independent Test**: Can be fully tested by logging in as Admin, navigating to User Management, and verifying the user table displays with correct data, pagination, and search functionality.

**Acceptance Scenarios**:

1. **Given** an Admin is logged in, **When** they navigate to User Management, **Then** they see a paginated table of users showing name/ID, status, points, accuracy, join date, and action buttons.
2. **Given** an Admin is on the User Management page, **When** they type a name or email in the search bar, **Then** the table filters in real-time (debounced) to show only matching users.
3. **Given** the user list has more than 10 entries, **When** the Admin views the table, **Then** pagination controls appear showing current page and total count.
4. **Given** an Admin is on the User Management page, **When** they click a status filter tab (All Users / Active / Banned), **Then** the table shows only users matching that status.

---

### User Story 2 - Ban and Unban Users (Priority: P1)

As an Admin, I want to ban users who violate platform rules and unban previously banned users so that I can maintain community integrity and enforce platform policies.

**Why this priority**: Account moderation is the core safety mechanism for the platform. Banning violating accounts protects other users and the fairness of predictions.

**Independent Test**: Can be fully tested by banning an active user and verifying they cannot log in, then unbanning them and verifying access is restored.

**Acceptance Scenarios**:

1. **Given** an Admin views an active user in the table, **When** they click the Ban action, **Then** a confirmation prompt appears with a required text field for the ban reason.
2. **Given** an Admin fills in the ban reason and confirms, **When** the action completes, **Then** the user's status changes to "Banned", the reason is stored, and the user can no longer log in.
3. **Given** an Admin views a banned user, **When** they click the Unban action, **Then** the user's status is restored to "Active" and they can log in again.
4. **Given** a user is banned, **When** they attempt to log in, **Then** they receive a message indicating their account has been locked.

---

### User Story 3 - Edit User Information (Priority: P2)

As an Admin, I want to edit a user's profile information (display name, role) so that I can correct user data and manage role assignments.

**Why this priority**: Role management (promoting/demoting users) and data correction are important administrative capabilities, but less frequent than moderation actions.

**Independent Test**: Can be fully tested by editing a user's display name and role, then verifying the changes persist.

**Acceptance Scenarios**:

1. **Given** an Admin clicks the Edit action on a user row, **When** the edit modal opens, **Then** it displays the user's current display name and role in an overlay dialog.
2. **Given** an Admin modifies a user's display name and saves, **When** the save completes, **Then** the updated name appears in the user table.
3. **Given** an Admin changes a user's role from USER to ADMIN, **When** the save completes, **Then** the user gains Admin privileges on their next login.
4. **Given** an Admin attempts to edit their own account's role, **When** they try to demote themselves, **Then** the system prevents self-demotion to avoid accidental lockout.

---

### User Story 4 - Admin-Initiated Password Reset (Priority: P2)

As an Admin, I want to trigger a password reset for a user so that I can help users who are locked out of their accounts through support channels.

**Why this priority**: Password reset is a common support task but has lower frequency than viewing and moderation operations.

**Independent Test**: Can be fully tested by triggering a password reset for a user and verifying they receive a reset email.

**Acceptance Scenarios**:

1. **Given** an Admin clicks the Reset Password action on a user, **When** they confirm the action, **Then** a password reset email is sent to the user's registered email address.
2. **Given** a password reset is triggered, **When** the email is sent successfully, **Then** the Admin sees a success notification confirming the reset email was sent.
3. **Given** a password reset is triggered, **When** the user clicks the reset link in the email, **Then** they can set a new password following the standard password policy.

---

### User Story 5 - User Overview Statistics (Priority: P3)

As an Admin, I want to see aggregate user statistics (total users, currently online, banned accounts, average prediction accuracy) at the top of the User Management page so that I can quickly assess platform health.

**Why this priority**: Statistics provide valuable insight but are supplementary to the core management operations.

**Independent Test**: Can be fully tested by verifying the stats cards display correct aggregate values that match the underlying data.

**Acceptance Scenarios**:

1. **Given** an Admin navigates to User Management, **When** the page loads, **Then** four stats cards display: Total Users, Online Now, Banned Accounts, and Average Accuracy.
2. **Given** a user is banned, **When** the Admin refreshes the page, **Then** the Banned Accounts count increments and Total Users remains unchanged.

---

### Edge Cases

- What happens when an Admin tries to ban another Admin account? The system should prevent banning Admin accounts to avoid operational disruption.
- What happens when searching for a user that does not exist? The table shows an empty state with a "No users found" message.
- What happens when the Admin bans a user who is currently logged in? The user's active session should be invalidated, forcing them to re-authenticate (and fail due to banned status).
- What happens when there are no users matching the selected filter? The table shows an appropriate empty state message.
- What happens when Admin tries to edit a user's email? Email changes are not permitted through this interface to preserve account identity and prevent fraud.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a paginated list of all registered users with columns: Name/ID, Status, Points, Accuracy, Joined date, and Actions.
- **FR-002**: System MUST provide real-time search (debounced) that filters users by display name or email address as the Admin types.
- **FR-003**: System MUST provide filter tabs to view users by status: All Users, Active, Banned.
- **FR-004**: System MUST allow Admin to ban an active user, requiring a ban reason, changing their status to "Banned" and preventing login.
- **FR-005**: System MUST allow Admin to unban a previously banned user, restoring their "Active" status and login ability.
- **FR-006**: System MUST require confirmation and a mandatory ban reason before executing ban actions; unban requires confirmation only.
- **FR-007**: System MUST allow Admin to edit a user's display name and role (USER/ADMIN).
- **FR-008**: System MUST prevent an Admin from demoting their own role.
- **FR-009**: System MUST allow Admin to trigger a password reset email for any user.
- **FR-010**: System MUST display aggregate statistics: Total Users, Online Now, Banned Accounts, and Average Prediction Accuracy.
- **FR-011**: System MUST invalidate active sessions when a user is banned.
- **FR-012**: System MUST prevent banning of Admin accounts.
- **FR-013**: System MUST NOT allow editing of a user's email address through this interface.
- **FR-014**: System MUST restrict all user management operations to authenticated users with Admin role.
- **FR-015**: System MUST show pagination controls with page numbers and total user count.

### Key Entities

- **User**: Represents a registered platform participant. Key attributes: display name, email, role (USER/ADMIN), status (ACTIVE/BANNED), total points, prediction accuracy, registration date, ban reason (populated when status is BANNED). Central entity for all management operations.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin can locate any specific user within 10 seconds using search or filters.
- **SC-002**: Ban/unban operations complete and reflect in the UI within 3 seconds.
- **SC-003**: User list page loads with the first page of results within 2 seconds.
- **SC-004**: Banned users are immediately unable to access the platform after ban is applied.
- **SC-005**: 100% of user management operations are restricted to Admin role only.
- **SC-006**: Admin can manage a user base of 10,000+ users without performance degradation.
- **SC-007**: All management actions (ban, unban, edit, password reset) are logged via the existing AdminLog entity and visible in the admin dashboard logs panel.

## Assumptions

- The existing User entity in the database (with `role` and `status` fields) supports the required states (ACTIVE/BANNED for status, USER/ADMIN for role).
- The existing authentication system (`authenticate` + `requireRole` middleware) is available and functional for protecting Admin routes.
- The password reset mechanism from UC15 (forgot/reset password flow) is reusable for Admin-triggered resets.
- "Online Now" is approximated based on recent activity (e.g., users with activity within the last 15 minutes), not a real-time websocket connection count.
- Prediction accuracy is calculated as the percentage of correct criterion predictions across all completed matches.
- The "Add User" button visible in the mockup is deferred — Admin creates users through invitation or the standard registration flow, not a manual creation form.
