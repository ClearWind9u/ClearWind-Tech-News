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

## 3. Quy định xử lý dữ liệu và AI (Data Integrity & Clean Logic)
- **Cấm lạm dụng toán tử `||` mơ hồ**: Tuyệt đối không viết chuỗi `a || b ? c : d`. Ưu tiên dùng Nullish Coalescing (`??`) và tách thành các hàm Extractor độc lập (`parsePublishedDate`, `cleanHtml`, `extractSafeThumbnail`).
- **Phòng chống ảo giác (Zero Hallucination)**: Mọi URL, thời gian và tác giả phải được trích xuất từ RSS/API chính thức của tòa soạn báo.
- **Dịch thuật IT chuyên sâu**: Toàn bộ tin quốc tế khi ở chế độ Tiếng Việt (`VI`) phải được dịch chuẩn xác theo thuật ngữ IT chuyên ngành (`title_vi` và `summary_vi`), không pha tạp tiếng Anh thô.
- **Đồng bộ Bookmarks**: Badge số lượng đã lưu trên Navbar và danh sách trong Drawer phải luôn được đồng bộ và dọn dẹp các ID cũ (Stale IDs) thời gian thực.
- **Kiểm tra Schema bắt buộc**: Mọi bản ghi dữ liệu trước khi lưu vào `data/news.json` hoặc đưa lên State/UI đều phải vượt qua Zod schema `NewsItemSchema.safeParse()`.
- **Tránh trùng lặp tin tức (Deduplication)**: Dựa trên SHA-256 hash của URL bài viết gốc.
- **Format thời gian**: Theo chuẩn ISO và hiển thị theo giờ Việt Nam (UTC+7 / GMT+7).
