import React, { useState, useRef } from 'react';
import { Headphones } from 'lucide-react';

export function MusicHubPage() {
  const [iframeLoading, setIframeLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Determine base music player URL
  const getMusicPlayerUrl = () => {
    if (typeof window !== 'undefined') {
      const envUrl = import.meta.env.VITE_SONORA_URL;
      if (envUrl) return envUrl;
      return `${window.location.protocol}//${window.location.hostname}:3000`;
    }
    return 'http://localhost:3000';
  };

  const musicBaseUrl = getMusicPlayerUrl();

  return (
    <div className="flex-1 w-full bg-[#121212] relative overflow-hidden h-[calc(100dvh-3.5rem)] sm:h-[calc(100dvh-4rem)] min-h-[500px]">
      {/* Smooth Loading Indicator while player initializes */}
      {iframeLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#121212] z-10 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#1DB954]/10 border border-[#1DB954]/30 flex items-center justify-center text-[#1DB954] shadow-2xl shadow-[#1DB954]/30 animate-pulse">
            <Headphones className="w-7 h-7 animate-bounce" />
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-base font-bold text-white tracking-wide">
              Memuat Fazura Music...
            </h3>
            <p className="text-xs text-slate-400">
              Menghubungkan ke katalog musik & YouTube Music API
            </p>
          </div>
          <div className="w-40 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="w-1/2 h-full bg-[#1DB954] rounded-full animate-[shimmer_1.5s_infinite]" />
          </div>
        </div>
      )}

      {/* Embedded Spotify-Style Music Player */}
      <iframe
        ref={iframeRef}
        src={musicBaseUrl}
        title="Fazura Music Player"
        onLoad={() => setIframeLoading(false)}
        className="w-full h-full border-0 absolute inset-0"
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture; clipboard-write"
        loading="eager"
      />
    </div>
  );
}
