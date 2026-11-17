'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Play,
  Pause,
  ListPlus,
  Heart,
  Plus,
  User,
  Disc,
  ExternalLink,
  Copy,
  PictureInPicture2,
  Check,
  ChevronRight,
} from 'lucide-react';
import { useContextMenuStore } from '@/stores/useContextMenuStore';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { useLibraryStore } from '@/stores/useLibraryStore';
import { useToastStore } from '@/stores/useToastStore';

export default function ContextMenu() {
  const router = useRouter();
  const { isOpen, position, track, playlistContext, closeContextMenu } = useContextMenuStore();
  const { currentTrack, isPlaying, playTrack, togglePlay, addToQueue, playNext } = usePlayerStore();
  const { isSongLiked, toggleLikeSong, myPlaylists, addSongToPlaylist } = useLibraryStore();
  const { showToast } = useToastStore();

  const [showPlaylistSubmenu, setShowPlaylistSubmenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeContextMenu();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeContextMenu();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeContextMenu]);

  if (!isOpen || !track) return null;

  const isCurrentPlaying =
    currentTrack &&
    ((currentTrack.id && currentTrack.id === track.id) ||
      (currentTrack.youtubeId && currentTrack.youtubeId === track.youtubeId)) &&
    isPlaying;

  const liked = isSongLiked(track.id) || isSongLiked(track.youtubeId);

  const handlePlay = () => {
    if (isCurrentPlaying) {
      togglePlay();
    } else {
      playTrack(track, playlistContext || [track]);
    }
    closeContextMenu();
  };

  const handleAddToQueue = () => {
    addToQueue(track);
    showToast(`Added to Queue: ${track.title}`, 'success');
    closeContextMenu();
  };

  const handlePlayNext = () => {
    playNext(track);
    showToast(`Will play next: ${track.title}`, 'success');
    closeContextMenu();
  };

  const handleToggleLike = () => {
    toggleLikeSong(track);
    if (!liked) {
      showToast('Added to Liked Songs', 'success');
    } else {
      showToast('Removed from Liked Songs', 'info');
    }
    closeContextMenu();
  };

  const handleGoToArtist = () => {
    const artistId =
      track.artists && track.artists.length > 0 && track.artists[0].id
        ? track.artists[0].id
        : encodeURIComponent(track.artist);
    router.push(`/artist/${artistId}`);
    closeContextMenu();
  };

  const handleGoToAlbum = () => {
    if (track.albumId || track.album) {
      router.push(`/album/${track.albumId || encodeURIComponent(track.album!)}`);
    } else {
      showToast('No album information available', 'info');
    }
    closeContextMenu();
  };

  const handleOpenMiniPlayer = () => {
    if (typeof window !== 'undefined') {
      window.open(
        '/miniplayer',
        'sonora_miniplayer',
        'width=380,height=540,resizable=yes,scrollbars=no,status=no'
      );
    }
    closeContextMenu();
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/?track=${encodeURIComponent(track.youtubeId || track.id)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      showToast('Song link copied to clipboard!', 'success');
    } else {
      showToast('Clipboard not accessible', 'error');
    }
    closeContextMenu();
  };

  return (
    <div
      ref={menuRef}
      style={{ left: position.x, top: position.y }}
      className="fixed z-50 w-56 rounded-md bg-[#282828] p-1.5 shadow-2xl border border-white/10 text-xs sm:text-sm text-white select-none animate-in fade-in zoom-in-95 duration-100"
    >
      {/* Track preview */}
      <div className="flex items-center gap-2.5 px-3 py-2 border-b border-white/10 mb-1">
        <div className="h-8 w-8 rounded overflow-hidden bg-[#181818] flex-shrink-0">
          {track.thumbnail && (
            <img src={track.thumbnail} alt="" className="h-full w-full object-cover" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-bold text-xs truncate text-white">{track.title}</div>
          <div className="text-[11px] text-[#B3B3B3] truncate">{track.artist}</div>
        </div>
      </div>

      <button
        type="button"
        onClick={handlePlay}
        className="flex w-full items-center gap-2.5 rounded px-3 py-2 text-left hover:bg-white/10 transition-colors"
      >
        {isCurrentPlaying ? <Pause size={16} /> : <Play size={16} />}
        <span>{isCurrentPlaying ? 'Pause' : 'Play'}</span>
      </button>

      <button
        type="button"
        onClick={handleAddToQueue}
        className="flex w-full items-center gap-2.5 rounded px-3 py-2 text-left hover:bg-white/10 transition-colors"
      >
        <ListPlus size={16} />
        <span>Add to queue</span>
      </button>

      <button
        type="button"
        onClick={handlePlayNext}
        className="flex w-full items-center gap-2.5 rounded px-3 py-2 text-left hover:bg-white/10 transition-colors"
      >
        <Play size={16} />
        <span>Play next</span>
      </button>

      <button
        type="button"
        onClick={handleToggleLike}
        className="flex w-full items-center gap-2.5 rounded px-3 py-2 text-left hover:bg-white/10 transition-colors"
      >
        <Heart size={16} className={liked ? 'fill-[#1DB954] text-[#1DB954]' : ''} />
        <span>{liked ? 'Remove from Liked Songs' : 'Save to Liked Songs'}</span>
      </button>

      {/* Add to Playlist with Submenu */}
      <div
        className="relative"
        onMouseEnter={() => setShowPlaylistSubmenu(true)}
        onMouseLeave={() => setShowPlaylistSubmenu(false)}
      >
        <div className="flex w-full items-center justify-between rounded px-3 py-2 text-left hover:bg-white/10 transition-colors cursor-pointer">
          <div className="flex items-center gap-2.5">
            <Plus size={16} />
            <span>Add to playlist</span>
          </div>
          <ChevronRight size={14} className="text-[#B3B3B3]" />
        </div>

        {showPlaylistSubmenu && (
          <div className="absolute left-full top-0 ml-1 w-48 rounded-md bg-[#282828] p-1.5 shadow-2xl border border-white/10 text-xs sm:text-sm animate-in fade-in duration-75">
            {myPlaylists.length === 0 ? (
              <div className="px-3 py-2 text-xs text-[#B3B3B3]">No playlists created</div>
            ) : (
              myPlaylists.map((pl) => (
                <button
                  key={pl.id}
                  type="button"
                  onClick={() => {
                    addSongToPlaylist(pl.id, track);
                    showToast(`Added to ${pl.title}`, 'success');
                    closeContextMenu();
                  }}
                  className="flex w-full items-center justify-between rounded px-3 py-1.5 text-left text-xs hover:bg-white/10 truncate"
                >
                  <span className="truncate">{pl.title}</span>
                  <Plus size={12} className="text-[#B3B3B3] flex-shrink-0" />
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="my-1 border-t border-white/10" />

      <button
        type="button"
        onClick={handleGoToArtist}
        className="flex w-full items-center gap-2.5 rounded px-3 py-2 text-left hover:bg-white/10 transition-colors"
      >
        <User size={16} />
        <span>Go to artist</span>
      </button>

      <button
        type="button"
        onClick={handleGoToAlbum}
        className="flex w-full items-center gap-2.5 rounded px-3 py-2 text-left hover:bg-white/10 transition-colors"
      >
        <Disc size={16} />
        <span>Go to album</span>
      </button>

      <button
        type="button"
        onClick={handleOpenMiniPlayer}
        className="flex w-full items-center gap-2.5 rounded px-3 py-2 text-left hover:bg-white/10 transition-colors text-[#1DB954]"
      >
        <PictureInPicture2 size={16} />
        <span>Pop-up Miniplayer</span>
      </button>

      <button
        type="button"
        onClick={handleCopyLink}
        className="flex w-full items-center gap-2.5 rounded px-3 py-2 text-left hover:bg-white/10 transition-colors"
      >
        <Copy size={16} />
        <span>Copy song link</span>
      </button>
    </div>
  );
}
