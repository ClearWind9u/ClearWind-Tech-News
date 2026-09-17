'use client';

import React from 'react';
import { NewsItem, getCategoryLabel } from '../types/news';
import { useBilingual } from './BilingualContext';
import { X, Bookmark, Trash2, ArrowUpRight } from 'lucide-react';

interface BookmarkDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  allArticles: NewsItem[];
  onSelectArticle: (article: NewsItem) => void;
}

export const BookmarkDrawer: React.FC<BookmarkDrawerProps> = ({
  isOpen,
  onClose,
  allArticles,
  onSelectArticle,
}) => {
  const { lang, t, bookmarks, toggleBookmark, clearBookmarks } = useBilingual();

  if (!isOpen) return null;

  const bookmarkedArticles = allArticles.filter((article) => bookmarks.includes(article.id));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      <div className="absolute inset-0 bg-slate-900/60 dark:bg-[#080A0F]/80 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-[#121722] border-l border-slate-200 dark:border-white/10 shadow-2xl p-4 sm:p-6 flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Bookmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">{t.bookmarks}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {bookmarkedArticles.length} {lang === 'vi' ? 'bài viết đã lưu' : 'saved articles'}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                title={lang === 'vi' ? 'Đóng' : 'Close'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookmarkedArticles.length === 0 ? (
              <div className="py-16 text-center text-slate-400 px-4">
                <Bookmark className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3 stroke-[1.5]" />
                <p className="text-sm font-medium mb-1 text-slate-600 dark:text-slate-300">{t.noBookmarks}</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
                {bookmarkedArticles.map((article) => (
                  <div
                    key={article.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 hover:border-emerald-500/50 transition-colors cursor-pointer group shadow-xs"
                    onClick={() => {
                      onSelectArticle(article);
                      onClose();
                    }}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10">
                        {getCategoryLabel(article.category, lang)}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmark(article.id);
                        }}
                        className="p-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                        title={lang === 'vi' ? 'Xóa' : 'Remove'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 line-clamp-2 mb-2 leading-snug font-display">
                      {lang === 'vi' ? article.title_vi : article.title_en}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-white/10">
                      <span>{article.sourceName}</span>
                      <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                        {t.quickRead}
                        <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {bookmarkedArticles.length > 0 && (
            <div className="pt-4 border-t border-slate-200 dark:border-white/10">
              <button
                onClick={clearBookmarks}
                className="w-full py-2.5 px-4 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 border border-red-500/20 rounded-xl transition-colors flex items-center justify-center gap-2 font-mono"
              >
                <Trash2 className="w-4 h-4" />
                {t.clearAll}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
