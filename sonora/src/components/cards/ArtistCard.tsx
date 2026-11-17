'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Artist } from '@/types/music';
import { usePlayerStore } from '@/stores/usePlayerStore';
import PlayButton from '@/components/common/PlayButton';
import { cn } from '@/lib/utils';

interface ArtistCardProps {
  artist: Artist;
}

export default function ArtistCard({ artist }: ArtistCardProps) {
  const router = useRouter();
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayerStore();

  const hasTopTracks = artist.topTracks && artist.topTracks.length > 0;
  const firstTrack = hasTopTracks ? artist.topTracks![0] : null;

  const isCurrentArtistPlaying = Boolean(
    firstTrack &&
    currentTrack &&
    currentTrack.id === firstTrack.id &&
    isPlaying
  );

  const handleCardClick = () => {
    router.push(`/artist/${artist.id}`);
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!firstTrack) {
      router.push(`/artist/${artist.id}`);
      return;
    }

    if (isCurrentArtistPlaying) {
      togglePlay();
    } else {
      playTrack(firstTrack, artist.topTracks);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col rounded-md bg-[#181818] p-3 sm:p-4 hover:bg-[#282828] transition-all duration-300 cursor-pointer shadow-md select-none"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-full bg-[#282828] mb-3 shadow-lg">
        {artist.avatar ? (
          <img
            src={artist.avatar}
            alt={artist.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl text-[#B3B3B3]">👤</div>
        )}

        <div
          className={cn(
            'absolute bottom-2 right-2 transition-all duration-300 ease-out transform',
            isCurrentArtistPlaying
              ? 'opacity-100 translate-y-0 shadow-xl'
              : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-hover:shadow-xl'
          )}
        >
          <PlayButton
            size="md"
            isPlaying={isCurrentArtistPlaying}
            onClick={handlePlay}
          />
        </div>
      </div>

      <div className="flex flex-col min-w-0">
        <span className="font-bold text-sm sm:text-base text-white truncate group-hover:text-white" title={artist.name}>
          {artist.name}
        </span>
        <span className="text-xs sm:text-sm text-[#B3B3B3] mt-1 capitalize">
          Artist
        </span>
      </div>
    </div>
  );
}
