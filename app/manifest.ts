import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ClearWind Tech News',
    short_name: 'ClearWind',
    description: 'Bản tin công nghệ và IT tinh gọn 24/7 với phân tích 3 điểm cốt lõi chuyên sâu.',
    start_url: '/',
    display: 'standalone',
    background_color: '#07090E',
    theme_color: '#10B981',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
