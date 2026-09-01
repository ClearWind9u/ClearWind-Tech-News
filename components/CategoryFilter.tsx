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
    <div className="space-y-3.5 mb-6">
      {/* Top Filter Bar: Origins Switcher, Timeframe Switcher & Counter */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-slate-800">
        {/* Origins (Vietnam / Global / All) */}
        <div className="flex items-center gap-1 p-1 bg-[#121722] rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => onSelectOrigin('all')}
            className={`px-3 py-1.5 font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
              selectedOrigin === 'all'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{t.allOrigins}</span>
          </button>

          <button
            onClick={() => onSelectOrigin('vietnam')}
            className={`px-3 py-1.5 font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
              selectedOrigin === 'vietnam'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.vnOrigins}</span>
          </button>

          <button
            onClick={() => onSelectOrigin('global')}
            className={`px-3 py-1.5 font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
              selectedOrigin === 'global'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t.globalOrigins}</span>
          </button>
        </div>

        {/* Timeframe Filter (7 ngày gần nhất / 24h / 3d / Tất cả / Cũ >7d) */}
        <div className="flex items-center gap-1 p-1 bg-[#121722] rounded-xl border border-slate-800 text-xs overflow-x-auto">
          <span className="text-[11px] text-slate-400 font-semibold px-2 flex items-center gap-1 shrink-0">
            <Calendar className="w-3 h-3 text-emerald-400" />
            <span className="hidden sm:inline">{t.timeFilterLabel}</span>
          </span>

          <button
            onClick={() => setTimeFilter('7d')}
            className={`px-2.5 py-1 font-bold rounded-lg transition-colors shrink-0 ${
              timeFilter === '7d'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.time7d}
          </button>

          <button
            onClick={() => setTimeFilter('24h')}
            className={`px-2.5 py-1 font-bold rounded-lg transition-colors shrink-0 ${
              timeFilter === '24h'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.time24h}
          </button>

          <button
            onClick={() => setTimeFilter('3d')}
            className={`px-2.5 py-1 font-bold rounded-lg transition-colors shrink-0 ${
              timeFilter === '3d'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.time3d}
          </button>

          <button
            onClick={() => setTimeFilter('all')}
            className={`px-2.5 py-1 font-bold rounded-lg transition-colors shrink-0 ${
              timeFilter === 'all'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.timeAll}
          </button>

          <button
            onClick={() => setTimeFilter('archived')}
            className={`px-2.5 py-1 font-bold rounded-lg transition-colors shrink-0 ${
              timeFilter === 'archived'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold'
                : 'text-slate-400 hover:text-amber-300'
            }`}
          >
            {t.timeArchived}
          </button>
        </div>

        {/* Counter */}
        <div className="text-xs text-slate-400 font-mono flex items-center gap-1 shrink-0">
          <span className="text-emerald-400 font-bold">{totalArticlesCount}</span>
          <span>{lang === 'vi' ? 'bản tin' : 'articles'}</span>
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => onSelectCategory('all')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-colors shrink-0 border ${
            selectedCategory === 'all'
              ? 'bg-white text-slate-900 border-white shadow-md'
              : 'bg-[#121722] border-slate-800 text-slate-300 hover:text-white hover:border-slate-600'
          }`}
        >
          {t.allCategories}
        </button>

        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-colors shrink-0 border ${
              selectedCategory === cat
                ? 'bg-emerald-500 text-white border-emerald-400 shadow-sm shadow-emerald-500/20'
                : 'bg-[#121722] border-slate-800 text-slate-300 hover:text-white hover:border-slate-600'
            }`}
          >
            {getCategoryLabel(cat, lang)}
          </button>
        ))}
      </div>
    </div>
  );
};
