# Data Integrity, Clean Logic & Safe Parsing Guidelines

Tài liệu quy định bắt buộc cho toàn bộ dự án **ClearWind Tech News**:

## 1. Kiểm soát Toán tử và Kiểu Dữ liệu
- **Cấm lạm dụng toán tử `||`**: Không viết các chuỗi `a || b ? c : d` dài và mơ hồ.
- **Ưu tiên Nullish Coalescing (`??`)**: Khi cần fallback cho `null` hoặc `undefined`.
- **Sử dụng Extractor Functions**: Mỗi loại dữ liệu (Ngày tháng, Tiêu đề, Thumbnail, Nội dung) phải có hàm trích xuất riêng biệt có type guards (`typeof x === 'string'`, `!isNaN(Date.parse(x))`).

## 2. Phòng Chống Ảo Giác & Sai Lệch Thông Tin (Zero Hallucination)
- Mọi bài viết phải có link gốc thực tế trích xuất từ RSS/API chính thức của tòa soạn báo.
- Tiêu đề Tiếng Việt (`title_vi`) cho các bài viết quốc tế phải được dịch chuẩn xác theo thuật ngữ IT chuyên ngành, không để lẫn lộn tiếng Anh vào chế độ tiếng Việt.
- Tóm tắt 3 điểm cốt lõi phải trung thực với nội dung bài báo, giải thích rõ: Bản chất sự kiện $\rightarrow$ Kiến trúc kỹ thuật $\rightarrow$ Tác động thực tiễn.

## 3. Đồng Bộ Trạng Thái Lưu Trữ (Git & LocalStorage State Sync)
- Quản lý Bookmark và Read Status phải có cơ chế đồng bộ và dọn dẹp ID cũ (Stale IDs) để số lượng hiển thị trên Badge và Drawer luôn khớp nhau 100%.
- Kiểm tra tính hợp lệ của dữ liệu trước khi ghi vào `data/news.json` bằng Zod Schema `NewsItemSchema.safeParse()`.
