import React from 'react';
import { Tag } from 'lucide-react';
import type { GenreItem } from '../types/manga';

interface GenreChipsProps {
  genres: GenreItem[];
  selectedGenre?: string;
  onSelectGenre: (slug: string) => void;
  isLoading?: boolean;
}

export function GenreChips({
  genres = [],
  selectedGenre,
  onSelectGenre,
  isLoading = false,
}: GenreChipsProps) {
  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="h-9 w-24 rounded-[10px] bg-[#191C25] border border-[#343744] animate-pulse shrink-0"
          />
        ))}
      </div>
    );
  }

  if (genres.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      <button
        type="button"
        onClick={() => onSelectGenre('')}
        className={`h-9 px-3.5 rounded-[10px] text-xs font-semibold whitespace-nowrap transition-colors border shrink-0 inline-flex items-center gap-1.5 cursor-pointer ${
          !selectedGenre
            ? 'bg-[#75C9A0]/15 text-[#75C9A0] border-[#75C9A0]/45'
            : 'bg-[#191C25] hover:bg-[#232633] text-[#A2A4B1] hover:text-[#F2F0EC] border-[#343744]'
        }`}
      >
        <Tag className="w-3 h-3" />
        <span>Semua Genre</span>
      </button>

      {genres.map((genre) => {
        const isSelected = selectedGenre === genre.slug;
        return (
          <button
            type="button"
            key={genre.slug}
            onClick={() => onSelectGenre(genre.slug)}
            className={`h-9 px-3.5 rounded-[10px] text-xs font-semibold whitespace-nowrap transition-colors border shrink-0 cursor-pointer ${
              isSelected
                ? 'bg-[#75C9A0]/15 text-[#75C9A0] border-[#75C9A0]/45'
                : 'bg-[#191C25] hover:bg-[#232633] text-[#A2A4B1] hover:text-[#F2F0EC] border-[#343744]'
            }`}
          >
            {genre.title}
          </button>
        );
      })}
    </div>
  );
}
