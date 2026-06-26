# Research: Manage Users (012)

**Date**: 2026-06-26

## Decisions

### 1. User Status Terminology: LOCKED vs BANNED

**Decision**: Use `LOCKED` (existing schema enum `UserStatus.LOCKED`), not "BANNED" as the spec mentions.

**Rationale**: The Prisma schema already defines `enum UserStatus { ACTIVE LOCKED }` and the auth service checks `UserStatus.LOCKED` to block login. The mockup/spec used "Banned" as a UI label, but the underlying data model term is LOCKED. The frontend will display "Khoá" (locked) in Vietnamese.

**Alternatives considered**: Adding a new `BANNED` value to the enum — rejected because LOCKED already fulfills the same purpose and is wired into auth checks.

### 2. Ban Reason Field

**Decision**: Add `banReason String? @map("ban_reason")` to the User model. Populated when status is set to LOCKED, cleared when status is restored to ACTIVE.

**Rationale**: Spec clarification requires a mandatory ban reason. A nullable field on User is simpler than a separate audit table, since the AdminLog already captures the action history. The current `setStatus` DTO needs to accept an optional `reason` field (required when status=LOCKED).

**Alternatives considered**: Storing reason only in AdminLog — rejected because it's harder to display the active reason on the user record without a join.

### 3. Session Invalidation Strategy

**Decision**: Per-request status check in the `authenticate` middleware. When a user is locked, any subsequent API call with their JWT will be rejected.

**Rationale**: The auth middleware already decodes JWT and has access to `req.user.id`. Adding a DB check on `user.status` ensures locked users are blocked on the next request without needing a token blocklist. Trade-off: one extra lightweight DB query per authenticated request (user status by PK, indexed).

**Alternatives considered**: 
- Token blocklist (Redis) — rejected; adds infrastructure complexity for a low-frequency operation.
- Short JWT expiry only — rejected; doesn't guarantee immediate lockout.

### 4. Admin-Triggered Password Reset

**Decision**: Reuse the existing `authService.forgotPassword()` flow. The admin endpoint accepts a user ID, looks up their email, and calls the same reset token generation + email logic.

**Rationale**: The auth module already has complete forgot/reset password flow with token hashing, expiry, and email sending. No need to duplicate.

**Alternatives considered**: Admin sets password directly — rejected; violates security best practice (admin shouldn't know user passwords).

### 5. Prediction Accuracy Calculation

**Decision**: Compute accuracy on-the-fly from `Prediction` and `Criterion` tables as: `(correct predictions / total predictions) * 100`. Not stored as a persistent field.

**Rationale**: Accuracy changes after every match result. Computing it per-user on the list query adds some cost but avoids stale data and schema changes. For the paginated list (default 20 per page), the cost is manageable. A Prisma raw query or aggregation can compute it efficiently.

**Alternatives considered**: Materialized `accuracy` column with trigger updates — deferred unless performance testing shows issues with 10K+ users.

### 6. "Online Now" Approximation

**Decision**: Add a `lastActiveAt DateTime? @map("last_active_at")` field to User. Update it on every authenticated API call (debounced to avoid excessive writes — only update if last update > 5 minutes ago). "Online Now" = count of users where `lastActiveAt > now() - 15 minutes`.

**Rationale**: The simplest approach that doesn't require websockets or a separate presence service.

**Alternatives considered**: WebSocket presence — over-engineered for a stats card; Session table — adds schema complexity.

### 7. Edit User Endpoint

**Decision**: Add a `PATCH /api/v1/admin/users/:id` endpoint that accepts `{ displayName?, role? }` to update user profile fields. The existing `setRole` endpoint handles role-only changes; the new endpoint handles combined edits and display name changes.

**Rationale**: The mockup shows a single Edit action that opens a modal with both fields. A single PATCH endpoint is more ergonomic than separate calls.

**Alternatives considered**: Keep separate setRole + add setDisplayName — rejected; the modal submits both at once.

### 8. Frontend Approach: Redesign vs Enhance

**Decision**: Rewrite the `admin/users/page.tsx` to match the Stitch mockup layout (dark theme, glass panels, stats bento, action columns). The current page uses a light-theme admin UI kit (`components/admin/ui.tsx`) which doesn't match the mockup.

**Rationale**: Constitution Principle IV requires UI to baseline on Stitch mockups. The current page is a functional skeleton but visually divergent from the mockup. The mockup uses the Elite Pitch dark theme with glass panels, which is the design system standard.

**Alternatives considered**: Incrementally adding mockup styles — rejected; the layout structure differs enough that a rewrite is cleaner.
