import crypto from 'crypto';
import Parser from 'rss-parser';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NewsItem, NewsItemSchema, NewsDatabase } from '../types/news';
import { getNewsDatabase, saveNewsDatabase } from '../lib/db';
import {
  classifyCategory,
  translateTitleToVietnameseAsync,
  translateTitleToEnglishAsync,
  hasVietnameseDiacritics,
  generateTechnicalTakeawaysAsync,
  decodeHtml,
  evaluateITRelevance,
  extractSmartTags,
  isEditorialCleanArticle,
  CanonicalCategory,
} from './it_translator';
import dotenv from 'dotenv';

dotenv.config();

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
    url: 'https://viblo.asia/rss',
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
    url: 'https://feeds.arstechnica.com/arstechnica/technology-lab',
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
  let url: string | undefined;
  if (item?.enclosure?.url && typeof item.enclosure.url === 'string') {
    url = item.enclosure.url;
  } else if (item?.['media:content']?.['$']?.url && typeof item['media:content']['$'].url === 'string') {
    url = item['media:content']['$'].url;
  } else if (item?.['media:thumbnail']?.['$']?.url && typeof item['media:thumbnail']['$'].url === 'string') {
    url = item['media:thumbnail']['$'].url;
  } else {
    const content = item?.content ?? item?.['content:encoded'] ?? item?.description ?? '';
    if (typeof content === 'string') {
      const match = content.match(/<img[^>]+src="([^">]+)"/i);
      if (match && match[1] && (match[1].startsWith('http://') || match[1].startsWith('https://'))) {
        url = match[1];
      }
    }
  }

  if (url) {
    return decodeHtml(url).replace(/\s+/g, '');
  }
  return undefined;
}

// Enhanced Fallback summary & translation generator with domain classification
async function generateFallbackSummary(
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
    englishTitle = await translateTitleToEnglishAsync(cleanTitle);
  } else {
    vietnameseTitle = await translateTitleToVietnameseAsync(cleanTitle);
    englishTitle = cleanTitle;
  }

  // 3. Domain-specific 3-point technical takeaways
  const summaryVi = await generateTechnicalTakeawaysAsync(vietnameseTitle, snippet, category, 'vi');
  const summaryEn = await generateTechnicalTakeawaysAsync(englishTitle, snippet, category, 'en');

  // 4. Tags extraction with domain intelligence
  const tags = extractSmartTags(cleanTitle, snippet, category);

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

async function fetchFullArticleText(url: string): Promise<string> {
  try {
    const urlLower = url.toLowerCase();
    // Skip repositories, social platforms, and media sites where generic paragraph scraping grabs UI navigation menus
    if (
      urlLower.includes('github.com') ||
      urlLower.includes('twitter.com') ||
      urlLower.includes('x.com') ||
      urlLower.includes('reddit.com') ||
      urlLower.includes('youtube.com') ||
      urlLower.endsWith('.pdf')
    ) {
      return '';
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 ClearWind-Tech-Bot/2.0',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) return '';
    let html = await response.text();

    // 1. Strip structural chrome and non-content elements
    html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    html = html.replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '');
    html = html.replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '');
    html = html.replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '');
    html = html.replace(/<aside\b[^<]*(?:(?!<\/aside>)<[^<]*)*<\/aside>/gi, '');
    html = html.replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '');
    // Strip forum comments, replies, and discussion threads (XenForo, Reddit, Dev.to comments)
    html = html.replace(
      /<(?:div|article|section)[^>]*(?:class|id)=["'][^"']*(?:message-responses|js-quickReply|message-cell--extra|comments-list|comment-container|thread-comments)[^"']*["'][^>]*>[\s\S]*?<\/(?:div|article|section)>/gi,
      ''
    );

    // 2. Targeted content container extraction for known news portals
    let searchArea = html;
    const containerMatch = html.match(
      /<(?:article|div)[^>]*(?:class|id)=["'][^"']*(?:fck_detail|detail-content|knc-content|bbWrapper|article-content|entry-content|post-content|maincontent|story-body)[^"']*["'][^>]*>([\s\S]*?)<\/(?:article|div)>/i
    );
    if (containerMatch?.[1]) {
      searchArea = containerMatch[1];
    }

    const pMatches = searchArea.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) ?? [];
    const extractedParagraphs: string[] = [];

    const JUNK_TERMS = [
      'sign in',
      'sign up',
      'appearance settings',
      'skip to content',
      'cookie policy',
      'privacy policy',
      'terms of service',
      'all rights reserved',
      'subscribe to',
      'toggle navigation',
      'create an account',
      'ai code creation',
      'github copilot',
      'mcp registry',
      'write better code',
      'podcast',
      'cần biết',
      'quảng cáo',
      'xin chào',
      'đăng nhập',
      'đăng xuất',
      'cài đặt tài khoản',
      'tuổi trẻ sao',
      'báo điện tử tuổi trẻ',
      'tổng biên tập',
      'tòa soạn',
      'hotline',
      'liên hệ',
      'bản quyền thuộc về',
      'tin liên quan',
      'thíchkhông thích',
      'likelikedislike',
      'thíchthích',
      'ngu vl',
      'phò phạch',
      'xàm xàm',
      'khuyến mãisự kiện',
    ];

    for (const match of pMatches) {
      const cleanP = cleanHtml(match);
      if (cleanP.length > 35) {
        const lower = cleanP.toLowerCase();
        const isJunk = JUNK_TERMS.some((term) => lower.includes(term));
        if (!isJunk) {
          extractedParagraphs.push(cleanP);
        }
      }
      if (extractedParagraphs.join(' ').length > 1500) break;
    }

    const result = extractedParagraphs.join(' ').substring(0, 1500);
    const resultLower = result.toLowerCase();
    if (
      resultLower.includes('appearance settings') ||
      resultLower.includes('quảng cáo') ||
      resultLower.includes('xin chào') ||
      resultLower.includes('tuổi trẻ sao')
    ) {
      return '';
    }
    return result;
  } catch {
    return '';
  }
}

/**
 * Gemini Model Fallback Chain — Ordered by quality → quota safety.
 *
 * Strategy (based on actual free-tier quota table):
 *   Tier 1 — Quality first:     2.5-flash (5 RPM, 20 RPD)
 *   Tier 2 — More RPM headroom: 2.5-flash-lite (10 RPM, 20 RPD)
 *   Tier 3 — High quota backup: 3.5-flash-lite (15 RPM, 500 RPD) ← KEY SAFETY NET
 *   Tier 4 — High quota backup: 3.1-flash-lite (15 RPM, 500 RPD) ← KEY SAFETY NET
 *   Tier 5 — Newer mid-tier:    3.5-flash (5 RPM, 20 RPD)
 *   Tier 6 — Reliable legacy:   1.5-flash (known stable, lowest quota risk)
 *
 * Note: gemini-2.0-flash and gemini-3.8-flash omitted (currently over quota per dashboard).
 * The try-catch in callGeminiWithFallback gracefully skips unavailable models.
 */
const GEMINI_MODELS = [
  'gemini-2.5-flash',        // Tier 1: Best quality,      RPM: 5,  RPD: 20
  'gemini-2.5-flash-lite',   // Tier 2: Fast + 2x RPM,     RPM: 10, RPD: 20
  'gemini-3.5-flash-lite',   // Tier 3: HIGH QUOTA backup,  RPM: 15, RPD: 500 ← Critical
  'gemini-3.1-flash-lite',   // Tier 4: HIGH QUOTA backup,  RPM: 15, RPD: 500 ← Critical
  'gemini-3.5-flash',        // Tier 5: Newer mid-tier,     RPM: 5,  RPD: 20
  'gemini-1.5-flash',        // Tier 6: Legacy reliable,    most permissive fallback
];

async function callGeminiWithFallback(genAI: GoogleGenerativeAI, prompt: string): Promise<string> {
  const errors: string[] = [];
  for (const modelName of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      // Strict 7-second timeout to prevent TCP hang / wsarecv drops
      const generatePromise = model.generateContent(prompt);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout (7s) exceeded')), 7000)
      );

      const result = await Promise.race([generatePromise, timeoutPromise]);
      const text = result.response.text().trim();
      if (text) return text;
    } catch (err: any) {
      const msg = err?.message ? String(err.message).split('\n')[0] : String(err);
      errors.push(`[${modelName}]: ${msg}`);
    }
  }
  throw new Error(errors.slice(0, 3).join(' | '));
}

async function summarizeWithGemini(
  title: string,
  contentSnippet: string,
  origin: 'vietnam' | 'global',
  defaultCategory: CanonicalCategory,
  apiKey?: string,
  url?: string
) {
  let fullText = contentSnippet;
  if (url && contentSnippet.length < 150) {
    const scrapedText = await fetchFullArticleText(url);
    if (scrapedText && scrapedText.length >= 120) {
      fullText = scrapedText;
    }
  }

  // Pre-filter check with evaluator
  const relevance = evaluateITRelevance(title, fullText);
  if (!relevance.isIT) {
    console.log(`[IT Filter] Rejected non-IT article "${title}": ${relevance.reason}`);
    return { isITRelated: false };
  }

  if (!apiKey) {
    const fallback = await generateFallbackSummary(title, fullText, origin, defaultCategory);
    return { isITRelated: true, ...fallback };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    const isVietnamSource = origin === 'vietnam';
    const prompt = `
Bạn là chuyên gia phân tích công nghệ cao cấp và kỹ sư trưởng (Principal Engineer).
Nhiệm vụ: Phân tích bài viết dưới đây và trả về DUY NHẤT một JSON Object hợp lệ (không markdown, không giải thích thêm).

Nguồn tin: ${isVietnamSource ? 'Việt Nam (bài viết gốc bằng tiếng Việt)' : 'Quốc tế (bài viết gốc bằng tiếng Anh)'}
Tiêu đề gốc: ${title}
Nội dung bài viết: ${fullText}

QUY TẮC ĐÁNH GIÁ CHUYÊN NGÀNH IT (NGHIÊM NGẶT):
1. Đánh giá xem bài viết này có liên quan trực tiếp đến Công nghệ thông tin, Lập trình, Phần mềm, AI, Cloud/DevOps, An ninh mạng, Bán dẫn, Thiết bị di động/Web hay không.
   - Nếu KHÔNG liên quan (ví dụ: làm kệ gỗ, đồ gia dụng, thời trang, túi xách, showbiz, bất động sản, phim ảnh không liên quan tech...), hãy trả về: {"isITRelated": false}

2. Nếu CÓ liên quan IT ("isITRelated": true), hoàn thành các trường sau:

   TRƯỜNG title_vi (BẮT BUỘC — TIẾNG VIỆT 100%):
   - Nếu nguồn tin là Quốc tế: PHẢI dịch sang tiếng Việt tự nhiên, thuần Việt hoàn toàn, KHÔNG được để nguyên tên tiếng Anh kỹ thuật như tên sản phẩm, công ty.
   - Nếu nguồn tin là Việt Nam: giữ nguyên tiêu đề tiếng Việt, chỉnh sửa nếu cần.
   - TUYỆT ĐỐI cấm: title_vi === title_en (nếu vi bằng en thì BẮT BUỘC phải dịch lại).
   - Tên riêng như "Meta", "Google", "Kubernetes", "React" CÓ THỂ giữ nguyên, nhưng phần mô tả PHẢI bằng tiếng Việt.

   TRƯỜNG title_en (BẮT BUỘC — TIẾNG ANH 100%):
   - Nếu nguồn tin là Việt Nam: PHẢI dịch sang tiếng Anh theo phong cách báo chí công nghệ quốc tế (The Verge, TechCrunch).
   - Nếu nguồn tin là Quốc tế: giữ nguyên tiêu đề gốc, chỉnh sửa nếu cần.
   - TUYỆT ĐỐI cấm: title_en chứa bất kỳ ký tự có dấu tiếng Việt (ă, â, đ, ê, ô, ơ, ư, ắ, ế, ố, ớ, ứ...).

   TRƯỜNG summary_vi (BẮT BUỘC — PHẢI LÀ TIẾNG VIỆT THUẦN TÚY):
   - Mảng ĐÚNG 3 chuỗi, mỗi chuỗi từ 25 đến 45 từ tiếng Việt.
   - PHẢI chứa ký tự tiếng Việt có dấu (ă, â, đ, ê, ô, ơ, ư...). Câu toàn tiếng Anh là VI PHẠM NGHIÊM TRỌNG.
   - Ý 1: Bối cảnh và sự kiện cốt lõi thực sự được nhắc đến trong bài.
   - Ý 2: Chi tiết kỹ thuật, giải pháp kiến trúc, số liệu hoặc cơ chế hoạt động thực tế.
   - Ý 3: Giá trị thực tiễn, tác động tới ngành IT/lập trình viên hoặc bài học ứng dụng.
   - TUYỆT ĐỐI KHÔNG viết câu mẫu rập khuôn như "Điểm nhấn công nghệ đặc biệt bao gồm...", "Top trending discussion with X points...", "Phân tích bối cảnh và sự kiện...".

   TRƯỜNG summary_en (BẮT BUỘC — PHẢI LÀ TIẾNG ANH THUẦN TÚY):
   - Mảng ĐÚNG 3 chuỗi tiếng Anh tương ứng, mỗi chuỗi từ 25 đến 45 từ.
   - TUYỆT ĐỐI KHÔNG chứa bất kỳ ký tự có dấu tiếng Việt. Câu có dấu tiếng Việt là VI PHẠM NGHIÊM TRỌNG.
   - Nội dung kỹ thuật cần tương đương chiều sâu với summary_vi.

   TRƯỜNG category: Chọn CHÍNH XÁC 1 trong 6: "AI & Machine Learning", "Software Engineering", "DevOps & Cloud", "Cybersecurity", "Mobile & Web", "Tech Trends & Startups".
   TRƯỜNG tags: 3-5 tags ngắn gọn chuẩn ngành (ví dụ: ["AI", "React", "Rust", "Kubernetes", "Security"]).
   TRƯỜNG hotScore: Số nguyên từ 75 đến 99 thể hiện độ nóng/quan trọng của tin.
   TRƯỜNG readTimeMinutes: Số phút đọc ước tính từ 3 đến 8.

Định dạng JSON trả về nếu là tin IT:
{
  "isITRelated": true,
  "title_vi": "string tiếng Việt",
  "title_en": "string in English",
  "summary_vi": ["chuỗi tiếng Việt 1", "chuỗi tiếng Việt 2", "chuỗi tiếng Việt 3"],
  "summary_en": ["English string 1", "English string 2", "English string 3"],
  "category": "one of 6 categories",
  "tags": ["tag1", "tag2", "tag3"],
  "hotScore": 90,
  "readTimeMinutes": 5
}
`;

    const text = await callGeminiWithFallback(genAI, prompt);
    const cleanedText = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    const parsed = JSON.parse(cleanedText);

    if (parsed.isITRelated === false) {
      console.log(`[Gemini Filter] Gemini classified article "${title}" as non-IT.`);
      return { isITRelated: false };
    }

    parsed.isITRelated = true;
    if (!parsed.category) {
      parsed.category = classifyCategory(title, fullText) ?? defaultCategory;
    }

    // ── Post-parse Bilingual Validation ──
    // Guard 1: title_vi must differ from title_en (for non-VN sources)
    if (!isVietnamSource && parsed.title_vi && parsed.title_vi === parsed.title_en) {
      console.warn(`[Bilingual Guard] title_vi === title_en for "${title}". Regenerating VI title.`);
      parsed.title_vi = await translateTitleToVietnameseAsync(parsed.title_en);
    }

    // Guard 2: summary_vi items must contain Vietnamese diacritics
    if (parsed.summary_vi && Array.isArray(parsed.summary_vi)) {
      const hasVi = parsed.summary_vi.some((s: string) => hasVietnameseDiacritics(s));
      if (!hasVi) {
        console.warn(`[Bilingual Guard] summary_vi has no Vietnamese diacritics for "${title}". Regenerating.`);
        const viTitle = parsed.title_vi ?? (await translateTitleToVietnameseAsync(title));
        parsed.summary_vi = await generateTechnicalTakeawaysAsync(viTitle, fullText, parsed.category, 'vi');
      }
    }

    // Guard 3: summary_en must NOT contain Vietnamese diacritics
    if (parsed.summary_en && Array.isArray(parsed.summary_en)) {
      const hasViInEn = parsed.summary_en.some((s: string) => hasVietnameseDiacritics(s));
      if (hasViInEn) {
        console.warn(`[Bilingual Guard] summary_en contains Vietnamese text for "${title}". Regenerating.`);
        parsed.summary_en = await generateTechnicalTakeawaysAsync(parsed.title_en ?? title, fullText, parsed.category, 'en');
      }
    }

    return parsed;
  } catch (error: any) {
    console.warn(`[Gemini API Warning] Article "${title}" failed: ${error?.message ?? error}. Using intelligent IT fallback.`);
    const fallback = await generateFallbackSummary(title, fullText, origin, defaultCategory);
    return { isITRelated: true, ...fallback };
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
        apiKey,
        item.url
      );
      if (summaryData.isITRelated === false) continue;

      const candidate: NewsItem = {
        id,
        title_vi: summaryData.title_vi ?? (await translateTitleToVietnameseAsync(rawTitle)),
        title_en: summaryData.title_en ?? rawTitle,
        summary_vi: summaryData.summary_vi ?? [],
        summary_en: summaryData.summary_en ?? [],
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
        upvotes: item.positive_reactions_count ?? 0,
        commentsCount: item.comments_count ?? 0,
      };

      const strictlyGuarded = await ensureStrictBilingualQuality(candidate, rawTitle, rawContent, 'global');

      if (!isEditorialCleanArticle(strictlyGuarded.title_vi, strictlyGuarded.summary_vi, strictlyGuarded.contentSnippet)) {
        continue;
      }

      const valid = NewsItemSchema.safeParse(strictlyGuarded);
      if (valid.success) {
        articles.push(strictlyGuarded);
        existingIds.add(id);
      }
    }
  } catch (error) {
    console.warn('[Crawler Warning] Error fetching Dev.to:', error);
  }
  return articles;
}

async function ensureStrictBilingualQuality(
  item: NewsItem,
  rawTitle: string,
  contextSnippet: string,
  origin: 'vietnam' | 'global'
): Promise<NewsItem> {
  const isVn = origin === 'vietnam';

  // 1. Ensure title_vi is valid Vietnamese
  const titleViHasVi = hasVietnameseDiacritics(item.title_vi);
  const titleViSameAsEn = item.title_vi.trim().toLowerCase() === (item.title_en || '').trim().toLowerCase();
  if (!titleViHasVi || (!isVn && titleViSameAsEn)) {
    item.title_vi = await translateTitleToVietnameseAsync(item.title_en || rawTitle);
  }

  // 2. Ensure title_en is valid English (no Vietnamese diacritics)
  if (hasVietnameseDiacritics(item.title_en) || !item.title_en) {
    item.title_en = await translateTitleToEnglishAsync(item.title_vi || rawTitle);
  }

  // 3. Ensure summary_vi is valid 3-point Vietnamese takeaways
  const isSummaryViValid =
    Array.isArray(item.summary_vi) &&
    item.summary_vi.length === 3 &&
    item.summary_vi.every((s) => hasVietnameseDiacritics(s));

  if (!isSummaryViValid) {
    item.summary_vi = await generateTechnicalTakeawaysAsync(
      item.title_vi,
      contextSnippet,
      (item.category as CanonicalCategory) || 'Tech Trends & Startups',
      'vi'
    );
  }

  // 4. Ensure summary_en is valid 3-point English takeaways (no Vietnamese diacritics)
  const isSummaryEnValid =
    Array.isArray(item.summary_en) &&
    item.summary_en.length === 3 &&
    item.summary_en.every((s) => !hasVietnameseDiacritics(s));

  if (!isSummaryEnValid) {
    item.summary_en = await generateTechnicalTakeawaysAsync(
      item.title_en,
      contextSnippet,
      (item.category as CanonicalCategory) || 'Tech Trends & Startups',
      'en'
    );
  }

  return item;
}

// REST API Fetcher: Hacker News
async function fetchHackerNewsArticles(existingIds: Set<string>, apiKey?: string): Promise<NewsItem[]> {
  const articles: NewsItem[] = [];
  try {
    console.log('[Crawler] Fetching Hacker News API...');
    const topRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
    if (!topRes.ok) return articles;
    const topIds: number[] = await topRes.json();

    const selectedIds = topIds.slice(0, 5);
    for (const storyId of selectedIds) {
      const itemRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${storyId}.json`);
      if (!itemRes.ok) continue;
      const item = await itemRes.json();

      // Only process articles (not Ask HN, Show HN polls) with a URL and minimum engagement
      if (!item || !item.url || item.type !== 'story') continue;
      if ((item.score ?? 0) < 50) continue; // Skip low-engagement posts

      const id = generateHashId(item.url);
      if (existingIds.has(id)) continue;

      const rawTitle = cleanHtml(item.title ?? '');

      // Attempt to scrape actual article body for deeper Gemini context
      let articleBody = '';
      try {
        articleBody = await fetchFullArticleText(item.url);
      } catch {
        // Fallback: Gemini will synthesize from title alone
      }

      // Use scraped body if substantial; otherwise pass only the title.
      // NEVER use a hardcoded boilerplate string — it produces junk summaries.
      const hnContext = articleBody && articleBody.length >= 100 ? articleBody : rawTitle;

      const summaryData = await summarizeWithGemini(
        rawTitle,
        hnContext,
        'global',
        'Software Engineering',
        apiKey,
        item.url
      );
      if (summaryData.isITRelated === false) continue;

      const candidate: NewsItem = {
        id,
        title_vi: summaryData.title_vi ?? (await translateTitleToVietnameseAsync(rawTitle)),
        title_en: summaryData.title_en ?? rawTitle,
        summary_vi: summaryData.summary_vi ?? [],
        summary_en: summaryData.summary_en ?? [],
        originalTitle: rawTitle,
        url: item.url,
        sourceName: 'Hacker News',
        sourceOrigin: 'global',
        category: summaryData.category ?? classifyCategory(rawTitle, hnContext),
        tags: summaryData.tags?.length ? summaryData.tags : ['HackerNews', 'Tech', 'Programming'],
        hotScore: Math.min(99, Math.max(75, Math.floor((item.score ?? 50) / 4))),
        readTimeMinutes: summaryData.readTimeMinutes ?? 4,
        publishedAt: item.time ? new Date(item.time * 1000).toISOString() : new Date().toISOString(),
        contentSnippet: hnContext.substring(0, 300),
        authorName: item.by ?? 'hn_user',
        upvotes: item.score ?? 1,
        commentsCount: item.descendants ?? 0,
      };

      const strictlyGuarded = await ensureStrictBilingualQuality(candidate, rawTitle, hnContext, 'global');

      if (!isEditorialCleanArticle(strictlyGuarded.title_vi, strictlyGuarded.summary_vi, strictlyGuarded.contentSnippet)) {
        continue;
      }

      const valid = NewsItemSchema.safeParse(strictlyGuarded);
      if (valid.success) {
        articles.push(strictlyGuarded);
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
    console.log(
      '[News Pipeline] GEMINI_API_KEY detected. Using multi-model fallback chain (Gemini 2.5 Flash -> 2.0 Flash -> 1.5 Flash).'
    );
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
          apiKey,
          item.link.trim()
        );
        if (summaryData.isITRelated === false) continue;

        const isVn = feed.origin === 'vietnam';
        const title_vi =
          summaryData.title_vi ?? (isVn ? rawTitle : await translateTitleToVietnameseAsync(rawTitle));
        const title_en =
          summaryData.title_en && !hasVietnameseDiacritics(summaryData.title_en)
            ? summaryData.title_en
            : (isVn ? await translateTitleToEnglishAsync(rawTitle) : rawTitle);

        // validate summary_vi for Vietnamese diacritics
        let summary_vi = summaryData.summary_vi;
        if (!summary_vi || !summary_vi.some((s: string) => hasVietnameseDiacritics(s))) {
          console.warn(`[Bilingual Guard RSS] summary_vi not Vietnamese for "${rawTitle}". Regenerating.`);
          summary_vi = await generateTechnicalTakeawaysAsync(
            summaryData.title_vi ?? rawTitle,
            rawContent,
            summaryData.category ?? feed.defaultCategory,
            'vi'
          );
        }

        let summary_en = summaryData.summary_en;
        if (!summary_en || summary_en.some((s: string) => hasVietnameseDiacritics(s))) {
          summary_en = await generateTechnicalTakeawaysAsync(
            title_en,
            rawContent,
            summaryData.category ?? feed.defaultCategory,
            'en'
          );
        }

        const candidate: NewsItem = {
          id,
          title_vi,
          title_en,
          summary_vi: summary_vi ?? [],
          summary_en: summary_en ?? [],
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
          upvotes: 0,
          commentsCount: 0,
        };

        const strictlyGuarded = await ensureStrictBilingualQuality(candidate, rawTitle, rawContent, feed.origin);

        if (!isEditorialCleanArticle(strictlyGuarded.title_vi, strictlyGuarded.summary_vi, strictlyGuarded.contentSnippet)) {
          console.warn(`[Quality Gate Filtered] Skipped forum junk/toxic article: ${strictlyGuarded.title_vi}`);
          continue;
        }

        const valid = NewsItemSchema.safeParse(strictlyGuarded);
        if (valid.success) {
          newArticles.push(strictlyGuarded);
          existingIds.add(id);
        }
      }
    } catch (error: any) {
      console.warn(`[Crawler Warning] ${feed.name}: ${error.message ?? error}`);
    }
  }

  // Merge and sort all articles (Preserve long-term knowledge archive without truncation)
  const mergedArticlesMap = new Map<string, NewsItem>();
  for (const a of db.articles) {
    mergedArticlesMap.set(a.id, a);
  }
  for (const a of newArticles) {
    mergedArticlesMap.set(a.id, a);
  }

  const allArticles = Array.from(mergedArticlesMap.values())
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

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
