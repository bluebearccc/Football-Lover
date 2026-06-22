# Quickstart Validation: Match Viewing (004)

**Date**: 2026-06-22

## Prerequisites

- PostgreSQL running with seed data (matches, teams, criteria, statistics, comments)
- Backend running on `:4000` (`cd backend && npm run dev`)
- Frontend running on `:5173` (`cd frontend && npm run dev`)

## Validation Scenarios

### 1. Match List — Public Access (UC03, FR-001..005, SC-001)

```bash
# List matches (no auth required) — default status-grouped sort
curl http://localhost:4000/api/v1/matches

# Filter by status
curl "http://localhost:4000/api/v1/matches?status=LIVE"
curl "http://localhost:4000/api/v1/matches?status=SCHEDULED"

# Pagination
curl "http://localhost:4000/api/v1/matches?page=2&pageSize=5"

# Date filter
curl "http://localhost:4000/api/v1/matches?from=2026-06-20&to=2026-06-25"
```

**Expected**:
- 200 OK with `{ items, total, page, pageSize }`
- Items sorted: LIVE first → SCHEDULED (soonest first) → FINISHED (recent first) → CANCELLED
- Each item includes `homeTeam.name`, `awayTeam.name`, `logoUrl`, `matchTime`, `status`, scores, `participantCount`
- Empty filter returns all matches; status filter returns only matching
- Load time < 2s (SC-001)

### 2. Match Detail — Public Access (UC04, FR-006..015, SC-003)

```bash
# Get match detail (no auth)
curl http://localhost:4000/api/v1/matches/{matchId}

# Get match detail (with auth — to see own predictions on SCHEDULED)
curl -H "Authorization: Bearer {token}" http://localhost:4000/api/v1/matches/{matchId}
```

**Expected**:
- 200 OK with full detail: teams, scores, criteria, statistics, comments, predictions
- Criteria: only `isActive = true` criteria listed
- Statistics: `totalHomeVotes` / `totalAwayVotes` per criterion
- Comments: only `VISIBLE` status, ordered by `createdAt` ascending
- `participantCount` and `goldPool` (= `entryGold × participantCount`) included

### 3. Prediction Visibility (BR21/BR22, FR-008/009, SC-005)

```bash
# SCHEDULED match — no auth: predictions array should be empty
curl http://localhost:4000/api/v1/matches/{scheduledMatchId}
# Verify: predictions = []

# SCHEDULED match — with auth: only own predictions
curl -H "Authorization: Bearer {userToken}" http://localhost:4000/api/v1/matches/{scheduledMatchId}
# Verify: predictions contains only entries where user.id matches the JWT user

# LIVE/FINISHED match — all predictions public
curl http://localhost:4000/api/v1/matches/{liveMatchId}
# Verify: predictions contains all users' predictions
```

### 4. Not Found (FR-012)

```bash
curl http://localhost:4000/api/v1/matches/00000000-0000-0000-0000-000000000000
# Expected: 404 { "message": "Không tìm thấy trận đấu" }
```

### 5. Frontend — Match List Page

1. Open `http://localhost:5173/matches` in browser
2. **Verify**: Match cards display with team names, logos (or placeholder), time (Vietnam TZ), status badge
3. **Verify**: Status filter tabs (ALL / LIVE / SCHEDULED / FINISHED) work
4. **Verify**: Pagination controls appear and navigate between pages
5. **Verify**: Empty state shown when no matches match filters
6. **Verify**: Error state shown when API fails (disconnect backend temporarily)
7. **Verify**: Layout matches `stitch_goalpredict_live_dashboard/live_matches/screen.png`

### 6. Frontend — Match Detail Page

1. Click a match card on the list page → navigates to `/matches/{id}`
2. **Verify**: Scoreboard header shows team logos, names, score, status, match time
3. **Verify**: Criteria section lists all active criteria with names/descriptions
4. **Verify**: Statistics section shows HOME vs AWAY vote bars per criterion
5. **Verify**: Comments section shows commenter name, content, timestamp
6. **Verify**: Guest: no predict/comment action buttons visible
7. **Verify**: Logged-in user on SCHEDULED match: predict buttons visible
8. **Verify**: Layout matches `stitch_goalpredict_live_dashboard/match_details/screen.png`

### 7. Guest vs. Authenticated (FR-010/011)

1. Open match detail as Guest → no prediction/comment action controls
2. Login → revisit same match → prediction actions appear (if SCHEDULED)
3. LIVE match → prediction actions locked (no edit)

### 8. Edge Cases

- Match with no criteria → criteria section hidden or empty state
- Match with no comments → comments section shows "Chưa có bình luận"
- Team with `logoUrl = null` → default placeholder image displayed
- CANCELLED match → CANCELLED badge, no action buttons
- Invalid match ID → 404 not-found page

## Build Verification

```bash
# Backend typecheck
cd backend && npm run build

# Frontend typecheck
cd frontend && npm run build

# Lint both
cd backend && npm run lint
cd frontend && npm run lint
```

All must pass before feature is considered complete (Principle V).
