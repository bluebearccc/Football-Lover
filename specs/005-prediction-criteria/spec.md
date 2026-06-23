# Feature Specification: Prediction Criteria Management

**Feature Branch**: `005-prediction-criteria`

**Created**: 2026-06-23

**Status**: Draft

**Input**: User description: "prediction-criteria"

## Clarifications

### Session 2026-06-23

- Q: What triggers the edit lock — match status only, or also when predictions exist? → A: Status-only lock. Editing is allowed anytime match is SCHEDULED, regardless of existing predictions.
- Q: Are predictions on deactivated criteria excluded from scoring? → A: No. Deactivation only hides from new predictions; existing predictions are scored normally per BR12.
- Q: How should criteria be ordered for display? → A: Creation order (oldest first). No custom ordering field needed.
- Q: Can Admin reactivate a deactivated criterion? → A: Yes, while match is SCHEDULED (same lock rule as other edits).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin Creates Prediction Criteria for a Match (Priority: P1)

An Admin opens a scheduled match and adds prediction criteria (e.g., "Đội nào ghi bàn trước", "Đội nào thắng trận"). Each criterion is a binary HOME/AWAY question that registered users will later predict on. The Admin can add multiple criteria per match, each with a name and optional description.

**Why this priority**: Criteria are the foundational data that the entire prediction system relies on. Without criteria, users cannot make predictions, and the gold/scoring mechanic has nothing to operate on.

**Independent Test**: Can be fully tested by logging in as Admin, navigating to a scheduled match, creating criteria, and verifying they appear in the criteria list. Delivers the core value of preparing matches for user predictions.

**Acceptance Scenarios**:

1. **Given** Admin is logged in and a match has status SCHEDULED, **When** Admin submits a valid criterion (name provided), **Then** the criterion is saved as active and appears in the criteria list for that match.
2. **Given** Admin is logged in and a match has status SCHEDULED, **When** Admin submits a criterion without a name, **Then** a validation error is shown and the criterion is not saved.
3. **Given** Admin is logged in and a match has status SCHEDULED, **When** Admin creates multiple criteria for the same match, **Then** all criteria are saved and listed.

---

### User Story 2 - Admin Edits Existing Criteria Before Match Lock (Priority: P1)

An Admin needs to correct a criterion's name or description before the match starts. The system allows editing as long as the match is still in SCHEDULED status, regardless of whether users have already predicted on that criterion. Since users can also edit their own predictions while the match is SCHEDULED, Admin name/description changes do not compromise fairness.

**Why this priority**: Editing is essential for correcting mistakes and refining criteria before the prediction window closes. Without edit capability, any typo requires deactivating and recreating criteria.

**Independent Test**: Can be tested by creating a criterion, then editing its name/description and verifying the update persists. Also test that editing is blocked when the match is no longer SCHEDULED.

**Acceptance Scenarios**:

1. **Given** a criterion exists for a SCHEDULED match, **When** Admin edits the name/description with valid data, **Then** the criterion is updated successfully.
2. **Given** a criterion exists for a match that has started (LIVE/FINISHED), **When** Admin attempts to edit the criterion, **Then** the system blocks the edit and shows an error.
3. **Given** a criterion exists and predictions have been submitted on it but match is still SCHEDULED, **When** Admin edits the name/description, **Then** the edit is allowed (users can still adjust their predictions).

---

### User Story 3 - Admin Deactivates a Criterion (Priority: P2)

An Admin decides a criterion is no longer relevant or was added by mistake. Instead of deleting it (which could break existing prediction references), the Admin deactivates it. Deactivated criteria are no longer shown to users for new predictions but remain in the database for data integrity.

**Why this priority**: Deactivation provides a safe way to remove criteria without data loss. It is secondary to creation/editing but necessary for operational flexibility.

**Independent Test**: Can be tested by deactivating a criterion and verifying it no longer appears in the user-facing criteria list, while still existing in the admin view.

**Acceptance Scenarios**:

1. **Given** an active criterion exists for a SCHEDULED match, **When** Admin deactivates it, **Then** the criterion is marked inactive and hidden from users.
2. **Given** an active criterion exists for a match that has started, **When** Admin attempts to deactivate it, **Then** the system blocks the deactivation to preserve fairness.
3. **Given** an inactive criterion exists for a SCHEDULED match, **When** Admin reactivates it, **Then** the criterion becomes active and visible to users again.
4. **Given** an inactive criterion exists for a match that has started, **When** Admin attempts to reactivate it, **Then** the system blocks the reactivation.

---

### User Story 4 - Admin Sets Criterion Results After Match (Priority: P2)

After a match finishes, an Admin sets the actual result (HOME or AWAY) for each criterion. This triggers the scoring system to compare each user's prediction against the result. Results may also come from api-football scraping, with Admin data taking priority.

**Why this priority**: Result-setting is the bridge between criteria management and scoring/gold payout. While it depends on UC06 for the match finishing flow, the criteria result fields are managed as part of criteria management.

**Independent Test**: Can be tested by setting result_team on criteria for a FINISHED match and verifying the values are saved correctly.

**Acceptance Scenarios**:

1. **Given** a match has status FINISHED and criteria exist, **When** Admin sets result_team (HOME or AWAY) for each criterion, **Then** results are saved and resolved_at is timestamped.
2. **Given** a criterion already has a result set, **When** Admin updates the result, **Then** the new result replaces the old one (with appropriate re-scoring considerations).
3. **Given** a match is still SCHEDULED or LIVE, **When** Admin attempts to set criterion results, **Then** the system blocks the action.

---

### User Story 5 - Users View Criteria on Match Details (Priority: P1)

When a registered user or guest views match details, they see the list of active prediction criteria for that match. Each criterion shows its name, description, and (after match start) the vote statistics. This story bridges criteria management with the user-facing prediction experience.

**Why this priority**: Users must be able to see criteria to make predictions. This is the read-side counterpart to admin creation and is essential for the prediction flow.

**Independent Test**: Can be tested by viewing a match detail page and verifying all active criteria are displayed with correct information.

**Acceptance Scenarios**:

1. **Given** a match has active criteria, **When** any user views match details, **Then** all active criteria are listed with name and description, ordered by creation time (oldest first).
2. **Given** a match has both active and inactive criteria, **When** a user views match details, **Then** only active criteria are shown.
3. **Given** a match has started, **When** a user views criteria, **Then** vote statistics (total HOME/AWAY votes) are visible for each criterion.

---

### Edge Cases

- What happens when Admin tries to create a criterion for a non-existent match? System returns a 404 error.
- What happens when Admin creates a criterion with a duplicate name for the same match? System allows it (names are labels, not unique keys) but Admin should be aware.
- How does the system handle criteria from api-football scraping? Criteria with source=SCRAPED are created automatically; Admin can still override or deactivate them. Admin-edited data always takes priority over scraped data.
- What happens to predictions when a criterion is deactivated? Existing predictions remain in the database and are still scored normally if result_team is set (per BR12). Deactivation only controls visibility for new predictions — it does not retroactively exclude from scoring.
- What if a match transitions from SCHEDULED to LIVE while Admin is editing a criterion? The save should fail with a "match locked" error based on the current match status at save time.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow Admin to create prediction criteria for a match, each with a name (required) and description (optional).
- **FR-002**: System MUST enforce that criteria can only be created/edited when the match status is SCHEDULED.
- **FR-003**: System MUST allow Admin to edit a criterion's name and description before the match locks.
- **FR-004**: System MUST allow criteria edits while match status is SCHEDULED, regardless of existing predictions. Edits are blocked only when match status is no longer SCHEDULED (LIVE/FINISHED/CANCELLED/POSTPONED).
- **FR-005**: System MUST allow Admin to deactivate a criterion (soft-delete) rather than hard-deleting it. Admin can also reactivate a deactivated criterion while match is SCHEDULED.
- **FR-006**: System MUST allow Admin to set the result_team (HOME or AWAY) for each criterion when the match status is FINISHED.
- **FR-007**: System MUST record the resolved_at timestamp when a criterion result is set.
- **FR-008**: System MUST track the source of each criterion (MANUAL for Admin-created, SCRAPED for api-football-sourced).
- **FR-009**: System MUST display only active criteria to users on the match details page, ordered by creation time (oldest first).
- **FR-010**: System MUST validate that the match exists and Admin has appropriate permissions before any criteria operation.
- **FR-011**: System MUST support criteria created via external data sync (api-football), with Admin data taking priority in case of conflicts.
- **FR-012**: Each prediction criterion MUST be a binary HOME/AWAY choice aligned with the match's home and away teams.

### Key Entities

- **PredictionCriterion**: Represents a single prediction question for a match. Key attributes: name, description, result_team (actual outcome), source (MANUAL/SCRAPED), is_active, resolved_at. Belongs to a Match; has many Predictions and Statistics.
- **Match**: The parent entity that criteria belong to. Criteria can only be managed when the match is in an appropriate status.
- **Prediction**: User's choice (HOME/AWAY) for a specific criterion. One prediction per user per criterion.
- **Statistic**: Aggregated vote counts (total_home_votes, total_away_votes) per criterion per match.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin can create a new prediction criterion for a scheduled match in under 30 seconds.
- **SC-002**: Admin can view and manage all criteria for a match from a single management screen.
- **SC-003**: Users see all active criteria for a match within 2 seconds of loading match details.
- **SC-004**: 100% of criteria modifications are blocked when the match is no longer in an editable state, ensuring prediction fairness.
- **SC-005**: Criterion results can be set for all criteria of a finished match in under 1 minute per match.
- **SC-006**: Deactivated criteria are never shown to users on the match details page.

## Assumptions

- The Match entity and match management (UC06) are already implemented or will be implemented before this feature, as criteria depend on existing matches.
- Admin authentication and role-based access control (RBAC) middleware are already in place (UC01/UC02).
- The api-football integration for scraped criteria will follow the same external sync pattern as match/team data (using external_id mapping).
- Criteria names are free-text labels and do not need to be unique within a match — Admin is responsible for meaningful naming.
- The scoring/gold payout logic triggered by setting criterion results is part of UC05/UC06 and not in scope for this specification — this spec covers only the criteria data management aspect.
- The UI for criteria management follows the Stitch mockup in `stitch_goalpredict_live_dashboard/admin_point_rules_criteria/`.
