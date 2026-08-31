'use client';

import React from 'react';
import { NewsItem } from '../types/news';
import { useBilingual } from './BilingualContext';

interface TrendingTickerProps {
  articles: NewsItem[];
  onSelectArticle: (article: NewsItem) => void;
}

export const TrendingTicker: React.FC<TrendingTickerProps> = ({ articles, onSelectArticle }) => {
  const { lang, t } = useBilingual();

  if (!articles || articles.length === 0) return null;

  const topTrending = articles.slice(0, 5);

  return (
    <div className="w-full bg-[#0E121B] border-y border-white/10 py-2 overflow-hidden mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-3">
        <div className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold shrink-0 uppercase tracking-wider">
          {t.trendingNow}
        </div>

        <div className="flex items-center gap-6 overflow-x-auto scrollbar-none text-xs text-slate-300">
          {topTrending.map((item, index) => (
            <button
              key={item.id}
              onClick={() => onSelectArticle(item)}
              className="flex items-center gap-2 shrink-0 hover:text-emerald-400 transition-colors text-left"
            >
              <span className="font-mono text-slate-500 text-[11px]">#{index + 1}</span>
              <span className="font-medium line-clamp-1 max-w-xs sm:max-w-md">
                {lang === 'vi' ? item.title_vi : item.title_en}
              </span>
              <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded font-mono">
                {item.hotScore}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
