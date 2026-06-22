<!-- SPECKIT START -->
Dự án theo quy trình spec-driven. Nguồn sự thật là tài liệu trong
`docs/Football-Lover/` (SRS, ER diagram, class diagram theo UC). Đọc spec liên quan
TRƯỚC khi code; không tự bịa thông tin ngoài spec.

**Active feature**: `004-match-viewing` — UC03 View Match List, UC04 View Match Details, prediction visibility (BR21/BR22).
Plan: `specs/004-match-viewing/plan.md` | Spec: `specs/004-match-viewing/spec.md`
<!-- SPECKIT END -->

# Football-Lover (GoalPredict Live) — Coding Guide

Webapp dự đoán bóng đá (tiếng Việt). Người dùng dự đoán đội thắng cho từng **tiêu chí**
của trận, tranh **gold theo từng trận** (không có ví tích lũy), và xếp hạng theo **số trận
thắng trong tháng**. Tài liệu trong `docs/Football-Lover/` là **nguồn sự thật** — code bám
theo spec.

## Stack

| Tầng | Công nghệ |
|------|-----------|
| Frontend | Next.js 14.2.x (App Router) + TypeScript + TailwindCSS (`frontend/`, port 5173) |
| Backend | Node.js + Express + TypeScript + Prisma 6.x (`backend/`, port 4000) |
| Database | PostgreSQL (schema: `backend/prisma/schema.prisma`) |
| Tích hợp | api-football.com (sync trận/đội/cầu thủ), chatbot qua local CLI proxy, email provider (reset mật khẩu) |

> **Pin version có chủ đích:** Prisma giữ **v6** (v7 bỏ `url = env()` trong schema, cần
> `prisma.config.ts`). Next giữ **14.2.x** (đã vá bảo mật ở 14.2.35). Đừng tự nâng major.

## Spec — đọc trước khi code (đầu vào bắt buộc)

| Cần gì | Đọc ở đâu |
|--------|-----------|
| Yêu cầu, Acceptance Criteria, Business Rules theo UC | `docs/Football-Lover/SRS_Football-Lover_v1.0.0.md` (nội dung đã là **v1.1.0**) |
| Tóm tắt yêu cầu | `docs/Football-Lover/requirements-summary.md` |
| Data model | `docs/Football-Lover/diagrams/entity-relationship.puml` → `backend/prisma/schema.prisma` |
| Class diagram BE/FE theo UC | `docs/Football-Lover/diagrams/uc-XX/uc-XX-class-{backend,frontend}.puml` |
| Sequence/State/Screenflow theo UC | `docs/Football-Lover/diagrams/uc-XX/uc-XX-{sequence,statediagram,screenflow}.puml` |
| **UI baseline (nguồn sự thật giao diện)** | `stitch_goalpredict_live_dashboard/<screen>/` — mockup `screen.png` + `code.html` từng màn; design system `stitch_goalpredict_live_dashboard/elite_pitch/DESIGN.md` |
| Kiến trúc tầng | `docs/Football-Lover/diagrams/layered-architecture.puml`, `system-overview.puml` |
| API contract | `docs/Football-Lover/api/openapi.yaml` *(thư mục đã có, file sẽ bổ sung sau)* |
| Test case | `docs/Football-Lover/test-plan/` *(sẽ bổ sung sau)* |

Danh sách UC: UC01–UC12 trong SRS; UC13 Manage Teams, UC14 Notifications, UC15 Password
Reset (diagram trong `diagrams/uc-13..15/`). Index: `docs/Football-Lover/index.md`.

## Convention code

**Backend** — layered theo `layered-architecture.puml`, mỗi domain là 1 module trong
`backend/src/modules/<name>/` gồm: `*.controller.ts → *.service.ts → *.repository.ts`,
`*.routes.ts`, `*.dto.ts` (Zod). **Mẫu hiện có:** `modules/health/` (controller→service→routes).
Các UC module thật (`auth`, `matches`, `predictions`, `teams`, `notifications`, …) chưa
implement — thêm qua `/implement-uc`.
- Controller chỉ điều phối req/res; logic ở Service; truy cập DB qua Repository (Prisma `src/lib/prisma.ts`).
- Lỗi: ném `ApiError` (`src/utils/ApiError.ts`); validate bằng Zod + `validateBody` (`src/middleware/validate.ts`).
- Auth/RBAC: middleware `authenticate` + `requireRole('ADMIN')` (`src/middleware/auth.ts`).
- Route mount tại `/api/v1/*` (xem `src/routes/index.ts`).

**Frontend** — component bám class diagram FE (vd `RegisterPage → RegisterForm →
AuthApiClient`, `ValidationMessage`). Gọi API qua `src/api/*` (không fetch trực tiếp trong
component; đã có `src/api/client.ts` + `src/api/auth.ts`). App Router ở `src/app/`.
Theme màu = palette **Elite Pitch** trong `tailwind.config.ts` (pitch=xanh sân, gold=phần
thưởng, ink=nền tối). **Giao diện phải bám mockup trong `stitch_goalpredict_live_dashboard/`**
(xem mục "UI baseline" bên dưới).

## UI baseline — Stitch mockups (nguồn sự thật giao diện)

Mọi màn hình mới/sửa **phải** lấy baseline từ thư mục `stitch_goalpredict_live_dashboard/`.
Trước khi code UI của 1 UC, đọc `screen.png` (bố cục, hierarchy) **và** `code.html`
(spacing, component, class Tailwind, state) của màn tương ứng, cộng với
`elite_pitch/DESIGN.md` (design tokens: màu, typography, radius, spacing, elevation). Class
diagram FE quyết định **cấu trúc component & data flow**; mockup Stitch quyết định **layout &
visual** — hai cái phải khớp nhau, không tự bịa layout ngoài mockup.

| Màn (UC liên quan) | Folder mockup |
|--------------------|---------------|
| Đăng nhập (UC02) | `stitch_goalpredict_live_dashboard/login/` |
| Đăng ký (UC01) | `stitch_goalpredict_live_dashboard/register/` |
| Quên/Reset mật khẩu (UC15) | `stitch_goalpredict_live_dashboard/forgot_password/` |
| Dashboard | `stitch_goalpredict_live_dashboard/dashboard/` |
| Danh sách trận live | `stitch_goalpredict_live_dashboard/live_matches/` |
| Chi tiết trận + dự đoán | `stitch_goalpredict_live_dashboard/match_details/` |
| Bảng xếp hạng | `stitch_goalpredict_live_dashboard/leaderboard/` |
| Hồ sơ người dùng | `stitch_goalpredict_live_dashboard/user_profile/` |
| Admin — quản lý trận (UC13) | `stitch_goalpredict_live_dashboard/admin_match_management/` |
| Admin — tiêu chí & điểm | `stitch_goalpredict_live_dashboard/admin_point_rules_criteria/` |
| Admin — quản lý user | `stitch_goalpredict_live_dashboard/admin_user_management/` |

- Mockup Stitch là **HTML/Tailwind tĩnh** → port sang Next.js + component theo class diagram;
  giữ nguyên bố cục/spacing/visual, thay data tĩnh bằng data từ `src/api/*`.
- Token màu/typography của `tailwind.config.ts` phải đồng bộ với `elite_pitch/DESIGN.md`. Nếu
  mockup dùng giá trị chưa có trong config → **thêm token vào `tailwind.config.ts`**, không
  hardcode hex/px rời rạc trong component.
- Khác biệt giữa mockup và spec (SRS/class diagram) → ưu tiên spec cho **hành vi/field**, giữ
  mockup cho **visual**; nếu mâu thuẫn thật sự thì nêu ra, không tự quyết.
- **Không sửa** file trong `stitch_goalpredict_live_dashboard/` — đó là baseline tham chiếu.

## Rule bắt buộc khi code (theo stack)

**TypeScript (cả 2 bên)**
- `strict` đang bật — không dùng `any` (dùng `unknown` + thu hẹp kiểu). Hàm export ghi rõ kiểu trả về.
- Import kiểu bằng `import type {...}`. Dùng alias `@/*` thay vì path tương đối dài.
- Không để `console.log` rải rác trong code thật; chỉ log có chủ đích ở tầng phù hợp, không log secret.

**Backend — Express + Prisma + Zod**
- Giữ đúng lớp: `controller → service → repository`. Controller **không** chứa business logic, **không** gọi Prisma trực tiếp. Repository là nơi duy nhất chạm Prisma.
- Chỉ dùng Prisma singleton `src/lib/prisma.ts` — **không** `new PrismaClient()` ở nơi khác.
- Mọi input phải validate bằng Zod ở biên controller (`validateBody`/`validateQuery`); schema đặt trong `*.dto.ts`.
- Lỗi mong đợi → ném `ApiError`; **không** trả lỗi thô / stack ra client. Async handler phải `.catch(next)` (xem `health.routes.ts`).
- Enum/role → import từ `@prisma/client` (`Role`, `MatchStatus`, `TeamSide`…), **không** hardcode chuỗi.
- **Gold/tiền tệ dùng Prisma `Decimal`, tuyệt đối không dùng `number`** (sai số dấu phẩy động). Chia pool làm tròn **2 chữ số thập phân** đúng lúc payout.
- Thao tác nhiều bảng (scoring/chia gold, hủy trận) bọc trong `prisma.$transaction`. Scoring phải **idempotent** (1 lần/trận — guard khi cào lại data).
- Leaderboard theo **tháng dương lịch, timezone Asia/Ho_Chi_Minh**: lưu UTC, tính mốc tháng theo TZ. Chỉ tính trận có ≥ 2 participant (BR29).
- Bảo mật: mật khẩu hash bằng **bcrypt** (không lưu/log plaintext). JWT secret lấy từ env. Login trả message trung lập (không lộ field nào sai). Password policy ≥ 8 ký tự gồm chữ + số (validate ở Zod). Reset token chỉ lưu **hash**, dùng-một-lần, có hạn.
- RBAC: route admin phải gắn `authenticate` + `requireRole('ADMIN')`.
- Không hard-delete `Match`/`Team` còn dữ liệu liên quan → đổi `status`/`is_active` (BR23, UC13).

**Frontend — Next.js 14 App Router + Tailwind**
- Mặc định **Server Component**; chỉ thêm `'use client'` khi cần state/effect/event handler.
- Lấy dữ liệu qua `src/api/*` (client đã có) — **không** `fetch()` trực tiếp trong component. Component bám class diagram FE.
- Chỉ `NEXT_PUBLIC_*` mới được lộ ra client; **không** đặt secret/API key ở frontend.
- **Baseline UI bắt buộc:** layout/visual mỗi màn bám mockup tương ứng trong `stitch_goalpredict_live_dashboard/` (đọc `screen.png` + `code.html` trước khi code). Không tự sáng tác bố cục ngoài mockup.
- Dùng token màu **Elite Pitch** (`pitch`/`gold`/`ink`) trong `tailwind.config.ts` (đồng bộ `elite_pitch/DESIGN.md`), tránh hex tùy tiện. Gold hiển thị **2 số thập phân**.
- UI tiếng Việt; ngày giờ format Việt Nam, timezone Asia/Ho_Chi_Minh.
- Responsive (breakpoints 480/768/1024/1440), touch target ≥ 44×44px, có `alt` cho ảnh đội/cầu thủ (thiếu ảnh → ảnh mặc định), điều hướng bàn phím cho form/nút (WCAG 2.1 AA cơ bản).

**Prisma / DB**
- `schema.prisma` suy ra từ ER diagram — sửa data model phải đồng bộ cả 2. Migration qua `prisma migrate dev` và **đặt tên có nghĩa**.
- Cột `snake_case` qua `@map`, field code `camelCase` (đã theo schema). Giữ index theo NFR (`match_time`, `status`, `user_id`, `match_id`, `criterion_id`).

**Tích hợp**
- api-football key, URL/secret CLI proxy chatbot, SMTP credentials → **server-side only**.
- Sync ngoài: map theo `external_id`; khi xung đột, **ưu tiên dữ liệu Admin** hoặc cần Admin xác nhận (FR-13).
- Chatbot read-only, chỉ cho user đã đăng nhập, message ≤ 500 ký tự (BR24/BR25).

## Setup & lệnh

```bash
# Backend
cd backend
cp .env.example .env                # chỉnh DATABASE_URL trỏ PostgreSQL thật
npm install                         # postinstall tự chạy prisma generate
npm run prisma:migrate              # tạo/đồng bộ migration → PostgreSQL
npm run dev                         # :4000  → GET /api/v1/health
# npm run build (tsc typecheck) | npm run lint

# Frontend
cd frontend
cp .env.local.example .env.local    # NEXT_PUBLIC_API_URL
npm install
npm run dev                         # :5173
# npm run build | npm run lint
```

## Quy tắc làm việc

- Khi implement 1 UC: **dùng `/implement-uc <UC-id>`** — nó đọc SRS + class diagram rồi giao
  cho `backend-dev` / `frontend-dev`.
- Module mới phải đủ các file theo mẫu (`controller/service/repository/routes/dto`); không
  gộp logic vào controller.
- Sau khi sửa: chạy `npm run build` (typecheck) + `npm run lint` ở folder liên quan trước khi báo xong.
- **Không tự ý sửa `docs/`** — đó là spec. Chỉ cập nhật khi stakeholder yêu cầu rõ ràng, và
  cập nhật đồng bộ SRS + diagram + (nếu ảnh hưởng) `schema.prisma`.
