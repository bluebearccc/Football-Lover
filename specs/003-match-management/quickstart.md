# Quickstart: Match Management Validation

**Date**: 2026-06-22 | **Feature**: 003-match-management

## Prerequisites

- PostgreSQL running with `DATABASE_URL` configured in `backend/.env`
- Backend dependencies installed (`cd backend && npm install`)
- Frontend dependencies installed (`cd frontend && npm install`)
- Database migrated (`cd backend && npm run prisma:migrate`)
- At least 2 active teams exist (via UC13 team management or seeded data)
- An Admin user account exists

## Start Services

```bash
# Terminal 1: Backend
cd backend && npm run dev    # → http://localhost:4000

# Terminal 2: Frontend
cd frontend && npm run dev   # → http://localhost:5173
```

## Validation Scenarios

### Scenario 1: Create a Match (P1)

1. Log in as Admin
2. Navigate to `/admin/matches`
3. Select a home team and away team (must be different)
4. Set match time to a future date
5. Set entry gold (or leave default 100)
6. Click "Tạo trận"

**Expected**: Match appears in the list with status SCHEDULED

### Scenario 2: Filter Matches by Status (P1)

1. On `/admin/matches`, use the status filter dropdown
2. Select "SCHEDULED"

**Expected**: Only SCHEDULED matches appear in the list

### Scenario 3: Add Prediction Criteria (P1)

1. Click "Quản lý" on a SCHEDULED match → opens `/admin/matches/[id]`
2. Enter criterion name (e.g., "Đội ghi bàn trước")
3. Click "Thêm"

**Expected**: Criterion appears in the criteria list

### Scenario 4: Two-Step Scoring (P1)

1. On match detail page, set result for each criterion (click HOME or AWAY buttons)
2. Enter home score and away score
3. Click "Chốt kết quả"

**Expected**: If all criteria have results → scoring runs, summary shows participant/winner/gold stats. If any criteria lack results → warning displayed, scoring blocked.

### Scenario 5: Cancel a Match (P2)

1. On match list, click "Huỷ" on a non-FINISHED match
2. Confirm the action

**Expected**: Match status changes to CANCELLED. If participants exist, MATCH_CANCELLED notifications are created.

### Scenario 6: Edit a Scheduled Match (P2)

1. On match detail page for a SCHEDULED match, modify teams/time/gold
2. Save changes

**Expected**: Changes persist. If match is LIVE or later, core edits are blocked with error message.

### Scenario 7: Idempotent Scoring (P1)

1. After scoring a match (Scenario 4), call the result endpoint again (or reload and click "Chốt kết quả")

**Expected**: Response indicates `scored: false` with message "Trận đã được tính điểm trước đó". No duplicate MatchParticipation records.

## Build Verification

```bash
# Backend
cd backend && npm run build && npm run lint

# Frontend
cd frontend && npm run build && npm run lint
```

Both must pass with no errors.
