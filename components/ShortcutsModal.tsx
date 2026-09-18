'use client';

import React from 'react';
import { useBilingual } from './BilingualContext';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  const { lang, t } = useBilingual();

  if (!isOpen) return null;

  const shortcutsList = lang === 'vi' ? [
    { key: 'J / K', desc: 'Lùi bài trước (J - Trái) / Tới bài sau (K - Phải)' },
    { key: 'Space', desc: 'Nghe tóm tắt bài đang chọn (hoặc Bản tin sáng)' },
    { key: 'Enter', desc: 'Mở xem chi tiết bài viết đang chọn' },
    { key: 'B', desc: 'Lưu bài đang chọn / Mở danh sách đã lưu' },
    { key: 'O', desc: 'Mở bài gốc trên trang nguồn ở tab mới' },
    { key: 'P', desc: 'Bật / Tắt Bản tin sáng 3 phút (Radio Podcast)' },
    { key: 'Ctrl + K', desc: 'Mở thanh tìm kiếm tin tức Spotlight' },
    { key: 'V', desc: 'Chuyển đổi chế độ xem Lưới / Danh sách' },
    { key: 'L', desc: 'Đổi ngôn ngữ Tiếng Việt / English' },
    { key: 'T', desc: 'Đổi chế độ Sáng / Tối' },
    { key: '[ / ]', desc: 'Chuyển trang trước / trang sau' },
    { key: '?', desc: 'Bật / Tắt bảng phím tắt này' },
    { key: 'Esc', desc: 'Đóng Modal / Bỏ chọn bài viết' },
  ] : [
    { key: 'J / K', desc: 'Previous story (J - Left) / Next story (K - Right)' },
    { key: 'Space', desc: 'Listen to focused article (or Daily Briefing)' },
    { key: 'Enter', desc: 'Open focused article detail' },
    { key: 'B', desc: 'Bookmark focused article / Open saved list' },
    { key: 'O', desc: 'Open original article in a new tab' },
    { key: 'P', desc: 'Toggle 3-Min Daily Briefing (Radio Podcast)' },
    { key: 'Ctrl + K', desc: 'Open instant Spotlight search bar' },
    { key: 'V', desc: 'Toggle Grid / Compact list view' },
    { key: 'L', desc: 'Toggle language Vietnamese / English' },
    { key: 'T', desc: 'Toggle Dark / Light theme' },
    { key: '[ / ]', desc: 'Previous / Next page' },
    { key: '?', desc: 'Toggle shortcuts cheat sheet' },
    { key: 'Esc', desc: 'Close dialogs / Clear card focus' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-[#080A0F]/80 backdrop-blur-md animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#121722] p-6 shadow-2xl border border-slate-200 dark:border-white/10 z-10 transition-colors">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">{t.shortcuts}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {shortcutsList.map((sc, i) => (
            <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-200/80 dark:border-white/5">
              <span className="text-slate-700 dark:text-slate-200 font-medium">{sc.desc}</span>
              <kbd className="px-2 py-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-slate-100 dark:bg-white/[0.06] rounded border border-slate-200 dark:border-white/10 font-bold shadow-xs">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
