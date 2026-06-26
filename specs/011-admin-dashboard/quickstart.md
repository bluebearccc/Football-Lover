# Quickstart: Admin Dashboard Validation

**Feature**: 011-admin-dashboard | **Date**: 2026-06-26

## Prerequisites

- PostgreSQL running with `DATABASE_URL` configured in `backend/.env`
- An admin user seeded (role = `ADMIN`)
- Backend and frontend dev servers running

## Setup

```bash
# Backend
cd backend
npm install
npm run prisma:migrate    # applies new AdminLog migration
npm run dev               # :4000

# Frontend
cd frontend
npm install
npm run dev               # :5173
```

## Validation Scenarios

### V1: Dashboard Overview Loads (FR-001, FR-002, FR-003, SC-001, SC-002)

1. Login as admin user
2. Navigate to `/admin`
3. **Verify**: Four metric cards display with real data:
   - "Người dùng hoạt động" (active users count + locked indicator)
   - "Trận Live / Sắp diễn ra" (live/scheduled match count)
   - "Lượt dự đoán" (total predictions count)
   - "Tổng Gold Pool" (sum of gold won, formatted to 2 decimal places)
4. **Verify**: Each card has a trend/status indicator (progress bar, label, or percentage)
5. **Verify**: Page loads within 3 seconds
6. **Verify**: "Hệ thống Live" indicator shows in header (FR-015)

### V2: Traffic Chart Dynamic Data (FR-004)

1. On the admin dashboard, locate the "Hoạt động trận đấu" chart
2. **Verify**: Bar chart shows actual prediction activity by hour (not static bars)
3. Select "7 ngày" from the dropdown
4. **Verify**: Chart updates to show daily activity for last 7 days
5. Switch back to "24 giờ qua"
6. **Verify**: Chart returns to hourly view

### V3: Platform Stats Panel (FR-005)

1. Locate the right panel showing platform statistics
2. **Verify**: Stats displayed with progress bars (active teams ratio, finished matches ratio, account safety, comment health)
3. **Verify**: Percentages are accurate based on actual data

### V4: Admin Activity Logs (FR-006, FR-010)

1. Perform an admin action: create a match via `/admin/matches`
2. Return to `/admin` dashboard
3. **Verify**: The "Hoạt động gần đây" table shows the new log entry with:
   - Timestamp
   - Action description (e.g., "Trận đấu X vs Y đã được tạo")
   - Admin actor name
   - Status badge (SUCCESS in green)
4. Click "Xem tất cả"
5. **Verify**: Navigates to full logs view at `/admin/logs`

### V5: Moderation Queue (FR-007, FR-011)

1. On the dashboard, locate "Hàng đợi kiểm duyệt" panel
2. **If no hidden comments**: verify empty state "Không có bình luận bị ẩn"
3. **If hidden comments exist**: verify items show with content preview, user, timestamp
4. Click "Đến Kiểm duyệt (N)"
5. **Verify**: Navigates to `/admin/comments` with pending count

### V6: Periodic Polling (FR-017, SC-004)

1. Open admin dashboard
2. In another tab/tool, create a match or user action
3. Wait 30–60 seconds without refreshing
4. **Verify**: Dashboard data updates automatically (new log entry appears, metrics update)
5. **Verify**: No full page reload occurs — only data refreshes

### V7: Date Range Filter (FR-012)

1. Click the "Filter" button in the dashboard header
2. Select a date range (e.g., last 7 days)
3. **Verify**: All metric cards update to reflect only data within the range
4. **Verify**: Traffic chart updates accordingly
5. Clear the filter
6. **Verify**: Data returns to all-time view

### V8: CSV Export (FR-013, SC-006)

1. Click "Export Report" button in the dashboard header
2. **Verify**: A CSV file downloads within 10 seconds
3. Open the CSV file
4. **Verify**: Contains metric names and values matching the dashboard display
5. Apply a date filter, then export again
6. **Verify**: Exported data reflects the filtered date range

### V9: Responsive Layout (FR-016, SC-005)

1. Open admin dashboard on a desktop viewport (1024px+)
2. **Verify**: Sidebar visible, full layout with grid columns
3. Resize to mobile viewport (< 768px)
4. **Verify**: Sidebar collapses, bottom navigation bar appears
5. **Verify**: Cards stack to single column
6. **Verify**: All content remains accessible and readable

### V10: Access Control (FR-001)

1. Login as a regular user (role = USER)
2. Navigate to `/admin`
3. **Verify**: Redirected to login or shown access denied
4. Call `GET /api/v1/admin/dashboard` without JWT
5. **Verify**: Returns 401
6. Call with a USER role JWT
7. **Verify**: Returns 403

## Quality Gates

After all scenarios pass:

```bash
cd backend && npm run build && npm run lint
cd ../frontend && npm run build && npm run lint
```

Both must pass with zero errors.
