import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Parser from 'rss-parser';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NewsItem, NewsItemSchema, NewsDatabase } from '../types/news';
import { getNewsDatabase, saveNewsDatabase } from '../lib/db';
import {
  classifyCategory,
  translateTitleToVietnamese,
  generateTechnicalTakeaways,
  decodeHtml,
  CanonicalCategory,
} from './it_translator';
import dotenv from 'dotenv';

dotenv.config();

const DATA_FILE = path.join(__dirname, '..', 'data', 'news.json');

interface RSSFeedConfig {
  name: string;
  url: string;
  origin: 'vietnam' | 'global';
  defaultCategory: CanonicalCategory;
}

const RSS_FEEDS: RSSFeedConfig[] = [
  // 🇻🇳 Nguồn tin Việt Nam (Ưu tiên 70%)
  {
    name: 'VnExpress Số Hóa',
    url: 'https://vnexpress.net/rss/so-hoa.rss',
    origin: 'vietnam',
    defaultCategory: 'Tech Trends & Startups',
  },
  {
    name: 'GenK',
    url: 'https://genk.vn/rss/home.rss',
    origin: 'vietnam',
    defaultCategory: 'Software Engineering',
  },
  {
    name: 'Tinh Tế',
    url: 'https://tinhte.vn/rss',
    origin: 'vietnam',
    defaultCategory: 'Mobile & Web',
  },
  {
    name: 'VietNamNet ICT',
    url: 'https://vietnamnet.vn/rss/cong-nghe.rss',
    origin: 'vietnam',
    defaultCategory: 'Cybersecurity',
  },
  {
    name: 'Tuổi Trẻ Nhịp Sống Số',
    url: 'https://tuoitre.vn/rss/nhip-song-so.rss',
    origin: 'vietnam',
    defaultCategory: 'Tech Trends & Startups',
  },
  {
    name: 'Viblo Tech',
    url: 'https://viblo.asia/rss/posts/editors-choice',
    origin: 'vietnam',
    defaultCategory: 'Software Engineering',
  },
  // 🌐 Nguồn tin Quốc Tế (30%)
  {
    name: 'The Verge',
    url: 'https://www.theverge.com/rss/index.xml',
    origin: 'global',
    defaultCategory: 'Tech Trends & Startups',
  },
  {
    name: 'Ars Technica',
    url: 'https://feeds.arstechnica.com/arstechnica/index',
    origin: 'global',
    defaultCategory: 'Cybersecurity',
  },
];

const parser = new Parser({
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 ClearWind-Tech-Bot/2.0',
    Accept: 'application/rss+xml, application/xml, text/xml, */*',
  },
  timeout: 10000,
});

// === Dedicated Safe Extractor Functions (Data Integrity Guard) ===

function generateHashId(url: string): string {
  return crypto.createHash('sha256').update(url.trim()).digest('hex').substring(0, 16);
}

function cleanHtml(html?: string): string {
  if (!html || typeof html !== 'string') return '';
  return decodeHtml(html)
    .replace(/<[^>]*>?/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parsePublishedDate(isoDate?: string, pubDate?: string): string {
  if (isoDate && typeof isoDate === 'string' && !isNaN(Date.parse(isoDate))) {
    return new Date(isoDate).toISOString();
  }
  if (pubDate && typeof pubDate === 'string' && !isNaN(Date.parse(pubDate))) {
    return new Date(pubDate).toISOString();
  }
  return new Date().toISOString();
}

function extractSafeThumbnail(item: any): string | undefined {
  if (item?.enclosure?.url && typeof item.enclosure.url === 'string') {
    return item.enclosure.url;
  }
  if (item?.['media:content']?.['$']?.url && typeof item['media:content']['$'].url === 'string') {
    return item['media:content']['$'].url;
  }
  if (item?.['media:thumbnail']?.['$']?.url && typeof item['media:thumbnail']['$'].url === 'string') {
    return item['media:thumbnail']['$'].url;
  }
  const content = item?.content ?? item?.['content:encoded'] ?? item?.description ?? '';
  if (typeof content === 'string') {
    const match = content.match(/<img[^>]+src="([^">]+)"/i);
    if (match && match[1] && (match[1].startsWith('http://') || match[1].startsWith('https://'))) {
      return match[1];
    }
  }
  return undefined;
}

// Enhanced Fallback summary & translation generator with domain classification
function generateFallbackSummary(
  title: string,
  snippet: string,
  origin: 'vietnam' | 'global',
  defaultCategory: CanonicalCategory
) {
  const isVn = origin === 'vietnam';
  const cleanTitle = decodeHtml(title).replace(/^\[(Quốc tế|VN Tech)\]\s*/i, '').trim();

  // 1. Precise Category Auto-Classification
  const category = classifyCategory(cleanTitle, snippet) ?? defaultCategory;

  // 2. Bilingual Title Handling
  let vietnameseTitle = cleanTitle;
  let englishTitle = cleanTitle;

  if (isVn) {
    vietnameseTitle = cleanTitle;
    englishTitle = cleanTitle;
  } else {
    vietnameseTitle = translateTitleToVietnamese(cleanTitle);
    englishTitle = cleanTitle;
  }

  // 3. Domain-specific 3-point technical takeaways
  const summaryVi = generateTechnicalTakeaways(vietnameseTitle, snippet, category, 'vi');
  const summaryEn = generateTechnicalTakeaways(englishTitle, snippet, category, 'en');

  // 4. Tags extraction
  const categoryTag = category.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '');
  const tags = isVn
    ? [categoryTag, 'CongNghe', 'VietNam']
    : [categoryTag, 'SoftwareEngineering', 'Tech'];

  return {
    title_vi: vietnameseTitle,
    title_en: englishTitle,
    summary_vi: summaryVi,
    summary_en: summaryEn,
    category,
    tags,
    hotScore: Math.floor(Math.random() * 15) + 84,
    readTimeMinutes: Math.max(3, Math.min(8, Math.round((snippet ?? '').length / 250))),
  };
}

async function summarizeWithGemini(
  title: string,
  contentSnippet: string,
  origin: 'vietnam' | 'global',
  defaultCategory: CanonicalCategory,
  apiKey?: string
) {
  if (!apiKey) {
    return generateFallbackSummary(title, contentSnippet, origin, defaultCategory);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const prompt = `
Bạn là chuyên gia phân tích công nghệ cao cấp và kỹ sư trưởng (Principal Engineer).
Nhiệm vụ: Phân tích bài viết công nghệ dưới đây và trả về DUY NHẤT một JSON Object hợp lệ (không markdown):

Nguồn tin: ${origin === 'vietnam' ? 'Việt Nam' : 'Quốc tế'}
Tiêu đề gốc: ${title}
Nội dung trích đoạn: ${contentSnippet}

Yêu cầu nghiêm ngặt về chất lượng tóm tắt:
1. "title_vi": Tiêu đề dịch hoặc viết lại thuần Tiếng Việt 100% tự nhiên, chuẩn xác thuật ngữ IT. TUYỆT ĐỐI KHÔNG để nguyên tiếng Anh nếu nguồn tin là quốc tế, KHÔNG thêm tiền tố như "[Quốc tế]".
2. "title_en": Tiêu đề thuần Tiếng Anh 100% tự nhiên, rõ ràng.
3. "summary_vi": Mảng đúng 3 chuỗi tiếng Việt chi tiết, giàu giá trị chuyên môn (mỗi ý dài 25-45 từ):
   - Ý 1: Bối cảnh, bản chất công nghệ hoặc sự kiện cốt lõi được nhắc đến.
   - Ý 2: Chi tiết kỹ thuật, giải pháp kiến trúc, số liệu hoặc cơ chế hoạt động bên dưới.
   - Ý 3: Giá trị thực tiễn, tác động tới ngành IT/lập trình viên hoặc bài học ứng dụng.
4. "summary_en": Mảng đúng 3 chuỗi tiếng Anh tương ứng với độ chi tiết kỹ thuật tương đương.
5. "category": Phải chọn CHÍNH XÁC 1 trong 6 danh mục chuẩn sau:
   - "AI & Machine Learning"
   - "Software Engineering"
   - "DevOps & Cloud"
   - "Cybersecurity"
   - "Mobile & Web"
   - "Tech Trends & Startups"
6. "tags": 3-5 tags ngắn gọn chuẩn ngành (ví dụ: ["AI", "React", "Rust", "Kubernetes", "Security"]).
7. "hotScore": Điểm nóng số nguyên từ 75 đến 99.
8. "readTimeMinutes": Số phút đọc ước tính từ 3 đến 8.

Định dạng JSON trả về:
{
  "title_vi": "string",
  "title_en": "string",
  "summary_vi": ["string", "string", "string"],
  "summary_en": ["string", "string", "string"],
  "category": "string",
  "tags": ["string", "string", "string"],
  "hotScore": 90,
  "readTimeMinutes": 5
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleanedText = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    const parsed = JSON.parse(cleanedText);

    // Validate category
    if (!parsed.category) {
      parsed.category = classifyCategory(title, contentSnippet) ?? defaultCategory;
    }

    return parsed;
  } catch (error: any) {
    console.warn(`[Gemini API Warning] Failed to summarize article "${title}". Using intelligent IT fallback.`);
    return generateFallbackSummary(title, contentSnippet, origin, defaultCategory);
  }
}

// REST API Fetcher: Dev.to
async function fetchDevToArticles(existingIds: Set<string>, apiKey?: string): Promise<NewsItem[]> {
  const articles: NewsItem[] = [];
  try {
    console.log('[Crawler] Fetching Dev.to API...');
    const response = await fetch('https://dev.to/api/articles?per_page=5&top=7', {
      headers: { 'User-Agent': 'ClearWind-Tech-Bot/2.0' },
    });
    if (!response.ok) return articles;
    const items = await response.json();

    for (const item of items) {
      if (!item?.url) continue;
      const id = generateHashId(item.url);
      if (existingIds.has(id)) continue;

      const rawTitle = cleanHtml(item.title ?? '');
      const rawContent = cleanHtml(item.description ?? item.body_markdown ?? '');
      const summaryData = await summarizeWithGemini(
        rawTitle,
        rawContent,
        'global',
        'Software Engineering',
        apiKey
      );

      const candidate: NewsItem = {
        id,
        title_vi: summaryData.title_vi ?? translateTitleToVietnamese(rawTitle),
        title_en: summaryData.title_en ?? rawTitle,
        summary_vi: summaryData.summary_vi,
        summary_en: summaryData.summary_en,
        originalTitle: rawTitle,
        url: item.url,
        sourceName: 'Dev.to',
        sourceOrigin: 'global',
        category: summaryData.category ?? classifyCategory(rawTitle, rawContent),
        tags: summaryData.tags?.length ? summaryData.tags : (item.tag_list ?? ['DevTo', 'Programming']),
        hotScore: summaryData.hotScore ?? 85,
        readTimeMinutes: summaryData.readTimeMinutes ?? item.reading_time_minutes ?? 4,
        publishedAt: parsePublishedDate(item.published_at),
        thumbnailUrl: item.cover_image ?? item.social_image ?? undefined,
        contentSnippet: rawContent.substring(0, 300),
        authorName: item.user?.name ?? item.user?.username ?? 'Dev.to Author',
        authorAvatar: item.user?.profile_image_90 ?? undefined,
        upvotes: item.positive_reactions_count ?? 10,
        commentsCount: item.comments_count ?? 0,
      };

      const valid = NewsItemSchema.safeParse(candidate);
      if (valid.success) {
        articles.push(candidate);
        existingIds.add(id);
      }
    }
  } catch (error) {
    console.warn('[Crawler Warning] Error fetching Dev.to:', error);
  }
  return articles;
}

// REST API Fetcher: Hacker News
async function fetchHackerNewsArticles(existingIds: Set<string>, apiKey?: string): Promise<NewsItem[]> {
  const articles: NewsItem[] = [];
  try {
    console.log('[Crawler] Fetching Hacker News API...');
    const topRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
    if (!topRes.ok) return articles;
    const topIds: number[] = await topRes.json();

    const selectedIds = topIds.slice(0, 4);
    for (const storyId of selectedIds) {
      const itemRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${storyId}.json`);
      if (!itemRes.ok) continue;
      const item = await itemRes.json();
      if (!item || !item.url) continue;

      const id = generateHashId(item.url);
      if (existingIds.has(id)) continue;

      const rawTitle = cleanHtml(item.title ?? '');
      const rawContent = `Top trending discussion with ${item.score ?? 50} points and ${item.descendants ?? 0} comments.`;
      const summaryData = await summarizeWithGemini(
        rawTitle,
        rawContent,
        'global',
        'Software Engineering',
        apiKey
      );

      const candidate: NewsItem = {
        id,
        title_vi: summaryData.title_vi ?? translateTitleToVietnamese(rawTitle),
        title_en: summaryData.title_en ?? rawTitle,
        summary_vi: summaryData.summary_vi,
        summary_en: summaryData.summary_en,
        originalTitle: rawTitle,
        url: item.url,
        sourceName: 'Hacker News',
        sourceOrigin: 'global',
        category: summaryData.category ?? classifyCategory(rawTitle, rawContent),
        tags: summaryData.tags?.length ? summaryData.tags : ['HackerNews', 'Tech', 'Programming'],
        hotScore: Math.min(99, Math.max(75, Math.floor((item.score ?? 50) / 4))),
        readTimeMinutes: summaryData.readTimeMinutes ?? 4,
        publishedAt: item.time ? new Date(item.time * 1000).toISOString() : new Date().toISOString(),
        contentSnippet: rawContent,
        authorName: item.by ?? 'hn_user',
        upvotes: item.score ?? 1,
        commentsCount: item.descendants ?? 0,
      };

      const valid = NewsItemSchema.safeParse(candidate);
      if (valid.success) {
        articles.push(candidate);
        existingIds.add(id);
      }
    }
  } catch (error) {
    console.warn('[Crawler Warning] Error fetching Hacker News:', error);
  }
  return articles;
}

export async function runCrawlerPipeline() {
  console.log('[News Pipeline] Starting RSS & Multi-API Crawler...');
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.log('[News Pipeline] GEMINI_API_KEY is not set. Using intelligent IT translation & classification fallback.');
  } else {
    console.log('[News Pipeline] GEMINI_API_KEY detected. Using Gemini 1.5 Pro AI summarization.');
  }

  // Load existing database via Universal DB Layer
  const db: NewsDatabase = await getNewsDatabase();

  const existingIds = new Set(db.articles.map((a) => a.id));
  const newArticles: NewsItem[] = [];

  // 1. Fetch REST APIs (Dev.to & Hacker News)
  const devToItems = await fetchDevToArticles(existingIds, apiKey);
  newArticles.push(...devToItems);

  const hnItems = await fetchHackerNewsArticles(existingIds, apiKey);
  newArticles.push(...hnItems);

  // 2. Fetch RSS Feeds
  for (const feed of RSS_FEEDS) {
    try {
      console.log(`[Crawler] Fetching: ${feed.name}...`);
      const parsedFeed = await parser.parseURL(feed.url);

      const items = (parsedFeed.items ?? []).slice(0, 5);
      for (const item of items) {
        if (!item?.link) continue;
        const id = generateHashId(item.link);
        if (existingIds.has(id)) continue;

        const rawTitle = cleanHtml(item.title ?? '');
        const rawContent = cleanHtml(
          item.contentSnippet ?? item.content ?? item.summary ?? item.description ?? ''
        );
        const thumbnailUrl = extractSafeThumbnail(item);

        const summaryData = await summarizeWithGemini(
          rawTitle,
          rawContent,
          feed.origin,
          feed.defaultCategory,
          apiKey
        );

        const candidate: NewsItem = {
          id,
          title_vi: summaryData.title_vi ?? (feed.origin === 'global' ? translateTitleToVietnamese(rawTitle) : rawTitle),
          title_en: summaryData.title_en ?? rawTitle,
          summary_vi: summaryData.summary_vi,
          summary_en: summaryData.summary_en,
          originalTitle: rawTitle,
          url: item.link.trim(),
          sourceName: feed.name,
          sourceOrigin: feed.origin,
          category: summaryData.category ?? classifyCategory(rawTitle, rawContent) ?? feed.defaultCategory,
          tags: summaryData.tags?.length
            ? summaryData.tags
            : [feed.defaultCategory.split(' ')[0], 'Tech'],
          hotScore: summaryData.hotScore ?? Math.floor(Math.random() * 15) + 82,
          readTimeMinutes: summaryData.readTimeMinutes ?? 3,
          publishedAt: parsePublishedDate(item.isoDate, item.pubDate),
          thumbnailUrl,
          contentSnippet: rawContent.substring(0, 300),
          authorName: item.creator ?? item.author ?? feed.name,
          upvotes: Math.floor(Math.random() * 30) + 10,
          commentsCount: Math.floor(Math.random() * 10) + 1,
        };

        const valid = NewsItemSchema.safeParse(candidate);
        if (valid.success) {
          newArticles.push(candidate);
          existingIds.add(id);
        }
      }
    } catch (error: any) {
      console.warn(`[Crawler Warning] ${feed.name}: ${error.message ?? error}`);
    }
  }

  // Merge and sort all articles
  const allArticles = [...newArticles, ...db.articles]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 100); // Keep top 100 freshest articles

  const updatedDb: NewsDatabase = {
    lastUpdated: new Date().toISOString(),
    totalArticles: allArticles.length,
    articles: allArticles,
  };

  await saveNewsDatabase(updatedDb);

  console.log(`[Pipeline Done] Added ${newArticles.length} new items. Total in DB: ${allArticles.length}`);
}

// Direct execution
if (require.main === module) {
  runCrawlerPipeline().catch((err) => {
    console.error('[Pipeline Fatal Error]', err);
    process.exit(1);
  });
}
