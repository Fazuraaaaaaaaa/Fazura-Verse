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

  // Normalize category/type
  const rawType = (manga.type || 'manga').toLowerCase().trim();
  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'manhwa':
        return 'bg-[#8B5CF6]/90 text-white border-[#A78BFA]/40 shadow-sm shadow-[#8B5CF6]/30';
      case 'manhua':
        return 'bg-emerald-600/90 text-white border-emerald-400/40 shadow-sm shadow-emerald-500/30';
      case 'anime':
        return 'bg-amber-500/90 text-black border-amber-300/40 shadow-sm shadow-amber-500/30 font-black';
      case 'donghua':
        return 'bg-teal-500/90 text-black border-teal-300/40 shadow-sm shadow-teal-500/30 font-black';
      case 'movie':
      case 'film':
        return 'bg-rose-500/90 text-white border-rose-400/40 shadow-sm shadow-rose-500/30';
      case 'music':
      case 'lagu':
        return 'bg-[#1DB954]/90 text-black border-[#1ed760]/40 shadow-sm shadow-[#1DB954]/30 font-black';
      case 'manga':
      default:
        return 'bg-[#6366F1]/90 text-white border-indigo-400/40 shadow-sm shadow-indigo-500/30';
    }
  };

  const typeBadgeColors = getBadgeStyle(rawType);

  // Format rating
  const ratingValue = manga.rating ? parseFloat(manga.rating) : null;

  // Modern anime-styled SVG placeholder on image error or missing cover
  const placeholderCover =
    'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22400%22%20viewBox%3D%220%200%20300%20400%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23181827%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23090912%22%2F%3E%3C%2FlinearGradient%3E%3CradialGradient%20id%3D%22r%22%20cx%3D%2250%25%22%20cy%3D%2240%25%22%20r%3D%2250%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%238B5CF6%22%20stop-opacity%3D%220.25%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%238B5CF6%22%20stop-opacity%3D%220%22%2F%3E%3C%2FradialGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22300%22%20height%3D%22400%22%20fill%3D%22url(%23g)%22%2F%3E%3Ccircle%20cx%3D%22150%22%20cy%3D%22160%22%20r%3D%2290%22%20fill%3D%22url(%23r)%22%2F%3E%3Cpath%20d%3D%22M150%20120%20L180%20170%20L120%20170%20Z%22%20fill%3D%22%238B5CF6%22%20opacity%3D%220.8%22%2F%3E%3Ccircle%20cx%3D%22150%22%20cy%3D%22190%22%20r%3D%2212%22%20fill%3D%22%23A78BFA%22%20opacity%3D%220.9%22%2F%3E%3Ctext%20x%3D%22150%22%20y%3D%22240%22%20font-family%3D%22sans-serif%22%20font-size%3D%2214%22%20font-weight%3D%22800%22%20fill%3D%22%23FFFFFF%22%20text-anchor%3D%22middle%22%20letter-spacing%3D%222%22%3EFAZURASTREAM%3C%2Ftext%3E%3Ctext%20x%3D%22150%22%20y%3D%22262%22%20font-family%3D%22sans-serif%22%20font-size%3D%2210%22%20font-weight%3D%22600%22%20fill%3D%22%238B5CF6%22%20text-anchor%3D%22middle%22%20letter-spacing%3D%221%22%3ENO%20POSTER%20IMAGE%3C%2Ftext%3E%3C%2Fsvg%3E';

  const coverSrc = imgError || !manga.cover ? placeholderCover : manga.cover;

  return (
    <div className="relative group/card flex flex-col">
      <Link
        to={`/manga/${manga.slug}`}
        className="group relative flex flex-col rounded-2xl overflow-hidden bg-[#181827]/90 border border-white/5 hover:border-[#8B5CF6]/40 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-[#8B5CF6]/15"
      >
        {/* Cover Image Container (Strict 3:4 Aspect Ratio) */}
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
          <div className="absolute inset-0 bg-gradient-to-t from-[#090912] via-[#090912]/30 to-transparent opacity-85 group-hover:opacity-65 transition-opacity pointer-events-none" />

          {/* Quick Bookmark Toggle (Touch target >= 44x44px) */}
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

          {/* Category / Type Badge */}
          <div className={`absolute top-2 ${showRank ? 'left-10' : 'left-2'} z-10 pointer-events-none`}>
            <span
              className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border backdrop-blur-md shadow-sm ${typeBadgeColors}`}
            >
              {manga.type || 'Manga'}
            </span>
          </div>

          {/* Rating Badge */}
          {ratingValue && ratingValue > 0 && (
            <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/75 border border-white/10 backdrop-blur-md text-amber-400 text-xs font-bold shadow-sm pointer-events-none">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>{ratingValue.toFixed(1)}</span>
            </div>
          )}

          {/* Latest Chapter Floating Pill */}
          {manga.chapter && (
            <div className="absolute bottom-2 left-2 z-10 max-w-[65%] pointer-events-none">
              <span className="inline-block px-2 py-0.5 rounded-md bg-[#8B5CF6]/30 border border-[#8B5CF6]/40 text-[#C4B5FD] text-[10px] font-bold truncate backdrop-blur-md shadow-sm">
                {manga.chapter}
              </span>
            </div>
          )}

          {/* Quick Read Overlay Button on Desktop Hover */}
          <div className="absolute inset-0 z-10 hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[#090912]/40 backdrop-blur-[2px] pointer-events-none">
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

      {/* Desktop Full Title Tooltip Preview on Hover */}
      <div className="hidden sm:block absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max max-w-xs z-50 pointer-events-none opacity-0 group-hover/card:opacity-100 transition-all duration-200 ease-out transform group-hover/card:translate-y-0 translate-y-1">
        <div className="bg-[#0e0e1a]/95 backdrop-blur-md border border-[#8B5CF6]/30 text-white rounded-xl px-3 py-2 shadow-2xl shadow-black/80 space-y-1 text-center">
          <p className="text-xs font-bold leading-snug text-slate-100 line-clamp-3">
            {manga.title}
          </p>
          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">
            <span className="uppercase text-[#A78BFA] font-semibold">{manga.type || 'Manga'}</span>
            {manga.chapter && <span>• {manga.chapter}</span>}
            {ratingValue && ratingValue > 0 && (
              <span className="text-amber-400 font-bold">★ {ratingValue.toFixed(1)}</span>
            )}
          </div>
          {/* Tooltip Triangle pointer */}
          <div className="w-2 h-2 bg-[#0e0e1a] border-r border-b border-[#8B5CF6]/30 transform rotate-45 mx-auto -mb-3" />
        </div>
      </div>
    </div>
  );
}
