# Data Model: Match Comments (UC08)

## Schema Status: No Migration Required

The `Comment` entity and `CommentStatus` enum are already in `backend/prisma/schema.prisma`.
The table, indexes, and foreign keys are production-ready.

---

## Comment Entity (existing)

```prisma
model Comment {
  id        String        @id @default(uuid()) @db.Uuid
  matchId   String        @map("match_id") @db.Uuid
  userId    String        @map("user_id") @db.Uuid
  content   String        // 1..1000 chars, validated at app layer
  status    CommentStatus @default(VISIBLE)
  createdAt DateTime      @default(now()) @map("created_at")

  match Match @relation(fields: [matchId], references: [id])
  user  User  @relation(fields: [userId], references: [id])

  @@index([matchId])
  @@index([userId])
  @@map("comments")
}
```

## CommentStatus Enum (existing)

| Value   | Meaning                                                         |
|---------|-----------------------------------------------------------------|
| VISIBLE | Publicly visible (default on creation)                         |
| HIDDEN  | Hidden by Admin — not shown in public lists                    |
| DELETED | Permanently removed by Admin — not shown anywhere               |

## State Transitions

```
[Draft in form] → POST /matches/:matchId/comments
  → validation passes → DB insert → VISIBLE
  → validation fails  → 400 (not persisted)
  → rate-limited      → 429 (not persisted)

VISIBLE → Admin PATCH /admin/comments/:id/status { status: "HIDDEN" }  → HIDDEN
VISIBLE → Admin PATCH /admin/comments/:id/status { status: "DELETED" } → DELETED
HIDDEN  → Admin PATCH /admin/comments/:id/status { status: "VISIBLE" } → VISIBLE (restore)
```

## Rate-Limit State (in-memory, not persisted)

Maintained in `ModerationService` as a `Map<userId, RateEntry>`:

```ts
interface RateEntry {
  count: number;   // comments in current 60-second window
  window: number;  // epoch ms when window started
  lastAt: number;  // epoch ms of most recent comment
}
```

Rules enforced:
- `count >= 5` within `window` → 429 ("Quá nhiều bình luận trong 1 phút")
- `now - lastAt < 10_000` → 429 ("Vui lòng chờ trước khi bình luận tiếp")

## Content Validation Rules

| Rule      | Constraint                                     | Error          |
|-----------|------------------------------------------------|----------------|
| Non-empty | `content.trim().length >= 1`                   | 400            |
| Max length| `content.trim().length <= 1000`                | 400            |
| Banned    | No substring from `BANNED_WORDS` set (case-insensitive) | 400   |
| Match     | `matchId` must reference existing Match row    | 404            |

## Relationships (existing, no change)

- `Comment` belongs to one `Match` (by `matchId`)
- `Comment` belongs to one `User` (by `userId`)
- `Match.comments` — one-to-many (already defined)
- `User.comments`  — one-to-many (already defined)

## Public Read Shape

Comments returned in `GET /matches/:id` response:

```jsonc
{
  "comments": [
    {
      "id": "uuid",
      "user": { "id": "uuid", "displayName": "Nguyen Van A" },
      "content": "Trận hay quá!",
      "createdAt": "2026-06-23T10:30:00.000Z"
    }
  ]
}
```

Only `status = VISIBLE` comments are included. Ordered by `createdAt ASC`.
