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
