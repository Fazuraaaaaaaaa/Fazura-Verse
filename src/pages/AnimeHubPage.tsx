import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Film, Bookmark, History, Trash2, Calendar } from 'lucide-react';
import {
  getOtakudesuOngoing,
  getOtakudesuCompleted,
  getOtakudesuSchedule,
  getOtakudesuGenres,
  getOtakudesuByGenre,
  searchAllAnime,
} from '../services/animeApi';
import type { AnimeItem } from '../types/media';
import { AnimeGridCard } from '../components/anime/AnimeGridCard';
import { HubHistoryShelf } from '../components/library/HubHistoryShelf';
import { useCategoryBookmarks, useCategoryHistory } from '../services/categoryStorage';
import { usePageMeta } from '../hooks/usePageMeta';
import { CategoryHero } from '../components/media/CategoryHero';
import { FilterBar } from '../components/common/FilterBar';
import { SectionHeader } from '../components/common/SectionHeader';
import { PaginationBar } from '../components/common/PaginationBar';
import { CardGridSkeleton, EmptyState } from '../components/common/StateViews';
import { MediaCard } from '../components/media/MediaCard';
import { ConfirmModal } from '../components/ConfirmModal';
import { Button } from '../components/common/Button';

type TabType = 'ongoing' | 'completed' | 'genres' | 'schedule' | 'bookmarks' | 'history';
type SortOption = 'default' | 'title_asc' | 'score_desc';

export function AnimeHubPage() {
  usePageMeta({
    title: 'Anime Hub - Streaming Anime Sub Indo HD',
    description:
      'Nonton anime ongoing, completed, anime klasik, dan jadwal rilis mingguan sub Indo dengan pemutar multi-server HD di FazuraStream.',
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const searchParam = searchParams.get('search') || '';
  const tabParam = (searchParams.get('tab') as TabType) || 'ongoing';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const genreParam = searchParams.get('genre') || '';

  const [activeTab, setActiveTab] = useState<TabType>(
    tabParam === 'schedule' ||
      tabParam === 'completed' ||
      tabParam === 'genres' ||
      tabParam === 'bookmarks' ||
      tabParam === 'history'
      ? tabParam
      : 'ongoing'
  );
  const [page, setPage] = useState<number>(pageParam || 1);
  const [selectedGenre, setSelectedGenre] = useState<string>(genreParam);
  const [selectedDay, setSelectedDay] = useState<string>('Senin');
  const [searchInput, setSearchInput] = useState(searchParam);
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const { bookmarks } = useCategoryBookmarks('anime');
  const { history, clearHistory } = useCategoryHistory('anime');

  useEffect(() => {
    if (tabParam && tabParam !== activeTab) setActiveTab(tabParam);
    if (pageParam && pageParam !== page) setPage(pageParam);
    if (genreParam !== selectedGenre) setSelectedGenre(genreParam);
  }, [tabParam, pageParam, genreParam]);

  const { data: genresList } = useQuery({
    queryKey: ['anime', 'genres-list', 'otakudesu'],
    queryFn: getOtakudesuGenres,
    staleTime: 1000 * 60 * 60,
  });

  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['anime', 'search', 'all-providers', searchParam],
    queryFn: () => searchAllAnime(searchParam),
    enabled: Boolean(searchParam && searchParam.trim().length > 0),
  });

  const { data: ongoingData, isLoading: ongoingLoading } = useQuery({
    queryKey: ['anime', 'ongoing', 'otakudesu', page],
    queryFn: () => getOtakudesuOngoing(page),
    enabled: activeTab === 'ongoing' && !searchParam,
  });

  const { data: completedData, isLoading: completedLoading } = useQuery({
    queryKey: ['anime', 'completed', 'otakudesu', page],
    queryFn: () => getOtakudesuCompleted(page),
    enabled: activeTab === 'completed' && !searchParam,
  });

  const { data: genreData, isLoading: genreLoading } = useQuery({
    queryKey: ['anime', 'genre', selectedGenre, page],
    queryFn: () => getOtakudesuByGenre(selectedGenre, page),
    enabled: activeTab === 'genres' && Boolean(selectedGenre) && !searchParam,
  });

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

  const handleTabChange = (newTab: string) => {
    const tab = newTab as TabType;
    setActiveTab(tab);
    setPage(1);
    if (tab !== 'genres') {
      setSelectedGenre('');
      setSearchParams({ tab });
    } else {
      const p: Record<string, string> = { tab: 'genres' };
      if (selectedGenre) p.genre = selectedGenre;
      setSearchParams(p);
    }
  };

  const handleGenreSelect = (genreId: string) => {
    setSelectedGenre(genreId);
    setPage(1);
    if (genreId) {
      setActiveTab('genres');
      setSearchParams({ tab: 'genres', genre: genreId });
    } else {
      setActiveTab('ongoing');
      setSearchParams({ tab: 'ongoing' });
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 320, behavior: 'smooth' });
    const params: Record<string, string> = { tab: activeTab, page: String(newPage) };
    if (selectedGenre) params.genre = selectedGenre;
    setSearchParams(params);
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setSelectedGenre('');
    setSortBy('default');
    setActiveTab('ongoing');
    setPage(1);
    setSearchParams({ tab: 'ongoing' });
  };

  let rawAnimeList: AnimeItem[] = [];
  let currentPagination = {
    currentPage: 1,
    totalPages: 1,
    hasPrevPage: false,
    hasNextPage: false,
  };
  let isLoading = false;

  if (activeTab === 'ongoing') {
    rawAnimeList = ongoingData?.animeList || [];
    currentPagination = ongoingData?.pagination || currentPagination;
    isLoading = ongoingLoading;
  } else if (activeTab === 'completed') {
    rawAnimeList = completedData?.animeList || [];
    currentPagination = completedData?.pagination || currentPagination;
    isLoading = completedLoading;
  } else if (activeTab === 'genres') {
    rawAnimeList = genreData?.animeList || [];
    currentPagination = genreData?.pagination || currentPagination;
    isLoading = genreLoading;
  }

  const sortItems = (list: AnimeItem[]) => {
    if (sortBy === 'title_asc') {
      return [...list].sort((a, b) => a.title.localeCompare(b.title));
    }
    if (sortBy === 'score_desc') {
      return [...list].sort(
        (a, b) =>
          (parseFloat(String(b.score || '0')) || 0) -
          (parseFloat(String(a.score || '0')) || 0)
      );
    }
    return list;
  };

  const activeAnimeList = useMemo(() => sortItems(rawAnimeList), [rawAnimeList, sortBy]);
  const displayedSearchResults = useMemo(
    () => sortItems(searchResults?.all || []),
    [searchResults, sortBy]
  );

  const heroBackdrop = ongoingData?.animeList?.[0]?.poster;

  const genreOptions = useMemo(
    () =>
      (genresList || []).map((g) => ({
        value: g.genreId,
        label: g.title,
      })),
    [genresList]
  );

  return (
    <div className="min-h-screen bg-[#12141B] text-[#F2F0EC] pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-w-0">
        {/* 1. Compact Anime Category Hero (Lavender Accent) */}
        <CategoryHero
          category="anime"
          eyebrow="Anime Catalog"
          title="Katalog Anime Sub Indo"
          description="Jelajahi ribuan serial anime ongoing, tamat, 36 genre, hingga anime klasik pilihan dengan server HD cepat."
          backdropUrl={heroBackdrop}
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          onSearchSubmit={handleSearchSubmit}
          searchPlaceholder="Cari judul anime (e.g. Solo Leveling, Jujutsu Kaisen, Naruto)..."
        />

        {/* 2. Unified Filter Toolbar */}
        <FilterBar
          category="anime"
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          onSearchSubmit={handleSearchSubmit}
          searchPlaceholder="Filter cepat anime..."
          tabs={[
            { id: 'ongoing', label: 'Ongoing' },
            { id: 'completed', label: 'Completed' },
            { id: 'genres', label: 'Genre' },
            { id: 'schedule', label: 'Jadwal Rilis' },
            { id: 'bookmarks', label: 'Favorit', count: bookmarks.length },
            { id: 'history', label: 'Riwayat', count: history.length },
          ]}
          activeTab={searchParam ? '' : activeTab}
          onTabChange={handleTabChange}
          genreOptions={genreOptions}
          selectedGenre={selectedGenre}
          onGenreChange={handleGenreSelect}
          genreLabel="Semua Genre"
          sortOptions={[
            { value: 'default', label: 'Urutan Default' },
            { value: 'title_asc', label: 'Judul (A-Z)' },
            { value: 'score_desc', label: 'Skor Tertinggi' },
          ]}
          selectedSort={sortBy}
          onSortChange={(val) => setSortBy(val as SortOption)}
          hasActiveFilters={Boolean(searchParam || selectedGenre || sortBy !== 'default')}
          onResetFilters={handleResetFilters}
        />

        {/* 3. Continue Watching Shelf */}
        {!searchParam && activeTab !== 'history' && <HubHistoryShelf category="anime" />}

        {/* 4. Main Content Views */}
        {searchParam ? (
          <div className="space-y-4">
            <SectionHeader
              category="anime"
              title={`Hasil Pencarian: "${searchParam}"`}
              subtitle={`Ditemukan ${displayedSearchResults.length} judul anime dari katalog multi-provider`}
            />
            {searchLoading ? (
              <CardGridSkeleton count={12} />
            ) : displayedSearchResults.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {displayedSearchResults.map((anime) => (
                  <AnimeGridCard key={`${anime.provider}-${anime.id}`} anime={anime} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Film className="w-5 h-5" />}
                title="Anime Tidak Ditemukan"
                description={`Judul "${searchParam}" belum tersedia. Coba gunakan judul alternatif atau reset filter.`}
                actionLabel="Reset Pencarian"
                onAction={handleResetFilters}
              />
            )}
          </div>
        ) : activeTab === 'bookmarks' ? (
          <div className="space-y-4">
            <SectionHeader
              category="anime"
              title={`Anime Favorit Saya (${bookmarks.length})`}
              subtitle="Daftar anime yang Anda simpan secara lokal"
            />
            {bookmarks.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {bookmarks.map((b) => (
                  <MediaCard
                    key={b.id}
                    id={b.id}
                    category="anime"
                    title={b.title}
                    imageUrl={b.cover}
                    link={b.link}
                    topBadge={b.type || 'Anime'}
                    metaPrimary={b.subtitle || 'Favorit'}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Bookmark className="w-5 h-5" />}
                title="Belum Ada Anime Favorit"
                description="Klik ikon hati pada kartu atau halaman detail anime untuk menyimpannya."
                actionLabel="Jelajahi Anime"
                onAction={() => handleTabChange('ongoing')}
              />
            )}
          </div>
        ) : activeTab === 'history' ? (
          <div className="space-y-4">
            <SectionHeader
              category="anime"
              title={`Riwayat Tonton Anime (${history.length})`}
              subtitle="Lanjutkan episode anime yang sempat Anda tonton"
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
                    category="anime"
                    title={h.title}
                    imageUrl={h.cover}
                    link={h.lastItemLink || `/anime/detail/otakudesu/${h.id}`}
                    topBadge={h.lastItemTitle}
                    metaPrimary={h.lastItemTitle || 'Lanjut Nonton'}
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
                title="Belum Ada Riwayat Tonton"
                description="Episode yang Anda putar akan otomatis tercatat di sini."
                actionLabel="Mulai Nonton"
                onAction={() => handleTabChange('ongoing')}
              />
            )}
          </div>
        ) : activeTab === 'schedule' ? (
          <div className="space-y-5">
            <SectionHeader
              category="anime"
              title={`Jadwal Rilis — Hari ${selectedDay}`}
              subtitle="Daftar jadwal update mingguan serial anime ongoing"
            />
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={`h-9 px-3.5 rounded-[10px] text-xs font-semibold border transition-colors shrink-0 cursor-pointer ${
                    selectedDay.toLowerCase() === day.toLowerCase()
                      ? 'bg-[#A78BFA]/15 text-[#A78BFA] border-[#A78BFA]/45'
                      : 'bg-[#191C25] text-[#A2A4B1] hover:text-[#F2F0EC] border-[#343744]'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            {scheduleLoading ? (
              <CardGridSkeleton count={12} />
            ) : (
              (() => {
                const currentDayObj = (scheduleData || []).find(
                  (d) => d.day.toLowerCase() === selectedDay.toLowerCase()
                );
                const list = currentDayObj?.animeList || [];
                if (list.length === 0) {
                  return (
                    <EmptyState
                      icon={<Calendar className="w-5 h-5" />}
                      title={`Belum Ada Jadwal Hari ${selectedDay}`}
                      description="Silakan pilih hari lain untuk melihat rilis mingguan."
                    />
                  );
                }
                return (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {list.map((anime) => (
                      <AnimeGridCard key={anime.id} anime={anime} />
                    ))}
                  </div>
                );
              })()
            )}
          </div>
        ) : activeTab === 'genres' && !selectedGenre ? (
          <div className="space-y-4">
            <SectionHeader
              category="anime"
              title="Jelajahi Berdasarkan Genre"
              subtitle="Pilih salah satu dari 36 genre anime yang tersedia"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {(genresList || []).map((g) => (
                <button
                  key={g.genreId}
                  type="button"
                  onClick={() => handleGenreSelect(g.genreId)}
                  className="flex items-center justify-between h-11 px-3.5 rounded-[10px] bg-[#191C25] hover:bg-[#232633] border border-[#343744] hover:border-[#A78BFA]/45 text-left transition-colors group cursor-pointer"
                >
                  <span className="text-[13px] font-medium text-[#F2F0EC] group-hover:text-[#A78BFA] capitalize truncate">
                    {g.title}
                  </span>
                  <span className="text-xs text-[#747887] group-hover:text-[#A78BFA]">→</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <SectionHeader
              category="anime"
              title={
                activeTab === 'ongoing'
                  ? 'Anime Sedang Tayang (Ongoing)'
                  : activeTab === 'completed'
                  ? 'Koleksi Anime Tamat (Completed)'
                  : `Genre: ${selectedGenre.replace(/-/g, ' ')}`
              }
              rightSlot={
                <span className="text-xs text-[#A2A4B1]">
                  Halaman {currentPagination.currentPage} dari {currentPagination.totalPages}
                </span>
              }
            />

            {isLoading ? (
              <CardGridSkeleton count={18} />
            ) : activeAnimeList.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {activeAnimeList.map((anime) => (
                  <AnimeGridCard key={anime.id} anime={anime} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Film className="w-5 h-5" />}
                title="Tidak Ada Judul di Halaman Ini"
                description="Coba pilih halaman atau filter genre yang berbeda."
                actionLabel="Reset Filter"
                onAction={handleResetFilters}
              />
            )}

            <PaginationBar
              currentPage={page}
              totalPages={currentPagination.totalPages}
              isLoading={isLoading}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmClearOpen}
        title="Hapus Semua Riwayat Anime?"
        message="Seluruh riwayat episode anime yang tercatat secara lokal akan dihapus."
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

// Keep removeBookmark referenced clean even if future bookmark button action added inside tab
void 0;
