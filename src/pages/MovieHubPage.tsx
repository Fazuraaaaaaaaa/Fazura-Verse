import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Film,
  Tv,
  Star,
  Search,
  SlidersHorizontal,
  Flame,
  TrendingUp,
  Sparkles,
  Calendar,
  Clock,
  Play,
  RotateCcw,
  CheckCircle2,
  Server,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Layers,
  Bookmark,
  History,
  Trash2,
  Heart,
} from 'lucide-react';
import {
  getMovies,
  getMovieGenres,
  getMovieApiBaseUrl,
  setMovieApiBaseUrl,
  PRODUCTION_API_URL,
  LOCAL_API_URL,
} from '../services/movieApi';
import type { Movie, MovieQueryParams } from '../types/movie';
import { useCategoryBookmarks, useCategoryHistory } from '../services/categoryStorage';
import { HubHistoryShelf } from '../components/library/HubHistoryShelf';

const COLLECTION_TABS = [
  { id: 'trending', label: 'Trending', icon: Flame },
  { id: 'popular', label: 'Populer', icon: TrendingUp },
  { id: 'top_rated', label: 'Rating Tertinggi', icon: Star },
  { id: 'now_playing', label: 'Sedang Tayang', icon: Film },
  { id: 'upcoming', label: 'Segera Hadir', icon: Calendar },
  { id: 'tv', label: 'Serial TV & Drama', icon: Tv },
  { id: 'bookmarks', label: 'Favorit Saya', icon: Bookmark },
  { id: 'history', label: 'Riwayat Nonton', icon: History },
];

const SORT_OPTIONS = [
  { value: 'default', label: 'Urutan Default' },
  { value: 'rating_desc', label: 'Rating Tertinggi' },
  { value: 'date_desc', label: 'Rilis Terbaru' },
  { value: 'title_asc', label: 'Judul (A-Z)' },
  { value: 'date_asc', label: 'Rilis Terlama' },
];

export function MovieHubPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // State from URL params or defaults
  const activeCollection = searchParams.get('collection') || 'trending';
  const selectedGenre = searchParams.get('genre') || '';
  const minRatingParam = searchParams.get('minRating');
  const activeSort = searchParams.get('sort') || 'default';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const qParam = searchParams.get('q') || '';

  const [searchInput, setSearchInput] = useState(qParam);
  const [currentBaseUrl, setCurrentBaseUrl] = useState(getMovieApiBaseUrl());
  const [showConfigModal, setShowConfigModal] = useState(false);

  const { bookmarks, removeBookmark } = useCategoryBookmarks('movies');
  const { history, clearHistory, removeHistoryItem } = useCategoryHistory('movies');

  // Sync search input with URL qParam
  useEffect(() => {
    setSearchInput(qParam);
  }, [qParam]);

  // Update URL helper
  const updateParams = (updates: Record<string, string | number | undefined>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (val === undefined || val === '' || val === 0) {
        next.delete(key);
      } else {
        next.set(key, String(val));
      }
    });
    setSearchParams(next);
  };

  // Debounced search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ q: searchInput.trim(), page: 1 });
  };

  // Queries
  const queryParams: MovieQueryParams = {
    q: qParam || undefined,
    collection: activeCollection !== 'tv' ? activeCollection : undefined,
    genre: selectedGenre || undefined,
    minRating: minRatingParam ? Number(minRatingParam) : undefined,
    sort: activeSort as any,
    page: currentPage,
    perPage: 24,
  };

  const {
    data: moviesData,
    isLoading: moviesLoading,
    isError: moviesError,
    refetch,
  } = useQuery({
    queryKey: ['movies', queryParams, currentBaseUrl],
    queryFn: () => getMovies(queryParams),
  });

  const { data: genres = [] } = useQuery({
    queryKey: ['movieGenres', currentBaseUrl],
    queryFn: getMovieGenres,
  });

  const movies = moviesData?.data || [];
  const totalPages = moviesData?.totalPages || 1;
  const totalItems = moviesData?.total || movies.length;

  // Hero featured item (top trending or first result)
  const heroMovie: Movie | undefined = movies[0];

  const handleSwitchApi = (url: string) => {
    setMovieApiBaseUrl(url);
    setCurrentBaseUrl(url);
    setShowConfigModal(false);
    refetch();
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* API Source Switcher Pill */}
      <div className="bg-surface/90 border-b border-white/5 py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-400">Movie & Cinema API:</span>
            <code className="px-2 py-0.5 rounded bg-card text-emerald-400 font-mono text-[11px] border border-white/10">
              {currentBaseUrl}
            </code>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSwitchApi(PRODUCTION_API_URL)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                currentBaseUrl === PRODUCTION_API_URL
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-card text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              Production (fazuradex.web.id)
            </button>
            <button
              onClick={() => handleSwitchApi(LOCAL_API_URL)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                currentBaseUrl === LOCAL_API_URL
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-card text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              Local (localhost:4000)
            </button>
          </div>
        </div>
      </div>

      {/* Hero Showcase (when on page 1 and no search query) */}
      {!qParam && currentPage === 1 && heroMovie && (
        <div className="relative w-full h-[380px] sm:h-[460px] lg:h-[500px] overflow-hidden bg-slate-950 border-b border-white/10">
          {/* Backdrop Image */}
          <div className="absolute inset-0">
            <img
              src={heroMovie.backdropUrl || heroMovie.posterUrl}
              alt={heroMovie.title}
              className="w-full h-full object-cover object-center opacity-40 scale-105 filter blur-[1px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
          </div>

          <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-10 sm:pb-14">
            <div className="max-w-2xl space-y-3.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" />
                  Featured {heroMovie.mediaType === 'tv' ? 'Serial TV' : 'Movie'}
                </span>
                {heroMovie.ratingValue && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {heroMovie.ratingValue.toFixed(1)}
                  </span>
                )}
                {heroMovie.releaseDate && (
                  <span className="text-xs text-slate-400 font-semibold">
                    {new Date(heroMovie.releaseDate).getFullYear()}
                  </span>
                )}
                {heroMovie.duration && (
                  <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {heroMovie.duration}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                {heroMovie.title}
              </h1>

              {heroMovie.description && (
                <p className="text-sm sm:text-base text-slate-300 line-clamp-2 leading-relaxed">
                  {heroMovie.description}
                </p>
              )}

              {heroMovie.genres && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {heroMovie.genres.map((g) => (
                    <span
                      key={g}
                      className="px-2.5 py-0.5 rounded-full bg-white/10 text-slate-200 text-xs font-medium backdrop-blur-sm"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to={`/movies/watch/${heroMovie.id}`}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-sm shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Tonton Sekarang
                </Link>
                <Link
                  to={`/movies/${heroMovie.id}`}
                  className="px-5 py-2.5 rounded-xl bg-card hover:bg-slate-800 text-white font-bold text-sm border border-white/10 flex items-center gap-2 transition-all"
                >
                  Detail & Ulasan
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Hub Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Hub Header & Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <Film className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Movie & TV Series Hub
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Streaming film box office, serial TV internasional, dan tayangan bioskop terbaru dengan server berkecepatan tinggi.
            </p>
          </div>

          {/* Live Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari film, serial, aktor, TMDB..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-20 py-2 text-xs sm:text-sm bg-card hover:bg-slate-900 focus:bg-surface border border-white/10 focus:border-rose-500 rounded-xl text-white placeholder-slate-400 focus:outline-none transition-all"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Cari
            </button>
          </form>
        </div>

        {/* Hub History Shelf */}
        <HubHistoryShelf category="movies" />

        {/* Collection Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {COLLECTION_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeCollection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  updateParams({ collection: tab.id, page: 1 });
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 transition-all ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25 border border-rose-500'
                    : 'bg-card text-slate-300 hover:text-white hover:bg-slate-800 border border-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-rose-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Genre Chips Bar */}
        {genres.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => updateParams({ genre: undefined, page: 1 })}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                !selectedGenre
                  ? 'bg-white/20 text-white font-bold border border-white/30'
                  : 'bg-card/70 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              Semua Genre
            </button>
            {genres.map((g) => {
              const isSelected = selectedGenre.toLowerCase() === g.toLowerCase();
              return (
                <button
                  key={g}
                  onClick={() => updateParams({ genre: isSelected ? undefined : g, page: 1 })}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                    isSelected
                      ? 'bg-rose-500 text-white font-bold shadow-sm'
                      : 'bg-card/70 text-slate-400 hover:text-white hover:bg-card border border-white/5'
                  }`}
                >
                  {g}
                </button>
              );
            })}
          </div>
        )}

        {/* Filter and Sort Sub-bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-card/60 p-3 rounded-2xl border border-white/5">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-rose-400" />
              Filter Rating:
            </span>
            <div className="flex items-center gap-1.5">
              {[undefined, 7, 8, 9].map((r) => {
                const isSelected = r ? minRatingParam === String(r) : !minRatingParam;
                return (
                  <button
                    key={r || 'all'}
                    onClick={() => updateParams({ minRating: r, page: 1 })}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-rose-500 text-white'
                        : 'bg-surface text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {r ? `★ ${r}+` : 'Semua'}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Urutkan:</span>
            <select
              value={activeSort}
              onChange={(e) => updateParams({ sort: e.target.value, page: 1 })}
              className="bg-surface text-xs font-semibold text-white px-3 py-1.5 rounded-xl border border-white/10 focus:outline-none focus:border-rose-500 cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Display */}
        {(qParam || selectedGenre || minRatingParam || activeSort !== 'default') && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400">Filter Aktif:</span>
            {qParam && (
              <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                Pencarian: "{qParam}"
                <button
                  onClick={() => updateParams({ q: undefined, page: 1 })}
                  className="hover:text-white"
                >
                  ×
                </button>
              </span>
            )}
            {selectedGenre && (
              <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                Genre: {selectedGenre}
                <button
                  onClick={() => updateParams({ genre: undefined, page: 1 })}
                  className="hover:text-white"
                >
                  ×
                </button>
              </span>
            )}
            {minRatingParam && (
              <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                Min Rating: ★ {minRatingParam}+
                <button
                  onClick={() => updateParams({ minRating: undefined, page: 1 })}
                  className="hover:text-white"
                >
                  ×
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchInput('');
                setSearchParams(new URLSearchParams());
              }}
              className="text-xs text-rose-400 hover:text-rose-300 underline ml-2"
            >
              Reset Semua Filter
            </button>
          </div>
        )}

        {/* Total Results Summary */}
        <div className="flex items-center justify-between text-xs text-slate-400 border-b border-white/5 pb-2">
          <span>
            Menampilkan <strong className="text-white">{movies.length}</strong> judul di halaman ini
            {totalItems > 0 && (
              <> • Total katalog: <strong className="text-rose-400">{totalItems.toLocaleString()}+</strong> film & serial ({totalPages} halaman)</>
            )}
          </span>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Halaman {currentPage} dari {totalPages}
          </span>
        </div>

        {/* Movies Grid */}
        {activeCollection === 'bookmarks' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-rose-500 fill-rose-500" />
                  Film & Serial Favorit Saya ({bookmarks.length})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Daftar film dan serial yang Anda simpan di koleksi bioskop FAZURAVERSE.
                </p>
              </div>
            </div>

            {bookmarks.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {bookmarks.map((b) => (
                  <div key={b.id} className="relative group rounded-xl overflow-hidden bg-[#111622] border border-white/5 hover:border-rose-500/40 transition-all flex flex-col justify-between">
                    <Link to={b.link} className="block relative aspect-[2/3] overflow-hidden bg-slate-900">
                      <img
                        src={b.cover}
                        alt={b.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <span className="absolute bottom-2 left-2 text-[10px] px-2 py-0.5 rounded bg-rose-600 text-white font-bold">
                        {b.type || 'Movie'}
                      </span>
                    </Link>

                    <div className="p-3 space-y-1.5">
                      <Link to={b.link} className="text-xs font-bold text-white hover:text-rose-400 line-clamp-2 block">
                        {b.title}
                      </Link>
                      {b.subtitle && (
                        <p className="text-[10px] text-slate-400 truncate">{b.subtitle}</p>
                      )}
                      <div className="pt-2 flex items-center justify-between border-t border-white/5">
                        <Link
                          to={b.link}
                          className="text-[11px] font-bold text-rose-400 hover:underline flex items-center gap-1"
                        >
                          <Play className="w-3 h-3 fill-current" /> Tonton
                        </Link>
                        <button
                          onClick={() => removeBookmark(b.id)}
                          title="Hapus dari Favorit"
                          className="p-1 rounded text-slate-400 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center bg-[#111622] rounded-2xl border border-white/5 space-y-3 p-6">
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                  <Bookmark className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white">Belum Ada Film Favorit</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Buka detail film bioskop dan klik tombol Bookmark untuk menambahkannya ke koleksi ini.
                </p>
                <button
                  onClick={() => updateParams({ collection: 'trending', page: 1 })}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs"
                >
                  Jelajahi Film Trending
                </button>
              </div>
            )}
          </div>
        ) : activeCollection === 'history' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-400" />
                  Riwayat Nonton Film & Serial ({history.length})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Daftar film dan serial yang terakhir Anda tonton di FAZURAVERSE.
                </p>
              </div>

              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 text-xs font-semibold text-slate-400 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Hapus Semua Riwayat
                </button>
              )}
            </div>

            {history.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {history.map((h, idx) => (
                  <div key={`${h.id}-${idx}`} className="relative group rounded-xl overflow-hidden bg-[#111622] border border-white/5 hover:border-indigo-500/40 transition-all flex flex-col justify-between">
                    <Link to={h.lastItemLink || `/movies/${h.id}`} className="block relative aspect-[2/3] overflow-hidden bg-slate-900">
                      <img
                        src={h.cover}
                        alt={h.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      {h.lastItemTitle && (
                        <span className="absolute bottom-2 left-2 text-[10px] px-2 py-0.5 rounded bg-indigo-500 text-white font-bold truncate max-w-[85%]">
                          {h.lastItemTitle}
                        </span>
                      )}
                    </Link>

                    <div className="p-3 space-y-1.5">
                      <Link to={h.lastItemLink || `/movies/${h.id}`} className="text-xs font-bold text-white hover:text-indigo-400 line-clamp-2 block">
                        {h.title}
                      </Link>
                      <p className="text-[10px] text-slate-400">
                        Terakhir tonton: {new Date(h.watchedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </p>
                      <div className="pt-2 flex items-center justify-between border-t border-white/5">
                        <Link
                          to={h.lastItemLink || `/movies/${h.id}`}
                          className="text-[11px] font-bold text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          <Play className="w-3 h-3 fill-current" /> Lanjut Nonton
                        </Link>
                        <button
                          onClick={() => removeHistoryItem(h.id)}
                          title="Hapus item riwayat"
                          className="p-1 rounded text-slate-400 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center bg-[#111622] rounded-2xl border border-white/5 space-y-3 p-6">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                  <History className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white">Belum Ada Riwayat Nonton Film</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Film yang Anda tonton akan secara otomatis tersimpan di sini.
                </p>
                <button
                  onClick={() => updateParams({ collection: 'trending', page: 1 })}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs"
                >
                  Mulai Nonton Film
                </button>
              </div>
            )}
          </div>
        ) : moviesLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 py-8">
            {Array.from({ length: 12 }).map((_, idx) => (
              <div
                key={idx}
                className="aspect-[2/3] rounded-2xl bg-card animate-pulse border border-white/5"
              />
            ))}
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-20 bg-card/40 rounded-3xl border border-white/5 p-8">
            <Film className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">Tidak Ada Film Ditemukan</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
              Coba gunakan kata kunci lain atau ubah filter kategori dan genre.
            </p>
            <button
              onClick={() => setSearchParams(new URLSearchParams())}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
            >
              Tampilkan Semua Film
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
            {movies.map((movie) => (
              <MovieCardItem key={movie.id} movie={movie} />
            ))}
          </div>
        )}

        {/* Numbered Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 pb-4">
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-1">
              {/* Prev Button */}
              <button
                onClick={() => updateParams({ page: Math.max(1, currentPage - 1) })}
                disabled={currentPage <= 1}
                className="p-2 rounded-xl bg-card hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none text-white border border-white/5"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* First Page */}
              {currentPage > 3 && (
                <>
                  <button
                    onClick={() => updateParams({ page: 1 })}
                    className="w-9 h-9 rounded-xl text-xs font-bold bg-card hover:bg-slate-800 text-slate-300 border border-white/5"
                  >
                    1
                  </button>
                  {currentPage > 4 && <span className="px-1 text-slate-500">...</span>}
                </>
              )}

              {/* Numbered buttons window around current */}
              {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === totalPages ||
                    (p >= currentPage - 2 && p <= currentPage + 2)
                )
                .filter((p) => {
                  if (currentPage > 3 && p === 1) return false;
                  if (currentPage < totalPages - 2 && p === totalPages) return false;
                  return true;
                })
                .map((p) => {
                  const isActive = p === currentPage;
                  return (
                    <button
                      key={p}
                      onClick={() => updateParams({ page: p })}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                          : 'bg-card hover:bg-slate-800 text-slate-300 border border-white/5'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}

              {/* Last Page */}
              {currentPage < totalPages - 2 && (
                <>
                  {currentPage < totalPages - 3 && <span className="px-1 text-slate-500">...</span>}
                  <button
                    onClick={() => updateParams({ page: totalPages })}
                    className="w-9 h-9 rounded-xl text-xs font-bold bg-card hover:bg-slate-800 text-slate-300 border border-white/5"
                  >
                    {totalPages}
                  </button>
                </>
              )}

              {/* Next Button */}
              <button
                onClick={() => updateParams({ page: Math.min(totalPages, currentPage + 1) })}
                disabled={currentPage >= totalPages}
                className="p-2 rounded-xl bg-card hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none text-white border border-white/5"
                title="Halaman Selanjutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Page Jump */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const target = (e.currentTarget.elements.namedItem('jumpPage') as HTMLInputElement)?.value;
                const p = parseInt(target, 10);
                if (p >= 1 && p <= totalPages) {
                  updateParams({ page: p });
                }
              }}
              className="flex items-center gap-2 text-xs text-slate-400"
            >
              <span>Lompat:</span>
              <input
                type="number"
                name="jumpPage"
                min={1}
                max={totalPages}
                defaultValue={currentPage}
                className="w-14 px-2 py-1 bg-card border border-white/10 rounded-lg text-white text-center focus:outline-none focus:border-rose-500 text-xs"
              />
              <button
                type="submit"
                className="px-2.5 py-1 bg-surface hover:bg-slate-800 border border-white/10 rounded-lg text-white font-semibold text-xs"
              >
                Ke
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function MovieCardItem({ movie }: { movie: Movie }) {
  const isTv = movie.mediaType === 'tv';

  return (
    <div className="group relative rounded-2xl overflow-hidden bg-card border border-white/5 hover:border-rose-500/50 transition-all duration-300 flex flex-col hover:shadow-xl hover:shadow-rose-950/30 hover:-translate-y-1">
      <Link to={`/movies/${movie.id}`} className="relative aspect-[2/3] overflow-hidden bg-slate-900">
        <img
          src={movie.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500'}
          alt={movie.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Media Type Badge */}
        <div className="absolute top-2.5 left-2.5">
          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider backdrop-blur-md ${
              isTv
                ? 'bg-indigo-600/80 text-white border border-indigo-400/30'
                : 'bg-rose-600/80 text-white border border-rose-400/30'
            }`}
          >
            {isTv ? 'Series' : 'Movie'}
          </span>
        </div>

        {/* Rating Badge */}
        {movie.ratingValue && (
          <div className="absolute top-2.5 right-2.5">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-bold text-amber-400">
              <Star className="w-3 h-3 fill-amber-400" />
              {movie.ratingValue.toFixed(1)}
            </span>
          </div>
        )}

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-3">
          <Link
            to={`/movies/watch/${movie.id}`}
            onClick={(e) => e.stopPropagation()}
            className="w-12 h-12 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 transform scale-75 group-hover:scale-100 transition-all"
            title="Tonton Langsung"
          >
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </Link>
        </div>
      </Link>

      {/* Info Card Content */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          <Link
            to={`/movies/${movie.id}`}
            className="font-bold text-xs sm:text-sm text-white hover:text-rose-400 line-clamp-1 transition-colors"
            title={movie.title}
          >
            {movie.title}
          </Link>
          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
            {movie.releaseDate && (
              <span>{new Date(movie.releaseDate).getFullYear()}</span>
            )}
            {movie.duration && (
              <>
                <span>•</span>
                <span>{movie.duration}</span>
              </>
            )}
          </div>
        </div>

        {movie.genres && movie.genres.length > 0 && (
          <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-1 overflow-hidden">
            <span className="text-[10px] text-slate-400 truncate">
              {movie.genres.slice(0, 2).join(', ')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
