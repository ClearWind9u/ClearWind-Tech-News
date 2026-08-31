import fs from 'fs';
import path from 'path';
import { NewsDatabase } from '@/types/news';
import { NewsAppClient } from '@/components/NewsAppClient';

function getNewsData(): NewsDatabase {
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

export default function HomePage() {
  const newsData = getNewsData();

  return <NewsAppClient initialData={newsData} />;
}
