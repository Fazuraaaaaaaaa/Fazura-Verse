'use client';

import React from 'react';
import Link from 'next/link';
import { Track } from '@/types/music';
import { usePlayerStore } from '@/stores/usePlayerStore';
import PlayButton from '@/components/common/PlayButton';
import { cn } from '@/lib/utils';

interface QuickPickCardProps {
  track: Track;
  playlistContext?: Track[];
}

export default function QuickPickCard({ track, playlistContext }: QuickPickCardProps) {
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayerStore();

  const isCurrentTrack =
    currentTrack &&
    ((currentTrack.id && currentTrack.id === track.id) ||
      (currentTrack.youtubeId && currentTrack.youtubeId === track.youtubeId));

  const isCurrentPlaying = Boolean(isCurrentTrack && isPlaying);

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCurrentTrack) {
      togglePlay();
    } else {
      playTrack(track, playlistContext || [track]);
    }
  };

  return (
    <div
      onClick={handlePlay}
      className={cn(
        'group relative flex items-center gap-3 sm:gap-4 overflow-hidden rounded bg-white/5 hover:bg-white/20 transition-all duration-300 cursor-pointer shadow-sm pr-3 sm:pr-4 select-none',
        isCurrentTrack && 'bg-white/15'
      )}
    >
      <div className="relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 bg-[#282828] shadow-md">
        {track.thumbnail ? (
          <img
            src={track.thumbnail}
            alt={track.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-lg text-[#B3B3B3]">♪</div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-center min-w-0">
        <span
          className={cn(
            'font-bold text-sm sm:text-base line-clamp-2 transition-colors',
            isCurrentTrack ? 'text-[#1DB954]' : 'text-white'
          )}
        >
          {track.title}
        </span>
        <span className="text-xs text-[#B3B3B3] line-clamp-1 mt-0.5">
          {track.artist}
        </span>
      </div>

      <div
        className={cn(
          'transition-all duration-200 transform',
          isCurrentPlaying
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100'
        )}
      >
        <PlayButton
          size="md"
          isPlaying={isCurrentPlaying}
          onClick={handlePlay}
        />
      </div>
    </div>
  );
}
