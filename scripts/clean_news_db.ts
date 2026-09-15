import fs from 'fs';
import path from 'path';
import { NewsDatabase, NewsDatabaseSchema } from '../types/news';
import {
  evaluateITRelevance,
  generateTechnicalTakeaways,
  generateTechnicalTakeawaysAsync,
  translateTitleToVietnameseAsync,
  classifyCategory,
  getCuratedArticle,
} from './it_translator';

const DATA_FILE = path.join(__dirname, '..', 'data', 'news.json');

const GENERIC_TEMPLATE_PHRASES = [
  'Điểm nhấn công nghệ đặc biệt bao gồm kiến trúc giải pháp tối ưu',
  'Đánh giá kết quả ứng dụng thực tiễn, kinh nghiệm triển khai và tác động trực tiếp tới cộng đồng kỹ sư ngành IT.',
  'Contextual breakdown of key technical developments:',
  'Core technological innovations highlighting architectural design, advanced capabilities, and key benchmarks.',
  'Practical deployment takeaways and actionable outcomes impacting the software engineering industry.',
  'Trình bày chi tiết bối cảnh, các khía cạnh kỹ thuật',
  'Phân tích tác động thực tế và giá trị ứng dụng đối với cộng đồng phát triển',
  'Bài viết cập nhật các thông tin mới nhất liên quan đến chủ đề',
  'Sign inAppearance settings',
  'AI CODE CREATION',
  'GitHub Copilot',
];

const hasVietnameseDiacritics = (str?: string) =>
  Boolean(str && /[àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(str));

export async function cleanNewsDatabase() {
  console.log('[Clean DB] Reading data/news.json...');
  if (!fs.existsSync(DATA_FILE)) {
    console.error('[Clean DB Error] data/news.json does not exist!');
    return;
  }

  const rawData = fs.readFileSync(DATA_FILE, 'utf-8');
  const db: NewsDatabase = JSON.parse(rawData);

  const initialCount = db.articles.length;
  console.log(`[Clean DB] Initial total articles: ${initialCount}`);

  let removedCount = 0;
  let updatedCount = 0;
  const cleanedArticles = [];

  for (const article of db.articles) {
    const title = article.originalTitle || article.title_vi;
    const content = article.contentSnippet || article.summary_vi.join(' ');

    // 1. Evaluate IT Relevance
    const relevance = evaluateITRelevance(title, content);

    if (!relevance.isIT) {
      console.log(`[Clean DB] ❌ Purged Non-IT Article: "${article.title_vi}" (${relevance.reason})`);
      removedCount++;
      continue;
    }

    // 2. Check for navigation junk or boilerplate template in summary
    const hasGenericTemplate = article.summary_vi.some((line) =>
      GENERIC_TEMPLATE_PHRASES.some((phrase) => line.includes(phrase))
    );

    const isEnglishOnlyTitle =
      article.sourceOrigin === 'global' && !hasVietnameseDiacritics(article.title_vi);

    const isEnglishOnlySummary =
      article.sourceOrigin === 'global' &&
      article.summary_vi.some((line) => !hasVietnameseDiacritics(line));

    if (hasGenericTemplate || isEnglishOnlyTitle || isEnglishOnlySummary) {
      console.log(`[Clean DB] 🧹 Translating & cleaning article: "${article.title_vi}"`);
      const curated = getCuratedArticle(title, content);
      if (curated) {
        article.title_vi = curated.title_vi;
        article.title_en = curated.title_en;
        article.summary_vi = curated.summary_vi;
        article.summary_en = curated.summary_en;
        article.category = curated.category;
        article.tags = curated.tags;
      } else {
        const cat = classifyCategory(title, content);
        article.category = cat;
        if (isEnglishOnlyTitle) {
          article.title_vi = await translateTitleToVietnameseAsync(article.originalTitle || article.title_vi);
        }
        article.summary_vi = await generateTechnicalTakeawaysAsync(article.title_vi, content, cat, 'vi');
        article.summary_en = await generateTechnicalTakeawaysAsync(article.title_en, content, cat, 'en');
      }
      updatedCount++;
    }

    cleanedArticles.push(article);
  }

  const updatedDb: NewsDatabase = {
    lastUpdated: new Date().toISOString(),
    totalArticles: cleanedArticles.length,
    articles: cleanedArticles,
  };

  const validation = NewsDatabaseSchema.safeParse(updatedDb);
  if (!validation.success) {
    console.error('[Clean DB Error] Validation failed:', validation.error);
    return;
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify(updatedDb, null, 2), 'utf-8');
  console.log(`[Clean DB Success] Finished!`);
  console.log(` - Removed non-IT articles: ${removedCount}`);
  console.log(` - Refactored template summaries: ${updatedCount}`);
  console.log(` - Total remaining IT articles in DB: ${cleanedArticles.length}`);
}

if (require.main === module) {
  cleanNewsDatabase().catch((err) => {
    console.error('[Clean DB Fatal Error]', err);
    process.exit(1);
  });
}
