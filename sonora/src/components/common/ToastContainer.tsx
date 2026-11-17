'use client';

import React from 'react';
import { Check, Info, AlertCircle, X } from 'lucide-react';
import { useToastStore } from '@/stores/useToastStore';
import { cn } from '@/lib/utils';

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none select-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'pointer-events-auto flex items-center gap-2.5 rounded-full px-5 py-2.5 shadow-2xl backdrop-blur-md border border-white/10 text-xs sm:text-sm font-semibold text-white animate-in fade-in slide-in-from-bottom-3 duration-200',
            toast.type === 'success'
              ? 'bg-[#181818]/95 text-white'
              : toast.type === 'error'
              ? 'bg-red-900/90 text-white'
              : 'bg-[#282828]/95 text-white'
          )}
        >
          {toast.type === 'success' ? (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1DB954] text-black">
              <Check size={12} className="stroke-[3]" />
            </span>
          ) : toast.type === 'error' ? (
            <AlertCircle size={16} className="text-red-400" />
          ) : (
            <Info size={16} className="text-[#1DB954]" />
          )}

          <span>{toast.message}</span>

          <button
            type="button"
            onClick={() => removeToast(toast.id)}
            className="ml-2 text-[#B3B3B3] hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
