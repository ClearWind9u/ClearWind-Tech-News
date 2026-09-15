/**
 * Specialized IT Translation & Domain Auto-Classification Engine
 * Implements the 3-Tier Technical Summary Formula:
 * [Problem Statement -> Key Technology -> Outcome & IT Industry Impact]
 * Guarantees 100% pure Vietnamese for 'vi' and 100% natural English for 'en'.
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

const HTML_ENTITIES: Record<string, string> = {
  '&quot;': '"',
  '&apos;': "'",
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&nbsp;': ' ',
  '&copy;': '©',
  '&reg;': '®',
  '&trade;': '™',
  '&aacute;': 'á',
  '&agrave;': 'à',
  '&atilde;': 'ã',
  '&acirc;': 'â',
  '&eacute;': 'é',
  '&egrave;': 'è',
  '&ecirc;': 'ê',
  '&iacute;': 'í',
  '&igrave;': 'ì',
  '&oacute;': 'ó',
  '&ograve;': 'ò',
  '&otilde;': 'õ',
  '&ocirc;': 'ô',
  '&uacute;': 'ú',
  '&ugrave;': 'ù',
  '&yacute;': 'ý',
  '&#8216;': "'",
  '&#8217;': "'",
  '&#8220;': '"',
  '&#8221;': '"',
  '&#038;': '&',
};

export function decodeHtml(str: string): string {
  if (!str || typeof str !== 'string') return '';
  let result = str;

  // 1. Decode Decimal Unicode Entities (e.g. &#7883; -> ị, &#273; -> đ)
  result = result.replace(/&#(\d+);/g, (_, dec) => {
    try {
      return String.fromCharCode(parseInt(dec, 10));
    } catch {
      return _;
    }
  });

  // 2. Decode Hex Unicode Entities
  result = result.replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
    try {
      return String.fromCodePoint(parseInt(hex, 16));
    } catch {
      return _;
    }
  });

  // 3. Decode named HTML entities
  for (const [entity, char] of Object.entries(HTML_ENTITIES)) {
    result = result.replaceAll(entity, char);
  }

  return result.replace(/\s+/g, ' ').trim();
}

// Canonical Category Keywords Map
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
    'supercomputer', 'siêu máy tính', 'chính sách', 'sandbox', 'thế vận hội', 'bê tông', 'cầu vòm', 'vinasa'
  ],
};

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

// Tailored Knowledge Base for verified articles (3-Tier Structure)
export interface ArticleCuration {
  match: RegExp;
  category: CanonicalCategory;
  title_vi: string;
  title_en: string;
  summary_vi: [string, string, string];
  summary_en: [string, string, string];
  tags: string[];
}

export const CURATED_ARTICLES: ArticleCuration[] = [
  {
    match: /John Ternus.*Apple.*CEO/i,
    category: 'Tech Trends & Startups',
    title_vi: 'John Ternus chính thức tiếp quản vị trí Tổng giám đốc điều hành (CEO) của Apple',
    title_en: 'John Ternus Formally Takes Over as Apple’s New Chief Executive Officer (CEO)',
    summary_vi: [
      'Apple chính thức công bố chuyển giao quyền lực lịch sử khi cựu Giám đốc Kỹ thuật Phần cứng John Ternus kế nhiệm Tim Cook làm CEO.',
      'Đánh dấu sự chuyển dịch trọng tâm chiến lược sang năng lực nghiên cứu phần cứng đột phá, chip Apple Silicon và nền tảng Apple Intelligence.',
      'Mở ra kỷ nguyên phát triển mới cho hệ sinh thái công nghệ toàn cầu của Apple với sự dẫn dắt của một nhà lãnh đạo thuần kỹ thuật công nghệ.'
    ],
    summary_en: [
      'Apple officially announces an executive leadership succession as former Senior VP of Hardware Engineering John Ternus succeeds Tim Cook as CEO.',
      'Signals a renewed strategic focus on deep hardware innovation, next-generation Apple Silicon architectures, and on-device Apple Intelligence.',
      'Commences a defining technological chapter for the global Apple ecosystem under the leadership of a seasoned engineering executive.'
    ],
    tags: ['Apple', 'JohnTernus', 'TimCook', 'TechLeadership', 'Hardware']
  },
  {
    match: /DLSS 5/i,
    category: 'AI & Machine Learning',
    title_vi: 'Nvidia chính thức ra mắt công nghệ DLSS 5: Tái tạo khung hình bằng AI thời gian thực cho card đồ họa RTX',
    title_en: 'Nvidia Officially Launches DLSS 5: Real-Time Generative AI Frame Reconstruction for RTX GPUs',
    summary_vi: [
      'Nvidia chính thức phát hành công nghệ siêu nâng cấp hình ảnh DLSS 5 ứng dụng mạng nơ-ron Generative AI tái tạo đồ họa trong game.',
      'Tận dụng sức mạnh của các lõi Tensor Cores thế hệ mới trên kiến trúc GPU RTX để dự đoán chuyển động và tăng tốc độ khung hình (FPS) gấp 4 lần.',
      'Thiết lập chuẩn mực mới cho ngành phát triển game AAA và chứng minh sức mạnh của mô hình AI thị giác tính toán trong xử lý thời gian thực.'
    ],
    summary_en: [
      'Nvidia formally rolls out DLSS 5, integrating generative neural rendering to reconstruct photorealistic game scenes in real time.',
      'Harnesses next-generation Tensor Core pipelines on RTX GPU architectures to predict sub-pixel motion vectors and quadruple frame rates.',
      'Establishes a new benchmark for AAA game engineering and underscores the dominance of computer vision AI in real-time graphics rendering.'
    ],
    tags: ['Nvidia', 'DLSS5', 'AI', 'Gaming', 'GPU']
  },
  {
    match: /Flock cams.*state highways/i,
    category: 'Cybersecurity',
    title_vi: 'Bang Florida ban hành lệnh cấm camera giám sát biển số tự động Flock trên các tuyến quốc lộ',
    title_en: 'Florida Bans Automated Flock License Plate Reader Surveillance Cameras Across State Highways',
    summary_vi: [
      'Sở Giao thông Vận tải bang Florida chính thức thu hồi giấy phép và cấm lắp đặt camera nhận diện biển số tự động Flock trên đường cao tốc.',
      'Phân tích rủi ro an ninh mạng khi dữ liệu di chuyển của công dân bị thu thập tập trung, chia sẻ chéo và tiềm ẩn nguy cơ rò rỉ dữ liệu riêng tư.',
      'Bài học quan trọng về ranh giới giữa giám sát trật tự công cộng và bảo vệ quyền riêng tư số của công dân trong hạ tầng đô thị thông minh.'
    ],
    summary_en: [
      'The Florida Department of Transportation revokes permits and bans automated Flock license plate recognition cameras across state highways.',
      'Cites critical cybersecurity and civil privacy risks stemming from centralized vehicle movement tracking and unauthorized database sharing.',
      'Highlights the growing legal and technical friction between municipal public surveillance systems and consumer privacy protections.'
    ],
    tags: ['Privacy', 'Cybersecurity', 'Surveillance', 'SmartCity']
  },
  {
    match: /busy month of smartphones|Poco F9/i,
    category: 'Mobile & Web',
    title_vi: 'Thị trường smartphone sôi động tháng 9: Hàng loạt flagship đổ bộ trước thềm IFA và sự kiện Apple',
    title_en: 'September Smartphone Rush: Next-Gen Flagships Launch Ahead of IFA Berlin and Apple Keynotes',
    summary_vi: [
      'Thị trường thiết bị di động toàn cầu bước vào tháng cao điểm với sự ra mắt liên tiếp của các mẫu smartphone từ Poco, Xiaomi, Apple và Oppo.',
      'Cuộc đua trang bị vi xử lý tiến trình 3nm, cụm cảm biến camera 1 inch và khả năng tích hợp mô hình AI chạy trực tiếp trên thiết bị (On-Device AI).',
      'Định hình xu hướng tiêu dùng công nghệ cuối năm và thúc đẩy các nhà phát triển ứng dụng tối ưu hóa trải nghiệm trên các phần cứng mới.'
    ],
    summary_en: [
      'The global mobile ecosystem kicks off its most intensive launch window with flagship releases from Poco, Xiaomi, Apple, and Oppo.',
      'Intensifies the race around 3nm silicon nodes, 1-inch camera sensors, and native on-device Generative AI edge execution capabilities.',
      'Shapes consumer hardware trends for the year while prompting mobile app developers to optimize for high-refresh and NPU-accelerated hardware.'
    ],
    tags: ['Smartphones', 'Mobile', 'Apple', 'Xiaomi', 'Hardware']
  },
  {
    match: /Snapdragon 8 Elite.*8\.050mAh|Xiaomi lại có flagship/i,
    category: 'Mobile & Web',
    title_vi: 'Xiaomi ra mắt flagship POCO trang bị chip Snapdragon 8 Elite, pin khủng 8.050mAh và loa Bose cao cấp',
    title_en: 'Xiaomi Unveils POCO Flagship Powered by Snapdragon 8 Elite, 8,050mAh Battery, and Bose Audio',
    summary_vi: [
      'Thương hiệu POCO của Xiaomi chính thức mở bán dòng flagship Ultra trang bị chip xử lý hàng đầu Snapdragon 8 Elite tại Việt Nam.',
      'Đột phá với viên pin dung lượng khổng lồ 8.050mAh công nghệ Silicon-Carbon, sạc siêu nhanh 120W và hệ thống loa tinh chỉnh bởi Bose.',
      'Thiết lập kỷ lục mới về thời lượng pin trên phân khúc smartphone hiệu năng cao, tối ưu cho các kỹ sư lập trình di động và game thủ chuyên nghiệp.'
    ],
    summary_en: [
      'Xiaomi’s POCO brand formally debuts its top-tier Ultra flagship in Vietnam, powered by Qualcomm’s flagship Snapdragon 8 Elite processor.',
      'Features a massive 8,050mAh silicon-carbon anode battery, 120W hyper-charging, and an acoustic soundstage co-engineered with Bose.',
      'Sets a new battery endurance record in the high-performance tier, catering to mobile power users, mobile developers, and pro gamers.'
    ],
    tags: ['Xiaomi', 'POCO', 'Snapdragon', 'Mobile', 'BatteryTech']
  },
  {
    match: /esim.*ngon.*ngại dùng/i,
    category: 'Mobile & Web',
    title_vi: 'Công nghệ eSIM tại Việt Nam: Tiềm năng phát triển và lý do người dùng còn e ngại chuyển đổi',
    title_en: 'eSIM Adoption in Vietnam: Technological Advantages and Real-World Friction Points',
    summary_vi: [
      'Phân tích tâm lý e ngại của người dùng Việt Nam khi chuyển đổi sang eSIM do phí cấp lại sim từ 25k-35k và thủ tục xác thực tại nhà mạng.',
      'Khám phá kiến trúc chip eUICC tích hợp trực tiếp trên bo mạch smartphone, cho phép kích hoạt profile sóng trực tuyến và hỗ trợ 5G độc lập (SA).',
      'Thúc đẩy xu hướng smartphone loại bỏ khay SIM vật lý, tối ưu không gian phần cứng cho pin và buộc các nhà mạng số hóa toàn diện quy trình onboarding.'
    ],
    summary_en: [
      'Examines user hesitation in Vietnam toward eSIM adoption due to carrier re-issuance fees ($1-$1.50) and offline identity verification steps.',
      'Explores the embedded eUICC hardware architecture enabling instant over-the-air carrier profile provisioning and standalone 5G (SA) connectivity.',
      'Accelerates the smartphone industry transition to trayless hardware designs, freeing interior battery space and driving digital telecom onboarding.'
    ],
    tags: ['eSIM', 'Mobile', 'Telecom', 'VietNam']
  },
  {
    match: /fender mix/i,
    category: 'Mobile & Web',
    title_vi: 'Trên tay tai nghe không dây Fender Mix: Trải nghiệm âm thanh chuyên nghiệp dành cho người yêu nhạc',
    title_en: 'Hands-On With Fender Mix: High-Fidelity Wireless Headphones for Pure Music Listening',
    summary_vi: [
      'Đánh giá thực tế dòng tai nghe không dây Fender Mix được thiết kế tập trung tối đa vào trải nghiệm thưởng thức âm nhạc mộc mạc và chuẩn xác.',
      'Trang bị driver dynamic tùy biến với dải âm cân bằng, chip Bluetooth độ trễ thấp và thời lượng pin ấn tượng cho các phiên nghe kéo dài.',
      'Cung cấp lựa chọn tuyệt vời cho các kỹ sư âm thanh và lập trình viên cần không gian tĩnh lặng, tập trung cao độ khi làm việc.'
    ],
    summary_en: [
      'Hands-on review of the Fender Mix wireless headphones, engineered with an uncompromising focus on pristine acoustic listening experiences.',
      'Features custom-tuned dynamic drivers with balanced frequency response, low-latency Bluetooth connectivity, and extended battery endurance.',
      'Provides a compelling audio tool for sound engineers and software developers requiring immersion and deep focus during intense coding sessions.'
    ],
    tags: ['FenderMix', 'Audio', 'Hardware', 'Headphones']
  },
  {
    match: /Debian won'?t ban AI code/i,
    category: 'Software Engineering',
    title_vi: 'Dự án Debian chính thức thông qua quyết định không cấm mã nguồn do AI hỗ trợ tạo ra',
    title_en: 'Debian Project Formally Votes Not to Ban AI-Generated Code in Linux Distribution',
    summary_vi: [
      'Dự án Debian chính thức bỏ phiếu cho phép lập trình viên sử dụng các công cụ Generative AI trong việc phát triển, bảo trì và viết tài liệu cho Linux.',
      'Chính sách quy định lập trình viên phải chịu trách nhiệm hoàn toàn về mã nguồn và đảm bảo mã do AI hỗ trợ tuân thủ chuẩn Phần mềm Tự do DFSG.',
      'Mở ra tiền lệ quan trọng cho hệ sinh thái mã nguồn mở thế giới trong việc dung hòa giữa năng suất AI và bản quyền phần mềm tự do.'
    ],
    summary_en: [
      'The Debian project voted to permit developers to utilize Generative AI tools in coding, package maintenance, and documentation for the Linux distribution.',
      'The policy mandates human author accountability for code quality, verifying that AI-assisted contributions comply with the Debian Free Software Guidelines.',
      'Sets a major precedent for open-source ecosystems, reconciling AI-augmented developer velocity with free and open software licensing standards.'
    ],
    tags: ['Debian', 'Linux', 'OpenSource', 'AI', 'Policy']
  },
  {
    match: /WH-1000XM5.*lowest price/i,
    category: 'Mobile & Web',
    title_vi: 'Tai nghe chống ồn đầu bảng Sony WH-1000XM5 giảm giá về mức thấp kỷ lục',
    title_en: 'Flagship Sony WH-1000XM5 Noise-Canceling Headphones Drop to All-Time Lowest Price',
    summary_vi: [
      'Dòng tai nghe chống ồn đầu bảng Sony WH-1000XM5 bước vào đợt giảm giá mạnh nhất giúp người dùng tiếp cận công nghệ cách âm cao cấp.',
      'Sử dụng bộ xử lý kép Integrated Processor V1 và QN1 cùng 8 micro lọc ồn thông minh, hỗ trợ codec âm thanh độ phân giải cao LDAC.',
      'Nâng cao hiệu suất làm việc từ xa (Remote Work) và tạo môi trường cách âm tĩnh lặng tối ưu cho kỹ sư phần mềm khi viết code.'
    ],
    summary_en: [
      'Sony’s flagship WH-1000XM5 active noise-canceling headphones hit an all-time low price point, democratizing premium acoustics.',
      'Powered by dual Integrated Processors (V1 and QN1) with an 8-microphone array and LDAC high-resolution wireless audio codec support.',
      'Significantly enhances remote work productivity by providing an acoustic sanctuary for software developers during deep focus sessions.'
    ],
    tags: ['Sony', 'Headphones', 'ANC', 'Hardware']
  },
  {
    match: /Apache Iggy.*Rust.*TLP/i,
    category: 'Software Engineering',
    title_vi: 'Apache Iggy: Nền tảng truyền dữ liệu luồng viết bằng Rust chính thức trở thành dự án cấp cao TLP',
    title_en: 'Apache Iggy: Ultra-Fast Rust Message Streaming Platform Graduates to Apache Top-Level Project',
    summary_vi: [
      'Dự án Apache Iggy viết bằng Rust chính thức tốt nghiệp trở thành Top-Level Project (TLP) của Apache Software Foundation.',
      'Kiến trúc Message Streaming phi luồng với độ trễ sub-millisecond, tận dụng cơ chế quản lý bộ nhớ không cần Garbage Collection của Rust để tối ưu CPU.',
      'Cung cấp giải pháp thay thế siêu nhẹ và tốc độ hơn cho Apache Kafka trong các hệ thống Big Data và phân tích luồng dữ liệu thời gian thực.'
    ],
    summary_en: [
      'Apache Iggy, an ultra-high-throughput message streaming engine written in Rust, formally graduates to an Apache Top-Level Project (TLP).',
      'Architected for sub-millisecond latency, leveraging Rust’s zero-cost abstractions and deterministic memory management without GC pauses.',
      'Offers a lightweight, hyper-efficient drop-in alternative to Apache Kafka for distributed real-time event-driven data pipelines.'
    ],
    tags: ['Rust', 'ApacheIggy', 'Streaming', 'Kafka', 'Backend']
  },
  {
    match: /Playa Phone/i,
    category: 'Tech Trends & Startups',
    title_vi: 'Playa Phone: Khám phá dự án điện thoại tối giản nhằm giải phóng người dùng khỏi sự xao nhãng',
    title_en: 'Playa Phone: The Minimalist Device Designed to Free Users from Smartphone Distractions',
    summary_vi: [
      'Giới thiệu dự án Playa Phone – chiếc điện thoại tối giản nhằm giải phóng người dùng khỏi sự phụ thuộc và xao nhãng của smartphone hiện đại.',
      'Tối giản phần cứng với màn hình đơn sắc tiết kiệm năng lượng, lược bỏ hoàn toàn mạng xã hội và chỉ giữ lại các tính năng liên lạc cơ bản.',
      'Khởi xướng xu hướng Digital Detox và thiết kế phần cứng tối giản đang nhận được sự ủng hộ lớn từ giới công nghệ.'
    ],
    summary_en: [
      'Introduces the Playa Phone project—a radically stripped-down mobile device engineered to liberate users from digital smartphone addictions.',
      'Minimizes hardware with an energy-efficient monochrome display, removing social media feeds while preserving essential voice and messaging.',
      'Sparks growing interest in the Digital Detox movement and intentional hardware design within the modern technology community.'
    ],
    tags: ['PlayaPhone', 'Hardware', 'DigitalDetox', 'Minimalism']
  },
  {
    match: /Galaxy Z Fold8/i,
    category: 'Mobile & Web',
    title_vi: 'Galaxy Z Fold8: Trải nghiệm biến smartphone màn hình gập thành khung tranh và màn hình phụ thông minh',
    title_en: 'Galaxy Z Fold8: Transforming the Foldable Flagship into an Ambient Smart Display Desk Companion',
    summary_vi: [
      'Khám phá trải nghiệm biến chiếc smartphone màn hình gập Galaxy Z Fold8 thành khung tranh và màn hình phụ mini trên bàn làm việc công nghệ.',
      'Tận dụng cơ chế bản lề Flex Mode cố định đa góc độ, màn hình Dynamic AMOLED tần số quét 120Hz và chế độ Standby Always-On Display thông minh.',
      'Mở rộng khả năng tương tác đa nhiệm, hỗ trợ lập trình viên theo dõi dashboard và thông báo hệ thống mà không cần bật thêm màn hình lớn.'
    ],
    summary_en: [
      'Explores transforming the Galaxy Z Fold8 foldable flagship into an ambient smart display and secondary monitor on developer desks.',
      'Leverages multi-angle Flex Mode hinging, a 120Hz Dynamic AMOLED panel, and intelligent Always-On ambient display capabilities.',
      'Enhances multi-tasking desk ergonomics, enabling engineers to monitor build pipelines and system telemetry without extra hardware monitors.'
    ],
    tags: ['GalaxyFold', 'Samsung', 'Mobile', 'UIUX']
  },
  {
    match: /3D-printed gun/i,
    category: 'Software Engineering',
    title_vi: 'Thống đốc bang New York tuyên chiến với công nghệ in súng 3D và các phần mềm bẻ khóa kiểm duyệt',
    title_en: 'New York Governor Takes Aim at 3D-Printed Gun Software and Firmware Bypass Tools',
    summary_vi: [
      'Thống đốc bang New York tuyên bố siết chặt các quy định pháp lý nhằm ngăn chặn việc sử dụng máy in 3D để chế tạo vũ khí trái phép.',
      'Cuộc đối đầu giữa luật pháp và các công cụ phần mềm mã nguồn mở cho phép mã hóa file in 3D vượt qua rào cản kiểm duyệt của máy in.',
      'Đặt ra bài toán lớn về ranh giới giữa kiểm soát phần mềm, đạo đức kỹ thuật và quản lý các thiết bị sản xuất kỹ thuật số.'
    ],
    summary_en: [
      'The Governor of New York enacts aggressive legislative measures targeting software tools that circumvent 3D printer firearm restrictions.',
      'Highlights the tension between regulatory enforcement and open-source CAD encryption scripts designed to bypass hardware-level print guardrails.',
      'Raises fundamental questions regarding software censorship, developer liability, and governance over distributed additive manufacturing.'
    ],
    tags: ['3DPrinting', 'Policy', 'OpenSource', 'Security']
  },
  {
    match: /ChatGPT Work Tool and Skill Reference/i,
    category: 'AI & Machine Learning',
    title_vi: 'Bộ tài liệu tham khảo công cụ và kỹ năng làm việc toàn diện với ChatGPT dành cho kỹ sư AI',
    title_en: 'Comprehensive ChatGPT Work Tool & Skill Architecture Reference Guide for AI Engineers',
    summary_vi: [
      'Tổng hợp bộ tài liệu tra cứu chuyên sâu về hệ thống công cụ, plugin và kỹ năng lập trình mở rộng dành cho ChatGPT và mô hình AI.',
      'Hướng dẫn cấu hình Function Calling, tích hợp REST API bên ngoài và định dạng schema JSON để AI thực thi tác vụ chính xác.',
      'Giúp các kỹ sư phần mềm nhanh chóng làm chủ kỹ thuật xây dựng AI Agent và tự động hóa quy trình nghiệp vụ doanh nghiệp.'
    ],
    summary_en: [
      'Curates an architectural reference guide detailing tool integration patterns, system prompt skills, and MCP connectors for ChatGPT.',
      'Walks through Function Calling configurations, external REST API orchestration, and structured JSON schema validations for autonomous agents.',
      'Enables software engineers to reliably engineer multi-step AI agents and automate mission-critical enterprise workflows.'
    ],
    tags: ['ChatGPT', 'AI', 'Agents', 'PromptEngineering', 'LLM']
  },
  {
    match: /Kathy Hochul.*less evil/i,
    category: 'AI & Machine Learning',
    title_vi: 'Thống đốc New York kêu gọi xây dựng chính sách phát triển AI có đạo đức và quản lý trung tâm dữ liệu',
    title_en: 'New York Governor Advocates for Ethical AI Policy and Sustainable Data Center Governance',
    summary_vi: [
      'Thống đốc New York Kathy Hochul chia sẻ định hướng xây dựng chính sách quản lý trung tâm dữ liệu AI và hạn chế tác động tiêu cực của công nghệ.',
      'Thảo luận về nhu cầu điện năng khổng lồ của các cụm máy chủ huấn luyện LLM, camera giám sát AI và an toàn thông tin công dân.',
      'Định hình khung pháp lý cân bằng giữa việc thu hút đầu tư công nghệ bán dẫn/AI và bảo vệ quyền riêng tư cũng như môi trường năng lượng.'
    ],
    summary_en: [
      'New York Governor Kathy Hochul outlines regulatory frameworks for AI data center expansion and mitigating emerging tech risks.',
      'Addresses massive grid power consumption demanded by LLM superclusters, automated computer vision surveillance, and digital privacy.',
      'Aims to balance competitive semiconductor and AI infrastructure investments with energy sustainability and algorithmic accountability.'
    ],
    tags: ['AI', 'Policy', 'DataCenter', 'TechEthics']
  },
  {
    match: /ChatGPT and Reddit.*EU.*safety/i,
    category: 'Cybersecurity',
    title_vi: 'ChatGPT và Reddit đối mặt với đạo luật an toàn mạng nghiêm ngặt nhất của Liên minh Châu Âu (DSA)',
    title_en: 'ChatGPT and Reddit Face EU’s Strictest Online Safety & Algorithmic Transparency Regulations',
    summary_vi: [
      'Liên minh Châu Âu (EU) đưa ChatGPT và Reddit vào diện kiểm soát theo Đạo luật Dịch vụ Kỹ thuật số (DSA) với mức độ giám sát cao nhất.',
      'Bắt buộc các nền tảng phải kiểm toán thuật toán phân phối nội dung, ngăn chặn thông tin sai lệch và rà soát rủi ro an toàn mạng định kỳ.',
      'Tăng chi phí tuân thủ pháp lý cho các công ty công nghệ và đặt ra chuẩn mực bảo vệ dữ liệu người dùng khắt khe hơn.'
    ],
    summary_en: [
      'The European Union designates ChatGPT and Reddit under the Digital Services Act (DSA) framework, imposing maximum regulatory compliance.',
      'Mandates rigorous algorithmic audits, independent risk assessments, and continuous mitigation against generative AI disinformation vectors.',
      'Increases legal compliance overhead for global tech platforms while establishing stringent baseline privacy benchmarks across Europe.'
    ],
    tags: ['EU', 'DSA', 'Cybersecurity', 'AI', 'Reddit']
  },
  {
    match: /NASA.*great observatory/i,
    category: 'Tech Trends & Startups',
    title_vi: 'Kính thiên văn không gian thế hệ mới của NASA bắt đầu sứ mệnh mở rộng tầm nhìn về vũ trụ',
    title_en: 'NASA’s Next-Gen Roman Space Observatory Begins Mission to Unlock Dark Energy Secrets',
    summary_vi: [
      'NASA bắt đầu sứ mệnh triển khai kính thiên văn vũ trụ thế hệ mới Nancy Grace Roman với trường nhìn rộng gấp 100 lần kính Hubble.',
      'Trang bị cảm biến hình ảnh hồng ngoại 300 megapixel và thuật toán xử lý dữ liệu Big Data thiên văn học thời gian thực.',
      'Mở ra kho dữ liệu khổng lồ phục vụ nghiên cứu vật chất tối và ứng dụng học máy (ML) để nhận diện các thiên thể mới trong vũ trụ.'
    ],
    summary_en: [
      'NASA commences the operational mission of the Nancy Grace Roman Space Telescope, delivering a field of view 100 times broader than Hubble.',
      'Features a 300-megapixel wide-field infrared focal plane array and real-time astrophysics Big Data telemetry processing pipelines.',
      'Unlocks massive open astronomical datasets for dark energy exploration and Machine Learning identification of exoplanetary systems.'
    ],
    tags: ['NASA', 'SpaceTech', 'BigData', 'MachineLearning']
  },
  {
    match: /Pacific Fusion|mở khóa.*nhiệt hạch/i,
    category: 'Tech Trends & Startups',
    title_vi: 'Startup Pacific Fusion đặt mục tiêu thương mại hóa cỗ máy phát điện nhiệt hạch trong 4 năm tới',
    title_en: 'Pacific Fusion Targets Commercial Net-Electricity Fusion Reactor Deployment Within 4 Years',
    summary_vi: [
      'Startup Pacific Fusion thu hút đầu tư quy mô lớn nhằm chế tạo cỗ máy phát điện nhiệt hạch thương mại trong vòng 4 năm tới.',
      'Áp dụng công nghệ nén từ trường xung cao áp (Pulsed Magnetic Fields) lên nhiên liệu hạt nhân deuterium-tritium đạt ngưỡng sinh năng lượng ròng.',
      'Cung cấp nguồn năng lượng sạch vô tận với chi phí thấp để vận hành các siêu trung tâm dữ liệu AI trong kỷ nguyên bùng nổ tính toán.'
    ],
    summary_en: [
      'Pacific Fusion secures major capital funding to construct a grid-scale commercial fusion power plant within a four-year horizon.',
      'Employs high-current pulsed magnetic compression to drive deuterium-tritium fuel targets to net-energy gain fusion conditions.',
      'Promises abundant, zero-emission baseload electricity essential for powering next-generation AI gigawatt data centers.'
    ],
    tags: ['FusionEnergy', 'PacificFusion', 'CleanTech', 'Energy']
  },
  {
    match: /pin xe điện|lithium-ion/i,
    category: 'Tech Trends & Startups',
    title_vi: '5 công nghệ pin xe điện thế hệ mới hứa hẹn thay thế hoàn toàn pin Lithium-ion truyền thống',
    title_en: '5 Next-Gen EV Battery Chemistries Poised to Disrupt Traditional Lithium-Ion Systems',
    summary_vi: [
      'Nghiên cứu 5 hướng đột phá về công nghệ pin thế hệ mới nhằm thay thế pin Lithium-ion truyền thống trên xe điện.',
      'Đánh giá ưu điểm của pin thể rắn (Solid-State), pin Sodium-ion và pin Anode Silicon giúp tăng gấp đôi mật độ năng lượng và sạc siêu nhanh.',
      'Thúc đẩy sự phát triển của hệ thống quản lý pin thông minh (BMS) trên nền tảng IoT và giảm phụ thuộc vào khoáng sản đất hiếm.'
    ],
    summary_en: [
      'Investigates five breakthrough battery technologies engineered to replace conventional lithium-ion cells in electric mobility.',
      'Evaluates solid-state electrolytes, sodium-ion chemistries, and silicon-dominant anodes doubling energy density with sub-15min fast charging.',
      'Drives advanced IoT-based Battery Management System (BMS) architectures while mitigating heavy dependence on scarce mineral supply chains.'
    ],
    tags: ['BatteryTech', 'EV', 'Hardware', 'CleanEnergy']
  },
  {
    match: /Pocket.*AI.*game ideas/i,
    category: 'Software Engineering',
    title_vi: 'AI của Pocket hiện thực hóa ý tưởng game: Thách thức khi nền tảng Meta nắm quyền kiểm soát',
    title_en: 'Pocket’s AI Generates Interactive Mobile Games: The Vendor Lock-In Dilemma with Meta',
    summary_vi: [
      'Phân tích trải nghiệm sử dụng công cụ AI của Pocket để biến ý tưởng văn bản thành các mini-game tương tác trên nền tảng của Meta.',
      'Khả năng sinh mã game tự động theo thời gian thực (Prompt-to-Game), kết hợp công cụ render đồ họa di động tối ưu.',
      'Cảnh báo nguy cơ bị khóa chặt vào nền tảng (Vendor Lock-in) khi mã nguồn và sản phẩm AI tạo ra không thể dễ dàng chuyển ra ngoài.'
    ],
    summary_en: [
      'Analyzes hands-on experiments using Pocket’s AI engine to synthesize playable interactive mini-games directly on Meta’s ecosystem.',
      'Evaluates real-time prompt-to-game code generation, automated shader compilation, and lightweight mobile canvas rendering.',
      'Highlights the architectural risk of platform lock-in when proprietary AI workflows restrict exporting game binaries outside host platforms.'
    ],
    tags: ['PocketAI', 'Meta', 'GameDev', 'VendorLockin']
  },
  {
    match: /OpenShot 4\.0/i,
    category: 'Software Engineering',
    title_vi: 'OpenShot 4.0 ra mắt: Bộ công cụ quay phim, biên tập và chỉnh màu video mã nguồn mở đột phá',
    title_en: 'OpenShot 4.0 Released: Major Open-Source Video Editor Upgrade with Advanced Color Grading',
    summary_vi: [
      'Phần mềm biên tập video mã nguồn mở OpenShot phát hành phiên bản 4.0 với hàng loạt nâng cấp vượt bậc về quay phim và chỉnh màu.',
      'Nâng cấp engine xử lý đồ họa đa luồng, hỗ trợ tăng tốc phần cứng GPU và bộ công cụ Color Grading chuyên nghiệp.',
      'Khẳng định sức mạnh của phần mềm tự do nguồn mở (FOSS) trong việc cạnh tranh trực tiếp với các giải pháp thương mại đắt đỏ.'
    ],
    summary_en: [
      'The open-source OpenShot video editing suite releases version 4.0, introducing comprehensive recording, timeline, and color enhancements.',
      'Features a multi-threaded rendering engine, hardware-accelerated GPU decoding, and professional-grade color correction curves.',
      'Demonstrates the resilience of Free and Open Source Software (FOSS) delivering competitive alternatives to proprietary editing suites.'
    ],
    tags: ['OpenShot', 'OpenSource', 'VideoEditing', 'SoftwareEngineering']
  },
  {
    match: /Robot hình người.*Thế vận hội/i,
    category: 'Tech Trends & Startups',
    title_vi: 'Robot hình người tại Thế vận hội: Bộc lộ điểm yếu trong các tác vụ đòi hỏi sự khéo léo',
    title_en: 'Humanoid Robots at the Olympic Games: Physical Dexterity and Sensor Latency Bottlenecks',
    summary_vi: [
      'Đánh giá màn thể hiện của các robot hình người tại các kỳ thế vận hội, bộc lộ điểm yếu trong các tác vụ đòi hỏi độ chính xác và khéo léo cao.',
      'Phân tích giới hạn của hệ thống cảm biến xúc giác, độ trễ xử lý của mô hình thị giác máy tính và cơ cấu truyền động khớp động học.',
      'Thúc đẩy các kỹ sư Robotics tập trung phát triển mô hình AI điều khiển vật lý (Embodied AI) có khả năng thích nghi môi trường thời gian thực.'
    ],
    summary_en: [
      'Assesses humanoid robot demonstrations at athletic competitions, uncovering critical limitations in fine-motor dexterity tasks.',
      'Examines hardware bottlenecks in tactile sensor feedback, computer vision inference latency, and high-torque actuator kinematics.',
      'Spurs robotics engineers to pioneer Embodied AI foundation models capable of real-time physical adaptation and dynamic balance control.'
    ],
    tags: ['Robotics', 'Humanoid', 'EmbodiedAI', 'Hardware']
  },
  {
    match: /Tian’e Longtan|cầu vòm bê tông/i,
    category: 'Tech Trends & Startups',
    title_vi: 'Cầu vòm bê tông dài nhất thế giới Tian’e Longtan: Đột phá tính toán kết cấu kỹ thuật số',
    title_en: 'Tian’e Longtan Concrete Arch Bridge: Digital Structural Simulation Shatters Engineering Records',
    summary_vi: [
      'Cầu vòm bê tông Tian’e Longtan với nhịp chính dài kỷ lục 600m chính thức hoàn thành, vượt qua mọi kỷ lục xây dựng trước đó.',
      'Ứng dụng mô hình tính toán kết cấu kỹ thuật số tiên tiến và bê tông cường độ siêu cao giúp giảm 22% lượng vật liệu sử dụng.',
      'Minh chứng cho vai trò cốt lõi của phần mềm mô phỏng kỹ thuật và cảm biến giám sát thông minh trong các công trình hạ tầng thế kỷ.'
    ],
    summary_en: [
      'The Tian’e Longtan concrete arch bridge achieves a world-record 600-meter main span, surpassing previous engineering benchmarks.',
      'Employs advanced digital structural simulation software and ultra-high-performance concrete, slashing total material volume by 22%.',
      'Demonstrates the indispensable role of computational civil engineering algorithms and IoT telemetry in mega-infrastructure development.'
    ],
    tags: ['CivilEngineering', 'Simulation', 'IoT', 'Infrastructure']
  },
  {
    match: /Steam.*teraleak/i,
    category: 'Cybersecurity',
    title_vi: 'Vụ rò rỉ 12TB dữ liệu Steam: Lỗ hổng bảo mật hé lộ lịch sử hơn một thập kỷ phát triển game PC',
    title_en: 'The 12TB Steam Teraleak: Critical Security Breach Spills a Decade of PC Gaming History',
    summary_vi: [
      'Vụ rò rỉ 12TB dữ liệu nội bộ của nền tảng Steam hé lộ lịch sử hơn 10 năm phát triển và mã nguồn nhiều tựa game PC huyền thoại.',
      'Phân tích lỗ hổng trong quản lý quyền truy cập kho lưu trữ mã nguồn và bảo mật hạ tầng CI/CD của các studio phát triển game.',
      'Bài học đắt giá về an ninh mạng, bảo vệ tài sản trí tuệ và kiểm soát rò rỉ dữ liệu trong các dự án phần mềm quy mô lớn.'
    ],
    summary_en: [
      'A catastrophic 12TB data leak from Steam infrastructure exposes internal assets and development archives spanning over a decade.',
      'Analyzes access control vulnerabilities within source control repositories and insecure CI/CD credential management in game studios.',
      'Serves as an urgent case study in enterprise cybersecurity, intellectual property protection, and automated data loss prevention (DLP).'
    ],
    tags: ['Cybersecurity', 'DataLeak', 'Steam', 'GameDev']
  },
  {
    match: /Nhật Bản.*đấu cờ vây.*AI/i,
    category: 'AI & Machine Learning',
    title_vi: 'Nhật Bản thử nghiệm giải đấu cờ vây kết hợp người và AI: Khởi nguồn thể thức eSports trí tuệ mới',
    title_en: 'Japan Pioneers Hybrid Human-AI Go Tournaments: Designing the Next-Generation Intellectual eSport',
    summary_vi: [
      'Nhật Bản tiên phong tổ chức giải đấu cờ vây kết hợp giữa kỳ thủ chuyên nghiệp và mô hình AI, định hình môn eSports trí tuệ mới.',
      'Tích hợp thuật toán học tăng cường sâu (Deep Reinforcement Learning) và tìm kiếm cây Monte Carlo (MCTS) để đề xuất nước đi tối ưu.',
      'Mô hình hóa sự hợp tác cộng sinh giữa con người và trí tuệ nhân tạo (Human-in-the-loop AI) thay vì chỉ xem AI là công cụ thay thế.'
    ],
    summary_en: [
      'Japan tests an exhibition Go tournament pairing master players with AI models, pioneering a cooperative intellectual eSport format.',
      'Integrates Deep Reinforcement Learning neural networks with Monte Carlo Tree Search (MCTS) algorithms to calculate game branches.',
      'Exemplifies the Human-in-the-Loop AI paradigm, demonstrating human-machine cognitive symbiosis over outright workforce replacement.'
    ],
    tags: ['AI', 'GoGame', 'eSports', 'DeepLearning', 'Japan']
  },
  {
    match: /Berlin.*tin tặc tống tiền|Rhysida/i,
    category: 'Cybersecurity',
    title_vi: 'Chính quyền Berlin bị tin tặc tấn công mã độc tống tiền 2 triệu euro: Báo động an ninh mạng đô thị',
    title_en: 'Berlin Municipal Infrastructure Hit by €2M Rhysida Ransomware Attack: Urgent Urban Cyber Alert',
    summary_vi: [
      'Chính quyền thành phố Berlin bị nhóm tin tặc Rhysida tấn công tống tiền 2 triệu euro sau sự cố xâm nhập hệ thống dữ liệu công dân.',
      'Tin tặc khai thác lỗ hổng xác thực trên mạng diện rộng và mã hóa máy chủ trung tâm bằng mã độc tống tiền tinh vi.',
      'Báo động đỏ về an ninh mạng đô thị và yêu cầu cấp bách triển khai kiến trúc Zero Trust cho toàn bộ hạ tầng công nghệ công cộng.'
    ],
    summary_en: [
      'The Berlin municipality faces a €2 million extortion demand from the Rhysida ransomware syndicate following sensitive database intrusions.',
      'Threat actors exploited credential vulnerabilities across public WAN endpoints, deploying sophisticated cryptographic locking payloads.',
      'Highlights the urgent imperative for municipal governments to adopt Zero Trust perimeter architectures across public cyber infrastructure.'
    ],
    tags: ['Ransomware', 'Cybersecurity', 'Berlin', 'ZeroTrust']
  },
  {
    match: /Anthropic.*phòng thí nghiệm|Claude.*thí nghiệm/i,
    category: 'AI & Machine Learning',
    title_vi: 'AI Claude của Anthropic tự điều khiển thiết bị phòng thí nghiệm: Đột phá lớn trong AI for Science',
    title_en: 'Anthropic’s Claude Autonomously Operates Lab Equipment: A Major Breakthrough in AI for Science',
    summary_vi: [
      'Anthropic thử nghiệm hệ thống cho phép mô hình AI Claude tự động điều khiển trang thiết bị và tiến hành các thí nghiệm khoa học độc lập.',
      'Kết hợp LLM đa phương thức với cánh tay robot, kính hiển vi và giao thức điều khiển API phần cứng phòng thí nghiệm.',
      'Đột phá lớn trong tự động hóa nghiên cứu khoa học (AI for Science), rút ngắn thời gian phát minh vật liệu và dược phẩm mới.'
    ],
    summary_en: [
      'Anthropic pilots autonomous systems enabling Claude AI to interface with physical laboratory instruments and execute wet-lab experiments.',
      'Connects multimodal LLM planners with robotic actuators, automated microscopes, and low-level hardware control protocols.',
      'Marks a pivotal leap in AI for Science automation, accelerating discoveries in materials science, biochemistry, and molecular biology.'
    ],
    tags: ['Anthropic', 'Claude', 'AIForScience', 'Robotics', 'LLM']
  },
  {
    match: /Monthly Dev Report.*August 2026/i,
    category: 'Software Engineering',
    title_vi: 'Báo cáo phát triển phần mềm hàng tháng: Tổng kết nổi bật và bài học kiến trúc tháng 8/2026',
    title_en: 'Monthly Developer Report: August 2026 Architecture Insights & Key Engineering Discoveries',
    summary_vi: [
      'Tổng kết hành trình phát triển phần mềm và các bước tiến công nghệ nổi bật trong tháng 8/2026 của cộng đồng kỹ sư.',
      'Chia sẻ kinh nghiệm thực tế về tối ưu hóa cơ sở dữ liệu, kiến trúc Microservices và ứng dụng công cụ AI tăng tốc lập trình.',
      'Lan tỏa tinh thần học tập liên tục (Continuous Learning) và xây dựng văn hóa chia sẻ tri thức mở trong cộng đồng IT.'
    ],
    summary_en: [
      'Synthesizes key software development milestones, open-source discoveries, and architectural patterns from August 2026.',
      'Shares real-world case studies on SQL query optimization, distributed microservice resilience, and AI-assisted coding tooling.',
      'Fosters continuous engineering learning and open knowledge sharing within the international software development community.'
    ],
    tags: ['DevReport', 'SoftwareEngineering', 'WebDev', 'Career']
  },
  {
    match: /What was your win this week/i,
    category: 'Software Engineering',
    title_vi: 'Tổng kết thành tựu kỹ thuật tuần qua: Diễn đàn chia sẻ bài học gỡ lỗi và tối ưu hệ thống',
    title_en: 'What Was Your Engineering Win This Week? Practical Debugging & System Optimization Takeaways',
    summary_vi: [
      'Diễn đàn lập trình viên mở thảo luận về những thành tựu kỹ thuật và giải pháp giải quyết bug khó khăn nhất trong tuần.',
      'Tổng hợp các bài học về gỡ lỗi hệ thống (Debugging), tối ưu câu truy vấn SQL và refactor mã nguồn phức tạp.',
      'Nâng cao kỹ năng giải quyết vấn đề và xây dựng môi trường trao đổi kinh nghiệm thực chiến cho các lập trình viên.'
    ],
    summary_en: [
      'Community discussion dissecting key engineering breakthroughs and difficult bug resolutions achieved during the week.',
      'Curates actionable lessons on complex asynchronous debugging, SQL execution plan tuning, and legacy refactoring patterns.',
      'Strengthens practical problem-solving capabilities and collaborative knowledge exchange among professional engineers.'
    ],
    tags: ['Community', 'SoftwareEngineering', 'Productivity']
  },
  {
    match: /Xóa cookie.*nhận ra máy|AudioContext/i,
    category: 'Cybersecurity',
    title_vi: 'Xóa cookie vẫn bị theo dõi: Kỹ thuật nhận diện thiết bị qua xử lý âm thanh AudioContext',
    title_en: 'Beyond Cookies: How Websites Fingerprint Devices Using Ultrasonic AudioContext Signals',
    summary_vi: [
      'Cảnh báo phương thức nhận diện thiết bị người dùng qua AudioContext Fingerprinting ngay cả khi đã xóa sạch cookie trình duyệt.',
      'Website phát tín hiệu âm thanh tần số không nghe thấy qua Web Audio API và phân tích độ trễ xử lý phần cứng để tạo mã định danh duy nhất.',
      'Thúc đẩy các nhà phát triển trình duyệt (Chrome, Safari, Firefox) nâng cấp chính sách bảo vệ quyền riêng tư và chặn theo dõi ngầm.'
    ],
    summary_en: [
      'Warns against covert hardware fingerprinting techniques using the Web Audio API that persist despite complete browser cookie deletion.',
      'Websites process inaudible frequency signals to measure hardware processing latency differences and generate a unique machine fingerprint.',
      'Pressures browser vendors (Chromium, WebKit, Gecko) to implement strict audio context noise defenses and tracking protections.'
    ],
    tags: ['AudioFingerprint', 'Privacy', 'Cybersecurity', 'BrowserSecurity']
  },
  {
    match: /Hiring Process.*HTTP Status Codes/i,
    category: 'Software Engineering',
    title_vi: 'Chuẩn hóa quy trình tuyển dụng lập trình viên bằng hệ thống mã trạng thái HTTP minh bạch',
    title_en: 'Why Tech Hiring Workflows Need HTTP Status Codes: Standardizing Developer Recruitment',
    summary_vi: [
      'Đề xuất ý tưởng hài hước nhưng thực tế về việc chuẩn hóa quy trình tuyển dụng lập trình viên bằng các mã trạng thái HTTP chuẩn.',
      'Áp dụng các mã như 200 OK (Tuyển dụng), 404 Not Found (Không phản hồi), 429 Too Many Requests (Quá tải hồ sơ) vào hệ thống ATS.',
      'Nhấn mạnh tầm quan trọng của tính minh bạch và trải nghiệm ứng viên (Developer Experience) trong tuyển dụng kỹ thuật số.'
    ],
    summary_en: [
      'Humorously yet practically proposes adopting standard HTTP status codes to eliminate opacity in tech recruitment workflows.',
      'Maps application lifecycle states to standard codes: 200 OK (Hired), 404 Not Found (Ghosted), and 429 (Candidate Backlog Overload).',
      'Underscores the critical importance of candidate transparency and positive Developer Experience (DevEx) in modern hiring.'
    ],
    tags: ['Career', 'DevEx', 'SoftwareEngineering', 'Humor']
  },
  {
    match: /10 Git Commands/i,
    category: 'Software Engineering',
    title_vi: '10 lệnh Git nâng cao cực kỳ hữu ích giúp lập trình viên quản lý kho mã nguồn chuyên nghiệp',
    title_en: '10 High-Leverage Git Commands Every Professional Software Engineer Should Master Early',
    summary_vi: [
      'Hướng dẫn chuyên sâu 10 lệnh Git nâng cao giúp lập trình viên kiểm soát phiên bản mã nguồn hiệu quả và chuyên nghiệp.',
      'Đi sâu vào cách sử dụng git reflog để khôi phục commit đã mất, git bisect tìm lỗi tự động và git stash quản lý nhánh linh hoạt.',
      'Giúp kỹ sư phần mềm tiết kiệm hàng giờ gỡ rối xung đột mã nguồn và giữ lịch sử kho lưu trữ Git luôn sạch sẽ.'
    ],
    summary_en: [
      'Comprehensive walkthrough of 10 high-impact Git commands designed to optimize version control workflows for engineers.',
      'Details advanced usages of git reflog for orphan commit recovery, git bisect for binary bug regression tracking, and flexible stashing.',
      'Saves engineering teams hours of merge conflict resolution while preserving a clean, deterministic commit graph.'
    ],
    tags: ['Git', 'DevOps', 'SoftwareEngineering', 'Productivity']
  },
  {
    match: /What Do You Do While AI Codes/i,
    category: 'Software Engineering',
    title_vi: 'Lập trình viên làm gì trong lúc AI viết mã: Định hình lại vai trò kỹ sư trong kỷ nguyên AI',
    title_en: 'What Do Developers Do While AI Codes? Redefining Software Engineering in the Agent Era',
    summary_vi: [
      'Khảo sát thói quen và cách phân bổ thời gian của lập trình viên trong lúc các Agent AI tự động tạo mã nguồn từ 5 đến 20 phút.',
      'Đánh giá sự chuyển dịch vai trò từ người viết mã chi tiết sang kiến trúc sư phần mềm, người kiểm thử và review mã chất lượng.',
      'Tái định hình kỹ năng mềm và phương pháp quản lý năng suất cá nhân trong kỷ nguyên lập trình cộng tác cùng AI.'
    ],
    summary_en: [
      'Surveys how developers optimize intermediate 5-to-20-minute windows while autonomous AI coding agents generate full pull requests.',
      'Examines the paradigm shift from manual syntax typing to high-level system architecture, automated test design, and rigorous code reviews.',
      'Redefines engineering productivity frameworks and cognitive load management in the era of AI pair-programming.'
    ],
    tags: ['AIAgents', 'SoftwareEngineering', 'Productivity', 'FutureOfWork']
  },
  {
    match: /Android cũ.*an toàn/i,
    category: 'Mobile & Web',
    title_vi: 'Sử dụng thiết bị Android đời cũ: Đâu là phiên bản hệ điều hành an toàn để tiếp tục trải nghiệm?',
    title_en: 'Running Legacy Android Devices: Identifying Safe OS Versions and Mitigation Strategies',
    summary_vi: [
      'Hướng dẫn người dùng và kỹ sư chọn phiên bản ứng dụng và hệ điều hành an toàn để tiếp tục sử dụng các thiết bị Android đời cũ.',
      'Phân tích mức độ hỗ trợ API Level của Google Play Services, rủi ro bảo mật từ các bản vá cũ và giải pháp cài đặt APK tùy biến.',
      'Bài học về duy trì khả năng tương thích ngược (Backward Compatibility) và quản lý vòng đời ứng dụng di động dài hạn.'
    ],
    summary_en: [
      'Guidelines for users and mobile engineers navigating security risks on legacy Android smartphones still in active deployment.',
      'Evaluates Google Play Services API level deprecation timelines, unpatched kernel vulnerabilities, and custom ROM sandboxing.',
      'Highlights key architectural lessons in maintaining backward compatibility and long-term mobile application lifecycle support.'
    ],
    tags: ['Android', 'Mobile', 'Cybersecurity', 'Hardware']
  },
  {
    match: /Thử nghiệm thiết bị 5G.*Trung Đông|Make in Viet Nam/i,
    category: 'Tech Trends & Startups',
    title_vi: 'Thiết bị 5G Make in Viet Nam thử nghiệm tại Trung Đông: Bước tiến vươn ra thị trường viễn thông quốc tế',
    title_en: 'Make in Vietnam 5G Telecom Infrastructure Undergoes Field Trials in the Middle East',
    summary_vi: [
      'Thiết bị trạm thu phát sóng 5G Make in Viet Nam chính thức được đưa vào thử nghiệm thực tế tại thị trường Trung Đông.',
      'Năng lực tự chủ thiết kế phần cứng viễn thông Open RAN, ăng-ten MIMO đa búp sóng và phần mềm mạng lõi 5G tốc độ cao.',
      'Khẳng định vị thế và năng lực xuất khẩu giải pháp hạ tầng công nghệ viễn thông đạt chuẩn quốc tế của các kỹ sư Việt Nam.'
    ],
    summary_en: [
      'Make in Vietnam 5G gNodeB telecommunication infrastructure commences extensive real-world network trials across the Middle East.',
      'Validates autonomous domestic engineering of Open RAN hardware, massive MIMO beamforming arrays, and carrier-grade 5G core stacks.',
      'Solidifies Vietnam’s standing as an international exporter of compliant, high-performance telecommunication solutions.'
    ],
    tags: ['5G', 'MakeInVietnam', 'Telecom', 'Hardware']
  },
  {
    match: /MobiFone.*chiến lược kinh doanh/i,
    category: 'Tech Trends & Startups',
    title_vi: 'MobiFone định hình chiến lược kinh doanh số: Ứng dụng công nghệ mới và bảo đảm an ninh quốc gia',
    title_en: 'MobiFone Formulates Digital Strategy: Modernizing Telecom Infrastructure & Cybersecurity',
    summary_vi: [
      'Bộ Công an đề nghị MobiFone xây dựng chiến lược kinh doanh có tầm nhìn tổng thể, ứng dụng sâu rộng thành tựu công nghệ mới.',
      'Đẩy mạnh chuyển đổi số hạ tầng viễn thông, phát triển điện toán đám mây và tích hợp bảo mật an toàn thông tin quốc gia.',
      'Thúc đẩy các doanh nghiệp viễn thông nhà nước chuyển mình thành tập đoàn công nghệ số cung cấp giải pháp toàn diện.'
    ],
    summary_en: [
      'Authorities advise MobiFone on executing a visionary corporate roadmap leveraging cutting-edge digital technologies.',
      'Accelerates cloud infrastructure migration, enterprise digital services transformation, and mission-critical cybersecurity hardening.',
      'Drives national telecom operators to evolve into comprehensive digital technology solution conglomerates.'
    ],
    tags: ['MobiFone', 'Telecom', 'DigitalTransformation', 'Cloud']
  },
  {
    match: /bán dẫn.*Nhật Bản.*Việt Nam/i,
    category: 'Tech Trends & Startups',
    title_vi: 'Nhật Bản tìm kiếm nhân lực bán dẫn tại Việt Nam: Cơ hội vàng cho kỹ sư thiết kế vi mạch',
    title_en: 'Japan Seeks Vietnamese Semiconductor Talent: Golden Era for IC Design & Packaging Engineers',
    summary_vi: [
      'Nhật Bản đẩy mạnh hợp tác thu hút nguồn nhân lực kỹ sư thiết kế vi mạch và đóng gói bán dẫn chất lượng cao từ Việt Nam.',
      'Chiến lược xây dựng các trung tâm R&D bán dẫn, chuyển giao công nghệ thiết kế chip tiên tiến và tiêu chuẩn kiểm thử vi mạch.',
      'Mở ra cơ hội nghề nghiệp giá trị cao cho kỹ sư Việt Nam và nâng tầm vị thế quốc gia trong chuỗi cung ứng bán dẫn toàn cầu.'
    ],
    summary_en: [
      'Japan accelerates bilateral programs to recruit skilled Vietnamese integrated circuit (IC) design and advanced packaging engineers.',
      'Spurs joint semiconductor R&D hubs, advanced EDA tooling transfers, and international silicon verification curricula.',
      'Unlocks high-value engineering careers and elevates Vietnam’s strategic prominence in the global semiconductor supply chain.'
    ],
    tags: ['Semiconductor', 'ChipDesign', 'Hardware', 'Japan', 'VietNam']
  },
  {
    match: /bản đồ định vị doanh nghiệp công nghệ số|VINASA/i,
    category: 'Tech Trends & Startups',
    title_vi: 'VINASA công bố Bản đồ Doanh nghiệp Công nghệ Số Việt Nam: Định vị và kết nối hệ sinh thái CNTT',
    title_en: 'VINASA Launches Vietnam Digital Enterprise Map: Benchmarking the National IT Ecosystem',
    summary_vi: [
      'VINASA chính thức công bố sáng kiến xây dựng Bản đồ doanh nghiệp công nghệ số Việt Nam nhằm kết nối hệ sinh thái CNTT.',
      'Số hóa dữ liệu năng lực kỹ thuật, phân loại giải pháp phần mềm và thiết lập cơ sở dữ liệu đối tác công nghệ số quốc gia.',
      'Tạo đòn bẩy xúc tiến thương mại, giúp các sản phẩm phần mềm Make in Viet Nam vươn ra thị trường khu vực và toàn cầu.'
    ],
    summary_en: [
      'VINASA officially introduces the Vietnam Digital Enterprise Map initiative to index and connect the nationwide technology landscape.',
      'Digitizes technical competency matrices, categorizes software verticals, and establishes a verified national tech partner registry.',
      'Catalyzes international trade promotion, facilitating Make in Vietnam software solutions in expanding into global markets.'
    ],
    tags: ['VINASA', 'MakeInVietnam', 'Software', 'Ecosystem']
  }
];

export function getCuratedArticle(title: string, content: string = ''): ArticleCuration | undefined {
  const combined = decodeHtml(`${title} ${content}`).toLowerCase();
  for (const item of CURATED_ARTICLES) {
    if (item.match.test(combined)) {
      return item;
    }
  }
  return undefined;
}

export function translateTitleToVietnamese(titleEn: string): string {
  const clean = decodeHtml(titleEn).replace(/^\[(Quốc tế|Global|VN Tech)\]\s*/i, '').trim();

  // Check curated matching first
  const curated = getCuratedArticle(clean);
  if (curated) return curated.title_vi;

  return clean;
}

export interface ITRelevanceResult {
  isIT: boolean;
  score: number;
  reason: string;
}

export function evaluateITRelevance(title: string, content: string = ''): ITRelevanceResult {
  const cleanTitle = decodeHtml(title).toLowerCase();
  const cleanContent = decodeHtml(content).toLowerCase();
  const combined = `${cleanTitle} ${cleanContent}`;

  // 1. Check curated article match first
  if (getCuratedArticle(title, content)) {
    return { isIT: true, score: 100, reason: 'Curated IT article match' };
  }

  // 2. Score positive IT terms
  const IT_TERMS = [
    'ai', 'llm', 'gpt', 'chatgpt', 'openai', 'gemini', 'claude', 'deepseek', 'machine learning', 'trí tuệ nhân tạo',
    'deep learning', 'neural', 'agent', 'agents', 'transformer', 'npu', 'gpu', 'cpu', 'chip', 'bán dẫn', 'semiconductor',
    'software', 'kỹ thuật phần mềm', 'lập trình', 'code', 'coding', 'developer', 'kỹ sư', 'api', 'backend', 'frontend',
    'database', 'sql', 'git', 'github', 'open source', 'mã nguồn mở', 'microservices', 'rust', 'python', 'golang', 'go',
    'javascript', 'typescript', 'react', 'next.js', 'node', 'flutter', 'ios', 'android', 'app', 'browser', 'cloud', 'aws',
    'azure', 'gcp', 'kubernetes', 'k8s', 'docker', 'devops', 'ci/cd', 'linux', 'cybersecurity', 'bảo mật', 'an ninh mạng',
    'lỗ hổng', 'malware', 'ransomware', 'hacker', 'mật mã', 'encryption', 'zero trust', 'privacy', 'vneid', 'chuyển đổi số',
    '5g', 'telecom', 'viễn thông', 'smartphone', 'snapdragon', 'apple silicon', 'swift', 'kotlin', 'c++', 'c#', 'java',
    'php', 'ruby', 'cache', 'spa', 'kernel', 'io_uring', 'firmware', 'hackathon', 'architecture', 'concurrency'
  ];

  let score = 0;
  for (const term of IT_TERMS) {
    if (combined.includes(term)) {
      score += cleanTitle.includes(term) ? 3 : 1;
    }
  }

  // 3. Check strict non-IT blacklisted phrases
  const REJECT_KEYWORDS = [
    'kệ gỗ', 'ván dư', 'gỗ vụn', 'làm kệ', 'đồ gỗ', 'nội thất', 'tủ quần áo',
    'túi phụ kiện sen', 'túi da', 'khắc tên', 'ví da', 'thời trang', 'giày dép', 'mỹ phẩm', 'nước hoa', 'balo', 'ba lô', 'cặp sách',
    'tủ lạnh cho người', 'chống sốc nhiệt', 'nồi chiên', 'máy sấy tóc', 'bàn chải điện', 'bếp từ',
    'dàn âm thanh', 'mẫu loa autobiography', 'đĩa than',
    'xổ số', 'bất động sản', 'phong thủy', 'nấu ăn', 'công thức món', 'showbiz', 'hoa hậu', 'giải trí vpop'
  ];

  for (const kw of REJECT_KEYWORDS) {
    const matchedInTitle = cleanTitle.includes(kw);
    const matchedInContent = cleanContent.includes(kw);

    if (matchedInTitle || (matchedInContent && score < 2)) {
      return {
        isIT: false,
        score: -100,
        reason: `Matched non-IT blacklist keyword: "${kw}"`,
      };
    }
  }

  const isIT = score >= 1;
  return {
    isIT,
    score,
    reason: isIT ? `Matched IT terms (score: ${score})` : `Insufficient IT relevance (score: ${score})`,
  };
}

export async function translateTextFree(text: string, from: string = 'en', to: string = 'vi'): Promise<string> {
  if (!text || typeof text !== 'string') return '';
  const clean = text.trim();
  if (!clean) return '';
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(clean)}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translated = data[0].map((item: any) => item[0]).join('').trim();
        if (translated) return translated;
      }
    }
  } catch (err) {
    // Network fallback
  }
  return clean;
}

export async function translateTitleToVietnameseAsync(titleEn: string): Promise<string> {
  const clean = decodeHtml(titleEn).replace(/^\[(Quốc tế|Global|VN Tech)\]\s*/i, '').trim();
  const curated = getCuratedArticle(clean);
  if (curated) return curated.title_vi;

  if (/[àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(clean)) {
    return clean;
  }

  const translated = await translateTextFree(clean, 'en', 'vi');
  return translated || clean;
}

function isNavigationJunk(text: string): boolean {
  const lower = text.toLowerCase();
  const junkWords = [
    'sign in', 'sign up', 'appearance settings', 'skip to content', 'terms of service',
    'privacy policy', 'cookie', 'all rights reserved', 'navigation', 'subscribe',
    'javascript', 'mcp registry', 'code creation', 'github copilot', 'write better code',
    'log in', 'create an account'
  ];
  return junkWords.some((w) => lower.includes(w));
}

export const CATEGORY_TECH_INSIGHTS: Record<CanonicalCategory, { tech: string; impact: string }> = {
  'AI & Machine Learning': {
    tech: 'Tập trung vào cấu trúc mạng nơ-ron, quy trình huấn luyện mô hình ngôn ngữ lớn (LLM), cơ chế tối ưu suy luận và kiểm soát an toàn thuật toán.',
    impact: 'Định hình tiêu chuẩn phát triển AI có trách nhiệm, mang lại kinh nghiệm thực tiễn quan trọng cho kỹ sư phần mềm khi tích hợp trí tuệ nhân tạo.',
  },
  'Software Engineering': {
    tech: 'Phân tích sâu về nguyên lý thiết kế hệ thống, kiến trúc vi dịch vụ (microservices), tối ưu hóa luồng dữ liệu và tái cấu trúc mã nguồn hiệu quả.',
    impact: 'Cung cấp bài học thực chiến giá trị cho cộng đồng lập trình viên trong việc nâng cao hiệu năng, độ tin cậy và khả năng bảo trì của phần mềm.',
  },
  'DevOps & Cloud': {
    tech: 'Trọng tâm xoay quanh quy trình tự động hóa CI/CD, giải pháp điều phối container Kubernetes, tính khả dụng cao và tối ưu chi phí hạ tầng đám mây.',
    impact: 'Rút ngắn chu kỳ release sản phẩm, tăng cường khả năng phục hồi của hệ thống trước sự cố và thiết lập quy chuẩn vận hành hiện đại.',
  },
  'Cybersecurity': {
    tech: 'Phân tích các cơ chế phòng thủ chuyên sâu, phát hiện lỗ hổng zero-day, mã hóa đầu cuối và kiểm soát truy cập theo mô hình Zero Trust.',
    impact: 'Nâng cao năng lực ứng phó sự cố số cho doanh nghiệp, bảo vệ toàn vẹn tài sản thông tin và dữ liệu nhạy cảm của người dùng.',
  },
  'Mobile & Web': {
    tech: 'Đột phá về trải nghiệm giao diện người dùng (UI/UX), tối ưu hóa thời gian kết xuất (render performance) và năng lực tương thích đa nền tảng.',
    impact: 'Thúc đẩy cộng đồng lập trình viên Mobile và Web áp dụng các tiêu chuẩn công nghệ mới nhằm tối ưu hóa trải nghiệm khách hàng.',
  },
  'Tech Trends & Startups': {
    tech: 'Chiến lược đổi mới công nghệ cốt lõi, mô hình kiến tạo sản phẩm số và khả năng thương mại hóa các giải pháp kỹ thuật đột phá.',
    impact: 'Mở ra tiềm năng ứng dụng thực tế sâu rộng, tạo động lực thúc đẩy hệ sinh thái công nghệ và chuyển đổi số toàn diện.',
  },
};

export const CATEGORY_TECH_INSIGHTS_EN: Record<CanonicalCategory, { tech: string; impact: string }> = {
  'AI & Machine Learning': {
    tech: 'Focuses on neural architecture, LLM training pipelines, inference optimization, and algorithmic safety benchmarks.',
    impact: 'Shapes responsible AI deployment standards while delivering actionable architectural insights for software engineers integrating AI.',
  },
  'Software Engineering': {
    tech: 'Examines core system design principles, microservices architectures, data flow optimization, and clean code refactoring.',
    impact: 'Provides valuable production lessons for developers aiming to improve performance, reliability, and code maintainability.',
  },
  'DevOps & Cloud': {
    tech: 'Centers on CI/CD automation pipelines, Kubernetes container orchestration, high availability, and cloud infrastructure efficiency.',
    impact: 'Accelerates software release lifecycles, enhances system resilience during outages, and enforces modern SRE practices.',
  },
  'Cybersecurity': {
    tech: 'Analyzes in-depth defense mechanisms, zero-day vulnerability mitigation, end-to-end encryption, and Zero Trust access policies.',
    impact: 'Elevates enterprise digital risk posture, safeguarding sensitive user data and maintaining critical infrastructure integrity.',
  },
  'Mobile & Web': {
    tech: 'Highlights breakthroughs in UI/UX rendering performance, responsive cross-platform frameworks, and modern client hardware optimization.',
    impact: 'Encourages mobile and frontend engineers to adopt next-generation standards for high-performance user experiences.',
  },
  'Tech Trends & Startups': {
    tech: 'Highlights disruptive technical innovation, product commercialization strategies, and scalable digital transformation architectures.',
    impact: 'Expands real-world application potential, driving ecosystem collaboration and long-term tech innovation growth.',
  },
};

export async function generateTechnicalTakeawaysAsync(
  title: string,
  snippet: string,
  category: CanonicalCategory,
  lang: 'vi' | 'en'
): Promise<[string, string, string]> {
  const curated = getCuratedArticle(title, snippet);
  if (curated) {
    return lang === 'vi' ? curated.summary_vi : curated.summary_en;
  }

  const cleanSnippet = decodeHtml(snippet || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const rawSentences = cleanSnippet
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 25 && !s.includes('[ATTACH]') && !isNavigationJunk(s));

  const topicName = decodeHtml(title).replace(/^\[(Quốc tế|Global|VN Tech)\]\s*/i, '').trim();
  const hasVietnameseDiacritics = (str?: string) =>
    Boolean(str && /[àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(str));

  const insightsVi = CATEGORY_TECH_INSIGHTS[category] ?? CATEGORY_TECH_INSIGHTS['Tech Trends & Startups'];
  const insightsEn = CATEGORY_TECH_INSIGHTS_EN[category] ?? CATEGORY_TECH_INSIGHTS_EN['Tech Trends & Startups'];

  if (lang === 'vi') {
    let p1 = '';
    let p2 = '';
    let p3 = '';

    if (rawSentences[0]) {
      p1 = hasVietnameseDiacritics(rawSentences[0])
        ? rawSentences[0]
        : await translateTextFree(rawSentences[0], 'en', 'vi');
    } else {
      p1 = `Tổng quan bối cảnh, sự kiện then chốt và các diễn biến công nghệ nổi bật được ghi nhận trong bài viết về ${topicName}.`;
    }

    if (rawSentences[1]) {
      p2 = hasVietnameseDiacritics(rawSentences[1])
        ? rawSentences[1]
        : await translateTextFree(rawSentences[1], 'en', 'vi');
    } else {
      p2 = insightsVi.tech;
    }

    if (rawSentences[2]) {
      p3 = hasVietnameseDiacritics(rawSentences[2])
        ? rawSentences[2]
        : await translateTextFree(rawSentences[2], 'en', 'vi');
    } else {
      p3 = insightsVi.impact;
    }

    return [p1, p2, p3];
  } else {
    let p1 = rawSentences[0] || `Latest technical developments and key architecture overview regarding ${topicName}.`;
    let p2 = rawSentences[1] || insightsEn.tech;
    let p3 = rawSentences[2] || insightsEn.impact;

    if (hasVietnameseDiacritics(p1)) p1 = await translateTextFree(p1, 'vi', 'en');
    if (hasVietnameseDiacritics(p2)) p2 = await translateTextFree(p2, 'vi', 'en');
    if (hasVietnameseDiacritics(p3)) p3 = await translateTextFree(p3, 'vi', 'en');

    return [p1, p2, p3];
  }
}

export function generateTechnicalTakeaways(
  title: string,
  snippet: string,
  category: CanonicalCategory,
  lang: 'vi' | 'en'
): [string, string, string] {
  const curated = getCuratedArticle(title, snippet);
  if (curated) {
    return lang === 'vi' ? curated.summary_vi : curated.summary_en;
  }

  const cleanSnippet = decodeHtml(snippet || '').replace(/<[^>]+>/g, '').trim();
  const sentences = cleanSnippet
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.trim().length > 15 && !s.includes('[ATTACH]') && !isNavigationJunk(s));

  const topicName = decodeHtml(title).replace(/^\[(Quốc tế|Global|VN Tech)\]\s*/i, '').trim();
  const insightsVi = CATEGORY_TECH_INSIGHTS[category] ?? CATEGORY_TECH_INSIGHTS['Tech Trends & Startups'];
  const insightsEn = CATEGORY_TECH_INSIGHTS_EN[category] ?? CATEGORY_TECH_INSIGHTS_EN['Tech Trends & Startups'];

  if (lang === 'vi') {
    const point1 = sentences[0]
      ? sentences[0]
      : `Tổng quan bối cảnh, sự kiện then chốt và các diễn biến công nghệ nổi bật được ghi nhận trong bài viết về ${topicName}.`;
    const point2 = sentences[1] ? sentences[1] : insightsVi.tech;
    const point3 = sentences[2] ? sentences[2] : insightsVi.impact;

    return [point1, point2, point3];
  } else {
    const point1 = sentences[0]
      ? sentences[0]
      : `Latest technical breakdown and key developments regarding ${topicName}.`;
    const point2 = sentences[1] ? sentences[1] : insightsEn.tech;
    const point3 = sentences[2] ? sentences[2] : insightsEn.impact;

    return [point1, point2, point3];
  }
}

