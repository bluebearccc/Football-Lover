# Contract: Profile & Admin Support Endpoints (UC10)

All four endpoints already exist in the backend and are unchanged by this feature except for
the `stats` filtering noted in [data-model.md](../data-model.md). This document exists so the
new Admin frontend work (the only net-new consumer) has a single source of truth for the
contract it must call.

## Self-service (Registered User)

### `GET /api/v1/profile/me`

- **Auth**: `authenticate` (Bearer JWT). Returns the caller's own data only — no `:id` param.
- **Response 200**:
  ```json
  {
    "user": { "id": "string", "email": "string", "displayName": "string", "totalPoints": 0, "createdAt": "ISO-8601", "lastActiveAt": "ISO-8601 | null" },
    "stats": { "totalMatches": 0, "totalWins": 0, "accuracy": 0.0, "totalGoldWon": "0.00" },
    "monthlyRank": { "rank": 0, "winCount": 0, "month": 1, "year": 2026 }
  }
  ```
  - `stats.accuracy` is `number | null` (null when no graded predictions yet — FR-008).
  - `monthlyRank` is `null` when the user is unranked for the current month.
- **Errors**: `401` if not authenticated (FR-003).

### `GET /api/v1/profile/history?page=&pageSize=`

- **Auth**: `authenticate`. Returns the caller's own history only.
- **Query**: `page` (int, default 1, min 1), `pageSize` (int, default 20, min 1, max 100).
- **Response 200**:
  ```json
  {
    "items": [
      {
        "id": "string", "matchId": "string",
        "homeTeam": { "id": "string", "name": "string", "shortName": "string", "logoUrl": "string | null" },
        "awayTeam": { "id": "string", "name": "string", "shortName": "string", "logoUrl": "string | null" },
        "matchTime": "ISO-8601", "homeScore": 0, "awayScore": 0,
        "status": "SCHEDULED | LIVE | FINISHED | CANCELLED | POSTPONED",
        "score": 0, "isWinner": true, "goldWon": "0.00"
      }
    ],
    "total": 0, "page": 1, "pageSize": 20
  }
  ```
- **Errors**: `401` if not authenticated.

## Admin support view (read-only) — net-new frontend consumer in this feature

### `GET /api/v1/admin/users/:id/profile`

- **Auth**: `authenticate` + `requireRole('ADMIN')` (enforced at `admin.routes.ts`).
- **Path param**: `id` — target user ID.
- **Response 200**: identical shape to `GET /profile/me` above, for the target user
  (FR-006 — same data shape, no Admin-specific fields).
- **Errors**: `401` not authenticated, `403` not Admin, `404` if `id` does not exist (FR-009).

### `GET /api/v1/admin/users/:id/history?page=&pageSize=`

- **Auth**: `authenticate` + `requireRole('ADMIN')`.
- **Path param**: `id` — target user ID.
- **Query/Response**: identical shape to `GET /profile/history` above, for the target user.
- **Errors**: `401`, `403`, `404` as above.

## Frontend client methods to add (`frontend/src/api/admin/users.ts`)

```ts
getProfile(id: string): Promise<ProfileResponse>
getHistory(id: string, params?: { page?: number; pageSize?: number }): Promise<HistoryResponse>
```

Reuse the `ProfileResponse` / `HistoryResponse` / `HistoryEntry` types already exported from
`frontend/src/api/profile.ts` — do not redeclare a parallel type for the Admin client, per
FR-006's "no separate data shape" rule.
