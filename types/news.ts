import { z } from 'zod';


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
  const now = Date.now();
  const articleTime = new Date(publishedAt).getTime();
  if (isNaN(articleTime)) return true;

  const diffHours = (now - articleTime) / (1000 * 60 * 60);

  switch (filter) {
    case 'all':
      // Tạm ẩn tin tức cũ quá 30 ngày khỏi UI mặc định (30 ngày = 720 giờ)
      return diffHours <= 24 * 30;
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

export function isArticleOlderThanDays(publishedAt: string, days = 30): boolean {
  const articleTime = new Date(publishedAt).getTime();
  if (isNaN(articleTime)) return false;
  const diffMs = Date.now() - articleTime;
  return diffMs > days * 24 * 60 * 60 * 1000;
}

export function formatRelativeTime(publishedAt: string, lang: 'vi' | 'en'): string {
  const now = Date.now();
  const date = new Date(publishedAt).getTime();
  if (isNaN(date)) return '';
  const diffMs = now - date;
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 1) {
    return lang === 'vi' ? 'Vừa xong' : 'Just now';
  }
  if (diffMin < 60) {
    return lang === 'vi' ? `${diffMin} phút trước` : `${diffMin}m ago`;
  }
  if (diffHours < 24) {
    return lang === 'vi' ? `${diffHours} giờ trước` : `${diffHours}h ago`;
  }
  if (diffDays === 1) {
    return lang === 'vi' ? 'Hôm qua' : 'Yesterday';
  }
  if (diffDays < 7) {
    return lang === 'vi' ? `${diffDays} ngày trước` : `${diffDays}d ago`;
  }
  return new Date(publishedAt).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', {
    day: 'numeric',
    month: 'numeric',
    year: diffDays > 365 ? 'numeric' : undefined,
  });
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


