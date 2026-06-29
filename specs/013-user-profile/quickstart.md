# Quickstart: Validating User Profile and Prediction History (UC10)

## Prerequisites

- Backend running (`cd backend && npm run dev`, port 4000) against a PostgreSQL instance
  with at least one user that has finished-match `MatchParticipation` rows, and one user
  with zero participations (for the empty-state scenario).
- Frontend running (`cd frontend && npm run dev`, port 5173).
- One Admin-role account and one Registered-User account.

## Story 1 + 2 — Self-service profile and history (already implemented; regression-check after the stats fix)

1. Log in as the Registered User with finished-match history.
2. Open `/profile`.
   - **Expect**: display name, email, join date, all-time points, current-month rank (or
     "not ranked yet"), and stats card showing `totalMatches`/`totalWins`/`accuracy`/
     `totalGoldWon` — `totalMatches` MUST equal only `FINISHED` matches the user participated
     in, not in-progress ones (verify against a fixture with a `LIVE` match the user also
     predicted on — it must NOT inflate the count after the fix in this feature).
   - **Expect**: a 5-item "recent history" preview with a link to the full history.
3. Click through to `/history`.
   - **Expect**: full paginated list of all finished-match results, ordered most-recent-first;
     paging controls work past 5 items.
4. Log in as the Registered User with zero finished-match participations.
   - **Expect**: empty-state message on both `/profile` stats/history and `/history`, no
     error, no misleading zeros presented as real data.
5. Let the session token expire (or clear it) and attempt to open `/profile` or `/history`.
   - **Expect**: redirect to login.

## Story 3 — Admin support view (net-new frontend work in this feature)

1. Log in as Admin, open the admin user-management list (`/admin/users`).
2. Use the new per-row action to open a target user's detail/profile (new `[id]` route).
   - **Expect**: the same profile fields and stats as that user's own `/profile`, and the same
     5-item preview + link to a paginated full history, rendered read-only (no edit controls
     for display name/role/ban/etc. — those remain on the existing edit-user modal from
     `012-manage-users`).
3. As a non-Admin Registered User, attempt to call
   `GET /api/v1/admin/users/:id/profile` for another user's ID directly (e.g., via browser
   devtools/curl with the Registered User's token).
   - **Expect**: `403` denied.
4. Request a profile for a non-existent user ID as Admin.
   - **Expect**: `404` not-found state, not a crash or 500.

## Backend-only check (the stats fix)

1. Seed/find a user with: 2 `FINISHED` participations (1 win) and 1 `LIVE` participation.
2. `GET /api/v1/profile/me` as that user.
   - **Expect**: `stats.totalMatches === 2` (not 3) after this feature's fix to
     `profileRepository.getStats`.

## Gates before reporting done

- `cd backend && npm run build && npm run lint`
- `cd frontend && npm run build && npm run lint`
