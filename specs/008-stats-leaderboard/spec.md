# Feature Specification: Statistics & Leaderboard

**Feature Branch**: `008-stats-leaderboard`

**Created**: 2026-06-26

**Status**: Draft

**Input**: User description: "stats-leaderboard"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Monthly Win-Count Leaderboard (Priority: P1)

As any visitor (Guest, Registered User, or Admin), I want to see a ranked list of the top football predictors based on the number of matches they have won in the current calendar month, so that I can see who is performing best and feel motivated to participate.

**Why this priority**: The leaderboard is the primary engagement and competition driver. It incentivizes users to keep predicting and creates a social loop of friendly rivalry. It is the core deliverable of UC09.

**Independent Test**: Can be fully tested by creating multiple users with finished matches (scored and with winners determined), then opening the leaderboard page and verifying the ranking. Delivers visible competitive value immediately.

**Acceptance Scenarios**:

1. **Given** users have won matches this calendar month, **When** any actor opens the leaderboard, **Then** users are ranked by number of matches won in the current month (Asia/Ho_Chi_Minh timezone); only matches with ≥ 2 participants count (AC-09-02, BR20, BR29).
2. **Given** no users have won matches this month, **When** any actor opens the leaderboard, **Then** a no-data message is displayed (AC-09-03).
3. **Given** a logged-in user views the leaderboard, **When** their own rank appears in the list, **Then** their row is visually highlighted so they can quickly identify their position.
4. **Given** the leaderboard has many entries, **When** the actor scrolls or navigates, **Then** results are paginated.
5. **Given** two users have won the same number of matches, **When** the leaderboard renders, **Then** tied users are ordered by higher accuracy percentage (correct criteria / total criteria predicted) as the tiebreaker.

---

### User Story 2 - View Prediction Statistics per Match/Criterion (Priority: P2)

As any visitor, I want to see aggregated prediction vote counts (home vs. away) for each criterion of a match, so that I can understand how the community is predicting before making my own choice or simply following along.

**Why this priority**: Prediction statistics add community transparency and make the prediction experience more social. They directly fulfill FR-09 and BR19, but are secondary to the leaderboard because they augment existing match detail rather than standing alone.

**Independent Test**: Can be tested by submitting predictions for a match's criteria with multiple users, then opening the match details and verifying the vote counts update correctly. Delivers community insight value.

**Acceptance Scenarios**:

1. **Given** predictions exist for a match that has started (LIVE or FINISHED), **When** any actor opens match statistics, **Then** prediction counts (total home votes vs. total away votes) are shown per criterion (AC-09-01).
2. **Given** a match is still SCHEDULED, **When** any actor views match statistics, **Then** aggregate vote counts are hidden to prevent bandwagon influence (aligned with BR21/BR22).
3. **Given** a new prediction is submitted, **When** the statistics view is refreshed, **Then** the vote counts reflect the new prediction (BR19).
4. **Given** no predictions exist for a match, **When** an actor views statistics, **Then** a no-data message is displayed (AC-09-03).

---

### User Story 3 - View Leaderboard Podium for Top 3 (Priority: P3)

As any visitor, I want to see the top 3 predictors displayed prominently in a podium layout with avatars and key stats, so that top performers are celebrated and the leaderboard feels exciting and gamified.

**Why this priority**: The podium is a visual enhancement that elevates the leaderboard from a plain table to an engaging, game-like experience. It follows the Stitch mockup design and adds emotional appeal, but the core ranking table (P1) must work first.

**Independent Test**: Can be tested by having at least 3 users with match wins, opening the leaderboard, and verifying the podium section displays the top 3 with correct rank badges (1st, 2nd, 3rd), avatars, display names, and points.

**Acceptance Scenarios**:

1. **Given** at least 3 users have won matches this month, **When** actor opens leaderboard, **Then** the top 3 are displayed in a podium layout with rank badges, avatars, display names, and points.
2. **Given** fewer than 3 users have won matches, **When** actor opens leaderboard, **Then** the podium adapts to show only available top users (1 or 2) without empty placeholders.

---

### Edge Cases

- What happens when a match is cancelled after being scored? Cancelled match wins must be voided and removed from the leaderboard count (BR14, BR30).
- How does the leaderboard handle the month boundary? The month resets at midnight Asia/Ho_Chi_Minh timezone; the first day of a new month starts with a fresh leaderboard.
- What happens when the statistics API is unavailable? A retry/try-later error message is displayed; previously loaded data is preserved if possible.
- What if a user has no avatar? A default placeholder avatar is shown.

## Clarifications

### Session 2026-06-26

- Q: Should aggregate prediction vote counts (home vs. away per criterion) be visible before the match starts? → A: Hide aggregate vote counts until the match starts, aligning with BR21/BR22 to prevent bandwagon influence on remaining predictions.
- Q: Are the "Win Streak" and "Accuracy" columns shown in the mockup in scope for v1? → A: Yes, include both in v1 to match the mockup fully. Both are derived from existing MatchParticipation and Prediction data.
- Q: What is the tiebreaker when users have the same number of monthly wins? → A: Higher accuracy percentage (correct criteria / total criteria predicted). This rewards overall prediction skill rather than arbitrary ordering.
- Q: Is the "Win Streak" calculated all-time or only within the current leaderboard month? → A: All-time consecutive wins. The streak persists across months as it measures consistency over time, independent of the monthly leaderboard reset.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a leaderboard ranking users by number of matches won within the current calendar month, using Asia/Ho_Chi_Minh timezone for month boundaries (BR20). Tiebreaker for equal win counts: higher accuracy percentage (correct criteria / total criteria predicted).
- **FR-002**: System MUST only count wins from matches that had ≥ 2 participants toward the leaderboard ranking (BR29).
- **FR-003**: System MUST display prediction vote statistics (total home votes vs. total away votes) per criterion for each match, but ONLY after the match has started (status LIVE or FINISHED), aligning with BR21/BR22 to prevent pre-kickoff bandwagon influence (FR-09, BR19).
- **FR-004**: System MUST update prediction statistics automatically when a new prediction is submitted (BR19).
- **FR-005**: System MUST allow Guest, Registered User, and Admin to view the leaderboard and prediction statistics without authentication restrictions.
- **FR-006**: System MUST visually highlight the current logged-in user's row in the leaderboard table.
- **FR-007**: System MUST display a podium section showing the top 3 users with rank badges, avatars, display names, and point totals.
- **FR-008**: System MUST paginate leaderboard results for large datasets.
- **FR-011**: System MUST display a "Win Streak" indicator per user in the leaderboard table, showing the number of consecutive match wins calculated all-time (persists across months).
- **FR-012**: System MUST display an "Accuracy" percentage per user in the leaderboard table, calculated as the ratio of correct criterion predictions to total criterion predictions.
- **FR-009**: System MUST display an appropriate no-data message when no statistics or leaderboard data exists.
- **FR-010**: System MUST support filter/scope tabs on the leaderboard (at minimum: current month global ranking).

### Key Entities *(include if feature involves data)*

- **Statistic**: Aggregated prediction vote counts per match and criterion — tracks total_home_votes and total_away_votes for community transparency.
- **MatchParticipation**: Records each user's involvement in a match — tracks score, is_winner flag, and gold_won. The leaderboard is derived by counting is_winner=true records within the current calendar month.
- **User**: Provides display_name and avatar for leaderboard display; total_points for ranking display.
- **Match**: Provides match context (teams, status, time); only FINISHED matches with ≥ 2 participants contribute to the leaderboard.
- **PredictionCriterion**: Each criterion of a match that users predict on; statistics are aggregated per criterion.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Any visitor can view the monthly leaderboard and identify the top-ranked predictors within 3 seconds of page load.
- **SC-002**: Prediction vote counts per criterion update and display correctly within 2 seconds of a new prediction being submitted.
- **SC-003**: The leaderboard correctly resets at the beginning of each calendar month (Asia/Ho_Chi_Minh), showing only wins from the current month.
- **SC-004**: A logged-in user can find their own rank in the leaderboard within 5 seconds of opening the page.
- **SC-005**: The system gracefully displays a no-data message when no matches have been completed or no predictions exist, without errors or blank screens.

## Assumptions

- The gold scoring and match participation system (UC05/UC06) is already implemented, so MatchParticipation records with is_winner flags exist for finished matches.
- The month boundary for leaderboard ranking uses Asia/Ho_Chi_Minh timezone consistently across backend and frontend, as specified in the SRS.
- The "Friends" and "All-Time" filter tabs shown in the Stitch mockup are visual placeholders; the initial implementation will focus on "Global" (current month) ranking as the primary scope per BR20. Additional scopes can be added later.
- The "Win Streak" and "Accuracy" columns shown in the mockup table are in scope for v1. Both are derived from existing MatchParticipation and Prediction data — no new entities are needed. Win Streak = consecutive recent match wins; Accuracy = correct criteria / total criteria predicted.
- Admin dashboard metrics (system counts, activity metrics mentioned in FR-09) are a separate concern from the public-facing statistics/leaderboard and may be addressed in a dedicated admin dashboard feature.
