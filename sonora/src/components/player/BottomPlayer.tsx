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

  const handleOpenMiniPlayer = async () => {
    try {
      if (typeof window !== 'undefined' && 'documentPictureInPicture' in window) {
        // @ts-expect-error - Document Picture-in-Picture API is experimental
        const pipWindow = await window.documentPictureInPicture.requestWindow({
          width: 380,
          height: 520,
        });
        const doc = pipWindow.document;
        doc.title = `${currentTrack?.title || 'SONORA'} - Mini Player`;

        const style = doc.createElement('style');
        style.textContent = `
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
          body { background: #121212; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; padding: 20px; user-select: none; }
          .cover { width: 220px; height: 220px; border-radius: 12px; object-fit: cover; box-shadow: 0 12px 32px rgba(0,0,0,0.7); margin-bottom: 20px; }
          .title { font-size: 18px; font-weight: 700; text-align: center; margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 300px; }
          .artist { font-size: 14px; color: #b3b3b3; text-align: center; margin-bottom: 24px; }
          .controls { display: flex; align-items: center; gap: 20px; }
          .btn { background: none; border: none; color: #b3b3b3; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
          .btn:hover { color: #fff; transform: scale(1.1); }
          .play-btn { width: 52px; height: 52px; border-radius: 50%; background: #1DB954; color: #000; box-shadow: 0 4px 14px rgba(29,185,84,0.4); }
          .play-btn:hover { background: #1ed760; transform: scale(1.08); color: #000; }
        `;
        doc.head.appendChild(style);

        const container = doc.createElement('div');
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.alignItems = 'center';

        const img = doc.createElement('img');
        img.className = 'cover';
        img.src = currentTrack?.thumbnail || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400';

        const title = doc.createElement('div');
        title.className = 'title';
        title.textContent = currentTrack?.title || 'SONORA Music';

        const artist = doc.createElement('div');
        artist.className = 'artist';
        artist.textContent = currentTrack?.artist || 'Ready to stream';

        const controls = doc.createElement('div');
        controls.className = 'controls';

        const prevBtn = doc.createElement('button');
        prevBtn.className = 'btn';
        prevBtn.innerHTML = '⏮';
        prevBtn.style.fontSize = '24px';
        prevBtn.onclick = () => previousTrack();

        const playBtn = doc.createElement('button');
        playBtn.className = 'btn play-btn';
        playBtn.innerHTML = isPlaying ? '⏸' : '▶';
        playBtn.style.fontSize = '22px';
        playBtn.onclick = () => {
          togglePlay();
          playBtn.innerHTML = usePlayerStore.getState().isPlaying ? '⏸' : '▶';
        };

        const nextBtn = doc.createElement('button');
        nextBtn.className = 'btn';
        nextBtn.innerHTML = '⏭';
        nextBtn.style.fontSize = '24px';
        nextBtn.onclick = () => nextTrack();

        controls.appendChild(prevBtn);
        controls.appendChild(playBtn);
        controls.appendChild(nextBtn);

        container.appendChild(img);
        container.appendChild(title);
        container.appendChild(artist);
        container.appendChild(controls);
        doc.body.appendChild(container);
        return;
      }
    } catch (e) {
      console.warn('PiP window not supported or denied, opening popup fallback:', e);
    }

    const popup = window.open(
      '/miniplayer',
      'SonoraMiniPlayer',
      'width=380,height=520,resizable=yes,scrollbars=no,status=no,location=no,toolbar=no,menubar=no'
    );
    if (popup) popup.focus();
  };

  const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <>
      {/* ============================================================== */}
      {/* 1. MOBILE FLOATING MINI PLAYER (Visible on md:hidden screens) */}
      {/* ============================================================== */}
      {currentTrack && (
        <div className="md:hidden fixed bottom-14 left-0 right-0 z-40 px-2 pb-1.5 pointer-events-auto">
          <div
            onClick={toggleFullscreen}
            className="group relative flex flex-col rounded-xl bg-[#242424]/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden cursor-pointer select-none active:scale-[0.99] transition-transform duration-150"
          >
            {/* Top 2.5px Continuous Progress Line */}
            <div className="relative h-[2.5px] w-full bg-white/10">
              <div
                className="h-full bg-[#1DB954] transition-all duration-200"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Inner Content Bar */}
            <div className="flex items-center justify-between px-3 py-2 gap-2">
              {/* Left: Artwork + Track Info (Tapping opens Fullscreen) */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="relative h-10 w-10 flex-shrink-0 rounded-[6px] overflow-hidden bg-[#181818] shadow">
                  <img
                    src={currentTrack.thumbnail || '/placeholder-album.png'}
                    alt={currentTrack.title}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100';
                    }}
                  />
                  {isPlaying && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <AudioVisualizer variant="compact" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col min-w-0 justify-center">
                  <span className="text-xs font-bold text-white truncate leading-tight">
                    {currentTrack.title}
                  </span>
                  <span className="text-[11px] text-[#b3b3b3] truncate mt-0.5 leading-tight">
                    {currentTrack.artist}
                  </span>
                </div>
              </div>

              {/* Right: Quick Action Controls */}
              <div
                className="flex items-center gap-1 flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Like Button */}
                <button
                  type="button"
                  onClick={() => toggleLikeSong(currentTrack)}
                  className="p-2 text-[#b3b3b3] hover:text-white active:scale-90 transition-transform"
                  title={isLiked ? 'Remove from Your Library' : 'Save to Your Library'}
                  aria-label="Like track"
                >
                  <Heart
                    className={`w-4 h-4 transition-colors ${
                      isLiked ? 'fill-[#1DB954] text-[#1DB954]' : 'text-[#b3b3b3]'
                    }`}
                  />
                </button>

                {/* Play/Pause Button */}
                <button
                  type="button"
                  onClick={togglePlay}
                  className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 shadow-md transition-all flex-shrink-0"
                  title={isPlaying ? 'Pause' : 'Play'}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-black text-black" />
                  ) : (
                    <Play className="w-4 h-4 fill-black text-black translate-x-0.5" />
                  )}
                </button>

                {/* Next Track Button */}
                <button
                  type="button"
                  onClick={nextTrack}
                  className="p-2 text-[#b3b3b3] hover:text-white active:scale-90 transition-transform"
                  title="Next track"
                  aria-label="Next track"
                >
                  <SkipForward className="w-4 h-4 fill-current" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. DESKTOP 3-COLUMN PLAYER (Visible on hidden md:flex screens) */}
      {/* ============================================================== */}
      <footer className="hidden md:flex fixed bottom-0 left-0 right-0 h-[88px] bg-[#181818] border-t border-[#282828] px-4 items-center justify-between z-50 select-none shadow-2xl transition-all duration-300">
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
        <div className="relative z-10 w-[30%] min-w-[180px] max-w-[360px] flex items-center gap-3">
          {currentTrack ? (
            <>
              {/* Thumbnail */}
              <div
                className="relative w-14 h-14 rounded-[6px] overflow-hidden flex-shrink-0 cursor-pointer shadow-md group/art"
                onClick={toggleFullscreen}
                title="Click to view full screen"
              >
                <img
                  src={currentTrack.thumbnail || '/placeholder-album.png'}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover/art:scale-105"
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
                    className="text-white text-sm font-semibold truncate hover:underline cursor-pointer"
                    title={currentTrack.title}
                  >
                    {currentTrack.title}
                  </span>
                  {isPlaying && <AudioVisualizer variant="compact" />}
                </div>

                <span
                  className="text-[#b3b3b3] text-xs truncate hover:underline hover:text-white cursor-pointer mt-0.5"
                  title={currentTrack.artist}
                >
                  {currentTrack.artist}
                </span>
              </div>

              {/* Like button */}
              <button
                onClick={() => toggleLikeSong(currentTrack)}
                className="ml-2 p-1.5 flex-shrink-0 text-[#b3b3b3] hover:text-white transition-transform active:scale-90"
                title={isLiked ? 'Remove from Your Library' : 'Save to Your Library'}
                aria-label="Like track"
              >
                <Heart
                  className={`w-5 h-5 transition-colors ${
                    isLiked
                      ? 'fill-[#1DB954] text-[#1DB954]'
                      : 'hover:text-white text-[#b3b3b3]'
                  }`}
                />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-[#242424] rounded-[6px] flex items-center justify-center flex-shrink-0 border border-[#282828]">
                <Music className="w-6 h-6 text-[#b3b3b3]" />
              </div>
              <div className="flex flex-col">
                <span className="text-white text-sm font-semibold">SONORA Player</span>
                <span className="text-[#b3b3b3] text-xs">Ready to play music</span>
              </div>
            </div>
          )}
        </div>

        {/* 2. CENTER SECTION: Controls & Timeline with Hover Tooltip */}
        <div className="relative z-10 w-[40%] max-w-[722px] flex flex-col items-center justify-center gap-1.5">
          {/* Buttons Row */}
          <div className="flex items-center gap-4 lg:gap-5">
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
              className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md flex-shrink-0"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-black text-black" />
              ) : (
                <Play className="w-5 h-5 fill-black text-black translate-x-[1px]" />
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
                <Repeat1 className="w-4 h-4 text-[#1DB954]" />
              ) : (
                <Repeat className="w-4 h-4" />
              )}
              {repeatMode !== 'off' && (
                <span className="w-1 h-1 bg-[#1DB954] rounded-full absolute -bottom-0.5" />
              )}
            </button>

            {/* Smart Autoplay Indicator Toggle */}
            <button
              onClick={toggleAutoplay}
              className={`p-1.5 transition-colors relative flex flex-col items-center group ${
                autoplay ? 'text-[#1DB954]' : 'text-[#b3b3b3] hover:text-white opacity-60'
              }`}
              title={autoplay ? 'Smart Autoplay active (Continuation)' : 'Smart Autoplay paused'}
              aria-label="Toggle autoplay"
            >
              <InfinityIcon className="w-4 h-4" />
              {autoplay && (
                <span className="w-1 h-1 bg-[#1DB954] rounded-full absolute -bottom-0.5" />
              )}
            </button>
          </div>

          {/* Scrubber Timeline Row with Hover Tooltip */}
          <div className="w-full flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#b3b3b3] min-w-[36px] text-right">
              {formatDuration(displayTime)}
            </span>

            <div
              ref={scrubberRef}
              onMouseMove={handleScrubberMouseMove}
              onMouseLeave={handleScrubberMouseLeave}
              className="relative flex-1 flex items-center group/scrub h-3 cursor-pointer py-1"
            >
              {/* Floating Hover Timestamp Tooltip */}
              {hoverTime !== null && (
                <div
                  className="absolute -top-7 -translate-x-1/2 px-1.5 py-0.5 rounded bg-[#282828] text-[10px] font-mono text-white shadow-xl border border-[#3e3e3e] pointer-events-none z-30 transition-opacity"
                  style={{ left: `${hoverPos}%` }}
                >
                  {formatDuration(hoverTime)}
                </div>
              )}

              {/* Slider Track */}
              <div className="w-full h-1 group-hover/scrub:h-1.5 bg-[#4d4d4d] rounded-full overflow-hidden transition-all relative">
                <div
                  className="h-full bg-white group-hover/scrub:bg-[#1db954] rounded-full transition-colors"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Scrubber Knob */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -ml-1.5 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover/scrub:opacity-100 transition-opacity pointer-events-none"
                style={{ left: `${progressPercent}%` }}
              />

              {/* Native range input for interaction */}
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
                aria-label="Timeline scrubber"
              />
            </div>

            <span className="text-[11px] font-mono text-[#b3b3b3] min-w-[36px]">
              {formatDuration(duration)}
            </span>
          </div>
        </div>

        {/* 3. RIGHT SECTION: Volume & Extra Controls */}
        <div className="relative z-10 w-[30%] min-w-[180px] max-w-[360px] flex items-center justify-end gap-2">
          {/* Dynamic Audio Visualizer Toggle Button */}
          <button
            onClick={toggleVisualizer}
            className={`p-1.5 transition-colors rounded ${
              showVisualizer
                ? 'text-[#1DB954] bg-white/10'
                : 'text-[#b3b3b3] hover:text-white'
            }`}
            title="Toggle Audio Visualizer"
            aria-label="Toggle visualizer"
          >
            <Activity className="w-4 h-4 lg:w-5 lg:h-5" />
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
            <Mic2 className="w-4 h-4 lg:w-5 lg:h-5" />
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
            <ListMusic className="w-4 h-4 lg:w-5 lg:h-5" />
            {showQueue && (
              <span className="w-1 h-1 bg-[#1DB954] rounded-full absolute bottom-0.5 left-1/2 -translate-x-1/2" />
            )}
          </button>

          {/* Volume Controls with Percentage Tooltip */}
          <div
            className="flex items-center gap-1.5 relative"
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
                <VolumeX className="w-4 h-4 lg:w-5 lg:h-5" />
              ) : volume < 50 ? (
                <Volume1 className="w-4 h-4 lg:w-5 lg:h-5" />
              ) : (
                <Volume2 className="w-4 h-4 lg:w-5 lg:h-5" />
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
            className="p-1.5 text-[#b3b3b3] hover:text-white transition-transform active:scale-95"
            title="Pop-up Mini Player (P)"
            aria-label="Open mini player"
          >
            <PictureInPicture2 className="w-4 h-4 lg:w-5 lg:h-5" />
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 text-[#b3b3b3] hover:text-white transition-transform active:scale-95"
            title="Full screen"
            aria-label="Toggle fullscreen"
          >
            <Maximize2 className="w-4 h-4 lg:w-5 lg:h-5" />
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