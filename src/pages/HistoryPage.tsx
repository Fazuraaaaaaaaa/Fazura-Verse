import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  History,
  Trash2,
  Search,
  Layers,
  BookOpen,
  Tv,
  Film,
  Clapperboard,
  Music,
  ArrowUpDown,
  Database,
  PlayCircle,
  Clock,
  Compass,
  X,
  Play,
  LayoutGrid,
  List,
} from 'lucide-react';
import {
  useAllCategoryHistory,
} from '../services/categoryStorage';
import type {
  CategoryType,
  CategoryHistoryItem,
} from '../services/categoryStorage';
import { BackupRestoreModal } from '../components/library/BackupRestoreModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { usePageMeta } from '../hooks/usePageMeta';
import { createPosterFallbackSvg, CATEGORY_THEMES } from '../utils/categoryTheme';

type ActiveTab = 'all' | CategoryType;
type SortOption = 'recent' | 'oldest' | 'title-asc';
type ViewMode = 'grid' | 'list';

const CATEGORY_TABS: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'all', label: 'Semua', icon: Layers },
  { id: 'manga', label: 'Manga', icon: BookOpen },
  { id: 'anime', label: 'Anime', icon: Tv },
  { id: 'donghua', label: 'Donghua', icon: Film },
  { id: 'movies', label: 'Movies & TV', icon: Clapperboard },
  { id: 'music', label: 'Music', icon: Music },
];

const CATEGORY_COLORS: Record<
  CategoryType,
  { badge: string; text: string; bg: string; border: string; link: string; exploreTitle: string; resumeAction: string }
> = {
  manga: {
    badge: 'bg-[#75C9A0]/15 text-[#75C9A0] border-[#75C9A0]/30',
    text: 'text-[#75C9A0]',
    bg: 'bg-[#75C9A0]',
    border: 'border-[#75C9A0]/35',
    link: '/manga',
    exploreTitle: 'Jelajahi Manga',
    resumeAction: 'Lanjut Baca',
  },
  anime: {
    badge: 'bg-[#A78BFA]/15 text-[#A78BFA] border-[#A78BFA]/30',
    text: 'text-[#A78BFA]',
    bg: 'bg-[#A78BFA]',
    border: 'border-[#A78BFA]/35',
    link: '/anime',
    exploreTitle: 'Jelajahi Anime',
    resumeAction: 'Lanjut Nonton',
  },
  donghua: {
    badge: 'bg-[#67BFD5]/15 text-[#67BFD5] border-[#67BFD5]/30',
    text: 'text-[#67BFD5]',
    bg: 'bg-[#67BFD5]',
    border: 'border-[#67BFD5]/35',
    link: '/donghua',
    exploreTitle: 'Jelajahi Donghua',
    resumeAction: 'Lanjut Nonton',
  },
  movies: {
    badge: 'bg-[#F0A15B]/15 text-[#F0A15B] border-[#F0A15B]/30',
    text: 'text-[#F0A15B]',
    bg: 'bg-[#F0A15B]',
    border: 'border-[#F0A15B]/35',
    link: '/movies',
    exploreTitle: 'Jelajahi Film & Serial',
    resumeAction: 'Lanjut Putar',
  },
  music: {
    badge: 'bg-[#E68BA6]/15 text-[#E68BA6] border-[#E68BA6]/30',
    text: 'text-[#E68BA6]',
    bg: 'bg-[#E68BA6]',
    border: 'border-[#E68BA6]/35',
    link: '/music',
    exploreTitle: 'Jelajahi Musik',
    resumeAction: 'Putar Lagi',
  },
};

function formatRelativeTime(timestamp: number): string {
  if (!timestamp) return '';
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  if (days === 1) return 'Kemarin';
  if (days < 30) return `${days} hari lalu`;
  return new Date(timestamp).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function HistoryPage() {
  usePageMeta({
    title: 'Riwayat Aktivitas - Unified History',
    description: 'Lanjutkan anime, manga, donghua, movie, dan lagu yang terakhir Anda nikmati di FazuraStream.',
  });

  const { byCategory, allItems, totalCount, removeHistoryItem, clearHistory } =
    useAllCategoryHistory();

  const [activeTab, setActiveTab] = useState<ActiveTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('recent');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Filter items based on activeTab
  const baseItems: CategoryHistoryItem[] = useMemo(() => {
    if (activeTab === 'all') return allItems;
    return byCategory[activeTab] || [];
  }, [activeTab, allItems, byCategory]);

  // Filter items by search query and sort
  const filteredAndSortedItems = useMemo(() => {
    let result = [...baseItems];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.lastItemTitle?.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      switch (sortOption) {
        case 'recent':
          return (b.watchedAt || 0) - (a.watchedAt || 0);
        case 'oldest':
          return (a.watchedAt || 0) - (b.watchedAt || 0);
        case 'title-asc':
          return a.title.localeCompare(b.title, 'id', { sensitivity: 'base' });
        default:
          return 0;
      }
    });

    return result;
  }, [baseItems, searchQuery, sortOption]);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => {
      setFeedbackToast(null);
    }, 3000);
  };

  const handleRemove = (item: CategoryHistoryItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    removeHistoryItem(item.category, item.id);
    showToast(`"${item.title}" dihapus dari riwayat`);
  };

  const handleClearAll = () => {
    setIsClearConfirmOpen(true);
  };

  const confirmClearHistory = () => {
    if (activeTab === 'all') {
      clearHistory();
      showToast('Semua riwayat telah dibersihkan');
    } else {
      clearHistory(activeTab);
      showToast(`Riwayat ${activeTab.toUpperCase()} telah dibersihkan`);
    }
    setIsClearConfirmOpen(false);
  };

  const getExploreLink = () => {
    if (activeTab === 'all') return '/browse';
    return CATEGORY_COLORS[activeTab]?.link || '/browse';
  };

  const getExploreTitle = () => {
    if (activeTab === 'all') return 'Eksplorasi Katalog FazuraStream';
    return CATEGORY_COLORS[activeTab]?.exploreTitle || 'Eksplorasi Sekarang';
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="fixed bottom-20 sm:bottom-8 right-4 sm:right-8 z-50 px-4 py-2.5 rounded-[12px] bg-[#232633] border border-[#F0A15B]/50 text-xs sm:text-sm font-semibold text-[#F2F0EC] shadow-subtle-menu animate-in fade-in slide-in-from-bottom-2 duration-200 flex items-center gap-2">
          <History className="w-4 h-4 text-[#F0A15B]" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[10px] bg-[#191C25] border border-[#343744] flex items-center justify-center text-[#F0A15B]">
                <History className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white flex flex-wrap items-center gap-2 tracking-tight">
                <span>Riwayat Aktivitas</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#232633] text-[#F0A15B] border border-[#343744] font-mono font-normal whitespace-nowrap shrink-0">
                  {totalCount} item
                </span>
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-text-muted">
              Lanjutkan episode anime, chapter manga, tayangan film & musik terakhir yang Anda nikmati.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <button
              onClick={() => setIsBackupModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-[10px] text-xs font-semibold bg-[#191C25] hover:bg-[#232633] text-[#A2A4B1] hover:text-[#F2F0EC] border border-[#343744] transition-colors"
              title="Backup & Restore Data"
            >
              <Database className="w-3.5 h-3.5 text-[#F0A15B]" />
              <span>Backup / Restore</span>
            </button>

            {baseItems.length > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] text-xs font-semibold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 transition-colors"
                title="Hapus semua item pada tab riwayat aktif"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Bersihkan {activeTab === 'all' ? 'Semua' : activeTab}</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon;
            const count = tab.id === 'all' ? totalCount : byCategory[tab.id as CategoryType]?.length || 0;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 border ${
                  isActive
                    ? 'bg-[#232633] text-[#F2F0EC] border-[#F0A15B]'
                    : 'bg-[#191C25] hover:bg-[#232633] text-[#A2A4B1] hover:text-[#F2F0EC] border-[#343744]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-black/25 text-white' : 'bg-white/5 text-text-muted'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Controls Toolbar: Search & Sort */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-[12px] bg-[#191C25] border border-[#343744]">
          {/* Live Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={`Cari di riwayat ${activeTab === 'all' ? 'semua' : activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-[#12141B] border border-[#343744] rounded-[10px] text-[#F2F0EC] placeholder-[#747887] focus:outline-none focus:border-[#F0A15B] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort & View Toggle Selection */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <div className="relative flex items-center">
              <ArrowUpDown className="w-3.5 h-3.5 text-text-muted absolute left-3 pointer-events-none" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                aria-label="Urutkan riwayat"
                className="pl-8 pr-7 py-2 text-xs bg-[#12141B] border border-[#343744] rounded-[10px] text-[#F2F0EC] focus:outline-none focus:border-[#F0A15B] appearance-none cursor-pointer"
              >
                <option value="recent">Terakhir Dilihat</option>
                <option value="oldest">Terlama Dilihat</option>
                <option value="title-asc">Judul A - Z</option>
              </select>
            </div>

            <div className="flex items-center p-0.5 rounded-[10px] bg-[#12141B] border border-[#343744]">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-[#F0A15B] text-[#0B0C10]'
                    : 'text-text-muted hover:text-white'
                }`}
                title="Tampilan Grid"
                aria-label="Tampilan Grid"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-[#F0A15B] text-[#0B0C10]'
                    : 'text-text-muted hover:text-white'
                }`}
                title="Tampilan Daftar"
                aria-label="Tampilan Daftar"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* History Items Display */}
        {baseItems.length === 0 ? (
          /* Empty State for category */
          <div className="py-20 text-center rounded-2xl bg-[#191C25] border border-[#343744] max-w-lg mx-auto p-8 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#232633] border border-[#343744] text-[#F0A15B] flex items-center justify-center mx-auto">
              {activeTab === 'all' ? (
                <History className="w-8 h-8" />
              ) : activeTab === 'manga' ? (
                <BookOpen className="w-7 h-7 text-[#75C9A0]" />
              ) : activeTab === 'anime' ? (
                <Tv className="w-7 h-7 text-[#A78BFA]" />
              ) : activeTab === 'donghua' ? (
                <Film className="w-7 h-7 text-[#67BFD5]" />
              ) : activeTab === 'movies' ? (
                <Clapperboard className="w-7 h-7 text-[#F0A15B]" />
              ) : (
                <Music className="w-7 h-7 text-[#E68BA6]" />
              )}
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">
                Belum Ada Riwayat {activeTab === 'all' ? '' : activeTab.toUpperCase()}
              </h3>
              <p className="text-xs sm:text-sm text-text-muted max-w-sm mx-auto">
                Anda belum membaca atau menonton konten apa pun di kategori ini. Riwayat dan progres akan tersimpan otomatis saat Anda mulai menikmati tayangan.
              </p>
            </div>
            <Link
              to={getExploreLink()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-[10px] bg-[#F0A15B] hover:bg-[#F6B779] text-[#0B0C10] font-bold text-xs sm:text-sm transition-colors"
            >
              <Compass className="w-4 h-4" />
              <span>{getExploreTitle()}</span>
            </Link>
          </div>
        ) : filteredAndSortedItems.length === 0 ? (
          /* Search Empty State */
          <div className="py-16 text-center text-xs sm:text-sm text-[#A2A4B1] bg-[#191C25] rounded-[12px] border border-[#343744] space-y-2">
            <div>Tidak ada riwayat yang cocok dengan pencarian &quot;{searchQuery}&quot;.</div>
            <button
              onClick={() => setSearchQuery('')}
              className="text-accent-secondary hover:underline text-xs"
            >
              Hapus pencarian
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* Poster Grid View */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-5">
            {filteredAndSortedItems.map((item) => {
              const catConfig = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.manga;
              return (
                <div
                  key={`${item.category}-${item.id}-${item.lastItemLink}`}
                  className="group relative flex flex-col bg-[#191C25] rounded-[12px] overflow-hidden border border-[#343744] hover:border-[#F0A15B]/60 transition-all duration-200 hover:-translate-y-1"
                >
                  <Link to={item.lastItemLink || '#'} className="relative aspect-[2/3] overflow-hidden bg-[#232633] block">
                    <img
                      src={item.cover}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      onLoad={(e) => {
                        const img = e.currentTarget as HTMLImageElement;
                        if (img.naturalWidth > 0 && img.naturalWidth <= 120 && img.naturalHeight <= 90) {
                          img.src = createPosterFallbackSvg(item.title, CATEGORY_THEMES[item.category]?.accentHex || '#F0A15B');
                        }
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          createPosterFallbackSvg(item.title, CATEGORY_THEMES[item.category]?.accentHex || '#F0A15B');
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-85" />
                    <div className="absolute top-2.5 left-2.5 z-10">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-wider backdrop-blur-md ${catConfig.badge}`}>
                        {item.category}
                      </span>
                    </div>
                    <button
                      onClick={(e) => handleRemove(item, e)}
                      title="Hapus dari riwayat"
                      aria-label="Hapus dari riwayat"
                      className="absolute top-2 right-2 z-20 p-1.5 rounded-xl bg-black/70 hover:bg-rose-600 text-slate-300 hover:text-white border border-white/10 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-all shadow-md"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {item.lastItemTitle && (
                      <div className="absolute bottom-2 left-2.5 right-2.5 z-10">
                        <span className="inline-block max-w-full truncate text-[10px] font-bold text-accent-soft bg-black/70 px-2 py-0.5 rounded-md backdrop-blur-sm border border-white/10">
                          {item.lastItemTitle}
                        </span>
                      </div>
                    )}
                  </Link>
                  <div className="p-3 flex-1 flex flex-col justify-between gap-1.5">
                    <Link
                      to={item.lastItemLink || '#'}
                      className="font-semibold text-xs sm:text-sm text-[#F2F0EC] hover:text-[#F0A15B] transition-colors line-clamp-2 leading-snug"
                      title={item.title}
                    >
                      {item.title}
                    </Link>
                    {typeof item.progress === 'number' && item.progress > 0 && (
                      <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden">
                        <div
                          className="bg-[#F0A15B] h-full rounded-full"
                          style={{ width: `${Math.min(100, Math.max(0, item.progress))}%` }}
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between text-[10px] text-text-muted pt-1 border-t border-white/5">
                      <span>{catConfig.resumeAction}</span>
                      <span>{formatRelativeTime(item.watchedAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* History Cards List (2-column on md+) */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
            {filteredAndSortedItems.map((item) => {
              const catConfig = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.manga;
              return (
                <div
                  key={`${item.category}-${item.id}-${item.lastItemLink}`}
                  className="flex items-center justify-between p-3.5 sm:p-4 rounded-[12px] bg-[#191C25] border border-[#343744] hover:border-[#F0A15B]/60 hover:bg-[#232633]/60 transition-colors gap-3.5 sm:gap-4 group"
                >
                  {/* Left: Thumbnail & Info */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {/* Thumbnail */}
                    <Link
                      to={item.lastItemLink || '#'}
                      className="relative w-14 aspect-[2/3] sm:w-16 rounded-[10px] overflow-hidden shrink-0 border border-[#343744] group-hover:scale-105 transition-transform bg-[#232633]"
                    >
                      <img
                        src={item.cover}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        onLoad={(e) => {
                          const img = e.currentTarget as HTMLImageElement;
                          if (img.naturalWidth > 0 && img.naturalWidth <= 120 && img.naturalHeight <= 90) {
                            img.src = createPosterFallbackSvg(item.title, CATEGORY_THEMES[item.category]?.accentHex || '#F0A15B');
                          }
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            createPosterFallbackSvg(item.title, CATEGORY_THEMES[item.category]?.accentHex || '#F0A15B');
                        }}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                    </Link>

                    {/* Meta Details */}
                    <div className="min-w-0 space-y-1.5 flex-1">
                      {/* Category & Time */}
                      <div className="flex items-center gap-2 text-[11px] text-text-muted">
                        <span
                          className={`px-2 py-0.2 rounded-md text-[9px] font-bold border uppercase tracking-wider ${catConfig.badge}`}
                        >
                          {item.category}
                        </span>
                        <span className="flex items-center gap-1 text-text-muted">
                          <Clock className="w-3 h-3 text-accent-cyan" />
                          {formatRelativeTime(item.watchedAt)}
                        </span>
                      </div>

                      {/* Main Title */}
                      <Link
                        to={item.lastItemLink || '#'}
                        className="font-semibold text-[#F2F0EC] hover:text-[#F0A15B] transition-colors truncate block text-xs sm:text-sm leading-snug"
                        title={item.title}
                      >
                        {item.title}
                      </Link>

                      {/* Last Item Pill (Episode/Chapter) */}
                      {item.lastItemTitle && (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-accent-secondary truncate">
                          <PlayCircle className="w-3.5 h-3.5 text-[#F0A15B] shrink-0" />
                          <span className="truncate">{item.lastItemTitle}</span>
                        </div>
                      )}

                      {/* Progress bar if present */}
                      {typeof item.progress === 'number' && item.progress > 0 && (
                        <div className="space-y-1 pt-0.5">
                          <div className="flex justify-between text-[10px] text-text-muted">
                            <span>Progres</span>
                            <span>{Math.round(item.progress)}%</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden">
                            <div
                              className="bg-[#F0A15B] h-full rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(100, Math.max(0, item.progress))}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      to={item.lastItemLink || '#'}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] bg-[#F0A15B] hover:bg-[#F6B779] text-[#0B0C10] font-bold text-xs transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span className="hidden sm:inline">{catConfig.resumeAction}</span>
                    </Link>

                    <button
                      onClick={(e) => handleRemove(item, e)}
                      title="Hapus dari riwayat"
                      className="p-2 rounded-xl text-text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Backup and Restore Modal */}
      <BackupRestoreModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
      />

      {/* In-App Confirmation Modal */}
      <ConfirmModal
        isOpen={isClearConfirmOpen}
        title={activeTab === 'all' ? 'Bersihkan Seluruh Riwayat?' : `Bersihkan Riwayat ${activeTab.toUpperCase()}?`}
        message={
          activeTab === 'all'
            ? 'Semua riwayat tontonan dan bacaan di seluruh kategori akan dihapus dari penyimpanan lokal.'
            : `Semua riwayat pada kategori ${activeTab.toUpperCase()} akan dihapus dari penyimpanan lokal.`
        }
        confirmLabel="Ya, Bersihkan"
        onConfirm={confirmClearHistory}
        onCancel={() => setIsClearConfirmOpen(false)}
      />
    </div>
  );
}
