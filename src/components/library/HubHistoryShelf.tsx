import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
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
import {
  CATEGORY_THEMES,
  createPosterFallbackSvg,
  type MediaCategory,
} from '../../utils/categoryTheme';
import { SectionHeader } from '../common/SectionHeader';
import { ConfirmModal } from '../ConfirmModal';

interface HubHistoryShelfProps {
  category: CategoryType;
  title?: string;
  subtitle?: string;
  showWhenEmpty?: boolean;
}

const DEFAULT_META: Record<
  CategoryType,
  { title: string; subtitle: string; actionLabel: string }
> = {
  anime: {
    title: 'Lanjutkan Nonton Anime',
    subtitle: 'Lanjutkan episode anime terakhir yang Anda tonton',
    actionLabel: 'Lanjut Nonton',
  },
  donghua: {
    title: 'Lanjutkan Nonton Donghua',
    subtitle: 'Lanjutkan serial donghua terakhir yang Anda ikuti',
    actionLabel: 'Lanjut Nonton',
  },
  movies: {
    title: 'Lanjutkan Nonton Film & Series',
    subtitle: 'Lanjutkan film atau serial TV yang sempat tertunda',
    actionLabel: 'Lanjut Putar',
  },
  music: {
    title: 'Lagu Terakhir Diputar',
    subtitle: 'Putar kembali lagu yang terakhir kali Anda dengarkan',
    actionLabel: 'Putar Lagu',
  },
  manga: {
    title: 'Lanjutkan Baca Komik',
    subtitle: 'Buka kembali chapter terakhir manga, manhwa, atau manhua',
    actionLabel: 'Lanjut Baca',
  },
};

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
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const carouselId = `hub-history-carousel-${category}`;
  const theme = CATEGORY_THEMES[category as MediaCategory];
  const meta = DEFAULT_META[category];
  const fallbackPoster = React.useMemo(
    () => createPosterFallbackSvg(theme.label.toUpperCase(), theme.accentHex),
    [theme.label, theme.accentHex]
  );

  const scrollCarousel = (direction: 'left' | 'right') => {
    const el = document.getElementById(carouselId);
    if (el) {
      el.scrollBy({ left: direction === 'left' ? -340 : 340, behavior: 'smooth' });
    }
  };

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
    } else if (item.lastItemLink) {
      e.preventDefault();
      navigate(item.lastItemLink);
    }
  };

  return (
    <section className="w-full space-y-4">
      <SectionHeader
        category={category as MediaCategory}
        title={title || meta.title}
        subtitle={subtitle || meta.subtitle}
        viewAllTo={history.length > 0 ? `/history?tab=${category}` : undefined}
        viewAllLabel="Semua Riwayat"
        rightSlot={
          history.length > 0 ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setConfirmClearOpen(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[6px] text-xs font-medium text-[#A2A4B1] hover:text-rose-400 hover:bg-[#191C25] border border-transparent hover:border-[#343744] transition-colors cursor-pointer"
                title="Bersihkan riwayat kategori ini"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Bersihkan</span>
              </button>

              <div className="hidden sm:flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => scrollCarousel('left')}
                  className="w-8 h-8 rounded-[6px] bg-[#191C25] border border-[#343744] hover:border-[#454958] text-[#A2A4B1] hover:text-[#F2F0EC] flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Scroll Kiri"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollCarousel('right')}
                  className="w-8 h-8 rounded-[6px] bg-[#191C25] border border-[#343744] hover:border-[#454958] text-[#A2A4B1] hover:text-[#F2F0EC] flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Scroll Kanan"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : undefined
        }
      />

      {history.length > 0 ? (
        <div
          id={carouselId}
          className="flex items-stretch gap-3.5 overflow-x-auto scrollbar-none snap-x snap-mandatory py-1 scroll-smooth"
        >
          {history.map((item) => {
            const resumeTarget = item.lastItemLink || `/${category}`;

            return (
              <div
                key={`${item.category}-${item.id}`}
                className="w-64 sm:w-72 shrink-0 snap-start flex flex-col justify-between p-3.5 rounded-[10px] bg-[#191C25] border border-[#343744] hover:border-[#454958] transition-colors duration-150 group relative"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    removeHistoryItem(item.id);
                  }}
                  title="Hapus dari riwayat"
                  aria-label={`Hapus ${item.title} dari riwayat`}
                  className="absolute top-2.5 right-2.5 z-20 p-1.5 rounded-[6px] bg-[#12141B] text-[#747887] hover:text-rose-400 border border-[#343744] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-start gap-3">
                  <div className="relative w-14 aspect-[2/3] rounded-[6px] overflow-hidden bg-[#12141B] shrink-0 border border-[#343744]">
                    <img
                      src={item.cover || (item.category === 'music' ? MUSIC_FALLBACK_SVG : fallbackPoster)}
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
                        (e.currentTarget as HTMLImageElement).src = fallbackPoster;
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 pr-5 space-y-1">
                    <span className="text-[11px] text-[#747887] font-medium block">
                      {formatRelativeTime(item.watchedAt)}
                    </span>
                    <h3 className="text-[13px] font-semibold text-[#F2F0EC] truncate group-hover:text-[#F0A15B] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#A2A4B1] truncate">
                      {item.lastItemTitle || item.extra?.artist || 'Terakhir diakses'}
                    </p>

                    {typeof item.progress === 'number' && item.progress > 0 && (
                      <div className="pt-1.5">
                        <div className="w-full bg-[#232633] h-1 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, Math.round(item.progress * 100))}%`,
                              backgroundColor: theme.accentHex,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#343744]/70 flex items-center justify-between">
                  <span className="text-[11px] text-[#747887]">
                    {item.progress ? `${Math.round(item.progress * 100)}% selesai` : theme.label}
                  </span>
                  <Link
                    to={resumeTarget}
                    onClick={(e) => handleActionClick(e, item)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[6px] bg-[#F0A15B] hover:bg-[#F6B779] text-[#0B0C10] text-xs font-semibold transition-colors"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{meta.actionLabel}</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-6 rounded-[10px] bg-[#191C25] border border-[#343744] text-center">
          <p className="text-xs text-[#A2A4B1]">
            Belum ada riwayat {theme.label.toLowerCase()}. Mulai jelajahi katalog untuk menyimpannya di sini.
          </p>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmClearOpen}
        title={`Bersihkan Riwayat ${theme.label}?`}
        message={`Seluruh riwayat ${theme.label.toLowerCase()} lokal akan dihapus. Koleksi favorit Anda tidak akan terpengaruh.`}
        confirmLabel="Hapus Riwayat"
        variant="danger"
        onConfirm={() => {
          clearHistory();
          setConfirmClearOpen(false);
        }}
        onCancel={() => setConfirmClearOpen(false)}
      />
    </section>
  );
}
