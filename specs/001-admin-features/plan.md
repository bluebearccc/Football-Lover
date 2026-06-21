# Implementation Plan — 001-admin-features

## Architecture
Layered backend per `docs/.../layered-architecture.puml`: `controller → service → repository`,
Zod DTOs at the controller boundary, Prisma accessed only in repositories via the singleton
`src/lib/prisma.ts`. Every admin route is guarded by `authenticate` + `requireRole('ADMIN')`
and mounted under `/api/v1/admin/*`. Frontend is Next.js App Router; admin pages live under
`src/app/admin/*` and talk to the backend exclusively through typed clients in `src/api/admin/*`.

## Backend modules (`backend/src/modules/`)
| Module | Files | UC | Notes |
|---|---|---|---|
| `teams` | controller, service, repository, routes, dto | UC13/UC12 | CRUD + deactivate guard, players, logo URL |
| `matches` | controller, service, repository, routes, dto | UC06 | CRUD, entryGold, cancel, set criterion result, update result |
| `criteria` | controller, service, repository, routes, dto | UC07 | CRUD per match |
| `scoring` | scoring.service, gold-payout.service, notification.service, repository | BR12–30 | idempotent `$transaction`, Decimal money |
| `users` | controller, service, repository, routes, dto | Manage users | list/lock/unlock/role |
| `comments` | controller, service, repository, routes, dto | FR-08 | admin hide/delete |
| `uploads` | controller, routes, multer config | UC12 | image upload, served at `/uploads` |
| `dashboard` | controller, service, routes | FR-09 | system counts |
| `sync` (stub) | sync.service | FR-13 | manual refresh hook, server-side creds |

New shared utilities: `src/utils/decimal.ts` (rounding helper), `src/lib/upload.ts` (multer),
`src/middleware/upload.ts`. `src/routes/index.ts` mounts a single `adminRoutes` aggregator.

## Money / scoring rules (critical)
- Gold uses Prisma `Decimal` end-to-end; round to 2 dp only at payout split.
- Scoring guarded for idempotency: skip if `MatchParticipation` rows already exist for the match.
- Whole scoring + payout + notifications + status change run in one `prisma.$transaction`.
- Leaderboard eligibility (≥ 2 participants) flagged but leaderboard read is out of scope.

## Frontend (`frontend/src/`)
- `api/admin/{teams,matches,criteria,users,comments,dashboard}.ts` typed clients (use `apiFetch`).
- `lib/session.ts` already provides token; add `lib/admin-guard.ts` (client redirect if not ADMIN).
- `app/admin/layout.tsx` (sidebar nav + guard), pages: `admin` (dashboard), `admin/teams`,
  `admin/matches`, `admin/users`, `admin/comments`. Reusable components in `components/admin/*`.
- Elite Pitch palette only; gold shown to 2 decimals; Vietnamese UI; `Asia/Ho_Chi_Minh` dates.

## Verification
- `npm run build` (tsc) + `npm run lint` in `backend/`.
- `npm run build` + `npm run lint` in `frontend/`.
- Manual trace of acceptance criteria in `tasks.md`.

## Dependencies added
`multer` + `@types/multer` (backend) for media upload (pure-JS, no native build).
