'use client';

import React from 'react';
import { useBilingual } from './BilingualContext';
import { Terminal, ShieldCheck, CheckCircle2, Globe2 } from 'lucide-react';

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
    <footer className="mt-20 border-t border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#07090E] py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-sm">
                <Terminal className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base text-slate-900 dark:text-white font-display">
                {t.appName}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              {t.subTagline}
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{t.lastUpdated} {formattedDate}</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3 flex items-center gap-1.5 font-mono">
              <Globe2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
              <span>{lang === 'vi' ? 'Nguồn tin chọn lọc' : 'Curated Sources'}</span>
            </h4>
            <div className="flex flex-wrap gap-1.5 text-xs text-slate-600 dark:text-slate-400">
              <span className="px-2 py-1 rounded bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300">VnExpress</span>
              <span className="px-2 py-1 rounded bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300">GenK</span>
              <span className="px-2 py-1 rounded bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300">Tinh Tế</span>
              <span className="px-2 py-1 rounded bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300">VietNamNet</span>
              <span className="px-2 py-1 rounded bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300">Tuổi Trẻ</span>
              <span className="px-2 py-1 rounded bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300">Dev.to</span>
              <span className="px-2 py-1 rounded bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300">Hacker News</span>
              <span className="px-2 py-1 rounded bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300">The Verge</span>
              <span className="px-2 py-1 rounded bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300">Ars Technica</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3 flex items-center gap-1.5 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
              <span>{lang === 'vi' ? 'Tiêu chuẩn biên tập' : 'Editorial Standards'}</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                <span>{lang === 'vi' ? 'Tổng hợp đa nguồn uy tín 24/7' : 'Curated multi-source 24/7 digest'}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                <span>{lang === 'vi' ? 'Tóm tắt 3 điểm cốt lõi chuẩn IT' : '3-tier core technical key takeaways'}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                <span>{lang === 'vi' ? 'Song ngữ hoàn chỉnh Việt - Anh' : 'Bilingual Vietnamese & English'}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200/80 dark:border-white/10 text-center text-xs text-slate-500 font-mono">
          ClearWind Tech © 2026 • {lang === 'vi' ? 'Bản tin Công nghệ & IT Tinh Gọn' : 'Curated Tech & IT Digest'}
        </div>
      </div>
    </footer>
  );
};
