'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Album } from '@/types/music';
import { usePlayerStore } from '@/stores/usePlayerStore';
import PlayButton from '@/components/common/PlayButton';
import { cn } from '@/lib/utils';

interface AlbumCardProps {
  album: Album;
}

export default function AlbumCard({ album }: AlbumCardProps) {
  const router = useRouter();
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayerStore();

  const hasTracks = album.tracks && album.tracks.length > 0;
  const firstTrack = hasTracks ? album.tracks![0] : null;

  const isCurrentAlbumPlaying = Boolean(
    firstTrack &&
    currentTrack &&
    currentTrack.albumId === album.id &&
    isPlaying
  );

  const handleCardClick = () => {
    router.push(`/album/${album.id}`);
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!firstTrack) {
      router.push(`/album/${album.id}`);
      return;
    }

    if (isCurrentAlbumPlaying) {
      togglePlay();
    } else {
      playTrack(firstTrack, album.tracks);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col rounded-lg bg-[#181818] p-3 sm:p-3.5 hover:bg-[#282828] transition-all duration-300 cursor-pointer shadow-md select-none border border-white/[0.03] hover:border-white/[0.08] hover:shadow-2xl"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-md bg-[#242424] mb-3 shadow">
        {album.cover ? (
          <img
            src={album.cover}
            alt={album.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl text-[#B3B3B3]">💿</div>
        )}

        {/* Hover green play button */}
        <div
          className={cn(
            'absolute bottom-2 right-2 transition-all duration-300 ease-out transform',
            isCurrentAlbumPlaying
              ? 'opacity-100 translate-y-0 shadow-2xl scale-100'
              : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 shadow-2xl scale-95 group-hover:scale-100'
          )}
        >
          <PlayButton
            size="md"
            isPlaying={isCurrentAlbumPlaying}
            onClick={handlePlay}
          />
        </div>
      </div>

      <div className="flex flex-col min-w-0">
        <span
          className="font-bold text-xs sm:text-sm text-white truncate transition-colors leading-snug"
          title={album.title}
        >
          {album.title}
        </span>
        <span className="text-[11px] sm:text-xs text-[#B3B3B3] truncate mt-1 leading-tight">
          {album.releaseYear ? `${album.releaseYear} • Album` : 'Album'}
        </span>
      </div>
    </div>
  );
}