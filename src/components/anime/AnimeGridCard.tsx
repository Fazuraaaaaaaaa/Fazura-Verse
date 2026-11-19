import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Play } from 'lucide-react';
import type { AnimeItem } from '../../types/media';

interface AnimeGridCardProps {
  anime: AnimeItem;
}

export function AnimeGridCard({ anime }: AnimeGridCardProps) {
  const [imgError, setImgError] = useState(false);

  const fallbackPoster =
    "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22200%22%20height%3D%22300%22%20viewBox%3D%220%200%20200%20300%22%3E%3Crect%20fill%3D%22%230f172a%22%20width%3D%22200%22%20height%3D%22300%22%20%2F%3E%3Ctext%20fill%3D%22%23f59e0b%22%20font-family%3D%22sans-serif%22%20font-size%3D%2214%22%20dy%3D%2210.5%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%3EANIME%3C%2Ftext%3E%3C%2Fsvg%3E";

  const posterSrc = imgError || !anime.poster ? fallbackPoster : anime.poster;

  return (
    <Link
      to={`/anime/detail/${anime.provider || 'otakudesu'}/${anime.id}`}
      className="group relative flex flex-col rounded-2xl overflow-hidden bg-[#111622] border border-white/5 hover:border-amber-500/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-amber-500/10"
    >
      <div className="relative aspect-[3/4] w-full bg-slate-900 overflow-hidden">
        <img
          src={posterSrc}
          alt={anime.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-80" />

        {/* Score Badge */}
        {anime.score && (
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/80 text-amber-400 text-xs font-bold border border-white/10 shadow">
            <Star className="w-3 h-3 fill-amber-400" />
            <span>{String(anime.score).replace('★', '').trim()}</span>
          </div>
        )}

        {/* Episode or Status Badge */}
        {anime.episodes ? (
          <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider shadow">
            {typeof anime.episodes === 'number' ? `Ep ${anime.episodes}` : anime.episodes}
          </div>
        ) : anime.status ? (
          <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-black/80 text-slate-200 text-[10px] font-bold border border-white/10 shadow">
            {anime.status}
          </div>
        ) : null}

        {/* Play Icon on hover */}
        <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/40 backdrop-blur-[2px]">
          <div className="w-10 h-10 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 fill-black ml-0.5" />
          </div>
        </div>
      </div>

      <div className="p-3 flex-1 flex flex-col justify-between gap-1.5">
        <h3
          title={anime.title}
          className="font-bold text-xs sm:text-sm text-slate-100 group-hover:text-amber-400 transition-colors line-clamp-2 leading-tight"
        >
          {anime.title}
        </h3>

        {anime.genres && (
          <p className="text-[10px] text-slate-400 truncate">
            {typeof anime.genres === 'string'
              ? anime.genres
              : Array.isArray(anime.genres)
              ? anime.genres.map((g: any) => g.title || g).join(', ')
              : ''}
          </p>
        )}
      </div>
    </Link>
  );
}
