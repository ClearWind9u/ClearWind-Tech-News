import fs from 'fs';
import path from 'path';
import {
  NewsDatabase,
  NewsDatabaseSchema,
  NewsItem,
  SearchIndexItem,
  ArchiveManifest,
  ArchiveMonthInfo,
} from '../types/news';

const LOCAL_DATA_FILE = path.join(process.cwd(), 'data', 'news.json');

/**
 * Universal Database Layer for ClearWind Tech News
 * Supports:
 * 1. Cloud Serverless KV (Upstash Redis / Vercel KV)
 * 2. Cloud Remote Gist DB (GitHub Gist API)
 * 3. Local JSON Backup (data/news.json)
 */

export async function getNewsDatabase(): Promise<NewsDatabase> {
  // 1. Upstash Redis / Vercel KV (Fastest Serverless Cloud DB)
  const kvUrl = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const kvToken = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

  if (kvUrl && kvToken) {
    try {
      const response = await fetch(`${kvUrl}/get/clearwind_tech_news`, {
        headers: { Authorization: `Bearer ${kvToken}` },
        cache: 'no-store',
      });
      if (response.ok) {
        const json = await response.json();
        if (json.result) {
          const parsed = typeof json.result === 'string' ? JSON.parse(json.result) : json.result;
          const valid = NewsDatabaseSchema.safeParse(parsed);
          if (valid.success) {
            return valid.data;
          }
        }
      }
    } catch (error) {
      console.warn('[DB Layer] Failed to read from Cloud KV:', error);
    }
  }

  // 2. GitHub Gist Database (Zero Setup Cloud Storage)
  const gistId = process.env.GIST_ID;
  const githubToken = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;

  if (gistId) {
    try {
      const headers: Record<string, string> = { 'User-Agent': 'ClearWind-Tech-Bot/2.0' };
      if (githubToken) headers.Authorization = `Bearer ${githubToken}`;

      const response = await fetch(`https://api.github.com/gists/${gistId}`, {
        headers,
        cache: 'no-store',
      });
      if (response.ok) {
        const gist = await response.json();
        const fileContent = gist.files?.['news.json']?.content;
        if (fileContent) {
          const parsed = JSON.parse(fileContent);
          const valid = NewsDatabaseSchema.safeParse(parsed);
          if (valid.success) {
            return valid.data;
          }
        }
      }
    } catch (error) {
      console.warn('[DB Layer] Failed to read from GitHub Gist:', error);
    }
  }

  // 3. Fallback to local JSON file
  if (fs.existsSync(LOCAL_DATA_FILE)) {
    try {
      const raw = fs.readFileSync(LOCAL_DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      const valid = NewsDatabaseSchema.safeParse(parsed);
      if (valid.success) {
        return valid.data;
      }
    } catch (error) {
      console.warn('[DB Layer] Failed to parse local news.json:', error);
    }
  }

  return {
    lastUpdated: new Date().toISOString(),
    totalArticles: 0,
    articles: [],
  };
}

export async function saveNewsDatabase(db: NewsDatabase): Promise<boolean> {
  let savedToCloud = false;

  // 1. Upstash Redis / Vercel KV (Zero Git Commits needed!)
  const kvUrl = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const kvToken = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

  if (kvUrl && kvToken) {
    try {
      const payload = JSON.stringify(db);
      const response = await fetch(`${kvUrl}/set/clearwind_tech_news`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${kvToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([payload]),
      });
      if (response.ok) {
        console.log('[DB Layer] Successfully saved to Cloud KV (0 Git commits needed)!');
        savedToCloud = true;
      }
    } catch (error) {
      console.warn('[DB Layer] Failed to save to Cloud KV:', error);
    }
  }

  // 2. GitHub Gist Database Update (Zero Git Commits needed!)
  const gistId = process.env.GIST_ID;
  const githubToken = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;

  if (gistId && githubToken) {
    try {
      const response = await fetch(`https://api.github.com/gists/${gistId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${githubToken}`,
          'User-Agent': 'ClearWind-Tech-Bot/2.0',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: `ClearWind Tech News Database - Updated ${new Date().toISOString()}`,
          files: {
            'news.json': {
              content: JSON.stringify(db, null, 2),
            },
          },
        }),
      });
      if (response.ok) {
        console.log('[DB Layer] Successfully saved to GitHub Gist DB (0 Git commits needed)!');
        savedToCloud = true;
      }
    } catch (error) {
      console.warn('[DB Layer] Failed to save to GitHub Gist DB:', error);
    }
  }

  // 3. Always persist local JSON backup (Active Hot Store: 250 items)
  try {
    fs.mkdirSync(path.dirname(LOCAL_DATA_FILE), { recursive: true });
    // Keep active store fast and focused
    const activeDb: NewsDatabase = {
      lastUpdated: db.lastUpdated,
      totalArticles: Math.min(db.articles.length, 250),
      articles: db.articles.slice(0, 250),
    };
    fs.writeFileSync(LOCAL_DATA_FILE, JSON.stringify(activeDb, null, 2), 'utf-8');

    // Automatically sync full articles to Long-Term Monthly Archive and Search Index
    saveToArchive(db.articles).catch((err) => {
      console.warn('[DB Layer] Warning: Background archive sync error:', err);
    });

    return true;
  } catch (error) {
    console.error('[DB Layer] Error writing local JSON backup:', error);
    return savedToCloud;
  }
}

const ARCHIVE_DIR = path.join(process.cwd(), 'data', 'archive');
const ARCHIVE_INDEX_FILE = path.join(ARCHIVE_DIR, 'index.json');
const SEARCH_INDEX_FILE = path.join(process.cwd(), 'data', 'search-index.json');

/**
 * Extract Month Key YYYY-MM from ISO date string
 */
export function getMonthKey(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return new Date().toISOString().slice(0, 7);
    return d.toISOString().slice(0, 7);
  } catch {
    return new Date().toISOString().slice(0, 7);
  }
}

/**
 * Build lightweight search index from full articles
 */
export function buildSearchIndex(articles: NewsItem[]): SearchIndexItem[] {
  return articles.map((a) => ({
    id: a.id,
    vi: a.title_vi,
    en: a.title_en,
    cat: a.category,
    tags: a.tags ?? [],
    t: a.publishedAt,
    h: a.hotScore,
    o: a.sourceOrigin,
    r: a.readTimeMinutes ?? 3,
  }));
}

function sanitizeArticleStrings(a: NewsItem): NewsItem {
  const decode = (s?: string) => {
    if (!s) return s;
    return s
      .replaceAll('&#038;', '&')
      .replaceAll('&amp;apos;', "'")
      .replaceAll('&apos;', "'")
      .replaceAll('&quot;', '"')
      .replaceAll('&#8216;', "'")
      .replaceAll('&#8217;', "'")
      .replaceAll('&#8220;', '"')
      .replaceAll('&#8221;', '"')
      .replaceAll('&ndash;', '–')
      .replaceAll('&mdash;', '—')
      .replaceAll('&hellip;', '…')
      .replaceAll('&amp;', '&')
      .replace(/\s+/g, ' ')
      .trim();
  };

  a.title_vi = decode(a.title_vi) || a.title_vi;
  a.title_en = decode(a.title_en) || a.title_en;
  if (a.originalTitle) a.originalTitle = decode(a.originalTitle) || a.originalTitle;
  if (a.contentSnippet) a.contentSnippet = decode(a.contentSnippet) || a.contentSnippet;
  if (a.thumbnailUrl) a.thumbnailUrl = decode(a.thumbnailUrl)?.replace(/\s+/g, '') || a.thumbnailUrl;
  if (Array.isArray(a.summary_vi)) {
    a.summary_vi = a.summary_vi.map((s) => decode(s) || s) as [string, string, string];
  }
  if (Array.isArray(a.summary_en)) {
    a.summary_en = a.summary_en.map((s) => decode(s) || s) as [string, string, string];
  }
  return a;
}

/**
 * Persists and groups articles into monthly JSON archive files (data/archive/YYYY-MM.json)
 * and updates the search index (data/search-index.json)
 */
export async function saveToArchive(articles: NewsItem[]): Promise<ArchiveManifest> {
  fs.mkdirSync(ARCHIVE_DIR, { recursive: true });

  // Group incoming articles by month (YYYY-MM)
  const incomingByMonth = new Map<string, NewsItem[]>();
  for (const art of articles) {
    const month = getMonthKey(art.publishedAt);
    const list = incomingByMonth.get(month) ?? [];
    list.push(art);
    incomingByMonth.set(month, list);
  }

  // Read existing manifest or initialize
  let manifest: ArchiveManifest = {
    lastUpdated: new Date().toISOString(),
    totalArticles: 0,
    months: [],
  };

  if (fs.existsSync(ARCHIVE_INDEX_FILE)) {
    try {
      manifest = JSON.parse(fs.readFileSync(ARCHIVE_INDEX_FILE, 'utf-8'));
    } catch {
      // ignore
    }
  }

  const allArchivedArticlesMap = new Map<string, NewsItem>();

  // Process all months present in archive directory + incoming months
  const existingFiles = fs.existsSync(ARCHIVE_DIR)
    ? fs.readdirSync(ARCHIVE_DIR).filter((f) => f.endsWith('.json') && f !== 'index.json')
    : [];

  const allMonthKeys = new Set<string>([
    ...Array.from(incomingByMonth.keys()),
    ...existingFiles.map((f) => f.replace('.json', '')),
  ]);

  const monthInfos: ArchiveMonthInfo[] = [];

  for (const monthKey of Array.from(allMonthKeys).sort().reverse()) {
    const monthFile = path.join(ARCHIVE_DIR, `${monthKey}.json`);
    let monthArticles: NewsItem[] = [];

    if (fs.existsSync(monthFile)) {
      try {
        const raw = fs.readFileSync(monthFile, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          monthArticles = parsed;
        }
      } catch (err) {
        console.warn(`[Archive Layer] Error reading ${monthKey}.json:`, err);
      }
    }

    // Merge incoming articles for this month
    const incoming = incomingByMonth.get(monthKey) ?? [];
    const mergedMap = new Map<string, NewsItem>();
    for (const a of monthArticles) {
      mergedMap.set(a.id, sanitizeArticleStrings(a));
    }
    for (const a of incoming) {
      mergedMap.set(a.id, sanitizeArticleStrings(a));
    }

    const mergedList = Array.from(mergedMap.values()).sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    // Write back month partition
    fs.writeFileSync(monthFile, JSON.stringify(mergedList, null, 2), 'utf-8');

    for (const a of mergedList) {
      allArchivedArticlesMap.set(a.id, a);
    }

    // Generate month label
    const [year, month] = monthKey.split('-');
    monthInfos.push({
      key: monthKey,
      label_vi: `Tháng ${month}/${year}`,
      label_en: new Date(`${monthKey}-01`).toLocaleString('en-US', { month: 'long', year: 'numeric' }),
      count: mergedList.length,
    });
  }

  // Update Archive Manifest
  manifest = {
    lastUpdated: new Date().toISOString(),
    totalArticles: allArchivedArticlesMap.size,
    months: monthInfos,
  };
  fs.writeFileSync(ARCHIVE_INDEX_FILE, JSON.stringify(manifest, null, 2), 'utf-8');

  // Update Lightweight Search Index
  const allArticlesList = Array.from(allArchivedArticlesMap.values()).sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
  const searchIndex = buildSearchIndex(allArticlesList);
  fs.writeFileSync(SEARCH_INDEX_FILE, JSON.stringify(searchIndex), 'utf-8');

  return manifest;
}

/**
 * Get archive manifest (months list & counts)
 */
export function getArchiveManifest(): ArchiveManifest {
  if (fs.existsSync(ARCHIVE_INDEX_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(ARCHIVE_INDEX_FILE, 'utf-8'));
    } catch {
      // ignore
    }
  }
  return {
    lastUpdated: new Date().toISOString(),
    totalArticles: 0,
    months: [],
  };
}

/**
 * Get articles from a specific archive month
 */
export function getArchiveMonth(monthKey: string): NewsItem[] {
  const file = path.join(ARCHIVE_DIR, `${monthKey}.json`);
  if (fs.existsSync(file)) {
    try {
      const raw = fs.readFileSync(file, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // ignore
    }
  }
  return [];
}

/**
 * Get lightweight search index for fast client-side query
 */
export function getSearchIndex(): SearchIndexItem[] {
  if (fs.existsSync(SEARCH_INDEX_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(SEARCH_INDEX_FILE, 'utf-8'));
    } catch {
      // ignore
    }
  }
  return [];
}

