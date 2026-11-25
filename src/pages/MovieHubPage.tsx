import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Film, Star, Clock, Play, Bookmark, History, Trash2 } from 'lucide-react';
import { getMovies, getMovieGenres } from '../services/movieApi';
import type { Movie, MovieQueryParams } from '../types/movie';
import { useCategoryBookmarks, useCategoryHistory } from '../services/categoryStorage';
import { HubHistoryShelf } from '../components/library/HubHistoryShelf';
import { usePageMeta } from '../hooks/usePageMeta';
import { FilterBar } from '../components/common/FilterBar';
import { SectionHeader } from '../components/common/SectionHeader';
import { PaginationBar } from '../components/common/PaginationBar';
import { CardGridSkeleton, EmptyState, ErrorState } from '../components/common/StateViews';
import { MediaCard } from '../components/media/MediaCard';
import { Badge } from '../components/common/Badge';
import { buttonClasses, Button } from '../components/common/Button';
import { ConfirmModal } from '../components/ConfirmModal';
import { createPosterFallbackSvg } from '../utils/categoryTheme';

const COLLECTION_TABS = [
  { id: 'trending', label: 'Trending' },
  { id: 'popular', label: 'Populer' },
  { id: 'top_rated', label: 'Top Rated' },
  { id: 'now_playing', label: 'Rilis Terbaru' },
  { id: 'tv', label: 'Serial TV' },
  { id: 'bookmarks', label: 'Favorit' },
  { id: 'history', label: 'Riwayat' },
];

const SORT_OPTIONS = [
  { value: 'default', label: 'Urutan Default' },
  { value: 'rating_desc', label: 'Rating Tertinggi' },
  { value: 'date_desc', label: 'Rilis Terbaru' },
  { value: 'title_asc', label: 'Judul (A-Z)' },
  { value: 'date_asc', label: 'Rilis Terlama' },
];

export function MovieHubPage() {
  usePageMeta({
    title: 'Cinema & Movie Hub - Film Box Office & Serial TV HD',
    description:
      'Jelajahi film bioskop box office terbaru, top rated, dan serial TV internasional berkualitas HD di FazuraStream.',
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const activeCollection = searchParams.get('collection') || 'trending';
  const selectedGenre = searchParams.get('genre') || '';
  const minRatingParam = searchParams.get('minRating') || '';
  const activeSort = searchParams.get('sort') || 'default';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const qParam = searchParams.get('q') || '';

  const [searchInput, setSearchInput] = useState(qParam);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const { bookmarks } = useCategoryBookmarks('movies');
  const { history, clearHistory } = useCategoryHistory('movies');

  useEffect(() => {
    setSearchInput(qParam);
  }, [qParam]);

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ q: searchInput.trim() || undefined, page: 1 });
  };

  const queryParams: MovieQueryParams = {
    q: qParam || undefined,
    collection:
      activeCollection !== 'tv' && activeCollection !== 'bookmarks' && activeCollection !== 'history'
        ? activeCollection
        : activeCollection === 'tv'
        ? 'tv'
        : undefined,
    genre: selectedGenre || undefined,
    minRating: minRatingParam ? Number(minRatingParam) : undefined,
    sort: activeSort as any,
    page: currentPage,
    perPage: 24,
  };

  const isCatalogTab = activeCollection !== 'bookmarks' && activeCollection !== 'history';

  const {
    data: moviesData,
    isLoading: moviesLoading,
    isError: moviesError,
    refetch,
  } = useQuery({
    queryKey: ['movies', queryParams],
    queryFn: () => getMovies(queryParams),
    enabled: isCatalogTab,
  });

  const { data: genres = [] } = useQuery({
    queryKey: ['movieGenres'],
    queryFn: getMovieGenres,
  });

  const movies: Movie[] = moviesData?.data || [];
  const totalPages = moviesData?.totalPages || 1;
  const heroMovie: Movie | undefined = movies[0];

  const genreOptions = useMemo(
    () => genres.map((g) => ({ value: g, label: g })),
    [genres]
  );

  const tabsWithCounts = useMemo(
    () =>
      COLLECTION_TABS.map((t) =>
        t.id === 'bookmarks'
          ? { ...t, count: bookmarks.length }
          : t.id === 'history'
          ? { ...t, count: history.length }
          : t
      ),
    [bookmarks.length, history.length]
  );

  const handleResetFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  const heroFallback = useMemo(() => createPosterFallbackSvg('CINEMA', '#F0A15B'), []);

  return (
    <div className="min-h-screen bg-[#12141B] text-[#F2F0EC] pb-20">
      {/* 1. Wide Cinematic Movie Hero (~420px desktop, Warm Amber Accent) */}
      {!qParam && currentPage === 1 && isCatalogTab && (
        <section className="relative w-full h-[340px] sm:h-[420px] bg-[#0B0C10] border-b border-[#343744] overflow-hidden">
          {moviesLoading ? (
            <div className="w-full h-full skeleton-shimmer" />
          ) : heroMovie ? (
            <>
              <img
                src={heroMovie.backdropUrl || heroMovie.posterUrl || heroFallback}
                alt={heroMovie.title}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = heroFallback;
                }}
                className="absolute inset-0 w-full h-full object-cover object-center opacity-45"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C10] via-[#0B0C10]/65 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0B0C10] via-[#0B0C10]/85 to-transparent" />

              <div className="relative z-10 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-8 sm:pb-12">
                <div className="max-w-2xl space-y-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Badge variant="category" category="movies">
                      {heroMovie.mediaType === 'tv' ? 'Featured Serial TV' : 'Featured Movie'}
                    </Badge>
                    {heroMovie.ratingValue ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#F0A15B]">
                        <Star className="w-3.5 h-3.5 fill-[#F0A15B]" />
                        {heroMovie.ratingValue.toFixed(1)}
                      </span>
                    ) : null}
                    {heroMovie.releaseDate && (
                      <span className="text-xs text-[#A2A4B1]">
                        {new Date(heroMovie.releaseDate).getFullYear()}
                      </span>
                    )}
                    {heroMovie.duration && (
                      <span className="inline-flex items-center gap-1 text-xs text-[#A2A4B1]">
                        <Clock className="w-3.5 h-3.5" />
                        {heroMovie.duration}
                      </span>
                    )}
                  </div>

                  <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F2F0EC] tracking-tight leading-tight line-clamp-2">
                    {heroMovie.title}
                  </h1>

                  {heroMovie.description && (
                    <p className="text-sm text-[#A2A4B1] line-clamp-2 leading-relaxed max-w-xl">
                      {heroMovie.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <Link
                      to={`/movies/watch/${heroMovie.id}`}
                      className={buttonClasses({ variant: 'primary', size: 'lg' })}
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Tonton Sekarang</span>
                    </Link>
                    <Link
                      to={`/movies/${heroMovie.id}`}
                      className={buttonClasses({ variant: 'secondary', size: 'lg' })}
                    >
                      <span>Detail & Ulasan</span>
                    </Link>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </section>
      )}

      {/* 2. Main Catalog Container (Zero dev debug / localhost UI exposed publicly) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8 min-w-0">
        {(qParam || currentPage > 1 || !isCatalogTab) && (
          <div className="space-y-2 border-b border-[#343744]/60 pb-5">
            <Badge variant="category" category="movies">
              Movies & TV Series
            </Badge>
            <h1 className="font-heading text-3xl font-bold text-[#F2F0EC]">
              Katalog Film & Serial TV
            </h1>
            <p className="text-sm text-[#A2A4B1]">
              Streaming film box office dan serial TV populer kualitas HD.
            </p>
          </div>
        )}

        {/* Continue Watching Shelf */}
        {isCatalogTab && <HubHistoryShelf category="movies" />}

        {/* Unified Filter Bar */}
        <FilterBar
          category="movies"
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          onSearchSubmit={handleSearchSubmit}
          searchPlaceholder="Cari judul film atau serial..."
          tabs={tabsWithCounts}
          activeTab={activeCollection}
          onTabChange={(tabId) => updateParams({ collection: tabId, page: 1 })}
          genreOptions={genreOptions}
          selectedGenre={selectedGenre}
          onGenreChange={(g) => updateParams({ genre: g || undefined, page: 1 })}
          genreLabel="Semua Genre"
          sortOptions={SORT_OPTIONS}
          selectedSort={activeSort}
          onSortChange={(val) => updateParams({ sort: val, page: 1 })}
          extraControl={
            <select
              aria-label="Filter Minimal Rating"
              value={minRatingParam}
              onChange={(e) => updateParams({ minRating: e.target.value || undefined, page: 1 })}
              className="w-full sm:w-auto h-10 px-3 rounded-[10px] bg-[#12141B] border border-[#343744] hover:border-[#454958] focus:border-[#F0A15B] text-[13px] font-medium text-[#F2F0EC] focus:outline-none cursor-pointer"
            >
              <option value="">Semua Rating</option>
              <option value="7">★ 7.0+</option>
              <option value="8">★ 8.0+</option>
              <option value="9">★ 9.0+</option>
            </select>
          }
          hasActiveFilters={Boolean(
            qParam || selectedGenre || minRatingParam || activeSort !== 'default'
          )}
          onResetFilters={handleResetFilters}
        />

        {/* Views */}
        {activeCollection === 'bookmarks' ? (
          <div className="space-y-4">
            <SectionHeader
              category="movies"
              title={`Film & Serial Favorit (${bookmarks.length})`}
              subtitle="Koleksi film dan serial yang Anda simpan"
            />
            {bookmarks.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {bookmarks.map((b) => (
                  <MediaCard
                    key={b.id}
                    id={b.id}
                    category="movies"
                    title={b.title}
                    imageUrl={b.cover}
                    link={b.link}
                    topBadge={b.type || 'Movie'}
                    metaPrimary={b.subtitle || 'Favorit'}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Bookmark className="w-5 h-5" />}
                title="Belum Ada Film Favorit"
                description="Simpan film atau serial favorit Anda dari halaman detail untuk ditonton nanti."
                actionLabel="Jelajahi Trending"
                onAction={() => updateParams({ collection: 'trending', page: 1 })}
              />
            )}
          </div>
        ) : activeCollection === 'history' ? (
          <div className="space-y-4">
            <SectionHeader
              category="movies"
              title={`Riwayat Nonton Film & Serial (${history.length})`}
              subtitle="Daftar tayangan terakhir yang Anda buka"
              rightSlot={
                history.length > 0 ? (
                  <Button variant="danger" size="sm" onClick={() => setConfirmClearOpen(true)}>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Semua</span>
                  </Button>
                ) : undefined
              }
            />
            {history.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {history.map((h) => (
                  <MediaCard
                    key={h.id}
                    id={h.id}
                    category="movies"
                    title={h.title}
                    imageUrl={h.cover}
                    link={h.lastItemLink || `/movies/${h.id}`}
                    topBadge={h.lastItemTitle}
                    metaPrimary={h.lastItemTitle || 'Lanjut Tonton'}
                    metaSecondary={new Date(h.watchedAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<History className="w-5 h-5" />}
                title="Belum Ada Riwayat Nonton"
                description="Film dan serial yang Anda putar akan tercatat di sini."
                actionLabel="Mulai Menonton"
                onAction={() => updateParams({ collection: 'trending', page: 1 })}
              />
            )}
          </div>
        ) : (
          <div className="space-y-5">
            <SectionHeader
              category="movies"
              title={
                qParam
                  ? `Hasil Pencarian: "${qParam}"`
                  : selectedGenre
                  ? `Film Genre ${selectedGenre}`
                  : COLLECTION_TABS.find((t) => t.id === activeCollection)?.label || 'Katalog Film'
              }
              rightSlot={
                totalPages > 1 ? (
                  <span className="text-xs text-[#A2A4B1]">
                    Halaman {currentPage} dari {totalPages}
                  </span>
                ) : undefined
              }
            />

            {moviesLoading ? (
              <CardGridSkeleton count={18} />
            ) : moviesError ? (
              <ErrorState
                title="Gagal Memuat Katalog Film"
                description="Terjadi kendala saat mengambil daftar film. Silakan coba muat ulang."
                onRetry={() => refetch()}
              />
            ) : movies.length === 0 ? (
              <EmptyState
                icon={<Film className="w-5 h-5" />}
                title="Tidak Ada Film Ditemukan"
                description="Coba kata kunci pencarian lain atau reset filter yang aktif."
                actionLabel="Reset Filter"
                onAction={handleResetFilters}
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {movies.map((movie) => {
                  const year = movie.releaseDate
                    ? String(new Date(movie.releaseDate).getFullYear())
                    : undefined;
                  const metaLine = [
                    movie.genres?.[0] || (movie.mediaType === 'tv' ? 'Serial TV' : 'Film'),
                    movie.duration || undefined,
                  ]
                    .filter(Boolean)
                    .join(' • ');

                  return (
                    <MediaCard
                      key={movie.id}
                      id={movie.id}
                      category="movies"
                      title={movie.title}
                      imageUrl={movie.posterUrl || ''}
                      link={`/movies/${movie.id}`}
                      topBadge={movie.mediaType === 'tv' ? 'Series' : undefined}
                      rating={movie.ratingValue}
                      metaPrimary={metaLine}
                      metaSecondary={year}
                      bookmarkType={movie.mediaType === 'tv' ? 'Serial TV' : 'Movie'}
                    />
                  );
                })}
              </div>
            )}

            <PaginationBar
              currentPage={currentPage}
              totalPages={totalPages}
              isLoading={moviesLoading}
              onPageChange={(p) => {
                updateParams({ page: p });
                window.scrollTo({ top: 320, behavior: 'smooth' });
              }}
            />
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmClearOpen}
        title="Hapus Semua Riwayat Film?"
        message="Seluruh riwayat tontonan film & serial lokal akan dihapus."
        confirmLabel="Hapus Semua"
        variant="danger"
        onConfirm={() => {
          clearHistory();
          setConfirmClearOpen(false);
        }}
        onCancel={() => setConfirmClearOpen(false)}
      />
    </div>
  );
}
