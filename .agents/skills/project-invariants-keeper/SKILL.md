---
name: project-invariants-keeper
description: >-
  Kỹ năng kiểm soát và bảo toàn các quy tắc bất biến của dự án (Dark/Light mode, Song ngữ VI/EN, Lucide icons, Zero Login, 0đ Free Tier). Tự động cập nhật INVARIANTS.md khi có yêu cầu mới.
---

# Project Invariants Keeper Skill

Skill này đóng vai trò là **Bộ Nhớ Bất Biến (Immutable Core Anchors)** của dự án **ClearWind Tech News**, đảm bảo AI luôn tuân thủ các ràng buộc nền tảng mà không bị quên ngữ cảnh (Zero Context Drift).

---

## 1. Bảng Đối Chiếu Nhanh (Invariants Quick Reference)
*Nguồn tham chiếu chi tiết tại `INVARIANTS.md`*:

| Invariant | Quy định cốt lõi | Điều cấm (Anti-Pattern) |
|---|---|---|
| **Theme** | Dark / Light Mode qua class `.dark` (`bg-slate-50 dark:bg-[#090A0F]`) | Cấm hardcode màu cố định gây vỡ tương phản |
| **Song ngữ** | 100% text tĩnh qua `t.<key>` trong `BilingualContext.tsx` | Cấm text đơn ngữ cứng trong JSX; cấm lọt tiếng Anh thô vào chế độ VI |
| **Icons** | 100% icon từ `lucide-react` | Cấm tuyệt đối chèn raw emoji (`🇻🇳`, `🌐`, `🔥`, `⚡`...) vào JSX làm icon |
| **Search** | Duy nhất Spotlight `⌘K` trên Navbar | Cấm tạo thêm ô search trùng lặp dưới Feed |
| **Zero Login** | Dữ liệu người dùng (Bookmark, Lịch sử, Sở thích) lưu tại `localStorage` | Cấm yêu cầu đăng nhập, cấm auth-wall hay session server |
| **Chi phí 0đ** | 100% Free Tier (Vercel, Git-as-DB `data/news.json`, GitHub Actions) | Cấm tự ý thêm DB có phí hoặc VPS riêng |
| **Tóm tắt** | 3 bullet points kỹ thuật sâu (Bối cảnh $\rightarrow$ Công nghệ $\rightarrow$ Giá trị thực tiễn) | Cấm tóm tắt 1 câu hời hợt, sáo rỗng |
| **Git Flow** | Code và commit hàng ngày trên `develop`. `main` nhận auto-merge định kỳ | Cấm push code trực tiếp lên `main` |

---

## 2. Quy Trình Vận Hành 3 Bước

1. **Pre-Check**: Tự vấn trước khi viết code:
   - Component có đủ class Dark/Light mode không?
   - Text đã đưa vào `BilingualContext` (cả `vi` và `en`) chưa?
   - Toàn bộ icon đã dùng `lucide-react` chưa?
   - Có dùng `localStorage` (không đòi login) không?
2. **Execute**: Triển khai code bảo toàn 100% invariants.
3. **Dynamic Mutation**: Khi user yêu cầu thay đổi nền tảng (ví dụ đổi theme hoặc bỏ bớt tính năng):
   - Cập nhật trực tiếp `INVARIANTS.md` và `AGENTS.md`.
   - Thông báo rõ ràng cho user về việc cập nhật.
