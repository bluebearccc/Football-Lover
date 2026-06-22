# Feature Specification: Match Management

**Feature Branch**: `003-match-management`

**Created**: 2026-06-22

**Status**: Draft

**Input**: User description: "match-management"

## Clarifications

### Session 2026-06-22

- Q: How does Admin navigate/find matches in the management screen (filtering & sorting)? → A: Admin can filter matches by status (SCHEDULED/LIVE/FINISHED/CANCELLED/POSTPONED) and sort by match_time.
- Q: Is scoring a single action (status change auto-triggers) or a two-step process? → A: Two-step — Admin enters all criterion results first, then explicitly confirms "Finish & Score" as a separate action.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin Creates a Match (Priority: P1)

An Admin navigates to the match management screen and creates a new match by selecting a home team and an away team (from existing Team records), setting the match time, and optionally adjusting the entry gold amount (defaults to 100). The system validates that the two teams are different and that all required fields are filled, then saves the match with status SCHEDULED.

**Why this priority**: Creating matches is the foundational action — without matches, users cannot predict, view details, or participate in gold pools. This is the entry point for the entire prediction workflow.

**Independent Test**: Can be fully tested by an Admin logging in, creating a match with two distinct teams and a future match time, and verifying the match appears in the match list with status SCHEDULED.

**Acceptance Scenarios**:

1. **Given** Admin is logged in, **When** valid match data (distinct home/away teams, future match time, entry_gold ≥ 0) is submitted, **Then** the match is created with status SCHEDULED and becomes visible in the match list.
2. **Given** Admin selects the same team for both home and away, **When** Admin saves the match, **Then** the system rejects with a validation error.
3. **Given** Admin omits required fields (team or match time), **When** Admin saves the match, **Then** the system rejects with a clear validation message.

---

### User Story 2 - Admin Edits a Scheduled Match (Priority: P1)

An Admin selects an existing match with status SCHEDULED and updates its details — changing teams, adjusting the match time, or modifying the entry gold. The system validates the changes and saves them. Once a match has started (status is no longer SCHEDULED), core match info cannot be edited.

**Why this priority**: Corrections to match data before kickoff are essential for operational accuracy. Blocking edits after start ensures fairness for participants who have already predicted.

**Independent Test**: Can be fully tested by creating a SCHEDULED match, editing its teams/time/gold, verifying the update persists, then changing the match to LIVE status and confirming that edits are blocked.

**Acceptance Scenarios**:

1. **Given** a match is SCHEDULED, **When** Admin submits valid updated data, **Then** the match is updated successfully.
2. **Given** a match is LIVE or FINISHED, **When** Admin attempts to edit core match info, **Then** the system blocks the edit.
3. **Given** a match is SCHEDULED, **When** Admin changes home and away to the same team, **Then** the system rejects the update.

---

### User Story 3 - Admin Updates Official Results and Triggers Scoring (Priority: P1)

After a match ends, the Admin performs a two-step process: (1) enters the official match score (home_score, away_score) and sets the result for each prediction criterion (result_team = HOME or AWAY), then (2) explicitly confirms "Finish & Score" as a separate action. Only upon this explicit confirmation does the system trigger scoring: it calculates each participant's score (number of correct criteria), determines the winner(s) (highest score ≥ 1), computes the gold pool (entry_gold × participants), splits it among winners, records MatchParticipation, and sends win/lose notifications. This process is idempotent — it runs only once per match.

**Why this priority**: Result entry and scoring are the core value delivery — they determine who wins gold and feed the leaderboard. Without this, the prediction system has no resolution.

**Independent Test**: Can be fully tested by creating a match with criteria, having multiple users predict, then Admin entering results, explicitly confirming "Finish & Score," and verifying that scores, gold_won, MatchParticipation records, and notifications are correctly created.

**Acceptance Scenarios**:

1. **Given** a match with participants and all criteria results set, **When** Admin explicitly confirms "Finish & Score," **Then** scoring runs: each participant's score is computed, winners are identified (highest score ≥ 1), pool is split, MatchParticipation is recorded, and MATCH_WON/MATCH_LOST notifications are sent.
2. **Given** the highest score among all participants is 0, **When** scoring runs, **Then** there is no winner and the gold pool is void.
3. **Given** a match has already been scored (FINISHED), **When** scoring is triggered again, **Then** the system does not duplicate results (idempotent).
4. **Given** Admin has not yet entered results for all criteria, **When** Admin attempts to confirm "Finish & Score," **Then** the system warns that some criteria lack results and blocks scoring until resolved.

---

### User Story 4 - Admin Cancels a Match (Priority: P2)

An Admin cancels a match that can no longer proceed. The system changes the match status to CANCELLED, voids all participation results for that match, and sends MATCH_CANCELLED notifications to all participants. A match with related predictions, comments, or statistics cannot be hard-deleted — it must be cancelled instead.

**Why this priority**: Cancellation is necessary for operational flexibility but occurs less frequently than creation, editing, or scoring.

**Independent Test**: Can be fully tested by creating a match with predictions, cancelling it, and verifying that participation results are voided and participants receive MATCH_CANCELLED notifications.

**Acceptance Scenarios**:

1. **Given** a match has related predictions/comments, **When** Admin cancels it, **Then** the match status changes to CANCELLED, participation results are voided, and MATCH_CANCELLED notifications are sent.
2. **Given** a match has related data, **When** Admin attempts to hard-delete it, **Then** the system rejects the hard delete.
3. **Given** a match with no related data, **When** Admin deletes it, **Then** the match is removed or cancelled per system policy.

---

### User Story 5 - Admin Manages Prediction Criteria for a Match (Priority: P1)

An Admin creates, edits, or deactivates prediction criteria for a specific match. Each criterion represents a question about the match outcome (e.g., "Who will score first?") where users predict HOME or AWAY. Criteria can be freely managed while the match is SCHEDULED. After the match starts (locks), changes that would affect fairness are blocked. The Admin also sets the result_team for each criterion after the match, either manually or the system fills it from api-football data (with Admin data taking priority).

**Why this priority**: Criteria define what users predict on — without criteria, predictions cannot be submitted. Managing criteria is integral to the match lifecycle.

**Independent Test**: Can be fully tested by creating a match, adding criteria, verifying they appear for users, editing criteria before match start, and confirming edits are blocked after match lock.

**Acceptance Scenarios**:

1. **Given** Admin is logged in and a match is SCHEDULED, **When** Admin creates a valid criterion, **Then** the criterion becomes available for users to predict on.
2. **Given** a match is LIVE or FINISHED, **When** Admin attempts to edit a criterion in a way that affects fairness, **Then** the system blocks the edit.
3. **Given** invalid criterion data (missing name), **When** Admin saves, **Then** a validation error is shown.
4. **Given** a criterion exists, **When** Admin deactivates it, **Then** it is no longer available for new predictions.

---

### User Story 6 - External Data Sync for Matches (Priority: P3)

The system integrates with api-football.com to pull match schedules, scores, and criterion results at configurable intervals (15–30 minutes). External data is mapped to local records via external_id. When external data conflicts with Admin-edited data, Admin data takes priority or Admin confirmation is required before overwrite. Admin can also trigger a manual sync.

**Why this priority**: External sync automates data entry and keeps match information up to date, but the system can function with manual entry alone. This is a supporting capability.

**Independent Test**: Can be tested by triggering a manual sync, verifying new external matches are created with external_id, and confirming that Admin-edited fields are not overwritten without confirmation.

**Acceptance Scenarios**:

1. **Given** api-football returns new match data, **When** a sync runs, **Then** new matches are created with external_id mapped.
2. **Given** Admin has manually edited a match field, **When** a sync brings conflicting data, **Then** Admin data is preserved or Admin is prompted to confirm overwrite.
3. **Given** a sync fails (API error/timeout), **When** the system retries or logs the failure, **Then** existing data is not corrupted.

---

### Edge Cases

- What happens when a match transitions from SCHEDULED to LIVE before all criteria results are entered? The system should still allow Admin to enter criterion results while the match is LIVE or after it ends.
- How does the system handle a match with 0 participants when it reaches FINISHED? No scoring or gold payout occurs; the match is simply marked FINISHED.
- What happens when a match has exactly 1 participant? The participant may be marked as a winner, but the win does not count toward the monthly leaderboard.
- What happens when the Admin sets entry_gold to 0? The pool becomes 0 and no gold is distributed, but the match still functions normally for predictions and scoring.
- How does the system handle concurrent updates by multiple Admins? Standard database-level conflict resolution applies; the last write wins for non-critical fields.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow Admin to create a match by selecting a home team and an away team from existing Team records, setting match_time, and optionally setting entry_gold (default 100).
- **FR-002**: System MUST validate that home and away teams are different for every match.
- **FR-003**: System MUST validate that match_time, home_team, and away_team are provided before saving.
- **FR-004**: System MUST validate that entry_gold is non-negative.
- **FR-005**: System MUST allow Admin to edit a SCHEDULED match's teams, match_time, start_date, end_date, and entry_gold.
- **FR-006**: System MUST block editing core match info once the match status leaves SCHEDULED (LIVE, FINISHED, CANCELLED, POSTPONED).
- **FR-007**: System MUST allow Admin to update official match scores (home_score, away_score) and set each criterion's result_team.
- **FR-008**: Scoring MUST follow a two-step process: (1) Admin enters criterion results and match scores, then (2) Admin explicitly confirms "Finish & Score" to trigger scoring. The system MUST warn and block scoring if any criteria lack a result_team.
- **FR-008a**: When scoring is triggered, the system MUST compute each participant's score (number of correct criteria), determine winner(s) (highest score ≥ 1), compute gold pool (entry_gold × participants), split pool among winners, and record MatchParticipation.
- **FR-009**: Scoring MUST be idempotent — it runs only once per match, guarded against re-execution.
- **FR-010**: System MUST send MATCH_WON or MATCH_LOST notifications to each participant when a match is scored.
- **FR-011**: If the highest participant score is 0, there MUST be no winner and the gold pool is void.
- **FR-012**: System MUST reject hard-delete of a match that has related predictions, comments, or statistics; the match MUST be cancelled instead.
- **FR-013**: Cancelling a match MUST void all participation results and send MATCH_CANCELLED notifications to all participants.
- **FR-014**: System MUST allow Admin to create, edit, and deactivate prediction criteria per match.
- **FR-015**: System MUST block criterion changes that affect fairness after the match is locked (no longer SCHEDULED).
- **FR-016**: Criterion result_team can be set by Admin manually or filled from api-football data; Admin data takes priority on conflict.
- **FR-017**: System MUST integrate with api-football.com for scheduled/manual data sync of match schedules, scores, and criterion results via external_id mapping.
- **FR-018**: When external sync data conflicts with Admin-edited data, the system MUST preserve Admin data or require Admin confirmation before overwrite.
- **FR-019**: System MUST display gold_won to 2 decimal places.
- **FR-020**: Match status transitions MUST follow the defined state machine: SCHEDULED → LIVE → FINISHED, or SCHEDULED/LIVE → CANCELLED, or SCHEDULED → POSTPONED → SCHEDULED.
- **FR-021**: All match management operations MUST require Admin authentication and authorization.
- **FR-022**: The Admin match management screen MUST provide filtering by match status (SCHEDULED, LIVE, FINISHED, CANCELLED, POSTPONED) and sorting by match_time.

### Key Entities

- **Match**: Represents a football match with home/away teams, match time, status lifecycle (SCHEDULED → LIVE → FINISHED/CANCELLED/POSTPONED), scores, entry gold, and optional external_id for api-football sync.
- **PredictionCriterion**: A question about a match outcome (e.g., "First goal scorer team") that users predict HOME or AWAY on. Has a result_team set by Admin or sync after the match, and a source (MANUAL/SCRAPED).
- **MatchParticipation**: Records a user's participation in a match's gold pool — their score, whether they won, and their gold_won amount. Unique per (match_id, user_id).
- **Notification**: In-app message sent to participants on match completion (MATCH_WON, MATCH_LOST) or cancellation (MATCH_CANCELLED), with read/unread state.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin can create, edit, and manage a match end-to-end (create → add criteria → score → finish) in under 5 minutes.
- **SC-002**: Match scoring completes within 2 seconds of the Admin marking a match as FINISHED, including all gold calculations and notification dispatch.
- **SC-003**: 100% of match validation rules (distinct teams, required fields, non-negative gold, status-based edit locks) are enforced consistently with no bypass possible.
- **SC-004**: Gold pool calculations are accurate to 2 decimal places with no rounding errors across all tested scenarios.
- **SC-005**: All participants receive the correct notification (WON/LOST/CANCELLED) within 5 seconds of a match status change to FINISHED or CANCELLED.
- **SC-006**: External data sync runs without corrupting Admin-edited data, with 100% conflict preservation of Admin values.

## Assumptions

- Teams already exist in the system (managed via UC13 / team-management feature) before matches can be created referencing them.
- The authentication and authorization system (UC01/UC02) is already implemented, providing Admin role verification via middleware.
- The notification delivery mechanism is in-app only (no push notifications or email for match results in this scope).
- api-football.com integration uses a server-side API key stored in environment variables; the sync endpoint is not exposed to the client.
- Gold is a non-monetary score used for ranking and bragging rights; no real-money settlement occurs within the system.
- Match time and dates are stored in UTC and displayed in Asia/Ho_Chi_Minh timezone on the frontend.
- The prediction submission feature (UC05) is a separate feature/UC and is not part of this match management scope — this feature covers the Admin-side match lifecycle only.
