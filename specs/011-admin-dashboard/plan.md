# Implementation Plan: Admin Dashboard

**Branch**: `011-admin-dashboard` | **Date**: 2026-06-26 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/011-admin-dashboard/spec.md`

## Summary

Admin dashboard overview page for the GoalPredict Live platform. An existing basic dashboard implementation is already in place (backend stats + recent matches, frontend page with metric cards and static chart). This plan covers the **gaps** between the existing implementation and the spec: system activity logging (new `AdminLog` entity), league popularity breakdown, dynamic traffic chart, periodic polling (30–60s auto-refresh), date range filtering, CSV export, and gold pool metric. The moderation queue is UI-only with empty state (backend deferred).

### Existing vs. Gap Analysis

| Feature | Current State | Gap |
|---------|--------------|-----|
| Overview metrics (users, matches, predictions, comments) | Built (dashboard.service stats) | Need to add gold pool total metric |
| Recent activity table | Built (recentMatches from Match table) | Replace with proper AdminLog entries; current table shows match status, not admin actions |
| Traffic chart | Built (static hardcoded bars) | Replace with dynamic data from predictions/matches by hour/day |
| League/market popularity | Not built (shows "platform stats" instead) | New: prediction breakdown by league |
| Moderation queue | Built (hidden comments) | Already functional as hidden comments queue — no changes needed |
| Periodic polling | Not built (single load) | New: auto-refresh every 30–60s |
| Date range filter | Not built (filter button exists, non-functional) | New: functional date filter |
| CSV export | Not built (button links to /admin/matches) | New: CSV export endpoint + download |
| System logging | Not built | New: AdminLog model + logging middleware for admin actions |
| Admin sidebar/layout | Built | No changes needed |

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)

**Primary Dependencies**: Express 4.x, Prisma 6.x, Next.js 14.2.x, TailwindCSS

**Storage**: PostgreSQL (schema: `backend/prisma/schema.prisma`)

**Testing**: Manual verification via dev server (no automated test framework configured)

**Target Platform**: Web (desktop + mobile responsive)

**Project Type**: Web application (frontend + backend)

**Performance Goals**: Dashboard load < 3 seconds; auto-refresh every 30–60 seconds

**Constraints**: Prisma v6 pinned; Next.js 14.2.x pinned; gold values as Decimal

**Scale/Scope**: Single admin dashboard page + 1 new backend module (admin-log) + enhancements to existing dashboard module

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I — Spec-Driven Development
- [x] All planned work traces to spec FR-001 through FR-017 and clarifications
- [x] No features beyond spec scope introduced
- [x] AdminLog entity is new (not in ER diagram) but explicitly scoped in spec clarifications — requires schema.prisma update

### Principle II — Layered Architecture & Module Structure
- [x] New `admin-log` module follows standard shape: controller, service, repository, routes, dto
- [x] Existing `dashboard` module enhancements stay in controller→service→repository layers
- [x] No Prisma calls in controllers or services bypassing repository

### Principle III — Contract-First APIs & Validation
- [x] New endpoints validated with Zod DTOs
- [x] Errors raised as ApiError
- [x] All admin routes behind `authenticate` + `requireRole('ADMIN')`

### Principle IV — Frontend Discipline
- [x] Identify matching screen folders:
  - `stitch_goalpredict_live_dashboard/admin_dashboard/` — primary reference
- [x] Plan reflects mockup layout/visuals (metric cards, traffic chart, league markets, logs table, moderation queue)
- [x] Existing implementation already closely follows the mockup; enhancements maintain the same visual structure
- [x] No new tokens needed — existing tailwind.config.ts covers all required design tokens
- [x] Mockup shows "Top Performing Markets" (leagues) and "Platform Revenue" (gold) — spec uses same concept. Current implementation diverges (shows "platform stats" instead of markets) — plan corrects this to match mockup.

### Principle V — Quality Gates
- [x] `npm run build` + `npm run lint` in both `backend/` and `frontend/` before completion
- [x] All new code traces to spec requirements

**UI baseline (Principle IV) — screen mapping:**

| Screen Element | Mockup Source | Implementation Target |
|---------------|---------------|----------------------|
| Metric cards (4) | `admin_dashboard/screen.png` rows 1 | Enhance existing cards: replace "comments" card with "gold pool" |
| Traffic chart | `admin_dashboard/screen.png` center-left | Replace static bars with dynamic hourly/daily data |
| Top Performing Markets | `admin_dashboard/screen.png` center-right | New: replace "Thống kê nền tảng" with league breakdown |
| Recent System Logs | `admin_dashboard/screen.png` bottom-left | Replace recentMatches table with AdminLog entries |
| Moderation Queue | `admin_dashboard/screen.png` bottom-right | Already implemented (hidden comments) — keep as-is |

## Project Structure

### Documentation (this feature)

```text
specs/011-admin-dashboard/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── admin-dashboard-api.md
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
backend/
├── prisma/
│   └── schema.prisma              # Add AdminLog model
├── src/
│   ├── modules/
│   │   ├── dashboard/
│   │   │   ├── dashboard.controller.ts  # Enhance: add traffic, leagues, export endpoints
│   │   │   ├── dashboard.service.ts     # Enhance: add traffic, leagues, gold, export logic
│   │   │   ├── dashboard.repository.ts  # New: extract Prisma queries
│   │   │   ├── dashboard.routes.ts      # Enhance: add new route handlers
│   │   │   └── dashboard.dto.ts         # New: Zod schemas for query params
│   │   └── admin-log/
│   │       ├── admin-log.controller.ts  # New
│   │       ├── admin-log.service.ts     # New: create log + query log + cleanup
│   │       ├── admin-log.repository.ts  # New
│   │       ├── admin-log.routes.ts      # New: GET /admin/logs
│   │       └── admin-log.dto.ts         # New
│   └── middleware/
│       └── admin-logger.ts             # New: middleware to log admin actions

frontend/
├── src/
│   ├── api/admin/
│   │   ├── dashboard.ts               # Enhance: add traffic, leagues, export, polling
│   │   └── types.ts                   # Enhance: add new response types
│   └── app/admin/
│       └── page.tsx                   # Enhance: dynamic chart, leagues, logs, polling, filter, export
```

**Structure Decision**: Web application with existing `backend/` + `frontend/` structure. New `admin-log` module follows the established module pattern. Dashboard module enhanced in-place. No new projects or structural changes.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| AdminLog entity not in ER diagram | Spec explicitly requires admin action logging (clarification Q3) | Cannot derive admin action history from existing Match/User tables |
| Dashboard module missing repository layer | Existing code calls Prisma directly in service — needs repository for Principle II compliance | Adding repository now as part of enhancement |
