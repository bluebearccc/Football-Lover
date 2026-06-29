# Feature Specification: User Profile and Prediction History

**Feature Branch**: `013-user-profile`

**Created**: 2026-06-30

**Status**: Draft

**Input**: User description: "user-profile"

## Clarifications

### Session 2026-06-30

- Q: My spec capped prediction history at "5 most recent" total. But the existing built code already implements: a /profile page showing a 5-item recent-history preview (with a "view all" link), plus a separate fully-paginated /history page (page/pageSize, max 100/page). Which should the spec reflect? → A: Match existing code — profile shows a 5-item recent preview with a "view all" link; a separate full paginated `/history` screen provides the complete history.
- Q: Should "total matches participated" in stats count only finished matches, or all matches (including in-progress) the user has predicted on? → A: Only finished matches — keeps the denominator consistent with totalWins/accuracy, which are already finished/graded-only.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Registered user views own profile (Priority: P1)

A registered user opens their profile page to see their account information and overall performance: display name, email, join date, all-time points, current-month leaderboard rank, and aggregate stats (matches played, matches won, prediction accuracy, total gold won).

**Why this priority**: This is the core value of the feature — without it there is no profile to view. It is the minimum viable slice and is explicitly required by the source spec (UC10/FR-10).

**Independent Test**: Log in as a registered user with at least one finished-match participation, navigate to `/profile`, and verify all account fields and stats render with correct values matching the user's match history.

**Acceptance Scenarios**:

1. **Given** a logged-in user with finished-match history, **When** they open `/profile`, **Then** the page shows display name, email, join date, all-time points, current-month rank, matches played, matches won, prediction accuracy %, and total gold won.
2. **Given** a logged-in user with no finished-match participations yet, **When** they open `/profile`, **Then** an empty-state message is shown for the stats/history sections instead of an error or zeros presented as if they were real data.
3. **Given** a user whose session has expired, **When** they attempt to open `/profile`, **Then** they are redirected to the login screen.

---

### User Story 2 - Registered user views own prediction history (Priority: P1)

A registered user sees a 5-item preview of their most recent finished-match predictions directly on their profile (match, predicted outcome, actual outcome, gold won/lost), with a link to a separate full history screen that lists all of their past finished-match predictions with pagination.

**Why this priority**: Prediction history is the second half of UC10 and is needed for the user to understand their track record; it ships together with the profile view as the same MVP slice.

**Independent Test**: Log in as a user with 5+ finished matches, confirm the profile screen shows the 5 most recent results plus a "view all" link, then follow that link to the full history screen and verify all finished-match results are listed across pages, ordered most-recent-first.

**Acceptance Scenarios**:

1. **Given** a logged-in user with more than 5 finished-match participations, **When** they open `/profile`, **Then** only the 5 most recent finished matches are shown in the preview, ordered most-recent-first, with a link to view the full history.
2. **Given** a logged-in user with fewer than 5 finished-match participations, **When** they open `/profile`, **Then** all of their finished-match results are shown in the preview (no link needed beyond what's already shown, or the link simply leads to a full history with the same items).
3. **Given** a logged-in user with zero finished-match participations, **When** they open `/profile` or the full history screen, **Then** an empty-state message is shown.
4. **Given** a logged-in user with any number of finished-match participations, **When** they open the full history screen, **Then** all of their finished-match results are listed, paginated, ordered most-recent-first.

---

### User Story 3 - Admin views a user's profile/history for support (Priority: P2)

An authenticated Admin opens a specific user's profile and prediction history from the admin user-management screen to assist with a support request, viewing the same data shape as the user's own self-service view, read-only.

**Why this priority**: Valuable for support workflows but not required for the core self-service value delivered by P1; it reuses the same data and view logic so it can be added once the self-service view exists.

**Independent Test**: Log in as Admin, open the user-management screen, select a target user, and verify their profile/stats/history render identically in content/shape to that user's own `/profile` and `/history` views, with no edit controls exposed.

**Acceptance Scenarios**:

1. **Given** an authenticated Admin, **When** they open a target user's profile from the admin user-management screen, **Then** the same profile, stats, and history data as that user's own view is displayed, read-only.
2. **Given** an authenticated non-Admin user, **When** they attempt to request another user's profile or history (e.g., by manipulating a request), **Then** the request is denied.

---

### Edge Cases

- What happens when a user's all-time points or current-month rank cannot be computed yet (e.g., no leaderboard data exists for the current month)? Show an empty/"not ranked yet" state rather than an error.
- How does the system handle a profile request for a user ID that does not exist (e.g., stale Admin link to a deleted account)? Return a not-found state instead of a generic error or crash.
- How does the system handle prediction accuracy when the user has matches played but zero matches with a graded outcome yet (e.g., match finished but scoring not yet processed)? Exclude ungraded matches from the accuracy calculation and from the "matches played" count used for accuracy, rather than counting them as losses.
- What happens if an Admin's session expires while viewing a user's support profile? Same redirect-to-login behavior as the self-service view.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow an authenticated registered user to view their own profile, showing display name, email, join date, all-time points, current calendar-month leaderboard rank, and aggregate stats — total **finished** matches participated, total matches won, prediction accuracy %, total gold won across finished matches.
- **FR-002**: System MUST allow an authenticated registered user to view, on the profile screen, a preview of their 5 most recent finished-match results, ordered most-recent-first, with a link to a full prediction-history screen.
- **FR-002a**: System MUST allow an authenticated registered user to view a full, paginated list of all of their own finished-match prediction results on a dedicated history screen, ordered most-recent-first.
- **FR-003**: System MUST redirect unauthenticated or session-expired requests for the profile or history views to the login screen.
- **FR-004**: System MUST show an empty-state message (not an error, not misleading zero values) when a user has no finished-match participations yet.
- **FR-005**: System MUST restrict self-service profile/history endpoints to return only the authenticated caller's own data; there is no client-facing way to request another user's profile/history through these endpoints.
- **FR-006**: System MUST allow an authenticated Admin to view any user's profile, stats, and prediction history through the admin user-management surface, reusing the same data shape as the self-service view, in read-only form (no edit controls in this view).
- **FR-007**: System MUST deny profile/history access for any actor that is not authenticated, and for any non-Admin actor attempting to access another user's data.
- **FR-008**: System MUST compute prediction accuracy using only finished matches that have been graded (scored); matches still pending scoring MUST be excluded from both the numerator and denominator of the accuracy calculation.
- **FR-009**: System MUST return a not-found state (rather than an error or crash) when a profile is requested for a user ID that does not exist.

### Key Entities

- **User Profile**: The display-facing summary of a registered user's account and performance — display name, email, join date, all-time points, current-month leaderboard rank, total matches participated, total matches won, prediction accuracy %, total gold won. Derived from the user account plus aggregated finished-match participation data; not a separately stored entity.
- **Prediction History Entry**: A single past finished-match result shown to the user — references the match, the user's predicted outcome(s), the actual outcome, and the gold won or lost for that match.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A registered user can view their own complete profile (account info + stats) within 2 seconds of opening the profile screen, under normal load.
- **SC-002**: A registered user can see their 5 most recent finished-match results directly on the profile screen, and reach their complete finished-match history in one click from there.
- **SC-003**: 100% of unauthenticated or session-expired attempts to view a profile are redirected to login rather than shown partial or broken data.
- **SC-004**: 100% of attempts by a non-Admin user to view another user's profile/history are denied.
- **SC-005**: Admin support staff can pull up any user's profile/history from the user-management screen in 2 actions or fewer (e.g., select user → view profile).

## Assumptions

- "All-time points" and "current-month leaderboard rank" are computed using the existing monthly win-count leaderboard logic already defined for the platform; this feature only displays those values, it does not change how they are calculated.
- Prediction accuracy is defined as (number of graded finished-match predictions correctly called) / (number of graded finished-match predictions made); ungraded/pending matches are excluded as stated in FR-008.
- The "5 most recent" limit applies only to the preview shown on the profile screen; the dedicated full history screen supports pagination to display all of a user's finished-match results, no fixed cap. No user-configurable filtering of history (by date range, outcome, etc.) is required for this feature.
- "Total matches participated" (and the other stats) count only matches whose status is finished; matches the user has predicted on that are still scheduled or in progress are excluded from all profile stats counts.
- Admin's support view is read-only for profile/stats/history; any actual edit of a user's account (display name, role, ban status, etc.) is handled by the separate Manage Users feature (012-manage-users), not by this feature.
- Both the Registered User self-service screens and the Admin support view reuse one underlying profile/stats/history data shape, per FR-10 in the source SRS.
