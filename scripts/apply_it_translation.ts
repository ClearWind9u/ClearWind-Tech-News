import fs from 'fs';
import path from 'path';
import {
  classifyCategory,
  translateTitleToVietnamese,
  generateTechnicalTakeaways,
} from './it_translator';
import { NewsItem, NewsDatabase } from '../types/news';

const DATA_FILE = path.join(__dirname, '..', 'data', 'news.json');

const raw = fs.readFileSync(DATA_FILE, 'utf-8');
const db: NewsDatabase = JSON.parse(raw);

const updatedArticles: NewsItem[] = db.articles.map((art) => {
  const isGlobal = art.sourceOrigin === 'global';
  const category = classifyCategory(art.originalTitle || art.title_en, art.contentSnippet || '');

  let titleVi = art.title_vi;
  let titleEn = art.title_en || art.originalTitle;

  if (isGlobal) {
    titleVi = translateTitleToVietnamese(art.originalTitle || art.title_en);
  }

  // Clean HTML entities if any
  titleVi = titleVi
    .replace(/&#8216;|&#8217;/g, "'")
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");

  titleEn = titleEn
    .replace(/&#8216;|&#8217;/g, "'")
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");

  const summaryVi = generateTechnicalTakeaways(titleVi, art.contentSnippet || '', category, 'vi');
  const summaryEn = generateTechnicalTakeaways(titleEn, art.contentSnippet || '', category, 'en');

  const categoryTag = category.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '');
  const tags = art.sourceOrigin === 'vietnam'
    ? [categoryTag, 'CongNghe', 'VietNam']
    : [categoryTag, 'SoftwareEngineering', 'Tech'];

  return {
    ...art,
    title_vi: titleVi,
    title_en: titleEn,
    category,
    summary_vi: summaryVi,
    summary_en: summaryEn,
    tags,
  };
});

const updatedDb: NewsDatabase = {
  lastUpdated: new Date().toISOString(),
  totalArticles: updatedArticles.length,
  articles: updatedArticles,
};

fs.writeFileSync(DATA_FILE, JSON.stringify(updatedDb, null, 2), 'utf-8');
console.log(`Successfully updated and re-classified ${updatedArticles.length} articles with pure IT Vietnamese!`);
