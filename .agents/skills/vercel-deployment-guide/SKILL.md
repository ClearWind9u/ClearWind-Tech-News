---
name: vercel-deployment-guide
description: Hướng dẫn cấu hình triển khai Vercel Free-tier 100%, custom domain và tối ưu SSG cache.
---

# Vercel Deployment Guide

## 1. Cấu hình Production Branch
Dự án sử dụng mô hình Git Flow:
- Mặc định Vercel deploy từ nhánh **`main`** (bản phát hành ổn định hàng tuần).
- Nếu muốn website tự động xuất bản tin tức mới ngay khi crawler push bài lên: Vào **Settings** -> **Git** -> Đổi **Production Branch** sang **`develop`**.

## 2. Thiết lập Biến môi trường trên Vercel
Vào **Settings** -> **Environment Variables**:
- `GEMINI_API_KEY`: API Key từ Google AI Studio (bắt buộc cho việc tóm tắt AI).

## 3. Gắn Domain tùy chỉnh miễn phí
Vào **Settings** -> **Domains** -> Thêm domain cá nhân -> Trỏ bản ghi CNAME theo hướng dẫn Vercel.
