---
name: data-integrity-guard
description: >-
  Quy chuẩn kỹ thuật bắt buộc nhằm đảm bảo tính toàn vẹn dữ liệu, chống ảo giác (Anti-Hallucination), loại bỏ việc lạm dụng toán tử OR (||) mơ hồ, và chuẩn hóa cơ chế trích xuất dữ liệu bằng Zod Schema và Nullish Coalescing (??).
---

# Data Integrity & Clean Logic Guard Skill

Skill này định nghĩa các nguyên tắc phát triển phần mềm chuẩn mực cho toàn bộ dự án **ClearWind Tech News**, nhằm bảo vệ mã nguồn không bị lỗi logic, chống sai lệch thông tin và đảm bảo code rõ ràng, có trách nhiệm.

---

## 1. Nguyên Tắc Cốt Lõi (Core Principles)

### ❌ KHÔNG LÀM:
1. **Tuyệt đối KHÔNG lạm dụng chuỗi toán tử `||` mơ hồ**:
   - `val1 || val2 || val3 ? a : b` gây khó hiểu, che giấu lỗi `0`, `""`, `false` và tạo ra bug cú pháp (syntax ambiguity).
2. **Tuyệt đối KHÔNG ghi đè (overwrite) mù quáng lên logic sẵn có**:
   - Trước khi sửa bất kỳ hàm nào, phải đọc hiểu toàn bộ phạm vi và hợp đồng kiểu dữ liệu (Type Contract) của hàm đó.
3. **Tuyệt đối KHÔNG tạo dữ liệu giả (Mock/Hallucination)**:
   - Mọi URL bài viết, thời gian, tên tác giả và tóm tắt phải được trích xuất trực tiếp từ RSS/API nguồn chính thống của tòa soạn báo.

###  PHẢI LÀM:
1. **Sử dụng các hàm trích xuất chuyên dụng (Dedicated Extractor Functions)**:
   - Tách biệt logic lấy `Date`, `Title`, `Content`, `Thumbnail` thành các hàm độc lập có kiểm tra kiểu dữ liệu tường minh.
2. **Sử dụng toán tử Nullish Coalescing (`??`)**:
   - Chỉ dùng `??` khi muốn cung cấp giá trị mặc định cho `null` hoặc `undefined`, tránh làm mất các giá trị hợp lệ như số `0` hoặc chuỗi rỗng có chủ đích.
3. **Kiểm tra hợp lệ bằng Zod Schema**:
   - Mọi bản ghi dữ liệu trước khi lưu vào `data/news.json` hoặc đưa lên State/UI đều phải vượt qua `NewsItemSchema.safeParse()`.

---

## 2. Chuẩn Mực Code Mẫu (Reference Implementations)

### 🔹 1. Xử lý thời gian an toàn (Safe Date Parsing)
```typescript
export function parsePublishedDate(isoDate?: string, pubDate?: string): string {
  if (isoDate && !isNaN(Date.parse(isoDate))) {
    return new Date(isoDate).toISOString();
  }
  if (pubDate && !isNaN(Date.parse(pubDate))) {
    return new Date(pubDate).toISOString();
  }
  return new Date().toISOString();
}
```

### 🔹 2. Xử lý chuỗi văn bản sạch (Safe Text Sanitization)
```typescript
export function extractCleanTitle(rawTitle: string | undefined, fallback: string): string {
  if (!rawTitle || typeof rawTitle !== 'string') return fallback;
  const decoded = decodeHtml(rawTitle);
  const cleaned = decoded.replace(/^\[(Quốc tế|Global|VN Tech)\]\s*/i, '').trim();
  return cleaned.length > 0 ? cleaned : fallback;
}
```

### 🔹 3. Đồng bộ Bookmarks và State
```typescript
// Luôn tính toán số lượng bookmark hợp lệ dựa trên ID thực tế tồn tại trong cơ sở dữ liệu
const validBookmarksCount = useMemo(() => {
  const availableSet = new Set(allArticles.map((a) => a.id));
  return bookmarks.filter((id) => availableSet.has(id)).length;
}, [allArticles, bookmarks]);
```
