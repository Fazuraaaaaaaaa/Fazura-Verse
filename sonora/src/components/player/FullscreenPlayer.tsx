'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Activity,
  Infinity as InfinityIcon,
} from 'lucide-react';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { useLibraryStore } from '@/stores/useLibraryStore';
import { formatDuration } from '@/lib/utils';
import AudioVisualizer from './AudioVisualizer';

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
    playbackSpeed,
    autoplay,
    isFullscreen,
    showLyrics,
    showQueue,
    showVisualizer,
    togglePlay,
    nextTrack,
    previousTrack,
    seekTo,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    setPlaybackSpeed,
    toggleAutoplay,
    toggleLyrics,
    toggleQueue,
    toggleVisualizer,
    setShowVisualizer,
    setFullscreen,
  } = usePlayerStore();

  const { isSongLiked, toggleLikeSong } = useLibraryStore();

  // Scrubber drag state
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubTime, setScrubTime] = useState(0);

  // Scrubber hover timestamp indicator
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPos, setHoverPos] = useState<number>(0);
  const scrubberRef = useRef<HTMLDivElement | null>(null);

  // Volume hover tooltip
  const [showVolumeTooltip, setShowVolumeTooltip] = useState(false);

  // Speed dropdown state
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const speedMenuRef = useRef<HTMLDivElement | null>(null);

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

  // Close speed menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (speedMenuRef.current && !speedMenuRef.current.contains(e.target as Node)) {
        setShowSpeedMenu(false);
      }
    };
    if (showSpeedMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSpeedMenu]);

  if (!isFullscreen) return null;

  const isLiked = currentTrack ? isSongLiked(currentTrack.id || currentTrack.youtubeId) : false;
  const displayTime = isScrubbing ? scrubTime : currentTime;
  const progressPercent =
    duration > 0 ? Math.min(100, Math.max(0, (displayTime / duration) * 100)) : 0;
  const volumePercent = isMuted ? 0 : volume;

  const handleScrubChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setScrubTime(val);
  };

  const handleScrubStart = () => {
    setIsScrubbing(true);
    setScrubTime(currentTime);
  };

  const handleScrubEnd = () => {
    setIsScrubbing(false);
    seekTo(scrubTime);
  };

  const handleScrubberMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrubberRef.current || duration <= 0) return;
    const rect = scrubberRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverTime(pos * duration);
    setHoverPos(pos * 100);
  };

  const handleScrubberMouseLeave = () => {
    setHoverTime(null);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseInt(e.target.value, 10));
  };

  const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <div className="fixed inset-0 z-[100] bg-[#121212] text-white flex flex-col justify-between p-4 sm:p-8 md:p-10 select-none overflow-hidden animate-fadeIn">
      {/* Dynamic ambient backdrop glow derived from album cover */}
      {currentTrack?.thumbnail && (
        <div
          className="absolute inset-0 opacity-25 blur-[160px] scale-125 pointer-events-none transition-all duration-700"
          style={{
            backgroundImage: `url(${currentTrack.thumbnail})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          }}
          aria-hidden="true"
        />
      )}

      {/* Top Bar */}
      <header className="relative z-10 flex items-center justify-between w-full">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1DB954] flex items-center justify-center font-extrabold text-black text-xs sm:text-sm shadow-md">
            S
          </div>
          <div>
            <p className="text-[10px] sm:text-[11px] font-semibold tracking-widest uppercase text-[#b3b3b3]">
              Playing from
            </p>
            <p className="text-xs sm:text-sm font-semibold text-white truncate max-w-[200px] sm:max-w-md">
              {currentTrack?.album || 'SONORA Music Stream'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Audio Visualizer Toggle */}
          <button
            onClick={toggleVisualizer}
            className={`p-2 sm:p-2.5 rounded-full transition-colors ${
              showVisualizer ? 'bg-[#1DB954] text-black font-bold' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title="Toggle Visualizer"
          >
            <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Minimize / Close Fullscreen */}
          <button
            onClick={() => setFullscreen(false)}
            className="p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Exit Fullscreen (Esc)"
            aria-label="Exit Fullscreen"
          >
            <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 my-auto flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-8 md:gap-14 max-w-5xl mx-auto w-full px-2 sm:px-4 py-4">
        {/* Album Cover */}
        <div className="relative max-h-[35vh] sm:max-h-[42vh] aspect-square w-auto max-w-[280px] sm:max-w-sm md:max-w-md rounded-2xl overflow-hidden shadow-2xl shadow-black/80 flex-shrink-0 group">
          {currentTrack?.thumbnail ? (
            <img
              src={currentTrack.thumbnail}
              alt={currentTrack.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-[#181818] flex items-center justify-center">
              <Music className="w-20 h-20 text-[#b3b3b3]" />
            </div>
          )}
        </div>

        {/* Track Details & Actions */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left max-w-md w-full">
          <div className="w-full flex items-center justify-between gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight line-clamp-1 sm:line-clamp-2">
                  {currentTrack?.title || 'No Track Selected'}
                </h1>
                {isPlaying && <AudioVisualizer variant="compact" />}
              </div>
              <h2 className="text-sm sm:text-lg md:text-xl text-[#b3b3b3] mt-1 sm:mt-2 font-medium hover:text-white cursor-pointer transition-colors truncate">
                {currentTrack?.artist || 'Select a song to start'}
              </h2>
            </div>

            {currentTrack && (
              <button
                onClick={() => toggleLikeSong(currentTrack)}
                className="p-2 sm:p-3 rounded-full hover:bg-white/10 text-[#b3b3b3] hover:text-white transition-all active:scale-90 flex-shrink-0"
                title={isLiked ? 'Remove from library' : 'Save to library'}
                aria-label="Like song"
              >
                <Heart
                  className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors ${
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
      <footer className="relative z-10 w-full max-w-3xl mx-auto flex flex-col gap-3 sm:gap-4 pb-2">
        {/* Scrubber Timeline with Hover Tooltip */}
        <div className="w-full flex flex-col gap-1.5">
          <div
            ref={scrubberRef}
            onMouseMove={handleScrubberMouseMove}
            onMouseLeave={handleScrubberMouseLeave}
            className="relative w-full flex items-center group/scrub h-4 cursor-pointer"
          >
            {/* Hover Timestamp Indicator */}
            {hoverTime !== null && (
              <div
                className="absolute -top-7 -translate-x-1/2 px-2 py-0.5 rounded bg-[#282828] text-[11px] font-mono text-white shadow-xl border border-[#3e3e3e] pointer-events-none z-30"
                style={{ left: `${hoverPos}%` }}
              >
                {formatDuration(hoverTime)}
              </div>
            )}

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
          {/* Left aux buttons (Shuffle, Autoplay, Speed) */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Smart Shuffle */}
            <button
              onClick={toggleShuffle}
              className={`p-1.5 sm:p-2 transition-colors relative flex flex-col items-center ${
                isShuffle ? 'text-[#1DB954]' : 'text-[#b3b3b3] hover:text-white'
              }`}
              title="Smart Shuffle"
              aria-label="Toggle shuffle"
            >
              <Shuffle className="w-4 h-4 sm:w-5 sm:h-5" />
              {isShuffle && (
                <span className="w-1.5 h-1.5 bg-[#1DB954] rounded-full absolute -bottom-1" />
              )}
            </button>

            {/* Smart Autoplay */}
            <button
              onClick={toggleAutoplay}
              className={`p-1.5 sm:p-2 transition-colors relative flex flex-col items-center ${
                autoplay ? 'text-[#1DB954]' : 'text-[#b3b3b3] hover:text-white opacity-60'
              }`}
              title={autoplay ? 'Smart Autoplay enabled' : 'Smart Autoplay disabled'}
              aria-label="Toggle autoplay"
            >
              <InfinityIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              {autoplay && (
                <span className="w-1.5 h-1.5 bg-[#1DB954] rounded-full absolute -bottom-1" />
              )}
            </button>

            {/* Speed Selector */}
            <div className="relative" ref={speedMenuRef}>
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="px-2 py-0.5 sm:py-1 rounded text-[11px] sm:text-xs font-mono font-bold text-[#b3b3b3] hover:text-white bg-white/10 hover:bg-white/20 transition-colors"
                title="Playback speed"
              >
                {playbackSpeed}x
              </button>

              {showSpeedMenu && (
                <div className="absolute bottom-10 left-0 w-28 rounded-lg bg-[#282828] border border-[#3e3e3e] shadow-2xl py-1 z-50 text-xs">
                  {SPEED_OPTIONS.map((speed) => (
                    <button
                      key={speed}
                      onClick={() => {
                        setPlaybackSpeed(speed);
                        setShowSpeedMenu(false);
                      }}
                      className={`w-full px-3 py-1.5 text-left transition-colors flex items-center justify-between ${
                        playbackSpeed === speed
                          ? 'text-[#1DB954] font-bold bg-white/5'
                          : 'text-white hover:bg-white/10'
                      }`}
                    >
                      <span>{speed}x</span>
                      {speed === 1 && <span className="text-[10px] text-[#b3b3b3]">Normal</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Controls (Prev, Play, Next) */}
          <div className="flex items-center justify-center gap-4 sm:gap-7">
            <button
              onClick={previousTrack}
              className="p-1.5 sm:p-2 text-[#b3b3b3] hover:text-white transition-transform active:scale-90"
              title="Previous"
              aria-label="Previous track"
            >
              <SkipBack className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl"
              title={isPlaying ? 'Pause' : 'Play'}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 sm:w-7 sm:h-7 fill-black text-black" />
              ) : (
                <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-black text-black translate-x-0.5" />
              )}
            </button>

            <button
              onClick={nextTrack}
              className="p-1.5 sm:p-2 text-[#b3b3b3] hover:text-white transition-transform active:scale-90"
              title="Next"
              aria-label="Next track"
            >
              <SkipForward className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />
            </button>
          </div>

          {/* Right aux buttons (Repeat, Volume, Queue) */}
          <div className="flex items-center justify-end gap-1.5 sm:gap-3">
            <button
              onClick={toggleRepeat}
              className={`p-1.5 sm:p-2 transition-colors relative flex flex-col items-center ${
                repeatMode !== 'off' ? 'text-[#1DB954]' : 'text-[#b3b3b3] hover:text-white'
              }`}
              title="Repeat"
              aria-label="Toggle repeat"
            >
              {repeatMode === 'one' ? (
                <Repeat1 className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Repeat className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
              {repeatMode !== 'off' && (
                <span className="w-1.5 h-1.5 bg-[#1DB954] rounded-full absolute -bottom-1" />
              )}
            </button>

            {/* Volume control with tooltip */}
            <div
              className="relative hidden sm:flex items-center gap-1.5"
              onMouseEnter={() => setShowVolumeTooltip(true)}
              onMouseLeave={() => setShowVolumeTooltip(false)}
            >
              {showVolumeTooltip && (
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-[#282828] text-[10px] font-mono text-white shadow-lg border border-[#3e3e3e] pointer-events-none z-30">
                  {volumePercent}%
                </div>
              )}

              <button
                onClick={toggleMute}
                className="p-1 text-[#b3b3b3] hover:text-white transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : volume < 50 ? (
                  <Volume1 className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>

              <div className="relative w-20 flex items-center group/vol h-3 cursor-pointer py-1">
                <div className="w-full h-1 bg-[#4d4d4d] rounded-full overflow-hidden relative">
                  <div
                    className="h-full bg-white group-hover/vol:bg-[#1db954] rounded-full transition-colors"
                    style={{ width: `${volumePercent}%` }}
                  />
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={volumePercent}
                  onChange={handleVolumeChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            <button
              onClick={toggleQueue}
              className={`p-1.5 sm:p-2 transition-colors ${
                showQueue ? 'text-[#1DB954]' : 'text-[#b3b3b3] hover:text-white'
              }`}
              title="Queue"
              aria-label="Toggle queue"
            >
              <ListMusic className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </footer>

      {/* Floating Audio Rhythm Visualizer Overlay */}
      {showVisualizer && (
        <AudioVisualizer variant="overlay" onClose={() => setShowVisualizer(false)} />
      )}
    </div>
  );
};

export default FullscreenPlayer;