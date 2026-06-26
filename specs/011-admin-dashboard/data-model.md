# Data Model: Admin Dashboard

**Feature**: 011-admin-dashboard | **Date**: 2026-06-26

## New Entity: AdminLog

Records admin-triggered actions for the dashboard's "Recent System Logs" table. 90-day retention.

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Unique identifier |
| adminId | UUID | FK → User.id, required | Admin who performed the action |
| action | String | required | Action type identifier (e.g., `MATCH_CREATE`, `MATCH_EDIT`, `MATCH_SETTLE`, `CRITERIA_UPDATE`, `USER_LOCK`, `USER_UNLOCK`) |
| description | String | required | Human-readable event description (e.g., "Match ID #8821 Settled") |
| entityType | String | optional | Related entity type (`Match`, `PredictionCriterion`, `User`) |
| entityId | String (UUID) | optional | Related entity ID |
| status | String | required, default `SUCCESS` | Outcome: `SUCCESS`, `WARNING`, `FAILED` |
| createdAt | DateTime | auto, default now() | Timestamp of the action |

### Indexes

- `adminId` — for filtering by admin
- `createdAt` — for time-based queries and retention cleanup
- `action` — for filtering by action type

### Relationships

- `AdminLog.adminId` → `User.id` (many-to-one): each log entry belongs to the admin who performed it
- `User` gains a `adminLogs AdminLog[]` reverse relation

### Prisma Schema Addition

```prisma
model AdminLog {
  id          String   @id @default(uuid()) @db.Uuid
  adminId     String   @map("admin_id") @db.Uuid
  action      String   // MATCH_CREATE, MATCH_EDIT, MATCH_SETTLE, CRITERIA_UPDATE, USER_LOCK, USER_UNLOCK
  description String
  entityType  String?  @map("entity_type") // Match, PredictionCriterion, User
  entityId    String?  @map("entity_id") @db.Uuid
  status      String   @default("SUCCESS") // SUCCESS, WARNING, FAILED
  createdAt   DateTime @default(now()) @map("created_at")

  admin User @relation(fields: [adminId], references: [id])

  @@index([adminId])
  @@index([createdAt])
  @@index([action])
  @@map("admin_logs")
}
```

### Validation Rules

- `action` must be one of the defined action type strings
- `description` max 500 characters
- `entityType` when present must be a valid model name
- `status` must be one of: `SUCCESS`, `WARNING`, `FAILED`

### State Transitions

AdminLog entries are immutable — once created, they are never updated. They are only deleted by the 90-day retention cleanup.

### Retention

- Entries older than 90 days from `createdAt` are automatically pruned
- Cleanup can be triggered on each read (lazy) or via a scheduled cleanup call

## Enhanced Queries on Existing Entities

### Dashboard Stats (enhanced)

Current `dashboardService.stats()` returns user/match/prediction/comment counts. Enhancement:

- **Add gold pool total**: `SUM(match_participations.gold_won)` across all MatchParticipation records
- **Add gold pool with date filter**: filter by `MatchParticipation.createdAt` within date range

### Traffic Chart Data (new query)

Aggregates from `Prediction` table:
- **24h view**: `COUNT(predictions.id) GROUP BY DATE_TRUNC('hour', predictions.created_at)` for last 24 hours
- **7d view**: `COUNT(predictions.id) GROUP BY DATE_TRUNC('day', predictions.created_at)` for last 7 days
- Returns: array of `{ bucket: string (ISO), count: number }`

### Platform Stats Panel (existing, restructured)

Keeps the current platform stats (active teams ratio, finished matches ratio, account safety, comment health) since League entity doesn't exist yet. No new queries needed — same aggregations already in `dashboardService.stats()`.

## Entity Relationship Summary

```
User (existing)
  ├── 1:N → AdminLog (new)
  ├── 1:N → Prediction (existing, used for traffic chart)
  └── 1:N → MatchParticipation (existing, used for gold total)

Match (existing)
  ├── 1:N → Prediction (existing, used for traffic chart)
  └── 1:N → MatchParticipation (existing, used for gold total)

AdminLog (new)
  └── N:1 → User (admin who performed the action)
```
