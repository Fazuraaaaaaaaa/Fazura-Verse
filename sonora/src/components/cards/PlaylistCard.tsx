'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Playlist, UserPlaylist } from '@/types/music';
import { usePlayerStore } from '@/stores/usePlayerStore';
import PlayButton from '@/components/common/PlayButton';
import { cn } from '@/lib/utils';

interface PlaylistCardProps {
  playlist: Playlist | UserPlaylist;
}

export default function PlaylistCard({ playlist }: PlaylistCardProps) {
  const router = useRouter();
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayerStore();

  const hasTracks = playlist.tracks && playlist.tracks.length > 0;
  const firstTrack = hasTracks ? playlist.tracks![0] : null;

  const isCurrentPlaylistPlaying = Boolean(
    firstTrack &&
    currentTrack &&
    playlist.tracks?.some((t) => t.id === currentTrack.id || t.youtubeId === currentTrack.youtubeId) &&
    isPlaying
  );

  const handleCardClick = () => {
    router.push(`/playlist/${playlist.id}`);
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!firstTrack) {
      router.push(`/playlist/${playlist.id}`);
      return;
    }

    if (isCurrentPlaylistPlaying) {
      togglePlay();
    } else {
      playTrack(firstTrack, playlist.tracks);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col rounded-md bg-[#181818] p-3 sm:p-4 hover:bg-[#282828] transition-all duration-300 cursor-pointer shadow-md select-none"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-md bg-[#282828] mb-3 shadow">
        {playlist.cover ? (
          <img
            src={playlist.cover}
            alt={playlist.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl text-[#B3B3B3]">🎶</div>
        )}

        <div
          className={cn(
            'absolute bottom-2 right-2 transition-all duration-300 ease-out transform',
            isCurrentPlaylistPlaying
              ? 'opacity-100 translate-y-0 shadow-xl'
              : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-hover:shadow-xl'
          )}
        >
          <PlayButton
            size="md"
            isPlaying={isCurrentPlaylistPlaying}
            onClick={handlePlay}
          />
        </div>
      </div>

      <div className="flex flex-col min-w-0">
        <span className="font-bold text-sm sm:text-base text-white truncate" title={playlist.title}>
          {playlist.title}
        </span>
        <span className="text-xs sm:text-sm text-[#B3B3B3] line-clamp-2 mt-1">
          {playlist.description || 'Curated Sonora playlist'}
        </span>
      </div>
    </div>
  );
}
