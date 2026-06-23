# API Contract: Admin Criteria Management

Base path: `/api/v1/admin/criteria` (requires `authenticate + requireRole('ADMIN')`)

## Existing Endpoints (no changes)

### GET /match/:matchId
List all criteria for a match (including inactive, for admin view).

**Response 200**:
```json
{
  "items": [
    {
      "id": "uuid",
      "matchId": "uuid",
      "name": "Đội ghi bàn trước",
      "description": null,
      "resultTeam": null,
      "resolvedAt": null,
      "source": "MANUAL",
      "isActive": true,
      "createdAt": "2026-06-23T10:00:00.000Z"
    }
  ]
}
```

### POST /match/:matchId
Create a new criterion for a match.

**Request body** (validated by `createCriterionSchema`):
```json
{
  "name": "Đội ghi bàn trước",
  "description": "Đội nào ghi bàn thắng đầu tiên trong trận",
  "source": "MANUAL"
}
```

**Response 201**: Created criterion object.
**Error 400**: Match is not SCHEDULED.
**Error 404**: Match not found.

### PATCH /:id
Update criterion name/description.

**Request body** (validated by `updateCriterionSchema`, all fields optional):
```json
{
  "name": "Đội ghi bàn trước (updated)",
  "description": "Mô tả mới"
}
```

**Response 200**: Updated criterion object.
**Error 400**: Match is not SCHEDULED.
**Error 404**: Criterion not found.

### DELETE /:id
Hard-delete a criterion (only if no predictions exist and match is SCHEDULED).

**Response 204**: No content.
**Error 400**: Match is not SCHEDULED.
**Error 404**: Criterion not found.
**Error 409**: Criterion has predictions — cannot delete.

### POST /:id/deactivate
Soft-delete (set `isActive: false`). **Change**: Now requires match status = SCHEDULED.

**Response 200**: Updated criterion object with `isActive: false`.
**Error 400**: Match is not SCHEDULED (NEW — previously no check).
**Error 404**: Criterion not found.

## New Endpoint

### POST /:id/reactivate
Restore a deactivated criterion (set `isActive: true`). Requires match status = SCHEDULED.

**Response 200**: Updated criterion object with `isActive: true`.
**Error 400**: Match is not SCHEDULED.
**Error 400**: Criterion is already active.
**Error 404**: Criterion not found.

## Existing Endpoint (in matches module, no changes)

### PUT /api/v1/admin/matches/criteria/:criterionId/result
Set the actual result for a criterion after match finishes.

**Request body** (validated by `setCriterionResultSchema`):
```json
{
  "resultTeam": "HOME"
}
```

**Response 200**: Updated criterion object with `resultTeam` and `resolvedAt` set.

## Public API (no changes needed)

### GET /api/v1/matches/:id
Returns match detail including criteria (already filters `isActive: true`). Ordering change from `name: 'asc'` to `createdAt: 'asc'` is a repository-level fix, no API contract change.
