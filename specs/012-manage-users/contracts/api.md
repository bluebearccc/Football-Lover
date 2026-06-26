# API Contracts: Manage Users (012)

**Base path**: `/api/v1/admin/users`  
**Auth**: All endpoints require `authenticate` + `requireRole('ADMIN')`

---

## GET `/` — List Users

**Query params**:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `search` | string | — | Filter by display name or email (case-insensitive, partial match) |
| `status` | `ACTIVE` \| `LOCKED` | — | Filter by status |
| `role` | `USER` \| `ADMIN` | — | Filter by role |
| `page` | int ≥ 1 | 1 | Page number |
| `pageSize` | int 1-100 | 20 | Items per page |

**Response** `200`:
```json
{
  "items": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "displayName": "Tên người dùng",
      "role": "USER",
      "status": "ACTIVE",
      "totalPoints": 1200,
      "accuracy": 78.5,
      "banReason": null,
      "createdAt": "2024-10-12T00:00:00Z"
    }
  ],
  "total": 12482,
  "page": 1,
  "pageSize": 20
}
```

**Changes from existing**: Add `accuracy` (computed) and `banReason` fields to response.

---

## GET `/:id` — User Detail

**Response** `200`: Same as list item, plus:
```json
{
  "_count": {
    "predictions": 42,
    "participations": 15,
    "comments": 88
  }
}
```

**Errors**: `404` if user not found.

---

## PATCH `/:id` — Edit User (NEW)

**Body**:
```json
{
  "displayName": "Tên mới",
  "role": "ADMIN"
}
```

Both fields optional, but at least one required.

| Field | Validation |
|-------|------------|
| `displayName` | Trimmed, 2-50 characters |
| `role` | `USER` \| `ADMIN` |

**Response** `200`: Updated user object.

**Errors**:
- `400` if Admin tries to demote their own role
- `404` if user not found

**Audit**: Logs `USER_EDIT` and/or `USER_ROLE_CHANGE` to AdminLog.

---

## PATCH `/:id/status` — Lock/Unlock User (EXISTING, MODIFIED)

**Body**:
```json
{
  "status": "LOCKED",
  "reason": "Vi phạm quy định cộng đồng"
}
```

| Field | Validation |
|-------|------------|
| `status` | `ACTIVE` \| `LOCKED` |
| `reason` | Required when status=LOCKED. Trimmed, 1-500 chars. Ignored when status=ACTIVE. |

**Response** `200`: Updated user object.

**Errors**:
- `400` if Admin tries to lock their own account
- `400` if target user is an Admin (FR-012)
- `404` if user not found

**Side effects**:
- LOCKED: sets `banReason`, invalidates sessions on next API call
- ACTIVE: clears `banReason`

**Audit**: Logs `USER_LOCK` or `USER_UNLOCK` to AdminLog. Lock description includes the reason.

---

## POST `/:id/reset-password` — Admin-Triggered Password Reset (NEW)

**Body**: None.

**Response** `200`:
```json
{
  "message": "Email đặt lại mật khẩu đã được gửi"
}
```

**Errors**:
- `404` if user not found

**Side effects**: Generates a password reset token and sends email to user's registered address (reuses `authService.forgotPassword` logic).

**Audit**: Logs `USER_PASSWORD_RESET` to AdminLog.

---

## GET `/stats` — User Statistics (NEW)

**Response** `200`:
```json
{
  "totalUsers": 12482,
  "onlineNow": 843,
  "lockedUsers": 142,
  "averageAccuracy": 68.4
}
```

| Metric | Computation |
|--------|------------|
| `totalUsers` | Count all users |
| `onlineNow` | Count users where `lastActiveAt > now() - 15 minutes` |
| `lockedUsers` | Count users where `status = LOCKED` |
| `averageAccuracy` | Average of all users' prediction accuracy (only users with ≥ 1 prediction) |
