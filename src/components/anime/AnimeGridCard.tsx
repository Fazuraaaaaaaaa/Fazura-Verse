import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Play, Heart } from 'lucide-react';
import type { AnimeItem } from '../../types/media';
import { useCategoryBookmarks } from '../../services/categoryStorage';

interface AnimeGridCardProps {
  anime: AnimeItem;
  relationBadge?: string;
  highlightRelation?: boolean;
}

export function AnimeGridCard({ anime, relationBadge, highlightRelation }: AnimeGridCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { isBookmarked, toggleBookmark } = useCategoryBookmarks('anime');

  const bookmarked = isBookmarked(anime.id);

  const handleBookmarkToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBookmark({
      id: anime.id,
      category: 'anime',
      title: anime.title,
      cover: anime.poster,
      link: `/anime/detail/${anime.provider || 'otakudesu'}/${anime.id}`,
      subtitle:
        anime.type && !anime.type.toLowerCase().includes('batch')
          ? anime.type
          : anime.status && !anime.status.toLowerCase().includes('batch')
          ? anime.status
          : 'Anime',
      type:
        anime.type && !anime.type.toLowerCase().includes('batch') ? anime.type : 'Series',
      addedAt: Date.now(),
    });
  };

  const fallbackPoster =
    "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22400%22%20viewBox%3D%220%200%20300%20400%22%3E%3Crect%20fill%3D%22%23181827%22%20width%3D%22300%22%20height%3D%22400%22%20%2F%3E%3Ctext%20fill%3D%22%23f59e0b%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%3EFAZURASTREAM%3C%2Ftext%3E%3C%2Fsvg%3E";

  const posterSrc = imgError || !anime.poster ? fallbackPoster : anime.poster;

  const cleanTypeLabel =
    anime.type && !anime.type.toLowerCase().includes('batch')
      ? anime.type
      : anime.releaseDay
      ? `Rilis ${anime.releaseDay}`
      : anime.genres
      ? typeof anime.genres === 'string'
        ? anime.genres
        : Array.isArray(anime.genres)
        ? anime.genres.map((g: any) => g.title || g).join(', ')
        : 'Series'
      : 'Series';

  return (
    <div className="relative group/card flex flex-col">
      <Link
        to={`/anime/detail/${anime.provider || 'otakudesu'}/${anime.id}`}
        className={`group relative flex flex-col rounded-2xl overflow-hidden bg-surface/90 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-amber-500/15 ${
          highlightRelation
            ? 'border border-amber-500/45 hover:border-amber-400 shadow-lg shadow-amber-500/10'
            : 'border border-border-subtle hover:border-amber-500/50'
        }`}
      >
        <div className="relative aspect-[3/4] w-full bg-surface-base overflow-hidden">
          {!imgLoaded && !imgError && (
            <div className="absolute inset-0 bg-surface animate-pulse" />
          )}

          <img
            src={posterSrc}
            alt={anime.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            onLoad={() => setImgLoaded(true)}
            onError={() => {
              setImgError(true);
              setImgLoaded(true);
            }}
            className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${
              imgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/90 via-transparent to-transparent opacity-85 pointer-events-none" />

          {/* Quick Bookmark Toggle (44x44px tap target) */}
          <button
            onClick={handleBookmarkToggle}
            title={bookmarked ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}
            aria-label={bookmarked ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}
            className={`absolute top-1.5 right-1.5 z-20 w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center backdrop-blur-md transition-all shadow-md active:scale-90 ${
              bookmarked
                ? 'bg-rose-500 text-white border border-rose-400/40 shadow-rose-500/30 opacity-100'
                : 'bg-black/65 text-slate-300 hover:text-rose-400 hover:bg-black/85 border border-white/10 opacity-90 sm:opacity-0 sm:group-hover:opacity-100'
            }`}
          >
            <Heart
              className={`w-4 h-4 transition-transform ${bookmarked ? 'fill-current scale-110' : ''}`}
            />
          </button>

          {/* Episode or Status Badge (never renders Batch) */}
          {anime.episodes && !String(anime.episodes).toLowerCase().includes('batch') ? (
            <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider shadow pointer-events-none">
              {typeof anime.episodes === 'number' ? `Ep ${anime.episodes}` : anime.episodes}
            </div>
          ) : anime.status && !anime.status.toLowerCase().includes('batch') ? (
            <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-black/80 text-slate-200 text-[10px] font-bold border border-white/10 shadow pointer-events-none">
              {anime.status}
            </div>
          ) : null}

          {/* Score Badge bottom right */}
          {anime.score && (
            <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/80 text-amber-400 text-xs font-bold border border-white/10 shadow pointer-events-none">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>{String(anime.score).replace('★', '').trim()}</span>
            </div>
          )}

          {/* Provider Tag bottom left */}
          {anime.provider && anime.provider !== 'kusonime' && (
            <div
              className={`absolute bottom-2 left-2 z-10 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shadow backdrop-blur-md pointer-events-none ${
                anime.provider === 'nimegami'
                  ? 'bg-amber-600/90 text-white border border-amber-400/40'
                  : anime.provider === 'samehadaku'
                  ? 'bg-emerald-600/90 text-white border border-emerald-400/40'
                  : 'bg-accent-primary/85 text-white border border-accent-secondary/30'
              }`}
            >
              {anime.provider === 'nimegami'
                ? 'Klasik'
                : anime.provider === 'samehadaku'
                ? 'Samehada'
                : 'Otaku'}
            </div>
          )}

          {/* Play Icon on hover */}
          <div className="hidden sm:flex absolute inset-0 z-10 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-bg-primary/40 backdrop-blur-[2px] pointer-events-none">
            <div className="w-10 h-10 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
              <Play className="w-5 h-5 fill-black ml-0.5" />
            </div>
          </div>
        </div>

        <div className="p-3 flex-1 flex flex-col justify-between gap-1.5">
          {relationBadge && (
            <span
              className={`inline-flex w-fit px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                highlightRelation
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/35'
                  : 'bg-accent-primary/20 text-accent-soft border border-accent-primary/30'
              }`}
            >
              {relationBadge}
            </span>
          )}
          <h3
            title={anime.title}
            className="font-bold text-xs sm:text-sm text-text-primary group-hover:text-amber-400 transition-colors line-clamp-2 leading-tight"
          >
            {anime.title}
          </h3>

          <div className="flex items-center justify-between text-[11px] text-text-secondary border-t border-white/5 pt-1.5">
            <span className="truncate">{cleanTypeLabel}</span>
            {anime.releasedOn && <span className="shrink-0 ml-1">{anime.releasedOn}</span>}
          </div>
        </div>
      </Link>

      {/* Desktop Full Title Tooltip Preview on Hover */}
      <div className="hidden sm:block absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max max-w-xs z-50 pointer-events-none opacity-0 group-hover/card:opacity-100 transition-all duration-200 ease-out transform group-hover/card:translate-y-0 translate-y-1">
        <div className="bg-surface-base/95 backdrop-blur-md border border-amber-500/30 text-white rounded-xl px-3 py-2 shadow-2xl shadow-black/80 space-y-1 text-center">
          <p className="text-xs font-bold leading-snug text-white line-clamp-3">{anime.title}</p>
          <div className="flex items-center justify-center gap-2 text-[10px] text-text-secondary">
            <span className="uppercase text-amber-400 font-semibold">{cleanTypeLabel}</span>
            {anime.score && <span className="text-amber-400 font-bold">★ {String(anime.score).replace('★', '').trim()}</span>}
          </div>
          <div className="w-2 h-2 bg-surface-base border-r border-b border-amber-500/30 transform rotate-45 mx-auto -mb-3" />
        </div>
      </div>
    </div>
  );
}
