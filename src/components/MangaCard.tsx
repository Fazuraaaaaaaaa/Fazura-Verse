import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, BookOpen, Clock, Flame } from 'lucide-react';
import type { MangaItem } from '../types/manga';

interface MangaCardProps {
  manga: MangaItem;
  ranking?: number;
  showRank?: boolean;
}

export function MangaCard({ manga, ranking, showRank = false }: MangaCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Normalize type
  const rawType = (manga.type || 'manga').toLowerCase().trim();
  const typeBadgeColors =
    rawType === 'manhwa'
      ? 'bg-purple-500/90 text-white border-purple-400/30'
      : rawType === 'manhua'
      ? 'bg-emerald-500/90 text-white border-emerald-400/30'
      : 'bg-indigo-500/90 text-white border-indigo-400/30';

  // Format rating
  const ratingValue = manga.rating ? parseFloat(manga.rating) : null;

  // Placeholder SVG cover
  const placeholderCover =
    "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22200%22%20height%3D%22300%22%20viewBox%3D%220%200%20200%20300%22%3E%3Crect%20fill%3D%22%23121829%22%20width%3D%22200%22%20height%3D%22300%22%2F%3E%3Ctext%20fill%3D%22%236366f1%22%20font-family%3D%22sans-serif%22%20font-size%3D%2214%22%20dy%3D%2210.5%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%3EFAZURAVERSE%3C%2Ftext%3E%3C%2Fsvg%3E";

  const coverSrc = imgError || !manga.cover ? placeholderCover : manga.cover;

  return (
    <Link
      to={`/manga/${manga.slug}`}
      className="group relative flex flex-col rounded-xl overflow-hidden bg-card/80 border border-white/5 hover:border-accent-indigo/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-accent-indigo/10"
    >
      {/* Cover Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-900">
        {/* Shimmer skeleton while loading */}
        {!imgLoaded && !imgError && (
          <div className="absolute inset-0 bg-slate-800 animate-pulse" />
        )}

        <img
          src={coverSrc}
          alt={manga.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          onLoad={() => setImgLoaded(true)}
          onError={() => {
            setImgError(true);
            setImgLoaded(true);
          }}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Gradient Overlay for badges & text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Ranking Badge if top/popular */}
        {showRank && typeof ranking === 'number' && (
          <div
            className={`absolute top-2 left-2 z-10 w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shadow-lg backdrop-blur-md ${
              ranking === 1
                ? 'bg-amber-500 text-black border border-amber-300/40'
                : ranking === 2
                ? 'bg-slate-300 text-black border border-white/40'
                : ranking === 3
                ? 'bg-amber-700 text-white border border-amber-500/40'
                : 'bg-black/70 text-slate-200 border border-white/10'
            }`}
          >
            {ranking <= 3 ? <Flame className="w-3.5 h-3.5" /> : ranking}
          </div>
        )}

        {/* Type Badge (Manga/Manhwa/Manhua) */}
        <div className={`absolute top-2 ${showRank ? 'left-10' : 'left-2'} z-10`}>
          <span
            className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border backdrop-blur-md shadow-sm ${typeBadgeColors}`}
          >
            {manga.type || 'Manga'}
          </span>
        </div>

        {/* Rating Badge */}
        {ratingValue && ratingValue > 0 && (
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/70 border border-white/10 backdrop-blur-md text-amber-400 text-xs font-bold shadow-sm">
            <Star className="w-3 h-3 fill-amber-400" />
            <span>{ratingValue.toFixed(1)}</span>
          </div>
        )}

        {/* Quick Read Overlay Button on Desktop Hover */}
        <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/50 backdrop-blur-[2px]">
          <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-accent-indigo text-white text-xs font-semibold shadow-lg shadow-accent-indigo/40 transform scale-95 group-hover:scale-100 transition-transform">
            <BookOpen className="w-3.5 h-3.5" />
            Details
          </span>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-3 flex-1 flex flex-col justify-between gap-2">
        <h3
          title={manga.title}
          className="font-bold text-sm text-slate-100 group-hover:text-accent-indigo transition-colors line-clamp-2 leading-tight"
        >
          {manga.title}
        </h3>

        <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-white/5 pt-2">
          {manga.chapter ? (
            <span className="font-semibold text-accent-cyan truncate max-w-[65%]">
              {manga.chapter}
            </span>
          ) : (
            <span className="text-slate-500">Read Now</span>
          )}

          {manga.date && (
            <span className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0">
              <Clock className="w-2.5 h-2.5" />
              {manga.date}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
