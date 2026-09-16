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
  const {
    lang,
    t,
    toggleBookmark,
    isBookmarked,
    toggleUpvote,
    isUpvoted,
    setSelectedTag,
    isRead,
    markAsRead,
  } = useBilingual();

  const title =
    (lang === 'vi' ? article.title_vi : article.title_en) ||
    article.title_vi ||
    article.originalTitle ||
    '';
  const categoryLabel = getCategoryLabel(article.category, lang);
  const formattedDate = new Date(article.publishedAt).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', {
    month: '2-digit',
    day: '2-digit',
  });

  const upvoteCount = (article.upvotes || 0) + (isUpvoted(article.id) ? 1 : 0);
  const read = isRead(article.id);

  const handleRowClick = () => {
    markAsRead(article.id);
    onSelectArticle(article);
  };

  return (
    <div
      onClick={handleRowClick}
      className={`group p-4 rounded-xl bg-white dark:bg-[#11141E] hover:bg-slate-50 dark:hover:bg-[#151B28] border border-slate-200/90 dark:border-white/[0.08] hover:border-emerald-500/50 dark:hover:border-emerald-500/40 transition-all duration-200 flex items-center justify-between gap-4 cursor-pointer shadow-sm hover:shadow-md ${
        read ? 'opacity-85' : 'opacity-100'
      }`}
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
            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 shadow-sm'
            : 'bg-slate-50 dark:bg-[#0D1018] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-rose-500 hover:border-rose-500/30'
        }`}
      >
        <Heart className={`w-3.5 h-3.5 ${isUpvoted(article.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
        <span className="text-[10px] font-bold mt-0.5">{upvoteCount}</span>
      </button>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          {!read && <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" title={t.unreadBadge} />}
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
            {article.sourceName}
          </span>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
            {categoryLabel}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1 font-medium">
            <Clock className="w-2.5 h-2.5" />
            {article.readTimeMinutes} {t.readTime}
          </span>
        </div>

        {/* Title */}
        <h3
          className={`text-sm sm:text-base leading-snug line-clamp-1 transition-colors font-bold ${
            read
              ? 'text-slate-600 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
              : 'text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
          }`}
        >
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
              className="text-[10px] font-mono text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-400 font-mono">
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
              ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
              : 'bg-slate-50 dark:bg-[#0D1018] text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 border-slate-200 dark:border-white/10'
          }`}
          title={t.readLater}
        >
          <Bookmark className="w-3.5 h-3.5" />
        </button>

        <span className="p-2 text-slate-400 group-hover:text-emerald-500 transition-colors">
          <ArrowUpRight className="w-4 h-4" />
        </span>
      </div>
    </div>
  );
};
