import React from 'react';
import type { MangaItem } from '../types/manga';
import { MediaCard } from './media/MediaCard';

interface MangaCardProps {
  manga: MangaItem;
  ranking?: number;
  showRank?: boolean;
}

export function MangaCard({ manga, ranking, showRank = false }: MangaCardProps) {
  const typeLabel = manga.type || 'Manga';

  return (
    <MediaCard
      id={manga.slug}
      category="manga"
      title={manga.title}
      imageUrl={manga.cover}
      link={`/manga/${manga.slug}`}
      topBadge={!showRank ? typeLabel : undefined}
      ranking={showRank ? ranking : undefined}
      rating={manga.rating}
      metaPrimary={manga.chapter || typeLabel}
      metaSecondary={showRank ? typeLabel : manga.date}
      bookmarkType={typeLabel}
    />
  );
}
