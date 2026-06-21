# Quickstart Validation Guide: User Authentication (001-user-auth)

## Prerequisites

1. PostgreSQL running with `DATABASE_URL` configured in `backend/.env`
2. `npm install` in both `backend/` and `frontend/`
3. `npm run prisma:migrate` in `backend/` (schema already has User + PasswordResetToken)
4. `npm run dev` in `backend/` (port 4000) and `frontend/` (port 5173)

## Validation Scenarios

### 1. Register — Happy Path

```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","displayName":"Tester","password":"test1234"}'
```

**Expected**: `201` with `{ "message": "Đăng ký thành công" }` — no token returned.

**Frontend check**: Navigate to `/register`, fill form, submit → success message shown → redirected to `/login`.

### 2. Register — Password Checklist (FR-005a)

**Frontend check**: On `/register`, type in password field:
- Type "abc" → checklist shows: ❌ ≥ 8 ký tự, ✅ chữ cái, ❌ số
- Type "abcd1234" → checklist shows: ✅ ≥ 8 ký tự, ✅ chữ cái, ✅ số (all green)

### 3. Register — Duplicate Email

```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","displayName":"Another","password":"test1234"}'
```

**Expected**: `409` with `"Email đã tồn tại"`.

### 4. Register — Case-Insensitive Email

```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"TEST@example.com","displayName":"Upper","password":"test1234"}'
```

**Expected**: `409` — same email as scenario 1 (case-insensitive).

### 5. Login — Happy Path

```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test1234"}'
```

**Expected**: `200` with `{ "token": "...", "user": { ... } }`.

**Frontend check**: Navigate to `/login`, enter credentials → redirected to dashboard.

### 6. Login — Wrong Credentials

```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrongpass"}'
```

**Expected**: `401` with `"Email hoặc mật khẩu không đúng"` (neutral error).

### 7. Login — Rate Limiting (FR-021)

Send 6 consecutive failed login attempts for the same email within 15 minutes.

**Expected**: First 5 return `401`; 6th returns `429` with rate-limit message.

### 8. Logout

**Frontend check**: While logged in, click logout → token cleared from localStorage → accessing `/` or protected page redirects to `/login`.

### 9. Forgot Password — Happy Path

```bash
curl -X POST http://localhost:4000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

**Expected**: `200` with neutral message. In dev (no SMTP), console shows `[mailer:dev]` with the reset link containing the raw token.

### 10. Forgot Password — Non-Existing Email

```bash
curl -X POST http://localhost:4000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"nonexistent@example.com"}'
```

**Expected**: `200` with same neutral message (does not reveal email existence).

### 11. Reset Password — Happy Path

Use the token from scenario 9's console output:

```bash
curl -X POST http://localhost:4000/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"<raw-token-from-email>","newPassword":"newpass456"}'
```

**Expected**: `200` with `"Đặt lại mật khẩu thành công"`. Login with new password succeeds.

### 12. Reset Password — Reused Token

Repeat scenario 11 with the same token.

**Expected**: `400` with `"Token không hợp lệ hoặc đã hết hạn"`.

### 13. Admin Seed

```bash
cd backend
npx prisma db seed
```

**Expected**: Admin account created. Can login with seed credentials and access admin routes.

### 14. Terms Notice on Registration (FR-020)

**Frontend check**: `/register` page shows "Bằng việc đăng ký, bạn đồng ý với Điều khoản sử dụng và Chính sách bảo mật" text below the submit button.

## Build & Lint Gates

```bash
cd backend && npm run build && npm run lint
cd frontend && npm run build && npm run lint
```

Both must pass with zero errors before the feature is considered complete.
