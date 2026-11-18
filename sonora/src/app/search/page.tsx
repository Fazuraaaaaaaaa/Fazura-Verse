'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  History,
  X,
  Sparkles,
  ChevronDown,
  TrendingUp,
} from 'lucide-react';
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

const RECENT_SEARCHES_KEY = 'sonora_recent_searches';

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [filter, setFilter] = useState<FilterType>('all');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [visibleSongCount, setVisibleSongCount] = useState(12);

  // In-page search input & suggestions
  const [localInput, setLocalInput] = useState(query);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Recent searches stored in localStorage
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const { playTrack } = usePlayerStore();

  // Load recent searches on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  // Save new search query to recent searches
  useEffect(() => {
    setLocalInput(query);
    if (!query.trim()) {
      setResults(null);
      return;
    }

    const trimmed = query.trim();
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 10);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    let isMounted = true;
    setLoading(true);
    setVisibleSongCount(12);

    searchMusic(trimmed, filter)
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

  // Live suggestions debounce
  useEffect(() => {
    if (!localInput.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/ytmusic/suggestions?q=${encodeURIComponent(localInput.trim())}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setSuggestions(data.slice(0, 6));
            return;
          }
        }
      } catch {
        // fallback local suggestions
      }

      // Fallback suggestions
      const q = localInput.toLowerCase();
      const mockKeywords = [
        'Bernadya', 'Sal Priadi', 'Mahalini', 'Hindia', 'Tulus',
        'Taylor Swift', 'The Weeknd', 'Billie Eilish', 'Sabrina Carpenter',
        'NewJeans', 'BTS', 'BLACKPINK', 'Coldplay', 'Die With A Smile',
        'Birds of a feather', 'Espresso', 'Satu Bulan', 'Gala Bunga Matahari',
      ];
      setSuggestions(mockKeywords.filter((k) => k.toLowerCase().includes(q)).slice(0, 6));
    }, 200);

    return () => clearTimeout(timer);
  }, [localInput]);

  const removeRecentSearch = (item: string) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((s) => s !== item);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const clearAllRecent = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // ignore
    }
  };

  const handleSelectSearch = (term: string) => {
    setShowSuggestions(false);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  const filterChips: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'songs', label: 'Songs' },
    { id: 'artists', label: 'Artists' },
    { id: 'albums', label: 'Albums' },
    { id: 'playlists', label: 'Playlists' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Search Input Bar with Suggestions Dropdown */}
      <div className="relative max-w-xl">
        <div className="relative flex items-center">
          <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-[#B3B3B3]">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={localInput}
            onFocus={() => setShowSuggestions(true)}
            onChange={(e) => setLocalInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && localInput.trim()) {
                handleSelectSearch(localInput.trim());
              }
            }}
            placeholder="Search songs, artists, albums, or playlists..."
            className="w-full rounded-full bg-[#242424] py-3 pl-11 pr-10 text-sm text-white placeholder-[#727272] transition-all hover:bg-[#2a2a2a] focus:bg-[#2a2a2a] focus:outline-none focus:ring-2 focus:ring-white shadow-lg"
          />
          {localInput && (
            <button
              type="button"
              onClick={() => {
                setLocalInput('');
                if (query) router.replace('/search');
              }}
              className="absolute inset-y-0 right-3.5 flex items-center text-[#B3B3B3] hover:text-white"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Search Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setShowSuggestions(false)}
            />
            <div className="absolute left-0 right-0 top-13 z-40 mt-1.5 rounded-xl bg-[#282828] p-2 shadow-2xl border border-white/10 text-sm animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#B3B3B3] flex items-center gap-1.5">
                <Sparkles size={12} className="text-[#1DB954]" />
                <span>Suggestions</span>
              </div>
              {suggestions.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => handleSelectSearch(sug)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-white hover:bg-white/10 transition-colors"
                >
                  <Search size={14} className="text-[#B3B3B3] flex-shrink-0" />
                  <span className="truncate">{sug}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Filter Chips when query exists */}
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
                  ? 'bg-white text-black font-bold shadow'
                  : 'bg-white/10 text-white hover:bg-white/20'
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {/* When Empty: Recent Searches & Browse All Categories */}
      {!query && (
        <div className="space-y-8">
          {/* Recent Searches Pills */}
          {recentSearches.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History size={18} className="text-[#B3B3B3]" />
                  <h2 className="text-base sm:text-lg font-bold text-white">Recent Searches</h2>
                </div>
                <button
                  type="button"
                  onClick={clearAllRecent}
                  className="text-xs font-semibold text-[#B3B3B3] hover:text-white hover:underline transition-colors"
                >
                  Clear all
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <div
                    key={term}
                    className="group flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-white hover:bg-white/20 transition-all cursor-pointer"
                  >
                    <span onClick={() => handleSelectSearch(term)} className="truncate max-w-[200px]">
                      {term}
                    </span>
                    <button
                      type="button"
                      title="Remove search"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeRecentSearch(term);
                      }}
                      className="text-[#B3B3B3] hover:text-white rounded-full"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Browse all genre tiles */}
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
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="py-16 text-center text-[#B3B3B3]">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#1DB954] border-r-transparent" />
          <p className="mt-3 text-sm">Mencari katalog musik Fazura Music...</p>
        </div>
      )}

      {/* Results Loaded */}
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

          {/* Songs List with "Load more songs" Infinite Expansion */}
          {(filter === 'songs' || (filter === 'all' && results.tracks.length > 4)) && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold text-white">Songs</h2>
                <span className="text-xs text-[#B3B3B3]">
                  Showing {Math.min(visibleSongCount, results.tracks.length)} of {results.tracks.length}
                </span>
              </div>

              <TrackTable
                tracks={results.tracks.slice(filter === 'all' ? 4 : 0, visibleSongCount)}
                showAlbum={true}
              />

              {visibleSongCount < results.tracks.length && (
                <div className="flex justify-center pt-4">
                  <button
                    type="button"
                    onClick={() => setVisibleSongCount((prev) => prev + 15)}
                    className="flex items-center gap-2 rounded-full border border-white/20 px-6 py-2 text-xs sm:text-sm font-bold text-white hover:border-white hover:bg-white/10 transition-all hover:scale-105 active:scale-95"
                  >
                    <span>Load more songs</span>
                    <ChevronDown size={16} />
                  </button>
                </div>
              )}
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

          {/* Empty search fallback */}
          {results.tracks.length === 0 &&
            results.artists.length === 0 &&
            results.albums.length === 0 &&
            results.playlists.length === 0 && (
              <div className="py-20 text-center text-[#B3B3B3]">
                <h3 className="text-xl font-bold text-white mb-2">
                  No results found for &quot;{query}&quot;
                </h3>
                <p className="text-sm">
                  Please check your spelling or try different keywords or artist names.
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
