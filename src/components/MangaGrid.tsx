import React from 'react';
import type { MangaItem } from '../types/manga';
import { MangaCard } from './MangaCard';
import { GridSkeleton } from './SkeletonLoader';
import { BookX } from 'lucide-react';

interface MangaGridProps {
  items?: MangaItem[];
  isLoading?: boolean;
  skeletonCount?: number;
  emptyTitle?: string;
  emptyMessage?: string;
  showRanking?: boolean;
}

export function MangaGrid({
  items = [],
  isLoading = false,
  skeletonCount = 12,
  emptyTitle = 'No Manga Found',
  emptyMessage = 'We could not find any manga matching your criteria.',
  showRanking = false,
}: MangaGridProps) {
  if (isLoading) {
    return <GridSkeleton count={skeletonCount} />;
  }

  if (!items || items.length === 0) {
    return (
      <div className="py-16 px-4 text-center rounded-2xl bg-card/40 border border-white/5 flex flex-col items-center justify-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-white/5 flex items-center justify-center text-slate-400 mb-4">
          <BookX className="w-7 h-7" />
        </div>
        <h4 className="text-lg font-bold text-white mb-1">{emptyTitle}</h4>
        <p className="text-sm text-slate-400 max-w-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-5">
      {items.map((manga, index) => (
        <MangaCard
          key={`${manga.slug}-${index}`}
          manga={manga}
          ranking={showRanking ? index + 1 : undefined}
          showRank={showRanking}
        />
      ))}
    </div>
  );
}
