# Data Model: Gold Scoring & Payout

**Date**: 2026-06-23 | **Feature**: 006-gold-scoring

## Entities

All entities below already exist in `backend/prisma/schema.prisma`. No schema migration is needed for this feature — all changes are at the application layer.

### MatchParticipation (existing)

Links a user to a match's scoring outcome. Created during the scoring transaction.

| Field     | Type         | Constraints                  | Notes                                |
|-----------|-------------|------------------------------|--------------------------------------|
| id        | UUID         | PK, auto-generated           |                                      |
| matchId   | UUID         | FK → Match, unique(matchId, userId) | Indexed                       |
| userId    | UUID         | FK → User, unique(matchId, userId)  | Indexed                       |
| score     | Int          | Default 0                    | Count of correct criteria (+1 each)  |
| isWinner  | Boolean      | Default false                | True if score = max and score ≥ 1    |
| goldWon   | Decimal(12,2)| Default 0                    | floor(pool / winnerCount, 2 decimals)|
| createdAt | DateTime     | Default now()                |                                      |

**Lifecycle**: Created on match FINISHED scoring. Deleted on match CANCELLED. One record per (match, user) — uniqueness enforced by DB constraint.

### Prediction (existing — fields updated during scoring)

| Field        | Type      | Updated During Scoring | Notes                          |
|--------------|----------|----------------------|--------------------------------|
| isCorrect    | Boolean? | Yes                  | null → true/false on scoring; null on cancel |

### PredictionCriterion (existing — fields updated during scoring)

| Field      | Type      | Updated During Scoring | Notes                            |
|------------|----------|----------------------|----------------------------------|
| resolvedAt | DateTime?| Yes                  | Set to now() when scoring runs   |
| resultTeam | TeamSide?| No (set by Admin before scoring) | Must be non-null for all criteria before FINISHED transition |

### User (existing — field updated during scoring)

| Field       | Type | Updated During Scoring | Notes                                      |
|-------------|------|----------------------|--------------------------------------------|
| totalPoints | Int  | Yes                  | Incremented by match score on FINISHED; decremented on CANCELLED |

### Match (existing — status transition)

| Field     | Type         | Updated During Scoring | Notes                          |
|-----------|-------------|----------------------|--------------------------------|
| status    | MatchStatus  | Yes                  | Set to FINISHED in scoring transaction |
| entryGold | Decimal(12,2)| No (read-only during scoring) | Default 100; pool = entryGold × participants |
| homeScore | Int?         | Yes                  | Set from Admin input           |
| awayScore | Int?         | Yes                  | Set from Admin input           |

### Notification (existing — created during scoring)

| Field     | Type             | Notes                                |
|-----------|-----------------|--------------------------------------|
| id        | UUID             | PK, auto-generated                   |
| userId    | UUID             | FK → User                            |
| type      | NotificationType | MATCH_WON, MATCH_LOST, MATCH_CANCELLED |
| title     | String           | Vietnamese text                      |
| body      | String?          | Includes gold amount for WON         |
| matchId   | UUID?            | FK → Match                           |
| isRead    | Boolean          | Default false                        |
| createdAt | DateTime         | Default now()                        |

## Relationships

```
Match 1 ──── N MatchParticipation N ──── 1 User
Match 1 ──── N PredictionCriterion
Match 1 ──── N Prediction
Match 1 ──── N Notification N ──── 1 User
PredictionCriterion 1 ──── N Prediction
User 1 ──── N Prediction
```

## State Transitions

### Match Status (relevant to scoring)

```
SCHEDULED → LIVE → FINISHED → CANCELLED
                      ↑            ↑
                      └── (direct) ─┘── from any status via Admin cancel
```

- **→ FINISHED**: Requires ALL criteria to have `resultTeam` set. Triggers scoring transaction.
- **→ CANCELLED**: Allowed from any status including FINISHED. Triggers voiding transaction.

### Scoring Transaction (FINISHED)

```
1. Guard: if MatchParticipation exists for this match → skip (idempotent)
2. For each prediction: compare selected_team vs criterion result_team → set is_correct
3. For each participant (user with ≥ 1 prediction):
   a. score = count of correct predictions
   b. Determine winner(s): highest score, must be ≥ 1
   c. gold_won = floor(pool / winnerCount, 2 decimals) for winners; 0 for losers
4. Create MatchParticipation records
5. Update Prediction.isCorrect (true/false)
6. Set PredictionCriterion.resolvedAt = now()
7. Create Notification records (MATCH_WON / MATCH_LOST)
8. Increment User.totalPoints for participants with score > 0
9. Update Match.status = FINISHED with scores
```

### Cancellation Transaction (CANCELLED)

```
1. Read existing MatchParticipation records to get per-user scores
2. Decrement User.totalPoints by each participant's score
3. Delete all MatchParticipation records for the match
4. Reset all Prediction.isCorrect to null
5. Create MATCH_CANCELLED Notification for each participant
6. Update Match.status = CANCELLED
```

## Validation Rules

| Rule | Source | Enforcement Point |
|------|--------|-------------------|
| All criteria must have resultTeam before FINISHED | FR-GS-016 | matches.service.updateResult() |
| entry_gold ≥ 0 | SRS | matches.service.setEntryGold() / create() |
| gold_won uses Decimal, never float | FR-GS-013 | decimal.ts utilities |
| Floor rounding to 2 decimal places | FR-GS-004 | splitTwoDecimals() |
| Scoring is idempotent (one-time per match) | FR-GS-007 | Guard in applyScoring() |
| Win counts toward leaderboard only if ≥ 2 participants | FR-GS-012 | Leaderboard query filter |
| Leaderboard month in Asia/Ho_Chi_Minh timezone | FR-GS-014 | Leaderboard query TZ conversion |
