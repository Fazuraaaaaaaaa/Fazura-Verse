'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Heart,
  Music,
  ListMusic,
  Radio,
} from 'lucide-react';
import { Track, RepeatMode } from '@/types/music';
import { formatDuration } from '@/lib/utils';
import { useLibraryStore } from '@/stores/useLibraryStore';

export default function MiniPlayerPage() {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [showQueueList, setShowQueueList] = useState(false);

  // Scrubber drag state
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubTime, setScrubTime] = useState(0);

  const { isSongLiked, toggleLikeSong } = useLibraryStore();
  const channelRef = useRef<BroadcastChannel | null>(null);

  // Setup BroadcastChannel
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const channel = new BroadcastChannel('sonora_miniplayer_sync');
    channelRef.current = channel;

    const handleMessage = (e: MessageEvent) => {
      const data = e.data;
      if (!data) return;

      if (data.type === 'STATE_UPDATE') {
        const p = data.payload;
        if (p.currentTrack !== undefined) setCurrentTrack(p.currentTrack);
        if (p.isPlaying !== undefined) setIsPlaying(p.isPlaying);
        if (p.currentTime !== undefined && !isScrubbing) setCurrentTime(p.currentTime);
        if (p.duration !== undefined) setDuration(p.duration);
        if (p.volume !== undefined) setVolume(p.volume);
        if (p.isMuted !== undefined) setIsMuted(p.isMuted);
        if (p.isShuffle !== undefined) setIsShuffle(p.isShuffle);
        if (p.repeatMode !== undefined) setRepeatMode(p.repeatMode);
        if (p.queue !== undefined) setQueue(p.queue);
        if (p.queueIndex !== undefined) setQueueIndex(p.queueIndex);
      }
    };

    channel.addEventListener('message', handleMessage);

    // Request initial state from main window
    channel.postMessage({ type: 'REQUEST_STATE' });

    return () => {
      channel.removeEventListener('message', handleMessage);
      channel.close();
      channelRef.current = null;
    };
  }, [isScrubbing]);

  // Send command helper
  const sendCommand = (command: string, args?: any) => {
    if (!channelRef.current) return;
    channelRef.current.postMessage({
      type: 'COMMAND',
      command,
      args,
    });
  };

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
    sendCommand('togglePlay');
  };

  const handleNext = () => {
    sendCommand('nextTrack');
  };

  const handlePrevious = () => {
    sendCommand('previousTrack');
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    sendCommand('seekTo', { seconds: time });
  };

  const handleVolumeChange = (vol: number) => {
    setVolume(vol);
    setIsMuted(vol === 0);
    sendCommand('setVolume', { volume: vol });
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    sendCommand('toggleMute');
  };

  const handleToggleShuffle = () => {
    setIsShuffle(!isShuffle);
    sendCommand('toggleShuffle');
  };

  const handleToggleRepeat = () => {
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    const next = modes[(modes.indexOf(repeatMode) + 1) % modes.length];
    setRepeatMode(next);
    sendCommand('toggleRepeat');
  };

  const handleLike = () => {
    if (!currentTrack) return;
    toggleLikeSong(currentTrack);
    sendCommand('toggleLike', { track: currentTrack });
  };

  // Keyboard controls for miniplayer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleSeek(Math.min(duration, currentTime + 5));
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleSeek(Math.max(0, currentTime - 5));
      } else if (e.code === 'KeyM') {
        handleToggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const isLiked = currentTrack ? isSongLiked(currentTrack.id || currentTrack.youtubeId) : false;
  const displayTime = isScrubbing ? scrubTime : currentTime;
  const progressPercent = duration > 0 ? (displayTime / duration) * 100 : 0;
  const upcomingTracks = queue.slice(queueIndex + 1);

  return (
    <div className="min-h-screen w-full bg-[#121212] text-white flex flex-col justify-between p-4 sm:p-5 select-none relative overflow-hidden">
      {/* Dynamic ambient backdrop glow */}
      {currentTrack?.thumbnail && (
        <div
          className="absolute inset-0 opacity-20 blur-3xl pointer-events-none scale-125"
          style={{
            backgroundImage: `url(${currentTrack.thumbnail})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          }}
        />
      )}

      {/* Mini Player Window Header */}
      <header className="relative z-10 flex items-center justify-between pb-3 border-b border-[#282828]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#1DB954] flex items-center justify-center text-black font-extrabold text-[10px]">
            S
          </div>
          <span className="text-xs font-bold tracking-wider uppercase text-[#b3b3b3]">
            SONORA Mini
          </span>
          {isPlaying && (
            <span className="flex h-2 w-2 relative ml-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1DB954] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1DB954]" />
            </span>
          )}
        </div>

        <button
          onClick={() => setShowQueueList(!showQueueList)}
          className={`p-1.5 rounded hover:bg-[#282828] transition-colors ${
            showQueueList ? 'text-[#1DB954]' : 'text-[#b3b3b3]'
          }`}
          title="Toggle upcoming queue"
        >
          <ListMusic size={16} />
        </button>
      </header>

      {/* Main Body */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center py-4">
        {showQueueList ? (
          <div className="w-full h-64 overflow-y-auto space-y-2 custom-scrollbar pr-1">
            <h3 className="text-xs font-bold text-[#b3b3b3] uppercase tracking-wider mb-2">
              Next In Queue ({upcomingTracks.length})
            </h3>
            {upcomingTracks.length === 0 ? (
              <p className="text-xs text-[#b3b3b3] text-center py-10">Queue is empty</p>
            ) : (
              upcomingTracks.map((t, idx) => (
                <div
                  key={`${t.id || t.youtubeId}-${idx}`}
                  onClick={() => sendCommand('playTrack', { track: t, queue })}
                  className="flex items-center gap-2 p-1.5 rounded hover:bg-[#282828] cursor-pointer group text-left"
                >
                  <img
                    src={t.thumbnail}
                    alt={t.title}
                    className="w-8 h-8 rounded object-cover flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-white truncate group-hover:text-[#1DB954]">
                      {t.title}
                    </p>
                    <p className="text-[10px] text-[#b3b3b3] truncate">{t.artist}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            {/* Album Artwork */}
            <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-xl overflow-hidden shadow-2xl shadow-black/80 mb-4 bg-[#282828]">
              {currentTrack?.thumbnail ? (
                <img
                  src={currentTrack.thumbnail}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music className="w-12 h-12 text-[#b3b3b3]" />
                </div>
              )}
            </div>

            {/* Title & Artist */}
            <div className="w-full flex items-center justify-between px-2">
              <div className="min-w-0 flex-1 mr-2">
                <h2
                  className="text-base font-bold text-white truncate"
                  title={currentTrack?.title}
                >
                  {currentTrack?.title || 'No Song Playing'}
                </h2>
                <p className="text-xs text-[#b3b3b3] truncate mt-0.5">
                  {currentTrack?.artist || 'Ready for playback'}
                </p>
              </div>

              {currentTrack && (
                <button
                  onClick={handleLike}
                  className="p-1.5 text-[#b3b3b3] hover:text-white transition-transform active:scale-90"
                  title={isLiked ? 'Unlike' : 'Like'}
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isLiked ? 'fill-[#1DB954] text-[#1DB954]' : ''
                    }`}
                  />
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer Controls */}
      <footer className="relative z-10 w-full flex flex-col gap-3 pt-2 border-t border-[#282828]">
        {/* Scrubber Timeline */}
        <div className="w-full flex flex-col gap-1">
          <div className="relative w-full flex items-center group h-3 cursor-pointer">
            <div className="w-full h-1 group-hover:h-1.5 bg-[#4d4d4d] rounded-full overflow-hidden transition-all relative">
              <div
                className="h-full bg-white group-hover:bg-[#1db954] rounded-full transition-colors"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div
              className="absolute top-1/2 -translate-y-1/2 -ml-1.5 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{ left: `${progressPercent}%` }}
            />
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.5}
              value={displayTime}
              onMouseDown={() => {
                setIsScrubbing(true);
                setScrubTime(currentTime);
              }}
              onChange={(e) => setScrubTime(parseFloat(e.target.value))}
              onMouseUp={() => {
                setIsScrubbing(false);
                handleSeek(scrubTime);
              }}
              onTouchEnd={() => {
                setIsScrubbing(false);
                handleSeek(scrubTime);
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          <div className="flex justify-between items-center text-[10px] font-mono text-[#b3b3b3]">
            <span>{formatDuration(displayTime)}</span>
            <span>{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between px-2">
          {/* Shuffle */}
          <button
            onClick={handleToggleShuffle}
            className={`p-1.5 transition-colors relative flex flex-col items-center ${
              isShuffle ? 'text-[#1DB954]' : 'text-[#b3b3b3] hover:text-white'
            }`}
            title="Shuffle"
          >
            <Shuffle size={16} />
            {isShuffle && <span className="w-1 h-1 bg-[#1DB954] rounded-full absolute -bottom-0.5" />}
          </button>

          {/* Previous */}
          <button
            onClick={handlePrevious}
            className="p-1.5 text-[#b3b3b3] hover:text-white transition-transform active:scale-95"
            title="Previous"
          >
            <SkipBack size={20} className="fill-current" />
          </button>

          {/* Play/Pause */}
          <button
            onClick={handleTogglePlay}
            className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause size={18} className="fill-black text-black" />
            ) : (
              <Play size={18} className="fill-black text-black translate-x-0.5" />
            )}
          </button>

          {/* Next */}
          <button
            onClick={handleNext}
            className="p-1.5 text-[#b3b3b3] hover:text-white transition-transform active:scale-95"
            title="Next"
          >
            <SkipForward size={20} className="fill-current" />
          </button>

          {/* Repeat */}
          <button
            onClick={handleToggleRepeat}
            className={`p-1.5 transition-colors relative flex flex-col items-center ${
              repeatMode !== 'off' ? 'text-[#1DB954]' : 'text-[#b3b3b3] hover:text-white'
            }`}
            title="Repeat"
          >
            {repeatMode === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}
            {repeatMode !== 'off' && (
              <span className="w-1 h-1 bg-[#1DB954] rounded-full absolute -bottom-0.5" />
            )}
          </button>
        </div>

        {/* Volume Bar */}
        <div className="flex items-center justify-center gap-2 pt-1 px-4">
          <button
            onClick={handleToggleMute}
            className="text-[#b3b3b3] hover:text-white transition-colors"
          >
            {isMuted || volume === 0 ? (
              <VolumeX size={14} />
            ) : volume < 50 ? (
              <Volume1 size={14} />
            ) : (
              <Volume2 size={14} />
            )}
          </button>

          <div className="relative flex-1 flex items-center group h-2 cursor-pointer">
            <div className="w-full h-1 bg-[#4d4d4d] rounded-full overflow-hidden relative">
              <div
                className="h-full bg-white group-hover:bg-[#1db954] rounded-full transition-colors"
                style={{ width: `${isMuted ? 0 : volume}%` }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseInt(e.target.value, 10))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>
      </footer>
    </div>
  );
}
