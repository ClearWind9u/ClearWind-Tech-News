import fs from 'fs';
import path from 'path';
import { NewsDatabase, NewsDatabaseSchema } from '../types/news';

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

  // 3. Always persist local JSON backup
  try {
    fs.mkdirSync(path.dirname(LOCAL_DATA_FILE), { recursive: true });
    fs.writeFileSync(LOCAL_DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('[DB Layer] Error writing local JSON backup:', error);
    return savedToCloud;
  }
}
