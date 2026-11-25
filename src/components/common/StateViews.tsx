import React from 'react';
import { AlertCircle, RefreshCw, Inbox } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="rounded-[16px] bg-[#191C25] border border-[#343744] py-14 px-6 text-center space-y-3">
      <div className="w-11 h-11 rounded-[10px] bg-[#232633] border border-[#343744] text-[#A2A4B1] flex items-center justify-center mx-auto">
        {icon || <Inbox className="w-5 h-5" />}
      </div>
      <h3 className="font-heading text-lg font-semibold text-[#F2F0EC]">{title}</h3>
      <p className="text-sm text-[#A2A4B1] max-w-md mx-auto leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <div className="pt-2">
          <Button variant="primary" size="md" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Gagal Memuat Konten',
  description = 'Server sedang mengalami kendala atau koneksi terganggu. Silakan coba muat ulang.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="rounded-[16px] bg-[#191C25] border border-[#343744] py-14 px-6 text-center space-y-3">
      <div className="w-11 h-11 rounded-[10px] bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h3 className="font-heading text-lg font-semibold text-[#F2F0EC]">{title}</h3>
      <p className="text-sm text-[#A2A4B1] max-w-md mx-auto leading-relaxed">{description}</p>
      {onRetry && (
        <div className="pt-2">
          <Button variant="secondary" size="md" onClick={onRetry}>
            <RefreshCw className="w-4 h-4" />
            <span>Coba Lagi</span>
          </Button>
        </div>
      )}
    </div>
  );
}

export function CardGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-[10px] overflow-hidden bg-[#191C25] border border-[#343744]/70 flex flex-col"
        >
          <div className="aspect-[2/3] w-full skeleton-shimmer" />
          <div className="p-3 space-y-2">
            <div className="h-4 rounded-[6px] bg-[#232633] w-4/5" />
            <div className="h-3 rounded-[6px] bg-[#232633]/70 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
