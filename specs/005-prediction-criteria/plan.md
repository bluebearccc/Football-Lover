# Implementation Plan: Prediction Criteria Management

**Branch**: `005-prediction-criteria` | **Date**: 2026-06-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/005-prediction-criteria/spec.md`

## Summary

Admin manages binary HOME/AWAY prediction criteria per match (CRUD + deactivate/reactivate + set results). Users view active criteria on match details. A partial backend implementation already exists in `backend/src/modules/criteria/`; this plan addresses the gaps: reactivation, deactivation lock enforcement, creation-order sorting (requires `createdAt` on PredictionCriterion), and frontend inline edit support.

## Technical Context

**Language/Version**: TypeScript (strict mode, both sides)

**Primary Dependencies**: Express + Prisma 6.x + Zod (backend), Next.js 14.2.x App Router + TailwindCSS (frontend)

**Storage**: PostgreSQL via Prisma ORM (`backend/prisma/schema.prisma`)

**Testing**: Manual validation via dev servers (backend :4000, frontend :5173); `npm run build` + `npm run lint` as quality gates

**Target Platform**: Web (responsive, Vietnamese locale, Asia/Ho_Chi_Minh timezone)

**Project Type**: Full-stack web application

**Performance Goals**: Criteria list loads within 2s on match detail; admin CRUD operations complete in <1s

**Constraints**: Prisma v6 pinned; Next.js 14.2.x pinned; no hard-delete for criteria with predictions

**Scale/Scope**: ~5 criteria/match, 5–10 predictions/user/month, 200 concurrent users (NFR)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I (Spec-Driven)**: All behavior traces to UC07 (SRS §4.1), FR-07 (SRS §4.3), BR04/BR09/BR12 (SRS §5.1). No invented behavior.
- **Principle II (Layered Architecture)**: Criteria module follows standard shape: `controller → service → repository → routes → dto`. Already exists at `backend/src/modules/criteria/`.
- **Principle III (Contract-First APIs)**: Zod DTOs exist (`criteria.dto.ts`); routes use `validateBody`. Auth via `authenticate + requireRole('ADMIN')` on admin routes.
- **Principle IV (Frontend Discipline)**: See UI baseline check below.
- **Principle V (Quality Gates)**: `npm run build` + `npm run lint` in both `backend/` and `frontend/` before completion.

**UI baseline (Principle IV) — required when the feature touches the frontend:**

- [x] Identify the matching screen folder(s): `stitch_goalpredict_live_dashboard/admin_point_rules_criteria/` (admin criteria management), `stitch_goalpredict_live_dashboard/match_details/` (user-facing criteria display)
- [x] Plan reflects the layout/visuals from each screen's `screen.png` + `code.html` and the design tokens in `elite_pitch/DESIGN.md`. Admin match detail page already implements the criteria section inline. User-facing CriteriaList component already follows match_details mockup.
- [x] No new tokens needed — existing Elite Pitch palette in `tailwind.config.ts` covers all required colors.
- [x] No mockup ↔ spec conflicts detected. The admin_point_rules_criteria mockup shows a "Point Rules Management" page with scoring weights/multipliers which is a broader scoring configuration screen — the per-match criteria CRUD is part of the admin match detail page, not a separate page.

## Project Structure

### Documentation (this feature)

```text
specs/005-prediction-criteria/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
backend/
├── prisma/
│   └── schema.prisma              # Add createdAt to PredictionCriterion
├── src/
│   ├── modules/
│   │   ├── criteria/               # EXISTING — extend
│   │   │   ├── criteria.controller.ts   # Add reactivate handler
│   │   │   ├── criteria.service.ts      # Add reactivate, fix deactivate lock
│   │   │   ├── criteria.repository.ts   # Fix ordering to createdAt
│   │   │   ├── criteria.routes.ts       # Add reactivate route
│   │   │   └── criteria.dto.ts          # Already complete
│   │   ├── matches/                # EXISTING — setCriterionResult already here
│   │   └── public-matches/         # EXISTING — fix criteria ordering
│   │       └── public-matches.repository.ts
│   └── routes/
│       └── admin.routes.ts          # Already mounts criteria

frontend/
├── src/
│   ├── api/
│   │   └── admin/
│   │       └── matches.ts           # Add reactivate to adminCriteriaApi
│   ├── app/
│   │   └── admin/
│   │       └── matches/
│   │           └── [id]/
│   │               └── page.tsx     # Add reactivate button, inline edit UI
│   └── components/
│       └── matches/
│           └── CriteriaList.tsx     # Already complete for user-facing
```

**Structure Decision**: Extends existing `criteria` module (backend) and admin match detail page (frontend). No new modules or pages needed.

## Complexity Tracking

No constitution violations detected. All changes extend existing modules within the established layered architecture.
