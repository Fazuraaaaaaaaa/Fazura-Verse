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

  return (
    <>
      {/* Top Floating Control Bar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-md border-b border-white/10 transition-transform duration-300 ${
          visible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          {/* Back Button & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to={mangaSlug ? `/manga/${mangaSlug}` : '/'}
              className="p-2 rounded-xl bg-card hover:bg-slate-800 text-slate-300 hover:text-white border border-white/5 transition-colors shrink-0"
              title="Return to Manga Detail"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm font-bold text-white truncate max-w-[180px] sm:max-w-md">
                {title}
              </h1>
              {totalPages && totalPages > 0 ? (
                <p className="text-[10px] text-slate-400">
                  {settings.mode === 'vertical'
                    ? `${totalPages} pages`
                    : `Page ${(currentPage || 0) + 1} of ${totalPages}`}
                </p>
              ) : null}
            </div>
          </div>

          {/* Quick Chapter Selector Dropdown (if chapters list passed) */}
          {allChapters.length > 0 && currentChapterSlug && (
            <div className="hidden sm:block">
              <select
                value={currentChapterSlug}
                onChange={(e) => onNavigateChapter(e.target.value)}
                className="bg-card text-xs text-slate-200 border border-white/10 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-accent-indigo"
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
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Prev Chapter */}
            <button
              onClick={() => navigation.prev && onNavigateChapter(navigation.prev)}
              disabled={!navigation.prev}
              title="Previous Chapter"
              className="p-2 rounded-xl bg-card hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-card text-slate-300 hover:text-white border border-white/5 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Next Chapter */}
            <button
              onClick={() => navigation.next && onNavigateChapter(navigation.next)}
              disabled={!navigation.next}
              title="Next Chapter"
              className="p-2 rounded-xl bg-card hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-card text-slate-300 hover:text-white border border-white/5 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              title="Toggle Fullscreen"
              className="p-2 rounded-xl bg-card hover:bg-slate-800 text-slate-300 hover:text-white border border-white/5 transition-colors"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>

            {/* Settings Toggle */}
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              title="Reader Settings"
              className={`p-2 rounded-xl border border-white/5 transition-colors ${
                settingsOpen
                  ? 'bg-accent-indigo text-white'
                  : 'bg-card hover:bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Settings Modal / Bottom Sheet */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-surface border border-white/10 p-5 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-accent-indigo" />
                Reader Preferences
              </h3>
              <button
                onClick={() => setSettingsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-card"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Reading Mode */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-accent-cyan" />
                Reading Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => onUpdateSettings({ mode: 'vertical' })}
                  className={`py-2 px-2 rounded-xl text-xs font-medium border flex flex-col items-center gap-1 transition-all ${
                    settings.mode === 'vertical'
                      ? 'bg-accent-indigo/20 border-accent-indigo text-accent-indigo'
                      : 'bg-card border-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  Vertical
                </button>
                <button
                  onClick={() => onUpdateSettings({ mode: 'single' })}
                  className={`py-2 px-2 rounded-xl text-xs font-medium border flex flex-col items-center gap-1 transition-all ${
                    settings.mode === 'single'
                      ? 'bg-accent-indigo/20 border-accent-indigo text-accent-indigo'
                      : 'bg-card border-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Single Page
                </button>
                <button
                  onClick={() => onUpdateSettings({ mode: 'double' })}
                  className={`py-2 px-2 rounded-xl text-xs font-medium border flex flex-col items-center gap-1 transition-all ${
                    settings.mode === 'double'
                      ? 'bg-accent-indigo/20 border-accent-indigo text-accent-indigo'
                      : 'bg-card border-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Columns className="w-4 h-4" />
                  Double Page
                </button>
              </div>
            </div>

            {/* Image Fit */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Image Fit</label>
              <div className="grid grid-cols-3 gap-2">
                {(['width', 'height', 'original'] as const).map((fit) => (
                  <button
                    key={fit}
                    onClick={() => onUpdateSettings({ fit })}
                    className={`py-1.5 px-2 rounded-lg text-xs capitalize font-medium border transition-all ${
                      settings.fit === fit
                        ? 'bg-accent-indigo/20 border-accent-indigo text-accent-indigo'
                        : 'bg-card border-white/5 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Fit {fit}
                  </button>
                ))}
              </div>
            </div>

            {/* Background Color */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-accent-purple" />
                Background Color
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => onUpdateSettings({ background: 'black' })}
                  className={`py-2 px-2 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                    settings.background === 'black'
                      ? 'border-accent-indigo text-white bg-black'
                      : 'border-white/5 text-slate-400 bg-black'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-black border border-white/20" />
                  Black
                </button>
                <button
                  onClick={() => onUpdateSettings({ background: 'dark' })}
                  className={`py-2 px-2 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                    settings.background === 'dark'
                      ? 'border-accent-indigo text-white bg-[#0a0d18]'
                      : 'border-white/5 text-slate-400 bg-[#0a0d18]'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0a0d18] border border-white/20" />
                  Navy Dark
                </button>
                <button
                  onClick={() => onUpdateSettings({ background: 'gray' })}
                  className={`py-2 px-2 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                    settings.background === 'gray'
                      ? 'border-accent-indigo text-white bg-[#1e293b]'
                      : 'border-white/5 text-slate-400 bg-[#1e293b]'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1e293b] border border-white/20" />
                  Slate
                </button>
              </div>
            </div>

            {/* Gap Between Pages (Vertical Mode only) */}
            {settings.mode === 'vertical' && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">
                  Page Gap: {settings.gap}px
                </label>
                <div className="flex gap-2">
                  {[0, 8, 16, 24].map((gap) => (
                    <button
                      key={gap}
                      onClick={() => onUpdateSettings({ gap })}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        settings.gap === gap
                          ? 'bg-accent-indigo/20 border-accent-indigo text-accent-indigo'
                          : 'bg-card border-white/5 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {gap}px
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setSettingsOpen(false)}
              className="w-full py-2.5 rounded-xl bg-accent-indigo text-white font-bold text-xs hover:bg-accent-indigo/90 transition-colors shadow-lg shadow-accent-indigo/20"
            >
              Apply Settings
            </button>
          </div>
        </div>
      )}
    </>
  );
}
