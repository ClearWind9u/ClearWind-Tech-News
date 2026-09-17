import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { BilingualProvider } from '@/components/BilingualContext';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://windtech-sandy.vercel.app'),
  title: 'ClearWind Tech News - Bản Tin Công Nghệ & IT Tinh Gọn 24/7',
  description:
    'ClearWind Tech News - Làn gió tin tức công nghệ tinh gọn 24/7. Tổng hợp và phân tích 3 điểm cốt lõi chuyên sâu từ các nguồn tin IT uy tín hàng đầu Việt Nam và thế giới.',
  keywords: [
    'ClearWind',
    'ClearWind Tech News',
    'Tin tức công nghệ',
    'Tech News Vietnam',
    'Lập trình',
    'Software Engineering',
    'DevOps',
    'Cybersecurity',
    'Hacker News',
    'Dev.to',
    'VnExpress Số Hóa',
    'GenK',
  ],
  authors: [{ name: 'ClearWind Editorial Team' }],
  creator: 'ClearWind',
  alternates: {
    canonical: 'https://windtech-sandy.vercel.app',
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    alternateLocale: ['en_US'],
    url: 'https://windtech-sandy.vercel.app',
    title: 'ClearWind Tech News - Báo Công Nghệ & IT Tinh Gọn 24/7',
    description: 'Chắt lọc tri thức, thanh lọc thông tin công nghệ chuyên sâu mỗi ngày.',
    siteName: 'ClearWind Tech News',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'ClearWind Tech News - Báo Công Nghệ & IT Tinh Gọn',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ClearWind Tech News - Bản Tin IT Tinh Gọn',
    description: 'Chắt lọc tri thức, thanh lọc thông tin công nghệ chuyên sâu mỗi ngày.',
    images: ['/opengraph-image'],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#07090E',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'NewsMediaOrganization',
      '@id': 'https://windtech-sandy.vercel.app/#organization',
      name: 'ClearWind Tech News',
      url: 'https://windtech-sandy.vercel.app',
      logo: 'https://windtech-sandy.vercel.app/icon.svg',
      description: 'Nền tảng tổng hợp và phân tích tin tức công nghệ song ngữ tự động 24/7.',
    },
    {
      '@type': 'WebSite',
      '@id': 'https://windtech-sandy.vercel.app/#website',
      url: 'https://windtech-sandy.vercel.app',
      name: 'ClearWind Tech News',
      publisher: {
        '@id': 'https://windtech-sandy.vercel.app/#organization',
      },
      inLanguage: ['vi-VN', 'en-US'],
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://windtech-sandy.vercel.app/?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased selection:bg-emerald-500 selection:text-white relative bg-canvas text-body font-sans">
        <div className="daily-hero-gradient" />
        <BilingualProvider>{children}</BilingualProvider>
      </body>
    </html>
  );
}
