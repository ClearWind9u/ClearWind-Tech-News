---
name: tasteful-modern-uiux
description: >-
  Quy chuẩn thiết kế UI/UX hiện đại (Linear, Daily.dev, Vercel): Hệ thống Dark/Light mode, Glassmorphism, Micro-animations, Typography chuẩn và components mẫu Tailwind CSS.
---

# Tasteful Modern UI/UX Design System Skill

Skill này hướng dẫn xây dựng giao diện người dùng (UI) và trải nghiệm người dùng (UX) đạt chuẩn **Tasteful & Premium Design**, tối ưu cho cả Desktop và Mobile.

---

## 1. Triết Lý Thiết Kế Cốt Lõi

1. **Subtle Elegance & Full Theme Support**:
   - 100% component hỗ trợ cả **Dark Mode và Light Mode** qua class `.dark` (`bg-slate-50 dark:bg-[#090A0F]`, `border-slate-200 dark:border-white/10`).
   - Tránh các màu cơ bản chói gắt. Dùng các gam màu HSL tinh chỉnh: Emerald (`#10b981`), Indigo (`#6366f1`), Cyan (`#06b6d4`), Amber (`#f59e0b`).
2. **Depth & Glassmorphism**:
   - Sử dụng hiệu ứng kính mờ nhiều lớp: `backdrop-blur-xl bg-white/80 dark:bg-[#0B0E14]/80 border border-slate-200/80 dark:border-white/10 shadow-2xl`.
3. **Micro-Interactions & Fluid Motion**:
   - Phản hồi mượt mà: `transition-all duration-200 ease-out active:scale-[0.98]`.
   - Card khi hover nhấc nhẹ 1-2px, viền sáng lên từ `border-slate-200 dark:border-white/10` thành `border-emerald-500/40`.
4. **Zero Layout Shift (CLS = 0)**:
   - Sử dụng Skeleton loaders (`CardSkeleton`, `RowSkeleton`, `HeroSkeleton`) mô phỏng đúng kích thước khối nội dung trong khi tải.

---

## 2. Bảng Màu & Design Tokens Chuẩn (Tailwind CSS)

| Token | Class Light | Class Dark | Mục đích |
|---|---|---|---|
| **Background Base** | `bg-slate-50` | `dark:bg-[#090A0F]` | Nền tổng thể toàn trang web |
| **Card Surface** | `bg-white` | `dark:bg-[#11141E]` | Nền thẻ bài viết, widget |
| **Hover Surface** | `hover:bg-slate-100` | `dark:hover:bg-[#161B28]` | Trạng thái hover |
| **Border Subtle** | `border-slate-200` | `dark:border-white/10` | Viền ngăn cách |
| **Border Focus** | `border-emerald-500/40` | `dark:border-emerald-500/50` | Tiêu điểm / Viền khi hover |
| **Text Primary** | `text-slate-900` | `dark:text-white` | Tiêu đề chính |
| **Text Muted** | `text-slate-500` | `dark:text-slate-400` | Tóm tắt, metadata, tác giả |
| **Brand Accent** | `from-emerald-500 to-teal-500` | `from-emerald-400 to-teal-400` | Điểm nhấn chính |

---

## 3. Quy Chuẩn Icon & Thẩm Mỹ
- **100% Lucide Icons**: Toàn bộ icon dùng từ thư viện `lucide-react`. **CẤM TUYỆT ĐỐI** dùng emoji thô trong JSX.
- **Không Hiển Thị `pts`**: Điểm số (`hotScore`) chỉ hiển thị số nguyên kèm icon `<Flame className="w-3.5 h-3.5 text-orange-500" />`, không kèm chữ `pts`.
- **Spotlight Search**: Tìm kiếm tập trung tại thanh `⌘K` trên Navbar.
