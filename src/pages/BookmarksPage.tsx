import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Bookmark,
  Trash2,
  Search,
  LayoutGrid,
  List,
  Layers,
  BookOpen,
  Tv,
  Film,
  Clapperboard,
  Music,
  ArrowUpDown,
  Database,
  ExternalLink,
  Compass,
  X,
  Play,
  Calendar,
} from 'lucide-react';
import {
  useAllCategoryBookmarks,
  ALL_CATEGORIES,
} from '../services/categoryStorage';
import type {
  CategoryType,
  CategoryBookmarkItem,
} from '../services/categoryStorage';
import { BackupRestoreModal } from '../components/library/BackupRestoreModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { usePageMeta } from '../hooks/usePageMeta';
import { createPosterFallbackSvg, CATEGORY_THEMES } from '../utils/categoryTheme';

type ActiveTab = 'all' | CategoryType;
type SortOption = 'newest' | 'oldest' | 'title-asc' | 'title-desc';
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
  { badge: string; text: string; bg: string; border: string; link: string; exploreTitle: string }
> = {
  manga: {
    badge: 'bg-[#75C9A0]/15 text-[#75C9A0] border-[#75C9A0]/30',
    text: 'text-[#75C9A0]',
    bg: 'bg-[#75C9A0]',
    border: 'border-[#75C9A0]/35',
    link: '/manga',
    exploreTitle: 'Jelajahi Manga',
  },
  anime: {
    badge: 'bg-[#A78BFA]/15 text-[#A78BFA] border-[#A78BFA]/30',
    text: 'text-[#A78BFA]',
    bg: 'bg-[#A78BFA]',
    border: 'border-[#A78BFA]/35',
    link: '/anime',
    exploreTitle: 'Jelajahi Anime',
  },
  donghua: {
    badge: 'bg-[#67BFD5]/15 text-[#67BFD5] border-[#67BFD5]/30',
    text: 'text-[#67BFD5]',
    bg: 'bg-[#67BFD5]',
    border: 'border-[#67BFD5]/35',
    link: '/donghua',
    exploreTitle: 'Jelajahi Donghua',
  },
  movies: {
    badge: 'bg-[#F0A15B]/15 text-[#F0A15B] border-[#F0A15B]/30',
    text: 'text-[#F0A15B]',
    bg: 'bg-[#F0A15B]',
    border: 'border-[#F0A15B]/35',
    link: '/movies',
    exploreTitle: 'Jelajahi Film & Serial',
  },
  music: {
    badge: 'bg-[#E68BA6]/15 text-[#E68BA6] border-[#E68BA6]/30',
    text: 'text-[#E68BA6]',
    bg: 'bg-[#E68BA6]',
    border: 'border-[#E68BA6]/35',
    link: '/music',
    exploreTitle: 'Jelajahi Musik',
  },
};

function formatRelativeTime(timestamp: number): string {
  if (!timestamp) return '';
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins} mnt lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  if (days === 1) return 'Kemarin';
  if (days < 30) return `${days} hari lalu`;
  return new Date(timestamp).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function BookmarksPage() {
  usePageMeta({
    title: 'Unified Library - Favorit & Bookmark',
    description: 'Pusat koleksi favorit lintas kategori Manga, Anime, Donghua, Movies & TV, serta Music di FazuraStream.',
  });

  const { byCategory, allItems, totalCount, removeBookmark, clearBookmarks } =
    useAllCategoryBookmarks();

  const [activeTab, setActiveTab] = useState<ActiveTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Filter items based on activeTab
  const baseItems: CategoryBookmarkItem[] = useMemo(() => {
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
          item.subtitle?.toLowerCase().includes(q) ||
          item.type?.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return (b.addedAt || 0) - (a.addedAt || 0);
        case 'oldest':
          return (a.addedAt || 0) - (b.addedAt || 0);
        case 'title-asc':
          return a.title.localeCompare(b.title, 'id', { sensitivity: 'base' });
        case 'title-desc':
          return b.title.localeCompare(a.title, 'id', { sensitivity: 'base' });
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

  const handleRemove = (item: CategoryBookmarkItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    removeBookmark(item.category, item.id);
    showToast(`"${item.title}" dihapus dari favorit`);
  };

  const handleClearAll = () => {
    setIsClearConfirmOpen(true);
  };

  const confirmClearBookmarks = () => {
    if (activeTab === 'all') {
      clearBookmarks();
      showToast('Semua bookmark telah dibersihkan');
    } else {
      clearBookmarks(activeTab);
      showToast(`Bookmark ${activeTab.toUpperCase()} telah dibersihkan`);
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
          <Bookmark className="w-4 h-4 text-[#F0A15B]" />
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
                <Bookmark className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white flex flex-wrap items-center gap-2 tracking-tight">
                <span>Unified Library</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#232633] text-[#F0A15B] border border-[#343744] font-mono font-normal whitespace-nowrap shrink-0">
                  {totalCount} item
                </span>
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-text-muted">
              Pusat koleksi favorit lintas kategori: Manga, Anime, Donghua, Movies, dan Music tersimpan secara lokal.
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
                title="Hapus semua item pada tab aktif"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus {activeTab === 'all' ? 'Semua' : activeTab}</span>
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
            const tabAccentMap: Record<string, string> = {
              all: '#F0A15B',
              manga: '#75C9A0',
              anime: '#A78BFA',
              donghua: '#67BFD5',
              movies: '#F0A15B',
              music: '#E68BA6',
            };
            const tabAccent = tabAccentMap[tab.id] || '#F0A15B';

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={isActive ? { borderColor: tabAccent } : undefined}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-[10px] text-xs font-semibold transition-colors shrink-0 border ${
                  isActive
                    ? 'bg-[#232633] text-[#F2F0EC]'
                    : 'bg-[#191C25] hover:bg-[#232633] text-[#A2A4B1] hover:text-[#F2F0EC] border-[#343744]'
                }`}
              >
                <span style={isActive ? { color: tabAccent } : undefined} className="inline-flex">
                  <Icon className="w-3.5 h-3.5" />
                </span>
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-[6px] font-mono ${
                    isActive ? 'bg-[#12141B] text-[#F2F0EC]' : 'bg-[#12141B] text-[#747887]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Toolbar: Search, Sort, View Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-[12px] bg-[#191C25] border border-[#343744]">
          {/* Live Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={`Cari di ${activeTab === 'all' ? 'semua' : activeTab} bookmark...`}
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

          {/* Sort & View Mode */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {/* Sorting Dropdown */}
            <div className="relative flex items-center">
              <ArrowUpDown className="w-3.5 h-3.5 text-text-muted absolute left-3 pointer-events-none" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                aria-label="Urutkan bookmark"
                className="pl-8 pr-7 py-2 text-xs bg-[#12141B] border border-[#343744] rounded-[10px] text-[#F2F0EC] focus:outline-none focus:border-[#F0A15B] appearance-none cursor-pointer"
              >
                <option value="newest">Terbaru Ditambahkan</option>
                <option value="oldest">Terlama Ditambahkan</option>
                <option value="title-asc">Judul A - Z</option>
                <option value="title-desc">Judul Z - A</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center p-0.5 rounded-[10px] bg-[#12141B] border border-[#343744]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-[#F0A15B] text-[#0B0C10]'
                    : 'text-text-muted hover:text-white'
                }`}
                title="Tampilan Grid"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-[#F0A15B] text-[#0B0C10]'
                    : 'text-text-muted hover:text-white'
                }`}
                title="Tampilan Daftar"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {baseItems.length === 0 ? (
          /* Empty State for category */
          <div className="py-20 text-center rounded-2xl bg-[#191C25] border border-[#343744] max-w-lg mx-auto p-8 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#191C25] border border-[#343744] text-[#F0A15B] flex items-center justify-center mx-auto">
              {activeTab === 'all' ? (
                <Bookmark className="w-7 h-7" />
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
              <h3 className="text-xl font-bold font-heading text-[#F2F0EC]">
                Belum Ada Bookmark {activeTab === 'all' ? '' : activeTab.toUpperCase()}
              </h3>
              <p className="text-xs sm:text-sm text-[#A2A4B1] max-w-sm mx-auto">
                Koleksi favorit Anda masih kosong. Simpan judul yang menarik saat menjelajahi katalog agar mudah diakses kembali.
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
            <div>Tidak ada bookmark yang cocok dengan pencarian &quot;{searchQuery}&quot;.</div>
            <button
              onClick={() => setSearchQuery('')}
              className="text-accent-secondary hover:underline text-xs"
            >
              Hapus pencarian
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* GRID VIEW */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-5">
            {filteredAndSortedItems.map((item) => {
              const catConfig = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.manga;
              return (
                <div
                  key={`${item.category}-${item.id}`}
                  className="group relative flex flex-col bg-[#191C25] rounded-[12px] overflow-hidden border border-[#343744] hover:border-[#F0A15B]/60 transition-all duration-200 hover:-translate-y-1"
                >
                  {/* Poster Link */}
                  <Link to={item.link} className="relative aspect-[2/3] overflow-hidden bg-[#232633] block">
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

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-80" />

                    {/* Category Badge */}
                    <div className="absolute top-2.5 left-2.5 z-10">
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-wider backdrop-blur-md ${catConfig.badge}`}
                      >
                        {item.category}
                      </span>
                    </div>

                    {/* Quick Remove Button */}
                    <button
                      onClick={(e) => handleRemove(item, e)}
                      title="Hapus dari bookmark"
                      className="absolute top-2.5 right-2.5 z-20 p-1.5 rounded-xl bg-black/70 hover:bg-rose-600 text-slate-300 hover:text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Type Badge bottom left */}
                    {item.type && (
                      <div className="absolute bottom-2 left-2.5 z-10">
                        <span className="text-[10px] font-semibold text-text-secondary bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm">
                          {item.type}
                        </span>
                      </div>
                    )}
                  </Link>

                  {/* Info Footer */}
                  <div className="p-3 flex-1 flex flex-col justify-between gap-1">
                    <Link
                      to={item.link}
                      className="font-semibold text-xs sm:text-sm text-[#F2F0EC] hover:text-[#F0A15B] transition-colors line-clamp-2 leading-snug"
                      title={item.title}
                    >
                      {item.title}
                    </Link>

                    <div className="flex items-center justify-between text-[10px] text-text-muted pt-1 border-t border-white/5">
                      <span className="truncate max-w-[65%] text-text-secondary">
                        {item.subtitle || item.category}
                      </span>
                      <span>{formatRelativeTime(item.addedAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* LIST VIEW */
          <div className="space-y-2.5">
            {filteredAndSortedItems.map((item) => {
              const catConfig = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.manga;
              return (
                <div
                  key={`${item.category}-${item.id}`}
                  className="flex items-center justify-between p-3 sm:p-4 rounded-[12px] bg-[#191C25] border border-[#343744] hover:border-[#F0A15B]/60 hover:bg-[#232633]/60 transition-colors gap-3 sm:gap-4 group"
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    {/* Thumbnail */}
                    <Link
                      to={item.link}
                      className="relative w-12 aspect-[2/3] sm:w-14 rounded-[10px] overflow-hidden shrink-0 border border-[#343744] group-hover:scale-105 transition-transform bg-[#232633]"
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
                    </Link>

                    {/* Text Details */}
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-lg text-[9px] font-bold border uppercase tracking-wider ${catConfig.badge}`}
                        >
                          {item.category}
                        </span>
                        {item.type && (
                          <span className="text-[10px] text-text-muted hidden sm:inline">
                            • {item.type}
                          </span>
                        )}
                        <span className="text-[10px] text-text-muted flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5" />
                          {formatRelativeTime(item.addedAt)}
                        </span>
                      </div>

                      <Link
                        to={item.link}
                        className="font-semibold text-[#F2F0EC] hover:text-[#F0A15B] transition-colors truncate block text-xs sm:text-sm"
                      >
                        {item.title}
                      </Link>

                      {item.subtitle && (
                        <p className="text-[11px] text-text-secondary truncate">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      to={item.link}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-[#F0A15B] hover:bg-[#F6B779] text-[#0B0C10] font-bold text-xs transition-colors"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span className="hidden sm:inline">Buka</span>
                    </Link>

                    <button
                      onClick={(e) => handleRemove(item, e)}
                      title="Hapus bookmark"
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
        title={activeTab === 'all' ? 'Hapus Seluruh Bookmark?' : `Hapus Bookmark ${activeTab.toUpperCase()}?`}
        message={
          activeTab === 'all'
            ? 'Semua item favorit di seluruh kategori akan dihapus dari penyimpanan lokal browser ini.'
            : `Semua bookmark pada kategori ${activeTab.toUpperCase()} akan dihapus dari penyimpanan lokal.`
        }
        confirmLabel="Ya, Hapus"
        onConfirm={confirmClearBookmarks}
        onCancel={() => setIsClearConfirmOpen(false)}
      />
    </div>
  );
}
