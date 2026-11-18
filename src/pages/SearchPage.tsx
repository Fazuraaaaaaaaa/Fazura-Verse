import React, { useState, useEffect } from 'react';
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
  Layers,
  ArrowRight,
  TrendingUp,
  Clapperboard,
  Headphones,
  Play,
} from 'lucide-react';
import { search as searchManga } from '../services/api';
import { searchOtakudesu } from '../services/animeApi';
import { searchDonghua } from '../services/donghuaApi';
import { getMovies } from '../services/movieApi';
import { searchMusic } from '../services/musicApi';
import { MangaCard } from '../components/MangaCard';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const qParam = searchParams.get('q') || '';
  const [inputVal, setInputVal] = useState(qParam);
  const [activeTab, setActiveTab] = useState<'all' | 'manga' | 'anime' | 'donghua' | 'movie' | 'music'>('all');

  useEffect(() => {
    if (qParam !== inputVal) {
      setInputVal(qParam);
    }
  }, [qParam]);

  // Query 1: Manga (BacaKomik)
  const { data: mangaResults, isLoading: mangaLoading } = useQuery({
    queryKey: ['search', 'manga', qParam],
    queryFn: () => searchManga(qParam),
    enabled: Boolean(qParam && qParam.trim().length > 0),
  });

  // Query 2: Anime (Otakudesu)
  const { data: otakudesuResults, isLoading: otakuLoading } = useQuery({
    queryKey: ['search', 'otakudesu', qParam],
    queryFn: () => searchOtakudesu(qParam),
    enabled: Boolean(qParam && qParam.trim().length > 0),
  });

  // Query 3: Donghua (Anichin)
  const { data: donghuaResults, isLoading: donghuaLoading } = useQuery({
    queryKey: ['search', 'donghua', qParam],
    queryFn: () => searchDonghua(qParam),
    enabled: Boolean(qParam && qParam.trim().length > 0),
  });

  // Query 4: Movie & Series (FazuraDex Movie)
  const { data: movieResults, isLoading: movieLoading } = useQuery({
    queryKey: ['search', 'movie', qParam],
    queryFn: () => getMovies({ q: qParam, perPage: 24 }),
    enabled: Boolean(qParam && qParam.trim().length > 0),
  });

  // Query 5: Music (YouTube Music & Catalog)
  const { data: musicResults, isLoading: musicLoading } = useQuery({
    queryKey: ['search', 'music', qParam],
    queryFn: () => searchMusic(qParam),
    enabled: Boolean(qParam && qParam.trim().length > 0),
  });

  const isGlobalLoading =
    Boolean(qParam) && (mangaLoading || otakuLoading || donghuaLoading || movieLoading || musicLoading);

  const mangaList = mangaResults?.komikList || [];
  const animeList = otakudesuResults || [];
  const donghuaList = donghuaResults || [];
  const movieList = movieResults?.data || [];
  const musicList = musicResults || [];

  const totalResults =
    mangaList.length + animeList.length + donghuaList.length + movieList.length + musicList.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    setSearchParams({ q: inputVal.trim() });
  };

  const handleClear = () => {
    setInputVal('');
    setSearchParams({});
  };

  const popularSuggestions = [
    'Solo Leveling',
    'One Piece',
    'Swallowed Star',
    'Jujutsu Kaisen',
    'Battle Through the Heavens',
    'Nano Machine',
    'Bleach',
    'Soul Land',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Search Header */}
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-indigo/10 border border-accent-indigo/20 text-accent-indigo text-xs font-bold uppercase tracking-wider">
          <Search className="w-3.5 h-3.5" />
          Pencarian Lintas Saluran FAZURAVERSE
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Cari Manga, Anime, & Donghua
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Satu kotak pencarian langsung menghubungkan ribuan judul komik dari BacaKomik, anime dari Samehadaku & Otakudesu, serta donghua dari Anichin.
        </p>

        {/* Global Search Input */}
        <form onSubmit={handleSubmit} className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Ketik judul manga, anime, atau donghua..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="w-full pl-12 pr-28 py-3.5 text-sm sm:text-base bg-[#111622] border border-white/10 focus:border-accent-indigo rounded-2xl text-white placeholder-slate-400 focus:outline-none shadow-xl transition-all"
          />

          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {inputVal && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-accent-indigo text-white font-bold text-xs sm:text-sm hover:bg-indigo-500 shadow-md transition-colors"
            >
              Cari
            </button>
          </div>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            Populer:
          </span>
          {popularSuggestions.map((title) => (
            <button
              key={title}
              onClick={() => {
                setInputVal(title);
                setSearchParams({ q: title });
              }}
              className="px-2.5 py-1 rounded-lg bg-[#111622] hover:bg-slate-800 border border-white/5 hover:border-accent-indigo/40 text-xs text-slate-300 hover:text-white transition-colors"
            >
              {title}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header & Tabs */}
      {qParam && (
        <div className="space-y-6 pt-4 border-t border-white/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                Hasil Pencarian: "<span className="text-accent-indigo">{qParam}</span>"
                {isGlobalLoading && (
                  <Loader2 className="w-4 h-4 text-accent-indigo animate-spin" />
                )}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {!isGlobalLoading && `Ditemukan total ${totalResults} judul`}
              </p>
            </div>

            {/* Media Filter Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#111622] border border-white/5 text-xs font-semibold overflow-x-auto">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === 'all'
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Semua ({totalResults})
              </button>
              <button
                onClick={() => setActiveTab('manga')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'manga'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Manga ({mangaList.length})
              </button>
              <button
                onClick={() => setActiveTab('anime')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'anime'
                    ? 'bg-amber-500 text-black font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                Anime ({animeList.length})
              </button>
              <button
                onClick={() => setActiveTab('donghua')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'donghua'
                    ? 'bg-emerald-500 text-black font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Tv className="w-3.5 h-3.5" />
                Donghua ({donghuaList.length})
              </button>
              <button
                onClick={() => setActiveTab('movie')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'movie'
                    ? 'bg-rose-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Clapperboard className="w-3.5 h-3.5" />
                Movies & Series ({movieList.length})
              </button>
              <button
                onClick={() => setActiveTab('music')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'music'
                    ? 'bg-[#1DB954] text-black font-bold shadow-md shadow-[#1DB954]/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Headphones className="w-3.5 h-3.5" />
                Musik ({musicList.length})
              </button>
            </div>
          </div>

          {/* If everything is empty */}
          {!isGlobalLoading && totalResults === 0 && (
            <div className="py-20 text-center space-y-3">
              <Search className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">Tidak Ada Hasil Ditemukan</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Judul "{qParam}" tidak ditemukan di database BacaKomik, Otakudesu, atau Anichin. Coba kata kunci yang lebih singkat.
              </p>
            </div>
          )}

          {/* Section 1: Manga Results */}
          {(activeTab === 'all' || activeTab === 'manga') && mangaList.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Komik & Manga (BacaKomik)
                </h3>
                <span className="text-xs text-slate-500">{mangaList.length} judul</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
                <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <Film className="w-4 h-4" /> Anime Streaming (Otakudesu)
                </h3>
                <span className="text-xs text-slate-500">{animeList.length} judul</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {animeList.map((anime) => (
                  <Link
                    key={`otakudesu-${anime.id}`}
                    to={`/anime/detail/otakudesu/${anime.id}`}
                    className="group relative flex flex-col rounded-xl overflow-hidden bg-[#111622] border border-white/5 hover:border-amber-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-900">
                      <img
                        src={anime.poster || "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22200%22%20height%3D%22300%22%20viewBox%3D%220%200%20200%20300%22%3E%3Crect%20fill%3D%22%231e293b%22%20width%3D%22200%22%20height%3D%22300%22%2F%3E%3C/svg%3E"}
                        alt={anime.title}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22200%22%20height%3D%22300%22%20viewBox%3D%220%200%20200%20300%22%3E%3Crect%20fill%3D%22%231e293b%22%20width%3D%22200%22%20height%3D%22300%22%2F%3E%3C/svg%3E";
                        }}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-2 left-2 z-10">
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-amber-500/90 text-black border border-amber-400/40">
                          Otakudesu
                        </span>
                      </div>
                      {anime.score && (
                        <div className="absolute top-2 right-2 z-10 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/80 text-amber-400 text-xs font-bold border border-white/10">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{anime.score}</span>
                        </div>
                      )}
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
                <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <Tv className="w-4 h-4" /> Donghua 3D/2D (Anichin)
                </h3>
                <span className="text-xs text-slate-500">{donghuaList.length} judul</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {donghuaList.map((donghua) => (
                  <Link
                    key={donghua.slug}
                    to={`/donghua/detail/${donghua.slug}`}
                    className="group relative flex flex-col rounded-xl overflow-hidden bg-[#111622] border border-white/5 hover:border-emerald-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-900">
                      <img
                        src={donghua.poster || "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22200%22%20height%3D%22300%22%20viewBox%3D%220%200%20200%20300%22%3E%3Crect%20fill%3D%22%230f172a%22%20width%3D%22200%22%20height%3D%22300%22%2F%3E%3Ctext%20fill%3D%22%2310b981%22%20font-family%3D%22sans-serif%22%20font-size%3D%2214%22%20dy%3D%2210.5%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%3EDONGHUA%3C%2Ftext%3E%3C%2Fsvg%3E"}
                        alt={donghua.title}
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22200%22%20height%3D%22300%22%20viewBox%3D%220%200%20200%20300%22%3E%3Crect%20fill%3D%22%230f172a%22%20width%3D%22200%22%20height%3D%22300%22%2F%3E%3Ctext%20fill%3D%22%2310b981%22%20font-family%3D%22sans-serif%22%20font-size%3D%2214%22%20dy%3D%2210.5%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%3EDONGHUA%3C%2Ftext%3E%3C%2Fsvg%3E";
                        }}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-2 left-2 z-10">
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-emerald-500/90 text-black border border-emerald-400/40">
                          Anichin
                        </span>
                      </div>
                      {donghua.currentEpisode && (
                        <div className="absolute bottom-2 left-2 z-10">
                          <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-black/80 text-emerald-300 border border-emerald-500/30">
                            {donghua.currentEpisode}
                          </span>
                        </div>
                      )}
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
                <h3 className="text-sm font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                  <Clapperboard className="w-4 h-4" /> Movie & Serial TV (Bioskop / Live TMDB)
                </h3>
                <span className="text-xs text-slate-500">{movieList.length} judul</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {movieList.map((m) => (
                  <Link
                    key={m.id}
                    to={`/movies/${m.id}`}
                    className="group relative flex flex-col rounded-xl overflow-hidden bg-[#111622] border border-white/5 hover:border-rose-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900">
                      <img
                        src={m.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500'}
                        alt={m.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-2 left-2 z-10">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md text-white ${
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
                          <span className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold rounded bg-black/70 text-amber-400 border border-amber-500/30">
                            ★ {m.ratingValue.toFixed(1)}
                          </span>
                        </div>
                      )}
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
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h3 className="text-sm font-bold text-[#1DB954] flex items-center gap-2">
                  <Headphones className="w-4 h-4" /> Musik & Lagu (Fazura Music / YouTube)
                </h3>
                <span className="text-xs text-slate-500">{musicList.length} lagu</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {musicList.map((track) => (
                  <Link
                    key={track.id}
                    to="/music"
                    onClick={() => {
                      try {
                        localStorage.setItem('sonora_queue_first', JSON.stringify({
                          id: track.id,
                          youtubeId: track.youtubeId,
                          title: track.title,
                          artist: track.artist,
                          thumbnail: track.thumbnail,
                          album: track.album || track.title,
                        }));
                      } catch {
                        // ignore
                      }
                    }}
                    className="group relative flex items-center gap-3 p-2.5 rounded-xl bg-[#111622] border border-white/5 hover:border-[#1DB954]/50 hover:bg-slate-900/90 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-900 border border-white/5">
                      <img
                        src={track.thumbnail || `https://i.ytimg.com/vi/${track.youtubeId}/hqdefault.jpg`}
                        alt={track.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-7 h-7 rounded-full bg-[#1DB954] text-black flex items-center justify-center shadow-md">
                          <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 pr-1">
                      <h4 className="text-xs font-bold text-slate-100 group-hover:text-[#1DB954] truncate transition-colors">
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
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
