# Git Branching Strategy & Release Management Rules

Quy tắc phân nhánh và quản trị mã nguồn chuẩn mực cho dự án **ClearWind Tech News**:

## 1. Cấu Trúc Phân Nhánh (Branching Model)

* **`main` (Production Branch)**:
  - Nhánh môi trường Production chạy thực tế (deploy tự động lên Vercel Production).
  - Không code trực tiếp vào `main`.
  - Được tự động đồng bộ/merge từ nhánh `develop` mỗi tuần 1 lần qua GitHub Actions Cron (`.github/workflows/weekly_merge_develop_to_main.yml`).

* **`develop` (Active Development Branch)**:
  - Nhánh làm việc chính thức hàng ngày cho mọi tính năng, cải tiến và cập nhật code.
  - Mọi task pair-programming và coding tiếp theo đều thực hiện và push trực tiếp trên `develop`.

* **`feature/<name>` (Major Feature Branches)**:
  - Khi có một tính năng hoặc yêu cầu thay đổi lớn (Major Architectural Change / Epic):
    1. Tạo nhánh mới rẽ nhánh từ `develop`: `git checkout -b feature/<feature-name> develop`.
    2. Phát triển và kiểm thử độc lập trên nhánh feature.
    3. Tạo Pull Request (PR) trỏ mục tiêu merge vào `develop`.
    4. Sau khi merge thành công vào `develop`, tiến hành xóa nhánh feature (`git branch -d feature/<feature-name>` và `git push origin --delete feature/<feature-name>`).

## 2. Tự Động Hóa & Release Chuẩn Hóa
- **Weekly Auto-Merge**: Chạy vào 00:00 UTC Chủ Nhật hàng tuần (`cron: '0 0 * * 0'`). Tự động kiểm tra `npm run build` trước khi merge `develop` $\rightarrow$ `main`.
- **Crawler Cron 24/7**: Chạy định kỳ mỗi 2 tiếng để cào tin và lưu trực tiếp vào Cloud Database.
