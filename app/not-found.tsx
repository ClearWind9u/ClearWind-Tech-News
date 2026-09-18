import React from 'react';
import Link from 'next/link';
import { Home, Search, Terminal, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#090A0F] text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white font-sans antialiased relative overflow-hidden">
      {/* Radiant ambient glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-emerald-500/10 via-cyan-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Subtle dot grid pattern */}
      <div
        className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"
        aria-hidden="true"
      />

      {/* Top Simple Brand Bar */}
      <header className="relative z-10 border-b border-white/[0.08] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Terminal className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-base tracking-tight font-display text-white">
              Clear<span className="text-emerald-400">Wind</span>
            </span>
          </Link>

          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Trang chủ</span>
          </Link>
        </div>
      </header>

      {/* Main 404 Hero Card */}
      <main className="relative z-10 max-w-xl mx-auto px-4 py-16 text-center my-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs font-bold mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          HTTP 404 • NOT FOUND
        </div>

        <h1 className="text-7xl sm:text-8xl font-black font-display tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-500 mb-4">
          404
        </h1>

        <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 font-display">
          Lạc vào vùng tối không gian mạng
        </h2>

        <p className="text-sm text-slate-400 leading-relaxed mb-8 max-w-md mx-auto">
          Trang bạn đang tìm kiếm có thể đã được gỡ bỏ, đổi đường dẫn hoặc tạm thời không khả dụng. Đừng lo, các luồng tin công nghệ vẫn đang cập nhật liên tục 24/7.
        </p>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Về trang chủ ClearWind</span>
          </Link>

          <Link
            href="/?search=focus"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <Search className="w-4 h-4 text-emerald-400" />
            <span>Tìm kiếm tin tức (⌘K)</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] px-6 py-4 text-center text-xs text-slate-500 font-mono">
        ClearWind Tech News • Autonomous 24/7 Engine
      </footer>
    </div>
  );
}
