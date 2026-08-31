---
name: vercel-deployment-guide
description: >-
  Hướng dẫn triển khai dự án lên Vercel miễn phí 100%, cấu hình domain tùy chỉnh, bảo mật header và tối ưu hóa static cache (SSG).
---

# Vercel Deployment Guide

## 1. Triển khai nhanh qua Git Integration (Khuyên dùng)
1. Đẩy mã nguồn lên GitHub:
   `git add . && git commit -m "feat: update" && git push origin main`
2. Truy cập [Vercel Dashboard](https://vercel.com) -> **Add New Project** -> Chọn repository.
3. Bấm **Deploy**. Vercel tự động nhận diện Next.js và cấu hình file `vercel.json`.

## 2. Thiết lập Biến môi trường trên Vercel (Nếu có)
Vào **Project Settings** -> **Environment Variables**:
- `GEMINI_API_KEY`: API Key từ Google AI Studio (nếu muốn chạy API tóm tắt realtime).
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (Nếu bật PostgreSQL Supabase).

## 3. Gắn Domain tùy chỉnh miễn phí
Vào **Settings** -> **Domains** -> Thêm domain cá nhân (ví dụ: `news.yourdomain.com`) -> Trỏ bản ghi CNAME theo hướng dẫn của Vercel (miễn phí chứng chỉ SSL trọn đời).
