# Data Model: Prediction Criteria Management

## Entity: PredictionCriterion

### Current Schema (schema.prisma lines 160–176)

```
model PredictionCriterion {
  id          String          @id @default(uuid()) @db.Uuid
  matchId     String          @map("match_id") @db.Uuid
  name        String
  description String?
  resultTeam  TeamSide?       @map("result_team")
  resolvedAt  DateTime?       @map("resolved_at")
  source      CriterionSource @default(MANUAL)
  isActive    Boolean         @default(true) @map("is_active")

  match       Match        @relation(fields: [matchId], references: [id])
  predictions Prediction[]
  statistics  Statistic[]

  @@index([matchId])
  @@map("prediction_criteria")
}
```

### Required Change

Add `createdAt` field for creation-order sorting:

```diff
  isActive    Boolean         @default(true) @map("is_active")
+ createdAt   DateTime        @default(now()) @map("created_at")
```

**Migration name**: `add_criterion_created_at`

### Field Definitions

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID | Yes | auto-generated | Primary key |
| matchId | UUID (FK → Match) | Yes | — | Parent match |
| name | String | Yes (1–120 chars) | — | Criterion display name (Vietnamese) |
| description | String | No (max 500 chars) | null | Optional detail text |
| resultTeam | TeamSide? (HOME/AWAY) | No | null | Actual outcome, set when match FINISHED |
| resolvedAt | DateTime? | No | null | Timestamp when result was set |
| source | CriterionSource (MANUAL/SCRAPED) | Yes | MANUAL | Origin of the criterion |
| isActive | Boolean | Yes | true | Soft-delete flag; false = deactivated |
| createdAt | DateTime | Yes | now() | Creation timestamp for display ordering |

### Validation Rules (Zod DTOs)

**Create** (`createCriterionSchema`):
- `name`: string, trimmed, min 1, max 120
- `description`: string, trimmed, max 500, optional
- `source`: CriterionSource enum, optional (defaults to MANUAL)

**Update** (`updateCriterionSchema`):
- All fields from create, all optional (partial)

**Set Result** (`setCriterionResultSchema`):
- `resultTeam`: TeamSide enum (HOME or AWAY), required

### State Transitions

```
[Created] → Active (isActive=true, resultTeam=null)
Active → Updated (name/description edited, match still SCHEDULED)
Active → Inactive (isActive=false, Admin deactivates while SCHEDULED)
Inactive → Active (Admin reactivates while SCHEDULED)
Active → Locked (match status leaves SCHEDULED — no further edits)
Locked → Resolved (resultTeam set when match FINISHED)
```

**Lock rule**: All mutations (create, edit, deactivate, reactivate) require `match.status === 'SCHEDULED'`. Setting resultTeam requires `match.status === 'FINISHED'`.

### Relationships

- **Match → PredictionCriterion**: One-to-many. A match has 0..n criteria.
- **PredictionCriterion → Prediction**: One-to-many. Each criterion has 0..n predictions (one per user, enforced by `@@unique([userId, criterionId])`).
- **PredictionCriterion → Statistic**: One-to-one per match (enforced by `@@unique([matchId, criterionId])` on Statistic). Tracks aggregated HOME/AWAY vote counts.

### Related Entities (unchanged)

- **Prediction**: `selectedTeam` (HOME/AWAY) for a criterion. `isCorrect` scored when match FINISHED by comparing to criterion's `resultTeam`.
- **Statistic**: `totalHomeVotes` / `totalAwayVotes` per criterion per match.
- **Match**: Parent entity. `status` field gates criteria mutability.
