# Feature Specification: Chatbot (UC11)

**Feature Branch**: `010-chatbot`

**Created**: 2026-06-26

**Status**: Draft

**Input**: User description: "chatbot"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ask a Football Question (Priority: P1)

As a registered user, I want to ask the chatbot questions about matches, statistics, rules, and my own prediction history so that I can get quick answers without navigating through the app.

**Why this priority**: This is the core value of the chatbot feature — providing conversational access to football data and platform information.

**Independent Test**: Can be fully tested by logging in, opening the chatbot widget, typing a question about an upcoming match, and verifying a relevant read-only answer is displayed.

**Acceptance Scenarios**:

1. **Given** user is logged in, **When** asking about a match score or schedule, **Then** chatbot returns a relevant read-only answer.
2. **Given** user is logged in, **When** asking about their own prediction history, **Then** chatbot returns accurate data from the user's history.
3. **Given** user is logged in, **When** asking about platform rules or criteria, **Then** chatbot explains the rules clearly.
4. **Given** user is logged in, **When** asking chatbot to suggest matches or criteria, **Then** chatbot provides relevant suggestions based on available data.

---

### User Story 2 - Authentication Gate (Priority: P1)

As a guest, I should be prompted to log in when I try to use the chatbot, so that only authenticated users can access the chatbot feature.

**Why this priority**: Security and access control are fundamental — chatbot must enforce authentication (BR24).

**Independent Test**: Can be tested by opening the chatbot widget as a guest and verifying a login prompt is shown instead of the chat interface.

**Acceptance Scenarios**:

1. **Given** user is not logged in, **When** opening the chatbot widget, **Then** system prompts the user to log in.
2. **Given** user logs in after being prompted, **When** chatbot widget is reopened, **Then** user can now ask questions.

---

### User Story 3 - Graceful Error Handling (Priority: P2)

As a registered user, I want to see clear error messages when the chatbot is unavailable or my message is invalid, so that I understand what went wrong and what to do next.

**Why this priority**: Robust error handling ensures a good user experience even when things go wrong (provider downtime, rate limits, input validation).

**Independent Test**: Can be tested by simulating a provider timeout and verifying the "chatbot unavailable" message appears, or by sending a message exceeding 500 characters and verifying validation error.

**Acceptance Scenarios**:

1. **Given** the chatbot provider is unavailable or times out, **When** user asks a question, **Then** system shows "Chatbot tam thoi khong kha dung, vui long thu lai sau." message.
2. **Given** user types a message exceeding 500 characters, **When** user tries to send, **Then** system shows a validation error indicating the character limit.
3. **Given** user sends too many messages in a short period, **When** rate limit is exceeded, **Then** system shows an appropriate rate-limit message.

---

### User Story 4 - Read-Only Enforcement (Priority: P2)

As a system operator, I want the chatbot to be strictly read-only so that no user can use the chatbot to modify any data in the system.

**Why this priority**: Data integrity and security — the chatbot must never be a vector for data modification (BR25).

**Independent Test**: Can be tested by asking the chatbot to change a prediction or modify profile data and verifying it refuses the request.

**Acceptance Scenarios**:

1. **Given** user is logged in, **When** asking the chatbot to modify data (e.g., "change my prediction", "delete my account"), **Then** chatbot refuses and explains it can only provide information.

---

### Edge Cases

- What happens when the chatbot provider returns an empty or malformed response? System shows a generic error message.
- How does the system handle concurrent chatbot requests from the same user? Requests are processed sequentially; duplicate rapid requests may be rate-limited.
- What happens if the user's session expires mid-conversation? The next message attempt returns an authentication error and prompts re-login.
- What happens when the user sends an empty message? Input validation prevents sending empty messages.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST require authentication before allowing chatbot usage (BR24).
- **FR-002**: System MUST accept user questions via a chatbot widget accessible from the main application interface.
- **FR-003**: System MUST forward user questions to the AI provider through a local CLI proxy with safe user/match context and in-session conversation history (previous messages within the current page session). Context resets on page reload.
- **FR-004**: System MUST display the AI provider's response to the user in the chat interface.
- **FR-005**: System MUST enforce read-only access — the chatbot cannot modify any data in the system (BR25).
- **FR-006**: System MUST validate message length (maximum 500 characters) before sending to the provider.
- **FR-007**: System MUST show a "temporarily unavailable" message when the provider is unreachable or times out (response timeout < 5s target, < 3s stretch).
- **FR-008**: System MUST save chatbot conversations (message + response) server-side when configured (for analytics/auditing). Conversation history is NOT exposed in the UI — the widget starts fresh each time it is opened.
- **FR-009**: System MUST build a safe context for the AI provider containing the authenticated user's profile and their matches, predictions, and stats from the last 30 days. No other users' private data is included.
- **FR-010**: System MUST rate-limit chatbot usage to 20 messages per day per user. When the limit is reached, the system MUST inform the user and reject further messages until the next day (midnight Asia/Ho_Chi_Minh).
- **FR-011**: Chatbot MUST be able to answer questions about matches, statistics, platform rules, criteria, and the user's own profile/history.

### Key Entities

- **ChatbotConversation**: Represents a single exchange between a user and the chatbot — includes user ID, user message, chatbot response, and timestamp. Linked to the authenticated user.
- **User Context**: A transient, safe data snapshot built per-request containing the user's relevant match/stat/prediction data, used as context for the AI provider prompt. Never persisted or shared across users.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Authenticated users can ask a question and receive a relevant answer within 5 seconds (P95).
- **SC-002**: 90% of users who open the chatbot successfully complete at least one question-answer exchange on first use.
- **SC-003**: Unauthenticated users are always redirected to login — zero chatbot interactions occur without authentication.
- **SC-004**: Zero data modifications occur through the chatbot — all interactions are strictly read-only.
- **SC-005**: When the provider is unavailable, 100% of users see the appropriate "temporarily unavailable" message instead of a raw error.

## Clarifications

### Session 2026-06-26

- Q: Does the chatbot maintain conversation context within a single page session? → A: Yes, in-session context — previous messages in the current session are sent as context to the AI provider; context resets on page reload.
- Q: What is the actual rate limit threshold for chatbot usage? → A: 20 messages per day per user.
- Q: Can users view past chatbot conversations from previous sessions? → A: No, UI is ephemeral — each widget open starts fresh with no history from prior sessions.
- Q: How much user data should be included in the AI provider context per request? → A: Recent data — user profile plus matches, predictions, and stats from the last 30 days.

## Assumptions

- The local CLI proxy for the AI provider is already deployed and accessible from the backend server environment.
- The chatbot widget is a floating/overlay component accessible from any page after login, not a dedicated full-page route.
- Chatbot conversation history persistence is optional and configurable (not mandatory for MVP).
- The AI provider can handle the expected load of 3-5 messages per active user per day without dedicated scaling.
- The chatbot UI language is Vietnamese, consistent with the rest of the application.
- The chatbot maintains in-session conversation context (previous messages are sent with each request to the AI provider) but resets on page reload — no cross-session continuity.
