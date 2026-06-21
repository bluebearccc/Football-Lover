# Feature Specification: User Authentication

**Feature Branch**: `001-user-auth`

**Created**: 2026-06-21

**Status**: Draft

**Input**: User description: "auth — UC01 Register Account, UC02 Login/Logout, UC15 Reset Password via Email"

## Clarifications

### Session 2026-06-21

- Q: Should the system rate-limit failed login attempts and password reset requests? → A: Yes, rate-limit both — login: 5 failed attempts per 15 minutes; password reset: 3 requests per hour per email.
- Q: After successful registration, should the user be auto-logged-in or redirected to login? → A: Redirect to login page with a success message; user must enter credentials separately.
- Q: How should Admin accounts be created? → A: Database seed script during initial deployment; registration only creates Registered User accounts.
- Q: Should the registration form provide real-time password guidance? → A: Yes, display a password safety checklist that updates as the user types (minimum 8 characters, contains letters, contains numbers).

## User Scenarios & Testing

### User Story 1 - Register a New Account (Priority: P1)

A football fan (Guest) visits the platform for the first time and wants to create an account so they can participate in match predictions. They open the registration page, fill in their email, display name, and a password. As they type the password, a safety checklist updates in real time showing which requirements are met (minimum 8 characters, contains letters, contains numbers). Once all fields are valid, they submit. The system validates all fields, checks that the email is not already taken, creates the account, shows a success message, and redirects them to the login page.

**Why this priority**: Without registration, no user can access any authenticated feature — predictions, comments, chatbot, profile. This is the entry point to the entire system.

**Independent Test**: Can be fully tested by navigating to the registration page, submitting valid data, and verifying the account is created. Delivers value: a new user exists and can proceed to login.

**Acceptance Scenarios**:

1. **Given** Guest is on the registration page, **When** valid email, display name, and policy-compliant password are submitted, **Then** account is created successfully, Guest sees a success message, and is redirected to the login page.
2. **Given** an email already exists in the system, **When** Guest submits registration with that email, **Then** system rejects the request with a duplicate email message.
3. **Given** password is shorter than 8 characters or lacks letters or numbers, **When** Guest submits registration, **Then** system blocks submission and shows the password policy error.
4. **Given** display name is empty, **When** Guest submits registration, **Then** system blocks submission and shows a required field error.
5. **Given** email format is invalid, **When** Guest submits registration, **Then** system blocks submission and shows an invalid email error.

---

### User Story 2 - Login and Access the Platform (Priority: P1)

A registered user wants to log in with their email and password to access predictions, comments, and their profile. They enter credentials on the login page. If correct and the account is active, they receive an authenticated session and are redirected to the main dashboard. If credentials are wrong or the account is locked, a safe error is shown without revealing which field is incorrect.

**Why this priority**: Login is equally critical as registration — without it, registered users cannot access any protected feature. Login and registration together form the minimum viable authentication.

**Independent Test**: Can be fully tested by attempting login with valid and invalid credentials, verifying session creation and error handling. Delivers value: authenticated access to the platform.

**Acceptance Scenarios**:

1. **Given** an active account exists, **When** correct email and password are submitted, **Then** a session/token is created and user is redirected to the dashboard.
2. **Given** wrong credentials are submitted, **When** login is attempted, **Then** system shows a safe, neutral error message without revealing which field is wrong.
3. **Given** the account is locked, **When** login is attempted, **Then** system denies access with an appropriate message.
4. **Given** session/token has expired, **When** user tries to access a protected page, **Then** system redirects to the login page.

---

### User Story 3 - Logout (Priority: P1)

A logged-in user wants to end their session. They click the logout action. The system clears their session/token and redirects them to the public page (login or match list).

**Why this priority**: Logout completes the authentication lifecycle and is essential for security — shared devices, switching accounts, or ending a session intentionally.

**Independent Test**: Can be tested by logging in, clicking logout, and verifying the session is cleared and protected pages are no longer accessible.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** logout is requested, **Then** session/token is cleared and user is redirected to the login page.
2. **Given** a logged-out user, **When** they try to access a protected page, **Then** system redirects to login.

---

### User Story 4 - Reset Forgotten Password (Priority: P2)

A registered user has forgotten their password. From the login page, they click "Forgot password" and enter their email. The system sends a single-use, time-limited reset link to that email (without revealing whether the email exists). The user opens the link, enters a new policy-compliant password, and submits. The system updates the password and consumes the token.

**Why this priority**: Password reset is important for user retention — locked-out users cannot participate. However, it is secondary to core login/register because it requires an email provider integration and is used less frequently.

**Independent Test**: Can be tested by requesting a reset, receiving the email, clicking the link, and setting a new password. Delivers value: users who forgot their password can regain access.

**Acceptance Scenarios**:

1. **Given** an existing email, **When** user requests a password reset, **Then** a single-use, time-limited token is emailed.
2. **Given** a non-existing email, **When** user requests a reset, **Then** system responds with the same neutral message (does not reveal whether the email exists).
3. **Given** a valid, unexpired token and a policy-compliant new password, **When** submitted, **Then** the password is updated and the token is consumed.
4. **Given** an expired token, **When** submitted, **Then** system rejects it with a clear message.
5. **Given** an already-used token, **When** submitted, **Then** system rejects it with a clear message.
6. **Given** a new password that does not meet the policy, **When** submitted with a valid token, **Then** system shows the password policy error.

---

### Edge Cases

- What happens when a user tries to register with an email that differs only in casing (e.g., `User@mail.com` vs `user@mail.com`)? Email comparison should be case-insensitive.
- What happens when a user submits the login form with empty fields? System shows validation errors for required fields.
- What happens when multiple password reset requests are made for the same email? Each request generates a new token; previous tokens should be invalidated or only the latest is valid.
- What happens when a locked account requests a password reset? The system sends the same neutral response (does not reveal account status) but the reset should not unlock the account.
- What happens when network is lost during form submission? User sees a retry/connection error message.
- What happens when session expires while user is on a page? Next protected action redirects to login.
- What happens when a user exceeds the login attempt limit? System temporarily blocks login for that account for the remainder of the 15-minute window and shows a "too many attempts" message.
- What happens when password reset request limit is exceeded? System shows the same neutral response but does not send another email.

## Requirements

### Functional Requirements

- **FR-001**: System MUST allow Guests to register with email, display name, and password.
- **FR-002**: System MUST reject registration with a duplicate email address (case-insensitive comparison).
- **FR-003**: System MUST enforce password policy: minimum 8 characters containing both letters and numbers.
- **FR-004**: System MUST validate email format and reject invalid emails.
- **FR-005**: System MUST require a non-empty display name for registration.
- **FR-005a**: System MUST display a real-time password safety checklist on the registration form that updates as the user types, showing check/uncheck status for each rule: minimum 8 characters, contains at least one letter, contains at least one number.
- **FR-006**: System MUST authenticate users with email and password.
- **FR-007**: System MUST store passwords only as secure hashes; plaintext passwords are never stored or logged.
- **FR-008**: System MUST create a session/token upon successful login.
- **FR-009**: System MUST expire sessions/tokens after a configured duration (default: 7 days, configurable via `JWT_EXPIRES_IN` environment variable) and require login again.
- **FR-010**: System MUST show a safe, neutral error on login failure without revealing which field is wrong.
- **FR-011**: System MUST support account locking (by Admin or system policy); locked accounts cannot log in.
- **FR-012**: System MUST clear session/token on logout.
- **FR-013**: System MUST support RBAC with three roles: Guest (unauthenticated), Registered User, and Admin. Registration only creates Registered User accounts; Admin accounts are pre-created via a database seed script during initial deployment.
- **FR-014**: System MUST allow users to request a password reset by providing their email.
- **FR-015**: System MUST send a single-use, time-limited reset token via email without revealing whether the email exists.
- **FR-016**: System MUST store only the hash of the reset token, never the raw token.
- **FR-017**: System MUST allow setting a new policy-compliant password with a valid, unexpired, unused token.
- **FR-018**: System MUST reject expired or already-used reset tokens with a clear message.
- **FR-019**: System MUST redirect unauthenticated users to the login page when they attempt to access protected resources.
- **FR-020**: System MUST display a basic Terms of Use/Privacy Policy notice during registration.
- **FR-021**: System MUST rate-limit failed login attempts to 5 per 15-minute window per account; exceeding the limit temporarily blocks further login attempts for that account.
- **FR-022**: System MUST rate-limit password reset requests to 3 per hour per email address; exceeding the limit silently ignores additional requests (same neutral response shown).

### Key Entities

- **User**: Represents a registered account. Key attributes: email (unique), display name, password hash, role (Guest/User/Admin), account status (active/locked), creation timestamp.
- **PasswordResetToken**: Represents a password reset request. Key attributes: linked user, token hash (never raw), expiration time, used-at timestamp, creation timestamp. Single-use and time-limited.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can complete account registration in under 2 minutes from opening the registration page.
- **SC-002**: Users can log in and reach the dashboard in under 30 seconds.
- **SC-003**: 95% of login attempts with valid credentials succeed on the first try.
- **SC-004**: Password reset flow (request to new password set) can be completed in under 5 minutes.
- **SC-005**: No plaintext passwords or raw reset tokens are ever stored or visible in system outputs.
- **SC-006**: Locked accounts are fully prevented from accessing authenticated features.
- **SC-007**: Error messages on login failure do not reveal whether the email or password was incorrect.
- **SC-008**: Expired or used reset tokens are rejected 100% of the time.

## Assumptions

- Users have access to a working email inbox to receive password reset links.
- The email provider (SMTP or transactional email service) is configured and operational on the server side.
- The system uses session-based or token-based (JWT) authentication — the specific mechanism is an implementation decision.
- Email uniqueness is enforced case-insensitively (e.g., `User@Mail.com` and `user@mail.com` are treated as the same).
- The password reset token expiration duration is a server-side configuration (reasonable default: 1 hour).
- Registration does not require email verification in v1.0.0 (not mentioned in SRS scope).
- The UI is in Vietnamese, following the project-wide localization requirement.
- This feature does not include 2FA (explicitly out of scope for v1.0.0).
