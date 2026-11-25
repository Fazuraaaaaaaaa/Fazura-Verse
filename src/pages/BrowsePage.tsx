import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Compass,
  Clock,
  Flame,
  Palette,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Bookmark,
  History,
  Trash2,
  Play,
} from 'lucide-react';
import {
  getLatest,
  getPopular,
  getByType,
  getGenres,
  getByGenre,
  getColored,
  getTop,
} from '../services/api';
import { MangaGrid } from '../components/MangaGrid';
import { GenreChips } from '../components/GenreChips';
import type { MangaType } from '../types/manga';
import { useCategoryBookmarks, useCategoryHistory } from '../services/categoryStorage';
import { HubHistoryShelf } from '../components/library/HubHistoryShelf';
import { usePageMeta } from '../hooks/usePageMeta';

type TabType =
  | 'all'
  | 'latest'
  | 'popular'
  | 'top'
  | 'manga'
  | 'manhwa'
  | 'manhua'
  | 'colored'
  | 'genres'
  | 'bookmarks'
  | 'history';

export function BrowsePage() {
  usePageMeta({
    title: 'Manga, Manhwa & Manhua Hub - Baca Komik Sub Indo',
    description: 'Baca ribuan manga Jepang, manhwa Korea, dan manhua China dengan vertical webtoon reader berkualitas tinggi di FazuraStream.',
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const tabParam = (searchParams.get('tab') as TabType) || 'all';
  const genreParam = searchParams.get('genre') || '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const [activeTab, setActiveTab] = useState<TabType>(tabParam);
  const [selectedGenre, setSelectedGenre] = useState<string>(genreParam);
  const [page, setPage] = useState<number>(pageParam);
  const [searchInput, setSearchInput] = useState<string>('');
  const [jumpPageInput, setJumpPageInput] = useState<string>('');

  const { bookmarks, removeBookmark } = useCategoryBookmarks('manga');
  const { history, clearHistory, removeHistoryItem } = useCategoryHistory('manga');

  // Catalog depth and total pages estimation for BacaKomik
  const totalPages = React.useMemo(() => {
    if (activeTab === 'popular' || activeTab === 'top') return 1;
    if (selectedGenre) return 35; // ~1,400 judul per genre
    switch (activeTab) {
      case 'manga':
        return 85; // ~3,400 judul manga
      case 'manhwa':
        return 95; // ~3,800 judul manhwa
      case 'manhua':
        return 65; // ~2,600 judul manhua
      case 'colored':
        return 45; // ~1,800 judul komik berwarna
      case 'latest':
      case 'all':
      default:
        return 120; // ~4,800+ judul komik
    }
  }, [activeTab, selectedGenre]);

  const handleJumpPage = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseInt(jumpPageInput.trim(), 10);
    if (!isNaN(target) && target >= 1 && target <= totalPages) {
      handlePageChange(target);
      setJumpPageInput('');
    }
  };

  // Sync state with URL params
  useEffect(() => {
    if (tabParam) setActiveTab(tabParam);
    if (genreParam) setSelectedGenre(genreParam);
    if (pageParam) setPage(pageParam);
  }, [tabParam, genreParam, pageParam]);

  const updateUrl = (newTab: TabType, newGenre: string, newPage: number) => {
    const params = new URLSearchParams();
    if (newTab !== 'all') params.set('tab', newTab);
    if (newGenre) params.set('genre', newGenre);
    if (newPage > 1) params.set('page', String(newPage));
    setSearchParams(params);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setPage(1);
    if (tab !== 'genres') {
      setSelectedGenre('');
      updateUrl(tab, '', 1);
    } else {
      updateUrl(tab, selectedGenre, 1);
    }
  };

  const handleGenreSelect = (genreSlug: string) => {
    setSelectedGenre(genreSlug);
    setPage(1);
    if (genreSlug) {
      setActiveTab('genres');
      updateUrl('genres', genreSlug, 1);
    } else {
      updateUrl(activeTab, '', 1);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    setPage(newPage);
    updateUrl(activeTab, selectedGenre, newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Genres query
  const { data: genresData, isLoading: genresLoading } = useQuery({
    queryKey: ['genres'],
    queryFn: getGenres,
  });

  // Main data query based on activeTab and genre
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['browse', activeTab, selectedGenre, page],
    queryFn: async () => {
      if (selectedGenre) {
        return getByGenre(selectedGenre, page);
      }
      switch (activeTab) {
        case 'latest':
          return getLatest(page);
        case 'popular':
          return getPopular();
        case 'top':
          return getTop();
        case 'manga':
        case 'manhwa':
        case 'manhua':
          return getByType(activeTab as MangaType, page);
        case 'colored':
          return getColored(page);
        case 'all':
        default:
          return getLatest(page);
      }
    },
  });

  const mangaList = data?.komikList || [];
  const hasNextPage = data?.hasNextPage || false;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-w-0">
      {/* Page Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-4xl font-black text-white flex items-center gap-3">
            <Compass className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-400 shrink-0" />
            Manga & Komik Directory
          </h1>
          <p className="text-sm text-slate-400">
            Koleksi ribuan judul Manga Jepang, Manhwa Korea, Manhua China, dan Komik Berwarna (BacaKomik).
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (searchInput.trim()) {
              navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
            }
          }}
          className="w-full md:w-80"
        >
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari judul manga / manhwa / manhua..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-20 py-2.5 bg-[#111622] border border-white/10 focus:border-indigo-500 rounded-xl text-white text-xs placeholder-slate-400 focus:outline-none shadow-inner"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors shadow"
            >
              Cari
            </button>
          </div>
        </form>
      </div>

      {/* Hub History Shelf */}
      <HubHistoryShelf category="manga" />

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-white/5">
        <button
          onClick={() => handleTabChange('all')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shrink-0 whitespace-nowrap ${
            activeTab === 'all' && !selectedGenre
              ? 'bg-accent-indigo text-white shadow-md shadow-accent-indigo/20'
              : 'bg-card/70 hover:bg-card text-slate-300 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Semua Manga
        </button>

        <button
          onClick={() => handleTabChange('latest')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shrink-0 whitespace-nowrap ${
            activeTab === 'latest'
              ? 'bg-accent-indigo text-white shadow-md shadow-accent-indigo/20'
              : 'bg-card/70 hover:bg-card text-slate-300 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4 text-emerald-400" />
          Latest Updates
        </button>

        <button
          onClick={() => handleTabChange('popular')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shrink-0 whitespace-nowrap ${
            activeTab === 'popular'
              ? 'bg-accent-indigo text-white shadow-md shadow-accent-indigo/20'
              : 'bg-card/70 hover:bg-card text-slate-300 hover:text-white'
          }`}
        >
          <Flame className="w-4 h-4 text-amber-400" />
          Popular
        </button>

        <button
          onClick={() => handleTabChange('manga')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shrink-0 whitespace-nowrap ${
            activeTab === 'manga'
              ? 'bg-accent-indigo text-white shadow-md shadow-accent-indigo/20'
              : 'bg-card/70 hover:bg-card text-slate-300 hover:text-white'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-indigo-400" />
          Manga
        </button>

        <button
          onClick={() => handleTabChange('manhwa')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shrink-0 whitespace-nowrap ${
            activeTab === 'manhwa'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'bg-card/70 hover:bg-card text-slate-300 hover:text-white'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-purple-400" />
          Manhwa
        </button>

        <button
          onClick={() => handleTabChange('manhua')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shrink-0 whitespace-nowrap ${
            activeTab === 'manhua'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-card/70 hover:bg-card text-slate-300 hover:text-white'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          Manhua
        </button>

        <button
          onClick={() => handleTabChange('colored')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shrink-0 whitespace-nowrap ${
            activeTab === 'colored'
              ? 'bg-accent-indigo text-white shadow-md shadow-accent-indigo/20'
              : 'bg-card/70 hover:bg-card text-slate-300 hover:text-white'
          }`}
        >
          <Palette className="w-4 h-4 text-accent-cyan" />
          Full Color
        </button>

        <button
          onClick={() => handleTabChange('genres')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shrink-0 whitespace-nowrap ${
            activeTab === 'genres' || selectedGenre
              ? 'bg-accent-indigo text-white shadow-md shadow-accent-indigo/20'
              : 'bg-card/70 hover:bg-card text-slate-300 hover:text-white'
          }`}
        >
          <Filter className="w-4 h-4 text-accent-purple" />
          By Genre
        </button>

        {/* Manga Bookmarks Tab */}
        <button
          onClick={() => handleTabChange('bookmarks')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shrink-0 whitespace-nowrap ${
            activeTab === 'bookmarks'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
              : 'bg-card/70 hover:bg-card text-slate-300 hover:text-white'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          Favorit Saya
          {bookmarks.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500/30 text-rose-200 text-[10px] font-bold">
              {bookmarks.length}
            </span>
          )}
        </button>

        {/* Manga History Tab */}
        <button
          onClick={() => handleTabChange('history')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shrink-0 whitespace-nowrap ${
            activeTab === 'history'
              ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
              : 'bg-card/70 hover:bg-card text-slate-300 hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          Riwayat Baca
          {history.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/30 text-indigo-200 text-[10px] font-bold">
              {history.length}
            </span>
          )}
        </button>
      </div>

      {/* Genre Chips Filter Bar */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Filter by Genre:
        </p>
        <GenreChips
          genres={genresData?.genres || []}
          selectedGenre={selectedGenre}
          onSelectGenre={handleGenreSelect}
          isLoading={genresLoading}
        />
      </div>

      {/* Grid Results */}
      {activeTab === 'bookmarks' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-rose-500 fill-rose-500" />
                Manga & Komik Favorit Saya ({bookmarks.length})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Koleksi judul manga dan komik yang Anda simpan.
              </p>
            </div>
          </div>

          {bookmarks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {bookmarks.map((b) => (
                <div key={b.id} className="relative group rounded-xl overflow-hidden bg-[#111622] border border-white/5 hover:border-rose-500/40 transition-all flex flex-col justify-between">
                  <a href={b.link} className="block relative aspect-[3/4] overflow-hidden bg-slate-900">
                    <img
                      src={b.cover}
                      alt={b.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <span className="absolute bottom-2 left-2 text-[10px] px-2 py-0.5 rounded bg-accent-indigo text-white font-bold">
                      {b.type || 'Manga'}
                    </span>
                  </a>

                  <div className="p-3 space-y-1.5">
                    <a href={b.link} className="text-xs font-bold text-white hover:text-accent-indigo line-clamp-2 block">
                      {b.title}
                    </a>
                    {b.subtitle && (
                      <p className="text-[10px] text-slate-400 truncate">{b.subtitle}</p>
                    )}
                    <div className="pt-2 flex items-center justify-between border-t border-white/5">
                      <a
                        href={b.link}
                        className="text-[11px] font-bold text-accent-indigo hover:underline flex items-center gap-1"
                      >
                        <Play className="w-3 h-3 fill-current" /> Baca
                      </a>
                      <button
                        onClick={() => removeBookmark(b.id)}
                        title="Hapus dari Bookmark"
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
              <h4 className="text-base font-bold text-white">Belum Ada Komik Favorit</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Buka halaman komik dan tekan tombol Bookmark untuk menambahkannya ke koleksi ini.
              </p>
              <button
                onClick={() => handleTabChange('all')}
                className="px-4 py-2 rounded-xl bg-accent-indigo text-white font-bold text-xs"
              >
                Jelajahi Semua Komik
              </button>
            </div>
          )}
        </div>
      ) : activeTab === 'history' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-400" />
                Riwayat Baca Komik ({history.length})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Daftar manga & chapter terakhir yang Anda baca.
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
                  <a href={h.lastItemLink || `/manga/${h.id}`} className="block relative aspect-[3/4] overflow-hidden bg-slate-900">
                    <img
                      src={h.cover}
                      alt={h.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    {h.lastItemTitle && (
                      <span className="absolute bottom-2 left-2 text-[10px] px-2 py-0.5 rounded bg-accent-indigo text-white font-bold truncate max-w-[85%]">
                        {h.lastItemTitle}
                      </span>
                    )}
                  </a>

                  <div className="p-3 space-y-1.5">
                    <a href={h.lastItemLink || `/manga/${h.id}`} className="text-xs font-bold text-white hover:text-accent-indigo line-clamp-2 block">
                      {h.title}
                    </a>
                    <p className="text-[10px] text-slate-400">
                      Terakhir baca: {new Date(h.watchedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </p>
                    <div className="pt-2 flex items-center justify-between border-t border-white/5">
                      <a
                        href={h.lastItemLink || `/manga/${h.id}`}
                        className="text-[11px] font-bold text-accent-indigo hover:underline flex items-center gap-1"
                      >
                        <Play className="w-3 h-3 fill-current" /> Lanjut Baca
                      </a>
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
              <h4 className="text-base font-bold text-white">Belum Ada Riwayat Baca Komik</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Chapter komik yang Anda baca akan tercatat secara otomatis di sini.
              </p>
              <button
                onClick={() => handleTabChange('all')}
                className="px-4 py-2 rounded-xl bg-accent-indigo text-white font-bold text-xs"
              >
                Mulai Membaca Komik
              </button>
            </div>
          )}
        </div>
      ) : (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111622] p-4 rounded-2xl border border-white/5">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {selectedGenre
                ? `Koleksi Komik Genre "${selectedGenre.toUpperCase()}"`
                : activeTab === 'manhwa'
                ? 'Koleksi Manhwa Korea Lengkap'
                : activeTab === 'manhua'
                ? 'Koleksi Manhua China Lengkap'
                : activeTab === 'manga'
                ? 'Koleksi Manga Jepang Lengkap'
                : activeTab === 'colored'
                ? 'Koleksi Komik Full Color Berwarna'
                : 'Katalog Komik Lengkap (BacaKomik)'}
            </h3>
            <p className="text-xs text-slate-400">
              Menampilkan <span className="text-white font-bold">{mangaList.length}</span> komik di halaman ini
              {totalPages > 1 && (
                <> • Total katalog: <span className="text-indigo-400 font-bold">{(totalPages * 40).toLocaleString()}+ judul</span> ({totalPages} halaman tersedia)</>
              )}
            </p>
          </div>

          <div className="text-xs font-semibold text-slate-400 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5 self-start sm:self-auto">
            Halaman <strong className="text-white">{page}</strong> dari <strong className="text-white">{totalPages}</strong>
          </div>
        </div>

        <MangaGrid
          items={mangaList}
          isLoading={isLoading || isFetching}
          skeletonCount={24}
          showRanking={activeTab === 'popular' || activeTab === 'top'}
        />

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="w-full space-y-4 pt-8 border-t border-white/5">
            <div className="flex items-center justify-center gap-1 sm:gap-2 max-w-full overflow-x-auto scrollbar-none px-1 py-1">
              <button
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                disabled={page <= 1 || isLoading}
                className="flex items-center gap-1 px-2.5 sm:px-4 py-2 rounded-xl bg-[#111622] hover:bg-slate-800 disabled:opacity-30 text-white text-xs font-semibold border border-white/5 transition-colors shrink-0"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Sebelumnya</span>
              </button>

              <div className="flex items-center gap-1 shrink-0">
                {/* First page button */}
                {page > 2 && (
                  <button
                    onClick={() => handlePageChange(1)}
                    className="w-8 sm:w-9 h-8 sm:h-9 rounded-xl bg-[#111622] hover:bg-slate-800 text-xs text-slate-300 font-semibold border border-white/5 transition-colors shrink-0"
                  >
                    1
                  </button>
                )}

                {page > 3 && <span className="text-slate-600 px-0.5 sm:px-1 text-xs">...</span>}

                {/* Previous page */}
                {page > 1 && (
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    className="w-8 sm:w-9 h-8 sm:h-9 rounded-xl bg-[#111622] hover:bg-slate-800 text-xs text-slate-300 font-semibold border border-white/5 transition-colors shrink-0"
                  >
                    {page - 1}
                  </button>
                )}

                {/* Current Active page */}
                <button className="w-8 sm:w-9 h-8 sm:h-9 rounded-xl bg-indigo-600 text-white text-xs font-black shadow-md shadow-indigo-600/30 shrink-0">
                  {page}
                </button>

                {/* Next page */}
                {page < totalPages && (
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    className="w-8 sm:w-9 h-8 sm:h-9 rounded-xl bg-[#111622] hover:bg-slate-800 text-xs text-slate-300 font-semibold border border-white/5 transition-colors shrink-0"
                  >
                    {page + 1}
                  </button>
                )}

                {/* Next + 1 when on page 1 */}
                {page === 1 && totalPages > 2 && (
                  <button
                    onClick={() => handlePageChange(3)}
                    className="w-8 sm:w-9 h-8 sm:h-9 rounded-xl bg-[#111622] hover:bg-slate-800 text-xs text-slate-300 font-semibold border border-white/5 transition-colors shrink-0"
                  >
                    3
                  </button>
                )}

                {/* Next + 2 when on page 1 */}
                {page === 1 && totalPages > 3 && (
                  <button
                    onClick={() => handlePageChange(4)}
                    className="w-8 sm:w-9 h-8 sm:h-9 rounded-xl bg-[#111622] hover:bg-slate-800 text-xs text-slate-300 font-semibold border border-white/5 transition-colors shrink-0 hidden sm:block"
                  >
                    4
                  </button>
                )}

                {page < totalPages - 2 && (
                  <span className="text-slate-600 px-0.5 sm:px-1 text-xs">...</span>
                )}

                {/* Last page button */}
                {page < totalPages - 1 && (
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    className="w-8 sm:w-9 h-8 sm:h-9 rounded-xl bg-[#111622] hover:bg-slate-800 text-xs text-slate-300 font-semibold border border-white/5 transition-colors shrink-0"
                  >
                    {totalPages}
                  </button>
                )}
              </div>

              <button
                onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages || isLoading}
                className="flex items-center gap-1 px-2.5 sm:px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white text-xs font-bold transition-colors shadow shrink-0"
              >
                <span className="hidden sm:inline">Selanjutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Direct Jump Input Form */}
            <form
              onSubmit={handleJumpPage}
              className="flex items-center justify-center gap-2 text-xs text-slate-400"
            >
              <span>Lompat ke halaman:</span>
              <input
                type="number"
                min={1}
                max={totalPages}
                placeholder={String(page)}
                value={jumpPageInput}
                onChange={(e) => setJumpPageInput(e.target.value)}
                className="w-16 px-2.5 py-1.5 rounded-lg bg-[#111622] border border-white/10 text-white text-center focus:border-indigo-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-white font-semibold transition-colors border border-white/5"
              >
                Buka
              </button>
            </form>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
