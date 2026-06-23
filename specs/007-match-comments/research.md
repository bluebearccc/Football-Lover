# Research: Match Comments (UC08)

## What Already Exists

The codebase has substantial prior art for this feature. Decisions below account for it.

---

### Decision 1 — Schema migration needed?

**Decision**: No migration required. The `Comment` model and `CommentStatus` enum are already in `backend/prisma/schema.prisma` (VISIBLE / HIDDEN / DELETED). The `Match` and `User` foreign keys are in place, indexes on `matchId` and `userId` exist.

**Rationale**: Schema was designed ahead of implementation. Only application-layer code is missing.

**Alternatives considered**: Adding a `rejectedAt` / `moderatedBy` audit column. Rejected — out of scope for v1.1.0; the SRS does not require it.

---

### Decision 2 — Where to add the user-submission endpoint?

**Decision**: Add `POST /matches/:matchId/comments` to `publicMatchesRoutes` (already mounted at `/api/v1/matches`). The route gets the `authenticate` middleware (requires login). This keeps the public/user-facing match surface cohesive.

**Rationale**: `GET /matches/:id` is already in `publicMatchesRoutes` and returns comments. Adding `POST` in the same router avoids fragmenting the match resource. The admin comment operations (list all, set status) remain under `/api/v1/admin/comments` — that separation is already correct.

**Alternatives considered**: Adding a standalone `/api/v1/comments` user-facing router. Rejected — would split the match comment resource across two mount points with no gain.

---

### Decision 3 — Rate-limit storage (in-memory vs. Redis)?

**Decision**: In-memory `Map<userId, { count: number; window: number; lastAt: number }>` inside `ModerationService`. A sliding-window counter resets after 60 seconds; `lastAt` enforces the 10-second minimum interval.

**Rationale**: The SRS targets 10–20 comments/match; total comment volume is low (≤ 500 comments/min system-wide at scale). Single-server Node.js for v1 — no Redis dependency needed. The in-memory store is lost on restart (acceptable; rate limits are transient guardrails).

**Alternatives considered**: `express-rate-limit` package at the middleware layer. Rejected — the SRS specifies dual constraints (per-minute count AND minimum interval between posts) which are cleaner to enforce together in the service than via two separate middleware passes.

---

### Decision 4 — Banned-word validation approach?

**Decision**: A module-level exported `BANNED_WORDS: Set<string>` in `ModerationService`, empty by default (v1.1.0 default per SRS). The set is checked via case-insensitive substring match.

**Rationale**: SRS §5.2 explicitly states "empty by default in v1.1.0." A `Set` is easy to swap for a DB/config-file source later without changing the public interface.

**Alternatives considered**: Environment variable `BANNED_WORDS=word1,word2`. Rejected — adds ops complexity for a feature that starts empty; the in-process default is sufficient.

---

### Decision 5 — Frontend submit flow (optimistic vs. reload)?

**Decision**: On successful POST, prepend the returned comment object to the local `comments` state in `CommentSection` (optimistic-style without actual optimism — wait for server response, then update). No full page reload required.

**Rationale**: The match detail page already loads comments as part of `MatchDetail`. After submission the new comment is returned by the API; we can append it to the local list without a second fetch. This keeps the UX snappy.

**Alternatives considered**: Full re-fetch of `GET /matches/:id` after submit. Rejected — returns full match detail payload for a single new comment; wasteful.

---

### Decision 6 — CommentSection vs. CommentList architecture?

**Decision**: Introduce a new `CommentSection` client component (wraps state management + form + list). The existing `CommentList` becomes a pure presentational sub-component used by `CommentSection`. The `CommentItem` from the class diagram maps to the div/card already in `CommentList`; extracting it as a named component is not required for v1 unless the implementation naturally warrants it.

**Rationale**: Class diagram specifies `CommentSection → CommentForm + CommentItem + CommentApiClient`. The `'use client'` boundary must be on `CommentSection` (needs state for form input and the comment list). The match detail page (Server Component) can render `CommentSection` and pass the initial comment list as a prop to hydrate immediately without a client-side fetch on mount.

**Alternatives considered**: Making the entire match detail page a client component. Rejected — would break SSR benefits for the rest of the page.
