---
name: gemini-news-summarizer
description: >-
  Cung cấp system prompt v2 (Strict Bilingual Mode), JSON schema và quy trình gọi Gemini Pro API để phân tích, tóm tắt song ngữ (VI & EN), kiểm duyệt liên quan IT (isITRelated), gán tags và tính điểm nóng (Hot Score) cho các bài báo công nghệ. Bao gồm 3-lớp guard kiểm tra chất lượng song ngữ sau khi parse.
---

# Gemini Pro News Summarizer Skill (v2 — Strict Bilingual Mode)

Skill này định nghĩa cấu trúc prompt chuẩn, post-parse validation guards và quy trình gọi Gemini Pro để xử lý tin tức công nghệ đa ngôn ngữ, đảm bảo song ngữ hoàn chỉnh VI/EN không bị lẫn.

---

## 1. System Prompt Template (Strict Bilingual v2)

Khi gửi bài viết thô tới Gemini Pro, sử dụng system prompt sau:

```text
Bạn là chuyên gia phân tích công nghệ cao cấp và kỹ sư trưởng (Principal Engineer).
Nhiệm vụ: Phân tích bài viết dưới đây và trả về DUY NHẤT một JSON Object hợp lệ (không markdown, không giải thích thêm).

Nguồn tin: {Việt Nam | Quốc tế} (bài gốc tiếng Việt | bài gốc tiếng Anh)
Tiêu đề gốc: {title}
Nội dung bài viết: {fullText}

QUY TẮC ĐÁNH GIÁ CHUYÊN NGÀNH IT (NGHIÊM NGẶT):
1. Đánh giá xem bài viết có liên quan đến IT, Lập trình, AI, Cloud/DevOps, An ninh mạng, Bán dẫn, Mobile/Web hay không.
   - Nếu KHÔNG liên quan → trả về: {"isITRelated": false}

2. Nếu CÓ liên quan IT ("isITRelated": true):

TRƯỜNG title_vi (BẮT BUỘC — TIẾNG VIỆT 100%):
- Nguồn Quốc tế: PHẢI dịch sang tiếng Việt tự nhiên, thuần Việt hoàn toàn.
- Nguồn Việt Nam: giữ nguyên hoặc chỉnh sửa nếu cần.
- CẤM: title_vi === title_en. Nếu bằng nhau → BẮT BUỘC dịch lại.
- Tên riêng (Meta, Google, Kubernetes, React) CÓ THỂ giữ nguyên, phần mô tả PHẢI tiếng Việt.

TRƯỜNG title_en (BẮT BUỘC — TIẾNG ANH 100%):
- Nguồn Việt Nam: PHẢI dịch sang tiếng Anh phong cách The Verge / TechCrunch.
- Nguồn Quốc tế: giữ nguyên tiêu đề gốc.
- CẤM: title_en chứa bất kỳ ký tự có dấu tiếng Việt (ă, â, đ, ê, ô, ơ, ư...).

TRƯỜNG summary_vi (BẮT BUỘC — TIẾNG VIỆT THUẦN TÚY):
- Mảng ĐÚNG 3 chuỗi, mỗi chuỗi 25–45 từ tiếng Việt.
- PHẢI chứa ký tự tiếng Việt có dấu (ă, â, đ...). Câu toàn tiếng Anh = VI PHẠM.
- Ý 1: Bối cảnh và sự kiện cốt lõi thực sự được nhắc đến trong bài.
- Ý 2: Chi tiết kỹ thuật, giải pháp, số liệu hoặc cơ chế hoạt động.
- Ý 3: Giá trị thực tiễn, tác động tới ngành IT/lập trình viên.
- CẤM: câu rập khuôn như "Điểm nhấn công nghệ đặc biệt bao gồm...", "Top trending discussion with X points...", "Phân tích bối cảnh và sự kiện...".

TRƯỜNG summary_en (BẮT BUỘC — TIẾNG ANH THUẦN TÚY):
- Mảng ĐÚNG 3 chuỗi tiếng Anh, mỗi chuỗi 25–45 từ.
- CẤM: chứa bất kỳ ký tự có dấu tiếng Việt. Vi phạm = NGHIÊM TRỌNG.
- Nội dung kỹ thuật tương đương chiều sâu với summary_vi.

TRƯỜNG category: CHÍNH XÁC 1 trong 6: "AI & Machine Learning", "Software Engineering", "DevOps & Cloud", "Cybersecurity", "Mobile & Web", "Tech Trends & Startups".
TRƯỜNG tags: 3–5 tags chuẩn ngành.
TRƯỜNG hotScore: Số nguyên 75–99.
TRƯỜNG readTimeMinutes: Số nguyên 3–8.
```

---

## 2. Output JSON Schema (TypeScript Interface)

```typescript
export interface NewsSummaryOutput {
  isITRelated: boolean;
  title_vi?: string;       // Tiếng Việt 100%, KHÔNG bằng title_en với tin quốc tế
  title_en?: string;       // Tiếng Anh 100%, KHÔNG chứa dấu tiếng Việt
  summary_vi?: string[];   // Đúng 3 phần tử, PHẢI có dấu tiếng Việt
  summary_en?: string[];   // Đúng 3 phần tử, KHÔNG có dấu tiếng Việt
  category?: "AI & Machine Learning" | "DevOps & Cloud" | "Cybersecurity" | "Software Engineering" | "Mobile & Web" | "Tech Trends & Startups";
  tags?: string[];
  hotScore?: number;
  readTimeMinutes?: number;
}
```

---

## 3. Post-Parse Bilingual Validation Guards (4 lớp bắt buộc)

Sau khi parse JSON từ Gemini hoặc crawler, **BẮT BUỘC** chạy qua `ensureStrictBilingualQuality` theo 4 guard nghiêm ngặt:

```typescript
// Guard 1: title_vi PHẢI có dấu tiếng Việt và khác title_en (với tin quốc tế)
const titleViHasVi = hasVietnameseDiacritics(candidate.title_vi);
const titleViSameAsEn = candidate.title_vi.trim().toLowerCase() === candidate.title_en.trim().toLowerCase();
if (!titleViHasVi || (!isVietnamSource && titleViSameAsEn)) {
  candidate.title_vi = await translateTitleToVietnameseAsync(candidate.title_en || rawTitle);
}

// Guard 2: title_en KHÔNG được chứa dấu tiếng Việt
if (hasVietnameseDiacritics(candidate.title_en) || !candidate.title_en) {
  candidate.title_en = await translateTitleToEnglishAsync(candidate.title_vi || rawTitle);
}

// Guard 3: summary_vi PHẢI gồm đúng 3 câu, và MỌI CÂU đều phải có dấu tiếng Việt
const isSummaryViValid =
  Array.isArray(candidate.summary_vi) &&
  candidate.summary_vi.length === 3 &&
  candidate.summary_vi.every((s) => hasVietnameseDiacritics(s));

if (!isSummaryViValid) {
  candidate.summary_vi = await generateTechnicalTakeawaysAsync(
    candidate.title_vi, contextSnippet, candidate.category, 'vi'
  );
}

// Guard 4: summary_en PHẢI gồm đúng 3 câu, và MỌI CÂU KHÔNG ĐƯỢC có dấu tiếng Việt
const isSummaryEnValid =
  Array.isArray(candidate.summary_en) &&
  candidate.summary_en.length === 3 &&
  candidate.summary_en.every((s) => !hasVietnameseDiacritics(s));

if (!isSummaryEnValid) {
  candidate.summary_en = await generateTechnicalTakeawaysAsync(
    candidate.title_en, contextSnippet, candidate.category, 'en'
  );
}
```

---

## 4. Hacker News Context Strategy

HN stories thường thiếu body text trên Firebase API:
1. Luôn chủ động gọi `fetchFullArticleText(item.url)` để cào nội dung bài báo gốc từ trang đích.
2. Nếu trang đích không cào được hoặc bị chặn, tuyệt đối **KHÔNG** truyền chuỗi meta thô như `"Score: 282 points, 51 comments. Category: Tech discussion..."` vì AI sẽ dịch máy nguyên văn điểm số thay vì phân tích nội dung kỹ thuật.
3. Thay vào đó, tổng hợp context kỹ thuật chuẩn:
   ```typescript
   const hnContext = articleBody && articleBody.length >= 100
     ? articleBody
     : `Chủ đề thảo luận kỹ thuật phần mềm và công nghệ cao cấp: "${rawTitle}". Thảo luận kiến trúc hệ thống và mã nguồn mở trên Hacker News.`;
   ```

---

## 5. Recommended Gemini Models & Fallback Architecture

- **Chuỗi Model ưu tiên (Multi-Model Fallback Chain)**:
  1. `gemini-2.5-flash` / `gemini-2.5-flash-lite` (thế hệ mới, tốc độ cực nhanh, Free Tier).
  2. `gemini-2.0-flash` / `gemini-2.0-flash-lite` (độ trễ thấp, JSON chuẩn xác).
  3. `gemini-1.5-flash` / `gemini-1.5-flash-8b` (dự phòng ổn định, context window lớn).

  *(Không dùng preview thử nghiệm như gemini-3.8-flash — hay gặp lỗi 503 No capacity)*.

- **Intelligent IT Fallback Engine**: Tự động kích hoạt `generateTechnicalTakeawaysAsync()` với đa kênh dịch (Google Translate Mobile + Extension + MyMemory) nếu API lỗi.
- **Cấu hình generation**: `temperature: 0.2`, `responseMimeType: "application/json"`.
- **Full Context Extraction**: Nếu RSS description < 150 ký tự, tự động cào HTML bài gốc (`fetchFullArticleText`) trước khi gọi Gemini.

---

## 6. Zero-Tolerance Checklist (QA cuối pipeline)

- [ ] `title_vi` có dấu tiếng Việt hợp lệ 100% — bắt buộc với mọi bài gốc tiếng Anh
- [ ] `title_en` không chứa bất kỳ dấu tiếng Việt nào — kiểm tra bằng `hasVietnameseDiacritics()`
- [ ] `summary_vi` gồm 3 phần tử, `every()` phần tử đều có dấu tiếng Việt
- [ ] `summary_en` gồm 3 phần tử, `every()` phần tử đều là tiếng Anh thuần túy
- [ ] Mỗi phần tử đạt 20–45 từ, không chứa câu meta rập khuôn ("Hacker News top story...", "Score: X points...")

