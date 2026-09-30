# Data Integrity & Clean Code Guidelines

1. **Toán tử & Kiểu dữ liệu**:
   - Cấm viết chuỗi `a || b ? c : d` dài và mơ hồ.
   - Dùng `??` (Nullish Coalescing) khi fallback cho `null` hoặc `undefined` để bảo vệ giá trị `0` và `""`.
   - Tách logic thành các hàm Extractor độc lập có type guards (`parsePublishedDate`, `cleanHtml`, `extractSafeThumbnail`).

2. **Phòng Chống Ảo Giác (Zero Hallucination)**:
   - URL, ngày giờ, tác giả và nguồn phải lấy trực tiếp từ RSS/API chính thức của tòa soạn báo.
   - Định danh bài viết bằng SHA-256 hash của canonical URL để chống trùng lặp.

3. **Kiểm Định Dữ Liệu Bắt Buộc**:
   - 100% bản ghi phải vượt qua Zod schema `NewsItemSchema.safeParse()` trước khi lưu vào `data/news.json` hoặc render UI.
   - Quản lý Bookmark và Read Status phải tự động dọn dẹp các ID cũ (Stale IDs) thời gian thực.
