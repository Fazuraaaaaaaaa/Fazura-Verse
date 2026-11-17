'use client';

import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  Volume1,
  VolumeX,
  Minimize2,
  Heart,
  ListMusic,
  Mic2,
  Music,
} from 'lucide-react';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { useLibraryStore } from '@/stores/useLibraryStore';
import { formatDuration } from '@/lib/utils';

export const FullscreenPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    currentTime,
    duration,
    isFullscreen,
    showLyrics,
    showQueue,
    togglePlay,
    nextTrack,
    previousTrack,
    seekTo,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    toggleLyrics,
    toggleQueue,
    setFullscreen,
  } = usePlayerStore();

  const { isSongLiked, toggleLikeSong } = useLibraryStore();

  // Local state for scrubbing
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubTime, setScrubTime] = useState(0);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, setFullscreen]);

  if (!isFullscreen) return null;

  const isLiked = currentTrack ? isSongLiked(currentTrack.id || currentTrack.youtubeId) : false;
  const displayTime = isScrubbing ? scrubTime : currentTime;
  const progressPercent =
    duration > 0 ? Math.min(100, Math.max(0, (displayTime / duration) * 100)) : 0;
  const volumePercent = isMuted ? 0 : volume;

  const handleScrubChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScrubTime(parseFloat(e.target.value));
  };

  const handleScrubStart = () => {
    setIsScrubbing(true);
    setScrubTime(currentTime);
  };

  const handleScrubEnd = () => {
    setIsScrubbing(false);
    seekTo(scrubTime);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-b from-[#20182c] via-[#121212] to-[#0a0a0a] text-white flex flex-col justify-between p-6 sm:p-10 select-none overflow-hidden animate-fadeIn">
      {/* Background ambient glow */}
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[#1DB954]/10 blur-[140px] pointer-events-none rounded-full"
        aria-hidden="true"
      />

      {/* Top Bar */}
      <header className="relative z-10 flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1DB954] flex items-center justify-center font-bold text-black text-sm">
            S
          </div>
          <div>
            <p className="text-[11px] font-semibold tracking-widest uppercase text-[#b3b3b3]">
              Playing from
            </p>
            <p className="text-sm font-semibold text-white">
              {currentTrack?.album || 'SONORA Music Feed'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setFullscreen(false)}
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          title="Exit Fullscreen (Esc)"
          aria-label="Exit Fullscreen"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 my-auto flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 max-w-5xl mx-auto w-full px-4">
        {/* Album Cover */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-2xl overflow-hidden shadow-2xl shadow-black/80 flex-shrink-0 group">
          {currentTrack?.thumbnail ? (
            <img
              src={currentTrack.thumbnail}
              alt={currentTrack.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-[#181818] flex items-center justify-center">
              <Music className="w-24 h-24 text-[#b3b3b3]" />
            </div>
          )}
        </div>

        {/* Track Details & Actions */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left max-w-md w-full">
          <div className="w-full flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight line-clamp-2">
                {currentTrack?.title || 'No Track Selected'}
              </h1>
              <h2 className="text-lg sm:text-xl text-[#b3b3b3] mt-2 font-medium hover:text-white cursor-pointer transition-colors">
                {currentTrack?.artist || 'Select a song to start'}
              </h2>
            </div>

            {currentTrack && (
              <button
                onClick={() => toggleLikeSong(currentTrack)}
                className="p-3 rounded-full hover:bg-white/10 text-[#b3b3b3] hover:text-white transition-all active:scale-90 flex-shrink-0"
                title={isLiked ? 'Remove from library' : 'Save to library'}
                aria-label="Like song"
              >
                <Heart
                  className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                    isLiked
                      ? 'fill-[#1DB954] text-[#1DB954]'
                      : 'text-[#b3b3b3] hover:text-white'
                  }`}
                />
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Bottom Controls Area */}
      <footer className="relative z-10 w-full max-w-3xl mx-auto flex flex-col gap-4">
        {/* Scrubber Timeline */}
        <div className="w-full flex flex-col gap-1.5">
          <div className="relative w-full flex items-center group/scrub h-4 cursor-pointer">
            <div className="w-full h-1.5 group-hover/scrub:h-2 bg-[#4d4d4d] rounded-full overflow-hidden transition-all relative">
              <div
                className="h-full bg-white group-hover/scrub:bg-[#1db954] rounded-full transition-colors"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {/* Knob */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -ml-2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover/scrub:opacity-100 transition-opacity pointer-events-none"
              style={{ left: `${progressPercent}%` }}
            />
            {/* Range input */}
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.5}
              value={displayTime}
              onMouseDown={handleScrubStart}
              onTouchStart={handleScrubStart}
              onChange={handleScrubChange}
              onMouseUp={handleScrubEnd}
              onTouchEnd={handleScrubEnd}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Seek timeline"
            />
          </div>

          <div className="flex justify-between items-center text-xs font-mono text-[#b3b3b3]">
            <span>{formatDuration(displayTime)}</span>
            <span>{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Playback Controls & Aux Buttons */}
        <div className="flex items-center justify-between w-full">
          {/* Left aux buttons (Shuffle) */}
          <div className="flex items-center gap-3 w-1/4">
            <button
              onClick={toggleShuffle}
              className={`p-2 transition-colors relative flex flex-col items-center ${
                isShuffle ? 'text-[#1DB954]' : 'text-[#b3b3b3] hover:text-white'
              }`}
              title="Shuffle"
              aria-label="Toggle shuffle"
            >
              <Shuffle className="w-5 h-5" />
              {isShuffle && (
                <span className="w-1.5 h-1.5 bg-[#1DB954] rounded-full absolute -bottom-1" />
              )}
            </button>
          </div>

          {/* Main Controls (Prev, Play, Next) */}
          <div className="flex items-center justify-center gap-6 sm:gap-8 flex-1">
            <button
              onClick={previousTrack}
              className="p-2 text-[#b3b3b3] hover:text-white transition-transform active:scale-90"
              title="Previous"
              aria-label="Previous track"
            >
              <SkipBack className="w-7 h-7 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl"
              title={isPlaying ? 'Pause' : 'Play'}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-7 h-7 fill-black text-black" />
              ) : (
                <Play className="w-7 h-7 fill-black text-black translate-x-0.5" />
              )}
            </button>

            <button
              onClick={nextTrack}
              className="p-2 text-[#b3b3b3] hover:text-white transition-transform active:scale-90"
              title="Next"
              aria-label="Next track"
            >
              <SkipForward className="w-7 h-7 fill-current" />
            </button>
          </div>

          {/* Right aux buttons (Repeat, Volume, Queue) */}
          <div className="flex items-center justify-end gap-3 w-1/4">
            <button
              onClick={toggleRepeat}
              className={`p-2 transition-colors relative flex flex-col items-center ${
                repeatMode !== 'off' ? 'text-[#1DB954]' : 'text-[#b3b3b3] hover:text-white'
              }`}
              title="Repeat"
              aria-label="Toggle repeat"
            >
              {repeatMode === 'one' ? (
                <Repeat1 className="w-5 h-5" />
              ) : (
                <Repeat className="w-5 h-5" />
              )}
              {repeatMode !== 'off' && (
                <span className="w-1.5 h-1.5 bg-[#1DB954] rounded-full absolute -bottom-1" />
              )}
            </button>

            <button
              onClick={toggleQueue}
              className={`p-2 transition-colors ${
                showQueue ? 'text-[#1DB954]' : 'text-[#b3b3b3] hover:text-white'
              }`}
              title="Queue"
              aria-label="Toggle queue"
            >
              <ListMusic className="w-5 h-5" />
            </button>

            <button
              onClick={() => setFullscreen(false)}
              className="p-2 text-[#b3b3b3] hover:text-white transition-colors"
              title="Minimize"
              aria-label="Minimize player"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FullscreenPlayer;
