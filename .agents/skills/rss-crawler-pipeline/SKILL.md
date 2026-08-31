---
name: rss-crawler-pipeline
description: >-
  Cung cấp danh mục nguồn RSS công nghệ chất lượng cao (ưu tiên Việt Nam 70% + Quốc tế 30%), cùng hướng dẫn parse RSS và trích xuất nội dung bài viết an toàn.
---

# RSS Crawler Pipeline Skill

Danh mục các nguồn RSS đã được kiểm duyệt và quy trình fetch/parse chuẩn.

## 1. Nguồn tin Việt Nam (Ưu tiên cao - 70%)

| Nguồn | Tên hiển thị | RSS Feed URL | Thể loại |
| :--- | :--- | :--- | :--- |
| **VnExpress** | VnExpress Số Hóa | `https://vnexpress.net/rss/so-hoa.rss` | Tech Trends, AI, Gadgets |
| **GenK** | GenK | `https://genk.vn/tin-ict.rss` | ICT, Software, Hardware |
| **Tinhte** | Tinh Tế | `https://tinhte.vn/rss` | Tech News, Mobile, Gadgets |
| **VietNamNet** | VietNamNet ICT | `https://vietnamnet.vn/rss/cong-nghe.rss` | Chuyển đổi số, Viễn thông, IT |
| **Tuổi Trẻ** | Tuổi Trẻ Nhịp sống số | `https://tuoitre.vn/rss/nhip-song-so.rss` | Đời sống số, Công nghệ |
| **Thanh Niên** | Thanh Niên Công nghệ | `https://thanhnien.vn/rss/cong-nghe.rss` | Tin công nghệ tổng hợp |

## 2. Nguồn tin Quốc tế (30%)

| Nguồn | Tên hiển thị | RSS Feed URL | Thể loại |
| :--- | :--- | :--- | :--- |
| **Hacker News** | Hacker News | `https://hnrss.org/frontpage` | Computer Science, Startups |
| **Dev.to** | Dev.to | `https://dev.to/feed` | Software Engineering, Tutorials |
| **The Verge** | The Verge Tech | `https://www.theverge.com/rss/index.xml` | Global Tech News, Big Tech |
| **TechCrunch** | TechCrunch | `https://techcrunch.com/feed/` | Startups, Venture Capital, AI |

## 3. Best Practices khi Fetch RSS
- Sử dụng thư viện `rss-parser` trong Node.js.
- Luôn truyền `User-Agent` hợp lệ để tránh bị chặn 403.
- Xử lý sanitize HTML trong trường `content` hoặc `description` để bóc tách text thuần trước khi gửi cho Gemini.
- Giới hạn mỗi feed lấy 3 - 5 bài mới nhất mỗi chu kỳ để tối ưu quota API.
