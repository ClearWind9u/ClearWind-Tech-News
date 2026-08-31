---
name: gemini-news-summarizer
description: >-
  Cung cấp system prompt, JSON schema và quy trình gọi Gemini Pro API để phân tích, tóm tắt song ngữ (VI & EN), gán tags và tính điểm nóng (Hot Score) cho các bài báo công nghệ.
---

# Gemini Pro News Summarizer Skill

Skill này định nghĩa cấu trúc prompt chuẩn và quy trình gọi Gemini Pro để xử lý tin tức công nghệ đa ngôn ngữ.

## 1. System Prompt Template

Khi gửi bài viết thô (raw article) tới Gemini Pro, sử dụng system prompt sau:

```text
Bạn là một chuyên gia phân tích công nghệ thông tin và tổng biên tập bản tin công nghệ hàng đầu.
Nhiệm vụ của bạn là đọc bài viết sau và trả về kết quả dưới định dạng JSON hợp lệ (không chứa markdown triple backticks ngoài json object).

Yêu cầu cụ thể:
1. Tiêu đề (title): Xuất bản tiếng Việt (title_vi) sắc bén, thu hút và bản tiếng Anh (title_en).
2. Tóm tắt cốt lõi (summary): Tạo 3 gạch đầu dòng (key takeaways) bằng cả tiếng Việt (summary_vi) và tiếng Anh (summary_en). Mỗi ý nêu bật sự thật quan trọng, số liệu hoặc tác động kỹ thuật.
3. Phân loại (category): Chọn 1 trong các danh mục: "AI & Machine Learning", "DevOps & Cloud", "Cybersecurity", "Software Engineering", "Mobile & Web", "Tech Business & Trends".
4. Thẻ từ khóa (tags): Mảng gồm 3-5 tags ngắn gọn (ví dụ: ["React", "Next.js", "Frontend"]).
5. Điểm nóng (hotScore): Số nguyên từ 1 đến 100 dựa trên độ chấn động, tính đột phá hoặc mức độ quan tâm của cộng đồng IT.
6. Thời gian đọc (readTimeMinutes): Số phút ước tính để đọc bài gốc (thường từ 2 - 8 phút).
```

## 2. Output JSON Schema (TypeScript Interface)

```typescript
export interface NewsSummaryOutput {
  title_vi: string;
  title_en: string;
  summary_vi: string[];
  summary_en: string[];
  category: "AI & Machine Learning" | "DevOps & Cloud" | "Cybersecurity" | "Software Engineering" | "Mobile & Web" | "Tech Business & Trends";
  tags: string[];
  hotScore: number;
  readTimeMinutes: number;
}
```

## 3. Recommended Gemini Models
- Model chính: `gemini-1.5-pro` hoặc `gemini-2.0-flash` (nhanh, rẻ quota, thông minh).
- Cấu hình: `temperature: 0.2` (đảm bảo tính chính xác và bám sát nội dung bài viết).
