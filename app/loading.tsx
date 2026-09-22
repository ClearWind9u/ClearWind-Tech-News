import React from 'react';
import { CardSkeleton, HeroSkeleton } from '@/components/NewsSkeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090A0F] text-slate-900 dark:text-slate-100">
      {/* Top Navbar Skeleton */}
      <div className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0B0E14]/80 backdrop-blur-xl h-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20" />
            <div className="w-32 h-5 rounded-md bg-slate-200 dark:bg-white/10" />
          </div>
          <div className="hidden sm:block w-72 h-9 rounded-xl bg-slate-200/70 dark:bg-white/5" />
          <div className="flex items-center gap-2">
            <div className="w-20 h-8 rounded-lg bg-slate-200 dark:bg-white/10" />
            <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-white/10" />
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Bento Hero Skeleton */}
        <HeroSkeleton />

        {/* Filter Bar Skeleton */}
        <div className="mb-6 space-y-3 animate-pulse">
          <div className="flex items-center gap-2 overflow-hidden pb-1">
            <div className="w-16 h-4 rounded bg-slate-200 dark:bg-white/10" />
            <div className="w-24 h-8 rounded-xl bg-slate-200 dark:bg-white/10" />
            <div className="w-24 h-8 rounded-xl bg-slate-200 dark:bg-white/10" />
            <div className="w-24 h-8 rounded-xl bg-slate-200 dark:bg-white/10" />
            <div className="w-24 h-8 rounded-xl bg-slate-200 dark:bg-white/10" />
          </div>
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2">
            <div className="w-20 h-7 rounded-lg bg-slate-200 dark:bg-white/10" />
            <div className="w-28 h-7 rounded-lg bg-slate-200 dark:bg-white/10" />
            <div className="w-28 h-7 rounded-lg bg-slate-200 dark:bg-white/10" />
            <div className="w-28 h-7 rounded-lg bg-slate-200 dark:bg-white/10" />
          </div>
        </div>

        {/* News Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </main>
    </div>
  );
}
