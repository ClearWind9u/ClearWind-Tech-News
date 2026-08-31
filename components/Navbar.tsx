'use client';

import React, { useState, useEffect } from 'react';
import { useBilingual } from './BilingualContext';
import { Search, Bookmark, Sun, Moon, Sparkles, Terminal } from 'lucide-react';

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenBookmarks: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ searchQuery, setSearchQuery, onOpenBookmarks }) => {
  const { lang, setLang, t, bookmarks, isDark, toggleTheme } = useBilingual();
  const [isScrolled, setIsScrolled] = useState(false);

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
        document.getElementById('global-search-input')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        isScrolled
          ? 'bg-[#0B0E14]/90 backdrop-blur-md border-b border-white/10 shadow-lg'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-bold p-1.5">
              <svg viewBox="0 0 100 100" className="w-full h-full text-white" fill="none" stroke="currentColor" strokeWidth="9" strokeLinecap="round">
                <path d="M25 35 C 36 22, 62 22, 70 32 C 76 40, 70 50, 60 50 C 50 50, 48 42, 56 40" />
                <path d="M18 52 C 30 52, 70 52, 78 52 C 86 52, 88 64, 78 66 C 70 68, 68 60, 76 58" />
                <path d="M25 70 C 38 70, 50 70, 56 76 C 60 80, 56 86, 50 86 C 44 86, 42 80, 48 78" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">
                  {t.appName}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                  <Sparkles className="w-2.5 h-2.5" />
                  Gemini Pro
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {t.freeHostingBadge}
              </p>
            </div>
          </div>

          <div className="flex-1 max-w-md relative hidden md:block">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                id="global-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-9 pr-14 py-1.5 text-xs rounded-xl bg-[#121722] border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
              />
              <kbd className="absolute right-2.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 rounded border border-slate-700">
                Ctrl K
              </kbd>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#121722] border border-slate-700 rounded-xl p-0.5 text-xs">
              <button
                onClick={() => setLang('vi')}
                className={`px-2.5 py-1 rounded-lg transition-all font-semibold ${
                  lang === 'vi'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Tiếng Việt"
              >
                VI
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded-lg transition-all font-semibold ${
                  lang === 'en'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="English"
              >
                EN
              </button>
            </div>

            <button
              onClick={onOpenBookmarks}
              className="relative p-2 rounded-xl bg-[#121722] border border-slate-700 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40 transition-all"
              title={t.bookmarks}
            >
              <Bookmark className="w-4 h-4" />
              {bookmarks.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-[10px] text-white font-bold flex items-center justify-center">
                  {bookmarks.length}
                </span>
              )}
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-[#121722] border border-slate-700 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-all"
              title={t.themeToggle}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="pb-3 md:hidden">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-[#121722] border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
