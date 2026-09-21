import { NewsItem } from '../types/news';
import { normalizeVietnamese } from './search_utils';

export interface MultiSourceInfo {
  sourcesCount: number;
  sourceNames: string[];
  sources: string[];
  topicCluster: string;
  clusterLabel: string;
  boostScore: number;
}

/**
 * Standard technical entities and subject anchors to cluster coverage across multiple news sources.
 */
const TECH_CLUSTER_PATTERNS: Array<{ id: string; name: string; pattern: RegExp }> = [
  { id: 'deepseek', name: 'DeepSeek', pattern: /\b(deepseek|r1|v3|deep seek)\b/i },
  { id: 'openai', name: 'OpenAI & ChatGPT', pattern: /\b(openai|chatgpt|gpt-4|gpt-5|sora|o1|o3|altman)\b/i },
  { id: 'claude', name: 'Anthropic Claude', pattern: /\b(anthropic|claude|sonnet|opus|haiku)\b/i },
  { id: 'gemini', name: 'Google Gemini', pattern: /\b(gemini|deepmind|google ai|gemma)\b/i },
  { id: 'apple', name: 'Apple Ecosystem', pattern: /\b(apple|iphone|ios|macbook|m4|m5|vision pro|tim cook)\b/i },
  { id: 'nvidia', name: 'Nvidia & AI Chips', pattern: /\b(nvidia|blackwell|h100|b200|cuda|jensen huang)\b/i },
  { id: 'semiconductor', name: 'Bán dẫn & Chip', pattern: /\b(bán dẫn|semiconductor|tsmc|intel|qualcomm|snapdragon|vi mạch|dimensity)\b/i },
  { id: 'cybersecurity', name: 'An ninh mạng & Bảo mật', pattern: /\b(lỗ hổng|zero-day|cve-|ransomware|malware|tấn công mạng|tin tặc|bảo mật|cybersecurity)\b/i },
  { id: 'cloud_devops', name: 'Cloud & DevOps', pattern: /\b(kubernetes|k8s|docker|aws|azure|gcp|devops|ci\/cd|cloudflare|debezium)\b/i },
  { id: 'laravel_php', name: 'Laravel & PHP', pattern: /\b(laravel|php|eloquent|artisan|composer|symfony|middleware)\b/i },
  { id: 'golang', name: 'Go (Golang)', pattern: /\b(golang|go zero|goroutine)\b/i },
  { id: 'software_architecture', name: 'Kiến trúc phần mềm & Backend', pattern: /\b(kiến trúc phần mềm|architecture constraints|clean architecture|microservices|rest api|opentelemetry|tracing|design pattern)\b/i },
  { id: 'testing_qa', name: 'Kiểm thử & QA', pattern: /\b(playwright|cypress|selenium|jest|automation test|kiểm thử)\b/i },
  { id: 'rust_systems', name: 'Rust & Low-level Systems', pattern: /\b(rust|c\+\+|linux kernel|steamos|io_uring)\b/i },
  { id: 'web_frontend', name: 'Web & Frameworks', pattern: /\b(next\.?js|react|vue|typescript|javascript|tailwind|vite)\b/i },
  { id: 'database', name: 'Databases & SQL', pattern: /\b(postgres|postgresql|mysql|sqlite|mongodb|redis|database|cơ sở dữ liệu)\b/i },
  { id: 'ai_agents', name: 'AI Agents & Automation', pattern: /\b(ai agent|agents|tác nhân ai|vibe coding|mcp|mã nguồn mở ai|open source ai)\b/i },
  { id: 'telecom_5g', name: 'Viễn thông & 5G', pattern: /\b(5g|6g|viễn thông|open ran|make in viet nam|vnpt|viettel|mobifone)\b/i },
];

/**
 * Generic tags that are too broad to represent a genuine multi-source convergence event.
 */
const GENERIC_CLUSTER_BLACKLIST = new Set([
  'ai',
  'software',
  'tech',
  'congnghe',
  'vietnam',
  'tintuc',
  'news',
  'mobile',
  'web',
  'devops',
  'hardware',
  'programming',
  'developer',
]);

/**
 * Normalizes text to extract cluster keys
 */
function extractArticleClusterKeys(article: NewsItem): string[] {
  const text = `${article.title_vi} ${article.title_en} ${article.originalTitle || ''} ${(article.tags || []).join(' ')} ${article.category || ''}`;
  const normalized = normalizeVietnamese(text);
  const matchedKeys: string[] = [];

  for (const cluster of TECH_CLUSTER_PATTERNS) {
    if (cluster.pattern.test(text) || cluster.pattern.test(normalized)) {
      matchedKeys.push(cluster.id);
    }
  }

  // Fallback: If no predefined entity matched, use specific non-generic primary tag
  if (matchedKeys.length === 0 && article.tags && article.tags[0]) {
    const rawTag = normalizeVietnamese(article.tags[0]).toLowerCase().replace(/[^a-z0-9]/g, '');
    if (rawTag && rawTag.length >= 3 && !GENERIC_CLUSTER_BLACKLIST.has(rawTag)) {
      matchedKeys.push(`tag_${rawTag}`);
    }
  }

  return matchedKeys;
}

/**
 * Computes multi-source coverage convergence for a list of articles.
 * Detects stories/topics covered simultaneously by multiple newsrooms and tech platforms.
 * 
 * Returns a Map of articleId -> MultiSourceInfo
 */
export function computeMultiSourceConvergence(articles: NewsItem[]): Map<string, MultiSourceInfo> {
  const clusterMap: Record<
    string,
    {
      sourceNames: Set<string>;
      articleIds: string[];
      clusterLabel: string;
      totalInteractions: number;
    }
  > = {};

  // 1. Group articles by tech clusters
  articles.forEach((art) => {
    const keys = extractArticleClusterKeys(art);
    const sourceName = art.sourceName || 'General Media';
    const interactions = (art.upvotes || 0) + (art.commentsCount || 0);

    keys.forEach((key) => {
      if (!clusterMap[key]) {
        const patternDef = TECH_CLUSTER_PATTERNS.find((p) => p.id === key);
        let friendlyLabel = patternDef ? patternDef.name : '';
        if (!friendlyLabel) {
          if (key.startsWith('tag_')) {
            const rawTag = key.replace(/^tag_/, '');
            const matchingTag = art.tags?.find(
              (t) => normalizeVietnamese(t).toLowerCase().replace(/[^a-z0-9]/g, '') === rawTag
            );
            friendlyLabel = matchingTag || (rawTag.charAt(0).toUpperCase() + rawTag.slice(1));
          } else {
            friendlyLabel = art.category || 'Công nghệ';
          }
        }

        clusterMap[key] = {
          sourceNames: new Set<string>(),
          articleIds: [],
          clusterLabel: friendlyLabel,
          totalInteractions: 0,
        };
      }
      clusterMap[key].sourceNames.add(sourceName);
      clusterMap[key].articleIds.push(art.id);
      clusterMap[key].totalInteractions += interactions;
    });
  });

  // 2. Build MultiSourceInfo lookup for each article
  const resultMap = new Map<string, MultiSourceInfo>();

  articles.forEach((art) => {
    const keys = extractArticleClusterKeys(art);
    let maxSourcesCount = 1;
    let bestSourcesList: string[] = [art.sourceName];
    let bestTopic = art.category || 'Công nghệ';
    let bestBoost = 0;

    keys.forEach((k) => {
      const cluster = clusterMap[k];
      if (cluster && cluster.sourceNames.size > maxSourcesCount) {
        maxSourcesCount = cluster.sourceNames.size;
        bestSourcesList = Array.from(cluster.sourceNames);
        bestTopic = cluster.clusterLabel;
      }
    });

    // Multi-source boost scoring formula:
    // >= 2 distinct sources: +6 points
    // >= 3 distinct sources: +10 points
    // >= 4 distinct sources: +14 points
    if (maxSourcesCount >= 4) {
      bestBoost = 14;
    } else if (maxSourcesCount === 3) {
      bestBoost = 10;
    } else if (maxSourcesCount === 2) {
      bestBoost = 6;
    }

    resultMap.set(art.id, {
      sourcesCount: maxSourcesCount,
      sourceNames: bestSourcesList,
      sources: bestSourcesList,
      topicCluster: bestTopic,
      clusterLabel: bestTopic,
      boostScore: bestBoost,
    });
  });

  return resultMap;
}

/**
 * Calculates effective ranking score incorporating Multi-Source Trend Elevation
 */
export function getEffectiveHotScore(
  article: NewsItem,
  infoOrMap?: MultiSourceInfo | Map<string, MultiSourceInfo>
): number {
  const baseScore = article.hotScore ?? 80;
  if (!infoOrMap) return baseScore;
  const info = 'boostScore' in infoOrMap ? infoOrMap : infoOrMap.get(article.id);
  const boost = info ? info.boostScore : 0;
  return Math.min(99, baseScore + boost);
}
