# Tasks: Match Comments (UC08)

**Input**: Design documents from `specs/007-match-comments/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/api.md ✅

**Tests**: Not explicitly requested — no test tasks generated. Use `quickstart.md` scenarios for manual validation.

**Organization**: Tasks grouped by user story; each phase is independently testable.

**Pre-existing work** (already in codebase, no tasks needed):
- `Comment` model + `CommentStatus` enum in `backend/prisma/schema.prisma` — ✅ No migration needed
- Admin comment list + status-update module under `/api/v1/admin/comments` — ✅ Done
- `CommentList.tsx` display component — ✅ Done
- `MatchComment` type + `comments[]` field in `MatchDetail` — ✅ Done
- `GET /matches/:id` already returns `VISIBLE` comments ordered by `createdAt ASC` — ✅ Done
- Match detail page already has **Bình luận** tab wired to `CommentList` — ✅ Done (replace with CommentSection in Phase 3)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: User story this task belongs to (US1–US5)
- Paths: `backend/src/...` and `frontend/src/...`

---

## Phase 1: Setup

**Purpose**: No new packages or migrations required. Confirm baseline and locate integration points.

- [x] T001 Read `backend/src/modules/comments/comments.dto.ts`, `comments.service.ts`, `comments.repository.ts`, `comments.controller.ts`, `comments.routes.ts` and `backend/src/modules/public-matches/public-matches.routes.ts` to understand current state before modifying
- [x] T002 [P] Read `frontend/src/api/matches.ts`, `frontend/src/components/matches/CommentList.tsx`, and `frontend/src/app/(main)/matches/[id]/page.tsx` to understand the frontend integration points

**Checkpoint**: All source files reviewed — implementation can begin

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core additions that every user story depends on. Must complete before Phase 3+.

**⚠️ CRITICAL**: No user-story work can begin until this phase is complete.

- [x] T003 [P] Add `createCommentSchema` (Zod: trim, min 1, max 1000 chars) and `CreateCommentInput` type to `backend/src/modules/comments/comments.dto.ts`
- [x] T004 [P] Add `save(data: { matchId: string; userId: string; content: string })` method to `backend/src/modules/comments/comments.repository.ts` — use `prisma.comment.create` and include `user: { select: { id, displayName } }` in the return
- [x] T005 [P] Create `backend/src/modules/comments/moderation.service.ts` — export `BANNED_WORDS: Set<string>` (empty `new Set()` for v1.1.0), in-memory `Map<string, { count: number; window: number; lastAt: number }>` for rate tracking, `validateContent(content: string): void` (throws `ApiError.badRequest` if empty after trim / length > 1000 / matches banned word), and `checkRateLimit(userId: string): void` (throws 429 `ApiError` if ≥5 comments in 60s window or <10s since last comment)

**Checkpoint**: DTO schema, repository save, and moderation service are ready — user story implementation can now begin

---

## Phase 3: User Story 1 — Submit a Comment (Priority: P1) 🎯 MVP

**Goal**: A logged-in user can type and submit a comment on a match; it persists and appears in the comment list.

**Independent Test**: Log in, navigate to any match detail → Bình luận tab, submit a valid comment, confirm it appears immediately with your display name and timestamp.

### Implementation

- [x] T006 [US1] Add `create(userId: string, matchId: string, content: string)` method to `backend/src/modules/comments/comments.service.ts` — verify match exists (`prisma.match.findUnique` → throw `ApiError.notFound` if null), call `moderationService.validateContent(content)`, call `moderationService.checkRateLimit(userId)`, call `commentsRepository.save({ matchId, userId, content })`, return saved comment with user relation
- [x] T007 [US1] Add `create(req: Request, res: Response)` handler to `backend/src/modules/comments/comments.controller.ts` — extract `matchId` from `req.params.id`, `content` from `req.body` (post-validation), `userId` from `req.user.id`; call `commentsService.create`; return `res.status(201).json(comment)`
- [x] T008 [US1] Add `POST /:id/comments` route to `backend/src/modules/public-matches/public-matches.routes.ts` — apply `authenticate` middleware (401 if missing), `validateBody(createCommentSchema)`, `wrap(commentsController.create)`; import `createCommentSchema` from `comments.dto` and `commentsController` from `comments.controller`
- [x] T009 [P] [US1] Add `createComment(matchId: string, content: string): Promise<MatchComment>` to `frontend/src/api/matches.ts` — POST to `/matches/${matchId}/comments` with `Authorization: Bearer <token>` from `session.getToken()`; return the created `MatchComment` object
- [x] T010 [US1] Create `frontend/src/components/matches/CommentSection.tsx` as `'use client'` component with props `initialComments: MatchComment[]`, `matchId: string`, `isLoggedIn: boolean` — state: `comments` (starts as `initialComments`), `content` (string), `error` (string | null), `submitting` (boolean); logged-in path: render a `<textarea>` (max 1000 chars) + character counter + submit button + error display; on submit call `matchesApi.createComment` and on success append the returned comment to `comments` and clear `content`; guest path (`isLoggedIn === false`): render "Đăng nhập để bình luận" prompt (no form); render `<CommentList comments={comments} />` below the form/prompt
- [x] T011 [US1] Update comments tab in `frontend/src/app/(main)/matches/[id]/page.tsx` — replace `<CommentList comments={match.comments} />` with `<CommentSection matchId={match.id} initialComments={match.comments} isLoggedIn={!!session.getToken()} />`; add import for `CommentSection`; remove the now-unused `CommentList` import if no longer used elsewhere in the file

**Checkpoint**: A logged-in user can submit a valid comment and see it appear. `POST /api/v1/matches/:id/comments` returns 201 with comment data.

---

## Phase 4: User Story 2 — View Public Comments (Priority: P1)

**Goal**: Guests and logged-in users see the list of published comments under a match without logging in.

**Independent Test**: Open any match detail page in an incognito tab → Bình luận tab — the comment list (or empty state) is visible without logging in.

**Status**: Largely pre-existing. `GET /matches/:id` already returns `VISIBLE` comments. `CommentList.tsx` renders them. `CommentSection` from Phase 3 wraps `CommentList` and passes `initialComments`.

### Implementation

- [x] T012 [US2] Verify `CommentSection` renders `<CommentList>` for guest visitors (no form, no errors) — open the page without a token; confirm the list renders with correct card style matching `CommentList.tsx` existing styles (`bg-surface-container-low`, `rounded-lg`, `border-outline-variant/10`) and no JavaScript errors in console

**Checkpoint**: Guest can see comments — User Stories 1 and 2 are both independently functional.

---

## Phase 5: User Story 3 — Guest Blocked from Commenting (Priority: P2)

**Goal**: A guest attempting to comment is redirected to log in; no comment is persisted.

**Independent Test**: Without logging in, observe the Bình luận tab shows login prompt (not a form); attempt `POST /api/v1/matches/:id/comments` without a token and receive 401.

**Status**: `authenticate` middleware on the route (T008) handles the API layer. The `CommentSection` guest path (T010) handles the UI layer. Both were implemented in Phase 3.

### Implementation

- [x] T013 [US3] Verify guest API rejection — `curl -X POST http://localhost:4000/api/v1/matches/<id>/comments -H "Content-Type: application/json" -d '{"content":"test"}'` must return HTTP 401 with the project's standard unauthorized error body; confirm no comment row is inserted in the database
- [x] T014 [US3] Verify guest UI — open match detail without a token, navigate to Bình luận tab, confirm the `CommentSection` guest path renders a "Đăng nhập để bình luận" message and no textarea or submit button is present

**Checkpoint**: Guest enforcement confirmed at both API and UI layers.

---

## Phase 6: User Story 4 — Anti-Spam Rate Limiting (Priority: P2)

**Goal**: A single user cannot post more than 5 comments per minute or two comments within 10 seconds.

**Independent Test**: Submit 6 comments within 60 seconds as the same user — the 6th receives HTTP 429 with a clear rate-limit error message.

**Status**: `ModerationService.checkRateLimit()` was created in Phase 2 (T005) and is called in `commentsService.create` (T006). This phase verifies correct behavior end-to-end.

### Implementation

- [x] T015 [US4] Verify per-minute rate limit end-to-end — as a logged-in user, submit 5 valid comments quickly; on the 6th attempt within 60 seconds, confirm the API returns HTTP 429 and the frontend shows the rate-limit error message in `CommentSection`
- [x] T016 [US4] Verify 10-second minimum interval — submit a comment, then immediately submit another (within 10 seconds); confirm the second receives HTTP 429 with a "Vui lòng chờ" message and the error is displayed in the form

**Checkpoint**: Rate limiting is enforced — both thresholds tested.

---

## Phase 7: User Story 5 — Admin Moderates Comments (Priority: P3)

**Goal**: Admin can hide or delete any comment; hidden comments disappear from all public views.

**Independent Test**: As Admin, PATCH a comment status to HIDDEN; reload the match detail page and confirm the comment no longer appears.

**Status**: Fully pre-existing — `PATCH /api/v1/admin/comments/:id/status` is implemented. The `findDetailedPublic` query already filters to `status: VISIBLE` only.

### Implementation

- [x] T017 [US5] Verify admin hide flow — submit a comment as USER, note its ID; as ADMIN send `PATCH /api/v1/admin/comments/<id>/status` with `{ "status": "HIDDEN" }`; confirm 200 response; reload match detail page and confirm the comment is absent from the Bình luận tab
- [x] T018 [US5] Verify admin delete flow — repeat with `{ "status": "DELETED" }` and confirm comment is absent from the public view

**Checkpoint**: All 5 user stories are independently functional.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Quality gate, UX polish, and build verification.

- [x] T019 [P] Run `cd backend && npm run build` — resolve all TypeScript errors before proceeding
- [x] T020 [P] Run `cd backend && npm run lint` — resolve all linting warnings
- [x] T021 [P] Run `cd frontend && npm run build` — resolve all TypeScript and Next.js build errors
- [x] T022 [P] Run `cd frontend && npm run lint` — resolve all linting warnings
- [x] T023 UX polish in `CommentSection.tsx` — disable submit button while `submitting` is true to prevent double-submit; clear `error` when user starts typing; confirm character counter updates correctly at 1000 chars
- [x] T024 Run all 6 validation scenarios from `specs/007-match-comments/quickstart.md` and confirm each expected outcome is met

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS all user stories
- **Phase 3 (US1, P1)**: Depends on Phase 2 — primary build phase
- **Phase 4 (US2, P1)**: Depends on Phase 3 (T010 provides `CommentSection` list rendering)
- **Phase 5 (US3, P2)**: Depends on Phase 3 (T008 provides authenticate route, T010 provides guest path)
- **Phase 6 (US4, P2)**: Depends on Phase 2 (T005) and Phase 3 (T006)
- **Phase 7 (US5, P3)**: No implementation dependencies — pre-existing; can be verified any time after Phase 3
- **Phase 8 (Polish)**: Depends on all prior phases

### User Story Dependencies

- **US1 (P1)**: Requires Phase 2 complete — core build (T006–T011)
- **US2 (P1)**: Requires T010 complete — list display verification only (T012)
- **US3 (P2)**: Requires T008 + T010 complete — verification only (T013–T014)
- **US4 (P2)**: Requires T005 + T006 complete — verification only (T015–T016)
- **US5 (P3)**: Pre-existing — verification only (T017–T018), independent of US1–US4

### Within Each Phase

- Models before services — T003/T004/T005 (Foundational) before T006 (Service)
- Service before controller — T006 before T007
- Controller before route — T007 before T008
- API client (T009) can be built in parallel with T006–T008 (different file)
- Route (T008) and API client (T009) before CommentSection (T010)
- CommentSection (T010) before page wiring (T011)

### Parallel Opportunities

Within Phase 2, all three tasks (T003, T004, T005) touch different files and can run in parallel.

Within Phase 3, T009 (frontend API client) can run in parallel with T006–T008 (backend):
```
# Parallel within Phase 3:
Agent A: T006 → T007 → T008  (backend service → controller → route)
Agent B: T009 → T010 → T011  (frontend API client → component → page)
# Join: both must complete before Phase 4 verification
```

Within Phase 8, all four build/lint tasks (T019–T022) can run in parallel.

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 — highest value)

1. Complete Phase 1: Read source files
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: US1 submit flow (T006–T011)
4. Complete Phase 4: US2 view verification (T012)
5. **STOP and VALIDATE**: Both US1 and US2 work — comment submission and display are live
6. Run build + lint gates (T019–T022)

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 + US2 (Phase 3+4) → Test end-to-end → MVP!
3. Add US3 (Phase 5) → Verify guest enforcement
4. Add US4 (Phase 6) → Verify rate limiting
5. Verify US5 (Phase 7) → Admin moderation confirmed
6. Polish (Phase 8) → Build gates pass

---

## Notes

- `[P]` = parallelizable (different files, no shared dependencies)
- `[Story]` label maps task to its user story for traceability
- Phases 4–7 are primarily verification tasks — the implementation work is concentrated in Phases 2–3
- No new npm packages needed — all functionality uses existing Express, Prisma, Zod, and React/TailwindCSS
- The in-memory rate-limit store in `ModerationService` resets on server restart — this is intentional and acceptable for v1.1.0
- Commit after each phase checkpoint at minimum

---

## Phase 9: Convergence

- [x] T025 Move the `prisma.match.findUnique` call in `backend/src/modules/comments/comments.service.ts:28` into a new `findMatchById(id: string)` method on `backend/src/modules/comments/comments.repository.ts`; update `commentsService.create` to call `commentsRepository.findMatchById(matchId)` instead, and remove the direct `import { prisma }` line from `comments.service.ts` so the service no longer touches Prisma directly per Constitution II (contradicts)
- [x] T026 [P] Add numeric `retryAfter` seconds to both 429 throws in `backend/src/modules/comments/moderation.service.ts`: for the minimum-interval branch pass `{ retryAfter: Math.ceil((MIN_INTERVAL_MS - (Date.now() - entry.lastAt)) / 1000) }` as `ApiError` details; for the per-window branch pass `{ retryAfter: Math.ceil((WINDOW_MS - (Date.now() - entry.window)) / 1000) }` — satisfies US4/AC1 "retry-after hint" and aligns with `contracts/api.md` `retryAfter?: number` field (partial)
- [x] T027 [P] Fix stale comment count in `frontend/src/app/(main)/matches/[id]/page.tsx`: replace the static `{match.comments.length}` in the "Bình luận (…)" heading with a live count derived from the `CommentSection` state — either move the heading inside `CommentSection.tsx` so it can reference `comments.length`, or add an `onCountChange` callback prop from `CommentSection` to `page.tsx` per FR-010 (partial)
