# Data Model: Match Management

**Date**: 2026-06-22 | **Source**: `backend/prisma/schema.prisma` + SRS §5.2

## Entities

### Match

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK, auto-generated | |
| homeTeamId | UUID | FK → Team.id, required | Must differ from awayTeamId (BR08) |
| awayTeamId | UUID | FK → Team.id, required | Must differ from homeTeamId (BR08) |
| matchTime | DateTime | required | Prediction lock / kickoff time |
| startDate | DateTime? | optional | Scraped from api-football |
| endDate | DateTime? | optional | Scraped, used to finalize |
| status | MatchStatus | required, default SCHEDULED | State machine governs transitions |
| homeScore | Int? | optional, ≥ 0 | Set by Admin on result entry |
| awayScore | Int? | optional, ≥ 0 | Set by Admin on result entry |
| entryGold | Decimal(12,2) | required, default 100, ≥ 0 | Per-match gold pool base |
| externalId | String? | unique | api-football fixture ID |
| createdAt | DateTime | auto | |

**Indexes**: matchTime, status, homeTeamId, awayTeamId

### PredictionCriterion

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | |
| matchId | UUID | FK → Match.id, required | |
| name | String | required | e.g., "Đội ghi bàn trước" |
| description | String? | optional | |
| resultTeam | TeamSide? | null until resolved | HOME or AWAY |
| resolvedAt | DateTime? | set when result_team assigned | |
| source | CriterionSource | default MANUAL | MANUAL or SCRAPED |

**Index**: matchId

### MatchParticipation

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | |
| matchId | UUID | FK → Match.id | |
| userId | UUID | FK → User.id | |
| score | Int | default 0 | Number of correct criteria |
| isWinner | Boolean | default false | Highest score ≥ 1 |
| goldWon | Decimal(12,2) | default 0 | pool ÷ winnerCount |
| createdAt | DateTime | auto | |

**Unique constraint**: (matchId, userId)

### Notification (match-related subset)

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | |
| userId | UUID | FK → User.id | |
| type | NotificationType | required | MATCH_WON, MATCH_LOST, MATCH_CANCELLED |
| title | String | required | |
| body | String? | optional | |
| matchId | UUID? | FK → Match.id | Links notification to match |
| isRead | Boolean | default false | |
| createdAt | DateTime | auto | |

## Enumerations

| Enum | Values |
|------|--------|
| MatchStatus | SCHEDULED, LIVE, FINISHED, CANCELLED, POSTPONED |
| TeamSide | HOME, AWAY |
| CriterionSource | MANUAL, SCRAPED |
| NotificationType | MATCH_WON, MATCH_LOST, MATCH_CANCELLED |

## State Machine: Match.status

```
SCHEDULED ──→ LIVE ──→ FINISHED
    │           │
    │           └──→ CANCELLED
    │
    ├──→ CANCELLED
    │
    └──→ POSTPONED ──→ SCHEDULED
```

**Transition rules**:
- Core field edits (teams, matchTime) only allowed in SCHEDULED
- Criterion creation/edit only allowed in SCHEDULED
- Result entry (scores, criterion results) allowed in LIVE or after
- Scoring trigger only on transition to FINISHED
- Cancel allowed from SCHEDULED or LIVE

## Relationships

```
Team 1──* Match (homeTeam, awayTeam)
Match 1──* PredictionCriterion
Match 1──* MatchParticipation
Match 1──* Notification
User 1──* MatchParticipation
User 1──* Notification
PredictionCriterion 1──* Prediction
```

## Schema Status

All entities above are **already defined** in `backend/prisma/schema.prisma`. No migrations needed for this feature — the data model is complete.
