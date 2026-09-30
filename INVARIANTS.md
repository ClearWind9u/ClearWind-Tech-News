# ClearWind Tech News - Project Invariants (Bộ Quy Tắc Bất Biến)

Tài liệu lưu trữ các yêu cầu kiến trúc và tính năng mang tính **BẤT BIẾN (Immutable Invariants)**. Mọi tác vụ lập trình (Frontend, Backend, Pipeline, UI/UX) **BẮT BUỘC** tuân thủ nghiêm ngặt bảng quy chuẩn này.

---

## Danh Sách Các Quy Tắc Bất Biến (Active Invariants)

### 1. Giao Diện & Thẩm Mỹ (UI/UX Invariants)
- **Dark / Light Mode**: 100% component hỗ trợ 2 theme qua class `.dark` (`bg-slate-50 dark:bg-[#090A0F]`, `border-slate-200 dark:border-white/10`). Cấm hardcode màu chết.
- **Thư Viện Icon Thống Nhất**: 100% icon sử dụng **`lucide-react`**. **CẤM TUYỆT ĐỐI** chèn emoji thô (`🇻🇳`, `🌐`, `🔥`, `⚡`, `✨`...) vào JSX làm icon.
- **Tìm Kiếm Duy Nhất (Single Search Capsule)**: Duy nhất một ô tìm kiếm Spotlight (`⌘K` / `Ctrl+K`) trên Navbar. Thanh lọc dưới Feed chỉ phục vụ filter, không tạo thêm ô search thứ hai.
- **Loại Bỏ Hậu Tố `pts`**: Điểm số (`hotScore`) hiển thị gọn gàng, không kèm chữ `pts` để duy trì phong cách tối giản Linear.

### 2. Dữ Liệu & Song Ngữ (Data & Language Invariants)
- **Song Ngữ Toàn Diện (100% Bilingual VI & EN)**: Mọi chuỗi văn bản tĩnh lấy từ `t.<key>` trong `BilingualContext.tsx`. Tin quốc tế ở chế độ VI phải dịch chuẩn thuật ngữ IT (`title_vi`, `summary_vi`), không pha tạp tiếng Anh thô.
- **Chuẩn Tóm Tắt 3 Điểm Vàng (3 Takeaways)**: `summary_vi` và `summary_en` luôn là mảng đúng 3 chuỗi kỹ thuật có chiều sâu (Bối cảnh $\rightarrow$ Công nghệ/Kiến trúc $\rightarrow$ Giá trị thực chiến). Mỗi ý dài 25-45 từ.
- **Kiểm Định Schema Bắt Buộc (Zod Validation)**: Mọi bản ghi dữ liệu trước khi lưu vào `data/news.json` hoặc render UI phải qua `NewsItemSchema.safeParse()`. Cấm lạm dụng toán tử `||` mơ hồ; ưu tiên dùng `??` (Nullish Coalescing) và các hàm trích xuất an toàn.

### 3. Vận Hành & Kiến Trúc (Architecture & Operations Invariants)
- **Zero Login Friction**: Độc giả không cần đăng nhập. Toàn bộ bookmark, lịch sử đọc tin, tracking sở thích ("Dành cho bạn") lưu client-side tại `localStorage`.
- **Chi Phí Vận Hành 0đ (100% Free Tier)**: Hệ thống chạy trên Vercel SSG/ISR, Cloudflare và GitHub Actions Cron. Dữ liệu lưu trong Git (`data/news.json`). Không sử dụng database có phí hay VPS riêng.
- **Rà Soát Link Tự Động Hàng Ngày**: Workflow GitHub Actions chạy lúc 03:00 sáng hàng ngày (`scripts/audit_dead_links.ts`) tự động gỡ bỏ link 404/deleted. Chốt an toàn (Circuit Breaker): Không xóa nếu tỷ lệ link lỗi >20%.
- **Chiến Lược Nhánh Git**: Nhánh làm việc và coding hàng ngày là **`develop`**. Nhánh **`main`** là production, tự động nhận merge định kỳ từ `develop` qua workflow `weekly_merge_develop_to_main.yml`.

---

## Quy Trình Thay Đổi Invariants
Khi người dùng yêu cầu thay đổi nền tảng:
1. Cập nhật trực tiếp vào tài liệu `INVARIANTS.md` này.
2. Đồng bộ tóm tắt vào `AGENTS.md`.
3. Thông báo rõ ràng cho người dùng về việc cập nhật Invariants thành công.
