---
name: speech-synthesis-and-audio-digest
description: >-
  Chuẩn mực phân tích, chuẩn hóa văn bản kỹ thuật IT và tổng hợp giọng nói (Text-to-Speech / Web Speech API) song ngữ Việt - Anh, xử lý phiên âm thuật ngữ lập trình, nhịp điệu ngắt nghỉ tự nhiên và kiến trúc điều khiển audio client-side 0đ.
---

# Speech Synthesis & Audio Digest Guidelines (Chuẩn Mực Đọc Tin Tức IT Bằng Giọng Nói)

Kỹ năng này định nghĩa các quy tắc chuẩn hóa văn bản, xử lý ngữ âm thuật ngữ IT chuyên ngành và hệ thống tổng hợp giọng nói "Chị Google" (Google Translate TTS & Web Speech API) song ngữ Việt - Anh, kế thừa các ưu điểm từ các nền tảng AI Audio hàng đầu (**OpenAI Speech Skill, ElevenLabs, Vbee AI, Murf AI, Narakeet, Speechify**) phục vụ tính năng "Nghe tóm tắt tin tức" (Audio Digest) cho dự án ClearWind Tech News.

---

## 1. Nghiên Cứu Thực Chứng & Chuẩn Mực Giọng Đọc "Chị Google"

Người dùng Việt Nam đã quá quen thuộc với chất giọng **"Chị Google" (Google Translate TTS)**: phát âm tròn vành rõ chữ, ngữ điệu điềm tĩnh, chuẩn xác về dấu thanh và không bị méo âm.

| Tiêu chí | Web Speech API Mặc Định Trên Windows | Động cơ "Chị Google" (Google Translate TTS Streaming) |
|---|---|---|
| **Độ chân thực** | Thường thiếu gói giọng Việt trên Windows dẫn đến việc máy dùng voice tiếng Anh đọc tiếng Việt méo mó, rất lạ. | Chuẩn 100% giọng "Chị Google" quen thuộc, truyền cảm, tự nhiên. |
| **Độ bao phủ** | Phụ thuộc vào OS/thiết bị người dùng. | Hoạt động 100% trên mọi trình duyệt (Chrome, Safari, Edge, Firefox, iOS, Android). |
| **Chi phí** | 0đ | 0đ (Free Tier không giới hạn). |
| **Độ trễ** | Tức thời | Streaming chunk mượt mà qua `/api/tts`. |

---

## 2. Quy Chuẩn Chỉ Dẫn Giọng Nói (Theo Chuẩn OpenAI Speech Skill)

Lấy cảm hứng từ cấu trúc chuẩn của OpenAI Speech Skill (`openai/skills --skill speech`), giọng đọc của ClearWind Tech News được định hình theo khuôn mẫu:

```yaml
Voice Character: Chị Google (Google Translate Vietnamese & English)
Voice Affect: Người dẫn bản tin công nghệ điềm tĩnh, chuyên nghiệp, truyền cảm.
Tone: Thân thiện, tự tin, rành mạch từng thuật ngữ kỹ thuật.
Pacing: Nhịp độ vừa phải (Steady, Rate 1.0), nghỉ thở tự nhiên giữa các câu.
Pronunciation: Giữ nguyên vẹn từ mượn IT tiếng Anh (Docker, Python, Next.js, GitHub), chỉ tách rời các chữ viết tắt đặc thù (A I, A P I, U I, U X).
Delivery: Ngắt nhịp theo từng Takeaway độc lập (#1, #2, #3), đồng bộ Active Visual Highlight trên giao diện web.
```

---

## 3. Quy Tắc Chuẩn Hóa Văn Bản Kỹ Thuật (Clean Normalization)

> [!CAUTION]
> **CẤM TUYỆT ĐỐI** việc phiên âm thô lậu từ tiếng Anh sang tiếng Việt (như đổi `Docker` thành `Đốc-cơ`, `TypeScript` thành `Táp-sờ-cờ-ríp`, `Python` thành `Pai-thơn`, `Claude` thành `C-lốt`). Giọng "Chị Google" đọc các từ tiếng Anh chuẩn quốc tế cực kỳ tự nhiên. Việc gượng ép phiên âm sai lệch sẽ khiến giọng đọc trở nên kệch cỡm và kỳ lạ.

### A. Từ điển chỉ mở rộng các chữ viết tắt dễ bị đọc nhầm

| Thuật ngữ | Xử lý trong Tiếng Việt | Lý do kỹ thuật |
|---|---|---|
| **AI / A.I** | `A I` hoặc `Trí tuệ nhân tạo` | Tránh đọc dính thành từ "ai" trong tiếng Việt |
| **API / APIs** | `A P I` | Tránh đọc thành "a-pi" |
| **AWS / GCP** | `A W S` / `G C P` | Đọc rõ từng chữ cái viết tắt |
| **UI/UX** | `U I, U X` | Thay dấu gạch chéo `/` thành khoảng dừng |
| **CI/CD** | `C I, C D` | Tách rời hai phân đoạn quy trình |
| **LLM / LLMs** | `L L M` | Đọc rõ 3 chữ cái |
| **K8s** | `Kubernetes` | Đọc đúng từ gốc Kubernetes |
| **24/7** | `hai mươi bốn trên bảy` | Diễn giải số đo thời gian tự nhiên |
| **v1.5 / v2.0** | `phiên bản 1 chấm 5` | Diễn giải phiên bản phần mềm |

### B. Chuẩn hóa số đo và tiền tệ

- `$([0-9]+)B` -> `tỷ đô la` (ví dụ: `$10B` -> `10 tỷ đô la`)
- `$([0-9]+)M` -> `triệu đô la` (ví dụ: `$100M` -> `100 triệu đô la`)
- `$([0-9]+)K` -> `nghìn đô la`
- `$([0-9]+)` -> `đô la`
- `([0-9]+)%` -> `phần trăm`

---

## 4. Kiến Trúc Phát Âm Thanh Kết Hợp (Dual-Engine Architecture)

1. **Động cơ Chính (Primary)**:
   - Endpoint: `/api/tts?text=...&lang=vi`
   - Kỹ thuật: Proxy trực tiếp âm thanh MP3 từ Google Translate TTS streaming.
   - Cơ chế: Phân tách văn bản bài viết thành các phân đoạn (Intro, từng Takeaway #1, #2, #3, Outro) với độ dài mỗi đoạn `< 180 ký tự` để đảm bảo Google phát thanh trọn vẹn không bị cắt câu.
2. **Động cơ Dự Phòng (Fallback)**:
   - Sử dụng `window.speechSynthesis` nếu gặp trường hợp mất mạng hoặc trình duyệt chặn audio tự động.
3. **Điều khiển Tương Tác**:
   - Nút **Nghe tóm tắt** (Headphones)
   - Nút **Tạm dừng / Tiếp tục** (Play/Pause)
   - Nút **Dừng hẳn** (Square)
   - Chỉnh tốc độ đọc: `1x` -> `1.25x` -> `1.5x`
   - Active Visual Highlight: Khi giọng đọc phát đến Takeaway nào, Takeaway đó sẽ sáng viền ngọc lục bảo trên modal.
   - Hủy âm thanh ngay lập tức khi đóng modal, đổi ngôn ngữ hoặc chuyển bài viết.
