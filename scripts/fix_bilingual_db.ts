import fs from 'fs';
import path from 'path';
import { NewsDatabaseSchema, NewsItem } from '../types/news';
import { saveToArchive } from '../lib/db';
import {
  hasVietnameseDiacritics,
  translateTitleToVietnameseAsync,
  translateTitleToEnglishAsync,
  generateTechnicalTakeawaysAsync,
  CanonicalCategory,
} from './it_translator';

async function main() {
  console.log('[Bilingual Fixer] Starting database audit and bilingual remediation...');
  const newsPath = path.join(process.cwd(), 'data', 'news.json');

  if (!fs.existsSync(newsPath)) {
    console.error('[Bilingual Fixer Error] data/news.json not found!');
    process.exit(1);
  }

  const raw = fs.readFileSync(newsPath, 'utf-8');
  const db = JSON.parse(raw);
  const valid = NewsDatabaseSchema.safeParse(db);

  if (!valid.success) {
    console.error('[Bilingual Fixer Error] Invalid schema in news.json:', valid.error);
    process.exit(1);
  }

  const articles: NewsItem[] = valid.data.articles;
  let fixedCount = 0;

  for (let i = 0; i < articles.length; i++) {
    const a = articles[i];
    let isModified = false;

    // Check title_vi
    const titleViHasD = hasVietnameseDiacritics(a.title_vi);
    const titleViSameAsEn = a.title_vi.trim().toLowerCase() === a.title_en.trim().toLowerCase();
    if (!titleViHasD || (a.sourceOrigin === 'global' && titleViSameAsEn)) {
      console.log(`[Fixing Title VI] #${i + 1} (${a.id}): "${a.title_en}"`);
      const newVi = await translateTitleToVietnameseAsync(a.title_en);
      if (newVi && hasVietnameseDiacritics(newVi)) {
        a.title_vi = newVi;
        isModified = true;
      }
    }

    // Check summary_vi
    const summaryViHasD = Array.isArray(a.summary_vi) && a.summary_vi.length === 3 && a.summary_vi.every((s) => hasVietnameseDiacritics(s));
    if (!summaryViHasD) {
      console.log(`[Fixing Summary VI] #${i + 1} (${a.id}): "${a.title_vi}"`);
      const category = (a.category || 'Tech Trends & Startups') as CanonicalCategory;
      const context = a.contentSnippet || a.title_vi;
      const newSummaryVi = await generateTechnicalTakeawaysAsync(a.title_vi, context, category, 'vi');
      a.summary_vi = newSummaryVi;
      isModified = true;
    }

    // Check title_en
    if (a.title_en && hasVietnameseDiacritics(a.title_en)) {
      console.log(`[Fixing Title EN] #${i + 1} (${a.id}): "${a.title_en}"`);
      const newEn = await translateTitleToEnglishAsync(a.title_vi);
      if (newEn && !hasVietnameseDiacritics(newEn)) {
        a.title_en = newEn;
        isModified = true;
      }
    }

    // Check summary_en
    const summaryEnHasVi = Array.isArray(a.summary_en) && a.summary_en.some((s) => hasVietnameseDiacritics(s));
    if (summaryEnHasVi || !a.summary_en || a.summary_en.length < 3) {
      console.log(`[Fixing Summary EN] #${i + 1} (${a.id}): "${a.title_en}"`);
      const category = (a.category || 'Tech Trends & Startups') as CanonicalCategory;
      const context = a.contentSnippet || a.title_en;
      const newSummaryEn = await generateTechnicalTakeawaysAsync(a.title_en, context, category, 'en');
      a.summary_en = newSummaryEn;
      isModified = true;
    }

    if (isModified) {
      fixedCount++;
    }
  }

  console.log(`[Bilingual Fixer] Successfully fixed ${fixedCount} articles out of ${articles.length}.`);

  // Write back to data/news.json
  const updatedDb = {
    ...valid.data,
    lastUpdated: new Date().toISOString(),
    articles,
  };
  fs.writeFileSync(newsPath, JSON.stringify(updatedDb, null, 2), 'utf-8');

  // Sync to long-term archive partitions and update search-index.json
  console.log('[Bilingual Fixer] Syncing to archive partitions and search index...');
  const manifest = await saveToArchive(articles);
  console.log(`[Bilingual Fixer Done] All archive partitions updated (${manifest.totalArticles} articles).`);
}

main().catch((err) => {
  console.error('[Bilingual Fixer Fatal Error]', err);
  process.exit(1);
});
