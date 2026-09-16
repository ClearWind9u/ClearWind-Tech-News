---
name: bilingual-it-translator
description: >-
  Chuẩn mực biên dịch và chuyển đổi ngữ pháp song ngữ IT chuyên sâu (Việt <-> Anh), từ điển thuật ngữ công nghệ đối sánh, và quy tắc cấu trúc tóm tắt 3 điểm vàng chuẩn kỹ thuật phần mềm.
---

# Bilingual IT Translation & Engineering Grammar Compiler Skill

Skill này định nghĩa chuẩn mực bắt buộc cho việc biên dịch, chuyển ngữ 2 chiều (Anh ➔ Việt và Việt ➔ Anh), xử lý thuật ngữ công nghệ thông tin và duy trì tính nhất quán song ngữ hoàn hảo cho toàn bộ dữ liệu tin tức trong **ClearWind Tech News**.

---

## 1. Nguyên Tắc Biên Dịch Kỹ Thuật Hai Chiều (Bidirectional Translation)

### A. Chiều Việt ➔ Anh (Vietnamese to English Headline & Summary)
- **Tiêu đề (Title)**: Chuyển đổi theo phong cách **Headline tự nhiên** của báo chí công nghệ quốc tế (*The Verge, TechCrunch, Ars Technica*).
  - Viết ngắn gọn, cấu trúc chủ vị rõ ràng hoặc dạng Review/Insight.
  - Ví dụ:
    - ❌ *Dịch máy thô*: `"Evaluate ASUS Zenbook A16: Most powerful chip of Qualcomm on laptop still is software held back"`
    - ✅ *Chuẩn Engineering*: `"ASUS Zenbook A16 Review: Qualcomm's Most Powerful Laptop Chip Still Constrained by Software"`
- **Tóm tắt (Summary)**: Viết bằng thể chủ động (*Active voice*), sử dụng động từ kỹ thuật chính xác (*deploys, optimizes, mitigates, accelerates, refactors, benchmarks*).

### B. Chiều Anh ➔ Việt (English to Vietnamese Localization)
- **Tiêu đề (Title)**: Dịch thoát ý tự nhiên, thuần Việt 100%, không ghép từ thô cứng kiểu máy dịch.
  - Ví dụ:
    - ❌ *Dịch máy thô*: `"Meta's new One subscriptions put a price on social media and AI"` ➔ `"Đăng ký One mới của Meta đặt giá trên mạng xã hội và AI"`
    - ✅ *Chuẩn Engineering*: `"Meta ra mắt gói thuê bao Meta One: Thu phí tính năng mạng xã hội nâng cao và AI"`
- **Tóm tắt (Summary)**: Câu văn rành mạch, chuẩn ngữ pháp tiếng Việt, giữ nguyên các thuật ngữ IT quốc tế đã trở thành tiêu chuẩn ngành.

---

## 2. Bảng Đối Sánh Thuật Ngữ Công Nghệ (Canonical IT Glossary)

Tuyệt đối tuân thủ bảng quy chuẩn xử lý thuật ngữ sau:

| Thuật ngữ gốc | Dịch sang Tiếng Việt | Dịch sang Tiếng Anh | Lưu ý đặc biệt |
| :--- | :--- | :--- | :--- |
| **Pipeline** | Pipeline / Quy trình tự động | Pipeline / Automation flow | Giữ nguyên "Pipeline" nếu trong ngữ cảnh CI/CD |
| **Microservices** | Kiến trúc vi dịch vụ | Microservices architecture | Giữ nguyên hoặc kèm giải nghĩa |
| **Container** | Container / Bộ chứa | Container | Không dịch thô thành "thùng chứa" |
| **Zero-copy** | Cơ chế Zero-copy | Zero-copy mechanism | Giữ nguyên thuật ngữ kỹ thuật lõi |
| **Cold start** | Khởi động nguội (Cold start) | Cold start latency | Hiện tượng trễ trong Serverless |
| **Benchmark** | Bài kiểm thử hiệu năng / Benchmark | Performance benchmark | Không dịch thành "điểm chuẩn" chung chung |
| **Vendor lock-in** | Ràng buộc nền tảng độc quyền | Vendor lock-in | Rủi ro phụ thuộc vào một nhà cung cấp cloud |
| **Memory footprint** | Mức tiêu thụ bộ nhớ RAM | Memory footprint | Dung lượng RAM tiến trình chiếm dụng |
| **Latency** | Độ trễ mạng / Độ trễ phản hồi | Latency / Response time | Không dịch là "thời gian trễ" mơ hồ |
| **Edge runtime** | Môi trường thực thi biên (Edge) | Edge runtime environment | Serverless tại CDN Edge nodes |

---

## 3. Công Thức Tóm Tắt 3 Điểm Vàng Kỹ Thuật (3-Tier Technical Takeaways)

Mỗi bản tin **BẮT BUỘC** phải có đúng 3 điểm tóm tắt, tương ứng 1-1 giữa 2 ngôn ngữ:

1. **Point 1 - Problem Statement / Core Context**:
   - 🇻🇳 *Bối cảnh, bản chất công nghệ hoặc thách thức thực tế được bài viết nêu ra.*
   - 🇺🇸 *The foundational problem, industry trigger, or emerging technical context.*
2. **Point 2 - Key Technology & Architectural Mechanism**:
   - 🇻🇳 *Chi tiết giải pháp kiến trúc, thuật toán, thông số kỹ thuật hoặc quy trình triển khai.*
   - 🇺🇸 *Specific architectural solutions, core algorithms, performance metrics, or mechanisms.*
3. **Point 3 - Practical Engineering Impact**:
   - 🇻🇳 *Bài học thực chiến, giá trị ứng dụng cho lập trình viên và tác động tới ngành IT.*
   - 🇺🇸 *Actionable takeaways, production lessons, and ecosystem impact for developers.*

---

## 4. Tiêu Chuẩn Kiểm Soát Chất Lượng Song Ngữ (Zero-Tolerance Checklist)

- [ ] **Zero Untranslated Headlines**: Không có bài viết nào mà `title_en` còn chứa dấu tiếng Việt hoặc `title_en === title_vi` (với tin gốc tiếng Việt).
- [ ] **Zero English Jargon in VI**: Chế độ Tiếng Việt (`VI`) không chứa các mảnh văn bản tiếng Anh chưa dịch vụn vặt (`documen.`, `is one of .`, `read more...`).
- [ ] **Pure Natural English in EN**: Chế độ Tiếng Anh (`EN`) phải hoàn toàn là câu tiếng Anh chuẩn, không còn sót bất kỳ từ tiếng Việt nào trong mảng `summary_en`.
- [ ] **Balanced Length**: Mỗi ý tóm tắt đạt độ dài lý tưởng 25 - 45 từ, đủ chiều sâu thông tin kỹ thuật, không dùng câu rỗng tuếch.
