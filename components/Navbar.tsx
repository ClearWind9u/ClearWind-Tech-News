'use client';

import React, { useState, useEffect } from 'react';
import { useBilingual } from './BilingualContext';
import { Search, Bookmark, Sun, Moon, Sparkles } from 'lucide-react';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenBookmarks: () => void;
  savedCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  onOpenBookmarks,
  savedCount,
}) => {
  const { lang, setLang, t, bookmarks, isDark, toggleTheme } = useBilingual();
  const [isScrolled, setIsScrolled] = useState(false);

  const displayBookmarksCount = typeof savedCount === 'number' ? savedCount : bookmarks.length;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onOpenSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenSearch]);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        isScrolled
          ? 'bg-white/90 dark:bg-[#090A0F]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-white/10 shadow-sm dark:shadow-2xl'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-bold p-1.5">
              <svg viewBox="0 0 100 100" className="w-full h-full text-white" fill="none" stroke="currentColor" strokeWidth="9" strokeLinecap="round">
                <path d="M25 35 C 36 22, 62 22, 70 32 C 76 40, 70 50, 60 50 C 50 50, 48 42, 56 40" />
                <path d="M18 52 C 30 52, 70 52, 78 52 C 86 52, 88 64, 78 66 C 70 68, 68 60, 76 58" />
                <path d="M25 70 C 38 70, 50 70, 56 76 C 60 80, 56 86, 50 86 C 44 86, 42 80, 48 78" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white font-display">
                  Clear<span className="text-emerald-500 dark:text-emerald-400">Wind</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-500/25">
                  <Sparkles className="w-2.5 h-2.5" />
                  Tech Digest
                </span>
              </div>
              <p className="text-[10.5px] text-slate-500 dark:text-slate-400 hidden sm:block">
                {t.freeHostingBadge}
              </p>
            </div>
          </div>

          {/* Raycast / Linear Minimalist Spotlight Search Capsule */}
          <button
            onClick={onOpenSearch}
            className="flex-1 max-w-xs sm:max-w-sm hidden sm:flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-white/[0.05] dark:hover:bg-white/[0.09] border border-slate-200 dark:border-white/10 text-xs transition-all duration-200 group shadow-xs cursor-pointer text-left"
            title="Tìm kiếm thông minh (Ctrl+K)"
          >
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 min-w-0">
              <Search className="w-3.5 h-3.5 text-emerald-500 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="truncate">{lang === 'vi' ? 'Tìm nhanh bản tin...' : 'Quick search news...'}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-2">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-white/[0.08] rounded border border-slate-200 dark:border-white/10 shadow-2xs">
                ⌘K
              </kbd>
            </div>
          </button>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Mobile Search Icon Button */}
            <button
              onClick={onOpenSearch}
              className="sm:hidden p-2 rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-emerald-500 transition-colors"
              title="Tìm kiếm (Ctrl+K)"
            >
              <Search className="w-4 h-4 text-emerald-500" />
            </button>
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 rounded-xl p-0.5 text-xs">
              <button
                onClick={() => setLang('vi')}
                className={`px-2 py-1 sm:px-2.5 sm:py-1 rounded-lg transition-colors font-mono font-bold text-[11px] sm:text-xs ${
                  lang === 'vi'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Tiếng Việt"
              >
                VI
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2 py-1 sm:px-2.5 sm:py-1 rounded-lg transition-colors font-mono font-bold text-[11px] sm:text-xs ${
                  lang === 'en'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="English"
              >
                EN
              </button>
            </div>

            {/* Bookmarks Trigger */}
            <button
              onClick={onOpenBookmarks}
              className="relative p-2 rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/40 transition-colors"
              title={t.bookmarks}
            >
              <Bookmark className="w-4 h-4" />
              {displayBookmarksCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-[10px] text-white font-bold flex items-center justify-center font-mono">
                  {displayBookmarksCount}
                </span>
              )}
            </button>

            {/* Dark/Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-amber-500 dark:hover:text-cyan-400 hover:border-amber-400/40 dark:hover:border-cyan-500/40 transition-colors"
              title={t.themeToggle}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
