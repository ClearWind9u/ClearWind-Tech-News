import { getNewsDatabase, getArchiveManifest } from '@/lib/db';
import { NewsAppClient } from '@/components/NewsAppClient';

export const revalidate = 60; // ISR: Revalidate every 60 seconds

export default async function HomePage() {
  const newsData = await getNewsDatabase();
  const archiveManifest = getArchiveManifest();

  return <NewsAppClient initialData={newsData} archiveManifest={archiveManifest} />;
}
