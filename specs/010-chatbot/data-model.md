# Data Model: Chatbot (UC11)

**Date**: 2026-06-26 | **Spec**: [spec.md](spec.md)

## Entities

### ChatbotConversation (existing in schema.prisma)

Represents a single message-response exchange between a user and the chatbot.

| Field     | Type     | Constraints                        | Description                    |
|-----------|----------|------------------------------------|--------------------------------|
| id        | UUID     | PK, auto-generated                 | Unique conversation ID         |
| userId    | UUID     | FK → User.id, indexed             | Authenticated user who asked   |
| message   | String   | max 500 chars, not empty           | User's question                |
| response  | String   | not empty                          | Chatbot's answer               |
| createdAt | DateTime | auto-generated, default now()      | Timestamp of the exchange      |

**Relationships**:
- `ChatbotConversation.userId` → `User.id` (many-to-one)
- User has `chatbotConversations[]` relation

**Indexes**:
- `@@index([userId])` — fast lookup of conversations by user

**Notes**:
- This model already exists in `backend/prisma/schema.prisma` (no migration needed).
- Persistence is optional/configurable — the service saves only when the `CHATBOT_SAVE_CONVERSATIONS` env var is truthy.
- This stores individual exchanges, not full session transcripts.

### User Context (transient, not persisted)

A runtime-only data snapshot built per request by `UserContextService.buildSafeContext()`.

| Data Included            | Source                      | Time Window   |
|--------------------------|-----------------------------|---------------|
| User profile             | User model (id, displayName, role) | Current       |
| Recent matches           | Match model (user's participated matches) | Last 30 days  |
| Recent predictions       | Prediction model            | Last 30 days  |
| Recent stats             | Aggregated from predictions | Last 30 days  |

**Security constraints**:
- Only the authenticated user's own data is included — no other users' data.
- No sensitive fields (password hash, email, tokens) are included in context.
- Context is built fresh per request and not cached or persisted.

## State Transitions

Chatbot request lifecycle (from `uc-11-statediagram.puml`):

```
[Idle] → Validating → Rejected (not logged in / too long / write request / rate limited)
                     → WaitingProvider (allowed)
[WaitingProvider] → Answered (provider returns response)
                  → Failed (timeout/unavailable)
[Answered/Failed/Rejected] → Idle
```

## No Schema Migration Required

The `ChatbotConversation` model is already defined in the Prisma schema. No new migration is needed for this feature.
