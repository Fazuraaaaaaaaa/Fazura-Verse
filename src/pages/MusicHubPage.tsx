import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Headphones,
  Play,
  Pause,
  Heart,
  Search,
  Sparkles,
  Flame,
  Radio,
  Bookmark,
  History,
  Trash2,
  Mic2,
  Mic,
  Music,
  Disc3,
  TrendingUp,
  Volume2,
  Loader2,
  X,
  Filter,
  ChevronRight,
} from 'lucide-react';
import { FAZURA_MUSIC_CATALOG, searchMusic, getTrackById, type MusicTrackItem } from '../services/musicApi';
import { useMusic } from '../context/MusicContext';
import { useCategoryBookmarks, useCategoryHistory } from '../services/categoryStorage';
import { HubHistoryShelf } from '../components/library/HubHistoryShelf';

type MusicTabType = 'all' | 'viral' | 'pop_indo' | 'anime' | 'donghua' | 'kpop' | 'rock' | 'bookmarks' | 'history';

const EQUALIZER_STYLES = `
@keyframes soundwave-1 {
  0%, 100% { height: 4px; }
  50% { height: 14px; }
}
@keyframes soundwave-2 {
  0%, 100% { height: 14px; }
  50% { height: 5px; }
}
@keyframes soundwave-3 {
  0%, 100% { height: 7px; }
  50% { height: 16px; }
}
.animate-soundwave-1 {
  animation: soundwave-1 0.75s ease-in-out infinite;
}
.animate-soundwave-2 {
  animation: soundwave-2 0.65s ease-in-out infinite 0.15s;
}
.animate-soundwave-3 {
  animation: soundwave-3 0.8s ease-in-out infinite 0.3s;
}
`;

export function SoundwaveEqualizer({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) {
  const heightClass = size === 'lg' ? 'h-5' : size === 'md' ? 'h-4' : 'h-3.5';
  return (
    <div className={`flex items-end justify-center gap-[2px] ${heightClass} w-4`} aria-label="Equalizer">
      <span className="w-[3px] bg-[#1DB954] rounded-full animate-soundwave-1" style={{ minHeight: '3px' }} />
      <span className="w-[3px] bg-[#1DB954] rounded-full animate-soundwave-2" style={{ minHeight: '3px' }} />
      <span className="w-[3px] bg-[#1DB954] rounded-full animate-soundwave-3" style={{ minHeight: '3px' }} />
    </div>
  );
}

interface TrackRowProps {
  track: MusicTrackItem;
  index: number;
  isActive: boolean;
  isPlaying: boolean;
  isBookmarked: boolean;
  onPlay: (track: MusicTrackItem) => void;
  onTogglePlay: () => void;
  onToggleBookmark: (track: MusicTrackItem) => void;
}

export const TrackRow = React.memo(function TrackRow({
  track,
  index,
  isActive,
  isPlaying,
  isBookmarked,
  onPlay,
  onTogglePlay,
  onToggleBookmark,
}: TrackRowProps) {
  const isThisPlaying = isActive && isPlaying;

  return (
    <div
      className={`flex items-center justify-between p-3 sm:p-4 hover:bg-white/5 transition-colors group ${
        isActive ? 'bg-[#1DB954]/5' : ''
      }`}
    >
      {/* Left: Number / Soundwave, Poster, Title & Artist */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
        <div className="w-5 flex items-center justify-center shrink-0">
          {isThisPlaying ? (
            <SoundwaveEqualizer size="sm" />
          ) : (
            <span
              className={`text-xs font-mono text-center ${
                isActive ? 'text-[#1DB954] font-bold' : 'text-slate-500'
              }`}
            >
              {index + 1}
            </span>
          )}
        </div>

        <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-slate-800 shrink-0 shadow-md">
          <img
            src={track.thumbnail}
            alt={track.title}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://i.ytimg.com/vi/kPa7bsKwL-c/hqdefault.jpg";
            }}
            className="w-full h-full object-cover"
          />
          <button
            onClick={() => {
              if (isActive) {
                onTogglePlay();
              } else {
                onPlay(track);
              }
            }}
            aria-label={isThisPlaying ? 'Jeda' : 'Putar'}
            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
          >
            {isThisPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4
              onClick={() => {
                if (isActive) {
                  onTogglePlay();
                } else {
                  onPlay(track);
                }
              }}
              className={`text-xs sm:text-sm font-bold truncate cursor-pointer hover:underline ${
                isActive ? 'text-[#1DB954]' : 'text-white'
              }`}
            >
              {track.title}
            </h4>
            {track.tag && (
              <span className="hidden sm:inline-block text-[9px] px-1.5 py-0.2 rounded font-semibold bg-white/10 text-slate-300">
                {track.tag}
              </span>
            )}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-400 truncate mt-0.5">
            {track.artist} {track.album ? `• ${track.album}` : ''}
          </p>
        </div>
      </div>

      {/* Right: Actions, Duration & Bookmark */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <span className="text-xs font-mono text-slate-400">
          {track.durationFormatted || '3:30'}
        </span>

        <button
          onClick={() => onToggleBookmark(track)}
          title={isBookmarked ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isBookmarked ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
            }`}
          />
        </button>

        <button
          onClick={() => {
            if (isActive) {
              onTogglePlay();
            } else {
              onPlay(track);
            }
          }}
          aria-label={isThisPlaying ? 'Jeda' : 'Putar'}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            isActive
              ? 'bg-[#1DB954] text-black shadow-md shadow-[#1DB954]/30'
              : 'bg-white/10 hover:bg-[#1DB954] hover:text-black text-white'
          }`}
        >
          {isThisPlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
        </button>
      </div>
    </div>
  );
});

export function MusicHubPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const playParam = searchParams.get('play');
  const searchParam = searchParams.get('search') || searchParams.get('q') || '';
  const tabParam = (searchParams.get('tab') as MusicTabType) || 'all';

  const [activeTab, setActiveTab] = useState<MusicTabType>(
    tabParam === 'bookmarks' || tabParam === 'history' ? tabParam : 'all'
  );
  const [searchInput, setSearchInput] = useState<string>(searchParam);
  const [searchQuery, setSearchQuery] = useState<string>(searchParam);
  const [searchedList, setSearchedList] = useState<MusicTrackItem[]>(FAZURA_MUSIC_CATALOG);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);

  // Voice Search via Web Speech API
  const handleVoiceSearch = () => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Pencarian suara (Voice Search) tidak didukung pada browser ini.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'id-ID';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsVoiceListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          setSearchInput(transcript);
          setSearchQuery(transcript);
          setSearchParams({ q: transcript });
        }
        setIsVoiceListening(false);
      };

      recognition.onerror = () => {
        setIsVoiceListening(false);
      };

      recognition.onend = () => {
        setIsVoiceListening(false);
      };

      recognition.start();
    } catch {
      setIsVoiceListening(false);
    }
  };

  const {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    setShowLyrics,
  } = useMusic();

  const {
    bookmarks,
    isBookmarked,
    toggleBookmark,
    removeBookmark,
  } = useCategoryBookmarks('music');

  const {
    history,
    clearHistory,
    removeHistoryItem,
  } = useCategoryHistory('music');

  // Handle dynamic live search across catalog + millions of online tracks (iTunes API)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchedList(FAZURA_MUSIC_CATALOG);
      setSearchLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await searchMusic(searchQuery.trim());
        setSearchedList(results);
      } catch (err) {
        console.warn('Music search error:', err);
      } finally {
        setSearchLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle auto-play from query param (?play=t-diewithasmile)
  useEffect(() => {
    if (playParam) {
      const found = getTrackById(playParam) || FAZURA_MUSIC_CATALOG.find(
        (t) => t.id === playParam || t.youtubeId === playParam
      );
      if (found) {
        playTrack(found, FAZURA_MUSIC_CATALOG);
      }
    }
  }, [playParam]);

  // Sync state with search and tab params
  useEffect(() => {
    if (tabParam && tabParam !== activeTab && !searchParam) {
      setActiveTab(tabParam);
    }
    if (searchParam !== searchQuery) {
      setSearchInput(searchParam);
      setSearchQuery(searchParam);
      if (searchParam) {
        setActiveTab('all');
      }
    }
  }, [tabParam, searchParam]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setSearchQuery(searchInput.trim());
    if (activeTab === 'bookmarks' || activeTab === 'history') {
      setActiveTab('all');
    }
    const next = new URLSearchParams(searchParams);
    next.set('search', searchInput.trim());
    next.delete('q');
    setSearchParams(next);
  };

  const handleQuickSearch = (term: string) => {
    setSearchInput(term);
    setSearchQuery(term);
    if (activeTab === 'bookmarks' || activeTab === 'history') {
      setActiveTab('all');
    }
    const next = new URLSearchParams(searchParams);
    next.set('search', term);
    next.delete('q');
    setSearchParams(next);
  };

  const handleResetSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    setActiveTab('all');
    const next = new URLSearchParams(searchParams);
    next.delete('search');
    next.delete('q');
    setSearchParams(next);
  };

  const handleSearchInputChange = (val: string) => {
    setSearchInput(val);
    setSearchQuery(val);
    if (val.trim()) {
      if (activeTab === 'bookmarks' || activeTab === 'history') {
        setActiveTab('all');
      }
    }
  };

  // Filtered tracks based on query and active tab
  const filteredTracks = useMemo(() => {
    let list = searchedList;

    if (activeTab === 'viral') {
      list = list.filter((t) => t.tag?.toLowerCase().includes('global') || t.tag?.toLowerCase().includes('viral') || t.tag?.toLowerCase().includes('top') || t.tag?.toLowerCase().includes('billboard'));
    } else if (activeTab === 'pop_indo') {
      list = list.filter((t) => t.genre === 'pop' || t.genre === 'indie' || t.genre === 'acoustic');
    } else if (activeTab === 'anime') {
      list = list.filter((t) => t.genre === 'anime');
    } else if (activeTab === 'donghua') {
      list = list.filter((t) => t.genre === 'donghua');
    } else if (activeTab === 'kpop') {
      list = list.filter((t) => t.genre === 'kpop');
    } else if (activeTab === 'rock') {
      list = list.filter((t) => t.genre === 'rock');
    }

    return list;
  }, [activeTab, searchedList]);

  // Stable callbacks for TrackRow memoization
  const handlePlayTrack = useCallback(
    (track: MusicTrackItem) => {
      playTrack(track, filteredTracks);
    },
    [playTrack, filteredTracks]
  );

  const handleTogglePlay = useCallback(() => {
    togglePlay();
  }, [togglePlay]);

  const handleToggleBookmark = useCallback(
    (track: MusicTrackItem) => {
      toggleBookmark({
        id: track.id,
        category: 'music',
        title: track.title,
        cover: track.thumbnail,
        link: `/music?play=${encodeURIComponent(track.id)}`,
        subtitle: `${track.artist} • ${track.durationFormatted || 'Audio'}`,
        type: 'Lagu',
        addedAt: Date.now(),
        extra: {
          youtubeId: track.youtubeId,
          album: track.album,
          artist: track.artist,
          previewUrl: track.previewUrl,
        },
      });
    },
    [toggleBookmark]
  );

  const heroTrack = currentTrack || FAZURA_MUSIC_CATALOG[0];
  const isHeroPlaying = isPlaying && currentTrack?.id === heroTrack.id;
  const isHeroBookmarked = isBookmarked(heroTrack.id);

  const handleHeroBookmark = () => {
    toggleBookmark({
      id: heroTrack.id,
      category: 'music',
      title: heroTrack.title,
      cover: heroTrack.thumbnail,
      link: `/music?play=${encodeURIComponent(heroTrack.id)}`,
      subtitle: `${heroTrack.artist} • ${heroTrack.durationFormatted || 'Audio'}`,
      type: 'Lagu',
      addedAt: Date.now(),
      extra: {
        youtubeId: heroTrack.youtubeId,
        album: heroTrack.album,
        artist: heroTrack.artist,
        previewUrl: heroTrack.previewUrl,
      },
    });
  };

  return (
    <div className="flex-1 w-full bg-[#0a0d14] text-slate-100 min-h-screen pb-28">
      {/* Soundwave Animation Keyframes */}
      <style>{EQUALIZER_STYLES}</style>

      {/* Top Hero Spotlight */}
      <div className="relative w-full overflow-hidden bg-gradient-to-b from-[#151c2c] to-[#0a0d14] border-b border-white/5 py-8 md:py-14 px-4 sm:px-6 lg:px-8">
        {/* Ambient Blur Background with GPU Acceleration */}
        <div
          className="absolute inset-0 opacity-20 filter blur-3xl scale-125 bg-cover bg-center pointer-events-none transform-gpu will-change-transform translate-z-0 [contain:strict]"
          style={{
            backgroundImage: `url(${heroTrack.thumbnail})`,
            transform: 'translateZ(0) scale(1.25)',
            willChange: 'transform',
            contain: 'strict',
          }}
        />

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-10">
          {/* Album Cover Art */}
          <div className="relative group shrink-0">
            <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden shadow-2xl shadow-black/80 border border-white/10 group-hover:scale-105 transition-transform duration-300">
              <img
                src={heroTrack.thumbnail}
                alt={heroTrack.title}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://i.ytimg.com/vi/kPa7bsKwL-c/hqdefault.jpg";
                }}
                className="w-full h-full object-cover"
              />
            </div>
            {isHeroPlaying && (
              <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-[#1DB954] text-black text-[10px] font-black uppercase flex items-center gap-1.5 shadow-xl shadow-[#1DB954]/30 backdrop-blur-md">
                <SoundwaveEqualizer size="sm" />
                <span className="tracking-wide">Sedang Diputar</span>
              </span>
            )}
          </div>

          {/* Hero Details */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="px-2.5 py-1 rounded-full bg-[#1DB954]/20 border border-[#1DB954]/30 text-[#1DB954] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Headphones className="w-3.5 h-3.5" /> Music Spotlight
              </span>
              {isHeroPlaying && (
                <span className="px-2.5 py-1 rounded-full bg-[#1DB954] text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                  <SoundwaveEqualizer size="sm" />
                  <span>Audio Aktif</span>
                </span>
              )}
              {heroTrack.tag && (
                <span className="px-2.5 py-1 rounded-full bg-white/10 text-white text-xs font-semibold">
                  {heroTrack.tag}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              {heroTrack.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-medium">
              {heroTrack.artist} {heroTrack.album ? `• ${heroTrack.album}` : ''}
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <button
                onClick={() => {
                  if (currentTrack?.id === heroTrack.id) {
                    togglePlay();
                  } else {
                    playTrack(heroTrack, FAZURA_MUSIC_CATALOG);
                  }
                }}
                className="px-6 py-3 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-sm flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg shadow-[#1DB954]/25"
              >
                {isHeroPlaying ? (
                  <>
                    <Pause className="w-5 h-5 fill-current" /> Jeda Musik
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current ml-0.5" /> Putar Sekarang
                  </>
                )}
              </button>

              <button
                onClick={handleHeroBookmark}
                className={`px-4 py-3 rounded-full border transition-all text-sm font-semibold flex items-center gap-2 ${
                  isHeroBookmarked
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                    : 'bg-white/5 hover:bg-white/10 text-slate-200 border-white/10'
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${
                    isHeroBookmarked ? 'fill-rose-500 text-rose-500' : 'text-slate-300'
                  }`}
                />
                {isHeroBookmarked ? 'Tersimpan di Favorit' : 'Tambah ke Favorit'}
              </button>

              <button
                onClick={() => setActiveTab('bookmarks')}
                className={`px-4 py-3 rounded-full border transition-all text-sm font-bold flex items-center gap-2 ${
                  activeTab === 'bookmarks'
                    ? 'bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/30'
                    : 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border-rose-500/30'
                }`}
              >
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                <span>Lihat Favorit ({bookmarks.length})</span>
              </button>

              <button
                onClick={() => setShowLyrics(true)}
                className="px-4 py-3 rounded-full bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-sm font-semibold flex items-center gap-2 transition-colors"
              >
                <Mic2 className="w-4 h-4 text-[#1DB954]" /> Lirik & Karaoke Mic
              </button>
            </div>

            {/* Search Bar inside Hero Spotlight */}
            <div className="pt-3 max-w-xl w-full">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Cari lagu, artis, atau album (e.g. Die With A Smile, Galdive, Yoasobi, Bernadya, Coldplay)..."
                  value={searchInput}
                  onChange={(e) => handleSearchInputChange(e.target.value)}
                  className="w-full pl-10 pr-36 py-3 text-xs sm:text-sm bg-black/50 backdrop-blur-md border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-[#1DB954] focus:ring-1 focus:ring-[#1DB954] transition-all shadow-inner"
                />

                <div className="absolute right-1.5 flex items-center gap-1">
                  {/* Voice Search Mic Button */}
                  <button
                    type="button"
                    onClick={handleVoiceSearch}
                    title={isVoiceListening ? 'Mendengarkan...' : 'Cari dengan suara (Voice Search)'}
                    className={`p-2 rounded-lg text-xs transition-all ${
                      isVoiceListening
                        ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                        : 'text-slate-400 hover:text-[#1DB954] hover:bg-white/10'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                  </button>

                  {searchInput && (
                    <button
                      type="button"
                      onClick={handleResetSearch}
                      title="Hapus pencarian"
                      className="text-slate-400 hover:text-white p-1 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-md shadow-[#1DB954]/25"
                  >
                    <Search className="w-3.5 h-3.5" />
                    Cari
                  </button>
                </div>
              </form>

              {/* Quick Search Chips */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 pt-2.5 text-[11px] text-slate-400">
                <span className="text-slate-500 font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-[#1DB954]" /> Populer:
                </span>
                {['Die With A Smile', 'Galdive', 'Yoasobi', 'Bernadya', 'Sabrina Carpenter', 'Coldplay', 'Aimer', 'NewJeans', 'Queen'].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleQuickSearch(term)}
                    className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-[#1DB954] border border-white/5 hover:border-[#1DB954]/30 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Hub History Shelf */}
        <HubHistoryShelf category="music" />

        {/* Dedicated Favorites Shelf (Shown when user has bookmarked songs) */}
        {bookmarks.length > 0 && activeTab === 'all' && !searchQuery && (
          <section className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                    KOLEKSI FAVORIT ANDA
                  </span>
                  <span className="text-xs text-slate-400 font-mono font-semibold">
                    ({bookmarks.length} lagu)
                  </span>
                </div>
                <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 font-heading">
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                  <span>Lagu Favorit Anda</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Daftar lagu yang telah Anda sukai — klik untuk langsung memutar
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const tracks: MusicTrackItem[] = bookmarks.map((b) => ({
                      id: b.id,
                      youtubeId: b.extra?.youtubeId || b.id,
                      title: b.title,
                      artist: b.extra?.artist || b.subtitle || 'FAZURAVERSE',
                      thumbnail: b.cover,
                      previewUrl: b.extra?.previewUrl,
                    }));
                    if (tracks.length > 0) {
                      playTrack(tracks[0], tracks);
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#1DB954]/20 transition-all active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Putar Semua</span>
                </button>

                <button
                  onClick={() => setActiveTab('bookmarks')}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <span>Buka Semua</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Horizontal Carousel */}
            <div
              id="music-favorites-carousel"
              className="flex items-stretch gap-3.5 overflow-x-auto scrollbar-none snap-x snap-mandatory py-2 scroll-smooth"
            >
              {bookmarks.map((b) => {
                const isTrackActive = currentTrack?.id === b.id;
                const isTrackPlaying = isTrackActive && isPlaying;
                const matchTrack: MusicTrackItem = getTrackById(b.id) ||
                  FAZURA_MUSIC_CATALOG.find((t) => t.id === b.id) || {
                    id: b.id,
                    youtubeId: b.extra?.youtubeId || b.id,
                    title: b.title,
                    artist: b.extra?.artist || b.subtitle || 'FAZURAVERSE',
                    thumbnail: b.cover,
                    previewUrl: b.extra?.previewUrl,
                  };

                return (
                  <div
                    key={`fav-shelf-${b.id}`}
                    onClick={() => {
                      if (isTrackActive) togglePlay();
                      else playTrack(matchTrack);
                    }}
                    className={`w-64 sm:w-72 shrink-0 snap-start flex items-center gap-3 p-3 rounded-2xl cursor-pointer border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group relative overflow-hidden ${
                      isTrackActive
                        ? 'bg-[#181827] border-[#1DB954]/50 shadow-lg shadow-[#1DB954]/10'
                        : 'bg-[#141824]/90 hover:bg-[#1a2030] border-white/5'
                    }`}
                  >
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-800 shrink-0 shadow-md">
                      <img
                        src={b.cover}
                        alt={b.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        {isTrackPlaying ? (
                          <Pause className="w-5 h-5 text-white fill-current" />
                        ) : (
                          <Play className="w-5 h-5 text-white fill-current ml-0.5" />
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 pr-6">
                      <h4 className={`text-xs sm:text-sm font-bold truncate ${isTrackActive ? 'text-[#1DB954]' : 'text-white'}`}>
                        {b.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {b.subtitle || 'FAZURAVERSE'}
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeBookmark(b.id);
                      }}
                      title="Hapus dari Favorit"
                      className="absolute top-2 right-2 p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Navigation Tabs & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none text-xs sm:text-sm font-semibold">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-2 rounded-xl transition-all shrink-0 ${
                activeTab === 'all'
                  ? 'bg-white/10 text-white font-bold border border-white/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Semua Lagu
            </button>

            {/* Category Bookmarks Tab (Positioned as Tab 2 for Instant Discovery) */}
            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`px-3.5 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 ${
                activeTab === 'bookmarks'
                  ? 'bg-rose-500 text-white font-bold shadow-md shadow-rose-500/25 border border-rose-400'
                  : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${activeTab === 'bookmarks' ? 'fill-white text-white' : 'fill-rose-500 text-rose-500'}`} />
              <span>Lagu Favorit</span>
              {bookmarks.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${activeTab === 'bookmarks' ? 'bg-black/30 text-white' : 'bg-rose-500/30 text-rose-200'}`}>
                  {bookmarks.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('viral')}
              className={`px-3.5 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 ${
                activeTab === 'viral'
                  ? 'bg-[#1DB954]/20 text-[#1DB954] font-bold border border-[#1DB954]/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Flame className="w-3.5 h-3.5" /> Viral Hits
            </button>

            <button
              onClick={() => setActiveTab('pop_indo')}
              className={`px-3.5 py-2 rounded-xl transition-all shrink-0 ${
                activeTab === 'pop_indo'
                  ? 'bg-[#1DB954]/20 text-[#1DB954] font-bold border border-[#1DB954]/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Pop Indonesia
            </button>

            <button
              onClick={() => setActiveTab('anime')}
              className={`px-3.5 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 ${
                activeTab === 'anime'
                  ? 'bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Disc3 className="w-3.5 h-3.5" /> Anime OST
            </button>

            <button
              onClick={() => setActiveTab('donghua')}
              className={`px-3.5 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 ${
                activeTab === 'donghua'
                  ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Disc3 className="w-3.5 h-3.5 text-emerald-400" /> Donghua OST
            </button>

            <button
              onClick={() => setActiveTab('kpop')}
              className={`px-3.5 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 ${
                activeTab === 'kpop'
                  ? 'bg-purple-500/20 text-purple-400 font-bold border border-purple-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" /> K-Pop Hits
            </button>

            <button
              onClick={() => setActiveTab('rock')}
              className={`px-3.5 py-2 rounded-xl transition-all shrink-0 ${
                activeTab === 'rock'
                  ? 'bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Rock & Klasik
            </button>

            {/* Category History Tab */}
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-indigo-500/20 text-indigo-400 font-bold border border-indigo-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <History className="w-3.5 h-3.5 text-indigo-400" />
              Riwayat Putar
              {history.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/30 text-indigo-300 text-[10px] font-bold">
                  {history.length}
                </span>
              )}
            </button>
          </div>

          {/* Live Search Input in Tab Bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari lagu, artis, album..."
              value={searchInput}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              className="w-full pl-9 pr-20 py-2 text-xs bg-[#111622] border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-[#1DB954] transition-all"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleResetSearch}
                title="Hapus pencarian"
                className="absolute right-14 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-[11px] rounded-lg transition-colors"
            >
              Cari
            </button>
          </form>
        </div>

        {/* ======================================================== */}
        {/* VIEW 1: BOOKMARKS TAB (LAGU FAVORIT)                     */}
        {/* ======================================================== */}
        {activeTab === 'bookmarks' ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                  Koleksi Lagu Favorit Saya
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Daftar lagu favorit khusus kategori Musik FAZURAVERSE ({bookmarks.length} lagu tersimpan).
                </p>
              </div>

              {bookmarks.length > 0 && (
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => {
                      const tracks: MusicTrackItem[] = bookmarks.map((b) => ({
                        id: b.id,
                        youtubeId: b.extra?.youtubeId || b.id,
                        title: b.title,
                        artist: b.extra?.artist || b.subtitle || 'FAZURAVERSE',
                        thumbnail: b.cover,
                        previewUrl: b.extra?.previewUrl,
                      }));
                      if (tracks.length > 0) {
                        playTrack(tracks[0], tracks);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#1DB954]/25 transition-all active:scale-95"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Putar Semua Favorit
                  </button>
                </div>
              )}
            </div>

            {bookmarks.length > 0 ? (
              <div className="bg-[#111622] border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
                {bookmarks.map((b, idx) => {
                  const isTrackActive = currentTrack?.id === b.id;
                  const isTrackPlaying = isTrackActive && isPlaying;

                  return (
                    <div
                      key={b.id}
                      className="flex items-center justify-between p-3 sm:p-4 hover:bg-white/5 transition-colors group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <div className="w-6 flex items-center justify-center shrink-0">
                          {isTrackPlaying ? (
                            <SoundwaveEqualizer size="sm" />
                          ) : (
                            <span className={`text-xs font-mono text-center ${isTrackActive ? 'text-[#1DB954] font-bold' : 'text-slate-500'}`}>
                              {idx + 1}
                            </span>
                          )}
                        </div>

                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-800 shrink-0 shadow-md">
                          <img
                            src={b.cover}
                            alt={b.title}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => {
                              const matchTrack = getTrackById(b.id) || FAZURA_MUSIC_CATALOG.find((t) => t.id === b.id) || {
                                id: b.id,
                                youtubeId: b.extra?.youtubeId || b.id,
                                title: b.title,
                                artist: b.extra?.artist || b.subtitle || 'FAZURAVERSE',
                                thumbnail: b.cover,
                                previewUrl: b.extra?.previewUrl,
                              };
                              if (isTrackActive) {
                                togglePlay();
                              } else {
                                playTrack(matchTrack, FAZURA_MUSIC_CATALOG);
                              }
                            }}
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                          >
                            {isTrackPlaying ? (
                              <Pause className="w-5 h-5 fill-current" />
                            ) : (
                              <Play className="w-5 h-5 fill-current ml-0.5" />
                            )}
                          </button>
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4
                            onClick={() => {
                              const matchTrack = getTrackById(b.id) || FAZURA_MUSIC_CATALOG.find((t) => t.id === b.id) || {
                                id: b.id,
                                youtubeId: b.extra?.youtubeId || b.id,
                                title: b.title,
                                artist: b.extra?.artist || b.subtitle || 'FAZURAVERSE',
                                thumbnail: b.cover,
                                previewUrl: b.extra?.previewUrl,
                              };
                              playTrack(matchTrack, FAZURA_MUSIC_CATALOG);
                            }}
                            className={`text-sm font-bold truncate cursor-pointer hover:underline ${
                              isTrackActive ? 'text-[#1DB954]' : 'text-white'
                            }`}
                          >
                            {b.title}
                          </h4>
                          <p className="text-xs text-slate-400 truncate">
                            {b.subtitle || 'FAZURAVERSE Music'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          onClick={() => removeBookmark(b.id)}
                          title="Hapus dari Bookmark Musik"
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center bg-[#111622] rounded-2xl border border-white/5 space-y-3 p-6">
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                  <Heart className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white">Belum Ada Lagu Favorit</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Tekan tombol ikon hati pada lagu manapun untuk menyimpannya ke koleksi lagu favorit Anda.
                </p>
                <button
                  onClick={() => setActiveTab('all')}
                  className="px-4 py-2 rounded-xl bg-[#1DB954] text-black font-bold text-xs"
                >
                  Jelajahi Musik
                </button>
              </div>
            )}
          </div>
        ) : activeTab === 'history' ? (
          /* ======================================================== */
          /* VIEW 2: HISTORY TAB (RIWAYAT PUTAR)                      */
          /* ======================================================== */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-400" />
                  Riwayat Pemutaran Musik
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Lagu-lagu yang baru saja Anda dengarkan di FAZURAVERSE ({history.length} lagu).
                </p>
              </div>

              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 text-xs font-semibold text-slate-400 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Hapus Semua Riwayat
                </button>
              )}
            </div>

            {history.length > 0 ? (
              <div className="bg-[#111622] border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
                {history.map((h, idx) => {
                  const isTrackActive = currentTrack?.id === h.id;
                  const isTrackPlaying = isTrackActive && isPlaying;
                  const timeStr = new Date(h.watchedAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={`${h.id}-${idx}`}
                      className="flex items-center justify-between p-3 sm:p-4 hover:bg-white/5 transition-colors group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <div className="w-6 flex items-center justify-center shrink-0">
                          {isTrackPlaying ? (
                            <SoundwaveEqualizer size="sm" />
                          ) : (
                            <span className={`text-xs font-mono text-center ${isTrackActive ? 'text-[#1DB954] font-bold' : 'text-slate-500'}`}>
                              {idx + 1}
                            </span>
                          )}
                        </div>

                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-800 shrink-0 shadow-md">
                          <img
                            src={h.cover}
                            alt={h.title}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => {
                              const matchTrack = getTrackById(h.id) || FAZURA_MUSIC_CATALOG.find((t) => t.id === h.id) || {
                                id: h.id,
                                youtubeId: h.extra?.youtubeId || h.id,
                                title: h.title,
                                artist: h.extra?.artist || 'FAZURAVERSE',
                                thumbnail: h.cover,
                                previewUrl: h.extra?.previewUrl,
                              };
                              if (isTrackActive) {
                                togglePlay();
                              } else {
                                playTrack(matchTrack, FAZURA_MUSIC_CATALOG);
                              }
                            }}
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                          >
                            {isTrackPlaying ? (
                              <Pause className="w-5 h-5 fill-current" />
                            ) : (
                              <Play className="w-5 h-5 fill-current ml-0.5" />
                            )}
                          </button>
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4
                            onClick={() => {
                              const matchTrack = getTrackById(h.id) || FAZURA_MUSIC_CATALOG.find((t) => t.id === h.id) || {
                                id: h.id,
                                youtubeId: h.extra?.youtubeId || h.id,
                                title: h.title,
                                artist: h.extra?.artist || 'FAZURAVERSE',
                                thumbnail: h.cover,
                                previewUrl: h.extra?.previewUrl,
                              };
                              playTrack(matchTrack, FAZURA_MUSIC_CATALOG);
                            }}
                            className={`text-sm font-bold truncate cursor-pointer hover:underline ${
                              isTrackActive ? 'text-[#1DB954]' : 'text-white'
                            }`}
                          >
                            {h.title}
                          </h4>
                          <p className="text-xs text-slate-400 truncate">
                            {h.lastItemTitle || 'Baru saja diputar'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 text-right">
                        <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                          Diputar {timeStr}
                        </span>
                        <button
                          onClick={() => removeHistoryItem(h.id)}
                          title="Hapus item riwayat"
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center bg-[#111622] rounded-2xl border border-white/5 space-y-3 p-6">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                  <History className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white">Belum Ada Riwayat Pemutaran</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Lagu yang Anda putar akan tercatat secara otomatis di sini sehingga mudah untuk diputar kembali.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* ======================================================== */
          /* VIEW 3: TRACK LIST / SEARCH RESULTS                      */
          /* ======================================================== */
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Music className="w-5 h-5 text-[#1DB954]" />
                  {searchQuery ? (
                    <>
                      Hasil Pencarian: "<span className="text-[#1DB954]">{searchQuery}</span>"
                      <span className="text-xs font-normal text-slate-400">
                        ({filteredTracks.length} Lagu {searchLoading ? '' : 'Ditemukan'})
                      </span>
                    </>
                  ) : (
                    <>Daftar Lagu ({filteredTracks.length} Lagu Tersedia)</>
                  )}
                  {searchLoading && <Loader2 className="w-4 h-4 text-[#1DB954] animate-spin" />}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {searchQuery
                    ? `Hasil pencarian di katalog FAZURA Music dan streaming musik global.`
                    : `Klik lagu untuk memutar langsung audio YouTube kualitas tinggi dengan kontrol Spotify.`}
                </p>
              </div>

              {searchQuery && (
                <button
                  onClick={handleResetSearch}
                  className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/5"
                >
                  <X className="w-3.5 h-3.5" /> Hapus Pencarian
                </button>
              )}
            </div>

            {/* Search Genre Filter Chips */}
            {searchQuery && (
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 max-w-full">
                <span className="text-[11px] text-slate-400 font-semibold shrink-0 mr-1 flex items-center gap-1">
                  <Filter className="w-3 h-3 text-[#1DB954]" /> Filter Genre:
                </span>
                {[
                  { id: 'all' as MusicTabType, label: 'Semua Hasil' },
                  { id: 'viral' as MusicTabType, label: 'Viral Hits' },
                  { id: 'pop_indo' as MusicTabType, label: 'Pop Indo' },
                  { id: 'anime' as MusicTabType, label: 'Anime OST' },
                  { id: 'donghua' as MusicTabType, label: 'Donghua OST' },
                  { id: 'kpop' as MusicTabType, label: 'K-Pop' },
                  { id: 'rock' as MusicTabType, label: 'Rock' },
                ].map((chip) => {
                  const isSelected = activeTab === chip.id;
                  return (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => setActiveTab(chip.id)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all ${
                        isSelected
                          ? 'bg-[#1DB954] text-black shadow-md shadow-[#1DB954]/25 font-bold'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5'
                      }`}
                    >
                      {chip.label}
                    </button>
                  );
                })}
              </div>
            )}

            {searchLoading ? (
              <div className="py-20 text-center bg-[#111622] rounded-2xl border border-white/5 space-y-3">
                <Loader2 className="w-10 h-10 text-[#1DB954] animate-spin mx-auto" />
                <h4 className="text-sm font-bold text-white">Mencari Lagu...</h4>
                <p className="text-xs text-slate-400">
                  Sedang mencari lagu "{searchQuery}" di katalog FAZURA Music & database musik global...
                </p>
              </div>
            ) : filteredTracks.length > 0 ? (
              <div className="bg-[#111622] border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
                {filteredTracks.map((track, idx) => (
                  <TrackRow
                    key={track.id}
                    track={track}
                    index={idx}
                    isActive={currentTrack?.id === track.id}
                    isPlaying={isPlaying}
                    isBookmarked={isBookmarked(track.id)}
                    onPlay={handlePlayTrack}
                    onTogglePlay={handleTogglePlay}
                    onToggleBookmark={handleToggleBookmark}
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center bg-[#111622] rounded-2xl border border-white/5 space-y-3 p-6">
                <Search className="w-12 h-12 text-slate-600 mx-auto" />
                <h4 className="text-base font-bold text-white">Lagu Tidak Ditemukan</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Tidak ditemukan lagu atau artis dengan kata kunci "{searchQuery}". Coba gunakan kata kunci lain seperti nama artis atau judul lagu.
                </p>
                <button
                  onClick={handleResetSearch}
                  className="mt-2 px-4 py-2 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-xs rounded-xl transition-all shadow-md shadow-[#1DB954]/25"
                >
                  Lihat Semua Koleksi Lagu
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
