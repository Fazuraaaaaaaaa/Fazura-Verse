'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Play, Pause, MoreHorizontal, Plus, ListPlus, Check, PictureInPicture2 } from 'lucide-react';
import { Track } from '@/types/music';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { useLibraryStore } from '@/stores/useLibraryStore';
import { useContextMenuStore } from '@/stores/useContextMenuStore';
import { useToastStore } from '@/stores/useToastStore';
import LikeButton from '@/components/common/LikeButton';
import { formatDuration, formatPlays, cn } from '@/lib/utils';

interface TrackRowProps {
  track: Track;
  index: number;
  playlistContext?: Track[];
  showAlbum?: boolean;
  showCover?: boolean;
  showDateAdded?: string;
}

export default function TrackRow({
  track,
  index,
  playlistContext,
  showAlbum = true,
  showCover = true,
  showDateAdded,
}: TrackRowProps) {
  const { currentTrack, isPlaying, playTrack, togglePlay, addToQueue, playNext } = usePlayerStore();
  const { myPlaylists, addSongToPlaylist } = useLibraryStore();
  const { openContextMenu } = useContextMenuStore();
  const { showToast } = useToastStore();
  const [showMenu, setShowMenu] = useState(false);
  const [addedPlaylistId, setAddedPlaylistId] = useState<string | null>(null);

  const isCurrentTrack = Boolean(
    currentTrack &&
      ((currentTrack.id && currentTrack.id === track.id) ||
        (currentTrack.youtubeId && currentTrack.youtubeId === track.youtubeId))
  );

  const isTrackPlaying = Boolean(isCurrentTrack && isPlaying);

  const handlePlayToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentTrack) {
      togglePlay();
    } else {
      playTrack(track, playlistContext || [track]);
    }
  };

  const handleRowClick = () => {
    if (!isCurrentTrack) {
      playTrack(track, playlistContext || [track]);
    } else {
      togglePlay();
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    openContextMenu(e, track, playlistContext);
  };

  return (
    <div
      onClick={handleRowClick}
      onContextMenu={handleContextMenu}
      className={cn(
        'group relative grid grid-cols-[16px_1fr_auto] sm:grid-cols-[20px_4fr_2fr_auto] md:grid-cols-[24px_6fr_4fr_3fr_auto] items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2 sm:py-2.5 rounded-md hover:bg-white/10 transition-colors select-none cursor-pointer',
        isCurrentTrack && 'bg-white/5'
      )}
    >
      {/* Index or Play icon */}
      <div className="flex items-center justify-center text-sm font-medium">
        <span
          className={cn(
            'group-hover:hidden transition-colors',
            isCurrentTrack ? 'text-[#1DB954] font-semibold' : 'text-[#B3B3B3]'
          )}
        >
          {isTrackPlaying ? (
            <div className="flex items-end gap-0.5 h-3.5">
              <span className="w-1 bg-[#1DB954] animate-pulse h-full rounded-sm" />
              <span className="w-1 bg-[#1DB954] animate-pulse h-2/3 rounded-sm" />
              <span className="w-1 bg-[#1DB954] animate-pulse h-4/5 rounded-sm" />
            </div>
          ) : (
            index + 1
          )}
        </span>
        <button
          type="button"
          onClick={handlePlayToggle}
          className="hidden group-hover:flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-transform"
        >
          {isTrackPlaying ? (
            <Pause size={16} className="fill-white" />
          ) : (
            <Play size={16} className="fill-white ml-0.5" />
          )}
        </button>
      </div>

      {/* Title & Artist & Cover */}
      <div className="flex items-center gap-3 min-w-0">
        {showCover && (
          <div className="relative w-10 h-10 flex-shrink-0 rounded overflow-hidden bg-[#282828] shadow">
            {track.thumbnail ? (
              <img
                src={track.thumbnail}
                alt={track.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-[#282828] flex items-center justify-center text-xs text-[#B3B3B3]">
                ♪
              </div>
            )}
          </div>
        )}
        <div className="flex flex-col min-w-0">
          <span
            className={cn(
              'font-medium text-sm sm:text-base truncate transition-colors',
              isCurrentTrack ? 'text-[#1DB954]' : 'text-white group-hover:text-white'
            )}
            title={track.title}
          >
            {track.title}
          </span>
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-[#B3B3B3] truncate">
            {track.explicit && (
              <span className="bg-[#B3B3B3] text-black text-[10px] font-bold px-1 py-0.2 rounded-sm leading-tight flex-shrink-0">
                E
              </span>
            )}
            {track.artists && track.artists.length > 0 ? (
              track.artists.map((artist, idx) => (
                <React.Fragment key={artist.id || artist.name}>
                  {idx > 0 && <span>, </span>}
                  <Link
                    href={`/artist/${artist.id || encodeURIComponent(artist.name)}`}
                    onClick={(e) => e.stopPropagation()}
                    className="hover:underline hover:text-white truncate"
                  >
                    {artist.name}
                  </Link>
                </React.Fragment>
              ))
            ) : (
              <Link
                href={`/artist/${encodeURIComponent(track.artist)}`}
                onClick={(e) => e.stopPropagation()}
                className="hover:underline hover:text-white truncate"
              >
                {track.artist}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Album name */}
      {showAlbum && (
        <div className="hidden sm:block min-w-0 text-sm text-[#B3B3B3] truncate">
          {track.album ? (
            <Link
              href={`/album/${track.albumId || encodeURIComponent(track.album)}`}
              onClick={(e) => e.stopPropagation()}
              className="hover:underline hover:text-white truncate"
            >
              {track.album}
            </Link>
          ) : (
            <span>—</span>
          )}
        </div>
      )}

      {/* Date Added or Views */}
      <div className="hidden md:block min-w-0 text-sm text-[#B3B3B3] truncate">
        {showDateAdded || (track.views ? `${formatPlays(track.views)} plays` : '—')}
      </div>

      {/* Duration, Like, & Context Menu */}
      <div className="flex items-center justify-end gap-3 sm:gap-4 text-sm text-[#B3B3B3]">
        <LikeButton track={track} size={16} className="opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100" />
        <span className="w-10 text-right tabular-nums text-xs sm:text-sm font-normal">
          {track.durationFormatted || formatDuration(track.duration)}
        </span>

        {/* More actions menu (Triggers context menu or popup) */}
        <div className="relative">
          <button
            type="button"
            title="More options"
            onClick={(e) => {
              e.stopPropagation();
              openContextMenu(e, track, playlistContext);
            }}
            className="p-1 rounded-full text-[#B3B3B3] hover:text-white opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
          >
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
