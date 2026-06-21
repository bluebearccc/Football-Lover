# Implementation Plan: Team Management (UC13)

**Branch**: `002-team-management` | **Date**: 2026-06-21 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/002-team-management/spec.md`

## Summary

Admin team management: CRUD teams, soft-delete/deactivate teams referenced by matches, sync teams & players from api-football.com filtered by league, and display player rosters. The backend `teams` module is ~90% implemented (CRUD + players); main gaps are duplicate name validation, real api-football sync integration, and frontend sync UI + player roster view.

## Technical Context

**Language/Version**: TypeScript (strict mode) — Node.js backend, Next.js 14 frontend

**Primary Dependencies**: Express + Prisma 6 (backend), Next.js 14 App Router + TailwindCSS (frontend), Zod (validation)

**Storage**: PostgreSQL — `Team` and `Player` models already in `backend/prisma/schema.prisma`

**Testing**: Manual validation via quickstart scenarios (see [quickstart.md](quickstart.md)); `npm run build` + `npm run lint` as quality gates

**Target Platform**: Web application (desktop + responsive)

**Project Type**: Full-stack web service (admin surface)

**Performance Goals**: Team CRUD < 1s response, sync operation completes within 30s for a single league

**Constraints**: api-football.com rate limits (10 req/min free, 300/min paid); blocking sync UX (no background jobs)

**Scale/Scope**: ~20 teams per league, ~25 players per team; admin-only feature

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spec-Driven Development | PASS | All features trace to UC13 (AC-13-01..03), FR-13, FR-14, BR23 |
| II. Layered Architecture | PASS | `teams` module follows controller→service→repository. Sync extends existing `sync` module. |
| III. Contract-First APIs | PASS | Zod DTOs validate at boundary, `ApiError` for errors, routes under `/api/v1/admin/teams` with `authenticate` + `requireRole('ADMIN')` |
| IV. Frontend Discipline | PASS | See UI baseline below |
| V. Quality Gates | PASS | `npm run build` + `npm run lint` required before completion |

**UI baseline (Principle IV):**

- [x] Matching screen folder: `stitch_goalpredict_live_dashboard/admin_match_management/` — the admin match management mockup is the closest baseline for the admin team management page (same admin layout, table pattern, card pattern).
- [x] Plan reflects layout/visuals from mockup: dark admin theme, table with action buttons, card-based form, same spacing/typography.
- [x] Tokens needed from mockup already exist in `tailwind.config.ts` (ink, pitch, gold palette).
- [x] No mockup ↔ spec conflicts detected for team management.

## Project Structure

### Documentation (this feature)

```text
specs/002-team-management/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── teams-api.md     # API contract
└── tasks.md             # Phase 2 output (via /speckit-tasks)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── config/env.ts                          # api-football config (exists)
│   ├── modules/
│   │   ├── teams/
│   │   │   ├── teams.controller.ts            # CRUD + sync handler (exists, extend)
│   │   │   ├── teams.service.ts               # Business logic (exists, extend)
│   │   │   ├── teams.repository.ts            # DB access (exists, extend)
│   │   │   ├── teams.routes.ts                # Route definitions (exists, extend)
│   │   │   └── teams.dto.ts                   # Zod schemas (exists, extend)
│   │   └── sync/
│   │       ├── sync.service.ts                # api-football HTTP client (exists, rewrite)
│   │       ├── sync.routes.ts                 # Sync routes (exists, extend)
│   │       └── api-football.client.ts         # NEW: typed HTTP client for api-football
│   └── routes/
│       └── admin.routes.ts                    # Already mounts teams + sync (exists)

frontend/
├── src/
│   ├── api/admin/
│   │   └── teams.ts                           # API client (exists, extend with sync method)
│   ├── app/admin/teams/
│   │   ├── page.tsx                           # Team list + CRUD (exists, extend with sync UI)
│   │   └── [id]/page.tsx                      # NEW: Team detail with player roster
│   └── components/admin/
│       └── teams/
│           ├── TeamSyncPanel.tsx               # NEW: League selector + sync trigger
│           └── PlayerRoster.tsx                # NEW: Player list with avatars
```

**Structure Decision**: Web application with existing `backend/` + `frontend/` structure. Both the `teams` and `sync` modules already exist and will be extended. One new frontend page (`[id]/page.tsx`) and two new components are needed.

## Complexity Tracking

No constitution violations. All changes follow the existing layered architecture and module patterns.

## Implementation Gaps (from Research)

| Gap | Location | Effort |
|-----|----------|--------|
| Duplicate name validation on create | `teams.service.ts` | Small — add name check before save |
| Real api-football HTTP client | `sync/api-football.client.ts` (new) | Medium — typed fetch wrapper with error handling |
| Sync service with league filter + upsert | `sync/sync.service.ts` | Medium — league-filtered pull, team/player upsert |
| Sync route with leagueId body param | `sync/sync.routes.ts` + DTO | Small — new Zod schema, route handler |
| Sync trigger in teams controller | `teams.controller.ts` | Small — delegate to sync service |
| Frontend sync UI panel | `TeamSyncPanel.tsx` (new) | Medium — league selector, trigger button, progress, summary |
| Frontend API client sync method | `api/admin/teams.ts` | Small — add `sync()` method |
| Team detail page with player roster | `[id]/page.tsx` (new) | Medium — fetch team with players, render roster |
| Player roster component | `PlayerRoster.tsx` (new) | Small — table/list with default avatar fallback |
| Env config for api-football base URL | `config/env.ts` | Small — add `apiFootballBaseUrl` |
