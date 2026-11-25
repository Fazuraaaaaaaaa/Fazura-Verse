import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  RotateCcw,
  Play,
  BookOpen,
  Film,
  Music,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import {
  useCategoryHistory,
  type CategoryType,
  type CategoryHistoryItem,
} from '../../services/categoryStorage';
import { useMusic } from '../../context/MusicContext';
import {
  MUSIC_FALLBACK_SVG,
  handleMusicImageError,
  handleMusicImageLoad,
} from '../../utils/musicThumbnail';

interface HubHistoryShelfProps {
  category: CategoryType;
  title?: string;
  subtitle?: string;
  showWhenEmpty?: boolean;
}

function formatRelativeTime(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return 'Baru saja';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} mnt lalu`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} jam lalu`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Kemarin';
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return new Date(timestamp).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
  });
}

export function HubHistoryShelf({
  category,
  title,
  subtitle,
  showWhenEmpty = false,
}: HubHistoryShelfProps) {
  const { history, removeHistoryItem, clearHistory } = useCategoryHistory(category);
  const { playTrack } = useMusic();
  const navigate = useNavigate();

  const carouselId = `hub-history-carousel-${category}`;

  const scrollCarousel = (direction: 'left' | 'right') => {
    const el = document.getElementById(carouselId);
    if (el) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Category Theme Colors & Default Titles
  const config = {
    anime: {
      defaultTitle: 'Lanjutkan Nonton Anime',
      defaultSubtitle: 'Lanjutkan episode anime terakhir yang Anda tonton',
      badgeBg: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
      accentColor: '#F59E0B',
      btnBg: 'bg-amber-500 hover:bg-amber-400 text-black',
      icon: Film,
      actionLabel: 'Lanjut Nonton',
    },
    donghua: {
      defaultTitle: 'Lanjutkan Nonton Donghua',
      defaultSubtitle: 'Lanjutkan serial kultivasi 3D & 2D terakhir Anda',
      badgeBg: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
      accentColor: '#10B981',
      btnBg: 'bg-emerald-500 hover:bg-emerald-400 text-black',
      icon: Film,
      actionLabel: 'Lanjut Nonton',
    },
    movies: {
      defaultTitle: 'Lanjutkan Nonton Film & Series',
      defaultSubtitle: 'Lanjutkan tontonan bioskop box office atau serial TV Anda',
      badgeBg: 'bg-rose-500/20 border-rose-500/30 text-rose-400',
      accentColor: '#F43F5E',
      btnBg: 'bg-rose-500 hover:bg-rose-400 text-white',
      icon: Film,
      actionLabel: 'Lanjut Nonton',
    },
    music: {
      defaultTitle: 'Lagu Terakhir Diputar',
      defaultSubtitle: 'Daftar lagu yang baru-baru ini Anda dengarkan',
      badgeBg: 'bg-[#1DB954]/20 border-[#1DB954]/30 text-[#1DB954]',
      accentColor: '#1DB954',
      btnBg: 'bg-[#1DB954] hover:bg-[#1ed760] text-black',
      icon: Music,
      actionLabel: 'Putar Lagu',
    },
    manga: {
      defaultTitle: 'Lanjutkan Baca Komik',
      defaultSubtitle: 'Lanjutkan chapter manga, manhwa, atau manhua Anda',
      badgeBg: 'bg-[#8B5CF6]/20 border-[#8B5CF6]/30 text-[#A78BFA]',
      accentColor: '#8B5CF6',
      btnBg: 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white',
      icon: BookOpen,
      actionLabel: 'Lanjut Baca',
    },
  }[category];

  const headerTitle = title || config.defaultTitle;
  const headerSubtitle = subtitle || config.defaultSubtitle;
  const IconComponent = config.icon;

  if (history.length === 0 && !showWhenEmpty) {
    return null;
  }

  const handleActionClick = (e: React.MouseEvent, item: CategoryHistoryItem) => {
    if (category === 'music') {
      e.preventDefault();
      playTrack({
        id: item.id,
        youtubeId: item.extra?.youtubeId || item.id,
        title: item.title,
        artist: item.extra?.artist || 'FazuraStream Music',
        album: item.extra?.album,
        thumbnail: item.cover,
        durationFormatted: item.extra?.durationFormatted,
      });
    } else {
      // Normal navigation
      if (item.lastItemLink) {
        e.preventDefault();
        navigate(item.lastItemLink);
      }
    }
  };

  return (
    <section className="w-full space-y-4 animate-in fade-in duration-300">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${config.badgeBg}`}>
              <RotateCcw className="w-3 h-3 animate-spin-slow" />
              RIWAYAT TERAKHIR
            </span>
            <span className="text-xs text-slate-400 font-mono font-semibold">
              ({history.length} tersimpan)
            </span>
          </div>
          <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 font-heading">
            <IconComponent className="w-5 h-5" style={{ color: config.accentColor }} />
            <span>{headerTitle}</span>
          </h2>
          <p className="text-xs text-slate-400">{headerSubtitle}</p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {history.length > 0 && (
            <>
              <button
                onClick={() => {
                  if (window.confirm(`Hapus semua riwayat ${category}?`)) {
                    clearHistory();
                  }
                }}
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all flex items-center gap-1.5"
                title="Bersihkan riwayat kategori ini"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Bersihkan</span>
              </button>

              <Link
                to={`/history?tab=${category}`}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center gap-1"
              >
                <span>Lihat Semua</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>

              {/* Scroll buttons for desktop */}
              <div className="hidden sm:flex items-center gap-1 pl-1">
                <button
                  onClick={() => scrollCarousel('left')}
                  className="p-1.5 rounded-xl bg-surface/80 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white transition-colors"
                  aria-label="Scroll Kiri"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollCarousel('right')}
                  className="p-1.5 rounded-xl bg-surface/80 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white transition-colors"
                  aria-label="Scroll Kanan"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* History Items Carousel */}
      {history.length > 0 ? (
        <div
          id={carouselId}
          className="flex items-stretch gap-3.5 overflow-x-auto scrollbar-none snap-x snap-mandatory py-2 scroll-smooth"
        >
          {history.map((item) => {
            const resumeTarget = item.lastItemLink || `/${category}`;

            return (
              <div
                key={`${item.category}-${item.id}`}
                className="w-64 sm:w-72 shrink-0 snap-start flex flex-col justify-between p-3 rounded-2xl bg-[#141824]/90 hover:bg-[#1a2030] border border-white/5 hover:border-white/15 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group relative overflow-hidden"
              >
                {/* Delete button on hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    removeHistoryItem(item.id);
                  }}
                  title="Hapus dari riwayat"
                  className="absolute top-2 right-2 z-20 p-1.5 rounded-lg bg-black/60 text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-start gap-3">
                  {/* Poster Thumbnail */}
                  <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-white/10 shadow-md">
                    <img
                      src={item.cover || (item.category === 'music' ? MUSIC_FALLBACK_SVG : '')}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      onLoad={(e) => {
                        if (item.category === 'music') {
                          handleMusicImageLoad(e);
                        }
                      }}
                      onError={(e) => {
                        if (item.category === 'music') {
                          handleMusicImageError(e);
                          return;
                        }
                        (e.target as HTMLImageElement).src =
                          "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%22%20height%3D%22140%22%20viewBox%3D%220%200%20100%20140%22%3E%3Crect%20fill%3D%22%23141824%22%20width%3D%22100%22%20height%3D%22140%22%2F%3E%3C/svg%3E";
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </div>

                  {/* Metadata */}
                  <div className="flex-1 min-w-0 pr-5">
                    <span className="text-[10px] text-slate-400 font-medium">
                      {formatRelativeTime(item.watchedAt)}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-amber-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-slate-300 font-semibold truncate mt-0.5">
                      {item.lastItemTitle || item.extra?.artist || 'Terakhir diakses'}
                    </p>

                    {/* Progress Bar if available */}
                    {typeof item.progress === 'number' && item.progress > 0 && (
                      <div className="mt-2 w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, Math.round(item.progress * 100))}%`,
                            backgroundColor: config.accentColor,
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Resume Action Bar */}
                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {item.progress ? `${Math.round(item.progress * 100)}% selesai` : 'Tersedia'}
                  </span>
                  <Link
                    to={resumeTarget}
                    onClick={(e) => handleActionClick(e, item)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-sm ${config.btnBg}`}
                  >
                    {category === 'music' ? (
                      <Play className="w-3 h-3 fill-current" />
                    ) : (
                      <Play className="w-3 h-3 fill-current" />
                    )}
                    <span>{config.actionLabel}</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-[#141824]/50 border border-white/5 text-center space-y-2">
          <p className="text-xs text-slate-400">
            Belum ada riwayat tontonan/bacaan untuk kategori ini.
          </p>
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
            <Sparkles className="w-3 h-3 text-amber-400" /> Jelajahi katalog di bawah untuk mulai!
          </span>
        </div>
      )}
    </section>
  );
}
