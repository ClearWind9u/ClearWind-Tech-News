import { z } from 'zod';

export const CategoryEnum = z.enum([
  'Tất cả / All',
  'AI & Machine Learning',
  'DevOps & Cloud',
  'Cybersecurity',
  'Software Engineering',
  'Mobile & Web',
  'Tech Trends & Startups',
]);

export type NewsCategory = z.infer<typeof CategoryEnum>;

export const CANONICAL_CATEGORIES = [
  'AI & Machine Learning',
  'Software Engineering',
  'Cybersecurity',
  'DevOps & Cloud',
  'Mobile & Web',
  'Tech Trends & Startups',
] as const;

export type CanonicalCategory = (typeof CANONICAL_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<string, { vi: string; en: string }> = {
  'AI & Machine Learning': { vi: 'Trí tuệ nhân tạo', en: 'AI & Machine Learning' },
  'Software Engineering': { vi: 'Kỹ thuật phần mềm', en: 'Software Engineering' },
  'Cybersecurity': { vi: 'An ninh mạng', en: 'Cybersecurity' },
  'DevOps & Cloud': { vi: 'Điện toán đám mây', en: 'DevOps & Cloud' },
  'Mobile & Web': { vi: 'Lập trình Web & Mobile', en: 'Mobile & Web' },
  'Tech Trends & Startups': { vi: 'Xu hướng công nghệ', en: 'Tech Trends & Startups' },
};

export function getCategoryLabel(category: string, lang: 'vi' | 'en'): string {
  if (CATEGORY_LABELS[category]) {
    return CATEGORY_LABELS[category][lang];
  }
  return category;
}

export const NewsItemSchema = z.object({
  id: z.string(),
  title_vi: z.string(),
  title_en: z.string(),
  summary_vi: z.array(z.string()).min(1),
  summary_en: z.array(z.string()).min(1),
  originalTitle: z.string(),
  url: z.string().url(),
  sourceName: z.string(),
  sourceOrigin: z.enum(['vietnam', 'global']),
  category: z.string(),
  tags: z.array(z.string()),
  hotScore: z.number().min(1).max(100),
  readTimeMinutes: z.number().min(1).max(30),
  publishedAt: z.string(),
  thumbnailUrl: z.string().optional(),
  contentSnippet: z.string().optional(),
  authorName: z.string().optional(),
  authorAvatar: z.string().optional(),
  upvotes: z.number().optional().default(0),
  commentsCount: z.number().optional().default(0),
});

export type NewsItem = z.infer<typeof NewsItemSchema>;

export const NewsDatabaseSchema = z.object({
  lastUpdated: z.string(),
  totalArticles: z.number(),
  articles: z.array(NewsItemSchema),
});

export type NewsDatabase = z.infer<typeof NewsDatabaseSchema>;

export type TimeFilterOption = 'all' | '24h' | '3d' | '7d' | 'archived';

export function isArticleInTimeRange(publishedAt: string, filter: TimeFilterOption): boolean {
  if (filter === 'all') return true;
  const now = Date.now();
  const articleTime = new Date(publishedAt).getTime();
  if (isNaN(articleTime)) return true;

  const diffHours = (now - articleTime) / (1000 * 60 * 60);

  switch (filter) {
    case '24h':
      return diffHours <= 24;
    case '3d':
      return diffHours <= 72;
    case '7d':
      return diffHours <= 168; // 7 days
    case 'archived':
      return diffHours > 168; // older than 7 days
    default:
      return true;
  }
}

/**
 * Lightweight search index item (reduces payload by ~85% for lightning-fast client search)
 */
export const SearchIndexItemSchema = z.object({
  id: z.string(),
  vi: z.string(),
  en: z.string(),
  cat: z.string(),
  tags: z.array(z.string()),
  t: z.string(), // publishedAt ISO string
  h: z.number(), // hotScore
  o: z.enum(['vietnam', 'global']),
  r: z.number(), // readTimeMinutes
});

export type SearchIndexItem = z.infer<typeof SearchIndexItemSchema>;

export interface ArchiveMonthInfo {
  key: string;       // '2026-09'
  label_vi: string;  // 'Tháng 09/2026'
  label_en: string;  // 'September 2026'
  count: number;
}

export interface ArchiveManifest {
  lastUpdated: string;
  totalArticles: number;
  months: ArchiveMonthInfo[];
}

export type ReadTimeFilterOption = 'all' | 'quick' | 'medium' | 'deep';
export type HotFilterOption = 'all' | 'trending' | 'superhot';


