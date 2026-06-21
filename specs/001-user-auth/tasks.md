# Tasks: User Authentication

**Input**: Design documents from `specs/001-user-auth/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/auth-api.md, quickstart.md

**Tests**: Not explicitly requested — test tasks omitted. Validation via quickstart.md scenarios in Polish phase.

**Organization**: Tasks grouped by user story. US1 (Register) and US2 (Login) are both P1 but independent. US3 (Logout) is P1 and trivial. US4 (Reset Password) is P2.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- File paths relative to repository root

---

## Phase 1: Setup

**Purpose**: Install dependencies and create seed script

- [x] T001 Install `nodemailer` and `@types/nodemailer` in `backend/`
- [x] T002 [P] Create admin seed script in `backend/prisma/seed.ts` — hash a default admin password from env (`ADMIN_EMAIL`, `ADMIN_PASSWORD`), upsert a User with role ADMIN; add `prisma.seed` config to `backend/package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared infrastructure that MUST complete before any user story work

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Create rate-limit middleware in `backend/src/middleware/rate-limit.ts` — in-memory Map with configurable window/max, keyed by identifier (email); export `createRateLimiter(options)` that returns Express middleware; options include `onLimitReached?: (res) => void` callback — default behavior: return 429 with Vietnamese message "Quá nhiều yêu cầu, vui lòng thử lại sau"; when callback provided, delegate response to caller (used by T020 to return 200 with neutral message); auto-cleanup expired entries
- [x] T004 [P] Add case-insensitive email handling in `backend/src/modules/auth/auth.service.ts` — call `.toLowerCase()` on email in `register()` and `login()` before passing to repository
- [x] T005 [P] Wire nodemailer SMTP transport in `backend/src/lib/mailer.ts` — when `env.mail.host` is set, create a nodemailer transport using `env.mail.*` config and send via `transporter.sendMail()`; keep existing dev fallback (console.log) when no SMTP host
- [x] T006 [P] Update shared auth layout in `frontend/src/app/(auth)/layout.tsx` — add atmospheric background effects (gradient blurs), brand header with GoalPredict Live logo + soccer icon + tagline, glass-card container wrapper, all per Stitch mockup `login/code.html` and `register/code.html` base structure; use Elite Pitch Material-3 tokens from `tailwind.config.ts`
- [x] T007 [P] Update shared input component in `frontend/src/components/auth/fields.tsx` — add Material Symbols Outlined icon support to Field component (icon prop), apply Stitch mockup input styling: `bg-surface-container-lowest border-outline-variant/30 rounded-lg py-3 pl-11 pr-4` with `input-glow` focus effect (box-shadow primary/20, border-color primary); add password visibility toggle button

**Checkpoint**: Foundation ready — rate-limit middleware, email normalization, mailer, and shared UI components are in place

---

## Phase 3: User Story 1 — Register a New Account (Priority: P1) 🎯 MVP

**Goal**: Guest can register with email/display name/password, sees real-time password checklist, and is redirected to login page with success message

**Independent Test**: Navigate to `/register`, fill valid data → success message → redirected to `/login`. Try duplicate email → rejected. Type in password field → checklist updates live.

### Implementation for User Story 1

- [x] T008 [US1] Modify `backend/src/modules/auth/auth.service.ts` `register()` — remove `issueToken()` call; return `{ message: 'Đăng ký thành công' }` instead of `{ token, user }`
- [x] T009 [US1] Modify `backend/src/modules/auth/auth.controller.ts` `register()` — update response type to match new service return (201 + message object, no token)
- [x] T010 [P] [US1] Create `frontend/src/components/auth/PasswordChecklist.tsx` — receives `password: string` prop; displays 3 rule items with check/uncheck icons (✅/❌) that update as user types: "Ít nhất 8 ký tự", "Chứa chữ cái", "Chứa chữ số"; use `text-primary` for pass, `text-on-surface-variant` for fail; keep component pure (no state)
- [x] T011 [P] [US1] Update `frontend/src/api/auth.ts` — change `register()` return type from `AuthResponse` (token+user) to `{ message: string }`
- [x] T012 [US1] Update `frontend/src/components/auth/RegisterForm.tsx` — (1) remove `session.save()` on register success; redirect to `/login` with success toast/message instead of `/`; (2) add `<PasswordChecklist password={password} />` below password field; (3) add Terms of Use/Privacy Policy notice text below submit button per mockup: "Bằng việc đăng ký, bạn đồng ý với Điều khoản sử dụng và Chính sách bảo mật"; (4) align visual with Stitch `register/code.html`: glass-panel card, icon-decorated fields (person for displayName, mail for email, lock for password), primary-colored CTA button with `accent-glow`, "Đã có tài khoản? Đăng nhập" footer link
- [x] T013 [US1] Update `frontend/src/app/(auth)/register/page.tsx` — adjust page heading and layout to use `headline-md` typography per Stitch mockup; remove redundant wrapper if layout.tsx now handles the card container

**Checkpoint**: Registration flow complete — Guest registers → sees success → lands on login page. Password checklist provides real-time feedback. Terms notice visible.

---

## Phase 4: User Story 2 — Login and Access the Platform (Priority: P1)

**Goal**: Registered user logs in with email/password, gets JWT token, is redirected to dashboard. Rate-limited to 5 failed attempts per 15 minutes.

**Independent Test**: Login with valid credentials → token issued → redirected to dashboard. Wrong password → neutral error. 6th failed attempt within 15 min → 429 rate limit.

### Implementation for User Story 2

- [x] T014 [US2] Apply rate-limit middleware to login route in `backend/src/modules/auth/auth.routes.ts` — use `createRateLimiter({ windowMs: 15 * 60 * 1000, max: 5, keyExtractor: req => req.body.email })` before the `validateBody(loginSchema)` middleware on `/login`
- [x] T015 [US2] Update `frontend/src/components/auth/LoginForm.tsx` — align with Stitch `login/code.html`: glass-card styling, icon-decorated email (mail icon) and password (lock icon) fields, password visibility toggle, primary CTA button with `accent-glow`, "Quên mật khẩu?" link next to password label, "Chưa có tài khoản? Đăng ký" footer link; **omit** "Remember me" checkbox and social login buttons (not in SRS scope)
- [x] T016 [US2] Update `frontend/src/app/(auth)/login/page.tsx` — adjust heading typography per Stitch mockup; ensure auth success message from registration is displayed if present (e.g., via URL search param or toast)

**Checkpoint**: Login flow complete — user logs in → dashboard. Rate limiting protects against brute force.

---

## Phase 5: User Story 3 — Logout (Priority: P1)

**Goal**: Logged-in user clicks logout, session/token is cleared, redirected to login page.

**Independent Test**: While logged in, click logout → localStorage cleared → accessing protected page redirects to `/login`.

### Implementation for User Story 3

- [x] T017 [US3] Verify logout flow end-to-end — confirm that the logout action (wherever triggered — header/nav) calls `authApi.logout()`, then `session.clear()`, then `router.push('/login')`. If redirect target is not `/login`, update it. No backend changes needed (already returns "Đã đăng xuất").
- [x] T017a [US2] Verify locked-account handling — confirm `auth.service.ts` `login()` rejects locked users with neutral error (already checks `UserStatus.LOCKED`); confirm `forgotPassword()` silently ignores locked accounts; test: seed a locked user, attempt login → denied, attempt reset → same neutral response, verify reset does NOT unlock account

**Checkpoint**: Logout works — session cleared, user redirected to login.

---

## Phase 6: User Story 4 — Reset Forgotten Password (Priority: P2)

**Goal**: User requests password reset by email, receives single-use token link, sets new password. Rate-limited to 3 requests per hour. Old tokens invalidated on new request.

**Independent Test**: Request reset → email sent (console in dev) → use token link → set new password → login with new password works. Reuse token → rejected. 4th request in 1 hour → silently ignored.

### Implementation for User Story 4

- [x] T018 [US4] Add `invalidateUserResetTokens(userId: string)` method in `backend/src/modules/auth/auth.repository.ts` — update all PasswordResetToken records for the user where `usedAt IS NULL` to set `usedAt = now()`
- [x] T019 [US4] Update `backend/src/modules/auth/auth.service.ts` `forgotPassword()` — call `authRepository.invalidateUserResetTokens(user.id)` before creating the new token
- [x] T020 [US4] Apply rate-limit middleware to forgot-password route in `backend/src/modules/auth/auth.routes.ts` — use `createRateLimiter({ windowMs: 60 * 60 * 1000, max: 3, keyExtractor: req => req.body.email })` on `/forgot-password`; on limit exceeded, still return 200 with neutral message (not 429) to avoid email enumeration
- [x] T021 [P] [US4] Update `frontend/src/components/auth/ForgotPasswordForm.tsx` — align with Stitch `forgot_password/code.html`: glass-card, mail icon on email input, primary CTA "Gửi liên kết đặt lại", success state showing "Kiểm tra email" with check_circle icon and "Gửi lại" button, "Quay lại đăng nhập" link with back arrow icon
- [x] T022 [P] [US4] Update `frontend/src/components/auth/ResetPasswordForm.tsx` — add `<PasswordChecklist password={newPassword} />` below new password field; align styling with glass-card, lock icon on password input, primary CTA
- [x] T023 [US4] Update `frontend/src/app/(auth)/forgot-password/page.tsx` and `frontend/src/app/(auth)/reset-password/page.tsx` — adjust page headings and layout per Stitch mockup

**Checkpoint**: Full password reset flow works — request → email → token link → new password. Rate limiting and token invalidation protect against abuse.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and build gates

- [x] T024 Run `npm run build` in `backend/` — fix any TypeScript errors
- [x] T025 [P] Run `npm run build` in `frontend/` — fix any TypeScript errors
- [x] T026 Run `npm run lint` in `backend/` and `frontend/` — fix any lint errors
- [x] T027 Run quickstart.md validation scenarios (scenarios 1–14) — verify all pass
- [x] T027a Verify JWT expiration — confirm `env.ts` reads `JWT_EXPIRES_IN` (default 7d), `jwt.ts` passes it to `sign()`, and an expired token is rejected by `authenticate` middleware
- [x] T028 Verify Stitch mockup alignment by visually comparing `/login`, `/register`, `/forgot-password`, `/reset-password` pages against `stitch_goalpredict_live_dashboard/` screen.png files

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories
- **US1 Register (Phase 3)**: Depends on Phase 2 — MVP target
- **US2 Login (Phase 4)**: Depends on Phase 2 — can run parallel with US1
- **US3 Logout (Phase 5)**: Depends on Phase 2 — can run parallel with US1/US2
- **US4 Reset Password (Phase 6)**: Depends on Phase 2 — can run parallel with US1/US2/US3
- **Polish (Phase 7)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (Register)**: Independent — no dependency on other stories
- **US2 (Login)**: Independent — no dependency on other stories (but logically follows US1 for end-to-end testing)
- **US3 (Logout)**: Independent — works if login has ever been called, but can verify standalone
- **US4 (Reset Password)**: Independent — no dependency on other stories

### Within Each User Story

- Backend changes before frontend changes (API contract must be stable)
- Shared components (PasswordChecklist) can be built parallel with backend
- Page-level changes after component changes

### Parallel Opportunities

```
Phase 2 (all [P] tasks):
  T003 rate-limit.ts  ║  T004 email normalize  ║  T005 mailer.ts  ║  T006 auth layout  ║  T007 fields.tsx

Phase 3 US1 (after T008-T009 backend):
  T010 PasswordChecklist  ║  T011 api/auth.ts type update
  Then: T012 RegisterForm  →  T013 register page

Phase 4 US2:
  T014 rate-limit route  →  T015 LoginForm  →  T016 login page

Phase 6 US4 (after T018-T020 backend):
  T021 ForgotPasswordForm  ║  T022 ResetPasswordForm
  Then: T023 pages
```

---

## Implementation Strategy

### MVP First (User Story 1 — Register)

1. Complete Phase 1: Setup (T001–T002)
2. Complete Phase 2: Foundational (T003–T007)
3. Complete Phase 3: User Story 1 — Register (T008–T013)
4. **STOP and VALIDATE**: Test registration end-to-end per quickstart.md scenarios 1–4
5. Proceed to Phase 4 (Login) for full auth cycle

### Incremental Delivery

1. Setup + Foundational → infrastructure ready
2. US1 Register → can create accounts (MVP!)
3. US2 Login → can authenticate (full auth cycle)
4. US3 Logout → session management complete
5. US4 Reset Password → self-service recovery
6. Polish → build gates, visual QA, quickstart validation

### Single Developer Strategy (Recommended)

Sequential: Phase 1 → Phase 2 → Phase 3 (US1) → Phase 4 (US2) → Phase 5 (US3) → Phase 6 (US4) → Phase 7

Within each phase, maximize parallel task execution where marked [P].

---

## Phase 8: Convergence

**Purpose**: Close remaining gaps found by `/speckit-converge` between spec/plan/contract artifacts and the current implementation.

- [x] T029 Update `frontend/src/components/auth/ValidationMessage.tsx` — replace legacy light-theme colors with dark-theme-compatible Material-3 tokens: success tone use `border-primary/30 bg-primary/10 text-primary`, error tone use `border-error/30 bg-error/10 text-error` per Constitution IV (partial)
- [x] T030 [P] Update `frontend/src/components/auth/fields.tsx` — remove the icon from the `<label>` element; keep only the absolute-positioned icon overlay inside the input `<div>` to eliminate visual duplication, matching the login mockup pattern consistently per Constitution IV (partial)
- [x] T031 [P] Update `backend/src/middleware/rate-limit.ts` — change default 429 message from `"Quá nhiều yêu cầu, vui lòng thử lại sau"` to `"Quá nhiều lần thử, vui lòng thử lại sau"` to match the login API contract per `contracts/auth-api.md` (partial)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Backend auth module already exists — most tasks are modifications, not greenfield
- 3 new files: `backend/prisma/seed.ts`, `backend/src/middleware/rate-limit.ts`, `frontend/src/components/auth/PasswordChecklist.tsx`
- Mockup conflicts resolved: social login, remember me, favorite team → omitted (not in SRS)
- Stop at any checkpoint to validate story independently
