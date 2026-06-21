# Feature Specification: Team Management

**Feature Branch**: `002-team-management`

**Created**: 2026-06-21

**Status**: Draft

**Input**: User description: "team-management"

## Clarifications

### Session 2026-06-21

- Q: When synced data conflicts with Admin-edited data, should Admin data silently win, sync always overwrite, or require Admin confirmation? → A: Admin data always wins silently — sync skips Admin-edited fields without confirmation.
- Q: Should sync pull all teams from api-football, filter by league/competition, or import on-demand per team? → A: Filtered by league/competition — Admin selects or system pre-configures which leagues to sync.
- Q: Should the sync operation be blocking (Admin waits), async background job, or async with polling? → A: Blocking with progress indicator — Admin waits on the page until sync completes.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin Creates a New Team (Priority: P1)

An admin navigates to the team management page, fills in the team name and short name, optionally uploads a logo, and saves the team. The newly created team immediately becomes available as a selectable home/away option when creating or editing matches.

**Why this priority**: Teams are the foundational data entity — matches, predictions, and the entire scoring flow depend on teams existing in the system. Without team creation, no other team-related functionality works.

**Independent Test**: Can be fully tested by creating a team via the admin UI and verifying it appears in the team list and in match creation dropdowns, delivering the core value of team data availability.

**Acceptance Scenarios**:

1. **Given** Admin is logged in, **When** Admin submits a valid team name and short name, **Then** the team is saved with status active and appears in the team list.
2. **Given** Admin is creating a team, **When** no logo is provided, **Then** the team is saved with a null logo URL and the UI displays a default team image.
3. **Given** a team with the same name already exists, **When** Admin submits a duplicate team, **Then** the system rejects the request with a duplicate team error.

---

### User Story 2 - Admin Edits an Existing Team (Priority: P1)

An admin selects an existing team from the team list, modifies its name, short name, or logo, and saves the changes. The updated information is reflected everywhere the team is displayed (match lists, match details, leaderboard).

**Why this priority**: Team data corrections and updates are essential for maintaining accurate match information. Equally critical as creation since teams synced from external sources may need manual adjustments.

**Independent Test**: Can be fully tested by editing a team's name or logo and verifying the changes persist and display correctly across the application.

**Acceptance Scenarios**:

1. **Given** Admin is logged in and a team exists, **When** Admin updates the team name and saves, **Then** the team record is updated and the new name is reflected in the team list.
2. **Given** Admin clears the team logo, **When** the change is saved, **Then** the logo URL is set to null and the UI falls back to the default image.

---

### User Story 3 - Admin Deactivates a Team (Priority: P2)

An admin attempts to remove a team. If the team is referenced by any match, it is deactivated (set to inactive) instead of deleted. If the team has no match references, it may be permanently deleted.

**Why this priority**: Deactivation protects match history integrity. Important but secondary to creation/editing since it's a less frequent operation.

**Independent Test**: Can be fully tested by attempting to delete a team that is referenced by a match and verifying it becomes inactive rather than deleted, and by deleting an unreferenced team and verifying it is removed.

**Acceptance Scenarios**:

1. **Given** a team is referenced by one or more matches, **When** Admin requests deletion, **Then** the system sets the team's active status to false (deactivated) and informs the Admin that hard delete was rejected.
2. **Given** a team has no match references, **When** Admin requests deletion, **Then** the team is permanently removed from the system.
3. **Given** a team is deactivated, **When** Admin views the team list, **Then** the deactivated team is visually distinguished and not selectable for new matches.

---

### User Story 4 - Admin Syncs Teams and Players from api-football (Priority: P2)

An admin selects a league/competition and triggers a sync operation that pulls team and player data from the api-football.com external provider. The UI shows a loading/progress indicator while the sync runs (blocking). Teams and players are matched to existing records by their external ID and upserted accordingly. A sync summary is displayed showing the number of teams and players created, updated, or unchanged.

**Why this priority**: External data sync populates the system with real-world team/player data, reducing manual entry. Important for operational efficiency but not blocking basic team management.

**Independent Test**: Can be fully tested by triggering a sync and verifying that new teams/players appear in the system with correct external IDs, and that existing records are updated without duplication.

**Acceptance Scenarios**:

1. **Given** Admin is logged in, **When** Admin triggers a sync for a selected league/competition, **Then** the system pulls teams and players for that league from api-football, upserts them by external ID, and displays a summary of changes.
2. **Given** external data conflicts with Admin-edited data, **When** sync runs, **Then** Admin-edited data is silently preserved — sync skips conflicting fields without overwriting or prompting.
3. **Given** the api-football provider is unavailable, **When** Admin triggers a sync, **Then** the system shows a clear error message indicating the sync failed.

---

### User Story 5 - Admin Views Team Player Roster (Priority: P3)

An admin selects a team and views its associated player list, including player name, position, and image. Players missing images display a default avatar.

**Why this priority**: Player viewing provides additional context for teams but is not required for core team or match management workflows.

**Independent Test**: Can be fully tested by selecting a team and verifying the player list renders with correct data and default images for players without photos.

**Acceptance Scenarios**:

1. **Given** a team has synced players, **When** Admin views the team, **Then** the player list is displayed with name, position, and image (or default avatar).
2. **Given** a team has no players, **When** Admin views the team, **Then** an empty state message is shown.

---

### Edge Cases

- What happens when an Admin tries to create a team with an empty name? System rejects with validation error.
- What happens when a deactivated team is referenced in historical match data? The team data remains visible in historical contexts with a deactivated indicator.
- What happens when a sync encounters a team that was manually created with the same name but no external ID? The sync creates a new record (external ID is the matching key, not team name); Admin must manually merge duplicates if needed.
- What happens when a team is reactivated after deactivation? Admin can reactivate the team, restoring it to active status and making it selectable for new matches.
- What happens during a long-running sync? The UI displays a loading/progress indicator and blocks interaction with the sync form until the operation completes or fails.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow Admin to create a team with a name, optional short name, and optional logo URL.
- **FR-002**: System MUST validate that team name is not empty and not a duplicate of an existing active team.
- **FR-003**: System MUST allow Admin to edit a team's name, short name, and logo URL.
- **FR-004**: System MUST prevent hard deletion of a team that is referenced by any match; the team MUST be deactivated (is_active set to false) instead.
- **FR-005**: System MUST allow permanent deletion of a team that has no match references.
- **FR-006**: System MUST support syncing team and player data from the api-football.com external provider, filtered by league/competition (Admin-selected or pre-configured), matching records by external_id.
- **FR-007**: When external sync data conflicts with Admin-edited data, the system MUST silently prioritize Admin data — sync skips fields that Admin has manually edited, without requiring confirmation.
- **FR-008**: System MUST display a default image when a team's logo URL or a player's image URL is absent.
- **FR-009**: System MUST restrict all team management operations to authenticated users with the Admin role; non-Admin access returns 403 Forbidden.
- **FR-010**: Active teams MUST be selectable as home/away teams when creating or editing matches.
- **FR-011**: Deactivated teams MUST NOT be selectable for new matches but MUST remain visible in historical match data.
- **FR-012**: System MUST allow Admin to reactivate a previously deactivated team.
- **FR-013**: System MUST display a sync summary (teams/players created, updated, unchanged) after a sync operation completes.

### Key Entities

- **Team**: Represents a football team with name, short name, logo, external identifier (for api-football mapping), and active/inactive status. Teams are referenced by matches as home or away.
- **Player**: Belongs to a team. Contains player name, position, image, and external identifier. Primarily populated through api-football sync. Players inherit team association.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin can create a new team and have it appear as a match option in under 30 seconds.
- **SC-002**: Admin can deactivate a team referenced by matches without losing any historical match data.
- **SC-003**: External data sync populates or updates team and player records without creating duplicates (zero duplicate records after sync).
- **SC-004**: 100% of team management operations are restricted to Admin users; non-Admin access is consistently denied.
- **SC-005**: All teams and players without images display a recognizable default image across every screen where they appear.
- **SC-006**: Admin can complete any single team management action (create, edit, deactivate, sync) within 3 user interactions or fewer.

## Assumptions

- Admin authentication and role-based access control (RBAC) are already implemented (UC01, UC02 dependency).
- The api-football.com integration credentials and connectivity are configured server-side via environment variables.
- Team logo and player image uploads are handled by a separate feature (UC12 — Upload Team/Player Images); this feature only manages the URL references.
- The default images for teams and players are static assets available in the frontend application.
- Player data is primarily read-only from the Admin perspective — players are synced from api-football, not manually created or edited by Admin.
- Match creation (UC06) is a separate feature; this feature ensures teams are available as selectable entities for that workflow.
