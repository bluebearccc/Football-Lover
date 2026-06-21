# Data Model: User Authentication (001-user-auth)

## Entities

### User (existing — no changes)

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK, auto-generated | |
| email | String | Unique, required | Stored lowercase (case-insensitive uniqueness) |
| passwordHash | String | Required | bcrypt hash, never exposed |
| displayName | String | Required, 2–50 chars trimmed | |
| role | Enum(USER, ADMIN) | Default: USER | Registration always creates USER; Admin via seed only |
| status | Enum(ACTIVE, LOCKED) | Default: ACTIVE | Locked accounts cannot login |
| totalPoints | Int | Default: 0 | All-time stat, not auth-specific |
| createdAt | DateTime | Default: now() | |

**Relationships**: User → many Predictions, Comments, MatchParticipations, Notifications, ChatbotConversations, PasswordResetTokens

### PasswordResetToken (existing — no changes)

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK, auto-generated | |
| userId | UUID | FK → User.id, required | |
| tokenHash | String | Unique, required | SHA-256 hash of raw token; raw token is never stored |
| expiresAt | DateTime | Required | Default: 60 minutes from creation (configurable via `RESET_TOKEN_TTL_MINUTES`) |
| usedAt | DateTime? | Nullable | Set when token is consumed; null = unused |
| createdAt | DateTime | Default: now() | |

**Lifecycle**:
1. Created → `usedAt = null`, `expiresAt = now + TTL`
2. Consumed → `usedAt = now()` (atomic with password update)
3. Expired → `expiresAt < now()` (checked on validation)
4. Invalidated → on new reset request, all unused tokens for same user get `usedAt = now()`

**Uniqueness**: `tokenHash` is unique; `(userId)` is indexed but not unique (user may have multiple tokens, only latest is valid).

## Validation Rules (from Zod DTOs)

### Register
- `email`: valid email format, required
- `displayName`: 2–50 characters after trim, required
- `password`: ≥ 8 characters, must contain at least one letter and at least one digit

### Login
- `email`: valid email format, required
- `password`: non-empty, required

### Forgot Password
- `email`: valid email format, required

### Reset Password
- `token`: non-empty string, required
- `newPassword`: same policy as register password

## State Transitions

### User Status

```
ACTIVE ──(Admin locks)──→ LOCKED
LOCKED ──(Admin unlocks)──→ ACTIVE
```

- ACTIVE: can login, submit predictions, comment, use chatbot
- LOCKED: cannot login; password reset does not unlock; login returns "Tài khoản đã bị khóa"

### Authentication Session (JWT)

```
Unauthenticated ──(login success)──→ Authenticated (token issued)
Authenticated ──(logout)──→ Unauthenticated (client clears token)
Authenticated ──(token expires)──→ Unauthenticated (next request redirects to login)
```

## Schema Reference

The Prisma schema at `backend/prisma/schema.prisma` already contains both models with correct field types, indexes, and relationships. No migration is needed for the auth feature.
