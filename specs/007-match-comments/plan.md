# Implementation Plan: Match Comments (UC08)

**Branch**: `feature/match-comments` | **Date**: 2026-06-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/007-match-comments/spec.md`

## Summary

Enable registered users to post comments on matches and allow guests to read them. The `Comment` model and admin moderation surface already exist; this plan adds the user-facing submission endpoint with rate limiting and content validation (backend) plus the comment form and `CommentSection` component (frontend). No database migration is required.

## Technical Context

**Language/Version**: TypeScript (strict mode) — Node.js 18+ (backend), Next.js 14.2.x (frontend)

**Primary Dependencies**: Express + Prisma 6 (backend); React + TailwindCSS (frontend). No new packages needed.

**Storage**: PostgreSQL via Prisma — `Comment` table already exists with correct schema and indexes.

**Testing**: Manual validation via quickstart scenarios; `npm run build` + `npm run lint` gates.

**Target Platform**: Web (desktop + mobile responsive); backend single-server Node.js.

**Performance Goals**: Comment submission < 1 second end-to-end (SRS NFR: < 500ms p95).

**Constraints**: Rate limit 5 comments/60s per user, 10s minimum between comments. Content 1–1000 chars. Banned-word list empty by default (v1.1.0).

**Scale/Scope**: 10–20 comments per match; moderate overall volume. In-memory rate-limit store is sufficient for single-server v1.

**Project Type**: Web application (backend API + frontend Next.js app)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I — Spec-Driven Development ✅

All work traces to UC08, FR-08, AC-08-01/02/03, and BR15–BR18. The `Comment` model matches the ER diagram. No undocumented behavior added.

### II — Layered Architecture ✅

New code follows the existing comments module shape: `commentsController.create → commentsService.create → ModerationService + commentsRepository.save`. No layer-skipping.

### III — Contract-First APIs & Validation ✅

`createCommentSchema` (Zod) added to `comments.dto.ts`. `validateBody` middleware on the POST route. `authenticate` enforces login (401 for guests). Errors raised as `ApiError`. See [contracts/api.md](contracts/api.md).

### IV — Frontend Discipline ✅

**UI baseline (Principle IV)**:

- [x] Screen folder: `stitch_goalpredict_live_dashboard/match_details/` — the "Comments" / "Bình luận" tab is present in the mockup nav. The mockup does not render a static comment form (prototype shows Overview tab); the comment card visual follows the existing `glass` / Elite Pitch pattern in `CommentList.tsx`.
- [x] Layout follows existing match detail page structure (tabbed panel, `glass` container, Elite Pitch spacing). No layout invented outside established patterns.
- [x] No new Tailwind tokens required — existing tokens (`glass`, `surface-container-low`, `outline-variant`, `on-surface`, `on-surface-variant`, `pitch`) cover the form.
- [x] No mockup ↔ spec conflicts identified.

### V — Quality Gates ✅

`npm run build` + `npm run lint` must pass in `backend/` and `frontend/` after implementation.

## Project Structure

### Documentation (this feature)

```text
specs/007-match-comments/
├── plan.md          ← this file
├── research.md      ← Phase 0 output
├── data-model.md    ← Phase 1 output
├── quickstart.md    ← Phase 1 output
├── contracts/
│   └── api.md       ← Phase 1 output
└── tasks.md         ← Phase 2 output (/speckit-tasks)
```

### Source Code Changes

```text
backend/src/modules/comments/
├── comments.controller.ts   ← add create() handler
├── comments.service.ts      ← add create() method
├── comments.repository.ts   ← add save() method
├── comments.dto.ts          ← add createCommentSchema
└── moderation.service.ts    ← NEW: rate-limit + content validation

backend/src/modules/public-matches/
└── public-matches.routes.ts ← add POST /:id/comments (authenticate + validateBody)

frontend/src/api/
└── matches.ts               ← add createComment()

frontend/src/components/matches/
├── CommentSection.tsx        ← NEW: 'use client', manages form + list state
└── CommentList.tsx           ← unchanged (pure display)

frontend/src/app/(main)/matches/[id]/
└── page.tsx                  ← swap CommentList → CommentSection in comments tab
```

**Structure Decision**: Web application layout (backend + frontend). All backend code stays within the existing `modules/comments/` domain; frontend additions follow the `components/matches/` pattern.

## Implementation Phases

### Phase A — Backend: ModerationService + create endpoint

**A1. `moderation.service.ts`** (new file in `backend/src/modules/comments/`):
- Export `BANNED_WORDS: Set<string>` (empty `new Set()` for v1.1.0)
- In-memory `Map<userId, { count, window, lastAt }>` for rate tracking
- `validateContent(content: string): void` — throws `ApiError.badRequest` on empty / too-long / banned
- `checkRateLimit(userId: string): void` — throws `ApiError` (429) if ≥5 in 60s window or <10s since last

**A2. `comments.dto.ts`** — add `createCommentSchema` (Zod: trim, min 1, max 1000) + `CreateCommentInput` type

**A3. `comments.repository.ts`** — add `save(data: { matchId, userId, content })`: `prisma.comment.create` with user relation included in return

**A4. `comments.service.ts`** — add `create(userId, matchId, content)`:
1. `prisma.match.findUnique({ where: { id: matchId } })` → 404 if null
2. `moderationService.validateContent(content)`
3. `moderationService.checkRateLimit(userId)`
4. `commentsRepository.save({ matchId, userId, content })`

**A5. `comments.controller.ts`** — add `create(req, res)`:
- `matchId` from `req.params.id`, `content` from validated `req.body`, `userId` from `req.user.id`
- Call `commentsService.create`, return 201

**A6. `public-matches.routes.ts`** — add:
```ts
publicMatchesRoutes.post(
  '/:id/comments',
  authenticate,
  validateBody(createCommentSchema),
  wrap(commentsController.create),
);
```

### Phase B — Frontend: CommentSection + API client

**B1. `frontend/src/api/matches.ts`** — add `createComment(matchId, content)`:
- `POST /matches/${matchId}/comments` with Bearer token
- Returns `MatchComment`

**B2. `frontend/src/components/matches/CommentSection.tsx`** (new, `'use client'`):
- Props: `initialComments: MatchComment[]`, `matchId: string`, `isLoggedIn: boolean`
- State: `comments`, `content`, `error`, `submitting`
- Guest path: "Đăng nhập để bình luận" prompt (no form)
- Logged-in path: textarea (max 1000 chars) + submit button + character counter
- On submit: client-side non-empty check → call `matchesApi.createComment` → prepend to `comments` on success; show error message on 400/429
- Renders `<CommentList comments={comments} />` below form

**B3. `frontend/src/app/(main)/matches/[id]/page.tsx`** — in the comments tab panel, replace:
```tsx
<CommentList comments={match.comments} />
```
with:
```tsx
<CommentSection
  matchId={match.id}
  initialComments={match.comments}
  isLoggedIn={!!session.getToken()}
/>
```

## Complexity Tracking

No Constitution violations. All additions follow established patterns.

| Decision | Justification |
|----------|---------------|
| In-memory rate limit | Single-server v1; SRS does not mandate persistence of rate-limit state |
| `ModerationService` as separate file | UC08 class diagram names it explicitly; keeps concerns separate from `CommentService` |
| POST route on `publicMatchesRoutes` | Match resource cohesion; avoids splitting the `/matches` surface across two mounts |
