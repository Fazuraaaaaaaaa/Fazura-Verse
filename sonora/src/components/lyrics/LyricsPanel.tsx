'use client';

import React, { useEffect, useState, useRef } from 'react';
import { X, Mic2, Maximize2, Minimize2 } from 'lucide-react';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { LyricsData } from '@/types/music';
import { fetchLyrics } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function LyricsPanel() {
  const { currentTrack, currentTime, seekTo, showLyrics, setShowLyrics } = usePlayerStore();
  const [lyrics, setLyrics] = useState<LyricsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const lineRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentTrack || !showLyrics) return;

    let cancelled = false;
    setLoading(true);
    fetchLyrics(
      currentTrack.id || currentTrack.youtubeId,
      currentTrack.title,
      currentTrack.artist
    )
      .then((data) => {
        if (!cancelled) {
          setLyrics(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentTrack?.id, currentTrack?.youtubeId, showLyrics]);

  // Find active line index
  let activeIndex = -1;
  if (lyrics && lyrics.lines.length > 0) {
    for (let i = 0; i < lyrics.lines.length; i++) {
      if (currentTime >= lyrics.lines[i].time) {
        activeIndex = i;
      } else {
        break;
      }
    }
  }

  // Auto-scroll active line into center
  useEffect(() => {
    if (activeIndex >= 0 && lineRefs.current[activeIndex] && containerRef.current) {
      const activeElement = lineRefs.current[activeIndex];
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [activeIndex]);

  if (!showLyrics) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col bg-[#121212] text-white transition-all duration-300 animate-in fade-in',
        isFullscreen ? 'p-6 sm:p-12' : 'p-4 sm:p-8'
      )}
      style={{
        background: `linear-gradient(180deg, #2b1f3d 0%, #121212 70%)`,
      }}
    >
      {/* Top action bar */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Mic2 size={24} className="text-[#1DB954]" />
          <div>
            <h2 className="text-lg sm:text-xl font-bold truncate max-w-xs sm:max-w-md">
              {currentTrack?.title || 'Lyrics'}
            </h2>
            <p className="text-xs sm:text-sm text-[#B3B3B3]">
              {currentTrack?.artist || 'Unknown Artist'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            onClick={() => setIsFullscreen((prev) => !prev)}
            className="p-2 rounded-full hover:bg-white/10 text-[#B3B3B3] hover:text-white transition-colors"
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
          <button
            type="button"
            title="Close lyrics"
            onClick={() => setShowLyrics(false)}
            className="p-2 rounded-full hover:bg-white/10 text-[#B3B3B3] hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Lyrics body */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto py-12 px-4 sm:px-12 space-y-6 sm:space-y-8 text-center scroll-smooth scrollbar-none"
      >
        {loading ? (
          <div className="flex h-full items-center justify-center text-[#B3B3B3]">
            <span className="animate-pulse text-lg">Loading lyrics...</span>
          </div>
        ) : !lyrics || lyrics.lines.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-[#B3B3B3] space-y-2">
            <Mic2 size={48} className="opacity-40" />
            <p className="text-base font-semibold">Looks like we don&apos;t have lyrics for this song yet.</p>
          </div>
        ) : (
          lyrics.lines.map((line, idx) => {
            const isActive = idx === activeIndex;
            const isPast = idx < activeIndex;

            return (
              <p
                key={`${line.time}-${idx}`}
                ref={(el) => {
                  lineRefs.current[idx] = el;
                }}
                onClick={() => seekTo(line.time)}
                className={cn(
                  'cursor-pointer transition-all duration-300 font-bold select-none',
                  isFullscreen ? 'text-2xl sm:text-4xl' : 'text-xl sm:text-3xl',
                  isActive
                    ? 'text-white scale-105 drop-shadow-md'
                    : isPast
                    ? 'text-white/60 hover:text-white/90'
                    : 'text-white/30 hover:text-white/70'
                )}
              >
                {line.text}
              </p>
            );
          })
        )}
      </div>
    </div>
  );
}
