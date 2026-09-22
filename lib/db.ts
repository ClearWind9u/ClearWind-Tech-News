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
import clientPromise from './mongodb';

const LOCAL_DATA_FILE = path.join(process.cwd(), 'data', 'news.json');
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'clearwind_news';
const MONGODB_COLLECTION = 'articles';

/**
 * Universal Database Layer for ClearWind Tech News
 * Prioritizes high-performance Serverless Cloud Databases:
 * 1. MongoDB Atlas (Official Native Driver / Connection Pooling)
 * 2. Cloud Serverless KV (Upstash Redis / Vercel KV)
 * 3. Cloud Remote Gist DB (GitHub Gist API)
 * 4. Local JSON Fallback (data/news.json - for offline development)
 */

export async function getNewsDatabase(): Promise<NewsDatabase> {
  // 1. MongoDB Atlas (Production Document Database)
  if (clientPromise) {
    try {
      const client = await clientPromise;
      const db = client.db(MONGODB_DB_NAME);
      const collection = db.collection(MONGODB_COLLECTION);

      const docs = await collection
        .find({})
        .sort({ publishedAt: -1, hotScore: -1 })
        .limit(250)
        .toArray();

      if (docs.length > 0) {
        // Strip MongoDB internal _id
        const articles: NewsItem[] = docs.map((doc) => {
          const { _id, ...item } = doc as any;
          return item as NewsItem;
        });

        return {
          lastUpdated: new Date().toISOString(),
          totalArticles: articles.length,
          articles,
        };
      }
    } catch (error) {
      console.warn('[DB Layer] Failed to read from MongoDB Atlas:', error);
    }
  }

  // 2. Upstash Redis / Vercel KV (Fastest Serverless Cloud DB)
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

  // 3. GitHub Gist Database (Zero Setup Cloud Storage)
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

  // 4. Fallback to local JSON file (Offline development seed)
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

  // 1. MongoDB Atlas (Bulk Upsert with unique index on id)
  if (clientPromise) {
    try {
      const client = await clientPromise;
      const mongoDb = client.db(MONGODB_DB_NAME);
      const collection = mongoDb.collection(MONGODB_COLLECTION);

      // Create compound indexes if not exists
      await collection.createIndex({ id: 1 }, { unique: true }).catch(() => {});
      await collection.createIndex({ publishedAt: -1, hotScore: -1 }).catch(() => {});
      await collection.createIndex({ category: 1, publishedAt: -1 }).catch(() => {});

      if (db.articles.length > 0) {
        const bulkOps = db.articles.map((article) => ({
          updateOne: {
            filter: { id: article.id },
            update: { $set: article },
            upsert: true,
          },
        }));

        await collection.bulkWrite(bulkOps, { ordered: false });
        console.log(`[DB Layer] Successfully synced ${db.articles.length} articles to MongoDB Atlas!`);
        savedToCloud = true;
      }
    } catch (error) {
      console.warn('[DB Layer] Failed to save to MongoDB Atlas:', error);
    }
  }

  // 2. Upstash Redis / Vercel KV (Zero Git Commits needed!)
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

  // 3. GitHub Gist Database Update (Zero Git Commits needed!)
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

  // 4. Local JSON Fallback (Preserved for offline dev / seed when no Cloud DB is configured)
  try {
    fs.mkdirSync(path.dirname(LOCAL_DATA_FILE), { recursive: true });
    const activeDb: NewsDatabase = {
      lastUpdated: db.lastUpdated,
      totalArticles: Math.min(db.articles.length, 250),
      articles: db.articles.slice(0, 250),
    };
    fs.writeFileSync(LOCAL_DATA_FILE, JSON.stringify(activeDb, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('[DB Layer] Error writing local JSON backup:', error);
    return savedToCloud;
  }
}


/**
 * Dynamically computes Archive Manifest (month partitions & article counts)
 * directly in memory from active articles - 0 extra JSON files needed!
 */
export function getArchiveManifest(db?: NewsDatabase): ArchiveManifest {
  const articles = db?.articles ?? [];
  const monthCounts = new Map<string, number>();

  for (const a of articles) {
    const m = a.publishedAt ? a.publishedAt.slice(0, 7) : '';
    if (m && m.length === 7) {
      monthCounts.set(m, (monthCounts.get(m) ?? 0) + 1);
    }
  }

  const sortedMonths: ArchiveMonthInfo[] = Array.from(monthCounts.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([key, count]) => {
      const [year, month] = key.split('-');
      return {
        key,
        label_vi: `Tháng ${month}/${year}`,
        label_en: new Date(`${key}-01`).toLocaleString('en-US', { month: 'long', year: 'numeric' }),
        count,
      };
    });

  return {
    lastUpdated: db?.lastUpdated ?? new Date().toISOString(),
    totalArticles: db?.totalArticles ?? articles.length,
    months: sortedMonths,
  };
}

/**
 * Get articles from a specific archive month dynamically from database pool
 */
export async function getArchiveMonth(monthKey: string, db?: NewsDatabase): Promise<NewsItem[]> {
  const activeDb = db ?? (await getNewsDatabase());
  return activeDb.articles.filter((a) => a.publishedAt && a.publishedAt.startsWith(monthKey));
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

/**
 * Get lightweight search index for fast client-side query
 */
export async function getSearchIndex(db?: NewsDatabase): Promise<SearchIndexItem[]> {
  const activeDb = db ?? (await getNewsDatabase());
  return buildSearchIndex(activeDb.articles);
}
