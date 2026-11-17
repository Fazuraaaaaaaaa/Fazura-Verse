'use client';

import React from 'react';
import { Clock } from 'lucide-react';
import { Track } from '@/types/music';
import TrackRow from './TrackRow';

interface TrackTableProps {
  tracks: Track[];
  showAlbum?: boolean;
  showCover?: boolean;
  showDateAdded?: boolean;
  emptyMessage?: string;
}

export default function TrackTable({
  tracks,
  showAlbum = true,
  showCover = true,
  showDateAdded = true,
  emptyMessage = 'No tracks found in this collection.',
}: TrackTableProps) {
  if (!tracks || tracks.length === 0) {
    return (
      <div className="py-12 text-center text-[#B3B3B3] text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="w-full select-none">
      {/* Header */}
      <div className="grid grid-cols-[16px_1fr_auto] sm:grid-cols-[20px_4fr_2fr_auto] md:grid-cols-[24px_6fr_4fr_3fr_auto] items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2 border-b border-white/10 text-xs font-medium uppercase tracking-wider text-[#B3B3B3]">
        <div className="text-center">#</div>
        <div>Title</div>
        {showAlbum && <div className="hidden sm:block">Album</div>}
        {showDateAdded && <div className="hidden md:block">Plays</div>}
        <div className="flex items-center justify-end pr-8 sm:pr-9">
          <Clock size={16} />
        </div>
      </div>

      {/* Rows */}
      <div className="mt-2 space-y-0.5">
        {tracks.map((track, idx) => (
          <TrackRow
            key={`${track.id || track.youtubeId}-${idx}`}
            track={track}
            index={idx}
            playlistContext={tracks}
            showAlbum={showAlbum}
            showCover={showCover}
          />
        ))}
      </div>
    </div>
  );
}
