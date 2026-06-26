# Implementation Plan: Manage Users

**Branch**: `012-manage-users` | **Date**: 2026-06-26 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/012-manage-users/spec.md`

## Summary

Admin user management: paginated user list with search/filters, ban/unban with mandatory reason, edit user (display name + role) via modal, admin-triggered password reset, and user statistics overview. Builds on the existing `users` backend module and `admin/users` frontend page, adding missing features (ban reason, edit endpoint, password reset, stats, session invalidation) and redesigning the frontend to match the Stitch mockup (Elite Pitch dark theme, glass panels, stats bento).

## Technical Context

**Language/Version**: TypeScript (strict mode, both frontend and backend)

**Primary Dependencies**: Express + Prisma 6 (backend), Next.js 14.2.x App Router + TailwindCSS (frontend)

**Storage**: PostgreSQL via Prisma ORM (`backend/prisma/schema.prisma`)

**Testing**: Manual validation via API + browser (see `quickstart.md`)

**Target Platform**: Web (responsive: 480/768/1024/1440 breakpoints)

**Project Type**: Web application (backend API + frontend SPA)

**Performance Goals**: User list loads in <2s, ban/unban completes in <3s, search debounced ~300ms

**Constraints**: Page size max 100, 10K+ users without degradation, Admin-only access

**Scale/Scope**: ~12K users, single admin interface screen with 5 sub-features

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I — Spec-Driven Development
- [x] Feature traceable to SRS: Admin role manages users, locks violating accounts (SRS line 621, role table line 86)
- [x] No behavior invented outside spec — all FRs map to SRS Admin capabilities
- [x] No edits to `docs/` directory

### Principle II — Layered Architecture & Module Structure
- [x] Backend module `users` follows controller→service→repository pattern (already exists)
- [x] New endpoints follow same layered pattern
- [x] No Prisma calls outside repository layer

### Principle III — Contract-First APIs & Validation
- [x] All inputs validated with Zod DTOs
- [x] Errors use `ApiError`
- [x] Routes guarded with `authenticate` + `requireRole('ADMIN')`
- [x] Contracts documented in `contracts/api.md`

### Principle IV — Frontend Discipline
- [x] UI baseline on Stitch mockups (see below)
- [x] API calls through `src/api/admin/users.ts` client
- [x] Elite Pitch palette tokens used

### Principle V — Quality Gates & Traceability
- [x] `npm run build` + `npm run lint` in both folders before completion
- [x] Every feature traces to an FR in the spec

**UI baseline (Principle IV) — required when the feature touches the frontend:**

- [x] Matching screen folder: `stitch_goalpredict_live_dashboard/admin_user_management/`
- [x] Plan reflects mockup layout: header with title + "Add User" button (deferred), stats bento (4 cards), filter tabs + search bar, data table with action columns, pagination
- [x] Design tokens from `elite_pitch/DESIGN.md` used; mockup color values already in `tailwind.config.ts` (verified: `primary`, `secondary`, `tertiary`, `surface-*`, `on-surface-*` all present)
- [x] No mockup ↔ spec conflicts detected. Mockup shows "Banned" label → maps to `LOCKED` enum, displayed as "Khoá" in Vietnamese. Mockup "Add User" button → deferred per spec assumptions.

## Project Structure

### Documentation (this feature)

```text
specs/012-manage-users/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 research decisions
├── data-model.md        # Schema changes and data model
├── quickstart.md        # Validation guide
├── contracts/
│   └── api.md           # API endpoint contracts
└── tasks.md             # Phase 2 output (via /speckit-tasks)
```

### Source Code (repository root)

```text
backend/
├── prisma/
│   └── schema.prisma            # Add banReason, lastActiveAt to User
├── src/
│   ├── middleware/
│   │   └── auth.ts              # Add LOCKED status check to authenticate
│   └── modules/
│       ├── users/
│       │   ├── users.controller.ts  # Add editUser, resetPassword, getStats
│       │   ├── users.service.ts     # Add edit, resetPassword, stats logic
│       │   ├── users.repository.ts  # Add update, stats queries
│       │   ├── users.routes.ts      # Add PATCH /:id, POST /:id/reset-password, GET /stats
│       │   └── users.dto.ts         # Add editUserSchema, setStatusSchema (with reason)
│       └── admin-log/               # No changes (reuse existing)
│
frontend/
├── src/
│   ├── api/admin/
│   │   ├── users.ts             # Add editUser, resetPassword, getStats methods
│   │   └── types.ts             # Add accuracy, banReason to AdminUser; add UserStats type
│   ├── app/admin/users/
│   │   └── page.tsx             # Rewrite to match Stitch mockup
│   └── components/admin/users/
│       ├── UserStatsCards.tsx    # Stats bento grid (4 cards)
│       ├── UserFilters.tsx      # Filter tabs + debounced search
│       ├── UserTable.tsx        # Data table with action column
│       ├── UserPagination.tsx   # Pagination controls
│       ├── BanModal.tsx         # Ban confirmation with reason field
│       ├── EditUserModal.tsx    # Edit display name + role modal
│       └── ConfirmModal.tsx     # Generic confirmation dialog (unban, reset password)
```

**Structure Decision**: Web application with existing backend `modules/users/` and frontend `app/admin/users/`. Backend module is enhanced in-place. Frontend page is rewritten with extracted components to match the Stitch mockup.

## Complexity Tracking

No constitution violations. All gates pass.
