# API Contracts: Admin Dashboard

**Base path**: `/api/v1/admin`
**Auth**: All endpoints require `authenticate` + `requireRole('ADMIN')`

## Enhanced Endpoints

### GET /admin/dashboard

Enhanced overview endpoint. Returns stats, recent admin logs, and traffic data.

**Query Parameters**:

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| from | string (ISO date) | no | none | Start of date range filter |
| to | string (ISO date) | no | none | End of date range filter |
| period | `24h` \| `7d` | no | `24h` | Traffic chart granularity |

**Response** `200 OK`:

```json
{
  "stats": {
    "users": 12482,
    "lockedUsers": 3,
    "teams": 40,
    "activeTeams": 38,
    "matches": 250,
    "liveOrScheduled": 12,
    "finishedMatches": 200,
    "predictions": 8400,
    "comments": 1500,
    "hiddenComments": 5,
    "totalGoldPool": "1200000.00"
  },
  "recentLogs": [
    {
      "id": "uuid",
      "adminId": "uuid",
      "action": "MATCH_SETTLE",
      "description": "Match ID #8821 Settled",
      "entityType": "Match",
      "entityId": "uuid",
      "status": "SUCCESS",
      "createdAt": "2026-06-26T14:22:15.000Z",
      "admin": {
        "id": "uuid",
        "displayName": "Admin_Mike"
      }
    }
  ],
  "traffic": [
    { "bucket": "2026-06-26T00:00:00.000Z", "count": 45 },
    { "bucket": "2026-06-26T01:00:00.000Z", "count": 62 }
  ]
}
```

### GET /admin/dashboard/export

Generates a CSV file of current dashboard data.

**Query Parameters**: Same as GET /admin/dashboard (`from`, `to`).

**Response** `200 OK`:
- Content-Type: `text/csv`
- Content-Disposition: `attachment; filename="dashboard-export-2026-06-26.csv"`

```csv
Metric,Value,Period
Total Active Users,12482,All Time
Locked Users,3,All Time
Total Teams,40,All Time
Active Teams,38,All Time
Total Matches,250,All Time
Live/Scheduled Matches,12,Current
Finished Matches,200,All Time
Total Predictions,8400,All Time
Total Comments,1500,All Time
Hidden Comments,5,All Time
Total Gold Pool (GP),1200000.00,All Time
```

## New Endpoints

### GET /admin/logs

Full admin activity log view (paginated). Linked from dashboard "View Full Logs".

**Query Parameters**:

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| page | number | no | 1 | Page number |
| pageSize | number | no | 20 | Items per page (max 100) |
| action | string | no | none | Filter by action type |
| from | string (ISO date) | no | none | Start date |
| to | string (ISO date) | no | none | End date |

**Response** `200 OK`:

```json
{
  "items": [
    {
      "id": "uuid",
      "adminId": "uuid",
      "action": "MATCH_SETTLE",
      "description": "Match ID #8821 Settled",
      "entityType": "Match",
      "entityId": "uuid",
      "status": "SUCCESS",
      "createdAt": "2026-06-26T14:22:15.000Z",
      "admin": {
        "id": "uuid",
        "displayName": "Admin_Mike"
      }
    }
  ],
  "total": 150,
  "page": 1,
  "pageSize": 20
}
```

## Admin Log Action Types

| Action | Trigger | Description Template |
|--------|---------|---------------------|
| `MATCH_CREATE` | Admin creates a match | "Trận đấu {homeTeam} vs {awayTeam} đã được tạo" |
| `MATCH_EDIT` | Admin edits match details | "Trận đấu #{id} đã được cập nhật" |
| `MATCH_SETTLE` | Admin settles/scores a match | "Trận đấu #{id} đã kết thúc — đã tính điểm" |
| `MATCH_CANCEL` | Admin cancels a match | "Trận đấu #{id} đã bị huỷ" |
| `CRITERIA_UPDATE` | Admin updates prediction criteria | "Tiêu chí dự đoán đã được cập nhật cho trận #{matchId}" |
| `USER_LOCK` | Admin locks a user | "Tài khoản {displayName} đã bị khoá" |
| `USER_UNLOCK` | Admin unlocks a user | "Tài khoản {displayName} đã được mở khoá" |
| `USER_ROLE_CHANGE` | Admin changes user role | "Vai trò {displayName} đã được thay đổi thành {role}" |

## Error Responses

All endpoints follow the existing ApiError pattern:

```json
{
  "message": "Error description",
  "statusCode": 401
}
```

| Status | Condition |
|--------|-----------|
| 401 | Not authenticated |
| 403 | Not ADMIN role |
| 400 | Invalid query parameters (Zod validation) |
| 500 | Internal server error |
