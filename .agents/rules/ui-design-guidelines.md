# Hướng dẫn Thiết kế UI/UX (Daily.dev Design System Spec)

Hệ thống tuân thủ 100% tài liệu **Daily.dev Design System**:

## 1. Triết lý Thiết kế & Không gian thị giác
- **Canvas / Nền chủ đạo**: Deep navy-black (`#0F0F12`).
- **Typography**:
  - Headings / Display: `Plus Jakarta Sans` / `DD Display` với **tight negative letter-spacing** (`-0.02em`, `font-weight: 700`).
  - Body / UI: `Plus Jakarta Sans` (`16px`, `font-weight: 400`).
  - Code: `ui-monospace` (`12px`).
- **Radiant Hero Gradient**: Orb tròn phát sáng đa sắc (Cyan `#22D3EE` $\rightarrow$ Periwinkle Purple `#7C6BEA` $\rightarrow$ Magenta `#C084FC`) kết hợp `filter: blur(40px)`.

## 2. Bảng Màu Chuẩn (Exact Color Tokens)
- **Primary / Ink**: `#FFFFFF` (CTA buttons, tiêu đề chính).
- **Body Text**: `#F4F4F5` (Văn bản đọc).
- **Muted Text**: `#E4E4E7` / `#A1A1AA`.
- **Borders / Hairline**: `#A8B3CE` với opacity 10-20% hoặc `1px solid rgba(255, 255, 255, 0.08)`.
- **Brand Accents**:
  - Purple Brand: `#9333EA` (Focus Ring & Primary Brand).
  - Periwinkle: `#7C6BEA` (Outline buttons & Link hovers).
  - Lavender: `#C084FC` (Tag accents).

## 3. Quy chuẩn Bo góc (Border Radius)
- Buttons (Primary / Outline): `12px` (`rounded-sm`).
- Cards & Modals: `16px` (`rounded-lg` / `rounded-2xl`).
- Badges & Icon Buttons: `9999px` (`rounded-full`).

## 4. Nguyên tắc Tương tác & Chiều sâu
- **Layered-Micro Elevation**: Không dùng shadow đổ bóng thô kệch. Chiều sâu được tạo bởi độ tương phản giữa nền tối `#0F0F12` và các thẻ `#101015` viền 1px mờ.
- **Focus Ring bắt buộc**: `2px solid #9333EA` khi người dùng điều hướng bằng bàn phím.
- **Interactive Upvotes & Bookmarks**: Lưu trạng thái vào `localStorage` không cần đăng nhập.
