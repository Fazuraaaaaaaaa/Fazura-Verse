import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  X,
  Loader2,
  BookOpen,
  Film,
  Tv,
  Star,
  Clapperboard,
  Headphones,
  Play,
  Clock,
  Trash2,
  Sparkles,
  Compass,
  Flame,
  Mic,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { search as searchManga } from '../services/api';
import { searchOtakudesu } from '../services/animeApi';
import { searchDonghua } from '../services/donghuaApi';
import { getMovies } from '../services/movieApi';
import { searchMusic } from '../services/musicApi';
import { MangaCard } from '../components/MangaCard';
import { useMusic } from '../context/MusicContext';
import { usePageMeta } from '../hooks/usePageMeta';

const RECENT_SEARCHES_KEY = 'fazura_recent_searches';

const TRENDING_KEYWORDS = [
  'One Piece',
  'Solo Leveling',
  'Jujutsu Kaisen',
  'Bleach',
  'Mo Dao Zu Shi',
  'Demon Slayer',
  'Swallowed Star',
  'Battle Through the Heavens',
  'Die With A Smile',
];

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const qParam = searchParams.get('q') || '';
  usePageMeta({
    title: qParam ? `Cari "${qParam}" - Pencarian Terpadu` : 'Pencarian Terpadu Multi-Kategori',
    description:
      'Cari manga, anime sub Indo, donghua, film & serial TV, serta musik favorit dalam satu pencarian cepat di FazuraStream.',
  });
  const [inputVal, setInputVal] = useState(qParam);
  const [activeTab, setActiveTab] = useState<'all' | 'manga' | 'anime' | 'donghua' | 'movie' | 'music'>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const [isListening, setIsListening] = useState(false);
  const { currentTrack, isPlaying, playTrack, togglePlay } = useMusic();

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
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          setInputVal(transcript);
          setSearchParams({ q: transcript.trim() });
          addRecentSearch(transcript.trim());
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Keep inputVal in sync if qParam in URL changes externally (React official pattern)
  const [prevQParam, setPrevQParam] = useState(qParam);
  if (prevQParam !== qParam) {
    setPrevQParam(qParam);
    setInputVal(qParam);
  }

  // Save query into recent searches (max 10 items, deduplicated)
  const addRecentSearch = useCallback((term: string) => {
    const clean = term.trim();
    if (!clean) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== clean.toLowerCase());
      const next = [clean, ...filtered].slice(0, 10);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
      } catch (e) {
        console.error('Failed to save recent search:', e);
      }
      return next;
    });
  }, []);

  const removeRecentSearch = useCallback((term: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setRecentSearches((prev) => {
      const next = prev.filter((item) => item.toLowerCase() !== term.toLowerCase());
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
      } catch (err) {
        console.error('Failed to remove recent search:', err);
      }
      return next;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (e) {
      console.error('Failed to clear recent searches:', e);
    }
  }, []);

  // Debounce search input (300ms)
  useEffect(() => {
    // Only auto-debounce if input has actually changed from the current URL param
    if (inputVal === qParam) return;

    const timer = setTimeout(() => {
      const trimmed = inputVal.trim();
      if (trimmed) {
        setSearchParams({ q: trimmed });
        addRecentSearch(trimmed);
      } else if (qParam) {
        setSearchParams({});
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputVal, qParam, setSearchParams, addRecentSearch]);

  // Query 1: Manga (BacaKomik)
  const {
    data: mangaResults,
    isLoading: mangaLoading,
    isError: mangaError,
    refetch: refetchManga,
  } = useQuery({
    queryKey: ['search', 'manga', qParam],
    queryFn: () => searchManga(qParam),
    enabled: Boolean(qParam && qParam.trim().length > 0),
  });

  // Query 2: Anime (Otakudesu)
  const {
    data: otakudesuResults,
    isLoading: otakuLoading,
    isError: otakuError,
    refetch: refetchAnime,
  } = useQuery({
    queryKey: ['search', 'otakudesu', qParam],
    queryFn: () => searchOtakudesu(qParam),
    enabled: Boolean(qParam && qParam.trim().length > 0),
  });

  // Query 3: Donghua (Anichin)
  const {
    data: donghuaResults,
    isLoading: donghuaLoading,
    isError: donghuaError,
    refetch: refetchDonghua,
  } = useQuery({
    queryKey: ['search', 'donghua', qParam],
    queryFn: () => searchDonghua(qParam),
    enabled: Boolean(qParam && qParam.trim().length > 0),
  });

  // Query 4: Movie & Series (Live TMDB)
  const {
    data: movieResults,
    isLoading: movieLoading,
    isError: movieError,
    refetch: refetchMovies,
  } = useQuery({
    queryKey: ['search', 'movie', qParam],
    queryFn: () => getMovies({ q: qParam, perPage: 24 }),
    enabled: Boolean(qParam && qParam.trim().length > 0),
  });

  // Query 5: Music (YouTube Music & Catalog)
  const {
    data: musicResults,
    isLoading: musicLoading,
    isError: musicError,
    refetch: refetchMusic,
  } = useQuery({
    queryKey: ['search', 'music', qParam],
    queryFn: () => searchMusic(qParam),
    enabled: Boolean(qParam && qParam.trim().length > 0),
  });

  const isGlobalLoading =
    Boolean(qParam) && (mangaLoading || otakuLoading || donghuaLoading || movieLoading || musicLoading);

  const hasAnyError =
    Boolean(qParam) && (mangaError || otakuError || donghuaError || movieError || musicError);

  const handleRetryFailed = () => {
    if (mangaError) refetchManga();
    if (otakuError) refetchAnime();
    if (donghuaError) refetchDonghua();
    if (movieError) refetchMovies();
    if (musicError) refetchMusic();
  };

  const mangaList = mangaResults?.komikList || [];
  const animeList = otakudesuResults || [];
  const donghuaList = donghuaResults || [];
  const movieList = movieResults?.data || [];
  const musicList = musicResults || [];

  const totalResults =
    mangaList.length + animeList.length + donghuaList.length + movieList.length + musicList.length;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputVal.trim();
    if (trimmed) {
      setSearchParams({ q: trimmed });
      addRecentSearch(trimmed);
    } else {
      setSearchParams({});
    }
  };

  const handleClear = () => {
    setInputVal('');
    setSearchParams({});
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleClear();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSelectKeyword = (keyword: string) => {
    setInputVal(keyword);
    setSearchParams({ q: keyword });
    addRecentSearch(keyword);
    inputRef.current?.focus();
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 space-y-8 min-w-0">
      {/* Search Header Banner */}
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-[#C4B5FD] text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />
          Pencarian Terpadu FazuraStream
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight font-heading">
          Cari Manga, Anime, Donghua, Movie & Musik
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Cari ribuan judul komik dari BacaKomik, anime dari Otakudesu & Samehadaku, donghua dari Anichin, film bioskop, dan jutaan lagu favorit.
        </p>

        {/* Global Search Input Box with Keyboard Navigation */}
        <form onSubmit={handleSubmit} className="relative mt-2">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Ketik judul manga, anime, donghua, movie, atau musik..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-10 sm:pl-12 pr-32 sm:pr-40 py-3.5 text-sm sm:text-base bg-surface/90 border border-border-subtle focus:border-accent-primary rounded-2xl text-white placeholder-text-muted focus:outline-none shadow-2xl transition-all"
            aria-label="Pencarian Multi-Kategori"
          />

          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {/* Voice Search Mic Button */}
            <button
              type="button"
              onClick={handleVoiceSearch}
              title={isListening ? 'Mendengarkan suara Anda...' : 'Cari lewat suara (Voice Search)'}
              aria-label={isListening ? 'Mendengarkan suara Anda...' : 'Cari lewat suara'}
              className={`w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/30'
                  : 'text-slate-400 hover:text-[#8B5CF6] hover:bg-white/5 active:scale-95'
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>

            {inputVal && (
              <button
                type="button"
                onClick={handleClear}
                title="Hapus pencarian (Esc)"
                aria-label="Hapus pencarian (Esc)"
                className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl text-slate-400 hover:text-white hover:bg-white/5 flex items-center justify-center transition-colors active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              aria-label="Cari sekarang"
              className="px-4 py-2 min-h-[40px] rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-extrabold text-xs sm:text-sm shadow-md shadow-[#8B5CF6]/30 transition-all active:scale-95 flex items-center justify-center"
            >
              Cari
            </button>
          </div>
        </form>

        <p className="text-[11px] text-slate-500">
          Tips: Tekan <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono text-[10px]">Enter</kbd> untuk mencari seketika, atau <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono text-[10px]">Esc</kbd> untuk mengosongkan.
        </p>

        {/* Recent Search Queries Strip (if available) */}
        {recentSearches.length > 0 && (
          <div className="pt-2 text-left bg-[#181827]/60 border border-white/5 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#8B5CF6]" />
                Riwayat Pencarian Terakhir:
              </span>
              <button
                type="button"
                onClick={clearRecentSearches}
                className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold transition-colors py-1 px-2 rounded-lg hover:bg-rose-500/10 min-h-[32px]"
              >
                <Trash2 className="w-3 h-3" />
                Hapus Riwayat
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {recentSearches.map((term) => (
                <div
                  key={term}
                  className="group/chip inline-flex items-center rounded-xl bg-surface-elevated border border-white/5 hover:border-[#8B5CF6]/40 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => handleSelectKeyword(term)}
                    className="px-3 py-1.5 text-xs text-slate-200 hover:text-white font-medium truncate max-w-[180px] min-h-[36px] flex items-center"
                  >
                    {term}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => removeRecentSearch(term, e)}
                    title={`Hapus "${term}"`}
                    aria-label={`Hapus "${term}"`}
                    className="p-1.5 pr-2 text-slate-500 hover:text-rose-400 transition-colors flex items-center justify-center min-w-[32px] min-h-[36px]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trending Keywords Chips */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-400">
            <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>Trending Sekarang:</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {TRENDING_KEYWORDS.map((title) => (
              <button
                key={title}
                type="button"
                onClick={() => handleSelectKeyword(title)}
                className="px-3 py-1.5 min-h-[36px] rounded-xl bg-[#181827] hover:bg-surface-elevated border border-white/5 hover:border-amber-400/40 text-xs text-slate-200 hover:text-amber-300 transition-all active:scale-95 flex items-center gap-1.5"
              >
                <span>{title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Header & Multi-Category Tabs */}
      {qParam ? (
        <div className="space-y-6 pt-4 border-t border-white/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 font-heading">
                Hasil Pencarian: "<span className="text-[#A78BFA]">{qParam}</span>"
                {isGlobalLoading && (
                  <Loader2 className="w-4 h-4 text-[#8B5CF6] animate-spin" />
                )}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {!isGlobalLoading && `Ditemukan total ${totalResults} judul di seluruh katalog`}
              </p>
            </div>

            {/* Media Filter Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#181827] border border-white/10 text-xs font-semibold overflow-x-auto scrollbar-none max-w-full">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 min-h-[36px] rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'all'
                    ? 'bg-white/10 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Semua ({totalResults})
              </button>
              <button
                onClick={() => setActiveTab('manga')}
                className={`px-3 py-1.5 min-h-[36px] rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  activeTab === 'manga'
                    ? 'bg-[#8B5CF6] text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Manga ({mangaList.length})
              </button>
              <button
                onClick={() => setActiveTab('anime')}
                className={`px-3 py-1.5 min-h-[36px] rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  activeTab === 'anime'
                    ? 'bg-amber-500 text-black font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                Anime ({animeList.length})
              </button>
              <button
                onClick={() => setActiveTab('donghua')}
                className={`px-3 py-1.5 min-h-[36px] rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  activeTab === 'donghua'
                    ? 'bg-emerald-500 text-black font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Tv className="w-3.5 h-3.5" />
                Donghua ({donghuaList.length})
              </button>
              <button
                onClick={() => setActiveTab('movie')}
                className={`px-3 py-1.5 min-h-[36px] rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  activeTab === 'movie'
                    ? 'bg-rose-500 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Clapperboard className="w-3.5 h-3.5" />
                Movies ({movieList.length})
              </button>
              <button
                onClick={() => setActiveTab('music')}
                className={`px-3 py-1.5 min-h-[36px] rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  activeTab === 'music'
                    ? 'bg-[#1DB954] text-black font-extrabold shadow-md shadow-[#1DB954]/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Headphones className="w-3.5 h-3.5" />
                Musik ({musicList.length})
              </button>
            </div>
          </div>

          {/* Partial / Provider Error Recovery Banner */}
          {hasAnyError && !isGlobalLoading && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Sebagian penyedia pencarian gagal merespons. Hasil dari sumber lain tetap ditampilkan.</span>
              </div>
              <button
                type="button"
                onClick={handleRetryFailed}
                className="inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-xl bg-amber-500 text-black font-bold hover:bg-amber-400 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Coba Lagi</span>
              </button>
            </div>
          )}

          {/* Visual Empty State with Anime Icon and Recommended Suggestions */}
          {!isGlobalLoading && totalResults === 0 && (
            <div className="py-16 text-center space-y-6 max-w-md mx-auto">
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                {/* Glowing Anime Eye Orb / Illustrated Badge */}
                <div className="absolute inset-0 rounded-full bg-[#8B5CF6]/20 blur-xl animate-pulse" />
                <div className="relative w-20 h-20 rounded-3xl bg-[#181827] border border-[#8B5CF6]/40 flex items-center justify-center shadow-2xl shadow-[#8B5CF6]/30">
                  <svg
                    className="w-10 h-10 text-[#A78BFA]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 9v1" />
                    <path d="M12 14v1" />
                  </svg>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white font-heading">
                  Tidak Ada Hasil untuk "{qParam}"
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Kami tidak menemukan komik, anime, donghua, movie, atau lagu dengan kata kunci tersebut. Coba periksa ejaan atau pilih rekomendasi di bawah.
                </p>
              </div>

              {/* Recommended Suggestions */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-slate-300">
                  Rekomendasi Populer Untuk Anda:
                </span>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {TRENDING_KEYWORDS.slice(0, 5).map((rec) => (
                    <button
                      key={rec}
                      onClick={() => handleSelectKeyword(rec)}
                      className="px-3 py-1.5 rounded-xl bg-surface-elevated hover:bg-[#8B5CF6]/20 border border-white/5 hover:border-[#8B5CF6]/40 text-xs font-medium text-slate-200 hover:text-white transition-all active:scale-95"
                    >
                      {rec}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Section 1: Manga Results */}
          {(activeTab === 'all' || activeTab === 'manga') && mangaList.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-[#8B5CF6]/20 pb-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#A78BFA] flex items-center gap-2 font-heading">
                  <BookOpen className="w-4 h-4 text-[#8B5CF6]" /> Komik & Manga (BacaKomik)
                </h3>
                <span className="text-xs text-slate-500">{mangaList.length} judul</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {mangaList.map((manga) => (
                  <MangaCard key={manga.slug} manga={manga} />
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Anime Results */}
          {(activeTab === 'all' || activeTab === 'anime') && animeList.length > 0 && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2 font-heading">
                  <Film className="w-4 h-4" /> Anime Streaming (Otakudesu)
                </h3>
                <span className="text-xs text-slate-500">{animeList.length} judul</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {animeList.map((anime) => (
                  <Link
                    key={`otakudesu-${anime.id}`}
                    to={`/anime/detail/otakudesu/${anime.id}`}
                    className="group relative flex flex-col rounded-2xl overflow-hidden bg-[#181827]/90 border border-white/5 hover:border-amber-500/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-amber-500/10"
                  >
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#11111D]">
                      <img
                        src={anime.poster || "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22200%22%20height%3D%22300%22%20viewBox%3D%220%200%20200%20300%22%3E%3Crect%20fill%3D%22%23181827%22%20width%3D%22200%22%20height%3D%22300%22%2F%3E%3C/svg%3E"}
                        alt={anime.title}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22200%22%20height%3D%22300%22%20viewBox%3D%220%200%20200%20300%22%3E%3Crect%20fill%3D%22%23181827%22%20width%3D%22200%22%20height%3D%22300%22%2F%3E%3C/svg%3E";
                        }}
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                      <div className="absolute top-2 left-2 z-10">
                        <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-amber-500/90 text-black border border-amber-400/40 shadow-sm">
                          Otakudesu
                        </span>
                      </div>
                      {anime.score && (
                        <div className="absolute top-2 right-2 z-10 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/80 text-amber-400 text-xs font-bold border border-white/10 backdrop-blur-md">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{anime.score}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#090912] via-transparent to-transparent opacity-80" />
                    </div>
                    <div className="p-3 flex flex-col justify-between flex-1">
                      <h4 className="text-xs font-bold text-slate-100 group-hover:text-amber-400 line-clamp-2 transition-colors">
                        {anime.title}
                      </h4>
                      {anime.status && (
                        <p className="text-[11px] text-slate-400 mt-1">{anime.status}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Donghua Results */}
          {(activeTab === 'all' || activeTab === 'donghua') && donghuaList.length > 0 && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2 font-heading">
                  <Tv className="w-4 h-4" /> Donghua 3D/2D (Anichin)
                </h3>
                <span className="text-xs text-slate-500">{donghuaList.length} judul</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {donghuaList.map((donghua) => (
                  <Link
                    key={donghua.slug}
                    to={`/donghua/detail/${donghua.slug}`}
                    className="group relative flex flex-col rounded-2xl overflow-hidden bg-[#181827]/90 border border-white/5 hover:border-emerald-500/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-emerald-500/10"
                  >
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#11111D]">
                      <img
                        src={donghua.poster || "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22200%22%20height%3D%22300%22%20viewBox%3D%220%200%20200%20300%22%3E%3Crect%20fill%3D%22%23181827%22%20width%3D%22200%22%20height%3D%22300%22%2F%3E%3Ctext%20fill%3D%22%2310b981%22%20font-family%3D%22sans-serif%22%20font-size%3D%2214%22%20dy%3D%2210.5%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%3EDONGHUA%3C%2Ftext%3E%3C%2Fsvg%3E"}
                        alt={donghua.title}
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22200%22%20height%3D%22300%22%20viewBox%3D%220%200%20200%20300%22%3E%3Crect%20fill%3D%22%23181827%22%20width%3D%22200%22%20height%3D%22300%22%2F%3E%3Ctext%20fill%3D%22%2310b981%22%20font-family%3D%22sans-serif%22%20font-size%3D%2214%22%20dy%3D%2210.5%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%3EDONGHUA%3C%2Ftext%3E%3C%2Fsvg%3E";
                        }}
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                      <div className="absolute top-2 left-2 z-10">
                        <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-emerald-500/90 text-black border border-emerald-400/40 shadow-sm">
                          Anichin
                        </span>
                      </div>
                      {donghua.currentEpisode && (
                        <div className="absolute bottom-2 left-2 z-10">
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-black/80 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                            {donghua.currentEpisode}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#090912] via-transparent to-transparent opacity-80" />
                    </div>
                    <div className="p-3 flex flex-col justify-between flex-1">
                      <h4 className="text-xs font-bold text-slate-100 group-hover:text-emerald-400 line-clamp-2 transition-colors">
                        {donghua.title}
                      </h4>
                      {donghua.type && (
                        <p className="text-[11px] text-slate-400 mt-1">{donghua.type}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Movie & Series Results */}
          {(activeTab === 'all' || activeTab === 'movie') && movieList.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-rose-500/20 pb-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2 font-heading">
                  <Clapperboard className="w-4 h-4" /> Movie & Serial TV (Bioskop / Live TMDB)
                </h3>
                <span className="text-xs text-slate-500">{movieList.length} judul</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {movieList.map((m) => (
                  <Link
                    key={m.id}
                    to={`/movies/${m.id}`}
                    className="group relative flex flex-col rounded-2xl overflow-hidden bg-[#181827]/90 border border-white/5 hover:border-rose-500/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-rose-500/10"
                  >
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#11111D]">
                      <img
                        src={m.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500'}
                        alt={m.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                      <div className="absolute top-2 left-2 z-10">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md text-white shadow-sm ${
                            m.mediaType === 'tv'
                              ? 'bg-indigo-600/90 border border-indigo-400/40'
                              : 'bg-rose-600/90 border border-rose-400/40'
                          }`}
                        >
                          {m.mediaType === 'tv' ? 'Series' : 'Movie'}
                        </span>
                      </div>
                      {m.ratingValue && (
                        <div className="absolute top-2 right-2 z-10">
                          <span className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-black/70 text-amber-400 border border-amber-500/30 backdrop-blur-md">
                            ★ {m.ratingValue.toFixed(1)}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#090912] via-transparent to-transparent opacity-80" />
                    </div>
                    <div className="p-3 flex flex-col justify-between flex-1">
                      <h4 className="text-xs font-bold text-slate-100 group-hover:text-rose-400 line-clamp-2 transition-colors">
                        {m.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {m.releaseDate ? new Date(m.releaseDate).getFullYear() : 'Cinema'}
                        {m.duration ? ` • ${m.duration}` : ''}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Section 5: Music Results */}
          {(activeTab === 'all' || activeTab === 'music') && musicList.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-[#1DB954]/20 pb-2">
                <h3 className="text-sm font-bold text-[#1DB954] flex items-center gap-2 font-heading">
                  <Headphones className="w-4 h-4" /> Musik & Lagu (Fazura Music / YouTube)
                </h3>
                <span className="text-xs text-slate-500">{musicList.length} lagu</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {musicList.map((track) => {
                  const isTrackActive = currentTrack?.id === track.id;
                  const isTrackPlaying = isTrackActive && isPlaying;

                  return (
                    <div
                      key={track.id}
                      onClick={() => {
                        if (isTrackActive) {
                          togglePlay();
                        } else {
                          playTrack(track, musicList);
                        }
                      }}
                      className={`group relative flex items-center gap-3 p-3 rounded-2xl bg-[#181827]/90 border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer ${
                        isTrackActive
                          ? 'border-[#1DB954] bg-[#1DB954]/10 shadow-[0_0_15px_rgba(29,185,84,0.15)]'
                          : 'border-white/5 hover:border-[#1DB954]/50 hover:bg-[#1f1f33]'
                      }`}
                    >
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-slate-900 border border-white/5">
                        <img
                          src={track.thumbnail || `https://i.ytimg.com/vi/${track.youtubeId}/hqdefault.jpg`}
                          alt={track.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className={`absolute inset-0 bg-black/40 transition-opacity flex items-center justify-center ${
                          isTrackActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}>
                          <div className="w-7 h-7 rounded-full bg-[#1DB954] text-black flex items-center justify-center shadow-md">
                            {isTrackPlaying ? (
                              <span className="w-2.5 h-2.5 bg-black rounded-sm" />
                            ) : (
                              <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 pr-1">
                        <h4 className={`text-xs font-bold truncate transition-colors ${
                          isTrackActive ? 'text-[#1DB954]' : 'text-slate-100 group-hover:text-[#1DB954]'
                        }`}>
                          {track.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {track.artist}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {track.tag && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#1DB954]/15 text-[#1DB954] font-medium border border-[#1DB954]/30">
                              {track.tag}
                            </span>
                          )}
                          {track.durationFormatted && (
                            <span className="text-[10px] text-slate-500">
                              {track.durationFormatted}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Default State when no search query has been typed */
        <div className="max-w-4xl mx-auto pt-6 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center justify-center gap-2 font-heading">
              <Compass className="w-4 h-4 text-[#8B5CF6]" />
              Eksplorasi Berdasarkan Saluran Konten
            </h2>
            <p className="text-xs text-slate-400">
              Pilih portal media di bawah untuk melihat rilis terbaru dan judul paling trending hari ini.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            <Link
              to="/manga"
              className="p-4 rounded-2xl bg-[#181827]/80 hover:bg-[#181827] border border-white/5 hover:border-[#8B5CF6]/50 transition-all text-center space-y-2 group hover:-translate-y-1 shadow-lg"
            >
              <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/15 text-[#8B5CF6] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-white group-hover:text-[#A78BFA] transition-colors">
                Manga Hub
              </h3>
              <p className="text-[10px] text-slate-400">Komik & Manhwa</p>
            </Link>

            <Link
              to="/anime"
              className="p-4 rounded-2xl bg-[#181827]/80 hover:bg-[#181827] border border-white/5 hover:border-amber-400/50 transition-all text-center space-y-2 group hover:-translate-y-1 shadow-lg"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Film className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                Anime Hub
              </h3>
              <p className="text-[10px] text-slate-400">Streaming 1080p</p>
            </Link>

            <Link
              to="/donghua"
              className="p-4 rounded-2xl bg-[#181827]/80 hover:bg-[#181827] border border-white/5 hover:border-emerald-400/50 transition-all text-center space-y-2 group hover:-translate-y-1 shadow-lg"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Tv className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                Donghua Hub
              </h3>
              <p className="text-[10px] text-slate-400">Animasi 3D Xianxia</p>
            </Link>

            <Link
              to="/movies"
              className="p-4 rounded-2xl bg-[#181827]/80 hover:bg-[#181827] border border-white/5 hover:border-rose-400/50 transition-all text-center space-y-2 group hover:-translate-y-1 shadow-lg"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Clapperboard className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-white group-hover:text-rose-400 transition-colors">
                Movies Hub
              </h3>
              <p className="text-[10px] text-slate-400">Bioskop & Serial TV</p>
            </Link>

            <Link
              to="/music"
              className="p-4 rounded-2xl bg-[#181827]/80 hover:bg-[#181827] border border-white/5 hover:border-[#1DB954]/50 transition-all text-center space-y-2 group hover:-translate-y-1 shadow-lg col-span-2 sm:col-span-1"
            >
              <div className="w-10 h-10 rounded-xl bg-[#1DB954]/15 text-[#1DB954] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Headphones className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-white group-hover:text-[#1DB954] transition-colors">
                Music Hub
              </h3>
              <p className="text-[10px] text-slate-400">Lagu & Lirik Live</p>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
