'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Root Layout Global Error Captured]:', error);
  }, [error]);

  return (
    <html lang="vi" className="dark">
      <body className="min-h-screen bg-[#090A0F] text-slate-100 flex items-center justify-center p-4 font-sans antialiased">
        <div className="max-w-md w-full rounded-2xl bg-[#111522] border border-white/10 p-8 text-center shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto mb-4">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <h2 className="text-xl font-bold text-white mb-2">
            Sự Cố Hệ Thống Nghiêm Trọng
          </h2>

          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Ứng dụng gặp lỗi không thể phục hồi tại giao diện gốc. Vui lòng nhấn nút thử lại để làm mới phiên làm việc.
          </p>

          <button
            onClick={() => reset()}
            className="w-full px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Khởi động lại (Reset)</span>
          </button>
        </div>
      </body>
    </html>
  );
}
