'use client';

import React from 'react';
import { useBilingual } from './BilingualContext';

interface FooterProps {
  lastUpdated: string;
}

export const Footer: React.FC<FooterProps> = ({ lastUpdated }) => {
  const { lang, t } = useBilingual();

  const formattedDate = new Date(lastUpdated).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  });

  return (
    <footer className="mt-16 border-t border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-[#06080D] py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Brand & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-xs p-1 shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full text-white" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round">
                <path d="M25 35 C 36 22, 62 22, 70 32 C 76 40, 70 50, 60 50 C 50 50, 48 42, 56 40" />
                <path d="M18 52 C 30 52, 70 52, 78 52 C 86 52, 88 64, 78 66 C 70 68, 68 60, 76 58" />
                <path d="M25 70 C 38 70, 50 70, 56 76 C 60 80, 56 86, 50 86 C 44 86, 42 80, 48 78" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-sm text-slate-900 dark:text-white font-display">
                Clear<span className="text-emerald-500 dark:text-emerald-400">Wind</span> Tech
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.subTagline}
              </p>
            </div>
          </div>

          {/* Status & Last Updated */}
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{lang === 'vi' ? 'Tự động 24/7' : 'Live 24/7'}</span>
            </div>
            <span>
              {t.lastUpdated} {formattedDate}
            </span>
          </div>
        </div>

        {/* Minimal Copyright */}
        <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 gap-2 font-mono">
          <span>ClearWind Tech © 2026 • {lang === 'vi' ? 'Bản tin Công nghệ & IT Tinh Gọn' : 'Curated Tech & IT Digest'}</span>
          <span>{lang === 'vi' ? 'Không cần đăng nhập • Bảo mật trên thiết bị' : 'Zero Login Friction • Client-Side Privacy'}</span>
        </div>
      </div>
    </footer>
  );
};

