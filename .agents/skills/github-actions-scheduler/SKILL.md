---
name: github-actions-scheduler
description: Cấu hình và vận hành GitHub Actions cronjobs tự động hóa cào tin, kiểm tra link và release.
---

# GitHub Actions Scheduler Skill

Hướng dẫn quản trị và vận hành hệ thống tự động hóa 24/7 trên GitHub Actions (100% Free Tier).

---

## 1. Danh Mục Workflows

1. **`update_news.yml` (News Crawler 24/7)**:
   - **Tần suất**: Chạy mỗi 2 tiếng (`0 */2 * * *`) hoặc kích hoạt thủ công (`workflow_dispatch`).
   - **Nhiệm vụ**: Chạy `scripts/fetch_news.ts`, gọi Gemini Pro phân tích bài mới, tự động commit và push trực tiếp lên nhánh **`develop`**.
2. **`daily_link_audit.yml` (Daily Dead Link Auditor)**:
   - **Tần suất**: Chạy lúc 03:00 UTC (10:00 sáng VN) hàng ngày.
   - **Nhiệm vụ**: Chạy `scripts/audit_dead_links.ts` quét HTTP HEAD loại bỏ bài viết 404/410 với chốt an toàn (Circuit Breaker) 20%.
3. **`weekly_merge_develop_to_main.yml` (Weekly Production Release)**:
   - **Tần suất**: Chạy lúc 00:00 UTC Chủ Nhật hàng tuần (`0 0 * * 0`).
   - **Nhiệm vụ**: Kiểm tra `npm run build` trên `develop`, sau đó tự động merge `origin/develop` vào `main` để deploy bản Production.

---

## 2. Thiết Lập GitHub Secrets
Để pipeline hoạt động:
- **`GEMINI_API_KEY`**: API Key từ Google AI Studio phục vụ tóm tắt bài viết.
- **`MONGODB_URI`** (Tùy chọn): Kết nối MongoDB Atlas nếu dùng cloud database.
- Cấp quyền **`Workflow permissions -> Read and write permissions`** trong Settings -> Actions -> General để bot có thể commit dữ liệu.
