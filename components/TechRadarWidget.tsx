'use client';

import React, { useState, useEffect } from 'react';
import { TechRadarData, TechRadarItem } from '../lib/tech_radar_engine';
import { useBilingual } from './BilingualContext';
import {
  Activity,
  Flame,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  Grid,
} from 'lucide-react';

interface TechRadarWidgetProps {
  radarData: TechRadarData;
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
}

type TabView = 'all' | 'surging' | 'adopt' | 'emerging';

export const TechRadarWidget: React.FC<TechRadarWidgetProps> = ({
  radarData,
  selectedTag,
  onSelectTag,
}) => {
  const { lang, t } = useBilingual();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<TabView>('all');

  // Restore collapsed preference from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('clearwind_tech_radar_collapsed');
      if (stored !== null) {
        setIsCollapsed(stored === 'true');
      }
    }
  }, []);

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('clearwind_tech_radar_collapsed', String(next));
      }
      return next;
    });
  };

  const handleChipClick = (tagName: string) => {
    if (selectedTag && selectedTag.toLowerCase() === tagName.toLowerCase()) {
      onSelectTag(null);
    } else {
      onSelectTag(tagName);
    }
  };

  if (radarData.totalEntitiesCount === 0) return null;

  return (
    <section
      aria-label="Tech Radar & Trending Pulse"
      className="mb-8 rounded-2xl bg-white dark:bg-[#0D101A] border border-slate-200/90 dark:border-white/[0.08] shadow-xs transition-colors overflow-hidden"
    >
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-slate-200/80 dark:border-white/[0.06] bg-slate-50/60 dark:bg-white/[0.02]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-xs">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white font-display tracking-tight truncate">
                {t.techRadarTitle}
              </h2>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                24/7 Pulse
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {t.techRadarDesc}
            </p>
          </div>
        </div>

        {/* Tab Switcher & Collapse Button */}
        <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2 w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
          {/* View Filter Tabs (Linear Segmented Control) */}
          <div className="inline-flex items-center p-0.5 bg-slate-100 dark:bg-[#151926] rounded-xl border border-slate-200/80 dark:border-white/10 text-[11px] font-semibold overflow-x-auto scrollbar-none max-w-[calc(100%-2.5rem)] sm:max-w-none">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-2xs font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Grid className="w-3 h-3" />
              <span>{lang === 'vi' ? 'Tất cả' : 'All'}</span>
            </button>
            <button
              onClick={() => setActiveTab('surging')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                activeTab === 'surging'
                  ? 'bg-amber-500 text-white shadow-2xs font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-amber-500'
              }`}
            >
              <Flame className="w-3 h-3 text-amber-500 group-hover:text-amber-400" />
              <span>{lang === 'vi' ? 'Bùng nổ' : 'Surging'}</span>
            </button>
            <button
              onClick={() => setActiveTab('adopt')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                activeTab === 'adopt'
                  ? 'bg-emerald-500 text-white shadow-2xs font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-emerald-500'
              }`}
            >
              <Layers className="w-3 h-3 text-emerald-500" />
              <span>{lang === 'vi' ? 'Trọng tâm' : 'Core'}</span>
            </button>
            <button
              onClick={() => setActiveTab('emerging')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                activeTab === 'emerging'
                  ? 'bg-purple-500 text-white shadow-2xs font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-purple-400'
              }`}
            >
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>{lang === 'vi' ? 'Mới nổi' : 'Emerging'}</span>
            </button>
          </div>

          {/* Collapse Button */}
          <button
            onClick={toggleCollapsed}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            title={isCollapsed ? t.radarExpand : t.radarCollapse}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Active Filter Strip (when a tag is selected) */}
      {selectedTag && (
        <div className="px-4 sm:px-5 py-2 bg-emerald-500/10 dark:bg-emerald-500/[0.08] border-b border-emerald-500/20 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              {t.filterByTagActive}:
            </span>
            <span className="font-bold text-slate-900 dark:text-white font-mono px-2 py-0.5 rounded-md bg-white dark:bg-[#121624] border border-emerald-500/30 shadow-2xs">
              #{selectedTag}
            </span>
          </div>
          <button
            onClick={() => onSelectTag(null)}
            className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>{lang === 'vi' ? 'Hủy lọc' : 'Clear filter'}</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Radar Content View */}
      {!isCollapsed && (
        <div className="p-4 sm:p-5 animate-fade-in">
          {activeTab === 'all' ? (
            /* 3-Column Glass Deck */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Surging Column */}
              <div className="rounded-xl p-3.5 bg-slate-50/80 dark:bg-[#121624]/60 border border-slate-200/80 dark:border-white/[0.06] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-amber-500/20">
                    <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400 text-xs">
                      <Flame className="w-3.5 h-3.5" />
                      <span className="font-display uppercase tracking-wider text-[11px]">
                        {t.surgingGroup}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                      {radarData.surging.length} TECH
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {radarData.surging.map((item) => (
                      <RadarPill
                        key={item.name}
                        item={item}
                        isSelected={selectedTag?.toLowerCase() === item.name.toLowerCase()}
                        onClick={() => handleChipClick(item.name)}
                        badgeType="score"
                        accentColor="amber"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Core & Adopt Column */}
              <div className="rounded-xl p-3.5 bg-slate-50/80 dark:bg-[#121624]/60 border border-slate-200/80 dark:border-white/[0.06] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-emerald-500/20">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                      <Layers className="w-3.5 h-3.5" />
                      <span className="font-display uppercase tracking-wider text-[11px]">
                        {t.adoptGroup}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      {radarData.adopt.length} TECH
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {radarData.adopt.map((item) => (
                      <RadarPill
                        key={item.name}
                        item={item}
                        isSelected={selectedTag?.toLowerCase() === item.name.toLowerCase()}
                        onClick={() => handleChipClick(item.name)}
                        badgeType="count"
                        accentColor="emerald"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Emerging Column */}
              <div className="rounded-xl p-3.5 bg-slate-50/80 dark:bg-[#121624]/60 border border-slate-200/80 dark:border-white/[0.06] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-purple-500/20">
                    <div className="flex items-center gap-1.5 font-bold text-purple-600 dark:text-purple-400 text-xs">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span className="font-display uppercase tracking-wider text-[11px]">
                        {t.emergingGroup}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                      {radarData.emerging.length} TECH
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {radarData.emerging.map((item) => (
                      <RadarPill
                        key={item.name}
                        item={item}
                        isSelected={selectedTag?.toLowerCase() === item.name.toLowerCase()}
                        onClick={() => handleChipClick(item.name)}
                        badgeType="count"
                        accentColor="purple"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Single Category Focused Grid View */
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
              {(activeTab === 'surging'
                ? radarData.surging
                : activeTab === 'adopt'
                ? radarData.adopt
                : radarData.emerging
              ).map((item) => (
                <RadarPill
                  key={item.name}
                  item={item}
                  isSelected={selectedTag?.toLowerCase() === item.name.toLowerCase()}
                  onClick={() => handleChipClick(item.name)}
                  badgeType={activeTab === 'surging' ? 'score' : 'count'}
                  accentColor={
                    activeTab === 'surging' ? 'amber' : activeTab === 'adopt' ? 'emerald' : 'purple'
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

interface RadarPillProps {
  item: TechRadarItem;
  isSelected: boolean;
  onClick: () => void;
  badgeType: 'score' | 'count';
  accentColor: 'amber' | 'emerald' | 'purple';
}

const RadarPill: React.FC<RadarPillProps> = ({
  item,
  isSelected,
  onClick,
  badgeType,
  accentColor,
}) => {
  const hoverBorder =
    accentColor === 'amber'
      ? 'hover:border-amber-500/40 hover:bg-amber-500/[0.04]'
      : accentColor === 'emerald'
      ? 'hover:border-emerald-500/40 hover:bg-emerald-500/[0.04]'
      : 'hover:border-purple-500/40 hover:bg-purple-500/[0.04]';

  return (
    <button
      onClick={onClick}
      className={`group px-2.5 py-1 rounded-xl text-xs transition-all duration-150 flex items-center justify-between gap-1.5 active:scale-95 cursor-pointer ${
        isSelected
          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500 ring-1 ring-emerald-500/40 shadow-xs'
          : `bg-white dark:bg-[#141826] text-slate-700 dark:text-slate-300 border border-slate-200/90 dark:border-white/[0.08] ${hoverBorder}`
      }`}
    >
      <div className="flex items-center gap-1 min-w-0">
        {isSelected && <Check className="w-3 h-3 text-emerald-500 shrink-0" />}
        <span className="font-medium truncate max-w-[95px]">{item.name}</span>
      </div>
      <span
        className={`text-[10px] font-mono font-bold px-1 rounded shrink-0 ${
          isSelected
            ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
            : 'bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400'
        }`}
      >
        {badgeType === 'score' ? `${item.avgHotScore}` : `${item.count}`}
      </span>
    </button>
  );
};
