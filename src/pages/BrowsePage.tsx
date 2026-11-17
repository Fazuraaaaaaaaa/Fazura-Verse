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

type TabType =
  | 'all'
  | 'latest'
  | 'popular'
  | 'top'
  | 'manga'
  | 'manhwa'
  | 'manhua'
  | 'colored'
  | 'genres';

export function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const tabParam = (searchParams.get('tab') as TabType) || 'all';
  const genreParam = searchParams.get('genre') || '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const [activeTab, setActiveTab] = useState<TabType>(tabParam);
  const [selectedGenre, setSelectedGenre] = useState<string>(genreParam);
  const [page, setPage] = useState<number>(pageParam);
  const [searchInput, setSearchInput] = useState<string>('');

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-white flex items-center gap-3">
            <Compass className="w-8 h-8 text-indigo-400" />
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

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-white/5">
        <button
          onClick={() => handleTabChange('all')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shrink-0 ${
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
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shrink-0 ${
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
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shrink-0 ${
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
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shrink-0 ${
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
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shrink-0 ${
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
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shrink-0 ${
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
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shrink-0 ${
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
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'genres' || selectedGenre
              ? 'bg-accent-indigo text-white shadow-md shadow-accent-indigo/20'
              : 'bg-card/70 hover:bg-card text-slate-300 hover:text-white'
          }`}
        >
          <Filter className="w-4 h-4 text-accent-purple" />
          By Genre
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400">
            {selectedGenre
              ? `Showing results for genre "${selectedGenre}"`
              : `Showing ${activeTab.toUpperCase()} listing`}
            {page > 1 ? ` (Page ${page})` : ''}
          </p>
        </div>

        <MangaGrid
          items={mangaList}
          isLoading={isLoading || isFetching}
          skeletonCount={18}
          showRanking={activeTab === 'popular' || activeTab === 'top'}
        />

        {/* Pagination Controls */}
        <div className="flex items-center justify-center gap-2 pt-8 border-t border-white/5">
          <button
            onClick={() => handlePageChange(Math.max(1, page - 1))}
            disabled={page <= 1 || isLoading}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-[#111622] hover:bg-slate-800 disabled:opacity-30 text-white text-xs font-semibold border border-white/5 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Sebelumnya
          </button>

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

            <button className="w-9 h-9 rounded-xl bg-indigo-600 text-white text-xs font-black shadow-md shadow-indigo-600/30">
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
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white text-xs font-bold transition-colors shadow"
          >
            Selanjutnya
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
