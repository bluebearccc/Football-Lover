# API Contracts: Gold Scoring & Payout

**Date**: 2026-06-23 | **Feature**: 006-gold-scoring

## Existing Endpoints (modifications only)

### PUT /api/v1/admin/matches/:id/result

**Auth**: `authenticate` + `requireRole('ADMIN')`

Triggers scoring workflow after setting official match scores. Blocks if any criteria lack `resultTeam`.

**Request Body** (existing, no change):
```json
{
  "homeScore": 2,
  "awayScore": 1
}
```

**Response 200** (ScoringSummary):
```json
{
  "scored": true,
  "participantCount": 5,
  "winnerCount": 2,
  "pool": "500.00",
  "goldPerWinner": "250.00",
  "leaderboardEligible": true
}
```

**Response 200** (already scored — idempotent):
```json
{
  "scored": false,
  "reason": "Trận đã được tính điểm trước đó",
  "participantCount": 0,
  "winnerCount": 0,
  "pool": "0.00",
  "goldPerWinner": "0.00",
  "leaderboardEligible": false
}
```

**Response 400** (unresolved criteria):
```json
{
  "statusCode": 400,
  "message": "Chưa có kết quả cho các tiêu chí: Đội ghi bàn trước, Tổng số bàn thắng. Vui lòng đặt kết quả tất cả tiêu chí trước khi chốt."
}
```

### POST /api/v1/admin/matches/:id/cancel

**Auth**: `authenticate` + `requireRole('ADMIN')`

Cancels a match (including previously Finished). Voids all scoring results and totalPoints.

**Response 200**:
```json
{
  "message": "Đã huỷ trận đấu"
}
```

## New Endpoints

### GET /api/v1/leaderboard

**Auth**: None (public)

Returns the monthly win-count leaderboard. Only includes wins from matches with ≥ 2 participants.

**Query Parameters**:
| Param | Type   | Default       | Description                          |
|-------|--------|---------------|--------------------------------------|
| month | number | current month | Month (1–12)                         |
| year  | number | current year  | Year (e.g. 2026)                     |
| limit | number | 20            | Max results (1–100)                  |

**Response 200**:
```json
{
  "month": 6,
  "year": 2026,
  "timezone": "Asia/Ho_Chi_Minh",
  "rankings": [
    {
      "rank": 1,
      "userId": "uuid",
      "displayName": "Nguyễn Văn A",
      "winCount": 5,
      "totalPoints": 42
    },
    {
      "rank": 2,
      "userId": "uuid",
      "displayName": "Trần Thị B",
      "winCount": 3,
      "totalPoints": 28
    }
  ]
}
```

**Response 400** (invalid month/year):
```json
{
  "statusCode": 400,
  "message": "Tháng hoặc năm không hợp lệ"
}
```

### GET /api/v1/matches/:id/results

**Auth**: None (public, match must be FINISHED)

Returns scoring results for a specific match (participant scores, winners, gold).

**Response 200**:
```json
{
  "matchId": "uuid",
  "status": "FINISHED",
  "entryGold": "100.00",
  "pool": "500.00",
  "participantCount": 5,
  "winnerCount": 2,
  "goldPerWinner": "250.00",
  "participants": [
    {
      "userId": "uuid",
      "displayName": "Nguyễn Văn A",
      "score": 3,
      "isWinner": true,
      "goldWon": "250.00"
    },
    {
      "userId": "uuid",
      "displayName": "Trần Thị B",
      "score": 3,
      "isWinner": true,
      "goldWon": "250.00"
    },
    {
      "userId": "uuid",
      "displayName": "Lê Văn C",
      "score": 1,
      "isWinner": false,
      "goldWon": "0.00"
    }
  ]
}
```

**Response 404** (match not found or not FINISHED):
```json
{
  "statusCode": 404,
  "message": "Không tìm thấy kết quả trận đấu"
}
```
