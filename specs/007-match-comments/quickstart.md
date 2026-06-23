# Quickstart Validation Guide: Match Comments (UC08)

## Prerequisites

- PostgreSQL running, `DATABASE_URL` set in `backend/.env`
- Backend: `npm run dev` (port 4000)
- Frontend: `npm run dev` (port 5173)
- At least one match in the database (use seed or Admin UI to create one)
- A registered USER account and an ADMIN account

---

## Scenario 1 — Guest sees comments but cannot submit

1. Open a match detail page in an incognito browser: `http://localhost:5173/matches/<matchId>`
2. Click the **Bình luận** tab
3. **Expected**: Comment list is shown (or empty state "Chưa có bình luận")
4. **Expected**: No comment form is visible, or a "Đăng nhập để bình luận" prompt is shown instead

---

## Scenario 2 — User submits a valid comment

1. Log in as a regular USER
2. Navigate to a match detail page → **Bình luận** tab
3. Type a comment (e.g., "Trận hay quá!") in the form
4. Click **Gửi**
5. **Expected**: Comment appears immediately in the list with your display name and current timestamp (no page reload)
6. Verify via API: `GET /api/v1/matches/<matchId>` → `comments` array contains the new entry

---

## Scenario 3 — Validation rejects empty / too-long comments

1. Log in as a USER, navigate to a match → **Bình luận** tab
2. Submit with empty textarea
   - **Expected**: Error "Bình luận không được để trống"
3. Submit with 1001 characters
   - **Expected**: Error "Bình luận không được vượt quá 1000 ký tự"

---

## Scenario 4 — Rate limiting (5/min, 10s interval)

1. Log in as a USER
2. Submit 5 valid comments in rapid succession (within 60 seconds)
3. Submit a 6th immediately
   - **Expected**: HTTP 429, error message about rate limit
4. Submit the next within 10 seconds of any comment
   - **Expected**: HTTP 429, "Vui lòng chờ trước khi bình luận tiếp"

---

## Scenario 5 — Admin moderates (hide) a comment

1. Log in as ADMIN
2. Use the Admin panel or call:
   ```
   PATCH /api/v1/admin/comments/<commentId>/status
   Body: { "status": "HIDDEN" }
   ```
3. Open the match detail page (logged out or as USER)
4. **Expected**: The hidden comment no longer appears in the **Bình luận** tab

---

## Scenario 6 — Comment on non-existent match returns 404

```bash
curl -X POST http://localhost:4000/api/v1/matches/00000000-0000-0000-0000-000000000000/comments \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"content": "test"}'
```
**Expected**: `404 Not Found` with message "Không tìm thấy trận đấu"

---

## Build verification

After implementation, run in each package directory:

```bash
cd backend  && npm run build && npm run lint
cd frontend && npm run build && npm run lint
```

Both must pass with zero errors before the feature is reported complete.
