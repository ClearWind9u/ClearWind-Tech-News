import fs from 'fs';
import path from 'path';
import { NewsDatabaseSchema } from '../types/news';
import { saveToArchive } from '../lib/db';

async function main() {
  console.log('[Reindexer] Starting archive partition & search index generation...');
  const newsPath = path.join(process.cwd(), 'data', 'news.json');

  if (!fs.existsSync(newsPath)) {
    console.error('[Reindexer Error] data/news.json does not exist!');
    process.exit(1);
  }

  const raw = fs.readFileSync(newsPath, 'utf-8');
  const parsed = JSON.parse(raw);
  const valid = NewsDatabaseSchema.safeParse(parsed);

  if (!valid.success) {
    console.error('[Reindexer Error] Invalid data/news.json schema:', valid.error);
    process.exit(1);
  }

  const totalArticles = valid.data.articles.length;
  console.log(`[Reindexer] Found ${totalArticles} articles in data/news.json.`);

  const manifest = await saveToArchive(valid.data.articles);

  console.log('[Reindexer Success] Partitioning complete!');
  console.log(`- Total articles indexed: ${manifest.totalArticles}`);
  console.log('- Monthly partitions generated:');
  for (const m of manifest.months) {
    console.log(`  * ${m.key} (${m.label_vi}): ${m.count} articles`);
  }
}

main().catch((err) => {
  console.error('[Reindexer Fatal Error]', err);
  process.exit(1);
});
