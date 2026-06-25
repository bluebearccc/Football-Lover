# Quickstart Validation: Gold Scoring & Payout

**Date**: 2026-06-23 | **Feature**: 006-gold-scoring

## Prerequisites

- PostgreSQL running with database created
- Backend configured (`backend/.env` with valid `DATABASE_URL`)
- Prisma migrations applied: `cd backend && npm run prisma:migrate`
- Backend dev server: `cd backend && npm run dev` (port 4000)
- Admin user exists (role = ADMIN) — can be created via seed or registration + manual DB update

## Validation Scenarios

### Scenario 1: Scoring a Finished Match

**Goal**: Verify scoring, gold payout, winner determination, notifications, and totalPoints update.

**Setup**:
1. Create 2 teams via Admin API
2. Create a match with `entry_gold = 100` via `POST /api/v1/admin/matches`
3. Create 3 criteria for the match via criteria endpoints
4. Register 3 test users and submit predictions for each criterion (varying HOME/AWAY)
5. Set `result_team` for all 3 criteria via `PUT /api/v1/admin/matches/criteria/:id/result`

**Execute**:
```
PUT /api/v1/admin/matches/:id/result
Body: { "homeScore": 2, "awayScore": 1 }
```

**Expected**:
- Response: `{ "scored": true, "participantCount": 3, "winnerCount": N, "pool": "300.00", "goldPerWinner": "..." }`
- DB: `match_participations` has 3 rows with correct scores
- DB: `predictions.is_correct` is true/false (not null)
- DB: `notifications` has 3 rows (MATCH_WON for winners, MATCH_LOST for losers)
- DB: Winner users' `total_points` incremented by their match score

### Scenario 2: Idempotent Scoring

**Execute**: Call `PUT /api/v1/admin/matches/:id/result` again on the same match.

**Expected**:
- Response: `{ "scored": false, "reason": "Trận đã được tính điểm trước đó" }`
- DB: No duplicate rows in `match_participations` or `notifications`

### Scenario 3: Unresolved Criteria Block

**Setup**: Create a new match with 2 criteria, set `result_team` for only 1.

**Execute**: `PUT /api/v1/admin/matches/:id/result`

**Expected**:
- Response 400: `"Chưa có kết quả cho các tiêu chí: ..."`
- DB: Match status unchanged (not FINISHED)

### Scenario 4: All Participants Score 0 (Pool Void)

**Setup**: Create match, criteria, predictions — but set all results opposite to all predictions.

**Execute**: `PUT /api/v1/admin/matches/:id/result`

**Expected**:
- Response: `{ "scored": true, "winnerCount": 0, "pool": "300.00", "goldPerWinner": "0.00" }`
- DB: All `match_participations` have `is_winner = false`, `gold_won = 0`

### Scenario 5: Cancellation Voids Results

**Setup**: Use the match from Scenario 1 (already FINISHED and scored).

**Execute**: `POST /api/v1/admin/matches/:id/cancel`

**Expected**:
- Response: `{ "message": "Đã huỷ trận đấu" }`
- DB: `match_participations` deleted for this match
- DB: `predictions.is_correct` reset to null
- DB: `notifications` has new MATCH_CANCELLED entries for each participant
- DB: Users' `total_points` decremented by their previous match score
- DB: `match.status` = CANCELLED

### Scenario 6: Floor Rounding (Indivisible Pool)

**Setup**: Create match with `entry_gold = 100`, 3 participants, 1 winner.

**Execute**: `PUT /api/v1/admin/matches/:id/result` (one winner)

Then create another match: `entry_gold = 100`, 3 participants, 2 tied winners.

**Expected**:
- Single winner: `gold_won = 300.00` (evenly divisible)
- For indivisible case (e.g., 3 winners sharing 300): `gold_won = 100.00` each
- For 7 winners sharing 700: `gold_won = 100.00` each (floor, no remainder issue here)
- Key test: 3 winners sharing 100 → `gold_won = 33.33` each (floor, not 33.34)

### Scenario 7: Leaderboard Query

**Setup**: Complete Scenarios 1 (creates a win). Create additional matches with wins for different users.

**Execute**: `GET /api/v1/leaderboard?month=6&year=2026`

**Expected**:
- Response lists users ranked by win count for June 2026
- Only includes wins from matches with ≥ 2 participants
- Month boundaries computed in Asia/Ho_Chi_Minh timezone

### Scenario 8: Match Results Public Endpoint

**Execute**: `GET /api/v1/matches/:id/results` (for a FINISHED match)

**Expected**:
- Response lists all participants with scores, winner flags, and gold_won
- For non-FINISHED match: 404

## Verification Commands

```bash
# Check match participations
psql -c "SELECT mp.*, u.display_name FROM match_participations mp JOIN users u ON mp.user_id = u.id WHERE mp.match_id = '<id>'"

# Check notifications
psql -c "SELECT * FROM notifications WHERE match_id = '<id>' ORDER BY type"

# Check user totalPoints
psql -c "SELECT id, display_name, total_points FROM users WHERE id IN ('<user-id-1>', '<user-id-2>')"

# Check predictions scored
psql -c "SELECT p.*, pc.name as criterion FROM predictions p JOIN prediction_criteria pc ON p.criterion_id = pc.id WHERE p.match_id = '<id>'"
```
