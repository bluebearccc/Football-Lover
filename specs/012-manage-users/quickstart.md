# Quickstart Validation: Manage Users (012)

**Date**: 2026-06-26

## Prerequisites

- PostgreSQL running with `DATABASE_URL` configured in `backend/.env`
- Backend and frontend dependencies installed (`npm install` in both)
- Prisma migrations applied after schema changes (`npm run prisma:migrate` in `backend/`)
- At least one Admin user seeded in the database
- Email provider configured in `backend/.env` (for password reset flow)

## Validation Scenarios

### 1. Schema Migration

```bash
cd backend
npm run prisma:migrate
# Expected: Migration adds ban_reason and last_active_at to users table
# Verify: npx prisma studio → users table shows new nullable columns
```

### 2. User List API

```bash
# List all users (requires Admin JWT)
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "http://localhost:4000/api/v1/admin/users?pageSize=5"

# Expected: 200 with { items: [...], total, page, pageSize }
# Each item includes accuracy (number) and banReason (null or string)

# Search by name
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "http://localhost:4000/api/v1/admin/users?search=test"

# Filter by status
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "http://localhost:4000/api/v1/admin/users?status=LOCKED"
```

### 3. Lock User (with reason)

```bash
# Lock a user
curl -X PATCH -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"LOCKED","reason":"Vi phạm quy định"}' \
  "http://localhost:4000/api/v1/admin/users/$USER_ID/status"

# Expected: 200, user status=LOCKED, banReason populated
# Verify: user cannot log in (POST /auth/login returns 403)
# Verify: AdminLog has USER_LOCK entry

# Unlock
curl -X PATCH -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"ACTIVE"}' \
  "http://localhost:4000/api/v1/admin/users/$USER_ID/status"

# Expected: 200, user status=ACTIVE, banReason=null
```

### 4. Lock Admin (should fail)

```bash
curl -X PATCH -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"LOCKED","reason":"test"}' \
  "http://localhost:4000/api/v1/admin/users/$ADMIN_USER_ID/status"

# Expected: 400 error — cannot lock Admin accounts
```

### 5. Edit User

```bash
curl -X PATCH -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"displayName":"Tên Mới"}' \
  "http://localhost:4000/api/v1/admin/users/$USER_ID"

# Expected: 200 with updated displayName
# Verify: AdminLog has USER_EDIT entry
```

### 6. Admin-Triggered Password Reset

```bash
curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" \
  "http://localhost:4000/api/v1/admin/users/$USER_ID/reset-password"

# Expected: 200 with success message
# Verify: user receives password reset email
# Verify: AdminLog has USER_PASSWORD_RESET entry
```

### 7. User Statistics

```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "http://localhost:4000/api/v1/admin/users/stats"

# Expected: 200 with { totalUsers, onlineNow, lockedUsers, averageAccuracy }
```

### 8. Session Invalidation

```bash
# 1. Login as regular user → get USER_TOKEN
# 2. Lock that user via Admin API
# 3. Try API call with USER_TOKEN
curl -H "Authorization: Bearer $USER_TOKEN" \
  "http://localhost:4000/api/v1/matches"

# Expected: 401/403 — session rejected because user is LOCKED
```

### 9. Frontend Validation

```bash
cd frontend && npm run dev
# Navigate to http://localhost:5173/admin/users
```

**Verify**:
- [ ] Page matches Stitch mockup layout (dark theme, glass panels, stats bento grid)
- [ ] Stats cards show: Total Users, Online Now, Banned Accounts, Avg Accuracy
- [ ] User table shows columns: Name/ID, Status, Points, Accuracy, Joined, Actions
- [ ] Search filters in real-time as Admin types (debounced)
- [ ] Filter tabs work: All Users / Active / Banned
- [ ] Pagination controls with page numbers and total count
- [ ] Ban action opens confirmation modal with required reason field
- [ ] Unban action opens simple confirmation
- [ ] Edit action opens modal with display name and role fields
- [ ] Reset Password action sends email and shows success notification
- [ ] Empty states display for no results / no matching filters

### 10. Build Verification

```bash
cd backend && npm run build && npm run lint
cd ../frontend && npm run build && npm run lint
# Expected: No errors
```
