import fs from 'fs';
import path from 'path';
import { NewsDatabase, NewsItem } from '@/types/news';

// Zero-cost Git-as-DB Provider (Default)
export function getLocalNewsDatabase(): NewsDatabase {
  const dataPath = path.join(process.cwd(), 'data', 'news.json');
  if (fs.existsSync(dataPath)) {
    try {
      const fileContent = fs.readFileSync(dataPath, 'utf-8');
      return JSON.parse(fileContent);
    } catch (e) {
      console.error('Failed to parse news.json:', e);
    }
  }

  return {
    lastUpdated: new Date().toISOString(),
    totalArticles: 0,
    articles: [],
  };
}

// Optional Supabase PostgreSQL Query Handler
export async function getNewsFromSupabase(): Promise<NewsItem[] | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null; // Fallback to Git-as-DB
  }

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/news?select=*&order=publishedAt.desc&limit=100`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('Could not connect to Supabase, falling back to local DB:', err);
    return null;
  }
}
