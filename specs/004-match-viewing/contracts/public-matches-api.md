# Public Matches API Contract

**Base path**: `/api/v1/matches`
**Auth**: None required (public). Optional JWT for prediction visibility (own predictions on SCHEDULED matches).

---

## GET /api/v1/matches

List public matches with status-grouped sorting and pagination.

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| status | string? | (all) | Filter by MatchStatus: `SCHEDULED`, `LIVE`, `FINISHED`, `CANCELLED` |
| from | ISO date? | — | Filter matches with `matchTime >= from` |
| to | ISO date? | — | Filter matches with `matchTime <= to` |
| page | int | 1 | Page number (1-based) |
| pageSize | int | 20 | Items per page (max 100) |

### Response 200

```json
{
  "items": [
    {
      "id": "uuid",
      "homeTeam": {
        "id": "uuid",
        "name": "Man City",
        "shortName": "MCI",
        "logoUrl": "/uploads/teams/mci.png"
      },
      "awayTeam": {
        "id": "uuid",
        "name": "Liverpool",
        "shortName": "LIV",
        "logoUrl": null
      },
      "matchTime": "2026-06-22T19:00:00.000Z",
      "status": "LIVE",
      "homeScore": 2,
      "awayScore": 1,
      "entryGold": "100.00",
      "participantCount": 15,
      "criteriaCount": 5
    }
  ],
  "total": 42,
  "page": 1,
  "pageSize": 20
}
```

**Sort order**: LIVE first → SCHEDULED (soonest `matchTime` first) → FINISHED (most recent `matchTime` first) → CANCELLED last.

---

## GET /api/v1/matches/:id

Get detailed match information including criteria, statistics, comments, and predictions (subject to visibility rules).

### Path Parameters

| Param | Type | Description |
|-------|------|-------------|
| id | UUID | Match ID |

### Headers (optional)

| Header | Description |
|--------|-------------|
| Authorization | `Bearer <JWT>` — when present, returns the user's own predictions on SCHEDULED matches |

### Response 200

```json
{
  "id": "uuid",
  "homeTeam": {
    "id": "uuid",
    "name": "Liverpool",
    "shortName": "LIV",
    "logoUrl": "/uploads/teams/liv.png"
  },
  "awayTeam": {
    "id": "uuid",
    "name": "Arsenal",
    "shortName": "ARS",
    "logoUrl": "/uploads/teams/ars.png"
  },
  "matchTime": "2026-06-22T19:00:00.000Z",
  "startDate": "2026-06-22T19:02:00.000Z",
  "endDate": null,
  "status": "LIVE",
  "homeScore": 2,
  "awayScore": 2,
  "entryGold": "100.00",
  "participantCount": 24,
  "goldPool": "2400.00",
  "criteria": [
    {
      "id": "uuid",
      "name": "Đội thắng trận",
      "description": "Dự đoán đội chiến thắng trong 90 phút",
      "resultTeam": null
    }
  ],
  "statistics": [
    {
      "criterionId": "uuid",
      "totalHomeVotes": 14,
      "totalAwayVotes": 10
    }
  ],
  "comments": [
    {
      "id": "uuid",
      "user": {
        "id": "uuid",
        "displayName": "Nguyen Van A"
      },
      "content": "Trận đấu hay quá!",
      "createdAt": "2026-06-22T19:30:00.000Z"
    }
  ],
  "predictions": [
    {
      "id": "uuid",
      "user": {
        "id": "uuid",
        "displayName": "Tran B"
      },
      "criterionId": "uuid",
      "selectedTeam": "HOME",
      "isCorrect": null
    }
  ]
}
```

**Prediction visibility**:
- Match `SCHEDULED`: `predictions` array contains only the requesting user's own predictions (requires JWT). Empty array for guests.
- Match `LIVE` or `FINISHED`: `predictions` array contains all users' predictions.
- Match `CANCELLED`: `predictions` array empty, all results voided.

### Response 404

```json
{
  "message": "Không tìm thấy trận đấu"
}
```
