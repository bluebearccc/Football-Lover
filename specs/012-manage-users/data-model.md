# Data Model: Manage Users (012)

**Date**: 2026-06-26

## Schema Changes

### Modified Entity: User

**Current fields** (no change):
- `id` — UUID, PK
- `email` — String, unique
- `passwordHash` — String
- `displayName` — String
- `role` — Enum: USER | ADMIN
- `status` — Enum: ACTIVE | LOCKED
- `totalPoints` — Int, default 0
- `createdAt` — DateTime

**New fields**:

| Field | Type | Nullable | Default | Map | Purpose |
|-------|------|----------|---------|-----|---------|
| `banReason` | String | Yes | null | `ban_reason` | Required reason when Admin locks an account. Cleared on unlock. |
| `lastActiveAt` | DateTime | Yes | null | `last_active_at` | Last authenticated API interaction. Updated at most once per 5 minutes. Used for "Online Now" stat. |

**New index**: `@@index([lastActiveAt])` — supports "Online Now" count query.

### Existing Entity: AdminLog (no changes)

Used as-is for audit logging of user management actions. Action types for this feature:

| Action | Description |
|--------|-------------|
| `USER_LOCK` | Admin locked a user account (includes ban reason) |
| `USER_UNLOCK` | Admin unlocked a user account |
| `USER_ROLE_CHANGE` | Admin changed a user's role |
| `USER_EDIT` | Admin edited user display name |
| `USER_PASSWORD_RESET` | Admin triggered password reset for a user |

## State Transitions

### User.status

```
ACTIVE ──[Admin locks with reason]──► LOCKED
LOCKED ──[Admin unlocks]──► ACTIVE
```

**Rules**:
- Lock requires `banReason` (non-empty string)
- Unlock clears `banReason` to null
- Admin cannot lock their own account
- Admin cannot lock another Admin account (FR-012)
- Locked user cannot log in (auth service rejects at login)
- Locked user's active sessions fail on next API call (middleware check)

### User.role

```
USER ──[Admin promotes]──► ADMIN
ADMIN ──[Admin demotes]──► USER
```

**Rules**:
- Admin cannot demote their own role (prevent lockout)
- Role change takes effect on next login / token refresh

## Computed Fields (not stored)

### Prediction Accuracy

Calculated per-user as:
```
accuracy = (correct_predictions / total_predictions) * 100
```

Where:
- `correct_predictions` = count of Prediction records where `selectedTeam == criterion.resultTeam` and criterion is resolved
- `total_predictions` = count of all Prediction records for the user in finished matches

Returned in the user list API response as a computed field, not persisted.

## Validation Rules

| Field | Rule |
|-------|------|
| `banReason` | Required (non-empty, trimmed) when setting status to LOCKED. Max 500 characters. |
| `displayName` | Required, trimmed, 2-50 characters. |
| `role` | Must be a valid Role enum value. |
| `status` | Must be a valid UserStatus enum value. |
