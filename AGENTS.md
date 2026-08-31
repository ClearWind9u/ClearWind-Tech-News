# ClearWind Tech News - Development Guidelines & Architecture

Chào mừng bạn đến với dự án **ClearWind Tech News (Báo Công nghệ & IT Tự động)**!

## 1. Mục tiêu cốt lõi của dự án
- **Hoàn toàn tự động 24/7**: Tự động lấy tin RSS, dùng **Gemini Pro** để tóm tắt & phân tích, cập nhật website không cần can thiệp thủ công.
- **Chi phí vận hành 0đ (Free Tier 100%)**: Deploy trên Vercel / Cloudflare Pages, tự động hóa bằng GitHub Actions Cron.
- **Tasteful Design**: Giao diện hiện đại (phong cách Linear / Daily.dev), Dark mode cao cấp, micro-interactions, responsive mobile/desktop.
- **Song ngữ (Bilingual)**: Hỗ trợ tiếng Việt 🇻🇳 và tiếng Anh 🇺🇸 (ưu tiên 70% nguồn tin IT Việt Nam).
- **Zero Login Friction**: Độc giả không cần đăng nhập, hỗ trợ Bookmark bài viết bằng `localStorage`.

## 2. Quy chuẩn kỹ thuật (Tech Stack)
- **Frontend Framework**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Lucide React icons.
- **Data Engine**: Node.js / TypeScript crawler, `rss-parser`, Zod schema validation, `@google/genai` (Gemini Pro).
- **Data Storage**: `data/news.json` (Git-as-Database) - an toàn, bảo mật, version-controlled.
- **Automation**: GitHub Actions workflow cron (`.github/workflows/update_news.yml`).

## 3. Quy định xử lý dữ liệu và AI
- Luôn kiểm tra tính hợp lệ của dữ liệu đầu ra từ Gemini bằng Zod schema.
- Luôn có cơ chế Fallback (nếu API key chưa cấu hình hoặc bị rate-limit, hệ thống vẫn hoạt động ổn định).
- Tránh trùng lặp tin tức (Deduplication) dựa trên URL hash hoặc GUID.
- Format thời gian theo chuẩn ISO và hiển thị theo giờ Việt Nam (UTC+7 / GMT+7).
