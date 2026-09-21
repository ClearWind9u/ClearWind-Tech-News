import { getNewsDatabase, getArchiveManifest } from '@/lib/db';
import { NewsAppClient } from '@/components/NewsAppClient';

export const revalidate = 60; // ISR: Revalidate every 60 seconds

export default async function HomePage() {
  const newsData = await getNewsDatabase();
  const archiveManifest = getArchiveManifest(newsData);

  // Generate ItemList JSON-LD for rich snippet indexing of the top 20 latest articles
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Top Tin Tức Công Nghệ & IT Tinh Gọn',
    description: 'Danh sách các bài báo công nghệ, lập trình và AI nổi bật nhất hôm nay.',
    itemListElement: (newsData.articles || []).slice(0, 20).map((art, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'NewsArticle',
        headline: art.title_vi || art.title_en,
        description: art.summary_vi?.[0] || art.contentSnippet || '',
        url: art.url,
        datePublished: art.publishedAt,
        inLanguage: 'vi',
        author: {
          '@type': 'Person',
          name: art.authorName || art.sourceName || 'ClearWind',
        },
        publisher: {
          '@type': 'Organization',
          name: art.sourceName || 'ClearWind Tech News',
        },
        image: art.thumbnailUrl ? [art.thumbnailUrl] : undefined,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <NewsAppClient initialData={newsData} archiveManifest={archiveManifest} />
    </>
  );
}
