'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SearchResults, Track, Artist, Album, Playlist } from '@/types/music';
import { searchMusic } from '@/lib/api';
import { MOCK_GENRES } from '@/lib/mockData';
import TrackTable from '@/components/track/TrackTable';
import ArtistCard from '@/components/cards/ArtistCard';
import AlbumCard from '@/components/cards/AlbumCard';
import PlaylistCard from '@/components/cards/PlaylistCard';
import PlayButton from '@/components/common/PlayButton';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'songs' | 'artists' | 'albums' | 'playlists';

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [filter, setFilter] = useState<FilterType>('all');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);

  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayerStore();

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }

    let isMounted = true;
    setLoading(true);

    searchMusic(query, filter)
      .then((data) => {
        if (isMounted) {
          setResults(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Search error:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [query, filter]);

  const filterChips: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'songs', label: 'Songs' },
    { id: 'artists', label: 'Artists' },
    { id: 'albums', label: 'Albums' },
    { id: 'playlists', label: 'Playlists' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* If there is a query, show Filter Chips */}
      {query && (
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          {filterChips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => setFilter(chip.id)}
              className={cn(
                'rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold transition-all capitalize whitespace-nowrap',
                filter === chip.id
                  ? 'bg-white text-black font-bold'
                  : 'bg-white/10 text-white hover:bg-white/20'
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {/* When Empty: Browse All Categories */}
      {!query && (
        <div className="space-y-4">
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">Browse all</h1>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {MOCK_GENRES.map((genre) => (
              <div
                key={genre.id}
                onClick={() => router.push(`/search?q=${encodeURIComponent(genre.name)}`)}
                style={{ backgroundColor: genre.color }}
                className="group relative aspect-square overflow-hidden rounded-lg p-3 sm:p-4 cursor-pointer shadow-md transition-transform duration-200 hover:scale-[1.02] select-none"
              >
                <span className="text-base sm:text-lg font-bold text-white break-words">
                  {genre.name}
                </span>

                {genre.cover && (
                  <div className="absolute -bottom-1 -right-2 h-16 w-16 sm:h-20 sm:w-20 rotate-[25deg] shadow-2xl rounded overflow-hidden">
                    <img
                      src={genre.cover}
                      alt={genre.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="py-16 text-center text-[#B3B3B3]">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#1DB954] border-r-transparent" />
          <p className="mt-3 text-sm">Searching Sonora catalog...</p>
        </div>
      )}

      {/* When Results Loaded */}
      {!loading && query && results && (
        <div className="space-y-8">
          {/* Top Result + Songs (when filter is 'all') */}
          {filter === 'all' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Top Result Showcase Card */}
              {results.topResult && (
                <div className="lg:col-span-5 flex flex-col">
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">Top result</h2>
                  <div
                    onClick={() => {
                      if (results.topResult?.type === 'track') {
                        const tr = results.topResult.item as Track;
                        playTrack(tr, results.tracks);
                      } else if (results.topResult?.type === 'artist') {
                        router.push(`/artist/${results.topResult.item.id}`);
                      } else if (results.topResult?.type === 'album') {
                        router.push(`/album/${results.topResult.item.id}`);
                      } else if (results.topResult?.type === 'playlist') {
                        router.push(`/playlist/${results.topResult.item.id}`);
                      }
                    }}
                    className="group relative flex flex-col justify-between flex-1 rounded-lg bg-[#181818] p-5 sm:p-6 hover:bg-[#282828] transition-all cursor-pointer shadow-lg select-none"
                  >
                    <div>
                      <div className="relative h-24 w-24 sm:h-28 sm:w-28 overflow-hidden rounded-md shadow-md mb-4 bg-[#282828]">
                        {'thumbnail' in results.topResult.item && (
                          <img
                            src={results.topResult.item.thumbnail}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        )}
                        {'avatar' in results.topResult.item && (
                          <img
                            src={results.topResult.item.avatar}
                            alt=""
                            className="h-full w-full object-cover rounded-full"
                          />
                        )}
                        {'cover' in results.topResult.item && (
                          <img
                            src={results.topResult.item.cover}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>

                      <h3 className="text-2xl sm:text-3xl font-extrabold text-white truncate">
                        {'title' in results.topResult.item
                          ? results.topResult.item.title
                          : results.topResult.item.name}
                      </h3>

                      <div className="flex items-center gap-2 mt-1.5 text-sm text-[#B3B3B3]">
                        <span className="capitalize font-medium">
                          {results.topResult.type}
                        </span>
                        <span>•</span>
                        <span className="text-white truncate">
                          {'artist' in results.topResult.item
                            ? results.topResult.item.artist
                            : 'name' in results.topResult.item
                            ? results.topResult.item.name
                            : (results.topResult.item as any).title}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-end mt-4">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <PlayButton
                          size="lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (results.topResult?.type === 'track') {
                              playTrack(results.topResult.item as Track, results.tracks);
                            } else if (results.tracks.length > 0) {
                              playTrack(results.tracks[0], results.tracks);
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Songs List on the Right */}
              <div className="lg:col-span-7">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">Songs</h2>
                <TrackTable
                  tracks={results.tracks.slice(0, 4)}
                  showAlbum={false}
                  showDateAdded={false}
                />
              </div>
            </div>
          )}

          {/* Songs List (when filter is 'songs' or full list) */}
          {(filter === 'songs' || (filter === 'all' && results.tracks.length > 4)) && (
            <div className="space-y-3">
              {filter === 'songs' && (
                <h2 className="text-xl sm:text-2xl font-bold text-white">Songs</h2>
              )}
              <TrackTable
                tracks={filter === 'songs' ? results.tracks : results.tracks.slice(4)}
                showAlbum={true}
              />
            </div>
          )}

          {/* Artists */}
          {(filter === 'all' || filter === 'artists') && results.artists.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Artists</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {results.artists.map((artist) => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))}
              </div>
            </div>
          )}

          {/* Albums */}
          {(filter === 'all' || filter === 'albums') && results.albums.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Albums</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {results.albums.map((album) => (
                  <AlbumCard key={album.id} album={album} />
                ))}
              </div>
            </div>
          )}

          {/* Playlists */}
          {(filter === 'all' || filter === 'playlists') && results.playlists.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Playlists</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {results.playlists.map((playlist) => (
                  <PlaylistCard key={playlist.id} playlist={playlist} />
                ))}
              </div>
            </div>
          )}

          {/* No results at all */}
          {results.tracks.length === 0 &&
            results.artists.length === 0 &&
            results.albums.length === 0 &&
            results.playlists.length === 0 && (
              <div className="py-20 text-center text-[#B3B3B3]">
                <h3 className="text-xl font-bold text-white mb-2">
                  No results found for &quot;{query}&quot;
                </h3>
                <p className="text-sm">
                  Please make sure your words are spelled correctly, or use fewer or different keywords.
                </p>
              </div>
            )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-[#B3B3B3]">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#1DB954] border-r-transparent" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
