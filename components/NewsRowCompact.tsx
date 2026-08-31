'use client';

import React from 'react';
import { NewsItem, getCategoryLabel } from '../types/news';
import { useBilingual } from './BilingualContext';
import { Clock, Bookmark, Heart, ArrowUpRight } from 'lucide-react';

interface NewsRowCompactProps {
  article: NewsItem;
  onSelectArticle: (article: NewsItem) => void;
}

export const NewsRowCompact: React.FC<NewsRowCompactProps> = ({ article, onSelectArticle }) => {
  const { lang, t, toggleBookmark, isBookmarked, toggleUpvote, isUpvoted, setSelectedTag } = useBilingual();

  const title = lang === 'vi' ? article.title_vi : article.title_en;
  const categoryLabel = getCategoryLabel(article.category, lang);
  const formattedDate = new Date(article.publishedAt).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', {
    month: '2-digit',
    day: '2-digit',
  });

  const upvoteCount = (article.upvotes || 0) + (isUpvoted(article.id) ? 1 : 0);

  return (
    <div
      onClick={() => onSelectArticle(article)}
      className="group p-4 rounded-xl bg-[#121722] hover:bg-[#161D2B] border border-white/10 hover:border-emerald-500/50 transition-colors duration-200 flex items-center justify-between gap-4 cursor-pointer"
    >
      {/* Upvote Box */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toggleUpvote(article.id);
        }}
        className={`flex flex-col items-center justify-center w-11 h-11 rounded-lg border text-xs font-mono transition-colors shrink-0 ${
          isUpvoted(article.id)
            ? 'bg-red-500/20 text-red-400 border-red-500/40 shadow-sm'
            : 'bg-[#0B0E14] border-slate-800 text-slate-300 hover:text-red-400 hover:border-red-500/30'
        }`}
      >
        <Heart className={`w-3.5 h-3.5 ${isUpvoted(article.id) ? 'fill-red-400' : ''}`} />
        <span className="text-[10px] font-bold mt-0.5">{upvoteCount}</span>
      </button>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700">
            {article.sourceName}
          </span>
          <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            {categoryLabel}
          </span>
          <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 font-medium">
            <Clock className="w-2.5 h-2.5" />
            {article.readTimeMinutes} {t.readTime}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1 leading-snug">
          {title}
        </h3>

        <div className="flex items-center gap-2 mt-1">
          {article.tags.slice(0, 3).map((tag, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedTag(tag);
              }}
              className="text-[10px] font-mono text-slate-400 hover:text-emerald-300"
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-slate-400 font-mono">
          <span>{article.hotScore} pts</span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleBookmark(article.id);
          }}
          className={`p-2 rounded-lg border transition-colors ${
            isBookmarked(article.id)
              ? 'bg-emerald-500 text-white border-emerald-400'
              : 'bg-[#0B0E14] text-slate-300 hover:text-emerald-400 border-slate-800'
          }`}
          title={t.bookmarks}
        >
          <Bookmark className="w-3.5 h-3.5" />
        </button>

        <span className="p-2 text-slate-400 group-hover:text-emerald-400 transition-colors">
          <ArrowUpRight className="w-4 h-4" />
        </span>
      </div>
    </div>
  );
};
