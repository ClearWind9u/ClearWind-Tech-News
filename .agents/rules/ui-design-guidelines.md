# UI/UX & Design System Guidelines

1. **Theme & Không Gian Thị Giác**:
   - 100% component hỗ trợ cả **Dark Mode và Light Mode** (`bg-slate-50 dark:bg-[#090A0F]`, `text-slate-900 dark:text-slate-100`, `border-slate-200 dark:border-white/10`).
   - Cấm hardcode màu chết làm vỡ tương phản khi đổi theme.

2. **Thư Viện Icon Thống Nhất**:
   - 100% dùng icon từ **`lucide-react`**.
   - **CẤM TUYỆT ĐỐI** dùng emoji thô (`🇻🇳`, `🌐`, `🔥`, `⚡`, `✨`...) làm icon trong JSX.

3. **Điều Hướng & Tìm Kiếm**:
   - Duy nhất một thanh tìm kiếm Spotlight (`⌘K` / `Ctrl+K`) trên Navbar. Thanh lọc dưới Feed chỉ dùng cho danh mục, nguồn tin và thời gian.
   - Không hiển thị hậu tố `pts` sau điểm số để giữ phong cách tối giản Linear.

4. **Tương Tác & Hiệu Năng**:
   - Giữ `CLS = 0` bằng Skeleton loaders (`CardSkeleton`, `RowSkeleton`, `HeroSkeleton`).
   - Mọi trạng thái bookmark, đọc tin, tracking sở thích lưu client-side tại `localStorage` (Zero login).
