# Data Model: User Profile and Prediction History

No Prisma schema changes are required for this feature. The entities below are existing
`backend/prisma/schema.prisma` models (and their pre-existing relations); this document
records the fields and the one filtering rule this feature changes.

## User Profile (display-facing aggregate, not a stored entity)

Composed at request time by `profileService.getMyProfile` from three sources — no new model.

| Field | Source | Notes |
|---|---|---|
| `user.id`, `email`, `displayName`, `totalPoints`, `createdAt`, `lastActiveAt` | `User` table | unchanged |
| `stats.totalMatches` | `MatchParticipation` count | **CHANGED**: filtered to `match.status === 'FINISHED'` (was: unfiltered) |
| `stats.totalWins` | `MatchParticipation` count where `isWinner: true` | filtered to `match.status === 'FINISHED'` for consistency (effectively already true, made explicit) |
| `stats.accuracy` | `Prediction` count where `isCorrect` is non-null / `isCorrect: true` | unchanged — already graded-only (FR-008) |
| `stats.totalGoldWon` | `MatchParticipation` aggregate sum of `goldWon` | filtered to `match.status === 'FINISHED'` for consistency (effectively already true, made explicit) |
| `monthlyRank` | `LeaderboardRepository.findUserRank(userId, month, year)` | unchanged; `null` when user is unranked this month |

**Validation/state rules**:
- If `stats.totalMatches === 0`, the frontend renders the empty state (FR-004) rather than a
  zero-stats card.
- If `monthlyRank` is `null`, the frontend renders a "not ranked yet" state, not an error
  (Edge Cases).

## Prediction History Entry (existing `MatchParticipation` + `Match` + `Team` join, not a new model)

| Field | Source | Notes |
|---|---|---|
| `id`, `matchId`, `score`, `isWinner`, `goldWon` | `MatchParticipation` | unchanged |
| `homeTeam`, `awayTeam` | `Match.homeTeam` / `Match.awayTeam` (`Team`) | unchanged |
| `matchTime`, `homeScore`, `awayScore`, `status` | `Match` | unchanged |

**Two presentation slices of the same underlying query** (`profileRepository.listHistory`,
unchanged):
- **Profile preview**: `getHistory({ page: 1, pageSize: 5 })` — 5 most recent, embedded on
  `/profile`.
- **Full history screen**: `getHistory({ page, pageSize })` (default `pageSize=20`, max `100`)
  — paginated, on `/history` (self-service) and the new Admin `[id]` route.

No new validation rules beyond the existing `historyQuerySchema` (Zod: `page >= 1`,
`1 <= pageSize <= 100`).
