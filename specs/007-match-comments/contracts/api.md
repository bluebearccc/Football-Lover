# API Contract: Match Comments (UC08)

Base path: `/api/v1`

---

## New Endpoints

### POST `/matches/:matchId/comments`

Submit a comment under a match. Requires authentication.

**Auth**: Bearer JWT (registered user). Returns 401 if missing, 403 if role check fails (not applicable here — any USER role can comment).

**Path params**:
| Param     | Type   | Description          |
|-----------|--------|----------------------|
| matchId   | UUID   | Target match ID      |

**Request body** (`application/json`):
```jsonc
{
  "content": "Trận hay quá!"   // string, 1–1000 chars (after trim)
}
```

**Responses**:

| Status | Body                                      | When                                              |
|--------|-------------------------------------------|---------------------------------------------------|
| 201    | `CommentDto` (see shape below)            | Comment created and visible                       |
| 400    | `{ error: "..." }`                        | Empty, too long, banned word, or trim-empty       |
| 401    | `{ error: "Yêu cầu đăng nhập" }`         | No valid JWT (guest)                              |
| 404    | `{ error: "Không tìm thấy trận đấu" }`   | matchId not found                                 |
| 429    | `{ error: "...", retryAfter?: number }`   | Rate limited (≥5/min or <10s interval)            |

**201 response shape** (`CommentDto`):
```jsonc
{
  "id": "uuid",
  "matchId": "uuid",
  "user": { "id": "uuid", "displayName": "Nguyen Van A" },
  "content": "Trận hay quá!",
  "status": "VISIBLE",
  "createdAt": "2026-06-23T10:30:00.000Z"
}
```

---

## Existing Endpoints (unchanged, relevant to feature)

### GET `/matches/:id`

Returns match detail including `comments[]` (only `status = VISIBLE`, ordered by `createdAt ASC`).
Already implemented in `public-matches.service.ts` / `public-matches.repository.ts`.

No changes required.

---

### PATCH `/admin/comments/:id/status` *(admin only)*

Set a comment's status (VISIBLE / HIDDEN / DELETED). Already implemented in the admin comments module.

No changes required.

---

### GET `/admin/comments` *(admin only)*

List all comments with pagination + filter by `matchId` / `status`. Already implemented.

No changes required.

---

## Zod DTO (backend)

```ts
// to add to comments.dto.ts
export const createCommentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Bình luận không được để trống')
    .max(1000, 'Bình luận không được vượt quá 1000 ký tự'),
});
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
```

## Frontend API Client (new method on matchesApi)

```ts
// matches.ts – new function
createComment(matchId: string, content: string): Promise<MatchComment>
// POST /matches/:matchId/comments with Bearer token
// Returns MatchComment (id, user, content, createdAt)
```
