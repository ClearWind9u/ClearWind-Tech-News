'use client';

import React from 'react';
import { NewsItem, getCategoryLabel } from '../types/news';
import { useBilingual } from './BilingualContext';
import { Clock, Bookmark, ArrowUpRight, Heart } from 'lucide-react';

interface NewsCardProps {
  article: NewsItem;
  onSelectArticle: (article: NewsItem) => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({ article, onSelectArticle }) => {
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

  const formattedDate = new Date(article.publishedAt).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const title = lang === 'vi' ? article.title_vi : article.title_en;
  const summaryPoints = lang === 'vi' ? article.summary_vi : article.summary_en;
  const categoryLabel = getCategoryLabel(article.category, lang);
  const upvoteCount = (article.upvotes || 0) + (isUpvoted(article.id) ? 1 : 0);
  const read = isRead(article.id);

  const handleCardClick = () => {
    markAsRead(article.id);
    onSelectArticle(article);
  };

  return (
    <article
      onClick={handleCardClick}
      className={`group relative rounded-2xl bg-[#121722] hover:bg-[#161D2B] border p-4 sm:p-5 cursor-pointer transition-colors duration-200 flex flex-col justify-between h-full ${
        read ? 'border-white/5 opacity-85' : 'border-white/10 hover:border-emerald-500/50 shadow-sm'
      }`}
    >
      <div>
        {/* Top Header: Source, Category, Read status indicator & Points */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 min-w-0">
            {!read && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title={t.unreadBadge} />
            )}

            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700 truncate max-w-[120px]">
              {article.sourceName}
            </span>

            <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 truncate max-w-[130px]">
              {categoryLabel}
            </span>
          </div>

          <span className="text-xs font-bold text-slate-300 font-mono shrink-0">
            {article.hotScore} pts
          </span>
        </div>

        {/* Thumbnail with fixed aspect ratio */}
        {article.thumbnailUrl ? (
          <div className="w-full aspect-[16/9] mb-3.5 rounded-xl overflow-hidden bg-[#0B0E14] border border-slate-800/80 shrink-0">
            <img
              src={article.thumbnailUrl}
              alt={title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="w-full h-1 rounded-xl mb-3" />
        )}

        {/* Title: Pure White if unread, subtle slate if read */}
        <h3
          className={`text-sm sm:text-base leading-snug mb-3.5 line-clamp-2 h-11 transition-colors ${
            read
              ? 'text-slate-300 font-semibold group-hover:text-emerald-400'
              : 'text-white font-bold group-hover:text-emerald-400'
          }`}
        >
          {title}
        </h3>

        {/* 3 Key Takeaways Container */}
        <div className="space-y-2 mb-3.5 bg-[#0B0E14]/95 p-3 sm:p-3.5 rounded-xl border border-slate-800/90 h-[145px] overflow-hidden">
          <div className="text-[10px] sm:text-[11px] font-bold text-emerald-400 mb-1 uppercase tracking-wider">
            {t.keyTakeaways}
          </div>
          {summaryPoints.slice(0, 3).map((point, idx) => (
            <div key={idx} className="flex items-start gap-1.5 sm:gap-2 text-xs text-slate-200 leading-relaxed font-normal">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <span className="line-clamp-2">{point}</span>
            </div>
          ))}
        </div>

        {/* Interactive Tags (Single line with clean overflow handling) */}
        <div className="flex items-center gap-1.5 overflow-hidden whitespace-nowrap mb-3.5 h-6">
          {article.tags.slice(0, 3).map((tag, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedTag(tag);
              }}
              className="text-[10px] font-mono text-slate-400 hover:text-emerald-300 bg-[#0B0E14] px-2 py-0.5 rounded border border-slate-800 hover:border-emerald-500/40 transition-colors shrink-0 truncate max-w-[100px]"
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Footer Info & Actions */}
      <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300 mt-auto">
        <div className="flex items-center gap-2">
          <span>{formattedDate}</span>
          <span className="flex items-center gap-1 text-slate-400 font-medium">
            <Clock className="w-3 h-3 text-slate-400" />
            {article.readTimeMinutes} {t.readTime}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Upvote Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleUpvote(article.id);
            }}
            className={`px-2 py-1 rounded-lg border flex items-center gap-1 text-[11px] font-mono font-bold transition-colors ${
              isUpvoted(article.id)
                ? 'bg-red-500/20 text-red-400 border-red-500/40'
                : 'bg-[#0B0E14] border-slate-800 text-slate-300 hover:text-red-400 hover:border-red-500/30'
            }`}
          >
            <Heart className={`w-3 h-3 ${isUpvoted(article.id) ? 'fill-red-400' : ''}`} />
            <span>{upvoteCount}</span>
          </button>

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleBookmark(article.id);
            }}
            className={`p-1.5 rounded-lg border transition-colors ${
              isBookmarked(article.id)
                ? 'bg-emerald-500 text-white border-emerald-400'
                : 'bg-[#0B0E14] border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/40'
            }`}
            title={t.readLater}
          >
            <Bookmark className="w-3.5 h-3.5" />
          </button>

          <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-400">
            {t.quickRead}
            <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </article>
  );
};
