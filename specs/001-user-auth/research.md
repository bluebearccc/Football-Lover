# Research: User Authentication (001-user-auth)

## Existing Implementation Inventory

### Backend (`backend/src/modules/auth/`)

The auth module is **largely implemented** with proper layered architecture:

| File | Status | Notes |
|------|--------|-------|
| `auth.controller.ts` | Exists | register, login, logout, me, forgotPassword, resetPassword |
| `auth.service.ts` | Exists | Business logic with bcrypt, JWT, reset tokens |
| `auth.repository.ts` | Exists | Prisma-based CRUD for User and PasswordResetToken |
| `auth.routes.ts` | Exists | POST register/login/logout/forgot-password/reset-password, GET me |
| `auth.dto.ts` | Exists | Zod schemas for all inputs |

Supporting utilities:
- `utils/jwt.ts` — sign/verify JWT with configurable expiry (default 7d)
- `utils/password.ts` — bcrypt hash/verify (10 rounds)
- `utils/token.ts` — crypto.randomBytes reset token + SHA-256 hash
- `lib/mailer.ts` — stub (dev: console.log; prod: throws if no SMTP)
- `lib/prisma.ts` — singleton Prisma client
- `middleware/auth.ts` — authenticate (Bearer JWT) + requireRole
- `config/env.ts` — JWT secret, expiry, reset TTL, SMTP config

### Frontend (`frontend/src/`)

| File | Status | Notes |
|------|--------|-------|
| `app/(auth)/login/page.tsx` | Exists | Renders LoginForm |
| `app/(auth)/register/page.tsx` | Exists | Renders RegisterForm |
| `app/(auth)/forgot-password/page.tsx` | Exists | Renders ForgotPasswordForm |
| `app/(auth)/reset-password/page.tsx` | Exists | Renders ResetPasswordForm |
| `components/auth/LoginForm.tsx` | Exists | Email/password form |
| `components/auth/RegisterForm.tsx` | Exists | Email/displayName/password form |
| `components/auth/ForgotPasswordForm.tsx` | Exists | Email form |
| `components/auth/ResetPasswordForm.tsx` | Exists | Token + new password form |
| `components/auth/fields.tsx` | Exists | Shared Field + SubmitButton |
| `components/auth/ValidationMessage.tsx` | Exists | Error display |
| `api/auth.ts` | Exists | AuthApiClient — register/login/logout/me/forgotPassword/resetPassword |
| `api/client.ts` | Exists | apiFetch wrapper |
| `lib/session.ts` | Exists | localStorage JWT + user cache |
| `lib/validation.ts` | Exists | Client-side email/password/displayName validators |

### Prisma Schema

User and PasswordResetToken models exist and match the SRS ER diagram. No schema migration needed.

## Gaps Analysis (Spec vs Implementation)

### Decision 1: Rate Limiting (FR-021, FR-022) — NOT IMPLEMENTED

- **Decision**: Add rate limiting middleware for login (5 attempts/15 min per account) and forgot-password (3 requests/hour per email).
- **Rationale**: Spec clarification requires it; prevents brute-force attacks and reset-token enumeration.
- **Alternatives considered**:
  - Redis-based rate limiter (express-rate-limit + rate-limit-redis) — overkill for ~100 users
  - In-memory Map with TTL cleanup — simple, appropriate for scale
- **Approach**: Create `backend/src/middleware/rate-limit.ts` using in-memory Map with configurable windows. Apply to `/auth/login` and `/auth/forgot-password` routes.

### Decision 2: Post-Registration Flow — BEHAVIOR CHANGE

- **Decision**: Registration should NOT auto-login. Return success message + redirect to login page.
- **Rationale**: Spec clarification — user chose redirect-to-login.
- **Current behavior**: `authService.register()` returns `{ token, user }` (auto-login); `RegisterForm` saves session and redirects to `/`.
- **Changes needed**:
  - Backend: `register()` returns `{ message }` instead of `{ token, user }`
  - Frontend: `RegisterForm` redirects to `/login` with success message instead of saving session

### Decision 3: Case-Insensitive Email (FR-002) — PARTIAL

- **Decision**: Normalize email to lowercase before storage and lookup.
- **Rationale**: Spec requires case-insensitive uniqueness (e.g., `User@Mail.com` = `user@mail.com`).
- **Current behavior**: `findUserByEmail` uses `prisma.user.findUnique({ where: { email } })` — Prisma/PostgreSQL default is case-sensitive.
- **Changes needed**: Lowercase email in `register()` and `login()` service methods before lookup/storage.

### Decision 4: Old Reset Token Invalidation — NOT IMPLEMENTED

- **Decision**: Invalidate (mark used) all existing unexpired tokens for a user when a new reset is requested.
- **Rationale**: Edge case from spec — "previous tokens should be invalidated or only the latest is valid."
- **Changes needed**: In `forgotPassword()`, before creating new token, update all unused tokens for that user with `usedAt = now()`.

### Decision 5: Password Safety Checklist (FR-005a) — NOT IMPLEMENTED

- **Decision**: Add a `PasswordChecklist` component that shows real-time check/uncheck status for 3 rules.
- **Rationale**: Spec clarification — display checklist as user types password.
- **Approach**: New `frontend/src/components/auth/PasswordChecklist.tsx` component, rendered below password field in RegisterForm (and optionally in ResetPasswordForm).

### Decision 6: Admin Seed Script — NOT IMPLEMENTED

- **Decision**: Create `backend/prisma/seed.ts` to seed initial Admin account.
- **Rationale**: Spec clarification — Admin accounts are pre-created via database seed, not self-registered.
- **Approach**: Use `prisma db seed` convention. Hash a configurable password from env.

### Decision 7: Terms of Use Notice (FR-020) — NOT IMPLEMENTED

- **Decision**: Add Terms of Use / Privacy Policy notice text below the register button.
- **Rationale**: SRS and spec require it; mockup also shows it.
- **Approach**: Static text with links in RegisterForm, matching mockup layout.

### Decision 8: Mailer SMTP Integration — STUB ONLY

- **Decision**: Wire nodemailer transport when SMTP_HOST is set.
- **Rationale**: Password reset requires sending email. Current stub logs to console in dev.
- **Approach**: Install `nodemailer`, create transport in `lib/mailer.ts` when `env.mail.host` is set. Keep dev fallback for local testing.

### Decision 9: UI Alignment with Stitch Mockups — PARTIAL

- **Decision**: Auth forms should use Material-3 Elite Pitch tokens from `tailwind.config.ts` and match the Stitch mockup layout (glass-card, atmospheric background, icon-decorated inputs).
- **Current state**: Forms exist but use minimal styling (legacy pitch/gold/ink tokens in some places). Layout is simpler than mockup.
- **Mockup conflicts with SRS (omit from UI)**:
  - Login mockup: "Remember me for 30 days" checkbox — not in SRS scope
  - Login mockup: Social login (Google/Facebook) — not in SRS scope
  - Register mockup: "Favorite Team" select — not in SRS scope
  - Register mockup: "USERNAME" label → SRS uses "display_name" (spec wins for field name/label)
- **Keep from mockup**: glass-card styling, atmospheric backgrounds, Material Symbols icons, input-glow focus, accent-glow button, brand header, Terms/Privacy footer.
