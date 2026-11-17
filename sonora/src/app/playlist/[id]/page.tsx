'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Music, Heart, Trash2, Edit3, Search } from 'lucide-react';
import { Playlist, Track, UserPlaylist } from '@/types/music';
import { fetchPlaylist } from '@/lib/api';
import { useLibraryStore } from '@/stores/useLibraryStore';
import { usePlayerStore } from '@/stores/usePlayerStore';
import TrackTable from '@/components/track/TrackTable';
import PlayButton from '@/components/common/PlayButton';
import CreatePlaylistModal from '@/components/modal/CreatePlaylistModal';
import { formatDuration } from '@/lib/utils';

export default function PlaylistPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const { myPlaylists, deletePlaylist } = useLibraryStore();
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayerStore();

  const [playlist, setPlaylist] = useState<Playlist | UserPlaylist | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);

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
  }, [id, userPlaylist]);

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
  const tracks = playlist.tracks || [];
  const filteredTracks = filterQuery.trim()
    ? tracks.filter(
        (t) =>
          t.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
          t.artist.toLowerCase().includes(filterQuery.toLowerCase())
      )
    : tracks;

  const isPlaylistPlaying = Boolean(
    tracks.length > 0 &&
    currentTrack &&
    tracks.some((t) => t.id === currentTrack.id || t.youtubeId === currentTrack.youtubeId) &&
    isPlaying
  );

  const handlePlayPlaylist = () => {
    if (tracks.length === 0) return;
    if (isPlaylistPlaying) {
      togglePlay();
    } else {
      playTrack(tracks[0], tracks);
    }
  };

  const totalSeconds = tracks.reduce((sum, t) => sum + (t.duration || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-6 p-4 sm:p-6 rounded-lg bg-gradient-to-b from-[#2a3c5a] to-transparent">
        <div className="relative h-44 w-44 sm:h-56 sm:w-56 flex-shrink-0 rounded-md overflow-hidden bg-[#282828] shadow-2xl mx-auto sm:mx-0">
          {playlist.cover ? (
            <img src={playlist.cover} alt={playlist.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-4xl text-[#B3B3B3]">
              <Music size={64} />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 min-w-0">
          <span className="text-xs font-bold uppercase tracking-wider text-white">Playlist</span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight line-clamp-2">
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
            <span>{tracks.length} songs,</span>
            <span className="text-[#B3B3B3] font-normal">{formatDuration(totalSeconds)}</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between px-4">
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
                title="Delete playlist"
                onClick={() => {
                  if (confirm(`Are you sure you want to delete "${playlist.title}"?`)) {
                    deletePlaylist(playlist.id);
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

        {/* Search within playlist */}
        <div className="relative max-w-xs">
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
      </div>

      {/* Tracklist Table */}
      <div className="px-1 sm:px-4">
        <TrackTable
          tracks={filteredTracks}
          showAlbum={true}
          showDateAdded={true}
          emptyMessage={
            filterQuery
              ? `No songs found matching "${filterQuery}".`
              : "This playlist doesn't have any songs yet. Browse or search for songs and add them using the three-dot menu!"
          }
        />
      </div>

      {/* Edit Details Modal */}
      {isUserOwned && (
        <CreatePlaylistModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          playlistIdToEdit={playlist.id}
          initialTitle={playlist.title}
          initialDescription={playlist.description}
        />
      )}
    </div>
  );
}
