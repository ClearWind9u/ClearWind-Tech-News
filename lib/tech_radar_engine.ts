import { NewsItem } from '../types/news';

export interface TechRadarItem {
  name: string;
  count: number;
  avgHotScore: number;
  recentCount: number;
  status: 'surging' | 'adopt' | 'emerging';
}

export interface TechRadarData {
  surging: TechRadarItem[];
  adopt: TechRadarItem[];
  emerging: TechRadarItem[];
  totalEntitiesCount: number;
}

/**
 * Filter out generic non-technical metadata tags to focus purely on tech stacks, tools, and platforms
 */
const GENERIC_TAG_BLACKLIST = new Set([
  'vietnam',
  'congnghe',
  'tech',
  'software',
  'news',
  'tintuc',
  'thegioi',
  'tonghop',
  'capnhat',
  'kinhte',
  'xahoi',
  'doisong',
]);

/**
 * Primary tech keywords dictionary to detect in titles when explicit tags are sparse
 */
const NOTABLE_TECH_ENTITIES = [
  'DeepSeek',
  'OpenAI',
  'ChatGPT',
  'Gemini',
  'Claude',
  'Nvidia',
  'Apple',
  'Google',
  'Microsoft',
  'Next.js',
  'React',
  'Vue',
  'Rust',
  'Python',
  'TypeScript',
  'Kubernetes',
  'Docker',
  'WebGPU',
  'PostgreSQL',
  'Cloudflare',
  'AWS',
  'Linux',
  'DevOps',
  'Cybersecurity',
  'LLM',
  'OpenSource',
];

/**
 * Pure client-side data engine computing real-time Tech Radar & Developer Pulse
 */
export function computeTechRadar(articles: NewsItem[]): TechRadarData {
  if (!articles || articles.length === 0) {
    return { surging: [], adopt: [], emerging: [], totalEntitiesCount: 0 };
  }

  const now = Date.now();
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

  // Keyed map for tech stats
  const techMap = new Map<
    string,
    {
      name: string;
      count: number;
      sumHotScore: number;
      recentCount: number;
    }
  >();

  const recordTech = (rawName: string, hotScore: number, publishedAt: string) => {
    const clean = rawName.trim();
    if (!clean || clean.length < 2) return;
    if (GENERIC_TAG_BLACKLIST.has(clean.toLowerCase())) return;

    const isRecent = now - new Date(publishedAt).getTime() <= SEVEN_DAYS_MS;

    const existing = techMap.get(clean.toLowerCase());
    if (existing) {
      existing.count += 1;
      existing.sumHotScore += hotScore;
      if (isRecent) existing.recentCount += 1;
    } else {
      techMap.set(clean.toLowerCase(), {
        name: clean,
        count: 1,
        sumHotScore: hotScore,
        recentCount: isRecent ? 1 : 0,
      });
    }
  };

  articles.forEach((article) => {
    // 1. Ingest explicit tags
    if (Array.isArray(article.tags)) {
      article.tags.forEach((tag) => {
        recordTech(tag, article.hotScore, article.publishedAt);
      });
    }

    // 2. Scan title for notable tech entities
    const title = `${article.title_vi || ''} ${article.title_en || ''} ${article.originalTitle || ''}`;
    NOTABLE_TECH_ENTITIES.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(title)) {
        // Record only if not already added from explicit tags
        const alreadyHasTag = (article.tags || []).some(
          (t) => t.toLowerCase() === keyword.toLowerCase()
        );
        if (!alreadyHasTag) {
          recordTech(keyword, article.hotScore, article.publishedAt);
        }
      }
    });
  });

  const allItems: TechRadarItem[] = [];

  // Core infrastructure and engineering domains
  const CORE_INFRA = new Set([
    'softwareengineering',
    'devops',
    'cybersecurity',
    'mobile',
    'hardware',
    'postgresql',
    'sql',
    'database',
    'aws',
    'cloudflare',
    'linux',
    'docker',
    'kubernetes',
    'typescript',
    'python',
    'google',
  ]);

  // High-heat frontier technologies
  const SURGING_KEYWORDS = new Set([
    'openai',
    'chatgpt',
    'claude',
    'deepseek',
    'ai',
    'nvidia',
    'microsoft',
    'apple',
    'next.js',
    'opensource',
  ]);

  techMap.forEach((data) => {
    const avgScore = Math.round(data.sumHotScore / data.count);

    allItems.push({
      name: data.name,
      count: data.count,
      avgHotScore: avgScore,
      recentCount: data.recentCount,
      status: 'emerging',
    });
  });

  // Filter out one-off noise tags (must have count >= 2 or be a notable entity)
  const validTechList = allItems.filter(
    (i) =>
      i.count >= 2 ||
      NOTABLE_TECH_ENTITIES.some((n) => n.toLowerCase() === i.name.toLowerCase())
  );

  // 1. Surging: Frontier high-heat technologies (>= 90 pts avg or in surging set)
  const surgingCandidates = validTechList
    .filter(
      (i) =>
        SURGING_KEYWORDS.has(i.name.toLowerCase()) ||
        (i.avgHotScore >= 90 && i.count >= 2)
    )
    .sort((a, b) => b.avgHotScore - a.avgHotScore || b.count - a.count);

  const surging = surgingCandidates.slice(0, 8).map((i) => ({ ...i, status: 'surging' as const }));
  const surgingNames = new Set(surging.map((s) => s.name.toLowerCase()));

  // 2. Core & Adopt: Foundational infrastructure and engineering disciplines
  const adoptCandidates = validTechList
    .filter(
      (i) =>
        !surgingNames.has(i.name.toLowerCase()) &&
        (CORE_INFRA.has(i.name.toLowerCase()) || i.count >= 3)
    )
    .sort((a, b) => b.count - a.count || b.avgHotScore - a.avgHotScore);

  const adopt = adoptCandidates.slice(0, 8).map((i) => ({ ...i, status: 'adopt' as const }));
  const adoptNames = new Set(adopt.map((s) => s.name.toLowerCase()));

  // 3. Emerging: Fast-moving specialized tech, new frameworks, and rising tools
  const emergingCandidates = validTechList
    .filter(
      (i) =>
        !surgingNames.has(i.name.toLowerCase()) &&
        !adoptNames.has(i.name.toLowerCase())
    )
    .sort((a, b) => b.recentCount - a.recentCount || b.avgHotScore - a.avgHotScore || b.count - a.count);

  const emerging = emergingCandidates.slice(0, 8).map((i) => ({ ...i, status: 'emerging' as const }));

  return {
    surging,
    adopt,
    emerging,
    totalEntitiesCount: validTechList.length,
  };
}
