import fs from 'fs';
import path from 'path';
import { NewsDatabase, NewsItem } from '../types/news';
import { saveToArchive } from '../lib/db';

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
 * Uses HTTP GET with early abort to avoid downloading body payload.
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
      // First try HEAD for speed and 0-bandwidth consumption
      response = await fetch(url, {
        method: 'HEAD',
        headers: BROWSER_HEADERS,
        redirect: 'follow',
        signal: controller.signal,
      });

      // If server rejects HEAD (405 Method Not Allowed, 406 Not Acceptable, etc.), fallback to GET
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

    // Explicit Article Deletion (404 Not Found, 410 Gone)
    if (response.status === 404 || response.status === 410) {
      return { isAlive: false, statusCode: response.status, reason: `HTTP ${response.status} (Deleted)` };
    }

    // Redirect inspection
    if (response.redirected) {
      const finalUrl = new URL(response.url);
      const isRoot = finalUrl.pathname === '/' || finalUrl.pathname === '';
      const originalPath = parsed.pathname;

      // Deep article redirected to generic root domain -> editorial removal
      if (originalPath.length > 6 && isRoot) {
        return { isAlive: false, statusCode: 301, reason: 'Redirected to Root Domain' };
      }
      if (finalUrl.pathname.includes('/404') || finalUrl.pathname.includes('/error') || finalUrl.pathname.includes('/not-found')) {
        return { isAlive: false, statusCode: 404, reason: 'Redirected to Error Page' };
      }
    }

    // Success responses (200 - 399)
    if (response.status >= 200 && response.status < 400) {
      return { isAlive: true, statusCode: response.status };
    }

    // Anti-bot security challenges (403 Forbidden, 406 Not Acceptable, 429 Too Many Requests)
    // When automated checks encounter anti-bot WAFs (Cloudflare/Akamai), normal users in browser can still view
    // Therefore, do NOT falsely prune valid articles.
    if ([403, 406, 429].includes(response.status)) {
      return { isAlive: true, statusCode: response.status, reason: 'Protected by WAF (Preserved)' };
    }

    // 5xx Server Errors: retry once before concluding
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
    return { isAlive: false, reason: err?.message || 'Connection Refused' };
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

export async function runDeadLinkAudit() {
  console.log('🔍 [Daily Link Auditor] Starting daily health check for news articles...');
  const startTime = Date.now();

  if (!fs.existsSync(DATA_FILE)) {
    console.error('❌ [Daily Link Auditor] data/news.json does not exist!');
    process.exit(1);
  }

  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  const db: NewsDatabase = JSON.parse(raw);
  const initialCount = db.articles.length;

  console.log(`📊 [Daily Link Auditor] Total articles to inspect: ${initialCount}`);

  const deadArticles: { article: NewsItem; reason: string }[] = [];
  const aliveArticles: NewsItem[] = [];

  let completed = 0;

  // Process in worker pool with concurrency limit of 6
  await asyncPool(6, db.articles, async (article) => {
    const result = await checkUrlAvailability(article.url);
    completed++;

    if (result.isAlive) {
      aliveArticles.push(article);
      process.stdout.write(`\r  [${completed}/${initialCount}] ✅ Active: ${article.url.slice(0, 55)}...`);
    } else {
      deadArticles.push({ article, reason: result.reason || 'Dead link' });
      process.stdout.write(`\r  [${completed}/${initialCount}] ❌ Dead: ${article.url.slice(0, 55)}... (${result.reason})`);
    }
  });

  console.log('\n');

  const deadCount = deadArticles.length;
  const deathRatio = deadCount / initialCount;

  console.log(`📋 [Daily Link Auditor] Audit Complete:`);
  console.log(`   - Total Checked: ${initialCount}`);
  console.log(`   - Healthy & Accessible Articles: ${aliveArticles.length}`);
  console.log(`   - Dead / Removed Articles: ${deadCount}`);
  console.log(`   - Dead Ratio: ${(deathRatio * 100).toFixed(1)}%`);

  // SAFETY CIRCUIT BREAKER:
  // If more than 20% of articles fail, abort immediately to prevent false mass deletion
  if (deathRatio > 0.2) {
    console.error(
      `🚨 [CIRCUIT BREAKER TRIGGERED] Dead ratio ${(deathRatio * 100).toFixed(
        1
      )}% exceeds safety threshold (20%). Aborting pruning to safeguard database!`
    );
    process.exit(1);
  }

  if (deadCount === 0) {
    console.log('✨ [Daily Link Auditor] All articles are accessible and healthy! No changes needed.');
    return;
  }

  // Prune dead articles safely
  console.log(`🧹 [Daily Link Auditor] Removing ${deadCount} dead article(s)...`);
  for (const { article, reason } of deadArticles) {
    console.log(`   🗑️ Removed: [${article.id}] "${article.title_vi.slice(0, 60)}..." (${reason})`);
  }

  // Update data/news.json
  db.articles = aliveArticles;
  db.totalArticles = aliveArticles.length;
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
  console.log(`💾 [Daily Link Auditor] Successfully updated data/news.json (${aliveArticles.length} articles remaining).`);

  // Re-synchronize search index
  console.log('🔄 [Daily Link Auditor] Rebuilding search index (data/search-index.json)...');
  await saveToArchive(aliveArticles);
  console.log('✅ [Daily Link Auditor] Search index successfully re-synchronized.');

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`🎉 [Daily Link Auditor] Finished in ${elapsed}s.`);
}

if (require.main === module) {
  runDeadLinkAudit().catch((err) => {
    console.error('💥 [Daily Link Auditor Fatal Error]:', err);
    process.exit(1);
  });
}
