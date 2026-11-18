'use client';

import React from 'react';
import Link from 'next/link';
import { Track } from '@/types/music';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { useContextMenuStore } from '@/stores/useContextMenuStore';
import PlayButton from '@/components/common/PlayButton';
import { cn } from '@/lib/utils';

interface TrackCardProps {
  track: Track;
  playlistContext?: Track[];
}

export default function TrackCard({ track, playlistContext }: TrackCardProps) {
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayerStore();
  const { openContextMenu } = useContextMenuStore();

  const isCurrentTrack = Boolean(
    currentTrack &&
      ((currentTrack.id && currentTrack.id === track.id) ||
        (currentTrack.youtubeId && currentTrack.youtubeId === track.youtubeId))
  );

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

  const handleContextMenu = (e: React.MouseEvent) => {
    openContextMenu(e, track, playlistContext);
  };

  return (
    <div
      onClick={handlePlay}
      onContextMenu={handleContextMenu}
      className={cn(
        'group relative flex flex-col rounded-lg bg-[#181818] p-3 sm:p-3.5 hover:bg-[#282828] transition-all duration-300 cursor-pointer shadow-md select-none border border-white/[0.03] hover:border-white/[0.08] hover:shadow-2xl',
        isCurrentTrack && 'bg-[#222]'
      )}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-md bg-[#242424] mb-3 shadow">
        {track.thumbnail ? (
          <img
            src={track.thumbnail}
            alt={track.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl text-[#B3B3B3]">♪</div>
        )}

        {/* Hover green play button floating at bottom-right of image */}
        <div
          className={cn(
            'absolute bottom-2 right-2 transition-all duration-300 ease-out transform',
            isCurrentPlaying
              ? 'opacity-100 translate-y-0 shadow-2xl scale-100'
              : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 shadow-2xl scale-95 group-hover:scale-100'
          )}
        >
          <PlayButton
            size="md"
            isPlaying={isCurrentPlaying}
            onClick={handlePlay}
          />
        </div>
      </div>

      <div className="flex flex-col min-w-0">
        <span
          className={cn(
            'font-bold text-xs sm:text-sm truncate transition-colors leading-snug',
            isCurrentTrack ? 'text-[#1DB954]' : 'text-white'
          )}
          title={track.title}
        >
          {track.title}
        </span>
        <span className="text-[11px] sm:text-xs text-[#B3B3B3] truncate mt-1 leading-tight">
          {track.artist}
        </span>
      </div>
    </div>
  );
}