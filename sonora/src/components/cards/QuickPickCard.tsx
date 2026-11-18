'use client';

import React from 'react';
import { Track } from '@/types/music';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { useContextMenuStore } from '@/stores/useContextMenuStore';
import PlayButton from '@/components/common/PlayButton';
import { cn } from '@/lib/utils';

interface QuickPickCardProps {
  track: Track;
  playlistContext?: Track[];
}

export default function QuickPickCard({ track, playlistContext }: QuickPickCardProps) {
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
        'group relative flex items-center gap-2.5 sm:gap-3.5 overflow-hidden rounded-md bg-white/5 hover:bg-white/15 active:bg-white/20 transition-all duration-200 cursor-pointer shadow-sm pr-2 sm:pr-3 select-none h-14 sm:h-16',
        isCurrentTrack && 'bg-white/15'
      )}
    >
      {/* Square Artwork */}
      <div className="relative h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0 bg-[#282828] shadow">
        {track.thumbnail ? (
          <img
            src={track.thumbnail}
            alt={track.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-base text-[#B3B3B3]">♪</div>
        )}
      </div>

      {/* Title & Artist */}
      <div className="flex flex-1 flex-col justify-center min-w-0 pr-1">
        <span
          className={cn(
            'font-bold text-xs sm:text-sm line-clamp-1 transition-colors leading-tight',
            isCurrentTrack ? 'text-[#1DB954]' : 'text-white'
          )}
          title={track.title}
        >
          {track.title}
        </span>
        <span className="text-[11px] text-[#B3B3B3] line-clamp-1 mt-0.5 leading-tight">
          {track.artist}
        </span>
      </div>

      {/* Floating Hover Play Button */}
      <div
        className={cn(
          'transition-all duration-200 transform flex-shrink-0 hidden sm:block',
          isCurrentPlaying
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100'
        )}
      >
        <PlayButton
          size="sm"
          isPlaying={isCurrentPlaying}
          onClick={handlePlay}
        />
      </div>
    </div>
  );
}