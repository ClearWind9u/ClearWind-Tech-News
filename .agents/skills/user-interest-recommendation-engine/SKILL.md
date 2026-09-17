---
name: user-interest-recommendation-engine
description: >-
  Quy chuẩn kỹ thuật cho hệ thống theo dõi hành vi người đọc (User Behavior Tracking), tính toán vector sở thích công nghệ và thuật toán gợi ý tin tức cá nhân hóa (Personalization & Related Articles Engine) bảo mật client-side 100%.
---

# User Interest & AI Recommendation Engine Skill

Skill này định nghĩa mô hình tính toán trọng số hành vi người dùng (Client-Side Privacy Tracking), cấu trúc vector sở thích công nghệ và thuật toán xếp hạng đề xuất tin tức cá nhân hóa ("Dành cho bạn" và "Có thể bạn quan tâm") cho **ClearWind Tech News**.

---

## 1. Nguyên Tắc Cốt Lõi (Core Principles)

- **Zero Login Friction & 100% Privacy**: Không yêu cầu người dùng đăng nhập tài khoản. Mọi hành vi đọc, lưu bài, thích bài đều được xử lý và lưu trữ cục bộ trên trình duyệt (`localStorage`). Không gửi dữ liệu định danh người dùng về server.
- **Real-Time Adaptation**: Mỗi khi độc giả click đọc tin, bookmark, hoặc thả tim, vector sở thích (`categoryWeights`, `tagWeights`) được cập nhật tức thì.
- **Cold-Start Graceful Handling**: Với độc giả mới truy cập lần đầu (chưa có lịch sử), hệ thống tự động fallback gợi ý các tin tức công nghệ mới nhất, có độ thảo luận cao và nhiều tương tác nhất.

---

## 2. Trọng Số Tương Tác (Action Weighting Matrix)

Khi người dùng thực hiện tương tác với một bài viết, hệ thống cộng điểm tích lũy vào Chuyên mục (`category`) và các Thẻ (`tags`) của bài viết đó:

| Hành vi người dùng | Trọng số (`Weight`) | Ý nghĩa hành vi |
| :--- | :--- | :--- |
| **Bookmark (Lưu bài)** | `+5` | Mức độ quan tâm sâu, muốn xem lại lâu dài |
| **Upvote (Thả tim)** | `+4` | Đồng thuận cao với giá trị kỹ thuật bài viết |
| **Read (Đọc chi tiết)** | `+3` | Quan tâm đến tiêu đề và tóm tắt công nghệ |
| **Share (Chia sẻ link)** | `+2` | Đánh giá tin tức có giá trị lan tỏa |

---

## 3. Công Thức Chấm Điểm Đề Xuất (Recommendation Formula)

Điểm phù hợp của bài viết $A$ đối với hồ sơ người dùng $P$ được chuẩn hóa trên thang điểm $0 - 100$:

$$\text{Score}(A, P) = S_{\text{category}} \times 0.45 + S_{\text{tags}} \times 0.35 + S_{\text{freshness}} \times 0.20$$

Trong đó:
1. **$S_{\text{category}}$ (45%)**: Tỉ lệ điểm tích lũy của chuyên mục bài viết so với chuyên mục được quan tâm nhất của độc giả.
2. **$S_{\text{tags}}$ (35%)**: Tổng điểm tương đồng của các thẻ hashtag kỹ thuật trùng khớp giữa bài viết và lịch sử quan tâm của độc giả.
3. **$S_{\text{freshness}}$ (20%)**: Điểm ưu tiên cho các bài báo mới xuất bản trong 24 - 48 giờ gần nhất.

---

## 4. Mục "Có Thể Bạn Quan Tâm" (Related Articles in Modal)

Khi người dùng mở một bài viết trong Reader Modal:
- Hệ thống tự động so khớp các bài báo có **cùng chuyên mục**, **trùng lặp hashtag** và **cùng hệ sinh thái công nghệ**.
- Hiển thị 2 - 3 bài báo liên quan nhất ở cuối modal để người đọc tiếp tục hành trình khám phá kiến thức mà không bị ngắt quãng.
