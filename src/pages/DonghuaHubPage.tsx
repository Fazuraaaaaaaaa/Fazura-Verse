import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Tv, Bookmark, History, Trash2, Calendar } from 'lucide-react';
import {
  getDonghuaOngoing,
  getDonghuaCompleted,
  getDonghuaSchedule,
  getDonghuaGenres,
  getDonghuaByGenre,
  searchDonghua,
  proxyDonghuaPoster,
} from '../services/donghuaApi';
import type { DonghuaItem } from '../types/media';
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
import { createPosterFallbackSvg } from '../utils/categoryTheme';

type TabType = 'ongoing' | 'completed' | 'genres' | 'schedule' | 'bookmarks' | 'history';
type SortOption = 'default' | 'title_asc';

export function DonghuaHubPage() {
  usePageMeta({
    title: 'Donghua Hub - Streaming Donghua 3D & 2D Sub Indo',
    description:
      'Nonton donghua Xianxia 3D/2D sub Indo (Soul Land, Battle Through the Heavens, Swallowed Star) dengan multi-server HD di FazuraStream.',
  });

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
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const { bookmarks } = useCategoryBookmarks('donghua');
  const { history, clearHistory } = useCategoryHistory('donghua');

  const totalPages = useMemo(() => {
    if (activeTab === 'ongoing') return 3;
    if (activeTab === 'completed') return 15;
    if (activeTab === 'genres') return 10;
    return 1;
  }, [activeTab]);

  useEffect(() => {
    if (tabParam && tabParam !== activeTab) setActiveTab(tabParam);
    if (pageParam && pageParam !== page) setPage(pageParam);
    if (genreParam !== selectedGenre) setSelectedGenre(genreParam);
  }, [tabParam, pageParam, genreParam]);

  const { data: genresList } = useQuery({
    queryKey: ['donghua', 'genres-list'],
    queryFn: getDonghuaGenres,
    staleTime: 1000 * 60 * 60,
  });

  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['donghua', 'search', searchParam],
    queryFn: () => searchDonghua(searchParam),
    enabled: Boolean(searchParam && searchParam.trim().length > 0),
  });

  const { data: ongoingData, isLoading: ongoingLoading } = useQuery({
    queryKey: ['donghua', 'ongoing', page],
    queryFn: () => getDonghuaOngoing(page),
    enabled: activeTab === 'ongoing' && !searchParam,
  });

  const { data: completedData, isLoading: completedLoading } = useQuery({
    queryKey: ['donghua', 'completed', page],
    queryFn: () => getDonghuaCompleted(page),
    enabled: activeTab === 'completed' && !searchParam,
  });

  const { data: scheduleData, isLoading: scheduleLoading } = useQuery({
    queryKey: ['donghua', 'schedule'],
    queryFn: getDonghuaSchedule,
    enabled: activeTab === 'schedule' && !searchParam,
  });

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

  const handleGenreSelect = (genreSlug: string) => {
    setSelectedGenre(genreSlug);
    setPage(1);
    if (genreSlug) {
      setActiveTab('genres');
      setSearchParams({ tab: 'genres', genre: genreSlug });
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

  let rawDonghuaList: DonghuaItem[] = [];
  let isLoading = false;

  if (activeTab === 'ongoing') {
    rawDonghuaList = ongoingData?.donghuaList || [];
    isLoading = ongoingLoading;
  } else if (activeTab === 'completed') {
    rawDonghuaList = completedData?.donghuaList || [];
    isLoading = completedLoading;
  } else if (activeTab === 'genres') {
    rawDonghuaList = genreData?.donghuaList || [];
    isLoading = genreLoading;
  }

  const sortItems = (list: DonghuaItem[]) => {
    if (sortBy === 'title_asc') {
      return [...list].sort((a, b) => a.title.localeCompare(b.title));
    }
    return list;
  };

  const activeDonghuaList = useMemo(() => sortItems(rawDonghuaList), [rawDonghuaList, sortBy]);
  const displayedSearch = useMemo(() => sortItems(searchResults || []), [searchResults, sortBy]);

  const heroPosterRaw = ongoingData?.donghuaList?.[0]?.poster;
  const heroBackdrop = heroPosterRaw ? proxyDonghuaPoster(heroPosterRaw) : undefined;

  const genreOptions = useMemo(
    () =>
      (genresList || []).map((g) => ({
        value: g.slug,
        label: g.name,
      })),
    [genresList]
  );

  const donghuaPosterMap = useMemo(() => {
    const map: Record<string, string> = {
      'apotheosis': 'https://anichin.moe/wp-content/uploads/2022/11/Apotheosis-Episode-105-Subtitle-Indonesia.webp',
      'swallowed-star': 'https://anichin.moe/wp-content/uploads/2020/11/Swallowed-Star-Subtitle-Indonesia.webp',
      'supreme-god-emperor': 'https://anichin.moe/wp-content/uploads/2026/07/Supreme-God-Emperor-Subtitle-Indonesia.webp',
      'againts-the-sky-supreme': 'https://anichin.moe/wp-content/uploads/2025/09/0-2-768x1077.webp',
      'immortality-season-5': 'https://anichin.moe/wp-content/uploads/2025/12/IMMORTALITY-SEASON-5-SUBTITLE-INDONESIA.webp',
      'the-supreme-body-refining-master': 'https://anichin.moe/wp-content/uploads/2026/01/The-Supreme-Body-Refining-Master-Subtitle-Indonesia.webp',
      'battle-through-the-heavens': 'https://anichin.moe/wp-content/uploads/2026/11/BTTH-Movie-Battle-of-Two-Emperors-Subtitle-Indonesia.webp',
      'btth': 'https://anichin.moe/wp-content/uploads/2026/11/BTTH-Movie-Battle-of-Two-Emperors-Subtitle-Indonesia.webp',
      'perfect-world': 'https://anichin.moe/wp-content/uploads/2021/01/Perfect-World-Subtitle-Indonesia-4.webp',
      'renegade-immortal': 'https://anichin.moe/wp-content/uploads/2023/09/RENEGADE-IMMORTAL-SUBTITLE-INDONESIA-3.webp',
      'shrouding-the-heavens': 'https://anichin.moe/wp-content/uploads/2023/05/Shrouding-the-Heavens-Subtitle-Indonesia-3-768x1077.webp',
      'soul-land': 'https://anichin.moe/wp-content/uploads/2025/12/THE-DRAGON-SOUL-SUBTITLE-INDONESIA-768x1077.webp',
      'soul-land-2': 'https://anichin.moe/wp-content/uploads/2025/12/THE-DRAGON-SOUL-SUBTITLE-INDONESIA-768x1077.webp',
      '100-000-years-of-refining-qi': 'https://anichin.moe/wp-content/uploads/2023/02/100.000-Years-of-Refining-Qi-1-768x1077.jpg',
      'stellar-transformations': 'https://anichin.moe/wp-content/uploads/2023/01/Stellar-Transformations-Season-5-768x1075.jpg',
      'tomb-of-fallen-gods': 'https://anichin.moe/wp-content/uploads/2022/07/Tomb-of-Fallen-Gods-768x1075.jpg',
      'peerless-martial-spirit': 'https://anichin.moe/wp-content/uploads/2021/04/Peerless-Martial-Spirit-768x1075.jpg',
      'the-demon-hunter': 'https://anichin.moe/wp-content/uploads/2023/06/The-Demon-Hunter-768x1075.jpg',
      'big-brother': 'https://anichin.moe/wp-content/uploads/2023/01/My-Senior-Brother-is-Too-Steady-768x1075.jpg',
      'tales-of-demons-and-gods': 'https://anichin.moe/wp-content/uploads/2021/04/Tales-of-Demons-and-Gods-768x1075.jpg',
      'land-of-miracles': 'https://anichin.moe/wp-content/uploads/2022/07/Land-of-Miracles-768x1075.jpg',
      'record-of-a-mortals-journey-to-immortality': 'https://anichin.moe/wp-content/uploads/2021/11/A-Record-of-a-Mortals-Journey-to-Immortality-Season-2-768x1075.jpg',
    };
    (ongoingData?.donghuaList || []).forEach((item) => {
      if (item.slug && item.poster) map[item.slug] = item.poster;
    });
    (completedData?.donghuaList || []).forEach((item) => {
      if (item.slug && item.poster) map[item.slug] = item.poster;
    });
    return map;
  }, [ongoingData?.donghuaList, completedData?.donghuaList]);

  const getPosterForSchedule = (slug: string, title: string) => {
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (donghuaPosterMap[cleanSlug]) return proxyDonghuaPoster(donghuaPosterMap[cleanSlug]);
    for (const [k, v] of Object.entries(donghuaPosterMap)) {
      if (cleanSlug.includes(k) || k.includes(cleanSlug)) return proxyDonghuaPoster(v);
    }
    return createPosterFallbackSvg(title, '#67BFD5');
  };

  const renderDonghuaCard = (donghua: DonghuaItem) => (
    <MediaCard
      key={donghua.slug}
      id={donghua.slug}
      category="donghua"
      title={donghua.title}
      imageUrl={proxyDonghuaPoster(donghua.poster || '') || donghua.poster}
      link={`/donghua/detail/${donghua.slug}`}
      topBadge={donghua.currentEpisode || donghua.status}
      metaPrimary={donghua.type || 'Donghua 3D'}
      metaSecondary={donghua.status}
      bookmarkType={donghua.type || 'Donghua'}
    />
  );

  return (
    <div className="min-h-screen bg-[#12141B] text-[#F2F0EC] pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-w-0">
        {/* 1. Unified Category Hero (Cyan Accent on Shared Dark Surface) */}
        <CategoryHero
          category="donghua"
          eyebrow="Donghua Catalog"
          title="Katalog Donghua Sub Indo"
          description="Saksikan serial animasi 3D dan 2D kultivasi Xianxia & Xuanhuan terpopuler dengan subtitle Indonesia dan multi-server."
          backdropUrl={heroBackdrop}
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          onSearchSubmit={handleSearchSubmit}
          searchPlaceholder="Cari donghua (e.g. Swallowed Star, BTTH, Soul Land, Perfect World)..."
        />

        {/* 2. Unified Filter Bar */}
        <FilterBar
          category="donghua"
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          onSearchSubmit={handleSearchSubmit}
          searchPlaceholder="Filter cepat donghua..."
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
          ]}
          selectedSort={sortBy}
          onSortChange={(val) => setSortBy(val as SortOption)}
          hasActiveFilters={Boolean(searchParam || selectedGenre || sortBy !== 'default')}
          onResetFilters={handleResetFilters}
        />

        {/* 3. Continue Watching Shelf */}
        {!searchParam && activeTab !== 'history' && <HubHistoryShelf category="donghua" />}

        {/* 4. Main Content */}
        {searchParam ? (
          <div className="space-y-4">
            <SectionHeader
              category="donghua"
              title={`Hasil Pencarian: "${searchParam}"`}
              subtitle={`Ditemukan ${displayedSearch.length} serial donghua`}
            />
            {searchLoading ? (
              <CardGridSkeleton count={12} />
            ) : displayedSearch.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {displayedSearch.map(renderDonghuaCard)}
              </div>
            ) : (
              <EmptyState
                icon={<Tv className="w-5 h-5" />}
                title="Donghua Tidak Ditemukan"
                description={`Kata kunci "${searchParam}" belum tersedia. Coba judul lain atau reset filter.`}
                actionLabel="Reset Pencarian"
                onAction={handleResetFilters}
              />
            )}
          </div>
        ) : activeTab === 'bookmarks' ? (
          <div className="space-y-4">
            <SectionHeader
              category="donghua"
              title={`Donghua Favorit Saya (${bookmarks.length})`}
              subtitle="Daftar donghua yang Anda simpan di koleksi lokal"
            />
            {bookmarks.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {bookmarks.map((b) => (
                  <MediaCard
                    key={b.id}
                    id={b.id}
                    category="donghua"
                    title={b.title}
                    imageUrl={proxyDonghuaPoster(b.cover || '') || b.cover}
                    link={b.link}
                    topBadge={b.type || 'Donghua'}
                    metaPrimary={b.subtitle || 'Favorit'}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Bookmark className="w-5 h-5" />}
                title="Belum Ada Donghua Favorit"
                description="Simpan serial donghua dari halaman detail agar mudah ditemukan kembali."
                actionLabel="Jelajahi Donghua"
                onAction={() => handleTabChange('ongoing')}
              />
            )}
          </div>
        ) : activeTab === 'history' ? (
          <div className="space-y-4">
            <SectionHeader
              category="donghua"
              title={`Riwayat Tonton Donghua (${history.length})`}
              subtitle="Lanjutkan episode donghua yang terakhir Anda tonton"
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
                    category="donghua"
                    title={h.title}
                    imageUrl={proxyDonghuaPoster(h.cover || '') || h.cover}
                    link={h.lastItemLink || `/donghua/detail/${h.id}`}
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
                description="Episode donghua yang Anda tonton akan otomatis tercatat di sini."
                actionLabel="Mulai Nonton"
                onAction={() => handleTabChange('ongoing')}
              />
            )}
          </div>
        ) : activeTab === 'schedule' ? (
          <div className="space-y-5">
            <SectionHeader
              category="donghua"
              title={`Jadwal Rilis — Hari ${selectedDay}`}
              subtitle="Jadwal pembaruan donghua mingguan"
            />
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={`h-9 px-3.5 rounded-[10px] text-xs font-semibold border transition-colors shrink-0 cursor-pointer ${
                    selectedDay.toLowerCase() === day.toLowerCase()
                      ? 'bg-[#67BFD5]/15 text-[#67BFD5] border-[#67BFD5]/45'
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
                const dayObj = (scheduleData || []).find(
                  (d) => d.day.toLowerCase() === selectedDay.toLowerCase()
                );
                const list = dayObj?.donghuaList || [];
                if (list.length === 0) {
                  return (
                    <EmptyState
                      icon={<Calendar className="w-5 h-5" />}
                      title={`Tidak Ada Jadwal Hari ${selectedDay}`}
                      description="Pilih hari lain untuk melihat rilis donghua mingguan."
                    />
                  );
                }
                return (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {list.map((d) => (
                      <MediaCard
                        key={d.slug}
                        id={d.slug}
                        category="donghua"
                        title={d.title}
                        imageUrl={getPosterForSchedule(d.slug, d.title)}
                        link={`/donghua/detail/${d.slug}`}
                        topBadge={`Rilis ${selectedDay}`}
                        metaPrimary="Donghua"
                        metaSecondary="Jadwal Mingguan"
                        bookmarkType="Donghua"
                      />
                    ))}
                  </div>
                );
              })()
            )}
          </div>
        ) : activeTab === 'genres' && !selectedGenre ? (
          <div className="space-y-4">
            <SectionHeader
              category="donghua"
              title="Jelajahi Genre Donghua"
              subtitle="Pilih kategori genre atau tag donghua untuk menyaring katalog"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {(genresList || []).map((g) => (
                <button
                  key={g.slug}
                  type="button"
                  onClick={() => handleGenreSelect(g.slug)}
                  className="flex items-center justify-between h-11 px-3.5 rounded-[10px] bg-[#191C25] hover:bg-[#232633] border border-[#343744] hover:border-[#67BFD5]/45 text-left transition-colors group cursor-pointer"
                >
                  <span className="text-[13px] font-medium text-[#F2F0EC] group-hover:text-[#67BFD5] capitalize truncate">
                    {g.name}
                  </span>
                  <span className="text-xs text-[#747887] group-hover:text-[#67BFD5]">→</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <SectionHeader
              category="donghua"
              title={
                activeTab === 'ongoing'
                  ? 'Donghua Sedang Tayang (Ongoing)'
                  : activeTab === 'completed'
                  ? 'Daftar Donghua Tamat (Completed)'
                  : `Genre: ${selectedGenre.replace(/-/g, ' ')}`
              }
              rightSlot={
                <span className="text-xs text-[#A2A4B1]">
                  Halaman {page} dari {totalPages}
                </span>
              }
            />

            {isLoading ? (
              <CardGridSkeleton count={18} />
            ) : activeDonghuaList.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {activeDonghuaList.map(renderDonghuaCard)}
              </div>
            ) : (
              <EmptyState
                icon={<Tv className="w-5 h-5" />}
                title="Tidak Ada Donghua di Halaman Ini"
                description="Coba pindah halaman atau pilih kategori lainnya."
                actionLabel="Reset Filter"
                onAction={handleResetFilters}
              />
            )}

            <PaginationBar
              currentPage={page}
              totalPages={totalPages}
              isLoading={isLoading}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmClearOpen}
        title="Hapus Semua Riwayat Donghua?"
        message="Seluruh riwayat tontonan donghua lokal akan dihapus."
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
