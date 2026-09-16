'use client';

import React, { useState, useEffect } from 'react';
import { NewsItem } from '../types/news';
import { useBilingual } from './BilingualContext';
import { Flame, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';

interface TrendingTickerProps {
  articles: NewsItem[];
  onSelectArticle: (article: NewsItem) => void;
}

export const TrendingTicker: React.FC<TrendingTickerProps> = ({ articles, onSelectArticle }) => {
  const { lang, t } = useBilingual();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Strictly sort by hottest score
  const topTrending = React.useMemo(() => {
    if (!articles || articles.length === 0) return [];
    return [...articles].sort((a, b) => b.hotScore - a.hotScore).slice(0, 8);
  }, [articles]);

  // Auto-cycle for mobile view every 4.5 seconds
  useEffect(() => {
    if (topTrending.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % topTrending.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [topTrending.length, isPaused]);

  if (topTrending.length === 0) return null;

  const currentItem = topTrending[currentIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + topTrending.length) % topTrending.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % topTrending.length);
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="w-full bg-slate-100/80 dark:bg-[#0D111A]/95 border-y border-slate-200/80 dark:border-white/10 py-2.5 mb-6 backdrop-blur-md relative z-20 shadow-xs dark:shadow-sm transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
        {/* Left Badge: Tiêu Điểm / Trending */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[11px] font-extrabold shrink-0 uppercase tracking-wider font-mono shadow-xs">
          <Flame className="w-3.5 h-3.5 text-amber-500 dark:text-orange-400 animate-pulse fill-amber-500/30 dark:fill-orange-400/30" />
          <span>{t.trendingNow}</span>
        </div>

        {/* Mobile View: Dynamic Auto-Rotating Single Highlight with Navigation Controls */}
        <div className="flex sm:hidden flex-1 items-center justify-between min-w-0 gap-2">
          <button
            onClick={() => onSelectArticle(currentItem)}
            className="flex items-center gap-2 min-w-0 text-left hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
          >
            <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 shrink-0">
              #{currentIndex + 1}
            </span>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
              {lang === 'vi' ? currentItem.title_vi : currentItem.title_en}
            </span>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 shrink-0">
              {currentItem.hotScore} pts
            </span>
          </button>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handlePrev}
              className="p-1 rounded-lg bg-white dark:bg-white/[0.06] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 transition-colors"
              title="Tin trước"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleNext}
              className="p-1 rounded-lg bg-white dark:bg-white/[0.06] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 transition-colors"
              title="Tin tiếp theo"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Desktop View: Smooth Horizontal Ticker with Ranking Badges */}
        <div className="hidden sm:flex items-center gap-6 overflow-x-auto scrollbar-none text-xs text-slate-600 dark:text-slate-300 flex-1">
          {topTrending.map((item, index) => {
            const isTopRank = index === 0;
            const isSecondRank = index === 1;

            return (
              <button
                key={item.id}
                onClick={() => onSelectArticle(item)}
                className="group flex items-center gap-2 shrink-0 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left py-0.5"
              >
                <span
                  className={`font-mono text-[10.5px] font-bold px-1.5 py-0.5 rounded border transition-colors ${
                    isTopRank
                      ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40 shadow-xs'
                      : isSecondRank
                      ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/40'
                      : 'bg-slate-200 dark:bg-white/[0.06] text-slate-600 dark:text-slate-400 border-slate-300 dark:border-white/10'
                  }`}
                >
                  #{index + 1}
                </span>

                <span className="font-medium text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors line-clamp-1 max-w-xs md:max-w-sm lg:max-w-md">
                  {lang === 'vi' ? item.title_vi : item.title_en}
                </span>

                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono bg-white dark:bg-white/[0.06] px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/10 shrink-0 font-semibold group-hover:border-emerald-500/40">
                  {item.hotScore} pts
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
