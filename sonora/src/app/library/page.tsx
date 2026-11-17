'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Heart, Music, MoreVertical, Trash2, Edit3, Disc, User } from 'lucide-react';
import { useLibraryStore } from '@/stores/useLibraryStore';
import { usePlayerStore } from '@/stores/usePlayerStore';
import CreatePlaylistModal from '@/components/modal/CreatePlaylistModal';
import TrackTable from '@/components/track/TrackTable';
import ArtistCard from '@/components/cards/ArtistCard';
import AlbumCard from '@/components/cards/AlbumCard';
import PlayButton from '@/components/common/PlayButton';
import { cn } from '@/lib/utils';

type LibraryTab = 'all' | 'playlists' | 'liked' | 'artists' | 'albums';

function LibraryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as LibraryTab) || 'all';

  const [activeTab, setActiveTab] = useState<LibraryTab>(initialTab);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<{ id: string; title: string; desc: string } | null>(null);

  const { likedSongs, myPlaylists, savedAlbums, followedArtists, deletePlaylist } = useLibraryStore();
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayerStore();

  const isLikedPlaying = Boolean(
    likedSongs.length > 0 &&
    currentTrack &&
    likedSongs.some((s) => s.id === currentTrack.id || s.youtubeId === currentTrack.youtubeId) &&
    isPlaying
  );

  const handlePlayLiked = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (likedSongs.length === 0) return;
    if (isLikedPlaying) {
      togglePlay();
    } else {
      playTrack(likedSongs[0], likedSongs);
    }
  };

  const tabs: { id: LibraryTab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'playlists', label: 'Playlists' },
    { id: 'liked', label: 'Liked Songs' },
    { id: 'artists', label: 'Artists' },
    { id: 'albums', label: 'Albums' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Your Library</h1>
        <button
          type="button"
          onClick={() => {
            setEditingPlaylist(null);
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-black hover:scale-105 active:scale-95 transition-transform"
        >
          <Plus size={18} />
          <span>New Playlist</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold transition-all capitalize whitespace-nowrap',
              activeTab === tab.id
                ? 'bg-white text-black font-bold'
                : 'bg-white/10 text-white hover:bg-white/20'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Liked Songs Only */}
      {activeTab === 'liked' && (
        <div className="space-y-6">
          <div className="flex items-center gap-6 p-6 rounded-lg bg-gradient-to-r from-purple-900 to-[#121212]">
            <div className="flex h-24 w-24 sm:h-32 sm:w-32 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-700 via-purple-600 to-emerald-300 shadow-2xl">
              <Heart size={48} className="fill-white text-white" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-white">Playlist</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">Liked Songs</h2>
              <p className="text-sm text-[#B3B3B3] mt-2">{likedSongs.length} songs</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <PlayButton
              size="lg"
              isPlaying={isLikedPlaying}
              onClick={handlePlayLiked}
            />
          </div>

          <TrackTable tracks={likedSongs} emptyMessage="You haven't liked any songs yet." />
        </div>
      )}

      {/* Tab: All or Playlists */}
      {(activeTab === 'all' || activeTab === 'playlists') && (
        <div className="space-y-4">
          {activeTab === 'all' && (
            <h2 className="text-xl sm:text-2xl font-bold text-white">Playlists</h2>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {/* Big Liked Songs Card */}
            <div
              onClick={() => setActiveTab('liked')}
              className="group relative flex flex-col justify-between col-span-2 aspect-[2/1] sm:aspect-auto rounded-lg bg-gradient-to-br from-indigo-700 via-purple-600 to-emerald-400 p-5 cursor-pointer shadow-lg hover:scale-[1.01] transition-transform select-none"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-white/80">Playlist</p>
                <h3 className="text-2xl font-extrabold text-white mt-1">Liked Songs</h3>
                <p className="text-sm text-white/90 mt-2">{likedSongs.length} liked songs</p>
              </div>

              <div className="flex justify-end">
                <PlayButton
                  size="md"
                  isPlaying={isLikedPlaying}
                  onClick={handlePlayLiked}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </div>

            {/* Custom User Playlists */}
            {myPlaylists.map((pl) => (
              <div
                key={pl.id}
                onClick={() => router.push(`/playlist/${pl.id}`)}
                className="group relative flex flex-col rounded-md bg-[#181818] p-3 sm:p-4 hover:bg-[#282828] transition-all cursor-pointer shadow-md select-none"
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-md bg-[#282828] mb-3 shadow">
                  {pl.cover ? (
                    <img
                      src={pl.cover}
                      alt={pl.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-3xl text-[#B3B3B3]">
                      <Music size={32} />
                    </div>
                  )}

                  {/* Quick Edit/Delete buttons on card */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      title="Edit playlist"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingPlaylist({ id: pl.id, title: pl.title, desc: pl.description });
                        setShowCreateModal(true);
                      }}
                      className="p-1.5 rounded-full bg-black/70 text-white hover:bg-black transition-colors"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      type="button"
                      title="Delete playlist"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete playlist "${pl.title}"?`)) {
                          deletePlaylist(pl.id);
                        }
                      }}
                      className="p-1.5 rounded-full bg-black/70 text-red-400 hover:bg-black hover:text-red-300 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-sm sm:text-base text-white truncate" title={pl.title}>
                    {pl.title}
                  </span>
                  <span className="text-xs text-[#B3B3B3] truncate mt-1">
                    Playlist • {pl.tracks?.length || 0} songs
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Artists */}
      {(activeTab === 'all' || activeTab === 'artists') && (
        <div className="space-y-4 pt-4">
          {activeTab === 'all' && (
            <h2 className="text-xl sm:text-2xl font-bold text-white">Followed Artists</h2>
          )}
          {followedArtists.length === 0 ? (
            activeTab === 'artists' && (
              <div className="py-12 text-center text-[#B3B3B3] text-sm">
                You haven&apos;t followed any artists yet. Browse artists to follow them!
              </div>
            )
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {followedArtists.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Albums */}
      {(activeTab === 'all' || activeTab === 'albums') && (
        <div className="space-y-4 pt-4">
          {activeTab === 'all' && (
            <h2 className="text-xl sm:text-2xl font-bold text-white">Saved Albums</h2>
          )}
          {savedAlbums.length === 0 ? (
            activeTab === 'albums' && (
              <div className="py-12 text-center text-[#B3B3B3] text-sm">
                No saved albums in your library yet.
              </div>
            )
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {savedAlbums.map((album) => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Modal */}
      <CreatePlaylistModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingPlaylist(null);
        }}
        playlistIdToEdit={editingPlaylist?.id}
        initialTitle={editingPlaylist?.title}
        initialDescription={editingPlaylist?.desc}
      />
    </div>
  );
}

export default function LibraryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#B3B3B3]">Loading library...</div>}>
      <LibraryContent />
    </Suspense>
  );
}
