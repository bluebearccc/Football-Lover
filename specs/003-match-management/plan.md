# Implementation Plan: Match Management

**Branch**: `003-match-management` | **Date**: 2026-06-22 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/003-match-management/spec.md`

## Summary

Admin match lifecycle management (UC06/UC07): CRUD matches, manage prediction criteria, update results, trigger scoring with gold payout, cancel matches, and sync data from api-football. The backend modules (`matches`, `criteria`, `scoring`, `sync`) and frontend pages (`/admin/matches`, `/admin/matches/[id]`) are **already implemented**. This plan identifies gaps relative to the spec/clarifications and defines the work to close them.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)

**Primary Dependencies**: Express 4.x, Prisma 6.x, Zod (backend); Next.js 14.2.x, TailwindCSS (frontend)

**Storage**: PostgreSQL via Prisma ORM (schema complete for Match, PredictionCriterion, MatchParticipation, Notification)

**Testing**: Manual validation + `npm run build` (typecheck) + `npm run lint`

**Target Platform**: Web (server: Node.js/Express :4000; client: Next.js :5173)

**Project Type**: Web application (fullstack)

**Performance Goals**: Match list/details < 2s; scoring < 2s; API calls < 1s (P95)

**Constraints**: Gold uses Prisma Decimal (no floating-point); scoring idempotent; match status state machine enforced

**Scale/Scope**: ~100 users, ~50 matches, 5 criteria/match, 5–20 concurrent users

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spec-Driven Development | ✅ PASS | All behavior traces to SRS UC06/UC07/FR-06/FR-07/FR-13/FR-15, BR07–BR14, BR23, BR26–BR30 |
| II. Layered Architecture | ✅ PASS | modules/matches (controller→service→repository), modules/criteria (same), modules/scoring (service→repository) |
| III. Contract-First APIs | ✅ PASS | Zod DTOs for all inputs; ApiError for errors; authenticate+requireRole('ADMIN') on all routes |
| IV. Frontend Discipline | ✅ PASS | See UI baseline section below |
| V. Quality Gates | ✅ PASS | build + lint required before completion |

**UI baseline (Principle IV):**

- [x] Matching screen folder: `stitch_goalpredict_live_dashboard/admin_match_management/`
- [x] Plan reflects layout from mockup — existing frontend pages follow the admin_match_management screen layout
- [x] Tokens from Elite Pitch palette used (`pitch`, `gold`, `ink` families in tailwind.config.ts)
- [x] No mockup ↔ spec conflicts identified

## Project Structure

### Documentation (this feature)

```text
specs/003-match-management/
��── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contracts)
└── tasks.md             # Phase 2 output (via /speckit-tasks)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── modules/
│   │   ├── matches/         # CRUD + result update (matches.controller/service/repository/routes/dto)
│   │   ├── criteria/        # Prediction criteria CRUD (criteria.controller/service/repository/routes/dto)
│   │   ├── scoring/         # Scoring engine + gold payout + notifications (scoring.service/repository, gold-payout.service, notification.service)
│   ���   └── sync/            # api-football integration (sync.service/routes, api-football.client)
│   ├── routes/
│   │   ├── index.ts         # Mount points
│   │   └── admin.routes.ts  # Admin guard + mount modules
│   └── middleware/
│       ├── auth.ts          # authenticate + requireRole
│       └── validate.ts      # validateBody/validateQuery
└── prisma/
    └── schema.prisma        # Match, PredictionCriterion, MatchParticipation, Notification models

frontend/
├── src/
│   ├── app/admin/
│   ���   ├── matches/page.tsx       # Match list + create form
│   │   └��─ matches/[id]/page.tsx  # Match detail: criteria, result entry, scoring, winners
│   ├── api/admin/
│   │   ├── matches.ts             # adminMatchesApi + adminCriteriaApi
│   │   └── types.ts               # Shared types
│   └── components/admin/ui/       # Shared UI components (Badge, Banner, Button, Card, etc.)
```

**Structure Decision**: Web application with existing layered backend modules and Next.js App Router frontend. All necessary file structures exist; work focuses on gap-closing.

## Gap Analysis (Spec vs. Current Implementation)

### Backend Gaps

| # | Gap | Spec Requirement | Current State | Priority |
|---|-----|-----------------|---------------|----------|
| B1 | Two-step "Finish & Score" with validation | FR-008: Block scoring if any criteria lack result_team | `updateResult` immediately triggers scoring without checking unresolved criteria | P1 |
| B2 | Match list sorting param | FR-022: Sort by match_time | Repository always sorts by `matchTime: 'desc'` — no client-controlled sort direction | P2 |
| B3 | Match sync from api-football (schedules/scores) | FR-017: Sync match schedules and scores | `syncService` only syncs teams/players, not matches | P3 |
| B4 | Admin confirmation for sync conflicts | FR-018: Preserve Admin data or require confirmation | Not implemented — sync overwrites without checks | P3 |

### Frontend Gaps

| # | Gap | Spec Requirement | Current State | Priority |
|---|-----|-----------------|---------------|----------|
| F1 | Status filter UI | FR-022: Filter by status | API supports `status` param but the UI doesn't expose a filter control | P1 |
| F2 | Sort toggle | FR-022: Sort by match_time | No sort direction toggle in UI | P2 |
| F3 | Two-step scoring UX with validation warning | FR-008: Warn if criteria lack results | No pre-flight check before "Chốt kết quả" — scoring fires immediately | P1 |
| F4 | Match edit form (inline or modal) | FR-005: Edit SCHEDULED match teams/time/gold | No edit UI — only "Quản lý" link to detail page | P2 |

## Complexity Tracking

No constitution violations to justify. All gaps are straightforward additions to existing modules.

## Implementation Priority

1. **P1 (Must)**: B1 + F3 — Two-step scoring validation (backend guard + frontend warning)
2. **P1 (Must)**: F1 — Status filter UI for match list
3. **P2 (Should)**: F4 — Match edit form on detail page
4. **P2 (Should)**: B2 + F2 — Sort direction support
5. **P3 (Nice)**: B3 + B4 — Match sync from api-football (deferred to separate phase if needed)
