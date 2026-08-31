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
      <div className="absolute inset-0 bg-[#080A0F]/80 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#121722] border-l border-slate-800 shadow-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Bookmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{t.bookmarks}</h3>
                  <p className="text-xs text-slate-400">
                    {bookmarkedArticles.length} {lang === 'vi' ? 'bài viết đã lưu' : 'saved articles'}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookmarkedArticles.length === 0 ? (
              <div className="py-16 text-center text-slate-400 px-4">
                <Bookmark className="w-10 h-10 mx-auto text-slate-600 mb-3 stroke-[1.5]" />
                <p className="text-sm font-medium mb-1">{t.noBookmarks}</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
                {bookmarkedArticles.map((article) => (
                  <div
                    key={article.id}
                    className="p-3.5 rounded-xl bg-[#0B0E14] border border-slate-800 hover:border-emerald-500/40 transition-colors cursor-pointer group"
                    onClick={() => {
                      onSelectArticle(article);
                      onClose();
                    }}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10">
                        {getCategoryLabel(article.category, lang)}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmark(article.id);
                        }}
                        className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                        title={lang === 'vi' ? 'Xóa' : 'Remove'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 line-clamp-2 mb-2 leading-snug">
                      {lang === 'vi' ? article.title_vi : article.title_en}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
                      <span>{article.sourceName}</span>
                      <span className="flex items-center gap-0.5 text-emerald-400 font-bold">
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
            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={clearBookmarks}
                className="w-full py-2.5 px-4 text-xs font-bold text-red-400 hover:bg-red-500/10 border border-red-500/20 rounded-xl transition-colors flex items-center justify-center gap-2"
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
