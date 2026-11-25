import React from 'react';
import type { GenreItem } from '../types/manga';
import { Tag } from 'lucide-react';

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
          <div key={i} className="h-8 w-20 rounded-xl bg-surface border border-border-subtle animate-pulse shrink-0" />
        ))}
      </div>
    );
  }

  if (genres.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      <button
        onClick={() => onSelectGenre('')}
        className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border shrink-0 flex items-center gap-1.5 ${
          !selectedGenre
            ? 'bg-accent-primary text-white border-accent-primary shadow-md shadow-accent-primary/20'
            : 'bg-surface/80 hover:bg-surface-elevated text-text-secondary hover:text-white border-border-subtle'
        }`}
      >
        <Tag className="w-3 h-3" />
        All Genres
      </button>

      {genres.map((genre) => {
        const isSelected = selectedGenre === genre.slug;
        return (
          <button
            key={genre.slug}
            onClick={() => onSelectGenre(genre.slug)}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border shrink-0 ${
              isSelected
                ? 'bg-accent-primary text-white border-accent-primary shadow-md shadow-accent-primary/20'
                : 'bg-surface/80 hover:bg-surface-elevated text-text-secondary hover:text-white border-border-subtle'
            }`}
          >
            {genre.title}
          </button>
        );
      })}
    </div>
  );
}
