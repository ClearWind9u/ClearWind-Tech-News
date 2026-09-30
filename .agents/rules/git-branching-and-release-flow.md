# Git Branching Strategy & Release Flow

1. **Cấu Trúc Nhánh**:
   - **`develop` (Active Development)**: Nhánh làm việc chính thức hàng ngày cho mọi tính năng, cải tiến và bug fix. Mọi commit coding thực hiện và push trực tiếp trên `develop`.
   - **`feature/<name>`**: Rẽ nhánh từ `develop` khi có tính năng lớn, tạo PR merge vào `develop`, xóa nhánh sau khi merge.
   - **`main` (Production)**: Nhánh chạy production thực tế, tự động deploy lên Vercel. Tuyệt đối không code trực tiếp vào `main`.

2. **Quy Trình Tự Động Hóa**:
   - **Weekly Auto-Merge**: Định kỳ 00:00 UTC Chủ Nhật hàng tuần (`weekly_merge_develop_to_main.yml`), tự động chạy `npm run build` trên `develop` rồi merge vào `main`.
   - **Auto-News Crawler**: Chạy mỗi 2 tiếng qua GitHub Actions (`update_news.yml`), commit trực tiếp lên `develop`.
