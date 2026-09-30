# News Pipeline & Crawler Rules

1. **Lọc Trùng Lặp (Deduplication)**:
   - Mỗi bài viết định danh bằng SHA-256 hash của canonical URL.
   - Bắt buộc kiểm tra `id` trong database trước khi gửi sang Gemini Pro. Tuyệt đối không gọi AI tóm tắt lại các bài đã tồn tại.

2. **Khả Năng Chống Chịu (API Resilience)**:
   - **Exponential Backoff**: Khi gặp lỗi `429 Too Many Requests`, đợi `2^retry * 1000ms` trước khi thử lại (tối đa 3 lần).
   - **Batch Processing**: Xử lý bài viết theo lô 3-5 bài với độ trễ 1-2 giây giữa các lô.
   - **Graceful Fallback**: Nếu thiếu `GEMINI_API_KEY` hoặc API lỗi, tự động trích xuất tóm tắt ngắn từ RSS `contentSnippet` để không gián đoạn hệ thống.

3. **Schema Validation**:
   - Tất cả dữ liệu sau xử lý phải vượt qua `NewsItemSchema.safeParse()` trước khi lưu vào `data/news.json`.
