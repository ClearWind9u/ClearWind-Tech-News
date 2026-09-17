'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { NewsItem, getCategoryLabel } from '@/types/news';
import { useBilingual } from './BilingualContext';
import { Search, X, TrendingUp, CornerDownLeft, Hash } from 'lucide-react';

// Category accent colors — used inside category chips
const CATEGORY_ACCENTS: Record<string, { dot: string; label: string }> = {
  'AI & Machine Learning': { dot: '#38bdf8', label: 'AI' },
  'Software Engineering': { dot: '#10b981', label: 'Eng' },
  'DevOps & Cloud': { dot: '#f59e0b', label: 'Cloud' },
  'Cybersecurity': { dot: '#f43f5e', label: 'Sec' },
  'Mobile & Web': { dot: '#8b5cf6', label: 'Web' },
  'Tech Trends & Startups': { dot: '#ec4899', label: 'Trend' },
};

function getCategoryAccent(cat: string) {
  return CATEGORY_ACCENTS[cat] ?? { dot: '#94a3b8', label: cat.slice(0, 4) };
}

interface SpotlightSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles: NewsItem[];
  onSelectArticle: (article: NewsItem) => void;
}

export const SpotlightSearchModal: React.FC<SpotlightSearchModalProps> = ({
  isOpen,
  onClose,
  articles,
  onSelectArticle,
}) => {
  const { lang, t, setSelectedTag } = useBilingual();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Popular tech tags for empty-state discovery
  const trendingTags = useMemo(() => {
    const tagCount: Record<string, number> = {};
    articles.forEach((a) => {
      (a.tags ?? []).forEach((tag) => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });
    return Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag]) => tag);
  }, [articles]);

  // Filter articles based on query and category
  const filteredArticles = useMemo(() => {
    let result = articles;

    if (selectedCategory !== 'all') {
      result = result.filter((a) => a.category === selectedCategory);
    }

    if (query.trim()) {
      const q = query.toLowerCase().trim();
      result = result.filter((a) => {
        const titleMatch =
          a.title_vi?.toLowerCase().includes(q) ||
          a.title_en?.toLowerCase().includes(q) ||
          a.originalTitle?.toLowerCase().includes(q);
        const sourceMatch = a.sourceName?.toLowerCase().includes(q);
        const tagMatch = a.tags?.some((t) => t.toLowerCase().includes(q));
        const summaryMatch =
          a.summary_vi?.some((s) => s.toLowerCase().includes(q)) ||
          a.summary_en?.some((s) => s.toLowerCase().includes(q));
        return titleMatch || sourceMatch || tagMatch || summaryMatch;
      });
    } else {
      result = [...result].sort((a, b) => b.hotScore - a.hotScore).slice(0, 7);
    }

    return result.slice(0, 8); // Top 8 results for ultra-fast browsing
  }, [articles, query, selectedCategory]);

  // Reset selection index when query or category changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, selectedCategory]);

  // Auto focus input on modal open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
      setSelectedCategory('all');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Handle keyboard navigation (ArrowUp, ArrowDown, Enter, Esc)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredArticles.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredArticles.length - 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredArticles[selectedIndex]) {
          onSelectArticle(filteredArticles[selectedIndex]);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredArticles, selectedIndex, onSelectArticle, onClose]);

  // Scroll active item into view
  useEffect(() => {
    const listEl = listRef.current;
    if (!listEl) return;
    const activeItem = listEl.children[selectedIndex] as HTMLElement;
    if (activeItem) {
      activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  const scopeCategories = [
    'AI & Machine Learning',
    'Software Engineering',
    'DevOps & Cloud',
    'Cybersecurity',
    'Mobile & Web',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-4 sm:pt-[12vh] px-2.5 sm:px-4 animate-in fade-in duration-150">
      {/* Backdrop: Adaptive dark/light overlay with subtle blur */}
      <div
        className="fixed inset-0 bg-slate-900/40 dark:bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Command Palette Window — Adaptive Surface */}
      <div
        className="relative w-full max-w-[640px] z-10 flex flex-col overflow-hidden bg-white dark:bg-[#11141E] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl dark:shadow-[0_32px_64px_rgba(0,0,0,0.7)] max-h-[85vh] sm:max-h-[72vh] transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Search Input Row ── */}
        <div className="flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-3 sm:py-3.5 border-b border-slate-200 dark:border-white/10">
          <Search className="w-4 h-4 shrink-0 text-emerald-500 dark:text-emerald-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              lang === 'vi'
                ? 'Tìm kiếm bản tin công nghệ...'
                : 'Search tech news...'
            }
            className="flex-1 bg-transparent text-base sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="shrink-0 p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              title={lang === 'vi' ? 'Xóa nội dung' : 'Clear'}
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="sm:hidden shrink-0 px-2 py-1 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            {lang === 'vi' ? 'Đóng' : 'Done'}
          </button>
          {/* Desktop ESC Keycap */}
          <kbd className="hidden sm:inline-block shrink-0 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 shadow-2xs">
            ESC
          </kbd>
        </div>

        {/* ── Scope Filter Pills ── */}
        <div className="flex items-center gap-1.5 px-3.5 py-2 overflow-x-auto scrollbar-none border-b border-slate-200/80 dark:border-white/5 bg-slate-50/50 dark:bg-black/20">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white dark:bg-white/15 dark:text-white font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/5'
            }`}
          >
            {t.allCategories ?? 'All'}
          </button>
          {scopeCategories.map((cat) => {
            const accent = getCategoryAccent(cat);
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(isActive ? 'all' : cat)}
                className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-white/15 dark:text-white font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/5'
                }`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: accent.dot }}
                />
                {getCategoryLabel(cat, lang)}
              </button>
            );
          })}
        </div>

        {/* ── Results Body ── */}
        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
          {/* Empty state: Trending tags */}
          {!query && (
            <div className="px-2 pt-1 pb-2.5 mb-1.5 border-b border-slate-200/80 dark:border-white/5">
              <div className="flex items-center gap-1.5 mb-2 px-1 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
                <TrendingUp className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                <span>{lang === 'vi' ? 'Chủ đề nổi bật' : 'Trending Tags'}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {trendingTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setQuery(tag);
                      setSelectedTag(tag);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 transition-colors font-mono"
                  >
                    <Hash className="w-2.5 h-2.5 text-slate-400" />
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section label */}
          <div className="px-2.5 py-1 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
            {query
              ? `${filteredArticles.length} ${lang === 'vi' ? 'kết quả' : 'results'}`
              : lang === 'vi'
              ? 'Tiêu điểm hôm nay'
              : 'Featured Highlights'}
          </div>

          {/* Result rows */}
          {filteredArticles.length === 0 ? (
            <div className="py-12 text-center">
              <Search className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'vi' ? 'Không tìm thấy bản tin phù hợp.' : 'No articles found.'}
              </p>
            </div>
          ) : (
            <div ref={listRef} className="space-y-0.5">
              {filteredArticles.map((article, idx) => {
                const title =
                  (lang === 'vi' ? article.title_vi : article.title_en) ??
                  article.title_vi ??
                  article.originalTitle;
                const isSelected = idx === selectedIndex;
                const accent = getCategoryAccent(article.category ?? '');

                return (
                  <div
                    key={article.id}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    onClick={() => {
                      onSelectArticle(article);
                      onClose();
                    }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white shadow-2xs'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    {/* Category accent tile */}
                    <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: accent.dot }}
                      />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="mb-0.5 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {article.sourceName}
                        </span>
                        <span>·</span>
                        <span style={{ color: accent.dot }} className="font-mono font-medium">
                          {accent.label}
                        </span>
                      </div>
                      <div className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                        {title}
                      </div>
                    </div>

                    {/* Enter hint when selected */}
                    {isSelected && (
                      <kbd className="shrink-0 flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/15 shadow-2xs">
                        <CornerDownLeft className="w-3 h-3" />
                      </kbd>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Footer Keyboard Hints ── */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0E1018] text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            {[
              { key: '↑↓', label: lang === 'vi' ? 'Điều hướng' : 'Navigate' },
              { key: '↵', label: lang === 'vi' ? 'Mở bài' : 'Open' },
            ].map(({ key, label }) => (
              <span key={key} className="flex items-center gap-1.5 text-[11px]">
                <kbd className="px-1.5 py-0.5 rounded-md text-[10px] font-mono bg-white dark:bg-white/10 border border-slate-200 dark:border-white/15 text-slate-500 dark:text-slate-400 shadow-2xs">
                  {key}
                </kbd>
                <span>{label}</span>
              </span>
            ))}
          </div>
          <span className="flex items-center gap-1.5 text-[11px]">
            <kbd className="px-1.5 py-0.5 rounded-md text-[10px] font-mono bg-white dark:bg-white/10 border border-slate-200 dark:border-white/15 text-slate-500 dark:text-slate-400 shadow-2xs">
              ESC
            </kbd>
            <span>{lang === 'vi' ? 'Đóng' : 'Close'}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
