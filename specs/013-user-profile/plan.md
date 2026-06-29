# Implementation Plan: User Profile and Prediction History

**Branch**: `013-user-profile` | **Date**: 2026-06-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/013-user-profile/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

UC10 (View Profile and Prediction History) is **already mostly implemented**: backend
`modules/profile/` (self-service `/profile/me`, `/profile/history`) and the Admin support
routes (`/admin/users/:id/profile`, `/admin/users/:id/history` in `modules/users/`) both exist
and delegate to the same `profileService`; the frontend `/profile` and `/history` pages and
`ProfileStatsCard` / `MatchHistoryList` components are built and wired through
`src/api/profile.ts`. This plan closes the two remaining gaps surfaced by `/speckit-clarify`
and by reading the existing code against the spec:

1. **Backend correctness fix**: `profileRepository.getStats` currently counts ALL
   `MatchParticipation` rows (including matches still `SCHEDULED`/`LIVE`) toward
   "total matches participated." Per the spec's clarified FR-001, this MUST be scoped to
   `FINISHED` matches only, consistent with `totalWins`/accuracy/`totalGoldWon`.
2. **Admin frontend support view (User Story 3 / FR-006)**: the backend Admin routes exist,
   but there is no frontend surface to reach them — `frontend/src/app/admin/users/page.tsx`
   has no per-user detail link, and `frontend/src/api/admin/users.ts` has no profile/history
   methods. This plan adds a read-only admin user-detail view that reuses the existing
   `ProfileStatsCard` / `MatchHistoryList` components against the Admin endpoints.

No new backend routes, DB schema, or self-service frontend work is required — Stories 1 and 2
are functionally complete and verified against the UC10 class/sequence diagrams.

## Technical Context

**Language/Version**: TypeScript (strict), Node.js (backend), Next.js 14.2.x App Router (frontend)

**Primary Dependencies**: Express + Prisma 6.x + Zod (backend); Next.js + TailwindCSS (frontend); existing `apiFetch` client + `session` lib (frontend)

**Storage**: PostgreSQL via Prisma (`backend/prisma/schema.prisma`) — no schema changes needed; `MatchParticipation.match.status` (existing `MatchStatus` enum) is the only field this plan reads differently (filtered, not added)

**Testing**: Manual verification via `/speckit-implement` build/lint gates (Principle V); no existing automated test suite found for `profile`/`users` modules to extend — follow whatever pattern (if any) is established when touching these modules

**Target Platform**: Web (existing GoalPredict Live app, backend :4000 / frontend :5173)

**Project Type**: Web application (backend + frontend, both already scaffolded)

**Performance Goals**: No new performance requirements beyond SC-001 (profile loads in ~2s under normal load) — already met by existing single-query-per-concern implementation

**Constraints**: Read-only Admin view (FR-006) — MUST NOT add edit controls; MUST reuse `profileService`'s existing response shape, not a parallel one (per `uc-10-class-backend.puml` note: "no separate data shape for Admin vs self-service")

**Scale/Scope**: Small, surgical — one repository query fix, one new admin frontend route + 2 API client methods + reuse of 2 existing components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I (Spec-Driven)**: PASS. Both gaps trace directly to spec.md FR-001 (finished-only
  stats) and FR-006/User Story 3 (Admin support view), themselves traced to SRS UC10/FR-10.
  No `docs/` edits planned.
- **Principle II (Layered Architecture)**: PASS. The stats fix stays inside
  `profile.repository.ts` (Prisma access already isolated there). The admin view adds a new
  page + components in `frontend/`, which has no layered-module requirement; no new backend
  module is needed since `modules/users/` already exposes the routes/controller/service chain
  (`usersController.getProfile/getHistory` → `profileService`).
- **Principle III (Contract-First)**: PASS. Existing `historyQuerySchema` (Zod) already
  validates the Admin history query; existing `requireRole('ADMIN')` guard at
  `admin.routes.ts` already protects `/admin/users/:id/profile|history`. No new endpoints,
  so no new contract surface.
- **Principle IV (Frontend Discipline)**: See UI baseline checklist below — applies because
  this plan adds a frontend admin screen.
- **Principle V (Quality Gates)**: PASS (gate, not yet executed) — `npm run build` + `npm run
  lint` MUST be run in `backend/` and `frontend/` after implementation, before reporting done.

**UI baseline (Principle IV) — required when the feature touches the frontend:**

- [x] Identify the matching screen folder(s) under `stitch_goalpredict_live_dashboard/` for
      every screen this feature builds or changes, and list them here.
      → Self-service `/profile` and `/history` already match
      `stitch_goalpredict_live_dashboard/user_profile/` (built in a prior pass — no change
      planned here). **The new Admin user-detail/profile screen has no dedicated Stitch
      mockup** — see flagged conflict below.
- [x] Plan reflects the layout/visuals from each screen's `screen.png` + `code.html` and the
      design tokens in `stitch_goalpredict_live_dashboard/elite_pitch/DESIGN.md` (no invented
      layout outside the mockups).
      → For the Admin screen, the plan reuses `stitch_goalpredict_live_dashboard/
      admin_user_management/` chrome (table/detail panel conventions, Elite Pitch tokens) for
      the surrounding admin shell, and reuses the **existing, already-mockup-derived**
      `ProfileStatsCard` / `MatchHistoryList` components verbatim for the profile content —
      no new layout is invented; only composition of two already-compliant pieces.
- [x] Any token a mockup needs but `frontend/tailwind.config.ts` lacks is captured as a planned
      `tailwind.config.ts` addition (not a hardcoded value).
      → None expected; no new tokens needed since both source component sets already use
      Elite Pitch tokens.
- [x] Mockup ↔ spec (SRS/class diagram) conflicts noted: spec wins for behavior/fields, mockup
      wins for visuals; irreconcilable conflicts flagged in Complexity Tracking, not silently
      resolved.
      → Flagged in Complexity Tracking: no Stitch mockup exists for the Admin support
      profile/history screen itself (only for the Admin user list/management screen and the
      end-user profile screen). Resolution proposed there.

## Project Structure

### Documentation (this feature)

```text
specs/013-user-profile/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
backend/
└── src/modules/
    ├── profile/
    │   ├── profile.controller.ts   # unchanged
    │   ├── profile.service.ts      # unchanged
    │   ├── profile.repository.ts   # MODIFIED: scope stats to FINISHED matches
    │   ├── profile.routes.ts       # unchanged
    │   └── profile.dto.ts          # unchanged
    └── users/
        ├── users.controller.ts     # unchanged (getProfile/getHistory already delegate correctly)
        └── users.routes.ts         # unchanged (routes already exist + guarded)

frontend/
├── src/api/
│   ├── profile.ts                  # unchanged (self-service client)
│   └── admin/
│       └── users.ts                # MODIFIED: add getProfile(id) / getHistory(id, params)
├── src/app/admin/users/
│   ├── page.tsx                    # MODIFIED: add per-row "View profile" link/action
│   └── [id]/
│       └── page.tsx                # NEW: admin read-only user profile/history screen
└── src/components/profile/
    ├── ProfileStatsCard.tsx        # unchanged, reused as-is
    └── MatchHistoryList.tsx        # unchanged, reused as-is
```

**Structure Decision**: Standard backend (`backend/src/modules/<name>/{controller,service,
repository,routes,dto}.ts`) and frontend (`frontend/src/{api,app,components}/`) layout already
established by this repo (Web application: Option 2). This feature does not introduce new
modules — it patches one repository query and adds one new admin route + two API client
methods, reusing existing self-service components for the admin view per the
`uc-10-class-backend.puml` note that Admin and self-service share one data shape.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| No dedicated Stitch mockup for the Admin support profile/history screen | UC10's Admin support view (FR-006) was added to the SRS/class diagrams but no `stitch_goalpredict_live_dashboard/<screen>/` folder was authored for it — only `admin_user_management/` (the list) and `user_profile/` (the self-service screen) exist | Inventing a brand-new bespoke layout would violate Principle IV's "no invented layout outside the mockups." Instead, the plan composes two already-mockup-compliant pieces: the `admin_user_management` shell/chrome for the surrounding admin page, and the existing `ProfileStatsCard`/`MatchHistoryList` components (already built to the `user_profile` mockup) for the content — zero new visual decisions are made. If stakeholders want a bespoke admin support layout later, that requires a Stitch mockup addition first, raised here rather than silently designed around. |
