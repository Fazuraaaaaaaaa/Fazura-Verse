'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Heart, Disc } from 'lucide-react';
import { Album } from '@/types/music';
import { fetchAlbum } from '@/lib/api';
import TrackTable from '@/components/track/TrackTable';
import PlayButton from '@/components/common/PlayButton';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { useLibraryStore } from '@/stores/useLibraryStore';
import { formatDuration } from '@/lib/utils';

export default function AlbumPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);

  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayerStore();
  const { isAlbumSaved, toggleSaveAlbum } = useLibraryStore();

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    setLoading(true);

    fetchAlbum(id)
      .then((data) => {
        if (isMounted) {
          setAlbum(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Album fetch error:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 text-center text-[#B3B3B3]">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#1DB954] border-r-transparent" />
        <p className="mt-3 text-sm">Loading album...</p>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="py-20 text-center text-[#B3B3B3]">
        <h2 className="text-xl font-bold text-white mb-2">Album not found</h2>
        <p className="text-sm">We couldn&apos;t find this album.</p>
      </div>
    );
  }

  const saved = isAlbumSaved(album.id);
  const hasTracks = album.tracks && album.tracks.length > 0;

  const isAlbumPlaying = Boolean(
    hasTracks &&
    currentTrack &&
    album.tracks?.some((t) => t.id === currentTrack.id || t.youtubeId === currentTrack.youtubeId) &&
    isPlaying
  );

  const handlePlayAlbum = () => {
    if (!hasTracks) return;
    if (isAlbumPlaying) {
      togglePlay();
    } else {
      playTrack(album.tracks![0], album.tracks);
    }
  };

  const totalSeconds =
    album.totalDuration ||
    album.tracks?.reduce((sum, t) => sum + (t.duration || 0), 0) ||
    0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-6 p-4 sm:p-6 rounded-lg bg-gradient-to-b from-[#383838] to-transparent">
        <div className="relative h-44 w-44 sm:h-56 sm:w-56 flex-shrink-0 rounded-md overflow-hidden bg-[#282828] shadow-2xl mx-auto sm:mx-0">
          {album.cover ? (
            <img src={album.cover} alt={album.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-4xl text-[#B3B3B3]">
              <Disc size={64} />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 min-w-0">
          <span className="text-xs font-bold uppercase tracking-wider text-white">Album</span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight line-clamp-2">
            {album.title}
          </h1>

          <div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm font-semibold text-white/90 mt-2">
            <Link
              href={`/artist/${album.artistId || encodeURIComponent(album.artist)}`}
              className="hover:underline font-bold text-white"
            >
              {album.artist}
            </Link>
            {album.releaseYear && (
              <>
                <span>•</span>
                <span>{album.releaseYear}</span>
              </>
            )}
            <span>•</span>
            <span>{album.tracks?.length || album.trackCount || 0} songs,</span>
            <span className="text-[#B3B3B3] font-normal">{formatDuration(totalSeconds)}</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-6 px-4">
        <PlayButton
          size="lg"
          isPlaying={isAlbumPlaying}
          onClick={handlePlayAlbum}
        />

        <button
          type="button"
          title={saved ? 'Remove from Your Library' : 'Save to Your Library'}
          onClick={() => toggleSaveAlbum(album)}
          className="text-[#B3B3B3] hover:text-white transition-colors hover:scale-110 active:scale-95"
        >
          <Heart
            size={32}
            className={saved ? 'fill-[#1DB954] text-[#1DB954]' : ''}
          />
        </button>
      </div>

      {/* Tracklist Table */}
      <div className="px-1 sm:px-4">
        <TrackTable
          tracks={album.tracks || []}
          showAlbum={false}
          showDateAdded={true}
          emptyMessage="No tracks found for this album."
        />
      </div>

      {/* Footer Info */}
      <div className="px-4 text-xs text-[#B3B3B3] space-y-1 pt-6">
        <p>© {album.releaseYear || '2024'} {album.artist}</p>
        <p>℗ {album.releaseYear || '2024'} Sonora Music Distribution</p>
      </div>
    </div>
  );
}
