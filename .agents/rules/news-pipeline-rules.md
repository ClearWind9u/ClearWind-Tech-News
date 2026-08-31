# Quy chuẩn Xử lý Dữ liệu & News Pipeline (Harness Pattern)

## 1. Cơ chế Thu thập & Lọc trùng lặp (Deduplication)
- Mỗi bài viết được định danh duy nhất bằng `id` (hash SHA-256 từ canonical URL hoặc GUID của RSS item).
- Trước khi gửi bài viết mới sang Gemini Pro, pipeline **phải** kiểm tra xem `id` hoặc `url` đã tồn tại trong `data/news.json` hay chưa. Tuyệt đối không gọi Gemini tóm tắt lại các bài đã có.

## 2. Tiêu chuẩn Song ngữ (Bilingual Standard)
- Nguồn tin tiếng Việt: Giữ nguyên văn phong Việt chuẩn thuật ngữ IT (ví dụ: "trí tuệ nhân tạo", "hạ tầng đám mây", "lỗ hổng bảo mật", "kho lưu trữ mã nguồn"). Gemini Pro xuất thêm bản dịch tiêu đề và tóm tắt sang tiếng Anh.
- Nguồn tin quốc tế (English): Gemini Pro tóm tắt và dịch tiêu đề sang tiếng Việt mượt mà, đồng thời giữ bản tóm tắt tiếng Anh gốc.

## 3. Quản lý Gemini Pro API & Resilience
- **Exponential Backoff**: Khi gặp lỗi `429 Too Many Requests` (Rate limit), script phải đợi `2^retry * 1000ms` trước khi thử lại (tối đa 3 lần).
- **Batch Processing**: Xử lý tin theo lô (batch size 3-5 bài), có độ trễ 1-2 giây giữa các batch để tránh vượt quota.
- **Graceful Fallback**: Nếu `GEMINI_API_KEY` không tồn tại hoặc API gặp sự cố, pipeline kích hoạt chế độ Fallback: trích xuất tóm tắt ngắn từ RSS `contentSnippet` hoặc `description` để không làm gián đoạn hệ thống.

## 4. Zod Schema Validation
Tất cả dữ liệu xử lý xong từ Gemini Pro phải vượt qua kiểm tra Zod Schema trước khi ghi vào `data/news.json`. Bất kỳ item nào không hợp lệ sẽ bị log warning và bỏ qua an toàn.
