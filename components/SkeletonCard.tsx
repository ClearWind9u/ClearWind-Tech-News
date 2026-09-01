'use client';

import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="rounded-2xl bg-[#121722] border border-white/10 p-4 sm:p-4.5 flex flex-col justify-between h-full animate-pulse">
      <div>
        {/* Top Banner Skeleton */}
        <div className="w-full aspect-[16/9] mb-3.5 rounded-xl bg-slate-800/60" />

        {/* Category & Time */}
        <div className="flex items-center justify-between mb-2">
          <div className="w-24 h-5 rounded-full bg-slate-800/80" />
          <div className="w-16 h-4 rounded bg-slate-800/60" />
        </div>

        {/* Title */}
        <div className="space-y-2 mb-3">
          <div className="w-full h-5 rounded bg-slate-800/90" />
          <div className="w-3/4 h-5 rounded bg-slate-800/90" />
        </div>

        {/* 3-Tier Takeaways */}
        <div className="bg-[#0B0E14]/90 p-3 sm:p-3.5 rounded-xl border border-slate-800/90 min-h-[175px] space-y-3">
          <div className="w-28 h-3.5 rounded bg-emerald-500/20" />
          <div className="space-y-1.5">
            <div className="w-full h-3.5 rounded bg-slate-800/60" />
            <div className="w-5/6 h-3.5 rounded bg-slate-800/60" />
          </div>
          <div className="space-y-1.5">
            <div className="w-full h-3.5 rounded bg-slate-800/60" />
            <div className="w-4/5 h-3.5 rounded bg-slate-800/60" />
          </div>
          <div className="space-y-1.5">
            <div className="w-full h-3.5 rounded bg-slate-800/60" />
            <div className="w-3/4 h-3.5 rounded bg-slate-800/60" />
          </div>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-1.5 mt-3">
          <div className="w-14 h-5 rounded bg-slate-800/60" />
          <div className="w-16 h-5 rounded bg-slate-800/60" />
          <div className="w-12 h-5 rounded bg-slate-800/60" />
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between mt-4">
        <div className="w-20 h-4 rounded bg-slate-800/60" />
        <div className="flex items-center gap-2">
          <div className="w-12 h-7 rounded-lg bg-slate-800/60" />
          <div className="w-7 h-7 rounded-lg bg-slate-800/60" />
        </div>
      </div>
    </div>
  );
};
