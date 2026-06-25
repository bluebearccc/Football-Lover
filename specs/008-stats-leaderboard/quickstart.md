# Quickstart: Statistics & Leaderboard (008)

## Prerequisites

- PostgreSQL running with seeded data (users, matches, predictions, scored MatchParticipations)
- Backend running on `:4000` (`cd backend && npm run dev`)
- Frontend running on `:5173` (`cd frontend && npm run dev`)
- At least 3 users with finished matches that have ≥ 2 participants and `is_winner=true` records

## Validation Scenarios

### 1. Leaderboard API — Monthly Rankings

```bash
# Default: current month leaderboard
curl http://localhost:4000/api/v1/leaderboard

# Specific month with pagination
curl "http://localhost:4000/api/v1/leaderboard?month=6&year=2026&page=1&pageSize=10"
```

**Expected**: JSON with `rankings` array, each entry has `rank`, `displayName`, `winCount`, `totalPoints`, `accuracy`, `winStreak`. Ranked by `winCount` DESC, `accuracy` DESC tiebreaker. `total`, `page`, `pageSize` present.

### 2. Leaderboard API — Current User Rank

```bash
# Requires auth token
curl -H "Authorization: Bearer <token>" http://localhost:4000/api/v1/leaderboard/me
```

**Expected**: Single user object with `rank`, `winCount`, `accuracy`, `winStreak` for current month.

### 3. Match Statistics Visibility (BR21/BR22)

```bash
# SCHEDULED match — statistics should be empty
curl http://localhost:4000/api/v1/matches/<scheduled-match-id>
# Expected: "statistics": []

# LIVE or FINISHED match — statistics should have vote counts
curl http://localhost:4000/api/v1/matches/<finished-match-id>
# Expected: "statistics": [{ "criterionId": "...", "totalHomeVotes": 5, "totalAwayVotes": 3 }]
```

### 4. Frontend — Leaderboard Page

1. Open `http://localhost:5173/leaderboard`
2. Verify podium section shows top 3 users with rank badges (1st gold, 2nd silver, 3rd bronze)
3. Verify ranking table below with columns: Rank, Predictor, Points, Win Streak, Accuracy
4. If logged in, verify current user's row is highlighted with a distinct border/glow
5. Verify pagination controls at the bottom

### 5. Frontend — Match Stats Tab Visibility

1. Open a SCHEDULED match detail page → click "Thống kê" tab → should show "Chưa có thống kê dự đoán"
2. Open a LIVE or FINISHED match → click "Thống kê" tab → should show vote bars per criterion

### 6. Edge Cases

- **Empty month**: Navigate to a month with no finished matches → leaderboard shows no-data message
- **Tied users**: Two users with same win count → ordered by higher accuracy
- **No avatar**: Users without avatar → default placeholder shown
- **Pagination boundary**: Navigate to last page → verify correct item count

## Build Verification

```bash
# Backend typecheck + lint
cd backend && npm run build && npm run lint

# Frontend typecheck + lint
cd frontend && npm run build && npm run lint
```

Both must pass before feature is complete (Constitution Principle V).
