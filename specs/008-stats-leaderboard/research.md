# Research: Statistics & Leaderboard (008)

## R1 — Existing Leaderboard Module Assessment

**Decision**: Extend the existing `backend/src/modules/leaderboard/` module rather than creating a new `statistics` module alongside it.

**Rationale**: A leaderboard module already exists with the layered pattern (controller → service → repository → dto → routes), mounted at `/api/v1/leaderboard`. It handles monthly win-count ranking with timezone-aware SQL. The current implementation is missing: win streak, accuracy, pagination offset, and the tiebreaker by accuracy. Extending it avoids duplicate routing and keeps UC09 cohesive.

**Alternatives considered**:
- Create a separate `statistics` module: rejected because leaderboard and stats are part of the same UC09 and share data sources (MatchParticipation, Prediction).
- Merge into `public-matches` module: rejected because leaderboard is a standalone page, not match-scoped.

## R2 — Win Streak Calculation Strategy

**Decision**: Compute win streak at query time via a SQL window function (ordered by match finish time descending, breaking on the first non-win).

**Rationale**: Win streak is all-time and changes only when matches are scored (infrequent). Computing at query time avoids a denormalized column that needs careful invalidation (match cancellation voids wins, re-scoring changes results). The dataset is small (~100 users, ~50 matches) so the query is fast.

**Alternatives considered**:
- Store `currentWinStreak` on User model: rejected because cancellation/rescoring invalidation is error-prone; adds schema change overhead for a derived value.
- Cache in Redis: premature for current scale (~100 users).

## R3 — Accuracy Calculation Strategy

**Decision**: Compute accuracy as a ratio of `is_correct=true` predictions to total scored predictions (where `is_correct IS NOT NULL`) per user, at query time in the leaderboard SQL.

**Rationale**: Accuracy = `COUNT(is_correct = true) / COUNT(is_correct IS NOT NULL)`. This leverages existing Prediction data without denormalization. Only scored predictions (finished matches) count — unscored predictions are excluded.

**Alternatives considered**:
- Store accuracy on User: same invalidation issues as win streak.
- Compute in application layer after fetching raw data: pushes aggregation to Node.js unnecessarily when SQL handles it efficiently.

## R4 — Prediction Statistics Visibility (BR21/BR22 Alignment)

**Decision**: The backend already returns statistics in the match detail response. Add a server-side filter: if match status is `SCHEDULED`, return empty statistics array. Frontend `StatsPanel` already handles empty state.

**Rationale**: Filtering at the server prevents data leakage regardless of client behavior. The existing `public-matches.service.ts` `getDetail()` already includes statistics — adding a conditional filter there is minimal change.

**Alternatives considered**:
- Filter only on frontend: rejected because determined clients could read the API response directly.
- Separate statistics endpoint: unnecessary — stats are already part of match detail.

## R5 — Leaderboard Pagination Strategy

**Decision**: Use offset-based pagination (page + pageSize) consistent with existing patterns (match list uses the same approach). Default pageSize=20, max=100.

**Rationale**: The existing `leaderboardQuerySchema` already has a `limit` parameter. Extending it with `page` and renaming `limit` to `pageSize` aligns with the `public-matches` pagination pattern. Offset-based is simpler than cursor-based and sufficient for the expected data volume.

**Alternatives considered**:
- Cursor-based pagination: overkill for ~100 users; adds complexity without benefit at current scale.

## R6 — Frontend Leaderboard Page Location

**Decision**: Create `frontend/src/app/(main)/leaderboard/page.tsx` with components in `frontend/src/components/leaderboard/`.

**Rationale**: Follows the existing pattern where `(main)` group holds authenticated/public pages (matches, etc.). The sidebar nav already has a "Leaderboard" link in the Stitch mockup. API client goes in `frontend/src/api/leaderboard.ts`.

**Alternatives considered**:
- Put under `(main)/stats/`: rejected because the mockup and UC09 use "Leaderboard" as the primary page name.

## R7 — Tailwind Config: Missing Tokens

**Decision**: The mockup uses podium gradient colors (gold `#FFD700`, silver `#C0C0C0`, bronze `#CD7F32`) and a `glass-card` pattern. These should be added as tokens rather than hardcoded.

**Rationale**: Constitution Principle IV requires adding missing tokens to `tailwind.config.ts` instead of hardcoding. The podium gradients and glass-card backdrop are specific to the leaderboard mockup.

**Alternatives considered**:
- Hardcode in component CSS: violates Principle IV.
