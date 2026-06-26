# Implementation Plan: Chatbot (UC11)

**Branch**: `010-chatbot` | **Date**: 2026-06-26 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/010-chatbot/spec.md`

## Summary

Implement an authenticated, read-only chatbot (UC11) as a floating widget accessible from any page. The backend module (`chatbot`) communicates with an AI provider through a local CLI proxy, building safe user context (last 30 days of matches/predictions/stats). The frontend maintains in-session conversation history (reset on reload). Rate limited to 20 messages/day per user. Conversation persistence is server-side and configurable.

## Technical Context

**Language/Version**: TypeScript (strict mode), Node.js (backend), Next.js 14.2.x (frontend)

**Primary Dependencies**: Express + Prisma 6.x + Zod (backend), Next.js App Router + TailwindCSS (frontend)

**Storage**: PostgreSQL — `ChatbotConversation` model already exists in `schema.prisma`

**Testing**: `npm run build` (typecheck) + `npm run lint` per folder

**Target Platform**: Web browser (responsive), server on Node.js

**Project Type**: Web application (full-stack)

**Performance Goals**: Chatbot response < 5s P95, < 3s stretch (provider-dependent)

**Constraints**: 500 char max message, 20 messages/day/user, read-only only, auth required

**Scale/Scope**: 3-5 messages/active user/day expected; in-session context max 20 messages

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Spec-Driven Development
- [x] All behavior traces to SRS UC11, FR-11, BR24, BR25, AC-11-01–AC-11-03
- [x] No behavior invented outside spec — chatbot scope matches SRS exactly

### Principle II: Layered Architecture & Module Structure
- [x] Backend module `backend/src/modules/chatbot/` follows standard pattern: controller, service, repository, routes, dto
- [x] `ChatbotController → ChatbotService → ChatbotConversationRepository` matches class diagram
- [x] Additional classes `AIProviderClient` and `UserContextService` per class diagram

### Principle III: Contract-First APIs & Validation
- [x] API contract defined in `contracts/chatbot-api.md`
- [x] Zod DTOs for request validation (`chatbot.dto.ts`)
- [x] Errors via `ApiError`; auth via `authenticate` middleware
- [x] Route mounts under `/api/v1/chatbot`

### Principle IV: Frontend Discipline
- [x] Component structure matches FE class diagram: `ChatbotWidget → ChatMessageList + ChatInput + ChatbotApiClient`
- [x] API calls via `frontend/src/api/chatbot.ts` (not direct fetch)
- [x] Elite Pitch design tokens used (pitch/gold/ink palette from `tailwind.config.ts`)

**UI baseline (Principle IV):**

- [x] No chatbot mockup exists in `stitch_goalpredict_live_dashboard/` — documented as a gap. Widget follows Elite Pitch design system and standard chatbot widget conventions (floating bottom-right).
- [x] Plan uses design tokens from `elite_pitch/DESIGN.md` — no invented palette outside the system.
- [x] If any token is missing from `tailwind.config.ts`, it will be added as a config token (not hardcoded).
- [x] No mockup ↔ spec conflict exists (no mockup to conflict with).

### Principle V: Quality Gates & Traceability
- [x] `npm run build` + `npm run lint` in both `backend/` and `frontend/` before completion
- [x] Every requirement traces to a UC11 acceptance criterion

**Gate result**: PASS — all principles satisfied. No mockup exists for chatbot, which is documented; widget will use Elite Pitch tokens.

## Project Structure

### Documentation (this feature)

```text
specs/010-chatbot/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: research decisions
├── data-model.md        # Phase 1: entity model
├── quickstart.md        # Phase 1: validation guide
├── contracts/
│   └── chatbot-api.md   # Phase 1: API contract
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── modules/
│   │   └── chatbot/
│   │       ├── chatbot.controller.ts    # ChatbotController.ask()
│   │       ├── chatbot.service.ts       # ChatbotService.answer(), isReadOnly()
│   │       ├── chatbot.repository.ts    # ChatbotConversationRepository.save()
│   │       ├── chatbot.routes.ts        # POST /messages, GET /status
│   │       ├── chatbot.dto.ts           # Zod schemas for request validation
│   │       ├── ai-provider.client.ts    # AIProviderClient.send()
│   │       └── user-context.service.ts  # UserContextService.buildSafeContext()
│   └── routes/
│       └── index.ts                     # Mount chatbot routes
└── prisma/
    └── schema.prisma                    # ChatbotConversation (already exists)

frontend/
├── src/
│   ├── api/
│   │   └── chatbot.ts                   # ChatbotApiClient
│   └── components/
│       └── chatbot/
│           ├── ChatbotWidget.tsx         # Main widget (floating button + panel)
│           ├── ChatMessageList.tsx       # Message display list
│           └── ChatInput.tsx            # Input field with validation
```

**Structure Decision**: Web application (Option 2) — follows existing backend/frontend split. Backend module follows established `modules/<name>/` convention matching `auth/`, `notifications/`, etc. Frontend components follow FE class diagram decomposition.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| No Stitch mockup for chatbot | UC11 is a "Could" priority feature; no mockup was designed | Widget uses Elite Pitch tokens + standard chatbot conventions; flagged per Constitution IV |
