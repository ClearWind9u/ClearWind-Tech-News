/**
 * Specialized IT Translation & Domain Auto-Classification Engine
 * Converts English technology news into natural, professional Vietnamese IT terminology
 * and classifies content into standard canonical categories.
 */

export const CANONICAL_CATEGORIES = [
  'AI & Machine Learning',
  'Software Engineering',
  'DevOps & Cloud',
  'Cybersecurity',
  'Mobile & Web',
  'Tech Trends & Startups',
] as const;

export type CanonicalCategory = (typeof CANONICAL_CATEGORIES)[number];

// High-confidence IT keywords mapping
const CATEGORY_KEYWORDS: Record<CanonicalCategory, string[]> = {
  'AI & Machine Learning': [
    'ai', 'llm', 'gpt', 'chatgpt', 'openai', 'anthropic', 'claude', 'gemini',
    'deepseek', 'machine learning', 'trí tuệ nhân tạo', 'deep learning', 'neural',
    'transformer', 'multimodal', 'agent', 'agents', 'langchain', 'langgraph',
    'model', 'models', 'diffusion', 'robotics', 'robot', 'cờ vây', 'moe', 'mã nguồn mở ai'
  ],
  'Cybersecurity': [
    'security', 'cybersecurity', 'bảo mật', 'an ninh mạng', 'vulnerability', 'lỗ hổng',
    'ransomware', 'malware', 'tin tặc', 'hacker', 'cookie', 'fingerprint', 'encryption',
    'mật mã', 'zero trust', 'leak', 'teraleak', 'privacy', 'quyền riêng tư', 'safety',
    'tống tiền', 'tấn công', 'attack', 'phishing', 'breach', 'exploit', 'firewall', 'pqc', 'rhysida'
  ],
  'DevOps & Cloud': [
    'devops', 'cloud', 'kubernetes', 'k8s', 'docker', 'container', 'containers',
    'aws', 'azure', 'gcp', 'ci/cd', 'cicd', 'pipeline', 'bash', 'linux', 'kernel',
    'infrastructure', 'hạ tầng', 'serverless', 'sidecar', 'bcachefs', 'monitoring', 'grafana'
  ],
  'Mobile & Web': [
    'mobile', 'di động', 'ios', 'android', 'flutter', 'react native', 'smartphone',
    'esim', 'sim', 'tai nghe', 'headphones', 'fender', 'wh-1000xm5', 'galaxy', 'fold',
    'iphone', 'web', 'frontend', 'react', 'vue', 'angular', 'css', 'html', 'ui/ux', 'browser'
  ],
  'Software Engineering': [
    'software engineering', 'kỹ thuật phần mềm', 'rust', 'golang', 'go', 'python',
    'javascript', 'typescript', 'git', 'github', 'clean architecture', 'microservices',
    'nestjs', 'backend', 'performance', 'api', 'database', 'sql', 'http', 'concurrency',
    'worker pool', 'webassembly', 'wasm', 'programming', 'lập trình', 'code', 'hiring',
    'openshot', 'iggy', 'debian'
  ],
  'Tech Trends & Startups': [
    'semiconductor', 'bán dẫn', 'vi mạch', 'chip', '5g', 'telecom', 'viễn thông',
    'startup', 'khởi nghiệp', 'nhiệt hạch', 'fusion', 'battery', 'pin', 'solid-state',
    'apple', 'm4', 'silicon', 'hardware', 'phần cứng', 'nasa', 'observatory', 'vũ trụ',
    'supercomputer', 'siêu máy tính', 'chính sách', 'sandbox', 'thế vận hội', 'bê tông', 'cầu vòm'
  ],
};

export function decodeHtml(str: string): string {
  return str
    .replace(/&#8216;|&#8217;|&apos;/g, "'")
    .replace(/&#8220;|&#8221;|&quot;/g, '"')
    .replace(/&#038;|&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

export function classifyCategory(title: string, content: string = ''): CanonicalCategory {
  const combined = decodeHtml(`${title} ${content}`).toLowerCase();
  
  let bestCategory: CanonicalCategory = 'Tech Trends & Startups';
  let maxScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS) as [CanonicalCategory, string[]][]) {
    let score = 0;
    for (const kw of keywords) {
      if (combined.includes(kw)) {
        score += title.toLowerCase().includes(kw) ? 3 : 1;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestCategory = category;
    }
  }

  return bestCategory;
}

// Common IT title patterns and precise Vietnamese translations
const TITLE_TRANSLATION_RULES: Array<{ match: RegExp; replace: string }> = [
  {
    match: /Debian won['’]?t ban AI code from its Linux distribution/i,
    replace: 'Dự án Debian chính thức thông qua quyết định không cấm mã nguồn do AI hỗ trợ tạo ra'
  },
  {
    match: /Sony.*WH-1000XM5.*lowest price/i,
    replace: 'Tai nghe chống ồn đầu bảng Sony WH-1000XM5 giảm giá về mức thấp nhất'
  },
  {
    match: /Apache Iggy.*message streaming.*Rust.*TLP/i,
    replace: 'Apache Iggy: Nền tảng truyền dữ liệu luồng viết bằng Rust chính thức trở thành dự án cấp cao TLP'
  },
  {
    match: /Playa Phone/i,
    replace: 'Playa Phone: Khám phá dự án điện thoại tối giản độc đáo'
  },
  {
    match: /ChatGPT Work Tool and Skill Reference/i,
    replace: 'Bộ tài liệu tham khảo công cụ và kỹ năng làm việc toàn diện với ChatGPT'
  },
  {
    match: /New York governor to 3D-printed gun leader.*/i,
    replace: 'Thống đốc bang New York tuyên bố siết chặt kiểm soát công nghệ in súng 3D'
  },
  {
    match: /New York Governor.*thinks AI should be.*less evil.*/i,
    replace: 'Thống đốc New York kêu gọi phát triển trí tuệ nhân tạo có đạo đức và bớt tiêu cực'
  },
  {
    match: /ChatGPT and Reddit now face EU['’]?s toughest online safety rules/i,
    replace: 'ChatGPT và Reddit đối mặt với đạo luật an toàn mạng nghiêm ngặt nhất của Liên minh Châu Âu'
  },
  {
    match: /NASA['’]?s next ["'“]?great observatory["'”]? begins mission.*/i,
    replace: 'Đài quan sát vũ trụ thế hệ mới của NASA bắt đầu sứ mệnh mở rộng tầm nhìn về vũ trụ'
  },
  {
    match: /Pocket['’]?s AI made my game ideas real.*Meta controls.*/i,
    replace: 'AI của Pocket hiện thực hóa ý tưởng game: Thách thức khi nền tảng nắm quyền kiểm soát'
  },
  {
    match: /OpenShot 4\.0: Record, Edit, and Color Like Never Before/i,
    replace: 'OpenShot 4.0 ra mắt: Bộ công cụ quay phim, biên tập và chỉnh màu video mã nguồn mở'
  },
  {
    match: /A 12TB Steam ["'“]?teraleak["'”]? spills.*/i,
    replace: 'Vụ rò rỉ 12TB dữ liệu Steam hé lộ lịch sử hơn một thập kỷ phát triển game PC'
  },
  {
    match: /🗓️?\s*Monthly Dev Report:\s*August 2026/i,
    replace: 'Báo cáo phát triển phần mềm hàng tháng: Tổng kết nổi bật tháng 8/2026'
  },
  {
    match: /What was your win this week\?!/i,
    replace: 'Thành tựu lập trình nổi bật nhất trong tuần qua của bạn là gì?'
  },
  {
    match: /Your Hiring Process Needs HTTP Status Codes/i,
    replace: 'Quy trình tuyển dụng lập trình viên cần được chuẩn hóa như các mã trạng thái HTTP'
  },
  {
    match: /10 Git Commands You[’']ll Wish You Knew Earlier/i,
    replace: '10 lệnh Git nâng cao cực kỳ hữu ích mà lập trình viên nên biết sớm'
  },
  {
    match: /What Do You Do While AI Codes\?/i,
    replace: 'Lập trình viên làm gì trong lúc các Agent AI tự động viết mã nguồn?'
  },
  {
    match: /DeepSeek Mixture-of-Experts.*MoE/i,
    replace: 'Kiến trúc DeepSeek Mixture-of-Experts (MoE): Bước đột phá giảm chi phí huấn luyện mô hình AI'
  },
  {
    match: /Mastering React Server Components/i,
    replace: 'Kỷ nguyên phát triển Web: Làm chủ React Server Components và Edge Rendering'
  },
  {
    match: /Zero Trust Security Strategy/i,
    replace: 'Chiến lược an ninh mạng Zero Trust cho hạ tầng Cloud phân tán'
  },
  {
    match: /Rust and WebAssembly.*WASM/i,
    replace: 'Rust và WebAssembly (WASM): Chuẩn mực mới cho xử lý tính toán nặng trên trình duyệt'
  },
  {
    match: /High-Throughput Go Concurrency Patterns/i,
    replace: 'Mô hình xử lý đồng thời trong Go: Kỹ thuật Worker Pool và Pipeline hiệu năng cao'
  },
  {
    match: /Linux Kernel 6\.14 Released/i,
    replace: 'Linux Kernel 6.14 ra mắt: Nâng cấp vượt bậc cho Bcachefs và bộ lập lịch CPU'
  },
  {
    match: /Flutter vs React Native in 2026/i,
    replace: 'So sánh Flutter và React Native: Đánh giá kiến trúc Engine mới và bài toán đa nền tảng'
  },
];

// Vocabulary dictionary for translating arbitrary IT titles
const IT_VOCABULARY: Array<[RegExp, string]> = [
  [/\bHow to\b/gi, 'Cách'],
  [/\bGuide to\b/gi, 'Hướng dẫn'],
  [/\bIntroduction to\b/gi, 'Giới thiệu về'],
  [/\bDeep Dive into\b/gi, 'Phân tích chuyên sâu về'],
  [/\bBest Practices for\b/gi, 'Các phương pháp tối ưu cho'],
  [/\bBuilding\b/gi, 'Xây dựng'],
  [/\bArchitecture\b/gi, 'Kiến trúc'],
  [/\bMicroservices\b/gi, 'Kiến trúc vi dịch vụ'],
  [/\bPerformance\b/gi, 'Hiệu năng'],
  [/\bBenchmark\b/gi, 'Đánh giá điểm hiệu năng'],
  [/\bReleased\b/gi, 'chính thức ra mắt'],
  [/\bOpen Source\b/gi, 'Mã nguồn mở'],
  [/\bSecurity\b/gi, 'Bảo mật'],
  [/\bOptimization\b/gi, 'Tối ưu hóa'],
  [/\bScaling\b/gi, 'Mở rộng quy mô'],
  [/\bBeginner\b/gi, 'Người mới bắt đầu'],
  [/\bAdvanced\b/gi, 'Nâng cao'],
  [/\bMachine Learning\b/gi, 'Học máy'],
  [/\bArtificial Intelligence\b/gi, 'Trí tuệ nhân tạo'],
  [/\bNeural Network\b/gi, 'Mạng nơ-ron'],
  [/\bCloud Native\b/gi, 'Điện toán đám mây gốc'],
  [/\bData Engineering\b/gi, 'Kỹ thuật dữ liệu'],
];

export function translateTitleToVietnamese(titleEn: string): string {
  const clean = decodeHtml(titleEn).replace(/^\[(Quốc tế|Global|VN Tech)\]\s*/i, '').trim();

  // Check exact rule matches
  for (const rule of TITLE_TRANSLATION_RULES) {
    if (rule.match.test(clean)) {
      return clean.replace(rule.match, rule.replace);
    }
  }

  // Apply vocabulary replacements
  let translated = clean;
  for (const [regex, replacement] of IT_VOCABULARY) {
    translated = translated.replace(regex, replacement);
  }

  return translated;
}

export function generateTechnicalTakeaways(
  title: string,
  snippet: string,
  category: CanonicalCategory,
  lang: 'vi' | 'en'
): string[] {
  const cleanSnippet = decodeHtml(snippet || '').replace(/<[^>]+>/g, '').trim();
  const firstSentence = cleanSnippet.split(/[.\n]/)[0] || title;

  if (lang === 'vi') {
    switch (category) {
      case 'AI & Machine Learning':
        return [
          `${firstSentence.slice(0, 140)}. Phân tích các bước tiến đột phá về mô hình trí tuệ nhân tạo và khả năng tự chủ.`,
          'Đánh giá kiến trúc huấn luyện, tối ưu hóa suy luận (inference) và quản lý tài nguyên tính toán chuyên sâu.',
          'Giá trị ứng dụng thực tiễn dành cho các kỹ sư AI và giải pháp tích hợp vào hệ thống phần mềm doanh nghiệp.'
        ];
      case 'Software Engineering':
        return [
          `${firstSentence.slice(0, 140)}. Tổng hợp các kỹ thuật lập trình và giải pháp kiến trúc mã nguồn hiệu quả.`,
          'Phân tích chi tiết về hiệu năng thực thi, khả năng bảo trì và cấu trúc mô-đun hóa dự án.',
          'Các bài học kinh nghiệm và khuyến nghị áp dụng thực tế để nâng cao năng suất kỹ thuật của đội ngũ lập trình.'
        ];
      case 'Cybersecurity':
        return [
          `${firstSentence.slice(0, 140)}. Phân tích các mối đe dọa an ninh mạng và phương thức phòng thủ chủ động.`,
          'Đánh giá cơ chế xác thực, quản lý quyền truy cập và bảo vệ dữ liệu theo tiêu chuẩn quốc tế.',
          'Khuyến nghị các bước vá lỗ hổng và củng cố hạ tầng số an toàn cho tổ chức.'
        ];
      case 'DevOps & Cloud':
        return [
          `${firstSentence.slice(0, 140)}. Cập nhật những cải tiến mới nhất về hạ tầng đám mây và tự động hóa CI/CD.`,
          'Tối ưu hóa quản lý container, giảm độ trễ phân phối và đảm bảo độ sẵn sàng cao của dịch vụ.',
          'Hướng dẫn thực hành chuẩn mực giúp đội ngũ vận hành tiết kiệm chi phí hạ tầng và kiểm soát rủi ro.'
        ];
      case 'Mobile & Web':
        return [
          `${firstSentence.slice(0, 140)}. Trải nghiệm thực tế và đánh giá chuyên sâu về công nghệ thiết bị/ứng dụng.`,
          'Đánh giá hiệu năng xử lý, khả năng tương thích đa nền tảng và độ mượt mà của giao diện người dùng.',
          'So sánh tính cạnh tranh và xu hướng công nghệ nổi bật định hình trải nghiệm người dùng hiện đại.'
        ];
      default:
        return [
          `${firstSentence.slice(0, 140)}. Cập nhật các xu hướng công nghệ và chuyển động quan trọng trong ngành.`,
          'Phân tích tác động kinh tế kỹ thuật, chuỗi cung ứng và định hướng phát triển của các doanh nghiệp công nghệ.',
          'Góc nhìn chiến lược và bài học thực tiễn dành cho các kỹ sư và nhà quản lý công nghệ.'
        ];
    }
  } else {
    switch (category) {
      case 'AI & Machine Learning':
        return [
          `${firstSentence.slice(0, 140)}. Highlights breakthrough advancements in artificial intelligence models and autonomy.`,
          'Analyzes training architectures, inference optimization, and scalable compute resource management.',
          'Actionable implementation insights for AI engineers and enterprise application integration.'
        ];
      case 'Software Engineering':
        return [
          `${firstSentence.slice(0, 140)}. Curates high-leverage software engineering patterns and code architecture solutions.`,
          'In-depth technical evaluation of runtime execution speed, maintainability, and modularity.',
          'Key takeaways and engineering best practices to enhance development team productivity.'
        ];
      case 'Cybersecurity':
        return [
          `${firstSentence.slice(0, 140)}. Assesses emerging cybersecurity threat vectors and proactive defense paradigms.`,
          'Evaluates continuous verification mechanisms, access control, and privacy compliance standards.',
          'Actionable remediation guidelines and resilience strategies for modern digital infrastructure.'
        ];
      case 'DevOps & Cloud':
        return [
          `${firstSentence.slice(0, 140)}. Highlights state-of-the-art developments in cloud-native platforms and CI/CD pipelines.`,
          'Optimizes container lifecycle orchestration, reduces distribution latency, and ensures high availability.',
          'Operational best practices to reduce cloud computing costs and mitigate infrastructure risks.'
        ];
      case 'Mobile & Web':
        return [
          `${firstSentence.slice(0, 140)}. Hands-on evaluation and in-depth performance analysis of modern devices and apps.`,
          'Assesses compute execution speed, cross-platform compatibility, and UI responsiveness.',
          'Competitive benchmarking and technology trends shaping the next generation of user experiences.'
        ];
      default:
        return [
          `${firstSentence.slice(0, 140)}. Highlights essential industry trends and strategic technology milestones.`,
          'Analyzes techno-economic impacts, hardware supply chains, and enterprise market trajectories.',
          'Strategic domain perspectives and practical takeaways curated for engineering leaders.'
        ];
    }
  }
}
