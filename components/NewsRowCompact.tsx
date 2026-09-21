'use client';

import React from 'react';
import { NewsItem, getCategoryLabel, formatRelativeTime } from '../types/news';
import { useBilingual } from './BilingualContext';
import { Clock, Bookmark, Calendar, ArrowUpRight, Headphones, Layers, ListPlus, Check } from 'lucide-react';
import { MultiSourceInfo } from '../lib/trend_clustering';

interface NewsRowCompactProps {
  article: NewsItem;
  onSelectArticle: (article: NewsItem) => void;
  onListen?: (article: NewsItem) => void;
  isFocused?: boolean;
  multiSourceInfo?: MultiSourceInfo;
  isInAudioQueue?: boolean;
  onToggleAudioQueue?: (article: NewsItem) => void;
}

export const NewsRowCompact: React.FC<NewsRowCompactProps> = ({
  article,
  onSelectArticle,
  onListen,
  isFocused = false,
  multiSourceInfo,
  isInAudioQueue = false,
  onToggleAudioQueue,
}) => {
  const {
    lang,
    t,
    toggleBookmark,
    isBookmarked,
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
  const timeAgo = formatRelativeTime(article.publishedAt, lang);
  const read = isRead(article.id);

  const handleRowClick = () => {
    markAsRead(article.id);
    onSelectArticle(article);
  };

  return (
    <div
      id={`article-card-${article.id}`}
      onClick={handleRowClick}
      className={`group p-4 rounded-xl bg-white dark:bg-[#11141E] hover:bg-slate-50 dark:hover:bg-[#151B28] border transition-all duration-200 flex items-center justify-between gap-4 cursor-pointer shadow-sm hover:shadow-md ${
        isFocused
          ? 'ring-2 ring-emerald-500 dark:ring-emerald-400 border-emerald-500/80 dark:border-emerald-400/80 shadow-lg shadow-emerald-500/15 -translate-y-0.5 z-10'
          : 'border-slate-200/90 dark:border-white/[0.08] hover:border-emerald-500/50 dark:hover:border-emerald-500/40'
      } ${read ? 'opacity-85' : 'opacity-100'}`}
    >
      {/* Date & Time Badge */}
      <div
        className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-400 shrink-0 font-mono"
        title={new Date(article.publishedAt).toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US')}
      >
        <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mb-0.5" />
        <span className="text-[9.5px] font-bold truncate max-w-[44px] text-center leading-tight">{timeAgo}</span>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          {!read && <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title={t.unreadBadge} />}
          {multiSourceInfo && multiSourceInfo.sourcesCount >= 2 && (
            <span
              className="inline-flex items-center gap-1 text-[9.5px] font-mono font-bold text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30"
              title={`${multiSourceInfo.sourcesCount} ${t.multiSourceBadge}: ${multiSourceInfo.sources.join(', ')}`}
            >
              <Layers className="w-2.5 h-2.5 animate-pulse text-amber-500" />
              <span>{multiSourceInfo.sourcesCount} {t.multiSourceBadge}</span>
            </span>
          )}
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
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onListen ? onListen(article) : onSelectArticle(article);
          }}
          className="p-2 rounded-lg border bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 dark:border-emerald-500/30 transition-colors"
          title={lang === 'vi' ? 'Nghe tóm tắt' : 'Listen Takeaways'}
        >
          <Headphones className="w-3.5 h-3.5" />
        </button>

        {onToggleAudioQueue && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleAudioQueue(article);
            }}
            className={`p-2 rounded-lg border transition-colors ${
              isInAudioQueue
                ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                : 'bg-slate-50 dark:bg-[#0D1018] text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 border-slate-200 dark:border-white/10'
            }`}
            title={isInAudioQueue ? t.removeFromQueue : t.addToQueue}
          >
            {isInAudioQueue ? <Check className="w-3.5 h-3.5" /> : <ListPlus className="w-3.5 h-3.5" />}
          </button>
        )}

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
