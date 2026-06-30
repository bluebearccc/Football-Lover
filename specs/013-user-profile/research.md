# Research: User Profile and Prediction History

## Decision: Scope "total matches participated" to FINISHED matches only

- **Decision**: `profileRepository.getStats` will filter the `totalMatches` count (and, for
  consistency/defensiveness, the `totalWins` count and `totalGoldWon` sum) to
  `MatchParticipation` rows whose `match.status === 'FINISHED'`.
- **Rationale**: Resolved in `/speckit-clarify` (spec.md Clarifications, 2026-06-30). The SRS
  (FR-10) explicitly qualifies "total gold won" with "across finished matches"; the clarified
  spec extends the same scoping to "total matches participated" so the denominator used for
  win-rate framing is consistent with `totalWins`/accuracy, which are already implicitly
  finished-only (a match can only be "won" or scored once finished). The existing code counted
  ALL participations including `SCHEDULED`/`LIVE` ones, which would inflate "matches played"
  relative to "matches won," misleading users.
- **Alternatives considered**:
  - Leave as-is (count all matches regardless of status): rejected — contradicts the
    clarified spec and produces a stat that doesn't reconcile with the rest of the card.
  - Filter only `totalMatches`, leave `totalWins`/`totalGoldWon` unfiltered: rejected as
    unnecessary — those two are already effectively finished-only by construction
    (`isWinner`/`goldWon` are only populated once scoring runs at match finish), so adding an
    explicit `match.status: 'FINISHED'` filter is a no-op there but makes the invariant
    explicit and future-proof if scoring logic ever changes.

## Decision: Reuse `profileService` response shape for the Admin support view; no new contract

- **Decision**: The Admin frontend view will call the existing `/admin/users/:id/profile` and
  `/admin/users/:id/history` endpoints (already implemented in `users.controller.ts` →
  `profileService`), and render the response with the existing `ProfileStatsCard` /
  `MatchHistoryList` components, unmodified.
- **Rationale**: `uc-10-class-backend.puml` explicitly notes "Delegates to the same
  ProfileService — no separate data shape for Admin vs self-service." Backend work for Story 3
  is already complete; the only gap is the frontend route + API client methods to reach it.
  Reusing the same components keeps Admin and self-service visually and behaviorally
  consistent without inventing a new layout (Principle IV).
- **Alternatives considered**:
  - Build a separate Admin-specific profile component: rejected — duplicates UI for no
    behavioral difference (the view is read-only by omission of edit controls, not by a
    different data shape), and there is no Stitch mockup justifying a distinct visual design.

## Decision: No automated test framework exists for these modules — rely on build/lint gates

- **Decision**: Verification for this feature relies on `npm run build` (typecheck) and
  `npm run lint` in `backend/` and `frontend/` (Constitution Principle V), not a new test
  suite.
- **Rationale**: Repo-wide search found no `*.test.ts`/`*.spec.ts` files and no `test` script
  in either `backend/package.json` or `frontend/package.json` — there is no established
  testing pattern to extend for `profile`/`users` modules. Introducing a net-new test
  framework is out of scope for this surgical fix-and-extend feature and was not requested.
- **Alternatives considered**:
  - Introduce a test framework (e.g., Vitest/Jest) as part of this feature: rejected as
    scope creep — no existing convention, and the constitution's Quality Gates principle only
    mandates build+lint, not test coverage, for this repo today.
