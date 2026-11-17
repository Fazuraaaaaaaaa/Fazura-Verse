import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Film,
  CheckCircle,
  Clock,
  Search,
  Star,
  Play,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Tag,
  Loader2,
  Sparkles,
} from 'lucide-react';
import {
  getOtakudesuOngoing,
  getOtakudesuCompleted,
  getOtakudesuSchedule,
  getOtakudesuGenres,
  getOtakudesuByGenre,
  searchOtakudesu,
} from '../services/animeApi';
import type { AnimeItem, AnimeScheduleDay } from '../types/media';

type TabType = 'ongoing' | 'completed' | 'genres' | 'schedule';

export function AnimeHubPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParam = searchParams.get('search') || '';
  const tabParam = (searchParams.get('tab') as TabType) || 'ongoing';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const genreParam = searchParams.get('genre') || '';

  const provider = 'otakudesu';
  const [activeTab, setActiveTab] = useState<TabType>(
    tabParam === 'schedule' || tabParam === 'completed' || tabParam === 'genres' ? tabParam : 'ongoing'
  );
  const [page, setPage] = useState<number>(pageParam || 1);
  const [selectedGenre, setSelectedGenre] = useState<string>(genreParam);
  const [selectedDay, setSelectedDay] = useState<string>('Senin');
  const [searchInput, setSearchInput] = useState(searchParam);

  // Sync state with search params
  useEffect(() => {
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
    if (pageParam && pageParam !== page) {
      setPage(pageParam);
    }
    if (genreParam !== selectedGenre) {
      setSelectedGenre(genreParam);
    }
  }, [tabParam, pageParam, genreParam]);

  // Query: 36 Otakudesu Genres List
  const { data: genresList } = useQuery({
    queryKey: ['anime', 'genres-list', 'otakudesu'],
    queryFn: getOtakudesuGenres,
    staleTime: 1000 * 60 * 60,
  });

  // Query: Search Results (Otakudesu)
  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['anime', 'search', 'otakudesu', searchParam],
    queryFn: () => searchOtakudesu(searchParam),
    enabled: Boolean(searchParam && searchParam.trim().length > 0),
  });

  // Query: Ongoing Anime (Otakudesu - 6 pages)
  const { data: ongoingData, isLoading: ongoingLoading } = useQuery({
    queryKey: ['anime', 'ongoing', 'otakudesu', page],
    queryFn: () => getOtakudesuOngoing(page),
    enabled: activeTab === 'ongoing' && !searchParam,
  });

  // Query: Completed Anime (Otakudesu - 67+ pages / ~1,675 judul)
  const { data: completedData, isLoading: completedLoading } = useQuery({
    queryKey: ['anime', 'completed', 'otakudesu', page],
    queryFn: () => getOtakudesuCompleted(page),
    enabled: activeTab === 'completed' && !searchParam,
  });

  // Query: Genre Filter (Otakudesu - up to 48+ pages per genre)
  const { data: genreData, isLoading: genreLoading } = useQuery({
    queryKey: ['anime', 'genre', selectedGenre, page],
    queryFn: () => getOtakudesuByGenre(selectedGenre, page),
    enabled: activeTab === 'genres' && Boolean(selectedGenre) && !searchParam,
  });

  // Query: Schedule (Otakudesu)
  const { data: scheduleData, isLoading: scheduleLoading } = useQuery({
    queryKey: ['anime', 'schedule', 'otakudesu'],
    queryFn: getOtakudesuSchedule,
    enabled: activeTab === 'schedule' && !searchParam,
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setSearchParams({ search: searchInput.trim() });
  };

  const handleTabChange = (newTab: TabType) => {
    setActiveTab(newTab);
    setPage(1);
    if (newTab !== 'genres') {
      setSelectedGenre('');
      setSearchParams({ tab: newTab });
    } else {
      const p: any = { tab: 'genres' };
      if (selectedGenre) p.genre = selectedGenre;
      setSearchParams(p);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 350, behavior: 'smooth' });
    const currentParams: any = { tab: activeTab, page: String(newPage) };
    if (selectedGenre) currentParams.genre = selectedGenre;
    setSearchParams(currentParams);
  };

  const handleGenreSelect = (genreId: string) => {
    setSelectedGenre(genreId);
    setActiveTab('genres');
    setPage(1);
    setSearchParams({ tab: 'genres', genre: genreId });
  };

  // Determine active dataset and pagination
  let activeAnimeList: AnimeItem[] = [];
  let currentPagination = {
    currentPage: 1,
    totalPages: 1,
    hasPrevPage: false,
    hasNextPage: false,
  };
  let isLoading = false;

  if (activeTab === 'ongoing') {
    activeAnimeList = ongoingData?.animeList || [];
    currentPagination = ongoingData?.pagination || currentPagination;
    isLoading = ongoingLoading;
  } else if (activeTab === 'completed') {
    activeAnimeList = completedData?.animeList || [];
    currentPagination = completedData?.pagination || currentPagination;
    isLoading = completedLoading;
  } else if (activeTab === 'genres') {
    activeAnimeList = genreData?.animeList || [];
    currentPagination = genreData?.pagination || currentPagination;
    isLoading = genreLoading;
  }

  const topGenreChips = [
    'action',
    'adventure',
    'comedy',
    'fantasy',
    'isekai',
    'romance',
    'sci-fi',
    'shounen',
    'supernatural',
    'magic',
    'mystery',
    'slice-of-life',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Anime Hub Banner & Search */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#111622] via-[#141b2a] to-[#111622] border border-white/10 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider border border-amber-500/30">
              <Film className="w-3.5 h-3.5" />
              Katalog Lengkap Ribuan Judul Anime
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              FAZURAVERSE <span className="text-amber-400">ANIME</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Koleksi lengkap ribuan anime Ongoing, Tamat (67 halaman), dan 36 kategori genre dari Otakudesu. Streaming multi-server dengan kualitas 1080p Full HD (Mega 1080p), 720p HD, 480p SD, dan 360p Blogspot.
            </p>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-2xl bg-[#0b0e14] border border-white/10 shadow-lg shrink-0">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 text-black shadow-md shadow-amber-500/30">
              <Sparkles className="w-4 h-4" />
              Otakudesu Provider
            </div>
          </div>
        </div>

        {/* Search Bar inside Hub */}
        <form onSubmit={handleSearchSubmit} className="mt-6 max-w-xl">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari judul anime di Otakudesu (e.g. Bleach, Naruto, Jujutsu, Frieren)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-24 py-3 text-xs sm:text-sm bg-[#0b0e14] border border-white/10 focus:border-amber-500 rounded-xl text-white placeholder-slate-400 focus:outline-none shadow-inner"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-lg bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition-colors shadow"
            >
              Cari
            </button>
          </div>
        </form>
      </div>

      {/* 2. Quick Genre Filter Chips */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-amber-400" />
            Filter Cepat Berdasarkan Genre
          </span>
          <button
            onClick={() => handleTabChange('genres')}
            className="text-amber-400 hover:underline capitalize"
          >
            Lihat Semua 36 Genre →
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => handleTabChange('ongoing')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              activeTab !== 'genres'
                ? 'bg-amber-500 text-black border-amber-400'
                : 'bg-[#111622] hover:bg-slate-800 text-slate-300 border-white/5'
            }`}
          >
            Semua Anime
          </button>

          {topGenreChips.map((chip) => {
            const isSelected = activeTab === 'genres' && selectedGenre.toLowerCase() === chip.toLowerCase();
            return (
              <button
                key={chip}
                onClick={() => handleGenreSelect(chip)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap capitalize transition-all border ${
                  isSelected
                    ? 'bg-amber-500 text-black font-bold border-amber-400 shadow-md shadow-amber-500/20'
                    : 'bg-[#111622] hover:bg-slate-800 text-slate-300 border-white/5'
                }`}
              >
                {chip.replace(/-/g, ' ')}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Navigation Tabs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs sm:text-sm font-bold">
          <button
            onClick={() => handleTabChange('ongoing')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'ongoing' && !searchParam
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Clock className="w-4 h-4" />
            Sedang Tayang (Ongoing)
          </button>

          <button
            onClick={() => handleTabChange('completed')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'completed' && !searchParam
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Tamat (67 Hal / ~1.670+ Judul)
          </button>

          <button
            onClick={() => handleTabChange('genres')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'genres' && !searchParam
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Tag className="w-4 h-4" />
            Katalog 36 Genre
          </button>

          <button
            onClick={() => handleTabChange('schedule')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'schedule' && !searchParam
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Jadwal Rilis Mingguan
          </button>
        </div>

        {searchParam && (
          <button
            onClick={() => {
              setSearchInput('');
              setSearchParams({ tab: activeTab });
            }}
            className="text-xs font-semibold text-rose-400 hover:underline shrink-0"
          >
            Hapus Pencarian
          </button>
        )}
      </div>

      {/* 4. CONTENT SECTIONS */}
      {searchParam ? (
        /* SECTION A: Search Results Active */
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Hasil Pencarian: "<span className="text-amber-400">{searchParam}</span>" di Otakudesu
          </h2>

          {searchLoading ? (
            <div className="py-20 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
              <p className="text-sm text-slate-400">Mencari anime di Otakudesu...</p>
            </div>
          ) : searchResults && searchResults.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {searchResults.map((anime) => (
                <AnimeGridCard key={anime.id} anime={anime} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center space-y-2">
              <Search className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">Tidak Ada Anime Ditemukan</h3>
              <p className="text-xs text-slate-400">
                Judul "{searchParam}" tidak ditemukan di database Otakudesu. Coba kata kunci lain.
              </p>
            </div>
          )}
        </div>
      ) : activeTab === 'schedule' ? (
        /* SECTION B: Schedule View (Senin - Minggu) */
        <div className="space-y-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  selectedDay.toLowerCase() === day.toLowerCase()
                    ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20'
                    : 'bg-[#111622] hover:bg-slate-800 text-slate-300 border-white/5'
                }`}
              >
                Hari {day}
              </button>
            ))}
          </div>

          {scheduleLoading ? (
            <div className="py-20 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
              <p className="text-sm text-slate-400">Memuat jadwal rilis anime...</p>
            </div>
          ) : (
            (() => {
              const currentDayObj = (scheduleData || []).find(
                (d) => d.day.toLowerCase() === selectedDay.toLowerCase()
              );
              const list = currentDayObj?.animeList || [];

              if (list.length === 0) {
                return (
                  <div className="py-16 text-center text-sm text-slate-400">
                    Tidak ada jadwal tayang anime untuk hari {selectedDay}.
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {list.map((anime) => (
                    <AnimeGridCard key={anime.id} anime={anime} />
                  ))}
                </div>
              );
            })()
          )}
        </div>
      ) : activeTab === 'genres' && !selectedGenre ? (
        /* SECTION C: 36 Otakudesu Genres Directory */
        <div className="space-y-4">
          <div className="border-b border-white/5 pb-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Tag className="w-4 h-4 text-amber-400" />
              Daftar Lengkap 36 Genre Anime (Otakudesu)
            </h3>
            <p className="text-xs text-slate-400">
              Pilih salah satu kategori untuk melihat seluruh koleksi serial anime dalam genre tersebut
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {(genresList || []).map((g) => (
              <button
                key={g.genreId}
                onClick={() => handleGenreSelect(g.genreId)}
                className="flex items-center justify-between p-3 rounded-xl bg-[#111622] hover:bg-slate-800 border border-white/5 hover:border-amber-500/40 text-left transition-all group"
              >
                <span className="text-xs font-bold text-slate-200 group-hover:text-amber-400 capitalize truncate">
                  {g.title}
                </span>
                <span className="text-[10px] text-slate-500 group-hover:text-white shrink-0">→</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* SECTION D: Paginated Anime Grids (Ongoing, Completed, or Genre Filter) */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              {activeTab === 'ongoing' && <Clock className="w-4 h-4 text-amber-400" />}
              {activeTab === 'completed' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
              {activeTab === 'genres' && <Tag className="w-4 h-4 text-amber-400" />}

              <span>
                {activeTab === 'ongoing' && 'Anime Sedang Tayang (Otakudesu)'}
                {activeTab === 'completed' && 'Daftar Anime Tamat (Otakudesu)'}
                {activeTab === 'genres' && `Koleksi Genre: ${selectedGenre.toUpperCase()} (Otakudesu)`}
              </span>
            </h2>

            <span className="text-xs text-slate-400">
              Halaman {currentPagination.currentPage} dari {currentPagination.totalPages}
            </span>
          </div>

          {isLoading ? (
            <div className="py-24 text-center space-y-3">
              <Loader2 className="w-10 h-10 text-amber-500 animate-spin mx-auto" />
              <p className="text-sm text-slate-400">Memuat katalog anime...</p>
            </div>
          ) : activeAnimeList.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {activeAnimeList.map((anime) => (
                <AnimeGridCard key={anime.id} anime={anime} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-sm text-slate-400">
              Tidak ada anime pada halaman ini.
            </div>
          )}

          {/* Interactive Pagination Toolbar */}
          {currentPagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8 border-t border-white/5">
              <button
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                disabled={page <= 1 || isLoading}
                className="flex items-center gap-1 px-4 py-2 rounded-xl bg-[#111622] hover:bg-slate-800 disabled:opacity-30 text-white text-xs font-semibold border border-white/5 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Sebelumnya
              </button>

              {/* Page Number Pills */}
              <div className="flex items-center gap-1">
                {page > 2 && (
                  <button
                    onClick={() => handlePageChange(1)}
                    className="w-9 h-9 rounded-xl bg-[#111622] hover:bg-slate-800 text-xs text-slate-300 font-semibold border border-white/5"
                  >
                    1
                  </button>
                )}

                {page > 3 && <span className="text-slate-600 px-1">...</span>}

                {page > 1 && (
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    className="w-9 h-9 rounded-xl bg-[#111622] hover:bg-slate-800 text-xs text-slate-300 font-semibold border border-white/5"
                  >
                    {page - 1}
                  </button>
                )}

                <button className="w-9 h-9 rounded-xl bg-amber-500 text-black text-xs font-black shadow-md shadow-amber-500/30">
                  {page}
                </button>

                {page < currentPagination.totalPages && (
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    className="w-9 h-9 rounded-xl bg-[#111622] hover:bg-slate-800 text-xs text-slate-300 font-semibold border border-white/5"
                  >
                    {page + 1}
                  </button>
                )}

                {page < currentPagination.totalPages - 2 && (
                  <span className="text-slate-600 px-1">...</span>
                )}

                {page < currentPagination.totalPages - 1 && (
                  <button
                    onClick={() => handlePageChange(currentPagination.totalPages)}
                    className="w-9 h-9 rounded-xl bg-[#111622] hover:bg-slate-800 text-xs text-slate-300 font-semibold border border-white/5"
                  >
                    {currentPagination.totalPages}
                  </button>
                )}
              </div>

              <button
                onClick={() => handlePageChange(Math.min(currentPagination.totalPages, page + 1))}
                disabled={page >= currentPagination.totalPages || isLoading}
                className="flex items-center gap-1 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-30 text-black text-xs font-bold transition-colors shadow"
              >
                Selanjutnya
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AnimeGridCard({
  anime,
}: {
  anime: AnimeItem;
}) {
  const [imgError, setImgError] = useState(false);

  const fallbackPoster =
    "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22200%22%20height%3D%22300%22%20viewBox%3D%220%200%20200%20300%22%3E%3Crect%20fill%3D%22%230f172a%22%20width%3D%22200%22%20height%3D%22300%22%20%2F%3E%3Ctext%20fill%3D%22%23f59e0b%22%20font-family%3D%22sans-serif%22%20font-size%3D%2214%22%20dy%3D%2210.5%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%3EANIME%3C%2Ftext%3E%3C%2Fsvg%3E";

  const posterSrc = imgError || !anime.poster ? fallbackPoster : anime.poster;

  return (
    <Link
      to={`/anime/detail/otakudesu/${anime.id}`}
      className="group relative flex flex-col rounded-2xl overflow-hidden bg-[#111622] border border-white/5 hover:border-amber-500/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-amber-500/10"
    >
      <div className="relative aspect-[3/4] w-full bg-slate-900 overflow-hidden">
        <img
          src={posterSrc}
          alt={anime.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-80" />

        {/* Score Badge */}
        {anime.score && (
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/80 text-amber-400 text-xs font-bold border border-white/10 shadow">
            <Star className="w-3 h-3 fill-amber-400" />
            <span>{anime.score.replace('★', '').trim()}</span>
          </div>
        )}

        {/* Episode or Status Badge */}
        {anime.episodes ? (
          <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider shadow">
            {typeof anime.episodes === 'number' ? `Ep ${anime.episodes}` : anime.episodes}
          </div>
        ) : anime.status ? (
          <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-black/80 text-slate-200 text-[10px] font-bold border border-white/10 shadow">
            {anime.status}
          </div>
        ) : null}

        {/* Play Icon on hover */}
        <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/40 backdrop-blur-[2px]">
          <div className="w-10 h-10 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 fill-black ml-0.5" />
          </div>
        </div>
      </div>

      <div className="p-3 flex-1 flex flex-col justify-between gap-1.5">
        <h3
          title={anime.title}
          className="font-bold text-xs sm:text-sm text-slate-100 group-hover:text-amber-400 transition-colors line-clamp-2 leading-tight"
        >
          {anime.title}
        </h3>

        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>{anime.type || (anime.releaseDay ? `Rilis ${anime.releaseDay}` : 'Otakudesu')}</span>
          {anime.releasedOn && <span>{anime.releasedOn}</span>}
        </div>
      </div>
    </Link>
  );
}
