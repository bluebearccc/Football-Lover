# API Contract: Authentication (`/api/v1/auth`)

Base URL: `/api/v1/auth`

## POST /register

Register a new user account (UC01).

**Request**:
```json
{
  "email": "user@example.com",
  "displayName": "Nguyễn Văn A",
  "password": "mypass123"
}
```

**Validation** (Zod):
- `email`: valid email format
- `displayName`: 2–50 chars after trim
- `password`: ≥ 8 chars, at least 1 letter + 1 digit

**Success (201)**:
```json
{
  "message": "Đăng ký thành công"
}
```

**Errors**:
- `400` — validation errors (email format, password policy, display name length)
- `409` — email already exists: `"Email đã tồn tại"`

**Behavior notes**:
- Email is normalized to lowercase before storage
- Does NOT return a token (user must login separately)
- Role defaults to USER; Admin accounts are created via seed only

---

## POST /login

Authenticate with email/password (UC02).

**Request**:
```json
{
  "email": "user@example.com",
  "password": "mypass123"
}
```

**Success (200)**:
```json
{
  "token": "eyJhbGciOi...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "Nguyễn Văn A",
    "role": "USER",
    "status": "ACTIVE",
    "totalPoints": 0
  }
}
```

**Errors**:
- `401` — wrong email or password: `"Email hoặc mật khẩu không đúng"` (neutral — never reveals which field)
- `403` — account locked: `"Tài khoản đã bị khóa"`
- `429` — rate limit exceeded (5 failed attempts in 15 minutes): `"Quá nhiều lần thử, vui lòng thử lại sau"`

**Behavior notes**:
- Email lookup is case-insensitive (lowercased before query)
- Rate limiting tracks failed attempts per account (by email)

---

## POST /logout

End the current session (UC02).

**Request**: empty body (token in Authorization header is optional for stateless JWT)

**Success (200)**:
```json
{
  "message": "Đã đăng xuất"
}
```

**Behavior notes**:
- Stateless JWT — server acknowledges; client is responsible for clearing the stored token

---

## GET /me

Get the current authenticated user's profile.

**Headers**: `Authorization: Bearer <token>` (required)

**Success (200)**:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "Nguyễn Văn A",
    "role": "USER",
    "status": "ACTIVE",
    "totalPoints": 0
  }
}
```

**Errors**:
- `401` — missing/invalid/expired token

---

## POST /forgot-password

Request a password reset email (UC15).

**Request**:
```json
{
  "email": "user@example.com"
}
```

**Success (200)** — always, regardless of whether email exists:
```json
{
  "message": "Nếu email tồn tại, chúng tôi đã gửi liên kết đặt lại mật khẩu."
}
```

**Errors**:
- `429` — rate limit exceeded (3 requests per hour per email)

**Behavior notes**:
- Response is always neutral (does not reveal email existence)
- Locked accounts: no email sent, same neutral response
- All previous unused tokens for the user are invalidated
- Token is emailed as a link: `{FRONTEND_URL}/reset-password?token={raw_token}`
- Token hash stored (SHA-256), raw token never persisted
- Token expires after configurable TTL (default: 60 minutes)

---

## POST /reset-password

Set a new password using a valid reset token (UC15).

**Request**:
```json
{
  "token": "hex-string-from-email-link",
  "newPassword": "newpass456"
}
```

**Success (200)**:
```json
{
  "message": "Đặt lại mật khẩu thành công"
}
```

**Errors**:
- `400` — invalid, expired, or already-used token: `"Token không hợp lệ hoặc đã hết hạn"`
- `400` — new password fails policy (same rules as register)

**Behavior notes**:
- Token is consumed atomically with password update (transaction)
- Used token cannot be reused
