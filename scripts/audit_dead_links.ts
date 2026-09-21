import fs from 'fs';
import path from 'path';
import { NewsDatabase, NewsItem } from '../types/news';
import { saveNewsDatabase } from '../lib/db';
import { isEditorialCleanArticle } from './it_translator';

const DATA_FILE = path.join(process.cwd(), 'data', 'news.json');

// Modern Browser User-Agent to prevent anti-scraping blocks from VnExpress, Tuổi Trẻ, etc.
const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 ClearWindLinkAuditor/1.0',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
  'Cache-Control': 'no-cache',
};

interface CheckResult {
  isAlive: boolean;
  statusCode?: number;
  reason?: string;
}

/**
 * Checks URL availability.
 * Uses HTTP HEAD first for speed, falls back to GET if server rejects HEAD.
 */
async function checkUrlAvailability(url: string, retryCount = 0): Promise<CheckResult> {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { isAlive: false, reason: 'Invalid Protocol' };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'HEAD',
        headers: BROWSER_HEADERS,
        redirect: 'follow',
        signal: controller.signal,
      });

      if ([405, 406, 501].includes(response.status)) {
        clearTimeout(timeoutId);
        const getController = new AbortController();
        const getTimeout = setTimeout(() => getController.abort(), 8000);
        response = await fetch(url, {
          method: 'GET',
          headers: BROWSER_HEADERS,
          redirect: 'follow',
          signal: getController.signal,
        });
        clearTimeout(getTimeout);
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (retryCount < 1) {
        await new Promise((res) => setTimeout(res, 1500));
        return checkUrlAvailability(url, retryCount + 1);
      }
      return { isAlive: false, reason: err?.name === 'AbortError' ? 'Timeout' : 'Network/DNS Error' };
    }

    clearTimeout(timeoutId);

    if (response.status === 404 || response.status === 410) {
      return { isAlive: false, statusCode: response.status, reason: `HTTP ${response.status} (Deleted)` };
    }

    if (response.redirected) {
      const finalUrl = new URL(response.url);
      const isRoot = finalUrl.pathname === '/' || finalUrl.pathname === '';
      const originalPath = parsed.pathname;
      if (originalPath.length > 6 && isRoot) {
        return { isAlive: false, statusCode: 301, reason: 'Redirected to Root Domain' };
      }
      if (
        finalUrl.pathname.includes('/404') ||
        finalUrl.pathname.includes('/error') ||
        finalUrl.pathname.includes('/not-found')
      ) {
        return { isAlive: false, statusCode: 404, reason: 'Redirected to Error Page' };
      }
    }

    if (response.status >= 200 && response.status < 400) {
      return { isAlive: true, statusCode: response.status };
    }

    // WAF/anti-bot: 403/406/429 — do NOT prune, human users can still access
    if ([403, 406, 429].includes(response.status)) {
      return { isAlive: true, statusCode: response.status, reason: 'Protected by WAF (Preserved)' };
    }

    if (response.status >= 500 && retryCount < 1) {
      await new Promise((res) => setTimeout(res, 2000));
      return checkUrlAvailability(url, retryCount + 1);
    }

    return { isAlive: false, statusCode: response.status, reason: `HTTP ${response.status}` };
  } catch (err: any) {
    if (retryCount < 1) {
      await new Promise((res) => setTimeout(res, 1500));
      return checkUrlAvailability(url, retryCount + 1);
    }
    return { isAlive: false, reason: err?.message ?? 'Connection Refused' };
  }
}

/**
 * Worker pool to process items concurrently with bounded parallelism
 */
async function asyncPool<T, R>(
  poolLimit: number,
  items: T[],
  iteratorFn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  const executing: Promise<any>[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const p = Promise.resolve().then(() => iteratorFn(item, i));
    results.push(p as any);

    if (poolLimit <= items.length) {
      const e: Promise<any> = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= poolLimit) {
        await Promise.race(executing);
      }
    }
  }
  return Promise.all(results);
}

// ─── Phase 2: Content Re-Validator ────────────────────────────────────────────

/**
 * Gemini Model Fallback Chain — mirrors fetch_news.ts for consistency.
 * Ordered: quality first → high-RPD Lite models (500/day) as safety net.
 * See fetch_news.ts GEMINI_MODELS comment for full quota rationale.
 */
const GEMINI_MODELS = [
  'gemini-2.5-flash',        // Tier 1: Best quality,      RPM: 5,  RPD: 20
  'gemini-2.5-flash-lite',   // Tier 2: Fast + 2x RPM,     RPM: 10, RPD: 20
  'gemini-3.5-flash-lite',   // Tier 3: HIGH QUOTA backup,  RPM: 15, RPD: 500 ← Critical
  'gemini-3.1-flash-lite',   // Tier 4: HIGH QUOTA backup,  RPM: 15, RPD: 500 ← Critical
  'gemini-3.5-flash',        // Tier 5: Newer mid-tier,     RPM: 5,  RPD: 20
  'gemini-1.5-flash',        // Tier 6: Legacy reliable,    most permissive fallback
];

const VI_DIACRITICS_RE = /[àáảãạăắặẳẵằâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/i;

/**
 * Detects whether an existing article's content needs Gemini re-generation.
 * Covers: boilerplate templates, missing VI diacritics in summary_vi,
 * Vietnamese text leaking into summary_en, incomplete/short summaries.
 */
function needsContentRevalidation(article: NewsItem): boolean {
  const BOILERPLATE_PATTERNS = [
    /^tổng quan bối cảnh.*được ghi nhận/i,
    /^thảo luận kiến trúc hệ thống/i,
    /^hướng dẫn xây dựng.*middleware/i,
    /^top trending discussion with \d+ points/i,
    /^phân tích bối cảnh và sự kiện/i,
    /^điểm nhấn công nghệ đặc biệt bao gồm/i,
    /^nâng cao năng lực ứng phó/i,
    /^chủ đề thảo luận kỹ thuật phần mềm/i,
    /key architectural developments and core background regarding/i,
    /in-depth technical breakdown and implementation mechanisms introduced in/i,
    /practical engineering impact and actionable takeaways for developers building with/i,
  ];

  const viSummary = (article.summary_vi ?? []).join(' ');
  const enSummary = (article.summary_en ?? []).join(' ');

  // 1. Boilerplate template text detected in VI summary
  if (BOILERPLATE_PATTERNS.some((p) => p.test(viSummary))) return true;

  // 2. summary_vi has no Vietnamese diacritics at all (likely all-English)
  if (viSummary.length > 20 && !VI_DIACRITICS_RE.test(viSummary)) return true;

  // 3. summary_en contains Vietnamese diacritics (language contamination)
  if (enSummary.length > 20 && VI_DIACRITICS_RE.test(enSummary)) return true;

  // 4. Summary arrays have fewer than 3 items
  if (!article.summary_vi || article.summary_vi.length < 3) return true;
  if (!article.summary_en || article.summary_en.length < 3) return true;

  // 5. Any individual summary point is suspiciously short (< 15 chars = truncated/junk)
  const tooShort = [...(article.summary_vi ?? []), ...(article.summary_en ?? [])].some(
    (s) => typeof s === 'string' && s.trim().length < 15
  );
  if (tooShort) return true;

  // 6. Editorial junk patterns (forum comments residue)
  if (!isEditorialCleanArticle(article.title_vi, article.summary_vi, article.contentSnippet)) return true;

  return false;
}

/**
 * Calls Gemini to regenerate bilingual title + 3-point summary for a stale article.
 * Returns only the updated fields to be merged; returns null on failure.
 */
async function regenerateSummaryWithGemini(
  article: NewsItem,
  apiKey: string
): Promise<Partial<NewsItem> | null> {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(apiKey);

  const isVN = article.sourceOrigin === 'vietnam';
  const context = [
    article.originalTitle ?? article.title_en,
    article.contentSnippet ?? '',
  ]
    .join('\n')
    .substring(0, 1200);

  const prompt = `
Bạn là chuyên gia phân tích công nghệ cao cấp và kỹ sư trưởng (Principal Engineer).
Nhiệm vụ: Phân tích bài báo IT dưới đây và trả về DUY NHẤT một JSON Object hợp lệ (không markdown, không giải thích thêm).

Nguồn tin: ${isVN ? 'Việt Nam (bài gốc tiếng Việt)' : 'Quốc tế (bài gốc tiếng Anh)'}
Tiêu đề gốc: ${article.originalTitle ?? article.title_en}
Nội dung: ${context}

QUY TẮC BẮT BUỘC:
- title_vi: Tiêu đề hoàn toàn bằng Tiếng Việt tự nhiên, thuần Việt. Tên sản phẩm/công ty (Google, React, Kubernetes...) giữ nguyên, phần mô tả phải tiếng Việt.
- title_en: Tiêu đề hoàn toàn bằng Tiếng Anh phong cách The Verge/TechCrunch. TUYỆT ĐỐI không chứa ký tự có dấu tiếng Việt (ă, â, đ, ê, ô, ơ, ư...).
- summary_vi: Mảng ĐÚNG 3 chuỗi tiếng Việt (25-45 từ/chuỗi). PHẢI có ký tự có dấu tiếng Việt. KHÔNG được là câu rập khuôn/template.
  • Ý 1: Bối cảnh và sự kiện cốt lõi thực sự trong bài.
  • Ý 2: Chi tiết kỹ thuật, số liệu cụ thể, kiến trúc hoặc cơ chế vận hành.
  • Ý 3: Tác động thực tiễn và giá trị cho kỹ sư/lập trình viên.
- summary_en: Mảng ĐÚNG 3 chuỗi tiếng Anh kỹ thuật tương ứng (25-45 từ/chuỗi). TUYỆT ĐỐI không chứa bất kỳ ký tự có dấu tiếng Việt.

JSON Output (chỉ 4 trường này):
{
  "title_vi": "...",
  "title_en": "...",
  "summary_vi": ["...", "...", "..."],
  "summary_en": ["...", "...", "..."]
}
`;

  const errors: string[] = [];
  for (const modelName of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { responseMimeType: 'application/json', temperature: 0.15 },
      });

      const generatePromise = model.generateContent(prompt);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout (8s) exceeded')), 8000)
      );

      const result = await Promise.race([generatePromise, timeoutPromise]);
      const text = result.response
        .text()
        .trim()
        .replace(/^```json\s*/, '')
        .replace(/\s*```$/, '');
      const parsed = JSON.parse(text);

      // Strict validation of returned fields
      if (
        parsed.title_vi &&
        parsed.title_en &&
        Array.isArray(parsed.summary_vi) &&
        parsed.summary_vi.length === 3 &&
        Array.isArray(parsed.summary_en) &&
        parsed.summary_en.length === 3 &&
        VI_DIACRITICS_RE.test(parsed.summary_vi.join(' ')) &&        // VI must have diacritics
        !VI_DIACRITICS_RE.test(parsed.summary_en.join(' '))           // EN must NOT have diacritics
      ) {
        return {
          title_vi: parsed.title_vi,
          title_en: parsed.title_en,
          summary_vi: parsed.summary_vi,
          summary_en: parsed.summary_en,
        };
      }
      errors.push(`[${modelName}]: Response failed quality guard`);
    } catch (err: any) {
      errors.push(`[${modelName}]: ${String(err?.message ?? err).split('\n')[0]}`);
    }
  }

  console.warn(`  ⚠️  Re-validate failed for "${article.title_en?.slice(0, 50)}...": ${errors.slice(0, 2).join(' | ')}`);
  return null;
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export async function runDeadLinkAudit() {
  console.log('🔍 [Daily Auditor] Starting health check — Phase 1: Dead Links + Phase 2: Content Re-Validation');
  const startTime = Date.now();

  if (!fs.existsSync(DATA_FILE)) {
    console.error('❌ [Daily Auditor] data/news.json does not exist!');
    process.exit(1);
  }

  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  const db: NewsDatabase = JSON.parse(raw);
  const initialCount = db.articles.length;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  console.log(`📊 Total articles in database: ${initialCount}`);

  // ── PHASE 1: Dead Link & Content Junk Pruning ───────────────────────────────
  console.log('\n📡 [Phase 1/2] Dead Link & Editorial Quality Check...');

  const deadArticles: { article: NewsItem; reason: string }[] = [];
  const aliveArticles: NewsItem[] = [];
  let completed = 0;

  await asyncPool(6, db.articles, async (article) => {
    // 1a. Editorial quality gate first (cheap, no network)
    if (!isEditorialCleanArticle(article.title_vi, article.summary_vi, article.contentSnippet)) {
      completed++;
      deadArticles.push({ article, reason: 'Forum comment junk or toxic slang' });
      process.stdout.write(`\r  [${completed}/${initialCount}] ❌ Junk: ${article.title_vi.slice(0, 45)}...`);
      return;
    }

    // 1b. HTTP URL availability check
    const result = await checkUrlAvailability(article.url);
    completed++;

    if (result.isAlive) {
      aliveArticles.push(article);
      process.stdout.write(`\r  [${completed}/${initialCount}] ✅ OK: ${article.url.slice(0, 55)}...`);
    } else {
      deadArticles.push({ article, reason: result.reason ?? 'Dead link' });
      process.stdout.write(`\r  [${completed}/${initialCount}] ❌ Dead: ${article.url.slice(0, 55)}... (${result.reason})`);
    }
  });

  console.log('\n');
  const deadCount = deadArticles.length;
  const deathRatio = deadCount / initialCount;

  console.log('📋 [Phase 1] Results:');
  console.log(`   ✅ Healthy & Accessible: ${aliveArticles.length}`);
  console.log(`   ❌ Dead / Junk Removed:  ${deadCount} (${(deathRatio * 100).toFixed(1)}%)`);

  // SAFETY CIRCUIT BREAKER: >20% dead → network issue, not real deletions
  if (deathRatio > 0.2) {
    console.error(
      `\n🚨 [CIRCUIT BREAKER] Dead ratio ${(deathRatio * 100).toFixed(1)}% exceeds 20% safety threshold. Aborting to prevent false mass deletion!`
    );
    process.exit(1);
  }

  // ── PHASE 2: Content Re-Validator (Gemini-powered) ──────────────────────────
  let revalidatedCount = 0;

  if (geminiApiKey) {
    console.log('\n🧠 [Phase 2/2] Content Re-Validation with Gemini API...');

    const staleArticles = aliveArticles.filter(needsContentRevalidation);
    console.log(`   Articles needing re-validation: ${staleArticles.length}/${aliveArticles.length}`);

    if (staleArticles.length > 0) {
      // Max 30 per run to stay within GitHub Actions 20-min timeout & free Gemini quota
      const batch = staleArticles.slice(0, 30);
      console.log(`   Processing batch of ${batch.length} articles (max 30/run)...`);

      await asyncPool(3, batch, async (article) => {
        const fixed = await regenerateSummaryWithGemini(article, geminiApiKey);
        if (fixed) {
          const idx = aliveArticles.findIndex((a) => a.id === article.id);
          if (idx !== -1) {
            aliveArticles[idx] = { ...aliveArticles[idx], ...fixed };
            revalidatedCount++;
            console.log(`  ✏️  Fixed: "${fixed.title_vi?.slice(0, 60)}..."`);
          }
        }
      });

      console.log(`\n   ✅ Re-validation complete: ${revalidatedCount}/${batch.length} articles updated.`);
    } else {
      console.log('   ✨ All articles pass content quality — no re-validation needed.');
    }
  } else {
    console.log('\n⚠️  [Phase 2] GEMINI_API_KEY not set — skipping content re-validation (dead link audit only).');
    console.log('   Set GEMINI_API_KEY in GitHub Actions secrets to enable automatic content re-validation.');
  }

  // ── Persist Changes ─────────────────────────────────────────────────────────
  const hasChanges = deadCount > 0 || revalidatedCount > 0;

  if (!hasChanges) {
    console.log('\n✨ [Daily Auditor] All articles are healthy and content is accurate. No changes needed.');
    return;
  }

  if (deadCount > 0) {
    console.log(`\n🧹 Removing ${deadCount} dead/junk article(s):`);
    for (const { article, reason } of deadArticles) {
      console.log(`   🗑️  [${article.id}] "${article.title_vi.slice(0, 60)}..." → ${reason}`);
    }
  }

  db.articles = aliveArticles;
  db.totalArticles = aliveArticles.length;
  db.lastUpdated = new Date().toISOString();
  await saveNewsDatabase(db);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n💾 Database updated: ${aliveArticles.length} articles remaining.`);
  console.log(`🎉 [Daily Auditor] Done in ${elapsed}s — Pruned: ${deadCount} | Re-validated: ${revalidatedCount}`);
}

if (require.main === module) {
  runDeadLinkAudit().catch((err) => {
    console.error('💥 [Daily Auditor Fatal Error]:', err);
    process.exit(1);
  });
}
