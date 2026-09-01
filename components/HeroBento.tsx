'use client';

import React from 'react';
import { NewsItem, getCategoryLabel } from '../types/news';
import { useBilingual } from './BilingualContext';
import { Clock, Bookmark, ArrowUpRight } from 'lucide-react';

interface HeroBentoProps {
  articles: NewsItem[];
  onSelectArticle: (article: NewsItem) => void;
}

export const HeroBento: React.FC<HeroBentoProps> = ({ articles, onSelectArticle }) => {
  const { lang, t, toggleBookmark, isBookmarked } = useBilingual();

  if (!articles || articles.length === 0) return null;

  const mainArticle = articles[0];
  const sideArticles = articles.slice(1, 3);

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="text-xs uppercase tracking-wider font-extrabold text-slate-300">
          {t.featuredTitle}
        </h2>
        <span className="text-xs text-slate-400 font-medium">
          {lang === 'vi' ? 'Tiêu điểm biên tập' : 'Editorial Highlights'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main Bento Card (Col 8) */}
        {mainArticle && (
          <div
            onClick={() => onSelectArticle(mainArticle)}
            className="lg:col-span-8 group rounded-2xl bg-[#121722] hover:bg-[#161D2B] border border-white/10 hover:border-emerald-500/50 p-6 sm:p-7 cursor-pointer transition-colors duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-3.5">
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {getCategoryLabel(mainArticle.category, lang)}
                </span>

                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-800 text-slate-200 border border-slate-700">
                  {mainArticle.sourceName}
                </span>

                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                  {mainArticle.hotScore} pts
                </span>

                <span className="flex items-center gap-1 text-xs text-slate-400 ml-auto font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {mainArticle.readTimeMinutes} {t.readTime}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-white group-hover:text-emerald-400 transition-colors leading-snug mb-3.5">
                {lang === 'vi' ? mainArticle.title_vi : mainArticle.title_en}
              </h3>

              <div className="space-y-2 mb-5 bg-[#0B0E14]/90 p-4 rounded-xl border border-slate-800">
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1.5">
                  {t.keyTakeaways}
                </p>
                {(lang === 'vi' ? mainArticle.summary_vi : mainArticle.summary_en).map((point, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3.5 border-t border-slate-800">
              <div className="flex items-center gap-1.5 flex-wrap">
                {mainArticle.tags.slice(0, 4).map((tag, i) => (
                  <span key={i} className="text-[11px] font-mono text-slate-400 px-2.5 py-0.5 rounded bg-[#0B0E14] border border-slate-800">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBookmark(mainArticle.id);
                  }}
                  className={`p-2 rounded-lg border transition-colors ${
                    isBookmarked(mainArticle.id)
                      ? 'bg-emerald-500 text-white border-emerald-400'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/50'
                  }`}
                  title={t.bookmarks}
                >
                  <Bookmark className="w-4 h-4" />
                </button>

                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                  {t.quickRead}
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Side Bento Cards (Col 4) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {sideArticles.map((article) => (
            <div
              key={article.id}
              onClick={() => onSelectArticle(article)}
              className="flex-1 group rounded-2xl bg-[#121722] hover:bg-[#161D2B] border border-white/10 hover:border-cyan-500/40 p-5 cursor-pointer transition-colors duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    {getCategoryLabel(article.category, lang)}
                  </span>

                  <span className="text-[11px] font-bold text-slate-400 font-mono">
                    {article.hotScore} pts
                  </span>
                </div>

                <h4 className="text-sm sm:text-base font-extrabold text-white group-hover:text-cyan-400 transition-colors leading-snug line-clamp-2 mb-2">
                  {lang === 'vi' ? article.title_vi : article.title_en}
                </h4>

                <p className="text-xs text-slate-300 line-clamp-2 mb-3 leading-relaxed">
                  {(lang === 'vi' ? article.summary_vi : article.summary_en)[0]}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800 font-medium">
                <span>{article.sourceName}</span>
                <span className="inline-flex items-center gap-0.5 text-cyan-400 font-bold">
                  {t.quickRead}
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
