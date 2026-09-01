'use client';

import React from 'react';
import { NewsItem, getCategoryLabel } from '../types/news';
import { useBilingual } from './BilingualContext';
import {
  Clock,
  Bookmark,
  ArrowUpRight,
  Heart,
  Sparkles,
  Code2,
  Cloud,
  ShieldCheck,
  Smartphone,
  Rocket,
  Zap,
} from 'lucide-react';

interface NewsCardProps {
  article: NewsItem;
  onSelectArticle: (article: NewsItem) => void;
}

// Category-themed visual fallback banner configurations
const CATEGORY_THEMES: Record<
  string,
  {
    bgGradient: string;
    borderAccent: string;
    glowColor: string;
    icon: React.ReactNode;
    techSubtitle: string;
  }
> = {
  'AI & Machine Learning': {
    bgGradient: 'from-purple-950/70 via-[#10141E] to-cyan-950/70',
    borderAccent: 'border-purple-500/20',
    glowColor: 'bg-purple-500/10',
    icon: <Sparkles className="w-8 h-8 text-cyan-400" />,
    techSubtitle: 'NEURAL INTELLIGENCE',
  },
  'Software Engineering': {
    bgGradient: 'from-emerald-950/70 via-[#10141E] to-teal-950/70',
    borderAccent: 'border-emerald-500/20',
    glowColor: 'bg-emerald-500/10',
    icon: <Code2 className="w-8 h-8 text-emerald-400" />,
    techSubtitle: 'CLEAN ARCHITECTURE',
  },
  'DevOps & Cloud': {
    bgGradient: 'from-blue-950/70 via-[#10141E] to-indigo-950/70',
    borderAccent: 'border-blue-500/20',
    glowColor: 'bg-blue-500/10',
    icon: <Cloud className="w-8 h-8 text-blue-400" />,
    techSubtitle: 'CLOUD INFRASTRUCTURE',
  },
  'Cybersecurity': {
    bgGradient: 'from-slate-950 via-[#10141E] to-emerald-950/70',
    borderAccent: 'border-emerald-500/20',
    glowColor: 'bg-emerald-500/10',
    icon: <ShieldCheck className="w-8 h-8 text-emerald-400" />,
    techSubtitle: 'ZERO TRUST DEFENSE',
  },
  'Mobile & Web': {
    bgGradient: 'from-indigo-950/70 via-[#10141E] to-pink-950/60',
    borderAccent: 'border-indigo-500/20',
    glowColor: 'bg-indigo-500/10',
    icon: <Smartphone className="w-8 h-8 text-indigo-400" />,
    techSubtitle: 'MODERN WEB & MOBILE',
  },
  'Tech Trends & Startups': {
    bgGradient: 'from-amber-950/70 via-[#10141E] to-emerald-950/60',
    borderAccent: 'border-amber-500/20',
    glowColor: 'bg-amber-500/10',
    icon: <Rocket className="w-8 h-8 text-amber-400" />,
    techSubtitle: 'NEXT-GEN INNOVATION',
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

  const formattedDate = new Date(article.publishedAt).toLocaleDateString(
    lang === 'vi' ? 'vi-VN' : 'en-US',
    {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }
  );

  const title = lang === 'vi' ? article.title_vi : article.title_en;
  const summaryPoints = lang === 'vi' ? article.summary_vi : article.summary_en;
  const categoryLabel = getCategoryLabel(article.category, lang);
  const upvoteCount = (article.upvotes || 0) + (isUpvoted(article.id) ? 1 : 0);
  const read = isRead(article.id);

  const theme = CATEGORY_THEMES[article.category] ?? CATEGORY_THEMES['Tech Trends & Startups'];

  const handleCardClick = () => {
    markAsRead(article.id);
    onSelectArticle(article);
  };

  return (
    <article
      onClick={handleCardClick}
      className={`group relative rounded-2xl bg-[#121722] hover:bg-[#151C2A] border p-4 sm:p-4.5 cursor-pointer transition-all duration-200 flex flex-col justify-between h-full shadow-sm hover:shadow-md ${
        read ? 'border-white/5 opacity-90' : 'border-white/10 hover:border-emerald-500/50'
      }`}
    >
      <div className="flex flex-col flex-1">
        {/* Uniform Top Visual Header: Real Image or Category-Themed IT Tech Banner */}
        <div className="w-full aspect-[16/9] mb-3.5 rounded-xl overflow-hidden bg-[#0B0E14] border border-slate-800/80 shrink-0 relative group-hover:border-slate-700 transition-colors">
          {article.thumbnailUrl ? (
            <img
              src={article.thumbnailUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div
              className={`w-full h-full bg-gradient-to-br ${theme.bgGradient} flex flex-col items-center justify-center relative p-4 text-center overflow-hidden`}
            >
              {/* Subtle Tech Grid Pattern overlay */}
              <div
                className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px]"
                aria-hidden="true"
              />
              <div
                className={`absolute w-28 h-28 rounded-full ${theme.glowColor} blur-2xl pointer-events-none`}
              />

              <div className="relative z-10 flex flex-col items-center gap-1.5">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 shadow-lg backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                  {theme.icon}
                </div>
                <span className="text-[9px] font-mono tracking-widest text-slate-400 font-bold uppercase">
                  {theme.techSubtitle}
                </span>
              </div>
            </div>
          )}

          {/* Overlay Pill Badges on Top Banner */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 pointer-events-none">
            <div className="flex items-center gap-1.5 min-w-0">
              {!read && (
                <span
                  className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 shadow-sm animate-pulse"
                  title={t.unreadBadge}
                />
              )}
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900/90 text-slate-200 border border-slate-700/80 backdrop-blur-md truncate max-w-[110px]">
                {article.sourceName}
              </span>
            </div>

            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/90 text-slate-950 backdrop-blur-md shrink-0 font-mono shadow-sm">
              {article.hotScore} pts
            </span>
          </div>
        </div>

        {/* Category Pill */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="px-2.5 py-0.5 text-[10.5px] font-bold rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 truncate max-w-[180px]">
            {categoryLabel}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
            <Clock className="w-3 h-3 text-slate-400" />
            {article.readTimeMinutes} {t.readTime}
          </span>
        </div>

        {/* Title: 2-line clamped with stable height */}
        <h3
          className={`text-sm sm:text-[15px] leading-snug mb-3 line-clamp-2 min-h-[2.6rem] transition-colors ${
            read
              ? 'text-slate-300 font-semibold group-hover:text-emerald-400'
              : 'text-white font-bold group-hover:text-emerald-400'
          }`}
        >
          {title}
        </h3>

        {/* 3-Tier Core Takeaways (Fully readable with flexible container) */}
        <div className="space-y-2 mb-3 bg-[#0B0E14]/90 p-3 sm:p-3.5 rounded-xl border border-slate-800/90 flex-1 flex flex-col justify-start">
          <div className="text-[10px] sm:text-[10.5px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-emerald-400" />
            <span>{t.keyTakeaways}</span>
          </div>

          <div className="space-y-2 text-[11.5px] sm:text-xs text-slate-200 leading-relaxed font-normal">
            {summaryPoints.slice(0, 3).map((point, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <p className="line-clamp-2 text-slate-200">{point}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tags Row */}
        <div className="flex items-center gap-1.5 overflow-hidden whitespace-nowrap mb-3 h-6">
          {article.tags.slice(0, 3).map((tag, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedTag(tag);
              }}
              className="text-[10px] font-mono text-slate-400 hover:text-emerald-300 bg-[#0B0E14] px-2 py-0.5 rounded border border-slate-800 hover:border-emerald-500/40 transition-colors shrink-0 truncate max-w-[110px]"
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Footer Date & Actions */}
      <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300 mt-auto">
        <span className="text-[11px] text-slate-400">{formattedDate}</span>

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

          <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-400 pl-1">
            {t.quickRead}
            <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </article>
  );
};
