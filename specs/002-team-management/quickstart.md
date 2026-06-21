# Quickstart Validation: Team Management (UC13)

## Prerequisites

- PostgreSQL running, `DATABASE_URL` configured in `backend/.env`
- `API_FOOTBALL_KEY` set in `backend/.env` (required for sync validation)
- Backend running: `cd backend && npm run dev` (port 4000)
- Frontend running: `cd frontend && npm run dev` (port 5173)
- An Admin user exists (create via seed or register + DB role update)

## Validation Scenarios

### V1: Create Team (AC-13-01)

1. Log in as Admin
2. Navigate to Admin → Quản lý đội bóng
3. Fill in "Tên đội" = "FC Test", "Tên viết tắt" = "TST"
4. Click "Thêm"
5. **Expected**: Team appears in the list with "Hoạt động" badge
6. **Verify API**: `GET /api/v1/admin/teams?search=FC%20Test` returns the team

### V2: Duplicate Name Rejection (FR-002)

1. Try creating another team with "Tên đội" = "FC Test"
2. **Expected**: Error message about duplicate team name

### V3: Edit Team

1. Click "Sửa" on "FC Test"
2. Change name to "FC Test Updated", save
3. **Expected**: Team name updates in the list

### V4: Default Image Fallback (AC-13-03)

1. Create a team without logo URL
2. **Expected**: Default team image is displayed in the team list row

### V5: Deactivate Team Referenced by Match (AC-13-02)

1. Create a match referencing "FC Test Updated" as home or away team
2. Go back to team management, click "Xoá" on that team
3. **Expected**: Message "Đội đang được dùng trong trận — đã chuyển sang ngừng hoạt động". Team shows "Ngừng" badge.

### V6: Delete Unreferenced Team (FR-005)

1. Create a new team "FC Temp" with no matches
2. Click "Xoá"
3. **Expected**: Team is permanently removed from the list

### V7: Reactivate Team (FR-012)

1. Find a deactivated team (from V5)
2. Click "Kích hoạt"
3. **Expected**: Team status changes back to "Hoạt động"

### V8: Sync Teams from api-football (FR-006)

1. On the team management page, select a league (e.g., Premier League, league ID 39)
2. Click "Đồng bộ"
3. **Expected**: Loading indicator appears, then sync summary shows teams/players created/updated
4. **Expected**: Synced teams appear in the team list with external IDs

### V9: Sync Conflict — Admin Data Preserved (FR-007)

1. Edit a synced team's name (e.g., change "Arsenal" to "Arsenal FC")
2. Run sync again for the same league
3. **Expected**: The name "Arsenal FC" is preserved (not overwritten by sync)

### V10: Player Roster View (User Story 5)

1. Click on a team that has been synced (should have players)
2. **Expected**: Player list displays with name, position, and image (or default avatar)
3. Click on a team with no players
4. **Expected**: Empty state message is shown

### V11: Non-Admin Access Denied (FR-009)

1. Log in as a regular User (non-Admin)
2. Try to access `/admin/teams` in the browser
3. **Expected**: Redirected or shown 403/unauthorized

## Build Verification

```bash
cd backend && npm run build && npm run lint
cd frontend && npm run build && npm run lint
```

Both must pass with zero errors.
