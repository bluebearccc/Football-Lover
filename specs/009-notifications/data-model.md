# Data Model: Win/Lose Notifications (009)

**Date**: 2026-06-26

## Existing Entity: Notification

The `Notification` model already exists in `backend/prisma/schema.prisma` (line 258–273). **No schema migration needed.**

```
model Notification {
  id        String           @id @default(uuid()) @db.Uuid
  userId    String           @map("user_id") @db.Uuid
  type      NotificationType
  title     String
  body      String?
  matchId   String?          @map("match_id") @db.Uuid
  isRead    Boolean          @default(false) @map("is_read")
  createdAt DateTime         @default(now()) @map("created_at")

  user  User   @relation(fields: [userId], references: [id])
  match Match? @relation(fields: [matchId], references: [id])

  @@index([userId, isRead])
  @@map("notifications")
}
```

### Enum: NotificationType

```
enum NotificationType {
  MATCH_WON
  MATCH_LOST
  MATCH_CANCELLED
}
```

## Field Details

| Field     | Purpose                                | Constraints                     |
|-----------|----------------------------------------|---------------------------------|
| id        | Primary key                            | UUID, auto-generated            |
| userId    | Owner of this notification             | FK → User.id, required          |
| type      | Notification category                  | Enum: WON / LOST / CANCELLED   |
| title     | Short headline                         | Required string                 |
| body      | Detailed message with gold/score info  | Optional string                 |
| matchId   | Related match for click-through        | FK → Match.id, optional         |
| isRead    | Read/unread state                      | Boolean, default false          |
| createdAt | Creation timestamp                     | Auto-set, used for ordering     |

## Indexes

- `@@index([userId, isRead])` — supports efficient queries for "my unread notifications" and unread count.

## State Transitions

```
[Created] → Unread (isRead = false)
Unread → Read (isRead = true)  — via mark-read or click-through
```

Read state is terminal — notifications cannot return to unread (per clarification: no deletion either).

## Relationships

- **User → Notification**: One-to-many. Each user has zero or more notifications.
- **Match → Notification**: One-to-many (optional). A notification may reference the match it pertains to. Used for click-through navigation.

## Write-Side (Already Implemented)

Notification records are created by the scoring module:
- `scoring.repository.ts:applyScoring()` — creates MATCH_WON/MATCH_LOST inside the scoring transaction
- `scoring.repository.ts:applyCancel()` — creates MATCH_CANCELLED inside the cancel transaction
- Idempotency is guaranteed by the `hasParticipations` guard (scoring) and the status check (cancel)

## Read-Side (To Be Implemented)

The new `notifications` module provides read access:
- Query by userId, ordered by createdAt DESC
- Count where isRead = false and userId = current user
- Update isRead = true for individual or bulk (by userId)
