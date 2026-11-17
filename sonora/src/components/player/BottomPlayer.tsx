'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
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
  ListMusic,
  Mic2,
  Heart,
  Music,
} from 'lucide-react';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { useLibraryStore } from '@/stores/useLibraryStore';
import { formatDuration } from '@/lib/utils';

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
    showQueue,
    showLyrics,
    isFullscreen,
    togglePlay,
    nextTrack,
    previousTrack,
    seekTo,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    toggleQueue,
    toggleLyrics,
    toggleFullscreen,
  } = usePlayerStore();

  const { isSongLiked, toggleLikeSong } = useLibraryStore();

  const isLiked = currentTrack ? isSongLiked(currentTrack.id || currentTrack.youtubeId) : false;

  // Local state for smooth dragging of progress bar
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubTime, setScrubTime] = useState(0);

  // Time to display in progress
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

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setVolume(val);
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-[72px] sm:h-[90px] bg-[#000000] border-t border-[#282828] px-3 sm:px-4 flex items-center justify-between z-50 select-none">
      {/* 1. LEFT SECTION: Track Info & Like */}
      <div className="w-[30%] min-w-[150px] sm:min-w-[180px] max-w-[360px] flex items-center gap-3">
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

            {/* Song title and artist */}
            <div className="flex flex-col min-w-0 justify-center">
              <span
                onClick={toggleFullscreen}
                className="text-white text-xs sm:text-sm font-semibold truncate hover:underline cursor-pointer"
                title={currentTrack.title}
              >
                {currentTrack.title}
              </span>
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

      {/* 2. CENTER SECTION: Playback Controls & Progress Bar */}
      <div className="w-[40%] max-w-[722px] flex flex-col items-center justify-center gap-1 sm:gap-1.5">
        {/* Buttons Row */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Shuffle */}
          <button
            onClick={toggleShuffle}
            className={`p-1.5 transition-colors relative flex flex-col items-center group ${
              isShuffle ? 'text-[#1DB954]' : 'text-[#b3b3b3] hover:text-white'
            }`}
            title={isShuffle ? 'Disable shuffle' : 'Enable shuffle'}
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
            title="Previous"
            aria-label="Previous track"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          {/* Play/Pause Main Button */}
          <button
            onClick={togglePlay}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md flex-shrink-0"
            title={isPlaying ? 'Pause' : 'Play'}
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
            title="Next"
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
                ? 'Enable repeat'
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
        </div>

        {/* Scrubber Timeline Row */}
        <div className="w-full flex items-center gap-2 max-w-[500px]">
          <span className="text-[11px] font-mono text-[#b3b3b3] min-w-[34px] text-right select-none">
            {formatDuration(displayTime)}
          </span>

          {/* Custom Spotify Scrubber */}
          <div className="relative flex-1 flex items-center group/scrubber h-3 cursor-pointer py-1">
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

      {/* 3. RIGHT SECTION: Lyrics, Queue, Volume, Fullscreen */}
      <div className="w-[30%] min-w-[150px] sm:min-w-[180px] max-w-[360px] flex items-center justify-end gap-1.5 sm:gap-3">
        {/* Lyrics Button */}
        <button
          onClick={toggleLyrics}
          className={`p-1.5 transition-colors ${
            showLyrics ? 'text-[#1DB954]' : 'text-[#b3b3b3] hover:text-white'
          }`}
          title="Lyrics"
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
          title="Queue"
          aria-label="Toggle queue"
        >
          <ListMusic className="w-4 h-4 sm:w-5 sm:h-5" />
          {showQueue && (
            <span className="w-1 h-1 bg-[#1DB954] rounded-full absolute bottom-0.5 left-1/2 -translate-x-1/2" />
          )}
        </button>

        {/* Volume Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={toggleMute}
            className="p-1 text-[#b3b3b3] hover:text-white transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
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
          <div className="relative w-16 sm:w-24 flex items-center group/vol h-3 cursor-pointer py-1">
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
  );
};

export default BottomPlayer;
