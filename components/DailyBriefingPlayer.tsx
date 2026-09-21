'use client';

import React, { useState } from 'react';
import { NewsItem, getCategoryLabel } from '../types/news';
import { useBilingual } from './BilingualContext';
import { UseDailyBriefingReturn } from '../lib/speech_synthesizer';
import {
  Radio,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Gauge,
  X,
  ChevronUp,
  ChevronDown,
  ListMusic,
  ExternalLink,
} from 'lucide-react';

interface DailyBriefingPlayerProps {
  articles: NewsItem[];
  player: UseDailyBriefingReturn;
  isOpen: boolean;
  onClose: () => void;
  onOpenArticleDetail?: (article: NewsItem) => void;
}

export const DailyBriefingPlayer: React.FC<DailyBriefingPlayerProps> = ({
  articles,
  player,
  isOpen,
  onClose,
  onOpenArticleDetail,
}) => {
  const { lang, t } = useBilingual();
  const [isExpanded, setIsExpanded] = useState(false);

  const activePlaylist =
    player.playlistArticles && player.playlistArticles.length > 0
      ? player.playlistArticles
      : articles;

  if (!isOpen || activePlaylist.length === 0) return null;

  const currentArticle = activePlaylist[player.currentStoryIndex] ?? activePlaylist[0];
  const currentTitle =
    (lang === 'vi' ? currentArticle.title_vi : currentArticle.title_en) ||
    currentArticle.title_vi ||
    currentArticle.originalTitle ||
    '';
  const takeaways =
    (lang === 'vi' ? currentArticle.summary_vi : currentArticle.summary_en) ||
    currentArticle.summary_vi ||
    [];

  const displayTitle = player.playlistTitle || t.morningBriefing;
  const displayDesc = player.playlistTitle
    ? (lang === 'vi'
        ? `Phát ${activePlaylist.length} bài viết công nghệ tuyển chọn`
        : `Streaming ${activePlaylist.length} curated tech stories`)
    : t.morningBriefingDesc;

  const handleTogglePlay = () => {
    if (player.isPlaying) {
      if (player.isPaused) {
        player.resume();
      } else {
        player.pause();
      }
    } else {
      player.startBriefing(player.currentStoryIndex);
    }
  };

  return (
    <>
      {/* Expanded Modal / Drawer View */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-[#07090E]/80 backdrop-blur-md animate-fade-in">
          <div className="absolute inset-0" onClick={() => setIsExpanded(false)} />
          <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-[#111522] border border-slate-200 dark:border-white/10 shadow-2xl z-10 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                  <Radio className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="truncate max-w-[200px] sm:max-w-xs">{displayTitle}</span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                      {t.storyCounter} {player.currentStoryIndex + 1}/{activePlaylist.length}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs sm:max-w-md">
                    {displayDesc}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                  title={t.closeBriefing}
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    player.stop();
                    onClose();
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                  title={t.stopAudio}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Active Story Highlight Card */}
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.04] p-4 relative overflow-hidden">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-mono">
                    {getCategoryLabel(currentArticle.category, lang)} • {currentArticle.sourceName}
                  </span>
                  {onOpenArticleDetail && (
                    <button
                      onClick={() => {
                        setIsExpanded(false);
                        onOpenArticleDetail(currentArticle);
                      }}
                      className="text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-500 inline-flex items-center gap-1"
                    >
                      <span>{t.quickRead}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug mb-3 font-display">
                  {currentTitle}
                </h4>

                {/* Takeaways highlighting */}
                <div className="space-y-2 text-xs">
                  {takeaways.map((point, idx) => {
                    const isReading = player.currentTakeawayIndex === idx && player.isPlaying;
                    return (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-lg transition-all duration-200 flex items-start gap-2.5 ${
                          isReading
                            ? 'bg-emerald-500/15 border border-emerald-500/40 text-slate-900 dark:text-white font-medium shadow-xs'
                            : 'text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-0.5 ${
                            isReading
                              ? 'bg-emerald-500 text-white shadow-xs'
                              : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {idx + 1}
                        </div>
                        <p className="leading-relaxed flex-1">{point}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Playlist Queue */}
              <div>
                <div className="flex items-center gap-2 mb-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-mono">
                  <ListMusic className="w-3.5 h-3.5" />
                  <span>Playlist ({activePlaylist.length})</span>
                </div>
                <div className="space-y-1.5">
                  {activePlaylist.map((art, idx) => {
                    const isCurrent = idx === player.currentStoryIndex;
                    const artTitle =
                      (lang === 'vi' ? art.title_vi : art.title_en) ||
                      art.title_vi ||
                      art.originalTitle ||
                      '';
                    return (
                      <div
                        key={art.id}
                        onClick={() => player.jumpToStory(idx)}
                        className={`group/item flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition-colors border ${
                          isCurrent
                            ? 'bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-300 font-semibold'
                            : 'bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.06] border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <span className="font-mono text-[11px] opacity-60 shrink-0 w-4">
                            {idx + 1}.
                          </span>
                          <span className="truncate">{artTitle}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 pl-2">
                          {isCurrent && player.isPlaying && !player.isPaused && (
                            <div className="flex items-center gap-0.5 mr-1">
                              <span className="w-1 h-3 bg-emerald-500 animate-pulse rounded-full" />
                              <span className="w-1 h-4 bg-emerald-500 animate-pulse delay-75 rounded-full" />
                              <span className="w-1 h-2 bg-emerald-500 animate-pulse delay-150 rounded-full" />
                            </div>
                          )}
                          {player.playlistArticles && player.playlistArticles.length > 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                player.removeFromPlaylist(art.id);
                              }}
                              className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors opacity-0 group-hover/item:opacity-100"
                              title={t.removeFromQueue || 'Xóa khỏi danh sách'}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="px-5 py-3.5 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] flex items-center justify-between gap-3">
              <button
                onClick={player.cyclePlaybackRate}
                className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-slate-200/70 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1"
                title={t.audioSpeed}
              >
                <Gauge className="w-3.5 h-3.5 text-emerald-500" />
                <span>{player.playbackRate}x</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={player.prevStory}
                  disabled={player.currentStoryIndex === 0}
                  className="p-2 rounded-xl bg-slate-200/60 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  title={t.prevStory}
                >
                  <SkipBack className="w-4 h-4" />
                </button>
                <button
                  onClick={handleTogglePlay}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/25 flex items-center gap-1.5 transition-transform active:scale-95"
                >
                  {player.isPlaying && !player.isPaused ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>{t.pauseAudio}</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>{t.playBriefing}</span>
                    </>
                  )}
                </button>
                <button
                  onClick={player.nextStory}
                  disabled={player.currentStoryIndex >= activePlaylist.length - 1}
                  className="p-2 rounded-xl bg-slate-200/60 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  title={t.nextStory}
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              <div className="text-[11px] font-mono text-slate-400">
                {player.currentStoryIndex + 1} / {activePlaylist.length}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Capsule Dock (Linear / Dynamic Island Style) */}
      {!isExpanded && (
        <div className="fixed bottom-5 right-4 sm:right-6 z-40 animate-slide-up max-w-[calc(100vw-2rem)] sm:max-w-md">
          <div className="flex items-center gap-2.5 p-2 sm:p-2.5 pl-3 rounded-2xl bg-white/95 dark:bg-[#101422]/95 backdrop-blur-xl border border-emerald-500/40 dark:border-emerald-500/30 shadow-2xl shadow-emerald-500/10 text-slate-900 dark:text-white transition-all">
            {/* Visualizer / Radio Indicator */}
            <div
              onClick={() => setIsExpanded(true)}
              className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white shrink-0 cursor-pointer shadow-xs hover:scale-105 transition-transform"
              title={displayTitle}
            >
              {player.isPlaying && !player.isPaused ? (
                <div className="flex items-center gap-0.5 h-3.5">
                  <span className="w-0.5 h-full bg-white animate-pulse rounded-full" />
                  <span className="w-0.5 h-2 bg-white animate-pulse delay-75 rounded-full" />
                  <span className="w-0.5 h-3 bg-white animate-pulse delay-150 rounded-full" />
                </div>
              ) : (
                <Radio className="w-4 h-4" />
              )}
            </div>

            {/* Track Info */}
            <div
              onClick={() => setIsExpanded(true)}
              className="flex-1 min-w-0 cursor-pointer pr-1"
            >
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                <span className="truncate max-w-[130px] sm:max-w-[180px]">{displayTitle}</span>
                <span>•</span>
                <span>
                  {player.currentStoryIndex + 1}/{activePlaylist.length}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                {currentTitle}
              </p>
            </div>

            {/* Inline Quick Controls */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={player.prevStory}
                disabled={player.currentStoryIndex === 0}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 transition-colors"
                title={t.prevStory}
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleTogglePlay}
                className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs transition-transform active:scale-95"
                title={player.isPlaying && !player.isPaused ? t.pauseAudio : t.playBriefing}
              >
                {player.isPlaying && !player.isPaused ? (
                  <Pause className="w-3.5 h-3.5" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-white" />
                )}
              </button>
              <button
                onClick={player.nextStory}
                disabled={player.currentStoryIndex >= activePlaylist.length - 1}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 transition-colors"
                title={t.nextStory}
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsExpanded(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                title={t.expandPlaylist}
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  player.stop();
                  onClose();
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                title={t.stopAudio}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
