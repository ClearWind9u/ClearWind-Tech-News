---
name: github-actions-scheduler
description: >-
  Hướng dẫn cấu hình và vận hành GitHub Actions cronjob tự động chạy script cào tin, gọi Gemini Pro và commit data lên repository hoàn toàn miễn phí.
---

# GitHub Actions Scheduler Skill

Hướng dẫn chi tiết thiết lập tự động hóa 24/7 bằng GitHub Actions.

## 1. Cấu hình Workflow (.github/workflows/update_news.yml)

Quy trình chuẩn:
1. `schedule`: Chạy định kỳ (ví dụ mỗi 2 tiếng: `0 */2 * * *`).
2. `workflow_dispatch`: Cho phép kích hoạt thủ công từ giao diện GitHub.
3. Cấp quyền `contents: write` để bot có thể commit dữ liệu mới vào `data/news.json`.
4. Cài đặt Node.js, chạy `npm run fetch-news` với biến môi trường `GEMINI_API_KEY`.
5. Tự động kiểm tra `git diff`, nếu có tin mới thì `git commit` và `git push`.

## 2. Thiết lập GitHub Secrets

Để script gọi được Gemini Pro API:
1. Vào repository trên GitHub -> **Settings** -> **Secrets and variables** -> **Actions**.
2. Bấm **New repository secret**.
3. Đặt Name: `GEMINI_API_KEY`, Secret: `<API_KEY_CỦA_BẠN>`.

## 3. Tự động kích hoạt Vercel Deploy
Khi GitHub Actions push commit mới vào nhánh `main`, Vercel (hoặc Cloudflare Pages) sẽ tự động trigger bản build mới để cập nhật nội dung tức thì trên website.
