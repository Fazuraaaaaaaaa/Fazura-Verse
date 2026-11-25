import React from 'react';
import { Search } from 'lucide-react';
import { CATEGORY_THEMES, type MediaCategory } from '../../utils/categoryTheme';
import { Badge } from '../common/Badge';

interface CategoryHeroProps {
  category: MediaCategory;
  eyebrow: string;
  title: string;
  description: string;
  backdropUrl?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: (e: React.FormEvent) => void;
  searchPlaceholder?: string;
  rightSlot?: React.ReactNode;
}

export function CategoryHero({
  category,
  eyebrow,
  title,
  description,
  backdropUrl,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  searchPlaceholder,
  rightSlot,
}: CategoryHeroProps) {
  const theme = CATEGORY_THEMES[category];

  return (
    <section className="relative rounded-[22px] overflow-hidden bg-gradient-to-b from-[#191C25] to-[#12141B] border border-[#2D303E] min-h-[260px] sm:min-h-[290px] flex flex-col justify-between p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      {/* Top Glowing Category Hairline */}
      <div
        className="absolute inset-x-0 top-0 h-[2px]"
        style={{
          backgroundColor: theme.accentHex,
          boxShadow: `0 0 16px ${theme.accentHex}88`,
        }}
        aria-hidden="true"
      />

      {/* Atmospheric Ambient Light Glows */}
      <div
        className="absolute -top-32 -left-32 w-80 h-80 rounded-full blur-[100px] pointer-events-none opacity-20"
        style={{ backgroundColor: theme.accentHex }}
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full blur-[100px] pointer-events-none opacity-15"
        style={{ backgroundColor: theme.accentHex }}
        aria-hidden="true"
      />

      {/* Cinematic Backdrop Image with Multistop Gradients */}
      {backdropUrl && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <img
            src={backdropUrl}
            alt=""
            aria-hidden="true"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center opacity-30 sm:opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0C10] via-[#0B0C10]/85 via-50% to-[#12141B]/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#12141B] via-transparent to-transparent" />
        </div>
      )}

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <Badge variant="category" category={category}>
            {eyebrow}
          </Badge>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#F2F0EC] tracking-tight leading-tight">
            {title}
          </h1>
          <p className="text-sm text-[#A2A4B1] leading-relaxed">
            {description}
          </p>
        </div>

        {rightSlot && <div className="shrink-0">{rightSlot}</div>}
      </div>

      {/* Inline Hub Search */}
      {onSearchSubmit && onSearchChange && (
        <form onSubmit={onSearchSubmit} className="relative z-10 mt-6 max-w-xl">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-[#747887] absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchValue || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder || 'Cari judul...'}
              className="w-full h-11 pl-10 pr-24 rounded-[10px] bg-[#12141B] border border-[#343744] focus:border-[#F0A15B] text-sm text-[#F2F0EC] placeholder-[#747887] focus:outline-none transition-colors"
            />
            <button
              type="submit"
              className="absolute right-1.5 h-8 px-4 rounded-[6px] bg-[#F0A15B] hover:bg-[#F6B779] active:bg-[#D98945] text-[#0B0C10] text-xs font-semibold transition-colors cursor-pointer"
            >
              Cari
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
