import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Tv,
  Clock,
  CheckCircle,
  Search,
  Star,
  Play,
  Calendar,
  Tag,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sparkles,
} from 'lucide-react';
import {
  getDonghuaOngoing,
  getDonghuaCompleted,
  getDonghuaSchedule,
  getDonghuaGenres,
  getDonghuaByGenre,
  searchDonghua,
  proxyDonghuaPoster,
} from '../services/donghuaApi';
import type { DonghuaItem, DonghuaScheduleDay, DonghuaGenre } from '../types/media';

type TabType = 'ongoing' | 'completed' | 'schedule' | 'genres';

export function DonghuaHubPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParam = searchParams.get('search') || '';
  const tabParam = (searchParams.get('tab') as TabType) || 'ongoing';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const genreParam = searchParams.get('genre') || '';

  const [activeTab, setActiveTab] = useState<TabType>(tabParam);
  const [page, setPage] = useState<number>(pageParam || 1);
  const [selectedDay, setSelectedDay] = useState<string>('Senin');
  const [selectedGenre, setSelectedGenre] = useState<string>(genreParam);
  const [searchInput, setSearchInput] = useState(searchParam);

  // Sync state with url params
  useEffect(() => {
    if (tabParam && tabParam !== activeTab) setActiveTab(tabParam);
    if (pageParam && pageParam !== page) setPage(pageParam);
    if (genreParam !== selectedGenre) setSelectedGenre(genreParam);
  }, [tabParam, pageParam, genreParam]);

  // Query: 102 Donghua Genres list
  const { data: genresList } = useQuery({
    queryKey: ['donghua', 'genres-list'],
    queryFn: getDonghuaGenres,
    staleTime: 1000 * 60 * 60,
  });

  // Query: Search Results
  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['donghua', 'search', searchParam],
    queryFn: () => searchDonghua(searchParam),
    enabled: Boolean(searchParam && searchParam.trim().length > 0),
  });

  // Query: Ongoing Donghua (Paginated)
  const { data: ongoingData, isLoading: ongoingLoading } = useQuery({
    queryKey: ['donghua', 'ongoing', page],
    queryFn: () => getDonghuaOngoing(page),
    enabled: activeTab === 'ongoing' && !searchParam,
  });

  // Query: Completed Donghua (Paginated)
  const { data: completedData, isLoading: completedLoading } = useQuery({
    queryKey: ['donghua', 'completed', page],
    queryFn: () => getDonghuaCompleted(page),
    enabled: activeTab === 'completed' && !searchParam,
  });

  // Query: Weekly Release Schedule
  const { data: scheduleData, isLoading: scheduleLoading } = useQuery({
    queryKey: ['donghua', 'schedule'],
    queryFn: getDonghuaSchedule,
    enabled: activeTab === 'schedule' && !searchParam,
  });

  // Query: Filter by Genre
  const { data: genreData, isLoading: genreLoading } = useQuery({
    queryKey: ['donghua', 'genre', selectedGenre, page],
    queryFn: () => getDonghuaByGenre(selectedGenre, page),
    enabled: activeTab === 'genres' && Boolean(selectedGenre) && !searchParam,
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setSearchParams({ search: searchInput.trim() });
  };

  const handleTabChange = (newTab: TabType) => {
    setActiveTab(newTab);
    setPage(1);
    setSearchParams({ tab: newTab });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 350, behavior: 'smooth' });
    const currentParams: any = { tab: activeTab, page: String(newPage) };
    if (selectedGenre) currentParams.genre = selectedGenre;
    setSearchParams(currentParams);
  };

  const handleGenreSelect = (genreSlug: string) => {
    setSelectedGenre(genreSlug);
    setActiveTab('genres');
    setPage(1);
    setSearchParams({ tab: 'genres', genre: genreSlug });
  };

  // Determine active dataset and pagination
  let activeDonghuaList: DonghuaItem[] = [];
  let hasNextPage = false;
  let isLoading = false;

  if (activeTab === 'ongoing') {
    activeDonghuaList = ongoingData?.donghuaList || [];
    hasNextPage = Boolean(ongoingData?.hasNextPage);
    isLoading = ongoingLoading;
  } else if (activeTab === 'completed') {
    activeDonghuaList = completedData?.donghuaList || [];
    hasNextPage = Boolean(completedData?.hasNextPage);
    isLoading = completedLoading;
  } else if (activeTab === 'genres') {
    activeDonghuaList = genreData?.donghuaList || [];
    hasNextPage = Boolean(genreData?.hasNextPage);
    isLoading = genreLoading;
  }

  const topGenreChips = [
    'action',
    'cultivation',
    'fantasy',
    'xianxia',
    'xuanhuan',
    'martial-arts',
    'adventure',
    'romance',
    'supernatural',
    'reincarnation',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Donghua Hub Banner & Search */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0c1a14] via-[#0f241c] to-[#0c1a14] border border-emerald-500/20 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
              <Tv className="w-3.5 h-3.5" />
              Katalog Lengkap Animasi 3D & 2D Tiongkok
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              FAZURAVERSE <span className="text-emerald-400">DONGHUA</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Koleksi serial animasi kultivasi Tiongkok terlengkap (Xianxia, Xuanhuan): Swallowed Star, Soul Land, BTTH, Perfect World, Renegade Immortal, dan ratusan episode lainnya dengan subtitle Indonesia.
            </p>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-2xl bg-[#09140f] border border-emerald-500/30 shadow-lg shrink-0">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-500 text-black shadow-md shadow-emerald-500/30">
              <Sparkles className="w-4 h-4" />
              Anichin Provider
            </div>
          </div>
        </div>

        {/* Search Bar inside Hub */}
        <form onSubmit={handleSearchSubmit} className="mt-6 max-w-xl">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari donghua (e.g. Swallowed Star, BTTH, Soul Land, Perfect World)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-24 py-3 text-xs sm:text-sm bg-[#09140f] border border-white/10 focus:border-emerald-500 rounded-xl text-white placeholder-slate-400 focus:outline-none shadow-inner"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-lg bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-colors shadow"
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
            <Tag className="w-3.5 h-3.5 text-emerald-400" />
            Filter Cepat Berdasarkan Genre
          </span>
          <button
            onClick={() => handleTabChange('genres')}
            className="text-emerald-400 hover:underline capitalize"
          >
            Lihat Semua 102 Genre →
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => handleTabChange('ongoing')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              activeTab !== 'genres'
                ? 'bg-emerald-500 text-black border-emerald-400'
                : 'bg-[#111622] hover:bg-slate-800 text-slate-300 border-white/5'
            }`}
          >
            Semua Donghua
          </button>

          {topGenreChips.map((chip) => {
            const isSelected = activeTab === 'genres' && selectedGenre.toLowerCase() === chip.toLowerCase();
            return (
              <button
                key={chip}
                onClick={() => handleGenreSelect(chip)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap capitalize transition-all border ${
                  isSelected
                    ? 'bg-emerald-500 text-black font-bold border-emerald-400 shadow-md shadow-emerald-500/20'
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
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
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
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Tamat (Completed)
          </button>

          <button
            onClick={() => handleTabChange('schedule')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'schedule' && !searchParam
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Jadwal Rilis Mingguan
          </button>

          <button
            onClick={() => handleTabChange('genres')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'genres' && !searchParam
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Tag className="w-4 h-4" />
            Katalog 102 Genre
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
            Hasil Pencarian: "<span className="text-emerald-400">{searchParam}</span>" di Anichin
          </h2>

          {searchLoading ? (
            <div className="py-20 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
              <p className="text-sm text-slate-400">Mencari serial donghua...</p>
            </div>
          ) : searchResults && searchResults.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {searchResults.map((donghua) => (
                <DonghuaGridCard key={donghua.slug} donghua={donghua} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center space-y-2">
              <Search className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">Tidak Ada Donghua Ditemukan</h3>
              <p className="text-xs text-slate-400">
                Judul "{searchParam}" tidak ditemukan di database Donghua. Coba kata kunci yang lebih ringkas.
              </p>
            </div>
          )}
        </div>
      ) : activeTab === 'schedule' ? (
        /* SECTION B: Weekly Schedule View (Senin - Minggu) */
        <div className="space-y-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  selectedDay.toLowerCase() === day.toLowerCase()
                    ? 'bg-emerald-500 text-black border-emerald-400 shadow-md shadow-emerald-500/20'
                    : 'bg-[#111622] hover:bg-slate-800 text-slate-300 border-white/5'
                }`}
              >
                Hari {day}
              </button>
            ))}
          </div>

          {scheduleLoading ? (
            <div className="py-20 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
              <p className="text-sm text-slate-400">Memuat jadwal rilis donghua...</p>
            </div>
          ) : (
            (() => {
              const currentDayObj = (scheduleData || []).find(
                (d) => d.day.toLowerCase() === selectedDay.toLowerCase()
              );
              const list = currentDayObj?.donghuaList || [];

              if (list.length === 0) {
                return (
                  <div className="py-16 text-center text-sm text-slate-400">
                    Tidak ada jadwal tayang donghua untuk hari {selectedDay}.
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {list.map((item, idx) => (
                    <Link
                      key={idx}
                      to={`/donghua/detail/${item.slug}`}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-[#111622] hover:bg-slate-800 border border-white/5 hover:border-emerald-500/40 transition-all group"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="text-xs sm:text-sm font-bold text-slate-200 group-hover:text-emerald-400 truncate">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">
                          Tayang {selectedDay}
                        </p>
                      </div>
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      </div>
                    </Link>
                  ))}
                </div>
              );
            })()
          )}
        </div>
      ) : activeTab === 'genres' && !selectedGenre ? (
        /* SECTION C: 102 Genres Directory */
        <div className="space-y-4">
          <div className="border-b border-white/5 pb-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-400" />
              Daftar Lengkap 102 Kategori & Genre Donghua
            </h3>
            <p className="text-xs text-slate-400">
              Pilih salah satu kategori untuk melihat koleksi serial animasi Tiongkok
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {(genresList || []).map((g) => (
              <button
                key={g.slug}
                onClick={() => handleGenreSelect(g.slug)}
                className="flex items-center justify-between p-3 rounded-xl bg-[#111622] hover:bg-slate-800 border border-white/5 hover:border-emerald-500/40 text-left transition-all group"
              >
                <span className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 capitalize truncate">
                  {g.name}
                </span>
                <span className="text-[10px] text-slate-500 group-hover:text-white shrink-0">→</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* SECTION D: Paginated Donghua Grids (Ongoing, Completed, or Genre Filter) */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              {activeTab === 'ongoing' && <Clock className="w-4 h-4 text-emerald-400" />}
              {activeTab === 'completed' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
              {activeTab === 'genres' && <Tag className="w-4 h-4 text-emerald-400" />}

              <span>
                {activeTab === 'ongoing' && 'Donghua Sedang Tayang (Ongoing)'}
                {activeTab === 'completed' && 'Daftar Donghua Tamat (Completed)'}
                {activeTab === 'genres' && `Koleksi Genre: ${selectedGenre.toUpperCase()}`}
              </span>
            </h2>

            <span className="text-xs text-slate-400">
              Halaman {page}
            </span>
          </div>

          {isLoading ? (
            <div className="py-24 text-center space-y-3">
              <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mx-auto" />
              <p className="text-sm text-slate-400">Memuat katalog donghua...</p>
            </div>
          ) : activeDonghuaList.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {activeDonghuaList.map((donghua) => (
                <DonghuaGridCard key={donghua.slug} donghua={donghua} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-sm text-slate-400">
              Tidak ada donghua pada halaman ini.
            </div>
          )}

          {/* Interactive Pagination Toolbar */}
          <div className="flex items-center justify-center gap-2 pt-8 border-t border-white/5">
            <button
              onClick={() => handlePageChange(Math.max(1, page - 1))}
              disabled={page <= 1 || isLoading}
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-[#111622] hover:bg-slate-800 disabled:opacity-30 text-white text-xs font-semibold border border-white/5 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Sebelumnya
            </button>

            {/* Page number pill */}
            <div className="flex items-center gap-1">
              {page > 1 && (
                <button
                  onClick={() => handlePageChange(page - 1)}
                  className="w-9 h-9 rounded-xl bg-[#111622] hover:bg-slate-800 text-xs text-slate-300 font-semibold border border-white/5"
                >
                  {page - 1}
                </button>
              )}

              <button className="w-9 h-9 rounded-xl bg-emerald-500 text-black text-xs font-black shadow-md shadow-emerald-500/30">
                {page}
              </button>

              {hasNextPage && (
                <button
                  onClick={() => handlePageChange(page + 1)}
                  className="w-9 h-9 rounded-xl bg-[#111622] hover:bg-slate-800 text-xs text-slate-300 font-semibold border border-white/5"
                >
                  {page + 1}
                </button>
              )}
            </div>

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={!hasNextPage || isLoading}
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 text-black text-xs font-bold transition-colors shadow"
            >
              Selanjutnya
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DonghuaGridCard({ donghua }: { donghua: DonghuaItem }) {
  const [imgError, setImgError] = useState(false);

  const fallbackPoster =
    "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22200%22%20height%3D%22300%22%20viewBox%3D%220%200%20200%20300%22%3E%3Crect%20fill%3D%22%230f172a%22%20width%3D%22200%22%20height%3D%22300%22%2F%3E%3Ctext%20fill%3D%22%2310b981%22%20font-family%3D%22sans-serif%22%20font-size%3D%2214%22%20dy%3D%2210.5%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%3EDONGHUA%3C%2Ftext%3E%3C%2Fsvg%3E";

  const posterSrc = imgError || !donghua.poster ? fallbackPoster : proxyDonghuaPoster(donghua.poster);

  return (
    <Link
      to={`/donghua/detail/${donghua.slug}`}
      className="group relative flex flex-col rounded-2xl overflow-hidden bg-[#111622] border border-white/5 hover:border-emerald-500/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-emerald-500/10"
    >
      <div className="relative aspect-[3/4] w-full bg-slate-900 overflow-hidden">
        <img
          src={posterSrc}
          alt={donghua.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-80" />

        {/* Status / Episode Badge */}
        {donghua.currentEpisode ? (
          <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-emerald-500 text-black text-[10px] font-black uppercase tracking-wider shadow">
            {donghua.currentEpisode}
          </div>
        ) : donghua.status ? (
          <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-black/80 text-slate-200 text-[10px] font-bold border border-white/10 shadow">
            {donghua.status}
          </div>
        ) : null}

        {/* Type badge */}
        {donghua.type && (
          <div className="absolute top-2 right-2 z-10 px-1.5 py-0.5 rounded-md bg-black/80 text-emerald-400 text-[10px] font-bold border border-white/10 shadow">
            {donghua.type}
          </div>
        )}

        {/* Play Icon on hover */}
        <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/40 backdrop-blur-[2px]">
          <div className="w-10 h-10 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 fill-black ml-0.5" />
          </div>
        </div>
      </div>

      <div className="p-3 flex-1 flex flex-col justify-between gap-1.5">
        <h3
          title={donghua.title}
          className="font-bold text-xs sm:text-sm text-slate-100 group-hover:text-emerald-400 transition-colors line-clamp-2 leading-tight"
        >
          {donghua.title}
        </h3>

        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>{donghua.type || 'Donghua 3D'}</span>
          <span>{donghua.status || 'Sub Indo'}</span>
        </div>
      </div>
    </Link>
  );
}
