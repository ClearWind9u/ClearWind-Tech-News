import { notFound } from 'next/navigation';
import { getNewsDatabase } from '@/lib/db';
import { getCategoryLabel, formatRelativeTime } from '@/types/news';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Calendar,
  ExternalLink,
  Flame,
  Tag,
  MapPin,
  Globe,
} from 'lucide-react';

export const revalidate = 3600;

// ─── Static Params ─────────────────────────────────────────────────────────────
export async function generateStaticParams() {
  try {
    const db = await getNewsDatabase();
    return (db.articles ?? []).map((a) => ({ id: a.id }));
  } catch {
    return [];
  }
}

// ─── Dynamic Metadata ──────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  try {
    const db = await getNewsDatabase();
    const article = db.articles.find((a) => a.id === params.id);
    if (!article) return { title: 'Bài viết không tồn tại | ClearWind' };

    const title = article.title_vi || article.title_en;
    const description = article.summary_vi?.[0] || article.summary_en?.[0] || '';

    return {
      title: `${title} | ClearWind Tech News`,
      description,
      openGraph: {
        type: 'article',
        title,
        description,
        url: `https://windtech-sandy.vercel.app/article/${article.id}`,
        siteName: 'ClearWind Tech News',
        locale: 'vi_VN',
        publishedTime: article.publishedAt,
        authors: [article.authorName || article.sourceName || 'ClearWind'],
        tags: article.tags,
        images: article.thumbnailUrl
          ? [{ url: article.thumbnailUrl, width: 1200, height: 630, alt: title }]
          : [`/article/${article.id}/opengraph-image`],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: article.thumbnailUrl
          ? [article.thumbnailUrl]
          : [`/article/${article.id}/opengraph-image`],
      },
      alternates: {
        canonical: `https://windtech-sandy.vercel.app/article/${article.id}`,
      },
    };
  } catch {
    return { title: 'ClearWind Tech News' };
  }
}

// ─── Category accent colors ────────────────────────────────────────────────────
const CAT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'AI & Machine Learning':  { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-300', border: 'border-purple-500/30' },
  'Software Engineering':   { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-300', border: 'border-emerald-500/30' },
  'DevOps & Cloud':         { bg: 'bg-sky-500/10', text: 'text-sky-600 dark:text-sky-300', border: 'border-sky-500/30' },
  'Cybersecurity':          { bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-300', border: 'border-rose-500/30' },
  'Mobile & Web':           { bg: 'bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-300', border: 'border-cyan-500/30' },
  'Tech Trends & Startups': { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-300', border: 'border-amber-500/30' },
};
const DEFAULT_COLORS = CAT_COLORS['Tech Trends & Startups'];

// ─── Page ──────────────────────────────────────────────────────────────────────
export default async function ArticlePage({ params }: { params: { id: string } }) {
  const db = await getNewsDatabase();
  const article = db.articles.find((a) => a.id === params.id);
  if (!article) notFound();

  const related = db.articles
    .filter((a) => a.id !== article.id && a.category === article.category)
    .sort((a, b) => b.hotScore - a.hotScore)
    .slice(0, 3);

  const colors = CAT_COLORS[article.category] ?? DEFAULT_COLORS;
  const catVi = getCategoryLabel(article.category, 'vi');
  const timeAgoVi = formatRelativeTime(article.publishedAt, 'vi');
  const publishedFull = new Date(article.publishedAt).toLocaleDateString('vi-VN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title_vi || article.title_en,
    alternativeHeadline: article.title_en,
    description: article.summary_vi?.[0] ?? '',
    url: `https://windtech-sandy.vercel.app/article/${article.id}`,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    inLanguage: ['vi-VN', 'en-US'],
    author: { '@type': 'Person', name: article.authorName || article.sourceName },
    publisher: {
      '@type': 'Organization',
      name: 'ClearWind Tech News',
      url: 'https://windtech-sandy.vercel.app',
      logo: { '@type': 'ImageObject', url: 'https://windtech-sandy.vercel.app/icon.svg' },
    },
    ...(article.thumbnailUrl ? { image: { '@type': 'ImageObject', url: article.thumbnailUrl } } : {}),
    keywords: article.tags.join(', '),
    articleSection: article.category,
    isAccessibleForFree: true,
    sameAs: [article.url],
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: 'https://windtech-sandy.vercel.app' },
        { '@type': 'ListItem', position: 2, name: catVi, item: `https://windtech-sandy.vercel.app/?category=${encodeURIComponent(article.category)}` },
        { '@type': 'ListItem', position: 3, name: article.title_vi || article.title_en },
      ],
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="min-h-screen bg-canvas text-body font-sans">
        {/* ── Sticky Top Nav ── */}
        <nav className="sticky top-0 z-40 border-b border-white/[0.06] bg-canvas/90 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline font-bold text-slate-800 dark:text-slate-200">ClearWind</span>
              <span className="hidden sm:inline text-slate-400">/</span>
              <span className={`hidden sm:inline font-semibold ${colors.text} truncate max-w-[200px]`}>{catVi}</span>
            </Link>

            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold transition-all shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Đọc bản gốc</span>
            </a>
          </div>
        </nav>

        {/* ── Content Grid ── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 lg:gap-12 items-start">

            {/* ── Article Main ── */}
            <main>
              {/* Eyebrow */}
              <div className="flex items-center gap-2 mb-5 flex-wrap">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${colors.bg} ${colors.text} ${colors.border}`}>
                  {catVi}
                </span>
                <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 px-2 py-1 rounded-md bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10">
                  {article.sourceName}
                </span>
                {article.sourceOrigin === 'vietnam' ? (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                    <MapPin className="w-3 h-3" />
                    Việt Nam
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                    <Globe className="w-3 h-3" />
                    Quốc tế
                  </span>
                )}
              </div>

              {/* Thumbnail */}
              {article.thumbnailUrl && (
                <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden mb-7 border border-slate-200/80 dark:border-white/[0.08] shadow-xl">
                  <img src={article.thumbnailUrl} alt={article.title_vi || article.title_en} className="w-full h-full object-cover" loading="eager" />
                </div>
              )}

              {/* Vietnamese Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight text-slate-900 dark:text-white mb-3 tracking-tight">
                {article.title_vi}
              </h1>

              {/* English Title */}
              {article.title_en && article.title_en !== article.title_vi && (
                <p className="text-base text-slate-500 dark:text-slate-400 font-medium italic mb-5 leading-snug border-l-2 border-slate-300 dark:border-slate-600 pl-4">
                  {article.title_en}
                </p>
              )}

              {/* Meta */}
              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-8 pb-6 border-b border-slate-100 dark:border-white/[0.06] flex-wrap font-mono">
                <span className="flex items-center gap-1.5" title={publishedFull}>
                  <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                  {timeAgoVi}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {article.readTimeMinutes} phút đọc
                </span>
                <span className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                  Độ nóng: {article.hotScore}/100
                </span>
                {article.authorName && article.authorName !== article.sourceName && (
                  <span className="font-semibold not-italic text-slate-600 dark:text-slate-300">
                    Bởi {article.authorName}
                  </span>
                )}
              </div>

              {/* ── Takeaways ── */}
              <section aria-label="Tóm tắt bài viết" className="space-y-8 mb-8">
                {/* VI */}
                <div>
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">VI</span>
                    <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">Tóm tắt cốt lõi</h2>
                  </div>
                  <ol className="space-y-3">
                    {(article.summary_vi ?? []).map((point, i) => (
                      <li key={i} className="flex gap-4 p-4 rounded-xl bg-slate-50 dark:bg-[#11141E] border border-slate-200/80 dark:border-white/[0.06] hover:border-emerald-500/30 dark:hover:border-emerald-500/25 transition-colors group">
                        <span className="shrink-0 w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-sm flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500/25 transition-colors">
                          {i + 1}
                        </span>
                        <p className="text-sm sm:text-[15px] leading-relaxed text-slate-700 dark:text-slate-300 pt-0.5">{point}</p>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* EN */}
                {(article.summary_en ?? []).length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/20">EN</span>
                        <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">Core Takeaways</h2>
                      </div>
                    <ol className="space-y-3">
                      {(article.summary_en ?? []).map((point, i) => (
                        <li key={i} className="flex gap-4 p-4 rounded-xl bg-slate-50 dark:bg-[#11141E] border border-slate-200/80 dark:border-white/[0.06] hover:border-sky-500/30 dark:hover:border-sky-500/25 transition-colors group">
                          <span className="shrink-0 w-7 h-7 rounded-lg bg-sky-500/15 text-sky-600 dark:text-sky-400 font-mono font-bold text-sm flex items-center justify-center border border-sky-500/20 group-hover:bg-sky-500/25 transition-colors">
                            {i + 1}
                          </span>
                          <p className="text-sm sm:text-[15px] leading-relaxed text-slate-700 dark:text-slate-300 pt-0.5">{point}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </section>

              {/* Tags */}
              {article.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap mb-8">
                  <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {article.tags.map((tag) => (
                    <Link key={tag} href={`/?tag=${encodeURIComponent(tag)}`}
                      className="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-white/10 hover:border-emerald-500/40 transition-all">
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}

              {/* Read Original CTA */}
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-base transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5 active:translate-y-0"
              >
                <ExternalLink className="w-5 h-5" />
                Đọc bài viết đầy đủ tại {article.sourceName}
              </a>
            </main>

            {/* ── Related Sidebar ── */}
            <aside className="lg:sticky lg:top-20 space-y-4">
              <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono">
                {catVi} — Cùng chủ đề
              </h2>
              {related.length === 0 && (
                <p className="text-sm text-slate-400 dark:text-slate-500 italic">Chưa có bài viết liên quan.</p>
              )}
              {related.map((rel) => (
                <Link key={rel.id} href={`/article/${rel.id}`}
                  className="block p-3.5 rounded-xl bg-white dark:bg-[#11141E] border border-slate-200/80 dark:border-white/[0.08] hover:border-emerald-500/40 hover:bg-slate-50 dark:hover:bg-[#151A27] transition-all group shadow-sm hover:shadow-md">
                  {rel.thumbnailUrl && (
                    <div className="w-full aspect-[16/9] rounded-lg overflow-hidden mb-3 border border-slate-200/50 dark:border-white/[0.05]">
                      <img src={rel.thumbnailUrl} alt={rel.title_vi || rel.title_en} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    </div>
                  )}
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug mb-2">
                    {rel.title_vi || rel.title_en}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 dark:text-slate-500">
                    <span>{rel.sourceName}</span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {rel.readTimeMinutes}p</span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5 text-orange-500"><Flame className="w-2.5 h-2.5" /> {rel.hotScore}</span>
                  </div>
                </Link>
              ))}

              <Link href={`/?category=${encodeURIComponent(article.category)}`}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-slate-200 dark:border-white/[0.08] text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/40 transition-all">
                <span>Xem tất cả bài {catVi}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
