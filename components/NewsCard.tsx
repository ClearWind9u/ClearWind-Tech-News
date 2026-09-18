'use client';

import React from 'react';
import { NewsItem, getCategoryLabel, formatRelativeTime } from '../types/news';
import { useBilingual } from './BilingualContext';
import {
  Clock,
  Bookmark,
  Calendar,
  Zap,
  ArrowUpRight,
  Cpu,
  Terminal,
  Cloud,
  ShieldCheck,
  Smartphone,
  Headphones,
} from 'lucide-react';

interface NewsCardProps {
  article: NewsItem;
  onSelectArticle: (article: NewsItem) => void;
  onListen?: (article: NewsItem) => void;
  isFocused?: boolean;
}

interface CategoryTheme {
  acronym: string;
  icon: React.ComponentType<{ className?: string }>;
  chipClass: string;
  glowClass: string;
  bgGradient: string;
}

const CATEGORY_THEMES: Record<string, CategoryTheme> = {
  'AI & Machine Learning': {
    acronym: 'AI / MACHINE LEARNING',
    icon: Cpu,
    chipClass: 'bg-purple-500/15 text-purple-600 dark:text-purple-300 border-purple-500/30',
    glowClass: 'bg-purple-500/25',
    bgGradient: 'bg-gradient-to-br from-purple-950/40 via-slate-900/80 to-slate-950 dark:from-purple-950/50 dark:via-[#0D101B] dark:to-[#07090F]',
  },
  'Software Engineering': {
    acronym: 'SOFTWARE ARCHITECTURE',
    icon: Terminal,
    chipClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30',
    glowClass: 'bg-emerald-500/25',
    bgGradient: 'bg-gradient-to-br from-emerald-950/40 via-slate-900/80 to-slate-950 dark:from-emerald-950/50 dark:via-[#0D101B] dark:to-[#07090F]',
  },
  'DevOps & Cloud': {
    acronym: 'DEVOPS & CLOUD INFRA',
    icon: Cloud,
    chipClass: 'bg-sky-500/15 text-sky-600 dark:text-sky-300 border-sky-500/30',
    glowClass: 'bg-sky-500/25',
    bgGradient: 'bg-gradient-to-br from-sky-950/40 via-slate-900/80 to-slate-950 dark:from-sky-950/50 dark:via-[#0D101B] dark:to-[#07090F]',
  },
  'Cybersecurity': {
    acronym: 'CYBERSECURITY & DEFENSE',
    icon: ShieldCheck,
    chipClass: 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/30',
    glowClass: 'bg-rose-500/25',
    bgGradient: 'bg-gradient-to-br from-rose-950/40 via-slate-900/80 to-slate-950 dark:from-rose-950/50 dark:via-[#0D101B] dark:to-[#07090F]',
  },
  'Mobile & Web': {
    acronym: 'WEB & MOBILE ECOSYSTEM',
    icon: Smartphone,
    chipClass: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border-cyan-500/30',
    glowClass: 'bg-cyan-500/25',
    bgGradient: 'bg-gradient-to-br from-cyan-950/40 via-slate-900/80 to-slate-950 dark:from-cyan-950/50 dark:via-[#0D101B] dark:to-[#07090F]',
  },
  'Tech Trends & Startups': {
    acronym: 'VENTURE & TECH TRENDS',
    icon: Zap,
    chipClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30',
    glowClass: 'bg-amber-500/25',
    bgGradient: 'bg-gradient-to-br from-amber-950/40 via-slate-900/80 to-slate-950 dark:from-amber-950/50 dark:via-[#0D101B] dark:to-[#07090F]',
  },
};

export const NewsCard: React.FC<NewsCardProps> = ({
  article,
  onSelectArticle,
  onListen,
  isFocused = false,
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
  const summaryPoints =
    (lang === 'vi' ? article.summary_vi : article.summary_en) ||
    article.summary_vi ||
    [];
  const categoryLabel = getCategoryLabel(article.category, lang);
  const timeAgo = formatRelativeTime(article.publishedAt, lang);
  const read = isRead(article.id);
  const theme = CATEGORY_THEMES[article.category] ?? CATEGORY_THEMES['Tech Trends & Startups'];
  const IconComponent = theme.icon;

  const handleCardClick = () => {
    markAsRead(article.id);
    onSelectArticle(article);
  };

  return (
    <article
      id={`article-card-${article.id}`}
      onClick={handleCardClick}
      className={`group relative rounded-2xl bg-white dark:bg-[#11141E] hover:bg-slate-50 dark:hover:bg-[#151A27] border p-4 sm:p-5 cursor-pointer transition-all duration-200 flex flex-col justify-between h-full shadow-xs hover:shadow-lg hover:-translate-y-0.5 ${
        isFocused
          ? 'ring-2 ring-emerald-500 dark:ring-emerald-400 border-emerald-500/80 dark:border-emerald-400/80 shadow-xl shadow-emerald-500/20 -translate-y-1 z-10'
          : 'border-slate-200/90 dark:border-white/[0.08] hover:border-emerald-500/50 dark:hover:border-emerald-500/40'
      } ${read ? 'opacity-85' : 'opacity-100'}`}
    >
      <div className="flex flex-col flex-1">
        {/* Visual Media Header (16:9 Thumbnail or Typographic Monogram) */}
        <div className="w-full aspect-[16/9] mb-3.5 rounded-xl overflow-hidden bg-slate-900 dark:bg-[#080A10] border border-slate-200/80 dark:border-white/[0.06] shrink-0 relative">
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
              className={`w-full h-full ${theme.bgGradient} flex flex-col items-center justify-center relative p-4 text-center overflow-hidden`}
            >
              {/* Subtle ambient radiant glow orb */}
              <div
                className={`absolute w-32 h-32 rounded-full ${theme.glowClass} blur-2xl pointer-events-none opacity-70`}
                aria-hidden="true"
              />
              {/* High-tech subtle dot grid */}
              <div
                className="absolute inset-0 opacity-25 dark:opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:14px_14px]"
                aria-hidden="true"
              />

              {/* Centered Modern Tech Icon & Category Acronym */}
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-inner ${theme.chipClass} group-hover:scale-110 transition-transform duration-300`}
                >
                  <IconComponent className="w-5 h-5" />
                </div>
                <span className="font-mono text-[10.5px] font-extrabold tracking-wider text-white uppercase px-2.5 py-0.5 rounded-md bg-black/60 dark:bg-black/50 backdrop-blur-md border border-white/10 shadow-xs">
                  {theme.acronym}
                </span>
              </div>
            </div>
          )}

          {/* Floating Pill Badge (Unread Dot) */}
          {!read && (
            <div className="absolute top-2.5 left-2.5 flex items-center pointer-events-none">
              <span
                className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 shadow-xs"
                title={t.unreadBadge}
              />
            </div>
          )}
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
          {/* Quick Listen Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onListen ? onListen(article) : onSelectArticle(article);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 dark:border-emerald-500/30 text-[11px] font-bold transition-all shadow-2xs hover:scale-[1.02] active:scale-[0.98]"
            title={lang === 'vi' ? 'Nghe tóm tắt' : 'Listen Takeaways'}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>{lang === 'vi' ? 'Nghe' : 'Listen'}</span>
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

          {/* Published Date */}
          {timeAgo && (
            <span
              className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium"
              title={new Date(article.publishedAt).toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US')}
            >
              <Calendar className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
              <span>{timeAgo}</span>
            </span>
          )}
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
