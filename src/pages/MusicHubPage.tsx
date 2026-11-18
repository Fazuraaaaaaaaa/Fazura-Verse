import React, { useState, useRef, useEffect } from 'react';
import {
  Headphones,
  ExternalLink,
  Maximize2,
  Minimize2,
  RotateCw,
  Sparkles,
  Music,
  Radio,
  Flame,
  Volume2,
  CheckCircle2,
  ListMusic,
} from 'lucide-react';

export function MusicHubPage() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Determine base Sonora URL
  const getSonoraUrl = () => {
    if (typeof window !== 'undefined') {
      const envUrl = import.meta.env.VITE_SONORA_URL;
      if (envUrl) return envUrl;
      // Default to localhost:3000 with same hostname for local network testing
      return `${window.location.protocol}//${window.location.hostname}:3000`;
    }
    return 'http://localhost:3000';
  };

  const sonoraBaseUrl = getSonoraUrl();

  const handleRefresh = () => {
    if (iframeRef.current) {
      setIframeLoading(true);
      iframeRef.current.src = sonoraBaseUrl;
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  // Listen to escape key to exit immersive fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  return (
    <div
      className={`flex flex-col bg-[#0b0f17] text-white transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-50 h-screen w-screen'
          : 'min-h-[calc(100vh-4rem)]'
      }`}
    >
      {/* 1. Header Toolbar */}
      <div className="bg-[#121212]/95 border-b border-white/10 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 shrink-0 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1DB954]/20 border border-[#1DB954]/40 flex items-center justify-center text-[#1DB954] shadow-md shadow-[#1DB954]/20">
            <Headphones className="w-4 h-4 animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-black text-sm sm:text-base tracking-wider bg-gradient-to-r from-white via-slate-200 to-[#1DB954] bg-clip-text text-transparent">
              SONORA <span className="text-[#1DB954]">MUSIC</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1DB954]/20 text-[#1DB954] border border-[#1DB954]/30">
              <CheckCircle2 className="w-2.5 h-2.5" /> Spotify Web Player
            </span>
            <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-slate-300">
              YouTube Music API
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Refresh Player */}
          <button
            onClick={handleRefresh}
            title="Muat Ulang Player"
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/5"
          >
            <RotateCw className={`w-3.5 h-3.5 ${iframeLoading ? 'animate-spin text-[#1DB954]' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Fullscreen / Immersive Toggle */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Keluar Layar Penuh (Esc)' : 'Mode Imersif Layar Penuh'}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/5"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-[#1DB954]" />
                <span className="hidden sm:inline">Normal</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Layar Penuh</span>
              </>
            )}
          </button>

          {/* Open in Standalone Tab */}
          <a
            href={sonoraBaseUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Buka SONORA di Tab Baru"
            className="px-3 py-1.5 rounded-lg bg-[#1DB954] hover:bg-[#1ed760] text-black font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-[#1DB954]/20 transform hover:scale-105"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Tab Baru</span>
          </a>
        </div>
      </div>

      {/* 2. Embedded Sonora Web Player */}
      <div className="relative flex-1 w-full bg-[#121212] overflow-hidden min-h-[580px] sm:min-h-[680px]">
        {iframeLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#121212] z-10 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#1DB954]/10 border border-[#1DB954]/30 flex items-center justify-center text-[#1DB954] shadow-2xl shadow-[#1DB954]/30 animate-pulse">
              <Headphones className="w-7 h-7 animate-bounce" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white tracking-wide">
                Memuat SONORA Music Hub...
              </h3>
              <p className="text-xs text-slate-400">
                Menghubungkan ke YouTube Music Engine & Spotify Player API
              </p>
            </div>
            <div className="w-40 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="w-1/2 h-full bg-[#1DB954] rounded-full animate-[shimmer_1.5s_infinite]" />
            </div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={sonoraBaseUrl}
          title="SONORA Spotify Music Web Player"
          onLoad={() => setIframeLoading(false)}
          className="w-full h-full border-0 absolute inset-0"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture; clipboard-write"
          loading="eager"
        />
      </div>

      {/* 3. Bottom Information & Feature Highlights (Hidden in Fullscreen) */}
      {!isFullscreen && (
        <div className="bg-[#0b0f17] border-t border-white/10 px-4 sm:px-6 py-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[#1DB954]" /> Fitur Unggulan:
              </span>
              <span className="flex items-center gap-1">
                <Music className="w-3 h-3 text-[#1DB954]" /> Jutaan Lagu & Album
              </span>
              <span className="flex items-center gap-1">
                <Volume2 className="w-3 h-3 text-cyan-400" /> Background Audio & PiP
              </span>
              <span className="flex items-center gap-1">
                <Radio className="w-3 h-3 text-amber-400" /> Smart Autoplay & Shuffle
              </span>
              <span className="flex items-center gap-1">
                <ListMusic className="w-3 h-3 text-purple-400" /> Custom Playlist & Library
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500">
                Terintegrasi di ekosistem hiburan FazuraVerse
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
