'use client';

import React, { useState } from 'react';
import { NewsItem, getCategoryLabel } from '../types/news';
import { useBilingual } from './BilingualContext';
import {
  X,
  ExternalLink,
  Bookmark,
  Copy,
  Check,
  Clock,
  Heart,
  Share2,
} from 'lucide-react';

interface NewsDetailModalProps {
  article: NewsItem | null;
  onClose: () => void;
}

export const NewsDetailModal: React.FC<NewsDetailModalProps> = ({ article, onClose }) => {
  const { lang, t, toggleBookmark, isBookmarked, toggleUpvote, isUpvoted } = useBilingual();
  const [copied, setCopied] = useState(false);
  const [modalLang, setModalLang] = useState<'vi' | 'en'>(lang);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');

  if (!article) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(article.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`${modalLang === 'vi' ? article.title_vi : article.title_en} via @AITechDigest`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(article.url)}`, '_blank');
  };

  const currentTitle = modalLang === 'vi' ? article.title_vi : article.title_en;
  const currentSummary = modalLang === 'vi' ? article.summary_vi : article.summary_en;
  const categoryLabel = getCategoryLabel(article.category, modalLang);

  const formattedDate = new Date(article.publishedAt).toLocaleDateString(modalLang === 'vi' ? 'vi-VN' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const upvoteCount = (article.upvotes || 0) + (isUpvoted(article.id) ? 1 : 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-slate-900/60 dark:bg-[#080A0F]/85 backdrop-blur-md animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-[#11141E] p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-white/10 z-10 transition-colors">
        <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20 dark:border-emerald-500/30">
              {categoryLabel}
            </span>

            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10">
              {article.sourceName}
            </span>

            <span className="px-2.5 py-1 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.06] rounded-full border border-slate-200 dark:border-white/10 font-mono">
              {article.hotScore} pts
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
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 mb-4 bg-slate-100 dark:bg-white/[0.04] p-1.5 rounded-xl border border-slate-200 dark:border-white/10">
          <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold px-2">
            {modalLang === 'vi' ? 'Ngôn ngữ hiển thị' : 'Display Language'}
          </span>
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setModalLang('vi')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                modalLang === 'vi' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Tiếng Việt
            </button>
            <button
              onClick={() => setModalLang('en')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                modalLang === 'en' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              English
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
          {article.authorName && <span>{modalLang === 'vi' ? 'Bởi' : 'By'} <strong className="text-slate-700 dark:text-slate-200">{article.authorName}</strong></span>}
          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {article.readTimeMinutes} {modalLang === 'vi' ? 'phút đọc' : 'min read'}
          </span>
        </div>

        <div className="space-y-3 mb-6 bg-slate-50 dark:bg-white/[0.02] p-5 rounded-xl border border-emerald-500/20 dark:border-emerald-500/30">
          <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            {modalLang === 'vi' ? 'Tóm tắt cốt lõi:' : 'Key Takeaways:'}
          </div>

          <div className="space-y-3">
            {currentSummary.map((point, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 text-slate-700 dark:text-slate-200 leading-relaxed font-normal ${
                  fontSize === 'sm' ? 'text-xs' : fontSize === 'lg' ? 'text-base' : 'text-sm'
                }`}
              >
                <span className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0 px-1 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/20">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap mb-8">
          {article.tags.map((tag, i) => (
            <span key={i} className="text-xs font-mono text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10">
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 pt-5 border-t border-slate-200 dark:border-white/10 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleUpvote(article.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all ${
                isUpvoted(article.id)
                  ? 'bg-red-500/15 text-red-500 dark:text-red-400 border-red-500/40'
                  : 'bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-red-500/40'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isUpvoted(article.id) ? 'fill-red-400 text-red-400' : ''}`} />
              <span>{upvoteCount}</span>
            </button>

            <button
              onClick={() => toggleBookmark(article.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all ${
                isBookmarked(article.id)
                  ? 'bg-emerald-500 text-white border-emerald-400 shadow-sm'
                  : 'bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-emerald-500/50'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{isBookmarked(article.id) ? (modalLang === 'vi' ? 'Đã lưu' : 'Saved') : (modalLang === 'vi' ? 'Lưu bài' : 'Save')}</span>
            </button>

            <button
              onClick={handleCopy}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-slate-400 dark:hover:border-slate-500 flex items-center gap-1.5 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? (modalLang === 'vi' ? 'Đã sao chép' : 'Copied') : (modalLang === 'vi' ? 'Sao chép link' : 'Copy link')}</span>
            </button>

            <button
              onClick={handleShareTwitter}
              className="p-2 rounded-xl bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
              title={modalLang === 'vi' ? 'Chia sẻ lên X' : 'Share on X'}
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
          >
            <span>{modalLang === 'vi' ? 'Đến bài viết gốc' : 'Read original'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
