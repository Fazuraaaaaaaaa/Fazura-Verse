import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Bookmark, History, Trash2 } from 'lucide-react';
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
import type { MangaItem, MangaType } from '../types/manga';
import { useCategoryBookmarks, useCategoryHistory } from '../services/categoryStorage';
import { HubHistoryShelf } from '../components/library/HubHistoryShelf';
import { usePageMeta } from '../hooks/usePageMeta';
import { CategoryHero } from '../components/media/CategoryHero';
import { FilterBar } from '../components/common/FilterBar';
import { SectionHeader } from '../components/common/SectionHeader';
import { PaginationBar } from '../components/common/PaginationBar';
import { EmptyState } from '../components/common/StateViews';
import { MediaCard } from '../components/media/MediaCard';
import { ConfirmModal } from '../components/ConfirmModal';
import { Button } from '../components/common/Button';

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

type SortOption = 'default' | 'title_asc' | 'rating_desc';

export function BrowsePage() {
  usePageMeta({
    title: 'Manga, Manhwa & Manhua Hub - Baca Komik Sub Indo',
    description:
      'Baca ribuan manga Jepang, manhwa Korea, dan manhua China dengan vertical webtoon reader berkualitas tinggi di FazuraStream.',
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const tabParam = (searchParams.get('tab') as TabType) || 'all';
  const genreParam = searchParams.get('genre') || '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const [activeTab, setActiveTab] = useState<TabType>(tabParam);
  const [selectedGenre, setSelectedGenre] = useState<string>(genreParam);
  const [page, setPage] = useState<number>(pageParam || 1);
  const [searchInput, setSearchInput] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const { bookmarks } = useCategoryBookmarks('manga');
  const { history, clearHistory } = useCategoryHistory('manga');

  const totalPages = useMemo(() => {
    if (activeTab === 'popular' || activeTab === 'top') return 1;
    if (selectedGenre) return 35;
    switch (activeTab) {
      case 'manga':
        return 85;
      case 'manhwa':
        return 95;
      case 'manhua':
        return 65;
      case 'colored':
        return 45;
      case 'latest':
      case 'all':
      default:
        return 120;
    }
  }, [activeTab, selectedGenre]);

  useEffect(() => {
    if (tabParam) setActiveTab(tabParam);
    setSelectedGenre(genreParam);
    if (pageParam) setPage(pageParam);
  }, [tabParam, genreParam, pageParam]);

  const updateUrl = (newTab: TabType, newGenre: string, newPage: number) => {
    const params = new URLSearchParams();
    if (newTab !== 'all') params.set('tab', newTab);
    if (newGenre) params.set('genre', newGenre);
    if (newPage > 1) params.set('page', String(newPage));
    setSearchParams(params);
  };

  const handleTabChange = (newTab: string) => {
    const tab = newTab as TabType;
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
      setActiveTab('all');
      updateUrl('all', '', 1);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    setPage(newPage);
    updateUrl(activeTab, selectedGenre, newPage);
    window.scrollTo({ top: 320, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setSelectedGenre('');
    setSortBy('default');
    setActiveTab('all');
    setPage(1);
    setSearchParams(new URLSearchParams());
  };

  const { data: genresData, isLoading: genresLoading } = useQuery({
    queryKey: ['genres'],
    queryFn: getGenres,
  });

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
    enabled: activeTab !== 'bookmarks' && activeTab !== 'history',
  });

  const rawMangaList: MangaItem[] = data?.komikList || [];
  const sortedMangaList = useMemo(() => {
    if (sortBy === 'title_asc') {
      return [...rawMangaList].sort((a, b) => a.title.localeCompare(b.title));
    }
    if (sortBy === 'rating_desc') {
      return [...rawMangaList].sort(
        (a, b) => (parseFloat(b.rating || '0') || 0) - (parseFloat(a.rating || '0') || 0)
      );
    }
    return rawMangaList;
  }, [rawMangaList, sortBy]);

  const genreOptions = useMemo(
    () =>
      (genresData || []).map((g) => ({
        value: g.slug,
        label: g.title,
      })),
    [genresData]
  );

  const heroCover = rawMangaList[0]?.cover;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
  };

  return (
    <div className="min-h-screen bg-[#12141B] text-[#F2F0EC] pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-w-0">
        {/* 1. Compact Editorial Manga Hero (Mint Accent) */}
        <CategoryHero
          category="manga"
          eyebrow="Manga Library"
          title="Perpustakaan Manga, Manhwa & Manhua"
          description="Baca ribuan judul manga Jepang, manhwa Korea, manhua China, dan komik berwarna dengan pembaca vertikal yang nyaman."
          backdropUrl={heroCover}
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          onSearchSubmit={handleSearchSubmit}
          searchPlaceholder="Cari judul komik, manga, manhwa, atau manhua..."
        />

        {/* 2. Continue Reading Shelf */}
        {activeTab !== 'history' && <HubHistoryShelf category="manga" />}

        {/* 3. Unified Filter Toolbar */}
        <FilterBar
          category="manga"
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          onSearchSubmit={handleSearchSubmit}
          searchPlaceholder="Cari komik..."
          tabs={[
            { id: 'all', label: 'Terbaru' },
            { id: 'popular', label: 'Populer' },
            { id: 'top', label: 'Top Rating' },
            { id: 'manga', label: 'Manga' },
            { id: 'manhwa', label: 'Manhwa' },
            { id: 'manhua', label: 'Manhua' },
            { id: 'colored', label: 'Berwarna' },
            { id: 'bookmarks', label: 'Favorit', count: bookmarks.length },
            { id: 'history', label: 'Riwayat', count: history.length },
          ]}
          activeTab={selectedGenre ? '' : activeTab}
          onTabChange={handleTabChange}
          genreOptions={genreOptions}
          selectedGenre={selectedGenre}
          onGenreChange={handleGenreSelect}
          genreLabel="Semua Genre"
          sortOptions={[
            { value: 'default', label: 'Urutan Default' },
            { value: 'title_asc', label: 'Judul (A-Z)' },
            { value: 'rating_desc', label: 'Rating Tertinggi' },
          ]}
          selectedSort={sortBy}
          onSortChange={(val) => setSortBy(val as SortOption)}
          hasActiveFilters={Boolean(selectedGenre || activeTab !== 'all' || sortBy !== 'default')}
          onResetFilters={handleResetFilters}
        />

        {/* Quick Genre Explorer strip */}
        {activeTab !== 'bookmarks' && activeTab !== 'history' && genresData && genresData.length > 0 && (
          <GenreChips
            genres={genresData.slice(0, 18)}
            selectedGenre={selectedGenre}
            onSelectGenre={handleGenreSelect}
            isLoading={genresLoading}
          />
        )}

        {/* 4. Catalog Content Views */}
        {activeTab === 'bookmarks' ? (
          <div className="space-y-4">
            <SectionHeader
              category="manga"
              title={`Komik Favorit Saya (${bookmarks.length})`}
              subtitle="Koleksi manga, manhwa, dan manhua yang Anda simpan"
            />
            {bookmarks.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {bookmarks.map((b) => (
                  <MediaCard
                    key={b.id}
                    id={b.id}
                    category="manga"
                    title={b.title}
                    imageUrl={b.cover}
                    link={b.link}
                    topBadge={b.type || 'Komik'}
                    metaPrimary={b.subtitle || 'Favorit'}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Bookmark className="w-5 h-5" />}
                title="Belum Ada Komik Favorit"
                description="Tekan ikon hati pada sampul atau halaman detail komik untuk menyimpannya di sini."
                actionLabel="Jelajahi Komik"
                onAction={() => handleTabChange('all')}
              />
            )}
          </div>
        ) : activeTab === 'history' ? (
          <div className="space-y-4">
            <SectionHeader
              category="manga"
              title={`Riwayat Baca Komik (${history.length})`}
              subtitle="Lanjutkan membaca chapter terakhir Anda"
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
                    category="manga"
                    title={h.title}
                    imageUrl={h.cover}
                    link={h.lastItemLink || `/manga/${h.id}`}
                    topBadge={h.lastItemTitle}
                    metaPrimary={h.lastItemTitle || 'Lanjut Baca'}
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
                title="Belum Ada Riwayat Baca"
                description="Setiap chapter komik yang Anda buka akan tercatat secara otomatis di sini."
                actionLabel="Mulai Membaca"
                onAction={() => handleTabChange('all')}
              />
            )}
          </div>
        ) : (
          <div className="space-y-5">
            <SectionHeader
              category="manga"
              title={
                selectedGenre
                  ? `Genre: ${selectedGenre.replace(/-/g, ' ')}`
                  : activeTab === 'popular'
                  ? 'Komik Terpopuler'
                  : activeTab === 'top'
                  ? 'Komik Rating Tertinggi'
                  : activeTab === 'manga'
                  ? 'Katalog Manga Jepang'
                  : activeTab === 'manhwa'
                  ? 'Katalog Manhwa Korea'
                  : activeTab === 'manhua'
                  ? 'Katalog Manhua China'
                  : activeTab === 'colored'
                  ? 'Komik Berwarna (Full Color)'
                  : 'Pembaruan Komik Terbaru'
              }
              rightSlot={
                <span className="text-xs text-[#A2A4B1]">
                  Halaman {page} dari {totalPages}
                </span>
              }
            />

            <MangaGrid
              items={sortedMangaList}
              isLoading={isLoading || isFetching}
              skeletonCount={24}
              showRanking={activeTab === 'popular' || activeTab === 'top'}
              emptyTitle="Komik Tidak Tersedia"
              emptyMessage="Coba pilih kategori atau halaman lain untuk melihat katalog komik."
            />

            <PaginationBar
              currentPage={page}
              totalPages={totalPages}
              isLoading={isLoading || isFetching}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmClearOpen}
        title="Hapus Semua Riwayat Baca?"
        message="Seluruh riwayat baca manga lokal Anda akan dihapus. Daftar favorit tetap aman."
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

// Preserve BookOpen icon reference if used in future empty customization
void BookOpen;
