# Data Model: Match Viewing (004)

**Date**: 2026-06-22

No schema changes are required. This feature is read-only and consumes existing entities defined in `backend/prisma/schema.prisma`.

## Entities Used

### Match
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| homeTeamId | UUID FK → Team | |
| awayTeamId | UUID FK → Team | |
| matchTime | DateTime | Prediction lock / kickoff time |
| startDate | DateTime? | Scraped actual start |
| endDate | DateTime? | Scraped actual end |
| status | MatchStatus | SCHEDULED / LIVE / FINISHED / CANCELLED / POSTPONED |
| homeScore | Int? | Official home score |
| awayScore | Int? | Official away score |
| entryGold | Decimal(12,2) | Per-match gold pool entry (default 100) |
| externalId | String? unique | api-football mapping |
| createdAt | DateTime | |

**Indexes**: `matchTime`, `status`, `homeTeamId`, `awayTeamId`

### Team
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| name | String | |
| shortName | String? | |
| logoUrl | String? | null → default placeholder image |
| isActive | Boolean | |

### PredictionCriterion
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| matchId | UUID FK → Match | |
| name | String | |
| description | String? | |
| resultTeam | TeamSide? | HOME/AWAY — set when resolved |
| isActive | Boolean | Only active criteria shown publicly |

### Statistic
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| matchId | UUID FK → Match | |
| criterionId | UUID FK → PredictionCriterion | |
| totalHomeVotes | Int | Aggregated HOME predictions |
| totalAwayVotes | Int | Aggregated AWAY predictions |

**Unique**: `(matchId, criterionId)`

### Comment
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| matchId | UUID FK → Match | |
| userId | UUID FK → User | |
| content | String | 1..1000 chars |
| status | CommentStatus | VISIBLE / HIDDEN / DELETED |
| createdAt | DateTime | |

Only `VISIBLE` comments shown in public detail.

### Prediction
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| userId | UUID FK → User | |
| matchId | UUID FK → Match | |
| criterionId | UUID FK → PredictionCriterion | |
| selectedTeam | TeamSide | HOME / AWAY |
| isCorrect | Boolean? | Scored when match FINISHED |

**Visibility rule**: For SCHEDULED matches, only the requesting user's own predictions are returned. For LIVE/FINISHED, all predictions are public (BR21/BR22).

### MatchParticipation
| Field | Type | Notes |
|-------|------|-------|
| matchId | UUID FK → Match | |
| userId | UUID FK → User | |
| score | Int | Number of correct criteria |
| isWinner | Boolean | |
| goldWon | Decimal(12,2) | |

Used to display participant count and gold pool info on the match detail.

## Query Patterns

### Match List (UC03)
```
SELECT m.*, ht.name, ht.logo_url, at.name, at.logo_url,
       COUNT(p.id) as prediction_count, COUNT(c.id) as comment_count
FROM matches m
JOIN teams ht ON m.home_team_id = ht.id
JOIN teams at ON m.away_team_id = at.id
LEFT JOIN predictions p ON p.match_id = m.id
LEFT JOIN comments c ON c.match_id = m.id AND c.status = 'VISIBLE'
WHERE m.status IN (filter)
ORDER BY
  CASE m.status
    WHEN 'LIVE' THEN 0
    WHEN 'SCHEDULED' THEN 1
    WHEN 'FINISHED' THEN 2
    WHEN 'CANCELLED' THEN 3
    WHEN 'POSTPONED' THEN 4
  END,
  CASE WHEN m.status IN ('LIVE','SCHEDULED') THEN m.match_time END ASC,
  CASE WHEN m.status IN ('FINISHED','CANCELLED','POSTPONED') THEN m.match_time END DESC
LIMIT 20 OFFSET ?
```

### Match Detail (UC04)
```
Match + homeTeam + awayTeam
+ criteria (WHERE is_active = true)
+ statistics (JOIN on criteria)
+ comments (WHERE status = 'VISIBLE', ORDER BY created_at ASC)
+ predictions (filtered by viewer — see BR21/BR22 rule)
+ _count: participations (for participant count)
+ entryGold (for gold pool display)
```

## State Transitions (Reference)
```
SCHEDULED → LIVE → FINISHED
SCHEDULED → CANCELLED
LIVE → CANCELLED
SCHEDULED → POSTPONED → SCHEDULED
```
This feature only reads status; it does not trigger transitions.
