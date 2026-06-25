# Implementation Plan: Statistics & Leaderboard

**Branch**: `008-stats-leaderboard` | **Date**: 2026-06-26 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/008-stats-leaderboard/spec.md`

## Summary

Implement UC09 (View Statistics/Leaderboard) by extending the existing `leaderboard` backend module with win streak, accuracy, pagination, and tiebreaker support, adding a `/me` endpoint for current user rank, filtering match statistics visibility by match status (BR21/BR22), and building the frontend leaderboard page with podium and ranking table per the Stitch mockup.

## Technical Context

**Language/Version**: TypeScript (strict mode, both frontend and backend)

**Primary Dependencies**: Next.js 14.2.x (App Router), Express, Prisma 6.x, Zod, TailwindCSS

**Storage**: PostgreSQL — all data derived from existing tables (Statistic, MatchParticipation, Prediction, User, Match). No migration needed.

**Testing**: `npm run build` (typecheck) + `npm run lint` in both `backend/` and `frontend/`

**Target Platform**: Web browser (desktop 60%, mobile web 40%)

**Project Type**: Web application (frontend + backend)

**Performance Goals**: Leaderboard page load < 2s (P95), stats display < 2s (P95) per SRS NFR

**Constraints**: Win streak computed at query time (no denormalization). Accuracy computed in SQL. Pagination offset-based (pageSize max 100).

**Scale/Scope**: ~100 users, ~50 matches, 20 items/page default

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-design Check

- [x] **Principle I (Spec-Driven)**: All requirements trace to UC09, FR-09, BR19, BR20, BR29, AC-09-01/02/03 in the SRS. No invented behavior.
- [x] **Principle II (Layered Architecture)**: Extending existing `leaderboard` module which already follows controller → service → repository → routes → dto pattern.
- [x] **Principle III (Contract-First)**: API contract defined in `contracts/leaderboard-api.md`. Zod DTOs for validation. Errors via `ApiError`.
- [x] **Principle IV (Frontend Discipline)**: Mockup baseline identified (see UI baseline below). Components follow UC09 frontend class diagram.
- [x] **Principle V (Quality Gates)**: `npm run build` + `npm run lint` required in both packages before completion.

**UI baseline (Principle IV):**

- [x] Matching screen folder: `stitch_goalpredict_live_dashboard/leaderboard/` — `screen.png` + `code.html` reviewed.
- [x] Plan reflects mockup layout: podium (top 3 cards), filter tabs (Global/Friends/Weekly/All-Time), ranking table (Rank/Predictor/Points/Win Streak/Accuracy), pagination, current-user highlight, mobile bottom nav.
- [x] Missing tokens to add to `tailwind.config.ts`: podium gradient colors (`podium-gold: #FFD700`, `podium-silver: #C0C0C0`, `podium-bronze: #CD7F32`).
- [x] Mockup ↔ spec conflicts: mockup shows "pts" (points) as primary ranking metric, but SRS BR20 ranks by "matches won this month". Resolution: rank by win count (spec wins for behavior), display points as secondary info (mockup wins for visuals). Filter tabs "Friends"/"Weekly"/"All-Time" are visual placeholders — only "Global" (current month) is functional in v1.

### Post-design Check

- [x] **Principle I**: research.md confirms all decisions trace to spec. No invented behavior.
- [x] **Principle II**: Module structure confirmed — extending `backend/src/modules/leaderboard/` with same file pattern.
- [x] **Principle III**: Contract in `contracts/leaderboard-api.md` defines both endpoints, query params, response shapes, and error codes.
- [x] **Principle IV**: data-model.md confirms no schema changes. Component tree: `LeaderboardPage → Podium + LeaderboardTable + LeaderboardFilters`, using `StatisticsApiClient` (mapped to `src/api/leaderboard.ts`).
- [x] **Principle V**: quickstart.md includes build verification commands.

## Project Structure

### Documentation (this feature)

```text
specs/008-stats-leaderboard/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: research decisions
├── data-model.md        # Phase 1: data model analysis
├── quickstart.md        # Phase 1: validation guide
├── contracts/
│   └── leaderboard-api.md  # API contract
└── tasks.md             # Phase 2 output (created by /speckit-tasks)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── modules/
│   │   └── leaderboard/           # EXTEND existing module
│   │       ├── leaderboard.controller.ts  # Add getMe handler
│   │       ├── leaderboard.service.ts     # Add accuracy, winStreak, pagination, /me logic
│   │       ├── leaderboard.repository.ts  # Extend SQL with accuracy, winStreak, offset pagination
│   │       ├── leaderboard.routes.ts      # Add GET /me route
│   │       └── leaderboard.dto.ts         # Extend query schema with page/pageSize
│   └── modules/
│       └── public-matches/
│           └── public-matches.service.ts  # Filter statistics for SCHEDULED matches

frontend/
├── src/
│   ├── app/
│   │   └── (main)/
│   │       └── leaderboard/
│   │           └── page.tsx               # NEW: Leaderboard page
│   ├── components/
│   │   └── leaderboard/                   # NEW: component directory
│   │       ├── Podium.tsx                 # Top 3 podium cards
│   │       ├── LeaderboardTable.tsx       # Ranking table with pagination
│   │       └── LeaderboardFilters.tsx     # Filter tabs (Global active, others disabled)
│   ├── api/
│   │   └── leaderboard.ts                # NEW: API client for leaderboard endpoints
│   └── tailwind.config.ts                # Add podium gradient tokens
```

**Structure Decision**: Web application structure (backend + frontend). Backend extends existing module in `backend/src/modules/leaderboard/`. Frontend adds new page and components under the `(main)` route group, following the existing pattern.

## Complexity Tracking

No constitution violations. All decisions align with existing patterns and principles.
