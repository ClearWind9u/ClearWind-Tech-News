'use client';

import React from 'react';
import { getCategoryLabel } from '../types/news';
import { useBilingual } from './BilingualContext';
import { Layers, MapPin, Globe, Calendar, Clock } from 'lucide-react';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  selectedOrigin: 'all' | 'vietnam' | 'global';
  onSelectOrigin: (origin: 'all' | 'vietnam' | 'global') => void;
  totalArticlesCount: number;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  selectedOrigin,
  onSelectOrigin,
  totalArticlesCount,
}) => {
  const { lang, t, timeFilter, setTimeFilter } = useBilingual();

  return (
    <div className="mb-6 space-y-3">
      {/* Category Editorial Nav (The Verge / Linear style tabs) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200 dark:border-white/10">
        <button
          onClick={() => onSelectCategory('all')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 font-mono uppercase tracking-wider ${
            selectedCategory === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05]'
          }`}
        >
          {t.allCategories}
        </button>

        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 font-mono uppercase tracking-wider ${
              selectedCategory === cat
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05]'
            }`}
          >
            {getCategoryLabel(cat, lang)}
          </button>
        ))}
      </div>

      {/* Sub-toolbar: Origin Scope & Time Horizon */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Origin Filter (Vietnam 70% / Global 30% / All) */}
        <div className="flex items-center gap-1 p-1 bg-white dark:bg-[#11141E] rounded-xl border border-slate-200 dark:border-white/10 text-xs shadow-xs">
          <button
            onClick={() => onSelectOrigin('all')}
            className={`px-2.5 py-1 font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
              selectedOrigin === 'all'
                ? 'bg-slate-900 text-white dark:bg-white/15 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{t.allOrigins}</span>
          </button>

          <button
            onClick={() => onSelectOrigin('vietnam')}
            className={`px-2.5 py-1 font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
              selectedOrigin === 'vietnam'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.vnOrigins}</span>
          </button>

          <button
            onClick={() => onSelectOrigin('global')}
            className={`px-2.5 py-1 font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
              selectedOrigin === 'global'
                ? 'bg-cyan-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t.globalOrigins}</span>
          </button>
        </div>

        {/* Time Horizon Filter & Counter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-white dark:bg-[#11141E] rounded-xl border border-slate-200 dark:border-white/10 text-xs shadow-xs">
            <button
              onClick={() => setTimeFilter('24h')}
              className={`px-2.5 py-1 font-bold rounded-lg transition-colors ${
                timeFilter === '24h'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.time24h}
            </button>

            <button
              onClick={() => setTimeFilter('3d')}
              className={`px-2.5 py-1 font-bold rounded-lg transition-colors ${
                timeFilter === '3d'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.time3d}
            </button>

            <button
              onClick={() => setTimeFilter('7d')}
              className={`px-2.5 py-1 font-bold rounded-lg transition-colors ${
                timeFilter === '7d'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.time7d}
            </button>

            <button
              onClick={() => setTimeFilter('all')}
              className={`px-2.5 py-1 font-bold rounded-lg transition-colors ${
                timeFilter === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white/15 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.timeAll}
            </button>
          </div>

          <div className="text-xs font-mono text-slate-500 dark:text-slate-400 hidden sm:block">
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{totalArticlesCount}</span>{' '}
            <span>{lang === 'vi' ? 'tin' : 'items'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
