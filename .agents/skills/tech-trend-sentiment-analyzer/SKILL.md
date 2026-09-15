---
name: tech-trend-sentiment-analyzer
description: >-
  Cung cấp quy trình, thuật toán và prompt templates chuẩn để phân tích chuyên sâu nội dung bài viết công nghệ, khai phá bình luận cộng đồng lập trình viên (Hacker News, Dev.to, Tinhte), dự báo xu hướng IT và tính điểm nóng (Hotness Score) động.
---

# Tech Trend & Sentiment Analyzer Skill

Skill này cung cấp phương pháp luận và các công cụ thực tiễn giúp phân tích sâu các bài viết công nghệ, phát hiện xu hướng công nghệ mới nổi (Emerging Tech Trends), phân tích tâm lý cộng đồng kỹ sư (Developer Sentiment) và xếp hạng mức độ thảo luận nóng (Hotness Velocity).

---

## 1. Kiến Trúc Phân Tích (Analysis Architecture)

```
[Nguồn bài viết / Bình luận RSS & API]
       │
       ▼
[Bộ Lọc Dữ Liệu IT & Chuẩn Hóa Văn Bản]
       │
       ├──► [Phân Tích Chiều Sâu Nội Dung] ──► Trích xuất vấn đề cốt lõi, công nghệ, kiến trúc
       │
       ├──► [Dự Báo Xu Hướng & Cụm Chủ Đề] ──► Nhóm công nghệ nổi bật, Technology Radar
       │
       ├──► [Khai Phá Bình Luận & Quan Điểm] ──► Sắc thái (Tích cực, Thận trọng, Phản đối), Rủi ro
       │
       ▼
[Thuật Toán Điểm Nóng Động - Dynamic Hotness Score]
```

---

## 2. Thuật Toán Tính Điểm Nóng Động (Dynamic Hotness Score)

Điểm nóng ($H$) từ 70 đến 99 được tính toán dựa trên khối lượng tương tác, tốc độ phản hồi và độ suy giảm theo thời gian (Time Decay):

```typescript
export function calculateDynamicHotScore(params: {
  upvotes: number;
  commentsCount: number;
  publishedAt: string;
  hasCodeOrBenchmark?: boolean;
}): number {
  const now = Date.now();
  const publishedTime = new Date(params.publishedAt).getTime();
  const ageInHours = Math.max(0.5, (now - publishedTime) / (1000 * 60 * 60));

  // 1. Interaction Volume Score (Trọng số: Comment x 2.5 vì thể hiện thảo luận sâu)
  const interactionVolume = params.upvotes + params.commentsCount * 2.5;

  // 2. Gravity Decay Factor (Công thức Hacker News Gravity)
  const gravity = 1.6;
  const velocityScore = interactionVolume / Math.pow(ageInHours + 2, gravity);

  // 3. Technical Depth Bonus
  const technicalBonus = params.hasCodeOrBenchmark ? 5 : 0;

  // 4. Chuẩn hóa về dải điểm 75 - 99
  const rawScore = 75 + Math.log2(Math.max(1, velocityScore * 10)) * 2.8 + technicalBonus;
  return Math.min(99, Math.max(75, Math.round(rawScore)));
}
```

---

## 3. Khai Phá Bình Luận & Sắc Thái Cộng Đồng (Developer Sentiment Mining)

Khi thu thập bài viết từ các nền tảng thảo luận (Hacker News, Dev.to, Tinhte, Reddit), phân tích bình luận theo 4 chiều:

1. **General Sentiment (Sắc thái chung)**: `enthusiastic` (Hào hứng), `skeptical` (Hoài nghi/thận trọng), `critical` (Chỉ trích/phản đối), `neutral` (Khách quan).
2. **Key Controversies (Tranh luận cốt lõi)**: Các câu hỏi về hiệu năng (Performance), bảo mật (Security), độ tin cậy khi chạy production, hoặc chi phí (Pricing/Vendor lock-in).
3. **Consensus (Sự đồng thuận của kỹ sư)**: Điểm chung mà đa số developers kỳ cựu đồng ý.
4. **Actionable Takeaways (Khuyến nghị thực thi)**: Có nên áp dụng vào dự án thực tế ngay bây giờ hay cần chờ đợi thêm.

---

## 4. System Prompt Phân Tích Xu Hướng & Tâm Lý Kỹ Sư

```text
Bạn là chuyên gia phân tích công nghệ trưởng (Lead Tech Analyst & Research Fellow).
Nhiệm vụ: Phân tích bài viết công nghệ và các thảo luận/bình luận đi kèm, trả về kết quả dưới dạng JSON:

1. Phân tích nội dung:
   - Bản chất công nghệ mới (What is genuinely new?)
   - Khác biệt so với các giải pháp hiện hành (Comparison vs Existing Tech)
   - Trade-offs & Limitations (Đánh đổi về bộ nhớ, CPU, chi phí, kiến trúc)

2. Phân tích xu hướng (Trend Identification):
   - Thuộc pha nào trong Technology Radar: "Adopt", "Trial", "Assess", "Hold"
   - Tiềm năng tác động ngắn hạn (3-6 tháng) và dài hạn (1-3 năm)

3. Phân tích bình luận & sắc thái cộng đồng:
   - Sentiment: "positive" | "skeptical" | "mixed" | "cautious"
   - Mối lo lớn nhất của lập trình viên (Developer concerns)
   - Điểm đồng thuận chính (Core consensus)

Định dạng JSON trả về:
{
  "trendAnalysis": {
    "radarStatus": "Trial",
    "marketImpact": "High",
    "targetAudience": ["Frontend Engineers", "DevOps", "Architects"]
  },
  "communitySentiment": {
    "overall": "skeptical",
    "topConcerns": ["Chi phí API cao", "Vendor lock-in"],
    "consensus": "Công nghệ hứa hẹn nhưng chưa sẵn sàng cho mission-critical production."
  },
  "keyTakeaways": [
    "Ý 1: Bản chất kỹ thuật...",
    "Ý 2: Kiến trúc và hiệu năng...",
    "Ý 3: Khuyến nghị triển khai..."
  ]
}
```

---

## 5. Quy Tắc Kiểm Soát Chất Lượng (Quality Checklist)

- [ ] **Không phỏng đoán chủ quan**: Mọi nhận định về sắc thái phải trích dẫn căn cứ cụ thể từ nội dung thảo luận thực tế.
- [ ] **Bám sát ngôn ngữ kỹ thuật**: Giữ nguyên các thuật ngữ cốt lõi (ví dụ: *memory footprint, zero-copy, latency, cold start, vector embeddings, fine-tuning*).
- [ ] **Cân bằng hai chiều**: Luôn chỉ ra ưu điểm kèm theo hạn chế/rủi ro kỹ thuật, không thiên vị một chiều.
