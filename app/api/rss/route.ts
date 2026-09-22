import { NextRequest, NextResponse } from 'next/server';
import { getNewsDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

const BASE_URL = 'https://windtech-sandy.vercel.app';

function escapeXml(str: string): string {
  return (str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get('lang') === 'en' ? 'en' : 'vi';

  try {
    const db = await getNewsDatabase();
    const articles = (db.articles ?? []).slice(0, 30);

    const feedTitle =
      lang === 'vi'
        ? 'ClearWind Tech News — Bản Tin Công Nghệ & IT Tinh Gọn'
        : 'ClearWind Tech News — Curated IT Digest';
    const feedDescription =
      lang === 'vi'
        ? 'Tổng hợp tin tức công nghệ, lập trình và AI từ các nguồn uy tín. Song ngữ Việt - Anh, tự động cập nhật 24/7.'
        : 'Curated tech, software engineering and AI news from top Vietnamese and global sources. Bilingual VI-EN, updated 24/7.';

    const items = articles
      .map((article) => {
        const title =
          lang === 'vi'
            ? article.title_vi || article.title_en
            : article.title_en || article.title_vi;
        const summary =
          lang === 'vi'
            ? (article.summary_vi ?? []).join(' • ')
            : (article.summary_en ?? []).join(' • ');
        const pubDate = new Date(article.publishedAt).toUTCString();
        const articleUrl = `${BASE_URL}/article/${article.id}`;
        const tags = (article.tags ?? [])
          .map((t) => `<category>${escapeXml(t)}</category>`)
          .join('\n        ');

        return `
    <item>
      <title>${escapeXml(title)}</title>
      <link>${escapeXml(articleUrl)}</link>
      <guid isPermaLink="true">${escapeXml(articleUrl)}</guid>
      <description>${escapeXml(summary)}</description>
      <pubDate>${pubDate}</pubDate>
      <author>${escapeXml(article.authorName ?? article.sourceName ?? 'ClearWind')}</author>
      <source url="${escapeXml(article.url)}">${escapeXml(article.sourceName ?? 'ClearWind')}</source>
      ${tags}
      ${article.thumbnailUrl ? `<enclosure url="${escapeXml(article.thumbnailUrl)}" type="image/jpeg" length="0" />` : ''}
    </item>`;
      })
      .join('');

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
>
  <channel>
    <title>${escapeXml(feedTitle)}</title>
    <link>${BASE_URL}</link>
    <description>${escapeXml(feedDescription)}</description>
    <language>${lang === 'vi' ? 'vi-VN' : 'en-US'}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <managingEditor>contact@clearwind.tech (ClearWind Editorial)</managingEditor>
    <generator>ClearWind Tech News Auto-Digest</generator>
    <ttl>360</ttl>
    <atom:link href="${BASE_URL}/api/rss?lang=${lang}" rel="self" type="application/rss+xml" />
    <image>
      <url>${BASE_URL}/icon.svg</url>
      <title>${escapeXml(feedTitle)}</title>
      <link>${BASE_URL}</link>
    </image>
    ${items}
  </channel>
</rss>`;

    return new NextResponse(rss, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=600',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error: any) {
    return new NextResponse(`RSS generation error: ${error.message}`, { status: 500 });
  }
}
