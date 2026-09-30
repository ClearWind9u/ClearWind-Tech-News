'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { NewsItem, getCategoryLabel, isArticleOlderThanDays, formatRelativeTime } from '../types/news';
import { useBilingual } from './BilingualContext';
import { UseDailyBriefingReturn } from '../lib/speech_synthesizer';
import {
  Radio,
  Play,
  Pause,
  ChevronDown,
  ChevronUp,
  Headphones,
  Clock,
  Flame,
  ArrowUpRight,
} from 'lucide-react';

interface DailyBriefingWidgetProps {
  articles: NewsItem[];
  onSelectArticle: (article: NewsItem) => void;
  onListenArticle?: (article: NewsItem) => void;
  briefingPlayer: UseDailyBriefingReturn;
}

export const DailyBriefingWidget: React.FC<DailyBriefingWidgetProps> = ({
  articles,
  onSelectArticle,
  onListenArticle,
  briefingPlayer,
}) => {
  const { lang, t } = useBilingual();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('clearwind_briefing_collapsed');
      if (stored === 'true') {
        setIsCollapsed(true);
      }
    } catch {
      // ignore localStorage error in private browsing
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('clearwind_briefing_collapsed', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Smart Selection: 24h Window with Category Diversity Guarantee
  const top3DailyArticles = useMemo(() => {
    if (!articles || articles.length === 0) return [];

    let candidates = articles.filter((a) => !isArticleOlderThanDays(a.publishedAt, 1));
    if (candidates.length < 3) {
      candidates = articles.filter((a) => !isArticleOlderThanDays(a.publishedAt, 2));
    }
    if (candidates.length < 3) {
      candidates = articles.filter((a) => !isArticleOlderThanDays(a.publishedAt, 7));
    }
    if (candidates.length < 3) {
      candidates = articles;
    }

    const sorted = [...candidates].sort((a, b) => b.hotScore - a.hotScore);

    const picked: NewsItem[] = [];
    const usedCategories = new Set<string>();

    for (const art of sorted) {
      if (picked.length >= 3) break;
      if (!usedCategories.has(art.category)) {
        picked.push(art);
        usedCategories.add(art.category);
      }
    }

    if (picked.length < 3) {
      for (const art of sorted) {
        if (picked.length >= 3) break;
        if (!picked.some((p) => p.id === art.id)) {
          picked.push(art);
        }
      }
    }

    return picked;
  }, [articles]);

  if (top3DailyArticles.length === 0) return null;

  const handlePlayAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (briefingPlayer.isPlaying) {
      if (briefingPlayer.isPaused) {
        briefingPlayer.resume();
      } else {
        briefingPlayer.pause();
      }
    } else {
      briefingPlayer.playCustomList(
        top3DailyArticles,
        lang === 'vi' ? 'Bản tin sáng 3 phút' : '3-Minute Morning Briefing'
      );
    }
  };

  const rankBadges = [
    {
      label: t.rankLead,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
      dot: 'bg-amber-500',
    },
    {
      label: t.rankSpotlight,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      dot: 'bg-emerald-500',
    },
    {
      label: t.rankBreakthrough,
      color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30',
      dot: 'bg-sky-500',
    },
  ];

  return (
    <section aria-label="Daily Morning Tech Briefing" className="mb-8">
      <div className="rounded-2xl bg-white dark:bg-[#101420] border border-slate-200/90 dark:border-white/10 shadow-sm overflow-hidden transition-all duration-300">
        {/* Top Header Capsule */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:px-6 sm:py-3.5 bg-slate-50/70 dark:bg-white/[0.02] border-b border-slate-200/80 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
              <Radio className={`w-4 h-4 ${briefingPlayer.isPlaying && !briefingPlayer.isPaused ? 'animate-pulse' : ''}`} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  {t.dailyBriefingBadge}
                </span>
                <span className="text-slate-300 dark:text-white/20">•</span>
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white font-display">
                  {t.morningBriefing}
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.dailyBriefingSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Play All CTA Button */}
            <button
              onClick={handlePlayAll}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm min-h-[38px] ${
                briefingPlayer.isPlaying && !briefingPlayer.isPaused
                  ? 'bg-amber-500 text-white shadow-amber-500/20'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20 active:scale-95'
              }`}
              title={t.playAll3Min}
            >
              {briefingPlayer.isPlaying && !briefingPlayer.isPaused ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>{lang === 'vi' ? 'Tạm dừng' : 'Pause'}</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{t.playAll3Min}</span>
                </>
              )}
            </button>

            {/* Collapse / Expand Toggle Button */}
            <button
              onClick={toggleCollapse}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center border border-slate-200/80 dark:border-white/10"
              title={isCollapsed ? t.briefingExpand : t.briefingCollapse}
              aria-label={isCollapsed ? t.briefingExpand : t.briefingCollapse}
            >
              {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 3 Bento Cards Grid (Collapsible) */}
        {!isCollapsed && (
          <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {top3DailyArticles.map((article, index) => {
              const currentTitle = lang === 'vi' ? article.title_vi : article.title_en;
              const currentTakeaway =
                (lang === 'vi' ? article.summary_vi?.[0] : article.summary_en?.[0]) ||
                article.summary_vi?.[0] ||
                '';
              const badge = rankBadges[index] ?? rankBadges[0];
              const isCurrentlyPlaying =
                briefingPlayer.isPlaying && briefingPlayer.currentStoryIndex === index;
              const categoryLabel = getCategoryLabel(article.category, lang);
              const relativeTime = formatRelativeTime(article.publishedAt, lang);

              return (
                <div
                  key={article.id}
                  onClick={() => onSelectArticle(article)}
                  className={`group relative flex flex-col justify-between p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                    isCurrentlyPlaying
                      ? 'bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/40 ring-1 ring-emerald-500/40 shadow-sm'
                      : 'bg-slate-50/50 dark:bg-white/[0.02] hover:bg-slate-100/70 dark:hover:bg-white/[0.05] border-slate-200/80 dark:border-white/10 hover:border-emerald-500/40 shadow-xs'
                  }`}
                >
                  <div>
                    {/* Visual Media Thumbnail (If Available) */}
                    {article.thumbnailUrl && (
                      <div className="w-full aspect-[2/1] rounded-lg overflow-hidden mb-3 border border-slate-200/60 dark:border-white/5 bg-slate-100 dark:bg-white/[0.04]">
                        <img
                          src={article.thumbnailUrl}
                          alt={currentTitle}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                    )}

                    {/* Top Row: Rank Badge & Metadata */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${badge.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        <span>{badge.label}</span>
                      </span>

                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[90px]">
                          {article.sourceName}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-orange-600 dark:text-orange-400 font-bold">
                          <Flame className="w-3 h-3" />
                          {article.hotScore}
                        </span>
                      </div>
                    </div>

                    {/* Category & Time Line */}
                    <div className="flex items-center gap-2 mb-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 truncate max-w-[120px]">
                        {categoryLabel}
                      </span>
                      <span>•</span>
                      <span>{relativeTime}</span>
                    </div>

                    {/* Headline */}
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug mb-2 font-display">
                      {currentTitle}
                    </h3>

                    {/* Core Takeaway (Point 1) */}
                    {currentTakeaway && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed mb-3">
                        {currentTakeaway}
                      </p>
                    )}
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 dark:border-white/5 text-xs">
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>{article.readTimeMinutes} {lang === 'vi' ? 'phút' : 'mins'}</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      {onListenArticle && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onListenArticle(article);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors"
                          title={lang === 'vi' ? 'Nghe riêng bài này' : 'Listen to this article'}
                          aria-label="Listen article"
                        >
                          <Headphones className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <span className="p-1 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
                        <ArrowUpRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
