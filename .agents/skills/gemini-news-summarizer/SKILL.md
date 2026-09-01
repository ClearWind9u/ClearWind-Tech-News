---
name: gemini-news-summarizer
description: >-
  Cung cấp system prompt, JSON schema và quy trình gọi Gemini Pro API để phân tích, tóm tắt song ngữ (VI & EN), kiểm duyệt liên quan IT (isITRelated), gán tags và tính điểm nóng (Hot Score) cho các bài báo công nghệ.
---

# Gemini Pro News Summarizer Skill

Skill này định nghĩa cấu trúc prompt chuẩn và quy trình gọi Gemini Pro để xử lý tin tức công nghệ đa ngôn ngữ, lọc tin ngoài ngành IT và ngăn chặn tóm tắt rập khuôn.

## 1. System Prompt Template

Khi gửi bài viết thô (raw article) tới Gemini Pro, sử dụng system prompt sau:

```text
Bạn là chuyên gia phân tích công nghệ cao cấp và kỹ sư trưởng (Principal Engineer).
Nhiệm vụ: Phân tích bài viết dưới đây và trả về DUY NHẤT một JSON Object hợp lệ (không markdown).

QUY TẮC ĐÁNH GIÁ CHUYÊN NGÀNH IT (NGHIÊM NGẶT):
1. Đánh giá xem bài viết có liên quan trực tiếp đến Công nghệ thông tin, Lập trình, Phần mềm, AI, Cloud/DevOps, An ninh mạng, Bán dẫn, Thiết bị di động/Web hay không.
   - Nếu KHÔNG liên quan (ví dụ: làm kệ gỗ, đồ gia dụng, thời trang, bóp da, túi xách, tủ lạnh cá nhân, showbiz, bất động sản...), trả về: {"isITRelated": false}.

2. Nếu CÓ liên quan IT ("isITRelated": true), hoàn thành các trường sau:
   - "title_vi": Tiêu đề dịch hoặc viết lại thuần Tiếng Việt 100% tự nhiên, chuẩn xác thuật ngữ IT.
   - "title_en": Tiêu đề thuần Tiếng Anh 100% tự nhiên, rõ ràng.
   - "summary_vi": Mảng đúng 3 chuỗi tiếng Việt CHI TIẾT VÀ BÁM SÁT SỰ THẬT BÀI VIẾT (mỗi ý 25-45 từ):
     * Ý 1: Bối cảnh, bản chất công nghệ hoặc sự kiện cốt lõi thực sự được nhắc đến.
     * Ý 2: Chi tiết kỹ thuật, giải pháp kiến trúc, số liệu hoặc cơ chế hoạt động thực tế.
     * Ý 3: Giá trị thực tiễn, tác động tới ngành IT/lập trình viên hoặc bài học ứng dụng.
     * TUYỆT ĐỐI KHÔNG dùng các câu mẫu chung chung rập khuôn như "Điểm nhấn công nghệ đặc biệt bao gồm kiến trúc giải pháp tối ưu...".
   - "summary_en": Mảng đúng 3 chuỗi tiếng Anh tương ứng với độ chi tiết kỹ thuật tương đương.
   - "category": Chọn CHÍNH XÁC 1 trong 6 danh mục chuẩn: "AI & Machine Learning", "Software Engineering", "DevOps & Cloud", "Cybersecurity", "Mobile & Web", "Tech Trends & Startups".
   - "tags": 3-5 tags ngắn gọn chuẩn ngành.
   - "hotScore": Điểm nóng số nguyên từ 75 đến 99.
   - "readTimeMinutes": Số phút đọc ước tính từ 3 đến 8.
```

## 2. Output JSON Schema (TypeScript Interface)

```typescript
export interface NewsSummaryOutput {
  isITRelated: boolean;
  title_vi?: string;
  title_en?: string;
  summary_vi?: string[];
  summary_en?: string[];
  category?: "AI & Machine Learning" | "DevOps & Cloud" | "Cybersecurity" | "Software Engineering" | "Mobile & Web" | "Tech Trends & Startups";
  tags?: string[];
  hotScore?: number;
  readTimeMinutes?: number;
}
```

## 3. Recommended Gemini Models & Fallback Architecture
- **Chuỗi Model ưu tiên (Multi-Model Fallback Chain)**:
  1. `gemini-3.5-flash` / `gemini-3.0-flash` (Model thế hệ mới nhất, tốc độ vượt trội, 100% Free Tier).
  2. `gemini-2.5-flash` (Thế hệ Flash 2.5 cực nhanh & thông minh).
  3. `gemini-2.0-flash` (Tối ưu hóa phản hồi JSON, độ trễ cực thấp).
  4. `gemini-1.5-flash` (Dự phòng tốc độ cao).
  5. `gemini-1.5-pro` (Dự phòng độ sâu lập luận).
- **Cấu hình generation**: `temperature: 0.2`, `responseMimeType: "application/json"`.
- **Full Context Extraction**: Nếu RSS description quá ngắn (< 150 ký tự), tự động cào trang HTML bài gốc để trích xuất thẻ `<p>` làm context giàu thông tin trước khi gọi Gemini API.
