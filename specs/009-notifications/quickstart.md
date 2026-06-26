# Quickstart: Win/Lose Notifications (009)

**Date**: 2026-06-26

## Prerequisites

- PostgreSQL running with database migrated (`npm run prisma:migrate` in `backend/`)
- Backend running on port 4000 (`npm run dev` in `backend/`)
- Frontend running on port 5173 (`npm run dev` in `frontend/`)
- At least one user account and one match with predictions scored (so notifications exist)

## Validation Scenarios

### 1. Verify notifications are created on scoring

1. Log in as admin
2. Create a match with at least 2 criteria and 2 participants who placed predictions
3. Resolve all criteria and trigger scoring (set match to FINISHED)
4. Check database: each participant should have a Notification record with type MATCH_WON or MATCH_LOST

### 2. Verify notification list API

```
GET /api/v1/notifications
Authorization: Bearer <user-token>
```

Expected: 200 with `{ notifications: [...], total, page, pageSize }` — newest first.

### 3. Verify unread count API

```
GET /api/v1/notifications/unread-count
Authorization: Bearer <user-token>
```

Expected: 200 with `{ count: <number> }` matching actual unread notifications.

### 4. Verify mark single notification as read

```
PATCH /api/v1/notifications/<id>/read
Authorization: Bearer <user-token>
```

Expected: 200 with `{ message: "OK" }`. Subsequent list call shows `isRead: true` for that notification.

### 5. Verify mark all as read

```
PATCH /api/v1/notifications/mark-all-read
Authorization: Bearer <user-token>
```

Expected: 200 with `{ updated: <count> }`. Subsequent unread-count returns 0.

### 6. Verify notification bell in UI

1. Log in as a user who has unread notifications
2. Observe the notification bell icon in the top navigation bar
3. Verify an unread count badge is displayed
4. Click the bell — dropdown appears with notification list
5. Click a notification — navigates to match detail page, notification auto-marks as read
6. Badge count decreases

### 7. Verify mark all as read in UI

1. With multiple unread notifications visible in the dropdown
2. Click "Mark all as read"
3. All notifications change to read state
4. Badge disappears or shows 0

### 8. Verify cancellation notifications

1. As admin, cancel a match that had participants
2. Each participant should receive a MATCH_CANCELLED notification
3. Notification appears in their list with the cancellation message

### 9. Verify access control

- Unauthenticated request to any notification endpoint → 401
- User cannot see another user's notifications (only their own are returned)
- Mark-read on a notification belonging to another user → 404

## Build Verification

```bash
cd backend && npm run build && npm run lint
cd ../frontend && npm run build && npm run lint
```

Both must pass with zero errors.
