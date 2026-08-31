import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Parser from 'rss-parser';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NewsItem, NewsItemSchema, NewsDatabase } from '../types/news';
import dotenv from 'dotenv';

dotenv.config();

const DATA_FILE = path.join(__dirname, '..', 'data', 'news.json');

interface RSSFeedConfig {
  name: string;
  url: string;
  origin: 'vietnam' | 'global';
  defaultCategory: string;
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
    url: 'https://genk.vn/tin-ict.rss',
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
    url: 'https://viblo.asia/feed.rss',
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
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 AI-Tech-Digest/2.0',
    Accept: 'application/rss+xml, application/xml, text/xml, */*',
  },
  timeout: 10000,
});

function generateHashId(url: string): string {
  return crypto.createHash('sha256').update(url.trim()).digest('hex').substring(0, 16);
}

function cleanHtml(html: string): string {
  return html
    .replace(/<[^>]*>?/gm, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function extractThumbnail(item: any): string | undefined {
  if (item.enclosure?.url && item.enclosure.type?.startsWith('image/')) {
    return item.enclosure.url;
  }
  if (item['media:content']?.['$']?.url) {
    return item['media:content']['$'].url;
  }
  if (item['media:thumbnail']?.['$']?.url) {
    return item['media:thumbnail']['$'].url;
  }
  const content = item.content || item['content:encoded'] || item.description || '';
  const match = content.match(/<img[^>]+src="([^">]+)"/i);
  if (match && match[1] && (match[1].startsWith('http://') || match[1].startsWith('https://'))) {
    return match[1];
  }
  return undefined;
}

// Fallback summary generator
function generateFallbackSummary(title: string, snippet: string, origin: 'vietnam' | 'global', defaultCategory: string) {
  const isVn = origin === 'vietnam';
  return {
    title_vi: isVn ? title : `[Quốc tế] ${title}`,
    title_en: isVn ? `[VN Tech] ${title}` : title,
    summary_vi: [
      snippet.slice(0, 140) + '...',
      'Bản tin công nghệ được cập nhật tự động từ nguồn ' + (isVn ? 'Việt Nam' : 'Quốc tế') + '.',
      'Xem chi tiết bài viết đầy đủ tại nguồn gốc đính kèm.',
    ],
    summary_en: [
      snippet.slice(0, 140) + '...',
      'Automated tech digest fetched from ' + (isVn ? 'Vietnamese' : 'Global') + ' tech feeds.',
      'Refer to the canonical link for complete coverage.',
    ],
    category: defaultCategory,
    tags: ['TechNews', 'IT', isVn ? 'VietNam' : 'Global'],
    hotScore: Math.floor(Math.random() * 20) + 75,
    readTimeMinutes: Math.max(2, Math.min(8, Math.round(snippet.length / 300))),
  };
}

async function summarizeWithGemini(
  title: string,
  contentSnippet: string,
  origin: 'vietnam' | 'global',
  defaultCategory: string,
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
Bạn là một chuyên gia phân tích công nghệ và tổng biên tập bản tin IT hàng đầu.
Nhiệm vụ: Phân tích bài viết sau và trả về DUY NHẤT một JSON Object hợp lệ (không kèm markdown):

Nguồn tin: ${origin === 'vietnam' ? 'Việt Nam' : 'Quốc tế'}
Tiêu đề gốc: ${title}
Nội dung trích đoạn: ${contentSnippet}

Yêu cầu JSON output:
{
  "title_vi": "Tiêu đề tiếng Việt sắc bén, chuẩn văn phong báo chí IT",
  "title_en": "Engaging and clear English title",
  "summary_vi": [
    "Ý 1: Sự kiện/thông tin cốt lõi nhất",
    "Ý 2: Chi tiết kỹ thuật/số liệu/tác động",
    "Ý 3: Kết luận hoặc ứng dụng thực tế"
  ],
  "summary_en": [
    "Point 1: Core announcement or technical fact",
    "Point 2: Technical specifications or business impact",
    "Point 3: Key takeaway for developers & tech readers"
  ],
  "category": "Chọn 1 trong: AI & Machine Learning | DevOps & Cloud | Cybersecurity | Software Engineering | Mobile & Web | Tech Trends & Startups",
  "tags": ["3-5 tags viết liền hoặc ngắn gọn, ví dụ: AI, React, Nextjs, Cloud, DevOps"],
  "hotScore": 88, // Số nguyên từ 1 đến 100 theo độ nóng của tin
  "readTimeMinutes": 4 // Số phút ước tính đọc bài gốc (2-10 phút)
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleanedText = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    return JSON.parse(cleanedText);
  } catch (error: any) {
    console.warn(`[Gemini API Warning] Failed to summarize article "${title}". Using fallback.`);
    return generateFallbackSummary(title, contentSnippet, origin, defaultCategory);
  }
}

// REST API Fetcher: Dev.to
async function fetchDevToArticles(existingIds: Set<string>, apiKey?: string): Promise<NewsItem[]> {
  const articles: NewsItem[] = [];
  try {
    console.log('[Crawler] Fetching Dev.to API...');
    const response = await fetch('https://dev.to/api/articles?per_page=5&top=7', {
      headers: { 'User-Agent': 'AI-Tech-Digest-Bot/2.0' },
    });
    if (!response.ok) return articles;
    const items = await response.json();

    for (const item of items) {
      const id = generateHashId(item.url);
      if (existingIds.has(id)) continue;

      const rawTitle = item.title || '';
      const rawContent = cleanHtml(item.description || item.body_markdown || '');
      const summaryData = await summarizeWithGemini(
        rawTitle,
        rawContent,
        'global',
        'Software Engineering',
        apiKey
      );

      const candidate: NewsItem = {
        id,
        title_vi: summaryData.title_vi || rawTitle,
        title_en: summaryData.title_en || rawTitle,
        summary_vi: summaryData.summary_vi || [rawContent.slice(0, 150) + '...'],
        summary_en: summaryData.summary_en || [rawContent.slice(0, 150) + '...'],
        originalTitle: rawTitle,
        url: item.url,
        sourceName: 'Dev.to',
        sourceOrigin: 'global',
        category: summaryData.category || 'Software Engineering',
        tags: Array.isArray(item.tag_list) && item.tag_list.length > 0 ? item.tag_list : summaryData.tags,
        hotScore: typeof summaryData.hotScore === 'number' ? summaryData.hotScore : 88,
        readTimeMinutes: item.reading_time_minutes || summaryData.readTimeMinutes || 4,
        publishedAt: item.published_at || new Date().toISOString(),
        thumbnailUrl: item.cover_image || item.social_image || undefined,
        contentSnippet: rawContent.slice(0, 300),
        authorName: item.user?.name || 'Dev.to Author',
        authorAvatar: item.user?.profile_image || undefined,
        upvotes: item.positive_reactions_count || 12,
        commentsCount: item.comments_count || 3,
      };

      const validated = NewsItemSchema.safeParse(candidate);
      if (validated.success) {
        articles.push(validated.data);
        existingIds.add(id);
      }
      await new Promise((r) => setTimeout(r, 400));
    }
  } catch (err: any) {
    console.warn('[Crawler Warning] Dev.to API:', err.message);
  }
  return articles;
}

// REST API Fetcher: Hacker News
async function fetchHackerNewsArticles(existingIds: Set<string>, apiKey?: string): Promise<NewsItem[]> {
  const articles: NewsItem[] = [];
  try {
    console.log('[Crawler] Fetching Hacker News API...');
    const topIdsRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json?limitToFirst=6&orderBy="$key"');
    if (!topIdsRes.ok) return articles;
    const topIds: number[] = await topIdsRes.json();

    for (const storyId of topIds.slice(0, 4)) {
      try {
        const itemRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${storyId}.json`);
        if (!itemRes.ok) continue;
        const story = await itemRes.json();
        const url = story.url || `https://news.ycombinator.com/item?id=${storyId}`;
        const id = generateHashId(url);
        if (existingIds.has(id)) continue;

        const rawTitle = story.title || '';
        const summaryData = await summarizeWithGemini(
          rawTitle,
          `Hacker News Top Story by ${story.by}. Score: ${story.score}. Thảo luận công nghệ hàng đầu thế giới.`,
          'global',
          'Software Engineering',
          apiKey
        );

        const candidate: NewsItem = {
          id,
          title_vi: summaryData.title_vi || rawTitle,
          title_en: summaryData.title_en || rawTitle,
          summary_vi: summaryData.summary_vi || [`Thảo luận sôi nổi trên Hacker News với ${story.score} điểm.`],
          summary_en: summaryData.summary_en || [`Trending technical discussion on Hacker News with ${story.score} points.`],
          originalTitle: rawTitle,
          url,
          sourceName: 'Hacker News',
          sourceOrigin: 'global',
          category: summaryData.category || 'Software Engineering',
          tags: ['HackerNews', 'Tech', 'Programming'],
          hotScore: Math.min(99, Math.max(80, Math.floor((story.score || 50) / 5) + 70)),
          readTimeMinutes: 4,
          publishedAt: new Date(story.time * 1000).toISOString(),
          contentSnippet: `Top trending discussion with ${story.score} points and ${story.descendants || 0} comments.`,
          authorName: story.by,
          upvotes: story.score || 45,
          commentsCount: story.descendants || 10,
        };

        const validated = NewsItemSchema.safeParse(candidate);
        if (validated.success) {
          articles.push(validated.data);
          existingIds.add(id);
        }
        await new Promise((r) => setTimeout(r, 400));
      } catch (e) {}
    }
  } catch (err: any) {
    console.warn('[Crawler Warning] Hacker News API:', err.message);
  }
  return articles;
}

async function main() {
  console.log('[News Pipeline] Starting RSS & Multi-API Crawler...');

  let db: NewsDatabase = {
    lastUpdated: new Date().toISOString(),
    totalArticles: 0,
    articles: [],
  };

  if (fs.existsSync(DATA_FILE)) {
    try {
      const fileData = fs.readFileSync(DATA_FILE, 'utf-8');
      db = JSON.parse(fileData);
    } catch (e) {
      console.error('Error reading existing news.json. Initializing new database.');
    }
  }

  const existingIds = new Set(db.articles.map((a) => a.id));
  const newArticles: NewsItem[] = [];
  const apiKey = process.env.GEMINI_API_KEY;

  const devToArticles = await fetchDevToArticles(existingIds, apiKey);
  newArticles.push(...devToArticles);

  const hnArticles = await fetchHackerNewsArticles(existingIds, apiKey);
  newArticles.push(...hnArticles);

  for (const feed of RSS_FEEDS) {
    try {
      console.log(`[Crawler] Fetching: ${feed.name}...`);
      const parsedFeed = await parser.parseURL(feed.url);
      const latestItems = (parsedFeed.items || []).slice(0, 4);

      for (const item of latestItems) {
        const itemUrl = item.link || item.guid || '';
        if (!itemUrl) continue;

        const id = generateHashId(itemUrl);
        if (existingIds.has(id)) continue;

        const rawTitle = item.title || 'Untitled';
        const rawContent = item.content || item['content:encoded'] || item.contentSnippet || item.description || '';
        const cleanSnippet = cleanHtml(rawContent).slice(0, 1500);
        const thumbnail = extractThumbnail(item);
        const publishedDate = item.isoDate || item.pubDate || new Date().toISOString();

        console.log(`[AI Summarizer] ${feed.name}: "${rawTitle.slice(0, 50)}..."`);

        const summaryData = await summarizeWithGemini(
          rawTitle,
          cleanSnippet,
          feed.origin,
          feed.defaultCategory,
          apiKey
        );

        const candidate: NewsItem = {
          id,
          title_vi: summaryData.title_vi || rawTitle,
          title_en: summaryData.title_en || rawTitle,
          summary_vi: Array.isArray(summaryData.summary_vi) && summaryData.summary_vi.length > 0 ? summaryData.summary_vi : [cleanSnippet.slice(0, 150) + '...'],
          summary_en: Array.isArray(summaryData.summary_en) && summaryData.summary_en.length > 0 ? summaryData.summary_en : [cleanSnippet.slice(0, 150) + '...'],
          originalTitle: rawTitle,
          url: itemUrl,
          sourceName: feed.name,
          sourceOrigin: feed.origin,
          category: summaryData.category || feed.defaultCategory,
          tags: Array.isArray(summaryData.tags) ? summaryData.tags : ['Tech', 'IT'],
          hotScore: typeof summaryData.hotScore === 'number' ? summaryData.hotScore : 82,
          readTimeMinutes: typeof summaryData.readTimeMinutes === 'number' ? summaryData.readTimeMinutes : 3,
          publishedAt: publishedDate,
          thumbnailUrl: thumbnail,
          contentSnippet: cleanSnippet.slice(0, 300),
          authorName: item.creator || item.author || feed.name,
          upvotes: Math.floor(Math.random() * 30) + 10,
          commentsCount: Math.floor(Math.random() * 10) + 1,
        };

        const validated = NewsItemSchema.safeParse(candidate);
        if (validated.success) {
          newArticles.push(validated.data);
          existingIds.add(id);
        }

        await new Promise((r) => setTimeout(r, 400));
      }
    } catch (err: any) {
      console.warn(`[Crawler Warning] ${feed.name}: ${err.message}`);
    }
  }

  const combinedArticles = [...newArticles, ...db.articles]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 250);

  const updatedDb: NewsDatabase = {
    lastUpdated: new Date().toISOString(),
    totalArticles: combinedArticles.length,
    articles: combinedArticles,
  };

  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(updatedDb, null, 2), 'utf-8');

  console.log(`[Pipeline Done] Added ${newArticles.length} new items. Total: ${updatedDb.totalArticles}`);
}

main().catch((err) => {
  console.error('Fatal error in news pipeline:', err);
  process.exit(1);
});
