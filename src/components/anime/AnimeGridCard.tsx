import React from 'react';
import type { AnimeItem } from '../../types/media';
import { MediaCard } from '../media/MediaCard';

interface AnimeGridCardProps {
  anime: AnimeItem;
  relationBadge?: string;
  highlightRelation?: boolean;
}

export function AnimeGridCard({
  anime,
  relationBadge,
  highlightRelation = false,
}: AnimeGridCardProps) {
  const providerSlug = anime.provider || 'otakudesu';

  const topBadge =
    anime.episodes && !String(anime.episodes).toLowerCase().includes('batch')
      ? typeof anime.episodes === 'number'
        ? `Ep ${anime.episodes}`
        : String(anime.episodes)
      : anime.status && !anime.status.toLowerCase().includes('batch')
      ? anime.status
      : undefined;

  const cleanTypeLabel =
    anime.type && !anime.type.toLowerCase().includes('batch')
      ? anime.type
      : anime.releaseDay
      ? `Rilis ${anime.releaseDay}`
      : typeof anime.genres === 'string' && anime.genres
      ? anime.genres
      : Array.isArray(anime.genres) && anime.genres.length > 0
      ? anime.genres.map((g: any) => g.title || g).join(', ')
      : anime.provider === 'nimegami'
      ? 'Klasik'
      : 'Anime';

  return (
    <MediaCard
      id={anime.id}
      category="anime"
      title={anime.title}
      imageUrl={anime.poster}
      link={`/anime/detail/${providerSlug}/${anime.id}`}
      topBadge={topBadge}
      rating={anime.score}
      metaPrimary={cleanTypeLabel}
      metaSecondary={anime.releasedOn}
      bookmarkType={
        anime.type && !anime.type.toLowerCase().includes('batch') ? anime.type : 'Anime'
      }
      relationBadge={relationBadge}
      highlight={highlightRelation}
    />
  );
}
