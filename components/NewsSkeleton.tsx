'use client';

import React from 'react';

export const CardSkeleton: React.FC = () => {
  return (
    <div className="rounded-2xl bg-white dark:bg-[#11141E] border border-slate-200 dark:border-white/10 p-5 flex flex-col justify-between animate-pulse">
      <div>
        {/* Thumbnail skeleton */}
        <div className="w-full aspect-[16/9] rounded-xl bg-slate-200 dark:bg-white/[0.06] mb-4" />

        {/* Category & meta pills */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-20 h-4 rounded-md bg-slate-200 dark:bg-white/[0.06]" />
          <div className="w-16 h-4 rounded-md bg-slate-200 dark:bg-white/[0.06]" />
        </div>

        {/* Headline skeleton */}
        <div className="space-y-2 mb-4">
          <div className="w-full h-5 rounded-md bg-slate-200 dark:bg-white/[0.08]" />
          <div className="w-3/4 h-5 rounded-md bg-slate-200 dark:bg-white/[0.08]" />
        </div>

        {/* Takeaways skeleton */}
        <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 space-y-2 mb-4">
          <div className="w-24 h-3 rounded bg-slate-200 dark:bg-white/[0.06]" />
          <div className="w-full h-3 rounded bg-slate-200 dark:bg-white/[0.04]" />
          <div className="w-5/6 h-3 rounded bg-slate-200 dark:bg-white/[0.04]" />
        </div>
      </div>

      {/* Footer skeleton */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-white/10">
        <div className="w-24 h-4 rounded bg-slate-200 dark:bg-white/[0.06]" />
        <div className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-white/[0.06]" />
      </div>
    </div>
  );
};

export const RowSkeleton: React.FC = () => {
  return (
    <div className="p-4 rounded-xl bg-white dark:bg-[#11141E] border border-slate-200 dark:border-white/10 flex items-center justify-between gap-4 animate-pulse">
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-white/[0.06] shrink-0 hidden sm:block" />
        <div className="flex-1 space-y-1.5 min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-16 h-3.5 rounded bg-slate-200 dark:bg-white/[0.06]" />
            <div className="w-12 h-3.5 rounded bg-slate-200 dark:bg-white/[0.06]" />
          </div>
          <div className="w-4/5 h-4 rounded bg-slate-200 dark:bg-white/[0.08]" />
        </div>
      </div>
      <div className="w-16 h-4 rounded bg-slate-200 dark:bg-white/[0.06] shrink-0" />
    </div>
  );
};

export const HeroSkeleton: React.FC = () => {
  return (
    <div className="mb-10 rounded-2xl bg-white dark:bg-[#11141E] border border-slate-200 dark:border-white/10 p-5 sm:p-7 shadow-xs animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Main Lead Story skeleton */}
        <div className="lg:col-span-8 flex flex-col justify-between pr-0 lg:pr-6 lg:border-r border-slate-200 dark:border-white/10">
          <div>
            <div className="w-full aspect-[16/9] rounded-xl bg-slate-200 dark:bg-white/[0.06] mb-5" />
            <div className="flex items-center gap-2 mb-3">
              <div className="w-24 h-4 rounded bg-slate-200 dark:bg-white/[0.06]" />
              <div className="w-20 h-4 rounded bg-slate-200 dark:bg-white/[0.06]" />
            </div>
            <div className="space-y-2 mb-4">
              <div className="w-full h-7 rounded bg-slate-200 dark:bg-white/[0.08]" />
              <div className="w-3/4 h-7 rounded bg-slate-200 dark:bg-white/[0.08]" />
            </div>
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-white/[0.02] space-y-2">
              <div className="w-full h-3.5 rounded bg-slate-200 dark:bg-white/[0.04]" />
              <div className="w-5/6 h-3.5 rounded bg-slate-200 dark:bg-white/[0.04]" />
              <div className="w-4/5 h-3.5 rounded bg-slate-200 dark:bg-white/[0.04]" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-200 dark:border-white/10">
            <div className="w-32 h-4 rounded bg-slate-200 dark:bg-white/[0.06]" />
            <div className="w-20 h-4 rounded bg-slate-200 dark:bg-white/[0.06]" />
          </div>
        </div>

        {/* Secondary Stories skeleton */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-6">
          <div className="w-32 h-4 rounded bg-slate-200 dark:bg-white/[0.06]" />
          <div className="flex-1 flex flex-col justify-around gap-6">
            <div className="space-y-3">
              <div className="w-20 h-3.5 rounded bg-slate-200 dark:bg-white/[0.06]" />
              <div className="w-full h-5 rounded bg-slate-200 dark:bg-white/[0.08]" />
              <div className="w-4/5 h-5 rounded bg-slate-200 dark:bg-white/[0.08]" />
              <div className="w-28 h-3 rounded bg-slate-200 dark:bg-white/[0.04]" />
            </div>
            <div className="h-px bg-slate-200 dark:bg-white/10" />
            <div className="space-y-3">
              <div className="w-20 h-3.5 rounded bg-slate-200 dark:bg-white/[0.06]" />
              <div className="w-full h-5 rounded bg-slate-200 dark:bg-white/[0.08]" />
              <div className="w-4/5 h-5 rounded bg-slate-200 dark:bg-white/[0.08]" />
              <div className="w-28 h-3 rounded bg-slate-200 dark:bg-white/[0.04]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
