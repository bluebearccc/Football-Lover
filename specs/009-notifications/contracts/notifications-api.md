# API Contract: Notifications (UC14)

Base path: `/api/v1/notifications`
Auth: All endpoints require `authenticate` middleware (Bearer JWT).

---

## GET /notifications

List the authenticated user's notifications, newest first.

**Query Parameters**:

| Param    | Type   | Default | Description                    |
|----------|--------|---------|--------------------------------|
| page     | number | 1       | Page number (1-indexed)        |
| pageSize | number | 20      | Items per page (max 50)        |

**Response 200**:

```json
{
  "notifications": [
    {
      "id": "uuid",
      "type": "MATCH_WON",
      "title": "Bạn đã thắng trận!",
      "body": "Bạn đoán đúng 3 tiêu chí và nhận 150.00 gold.",
      "matchId": "uuid",
      "isRead": false,
      "createdAt": "2026-06-26T15:00:00.000Z"
    }
  ],
  "total": 42,
  "page": 1,
  "pageSize": 20
}
```

**Response 401**: Unauthorized

---

## GET /notifications/unread-count

Return the count of unread notifications for the authenticated user.

**Response 200**:

```json
{
  "count": 5
}
```

**Response 401**: Unauthorized

---

## PATCH /notifications/:id/read

Mark a single notification as read. The notification must belong to the authenticated user.

**Path Parameters**:

| Param | Type | Description          |
|-------|------|----------------------|
| id    | uuid | Notification ID      |

**Response 200**:

```json
{
  "message": "OK"
}
```

**Response 401**: Unauthorized
**Response 404**: Notification not found or does not belong to user

---

## PATCH /notifications/mark-all-read

Mark all unread notifications as read for the authenticated user.

**Response 200**:

```json
{
  "updated": 5
}
```

**Response 401**: Unauthorized

---

## Response DTOs

### NotificationDto

```typescript
{
  id: string;
  type: 'MATCH_WON' | 'MATCH_LOST' | 'MATCH_CANCELLED';
  title: string;
  body: string | null;
  matchId: string | null;
  isRead: boolean;
  createdAt: string; // ISO 8601
}
```

### NotificationListResponse

```typescript
{
  notifications: NotificationDto[];
  total: number;
  page: number;
  pageSize: number;
}
```

### UnreadCountResponse

```typescript
{
  count: number;
}
```

### MarkAllReadResponse

```typescript
{
  updated: number;
}
```
