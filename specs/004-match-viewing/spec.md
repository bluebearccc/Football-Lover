# Feature Specification: Match Viewing

**Feature Branch**: `004-match-viewing`

**Created**: 2026-06-22

**Status**: Draft

**Input**: User description: "match-viewing"

## Clarifications

### Session 2026-06-22

- Q: What is the default sort order for the match list? → A: Status-grouped: LIVE → SCHEDULED (soonest first) → FINISHED (most recent first).
- Q: What pagination strategy should the match list use? → A: Server-side pagination with 20 matches per page and page navigation controls.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse Match List (Priority: P1)

As any visitor (Guest, Registered User, or Admin), I want to browse a list of public football matches so that I can find matches I'm interested in and see upcoming, live, and finished matches at a glance.

**Why this priority**: The match list is the primary entry point for the entire application. Without it, users cannot discover or navigate to any match content. It is the foundation for all other match-related features.

**Independent Test**: Can be fully tested by opening the match list page, verifying match cards display with team names, logos, match time, and status, and confirming filter/sort functionality works. Delivers immediate value as the main discovery mechanism.

**Acceptance Scenarios**:

1. **Given** public matches exist in the system, **When** the visitor opens the match list page, **Then** match cards are displayed showing home team, away team, match time, status, and team logos.
2. **Given** the visitor is on the match list, **When** they apply a filter by status (e.g., SCHEDULED, LIVE, FINISHED), **Then** only matches matching the selected status are shown.
3. **Given** the visitor is on the match list, **When** they apply a date filter, **Then** only matches within the selected date range are displayed.
4. **Given** no matches exist or no matches match the applied filters, **When** the visitor views the match list, **Then** a clear empty state message is displayed (e.g., "Không có trận đấu nào").

---

### User Story 2 - View Match Details (Priority: P1)

As any visitor, I want to view the full details of a specific match so that I can see team information, match time, status, scores, prediction criteria, voting statistics, and comments.

**Why this priority**: Match details is the core content page where users consume match data and (if logged in) interact with predictions and comments. It is equally critical to the match list for delivering the primary user experience.

**Independent Test**: Can be fully tested by selecting a match from the list, verifying the detail page displays all sections (teams, time/status/score, criteria, statistics, comments), and confirming correct behavior for different match statuses. Delivers the detailed match experience users need.

**Acceptance Scenarios**:

1. **Given** a match exists, **When** the visitor selects it from the match list, **Then** the detail page displays home/away team names and logos, match time (formatted for Vietnam timezone), current status, and scores (if available).
2. **Given** a match has prediction criteria, **When** the detail page loads, **Then** all criteria are listed with their names and descriptions.
3. **Given** a match has voting statistics, **When** the detail page loads, **Then** prediction counts (total HOME votes vs. AWAY votes) are shown per criterion.
4. **Given** a match has public comments, **When** the detail page loads, **Then** comments are displayed with commenter name, content, and timestamp.
5. **Given** the visitor enters an invalid or nonexistent match ID, **When** the detail page loads, **Then** a "Không tìm thấy trận đấu" (not found) message is displayed.

---

### User Story 3 - Guest vs. Authenticated View Differences (Priority: P2)

As a Guest, I can view all public match information but cannot access prediction or comment actions. As a Registered User, I can see prediction and comment actions when permitted by match status.

**Why this priority**: Differentiating the view by authentication status ensures proper access control and guides users toward registration. It depends on the base viewing experience (P1 stories) being in place.

**Independent Test**: Can be tested by viewing match details as a Guest (verifying no predict/comment buttons), then logging in and verifying those actions appear for a SCHEDULED match.

**Acceptance Scenarios**:

1. **Given** the visitor is a Guest, **When** they view a match detail page, **Then** prediction submission and comment forms are not available; only viewing of existing public data is possible.
2. **Given** the visitor is a Registered User and the match is SCHEDULED, **When** they view match details, **Then** prediction actions are available for criteria that have not yet been predicted.
3. **Given** the visitor is a Registered User and the match is LIVE or FINISHED, **When** they view match details, **Then** prediction actions are locked (not editable).

---

### User Story 4 - Prediction Visibility Rules (Priority: P2)

As a visitor, I want the system to hide other users' predictions before a match starts and reveal them after kickoff, so that prediction fairness is maintained.

**Why this priority**: This directly implements business rules BR21 and BR22 which are essential for fair gameplay, but it builds on top of the basic viewing functionality.

**Independent Test**: Can be tested by checking that other users' predictions are hidden on a SCHEDULED match and become visible once the match transitions to LIVE or FINISHED.

**Acceptance Scenarios**:

1. **Given** a match is SCHEDULED and other users have submitted predictions, **When** a visitor views the match details, **Then** other users' individual predictions are not visible.
2. **Given** a match status is LIVE or FINISHED, **When** a visitor views the match details, **Then** all users' predictions are publicly visible.

---

### Edge Cases

- What happens when the match list API returns an error? A retry/try-later error message is displayed with an option to refresh.
- How does the system handle a match with no criteria? The criteria section is hidden or shows an empty state ("Chưa có tiêu chí dự đoán").
- What happens when a match has no comments? The comments section shows an empty state ("Chưa có bình luận").
- How does the system handle team logos that are missing? A default placeholder image is displayed.
- What happens when the match status transitions while a user is viewing the detail page? The page reflects the current status when loaded; real-time updates are out of scope for this feature.
- How does the system display a CANCELLED match? The match is shown with a CANCELLED badge and no active prediction/comment actions.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a public match list accessible to Guest, Registered User, and Admin without requiring authentication.
- **FR-002**: Each match card in the list MUST show home team name, away team name, team logos (or default placeholder), match time (Vietnam timezone, Asia/Ho_Chi_Minh), and current status.
- **FR-003**: System MUST support filtering the match list by status (SCHEDULED, LIVE, FINISHED, CANCELLED) and by date/date range.
- **FR-003a**: The match list MUST be sorted by default in status-grouped order: LIVE matches first, then SCHEDULED (soonest match_time first), then FINISHED (most recent match_time first). CANCELLED matches appear last.
- **FR-003b**: The match list MUST use server-side pagination with 20 matches per page. Page navigation controls MUST be provided to navigate between pages.
- **FR-004**: System MUST display a clear empty state message when no matches exist or no matches match the applied filters.
- **FR-005**: System MUST display an error state with a retry option when the match list fails to load.
- **FR-006**: System MUST display a match detail page showing: home/away team names and logos, match time, status, scores (when available), prediction criteria, voting statistics per criterion, and public comments.
- **FR-007**: System MUST display voting statistics per criterion as total HOME votes vs. total AWAY votes.
- **FR-008**: System MUST hide other users' individual predictions when match status is SCHEDULED (BR21).
- **FR-009**: System MUST reveal all users' predictions when match status is LIVE or FINISHED (BR22).
- **FR-010**: System MUST hide prediction/comment action controls for Guest visitors; only authenticated users see interactive elements.
- **FR-011**: System MUST lock prediction actions for matches that are not in SCHEDULED status.
- **FR-012**: System MUST display a not-found message when a match ID does not exist or is invalid.
- **FR-013**: System MUST format all dates and times for Vietnam locale and Asia/Ho_Chi_Minh timezone.
- **FR-014**: System MUST display team logos from stored URLs; when a logo is missing, a default placeholder image MUST be shown.
- **FR-015**: System MUST display match scores for LIVE and FINISHED matches, including the final official result when available.

### Key Entities *(include if feature involves data)*

- **Match**: Central entity representing a football match. Key attributes: home team, away team, match time, status (SCHEDULED/LIVE/FINISHED/CANCELLED), home score, away score, entry gold. Related to Teams, PredictionCriteria, Statistics, and Comments.
- **Team**: Represents a football team. Key attributes: name, short name, logo URL. Referenced by Match as home or away team.
- **PredictionCriterion**: A prediction question for a match. Key attributes: name, description, result team (HOME/AWAY after resolution). Belongs to a Match.
- **Statistic**: Aggregated vote counts for a criterion. Key attributes: total home votes, total away votes. Belongs to a Match and a PredictionCriterion.
- **Comment**: User-submitted comments on a match. Key attributes: content, author, timestamp, status. Belongs to a Match and a User.
- **Prediction**: A user's prediction for a criterion. Key attributes: selected team (HOME/AWAY), is correct. Used for visibility rules (hidden before kickoff, public after).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view the match list and see all relevant match information within 2 seconds of page load.
- **SC-002**: Users can navigate from the match list to a match detail page within 1 click/tap.
- **SC-003**: Match detail pages display all sections (teams, status, criteria, statistics, comments) within 2 seconds.
- **SC-004**: 100% of match cards show accurate team names, logos (or placeholder), match time in Vietnam timezone, and current status.
- **SC-005**: Other users' predictions are never visible on SCHEDULED matches (fairness compliance rate: 100%).
- **SC-006**: Guest visitors can browse all public match content without encountering login barriers or broken UI elements.
- **SC-007**: The system gracefully handles error and empty states, showing user-friendly Vietnamese messages in 100% of failure scenarios.

## Assumptions

- Match data is already available in the system, either created by Admin (UC06) or synced from api-football (FR-13). This feature only displays existing data.
- The existing authentication system (UC01/UC02) is functional and can be used to determine if the current visitor is a Guest or a Registered User.
- Team management (UC13) is implemented, providing Team records with names and logo URLs for match display.
- Real-time/live-updating match data (e.g., WebSocket push for score changes) is out of scope; the page shows the current state at load time. Users can manually refresh.
- The match list page is the primary landing page or home screen of the application, serving as the entry point for match discovery.
- Comments displayed on the match detail page are read-only in this feature scope; comment creation is handled by UC08 (Comment on Match).
- Prediction submission/editing is handled by UC05; this feature only displays the UI hooks (buttons/forms) and enforces visibility rules.
