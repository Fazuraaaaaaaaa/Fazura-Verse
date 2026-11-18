'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
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
  Maximize2,
  PictureInPicture2,
  ListMusic,
  Mic2,
  Heart,
  Music,
  Activity,
  Infinity as InfinityIcon,
  Sparkles,
} from 'lucide-react';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { useLibraryStore } from '@/stores/useLibraryStore';
import { formatDuration } from '@/lib/utils';
import AudioVisualizer from './AudioVisualizer';

export const BottomPlayer: React.FC = () => {
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
    showQueue,
    showLyrics,
    isFullscreen,
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
    toggleQueue,
    toggleLyrics,
    toggleFullscreen,
    toggleVisualizer,
    setShowVisualizer,
  } = usePlayerStore();

  const { isSongLiked, toggleLikeSong } = useLibraryStore();
  const isLiked = currentTrack ? isSongLiked(currentTrack.id || currentTrack.youtubeId) : false;

  // Local state for smooth dragging of progress bar
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubTime, setScrubTime] = useState(0);

  // Scrubber hover timestamp indicator
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPos, setHoverPos] = useState<number>(0);
  const scrubberRef = useRef<HTMLDivElement | null>(null);

  // Volume hover tooltip
  const [showVolumeTooltip, setShowVolumeTooltip] = useState(false);

  // Speed popover dropdown
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const speedMenuRef = useRef<HTMLDivElement | null>(null);

  const displayTime = isScrubbing ? scrubTime : currentTime;
  const progressPercent =
    duration > 0 ? Math.min(100, Math.max(0, (displayTime / duration) * 100)) : 0;
  const volumePercent = isMuted ? 0 : volume;

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
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverTime(ratio * duration);
    setHoverPos(ratio * 100);
  };

  const handleScrubberMouseLeave = () => {
    setHoverTime(null);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setVolume(val);
  };

  const handleOpenMiniPlayer = async () => {
    if (typeof window === 'undefined') return;

    if ('documentPictureInPicture' in window) {
      try {
        const pipWindow = await (window as any).documentPictureInPicture.requestWindow({
          width: 380,
          height: 520,
        });
        pipWindow.location.href = '/miniplayer';
        return;
      } catch {
        // Fallback to window.open
      }
    }

    const width = 380;
    const height = 540;
    const left = window.screen.width - width - 40;
    const top = window.screen.height - height - 80;
    const popup = window.open(
      '/miniplayer',
      'SonoraMiniPlayer',
      `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no,resizable=yes`
    );
    if (popup) {
      popup.focus();
    }
  };

  const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <>
      <footer className="fixed bottom-0 left-0 right-0 h-[72px] sm:h-[90px] bg-[#000000] border-t border-[#282828] px-3 sm:px-4 flex items-center justify-between z-50 select-none overflow-visible">
        {/* Dynamic ambient backdrop glow derived from album cover */}
        {currentTrack?.thumbnail && (
          <div
            className="absolute inset-0 opacity-15 pointer-events-none blur-3xl scale-110"
            style={{
              backgroundImage: `url(${currentTrack.thumbnail})`,
              backgroundPosition: 'center',
              backgroundSize: 'cover',
            }}
            aria-hidden="true"
          />
        )}

        {/* 1. LEFT SECTION: Track Info, Like, and Compact Visualizer */}
        <div className="relative z-10 w-[30%] min-w-[150px] sm:min-w-[180px] max-w-[360px] flex items-center gap-3">
          {currentTrack ? (
            <>
              {/* Thumbnail */}
              <div
                className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-[4px] overflow-hidden flex-shrink-0 cursor-pointer shadow-md group/art"
                onClick={toggleFullscreen}
                title="Click to view full screen"
              >
                <img
                  src={currentTrack.thumbnail || '/placeholder-album.png'}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover transition-transform duration-200 group-hover/art:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&auto=format&fit=crop&q=60';
                  }}
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/art:opacity-100 flex items-center justify-center transition-opacity">
                  <Maximize2 className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Song title, artist, and compact rhythm bars */}
              <div className="flex flex-col min-w-0 justify-center">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    onClick={toggleFullscreen}
                    className="text-white text-xs sm:text-sm font-semibold truncate hover:underline cursor-pointer"
                    title={currentTrack.title}
                  >
                    {currentTrack.title}
                  </span>
                  {isPlaying && <AudioVisualizer variant="compact" />}
                </div>

                <span
                  className="text-[#b3b3b3] text-[11px] sm:text-xs truncate hover:underline hover:text-white cursor-pointer mt-0.5"
                  title={currentTrack.artist}
                >
                  {currentTrack.artist}
                </span>
              </div>

              {/* Like button */}
              <button
                onClick={() => toggleLikeSong(currentTrack)}
                className="ml-1 sm:ml-2 p-1.5 flex-shrink-0 text-[#b3b3b3] hover:text-white transition-transform active:scale-90"
                title={isLiked ? 'Remove from Your Library' : 'Save to Your Library'}
                aria-label="Like track"
              >
                <Heart
                  className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
                    isLiked
                      ? 'fill-[#1DB954] text-[#1DB954]'
                      : 'hover:text-white text-[#b3b3b3]'
                  }`}
                />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#181818] rounded-[4px] flex items-center justify-center flex-shrink-0 border border-[#282828]">
                <Music className="w-6 h-6 text-[#b3b3b3]" />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-white text-sm font-medium">SONORA Player</span>
                <span className="text-[#b3b3b3] text-xs">Ready to play music</span>
              </div>
            </div>
          )}
        </div>

        {/* 2. CENTER SECTION: Controls & Timeline with Hover Tooltip */}
        <div className="relative z-10 w-[40%] max-w-[722px] flex flex-col items-center justify-center gap-1 sm:gap-1.5">
          {/* Buttons Row */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Smart Shuffle */}
            <button
              onClick={toggleShuffle}
              className={`p-1.5 transition-colors relative flex flex-col items-center group ${
                isShuffle ? 'text-[#1DB954]' : 'text-[#b3b3b3] hover:text-white'
              }`}
              title={isShuffle ? 'Disable Smart Shuffle' : 'Enable Smart Shuffle (Non-repeating)'}
              aria-label="Toggle shuffle"
            >
              <Shuffle className="w-4 h-4" />
              {isShuffle && (
                <span className="w-1 h-1 bg-[#1DB954] rounded-full absolute -bottom-0.5" />
              )}
            </button>

            {/* Previous */}
            <button
              onClick={previousTrack}
              className="p-1.5 text-[#b3b3b3] hover:text-white transition-transform active:scale-90"
              title="Previous (Shift+Left)"
              aria-label="Previous track"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            {/* Play/Pause Main Button */}
            <button
              onClick={togglePlay}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md flex-shrink-0"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-black text-black" />
              ) : (
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-black text-black translate-x-[1px]" />
              )}
            </button>

            {/* Next */}
            <button
              onClick={nextTrack}
              className="p-1.5 text-[#b3b3b3] hover:text-white transition-transform active:scale-90"
              title="Next (Shift+Right)"
              aria-label="Next track"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>

            {/* Repeat */}
            <button
              onClick={toggleRepeat}
              className={`p-1.5 transition-colors relative flex flex-col items-center group ${
                repeatMode !== 'off' ? 'text-[#1DB954]' : 'text-[#b3b3b3] hover:text-white'
              }`}
              title={
                repeatMode === 'off'
                  ? 'Enable repeat all'
                  : repeatMode === 'all'
                  ? 'Enable repeat one'
                  : 'Disable repeat'
              }
              aria-label="Toggle repeat"
            >
              {repeatMode === 'one' ? (
                <Repeat1 className="w-4 h-4" />
              ) : (
                <Repeat className="w-4 h-4" />
              )}
              {repeatMode !== 'off' && (
                <span className="w-1 h-1 bg-[#1DB954] rounded-full absolute -bottom-0.5" />
              )}
            </button>

            {/* Smart Autoplay Toggle */}
            <button
              onClick={toggleAutoplay}
              className={`p-1.5 transition-colors relative hidden md:flex flex-col items-center ${
                autoplay ? 'text-[#1DB954]' : 'text-[#b3b3b3] hover:text-white opacity-60'
              }`}
              title={autoplay ? 'Smart Autoplay enabled (Endless stream)' : 'Smart Autoplay disabled'}
              aria-label="Toggle autoplay"
            >
              <InfinityIcon className="w-4 h-4" />
              {autoplay && (
                <span className="w-1 h-1 bg-[#1DB954] rounded-full absolute -bottom-0.5" />
              )}
            </button>
          </div>

          {/* Scrubber Timeline Row with Hover Timestamp Tooltip */}
          <div className="w-full flex items-center gap-2 max-w-[500px]">
            <span className="text-[11px] font-mono text-[#b3b3b3] min-w-[34px] text-right select-none">
              {formatDuration(displayTime)}
            </span>

            {/* Scrubber Container */}
            <div
              ref={scrubberRef}
              onMouseMove={handleScrubberMouseMove}
              onMouseLeave={handleScrubberMouseLeave}
              className="relative flex-1 flex items-center group/scrubber h-3 cursor-pointer py-1"
            >
              {/* Hover Timestamp Indicator Badge */}
              {hoverTime !== null && (
                <div
                  className="absolute -top-7 -translate-x-1/2 px-1.5 py-0.5 rounded bg-[#282828] text-[10px] font-mono text-white shadow-lg border border-[#3e3e3e] pointer-events-none z-30"
                  style={{ left: `${hoverPos}%` }}
                >
                  {formatDuration(hoverTime)}
                </div>
              )}

              {/* Background Track */}
              <div className="w-full h-1 group-hover/scrubber:h-1.5 bg-[#4d4d4d] rounded-full overflow-hidden transition-all relative">
                <div
                  className="h-full bg-white group-hover/scrubber:bg-[#1db954] rounded-full transition-colors"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Slider Knob */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -ml-1.5 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover/scrubber:opacity-100 transition-opacity pointer-events-none"
                style={{ left: `${progressPercent}%` }}
              />

              {/* Native Range input for full scrubbing support */}
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

            <span className="text-[11px] font-mono text-[#b3b3b3] min-w-[34px] select-none">
              {formatDuration(duration)}
            </span>
          </div>
        </div>

        {/* 3. RIGHT SECTION: Visualizer, Speed, Lyrics, Queue, Volume, PiP, Fullscreen */}
        <div className="relative z-10 w-[30%] min-w-[150px] sm:min-w-[180px] max-w-[360px] flex items-center justify-end gap-1.5 sm:gap-2.5">
          {/* Audio Visualizer Toggle */}
          <button
            onClick={toggleVisualizer}
            className={`p-1.5 transition-colors hidden sm:block ${
              showVisualizer ? 'text-[#1DB954]' : 'text-[#b3b3b3] hover:text-white'
            }`}
            title="Audio Rhythm Visualizer"
            aria-label="Toggle rhythm visualizer"
          >
            <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Playback Speed Pill Dropdown */}
          <div className="relative" ref={speedMenuRef}>
            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="px-1.5 py-0.5 rounded text-[11px] font-mono font-bold text-[#b3b3b3] hover:text-white bg-[#282828]/60 hover:bg-[#282828] border border-[#3e3e3e]/40 transition-colors"
              title="Playback speed"
            >
              {playbackSpeed}x
            </button>

            {showSpeedMenu && (
              <div className="absolute bottom-9 right-0 w-24 rounded-lg bg-[#282828] border border-[#3e3e3e] shadow-xl py-1 z-50 text-xs">
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

          {/* Lyrics Button */}
          <button
            onClick={toggleLyrics}
            className={`p-1.5 transition-colors ${
              showLyrics ? 'text-[#1DB954]' : 'text-[#b3b3b3] hover:text-white'
            }`}
            title="Lyrics (L)"
            aria-label="Toggle lyrics"
          >
            <Mic2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Queue Drawer Button */}
          <button
            onClick={toggleQueue}
            className={`p-1.5 transition-colors relative ${
              showQueue ? 'text-[#1DB954]' : 'text-[#b3b3b3] hover:text-white'
            }`}
            title="Queue (Q)"
            aria-label="Toggle queue"
          >
            <ListMusic className="w-4 h-4 sm:w-5 sm:h-5" />
            {showQueue && (
              <span className="w-1 h-1 bg-[#1DB954] rounded-full absolute bottom-0.5 left-1/2 -translate-x-1/2" />
            )}
          </button>

          {/* Volume Controls with Percentage Tooltip */}
          <div
            className="flex items-center gap-1 sm:gap-2 relative"
            onMouseEnter={() => setShowVolumeTooltip(true)}
            onMouseLeave={() => setShowVolumeTooltip(false)}
          >
            {/* Volume Percentage Tooltip */}
            {showVolumeTooltip && (
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-[#282828] text-[10px] font-mono text-white shadow-lg border border-[#3e3e3e] pointer-events-none z-30">
                {volumePercent}%
              </div>
            )}

            <button
              onClick={toggleMute}
              className="p-1 text-[#b3b3b3] hover:text-white transition-colors"
              title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
              aria-label="Toggle mute"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : volume < 50 ? (
                <Volume1 className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>

            {/* Volume Slider Bar */}
            <div className="relative w-16 sm:w-20 md:w-24 flex items-center group/vol h-3 cursor-pointer py-1">
              <div className="w-full h-1 group-hover/vol:h-1.5 bg-[#4d4d4d] rounded-full overflow-hidden transition-all relative">
                <div
                  className="h-full bg-white group-hover/vol:bg-[#1db954] rounded-full transition-colors"
                  style={{ width: `${volumePercent}%` }}
                />
              </div>
              {/* Knob */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -ml-1.5 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover/vol:opacity-100 transition-opacity pointer-events-none"
                style={{ left: `${volumePercent}%` }}
              />
              {/* Range input */}
              <input
                type="range"
                min={0}
                max={100}
                value={volumePercent}
                onChange={handleVolumeChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                aria-label="Volume slider"
              />
            </div>
          </div>

          {/* Pop-up Mini Player Button */}
          <button
            onClick={handleOpenMiniPlayer}
            className="p-1.5 text-[#b3b3b3] hover:text-white transition-transform active:scale-95 hidden sm:block"
            title="Pop-up Mini Player (P)"
            aria-label="Open mini player"
          >
            <PictureInPicture2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 text-[#b3b3b3] hover:text-white transition-transform active:scale-95 hidden sm:block"
            title="Full screen"
            aria-label="Toggle fullscreen"
          >
            <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </footer>

      {/* Floating Audio Rhythm Visualizer Overlay */}
      {showVisualizer && (
        <AudioVisualizer variant="overlay" onClose={() => setShowVisualizer(false)} />
      )}
    </>
  );
};

export default BottomPlayer;
