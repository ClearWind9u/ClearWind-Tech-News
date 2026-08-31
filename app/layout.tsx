import type { Metadata } from 'next';
import './globals.css';
import { BilingualProvider } from '@/components/BilingualContext';

export const metadata: Metadata = {
  title: 'ClearWind Tech News - Bản Tin Công Nghệ & IT Tự Động 24/7',
  description:
    'ClearWind Tech News - Làn gió tin tức công nghệ tinh gọn 24/7. Tổng hợp và phân tích 3 điểm cốt lõi bằng AI Gemini Pro từ các nguồn tin Việt Nam và thế giới.',
  keywords: [
    'ClearWind',
    'ClearWind Tech News',
    'Tin tức công nghệ',
    'Tech News Vietnam',
    'Gemini AI',
    'Hacker News',
    'Dev.to',
    'VnExpress Số Hóa',
    'GenK',
  ],
  authors: [{ name: 'ClearWind Team' }],
  creator: 'ClearWind',
  metadataBase: new URL('https://windtech-sandy.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: 'https://windtech-sandy.vercel.app',
    title: 'ClearWind Tech News - Báo Công Nghệ & IT Tự Động 24/7',
    description: 'Chắt lọc tri thức, thanh lọc thông tin công nghệ bằng AI Gemini Pro.',
    siteName: 'ClearWind Tech News',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ClearWind Tech News - Bản Tin IT Tự Động',
    description: 'Chắt lọc tri thức, thanh lọc thông tin công nghệ bằng AI Gemini Pro.',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="antialiased selection:bg-purple-brand selection:text-white relative bg-canvas text-body">
        <div className="daily-hero-gradient" />
        <BilingualProvider>
          {children}
        </BilingualProvider>
      </body>
    </html>
  );
}
