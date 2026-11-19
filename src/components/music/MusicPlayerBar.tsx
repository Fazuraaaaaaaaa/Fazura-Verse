import React, { useState } from 'react';
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
  X,
  ChevronDown,
  ChevronUp,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { useCategoryBookmarks } from '../../services/categoryStorage';

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

/**
 * Lightweight 3-bar green equalizer visualizer.
 * Animates with soundwave keyframes when music is playing, rests with subtle opacity when paused.
 */
function EqualizerVisualizer({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div
      className="flex items-end gap-0.5 h-3.5 px-1 py-0.5 rounded bg-black/50 backdrop-blur-xs select-none"
      title={isPlaying ? 'Audio Aktif' : 'Audio Dijeda'}
      aria-label={isPlaying ? 'Audio Aktif' : 'Audio Dijeda'}
    >
      <span
        className={`w-0.5 sm:w-1 bg-[#1DB954] rounded-full transition-all duration-300 ${
          isPlaying ? 'animate-soundwave-1' : 'h-1 opacity-40'
        }`}
        style={{ height: isPlaying ? undefined : '3px' }}
      />
      <span
        className={`w-0.5 sm:w-1 bg-[#1DB954] rounded-full transition-all duration-300 ${
          isPlaying ? 'animate-soundwave-2' : 'h-1 opacity-40'
        }`}
        style={{ height: isPlaying ? undefined : '6px' }}
      />
      <span
        className={`w-0.5 sm:w-1 bg-[#1DB954] rounded-full transition-all duration-300 ${
          isPlaying ? 'animate-soundwave-3' : 'h-1 opacity-40'
        }`}
        style={{ height: isPlaying ? undefined : '3px' }}
      />
    </div>
  );
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
    isPlayerDismissed,
    togglePlay,
    nextTrack,
    prevTrack,
    seekTo,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    showLyrics,
    setShowLyrics,
    dismissPlayer,
  } = useMusic();

  const { isBookmarked, toggleBookmark } = useCategoryBookmarks('music');

  // Mini vs Expanded Player state with persistent local memory
  const [isMini, setIsMini] = useState<boolean>(() => {
    try {
      return localStorage.getItem('fazura_player_is_mini') === 'true';
    } catch {
      return false;
    }
  });

  const toggleMiniMode = () => {
    setIsMini((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('fazura_player_is_mini', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  if (!currentTrack || isPlayerDismissed) return null;

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

  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  return (
    <div
      className={`fixed bottom-14 md:bottom-0 left-0 right-0 z-40 bg-[#090912]/98 border-t border-white/10 backdrop-blur-2xl text-white shadow-2xl transition-all duration-300 ease-in-out ${
        isMini ? 'py-1.5 px-3 sm:px-6' : 'py-2 sm:py-3 px-3 sm:px-6'
      }`}
    >
      {/* Top 2px Slim Real-Time Progress Bar for both Mini & Expanded views */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/10 overflow-hidden pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-[#1DB954] to-[#1ed760] transition-all duration-200"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* ======================================================== */}
      {/* MOBILE MINI VIEW (< sm / 640px and isMini is true)       */}
      {/* ======================================================== */}
      {isMini ? (
        <div className="flex sm:hidden items-center justify-between gap-2 w-full animate-in fade-in duration-300">
          {/* Left: Thumbnail with Equalizer Badge + Song Info */}
          <div
            onClick={toggleMiniMode}
            className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer select-none"
            title="Klik untuk memperbesar pemutar"
          >
            <div className="relative shrink-0">
              <img
                src={currentTrack.thumbnail || 'https://i.ytimg.com/vi/kPa7bsKwL-c/hqdefault.jpg'}
                alt={currentTrack.title}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://i.ytimg.com/vi/kPa7bsKwL-c/hqdefault.jpg';
                }}
                className="w-10 h-10 rounded-lg object-cover shadow-md bg-slate-800"
              />
              {/* Equalizer overlay on thumbnail */}
              <div className="absolute bottom-0.5 right-0.5">
                <EqualizerVisualizer isPlaying={isPlaying} />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-white truncate">{currentTrack.title}</h4>
              </div>
              <p className="text-[10px] text-slate-400 truncate">{currentTrack.artist}</p>
            </div>
          </div>

          {/* Right: Play/Pause, Expand Toggle, Close */}
          <div className="flex items-center shrink-0 gap-0.5">
            <button
              onClick={togglePlay}
              aria-label={isPlaying ? 'Jeda Lagu' : 'Putar Lagu'}
              title={isPlaying ? 'Jeda' : 'Putar'}
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black flex items-center justify-center shadow-md shadow-[#1DB954]/30 active:scale-95 transition-transform"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={toggleMiniMode}
              aria-label="Perbesar Pemutar Musik"
              title="Perbesar Pemutar Musik"
              className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white active:scale-95 transition-all"
            >
              <ChevronUp className="w-5 h-5" />
            </button>

            <button
              onClick={dismissPlayer}
              aria-label="Tutup Pemutar Musik"
              title="Tutup Pemutar Musik"
              className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-400 active:scale-95 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* MOBILE EXPANDED VIEW (< sm / 640px and isMini is false)  */
        /* ======================================================== */
        <div className="flex sm:hidden flex-col gap-1.5 w-full max-w-full overflow-hidden animate-in fade-in duration-300">
          {/* Tier 1: Minimize Button + Track Info + Equalizer + Bookmark + Close */}
          <div className="flex items-center justify-between gap-2 w-full">
            {/* Left: Thumbnail & Song Info */}
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="relative shrink-0">
                <img
                  src={currentTrack.thumbnail || 'https://i.ytimg.com/vi/kPa7bsKwL-c/hqdefault.jpg'}
                  alt={currentTrack.title}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://i.ytimg.com/vi/kPa7bsKwL-c/hqdefault.jpg';
                  }}
                  className="w-10 h-10 rounded-lg object-cover shadow-md bg-slate-800"
                />
                <div className="absolute bottom-0.5 right-0.5">
                  <EqualizerVisualizer isPlaying={isPlaying} />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-white truncate">{currentTrack.title}</h4>
                </div>
                <p className="text-[10px] text-slate-400 truncate">{currentTrack.artist}</p>
              </div>
            </div>

            {/* Right: Minimize, Bookmark & Close (touch targets >= 44x44px) */}
            <div className="flex items-center shrink-0">
              <button
                onClick={toggleMiniMode}
                aria-label="Perkecil Pemutar Musik"
                title="Perkecil Pemutar Musik"
                className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white active:scale-95 transition-all"
              >
                <ChevronDown className="w-4 h-4" />
              </button>

              <button
                onClick={handleBookmarkToggle}
                aria-label={bookmarked ? 'Hapus dari Lagu Favorit' : 'Simpan ke Lagu Favorit'}
                title={bookmarked ? 'Hapus dari Lagu Favorit' : 'Simpan ke Lagu Favorit'}
                className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-400 active:scale-95 transition-all"
              >
                <Heart
                  className={`w-4 h-4 transition-colors ${
                    bookmarked ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
                  }`}
                />
              </button>

              <button
                onClick={dismissPlayer}
                aria-label="Tutup Pemutar Musik"
                title="Tutup Pemutar Musik"
                className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-400 active:scale-95 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tier 2: Interactive Scrubber Seek Bar */}
          <div className="w-full flex items-center gap-2 text-[10px] text-slate-400 font-mono">
            <span className="w-7 text-right shrink-0">{formatTime(currentTime)}</span>
            <div className="relative flex-1 py-1 flex items-center">
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.5}
                value={currentTime}
                onChange={(e) => seekTo(parseFloat(e.target.value))}
                aria-label="Seek track position"
                className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-[#1DB954]"
                style={{
                  background: `linear-gradient(to right, #1DB954 ${progressPercent}%, rgba(255,255,255,0.2) ${progressPercent}%)`,
                }}
              />
            </div>
            <span className="w-7 shrink-0">{formatTime(duration)}</span>
          </div>

          {/* Tier 3: Mobile Touch Playback Controls (all min 44x44px tap targets) */}
          <div className="flex items-center justify-between w-full px-1">
            {/* Shuffle Button */}
            <button
              onClick={toggleShuffle}
              aria-label={isShuffle ? 'Acak: Aktif' : 'Acak: Nonaktif'}
              title={isShuffle ? 'Acak: Aktif' : 'Acak: Nonaktif'}
              className={`w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-colors active:scale-95 ${
                isShuffle ? 'text-[#1DB954]' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shuffle className="w-4 h-4" />
            </button>

            {/* Core Controls: Prev, Play/Pause, Next */}
            <div className="flex items-center gap-2">
              <button
                onClick={prevTrack}
                aria-label="Lagu Sebelumnya"
                title="Lagu Sebelumnya"
                className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-300 hover:text-white active:scale-95 transition-all"
              >
                <SkipBack className="w-5 h-5 fill-current" />
              </button>

              <button
                onClick={togglePlay}
                aria-label={isPlaying ? 'Jeda' : 'Putar'}
                title={isPlaying ? 'Jeda' : 'Putar'}
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black flex items-center justify-center shadow-md shadow-[#1DB954]/30 active:scale-95 transition-transform"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>

              <button
                onClick={nextTrack}
                aria-label="Lagu Berikutnya"
                title="Lagu Berikutnya"
                className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-300 hover:text-white active:scale-95 transition-all"
              >
                <SkipForward className="w-5 h-5 fill-current" />
              </button>
            </div>

            {/* Repeat & Lyrics Buttons */}
            <div className="flex items-center">
              <button
                onClick={toggleRepeat}
                aria-label={`Ulangi: ${repeatMode}`}
                title={`Ulangi: ${repeatMode}`}
                className={`w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-colors active:scale-95 ${
                  repeatMode !== 'off' ? 'text-[#1DB954]' : 'text-slate-400 hover:text-white'
                }`}
              >
                {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setShowLyrics((prev) => !prev)}
                aria-label="Buka Lirik & Mode Mic Karaoke"
                title="Buka Lirik & Mode Mic Karaoke"
                className={`w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-all ${
                  showLyrics
                    ? 'bg-[#1DB954] text-black shadow-lg shadow-[#1DB954]/30 scale-105'
                    : 'text-slate-400 hover:text-[#1DB954] active:scale-95'
                }`}
              >
                <Mic2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DESKTOP VIEW (sm:flex / 640px+): 3-Column Spotify Bar     */}
      {/* ======================================================== */}
      <div className="hidden sm:flex max-w-7xl mx-auto items-center justify-between gap-3 sm:gap-6 transition-all duration-300">
        {/* Left: Track Info, Equalizer, Bookmark & Minimize Button */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 max-w-xs shrink-0">
          <div className="relative group shrink-0">
            <img
              src={currentTrack.thumbnail || 'https://i.ytimg.com/vi/kPa7bsKwL-c/hqdefault.jpg'}
              alt={currentTrack.title}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://i.ytimg.com/vi/kPa7bsKwL-c/hqdefault.jpg';
              }}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg object-cover shadow-md bg-slate-800"
            />
            {/* Equalizer overlay badge */}
            <div className="absolute bottom-1 right-1">
              <EqualizerVisualizer isPlaying={isPlaying} />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs sm:text-sm font-bold text-white truncate hover:underline cursor-pointer">
                {currentTrack.title}
              </h4>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400 truncate">
              {currentTrack.artist}
            </p>
          </div>

          <div className="flex items-center shrink-0 gap-0.5">
            <button
              onClick={handleBookmarkToggle}
              title={bookmarked ? 'Hapus dari Lagu Favorit' : 'Simpan ke Lagu Favorit'}
              aria-label={bookmarked ? 'Hapus dari Lagu Favorit' : 'Simpan ke Lagu Favorit'}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-400 transition-colors shrink-0"
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  bookmarked ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
                }`}
              />
            </button>

            <button
              onClick={toggleMiniMode}
              title={isMini ? 'Perbesar Tampilan Bar' : 'Perkecil Pemutar (Mode Mini)'}
              aria-label={isMini ? 'Perbesar Tampilan Bar' : 'Perkecil Pemutar (Mode Mini)'}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-white transition-colors shrink-0"
            >
              {isMini ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Center: Playback Controls & Progress Bar */}
        <div className="flex-1 max-w-xl flex flex-col items-center gap-1">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={toggleShuffle}
              title={isShuffle ? 'Acak: Aktif' : 'Acak: Nonaktif'}
              aria-label={isShuffle ? 'Acak: Aktif' : 'Acak: Nonaktif'}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                isShuffle ? 'text-[#1DB954]' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={prevTrack}
              title="Lagu Sebelumnya"
              aria-label="Lagu Sebelumnya"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white transition-colors"
            >
              <SkipBack className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              title={isPlaying ? 'Jeda' : 'Putar'}
              aria-label={isPlaying ? 'Jeda' : 'Putar'}
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
              aria-label="Lagu Berikutnya"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white transition-colors"
            >
              <SkipForward className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            </button>

            <button
              onClick={toggleRepeat}
              title={`Ulangi: ${repeatMode}`}
              aria-label={`Ulangi: ${repeatMode}`}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
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
                aria-label="Seek track position"
                className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-[#1DB954] group-hover:h-1.5 transition-all"
                style={{
                  background: `linear-gradient(to right, #1DB954 ${progressPercent}%, rgba(255,255,255,0.2) ${progressPercent}%)`,
                }}
              />
            </div>
            <span className="w-8 sm:w-10">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Lyrics, Volume (with persistent memory) & Close Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => setShowLyrics((prev) => !prev)}
            title="Buka Lirik Sinkronisasi Real-Time & Mode Mic Karaoke"
            aria-label="Buka Lirik Sinkronisasi Real-Time & Mode Mic Karaoke"
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              showLyrics
                ? 'bg-[#1DB954] text-black font-bold shadow-md shadow-[#1DB954]/30 scale-105'
                : 'text-slate-400 hover:text-[#1DB954] hover:bg-white/5'
            }`}
          >
            <Mic2 className="w-4 h-4" />
            <span className="hidden md:inline text-xs font-semibold">Lirik & Mic</span>
          </button>

          <div className="flex items-center gap-2" title={`Volume: ${isMuted ? 0 : volume}%`}>
            <button
              onClick={toggleMute}
              title={isMuted ? 'Nyalakan Suara' : 'Bisukan'}
              aria-label={isMuted ? 'Nyalakan Suara' : 'Bisukan'}
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
              aria-label="Music volume slider"
              className="w-16 md:w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-[#1DB954]"
            />
          </div>

          <button
            onClick={dismissPlayer}
            title="Tutup Pemutar Musik"
            aria-label="Tutup Pemutar Musik"
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
