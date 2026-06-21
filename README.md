# Football-Lover (GoalPredict Live)

[![Status](https://img.shields.io/badge/status-in%20development-yellow)](#)
[![Version](https://img.shields.io/badge/version-1.1.0-blue)](docs/Football-Lover/SRS_Football-Lover_v1.0.0.md)
[![Spec-Driven](https://img.shields.io/badge/spec--driven-Spec%20Kit-6E40C9?logo=github)](https://github.com/github/spec-kit)

[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

Webapp **dự đoán bóng đá** responsive cho người hâm mộ (giao diện tiếng Việt). Người dùng xem
dữ liệu/thống kê trận đấu và tham gia dự đoán đội thắng theo từng tiêu chí; mỗi trận có **pool
vàng** trả thưởng cho người thắng (không có ví vàng cố định), kèm **bảng xếp hạng số trận thắng
theo tháng**.

> Dự án theo quy trình **spec-driven**: tài liệu trong `docs/` (SRS, diagram, openapi, test
> plan) là **nguồn sự thật**, code phải bám theo. Xem [CLAUDE.md](CLAUDE.md) để biết quy ước
> code và [`.specify/memory/constitution.md`](.specify/memory/constitution.md) để biết các
> nguyên tắc bắt buộc của dự án.

## Tech stack

| Tầng | Công nghệ |
|------|-----------|
| Frontend | Next.js + TypeScript + TailwindCSS (`frontend/`) |
| Backend | Node.js + Express + TypeScript + Prisma (`backend/`) |
| Database | PostgreSQL — schema `backend/prisma/schema.prisma` |
| Tích hợp | api-football.com (sync trận/đội/cầu thủ), chatbot qua local CLI proxy, email provider (reset mật khẩu) |

## Tính năng (Use Cases v1.x)

| UC | Mô tả | UC | Mô tả |
|----|-------|----|-------|
| UC-01 | Đăng ký tài khoản | UC-09 | Thống kê & bảng xếp hạng |
| UC-02 | Đăng nhập / Đăng xuất | UC-10 | Hồ sơ & lịch sử dự đoán |
| UC-03 | Xem danh sách trận | UC-11 | Chatbot |
| UC-04 | Xem chi tiết trận | UC-12 | Upload ảnh đội / cầu thủ |
| UC-05 | Gửi / sửa dự đoán | UC-13 | Quản lý đội bóng |
| UC-06 | Quản lý trận đấu (Admin) | UC-14 | Thông báo thắng / thua |
| UC-07 | Quản lý tiêu chí dự đoán (Admin) | UC-15 | Đặt lại mật khẩu qua email |
| UC-08 | Bình luận trận đấu | | |

## Cấu trúc thư mục

```
.
├─ backend/        # Express + Prisma (API tại /api/v1/*) — chưa khởi tạo
├─ frontend/       # Next.js app — chưa khởi tạo
├─ docs/           # SPEC — nguồn sự thật (không sửa từ coding agent)
│  └─ Football-Lover/
│     ├─ SRS_Football-Lover_v1.0.0.md   # Yêu cầu + Acceptance Criteria theo UC
│     ├─ diagrams/                       # PlantUML: ERD, layered, class/sequence theo UC
│     ├─ api/                            # openapi.yaml (API contract)
│     ├─ test-plan/                      # Test cases theo UC
│     ├─ traceability/                   # RTM (FR → UC → component → API → DB → test)
│     └─ db/                             # Tài liệu schema
├─ .specify/       # Spec Kit: constitution, templates, scripts, workflow
├─ .claude/        # Skills /speckit-* cho Claude Code
└─ CLAUDE.md       # Hướng dẫn code cho agent
```

## Bắt đầu

> Lưu ý: `backend/` và `frontend/` chưa được scaffold. Khi đã có code, dùng các lệnh sau.

```bash
# Backend
cd backend
npm install
npm run prisma:migrate     # đồng bộ schema → PostgreSQL
npm run dev                # :4000
npm run build              # typecheck   |  npm run lint

# Frontend
cd frontend
npm install
npm run dev                # :5173
npm run build              # |  npm run lint
```

### Biến môi trường (dự kiến)

| Biến | Dùng cho |
|------|----------|
| `DATABASE_URL` | Kết nối PostgreSQL (Prisma) |
| `JWT_SECRET` | Ký token xác thực |
| `API_FOOTBALL_KEY` | api-football.com data sync |
| `EMAIL_*` | Email provider cho reset mật khẩu |

## Quy trình phát triển (spec-driven + Spec Kit)

Dự án đã tích hợp [Spec Kit](https://github.com/github/spec-kit). Dùng các slash command trong
Claude Code:

1. `/speckit-constitution` — nguyên tắc dự án (đã thiết lập, v1.1.0)
2. `/speckit-specify` — tạo spec cho feature
3. `/speckit-plan` — kế hoạch triển khai
4. `/speckit-tasks` — sinh danh sách task
5. `/speckit-implement` — thực thi
6. `/code-review` — review diff trước khi merge

Để implement một UC có sẵn trong SRS, dùng `/implement-uc <UC-id>` (đọc SRS + class diagram rồi
giao cho `backend-dev` / `frontend-dev`).

**Nguyên tắc bắt buộc** (xem constitution): không sửa file trong `docs/`; backend theo kiến trúc
phân tầng `controller → service → repository`; validate bằng Zod + ném `ApiError`; frontend gọi
API qua `src/api/*`; **UI bám mockup baseline trong `stitch_goalpredict_live_dashboard/`**
(layout/visual lấy từ `screen.png` + `code.html` + `elite_pitch/DESIGN.md`); chạy
`npm run build` + `npm run lint` trước khi báo xong.

## Tài liệu tham khảo

- [SRS — Yêu cầu & Acceptance Criteria](docs/Football-Lover/SRS_Football-Lover_v1.0.0.md)
- [Diagrams (PlantUML)](docs/Football-Lover/diagrams/)
- [Constitution dự án](.specify/memory/constitution.md)
- [Hướng dẫn code (CLAUDE.md)](CLAUDE.md)
