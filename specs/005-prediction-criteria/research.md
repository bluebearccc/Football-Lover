# Research: Prediction Criteria Management

## Existing Implementation Audit

### Decision: Extend existing `criteria` module rather than rewrite
**Rationale**: The module at `backend/src/modules/criteria/` already implements create, update, delete, deactivate, and list operations with proper layered architecture (controller → service → repository) and Zod validation. Only targeted gaps need to be filled.
**Alternatives considered**: Full rewrite — rejected because ~80% of the code is correct and spec-aligned.

### Gap Analysis

| Feature (from spec) | Current State | Action Needed |
|---------------------|---------------|---------------|
| Create criterion (FR-001) | Implemented | None |
| Edit criterion (FR-003) | Implemented | None |
| Status-only edit lock (FR-002, FR-004) | Implemented (`assertEditable` checks SCHEDULED) | None — already correct |
| Deactivate (FR-005) | Implemented BUT no match-status check | Add `assertEditable` guard to `deactivate()` |
| Reactivate (FR-005 clarification) | Not implemented | Add `reactivate` endpoint + handler |
| Set result_team (FR-006, FR-007) | In `matches` module (setCriterionResult) | Keep there — result-setting is match-lifecycle scoped |
| Track source (FR-008) | Supported via `source` field + DTO | None |
| Display active only (FR-009) | Public repo uses `isActive: true` filter | None |
| Creation-order sorting (clarification) | Current: `orderBy: { name: 'asc' }` | Change to `createdAt: 'asc'`; requires new field |
| Admin RBAC (FR-010) | Routes mounted under `adminRoutes` with `authenticate + requireRole('ADMIN')` | None |
| Scraped criteria (FR-011) | `source` enum exists; sync module exists | Out of scope for this feature (sync is FR-13) |
| Binary HOME/AWAY (FR-012) | Schema enforces via `TeamSide` enum | None |

## Schema Gap: `createdAt` on PredictionCriterion

### Decision: Add `createdAt DateTime @default(now())` to PredictionCriterion
**Rationale**: The clarified spec requires creation-order display. Without `createdAt`, the only ordering options are `name` (alphabetical) or `id` (UUID v4, not chronological). Adding `createdAt` is the standard Prisma pattern used by all other models in the schema.
**Alternatives considered**:
- Use UUID ordering — rejected because UUIDv4 is random, not sequential.
- Use a `displayOrder` integer — rejected per clarification (Admin chose creation order, no custom ordering).
- Use auto-increment id — rejected because project uses UUID PKs consistently.

## Deactivation Lock Enforcement

### Decision: Apply same `assertEditable` guard to deactivate/reactivate as for create/update
**Rationale**: Per FR-004 clarification, all criteria mutations (including deactivation) are gated by match status = SCHEDULED. The existing `deactivate()` in service.ts skips this check — it needs to be added. The existing `remove()` already checks via `assertEditable`.
**Alternatives considered**: Allow deactivation anytime — rejected per acceptance scenario US3-AS2.

## setCriterionResult Location

### Decision: Keep setCriterionResult in `matches` module
**Rationale**: Setting result_team happens as part of the match-finishing flow (UC06), not criteria management (UC07). The endpoint is already at `PUT /api/v1/admin/matches/criteria/:criterionId/result` and works correctly. Moving it to the criteria module would break the existing frontend admin API client.
**Alternatives considered**: Move to criteria module — rejected because it would fragment the match-finishing workflow.

## Frontend Gaps

### Decision: Add reactivate button and inline edit to admin match detail page
**Rationale**: The admin match detail page (`frontend/src/app/admin/matches/[id]/page.tsx`) already has criteria CRUD UI. Missing features:
1. **Reactivate button** for inactive criteria (when match is SCHEDULED)
2. **Inline edit** for criterion name/description (current UI only has a create form, not edit)

The user-facing `CriteriaList` component and public-matches API are already complete for read-only criteria display.
