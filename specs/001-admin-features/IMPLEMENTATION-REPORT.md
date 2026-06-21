# Implementation Report — Admin Features (001-admin-features)

Automated Spec-Kit run on branch base **main**. Built the full ADMIN surface of GoalPredict Live.

## What was built

### Backend (`backend/src/modules/`)
| Module | Endpoints (under `/api/v1/admin`) | UC / FR |
|---|---|---|
| `dashboard` | `GET /dashboard` | FR-09 |
| `teams` | `GET/POST /teams`, `GET/PATCH/DELETE /teams/:id`, players `POST/PATCH/DELETE /teams/:id/players[/:playerId]` | UC13, FR-14 |
| `matches` | `GET/POST /matches`, `GET/PATCH/DELETE /matches/:id`, `PUT /matches/:id/result`, `PUT /matches/criteria/:criterionId/result`, `POST /matches/:id/cancel` | UC06, FR-06 |
| `criteria` | `GET /criteria/match/:matchId`, `POST /criteria/match/:matchId`, `PATCH/DELETE /criteria/:id` | UC07, FR-07 |
| `scoring` | (internal) scoring + gold-payout + notification services | BR12–14, BR26–30, FR-15/16 |
| `users` | `GET /users`, `GET /users/:id`, `PATCH /users/:id/status`, `PATCH /users/:id/role` | Manage users, FR-10 |
| `comments` | `GET /comments`, `PATCH /comments/:id/status` | FR-08 |
| `uploads` | `POST /uploads` (multer, image ≤5MB) + static `/uploads/*` | UC12, FR-12 |
| `sync` | `POST /sync/matches` (manual trigger stub) | FR-13 |

Every admin route is guarded by `authenticate` + `requireRole('ADMIN')` in `routes/admin.routes.ts`
(defense in depth; BR10/BR11/AC-12-02). Layered `controller → service → repository`; Prisma only in
repositories via the singleton; Zod validation at the boundary; gold uses `Prisma.Decimal` end-to-end.

### Frontend (`frontend/src/`)
- Typed clients `api/admin/{client,types,teams,matches,users,comments,dashboard}.ts`.
- `components/admin/{AdminGuard,ui}.tsx`; `lib/format.ts` (VN dates `Asia/Ho_Chi_Minh`, gold 2 dp).
- Pages under `app/admin/`: dashboard, `teams`, `matches`, `matches/[id]` (criteria + result + winners
  panel), `users`, `comments`. Elite Pitch palette, Vietnamese UI, default team/player images in `public/`.

## Acceptance-criteria trace
- **AC-06-01/02** create/update with home≠away enforced (BR08) in `matches.service.assertTeams`.
- **AC-06-03 / BR23** delete with related data → auto-cancel instead of hard delete (`matches.service.remove`).
- **AC-07-01/02/03** criteria CRUD with fairness lock once match leaves SCHEDULED (`criteria.service.assertEditable`).
- **AC-12-01/02/03** upload stores URL, non-admin blocked by RBAC, invalid type / >5MB rejected (`lib/upload.ts`, `uploads.routes.ts`).
- **AC-13-01/02/03** team becomes selectable; referenced team deactivated not deleted; default image fallback in FE.
- **AC-14-01/02** scoring produces MATCH_WON/MATCH_LOST; cancel produces MATCH_CANCELLED + voids participations.

### Gold payout verified (BR26–28)
Unit-checked `goldPayoutService.payout`:
- single top scorer takes whole pool; tie splits evenly (300 → 150/150);
- all-zero scores → no winner, pool void (0 each);
- 3-way tie 300 → 100.00 each (2-dp rounding, `Prisma.Decimal`).
Scoring runs once per match inside `prisma.$transaction` with an in-transaction idempotency guard.

## Verification results
- Backend: `tsc -p tsconfig.json` ✅ clean · `eslint src/**/*.ts` ✅ no errors.
- Frontend: `next build` ✅ compiled (13 routes, all `/admin/*` pages) · `next lint` ✅ no warnings/errors.

## Dependencies added
`multer` + `@types/multer` (backend) for media upload.

## Important caveats for the maintainer
1. **Git not committed.** The repository's `.git/index` in the working folder was already corrupt and the
   folder mount disallows unlinking lock files, so the branch could not be switched/committed from here.
   Latest **main** was pulled into a clean clone for reference; the new code lives in the working tree and is
   ready for you to `git add`/commit (suggested branch `feature/admin-features`). The working tree already
   contained the `feature/claude-auth` work (auth module), which the admin code builds on top of.
2. **Prisma engine download is network-restricted** in the build sandbox; the existing generated client in
   `backend/node_modules` was reused to typecheck. Run `npm install` locally (with network) before running.
3. Run `npm run prisma:migrate` is **not** required — no schema change was made (the schema already modeled
   gold-per-match, participations, and notifications).
4. Leftover empty file `backend/src/_wtest_new.txt` (a debug artifact the sandbox could not delete) — safe to remove.
