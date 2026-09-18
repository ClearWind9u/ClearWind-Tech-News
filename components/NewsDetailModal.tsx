'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { NewsItem, getCategoryLabel } from '../types/news';
import { useBilingual } from './BilingualContext';
import { recordUserAction, getRelatedArticles } from '../lib/user_interest_tracker';
import {
  X,
  ExternalLink,
  Bookmark,
  Copy,
  Check,
  Clock,
  Share2,
  Compass,
  Headphones,
  Play,
  Pause,
  Square,
  Volume2,
} from 'lucide-react';
import { useTextToSpeech } from '../lib/speech_synthesizer';

interface NewsDetailModalProps {
  article: NewsItem | null;
  onClose: () => void;
  allArticles?: NewsItem[];
  onSelectArticle?: (article: NewsItem) => void;
  autoPlayAudio?: boolean;
}

export const NewsDetailModal: React.FC<NewsDetailModalProps> = ({
  article,
  onClose,
  allArticles = [],
  onSelectArticle,
  autoPlayAudio = false,
}) => {
  const { lang, t, toggleBookmark, isBookmarked } = useBilingual();
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const tts = useTextToSpeech(lang);

  // Stop audio synthesis when switching article or unmounting
  useEffect(() => {
    return () => {
      tts.stop();
    };
  }, [article?.id]);

  // Auto-play audio digest if opened via quick Listen button on card
  useEffect(() => {
    if (autoPlayAudio && article) {
      const title = (lang === 'vi' ? article.title_vi : article.title_en) || article.title_vi || article.originalTitle;
      const summary = (lang === 'vi' ? article.summary_vi : article.summary_en) || article.summary_vi || [];
      const timer = setTimeout(() => {
        tts.speak(title, summary, article.sourceName);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [article?.id, autoPlayAudio, lang]);

  const handleClose = () => {
    tts.stop();
    onClose();
  };

  // Track user reading action in real-time
  useEffect(() => {
    if (article) {
      recordUserAction(article, 'read');
    }
  }, [article?.id]);

  const relatedArticles = useMemo(() => {
    if (!article) return [];
    return getRelatedArticles(article, allArticles, 3);
  }, [article, allArticles]);

  if (!article) return null;

  const handleCopy = () => {
    const shareUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/?article=${encodeURIComponent(article.id)}`
        : article.url;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTwitter = () => {
    const shareUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/?article=${encodeURIComponent(article.id)}`
        : article.url;
    const text = encodeURIComponent(
      `${lang === 'vi' ? article.title_vi : article.title_en} | ClearWind Tech News`
    );
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`,
      '_blank'
    );
  };

  const currentTitle = lang === 'vi' ? article.title_vi : article.title_en;
  const currentSummary = lang === 'vi' ? article.summary_vi : article.summary_en;
  const categoryLabel = getCategoryLabel(article.category, lang);

  const formattedDate = new Date(article.publishedAt).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6 md:p-10 bg-slate-900/60 dark:bg-[#080A0F]/85 backdrop-blur-md animate-fade-in">
      <div className="absolute inset-0" onClick={handleClose} />

      <div className="relative w-full h-full sm:h-auto sm:max-w-2xl max-h-[100dvh] sm:max-h-[90vh] overflow-y-auto rounded-none sm:rounded-2xl bg-white dark:bg-[#11141E] p-4 sm:p-8 shadow-2xl border-0 sm:border border-slate-200 dark:border-white/10 z-10 transition-colors">
        <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20 dark:border-emerald-500/30">
              {categoryLabel}
            </span>

            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10">
              {article.sourceName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setFontSize('sm')}
                className={`px-2 py-0.5 rounded font-bold transition-colors ${fontSize === 'sm' ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                title="A-"
              >
                A-
              </button>
              <button
                onClick={() => setFontSize('base')}
                className={`px-2 py-0.5 rounded font-bold transition-colors ${fontSize === 'base' ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                title="A"
              >
                A
              </button>
              <button
                onClick={() => setFontSize('lg')}
                className={`px-2 py-0.5 rounded font-bold transition-colors ${fontSize === 'lg' ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                title="A+"
              >
                A+
              </button>
            </div>

            <button
              onClick={handleClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {article.thumbnailUrl && (
          <div className="w-full aspect-[16/9] rounded-xl overflow-hidden mb-5 border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/[0.04]">
            <img src={article.thumbnailUrl} alt={currentTitle} className="w-full h-full object-cover" />
          </div>
        )}

        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-snug mb-3 font-display">
          {currentTitle}
        </h2>

        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-6 flex-wrap font-medium">
          <span>{formattedDate}</span>
          {article.authorName && <span>{lang === 'vi' ? 'Bởi' : 'By'} <strong className="text-slate-700 dark:text-slate-200">{article.authorName}</strong></span>}
          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {article.readTimeMinutes} {lang === 'vi' ? 'phút đọc' : 'min read'}
          </span>
        </div>

        <div className="space-y-3 mb-6 bg-slate-50 dark:bg-white/[0.02] p-5 rounded-xl border border-slate-200/80 dark:border-white/10">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{lang === 'vi' ? 'Tóm tắt cốt lõi:' : 'Key Takeaways:'}</span>
            </div>

            {/* Audio Digest Player Capsule */}
            {tts.isSupported && (
              <div className="flex items-center gap-1.5 bg-white dark:bg-white/[0.06] p-1 rounded-lg border border-slate-200 dark:border-white/10 shadow-xs">
                {!tts.isPlaying ? (
                  <button
                    onClick={() => tts.speak(currentTitle, currentSummary, article.sourceName)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                    title={lang === 'vi' ? 'Nghe tóm tắt' : 'Listen Takeaways'}
                  >
                    <Headphones className="w-3.5 h-3.5" />
                    <span>{lang === 'vi' ? 'Nghe tóm tắt' : 'Listen Takeaways'}</span>
                    <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                      {lang === 'vi' ? 'VI' : 'EN'}
                    </span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1">
                    {/* Animated Soundwave Equalizer */}
                    <div className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded">
                      <div className="flex items-end gap-[2px] h-3">
                        <span className={`w-[2px] bg-emerald-500 rounded-full transition-all duration-200 ${tts.isPaused ? 'h-1.5' : 'h-3 animate-pulse'}`} />
                        <span className={`w-[2px] bg-emerald-500 rounded-full transition-all duration-200 ${tts.isPaused ? 'h-1' : 'h-2 animate-[pulse_0.7s_infinite]'}`} />
                        <span className={`w-[2px] bg-emerald-500 rounded-full transition-all duration-200 ${tts.isPaused ? 'h-1.5' : 'h-2.5 animate-[pulse_1s_infinite]'}`} />
                      </div>
                      <span>{tts.isPaused ? (lang === 'vi' ? 'Tạm dừng' : 'Paused') : (lang === 'vi' ? 'Đang đọc' : 'Playing')}</span>
                      <span className="text-[10px] opacity-75 font-normal">({lang === 'vi' ? 'VI' : 'EN'})</span>
                    </div>

                    {tts.isPaused ? (
                      <button
                        onClick={tts.resume}
                        className="p-1 rounded text-slate-600 dark:text-slate-300 hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                        title={lang === 'vi' ? 'Tiếp tục' : 'Resume'}
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={tts.pause}
                        className="p-1 rounded text-slate-600 dark:text-slate-300 hover:text-amber-500 hover:bg-amber-500/10 transition-colors"
                        title={lang === 'vi' ? 'Tạm dừng' : 'Pause'}
                      >
                        <Pause className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={tts.stop}
                      className="p-1 rounded text-slate-600 dark:text-slate-300 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                      title={lang === 'vi' ? 'Dừng đọc' : 'Stop'}
                    >
                      <Square className="w-3 h-3 fill-current" />
                    </button>
                  </div>
                )}

                <button
                  onClick={tts.cyclePlaybackRate}
                  className="px-1.5 py-0.5 rounded text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                  title={lang === 'vi' ? 'Tốc độ' : 'Speed'}
                >
                  {tts.playbackRate}x
                </button>
              </div>
            )}
          </div>

          <ul className="space-y-2.5 border-l-2 border-emerald-500/30 dark:border-emerald-500/20 pl-3">
            {currentSummary.map((point, index) => {
              const isCurrentPlaying = tts.isPlaying && tts.currentTakeawayIndex === index;
              return (
                <li
                  key={index}
                  className={`text-slate-700 dark:text-slate-200 leading-relaxed transition-all duration-300 ${
                    fontSize === 'sm' ? 'text-xs' : fontSize === 'lg' ? 'text-base' : 'text-sm'
                  } ${
                    isCurrentPlaying
                      ? 'bg-emerald-500/10 dark:bg-emerald-500/15 ring-1 ring-emerald-500/30 dark:ring-emerald-500/40 rounded-lg p-2.5 font-medium text-emerald-950 dark:text-emerald-100 shadow-xs'
                      : 'p-0.5'
                  }`}
                >
                  <div className="flex items-start gap-1.5">
                    <span className={`font-mono font-semibold shrink-0 ${isCurrentPlaying ? 'text-emerald-700 dark:text-emerald-300' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      #{index + 1}
                    </span>
                    <span className="flex-1">{point}</span>
                    {isCurrentPlaying && (
                      <span className="shrink-0 flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded">
                        <Volume2 className="w-2.5 h-2.5 animate-pulse" />
                        <span>{lang === 'vi' ? 'Đang đọc' : 'Reading'}</span>
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex items-center gap-2 flex-wrap mb-8">
          {article.tags.map((tag, i) => (
            <span key={i} className="text-xs font-mono text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10">
              #{tag}
            </span>
          ))}
        </div>

        {/* Related Articles ("Có thể bạn quan tâm") */}
        {relatedArticles.length > 0 && (
          <div className="mb-6 pt-5 border-t border-slate-200/80 dark:border-white/10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3 flex items-center gap-1.5 font-mono">
              <Compass className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
              <span>{t.relatedArticles}</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {relatedArticles.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => onSelectArticle?.(rel)}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.06] hover:border-emerald-500/40 cursor-pointer transition-all flex flex-col justify-between group"
                >
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 uppercase font-bold truncate mb-1">
                    {rel.sourceName}
                  </span>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 line-clamp-2 leading-snug">
                    {lang === 'vi' ? rel.title_vi : rel.title_en}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-5 border-t border-slate-200 dark:border-white/10">
          {/* Touch-Friendly Action Buttons Row */}
          <div className="flex items-center justify-between sm:justify-start gap-2 overflow-x-auto scrollbar-none py-1 sm:py-0">
            <button
              onClick={() => {
                toggleBookmark(article.id);
                recordUserAction(article, 'bookmark');
              }}
              className={`flex-1 sm:flex-initial px-3 py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all min-h-[40px] shrink-0 ${
                isBookmarked(article.id)
                  ? 'bg-emerald-500 text-white border-emerald-400 shadow-sm'
                  : 'bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-emerald-500/50'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{isBookmarked(article.id) ? (lang === 'vi' ? 'Đã lưu' : 'Saved') : (lang === 'vi' ? 'Lưu bài' : 'Save')}</span>
            </button>

            <button
              onClick={() => {
                handleCopy();
                recordUserAction(article, 'share');
              }}
              className="flex-1 sm:flex-initial px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-slate-400 dark:hover:border-slate-500 flex items-center justify-center gap-1.5 transition-all min-h-[40px] shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? (lang === 'vi' ? 'Đã sao chép' : 'Copied') : (lang === 'vi' ? 'Sao chép' : 'Copy')}</span>
            </button>

            <button
              onClick={() => {
                handleShareTwitter();
                recordUserAction(article, 'share');
              }}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center shrink-0"
              title={lang === 'vi' ? 'Chia sẻ lên X' : 'Share on X'}
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => recordUserAction(article, 'read')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 min-h-[42px] shrink-0"
          >
            <span>{lang === 'vi' ? 'Đến bài viết gốc' : 'Read original'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
