# Data Model: Team Management (UC13)

## Existing Entities (already in schema.prisma)

### Team

| Field       | Type     | Constraints                          | Notes                              |
|-------------|----------|--------------------------------------|------------------------------------|
| id          | UUID     | PK, auto-generated                   |                                    |
| name        | String   | NOT NULL                             | Unique among active teams (app-level) |
| shortName   | String?  | Optional, max 20 chars               | DB column: `short_name`            |
| logoUrl     | String?  | Optional, valid URL                  | DB column: `logo_url`. Null → default image in FE |
| externalId  | String?  | UNIQUE                               | DB column: `external_id`. api-football team ID |
| isActive    | Boolean  | Default: true                        | DB column: `is_active`. Soft-delete flag |
| createdAt   | DateTime | Auto                                 | DB column: `created_at`            |

**Relations**: `players` (1:N → Player), `homeMatches` / `awayMatches` (1:N → Match)
**Index**: `name`

### Player

| Field       | Type     | Constraints                          | Notes                              |
|-------------|----------|--------------------------------------|------------------------------------|
| id          | UUID     | PK, auto-generated                   |                                    |
| teamId      | UUID     | FK → Team.id, NOT NULL               | DB column: `team_id`               |
| name        | String   | NOT NULL                             |                                    |
| position    | String?  | Optional                             |                                    |
| imageUrl    | String?  | Optional, valid URL                  | DB column: `image_url`. Null → default avatar in FE |
| externalId  | String?  | UNIQUE                               | DB column: `external_id`. api-football player ID |
| createdAt   | DateTime | Auto                                 | DB column: `created_at`            |

**Relations**: `team` (N:1 → Team)
**Index**: `teamId`

## Schema Changes Required

No schema migration needed — `Team` and `Player` models already exist in `backend/prisma/schema.prisma` with all required fields.

## State Transitions

```
[Create] → Active
Active → Active       (edit / sync update / reactivate)
Active → Inactive     (deactivate — when referenced by match)
Inactive → Active     (reactivate via isActive=true update)
Active → [Deleted]    (only if NOT referenced by any match)
Inactive → [Deleted]  (only if NOT referenced by any match)
```

## Validation Rules

| Rule                         | Scope         | Implementation                    |
|------------------------------|---------------|-----------------------------------|
| Name required, 1-100 chars   | Create/Update | Zod DTO (already exists)          |
| Short name max 20 chars      | Create/Update | Zod DTO (already exists)          |
| Logo URL must be valid URL   | Create/Update | Zod DTO (already exists)          |
| Name unique among active     | Create        | Service-level check (TO ADD)      |
| No hard-delete if referenced | Delete        | Service-level check (exists)      |
| External ID unique           | Create/Sync   | DB unique constraint (exists)     |

## Sync Data Mapping (api-football → local)

| api-football field       | Local field         | Behavior on conflict            |
|--------------------------|---------------------|---------------------------------|
| `team.id`                | `Team.externalId`   | Match key for upsert            |
| `team.name`              | `Team.name`         | Set on create only; never overwrite existing |
| `team.code`              | `Team.shortName`    | Set on create only; never overwrite existing |
| `team.logo`              | `Team.logoUrl`      | Always update (low-value field)  |
| `player.id`              | `Player.externalId` | Match key for upsert            |
| `player.name`            | `Player.name`       | Always update from source        |
| `player.position`        | `Player.position`   | Always update from source        |
| `player.photo`           | `Player.imageUrl`   | Always update from source        |
