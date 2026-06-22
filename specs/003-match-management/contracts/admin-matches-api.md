# API Contract: Admin Match Management

**Base path**: `/api/v1/admin/matches`
**Auth**: All endpoints require `authenticate` + `requireRole('ADMIN')`

## Endpoints

### GET /matches

List matches with optional filtering and pagination.

**Query params**:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| status | string? | — | Filter by MatchStatus (SCHEDULED, LIVE, FINISHED, CANCELLED, POSTPONED) |
| sortOrder | string? | desc | Sort by matchTime: `asc` or `desc` |
| page | int | 1 | Page number (≥ 1) |
| pageSize | int | 20 | Items per page (1–100) |

**Response** `200`:
```json
{
  "items": [
    {
      "id": "uuid",
      "homeTeamId": "uuid",
      "awayTeamId": "uuid",
      "matchTime": "ISO8601",
      "status": "SCHEDULED",
      "homeScore": null,
      "awayScore": null,
      "entryGold": "100.00",
      "externalId": null,
      "createdAt": "ISO8601",
      "homeTeam": { "id": "uuid", "name": "Team A", "shortName": "TA", "logoUrl": null },
      "awayTeam": { "id": "uuid", "name": "Team B", "shortName": "TB", "logoUrl": null },
      "_count": { "predictions": 0, "comments": 0, "criteria": 3, "participations": 0 }
    }
  ],
  "total": 42,
  "page": 1,
  "pageSize": 20
}
```

### POST /matches

Create a new match.

**Body**:
```json
{
  "homeTeamId": "uuid (required)",
  "awayTeamId": "uuid (required, must differ from homeTeamId)",
  "matchTime": "ISO8601 (required)",
  "entryGold": 100
}
```

**Response** `201`: Match object
**Errors**: `400` if same teams, missing fields, invalid team ID, inactive team, or negative entryGold

### GET /matches/:id

Get match detail with criteria and participations.

**Response** `200`:
```json
{
  "...match fields...",
  "homeTeam": { "..." },
  "awayTeam": { "..." },
  "criteria": [
    { "id": "uuid", "matchId": "uuid", "name": "...", "resultTeam": "HOME", "source": "MANUAL" }
  ],
  "participations": [
    { "id": "uuid", "userId": "uuid", "score": 3, "isWinner": true, "goldWon": "150.00" }
  ]
}
```
**Errors**: `404` if match not found

### PATCH /matches/:id

Update a SCHEDULED match.

**Body** (all optional):
```json
{
  "homeTeamId": "uuid",
  "awayTeamId": "uuid",
  "matchTime": "ISO8601",
  "entryGold": 100
}
```

**Response** `200`: Updated match
**Errors**: `400` if match not SCHEDULED and touching core fields (BR09), same teams (BR08)

### PUT /matches/:id/result

**Two-step process**: Admin must first set all criterion results via `PUT /matches/criteria/:criterionId/result`, then call this endpoint to submit scores and trigger scoring.

**Body**:
```json
{
  "homeScore": 2,
  "awayScore": 1
}
```

**Response** `200` (ScoringSummary):
```json
{
  "scored": true,
  "participantCount": 10,
  "winnerCount": 3,
  "pool": "1000.00",
  "goldPerWinner": "333.33",
  "leaderboardEligible": true
}
```
**Errors**:
- `400` if match is CANCELLED
- `400` if any criteria lack a resultTeam (NEW — two-step validation)
- `200` with `scored: false` if already scored (idempotent)

### PUT /matches/criteria/:criterionId/result

Set the result for a single criterion.

**Body**:
```json
{
  "resultTeam": "HOME"
}
```

**Response** `200`: Updated criterion
**Errors**: `404` if criterion not found

### POST /matches/:id/cancel

Cancel a match. Voids participations, sends MATCH_CANCELLED notifications.

**Response** `200`: `{ "message": "Đã huỷ trận đấu" }`
**Errors**: `404` if not found

### DELETE /matches/:id

Delete or cancel a match. If match has related data → cancels instead of deleting (BR23).

**Response** `200`: `{ "deleted": true }` or `{ "deleted": false }` (cancelled instead)

---

## Admin Criteria API

**Base path**: `/api/v1/admin/criteria`

### GET /criteria/match/:matchId

List criteria for a match.

**Response** `200`: Array of PredictionCriterion objects

### POST /criteria/match/:matchId

Create a criterion for a SCHEDULED match.

**Body**:
```json
{
  "name": "Đội ghi bàn trước (required)",
  "description": "optional",
  "source": "MANUAL (optional, default MANUAL)"
}
```

**Response** `201`: Criterion object
**Errors**: `400` if match not SCHEDULED (fairness lock), `404` if match not found

### PATCH /criteria/:id

Update a criterion (match must be SCHEDULED).

**Body** (all optional):
```json
{
  "name": "...",
  "description": "...",
  "source": "MANUAL"
}
```

**Response** `200`: Updated criterion
**Errors**: `400` if match locked

### DELETE /criteria/:id

Delete a criterion (match must be SCHEDULED, no existing predictions).

**Response** `200`
**Errors**: `400` if match locked, `409` if criterion has predictions
