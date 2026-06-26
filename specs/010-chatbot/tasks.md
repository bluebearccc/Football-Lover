# Tasks: Chatbot (UC11)

**Input**: Design documents from `specs/010-chatbot/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/chatbot-api.md, quickstart.md

**Tests**: Not explicitly requested — test tasks omitted.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the chatbot module skeleton and shared config

- [x] T001 Create backend chatbot module directory structure at `backend/src/modules/chatbot/`
- [x] T002 [P] Add chatbot environment variables (`CHATBOT_PROXY_URL`, `CHATBOT_PROXY_SECRET`, `CHATBOT_SAVE_CONVERSATIONS`) to `backend/.env.example` and load in config
- [x] T003 [P] Create frontend chatbot component directory at `frontend/src/components/chatbot/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core backend infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Create Zod validation schemas (message input DTO, conversation history DTO) in `backend/src/modules/chatbot/chatbot.dto.ts`
- [x] T005 [P] Create `ChatbotConversationRepository` with `save()` and `countTodayByUser()` methods in `backend/src/modules/chatbot/chatbot.repository.ts` — uses existing `ChatbotConversation` model from Prisma schema
- [x] T006 [P] Create `AIProviderClient` with `send(prompt, context)` method in `backend/src/modules/chatbot/ai-provider.client.ts` — HTTP POST to `CHATBOT_PROXY_URL` with `CHATBOT_PROXY_SECRET`, timeout handling (5s), error wrapping
- [x] T007 [P] Create `UserContextService` with `buildSafeContext(userId)` method in `backend/src/modules/chatbot/user-context.service.ts` — queries user profile, matches, predictions, stats from last 30 days; excludes sensitive fields (password, email, tokens)
- [x] T008 Create `ChatbotService` with `answer(userId, message, conversationHistory)` and `isReadOnly(message)` methods in `backend/src/modules/chatbot/chatbot.service.ts` — orchestrates context building, read-only check, AI provider call, optional conversation save; rate limit check (20/day per user via repository count)
- [x] T009 Create `ChatbotController` with `ask(req, res, next)` and `getStatus(req, res, next)` handlers in `backend/src/modules/chatbot/chatbot.controller.ts`
- [x] T010 Create chatbot routes (`POST /messages`, `GET /status`) with `authenticate` middleware and `validateBody` in `backend/src/modules/chatbot/chatbot.routes.ts`
- [x] T011 Mount chatbot routes at `/api/v1/chatbot` in `backend/src/routes/index.ts`
- [x] T012 [P] Create `ChatbotApiClient` with `ask(message, conversationHistory)` and `getStatus()` methods in `frontend/src/api/chatbot.ts` — uses existing `apiFetch` from `frontend/src/api/client.ts`

**Checkpoint**: Backend chatbot API is functional (POST /messages, GET /status). Frontend API client ready. All stories can proceed.

---

## Phase 3: User Story 1 — Ask a Football Question (Priority: P1) 🎯 MVP

**Goal**: Authenticated user can open a chatbot widget, ask a question, and receive a relevant read-only answer with in-session conversation context.

**Independent Test**: Log in → open chatbot widget → type a question about a match → verify response appears within 5s. Send a follow-up referencing prior message → verify context is maintained.

### Implementation for User Story 1

- [x] T013 [P] [US1] Create `ChatInput` component in `frontend/src/components/chatbot/ChatInput.tsx` — text input with 500-char validation, send button (touch target ≥ 44×44px), empty message prevention, Vietnamese placeholder text
- [x] T014 [P] [US1] Create `ChatMessageList` component in `frontend/src/components/chatbot/ChatMessageList.tsx` — renders array of `{role, content}` messages, auto-scroll to bottom, loading indicator while waiting for response, user vs assistant message styling (Elite Pitch palette)
- [x] T015 [US1] Create `ChatbotWidget` component in `frontend/src/components/chatbot/ChatbotWidget.tsx` — floating bottom-right button, expandable panel, manages in-session conversation state (array of messages, max 20), calls `ChatbotApiClient.ask()`, shows `remainingMessages` count, resets on close/reopen, Elite Pitch dark theme styling
- [x] T016 [US1] Mount `ChatbotWidget` in the app layout (visible on all pages after login) — conditionally render only for authenticated users in `frontend/src/app/layout.tsx` or appropriate layout wrapper

**Checkpoint**: User Story 1 fully functional — user can ask questions and get AI-powered answers with in-session context. MVP complete.

---

## Phase 4: User Story 2 — Authentication Gate (Priority: P1)

**Goal**: Guests are prompted to log in when attempting to use the chatbot. No chatbot interactions occur without authentication.

**Independent Test**: Open app without logging in → click chatbot widget → verify login prompt appears instead of chat interface.

### Implementation for User Story 2

- [x] T017 [US2] Update `ChatbotWidget` in `frontend/src/components/chatbot/ChatbotWidget.tsx` to show login prompt (with link to login page) when user is not authenticated, instead of the chat interface. Ensure the floating button is still visible but opens the auth gate.

**Checkpoint**: User Story 2 complete — unauthenticated users see login prompt, authenticated users see chat interface.

---

## Phase 5: User Story 3 — Graceful Error Handling (Priority: P2)

**Goal**: Users see clear Vietnamese error messages for provider unavailability, validation errors, and rate limit exceeded.

**Independent Test**: Simulate provider timeout → verify "Chatbot tạm thời không khả dụng" message. Send 500+ char message → verify validation error. Exhaust 20 daily messages → verify rate limit message.

### Implementation for User Story 3

- [x] T018 [US3] Add error response handling in `ChatbotWidget` (`frontend/src/components/chatbot/ChatbotWidget.tsx`) — map API error codes (`PROVIDER_UNAVAILABLE`, `RATE_LIMIT_EXCEEDED`, `VALIDATION_ERROR`, `READ_ONLY_VIOLATION`) to Vietnamese user-facing messages; show inline in message list as error bubbles
- [x] T019 [US3] Add character counter display in `ChatInput` (`frontend/src/components/chatbot/ChatInput.tsx`) — show current/max count (e.g., "145/500"), disable send button when over limit, visual warning when approaching limit
- [x] T020 [US3] Add daily usage indicator in `ChatbotWidget` (`frontend/src/components/chatbot/ChatbotWidget.tsx`) — call `ChatbotApiClient.getStatus()` on widget open to show remaining messages, update after each sent message using `remainingMessages` from response

**Checkpoint**: All error states handled with clear Vietnamese messaging. Rate limit feedback visible.

---

## Phase 6: User Story 4 — Read-Only Enforcement (Priority: P2)

**Goal**: Chatbot refuses any request that attempts to modify data and explains it can only provide information.

**Independent Test**: Ask chatbot to "thay đổi dự đoán" or "xóa tài khoản" → verify refusal message explaining read-only nature.

### Implementation for User Story 4

- [x] T021 [US4] Implement `isReadOnly(message)` keyword detection logic in `ChatbotService` (`backend/src/modules/chatbot/chatbot.service.ts`) — detect Vietnamese and English modification intent keywords (thay đổi, xóa, sửa, cập nhật, delete, change, update, modify); return `READ_ONLY_VIOLATION` ApiError with Vietnamese message when detected
- [x] T022 [US4] Add system prompt instruction to `AIProviderClient.send()` in `backend/src/modules/chatbot/ai-provider.client.ts` — prepend system instruction enforcing read-only responses, instructing the AI to refuse modification requests and explain its read-only nature in Vietnamese

**Checkpoint**: Defense in depth — keyword filter + prompt instruction + no write endpoints. Read-only fully enforced.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Quality gates, responsive design, accessibility

- [x] T023 [P] Add responsive styling to `ChatbotWidget` for mobile breakpoints (480px/768px) in `frontend/src/components/chatbot/ChatbotWidget.tsx` — full-width panel on mobile, floating panel on desktop
- [x] T024 [P] Add keyboard navigation support to chatbot components — Enter to send in `ChatInput`, Escape to close widget, focus management on open/close
- [x] T025 [P] Verify and add any missing Elite Pitch design tokens needed by chatbot components in `frontend/tailwind.config.ts`
- [x] T026 Run `npm run build` and `npm run lint` in both `backend/` and `frontend/` — fix any type errors or lint issues
- [x] T027 Run quickstart.md validation scenarios (V1–V9) to verify end-to-end functionality

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phases 3–6)**: All depend on Foundational phase completion
  - US1 and US2 can proceed in parallel (both P1)
  - US3 and US4 can proceed in parallel (both P2), depend on US1 for widget existence
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — no dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) — modifies `ChatbotWidget` from US1, so best done after or alongside US1
- **User Story 3 (P2)**: Depends on US1 (widget and API client must exist) — adds error handling to existing components
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) — backend-only changes, independent of frontend stories

### Within Each User Story

- Models/repositories before services
- Services before controllers
- Controllers before routes
- Backend before frontend (API must exist for frontend to call)

### Parallel Opportunities

- T002, T003 can run in parallel (Setup phase)
- T005, T006, T007, T012 can run in parallel (Foundational phase — different files)
- T013, T014 can run in parallel (US1 — different components)
- US1 + US2 can overlap (both P1, different aspects of widget)
- US3 + US4 can run in parallel (US3 is frontend-focused, US4 is backend-focused)
- T023, T024, T025 can run in parallel (Polish — different concerns)

---

## Parallel Example: Foundational Phase

```
# Launch parallel foundational tasks:
Task T005: "ChatbotConversationRepository in backend/src/modules/chatbot/chatbot.repository.ts"
Task T006: "AIProviderClient in backend/src/modules/chatbot/ai-provider.client.ts"
Task T007: "UserContextService in backend/src/modules/chatbot/user-context.service.ts"
Task T012: "ChatbotApiClient in frontend/src/api/chatbot.ts"
```

## Parallel Example: User Story 1

```
# Launch parallel component tasks:
Task T013: "ChatInput in frontend/src/components/chatbot/ChatInput.tsx"
Task T014: "ChatMessageList in frontend/src/components/chatbot/ChatMessageList.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (ask questions, get answers)
4. **STOP and VALIDATE**: Test with quickstart scenarios V2, V3
5. Deploy/demo — core chatbot value delivered

### Incremental Delivery

1. Setup + Foundational → Backend API ready
2. Add US1 (Ask Questions) → MVP chatbot working → Validate V2, V3
3. Add US2 (Auth Gate) → Security enforced → Validate V1
4. Add US3 (Error Handling) → Polish UX → Validate V4, V5, V7
5. Add US4 (Read-Only) → Defense in depth → Validate V6
6. Polish → Responsive, accessible, clean → Validate V8, V9

---

## Phase 8: Convergence

- [x] T028 Decouple rate limit counting from conversation persistence in `backend/src/modules/chatbot/chatbot.service.ts` — currently `countTodayByUser` counts saved `ChatbotConversation` records, but if `CHATBOT_SAVE_CONVERSATIONS` is disabled no records are saved and rate limit never triggers. Always save a minimal record for rate limiting purposes regardless of the persistence setting, or use an independent in-memory/separate counter per FR-010 (partial)
- [x] T029 [P] Add error `code` field to chatbot-specific ApiError responses in `backend/src/modules/chatbot/chatbot.service.ts` — pass `{ code: 'READ_ONLY_VIOLATION' }` as `details` for read-only violations and `{ code: 'RATE_LIMIT_EXCEEDED' }` for rate limit errors, matching the API contract in `specs/010-chatbot/contracts/chatbot-api.md` per API contract (partial)
- [x] T030 [P] Fix `resetAt` timezone formatting in `backend/src/modules/chatbot/chatbot.service.ts` `getNextMidnightHCM()` — current `toISOString().replace('Z', '+07:00')` produces incorrect ISO 8601; properly format the HCM midnight time with +07:00 offset per FR-010 (partial)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- No Prisma migration needed — `ChatbotConversation` model already exists in schema
- No Stitch mockup exists for chatbot — use Elite Pitch tokens + standard chatbot widget conventions
- Chatbot is a "Could" priority UC — scope is intentionally contained
- Vietnamese UI text throughout all user-facing messages
