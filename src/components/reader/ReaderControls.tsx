import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Settings,
  Maximize,
  Minimize,
  ChevronLeft,
  ChevronRight,
  Layers,
  FileText,
  Columns,
  Palette,
  X,
  Compass,
  Contrast,
  SunMoon,
  Download,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import type { ReaderSettings } from '../../types/manga';

interface ReaderControlsProps {
  title: string;
  mangaSlug?: string;
  navigation: {
    next: string | null;
    prev: string | null;
  };
  visible: boolean;
  settings: ReaderSettings;
  onUpdateSettings: (settings: Partial<ReaderSettings>) => void;
  currentPage?: number;
  totalPages?: number;
  onNavigateChapter: (chapterSlug: string) => void;
  allChapters?: { title: string; slug: string }[];
  currentChapterSlug?: string;
  chapterImages?: string[];
}

export function ReaderControls({
  title,
  mangaSlug,
  navigation,
  visible,
  settings,
  onUpdateSettings,
  currentPage,
  totalPages,
  onNavigateChapter,
  allChapters = [],
  currentChapterSlug,
  chapterImages = [],
}: ReaderControlsProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<string | null>(null);
  const [isSavedOffline, setIsSavedOffline] = useState(false);

  // Check if current chapter images are cached
  React.useEffect(() => {
    if (typeof window !== 'undefined' && 'caches' in window && chapterImages.length > 0) {
      caches.open('fazura-offline-chapters-v1').then(async (cache) => {
        const firstMatch = await cache.match(chapterImages[0]);
        if (firstMatch) {
          setIsSavedOffline(true);
        }
      }).catch(() => {});
    }
  }, [chapterImages]);

  const handleSaveOffline = async () => {
    if (isDownloading || chapterImages.length === 0) return;
    if (typeof window === 'undefined' || !('caches' in window)) {
      alert('Penyimpanan offline belum didukung oleh browser Anda.');
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(`0/${chapterImages.length}`);

    try {
      const cache = await caches.open('fazura-offline-chapters-v1');
      let successCount = 0;

      for (let i = 0; i < chapterImages.length; i++) {
        const imgUrl = chapterImages[i];
        try {
          const resp = await fetch(imgUrl, { mode: 'no-cors' });
          if (resp) {
            await cache.put(imgUrl, resp);
            successCount++;
          }
        } catch {
          // continue downloading others
        }
        setDownloadProgress(`${i + 1}/${chapterImages.length}`);
      }

      setIsSavedOffline(true);
    } catch (err) {
      console.warn('Offline cache error:', err);
    } finally {
      setIsDownloading(false);
      setDownloadProgress(null);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const toggleModeQuick = () => {
    if (settings.mode === 'vertical') {
      onUpdateSettings({ mode: 'single' });
    } else {
      onUpdateSettings({ mode: 'vertical' });
    }
  };

  const toggleInvertColors = () => {
    onUpdateSettings({ invertColors: !settings.invertColors });
  };

  return (
    <>
      {/* Top Floating Control Bar (Thumb-friendly with min 44x44px touch targets) */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 bg-[#0B0C10]/95 backdrop-blur-xl border-b border-[#343744] transition-transform duration-300 ${
          visible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-4 h-16 flex items-center justify-between gap-1.5 sm:gap-3">
          {/* Back Button & Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link
              to={mangaSlug ? `/manga/${mangaSlug}` : '/manga'}
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-[10px] bg-[#191C25] hover:bg-[#232633] text-[#A2A4B1] hover:text-[#F2F0EC] border border-[#343744] flex items-center justify-center transition-colors active:scale-95 shrink-0"
              title="Kembali ke Detail Komik"
              aria-label="Kembali ke Detail Komik"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm font-bold text-[#F2F0EC] truncate max-w-[110px] xs:max-w-[150px] sm:max-w-xs md:max-w-md font-heading">
                {title}
              </h1>
              {totalPages && totalPages > 0 ? (
                <p className="text-[10px] text-[#747887] flex items-center gap-1.5 truncate">
                  <span className="capitalize font-semibold text-[#75C9A0]">{settings.mode}</span>
                  <span>•</span>
                  <span>
                    {settings.mode === 'vertical'
                      ? `${totalPages} Gambar`
                      : `Hal. ${(currentPage || 0) + 1} / ${totalPages}`}
                  </span>
                  {settings.invertColors && (
                    <span className="text-[#F0A15B] font-bold">• Invert</span>
                  )}
                </p>
              ) : null}
            </div>
          </div>

          {/* Chapter Selector Dropdown */}
          {allChapters.length > 0 && currentChapterSlug && (
            <div className="relative shrink min-w-0 hidden min-[360px]:block">
              <select
                value={currentChapterSlug}
                onChange={(e) => onNavigateChapter(e.target.value)}
                aria-label="Pilih Chapter"
                className="bg-[#191C25] text-xs text-[#F2F0EC] border border-[#343744] rounded-[10px] px-2.5 py-2.5 min-h-[44px] focus:outline-none focus:border-[#75C9A0] cursor-pointer max-w-[100px] sm:max-w-[180px] md:max-w-[220px] truncate"
              >
                {allChapters.map((ch) => (
                  <option key={ch.slug} value={ch.slug}>
                    {ch.title || ch.slug}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Action Icons (All >= 44x44px Touch Targets) */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Quick Invert Colors Toggle (Night Mode for B/W Manga) */}
            <button
              onClick={toggleInvertColors}
              title={
                settings.invertColors
                  ? 'Matikan Inversi Warna (Kembali Normal)'
                  : 'Aktifkan Inversi Warna (Night Reading Mode Komik B&W)'
              }
              aria-label="Inversi Warna Mode Malam"
              className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-[10px] flex items-center justify-center border transition-colors active:scale-95 ${
                settings.invertColors
                  ? 'bg-[#232633] text-[#F0A15B] border-[#F0A15B]'
                  : 'bg-[#191C25] hover:bg-[#232633] text-[#A2A4B1] hover:text-[#F2F0EC] border-[#343744]'
              }`}
            >
              <Contrast className="w-4 h-4" />
            </button>

            {/* Offline Chapter Saver Button */}
            {chapterImages.length > 0 && (
              <button
                onClick={handleSaveOffline}
                disabled={isDownloading}
                title={
                  isSavedOffline
                    ? 'Chapter Ini Sudah Tersimpan Offline'
                    : isDownloading
                    ? `Mengunduh... ${downloadProgress}`
                    : 'Simpan Chapter Offline untuk Dibaca Tanpa Kuota'
                }
                aria-label="Simpan Chapter Offline"
                className={`min-h-[44px] px-2.5 rounded-[10px] border flex items-center gap-1.5 text-xs font-semibold transition-colors active:scale-95 ${
                  isSavedOffline
                    ? 'bg-[#232633] text-[#75C9A0] border-[#75C9A0]/50'
                    : isDownloading
                    ? 'bg-[#232633] text-[#F0A15B] border-[#F0A15B]/50 animate-pulse'
                    : 'bg-[#191C25] hover:bg-[#232633] text-[#A2A4B1] hover:text-[#F2F0EC] border-[#343744]'
                }`}
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#F0A15B]" />
                ) : isSavedOffline ? (
                  <CheckCircle className="w-4 h-4 text-[#75C9A0]" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span className="hidden md:inline">
                  {isDownloading ? downloadProgress : isSavedOffline ? 'Tersimpan' : 'Offline'}
                </span>
              </button>
            )}

            {/* Quick Webtoon / Single Toggle */}
            <button
              onClick={toggleModeQuick}
              title={
                settings.mode === 'vertical'
                  ? 'Beralih ke Mode Single Page'
                  : 'Beralih ke Mode Webtoon Scroll'
              }
              aria-label="Beralih Mode Baca"
              className="min-h-[44px] px-2.5 sm:px-3 rounded-[10px] bg-[#191C25] hover:bg-[#232633] text-[#F2F0EC] border border-[#343744] transition-colors hidden sm:flex items-center gap-1.5 text-xs font-semibold active:scale-95"
            >
              {settings.mode === 'vertical' ? (
                <>
                  <Layers className="w-4 h-4 text-[#75C9A0]" />
                  <span className="hidden md:inline">Webtoon</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 text-[#75C9A0]" />
                  <span className="hidden md:inline">Single</span>
                </>
              )}
            </button>

            {/* Prev Chapter */}
            <button
              onClick={() => navigation.prev && onNavigateChapter(navigation.prev)}
              disabled={!navigation.prev}
              title="Chapter Sebelumnya"
              aria-label="Chapter Sebelumnya"
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-[10px] bg-[#191C25] hover:bg-[#232633] disabled:opacity-35 text-[#F2F0EC] border border-[#343744] flex items-center justify-center transition-colors active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Next Chapter */}
            <button
              onClick={() => navigation.next && onNavigateChapter(navigation.next)}
              disabled={!navigation.next}
              title="Chapter Selanjutnya"
              aria-label="Chapter Selanjutnya"
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-[10px] bg-[#F0A15B] hover:bg-[#F6B779] disabled:opacity-35 text-[#0B0C10] border border-[#F0A15B] flex items-center justify-center transition-colors active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Fullscreen (Desktop/Tablet) */}
            <button
              onClick={toggleFullscreen}
              title="Layar Penuh"
              aria-label="Layar Penuh"
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-[10px] bg-[#191C25] hover:bg-[#232633] text-[#A2A4B1] hover:text-[#F2F0EC] border border-[#343744] hidden sm:flex items-center justify-center transition-colors active:scale-95"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>

            {/* Settings Toggle */}
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              title="Pengaturan Pembaca"
              aria-label="Pengaturan Pembaca"
              className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-[10px] border flex items-center justify-center transition-colors active:scale-95 ${
                settingsOpen
                  ? 'bg-[#F0A15B] text-[#0B0C10] border-[#F0A15B]'
                  : 'bg-[#191C25] hover:bg-[#232633] text-[#A2A4B1] hover:text-[#F2F0EC] border-[#343744]'
              }`}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Settings Modal / Bottom Sheet */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0C10]/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-[#191C25] border border-[#343744] p-5 shadow-dialog space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#343744] pb-3">
              <h3 className="text-sm font-bold text-[#F2F0EC] flex items-center gap-2 font-heading">
                <Settings className="w-4 h-4 text-[#75C9A0]" />
                Pengaturan Pembaca
              </h3>
              <button
                onClick={() => setSettingsOpen(false)}
                aria-label="Tutup Pengaturan"
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-[10px] text-[#747887] hover:text-[#F2F0EC] hover:bg-[#232633] flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Invert Colors (Night Reading Mode) Toggle Card */}
            <div className="p-3 rounded-[12px] bg-[#12141B] border border-[#343744] space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <label className="text-xs font-bold text-[#F2F0EC] flex items-center gap-1.5">
                    <SunMoon className="w-4 h-4 text-[#F0A15B]" />
                    Invert Colors (Mode Malam)
                  </label>
                  <p className="text-[11px] text-[#747887]">
                    Inversi warna gambar khusus manga hitam-putih agar tidak silau di ruangan gelap.
                  </p>
                </div>
                <button
                  onClick={toggleInvertColors}
                  role="switch"
                  aria-checked={Boolean(settings.invertColors)}
                  className={`w-12 h-7 rounded-full p-1 transition-colors relative shrink-0 min-w-[44px] ${
                    settings.invertColors ? 'bg-[#F0A15B]' : 'bg-[#343744]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-[#0B0C10] shadow-md transform transition-transform ${
                      settings.invertColors ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Reading Mode */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#A2A4B1] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#75C9A0]" />
                Mode Membaca
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => onUpdateSettings({ mode: 'vertical' })}
                  className={`min-h-[44px] py-2 px-2 rounded-[10px] text-xs font-semibold border flex flex-col items-center justify-center gap-1 transition-colors active:scale-95 ${
                    settings.mode === 'vertical'
                      ? 'bg-[#232633] border-[#75C9A0] text-[#75C9A0]'
                      : 'bg-[#12141B] border-[#343744] text-[#A2A4B1] hover:text-[#F2F0EC]'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  Webtoon
                </button>
                <button
                  onClick={() => onUpdateSettings({ mode: 'single' })}
                  className={`min-h-[44px] py-2 px-2 rounded-[10px] text-xs font-semibold border flex flex-col items-center justify-center gap-1 transition-colors active:scale-95 ${
                    settings.mode === 'single'
                      ? 'bg-[#232633] border-[#75C9A0] text-[#75C9A0]'
                      : 'bg-[#12141B] border-[#343744] text-[#A2A4B1] hover:text-[#F2F0EC]'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Single
                </button>
                <button
                  onClick={() => onUpdateSettings({ mode: 'double' })}
                  className={`min-h-[44px] py-2 px-2 rounded-[10px] text-xs font-semibold border flex flex-col items-center justify-center gap-1 transition-colors active:scale-95 ${
                    settings.mode === 'double'
                      ? 'bg-[#232633] border-[#75C9A0] text-[#75C9A0]'
                      : 'bg-[#12141B] border-[#343744] text-[#A2A4B1] hover:text-[#F2F0EC]'
                  }`}
                >
                  <Columns className="w-4 h-4" />
                  Double
                </button>
              </div>
            </div>

            {/* Image Fit */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#A2A4B1]">Ukuran Gambar (Fit)</label>
              <div className="grid grid-cols-3 gap-2">
                {(['width', 'height', 'original'] as const).map((fit) => (
                  <button
                    key={fit}
                    onClick={() => onUpdateSettings({ fit })}
                    className={`min-h-[44px] py-2 px-2 rounded-[10px] text-xs font-medium border capitalize flex items-center justify-center transition-colors active:scale-95 ${
                      settings.fit === fit
                        ? 'bg-[#232633] border-[#75C9A0] text-[#75C9A0]'
                        : 'bg-[#12141B] border-[#343744] text-[#A2A4B1] hover:text-[#F2F0EC]'
                    }`}
                  >
                    {fit === 'width' ? 'Fit Lebar' : fit === 'height' ? 'Fit Tinggi' : 'Asli'}
                  </button>
                ))}
              </div>
            </div>

            {/* Background Color */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#A2A4B1] flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-[#75C9A0]" />
                Latar Belakang
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'dark', label: 'Obsidian', color: '#0B0C10' },
                  { key: 'black', label: 'Hitam Pekat', color: '#000000' },
                  { key: 'gray', label: 'Charcoal', color: '#191C25' },
                ].map((bg) => (
                  <button
                    key={bg.key}
                    onClick={() => onUpdateSettings({ background: bg.key as any })}
                    className={`min-h-[44px] py-2 px-2 rounded-[10px] text-xs font-medium border flex items-center justify-center gap-1.5 transition-colors active:scale-95 ${
                      settings.background === bg.key
                        ? 'border-[#75C9A0] text-[#F2F0EC] bg-[#232633]'
                        : 'border-[#343744] text-[#A2A4B1] hover:text-[#F2F0EC] bg-[#12141B]'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-[#454958]"
                      style={{ backgroundColor: bg.color }}
                    />
                    {bg.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Webtoon Panel Spacing */}
            {settings.mode === 'vertical' && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#A2A4B1]">
                  Jarak Antar Panel Webtoon
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: 0, label: 'Rapat' },
                    { value: 8, label: 'Kecil' },
                    { value: 12, label: 'Normal' },
                    { value: 24, label: 'Lebar' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => onUpdateSettings({ gap: opt.value })}
                      className={`min-h-[40px] py-1.5 px-2 rounded-[8px] text-xs font-medium border transition-colors ${
                        settings.gap === opt.value
                          ? 'bg-[#232633] border-[#75C9A0] text-[#75C9A0]'
                          : 'bg-[#12141B] border-[#343744] text-[#A2A4B1] hover:text-[#F2F0EC]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Direction */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#A2A4B1] flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#75C9A0]" />
                Arah Baca (Single / Double)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onUpdateSettings({ direction: 'ltr' })}
                  className={`min-h-[44px] py-2 px-3 rounded-[10px] text-xs font-medium border flex items-center justify-center transition-colors active:scale-95 ${
                    settings.direction === 'ltr'
                      ? 'bg-[#232633] border-[#75C9A0] text-[#75C9A0]'
                      : 'bg-[#12141B] border-[#343744] text-[#A2A4B1] hover:text-[#F2F0EC]'
                  }`}
                >
                  Kiri ke Kanan (LTR)
                </button>
                <button
                  onClick={() => onUpdateSettings({ direction: 'rtl' })}
                  className={`min-h-[44px] py-2 px-3 rounded-[10px] text-xs font-medium border flex items-center justify-center transition-colors active:scale-95 ${
                    settings.direction === 'rtl'
                      ? 'bg-[#232633] border-[#75C9A0] text-[#75C9A0]'
                      : 'bg-[#12141B] border-[#343744] text-[#A2A4B1] hover:text-[#F2F0EC]'
                  }`}
                >
                  Kanan ke Kiri (Manga)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
