# Research: Chatbot (UC11)

**Date**: 2026-06-26 | **Spec**: [spec.md](spec.md)

## R1: Local CLI Proxy Communication Pattern

**Decision**: Backend communicates with the AI provider via a local CLI proxy using child process execution (stdin/stdout) or HTTP to a local proxy endpoint, depending on the proxy's interface.

**Rationale**: The SRS specifies a "local CLI proxy" served server-side only. The sequence diagram shows `AIProviderClient → AI Provider` via REST JSON. The backend `AIProviderClient` class encapsulates this — it reads the proxy endpoint/secret from env vars (`CHATBOT_PROXY_URL`, `CHATBOT_PROXY_SECRET`) and sends HTTP POST requests with the prompt and context.

**Alternatives considered**:
- Direct third-party API call: Rejected — SRS explicitly requires local CLI proxy (no hosted third-party provider in v1.1.0).
- WebSocket to proxy: Rejected — unnecessary complexity for request/response pattern; REST is sufficient given the <5s P95 target.

## R2: In-Session Context Management

**Decision**: The frontend maintains an array of `{role, content}` message pairs in component state. On each new message, the full array (up to a configurable max, e.g., 20 messages) is sent to the backend. The backend appends the safe user context and forwards everything to the proxy.

**Rationale**: Clarification confirmed in-session context with reset on page reload. Frontend-managed context is simplest — no server-side session store needed. The backend's `UserContextService.buildSafeContext()` adds the 30-day data snapshot on each request.

**Alternatives considered**:
- Server-side session store (Redis/DB): Rejected — adds infrastructure complexity for ephemeral data that resets on reload.
- Backend-managed message history: Rejected — requires session tracking; frontend state is sufficient and simpler.

## R3: Rate Limiting Implementation

**Decision**: Rate limiting uses a daily counter per user, stored in-memory (or Redis if available) keyed by `user_id`. Counter resets at midnight Asia/Ho_Chi_Minh. The existing `createRateLimiter` utility in the backend can be extended or a chatbot-specific limiter created.

**Rationale**: 20 messages/day is a low-frequency limit. A simple in-memory counter per user is adequate for the expected scale. The existing rate limiter pattern in `auth.routes.ts` provides the foundation.

**Alternatives considered**:
- Database-based counter: Rejected for MVP — adds a write per message just for rate limiting. Can be upgraded later if needed.
- Token bucket / sliding window: Over-engineered for 20/day limit.

## R4: Read-Only Enforcement Strategy

**Decision**: The `ChatbotService.isReadOnly(message)` method validates that the user's intent is informational. The AI provider prompt includes a system instruction enforcing read-only responses. The backend has no write endpoints exposed through the chatbot path — the chatbot route only calls read repositories.

**Rationale**: Defense in depth — both prompt-level instruction and architectural constraint (no write operations in the chatbot service/repository layer). The `isReadOnly` check is a keyword/intent filter as a first gate.

**Alternatives considered**:
- Prompt-only enforcement: Rejected — prompt injection could bypass it; architectural constraint is the real guarantee.
- Full NLP intent classification: Over-engineered for v1; keyword heuristic + prompt instruction is sufficient.

## R5: UI Widget Design (No Stitch Mockup)

**Decision**: Since no chatbot mockup exists in `stitch_goalpredict_live_dashboard/`, the widget will follow the Elite Pitch design system (dark theme, pitch/gold/ink palette) as a floating bottom-right chat bubble. Layout follows common chatbot widget conventions: expandable panel with message list, input field, and send button.

**Rationale**: Constitution Principle IV requires UI baseline on Stitch mockups, but no chatbot mockup exists. The widget must still use Elite Pitch tokens from `tailwind.config.ts` and `DESIGN.md`. A floating widget is consistent with the spec assumption and standard chatbot UX patterns.

**Alternatives considered**:
- Dedicated page route: Rejected — spec assumes floating/overlay widget.
- Sidebar panel: Rejected — would require layout changes to existing pages.
