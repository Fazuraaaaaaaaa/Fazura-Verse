import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Mic2,
  Heart,
} from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { useCategoryBookmarks } from '../../services/categoryStorage';

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function MusicPlayerBar() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    togglePlay,
    nextTrack,
    prevTrack,
    seekTo,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    setShowLyrics,
  } = useMusic();

  const { isBookmarked, toggleBookmark } = useCategoryBookmarks('music');

  if (!currentTrack) return null;

  const bookmarked = isBookmarked(currentTrack.id);

  const handleBookmarkToggle = () => {
    toggleBookmark({
      id: currentTrack.id,
      category: 'music',
      title: currentTrack.title,
      cover: currentTrack.thumbnail,
      link: `/music?play=${encodeURIComponent(currentTrack.id)}`,
      subtitle: `${currentTrack.artist} • ${currentTrack.durationFormatted || 'Audio'}`,
      type: 'Lagu',
      addedAt: Date.now(),
      extra: {
        youtubeId: currentTrack.youtubeId,
        album: currentTrack.album,
      },
    });
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0f131c]/95 border-t border-white/10 backdrop-blur-xl px-3 sm:px-6 py-2.5 sm:py-3 text-white transition-all shadow-2xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-6">
        {/* Left: Track Info & Bookmark */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 max-w-[42%] sm:max-w-xs shrink-0">
          <div className="relative group shrink-0">
            <img
              src={currentTrack.thumbnail || "https://i.ytimg.com/vi/kPa7bsKwL-c/hqdefault.jpg"}
              alt={currentTrack.title}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2250%22%20height%3D%2250%22%20viewBox%3D%220%200%2050%2050%22%3E%3Crect%20fill%3D%22%231e293b%22%20width%3D%2250%22%20height%3D%2250%22%2F%3E%3C%2Fsvg%3E";
              }}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover shadow-md bg-slate-800"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-xs sm:text-sm font-bold text-white truncate hover:underline cursor-pointer">
              {currentTrack.title}
            </h4>
            <p className="text-[10px] sm:text-xs text-slate-400 truncate">
              {currentTrack.artist}
            </p>
          </div>

          <button
            onClick={handleBookmarkToggle}
            title={bookmarked ? 'Hapus dari Lagu Favorit' : 'Simpan ke Lagu Favorit'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 transition-colors shrink-0"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                bookmarked ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
              }`}
            />
          </button>
        </div>

        {/* Center: Playback Controls & Progress Bar */}
        <div className="flex-1 max-w-xl flex flex-col items-center gap-1">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={toggleShuffle}
              title={isShuffle ? 'Acak: Aktif' : 'Acak: Nonaktif'}
              className={`hidden sm:inline-flex p-1.5 rounded-lg text-xs transition-colors ${
                isShuffle ? 'text-[#1DB954]' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={prevTrack}
              title="Lagu Sebelumnya"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white transition-colors"
            >
              <SkipBack className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              title={isPlaying ? 'Jeda' : 'Putar'}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black flex items-center justify-center transition-transform hover:scale-105 shadow-md shadow-[#1DB954]/30"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              ) : (
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={nextTrack}
              title="Lagu Berikutnya"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white transition-colors"
            >
              <SkipForward className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            </button>

            <button
              onClick={toggleRepeat}
              title={`Ulangi: ${repeatMode}`}
              className={`hidden sm:inline-flex p-1.5 rounded-lg text-xs transition-colors ${
                repeatMode !== 'off' ? 'text-[#1DB954]' : 'text-slate-400 hover:text-white'
              }`}
            >
              {repeatMode === 'one' ? (
                <Repeat1 className="w-4 h-4" />
              ) : (
                <Repeat className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Progress Seek Bar */}
          <div className="w-full flex items-center gap-2 text-[10px] sm:text-xs text-slate-400 font-mono">
            <span className="w-8 sm:w-10 text-right">{formatTime(currentTime)}</span>
            <div className="relative flex-1 group py-1 flex items-center cursor-pointer">
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.5}
                value={currentTime}
                onChange={(e) => seekTo(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-[#1DB954] group-hover:h-1.5 transition-all"
                style={{
                  background: `linear-gradient(to right, #1DB954 ${progressPercent}%, rgba(255,255,255,0.2) ${progressPercent}%)`,
                }}
              />
            </div>
            <span className="w-8 sm:w-10">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Lyrics & Volume Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => setShowLyrics((prev) => !prev)}
            title="Buka Lirik Sinkronisasi Real-Time"
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-[#1DB954] hover:bg-white/5 transition-colors flex items-center gap-1.5"
          >
            <Mic2 className="w-4 h-4" />
            <span className="hidden md:inline text-xs font-semibold">Lirik</span>
          </button>

          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={toggleMute}
              title={isMuted ? 'Nyalakan Suara' : 'Bisukan'}
              className="p-1 text-slate-400 hover:text-white transition-colors"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseInt(e.target.value, 10))}
              className="w-16 md:w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-[#1DB954]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
