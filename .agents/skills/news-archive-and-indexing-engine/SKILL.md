---
name: news-archive-and-indexing-engine
description: >-
  Quy chuẩn kiến trúc lưu trữ dài hạn (Data Partitioning YYYY-MM), nén chỉ mục tìm kiếm siêu nhẹ (Search Index), và cơ chế phân trang tối ưu cho báo công nghệ.
---

# News Archive & Indexing Engine Skill

Skill này quy định chuẩn mực kỹ thuật để lưu trữ tin tức công nghệ dài hạn không giới hạn (Long-term Archive), tối ưu hiệu năng SSR/ISR bằng cách phân tầng dữ liệu (Data Tiering), và tạo chỉ mục tìm kiếm siêu nhẹ (`search-index.json`).

---

## 1. Triết Lý Phân Tầng Dữ Liệu (Data Tiering Strategy)

Để đảm bảo hiệu năng tối đa trên Vercel (0đ Free Tier) và Next.js SSG/ISR:

1. **Active Store (`data/news.json`)**:
   - Chứa tối đa 200 - 300 bài viết mới nhất.
   - Phục vụ tải trang tức thì (<100ms) cho Homepage, RSS, OpenGraph metadata.
   - Dung lượng luôn duy trì <= 500 KB.
2. **Monthly Partitioned Archive (`data/archive/YYYY-MM.json`)**:
   - Toàn bộ bài viết được phân mảnh theo tháng phát hành (ví dụ: `2026-09.json`, `2026-08.json`).
   - Bài viết mới từ crawler được lưu vĩnh viễn vào file tháng tương ứng dựa trên `publishedAt`.
   - Không bao giờ bị mất bài cũ, không bao giờ có 1 file JSON đơn lẻ vượt quá kích thước an toàn.
3. **Archive Manifest (`data/archive/index.json`)**:
   - Bản kê mục lục siêu nhẹ liệt kê:
     - Danh sách các tháng có sẵn: `['2026-09', '2026-08', ...]`.
     - Tổng số bài của từng tháng.
     - Thời điểm cập nhật cuối.
4. **Lightweight Search Index (`data/search-index.json`)**:
   - Chỉ mục nén chỉ chứa các trường phục vụ search & filter:
     `{ id, vi, en, cat, tags, t, h, o, r }` (Title VI, Title EN, Category, Tags, Timestamp, HotScore, Origin, ReadTime).
   - Dung lượng nhẹ hơn 85% so với file bài viết đầy đủ, cho phép tìm kiếm nhanh như chớp trên toàn bộ kho lưu trữ.

---

## 2. Quy Chuẩn Naming & Data Schema

### Search Index Record:
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
```

### Archive Manifest:
```typescript
export interface ArchiveManifest {
  lastUpdated: string;
  totalArticles: number;
  months: Array<{
    key: string;       // '2026-09'
    label_vi: string;  // 'Tháng 09/2026'
    label_en: string;  // 'September 2026'
    count: number;
  }>;
}
```

---

## 3. Quy Trình Cập Nhật Khi Crawler Chạy

Khi crawler hoàn thành một đợt lấy tin:
1. Ghi 200 bài mới nhất vào `data/news.json`.
2. Phân loại toàn bộ bài mới theo `publishedAt` (-> tháng `YYYY-MM`), nạp vào file `data/archive/YYYY-MM.json` tương ứng, deduplicate bằng `id` (hash URL).
3. Cập nhật `data/archive/index.json`.
4. Sinh lại hoặc cập nhật `data/search-index.json`.

---

## 4. Phân Trang & Điều Hướng (Pagination Principles)
- Hỗ trợ số lượng bài/trang linh hoạt: 12 bài (mặc định cho Grid) hoặc 24 bài (cho List/Compact).
- Hỗ trợ phím tắt điều hướng nhanh: `[` (Trang trước), `]` (Trang sau).
- Luôn giữ `CLS = 0` (Zero Cumulative Layout Shift) khi lật trang bằng cách cuộn mượt về đầu danh sách tin (`news-feed-container`).
