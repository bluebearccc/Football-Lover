# Feature Specification: Gold Scoring & Payout

**Feature Branch**: `006-gold-scoring`

**Created**: 2026-06-23

**Status**: Draft

**Input**: User description: "gold-scoring"

## Clarifications

### Session 2026-06-23

- Q: How should indivisible gold pool remainder be handled when pool isn't evenly divisible among winners? → A: Round down (floor to 2 decimal places); small remainder is silently discarded.
- Q: Can a Finished (already scored) match be Cancelled, voiding all results? → A: Yes — Admin can cancel a Finished match; system voids all scored results, gold, and sends MATCH_CANCELLED notifications.
- Q: Must all criteria have result_team set before scoring runs? → A: Block — match cannot transition to Finished until ALL criteria have result_team set.
- Q: Should scoring update User.totalPoints (all-time correct predictions)? → A: Yes — add match score to User.totalPoints on Finished; subtract on Cancelled.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Automatic Scoring When Match Finishes (Priority: P1)

When a match transitions to Finished status (Admin updates official result and sets criterion results), the system automatically scores every participant's predictions and determines winners.

**Why this priority**: Scoring is the core engine — without it, gold payout, winner determination, and leaderboard updates cannot happen. Every other story depends on scores being computed correctly.

**Independent Test**: Can be fully tested by creating a match with criteria, having multiple users submit predictions, then Admin marking the match Finished with criterion results. Verify each user's score = number of correct predictions.

**Acceptance Scenarios**:

1. **Given** a match with 3 criteria and 5 participants, **When** Admin marks the match Finished and all criteria have `result_team` set, **Then** each participant's score is computed as the count of criteria where `selected_team == result_team` (+1 each), and MatchParticipation records are created/updated.
2. **Given** a participant predicted 2 out of 3 criteria correctly, **When** scoring runs, **Then** that participant's score is 2.
3. **Given** scoring has already run for a match, **When** the scoring workflow is triggered again, **Then** no duplicate records are created and scores remain unchanged (idempotent).

---

### User Story 2 - Gold Pool Calculation and Winner Payout (Priority: P1)

After scoring, the system calculates the gold pool and distributes it equally among winner(s) — the participant(s) with the highest score (score must be at least 1).

**Why this priority**: Gold payout is the primary reward mechanic and the main engagement driver. It is tightly coupled with scoring and must work correctly for the system to be meaningful.

**Independent Test**: Can be tested by finishing a match with known predictions and verifying that gold_won values on MatchParticipation records equal pool / number of winners, displayed to 2 decimal places.

**Acceptance Scenarios**:

1. **Given** a Finished match with `entry_gold = 100` and 4 participants, **When** scoring completes with 1 winner (highest score, score >= 1), **Then** pool = 400, winner's `gold_won` = 400.00, losers' `gold_won` = 0.00.
2. **Given** a Finished match with `entry_gold = 100` and 3 participants where 2 tied for highest score (both >= 1), **When** scoring completes, **Then** pool = 300, each winner's `gold_won` = 150.00.
3. **Given** a Finished match where all participants scored 0, **When** scoring completes, **Then** there are no winners and the pool is void (all `gold_won` = 0.00, all `is_winner` = false).

---

### User Story 3 - Match Cancellation Voids All Results (Priority: P2)

When a match is cancelled, all MatchParticipation results (scores, winner flags, gold) are voided and participants receive a MATCH_CANCELLED notification.

**Why this priority**: Cancellation is a necessary safeguard for fairness but is less frequent than normal scoring. It protects data integrity when matches cannot be completed.

**Independent Test**: Can be tested by creating a match with predictions and participations, then cancelling it. Verify all participation records are reset and notifications are sent.

**Acceptance Scenarios**:

1. **Given** a match with scored MatchParticipation records (including a previously Finished match), **When** Admin cancels the match, **Then** all participation records have `score = 0`, `is_winner = false`, `gold_won = 0`, predictions have `is_correct = null`, and each participant's User.totalPoints is decremented by their match score.
2. **Given** a cancelled match, **When** the system processes cancellation, **Then** each participant receives a MATCH_CANCELLED notification.

---

### User Story 4 - Win/Lose Notifications After Scoring (Priority: P2)

After scoring and payout for a Finished match, every participant receives a notification indicating whether they won or lost, including gold earned if they won.

**Why this priority**: Notifications keep users engaged and informed about their results, but the core scoring/payout logic must work independently of notifications.

**Independent Test**: Can be tested by finishing a match and verifying that each participant has a notification record with the correct type (MATCH_WON or MATCH_LOST) and gold amount for winners.

**Acceptance Scenarios**:

1. **Given** a Finished match with 1 winner who earned 400 gold, **When** notifications are sent, **Then** the winner receives a MATCH_WON notification mentioning the gold amount, and all other participants receive MATCH_LOST notifications.
2. **Given** a Finished match where all participants scored 0 (no winners), **When** notifications are sent, **Then** all participants receive MATCH_LOST notifications.

---

### User Story 5 - Leaderboard Win Count Update (Priority: P3)

A match win counts toward the monthly leaderboard only if the match had at least 2 participants. The leaderboard ranks users by number of matches won within the current calendar month (timezone Asia/Ho_Chi_Minh).

**Why this priority**: Leaderboard is a "Should" priority feature that builds on top of the scoring results. It adds a competitive layer but is not required for the scoring/payout core to function.

**Independent Test**: Can be tested by finishing multiple matches in the same month with varying participant counts and verifying leaderboard rankings reflect only qualifying wins.

**Acceptance Scenarios**:

1. **Given** User A won 3 matches this month (all with >= 2 participants), **When** the leaderboard is queried for this month, **Then** User A appears with a win count of 3.
2. **Given** User B won a match that had only 1 participant (themselves), **When** the leaderboard is queried, **Then** that win does not count toward User B's monthly tally.
3. **Given** it is July 1st in Asia/Ho_Chi_Minh timezone, **When** the leaderboard is queried for July, **Then** only wins from matches finished in July (Asia/Ho_Chi_Minh) are counted.

---

### Edge Cases

- What happens when a match has 0 participants when Finished? No MatchParticipation records are created; no pool, no notifications.
- What happens when `entry_gold` is set to 0? Pool = 0, so `gold_won` is 0 for all participants regardless of outcome. Winners are still determined for leaderboard purposes.
- What happens when scoring fails mid-way (e.g., database error)? The entire scoring operation must be wrapped in a transaction — either all records are written or none are.
- What happens when Admin changes criterion results after scoring has already run? The system must not allow re-scoring a Finished match; results are final once scored. However, Admin may cancel the Finished match, which voids all results.
- What happens when a user has predictions on some but not all criteria? They are still a participant; their score is the count of correct predictions out of the ones they submitted.
- What happens when the gold pool isn't evenly divisible? Each winner's gold_won is floored to 2 decimal places; the small remainder (at most a few cents equivalent) is discarded.
- Can Admin finish a match with unresolved criteria? No — the system blocks the Finished transition until all criteria have result_team set.
- What happens to User.totalPoints when a match is cancelled after scoring? The match score previously added to totalPoints is subtracted back.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-GS-001**: System MUST compute each participant's score as the count of criteria where `selected_team == result_team` when a match transitions to Finished status (BR12).
- **FR-GS-002**: System MUST determine winners as the participant(s) with the highest score, provided that score is at least 1 (BR27).
- **FR-GS-003**: System MUST calculate the gold pool as `entry_gold x number of participants` for a Finished match (BR26).
- **FR-GS-004**: System MUST distribute the gold pool equally among winners: `gold_won = floor(pool / number of winners, 2 decimals)`; any indivisible remainder is silently discarded (BR28).
- **FR-GS-005**: System MUST void the pool (no payout) when the highest score among all participants is 0 (BR28).
- **FR-GS-006**: System MUST create or update MatchParticipation records for each participant with score, is_winner, and gold_won fields.
- **FR-GS-007**: System MUST ensure the scoring workflow is idempotent — running it multiple times for the same match produces the same result without duplicates.
- **FR-GS-008**: System MUST wrap the entire scoring + payout + participation workflow in a single database transaction.
- **FR-GS-009**: System MUST void all MatchParticipation results (score = 0, is_winner = false, gold_won = 0), reset prediction is_correct to null, and subtract each participant's match score from User.totalPoints when a match is cancelled (BR14). This applies even if the match was previously Finished and scored.
- **FR-GS-010**: System MUST send a MATCH_WON notification (including gold amount) to each winner and a MATCH_LOST notification to each loser after a Finished match is scored (BR30).
- **FR-GS-011**: System MUST send a MATCH_CANCELLED notification to all participants when a match is cancelled (BR30).
- **FR-GS-012**: System MUST only count a win toward the monthly leaderboard when the match had at least 2 participants (BR29).
- **FR-GS-013**: System MUST use `Decimal` type for all gold calculations to avoid floating-point precision errors.
- **FR-GS-014**: System MUST use Asia/Ho_Chi_Minh timezone when determining which calendar month a match's finish belongs to for leaderboard purposes (BR20).
- **FR-GS-015**: System MUST treat a user as a participant if they have at least 1 prediction on the match.
- **FR-GS-016**: System MUST block the match from transitioning to Finished until ALL criteria have result_team set. Scoring triggers only when the match becomes Finished with all criteria resolved (BR13).
- **FR-GS-017**: System MUST add each participant's match score to User.totalPoints when a match is scored on Finished.
- **FR-GS-018**: System MUST allow a Finished match to transition to Cancelled; upon cancellation, the voiding workflow (FR-GS-009) runs to reverse all scoring results.

### Key Entities

- **MatchParticipation**: The central record linking a user to a match's outcome — stores score (count of correct criteria), is_winner flag, and gold_won amount. One record per user per match.
- **Prediction**: Individual user prediction for a single criterion. Contains selected_team and is_correct (set during scoring). Multiple predictions per user per match (one per criterion).
- **Match**: Contains entry_gold (default 100), status, and official scores. Status transition to Finished triggers the scoring workflow.
- **PredictionCriterion**: Each criterion has a result_team set by Admin. Used to evaluate predictions during scoring.
- **Notification**: Records MATCH_WON, MATCH_LOST, or MATCH_CANCELLED messages sent to participants after scoring or cancellation.
- **User**: Contains totalPoints (all-time correct prediction count) which is incremented during scoring and decremented on match cancellation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Scoring completes within 2 seconds for a match with up to 50 participants and 10 criteria.
- **SC-002**: Gold payout amounts are accurate to 2 decimal places using floor rounding; sum of payouts never exceeds total pool (remainder from indivisible splits is discarded).
- **SC-003**: 100% of participants receive the correct notification (WON/LOST/CANCELLED) within 5 seconds of match status change.
- **SC-004**: Scoring is fully idempotent — triggering it N times produces identical results as triggering it once.
- **SC-005**: Cancelled match results are fully voided — no participant retains score, winner status, or gold from a cancelled match.
- **SC-006**: Monthly leaderboard accurately reflects only wins from matches with at least 2 participants, computed in Asia/Ho_Chi_Minh timezone.

## Assumptions

- The match management feature (UC06) already handles status transitions and Admin can set `entry_gold` per match.
- Prediction criteria management (UC07) is implemented and Admin can set `result_team` on each criterion.
- The prediction submission feature (UC05) is implemented so users can submit predictions that create records in the Prediction table.
- The Notification entity exists in the schema and a basic notification creation mechanism is available or will be built as part of this feature.
- Scoring is triggered server-side as part of the match finalization flow, not as a separate user-facing action.
- There is no "undo scoring" — once a match is Finished and scored, results are final. The only reversal path is cancellation.
- Gold is a non-monetary, in-app score concept — no real-money implications.
