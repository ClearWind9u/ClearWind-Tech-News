# Working Memory (Task On Progress)

Tài liệu lưu trữ trạng thái thực thi hiện tại, checkpoint bàn giao session và các bước tiếp theo.

---

## 1. Trạng Thái Hiện Tại
- **Nhánh làm việc**: `feature/archive-and-search-optimization`
- **Nhiệm vụ vừa hoàn thành**:
  1. [Xong] Gỡ bỏ dòng thời gian cập nhật ở Footer và toàn bộ badge điểm `pts` trên các card/modal (giao diện tối giản, sạch mắt theo Linear style).
  2. [Xong] Xây dựng User Interest Tracking Engine (`lib/user_interest_tracker.ts`) và thuật toán gợi ý tin cá nhân hóa ("Dành cho bạn" / "Có thể bạn quan tâm") tính điểm theo vector chuyên mục (45%) + tags (35%) + độ mới (20%), zero login friction qua `localStorage`.
  3. [Xong] Tạo skill `.agents/skills/user-interest-recommendation-engine/SKILL.md`.
  4. [Xong] Tối ưu SEO & Performance: `next.config.mjs` (tắt cache disk dev triệt tiêu lỗi ENOENT trên Windows + Security Headers), `app/robots.ts`, `app/sitemap.ts`, `app/manifest.ts`, JSON-LD Schema trong `app/layout.tsx`.
  5. [Xong] Tích hợp Skill mới `.agents/skills/grounded-innovative-architect/SKILL.md`: Chuẩn mực nghiên cứu thực chứng 2-3 nguồn kỹ thuật uy tín, phân tích ma trận Pros/Cons, cấm bịa ý tưởng vô căn cứ, cấm sao chép rập khuôn những thứ đại trà, tổng hợp giải pháp độc bản tối ưu nhất.
  6. [Xong] Tối ưu toàn diện hệ thống Search, Sort & Filter (Command Filter Dock): Loại bỏ thanh 2 tầng thô cứng, Active Filter Chips Bar và Faceted Filter Popover OLED.
  7. [Xong] Hợp nhất tìm kiếm và chuẩn hóa icon: Loại bỏ ô tìm kiếm trùng lặp dưới Feed, giữ thanh Quick Search Spotlight `⌘K` duy nhất trên Navbar; loại bỏ hoàn toàn các emoji thô trong JSX và thống nhất 100% bằng bộ icon SVG chuẩn `lucide-react`.
  8. [Xong] Tích hợp Daily Dead Link Auditor & Pruning Pipeline: Script `scripts/audit_dead_links.ts` (HTTP HEAD, concurrency pool, chốt ngắt an toàn 20%) và GitHub Actions workflow `.github/workflows/daily_link_audit.yml` tự động rà soát link cũ lúc 03:00 sáng hàng ngày.
  9. [Xong] Tích hợp Skill `project-invariants-keeper` & tài liệu `INVARIANTS.md`: Lưu trữ các yêu cầu bất biến (Dark/Light mode, Song ngữ VI/EN, Zero Login, Lucide Icons, Schema Validation, Free-tier 0đ...), tự động nạp vào context trước khi code và cập nhật động khi có thay đổi.
  10. [Xong] Tối ưu toàn diện Dark Mode & Light Mode: Xóa bỏ toàn bộ inline styles màu tối chết trong `SpotlightSearchModal.tsx`, tối ưu lại toàn bộ bảng màu, dropdown, popover panel và active filter chips trong `CategoryFilter.tsx` đạt độ tương phản chuẩn WCAG trên cả nền sáng và nền tối.
  11. [Xong] Tối ưu toàn diện Responsive CSS & UI/UX trên thiết bị di động (đặc biệt Android 360px - 412px): Chống tự động phóng to (auto-zoom bug) bằng chuẩn font 16px cho mobile inputs, tăng touch targets >= 40px, hỗ trợ vuốt mượt Feed tabs (`touch-pan-x`), chuyển Faceted Filter Panel thành Bottom Sheet trượt lên kèm backdrop trên mobile, tối ưu Reader Mode toàn màn hình cho `NewsDetailModal`, bổ sung thanh phân trang Compact `[< Trước] Trang X/Y [Sau >]` chống vỡ layout trên màn hình nhỏ.
  12. [Xong] Rà soát và làm sạch mã nguồn (Source Code Hygiene & Public Git Security): Gỡ bỏ hoàn toàn file rác/dead component (`components/SkeletonCard.tsx`), gỡ bỏ và đưa file build cache TypeScript `tsconfig.tsbuildinfo` vào `.gitignore`, cấu hình `.gitignore` chuẩn bảo mật cho Public GitHub repository (chặn `.env*`, `*.tsbuildinfo`, debug logs, cache), rà soát không có secret/API key nào bị rò rỉ, và dọn dẹp các import icon dư thừa.
  13. [Xong] Rà soát UI/UX, loại bỏ ký hiệu lạ `[ / ]` và thanh lọc phong cách "AI tropes" (Gemini-like): Gỡ bỏ ký hiệu phím tắt thừa, thay thế khối số xanh neon bằng typography Linear chuẩn, gỡ nhãn dán "Lead Story", thay thế icon Sparkles bằng Compass.
  14. [Xong] Sửa lỗi thanh bộ lọc bị bẹp (Squashed Zero-Height Filter Bar Bug): Chuyển panel trên desktop thành card inline tự nhiên, bổ sung `.scrollbar-none` chuẩn đa trình duyệt.
  15. [Xong] Đồng bộ tham số URL hai chiều (Bidirectional URL Query Syncing & Deep Linking) và nâng cấp SEO Meta:
      - Tự động đồng bộ toàn bộ bộ lọc lên URL (`?category=...&origin=...&time=...&sort=...&tag=...&month=...&q=...&page=...`) mà không làm tải lại trang (Zero Reload / Clean URL).
      - Khôi phục trạng thái (Deep Linking) khi người dùng F5 hoặc truy cập từ bookmark/link chia sẻ.
      - Hỗ trợ xem bài trực tiếp qua URL `?article=<id>`: Bấm nút Copy Link hoặc Chia sẻ Twitter sẽ tạo ngay đường link chứa ID bài viết, người nhận click vào là mở thẳng modal đọc tin.
      - Hỗ trợ lịch sử trình duyệt (Back/Forward) qua sự kiện `popstate`.
      - Khắc phục lỗi `icon.svg 500`: Đưa `icon.svg` sang thư mục `public/` và khai báo chuẩn trong `app/layout.tsx`.
      - Nâng cấp SEO: Bổ sung Google Sitelinks SearchBox Schema (`SearchAction`), Twitter Image Card, OpenGraph Image 1200x630, và alternate locales song ngữ `en_US`.

---

## 2. File Đã Sửa / Tạo Mới Trong Chuỗi Task Vừa Qua
- `app/globals.css`: [Sửa] Thêm overflow guard cho html/body, kích hoạt smooth touch scrolling `-webkit-overflow-scrolling: touch`, và thiết lập chuẩn font-size 16px trên màn hình <= 640px để chống hiện tượng Chrome/Safari tự động zoom làm méo màn hình khi focus vào input.
- `components/CategoryFilter.tsx`: [Sửa] Chuyển đổi Command Bar thành cấu trúc 2 hàng linh hoạt trên mobile, bổ sung `touch-pan-x` cho thanh Category, chuyển Faceted Filter Popover thành Bottom Sheet chuẩn Android Material có drag handle và backdrop khi mở trên mobile.
- `components/NewsAppClient.tsx`: [Sửa] Bọc Feed Priority Tabs trong container vuốt ngang mượt mà, bổ sung bộ phân trang Compact Pagination trên mobile (`sm:hidden`) giúp người dùng chuyển trang nhẹ nhàng bằng 1 chạm mà không bị vỡ giao diện.
- `components/NewsDetailModal.tsx`: [Sửa] Tối ưu thành Full Reader Mode trên mobile (`p-0 sm:p-6`, `h-full sm:h-auto max-h-[100dvh] sm:max-h-[90vh]`), cấu trúc lại cụm nút tương tác đáy ngón tay cái với vùng chạm >= 40px và nút "Đến bài viết gốc" nổi bật.
- `components/SpotlightSearchModal.tsx`: [Sửa] Cập nhật font-size `text-base sm:text-sm` chống phóng to màn hình, bổ sung nút "Đóng" dành riêng cho mobile, mở rộng chiều cao `max-h-[85vh]` tối ưu không gian hiển thị kết quả.
- `components/BookmarkDrawer.tsx`: [Sửa] Xóa bỏ padding thừa `pl-10` trên màn hình nhỏ (`pl-0 sm:pl-10`), mở rộng bề ngang drawer tối đa cho trải nghiệm đọc bookmark thoải mái trên Android, tăng touch target cho nút xóa.
- `components/TrendingTicker.tsx`: [Sửa] Tinh chỉnh kích thước badge Tiêu Điểm và nút điều hướng Next/Prev trên mobile giúp hiển thị trọn vẹn tiêu đề tin.
- `components/Navbar.tsx`: [Sửa] Tối ưu vùng chạm tối thiểu `min-w-[36px] min-h-[36px]` cho các nút Search, Language, Bookmark, Theme Toggle và giảm padding biên trên mobile (`px-3 sm:px-6`).
- `components/SpotlightSearchModal.tsx`: [Sửa] Chuyển đổi toàn bộ sang Tailwind classes adaptive Dark/Light mode, loại bỏ hardcoded inline styles.
- `components/CategoryFilter.tsx`: [Sửa] Tối ưu màu sắc popover panel, button container, custom archive dropdown và active filter chips cho cả 2 theme.
- `.agents/skills/project-invariants-keeper/SKILL.md`: [Mới] Skill ghi nhớ và duy trì các yêu cầu bất biến, chống context drift.
- `INVARIANTS.md`: [Mới] Bảng quy chuẩn bất biến (Single Source of Truth) của toàn bộ dự án.
- `AGENTS.md`: [Sửa] Bổ sung Mục 5 - Project Invariants cốt lõi để tự động nạp vào prompt rules.
- `scripts/audit_dead_links.ts`: [Mới] Script rà soát URL bài viết cũ, phát hiện 404/410/deleted, dọn dẹp DB và đồng bộ lại search index.
- `.github/workflows/daily_link_audit.yml`: [Mới] Workflow cronjob chạy hàng ngày lúc 03:00 AM (giờ VN), tự động commit database sạch lên nhánh `develop`.
- `package.json`: [Sửa] Thêm lệnh `npm run audit-links`.
- `components/CategoryFilter.tsx`: [Sửa] Gỡ bỏ ô search trùng lặp, đưa Nguồn tin (Origin Switcher) ra ngoài thanh công cụ trực tiếp, thay thế 100% emoji bằng Lucide icons (`MapPin`, `Globe`, `Flame`, `Zap`, `Archive`, `Tag`).
- `components/NewsAppClient.tsx`: [Sửa] Loại bỏ props search thừa khỏi `CategoryFilter`, giữ Navbar Spotlight Search làm trung tâm duy nhất.
- `app/opengraph-image.tsx`: [Sửa] Loại bỏ emoji thô khỏi text OG Image.
- `components/BilingualContext.tsx`: [Sửa] Bổ sung bộ từ khóa song ngữ cho hệ thống Command Filter Dock.
- `.agents/skills/grounded-innovative-architect/SKILL.md`: [Mới] Skill tư vấn kiến trúc & giải pháp đột phá độc bản.
- `architecture.md`: Bộ nhớ dài hạn lưu trữ quy chuẩn kiến trúc, archive data flow, recommendation engine và danh mục skills.
- `task_on_progress.md`: Bộ nhớ làm việc ngắn hạn lưu trữ trạng thái bàn giao.
- `next.config.mjs`: [Sửa] Cấu hình `config.cache = false` khi `dev` để chấm dứt hoàn toàn lỗi file lock Webpack PackFileCacheStrategy ENOENT trên Windows.
- `lib/user_interest_tracker.ts`: [Mới] Engine ghi nhận hành vi (read, bookmark, upvote, share) và tính điểm tương đồng tin tức.
- `.agents/skills/user-interest-recommendation-engine/SKILL.md`: [Mới] Chuẩn hóa thuật toán gợi ý tin tức AI client-side.
- `app/robots.ts`, `app/sitemap.ts`, `app/manifest.ts`: [Mới] Bộ 3 chuẩn SEO & PWA tự động.
- `app/layout.tsx`: [Sửa] Bổ sung canonical URL, Googlebot directives, JSON-LD Schema, và `metadataBase`.
- `components/Footer.tsx`: [Sửa] Gỡ bỏ dòng hiển thị thời gian cập nhật.
- `components/NewsCard.tsx`, `components/HeroBento.tsx`, `components/NewsDetailModal.tsx`, `components/NewsRowCompact.tsx`, `components/TrendingTicker.tsx`: [Sửa] Gỡ bỏ hoàn toàn badge `pts` gây rối mắt.
- `components/NewsDetailModal.tsx`: [Sửa] Tích hợp tracking hành vi khi đọc tin và hiển thị danh sách "Có thể bạn quan tâm" (Related Articles).

---

## 3. Bước Tiếp Theo Cần Làm (Next Actions)
1. Bàn giao kết quả cho người dùng kiểm tra trực quan trên trình duyệt.
2. Sẵn sàng nhận feedback hoặc tiếp tục các cải tiến tính năng tiếp theo khi có yêu cầu.
