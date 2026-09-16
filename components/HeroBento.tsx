'use client';

import React from 'react';
import { NewsItem, getCategoryLabel } from '../types/news';
import { useBilingual } from './BilingualContext';
import { Clock, Bookmark, ArrowUpRight, Sparkles } from 'lucide-react';

interface HeroBentoProps {
  articles: NewsItem[];
  onSelectArticle: (article: NewsItem) => void;
}

export const HeroBento: React.FC<HeroBentoProps> = ({ articles, onSelectArticle }) => {
  const { lang, t, toggleBookmark, isBookmarked } = useBilingual();

  if (!articles || articles.length === 0) return null;

  const leadArticle = articles[0];
  const sideArticles = articles.slice(1, 3);

  const leadTitle =
    (lang === 'vi' ? leadArticle.title_vi : leadArticle.title_en) ||
    leadArticle.title_vi ||
    leadArticle.originalTitle;
  const leadSummary =
    (lang === 'vi' ? leadArticle.summary_vi : leadArticle.summary_en) ||
    leadArticle.summary_vi ||
    [];

  const leadTimeAgo = new Date(leadArticle.publishedAt).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <section className="mb-10">
      {/* Editorial Section Header (The Guardian style) */}
      <div className="flex items-center justify-between pb-3 mb-5 border-b-2 border-slate-900 dark:border-white/20">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white font-mono">
            {t.featuredTitle}
          </h2>
          <span className="hidden sm:inline-block text-[11px] font-mono text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10">
            Top 3 Digest
          </span>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {lang === 'vi' ? 'Tuyển chọn biên tập' : 'Curated Lead Package'}
        </span>
      </div>

      {/* Main Lead Package Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-5 sm:p-7 rounded-2xl bg-white dark:bg-[#11141E] border border-slate-200/90 dark:border-white/10 shadow-sm transition-colors">
        {/* Left Column: Primary Lead Story (Col 7 / Col 8) */}
        <div
          onClick={() => onSelectArticle(leadArticle)}
          className="lg:col-span-8 group cursor-pointer flex flex-col justify-between pr-0 lg:pr-6 lg:border-r border-slate-200 dark:border-white/10"
        >
          <div>
            {/* Visual Header: Photo or Elegant Monogram */}
            {leadArticle.thumbnailUrl ? (
              <div className="w-full aspect-[16/9] rounded-xl overflow-hidden mb-5 bg-slate-100 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/10 relative">
                <img
                  src={leadArticle.thumbnailUrl}
                  alt={leadTitle}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  fetchPriority="high"
                  decoding="async"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-md text-white font-mono text-[10.5px] font-bold uppercase tracking-wider">
                  Lead Story
                </div>
              </div>
            ) : null}

            {/* Category & Source Metadata Line */}
            <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
              <span className="px-2.5 py-0.5 font-bold rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono text-[11px]">
                {getCategoryLabel(leadArticle.category, lang)}
              </span>

              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {leadArticle.sourceName}
              </span>

              <span className="text-slate-400 dark:text-slate-500">•</span>

              <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                {leadTimeAgo}
              </span>

              <span className="ml-auto font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {leadArticle.hotScore} pts
              </span>
            </div>

            {/* Lead Headline */}
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-tight mb-4 font-display">
              {leadTitle}
            </h3>

            {/* Structured Key Takeaways */}
            <div className="space-y-2.5 mb-5 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.keyTakeaways}</span>
              </div>
              <div className="space-y-2">
                {leadSummary.slice(0, 3).map((point, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    <span className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0 px-1 py-0.2 rounded bg-emerald-500/10">
                      0{idx + 1}
                    </span>
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Lead Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-1.5 flex-wrap">
              {leadArticle.tags.slice(0, 3).map((tag, i) => (
                <span
                  key={i}
                  className="text-[11px] font-mono text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleBookmark(leadArticle.id);
                }}
                className={`p-2 rounded-lg border transition-all ${
                  isBookmarked(leadArticle.id)
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300'
                }`}
                title={t.bookmarks}
              >
                <Bookmark className="w-4 h-4" />
              </button>

              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono group-hover:translate-x-0.5 transition-transform">
                {t.quickRead}
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Secondary Stories Stacked (Col 4) */}
        <div className="lg:col-span-4 flex flex-col justify-between divide-y divide-slate-200 dark:divide-white/10">
          {sideArticles.map((article, index) => {
            const sideTitle =
              (lang === 'vi' ? article.title_vi : article.title_en) ||
              article.title_vi ||
              article.originalTitle;
            const sideSummary =
              (lang === 'vi' ? article.summary_vi : article.summary_en) ||
              article.summary_vi ||
              [];

            return (
              <div
                key={article.id}
                onClick={() => onSelectArticle(article)}
                className={`group cursor-pointer flex flex-col justify-between ${index === 0 ? 'pb-6' : 'pt-6'}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2 text-xs">
                    <span className="px-2 py-0.5 font-bold rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 font-mono text-[10.5px]">
                      {getCategoryLabel(article.category, lang)}
                    </span>
                    <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {article.hotScore} pts
                    </span>
                  </div>

                  <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors leading-snug line-clamp-2 mb-2 font-display">
                    {sideTitle}
                  </h4>

                  {sideSummary[0] && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
                      {sideSummary[0]}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 font-medium">
                  <span>{article.sourceName}</span>
                  <span className="inline-flex items-center gap-0.5 text-cyan-600 dark:text-cyan-400 font-bold font-mono group-hover:translate-x-0.5 transition-transform">
                    {t.quickRead}
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
