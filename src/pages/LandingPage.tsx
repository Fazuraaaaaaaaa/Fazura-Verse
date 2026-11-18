import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  BookOpen,
  Film,
  Tv,
  Play,
  Clock,
  Flame,
  Search,
  ArrowRight,
  TrendingUp,
  ChevronRight,
  Sparkles,
  Clapperboard,
  Headphones,
} from 'lucide-react';
import { getLatest, getPopular } from '../services/api';
import { getOtakudesuHome } from '../services/animeApi';
import { getDonghuaHome } from '../services/donghuaApi';
import { getMovies } from '../services/movieApi';
import { FAZURA_MUSIC_CATALOG } from '../services/musicApi';

export function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMediaTab, setActiveMediaTab] = useState<'all' | 'manga' | 'anime' | 'donghua' | 'movie' | 'music'>('all');
  const [spotlightChannel, setSpotlightChannel] = useState<'anime' | 'manga' | 'donghua' | 'movie' | 'music'>('movie');
  const navigate = useNavigate();

  // Queries for live content feeds
  const { data: mangaData, isLoading: mangaLoading } = useQuery({
    queryKey: ['landing', 'manga'],
    queryFn: () => getLatest(1),
  });

  const { data: popularManga } = useQuery({
    queryKey: ['landing', 'popular_manga'],
    queryFn: getPopular,
  });

  const { data: animeData, isLoading: animeLoading } = useQuery({
    queryKey: ['landing', 'anime'],
    queryFn: getOtakudesuHome,
  });

  const { data: donghuaData, isLoading: donghuaLoading } = useQuery({
    queryKey: ['landing', 'donghua'],
    queryFn: getDonghuaHome,
  });

  const { data: moviesData, isLoading: moviesLoading } = useQuery({
    queryKey: ['landing', 'movies'],
    queryFn: () => getMovies({ collection: 'trending', perPage: 10 }),
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const latestManga = mangaData?.komikList?.slice(0, 10) || [];
  const latestAnime = animeData?.ongoing?.slice(0, 10) || [];
  const latestDonghua = donghuaData?.latestRelease?.slice(0, 10) || [];
  const latestMovies = moviesData?.data?.slice(0, 10) || [];

  // Curated Popular & Trending Music with authentic YouTube artwork
  const trendingMusicList = FAZURA_MUSIC_CATALOG.slice(0, 10);

  // Dynamic Live Spotlight based on active channel
  const topAnime = animeData?.ongoing?.[0];
  const topManga = popularManga?.komikList?.[0] || latestManga[0];
  const topDonghua = donghuaData?.latestRelease?.[0];
  const topMovie = latestMovies[0];

  const featuredItem = useMemo(() => {
    if (spotlightChannel === 'movie' && topMovie) {
      return {
        title: topMovie.title,
        type: `MOVIE • ${topMovie.mediaType === 'tv' ? 'SERIAL TV' : 'BIOSKOP HD'}`,
        tag: 'Box Office Trending',
        description:
          topMovie.description ||
          'Tonton film bioskop dan serial TV populer dengan multi-server streaming kecepatan tinggi.',
        backdrop: topMovie.backdropUrl || topMovie.posterUrl || '',
        actionLink: `/movies/watch/${topMovie.id}`,
        actionText: 'Tonton Film',
        channelLink: '/movies',
        channelText: 'Katalog Movie Hub',
        color: 'rose',
      };
    }

    if (spotlightChannel === 'manga' && topManga) {
      return {
        title: topManga.title,
        type: `KOMIK • ${topManga.type || 'MANGA'}`,
        tag: 'Paling Populer',
        description: `Baca bab terbaru ${topManga.title} dengan kualitas gambar jernih di server BacaKomik. Dilengkapi mode vertical scroll dan bookmark lokal.`,
        backdrop: topManga.cover,
        actionLink: `/manga/${topManga.slug}`,
        actionText: 'Baca Komik',
        channelLink: '/manga',
        channelText: 'Jelajahi Manga',
        color: 'indigo',
      };
    }

    if (spotlightChannel === 'donghua' && topDonghua) {
      return {
        title: topDonghua.title,
        type: `DONGHUA • ${topDonghua.currentEpisode || 'ONGOING'}`,
        tag: 'Update Teranyar',
        description: `Tonton episode terbaru serial animasi 3D & 2D ${topDonghua.title} dengan subtitle Indonesia di server Anichin. Multi-server streaming cepat.`,
        backdrop: topDonghua.poster,
        actionLink: `/donghua/detail/${topDonghua.slug}`,
        actionText: 'Nonton Donghua',
        channelLink: '/donghua',
        channelText: 'Katalog Donghua',
        color: 'emerald',
      };
    }

    if (spotlightChannel === 'music') {
      return {
        title: 'Die With A Smile - Lady Gaga & Bruno Mars',
        type: 'MUSIK • SPOTIFY-STYLE STREAMING',
        tag: 'Spotlight Release',
        description:
          'Streaming musik modern YouTube Music API di Fazura Music: jutaan lagu hits internasional & Indonesia, playlist viral, audio background playback, lirik interaktif real-time, dan kontrol pemutar modern.',
        backdrop:
          'https://i.ytimg.com/vi/kPa7bsKwL-c/maxresdefault.jpg',
        actionLink: '/music',
        actionText: 'Putar Musik Sekarang',
        channelLink: '/music',
        channelText: 'Buka Fazura Music',
        color: 'emerald',
      };
    }

    // Default to Anime Spotlight
    return {
      title: topAnime?.title || 'Psyren',
      type: `ANIME • ${topAnime?.episodes ? `Episode ${topAnime.episodes}` : 'SUB INDO'}`,
      tag: 'Trending Hari Ini',
      description: topAnime?.title
        ? `Streaming episode terbaru anime ${topAnime.title} subtitle Indonesia gratis dengan resolusi hingga 1080p Full HD di server Otakudesu.`
        : 'Yoshina Ageha terlibat dalam permainan misterius Secret Society Psyren demi menyelamatkan teman masa kecilnya di dunia asing yang mematikan.',
      backdrop:
        topAnime?.poster ||
        'https://v2.samehadaku.how/wp-content/uploads/2026/10/Psyren.jpg',
      actionLink: topAnime?.id
        ? `/anime/detail/otakudesu/${topAnime.id}`
        : '/anime',
      actionText: 'Nonton Sekarang',
      channelLink: '/anime',
      channelText: 'Jelajahi Anime',
      color: 'amber',
    };
  }, [spotlightChannel, topAnime, topManga, topDonghua, topMovie]);

  return (
    <div className="min-h-screen bg-[#080a10] text-slate-100 pb-20">
      {/* 1. Cinematic Media Billboard Hero */}
      <div className="relative w-full min-h-[480px] sm:min-h-[580px] flex items-end overflow-hidden border-b border-white/5">
        {/* Background Backdrop Artwork */}
        <div className="absolute inset-0 bg-slate-950">
          <img
            key={featuredItem.backdrop}
            src={featuredItem.backdrop}
            alt={featuredItem.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-top opacity-35 filter scale-105 transition-opacity duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080a10] via-[#080a10]/75 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080a10] via-[#080a10]/85 to-transparent" />
        </div>

        {/* Billboard Foreground Details */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-6">
          {/* Spotlight Channel Switcher Pills */}
          <div className="flex items-center gap-2 p-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 w-fit overflow-x-auto max-w-full">
            <button
              onClick={() => setSpotlightChannel('movie')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                spotlightChannel === 'movie'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clapperboard className="w-3.5 h-3.5" />
              Movie Spotlight
            </button>
            <button
              onClick={() => setSpotlightChannel('anime')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                spotlightChannel === 'anime'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              Anime Spotlight
            </button>
            <button
              onClick={() => setSpotlightChannel('manga')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                spotlightChannel === 'manga'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Manga Spotlight
            </button>
            <button
              onClick={() => setSpotlightChannel('donghua')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                spotlightChannel === 'donghua'
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              Donghua Spotlight
            </button>
            <button
              onClick={() => setSpotlightChannel('music')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                spotlightChannel === 'music'
                  ? 'bg-[#1DB954] text-black shadow-md shadow-[#1DB954]/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Headphones className="w-3.5 h-3.5" />
              Music Spotlight
            </button>
          </div>

          <div className="max-w-2xl space-y-4">
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-1 rounded text-[11px] font-black uppercase tracking-wider border ${
                  featuredItem.color === 'rose'
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    : featuredItem.color === 'indigo'
                    ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                    : featuredItem.color === 'emerald'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                }`}
              >
                {featuredItem.tag}
              </span>
              <span className="text-xs font-bold text-slate-400 tracking-wider">
                {featuredItem.type}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight line-clamp-2">
              {featuredItem.title}
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm sm:leading-relaxed line-clamp-3 max-w-xl">
              {featuredItem.description}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to={featuredItem.actionLink}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-extrabold text-xs sm:text-sm transition-all transform hover:scale-[1.02] shadow-lg ${
                  featuredItem.color === 'rose'
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                    : featuredItem.color === 'indigo'
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                    : featuredItem.color === 'emerald'
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
                    : 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20'
                }`}
              >
                <Play className="w-4 h-4 fill-current" />
                {featuredItem.actionText}
              </Link>
              <Link
                to={featuredItem.channelLink}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs sm:text-sm backdrop-blur-md transition-all"
              >
                {featuredItem.channelText}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Sleek Global Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <form
          onSubmit={handleSearchSubmit}
          className="p-2 rounded-2xl bg-[#111622] border border-white/10 shadow-2xl flex flex-col sm:flex-row items-center gap-2"
        >
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari judul manga, anime, atau donghua favorit Anda..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-transparent text-white text-sm placeholder-slate-400 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-accent-indigo hover:bg-indigo-500 text-white font-bold text-sm transition-colors shrink-0"
          >
            Cari
          </button>
        </form>
      </div>

      {/* 3. Three Dedicated Media Gateways */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-white/5 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent-indigo" />
              PILIH SALURAN HIBURAN
            </h2>
            <p className="text-xs text-slate-400">
              Akses cepat ke masing-masing kategori media digital
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5">
          {/* Channel 1: Manga */}
          <Link
            to="/manga"
            className="group relative rounded-2xl overflow-hidden bg-[#111622] border border-white/5 hover:border-indigo-500/50 transition-all duration-300 p-6 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <BookOpen className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
                  BacaKomik
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                  Manga & Komik
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Ribuan judul manga Jepang, manhwa Korea, dan manhua China. Dilengkapi reader Webtoon vertical scroll & mode single page.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-slate-300 group-hover:text-white">
              <span>Buka Saluran Manga</span>
              <ChevronRight className="w-4 h-4 text-indigo-400 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Channel 2: Anime */}
          <Link
            to="/anime"
            className="group relative rounded-2xl overflow-hidden bg-[#111622] border border-white/5 hover:border-amber-500/50 transition-all duration-300 p-6 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Film className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                  Otakudesu
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                  Anime Streaming
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Streaming anime subtitle Indonesia dari Otakudesu. Pilihan multi-server 1080p Mega Full HD, 720p HD, 480p SD, hingga 360p Blogspot, anime ongoing & tamat.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-slate-300 group-hover:text-white">
              <span>Buka Saluran Anime</span>
              <ChevronRight className="w-4 h-4 text-amber-400 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Channel 3: Donghua */}
          <Link
            to="/donghua"
            className="group relative rounded-2xl overflow-hidden bg-[#111622] border border-white/5 hover:border-emerald-500/50 transition-all duration-300 p-6 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Tv className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                  Anichin
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                  Donghua 3D/2D
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Serial animasi Tiongkok kultivasi (Xianxia): Soul Land, BTTH, Swallowed Star, Renegade Immortal, dan ratusan episode lainnya.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-slate-300 group-hover:text-white">
              <span>Buka Saluran Donghua</span>
              <ChevronRight className="w-4 h-4 text-emerald-400 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Channel 4: Movies & Series */}
          <Link
            to="/movies"
            className="group relative rounded-2xl overflow-hidden bg-[#111622] border border-white/5 hover:border-rose-500/50 transition-all duration-300 p-6 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <Clapperboard className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-md border border-rose-500/20">
                  Cinema & TMDB
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-rose-400 transition-colors">
                  Movie & Series
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Streaming film bioskop box office, serial TV internasional, dan tayangan terbaru dengan multi-server player berkecepatan tinggi.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-slate-300 group-hover:text-white">
              <span>Buka Saluran Movies</span>
              <ChevronRight className="w-4 h-4 text-rose-400 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Channel 5: Music (Fazura Music) */}
          <Link
            to="/music"
            className="group relative rounded-2xl overflow-hidden bg-[#111622] border border-white/5 hover:border-[#1DB954]/50 transition-all duration-300 p-6 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-[#1DB954]/10 border border-[#1DB954]/20 flex items-center justify-center text-[#1DB954]">
                  <Headphones className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#1DB954] bg-[#1DB954]/10 px-2.5 py-1 rounded-md border border-[#1DB954]/20">
                  Spotify Style
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-[#1DB954] transition-colors">
                  Fazura Music
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Streaming musik YouTube Music API: ribuan lagu hits, lirik sinkronisasi real-time, background playback, smart autoplay & mini player.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-slate-300 group-hover:text-white">
              <span>Buka Saluran Musik</span>
              <ChevronRight className="w-4 h-4 text-[#1DB954] transform group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* 4. Live Updates Feed (Manga, Anime, Donghua) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 space-y-8">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="space-y-0.5">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              UPDATE TERBARU HARI INI
            </h2>
            <p className="text-xs text-slate-400">
              Episode dan chapter paling segar yang baru saja dirilis
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#111622] border border-white/5 text-xs font-semibold">
            <button
              onClick={() => setActiveMediaTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeMediaTab === 'all' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setActiveMediaTab('manga')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeMediaTab === 'manga' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Manga
            </button>
            <button
              onClick={() => setActiveMediaTab('anime')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeMediaTab === 'anime' ? 'bg-amber-500 text-black font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Anime
            </button>
            <button
              onClick={() => setActiveMediaTab('donghua')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeMediaTab === 'donghua' ? 'bg-emerald-500 text-black font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Donghua
            </button>
            <button
              onClick={() => setActiveMediaTab('movie')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeMediaTab === 'movie' ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Movie
            </button>
            <button
              onClick={() => setActiveMediaTab('music')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeMediaTab === 'music' ? 'bg-[#1DB954] text-black font-bold shadow-md shadow-[#1DB954]/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Headphones className="w-3.5 h-3.5" />
              Musik
            </button>
          </div>
        </div>

        {/* 5-Column Parallel Live Feeds */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
          {/* Column A: Manga Latest */}
          {(activeMediaTab === 'all' || activeMediaTab === 'manga') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-indigo-400 border-b border-indigo-500/20 pb-2">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" /> Komik Terbaru
                </span>
                <Link to="/manga" className="text-[11px] text-slate-400 hover:text-white">
                  Lihat Semua →
                </Link>
              </div>

              <div className="space-y-2">
                {latestManga.map((manga) => (
                  <Link
                    key={manga.slug}
                    to={`/manga/${manga.slug}`}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-[#111622] hover:bg-[#182030] border border-white/5 transition-all group"
                  >
                    <img
                      src={manga.cover}
                      alt={manga.title}
                      referrerPolicy="no-referrer"
                      className="w-12 h-16 object-cover rounded-lg bg-slate-900 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-200 group-hover:text-indigo-400 truncate">
                        {manga.title}
                      </p>
                      <p className="text-[11px] text-indigo-400 font-semibold mt-0.5 truncate">
                        {manga.chapter || 'Chapter Baru'}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{manga.date || 'Baru rilis'}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Column B: Anime Latest */}
          {(activeMediaTab === 'all' || activeMediaTab === 'anime') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-amber-400 border-b border-amber-500/20 pb-2">
                <span className="flex items-center gap-1.5">
                  <Film className="w-4 h-4" /> Anime Terbaru
                </span>
                <Link to="/anime" className="text-[11px] text-slate-400 hover:text-white">
                  Lihat Semua →
                </Link>
              </div>

              <div className="space-y-2">
                {latestAnime.map((anime) => (
                  <Link
                    key={anime.id}
                    to={`/anime/detail/otakudesu/${anime.id}`}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-[#111622] hover:bg-[#182030] border border-white/5 transition-all group"
                  >
                    <img
                      src={anime.poster}
                      alt={anime.title}
                      referrerPolicy="no-referrer"
                      className="w-12 h-16 object-cover rounded-lg bg-slate-900 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-200 group-hover:text-amber-400 truncate">
                        {anime.title}
                      </p>
                      <p className="text-[11px] text-amber-400 font-semibold mt-0.5">
                        Episode {anime.episodes || '?'}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{anime.releasedOn || 'Baru rilis'}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Column C: Donghua Latest */}
          {(activeMediaTab === 'all' || activeMediaTab === 'donghua') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-emerald-400 border-b border-emerald-500/20 pb-2">
                <span className="flex items-center gap-1.5">
                  <Tv className="w-4 h-4" /> Donghua Terbaru
                </span>
                <Link to="/donghua" className="text-[11px] text-slate-400 hover:text-white">
                  Lihat Semua →
                </Link>
              </div>

              <div className="space-y-2">
                {latestDonghua.map((donghua) => (
                  <Link
                    key={donghua.slug}
                    to={`/donghua/detail/${donghua.slug}`}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-[#111622] hover:bg-[#182030] border border-white/5 transition-all group"
                  >
                    <img
                      src={donghua.poster}
                      alt={donghua.title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%22%20height%3D%22140%22%20viewBox%3D%220%200%20100%20140%22%3E%3Crect%20fill%3D%22%230f172a%22%20width%3D%22100%22%20height%3D%22140%22%2F%3E%3Ctext%20fill%3D%22%2310b981%22%20font-family%3D%22sans-serif%22%20font-size%3D%2210%22%20dy%3D%227%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%3EDONGHUA%3C%2Ftext%3E%3C%2Fsvg%3E";
                      }}
                      className="w-12 h-16 object-cover rounded-lg bg-slate-900 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 truncate">
                        {donghua.title}
                      </p>
                      <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">
                        {donghua.currentEpisode || 'Episode Baru'}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Anichin Sub Indo</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Column D: Movie & Series Latest */}
          {(activeMediaTab === 'all' || activeMediaTab === 'movie') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-rose-400 border-b border-rose-500/20 pb-2">
                <span className="flex items-center gap-1.5">
                  <Clapperboard className="w-4 h-4" /> Movie & Series
                </span>
                <Link to="/movies" className="text-[11px] text-slate-400 hover:text-white">
                  Lihat Semua →
                </Link>
              </div>

              <div className="space-y-2">
                {latestMovies.map((movie) => (
                  <Link
                    key={movie.id}
                    to={`/movies/${movie.id}`}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-[#111622] hover:bg-[#182030] border border-white/5 transition-all group"
                  >
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-12 h-16 object-cover rounded-lg bg-slate-900 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-200 group-hover:text-rose-400 truncate">
                        {movie.title}
                      </p>
                      <p className="text-[11px] text-rose-400 font-semibold mt-0.5">
                        {movie.mediaType === 'tv' ? 'Serial TV' : 'Film Bioskop'}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {movie.ratingValue ? `★ ${movie.ratingValue.toFixed(1)} TMDB` : 'HD Cinema'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Column E: Music Populer & Trending */}
          {(activeMediaTab === 'all' || activeMediaTab === 'music') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#1DB954] border-b border-[#1DB954]/20 pb-2">
                <span className="flex items-center gap-1.5">
                  <Headphones className="w-4 h-4" /> Musik Trending
                </span>
                <Link to="/music" className="text-[11px] text-slate-400 hover:text-white">
                  Lihat Semua →
                </Link>
              </div>

              <div className="space-y-2">
                {trendingMusicList.map((track) => (
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
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-[#111622] hover:bg-[#182030] border border-white/5 hover:border-[#1DB954]/40 transition-all group"
                  >
                    <div className="relative w-12 h-16 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-white/5">
                      <img
                        src={track.thumbnail}
                        alt={track.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full bg-[#1DB954] text-black flex items-center justify-center shadow-md">
                          <Play className="w-3 h-3 fill-black ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-200 group-hover:text-[#1DB954] truncate">
                        {track.title}
                      </p>
                      <p className="text-[11px] text-[#1DB954] font-semibold mt-0.5 truncate">
                        {track.artist}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                        <span className="text-slate-400">{track.tag || 'Lagu Hits'}</span>
                        {track.durationFormatted && <span>• {track.durationFormatted}</span>}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
