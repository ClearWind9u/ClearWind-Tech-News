export const APP_CONFIG = {
  name: 'ClearWind Tech',
  fullName: 'ClearWind Tech News',
  tagline: 'Làn Gió Tin Tức Công Nghệ Tinh Gọn & Tự Động 24/7',
  canonicalUrl: 'https://windtech-sandy.vercel.app',
  defaultLanguage: 'vi' as const,
  supportedLanguages: ['vi', 'en'] as const,
};

export const CANONICAL_CATEGORIES = [
  'AI & Machine Learning',
  'Software Engineering',
  'DevOps & Cloud',
  'Cybersecurity',
  'Mobile & Web',
  'Tech Trends & Startups',
] as const;

export const STORAGE_KEYS = {
  LANGUAGE: 'tech_news_lang',
  BOOKMARKS: 'tech_news_bookmarks',
  READ_ARTICLES: 'tech_news_read_articles',
  UPVOTES: 'tech_news_upvotes',
  VIEW_MODE: 'tech_news_view',
  THEME: 'tech_news_theme',
} as const;
