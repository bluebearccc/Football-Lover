# Data Model: Statistics & Leaderboard (008)

## Existing Entities (no schema changes required)

This feature is fully derived from existing entities. No Prisma migration needed.

### Statistic

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | PK |
| matchId | UUID | FK → Match |
| criterionId | UUID | FK → PredictionCriterion |
| totalHomeVotes | Int | Aggregate HOME predictions count |
| totalAwayVotes | Int | Aggregate AWAY predictions count |

**Unique constraint**: `(matchId, criterionId)`

**Usage in this feature**: Displayed per criterion in the Stats tab of match detail. Hidden when match status is SCHEDULED (BR21/BR22).

### MatchParticipation

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | PK |
| matchId | UUID | FK → Match |
| userId | UUID | FK → User |
| score | Int | Number of correct criteria |
| isWinner | Boolean | Whether this user won the match |
| goldWon | Decimal(12,2) | Gold payout for this match |
| createdAt | DateTime | When participation was recorded |

**Unique constraint**: `(matchId, userId)`

**Usage in this feature**:
- Leaderboard: `COUNT(isWinner=true)` grouped by userId within current month → monthly win count
- Win Streak: ordered sequence of participations by match finish time, counting consecutive `isWinner=true` from most recent backward
- Tiebreaker: falls through to accuracy when win counts are equal

### Prediction

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | PK |
| userId | UUID | FK → User |
| matchId | UUID | FK → Match |
| criterionId | UUID | FK → PredictionCriterion |
| selectedTeam | TeamSide (HOME/AWAY) | User's pick |
| isCorrect | Boolean? | Scored when match FINISHED; null while unscored |

**Usage in this feature**:
- Accuracy: `COUNT(isCorrect=true) / COUNT(isCorrect IS NOT NULL)` per user
- Statistic updates: when a prediction is created/updated, the Statistic row for that criterion is incremented/adjusted

### User

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | PK |
| displayName | String | Shown in leaderboard table and podium |
| totalPoints | Int | All-time correct predictions (displayed in leaderboard) |

**Usage in this feature**: Display name, avatar placeholder (no avatar column exists — use default), totalPoints shown in ranking.

### Match

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | PK |
| status | MatchStatus | Only FINISHED matches contribute to leaderboard |
| matchTime | DateTime | Used to determine month boundary (Asia/Ho_Chi_Minh) |

**Usage in this feature**: Filter for FINISHED status and ≥ 2 participants (BR29). Match status determines stats visibility (SCHEDULED → hidden).

## Derived Data (computed at query time)

| Derived Field | Source | Computation |
|---------------|--------|-------------|
| monthlyWinCount | MatchParticipation + Match | `COUNT(mp.is_winner=true)` WHERE match FINISHED, month/year match, ≥ 2 participants |
| accuracy | Prediction | `COUNT(is_correct=true) / COUNT(is_correct IS NOT NULL)` per user |
| winStreak | MatchParticipation + Match | Consecutive `is_winner=true` ordered by match.matchTime DESC, all-time |
| rank | Derived | Dense rank by monthlyWinCount DESC, accuracy DESC as tiebreaker |

## State Transitions Affecting This Feature

```
Match: SCHEDULED → LIVE → FINISHED → (scoring triggers MatchParticipation creation)
                    ↘ CANCELLED (voids all participations, removes from leaderboard)
                    
Statistics visibility:
  SCHEDULED → stats hidden (empty array returned)
  LIVE / FINISHED → stats visible
```
