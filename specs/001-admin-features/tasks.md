# Tasks — 001-admin-features

Status legend: [x] done · [~] partial · [ ] todo

## Backend
- [x] T01 `utils/decimal.ts` — Decimal pool/split rounding helper (BR28)
- [x] T02 `teams` module — CRUD, deactivate guard (AC-13-01/02), players, logo
- [x] T03 `criteria` module — CRUD per match (AC-07-01/02/03)
- [x] T04 `matches` module — CRUD, entryGold, cancel, set criterion result, update result (AC-06-01/02/03)
- [x] T05 `scoring` module — scoring.service + gold-payout.service + notification.service, idempotent `$transaction` (BR12–30, AC-14-01/02)
- [x] T06 `users` module — list/lock/unlock/role
- [x] T07 `comments` module — admin hide/soft-delete (FR-08)
- [x] T08 `uploads` module — multer image upload, MIME + 5MB validation (AC-12-01/02/03)
- [x] T09 `dashboard` module — system counts (FR-09)
- [x] T10 `sync` service stub — manual refresh hook (FR-13)
- [x] T11 mount all admin routes in `routes/index.ts` under `/api/v1/admin`

## Frontend
- [x] T12 `api/admin/*` typed clients
- [x] T13 `lib/admin-guard.ts` + `app/admin/layout.tsx` (RBAC redirect, sidebar)
- [x] T14 `app/admin/page.tsx` dashboard
- [x] T15 `app/admin/teams/page.tsx` + team editor/components
- [x] T16 `app/admin/matches/page.tsx` + match editor, result + criterion result + winners panel
- [x] T17 `app/admin/users/page.tsx`
- [x] T18 `app/admin/comments/page.tsx`

## Verification
- [x] T19 backend `npm run build` + `npm run lint`
- [x] T20 frontend `npm run build` + `npm run lint`
- [x] T21 acceptance-criteria trace recorded in summary report
