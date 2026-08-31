'use client';

import React from 'react';
import { getCategoryLabel } from '../types/news';
import { useBilingual } from './BilingualContext';
import { Layers, MapPin, Globe } from 'lucide-react';

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
  const { lang, t } = useBilingual();

  return (
    <div className="space-y-3.5 mb-6">
      {/* Origins Switcher (Tabs) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-1.5 p-1 bg-[#121722] rounded-xl border border-slate-800">
          <button
            onClick={() => onSelectOrigin('all')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              selectedOrigin === 'all'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            {t.allOrigins}
          </button>

          <button
            onClick={() => onSelectOrigin('vietnam')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              selectedOrigin === 'vietnam'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            {t.vnOrigins}
          </button>

          <button
            onClick={() => onSelectOrigin('global')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              selectedOrigin === 'global'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            {t.globalOrigins}
          </button>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          <span className="text-emerald-400 font-bold">{totalArticlesCount}</span> {lang === 'vi' ? 'bài viết' : 'articles'}
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => onSelectCategory('all')}
          className={`px-4 py-1.5 text-xs font-bold rounded-full transition-colors shrink-0 border ${
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
            className={`px-4 py-1.5 text-xs font-bold rounded-full transition-colors shrink-0 border ${
              selectedCategory === cat
                ? 'bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/20'
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
