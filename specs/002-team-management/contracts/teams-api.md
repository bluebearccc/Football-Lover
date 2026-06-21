# API Contract: Team Management (UC13)

Base path: `/api/v1/admin/teams`
Auth: JWT + ADMIN role required on all endpoints.

## Existing Endpoints (already implemented)

### GET /api/v1/admin/teams
List teams with pagination, search, and active filter.

**Query params**:
| Param    | Type   | Default | Description                    |
|----------|--------|---------|--------------------------------|
| search   | string | —       | Filter by name (case-insensitive contains) |
| active   | "true" / "false" | — | Filter by active status      |
| page     | number | 1       | Page number (1-based)          |
| pageSize | number | 20      | Items per page (1-100)         |

**Response** `200`: `{ items: Team[], total: number, page: number, pageSize: number }`

### GET /api/v1/admin/teams/:id
Get team by ID with player roster.

**Response** `200`: `TeamWithPlayers`
**Response** `404`: `{ message: "Không tìm thấy đội bóng" }`

### POST /api/v1/admin/teams
Create a new team.

**Body**: `{ name: string, shortName?: string, logoUrl?: string, externalId?: string }`
**Response** `201`: `Team`
**Response** `400`: validation error
**Response** `409`: duplicate name or external_id

### PATCH /api/v1/admin/teams/:id
Update a team.

**Body**: `{ name?: string, shortName?: string, logoUrl?: string, externalId?: string, isActive?: boolean }`
**Response** `200`: `Team`
**Response** `404`: team not found

### DELETE /api/v1/admin/teams/:id
Delete or deactivate a team.

**Response** `200`: `{ deleted: boolean, team?: Team }`
- `deleted: true` — team was permanently removed (no match references)
- `deleted: false, team: {...}` — team was deactivated (referenced by matches)

### POST /api/v1/admin/teams/:id/players
Add a player to a team.

**Body**: `{ name: string, position?: string, imageUrl?: string, externalId?: string }`
**Response** `201`: `Player`

### PATCH /api/v1/admin/teams/:id/players/:playerId
Update a player.

**Body**: `{ name?: string, position?: string, imageUrl?: string, externalId?: string }`
**Response** `200`: `Player`

### DELETE /api/v1/admin/teams/:id/players/:playerId
Remove a player.

**Response** `204`: No content

## New Endpoints (to implement)

### POST /api/v1/admin/teams/sync
Sync teams and players from api-football for a specific league.

**Body**: `{ leagueId: number, season?: number }`
- `leagueId` — api-football league ID (required)
- `season` — year (defaults to current year if omitted)

**Response** `200`:
```json
{
  "triggeredAt": "2026-06-21T10:00:00Z",
  "provider": "api-football",
  "leagueId": 39,
  "season": 2026,
  "teams": { "created": 2, "updated": 18, "unchanged": 0 },
  "players": { "created": 150, "updated": 350, "unchanged": 0 },
  "note": "Đồng bộ hoàn tất"
}
```

**Response** `400`: API key not configured or invalid league ID
**Response** `502`: api-football provider unavailable

## Shared Types

```typescript
interface Team {
  id: string;
  name: string;
  shortName: string | null;
  logoUrl: string | null;
  externalId: string | null;
  isActive: boolean;
  createdAt: string;
  _count?: { players: number };
}

interface Player {
  id: string;
  teamId: string;
  name: string;
  position: string | null;
  imageUrl: string | null;
  externalId: string | null;
}

interface TeamWithPlayers extends Team {
  players: Player[];
}

interface SyncResult {
  triggeredAt: string;
  provider: 'api-football';
  leagueId: number;
  season: number;
  teams: { created: number; updated: number; unchanged: number };
  players: { created: number; updated: number; unchanged: number };
  note: string;
}
```
