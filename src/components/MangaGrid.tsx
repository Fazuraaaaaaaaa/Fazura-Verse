import React from 'react';
import { BookX } from 'lucide-react';
import type { MangaItem } from '../types/manga';
import { MangaCard } from './MangaCard';
import { CardGridSkeleton, EmptyState } from './common/StateViews';

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
  emptyTitle = 'Komik Tidak Ditemukan',
  emptyMessage = 'Coba ubah filter atau kata kunci untuk menemukan komik lainnya.',
  showRanking = false,
}: MangaGridProps) {
  if (isLoading) {
    return <CardGridSkeleton count={skeletonCount} />;
  }

  if (!items || items.length === 0) {
    return (
      <EmptyState
        icon={<BookX className="w-5 h-5" />}
        title={emptyTitle}
        description={emptyMessage}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
