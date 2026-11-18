'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Track, Artist, Album, Playlist } from '@/types/music';
import TrackCard from './TrackCard';
import ArtistCard from './ArtistCard';
import AlbumCard from './AlbumCard';
import PlaylistCard from './PlaylistCard';

interface SectionCarouselProps {
  id: string;
  title: string;
  subtitle?: string;
  type: 'tracks' | 'albums' | 'playlists' | 'artists';
  items: (Track | Album | Playlist | Artist)[];
  seeAllHref?: string;
}

export default function SectionCarousel({
  id,
  title,
  subtitle,
  type,
  items,
  seeAllHref,
}: SectionCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="relative my-5 sm:my-7">
      {/* Section Header */}
      <div className="flex items-end justify-between mb-2.5 sm:mb-3 px-1">
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white hover:underline cursor-pointer tracking-tight">
            {seeAllHref ? <Link href={seeAllHref}>{title}</Link> : title}
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-[#B3B3B3] mt-0.5 line-clamp-1 leading-snug">{subtitle}</p>
          )}
        </div>

        {/* Navigation Arrow Buttons */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {seeAllHref && (
            <Link
              href={seeAllHref}
              className="text-xs sm:text-sm font-bold text-[#B3B3B3] hover:text-white hover:underline mr-1.5"
            >
              Show all
            </Link>
          )}
          <button
            type="button"
            title="Scroll left"
            onClick={() => scroll('left')}
            className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white/5 hover:bg-white/15 text-white transition-all active:scale-90"
          >
            <ChevronLeft size={17} />
          </button>
          <button
            type="button"
            title="Scroll right"
            onClick={() => scroll('right')}
            className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white/5 hover:bg-white/15 text-white transition-all active:scale-90"
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel with Touch Momentum */}
      <div
        ref={scrollRef}
        className="flex gap-3 sm:gap-4 lg:gap-5 overflow-x-auto scrollbar-none pb-2 pt-1 scroll-smooth snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {items.map((item, idx) => {
          return (
            <div
              key={`${item.id}-${idx}`}
              className="w-36 sm:w-44 md:w-48 lg:w-52 flex-shrink-0 snap-start"
            >
              {type === 'tracks' && (
                <TrackCard
                  track={item as Track}
                  playlistContext={items.filter((i) => 'duration' in i) as Track[]}
                />
              )}
              {type === 'albums' && <AlbumCard album={item as Album} />}
              {type === 'playlists' && <PlaylistCard playlist={item as Playlist} />}
              {type === 'artists' && <ArtistCard artist={item as Artist} />}
            </div>
          );
        })}
      </div>
    </section>
  );
}