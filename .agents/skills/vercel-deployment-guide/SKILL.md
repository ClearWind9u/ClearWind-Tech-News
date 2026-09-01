---
name: vercel-deployment-guide
description: >-
  Hướng dẫn triển khai dự án lên Vercel miễn phí 100%, cấu hình domain tùy chỉnh, bảo mật header và tối ưu hóa static cache (SSG).
---

# Vercel Deployment Guide

## 1. Triển khai Tự Động Production từ nhánh `develop` (Cấu hình 1 lần)
Mặc định Vercel coi nhánh `main` là Production. Để tự động deploy bản Production chính thức mỗi khi push code lên nhánh **`develop`**:

1. Truy cập [Vercel Dashboard](https://vercel.com/dashboard) -> Chọn dự án `ClearWind-Tech-News` (hoặc `windtech-sandy`).
2. Vào tab **Settings** -> Chọn **Git** ở menu bên trái.
3. Tại mục **Production Branch**, đổi giá trị từ `main` thành **`develop`**.
4. Bấm **Save**.

👉 **Kết quả**: Từ nay, mỗi khi chạy `git push origin develop` hoặc workflow tự động cập nhật tin tức, Vercel sẽ tự động build và xuất bản thẳng lên domain Production chính thức!

## 2. Thiết lập Biến môi trường trên Vercel
Vào **Settings** -> **Environment Variables**:
- `GEMINI_API_KEY`: API Key từ Google AI Studio.

## 3. Gắn Domain tùy chỉnh miễn phí
Vào **Settings** -> **Domains** -> Thêm domain cá nhân -> Trỏ bản ghi CNAME theo hướng dẫn Vercel.
