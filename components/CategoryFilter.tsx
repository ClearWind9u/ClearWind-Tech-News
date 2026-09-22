'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  getCategoryLabel,
  ArchiveManifest,
  ReadTimeFilterOption,
  HotFilterOption,
} from '../types/news';
import { useBilingual } from './BilingualContext';
import {
  X,
  SlidersHorizontal,
  RotateCcw,
  Archive,
  Clock,
  Flame,
  Zap,
  Tag,
  MapPin,
  Globe,
  Bot,
  Layers,
  ChevronDown,
  Check,
} from 'lucide-react';

export interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  selectedOrigin: 'all' | 'vietnam' | 'global';
  onSelectOrigin: (origin: 'all' | 'vietnam' | 'global') => void;
  totalArticlesCount: number;
  // Advanced Filter Options
  archiveManifest?: ArchiveManifest;
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
  readTimeFilter: ReadTimeFilterOption;
  onSelectReadTime: (option: ReadTimeFilterOption) => void;
  hotFilter: HotFilterOption;
  onSelectHotFilter: (option: HotFilterOption) => void;
  availableTags?: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  onResetAllFilters: () => void;
  isFiltered: boolean;
  activeFiltersCount: number;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  selectedOrigin,
  onSelectOrigin,
  totalArticlesCount,
  archiveManifest,
  selectedMonth,
  onSelectMonth,
  readTimeFilter,
  onSelectReadTime,
  hotFilter,
  onSelectHotFilter,
  availableTags = [],
  selectedTag,
  onSelectTag,
  onResetAllFilters,
  isFiltered,
  activeFiltersCount,
}) => {
  const { lang, t, timeFilter, setTimeFilter } = useBilingual();
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isArchiveDropdownOpen, setIsArchiveDropdownOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const months = archiveManifest?.months ?? [];

  // Close panel when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsFilterPanelOpen(false);
        setIsArchiveDropdownOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFilterPanelOpen(false);
        setIsArchiveDropdownOpen(false);
      }
    };

    if (isFilterPanelOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFilterPanelOpen]);

  // Find active month label
  const activeMonthObj = months.find((m) => m.key === selectedMonth);
  const activeMonthLabel = activeMonthObj
    ? `${lang === 'vi' ? activeMonthObj.label_vi : activeMonthObj.label_en} (${activeMonthObj.count})`
    : t.allMonths;

  return (
    <div className="mb-6 space-y-3 relative" ref={panelRef}>
      {/* Smart Presets */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none touch-pan-x">
        <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest shrink-0 hidden sm:block">
          {lang === 'vi' ? 'Khám phá:' : 'Discover:'}
        </span>

        <button
          onClick={() => {
            onSelectCategory('all');
            onSelectOrigin('all');
            setTimeFilter('24h');
            onSelectHotFilter('trending');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0
            bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400
            hover:from-orange-500/20 hover:to-red-500/20 hover:border-orange-500/50 hover:shadow-sm"
        >
          <Flame className="w-3.5 h-3.5" />
          {lang === 'vi' ? 'Hôm nay Hot' : 'Hot Today'}
        </button>

        <button
          onClick={() => {
            onSelectCategory('all');
            onSelectOrigin('vietnam');
            setTimeFilter('7d');
            onSelectHotFilter('all');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0
            bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400
            hover:bg-emerald-500/20 hover:border-emerald-500/50 hover:shadow-sm"
        >
          <MapPin className="w-3.5 h-3.5" />
          {lang === 'vi' ? 'Tin Việt Nam' : 'VN Tech'}
        </button>

        <button
          onClick={() => {
            onSelectCategory('AI & Machine Learning');
            onSelectOrigin('all');
            setTimeFilter('7d');
            onSelectHotFilter('all');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0
            bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400
            hover:bg-purple-500/20 hover:border-purple-500/50 hover:shadow-sm"
        >
          <Bot className="w-3.5 h-3.5" />
          {lang === 'vi' ? 'AI mới nhất' : 'Latest AI'}
        </button>

        <button
          onClick={() => {
            onSelectCategory('all');
            onSelectOrigin('all');
            setTimeFilter('all');
            onSelectReadTime('quick');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0
            bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400
            hover:bg-sky-500/20 hover:border-sky-500/50 hover:shadow-sm"
        >
          <Zap className="w-3.5 h-3.5" />
          {lang === 'vi' ? 'Đọc nhanh' : 'Quick reads'}
        </button>

        {isFiltered && (
          <button
            onClick={onResetAllFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shrink-0
              border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400
              hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-500/40 hover:bg-rose-500/5"
          >
            <X className="w-3 h-3" />
            {lang === 'vi' ? 'Bỏ lọc' : 'Clear'}
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[9px] font-mono font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* 1. Category Editorial Nav (The Verge / Linear style tabs) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none touch-pan-x border-b border-slate-200 dark:border-white/10">
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

      {/* 2. Unified Command Bar (Source Origin + Filter Dock Button) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
        {/* Left: Origin Scope Switcher (All / Vietnam 70% / Global 30%) */}
        <div className="flex items-center gap-1 p-1 bg-white dark:bg-[#11141E] rounded-xl border border-slate-200 dark:border-white/10 text-xs shadow-xs overflow-x-auto scrollbar-none shrink-0">
          <button
            onClick={() => onSelectOrigin('all')}
            className={`px-3 py-1.5 font-bold rounded-lg transition-colors flex items-center gap-1.5 shrink-0 ${
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
            className={`px-3 py-1.5 font-bold rounded-lg transition-colors flex items-center gap-1.5 shrink-0 ${
              selectedOrigin === 'vietnam'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
            <span>{t.vnOrigins}</span>
          </button>

          <button
            onClick={() => onSelectOrigin('global')}
            className={`px-3 py-1.5 font-bold rounded-lg transition-colors flex items-center gap-1.5 shrink-0 ${
              selectedOrigin === 'global'
                ? 'bg-cyan-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
            <span>{t.globalOrigins}</span>
          </button>
        </div>

        {/* Right: Filter Drawer Button + Total Count */}
        <div className="flex items-center justify-between sm:justify-end gap-2">
          {/* Faceted Filter Toggle Button */}
          <button
            onClick={() => setIsFilterPanelOpen((prev) => !prev)}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
              isFilterPanelOpen || activeFiltersCount > 0
                ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20'
                : 'border-slate-200 dark:border-white/10 bg-white dark:bg-[#11141E] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{t.filters}</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-indigo-500 text-white font-mono text-[10px] flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Reset All Filters Button (Visible when any filter is active) */}
          {isFiltered && (
            <button
              onClick={onResetAllFilters}
              className="p-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-all text-xs flex items-center gap-1"
              title={t.resetFilters}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Total Count Badge */}
          <div className="text-xs font-mono text-slate-500 dark:text-slate-400 hidden sm:block pl-1">
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {totalArticlesCount}
            </span>{' '}
            <span>{t.articlesCount}</span>
          </div>
        </div>
      </div>


      {/* 3. Active Filter Chips Bar (Linear / GitHub Faceted Style) */}
      {isFiltered && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs animate-in fade-in slide-in-from-top-1 duration-150">
          <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px] mr-1">
            {t.activeFilters}:
          </span>

          {/* Origin Chip */}
          {selectedOrigin !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-medium text-[11px]">
              {selectedOrigin === 'vietnam' ? (
                <>
                  <MapPin className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  {t.vnOrigins}
                </>
              ) : (
                <>
                  <Globe className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                  {t.globalOrigins}
                </>
              )}
              <button
                onClick={() => onSelectOrigin('all')}
                className="hover:text-slate-900 dark:hover:text-white transition-colors ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Time Horizon Chip */}
          {timeFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-700 dark:text-blue-300 font-medium text-[11px]">
              <Clock className="w-2.5 h-2.5" />
              {timeFilter === '24h' ? t.time24h : timeFilter === '3d' ? t.time3d : t.time7d}
              <button
                onClick={() => setTimeFilter('all')}
                className="hover:text-slate-900 dark:hover:text-white transition-colors ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Reading Time Chip */}
          {readTimeFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-medium text-[11px]">
              <Clock className="w-2.5 h-2.5" />
              {readTimeFilter === 'quick'
                ? t.readQuick
                : readTimeFilter === 'medium'
                ? t.readMedium
                : t.readDeep}
              <button
                onClick={() => onSelectReadTime('all')}
                className="hover:text-slate-900 dark:hover:text-white transition-colors ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Hotness Chip */}
          {hotFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 font-medium text-[11px]">
              {hotFilter === 'trending' ? (
                <Flame className="w-3 h-3 text-rose-600 dark:text-rose-400" />
              ) : (
                <Zap className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              )}
              {hotFilter === 'trending' ? t.hotTrending : t.hotSuper}
              <button
                onClick={() => onSelectHotFilter('all')}
                className="hover:text-slate-900 dark:hover:text-white transition-colors ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Archive Month Chip */}
          {selectedMonth !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-700 dark:text-purple-300 font-mono text-[11px]">
              <Archive className="w-3 h-3 text-purple-600 dark:text-purple-400" />
              {activeMonthLabel}
              <button
                onClick={() => onSelectMonth('all')}
                className="hover:text-slate-900 dark:hover:text-white transition-colors ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Tag Chip */}
          {selectedTag && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 font-mono text-[11px]">
              <Tag className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />#{selectedTag}
              <button
                onClick={() => onSelectTag(null)}
                className="hover:text-slate-900 dark:hover:text-white transition-colors ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Quick Clear All Button */}
          <button
            onClick={onResetAllFilters}
            className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 underline underline-offset-2 ml-1 transition-colors"
          >
            {t.clearAll}
          </button>
        </div>
      )}

      {/* 4. Faceted Filter Popover / Panel (Adaptive Bottom-Sheet on Mobile, Popover on Desktop) */}
      {isFilterPanelOpen && (
        <>
          {/* Mobile Sheet Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs sm:hidden animate-in fade-in duration-150"
            onClick={() => setIsFilterPanelOpen(false)}
          />

          <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl max-h-[85vh] overflow-y-auto p-5 pb-8 sm:pb-5 bg-white dark:bg-[#11141E] shadow-2xl border-t border-slate-200 dark:border-white/10 sm:relative sm:inset-auto sm:bottom-auto sm:top-auto sm:left-auto sm:right-auto sm:z-auto sm:rounded-2xl sm:border sm:max-h-none sm:mt-3 sm:shadow-lg space-y-4 animate-in fade-in slide-in-from-bottom sm:slide-in-from-top-2 duration-200">
            {/* Mobile Sheet Drag Handle */}
            <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-white/20 mx-auto mb-1 sm:hidden" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  {t.filters}
                </h4>
              </div>
              <button
                onClick={() => setIsFilterPanelOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                title={lang === 'vi' ? 'Đóng bộ lọc' : 'Close filters'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Group 1: Time Horizon */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                {t.timeHorizon}
              </span>
              <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-black/40 rounded-xl border border-slate-200/80 dark:border-white/5">
                {(['all', '24h', '3d', '7d'] as const).map((time) => {
                  const label =
                    time === 'all'
                      ? t.timeAll
                      : time === '24h'
                      ? t.time24h
                      : time === '3d'
                      ? t.time3d
                      : t.time7d;
                  return (
                    <button
                      key={time}
                      onClick={() => setTimeFilter(time)}
                      className={`py-1.5 px-2 rounded-lg font-medium transition-all text-center ${
                        timeFilter === time
                          ? 'bg-blue-600 text-white shadow-xs font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/10'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Group 2: Reading Time */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                {t.readTimeFilter}
              </span>
              <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-black/40 rounded-xl border border-slate-200/80 dark:border-white/5">
                {(['all', 'quick', 'medium', 'deep'] as const).map((r) => {
                  const label =
                    r === 'all'
                      ? t.timeAll
                      : r === 'quick'
                      ? '< 3p'
                      : r === 'medium'
                      ? '3 - 6p'
                      : '> 6p';
                  return (
                    <button
                      key={r}
                      onClick={() => onSelectReadTime(r)}
                      className={`py-1.5 px-2 rounded-lg font-medium transition-all text-center ${
                        readTimeFilter === r
                          ? 'bg-amber-500 text-white shadow-xs font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/10'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Group 2: Hotness Level */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                {t.hotnessLevel}
              </span>
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-black/40 rounded-xl border border-slate-200/80 dark:border-white/5">
                <button
                  onClick={() => onSelectHotFilter('all')}
                  className={`py-1.5 px-2 rounded-lg font-medium transition-all text-center ${
                    hotFilter === 'all'
                      ? 'bg-slate-900 text-white dark:bg-white/20 dark:text-white shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/10'
                  }`}
                >
                  {t.timeAll}
                </button>
                <button
                  onClick={() => onSelectHotFilter('trending')}
                  className={`py-1.5 px-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1 ${
                    hotFilter === 'trending'
                      ? 'bg-rose-500 text-white shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/10'
                  }`}
                >
                  <Flame className="w-3 h-3 text-rose-300" />
                  <span>Hot</span>
                </button>
                <button
                  onClick={() => onSelectHotFilter('superhot')}
                  className={`py-1.5 px-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1 ${
                    hotFilter === 'superhot'
                      ? 'bg-rose-600 text-white shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/10'
                  }`}
                >
                  <Zap className="w-3 h-3 text-amber-300" />
                  <span>Super</span>
                </button>
              </div>
            </div>

            {/* Group 3: Archive Month Custom Selector */}
            <div className="space-y-1.5 relative">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Archive className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
                {t.archive}
              </span>
              <button
                onClick={() => setIsArchiveDropdownOpen((prev) => !prev)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-200/80 dark:border-white/5 text-slate-800 dark:text-slate-200 text-xs hover:border-purple-500/50 transition-colors"
              >
                <span className="truncate">{activeMonthLabel}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1 shrink-0" />
              </button>

              {/* Custom Archive Dropdown Menu */}
              {isArchiveDropdownOpen && (
                <div className="absolute top-full left-0 right-0 z-40 mt-1 p-1 bg-white dark:bg-[#141724] border border-slate-200 dark:border-white/15 rounded-xl shadow-xl max-h-48 overflow-y-auto space-y-0.5">
                  <button
                    onClick={() => {
                      onSelectMonth('all');
                      setIsArchiveDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs transition-colors ${
                      selectedMonth === 'all'
                        ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                    }`}
                  >
                    <span>{t.allMonths}</span>
                    {selectedMonth === 'all' && <Check className="w-3 h-3 text-purple-500" />}
                  </button>
                  {months.map((m) => (
                    <button
                      key={m.key}
                      onClick={() => {
                        onSelectMonth(m.key);
                        setIsArchiveDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs transition-colors ${
                        selectedMonth === m.key
                          ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 font-semibold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                      }`}
                    >
                      <span>
                        {lang === 'vi' ? m.label_vi : m.label_en} ({m.count})
                      </span>
                      {selectedMonth === m.key && <Check className="w-3 h-3 text-purple-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Group 4: Tech Tags Cloud */}
          {availableTags.length > 0 && (
            <div className="pt-3 border-t border-slate-200 dark:border-white/5 space-y-2">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                {t.techTags}
              </span>
              <div className="flex flex-wrap items-center gap-1.5 max-h-24 overflow-y-auto pr-1">
                {availableTags.map((tag) => {
                  const isSelected = selectedTag?.toLowerCase() === tag.toLowerCase();
                  return (
                    <button
                      key={tag}
                      onClick={() => onSelectTag(isSelected ? null : tag)}
                      className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-all flex items-center gap-1 ${
                        isSelected
                          ? 'bg-indigo-500 text-white font-bold shadow-xs'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      #{tag}
                      {isSelected && <Check className="w-2.5 h-2.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer Action Bar */}
          <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
            <button
              onClick={onResetAllFilters}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              {t.resetFilters}
            </button>
            <button
              onClick={() => setIsFilterPanelOpen(false)}
              className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 font-bold text-xs transition-colors shadow-xs"
            >
              {lang === 'vi' ? 'Áp dụng' : 'Done'}
            </button>
          </div>
        </div>
      </>
      )}
    </div>
  );
};
