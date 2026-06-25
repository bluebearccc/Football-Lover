# Quickstart: Prediction Criteria Management

## Prerequisites

- PostgreSQL running with `DATABASE_URL` configured in `backend/.env`
- Backend dependencies installed (`cd backend && npm install`)
- Frontend dependencies installed (`cd frontend && npm install`)
- At least one Admin user and one SCHEDULED match exist in the database
- Backend running on :4000, frontend on :5173

## Validation Scenarios

### 1. Schema Migration

```bash
cd backend
npm run prisma:migrate
# Expected: Migration `add_criterion_created_at` applies successfully
# Verify: `npx prisma studio` shows `created_at` column on `prediction_criteria` table
```

### 2. Create Criterion (Admin)

```bash
# Login as Admin to get JWT token
TOKEN=$(curl -s http://localhost:4000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"..."}' | jq -r '.token')

# Create criterion for a SCHEDULED match
curl -s http://localhost:4000/api/v1/admin/criteria/match/<MATCH_ID> \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Đội ghi bàn trước","description":"Đội nào ghi bàn đầu tiên"}' | jq
# Expected: 201 with criterion object, isActive=true, source=MANUAL, createdAt set
```

### 3. Edit Criterion

```bash
curl -s -X PATCH http://localhost:4000/api/v1/admin/criteria/<CRITERION_ID> \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Đội ghi bàn trước (updated)"}' | jq
# Expected: 200 with updated name
```

### 4. Deactivate Criterion (SCHEDULED match)

```bash
curl -s -X POST http://localhost:4000/api/v1/admin/criteria/<CRITERION_ID>/deactivate \
  -H "Authorization: Bearer $TOKEN" | jq
# Expected: 200 with isActive=false
```

### 5. Reactivate Criterion (SCHEDULED match)

```bash
curl -s -X POST http://localhost:4000/api/v1/admin/criteria/<CRITERION_ID>/reactivate \
  -H "Authorization: Bearer $TOKEN" | jq
# Expected: 200 with isActive=true
```

### 6. Deactivation Blocked (non-SCHEDULED match)

```bash
# Use a criterion from a LIVE or FINISHED match
curl -s -X POST http://localhost:4000/api/v1/admin/criteria/<LIVE_CRITERION_ID>/deactivate \
  -H "Authorization: Bearer $TOKEN" | jq
# Expected: 400 "Trận đã khoá: không thể chỉnh sửa tiêu chí sau khi trận bắt đầu"
```

### 7. Public Match Detail — Criteria Display

```bash
curl -s http://localhost:4000/api/v1/matches/<MATCH_ID> | jq '.criteria'
# Expected: Only active criteria listed, ordered by createdAt (oldest first)
# Deactivated criteria should NOT appear
```

### 8. Frontend Validation

1. **Admin match detail** (`/admin/matches/<id>`):
   - Create criteria via the inline form
   - Verify criteria appear in creation order
   - Deactivate a criterion → verify "Đã ẩn" badge
   - Reactivate a criterion → verify it becomes active again
   - For non-SCHEDULED matches, verify create/deactivate/reactivate are disabled

2. **User match detail** (`/matches/<id>`):
   - Verify only active criteria display
   - Verify creation-order sorting
   - After match starts, verify vote statistics appear per criterion

### 9. Build & Lint Gates

```bash
cd backend && npm run build && npm run lint
cd ../frontend && npm run build && npm run lint
# Expected: No errors in either package
```
