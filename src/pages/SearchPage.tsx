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
  Clapperboard,
  Headphones,
  Play,
  Pause,
  Clock,
  Trash2,
  Mic,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { search as searchManga } from '../services/api';
import { searchOtakudesu } from '../services/animeApi';
import { searchDonghua, proxyDonghuaPoster } from '../services/donghuaApi';
import { getMovies } from '../services/movieApi';
import { searchMusic } from '../services/musicApi';
import { MangaCard } from '../components/MangaCard';
import { AnimeGridCard } from '../components/anime/AnimeGridCard';
import { MediaCard } from '../components/media/MediaCard';
import { SectionHeader } from '../components/common/SectionHeader';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/StateViews';
import { useMusic } from '../context/MusicContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { CATEGORY_THEMES } from '../utils/categoryTheme';
import {
  MUSIC_FALLBACK_SVG,
  handleMusicImageError,
  handleMusicImageLoad,
} from '../utils/musicThumbnail';

const RECENT_SEARCHES_KEY = 'fazura_recent_searches';

const TRENDING_KEYWORDS = [
  'One Piece',
  'Solo Leveling',
  'Jujutsu Kaisen',
  'Bleach',
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
  const [voiceToast, setVoiceToast] = useState<string | null>(null);
  const { currentTrack, isPlaying, playTrack, togglePlay } = useMusic();

  const handleVoiceSearch = () => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceToast('Pencarian suara tidak didukung pada browser ini.');
      setTimeout(() => setVoiceToast(null), 2500);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'id-ID';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          setInputVal(transcript);
          setSearchParams({ q: transcript.trim() });
          addRecentSearch(transcript.trim());
        }
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const [prevQParam, setPrevQParam] = useState(qParam);
  if (prevQParam !== qParam) {
    setPrevQParam(qParam);
    setInputVal(qParam);
  }

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

  useEffect(() => {
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

  const { data: mangaResults, isLoading: mangaLoading, isError: mangaError, refetch: refetchManga } = useQuery({
    queryKey: ['search', 'manga', qParam],
    queryFn: () => searchManga(qParam),
    enabled: Boolean(qParam && qParam.trim().length > 0),
  });

  const { data: otakudesuResults, isLoading: otakuLoading, isError: otakuError, refetch: refetchAnime } = useQuery({
    queryKey: ['search', 'otakudesu', qParam],
    queryFn: () => searchOtakudesu(qParam),
    enabled: Boolean(qParam && qParam.trim().length > 0),
  });

  const { data: donghuaResults, isLoading: donghuaLoading, isError: donghuaError, refetch: refetchDonghua } = useQuery({
    queryKey: ['search', 'donghua', qParam],
    queryFn: () => searchDonghua(qParam),
    enabled: Boolean(qParam && qParam.trim().length > 0),
  });

  const { data: movieResults, isLoading: movieLoading, isError: movieError, refetch: refetchMovies } = useQuery({
    queryKey: ['search', 'movie', qParam],
    queryFn: () => getMovies({ q: qParam, perPage: 24 }),
    enabled: Boolean(qParam && qParam.trim().length > 0),
  });

  const { data: musicResults, isLoading: musicLoading, isError: musicError, refetch: refetchMusic } = useQuery({
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
    <div className="min-h-screen bg-[#12141B] text-[#F2F0EC] pb-20">
      {voiceToast && (
        <div className="fixed bottom-20 right-4 z-50 px-4 py-2 rounded-[10px] bg-[#191C25] border border-[#343744] text-xs font-medium text-[#F2F0EC] shadow-dialog">
          {voiceToast}
        </div>
      )}

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-w-0">
        {/* Search Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <Badge variant="brand">Pencarian Terpadu</Badge>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#F2F0EC] tracking-tight">
            Cari Anime, Film, Manga, Donghua &amp; Musik
          </h1>
          <p className="text-sm text-[#A2A4B1] max-w-xl mx-auto">
            Temukan ribuan judul dari lima kategori hiburan dalam satu pencarian cepat.
          </p>

          <form onSubmit={handleSubmit} className="relative mt-2">
            <Search className="w-5 h-5 text-[#747887] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Ketik judul anime, film, manga, donghua, atau musik..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full h-12 pl-11 pr-32 sm:pr-40 text-sm sm:text-[15px] bg-[#191C25] border border-[#343744] focus:border-[#F0A15B] rounded-[10px] text-[#F2F0EC] placeholder-[#747887] focus:outline-none transition-colors"
              aria-label="Pencarian Multi-Kategori"
            />

            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                type="button"
                onClick={handleVoiceSearch}
                title={isListening ? 'Mendengarkan suara...' : 'Cari lewat suara'}
                aria-label={isListening ? 'Mendengarkan suara...' : 'Cari lewat suara'}
                className={`w-9 h-9 rounded-[6px] flex items-center justify-center transition-colors cursor-pointer ${
                  isListening
                    ? 'bg-[#E68BA6] text-[#0B0C10]'
                    : 'text-[#A2A4B1] hover:text-[#F2F0EC] hover:bg-[#232633]'
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
                  className="w-9 h-9 rounded-[6px] text-[#747887] hover:text-[#F2F0EC] hover:bg-[#232633] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <Button type="submit" variant="primary" size="sm">
                Cari
              </Button>
            </div>
          </form>

          {recentSearches.length > 0 && (
            <div className="text-left bg-[#191C25] border border-[#343744] rounded-[10px] p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#A2A4B1] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#F0A15B]" />
                  Pencarian Terakhir
                </span>
                <button
                  type="button"
                  onClick={clearRecentSearches}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Hapus Semua</span>
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {recentSearches.map((term) => (
                  <div
                    key={term}
                    className="inline-flex items-center rounded-[6px] bg-[#232633] border border-[#343744] hover:border-[#454958]"
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectKeyword(term)}
                      className="px-2.5 py-1 text-xs text-[#F2F0EC] truncate max-w-[180px] cursor-pointer"
                    >
                      {term}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => removeRecentSearch(term, e)}
                      aria-label={`Hapus ${term}`}
                      className="pr-2 py-1 text-[#747887] hover:text-rose-400 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trending Keywords */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
            <span className="text-xs font-medium text-[#747887] mr-1">Populer:</span>
            {TRENDING_KEYWORDS.map((title) => (
              <button
                key={title}
                type="button"
                onClick={() => handleSelectKeyword(title)}
                className="px-3 py-1.5 rounded-[6px] bg-[#191C25] hover:bg-[#232633] border border-[#343744] hover:border-[#454958] text-xs font-medium text-[#A2A4B1] hover:text-[#F2F0EC] transition-colors cursor-pointer"
              >
                {title}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {qParam ? (
          <div className="space-y-6 pt-4 border-t border-[#343744]/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-heading text-xl sm:text-2xl font-semibold text-[#F2F0EC] flex items-center gap-2">
                  <span>Hasil untuk &quot;{qParam}&quot;</span>
                  {isGlobalLoading && <Loader2 className="w-4 h-4 text-[#F0A15B] animate-spin" />}
                </h2>
                <p className="text-xs text-[#A2A4B1] mt-0.5">
                  {!isGlobalLoading && `Ditemukan total ${totalResults} hasil di seluruh katalog`}
                </p>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 max-w-full">
                {[
                  { id: 'all' as const, label: `Semua (${totalResults})`, activeClass: 'bg-[#F0A15B]/15 text-[#F0A15B] border-[#F0A15B]/45' },
                  { id: 'anime' as const, label: `Anime (${animeList.length})`, activeClass: CATEGORY_THEMES.anime.activeTabClass },
                  { id: 'movie' as const, label: `Movies (${movieList.length})`, activeClass: CATEGORY_THEMES.movies.activeTabClass },
                  { id: 'manga' as const, label: `Manga (${mangaList.length})`, activeClass: CATEGORY_THEMES.manga.activeTabClass },
                  { id: 'donghua' as const, label: `Donghua (${donghuaList.length})`, activeClass: CATEGORY_THEMES.donghua.activeTabClass },
                  { id: 'music' as const, label: `Music (${musicList.length})`, activeClass: CATEGORY_THEMES.music.activeTabClass },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`h-9 px-3 rounded-[10px] text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      activeTab === tab.id
                        ? tab.activeClass
                        : 'bg-[#191C25] text-[#A2A4B1] hover:text-[#F2F0EC] border-[#343744]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {hasAnyError && !isGlobalLoading && (
              <div className="p-3.5 rounded-[10px] bg-[#191C25] border border-[#F0A15B]/40 flex flex-wrap items-center justify-between gap-3 text-xs text-[#F2F0EC]">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#F0A15B] shrink-0" />
                  <span>Sebagian sumber pencarian gagal merespons. Hasil dari sumber lain tetap ditampilkan.</span>
                </div>
                <Button variant="primary" size="sm" onClick={handleRetryFailed}>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Coba Lagi</span>
                </Button>
              </div>
            )}

            {!isGlobalLoading && totalResults === 0 && (
              <EmptyState
                icon={<Search className="w-5 h-5" />}
                title={`Tidak Ada Hasil untuk "${qParam}"`}
                description="Coba periksa ejaan judul atau gunakan salah satu kata kunci populer di atas."
                actionLabel="Reset Pencarian"
                onAction={handleClear}
              />
            )}

            {(activeTab === 'all' || activeTab === 'anime') && animeList.length > 0 && (
              <section className="space-y-4">
                <SectionHeader
                  category="anime"
                  title="Hasil Anime"
                  rightSlot={<span className="text-xs text-[#A2A4B1]">{animeList.length} judul</span>}
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {animeList.map((anime) => (
                    <AnimeGridCard key={`otakudesu-${anime.id}`} anime={anime} />
                  ))}
                </div>
              </section>
            )}

            {(activeTab === 'all' || activeTab === 'movie') && movieList.length > 0 && (
              <section className="space-y-4">
                <SectionHeader
                  category="movies"
                  title="Hasil Movies & Serial TV"
                  rightSlot={<span className="text-xs text-[#A2A4B1]">{movieList.length} judul</span>}
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {movieList.map((m) => (
                    <MediaCard
                      key={m.id}
                      id={m.id}
                      category="movies"
                      title={m.title}
                      imageUrl={m.posterUrl || ''}
                      link={`/movies/${m.id}`}
                      topBadge={m.mediaType === 'tv' ? 'Series' : 'Movie'}
                      rating={m.ratingValue}
                      metaPrimary={m.genres?.[0] || (m.mediaType === 'tv' ? 'Serial TV' : 'Film')}
                      metaSecondary={m.releaseDate ? String(new Date(m.releaseDate).getFullYear()) : undefined}
                      bookmarkType={m.mediaType === 'tv' ? 'Serial TV' : 'Movie'}
                    />
                  ))}
                </div>
              </section>
            )}

            {(activeTab === 'all' || activeTab === 'manga') && mangaList.length > 0 && (
              <section className="space-y-4">
                <SectionHeader
                  category="manga"
                  title="Hasil Komik Manga"
                  rightSlot={<span className="text-xs text-[#A2A4B1]">{mangaList.length} judul</span>}
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {mangaList.map((manga) => (
                    <MangaCard key={manga.slug} manga={manga} />
                  ))}
                </div>
              </section>
            )}

            {(activeTab === 'all' || activeTab === 'donghua') && donghuaList.length > 0 && (
              <section className="space-y-4">
                <SectionHeader
                  category="donghua"
                  title="Hasil Donghua"
                  rightSlot={<span className="text-xs text-[#A2A4B1]">{donghuaList.length} judul</span>}
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {donghuaList.map((donghua) => (
                    <MediaCard
                      key={donghua.slug}
                      id={donghua.slug}
                      category="donghua"
                      title={donghua.title}
                      imageUrl={proxyDonghuaPoster(donghua.poster || '') || donghua.poster}
                      link={`/donghua/detail/${donghua.slug}`}
                      topBadge={donghua.currentEpisode}
                      metaPrimary={donghua.type || 'Donghua'}
                      metaSecondary={donghua.status}
                      bookmarkType="Donghua"
                    />
                  ))}
                </div>
              </section>
            )}

            {(activeTab === 'all' || activeTab === 'music') && musicList.length > 0 && (
              <section className="space-y-4">
                <SectionHeader
                  category="music"
                  title="Hasil Musik & Lagu"
                  rightSlot={<span className="text-xs text-[#A2A4B1]">{musicList.length} lagu</span>}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {musicList.map((track) => {
                    const isTrackActive = currentTrack?.id === track.id;
                    const isTrackPlaying = isTrackActive && isPlaying;

                    return (
                      <button
                        key={track.id}
                        type="button"
                        onClick={() => (isTrackActive ? togglePlay() : playTrack(track, musicList))}
                        className={`group flex items-center gap-3 p-3 rounded-[10px] bg-[#191C25] border text-left transition-colors cursor-pointer ${
                          isTrackActive
                            ? 'border-[#E68BA6]'
                            : 'border-[#343744] hover:border-[#454958]'
                        }`}
                      >
                        <div className="relative w-12 h-12 rounded-[6px] overflow-hidden shrink-0 bg-[#12141B]">
                          <img
                            src={track.thumbnail || MUSIC_FALLBACK_SVG}
                            alt={track.title}
                            loading="lazy"
                            onError={handleMusicImageError}
                            onLoad={handleMusicImageLoad}
                            className="w-full h-full object-cover"
                          />
                          <div
                            className={`absolute inset-0 bg-[#0B0C10]/45 flex items-center justify-center transition-opacity ${
                              isTrackActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            }`}
                          >
                            <span className="w-7 h-7 rounded-full bg-[#F0A15B] text-[#0B0C10] flex items-center justify-center">
                              {isTrackPlaying ? (
                                <Pause className="w-3.5 h-3.5 fill-current" />
                              ) : (
                                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4
                            className={`text-xs font-semibold truncate ${
                              isTrackActive ? 'text-[#E68BA6]' : 'text-[#F2F0EC]'
                            }`}
                          >
                            {track.title}
                          </h4>
                          <p className="text-[11px] text-[#A2A4B1] truncate mt-0.5">{track.artist}</p>
                          {track.durationFormatted && (
                            <p className="text-[10px] text-[#747887] font-mono mt-0.5">
                              {track.durationFormatted}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto pt-4 space-y-5">
            <SectionHeader
              title="Jelajahi Kategori Langsung"
              subtitle="Masuk ke portal kategori utama apabila Anda ingin menelusuri tanpa kata kunci"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              {[
                { to: '/anime', label: 'Anime', sub: 'Sub Indo HD', icon: Film, hex: CATEGORY_THEMES.anime.accentHex },
                { to: '/movies', label: 'Movies', sub: 'Film & Serial', icon: Clapperboard, hex: CATEGORY_THEMES.movies.accentHex },
                { to: '/manga', label: 'Manga', sub: 'Komik & Manhwa', icon: BookOpen, hex: CATEGORY_THEMES.manga.accentHex },
                { to: '/donghua', label: 'Donghua', sub: 'Animasi 3D', icon: Tv, hex: CATEGORY_THEMES.donghua.accentHex },
                { to: '/music', label: 'Music', sub: 'Lagu & Lirik', icon: Headphones, hex: CATEGORY_THEMES.music.accentHex },
              ].map((cat) => (
                <Link
                  key={cat.to}
                  to={cat.to}
                  className="p-4 rounded-[10px] bg-[#191C25] border border-[#343744] hover:border-[#454958] transition-colors text-center space-y-2 group"
                >
                  <div
                    className="w-10 h-10 rounded-[10px] bg-[#12141B] border border-[#343744] flex items-center justify-center mx-auto"
                    style={{ color: cat.hex }}
                  >
                    <cat.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xs font-semibold text-[#F2F0EC] group-hover:text-[#F0A15B]">
                    {cat.label}
                  </h3>
                  <p className="text-[11px] text-[#A2A4B1]">{cat.sub}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
