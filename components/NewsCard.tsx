'use client';

import React from 'react';
import { NewsItem, getCategoryLabel } from '../types/news';
import { useBilingual } from './BilingualContext';
import {
  Clock,
  Bookmark,
  Heart,
  Zap,
  ArrowUpRight,
} from 'lucide-react';

interface NewsCardProps {
  article: NewsItem;
  onSelectArticle: (article: NewsItem) => void;
}

// Editorial Category Monograms & Badges (Inspired by The Verge & Wired typography)
const CATEGORY_META: Record<
  string,
  {
    acronym: string;
    accentClass: string;
    lightPattern: string;
    darkPattern: string;
  }
> = {
  'AI & Machine Learning': {
    acronym: 'AI / ML',
    accentClass: 'text-purple-600 dark:text-purple-400 border-purple-500/30 bg-purple-500/10',
    lightPattern: 'from-purple-50 via-slate-50 to-indigo-50',
    darkPattern: 'from-purple-950/40 via-[#0E121B] to-slate-900',
  },
  'Software Engineering': {
    acronym: 'DEV / SYS',
    accentClass: 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    lightPattern: 'from-emerald-50 via-slate-50 to-teal-50',
    darkPattern: 'from-emerald-950/40 via-[#0E121B] to-slate-900',
  },
  'DevOps & Cloud': {
    acronym: 'CLOUD / SRE',
    accentClass: 'text-blue-600 dark:text-blue-400 border-blue-500/30 bg-blue-500/10',
    lightPattern: 'from-blue-50 via-slate-50 to-indigo-50',
    darkPattern: 'from-blue-950/40 via-[#0E121B] to-slate-900',
  },
  'Cybersecurity': {
    acronym: 'SEC / DEF',
    accentClass: 'text-red-600 dark:text-red-400 border-red-500/30 bg-red-500/10',
    lightPattern: 'from-rose-50 via-slate-50 to-orange-50',
    darkPattern: 'from-red-950/40 via-[#0E121B] to-slate-900',
  },
  'Mobile & Web': {
    acronym: 'CLIENT / WEB',
    accentClass: 'text-cyan-600 dark:text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    lightPattern: 'from-cyan-50 via-slate-50 to-sky-50',
    darkPattern: 'from-cyan-950/40 via-[#0E121B] to-slate-900',
  },
  'Tech Trends & Startups': {
    acronym: 'VENTURE / IT',
    accentClass: 'text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10',
    lightPattern: 'from-amber-50 via-slate-50 to-orange-50',
    darkPattern: 'from-amber-950/40 via-[#0E121B] to-slate-900',
  },
};

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

  const title =
    (lang === 'vi' ? article.title_vi : article.title_en) ||
    article.title_vi ||
    article.originalTitle ||
    '';
  const summaryPoints =
    (lang === 'vi' ? article.summary_vi : article.summary_en) ||
    article.summary_vi ||
    [];
  const categoryLabel = getCategoryLabel(article.category, lang);
  const upvoteCount = (article.upvotes || 0) + (isUpvoted(article.id) ? 1 : 0);
  const read = isRead(article.id);
  const meta = CATEGORY_META[article.category] ?? CATEGORY_META['Tech Trends & Startups'];

  const handleCardClick = () => {
    markAsRead(article.id);
    onSelectArticle(article);
  };

  return (
    <article
      onClick={handleCardClick}
      className={`group relative rounded-2xl bg-white dark:bg-[#11141E] hover:bg-slate-50 dark:hover:bg-[#151A27] border border-slate-200/90 dark:border-white/[0.08] hover:border-emerald-500/50 dark:hover:border-emerald-500/40 p-4 sm:p-5 cursor-pointer transition-all duration-200 flex flex-col justify-between h-full shadow-xs hover:shadow-lg hover:-translate-y-0.5 ${
        read ? 'opacity-85' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col flex-1">
        {/* Visual Media Header (16:9 Thumbnail or Typographic Monogram) */}
        <div className="w-full aspect-[16/9] mb-3.5 rounded-xl overflow-hidden bg-slate-100 dark:bg-[#090A0F] border border-slate-200/80 dark:border-white/[0.06] shrink-0 relative">
          {article.thumbnailUrl ? (
            <img
              src={article.thumbnailUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div
              className={`w-full h-full bg-gradient-to-br ${meta.lightPattern} dark:${meta.darkPattern} flex flex-col items-center justify-center relative p-4 text-center overflow-hidden`}
            >
              <div
                className="absolute inset-0 opacity-15 dark:opacity-10 bg-[radial-gradient(#000000_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"
                aria-hidden="true"
              />
              <div className="relative z-10 flex flex-col items-center gap-1">
                <span className="font-mono text-2xl font-black tracking-tight text-slate-800/80 dark:text-white/80 group-hover:tracking-widest transition-all duration-300">
                  {meta.acronym}
                </span>
              </div>
            </div>
          )}

          {/* Floating Pill Badges (Hot Score & Unread Pulse) */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-1.5">
              {!read && (
                <span
                  className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse shadow-sm"
                  title={t.unreadBadge}
                />
              )}
            </div>

            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900/85 dark:bg-black/75 text-emerald-400 font-mono backdrop-blur-md border border-white/10 shadow-xs">
              {article.hotScore} pts
            </span>
          </div>
        </div>

        {/* Eyebrow Kicker: Source + Category (Uppercase Mono - The Verge style) */}
        <div className="flex items-center gap-2 mb-2 text-[11px] font-mono tracking-wide text-slate-500 dark:text-slate-400">
          <span className="font-bold text-slate-800 dark:text-slate-200 uppercase truncate max-w-[130px]">
            {article.sourceName}
          </span>
          <span>•</span>
          <span className="uppercase text-emerald-600 dark:text-emerald-400 truncate">
            {categoryLabel}
          </span>
        </div>

        {/* Title: Editorial Headline */}
        <h3
          className={`text-[15px] sm:text-base leading-snug font-extrabold mb-2.5 line-clamp-2 transition-colors duration-200 font-display ${
            read
              ? 'text-slate-600 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
              : 'text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
          }`}
        >
          {title}
        </h3>

        {/* Clean Editorial Excerpt (Leading Takeaway Preview without bulky numbers) */}
        {summaryPoints.length > 0 && (
          <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
            {summaryPoints[0]}
          </p>
        )}
      </div>

      {/* Card Footer: Metadata & Quick Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/[0.06] text-xs">
        <div className="flex items-center gap-2">
          {/* Upvote Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleUpvote(article.id);
            }}
            className={`flex items-center gap-1 px-2 py-0.8 rounded-lg border text-xs font-mono font-medium transition-all ${
              isUpvoted(article.id)
                ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                : 'bg-slate-100/70 hover:bg-slate-200/80 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isUpvoted(article.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{upvoteCount}</span>
          </button>

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleBookmark(article.id);
            }}
            className={`p-1.5 rounded-lg border transition-all ${
              isBookmarked(article.id)
                ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                : 'bg-slate-100/70 hover:bg-slate-200/80 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
            }`}
            title={t.bookmarks}
          >
            <Bookmark className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Reading Time & Quick Read */}
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
          <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
          <span>{article.readTimeMinutes} {t.readTime}</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </article>
  );
};
