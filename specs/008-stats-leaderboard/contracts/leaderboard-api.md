# API Contract: Leaderboard (UC09)

Base: `/api/v1/leaderboard`

## GET /api/v1/leaderboard

Returns paginated monthly leaderboard rankings.

**Auth**: None required (public endpoint).

### Query Parameters

| Param | Type | Default | Constraints | Description |
|-------|------|---------|-------------|-------------|
| month | int | current month | 1–12 | Calendar month (Asia/Ho_Chi_Minh) |
| year | int | current year | 2000–2100 | Calendar year |
| page | int | 1 | ≥ 1 | Page number |
| pageSize | int | 20 | 1–100 | Results per page |

### Response 200

```json
{
  "month": 6,
  "year": 2026,
  "timezone": "Asia/Ho_Chi_Minh",
  "rankings": [
    {
      "rank": 1,
      "userId": "uuid",
      "displayName": "EliteKicker99",
      "winCount": 8,
      "totalPoints": 15820,
      "accuracy": 0.82,
      "winStreak": 3
    }
  ],
  "total": 45,
  "page": 1,
  "pageSize": 20
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| rank | int | Dense rank by winCount DESC, accuracy DESC tiebreaker |
| userId | string (UUID) | User identifier |
| displayName | string | User display name |
| winCount | int | Matches won this month (only matches with ≥ 2 participants) |
| totalPoints | int | All-time total points |
| accuracy | float | Ratio of correct criteria to total scored criteria (0.0–1.0); null if no scored predictions |
| winStreak | int | Current all-time consecutive match wins (0 if none) |
| total | int | Total number of ranked users this month |
| page | int | Current page |
| pageSize | int | Page size |

### Error Responses

| Status | Condition | Body |
|--------|-----------|------|
| 400 | Invalid month/year/page/pageSize | `{ "message": "Tháng hoặc năm không hợp lệ" }` |

---

## GET /api/v1/leaderboard/me

Returns the current user's rank and stats for the requested month.

**Auth**: Required (JWT Bearer token).

### Query Parameters

Same as `GET /api/v1/leaderboard` (month, year only).

### Response 200

```json
{
  "rank": 124,
  "userId": "uuid",
  "displayName": "Alex Rivera",
  "winCount": 2,
  "totalPoints": 1280,
  "accuracy": 0.68,
  "winStreak": 2
}
```

Returns `null` for rank fields if user has no participations this month.

### Error Responses

| Status | Condition | Body |
|--------|-----------|------|
| 401 | Not authenticated | `{ "message": "Yêu cầu đăng nhập" }` |

---

## Match Statistics (existing endpoint, behavior change)

### GET /api/v1/matches/:id

**Behavior change**: When match status is `SCHEDULED`, the `statistics` array in the response MUST be returned as empty `[]` regardless of actual data, to prevent pre-kickoff vote count exposure (BR21/BR22).

| Match Status | `statistics` field |
|-------------|-------------------|
| SCHEDULED | `[]` (hidden) |
| LIVE | Actual vote counts |
| FINISHED | Actual vote counts |
| CANCELLED | Actual vote counts |
| POSTPONED | `[]` (hidden) |
