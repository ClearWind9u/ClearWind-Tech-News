import React from 'react';

export default function ArticleLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090A0F] text-slate-900 dark:text-slate-100">
      {/* Sticky Nav Skeleton */}
      <nav className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0B0E14]/80 backdrop-blur-xl h-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-4 animate-pulse">
          <div className="w-32 h-5 rounded-md bg-slate-200 dark:bg-white/10" />
          <div className="w-24 h-7 rounded-lg bg-slate-200 dark:bg-white/10" />
        </div>
      </nav>

      {/* Main Grid Skeleton */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-12 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 lg:gap-12 items-start">
          {/* Main Article Area */}
          <main>
            {/* Eyebrow */}
            <div className="flex items-center gap-2 mb-5">
              <div className="w-24 h-6 rounded-full bg-slate-200 dark:bg-white/10" />
              <div className="w-20 h-6 rounded-md bg-slate-200 dark:bg-white/10" />
              <div className="w-16 h-6 rounded-md bg-slate-200 dark:bg-white/10" />
            </div>

            {/* Thumbnail */}
            <div className="w-full aspect-[16/9] rounded-2xl bg-slate-200 dark:bg-white/[0.06] mb-7" />

            {/* Headline */}
            <div className="space-y-3 mb-4">
              <div className="w-full h-8 sm:h-10 rounded-lg bg-slate-200 dark:bg-white/10" />
              <div className="w-4/5 h-8 sm:h-10 rounded-lg bg-slate-200 dark:bg-white/10" />
            </div>

            {/* Meta bar */}
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-200 dark:border-white/10">
              <div className="w-24 h-4 rounded bg-slate-200 dark:bg-white/10" />
              <div className="w-20 h-4 rounded bg-slate-200 dark:bg-white/10" />
              <div className="w-24 h-4 rounded bg-slate-200 dark:bg-white/10" />
            </div>

            {/* Takeaways boxes */}
            <div className="space-y-3 mb-8">
              <div className="w-28 h-5 rounded bg-slate-200 dark:bg-white/10 mb-4" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 rounded-xl bg-white dark:bg-[#11141E] border border-slate-200 dark:border-white/10 flex gap-4">
                  <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-white/10 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="w-full h-4 rounded bg-slate-200 dark:bg-white/10" />
                    <div className="w-5/6 h-4 rounded bg-slate-200 dark:bg-white/10" />
                  </div>
                </div>
              ))}
            </div>

            {/* Tags */}
            <div className="flex items-center gap-2 mb-8">
              <div className="w-16 h-6 rounded-full bg-slate-200 dark:bg-white/10" />
              <div className="w-20 h-6 rounded-full bg-slate-200 dark:bg-white/10" />
              <div className="w-16 h-6 rounded-full bg-slate-200 dark:bg-white/10" />
            </div>

            {/* CTA */}
            <div className="w-full h-14 rounded-2xl bg-slate-200 dark:bg-white/10" />
          </main>

          {/* Related Sidebar */}
          <aside className="space-y-4">
            <div className="w-32 h-4 rounded bg-slate-200 dark:bg-white/10" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-white dark:bg-[#11141E] border border-slate-200 dark:border-white/10 space-y-3">
                <div className="w-full aspect-[16/9] rounded-lg bg-slate-200 dark:bg-white/10" />
                <div className="w-full h-4 rounded bg-slate-200 dark:bg-white/10" />
                <div className="w-3/4 h-4 rounded bg-slate-200 dark:bg-white/10" />
              </div>
            ))}
          </aside>
        </div>
      </div>
    </div>
  );
}
