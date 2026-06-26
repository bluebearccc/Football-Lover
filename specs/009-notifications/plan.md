# Implementation Plan: Win/Lose Notifications

**Branch**: `009-notifications` | **Date**: 2026-06-26 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/009-notifications/spec.md`

## Summary

Implement the read-side of in-app notifications (UC14): a backend module with list/mark-read/count endpoints, and a frontend NotificationBell + Dropdown component in the navigation bar. Notification **creation** is already handled by the scoring module during match finish and cancellation — this feature adds the user-facing API and UI to view and manage those notifications.

## Technical Context

**Language/Version**: TypeScript (strict mode, both backend and frontend)

**Primary Dependencies**: Express + Prisma 6 (backend), Next.js 14.2.x App Router + TailwindCSS (frontend)

**Storage**: PostgreSQL — `Notification` model already exists in `schema.prisma` (no migration needed)

**Testing**: `npm run build` (typecheck) + `npm run lint` in both `backend/` and `frontend/`

**Target Platform**: Web application (desktop + mobile responsive)

**Project Type**: Full-stack web application

**Performance Goals**: Notification list loads in <2s, mark-read <1s, unread count badge updates within 3s of change

**Constraints**: Vietnamese UI text, timezone Asia/Ho_Chi_Minh, WCAG 2.1 AA basic (touch target ≥44×44px, keyboard navigation)

**Scale/Scope**: Moderate — notifications accumulate at ~2–5 per match per user; paginated at 20/page

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spec-Driven Development | PASS | All endpoints and components trace to UC14 class/sequence diagrams and SRS AC-14-01/02/03 |
| II. Layered Architecture | PASS | New `notifications` module follows controller → service → repository pattern with all 5 standard files |
| III. Contract-First APIs | PASS | Zod DTOs for validation, ApiError for errors, authenticate middleware on all routes |
| IV. Frontend Discipline | PASS | Components follow UC14 frontend class diagram (NotificationBell → NotificationDropdown → NotificationItem), API via src/api/notifications.ts |
| V. Quality Gates | PASS | Build + lint required before completion |

**UI baseline (Principle IV) — required when the feature touches the frontend:**

- [x] Identify the matching screen folder(s) under `stitch_goalpredict_live_dashboard/` for
      every screen this feature builds or changes: the notification bell/dropdown is part of the
      nav bar visible in `dashboard/`, `live_matches/`, and other main screens. No dedicated
      notifications mockup exists — the bell icon is already in the layout. Component styling
      follows Elite Pitch design tokens.
- [x] Plan reflects the layout/visuals from each screen's `screen.png` + `code.html` and the
      design tokens in `stitch_goalpredict_live_dashboard/elite_pitch/DESIGN.md`. The bell icon
      is already present in the main layout header (line 77–81 of `(main)/layout.tsx`).
- [x] Any token a mockup needs but `frontend/tailwind.config.ts` lacks is captured as a planned
      `tailwind.config.ts` addition. No new tokens expected — existing Elite Pitch palette covers
      notification badge (primary/error for badge, surface/on-surface for dropdown).
- [x] Mockup ↔ spec conflicts noted: None. The bell icon in the layout aligns with the UC14
      frontend class diagram's NotificationBell component.

## Project Structure

### Documentation (this feature)

```text
specs/009-notifications/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── notifications-api.md
└── tasks.md             # Phase 2 output (created by /speckit-tasks)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── modules/
│   │   └── notifications/          # NEW — UC14 read-side module
│   │       ├── notifications.controller.ts
│   │       ├── notifications.service.ts
│   │       ├── notifications.repository.ts
│   │       ├── notifications.routes.ts
│   │       └── notifications.dto.ts
│   └── routes/
│       └── index.ts                # MODIFIED — mount /notifications

frontend/
├── src/
│   ├── api/
│   │   └── notifications.ts        # NEW — NotificationApiClient
│   ├── components/
│   │   └── notifications/          # NEW — UC14 frontend components
│   │       ├── NotificationBell.tsx
│   │       ├── NotificationDropdown.tsx
│   │       └── NotificationItem.tsx
│   └── app/
│       └── (main)/
│           └── layout.tsx          # MODIFIED — replace static bell with NotificationBell
```

**Structure Decision**: Follows the existing project convention — backend module under `src/modules/notifications/` with all 5 standard files, frontend components under `src/components/notifications/` with API client in `src/api/`.

## Complexity Tracking

No constitution violations. Feature is straightforward CRUD read-side + UI component integration.
