# Implementation Plan: Match Viewing

**Branch**: `004-match-viewing` | **Date**: 2026-06-22 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/004-match-viewing/spec.md`

## Summary

Implement public match list (UC03) and match detail (UC04) viewing for all visitors (Guest, User, Admin). This includes a new public backend module with two endpoints (`GET /api/v1/matches` and `GET /api/v1/matches/:id`), and two frontend pages (`/matches` list and `/matches/[id]` detail) following the Stitch mockup layouts. The feature enforces prediction visibility rules (BR21/BR22): other users' predictions are hidden before kickoff and revealed after. No schema changes required — the feature is read-only against existing data.

## Technical Context

**Language/Version**: TypeScript (strict mode, both sides)

**Primary Dependencies**:
- Backend: Express + Prisma 6.x + Zod
- Frontend: Next.js 14.2.x (App Router) + TailwindCSS

**Storage**: PostgreSQL (existing schema — no migration needed)

**Testing**: Manual validation per `quickstart.md`; `npm run build` + `npm run lint` as quality gates

**Target Platform**: Web browser (responsive: 480/768/1024/1440 breakpoints)

**Project Type**: Web application (backend API + frontend SPA)

**Performance Goals**: Match list < 2s, Match detail < 2s (SRS NFR P95)

**Constraints**: No real-time/WebSocket; page shows state at load time

**Scale/Scope**: ~100 users, ~50 matches, 5-20 concurrent users

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Principle I (Spec-Driven)**: All requirements trace to SRS UC03/UC04, FR-03/FR-04, AC-03-01..03, AC-04-01..03, BR21/BR22.

**Principle II (Layered Architecture)**: New `public-matches` module follows standard shape: `controller.ts → service.ts → repository.ts + routes.ts + dto.ts`.

**Principle III (Contract-First)**: API contract defined in `contracts/public-matches-api.md`. Zod DTOs validate query params. Errors use `ApiError`.

**Principle IV (Frontend Discipline)**: UI baselines on Stitch mockups. Components follow UC03/UC04 frontend class diagrams.

**Principle V (Quality Gates)**: `npm run build` + `npm run lint` in both `backend/` and `frontend/` before completion.

**UI baseline (Principle IV) — required when the feature touches the frontend:**

- [x] Identify the matching screen folder(s) under `stitch_goalpredict_live_dashboard/` for
      every screen this feature builds or changes, and list them here.
  - `stitch_goalpredict_live_dashboard/live_matches/` — match list page
  - `stitch_goalpredict_live_dashboard/match_details/` — match detail page
- [x] Plan reflects the layout/visuals from each screen's `screen.png` + `code.html` and the
      design tokens in `stitch_goalpredict_live_dashboard/elite_pitch/DESIGN.md` (no invented
      layout outside the mockups).
- [x] Any token a mockup needs but `frontend/tailwind.config.ts` lacks is captured as a planned
      `tailwind.config.ts` addition (not a hardcoded value).
  - No new tokens needed — all required tokens already present.
- [x] Mockup ↔ spec (SRS/class diagram) conflicts noted: spec wins for behavior/fields, mockup
      wins for visuals; irreconcilable conflicts flagged in Complexity Tracking, not silently resolved.
  - Mockup shows "POSSESSION", "SHOTS ON TARGET" stats → these are mockup decoration. The actual system uses PredictionCriterion-based statistics (HOME/AWAY votes per criterion). Visual bar layout from mockup is reused, but data is spec-driven (Statistic entity, not football stats).
  - Mockup shows "PREDICT" button on match cards → spec says prediction actions only for authenticated users; guests see "Match Details" only. Behavior follows spec.
  - Mockup shows odds/prices (e.g., "2.40", "3.50") → system uses binary HOME/AWAY selection, not odds. Visual layout adapted but data differs per spec.

## Project Structure

### Documentation (this feature)

```text
specs/004-match-viewing/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── public-matches-api.md
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── modules/
│   │   └── public-matches/        # NEW — public viewing endpoints
│   │       ├── public-matches.controller.ts
│   │       ├── public-matches.service.ts
│   │       ├── public-matches.repository.ts
│   │       ├── public-matches.routes.ts
│   │       └── public-matches.dto.ts
│   └── routes/
│       └── index.ts                # MODIFIED — mount /matches public routes

frontend/
├── src/
│   ├── app/
│   │   └── (main)/                 # NEW route group — shared layout with nav
│   │       ├── layout.tsx          # Sidebar + top bar + bottom nav (from mockup)
│   │       └── matches/
│   │           ├── page.tsx        # Match list page (UC03)
│   │           └── [id]/
│   │               └── page.tsx    # Match detail page (UC04)
│   ├── api/
│   │   └── matches.ts             # NEW — MatchApiClient
│   └── components/
│       └── matches/                # NEW — match viewing components
│           ├── MatchCard.tsx       # Match card for list
│           ├── MatchFilterBar.tsx  # Status + date filter tabs
│           ├── Pagination.tsx      # Page navigation controls
│           ├── TeamInfoPanel.tsx   # Team logo + name + score in detail
│           ├── CriteriaList.tsx    # Prediction criteria list
│           ├── StatsPanel.tsx      # Voting statistics bars
│           └── CommentList.tsx     # Public comments display
```

**Structure Decision**: Web application with `backend/` + `frontend/` separation. New module `public-matches` follows the layered architecture pattern established by `auth/` and admin `matches/` modules. Frontend uses App Router route groups for layout organization.

## Complexity Tracking

| Conflict | Resolution | Justification |
|----------|-----------|---------------|
| Mockup shows football statistics (possession, shots) | Use PredictionCriterion statistics (HOME/AWAY votes) instead | Spec-driven: the system's data model is based on criteria voting, not football match stats. Visual bar layout reused from mockup. |
| Mockup "PREDICT" button visible to all | Hide for guests, show only for authenticated users on SCHEDULED matches | Spec wins for behavior (FR-010, FR-011, AC-04-02). |
| Mockup shows odds/prices on criteria | Use binary HOME/AWAY selection UI without odds | Spec: system uses binary team selection (TeamSide enum), not odds-based predictions. |
