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
  RotateCcw,
} from 'lucide-react';
import {
  useAllCategoryHistory,
} from '../services/categoryStorage';
import type {
  CategoryType,
  CategoryHistoryItem,
} from '../services/categoryStorage';
import { BackupRestoreModal } from '../components/library/BackupRestoreModal';

type ActiveTab = 'all' | CategoryType;
type SortOption = 'recent' | 'oldest' | 'title-asc';

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
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    text: 'text-emerald-400',
    bg: 'bg-emerald-500',
    border: 'border-emerald-500/30',
    link: '/manga',
    exploreTitle: 'Jelajahi Manga',
    resumeAction: 'Lanjut Baca',
  },
  anime: {
    badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    text: 'text-purple-400',
    bg: 'bg-purple-500',
    border: 'border-purple-500/30',
    link: '/anime',
    exploreTitle: 'Jelajahi Anime',
    resumeAction: 'Lanjut Nonton',
  },
  donghua: {
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    text: 'text-amber-400',
    bg: 'bg-amber-500',
    border: 'border-amber-500/30',
    link: '/donghua',
    exploreTitle: 'Jelajahi Donghua',
    resumeAction: 'Lanjut Nonton',
  },
  movies: {
    badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    text: 'text-rose-400',
    bg: 'bg-rose-500',
    border: 'border-rose-500/30',
    link: '/movies',
    exploreTitle: 'Jelajahi Film & Serial',
    resumeAction: 'Lanjut Putar',
  },
  music: {
    badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    text: 'text-cyan-400',
    bg: 'bg-cyan-500',
    border: 'border-cyan-500/30',
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
  const { byCategory, allItems, totalCount, removeHistoryItem, clearHistory } =
    useAllCategoryHistory();

  const [activeTab, setActiveTab] = useState<ActiveTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('recent');
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
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
    const targetLabel = activeTab === 'all' ? 'seluruh riwayat tontonan/bacaan' : `riwayat kategori ${activeTab.toUpperCase()}`;
    if (window.confirm(`Apakah Anda yakin ingin menghapus ${targetLabel}? Tindakan ini tidak dapat dibatalkan.`)) {
      if (activeTab === 'all') {
        clearHistory();
        showToast('Semua riwayat telah dibersihkan');
      } else {
        clearHistory(activeTab);
        showToast(`Riwayat ${activeTab.toUpperCase()} telah dibersihkan`);
      }
    }
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
        <div className="fixed bottom-20 sm:bottom-8 right-4 sm:right-8 z-50 px-4 py-2.5 rounded-2xl bg-surface border border-accent-primary/40 text-xs sm:text-sm font-semibold text-white shadow-2xl shadow-accent-primary/20 animate-in fade-in slide-in-from-bottom-2 duration-200 flex items-center gap-2">
          <History className="w-4 h-4 text-accent-primary" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary">
                <History className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5 tracking-tight">
                Riwayat Aktivitas
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-accent-primary/10 text-accent-secondary border border-accent-primary/20 font-mono font-normal">
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
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-surface hover:bg-surface-elevated text-text-secondary hover:text-white border border-white/10 hover:border-accent-primary/40 transition-all shadow-sm"
              title="Backup & Restore Data"
            >
              <Database className="w-3.5 h-3.5 text-accent-primary" />
              <span>Backup / Restore</span>
            </button>

            {baseItems.length > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
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
                    ? 'bg-accent-primary text-white border-accent-primary shadow-lg shadow-accent-primary/20'
                    : 'bg-surface/80 hover:bg-surface text-text-secondary hover:text-white border-white/5'
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
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-surface/60 border border-white/5">
          {/* Live Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={`Cari di riwayat ${activeTab === 'all' ? 'semua' : activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-bg-primary/80 border border-white/10 rounded-xl text-white placeholder-text-muted focus:outline-none focus:border-accent-primary transition-colors"
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

          {/* Sort Selection */}
          <div className="relative flex items-center self-end sm:self-auto shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-text-muted absolute left-3 pointer-events-none" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              aria-label="Urutkan riwayat"
              className="pl-8 pr-7 py-2 text-xs bg-bg-primary/80 border border-white/10 rounded-xl text-text-secondary focus:outline-none focus:border-accent-primary appearance-none cursor-pointer"
            >
              <option value="recent">Terakhir Dilihat</option>
              <option value="oldest">Terlama Dilihat</option>
              <option value="title-asc">Judul A - Z</option>
            </select>
          </div>
        </div>

        {/* History Items Display */}
        {baseItems.length === 0 ? (
          /* Empty State for category */
          <div className="py-20 text-center rounded-3xl bg-surface/30 border border-white/5 max-w-lg mx-auto p-8 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-accent-primary/10 border border-accent-primary/20 text-accent-primary flex items-center justify-center mx-auto">
              {activeTab === 'all' ? (
                <History className="w-8 h-8" />
              ) : activeTab === 'manga' ? (
                <BookOpen className="w-8 h-8 text-emerald-400" />
              ) : activeTab === 'anime' ? (
                <Tv className="w-8 h-8 text-purple-400" />
              ) : activeTab === 'donghua' ? (
                <Film className="w-8 h-8 text-amber-400" />
              ) : activeTab === 'movies' ? (
                <Clapperboard className="w-8 h-8 text-rose-400" />
              ) : (
                <Music className="w-8 h-8 text-cyan-400" />
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
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-accent-primary hover:bg-accent-primary/90 text-white font-bold text-xs sm:text-sm shadow-lg shadow-accent-primary/25 transition-all hover:scale-105"
            >
              <Compass className="w-4 h-4" />
              <span>{getExploreTitle()}</span>
            </Link>
          </div>
        ) : filteredAndSortedItems.length === 0 ? (
          /* Search Empty State */
          <div className="py-16 text-center text-xs sm:text-sm text-text-muted bg-surface/20 rounded-2xl border border-white/5 space-y-2">
            <div>Tidak ada riwayat yang cocok dengan pencarian &quot;{searchQuery}&quot;.</div>
            <button
              onClick={() => setSearchQuery('')}
              className="text-accent-secondary hover:underline text-xs"
            >
              Hapus pencarian
            </button>
          </div>
        ) : (
          /* History Cards Grid (2-column on md+) */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
            {filteredAndSortedItems.map((item) => {
              const catConfig = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.manga;
              return (
                <div
                  key={`${item.category}-${item.id}-${item.lastItemLink}`}
                  className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-surface border border-white/5 hover:border-accent-primary/40 hover:bg-surface-elevated/40 shadow-lg shadow-black/20 transition-all gap-3.5 sm:gap-4 group"
                >
                  {/* Left: Thumbnail & Info */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {/* Thumbnail */}
                    <Link
                      to={item.lastItemLink || '#'}
                      className="relative w-14 h-20 sm:w-16 sm:h-22 rounded-xl overflow-hidden shrink-0 border border-white/10 group-hover:scale-105 transition-transform bg-bg-secondary"
                    >
                      <img
                        src={item.cover}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60';
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
                        className="font-bold text-white hover:text-accent-primary transition-colors truncate block text-xs sm:text-sm leading-snug"
                        title={item.title}
                      >
                        {item.title}
                      </Link>

                      {/* Last Item Pill (Episode/Chapter) */}
                      {item.lastItemTitle && (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-accent-secondary truncate">
                          <PlayCircle className="w-3.5 h-3.5 text-accent-primary shrink-0" />
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
                              className="bg-accent-primary h-full rounded-full transition-all duration-300"
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
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-accent-primary hover:bg-accent-primary/90 text-white font-bold text-xs shadow-md shadow-accent-primary/20 transition-all hover:scale-105 active:scale-95"
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
    </div>
  );
}
