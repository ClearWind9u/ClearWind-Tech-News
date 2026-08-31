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
import { useBilingual } from './BilingualContext';
import {
  Newspaper,
  SearchX,
  LayoutGrid,
  List,
  Keyboard,
  X,
  Tag,
} from 'lucide-react';

interface NewsAppClientProps {
  initialData: NewsDatabase;
}

export const NewsAppClient: React.FC<NewsAppClientProps> = ({ initialData }) => {
  const { lang, setLang, t, viewMode, setViewMode, toggleTheme, selectedTag, setSelectedTag } = useBilingual();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedOrigin, setSelectedOrigin] = useState<'all' | 'vietnam' | 'global'>('all');
  const [activeArticle, setActiveArticle] = useState<NewsItem | null>(null);
  const [isBookmarkDrawerOpen, setIsBookmarkDrawerOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

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

  const categories = useMemo(() => {
    const set = new Set<string>();
    initialData.articles.forEach((a) => {
      if (a.category) set.add(a.category);
    });
    return Array.from(set);
  }, [initialData]);

  const filteredArticles = useMemo(() => {
    return initialData.articles.filter((article) => {
      if (selectedTag && !article.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase())) {
        return false;
      }

      if (selectedOrigin !== 'all' && article.sourceOrigin !== selectedOrigin) {
        return false;
      }

      if (selectedCategory !== 'all' && article.category !== selectedCategory) {
        return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleVi = article.title_vi.toLowerCase();
        const titleEn = article.title_en.toLowerCase();
        const summaryVi = article.summary_vi.join(' ').toLowerCase();
        const summaryEn = article.summary_en.join(' ').toLowerCase();
        const tags = article.tags.join(' ').toLowerCase();
        const source = article.sourceName.toLowerCase();

        return (
          titleVi.includes(query) ||
          titleEn.includes(query) ||
          summaryVi.includes(query) ||
          summaryEn.includes(query) ||
          tags.includes(query) ||
          source.includes(query)
        );
      }

      return true;
    });
  }, [initialData, selectedOrigin, selectedCategory, searchQuery, selectedTag]);

  const featuredArticles = useMemo(() => {
    return [...initialData.articles].sort((a, b) => b.hotScore - a.hotScore).slice(0, 3);
  }, [initialData]);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#0B0E14] text-white">
      <div>
        <Navbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenBookmarks={() => setIsBookmarkDrawerOpen(true)}
        />

        <TrendingTicker
          articles={initialData.articles}
          onSelectArticle={(art) => setActiveArticle(art)}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 relative z-10">
          {!searchQuery && !selectedTag && selectedCategory === 'all' && selectedOrigin === 'all' && (
            <HeroBento
              articles={featuredArticles}
              onSelectArticle={(article) => setActiveArticle(article)}
            />
          )}

          {selectedTag && (
            <div className="mb-4 flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400">
              <Tag className="w-4 h-4" />
              <span>{lang === 'vi' ? 'Đang lọc theo thẻ:' : 'Filtering by tag:'} <strong>#{selectedTag}</strong></span>
              <button
                onClick={() => setSelectedTag(null)}
                className="ml-auto p-1 hover:bg-emerald-500/20 rounded-md transition-colors"
                title="Bỏ lọc"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedOrigin={selectedOrigin}
            onSelectOrigin={setSelectedOrigin}
            totalArticlesCount={filteredArticles.length}
          />

          <div className="flex items-center justify-between mb-5 pb-2 border-b border-slate-800">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-emerald-400" />
              <span>{t.latestTitle}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                {filteredArticles.length}
              </span>
            </h2>

            <div className="flex items-center gap-2">
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

          {filteredArticles.length === 0 ? (
            <div className="py-16 text-center bg-[#121722] border border-slate-800 rounded-2xl p-8 max-w-lg mx-auto">
              <SearchX className="w-10 h-10 mx-auto text-slate-500 mb-3 stroke-[1.5]" />
              <h3 className="text-base font-bold text-white mb-2">
                {t.noResults}
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                {lang === 'vi'
                  ? 'Hãy thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc.'
                  : 'Try searching with different keywords or reset the filter.'}
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTag(null);
                  setSelectedCategory('all');
                  setSelectedOrigin('all');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
              >
                {lang === 'vi' ? 'Đặt lại bộ lọc' : 'Reset filters'}
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
