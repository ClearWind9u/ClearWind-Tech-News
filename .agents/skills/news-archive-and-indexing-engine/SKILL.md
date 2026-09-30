---
name: news-archive-and-indexing-engine
description: >-
  Quy chuẩn kiến trúc phân vùng dữ liệu theo tháng trong bộ nhớ (In-Memory Partitioning YYYY-MM), nén chỉ mục tìm kiếm và phân trang tối ưu cho báo công nghệ.
---

# News Archive & Indexing Engine Skill

Skill này quy định chuẩn mực kỹ thuật phân tầng và quản lý dữ liệu dài hạn, tối ưu hiệu năng SSR/ISR bằng cơ chế phân vùng bộ nhớ động (Dynamic In-Memory Partitioning) và trích xuất chỉ mục tìm kiếm siêu nhẹ trong `lib/db.ts`.

---

## 1. Kiến Trúc Phân Vùng Trong Bộ Nhớ (Zero Extra Files)

Thay vì tạo hàng chục file JSON phân mảnh làm phình repository, toàn bộ dữ liệu tin tức được hợp nhất an toàn trong `data/news.json` (Git-as-Database) và được xử lý phân vùng động qua `lib/db.ts`:

1. **Active Pool (`getNewsDatabase()`)**:
   - Truy vấn danh sách bài viết từ MongoDB Atlas hoặc đọc trực tiếp từ `data/news.json`.
   - Giữ dung lượng gọn gàng (~500 KB) để tải trang tức thì (<100ms) cho Homepage, RSS, OpenGraph metadata.
2. **Dynamic Month Partitioning (`getArchiveMonth(monthKey)`)**:
   - Lọc bài viết theo tháng phát hành (`YYYY-MM`) trực tiếp trong bộ nhớ khi độc giả yêu cầu (API route `/api/news?month=YYYY-MM`).
   - Không sinh thêm file rác trên đĩa, bảo vệ git history sạch sẽ.
3. **Archive Manifest (`getArchiveManifest()`)**:
   - Tự động thống kê số lượng bài viết của từng tháng từ danh sách bài hiện có, sinh ra danh sách `ArchiveMonthInfo[]` phục vụ dropdown chọn tháng.
4. **Lightweight Search Index (`buildSearchIndex()`)**:
   - Sinh chỉ mục nén chỉ gồm các trường tìm kiếm: `{ id, vi, en, cat, tags, t, h, o, r }`.
   - Giảm ~85% payload, cho phép tìm kiếm Spotlight (`⌘K`) tức thời trên client.

---

## 2. Chuẩn Dữ Liệu TypeScript (`types/news.ts`)

```typescript
export interface SearchIndexItem {
  id: string;
  vi: string;          // title_vi
  en: string;          // title_en
  cat: string;         // category
  tags: string[];      // tags
  t: string;           // publishedAt (ISO string)
  h: number;           // hotScore
  o: 'vietnam' | 'global'; // sourceOrigin
  r: number;           // readTimeMinutes
}

export interface ArchiveMonthInfo {
  key: string;       // '2026-09'
  label_vi: string;  // 'Tháng 09/2026'
  label_en: string;  // 'September 2026'
  count: number;
}
```

---

## 3. Phân Trang & Điều Hướng (Pagination Principles)
- Hỗ trợ số lượng bài/trang linh hoạt: 12 bài (mặc định) hoặc 24 bài.
- Hỗ trợ phím tắt điều hướng nhanh: `[` (Trang trước), `]` (Trang sau).
- Luôn giữ `CLS = 0` khi lật trang bằng cách cuộn mượt về đầu feed (`news-feed-container`) và hiển thị skeleton transitions qua `useTransition`.
