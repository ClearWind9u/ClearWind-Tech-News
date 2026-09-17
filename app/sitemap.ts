import { MetadataRoute } from 'next';
import { CANONICAL_CATEGORIES } from '@/types/news';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://windtech-sandy.vercel.app';
  const lastModified = new Date();

  // 1. Homepage
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'hourly',
      priority: 1.0,
    },
  ];

  // 2. Canonical categories
  for (const category of CANONICAL_CATEGORIES) {
    routes.push({
      url: `${baseUrl}?category=${encodeURIComponent(category)}`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.8,
    });
  }

  return routes;
}
