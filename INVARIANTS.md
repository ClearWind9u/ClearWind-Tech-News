# ClearWind Tech News - Project Invariants (Bộ Quy Tắc Bất Biến)

Tài liệu này lưu trữ các yêu cầu kiến trúc và tính năng mang tính **BẤT BIẾN (Immutable Invariants)**. 
Mọi tác vụ lập trình (cả Frontend, Backend, Data Pipeline và UI/UX) **BẮT BUỘC** phải tuân thủ nghiêm ngặt bảng quy chuẩn này, ngay cả khi người dùng không nhắc lại trong prompt.

Tài liệu được quản lý tự động bởi skill **`project-invariants-keeper`** và sẽ được cập nhật linh hoạt khi người dùng có yêu cầu thay đổi hoặc gỡ bỏ.

---

## Danh Sách Các Quy Tắc Bất Biến (Active Invariants)

### 1. Giao Diện & Theme (UI/UX Invariants)
- **Dark / Light Mode**:
  - Hỗ trợ đầy đủ cả 2 chế độ Dark mode và Light mode thông qua `useBilingual().isDark` và class `.dark` ở thẻ `html`.
  - Mặc định là Dark mode OLED cao cấp (`bg-slate-50 dark:bg-[#090A0F]`, `border-slate-200 dark:border-white/10`).
  - Mọi component mới phải luôn có đủ class cho cả light và dark (`text-slate-900 dark:text-slate-100`), không được phép hardcode màu chết.
- **Thư Viện Icon Thống Nhất (Strict Lucide Icons)**:
  - 100% icon sử dụng thư viện **`lucide-react`**.
  - **CẤM TUYỆT ĐỐI** chèn emoji thô (`🇻🇳`, `🌐`, `🔥`, `⚡`, `✨`, `👁️`, `🔖`...) vào JSX để làm icon.
- **Không Trùng Lặp Tìm Kiếm (Single Search Capsule)**:
  - Duy nhất một thanh tìm kiếm Spotlight (`⌘K` / `Ctrl+K`) trên Navbar.
  - Thanh Command Bar dưới Feed chỉ tập trung vào bộ lọc (Nguồn tin, Thời gian, Bộ lọc chuyên sâu). Không tạo thêm ô search thứ hai dưới Feed.
- **Không Hiển Thị Điểm Số `pts` & Thời Gian Cũ**:
  - Toàn bộ badge `pts` đã được loại bỏ trên mọi card và modal để giữ phong cách tối giản Linear.
  - Footer không hiển thị chuỗi thời gian cập nhật.

---

### 2. Dữ Liệu & Song Ngữ (Data & Language Invariants)
- **Song Ngữ Toàn Diện (100% Bilingual VI & EN)**:
  - Mọi chuỗi văn bản tĩnh trên giao diện phải lấy từ `t.<key>` trong `BilingualContext.tsx`. Không được hardcode tiếng Việt hoặc tiếng Anh cứng trong JSX.
  - Bài viết quốc tế khi ở chế độ VI bắt buộc phải có tiêu đề và tóm tắt dịch chuẩn thuật ngữ IT chuyên ngành (`title_vi`, `summary_vi`), không pha tạp tiếng Anh thô.
- **Chuẩn Tóm Tắt 3 Điểm Vàng (3 Takeaways)**:
  - `summary_vi` và `summary_en` luôn là mảng đúng 3 chuỗi kỹ thuật có giá trị thực tiễn cho lập trình viên. Không viết 1 câu sơ sài.
- **Kiểm Định Schema Bắt Buộc (Zod Validation)**:
  - Mọi bản ghi trước khi lưu vào `data/news.json` hoặc render UI phải qua `NewsItemSchema.safeParse()`.
  - Cấm lạm dụng toán tử `||` mơ hồ; ưu tiên dùng `??` (Nullish Coalescing) và các hàm trích xuất an toàn.

---

### 3. Vận Hành & Kiến Trúc (Architecture & Operations Invariants)
- **Zero Login Friction**:
  - Không bắt độc giả đăng nhập.
  - Toàn bộ bookmark, lịch sử đọc tin, tracking sở thích phục vụ AI Recommendation ("Dành cho bạn") đều lưu client-side tại `localStorage`.
- **Chi Phí Vận Hành 0đ (100% Free Tier)**:
  - Hệ thống chạy hoàn toàn trên Vercel SSG, Cloudflare và GitHub Actions Cron.
  - Dữ liệu lưu trong Git (`data/news.json`, `data/archive/*.json`, `data/search-index.json`).
  - Không sử dụng database có phí hoặc VPS riêng.
- **Rà Soát Link Tự Động Hàng Ngày (Daily Dead Link Auditor)**:
  - Workflow GitHub Actions chạy lúc 03:00 sáng hàng ngày (`scripts/audit_dead_links.ts`) để phát hiện và gỡ bỏ các bài báo 404/410/deleted bằng HTTP HEAD siêu nhẹ.
  - Chốt an toàn (Circuit Breaker): Không bao giờ xóa nếu tỷ lệ link lỗi >20% để bảo vệ DB.
- **Chiến Lược Nhánh Git (Git Flow)**:
  - Nhánh làm việc và coding hàng ngày là **`develop`**.
  - Nhánh **`main`** là production, chỉ nhận merge tự động định kỳ từ `develop`.

---

## Quy Trình Thay Đổi Invariants
Khi người dùng yêu cầu thay đổi (ví dụ: đổi theme, đổi cấu trúc tóm tắt, hoặc bỏ bớt tính năng):
1. Cập nhật trực tiếp vào tài liệu `INVARIANTS.md` này.
2. Đồng bộ tóm tắt vào `AGENTS.md`.
3. Thông báo rõ ràng cho người dùng về việc cập nhật Invariants thành công.
