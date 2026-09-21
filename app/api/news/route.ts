import { NextRequest, NextResponse } from 'next/server';
import { getNewsDatabase, getArchiveMonth, getArchiveManifest, getSearchIndex } from '@/lib/db';
import { NewsItem } from '@/types/news';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(48, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)));
    const category = searchParams.get('category') || 'all';
    const origin = searchParams.get('origin') || 'all';
    const query = (searchParams.get('q') || '').trim().toLowerCase();
    const tag = (searchParams.get('tag') || '').trim().toLowerCase();
    const month = searchParams.get('month') || 'all';
    const sort = searchParams.get('sort') || 'latest';
    const readTime = searchParams.get('readTime') || 'all';
    const hotScore = searchParams.get('hotScore') || 'all';

    // Source selection: if specific archive month is requested, load that month's partition
    let pool: NewsItem[] = [];
    if (month !== 'all') {
      pool = await getArchiveMonth(month);
    } else {
      // Default to active news database
      const db = await getNewsDatabase();
      pool = db.articles;
    }

    // Filter pipeline
    let filtered = pool.filter((article) => {
      if (category !== 'all' && article.category !== category) {
        return false;
      }

      if (origin !== 'all' && article.sourceOrigin !== origin) {
        return false;
      }

      if (tag && !article.tags?.some((t) => t.toLowerCase() === tag)) {
        return false;
      }

      if (readTime !== 'all') {
        const minutes = article.readTimeMinutes ?? 3;
        if (readTime === 'quick' && minutes > 3) return false;
        if (readTime === 'medium' && (minutes <= 3 || minutes > 6)) return false;
        if (readTime === 'deep' && minutes <= 6) return false;
      }

      if (hotScore !== 'all') {
        if (hotScore === 'trending' && article.hotScore < 85) return false;
        if (hotScore === 'superhot' && article.hotScore < 90) return false;
      }

      if (query) {
        const titleVi = (article.title_vi || '').toLowerCase();
        const titleEn = (article.title_en || '').toLowerCase();
        const originalTitle = (article.originalTitle || '').toLowerCase();
        const summaryVi = (article.summary_vi || []).join(' ').toLowerCase();
        const summaryEn = (article.summary_en || []).join(' ').toLowerCase();
        const tags = (article.tags || []).join(' ').toLowerCase();
        const source = (article.sourceName || '').toLowerCase();
        const author = (article.authorName || '').toLowerCase();

        const matches =
          titleVi.includes(query) ||
          titleEn.includes(query) ||
          originalTitle.includes(query) ||
          summaryVi.includes(query) ||
          summaryEn.includes(query) ||
          tags.includes(query) ||
          source.includes(query) ||
          author.includes(query);

        if (!matches) return false;
      }

      return true;
    });

    // Sorting
    if (sort === 'trending') {
      filtered.sort((a, b) => b.hotScore - a.hotScore);
    } else {
      filtered.sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    }

    // Pagination
    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const startIndex = (page - 1) * limit;
    const paginatedArticles = filtered.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      success: true,
      articles: paginatedArticles,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message ?? 'Unknown error' },
      { status: 500 }
    );
  }
}
