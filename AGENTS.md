# ClearWind Tech News — Agent Guidelines & Invariants

Hệ thống quy chuẩn kỹ thuật và kiến trúc cốt lõi của dự án **ClearWind Tech News**. Mọi AI Agent tham gia phát triển bắt buộc tuân thủ 100%.

## 1. Tech Stack & Infrastructure (0đ Free Tier)
- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Lucide React icons (`lucide-react`).
- **Data Engine**: Node.js / TypeScript (`tsx`), `rss-parser`, Zod schema, `@google/generative-ai` (Gemini Pro).
- **Storage Layer**: `data/news.json` (Git-as-Database) + MongoDB Atlas fallback (`lib/mongodb.ts`).
- **Hosting & CI/CD**: Vercel SSG/ISR, GitHub Actions Cron (`update_news.yml`, `daily_link_audit.yml`, `weekly_merge_develop_to_main.yml`).

## 2. Immutable Invariants (Quy Chuẩn Bất Biến)
*Chi tiết tại `INVARIANTS.md` và skill `project-invariants-keeper`*:
1. **Dark / Light Mode**: 100% component hỗ trợ 2 theme qua class `.dark`, không hardcode màu chết (`bg-slate-50 dark:bg-[#090A0F]`).
2. **Song ngữ VI / EN**: Mọi text tĩnh lấy từ `t.<key>` trong `BilingualContext.tsx`. Tin quốc tế ở chế độ VI phải dịch chuẩn thuật ngữ IT (`title_vi`, `summary_vi`), không lọt tiếng Anh thô.
3. **Thư viện Icon Lucide**: 100% dùng `lucide-react`. **CẤM TUYỆT ĐỐI** chèn raw emoji (`🇻🇳`, `🌐`, `🔥`, `⚡`, `✨`...) vào JSX làm icon.
4. **Spotlight Search Duy Nhất**: Chỉ dùng thanh tìm kiếm `⌘K` trên Navbar. Không tạo thêm ô search trùng lặp dưới Feed.
5. **Zero Login Friction**: Độc giả không cần đăng nhập. Bookmark, lịch sử, tracking sở thích lưu client-side tại `localStorage`.
6. **Không hiển thị `pts`**: Điểm nóng (`hotScore`) hiển thị trực quan không kèm hậu tố `pts`.
7. **Rà soát Link Hàng Ngày**: Job 03:00 sáng tự động gỡ bỏ link 404/deleted với Circuit Breaker 20%.

## 3. Data Integrity & Code Quality
- **Cấm lạm dụng toán tử `||`**: Ưu tiên Nullish Coalescing (`??`) và tách thành các extractor functions độc lập (`parsePublishedDate`, `cleanHtml`).
- **Zero Hallucination**: URL, thời gian và tác giả phải lấy trực tiếp từ RSS/API chính thức của tòa soạn báo.
- **Tóm tắt 3 điểm cốt lõi**: `summary_vi` và `summary_en` luôn là mảng đúng 3 điểm kỹ thuật có chiều sâu (Bối cảnh $\rightarrow$ Kiến trúc/Giải pháp $\rightarrow$ Giá trị thực tiễn).
- **Zod Schema Validation**: Mọi dữ liệu phải qua `NewsItemSchema.safeParse()` trước khi lưu hoặc render.
- **Deduplication**: Định danh bài viết bằng SHA-256 hash của URL gốc.

## 4. Git Branching & Release Flow
- **`develop` (Active Development)**: Nhánh làm việc chính thức cho mọi tính năng và coding hàng ngày. Toàn bộ code phát triển đều commit và push trực tiếp trên `develop`.
- **`feature/<name>`**: Rẽ nhánh từ `develop`, tạo PR merge vào `develop`, xóa nhánh sau khi merge.
- **`main` (Production)**: Nhánh production thực tế, tự động nhận merge từ `develop` định kỳ hàng tuần qua `.github/workflows/weekly_merge_develop_to_main.yml`.
