'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Music,
  Trash2,
  Edit3,
  Search,
  Copy,
  ArrowUpDown,
  Plus,
  Check,
  Sparkles,
} from 'lucide-react';
import { Playlist, Track, UserPlaylist } from '@/types/music';
import { fetchPlaylist } from '@/lib/api';
import { useLibraryStore } from '@/stores/useLibraryStore';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { useToastStore } from '@/stores/useToastStore';
import TrackTable from '@/components/track/TrackTable';
import PlayButton from '@/components/common/PlayButton';
import CreatePlaylistModal from '@/components/modal/CreatePlaylistModal';
import { formatDuration } from '@/lib/utils';
import { INDONESIAN_HITS, KPOP_DAEBAK } from '@/lib/api';
import { MOCK_TRACKS } from '@/lib/mockData';

type SortOption = 'custom' | 'title-asc' | 'title-desc' | 'artist-asc' | 'duration-asc' | 'duration-desc';

export default function PlaylistPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const { myPlaylists, deletePlaylist, duplicatePlaylist, addSongToPlaylist } = useLibraryStore();
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayerStore();
  const { showToast } = useToastStore();

  const [playlist, setPlaylist] = useState<Playlist | UserPlaylist | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('custom');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [addedTracks, setAddedTracks] = useState<Record<string, boolean>>({});

  // Check if it's a custom user playlist
  const userPlaylist = myPlaylists.find((p) => p.id === id);

  useEffect(() => {
    if (!id) return;

    if (userPlaylist) {
      setPlaylist(userPlaylist);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    fetchPlaylist(id)
      .then((data) => {
        if (isMounted) {
          setPlaylist(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Playlist fetch error:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, userPlaylist?.id, userPlaylist?.tracks?.length, userPlaylist?.title, userPlaylist?.description, userPlaylist?.cover]);

  const rawTracks = playlist?.tracks || [];

  // Filter & Sort
  const processedTracks = useMemo(() => {
    let list = [...rawTracks];

    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.artist.toLowerCase().includes(q) ||
          t.album?.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case 'title-asc':
        list.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title-desc':
        list.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'artist-asc':
        list.sort((a, b) => a.artist.localeCompare(b.artist));
        break;
      case 'duration-asc':
        list.sort((a, b) => (a.duration || 0) - (b.duration || 0));
        break;
      case 'duration-desc':
        list.sort((a, b) => (b.duration || 0) - (a.duration || 0));
        break;
      case 'custom':
      default:
        break;
    }

    return list;
  }, [rawTracks, filterQuery, sortBy]);

  // Recommended tracks for empty playlist state
  const recommendedPool = useMemo(() => {
    const all = [...INDONESIAN_HITS, ...MOCK_TRACKS, ...KPOP_DAEBAK];
    const existingIds = new Set(rawTracks.map((t) => t.id || t.youtubeId));
    return all.filter((t) => !existingIds.has(t.id || t.youtubeId)).slice(0, 6);
  }, [rawTracks]);

  if (loading) {
    return (
      <div className="py-20 text-center text-[#B3B3B3]">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#1DB954] border-r-transparent" />
        <p className="mt-3 text-sm">Loading playlist...</p>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="py-20 text-center text-[#B3B3B3]">
        <h2 className="text-xl font-bold text-white mb-2">Playlist not found</h2>
        <p className="text-sm">We couldn&apos;t find this playlist.</p>
      </div>
    );
  }

  const isUserOwned = !!userPlaylist;

  const isPlaylistPlaying = Boolean(
    processedTracks.length > 0 &&
      currentTrack &&
      processedTracks.some((t) => t.id === currentTrack.id || t.youtubeId === currentTrack.youtubeId) &&
      isPlaying
  );

  const handlePlayPlaylist = () => {
    if (processedTracks.length === 0) return;
    if (isPlaylistPlaying) {
      togglePlay();
    } else {
      playTrack(processedTracks[0], processedTracks);
    }
  };

  const handleDuplicate = () => {
    const copy = duplicatePlaylist(playlist.id);
    if (copy) {
      showToast(`Duplicated "${playlist.title}"`, 'success');
      router.push(`/playlist/${copy.id}`);
    }
  };

  const handleAddRecommended = (track: Track) => {
    addSongToPlaylist(playlist.id, track);
    setAddedTracks((prev) => ({ ...prev, [track.id || track.youtubeId]: true }));
    showToast(`Added "${track.title}" to playlist`, 'success');
  };

  const totalSeconds = processedTracks.reduce((sum, t) => sum + (t.duration || 0), 0);

  const sortLabels: Record<SortOption, string> = {
    custom: 'Custom order',
    'title-asc': 'Title (A-Z)',
    'title-desc': 'Title (Z-A)',
    'artist-asc': 'Artist (A-Z)',
    'duration-asc': 'Duration (Shortest)',
    'duration-desc': 'Duration (Longest)',
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-6 p-4 sm:p-6 rounded-lg bg-gradient-to-b from-[#2a3c5a] to-transparent">
        <div
          onClick={() => isUserOwned && setShowEditModal(true)}
          className={`relative h-44 w-44 sm:h-56 sm:w-56 flex-shrink-0 rounded-md overflow-hidden bg-[#282828] shadow-2xl mx-auto sm:mx-0 group ${
            isUserOwned ? 'cursor-pointer' : ''
          }`}
          title={isUserOwned ? 'Click to edit details' : ''}
        >
          {playlist.cover ? (
            <img src={playlist.cover} alt={playlist.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-4xl text-[#B3B3B3]">
              <Music size={64} />
            </div>
          )}
          {isUserOwned && (
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1.5 transition-opacity text-white">
              <Edit3 size={28} />
              <span className="text-xs font-bold">Choose photo</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 min-w-0">
          <span className="text-xs font-bold uppercase tracking-wider text-white">Playlist</span>
          <h1
            onClick={() => isUserOwned && setShowEditModal(true)}
            className={`text-3xl sm:text-5xl font-black text-white tracking-tight line-clamp-2 ${
              isUserOwned ? 'cursor-pointer hover:underline' : ''
            }`}
          >
            {playlist.title}
          </h1>

          {playlist.description && (
            <p className="text-xs sm:text-sm text-[#B3B3B3] line-clamp-2 mt-1">
              {playlist.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm font-semibold text-white/90 mt-2">
            <span className="font-bold text-white">
              {'creator' in playlist && playlist.creator?.name ? playlist.creator.name : 'You'}
            </span>
            <span>•</span>
            <span>{rawTracks.length} songs,</span>
            <span className="text-[#B3B3B3] font-normal">{formatDuration(totalSeconds)}</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-4 sm:gap-6">
          <PlayButton
            size="lg"
            isPlaying={isPlaylistPlaying}
            onClick={handlePlayPlaylist}
          />

          {isUserOwned && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                title="Edit playlist details"
                onClick={() => setShowEditModal(true)}
                className="p-2 text-[#B3B3B3] hover:text-white rounded-full hover:bg-white/10 transition-colors"
              >
                <Edit3 size={20} />
              </button>
              <button
                type="button"
                title="Duplicate playlist"
                onClick={handleDuplicate}
                className="p-2 text-[#B3B3B3] hover:text-white rounded-full hover:bg-white/10 transition-colors"
              >
                <Copy size={20} />
              </button>
              <button
                type="button"
                title="Delete playlist"
                onClick={() => {
                  if (confirm(`Are you sure you want to delete "${playlist.title}"?`)) {
                    deletePlaylist(playlist.id);
                    showToast(`Deleted "${playlist.title}"`, 'info');
                    router.push('/library');
                  }
                }}
                className="p-2 text-[#B3B3B3] hover:text-red-400 rounded-full hover:bg-white/10 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex items-center gap-3">
          {/* Live Search inside playlist */}
          <div className="relative flex-1 sm:w-56">
            <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none text-[#B3B3B3]">
              <Search size={14} />
            </div>
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search in playlist"
              className="w-full rounded-md bg-white/10 py-1.5 pl-8 pr-3 text-xs text-white placeholder-[#727272] focus:bg-white/20 focus:outline-none"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSortMenu((prev) => !prev)}
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold text-[#B3B3B3] hover:text-white hover:bg-white/10 transition-colors"
            >
              <ArrowUpDown size={14} />
              <span>{sortLabels[sortBy]}</span>
            </button>

            {showSortMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowSortMenu(false)} />
                <div className="absolute right-0 top-9 z-40 w-44 rounded-md bg-[#282828] p-1.5 shadow-2xl border border-white/10 text-xs text-white">
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#B3B3B3]">
                    Sort by
                  </div>
                  {(Object.keys(sortLabels) as SortOption[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setSortBy(key);
                        setShowSortMenu(false);
                      }}
                      className={`flex w-full items-center justify-between rounded px-2.5 py-1.5 text-left hover:bg-white/10 transition-colors ${
                        sortBy === key ? 'text-[#1DB954] font-bold' : 'text-white'
                      }`}
                    >
                      <span>{sortLabels[key]}</span>
                      {sortBy === key && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tracklist Table */}
      <div className="px-1 sm:px-4">
        {processedTracks.length > 0 ? (
          <TrackTable
            tracks={processedTracks}
            showAlbum={true}
            showDateAdded={true}
          />
        ) : filterQuery ? (
          <div className="py-12 text-center text-[#B3B3B3] text-sm">
            No songs found matching &quot;{filterQuery}&quot;.
          </div>
        ) : (
          /* Empty Playlist State with Quick "Add Recommended Songs" */
          <div className="space-y-6 pt-4">
            <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center">
              <Music size={40} className="mx-auto text-[#B3B3B3] mb-2 opacity-50" />
              <h3 className="text-lg font-bold text-white">Let&apos;s find something for your playlist</h3>
              <p className="text-xs text-[#B3B3B3] mt-1 max-w-sm mx-auto">
                Add songs using the recommendations below, or search for any song and use the right-click menu.
              </p>
            </div>

            {isUserOwned && recommendedPool.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-[#1DB954]" />
                  <h3 className="text-sm sm:text-base font-bold text-white">Recommended Songs</h3>
                </div>

                <div className="space-y-1">
                  {recommendedPool.map((track) => {
                    const isAdded = addedTracks[track.id || track.youtubeId];
                    return (
                      <div
                        key={track.id || track.youtubeId}
                        className="group flex items-center justify-between rounded-lg p-2.5 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="relative h-11 w-11 rounded overflow-hidden bg-[#282828] flex-shrink-0">
                            {track.thumbnail && (
                              <img src={track.thumbnail} alt="" className="h-full w-full object-cover" />
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-sm text-white truncate">
                              {track.title}
                            </span>
                            <span className="text-xs text-[#B3B3B3] truncate">{track.artist}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-xs text-[#B3B3B3] tabular-nums">
                            {track.durationFormatted || formatDuration(track.duration)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddRecommended(track)}
                            disabled={isAdded}
                            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                              isAdded
                                ? 'bg-white/10 text-[#1DB954]'
                                : 'border border-white/20 text-white hover:border-white hover:scale-105 active:scale-95'
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <Check size={14} />
                                <span>Added</span>
                              </>
                            ) : (
                              <>
                                <Plus size={14} />
                                <span>Add</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Details Modal */}
      {isUserOwned && (
        <CreatePlaylistModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          playlistIdToEdit={playlist.id}
          initialTitle={playlist.title}
          initialDescription={playlist.description}
          initialCover={playlist.cover}
        />
      )}
    </div>
  );
}
