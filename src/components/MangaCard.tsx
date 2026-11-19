import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, BookOpen, Clock, Flame, Heart } from 'lucide-react';
import type { MangaItem } from '../types/manga';
import { useCategoryBookmarks } from '../services/categoryStorage';

interface MangaCardProps {
  manga: MangaItem;
  ranking?: number;
  showRank?: boolean;
}

export function MangaCard({ manga, ranking, showRank = false }: MangaCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { isBookmarked, toggleBookmark } = useCategoryBookmarks('manga');

  const bookmarked = isBookmarked(manga.slug);

  const handleBookmarkToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBookmark({
      id: manga.slug,
      category: 'manga',
      title: manga.title,
      cover: manga.cover,
      link: `/manga/${manga.slug}`,
      subtitle: manga.chapter || 'Komik',
      type: manga.type || 'Manga',
      addedAt: Date.now(),
    });
  };

  // Normalize type
  const rawType = (manga.type || 'manga').toLowerCase().trim();
  const typeBadgeColors =
    rawType === 'manhwa'
      ? 'bg-[#8B5CF6]/90 text-white border-[#A78BFA]/30 shadow-sm shadow-[#8B5CF6]/30'
      : rawType === 'manhua'
      ? 'bg-emerald-500/90 text-white border-emerald-400/30 shadow-sm shadow-emerald-500/30'
      : 'bg-[#6366F1]/90 text-white border-indigo-400/30 shadow-sm shadow-indigo-500/30';

  // Format rating
  const ratingValue = manga.rating ? parseFloat(manga.rating) : null;

  // Placeholder SVG cover
  const placeholderCover =
    "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22200%22%20height%3D%22300%22%20viewBox%3D%220%200%20200%20300%22%3E%3Crect%20fill%3D%22%23121829%22%20width%3D%22200%22%20height%3D%22300%22%2F%3E%3Ctext%20fill%3D%22%238b5cf6%22%20font-family%3D%22sans-serif%22%20font-size%3D%2214%22%20dy%3D%2210.5%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%3EFAZURAVERSE%3C%2Ftext%3E%3C%2Fsvg%3E";

  const coverSrc = imgError || !manga.cover ? placeholderCover : manga.cover;

  return (
    <Link
      to={`/manga/${manga.slug}`}
      className="group relative flex flex-col rounded-2xl overflow-hidden bg-[#181827]/90 border border-white/5 hover:border-[#8B5CF6]/40 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-[#8B5CF6]/15"
    >
      {/* Cover Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#11111D]">
        {/* Shimmer skeleton while loading */}
        {!imgLoaded && !imgError && (
          <div className="absolute inset-0 bg-[#181827] animate-pulse" />
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
          className={`w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Cinematic Gradient Overlay for Badges & Text Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090912] via-[#090912]/30 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Quick Bookmark Toggle (visible on touch / hover) */}
        <button
          onClick={handleBookmarkToggle}
          title={bookmarked ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}
          aria-label={bookmarked ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}
          className={`absolute top-2 right-2 z-20 w-8 h-8 rounded-xl flex items-center justify-center backdrop-blur-md transition-all shadow-md active:scale-90 ${
            bookmarked
              ? 'bg-rose-500 text-white border border-rose-400/40 shadow-rose-500/30 opacity-100'
              : 'bg-black/65 text-slate-300 hover:text-rose-400 hover:bg-black/85 border border-white/10 opacity-90 sm:opacity-0 sm:group-hover:opacity-100'
          }`}
        >
          <Heart className={`w-4 h-4 transition-transform ${bookmarked ? 'fill-current scale-110' : ''}`} />
        </button>

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
                : 'bg-black/75 text-slate-200 border border-white/10'
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
          <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/75 border border-white/10 backdrop-blur-md text-amber-400 text-xs font-bold shadow-sm">
            <Star className="w-3 h-3 fill-amber-400" />
            <span>{ratingValue.toFixed(1)}</span>
          </div>
        )}

        {/* Latest Chapter Floating Pill */}
        {manga.chapter && (
          <div className="absolute bottom-2 left-2 z-10 max-w-[65%]">
            <span className="inline-block px-2 py-0.5 rounded-md bg-[#8B5CF6]/25 border border-[#8B5CF6]/40 text-[#C4B5FD] text-[10px] font-bold truncate backdrop-blur-md shadow-sm">
              {manga.chapter}
            </span>
          </div>
        )}

        {/* Quick Read Overlay Button on Desktop Hover */}
        <div className="absolute inset-0 z-10 hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[#090912]/40 backdrop-blur-[2px]">
          <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#8B5CF6] text-white text-xs font-semibold shadow-lg shadow-[#8B5CF6]/40 transform scale-95 group-hover:scale-100 transition-transform">
            <BookOpen className="w-3.5 h-3.5" />
            Baca Komik
          </span>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-3 flex-1 flex flex-col justify-between gap-2">
        <h3
          title={manga.title}
          className="font-bold text-sm text-slate-100 group-hover:text-[#A78BFA] transition-colors line-clamp-2 leading-tight"
        >
          {manga.title}
        </h3>

        <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-white/5 pt-2">
          {manga.chapter ? (
            <span className="font-semibold text-[#8B5CF6] truncate max-w-[65%]">
              {manga.chapter}
            </span>
          ) : (
            <span className="text-slate-500">Baca Sekarang</span>
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
