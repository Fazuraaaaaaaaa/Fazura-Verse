import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, Play } from 'lucide-react';
import {
  CATEGORY_THEMES,
  createPosterFallbackSvg,
  type MediaCategory,
} from '../../utils/categoryTheme';
import { useCategoryBookmarks } from '../../services/categoryStorage';

export interface MediaCardProps {
  id: string;
  category: MediaCategory;
  title: string;
  imageUrl?: string;
  link: string;
  metaPrimary?: string;
  metaSecondary?: string;
  topBadge?: string;
  rating?: string | number;
  ranking?: number;
  bookmarkType?: string;
  relationBadge?: string;
  highlight?: boolean;
}

export function MediaCard({
  id,
  category,
  title,
  imageUrl,
  link,
  metaPrimary,
  metaSecondary,
  topBadge,
  rating,
  ranking,
  bookmarkType,
  relationBadge,
  highlight = false,
}: MediaCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { isBookmarked, toggleBookmark } = useCategoryBookmarks(category);
  const theme = CATEGORY_THEMES[category];
  const bookmarked = isBookmarked(id);

  const fallbackSvg = React.useMemo(
    () => createPosterFallbackSvg(theme.label.toUpperCase(), theme.accentHex),
    [theme.label, theme.accentHex]
  );

  const src = imgError || !imageUrl ? fallbackSvg : imageUrl;

  const numericRating =
    typeof rating === 'number'
      ? rating
      : typeof rating === 'string' && rating.trim()
      ? parseFloat(rating.replace(/[^\d.]/g, ''))
      : null;

  const handleBookmarkToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBookmark({
      id,
      category,
      title,
      cover: imageUrl || '',
      link,
      subtitle: metaPrimary || theme.label,
      type: bookmarkType || theme.label,
      addedAt: Date.now(),
    });
  };

  return (
    <Link
      to={link}
      title={title}
      className={`group flex flex-col rounded-[12px] overflow-hidden bg-gradient-to-b from-[#191C25] to-[#12141B] border transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(0,0,0,0.7)] ${
        highlight
          ? 'border-[#F0A15B] ring-1 ring-[#F0A15B]/30'
          : 'border-[#2D303E] hover:border-white/20'
      }`}
    >
      {/* Strict 2:3 Portrait Poster Frame */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#12141B]">
        {!imgLoaded && !imgError && (
          <div className="absolute inset-0 skeleton-shimmer" />
        )}

        <img
          src={src}
          alt={title}
          loading="lazy"
          referrerPolicy="no-referrer"
          onLoad={() => setImgLoaded(true)}
          onError={() => {
            setImgError(true);
            setImgLoaded(true);
          }}
          className={`w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05] ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Cinematic Scrim Gradient Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#12141B] via-[#12141B]/40 to-transparent pointer-events-none" />

        {/* Single Restrained Top-Left Marker (Rank OR Primary Status/Ep/Ch) */}
        {typeof ranking === 'number' ? (
          <span className="absolute top-2 left-2 z-10 min-w-[26px] h-6 px-1.5 rounded-[6px] backdrop-blur-md bg-black/70 border border-white/15 text-[#F0A15B] text-[11px] font-bold flex items-center justify-center pointer-events-none shadow-sm">
            #{ranking}
          </span>
        ) : topBadge ? (
          <span
            className="absolute top-2 left-2 z-10 max-w-[70%] truncate px-2 py-0.5 rounded-[6px] backdrop-blur-md bg-black/70 border border-white/15 text-[11px] font-semibold pointer-events-none shadow-sm"
            style={{ color: theme.accentHex }}
          >
            {topBadge}
          </span>
        ) : null}

        {/* Quick Bookmark Button (44x44 touch target) */}
        <button
          type="button"
          onClick={handleBookmarkToggle}
          title={bookmarked ? 'Hapus dari Favorit' : 'Simpan ke Favorit'}
          aria-label={bookmarked ? 'Hapus dari Favorit' : 'Simpan ke Favorit'}
          className={`absolute top-1 right-1 z-20 w-10 h-10 min-w-[44px] min-h-[44px] rounded-[10px] flex items-center justify-center transition-all duration-200 ${
            bookmarked
              ? 'backdrop-blur-md bg-black/70 text-[#F0A15B] border border-[#F0A15B]/30 opacity-100 scale-100'
              : 'backdrop-blur-md bg-black/50 text-[#F2F0EC] border border-white/10 opacity-85 sm:opacity-0 sm:group-hover:opacity-100 hover:text-[#F0A15B] hover:scale-105'
          }`}
        >
          <Heart className={`w-4 h-4 ${bookmarked ? 'fill-[#F0A15B]' : ''}`} />
        </button>

        {/* Bottom Metadata Overlay: Real Rating */}
        {numericRating !== null && !isNaN(numericRating) && numericRating > 0 && (
          <span className="absolute bottom-2 right-2 z-10 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[6px] backdrop-blur-md bg-black/75 border border-white/15 text-[11px] font-bold text-[#F0A15B] pointer-events-none shadow-sm">
            <Star className="w-3 h-3 fill-[#F0A15B] text-[#F0A15B]" />
            <span>{numericRating.toFixed(1)}</span>
          </span>
        )}

        {/* Subtle Desktop Hover Action Icon */}
        <div className="hidden sm:flex absolute inset-0 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/30 pointer-events-none backdrop-blur-[1px]">
          <span className="w-11 h-11 rounded-full bg-[#F0A15B] text-[#0B0C10] shadow-[0_4px_16px_rgba(240,161,91,0.5)] flex items-center justify-center scale-90 group-hover:scale-100 transition-transform duration-200">
            <Play className="w-4 h-4 fill-current ml-0.5" />
          </span>
        </div>
      </div>

      {/* Editorial Card Body */}
      <div className="p-3 flex-1 flex flex-col justify-between gap-2">
        <div className="space-y-1.5">
          {relationBadge && (
            <span className="inline-flex px-1.5 py-0.5 rounded-[6px] bg-[#F0A15B]/15 border border-[#F0A15B]/35 text-[#F0A15B] text-[10px] font-semibold uppercase tracking-wide">
              {relationBadge}
            </span>
          )}
          <h3 className="text-[13px] sm:text-[14px] font-semibold text-[#F2F0EC] group-hover:text-[#F0A15B] transition-colors duration-150 line-clamp-2 leading-snug">
            {title}
          </h3>
        </div>

        {(metaPrimary || metaSecondary) && (
          <div className="flex items-center justify-between gap-2 text-[11px] text-[#A2A4B1] pt-1.5 border-t border-[#343744]/60">
            <span className="truncate">{metaPrimary || theme.label}</span>
            {metaSecondary && (
              <span className="shrink-0 text-[#747887]">{metaSecondary}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
