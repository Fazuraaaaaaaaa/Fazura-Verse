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
}: ReaderControlsProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  return (
    <>
      {/* Top Floating Control Bar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 bg-[#090912]/90 backdrop-blur-md border-b border-white/10 transition-transform duration-300 ${
          visible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-2 sm:gap-3">
          {/* Back Button & Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link
              to={mangaSlug ? `/manga/${mangaSlug}` : '/manga'}
              className="p-2 rounded-xl bg-surface hover:bg-surface-elevated text-slate-300 hover:text-white border border-white/10 transition-colors shrink-0"
              title="Kembali ke Detail Komik"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm font-bold text-white truncate max-w-[130px] sm:max-w-xs md:max-w-md font-heading">
                {title}
              </h1>
              {totalPages && totalPages > 0 ? (
                <p className="text-[10px] text-text-muted flex items-center gap-1.5">
                  <span className="capitalize font-semibold text-accent-soft">{settings.mode}</span>
                  <span>•</span>
                  <span>
                    {settings.mode === 'vertical'
                      ? `${totalPages} Gambar`
                      : `Hal. ${(currentPage || 0) + 1} / ${totalPages}`}
                  </span>
                </p>
              ) : null}
            </div>
          </div>

          {/* Quick Chapter Selector Dropdown (visible on tablet & mobile) */}
          {allChapters.length > 0 && currentChapterSlug && (
            <div className="relative shrink min-w-0">
              <select
                value={currentChapterSlug}
                onChange={(e) => onNavigateChapter(e.target.value)}
                className="bg-surface text-xs text-slate-200 border border-white/10 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-accent-primary cursor-pointer max-w-[120px] sm:max-w-[180px] md:max-w-[220px] truncate"
              >
                {allChapters.map((ch) => (
                  <option key={ch.slug} value={ch.slug}>
                    {ch.title || ch.slug}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Action Icons */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Quick Webtoon / Single Toggle */}
            <button
              onClick={toggleModeQuick}
              title={
                settings.mode === 'vertical'
                  ? 'Beralih ke Mode Single Page'
                  : 'Beralih ke Mode Webtoon Scroll'
              }
              className="p-2 rounded-xl bg-surface hover:bg-surface-elevated text-accent-soft hover:text-white border border-white/10 transition-colors hidden xs:flex items-center gap-1 text-xs font-semibold"
            >
              {settings.mode === 'vertical' ? (
                <>
                  <Layers className="w-4 h-4 text-accent-primary" />
                  <span className="hidden md:inline">Webtoon</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 text-accent-primary" />
                  <span className="hidden md:inline">Single</span>
                </>
              )}
            </button>

            {/* Prev Chapter */}
            <button
              onClick={() => navigation.prev && onNavigateChapter(navigation.prev)}
              disabled={!navigation.prev}
              title="Chapter Sebelumnya"
              className="p-2 rounded-xl bg-surface hover:bg-surface-elevated disabled:opacity-30 disabled:hover:bg-surface text-slate-300 hover:text-white border border-white/10 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Next Chapter */}
            <button
              onClick={() => navigation.next && onNavigateChapter(navigation.next)}
              disabled={!navigation.next}
              title="Chapter Selanjutnya"
              className="p-2 rounded-xl bg-accent-primary hover:bg-accent-primary/90 disabled:opacity-30 text-white border border-accent-soft transition-colors shadow-sm shadow-accent-primary/20"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              title="Layar Penuh"
              className="p-2 rounded-xl bg-surface hover:bg-surface-elevated text-slate-300 hover:text-white border border-white/10 transition-colors hidden sm:block"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>

            {/* Settings Toggle */}
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              title="Pengaturan Pembaca"
              className={`p-2 rounded-xl border border-white/10 transition-colors ${
                settingsOpen
                  ? 'bg-accent-primary text-white border-accent-soft'
                  : 'bg-surface hover:bg-surface-elevated text-slate-300 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Settings Modal / Bottom Sheet */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-surface border border-white/10 p-5 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-heading">
                <Settings className="w-4 h-4 text-accent-primary" />
                Pengaturan Pembaca
              </h3>
              <button
                onClick={() => setSettingsOpen(false)}
                className="p-1 rounded-lg text-text-muted hover:text-white hover:bg-surface-elevated transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Reading Mode */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-accent-primary" />
                Mode Membaca
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => onUpdateSettings({ mode: 'vertical' })}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold border flex flex-col items-center gap-1 transition-all ${
                    settings.mode === 'vertical'
                      ? 'bg-accent-primary/20 border-accent-primary text-accent-soft shadow-sm'
                      : 'bg-surface-elevated border-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Layers className="w-4 h-4 text-accent-primary" />
                  Webtoon
                </button>
                <button
                  onClick={() => onUpdateSettings({ mode: 'single' })}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold border flex flex-col items-center gap-1 transition-all ${
                    settings.mode === 'single'
                      ? 'bg-accent-primary/20 border-accent-primary text-accent-soft shadow-sm'
                      : 'bg-surface-elevated border-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-4 h-4 text-accent-primary" />
                  Single
                </button>
                <button
                  onClick={() => onUpdateSettings({ mode: 'double' })}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold border flex flex-col items-center gap-1 transition-all ${
                    settings.mode === 'double'
                      ? 'bg-accent-primary/20 border-accent-primary text-accent-soft shadow-sm'
                      : 'bg-surface-elevated border-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Columns className="w-4 h-4 text-accent-primary" />
                  Double
                </button>
              </div>
            </div>

            {/* Image Fit */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Ukuran Gambar (Fit)</label>
              <div className="grid grid-cols-3 gap-2">
                {(['width', 'height', 'original'] as const).map((fit) => (
                  <button
                    key={fit}
                    onClick={() => onUpdateSettings({ fit })}
                    className={`py-1.5 px-2 rounded-xl text-xs font-medium border capitalize transition-all ${
                      settings.fit === fit
                        ? 'bg-accent-primary/20 border-accent-primary text-accent-soft shadow-sm'
                        : 'bg-surface-elevated border-white/5 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {fit === 'width' ? 'Fit Lebar' : fit === 'height' ? 'Fit Tinggi' : 'Asli'}
                  </button>
                ))}
              </div>
            </div>

            {/* Background Color */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-accent-soft" />
                Latar Belakang
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'dark', label: 'Dark Navy', color: '#090912' },
                  { key: 'black', label: 'Hitam Pekat', color: '#000000' },
                  { key: 'gray', label: 'Abu Lembut', color: '#181827' },
                ].map((bg) => (
                  <button
                    key={bg.key}
                    onClick={() => onUpdateSettings({ background: bg.key as any })}
                    className={`py-2 px-2 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                      settings.background === bg.key
                        ? 'border-accent-primary text-white bg-accent-primary/10'
                        : 'border-white/5 text-slate-400 hover:text-white bg-surface-elevated'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-white/20"
                      style={{ backgroundColor: bg.color }}
                    />
                    {bg.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Direction */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-accent-soft" />
                Arah Baca (Single / Double)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onUpdateSettings({ direction: 'ltr' })}
                  className={`py-1.5 px-3 rounded-xl text-xs font-medium border transition-all ${
                    settings.direction === 'ltr'
                      ? 'bg-accent-primary/20 border-accent-primary text-accent-soft'
                      : 'bg-surface-elevated border-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Kiri ke Kanan (LTR)
                </button>
                <button
                  onClick={() => onUpdateSettings({ direction: 'rtl' })}
                  className={`py-1.5 px-3 rounded-xl text-xs font-medium border transition-all ${
                    settings.direction === 'rtl'
                      ? 'bg-accent-primary/20 border-accent-primary text-accent-soft'
                      : 'bg-surface-elevated border-white/5 text-slate-400 hover:text-slate-200'
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
