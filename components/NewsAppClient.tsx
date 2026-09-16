'use client';

import React, { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { NewsDatabase, NewsItem, isArticleInTimeRange } from '@/types/news';
import { Navbar } from './Navbar';
import { HeroBento } from './HeroBento';
import { CategoryFilter } from './CategoryFilter';
import { NewsCard } from './NewsCard';
import { NewsRowCompact } from './NewsRowCompact';
import { Footer } from './Footer';
import { CardSkeleton, RowSkeleton, HeroSkeleton } from './NewsSkeleton';
import { useBilingual, SortOption } from './BilingualContext';

// Dynamic code-splitting for heavy overlay components (loaded on-demand)
const NewsDetailModal = dynamic(
  () => import('./NewsDetailModal').then((mod) => mod.NewsDetailModal),
  { ssr: false }
);
const BookmarkDrawer = dynamic(
  () => import('./BookmarkDrawer').then((mod) => mod.BookmarkDrawer),
  { ssr: false }
);
const ShortcutsModal = dynamic(
  () => import('./ShortcutsModal').then((mod) => mod.ShortcutsModal),
  { ssr: false }
);
const SpotlightSearchModal = dynamic(
  () => import('./SpotlightSearchModal').then((mod) => mod.SpotlightSearchModal),
  { ssr: false }
);
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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface NewsAppClientProps {
  initialData: NewsDatabase;
}

const ITEMS_PER_PAGE = 12;

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
    timeFilter,
  } = useBilingual();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedOrigin, setSelectedOrigin] = useState<'all' | 'vietnam' | 'global'>('all');
  const [activeArticle, setActiveArticle] = useState<NewsItem | null>(null);
  const [isBookmarkDrawerOpen, setIsBookmarkDrawerOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Brief shimmer loading feedback when filters change
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 280);
    return () => clearTimeout(timer);
  }, [selectedCategory, selectedOrigin, sortOption, timeFilter, selectedTag]);

  // Auto clean up stale bookmarks when articles load
  useEffect(() => {
    if (initialData?.articles && initialData.articles.length > 0) {
      cleanupStaleBookmarks(initialData.articles.map((a: NewsItem) => a.id));
    }
  }, [initialData?.articles, cleanupStaleBookmarks]);

  // Reset pagination to Page 1 when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedOrigin, searchQuery, selectedTag, sortOption, timeFilter]);

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

      // Timeframe Filter (Preserve bookmarks and search results across all time)
      if (sortOption !== 'saved' && !searchQuery.trim() && !selectedTag) {
        if (!isArticleInTimeRange(article.publishedAt, timeFilter)) {
          return false;
        }
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
    timeFilter,
    readArticles,
    bookmarks,
    isRead,
  ]);

  // Pagination Calculations
  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedArticles = useMemo(() => {
    return filteredArticles.slice(startIndex, endIndex);
  }, [filteredArticles, startIndex, endIndex]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    const feedElement = document.getElementById('news-feed-container');
    if (feedElement) {
      feedElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const featuredArticles = useMemo(() => {
    return [...initialData.articles].sort((a, b) => b.hotScore - a.hotScore).slice(0, 3);
  }, [initialData]);

  const handleMarkAllRead = () => {
    markAllAsRead(initialData.articles.map((a) => a.id));
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-[#090A0F] text-slate-900 dark:text-slate-100 transition-colors">
      <div>
        <Navbar
          onOpenSearch={() => setIsSpotlightOpen(true)}
          onOpenBookmarks={() => setIsBookmarkDrawerOpen(true)}
          savedCount={savedArticlesCount}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16 relative z-10">
          {/* Hero Featured Highlights (Only on main clean view) */}
          {!searchQuery &&
            !selectedTag &&
            selectedCategory === 'all' &&
            selectedOrigin === 'all' &&
            sortOption === 'latest' &&
            currentPage === 1 && (
              isLoading ? (
                <HeroSkeleton />
              ) : (
                <HeroBento
                  articles={featuredArticles}
                  onSelectArticle={(article) => setActiveArticle(article)}
                />
              )
            )}

          {/* Active Tag Filter Indicator */}
          {selectedTag && (
            <div className="mb-4 flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-600 dark:text-emerald-400">
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

          {/* Category & Timeframe Filter Pills */}
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedOrigin={selectedOrigin}
            onSelectOrigin={setSelectedOrigin}
            totalArticlesCount={filteredArticles.length}
          />

          {/* Section Header: Priority Tabs (Latest, Trending, Unread, Saved) & Layout Controls */}
          <div
            id="news-feed-container"
            className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-200/80 dark:border-white/10 scroll-mt-20"
          >
            {/* Priority & Status Tabs */}
            <div className="flex items-center gap-1 p-1 bg-white dark:bg-[#11141E] rounded-xl border border-slate-200 dark:border-white/10 text-xs shadow-xs">
              <button
                onClick={() => setSortOption('latest')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  sortOption === 'latest'
                    ? 'bg-slate-900 text-white dark:bg-white/15 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{t.tabLatest}</span>
              </button>

              <button
                onClick={() => setSortOption('trending')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  sortOption === 'trending'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>{t.tabTrending}</span>
              </button>

              <button
                onClick={() => setSortOption('unread')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  sortOption === 'unread'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.tabUnread}</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-mono font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setSortOption('saved')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  sortOption === 'saved'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{t.tabSaved}</span>
                {savedArticlesCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-mono font-bold">
                    {savedArticlesCount}
                  </span>
                )}
              </button>
            </div>

            {/* Quick Actions (Mark Read, View Switcher, Shortcuts) */}
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 bg-white dark:bg-white/[0.05] hover:bg-slate-100 dark:hover:bg-white/[0.08] rounded-lg border border-slate-200 dark:border-white/10 transition-colors font-medium shadow-xs"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>{t.markAllRead}</span>
                </button>
              )}

              <div className="flex items-center bg-white dark:bg-[#11141E] p-0.5 rounded-lg border border-slate-200 dark:border-white/10 shadow-xs">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title={t.compactView}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => setIsShortcutsOpen(true)}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-white/[0.05] rounded-lg border border-slate-200 dark:border-white/10 font-medium shadow-xs"
                title="Phím tắt (?)"
              >
                <Keyboard className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                <span className="font-mono text-[11px]">?</span>
              </button>
            </div>
          </div>

          {/* News Feed Content */}
          {isLoading ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="space-y-2.5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <RowSkeleton key={i} />
                ))}
              </div>
            )
          ) : filteredArticles.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-[#11141E] border border-slate-200 dark:border-white/10 rounded-2xl p-8 max-w-lg mx-auto shadow-xs">
              <SearchX className="w-10 h-10 mx-auto text-slate-400 dark:text-slate-500 mb-3 stroke-[1.5]" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{t.noResults}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                {sortOption === 'saved'
                  ? t.noBookmarks
                  : sortOption === 'unread'
                  ? 'Bạn đã đọc hết tất cả các bài viết!'
                  : 'Hãy thử tìm kiếm với từ khóa khác hoặc chuyển khoảng thời gian.'}
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTag(null);
                  setSelectedCategory('all');
                  setSelectedOrigin('all');
                  setSortOption('latest');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-sm"
              >
                {lang === 'vi' ? 'Xem tất cả bài viết' : 'View all articles'}
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedArticles.map((article) => (
                <NewsCard
                  key={article.id}
                  article={article}
                  onSelectArticle={(art) => setActiveArticle(art)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2.5">
              {paginatedArticles.map((article) => (
                <NewsRowCompact
                  key={article.id}
                  article={article}
                  onSelectArticle={(art) => setActiveArticle(art)}
                />
              ))}
            </div>
          )}

          {/* Pagination Bar */}
          {filteredArticles.length > 0 && totalPages > 1 && (
            <div className="mt-10 pt-6 border-t border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {lang === 'vi' ? 'Hiển thị' : 'Showing'}{' '}
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{startIndex + 1}</span> -{' '}
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  {Math.min(endIndex, filteredArticles.length)}
                </span>{' '}
                {lang === 'vi' ? 'trên' : 'of'}{' '}
                <span className="text-slate-900 dark:text-white font-bold">{filteredArticles.length}</span>{' '}
                {lang === 'vi' ? 'bản tin' : 'articles'}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-xl border text-xs font-bold transition-colors flex items-center gap-1 ${
                    currentPage === 1
                      ? 'border-slate-200 dark:border-white/5 text-slate-300 dark:text-slate-600 cursor-not-allowed bg-slate-100 dark:bg-white/[0.02]'
                      : 'border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-emerald-500/50 bg-white dark:bg-white/[0.05]'
                  }`}
                  title={lang === 'vi' ? 'Trang trước' : 'Previous page'}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`min-w-[36px] h-9 px-2 rounded-xl text-xs font-mono font-bold transition-all ${
                        currentPage === pageNum
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 font-extrabold'
                          : 'bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-xl border text-xs font-bold transition-colors flex items-center gap-1 ${
                    currentPage === totalPages
                      ? 'border-slate-200 dark:border-white/5 text-slate-300 dark:text-slate-600 cursor-not-allowed bg-slate-100 dark:bg-white/[0.02]'
                      : 'border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-emerald-500/50 bg-white dark:bg-white/[0.05]'
                  }`}
                  title={lang === 'vi' ? 'Trang sau' : 'Next page'}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
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

      <SpotlightSearchModal
        isOpen={isSpotlightOpen}
        onClose={() => setIsSpotlightOpen(false)}
        articles={initialData.articles}
        onSelectArticle={(art) => setActiveArticle(art)}
      />
    </div>
  );
};
