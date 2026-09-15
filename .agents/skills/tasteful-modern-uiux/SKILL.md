---
name: tasteful-modern-uiux
description: >-
  Cung cấp quy chuẩn thiết kế giao diện UI/UX cao cấp (Tasteful Design) theo phong cách Linear, Daily.dev, Raycast và Vercel: Hệ thống bảng màu Dark mode sang trọng, Glassmorphism, Micro-animations, Typography chuẩn quốc tế và các component mẫu Next.js + Tailwind CSS.
---

# Tasteful Modern UI/UX Design System Skill

Skill này hướng dẫn xây dựng giao diện người dùng (UI) và trải nghiệm người dùng (UX) đạt chuẩn **Tasteful & Premium Design**, tạo ấn tượng thị giác mạnh mẽ ngay từ cái nhìn đầu tiên với độ hoàn thiện cao, tối ưu cho cả Desktop và Mobile.

---

## 1. Triết Lý Thiết Kế Cốt Lõi (Core Principles)

1. **Subtle Elegance (Tinh tế & Tối giản)**:
   - Sử dụng nền tối sâu (Deep Dark / OLED Pitch Black: `#09090b`, `#0f172a`) kết hợp viền mờ tinh xảo (`border-white/10` hoặc `border-zinc-800`).
   - Tránh các màu cơ bản chói gắt. Sử dụng các dải màu HSL tinh chỉnh: Emerald (`#10b981`), Indigo (`#6366f1`), Cyan (`#06b6d4`), Amber (`#f59e0b`).
2. **Depth & Glassmorphism (Chiều sâu không gian)**:
   - Sử dụng hiệu ứng kính mờ nhiều lớp: `backdrop-blur-xl bg-zinc-950/75 border border-white/[0.08] shadow-2xl`.
   - Ánh sáng nhẹ khuếch tán (Ambient Glow / Radial Gradients) tại các điểm nhấn quan trọng.
3. **Micro-Interactions & Fluid Motion**:
   - Mọi tương tác hover, click đều có phản hồi mượt mà: `transition-all duration-200 ease-out active:scale-[0.98]`.
   - Card khi hover nhấc nhẹ lên 1-2px, viền sáng lên từ `border-white/10` thành `border-indigo-500/40`.
4. **Zero Layout Shift (CLS = 0)**:
   - Sử dụng Skeleton loaders mô phỏng đúng kích thước khối nội dung trong khi tải dữ liệu.

---

## 2. Bảng Màu & Design Tokens Chuẩn (Tailwind CSS)

| Token | Class Tailwind | Màu thực tế | Mục đích sử dụng |
|---|---|---|---|
| **Background Base** | `bg-zinc-950` | `#09090b` | Nền tổng thể toàn trang web |
| **Card Surface** | `bg-zinc-900/50` | `rgba(24, 24, 27, 0.5)` | Nền thẻ bài viết, widget |
| **Hover Surface** | `hover:bg-zinc-800/60` | `rgba(39, 39, 42, 0.6)` | Trạng thái hover của component |
| **Border Subtle** | `border-white/10` | `rgba(255, 255, 255, 0.1)` | Đường viền ngăn cách tinh tế |
| **Border Glow** | `border-indigo-500/30` | `rgba(99, 102, 241, 0.3)` | Đường viền kích hoạt / tiêu điểm |
| **Text Primary** | `text-zinc-100` | `#f4f4f5` | Tiêu đề và nội dung chính |
| **Text Muted** | `text-zinc-400` | `#a1a1aa` | Tóm tắt, metadata, tác giả |
| **Brand Accent** | `bg-gradient-to-r from-indigo-500 to-cyan-400` | Gradient | Logo, nút kêu gọi hành động (CTA) |

---

## 3. Thư Viện Component Mẫu Chuẩn Linear / Daily.dev

### A. Thẻ Bài Viết Công Nghệ (Modern News Card)

```tsx
export function ModernNewsCard({ article, onBookmark }: NewsCardProps) {
  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-900/40 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/40 hover:bg-zinc-900/70 hover:shadow-xl hover:shadow-indigo-500/5">
      {/* Category Badge & Hot Score */}
      <div className="mb-3 flex items-center justify-between text-xs">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-0.5 font-medium text-indigo-300">
          <Sparkles className="h-3 w-3" />
          {article.category}
        </span>
        <span className="flex items-center gap-1 font-mono text-zinc-400">
          <Flame className="h-3.5 w-3.5 text-amber-400" />
          {article.hotScore} pts
        </span>
      </div>

      {/* Title */}
      <h3 className="mb-2 line-clamp-2 text-base font-semibold leading-snug text-zinc-100 group-hover:text-indigo-300 transition-colors">
        {article.title_vi}
      </h3>

      {/* 3 Key Takeaways */}
      <ul className="mb-4 space-y-1.5 border-l-2 border-zinc-800 pl-3 text-xs leading-relaxed text-zinc-400">
        {article.summary_vi.slice(0, 3).map((point, idx) => (
          <li key={idx} className="line-clamp-2">
            <span className="font-medium text-zinc-300">#{idx + 1}:</span> {point}
          </li>
        ))}
      </ul>

      {/* Footer Metadata & Actions */}
      <div className="mt-auto flex items-center justify-between pt-3 border-t border-white/[0.06] text-xs text-zinc-500">
        <span className="font-medium text-zinc-400">{article.sourceName}</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {article.readTimeMinutes}p đọc
          </span>
          <button
            onClick={() => onBookmark(article.id)}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-amber-400 transition-all"
            aria-label="Bookmark article"
          >
            <Bookmark className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
```

### B. Thanh Tìm Kiếm & Lệnh Nhanh (Command Bar Ctrl+K)

```tsx
<div className="relative w-full max-w-lg">
  <div className="flex items-center rounded-xl border border-white/10 bg-zinc-900/60 px-3.5 py-2 backdrop-blur-md focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
    <Search className="h-4 w-4 text-zinc-400 mr-2.5 shrink-0" />
    <input
      type="text"
      placeholder="Tìm kiếm tin công nghệ, AI, DevOps... (Ctrl + K)"
      className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 outline-none"
    />
    <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-white/10 bg-zinc-800/80 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
      ⌘K
    </kbd>
  </div>
</div>
```

---

## 4. Typography & Font Pairing

1. **Heading & UI Font**: **Outfit** hoặc **Inter** (`font-sans`):
   - Trọng lượng chữ: `font-medium` (500) cho body, `font-semibold` (600) cho title, `font-bold` (700) cho logo/hero.
2. **Code & Metrics**: **JetBrains Mono** hoặc **Fira Code** (`font-mono`):
   - Sử dụng cho Hot score, time ago, tags kỹ thuật, status badges.
3. **Leading & Line Clamping**:
   - Tiêu đề: `leading-snug tracking-tight`.
   - Đoạn tóm tắt: `leading-relaxed line-clamp-3`.

---

## 5. UI/UX Quality Checklist

- [ ] **Contrast Ratio**: Đảm bảo tỉ lệ tương phản văn bản đạt chuẩn WCAG AA (> 4.5:1 với body, > 3:1 với large text).
- [ ] **Mobile-First Responsive**: Mọi thanh điều hướng trên mobile gom về floating dock dưới đáy màn hình hoặc drawer trượt êm ái.
- [ ] **Interactive Feedback**: Mọi nút bấm đều có hiệu ứng `active:scale-95` và `hover:opacity-90`.
- [ ] **No Raw White**: Tuyệt đối không dùng màu trắng tinh `#ffffff` cho nền lớn hay văn bản dài; dùng `text-zinc-100` hoặc `text-zinc-200` để tránh mỏi mắt.
