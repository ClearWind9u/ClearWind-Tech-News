'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { NewsDatabase, NewsItem } from '@/types/news';
import { Navbar } from './Navbar';
import { HeroBento } from './HeroBento';
import { TrendingTicker } from './TrendingTicker';
import { CategoryFilter } from './CategoryFilter';
import { NewsCard } from './NewsCard';
import { NewsRowCompact } from './NewsRowCompact';
import { NewsDetailModal } from './NewsDetailModal';
import { BookmarkDrawer } from './BookmarkDrawer';
import { ShortcutsModal } from './ShortcutsModal';
import { Footer } from './Footer';
import { useBilingual, SortOption } from './BilingualContext';
import {
  Newspaper,
  SearchX,
  LayoutGrid,
  List,
  Keyboard,
  X,
  Tag,
  CheckCheck,
  Flame,
  Clock,
  Sparkles,
  Bookmark,
} from 'lucide-react';

interface NewsAppClientProps {
  initialData: NewsDatabase;
}

export const NewsAppClient: React.FC<NewsAppClientProps> = ({ initialData }) => {
  const {
    lang,
    setLang,
    t,
    viewMode,
    setViewMode,
    toggleTheme,
    selectedTag,
    setSelectedTag,
    readArticles,
    isRead,
    markAllAsRead,
    bookmarks,
    cleanupStaleBookmarks,
    sortOption,
    setSortOption,
  } = useBilingual();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedOrigin, setSelectedOrigin] = useState<'all' | 'vietnam' | 'global'>('all');
  const [activeArticle, setActiveArticle] = useState<NewsItem | null>(null);
  const [isBookmarkDrawerOpen, setIsBookmarkDrawerOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Auto clean up stale bookmarks when articles load
  useEffect(() => {
    if (initialData.articles && initialData.articles.length > 0) {
      cleanupStaleBookmarks(initialData.articles.map((a) => a.id));
    }
  }, [initialData.articles, cleanupStaleBookmarks]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsBookmarkDrawerOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === 'v') {
        e.preventDefault();
        setViewMode(viewMode === 'grid' ? 'compact' : 'grid');
      } else if (e.key.toLowerCase() === 'l') {
        e.preventDefault();
        setLang(lang === 'vi' ? 'en' : 'vi');
      } else if (e.key.toLowerCase() === 't') {
        e.preventDefault();
        toggleTheme();
      } else if (e.key === 'Escape') {
        setIsShortcutsOpen(false);
        setIsBookmarkDrawerOpen(false);
        setActiveArticle(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, lang, setViewMode, setLang, toggleTheme]);

  const ALL_CANONICAL_CATEGORIES = [
    'AI & Machine Learning',
    'Software Engineering',
    'DevOps & Cloud',
    'Cybersecurity',
    'Mobile & Web',
    'Tech Trends & Startups',
  ];

  const categories = useMemo(() => {
    const existingSet = new Set<string>();
    initialData.articles.forEach((a) => {
      if (a.category) existingSet.add(a.category);
    });
    return ALL_CANONICAL_CATEGORIES.filter((c) => existingSet.has(c)).concat(
      Array.from(existingSet).filter((c) => !ALL_CANONICAL_CATEGORIES.includes(c))
    );
  }, [initialData]);

  // Unread count
  const unreadCount = useMemo(() => {
    return initialData.articles.filter((a) => !readArticles.includes(a.id)).length;
  }, [initialData, readArticles]);

  // Valid Saved count
  const savedArticlesCount = useMemo(() => {
    return initialData.articles.filter((a) => bookmarks.includes(a.id)).length;
  }, [initialData.articles, bookmarks]);

  // Filter & Sort Pipeline
  const filteredArticles = useMemo(() => {
    let result = initialData.articles.filter((article) => {
      if (selectedTag && !article.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase())) {
        return false;
      }

      if (selectedOrigin !== 'all' && article.sourceOrigin !== selectedOrigin) {
        return false;
      }

      if (selectedCategory !== 'all' && article.category !== selectedCategory) {
        return false;
      }

      if (sortOption === 'unread' && isRead(article.id)) {
        return false;
      }

      if (sortOption === 'saved' && !bookmarks.includes(article.id)) {
        return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const titleVi = (article.title_vi || '').toLowerCase();
        const titleEn = (article.title_en || '').toLowerCase();
        const summaryVi = (article.summary_vi || []).join(' ').toLowerCase();
        const summaryEn = (article.summary_en || []).join(' ').toLowerCase();
        const tags = (article.tags || []).join(' ').toLowerCase();
        const source = (article.sourceName || '').toLowerCase();
        const author = (article.authorName || '').toLowerCase();
        const category = (article.category || '').toLowerCase();

        return (
          titleVi.includes(query) ||
          titleEn.includes(query) ||
          summaryVi.includes(query) ||
          summaryEn.includes(query) ||
          tags.includes(query) ||
          source.includes(query) ||
          author.includes(query) ||
          category.includes(query)
        );
      }

      return true;
    });

    // Apply Sorting Priority
    if (sortOption === 'trending') {
      result = [...result].sort((a, b) => b.hotScore - a.hotScore);
    } else {
      // 'latest', 'unread', 'saved' sort by newest first
      result = [...result].sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    }

    return result;
  }, [
    initialData,
    selectedOrigin,
    selectedCategory,
    searchQuery,
    selectedTag,
    sortOption,
    readArticles,
    bookmarks,
    isRead,
  ]);

  const featuredArticles = useMemo(() => {
    return [...initialData.articles].sort((a, b) => b.hotScore - a.hotScore).slice(0, 3);
  }, [initialData]);

  const handleMarkAllRead = () => {
    markAllAsRead(initialData.articles.map((a) => a.id));
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#0B0E14] text-white">
      <div>
        <Navbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenBookmarks={() => setIsBookmarkDrawerOpen(true)}
          savedCount={savedArticlesCount}
        />

        <TrendingTicker
          articles={initialData.articles}
          onSelectArticle={(art) => setActiveArticle(art)}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 relative z-10">
          {/* Hero Featured Highlights (Only on main clean view) */}
          {!searchQuery &&
            !selectedTag &&
            selectedCategory === 'all' &&
            selectedOrigin === 'all' &&
            sortOption === 'latest' && (
              <HeroBento
                articles={featuredArticles}
                onSelectArticle={(article) => setActiveArticle(article)}
              />
            )}

          {/* Active Tag Filter Indicator */}
          {selectedTag && (
            <div className="mb-4 flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400">
              <Tag className="w-4 h-4" />
              <span>
                {lang === 'vi' ? 'Đang lọc theo thẻ:' : 'Filtering by tag:'}{' '}
                <strong>#{selectedTag}</strong>
              </span>
              <button
                onClick={() => setSelectedTag(null)}
                className="ml-auto p-1 hover:bg-emerald-500/20 rounded-md transition-colors"
                title="Bỏ lọc"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Category Filter Pills */}
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedOrigin={selectedOrigin}
            onSelectOrigin={setSelectedOrigin}
            totalArticlesCount={filteredArticles.length}
          />

          {/* Section Header: Priority Tabs (Latest, Trending, Unread, Saved) & Layout Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-800">
            {/* Priority & Status Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-[#121722] rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setSortOption('latest')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  sortOption === 'latest'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{t.tabLatest}</span>
              </button>

              <button
                onClick={() => setSortOption('trending')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  sortOption === 'trending'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>{t.tabTrending}</span>
              </button>

              <button
                onClick={() => setSortOption('unread')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  sortOption === 'unread'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.tabUnread}</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-400/20 text-emerald-300 font-mono">
                    {unreadCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setSortOption('saved')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  sortOption === 'saved'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{t.tabSaved}</span>
                {savedArticlesCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-700 text-slate-300 font-mono">
                    {savedArticlesCount}
                  </span>
                )}
              </button>
            </div>

            {/* Right Controls: Mark all read + View Mode + Shortcuts */}
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="px-2.5 py-1 text-xs text-slate-400 hover:text-emerald-400 bg-[#121722] hover:bg-[#161D2B] border border-slate-800 rounded-lg transition-colors flex items-center gap-1 font-medium"
                  title={t.markAllRead}
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t.markAllRead}</span>
                </button>
              )}

              <div className="flex items-center bg-[#121722] p-0.5 rounded-lg border border-slate-800">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title={t.gridView}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('compact')}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === 'compact'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title={t.compactView}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => setIsShortcutsOpen(true)}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 text-xs text-slate-400 hover:text-white bg-[#121722] rounded-lg border border-slate-800 font-medium"
                title="Phím tắt (?)"
              >
                <Keyboard className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono text-[11px]">?</span>
              </button>
            </div>
          </div>

          {/* News Feed Content */}
          {filteredArticles.length === 0 ? (
            <div className="py-16 text-center bg-[#121722] border border-slate-800 rounded-2xl p-8 max-w-lg mx-auto">
              <SearchX className="w-10 h-10 mx-auto text-slate-500 mb-3 stroke-[1.5]" />
              <h3 className="text-base font-bold text-white mb-2">{t.noResults}</h3>
              <p className="text-xs text-slate-400 mb-4">
                {sortOption === 'saved'
                  ? t.noBookmarks
                  : sortOption === 'unread'
                  ? 'Bạn đã đọc hết tất cả các bài viết!'
                  : 'Hãy thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc.'}
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTag(null);
                  setSelectedCategory('all');
                  setSelectedOrigin('all');
                  setSortOption('latest');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
              >
                {lang === 'vi' ? 'Xem tất cả bài viết' : 'View all articles'}
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredArticles.map((article) => (
                <NewsCard
                  key={article.id}
                  article={article}
                  onSelectArticle={(art) => setActiveArticle(art)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredArticles.map((article) => (
                <NewsRowCompact
                  key={article.id}
                  article={article}
                  onSelectArticle={(art) => setActiveArticle(art)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <Footer lastUpdated={initialData.lastUpdated} />

      <NewsDetailModal
        article={activeArticle}
        onClose={() => setActiveArticle(null)}
      />

      <BookmarkDrawer
        isOpen={isBookmarkDrawerOpen}
        onClose={() => setIsBookmarkDrawerOpen(false)}
        allArticles={initialData.articles}
        onSelectArticle={(art) => setActiveArticle(art)}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
};
