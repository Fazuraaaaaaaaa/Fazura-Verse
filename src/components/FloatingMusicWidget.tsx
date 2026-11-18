import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Headphones, X, ExternalLink, Maximize2, Music } from 'lucide-react';

export function FloatingMusicWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Hide the widget if already on the /music page
  if (location.pathname === '/music') {
    return null;
  }

  const sonoraUrl = import.meta.env.VITE_SONORA_URL || 'http://localhost:3000';

  return (
    <>
      {/* Expanded Floating Music Drawer / Mini Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[340px] sm:w-[380px] h-[520px] bg-[#121212] border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="px-3.5 py-2.5 bg-black/80 border-b border-white/10 flex items-center justify-between gap-2 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#1DB954]/20 border border-[#1DB954]/30 flex items-center justify-center text-[#1DB954]">
                <Music className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-xs text-white">Fazura Music</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#1DB954]/20 text-[#1DB954] font-semibold">
                Player
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Link
                to="/music"
                onClick={() => setIsOpen(false)}
                title="Buka Halaman Musik Penuh"
                className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </Link>
              <a
                href={sonoraUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Buka di Tab Baru"
                className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setIsOpen(false)}
                title="Tutup Mini Player"
                className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-rose-400 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Embedded Sonora View */}
          <div className="flex-1 w-full bg-black relative">
            <iframe
              src={sonoraUrl}
              title="Fazura Music Floating Player"
              className="w-full h-full border-0"
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            />
          </div>
        </div>
      )}

      {/* Persistent Floating Action Button (FAB) */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          title={isOpen ? 'Tutup Fazura Music' : 'Dengarkan Musik (Fazura Music)'}
          className="group relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-full bg-black/90 hover:bg-black border border-[#1DB954]/40 hover:border-[#1DB954] text-white shadow-2xl backdrop-blur-xl transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_20px_rgba(29,185,84,0.35)]"
        >
          {/* Animated Glow Pulse */}
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1DB954] opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#1DB954]" />
          </span>

          <div className="w-6 h-6 rounded-full bg-[#1DB954] flex items-center justify-center text-black shrink-0">
            <Headphones className="w-3.5 h-3.5 fill-current animate-pulse" />
          </div>

          <span className="text-xs font-black tracking-wide text-white group-hover:text-[#1DB954] transition-colors pr-1">
            MUSIC
          </span>
        </button>
      </div>
    </>
  );
}
