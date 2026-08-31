'use client';

import React from 'react';
import { useBilingual } from './BilingualContext';
import { Terminal } from 'lucide-react';

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
    <footer className="mt-20 border-t border-slate-800 bg-[#080A0F] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                <Terminal className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base text-white">
                {t.appName}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              {t.subTagline}
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{t.lastUpdated} {formattedDate}</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              Nguồn tin tổng hợp
            </h4>
            <div className="flex flex-wrap gap-1.5 text-xs text-slate-400">
              <span className="px-2 py-1 rounded bg-[#121722] border border-slate-800">VnExpress</span>
              <span className="px-2 py-1 rounded bg-[#121722] border border-slate-800">GenK</span>
              <span className="px-2 py-1 rounded bg-[#121722] border border-slate-800">Tinh Tế</span>
              <span className="px-2 py-1 rounded bg-[#121722] border border-slate-800">VietNamNet</span>
              <span className="px-2 py-1 rounded bg-[#121722] border border-slate-800">Tuổi Trẻ</span>
              <span className="px-2 py-1 rounded bg-[#121722] border border-slate-800">Viblo</span>
              <span className="px-2 py-1 rounded bg-[#121722] border border-slate-800">Dev.to</span>
              <span className="px-2 py-1 rounded bg-[#121722] border border-slate-800">Hacker News</span>
              <span className="px-2 py-1 rounded bg-[#121722] border border-slate-800">The Verge</span>
              <span className="px-2 py-1 rounded bg-[#121722] border border-slate-800">Ars Technica</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              Hạ tầng & Vận hành
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>AI Engine: <strong>Gemini Pro</strong></li>
              <li>Scheduler: <strong>GitHub Actions Cron 24/7</strong></li>
              <li>Hosting: <strong>Vercel / Cloudflare (0đ)</strong></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/60 text-center text-xs text-slate-500">
          ClearWind Tech News © 2026 • Làn Gió Tin Tức IT Tinh Gọn
        </div>
      </div>
    </footer>
  );
};
