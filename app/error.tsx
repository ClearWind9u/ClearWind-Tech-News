'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home, Terminal } from 'lucide-react';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log exception to console in development
    console.error('[ClearWind Error Boundary Captured]:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#090A0F] text-slate-100 flex flex-col justify-between selection:bg-rose-500 selection:text-white font-sans antialiased relative overflow-hidden">
      {/* Radiant ambient glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-rose-500/10 via-amber-500/10 to-indigo-500/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Subtle dot grid pattern */}
      <div
        className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"
        aria-hidden="true"
      />

      {/* Top Header */}
      <header className="relative z-10 border-b border-white/[0.08] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white font-bold shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
              <Terminal className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-base tracking-tight font-display text-white">
              Clear<span className="text-rose-400">Wind</span>
            </span>
          </Link>

          <span className="text-xs font-mono font-bold text-rose-400/80 px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20">
            SYSTEM EXCEPTION
          </span>
        </div>
      </header>

      {/* Main Error Hero Card */}
      <main className="relative z-10 max-w-xl mx-auto px-4 py-16 text-center my-auto">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400 mx-auto mb-6 shadow-xl shadow-rose-500/10">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 font-mono text-xs font-bold mb-4">
          HTTP 500 • INTERNAL ERROR
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3 font-display">
          Đã xảy ra sự cố kỹ thuật bất ngờ
        </h1>

        <p className="text-sm text-slate-400 leading-relaxed mb-6 max-w-md mx-auto">
          Hệ thống gặp sự cố khi xử lý dữ liệu. Đừng lo lắng, dữ liệu bookmark và tin tức của bạn vẫn an toàn trên thiết bị.
        </p>

        {error?.digest && (
          <div className="mb-8 p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono text-slate-400 max-w-sm mx-auto truncate">
            Digest Code: <span className="text-rose-400 font-bold">{error.digest}</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Thử tải lại (Retry)</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <Home className="w-4 h-4 text-slate-400" />
            <span>Quay về trang chủ</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] px-6 py-4 text-center text-xs text-slate-500 font-mono">
        ClearWind Tech News • Automatic Error Recovery Engine
      </footer>
    </div>
  );
}
