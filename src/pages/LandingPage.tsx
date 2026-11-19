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
  Star,
  Compass,
  Radio,
} from 'lucide-react';
import { getLatest, getPopular } from '../services/api';
import { getOtakudesuHome } from '../services/animeApi';
import { getDonghuaHome } from '../services/donghuaApi';
import { getMovies } from '../services/movieApi';
import { FAZURA_MUSIC_CATALOG } from '../services/musicApi';

export function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMediaTab, setActiveMediaTab] = useState<'all' | 'manga' | 'anime' | 'donghua' | 'movie' | 'music'>('all');
  const [spotlightChannel, setSpotlightChannel] = useState<'anime' | 'manga' | 'donghua' | 'movie' | 'music'>('anime');
  const navigate = useNavigate();

  // Queries for live content feeds from platform APIs
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
        japaneseTag: '映画 • CINEMA HD',
        type: `MOVIE • ${topMovie.mediaType === 'tv' ? 'SERIAL TV' : 'BIOSKOP HD'}`,
        tag: 'Box Office Trending',
        rating: topMovie.ratingValue ? topMovie.ratingValue.toFixed(1) : '8.9',
        qualityBadge: '4K ULTRA HD',
        description:
          topMovie.description ||
          'Tonton film bioskop blockbuster dunia dan serial TV populer dengan multi-server streaming kecepatan tinggi, audio Dolby, dan subtitle Indonesia.',
        backdrop: topMovie.backdropUrl || topMovie.posterUrl || '',
        poster: topMovie.posterUrl || '',
        actionLink: `/movies/watch/${topMovie.id}`,
        actionText: 'Tonton Film Sekarang',
        channelLink: '/movies',
        channelText: 'Jelajahi Movie Hub',
        accentColor: '#F43F5E',
        badgeBg: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
        btnBg: 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 shadow-rose-600/30',
      };
    }

    if (spotlightChannel === 'manga' && topManga) {
      return {
        title: topManga.title,
        japaneseTag: '漫画 • MANGA READER',
        type: `KOMIK • ${topManga.type || 'MANGA'}`,
        tag: 'Paling Populer',
        rating: '9.4',
        qualityBadge: 'WEBTOON SCROLL',
        description: `Baca bab terbaru ${topManga.title} dengan kualitas gambar jernih di server BacaKomik. Dilengkapi mode vertical scroll, single page, offline cache, dan bookmark otomatis.`,
        backdrop: topManga.cover,
        poster: topManga.cover,
        actionLink: `/manga/${topManga.slug}`,
        actionText: 'Baca Komik Sekarang',
        channelLink: '/manga',
        channelText: 'Katalog Manga Hub',
        accentColor: '#8B5CF6',
        badgeBg: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
        btnBg: 'bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#9061F9] hover:to-[#6D28D9] shadow-[#8B5CF6]/30',
      };
    }

    if (spotlightChannel === 'donghua' && topDonghua) {
      return {
        title: topDonghua.title,
        japaneseTag: '动画 • 3D XIANXIA',
        type: `DONGHUA • ${topDonghua.currentEpisode || 'ONGOING'}`,
        tag: 'Kultivasi Teranyar',
        rating: '9.2',
        qualityBadge: '60FPS 1080P',
        description: `Tonton episode terbaru serial animasi 3D & 2D ${topDonghua.title} dengan subtitle Indonesia di server Anichin. Petualangan kultivasi tanpa batas dengan multi-server streaming cepat.`,
        backdrop: topDonghua.poster,
        poster: topDonghua.poster,
        actionLink: `/donghua/detail/${topDonghua.slug}`,
        actionText: 'Nonton Donghua Sekarang',
        channelLink: '/donghua',
        channelText: 'Katalog Donghua Hub',
        accentColor: '#10B981',
        badgeBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        btnBg: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/30',
      };
    }

    if (spotlightChannel === 'music') {
      return {
        title: 'Die With A Smile - Lady Gaga & Bruno Mars',
        japaneseTag: '音楽 • YOUTUBE MUSIC',
        type: 'MUSIK • SPOTIFY-STYLE STREAMING',
        tag: 'Global #1 Hit',
        rating: '9.9',
        qualityBadge: 'LOSSLESS AUDIO',
        description:
          'Streaming musik modern di FAZURAVERSE: jutaan lagu hits internasional & Indonesia, playlist viral, smart shuffle, audio background playback, lirik interaktif real-time, dan kontrol pop-up mini player.',
        backdrop: 'https://i.ytimg.com/vi/kPa7bsKwL-c/maxresdefault.jpg',
        poster: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
        actionLink: '/music',
        actionText: 'Putar Musik Sekarang',
        channelLink: '/music',
        channelText: 'Buka Sonora Music',
        accentColor: '#1DB954',
        badgeBg: 'bg-[#1DB954]/20 text-[#1DB954] border-[#1DB954]/30',
        btnBg: 'bg-gradient-to-r from-[#1DB954] to-[#1ed760] hover:from-[#1ed760] hover:to-[#17a34a] text-black shadow-[#1DB954]/30',
      };
    }

    // Default to Anime Spotlight
    return {
      title: topAnime?.title || 'Solo Leveling: Season 2',
      japaneseTag: 'アニメ • OTAKUDESU STREAM',
      type: `ANIME • ${topAnime?.episodes ? `Episode ${topAnime.episodes}` : 'SUB INDO ONGOING'}`,
      tag: 'Trending Hari Ini',
      rating: '9.6',
      qualityBadge: '1080P MEGA HD',
      description: topAnime?.title
        ? `Streaming episode terbaru anime ${topAnime.title} subtitle Indonesia gratis dengan resolusi hingga 1080p Full HD di server Otakudesu. Bebas buffering dan audio jernih.`
        : 'Perjalanan Sung Jin-Woo menjadi pemburu terkuat di dunia menghadapi gerbang misterius dan raja bayangan yang mengancam umat manusia.',
      backdrop:
        topAnime?.poster ||
        'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600&auto=format&fit=crop&q=80',
      poster:
        topAnime?.poster ||
        'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      actionLink: topAnime?.id ? `/anime/detail/otakudesu/${topAnime.id}` : '/anime',
      actionText: 'Nonton Anime Sekarang',
      channelLink: '/anime',
      channelText: 'Katalog Anime Hub',
      accentColor: '#F59E0B',
      badgeBg: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      btnBg: 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black shadow-amber-500/30',
    };
  }, [spotlightChannel, topAnime, topManga, topDonghua, topMovie]);

  return (
    <div className="min-h-screen bg-[#090912] text-text-primary pb-24 w-full overflow-x-hidden min-w-0 font-sans selection:bg-[#8B5CF6] selection:text-white">
      {/* 1. Grand Cinematic Anime Universe Hero Showcase */}
      <section className="relative w-full min-h-[520px] sm:min-h-[620px] lg:min-h-[680px] flex items-end overflow-hidden border-b border-white/5 bg-[#090912]">
        {/* Dynamic Ambient Glow Spheres (GPU Accelerated) */}
        <div
          className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-[#8B5CF6]/15 blur-[140px] pointer-events-none transform-gpu animate-pulse-glow"
          aria-hidden="true"
        />
        <div
          className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none transform-gpu"
          aria-hidden="true"
        />

        {/* Cinematic Backdrop with Multi-directional Gradient Vignettes */}
        <div className="absolute inset-0 bg-[#090912]">
          <img
            key={featuredItem.backdrop}
            src={featuredItem.backdrop}
            alt={featuredItem.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-top opacity-30 filter scale-105 transition-all duration-1000 ease-out"
          />
          {/* Top subtle vignette */}
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#090912] via-[#090912]/80 to-transparent" />
          {/* Bottom solid vignette merging into page */}
          <div className="absolute inset-x-0 bottom-0 h-80 bg-gradient-to-t from-[#090912] via-[#090912]/95 to-transparent" />
          {/* Left horizontal vignette for text readability */}
          <div className="absolute inset-y-0 left-0 w-full lg:w-3/4 bg-gradient-to-r from-[#090912] via-[#090912]/90 to-transparent" />
          {/* Japanese digital grid line pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
        </div>

        {/* Foreground Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full flex flex-col lg:flex-row lg:items-end justify-between gap-8 sm:gap-12">
          {/* Left Column: Spotlight details */}
          <div className="max-w-2xl space-y-5">
            {/* Spotlight Channel Switcher Pills */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#11111D]/80 backdrop-blur-xl border border-white/10 w-fit overflow-x-auto max-w-full scrollbar-none shadow-2xl">
              <button
                type="button"
                onClick={() => setSpotlightChannel('anime')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 whitespace-nowrap active:scale-95 ${
                  spotlightChannel === 'anime'
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25'
                    : 'text-text-secondary hover:text-white hover:bg-white/5'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Anime アニメ</span>
              </button>

              <button
                type="button"
                onClick={() => setSpotlightChannel('manga')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 whitespace-nowrap active:scale-95 ${
                  spotlightChannel === 'manga'
                    ? 'bg-[#8B5CF6] text-white shadow-lg shadow-[#8B5CF6]/30'
                    : 'text-text-secondary hover:text-white hover:bg-white/5'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Manga 漫画</span>
              </button>

              <button
                type="button"
                onClick={() => setSpotlightChannel('donghua')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 whitespace-nowrap active:scale-95 ${
                  spotlightChannel === 'donghua'
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/25'
                    : 'text-text-secondary hover:text-white hover:bg-white/5'
                }`}
              >
                <Tv className="w-3.5 h-3.5" />
                <span>Donghua 动画</span>
              </button>

              <button
                type="button"
                onClick={() => setSpotlightChannel('movie')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 whitespace-nowrap active:scale-95 ${
                  spotlightChannel === 'movie'
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25'
                    : 'text-text-secondary hover:text-white hover:bg-white/5'
                }`}
              >
                <Clapperboard className="w-3.5 h-3.5" />
                <span>Movie 映画</span>
              </button>

              <button
                type="button"
                onClick={() => setSpotlightChannel('music')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 whitespace-nowrap active:scale-95 ${
                  spotlightChannel === 'music'
                    ? 'bg-[#1DB954] text-black shadow-lg shadow-[#1DB954]/25'
                    : 'text-text-secondary hover:text-white hover:bg-white/5'
                }`}
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>Music 音楽</span>
              </button>
            </div>

            {/* Badges Bar: Japanese Aesthetic Tag, Score, and Quality */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span
                className={`px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider border backdrop-blur-md ${featuredItem.badgeBg}`}
              >
                {featuredItem.tag}
              </span>

              <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-extrabold">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{featuredItem.rating}</span>
              </span>

              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-text-secondary text-[11px] font-bold tracking-wider">
                {featuredItem.qualityBadge}
              </span>

              <span className="text-xs font-bold text-text-muted tracking-wider">
                {featuredItem.japaneseTag}
              </span>
            </div>

            {/* Headline Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-text-primary tracking-tight leading-[1.08] drop-shadow-xl line-clamp-2">
              {featuredItem.title}
            </h1>

            {/* Structured Synopsis */}
            <p className="text-text-secondary text-xs sm:text-sm md:text-base leading-relaxed line-clamp-3 max-w-xl">
              {featuredItem.description}
            </p>

            {/* Action CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-3">
              <Link
                to={featuredItem.actionLink}
                className={`flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-extrabold text-sm sm:text-base transition-all transform hover:scale-[1.03] active:scale-[0.98] shadow-xl group ${featuredItem.btnBg}`}
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current transition-transform group-hover:scale-110" />
                <span>{featuredItem.actionText}</span>
              </Link>

              <Link
                to={featuredItem.channelLink}
                className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-surface-elevated/80 hover:bg-surface-elevated text-text-primary font-bold text-sm sm:text-base border border-white/10 backdrop-blur-md hover:border-white/20 transition-all shadow-md group"
              >
                <span>{featuredItem.channelText}</span>
                <ArrowRight className="w-4 h-4 text-accent-secondary transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Column: Floating 3D Artwork Showcase (Desktop only) */}
          <div className="hidden lg:block relative flex-shrink-0 animate-float">
            <div className="relative w-72 h-[380px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-surface shadow-black/80 group">
              <img
                src={featuredItem.poster}
                alt={featuredItem.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090912] via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-4 left-4 right-4 space-y-1 text-center">
                <span className="inline-block text-[10px] font-black uppercase tracking-widest bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-white">
                  FAZURA SPOTLIGHT
                </span>
                <p className="text-xs font-bold text-white/90 truncate">{featuredItem.title}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Sleek Global Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-7 relative z-20">
        <form
          onSubmit={handleSearchSubmit}
          className="p-2 sm:p-2.5 rounded-2xl bg-surface/90 border border-border-subtle shadow-2xl backdrop-blur-2xl flex flex-col sm:flex-row items-center gap-2"
        >
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 text-accent-soft absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari komik, anime, donghua, movie, atau musik favorit Anda..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-transparent text-text-primary text-sm placeholder-text-muted focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-accent-primary hover:bg-accent-secondary text-white font-extrabold text-sm transition-all shadow-lg shadow-accent-primary/25 shrink-0 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Cari Konten
          </button>
        </form>
      </div>

      {/* 3. Five Dedicated Media Gateways (Channel Grid) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-white/5 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-primary" />
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider text-accent-soft">
                チャンネル • SALURAN MEDIA
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 mt-1">
              <TrendingUp className="w-5 h-5 text-accent-primary" />
              <span>PILIH SALURAN HIBURAN</span>
            </h2>
          </div>
          <p className="text-xs text-text-muted">
            Multi-portal terintegrasi dengan ribuan konten legal dan server cepat
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5">
          {/* Channel 1: Manga */}
          <Link
            to="/manga"
            className="group relative rounded-2xl overflow-hidden bg-surface border border-border-subtle hover:border-violet-500/50 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300 p-6 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-md border border-violet-500/20">
                  漫画 • BacaKomik
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-white group-hover:text-violet-400 transition-colors">
                  Manga & Komik
                </h3>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  Ribuan manga Jepang, manhwa Korea, dan manhua China. Dilengkapi reader vertical scroll & mode single page.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-white/5 flex items-center justify-between text-xs font-bold text-text-secondary group-hover:text-white">
              <span>Buka Saluran Manga</span>
              <ChevronRight className="w-4 h-4 text-violet-400 transform group-hover:translate-x-1.5 transition-transform" />
            </div>
          </Link>

          {/* Channel 2: Anime */}
          <Link
            to="/anime"
            className="group relative rounded-2xl overflow-hidden bg-surface border border-border-subtle hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 p-6 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <Film className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                  アニメ • Otakudesu
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-white group-hover:text-amber-400 transition-colors">
                  Anime Streaming
                </h3>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  Streaming anime subtitle Indonesia. Multi-server 1080p Mega HD, 720p HD, 480p SD, rilisan ongoing & tamat.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-white/5 flex items-center justify-between text-xs font-bold text-text-secondary group-hover:text-white">
              <span>Buka Saluran Anime</span>
              <ChevronRight className="w-4 h-4 text-amber-400 transform group-hover:translate-x-1.5 transition-transform" />
            </div>
          </Link>

          {/* Channel 3: Donghua */}
          <Link
            to="/donghua"
            className="group relative rounded-2xl overflow-hidden bg-surface border border-border-subtle hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 p-6 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <Tv className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                  动画 • Anichin
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-white group-hover:text-emerald-400 transition-colors">
                  Donghua 3D/2D
                </h3>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  Serial animasi Tiongkok kultivasi (Xianxia): Soul Land, BTTH, Swallowed Star, Renegade Immortal, dan ratusan judul lainnya.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-white/5 flex items-center justify-between text-xs font-bold text-text-secondary group-hover:text-white">
              <span>Buka Saluran Donghua</span>
              <ChevronRight className="w-4 h-4 text-emerald-400 transform group-hover:translate-x-1.5 transition-transform" />
            </div>
          </Link>

          {/* Channel 4: Movies & Series */}
          <Link
            to="/movies"
            className="group relative rounded-2xl overflow-hidden bg-surface border border-border-subtle hover:border-rose-500/50 hover:shadow-xl hover:shadow-rose-500/10 transition-all duration-300 p-6 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                  <Clapperboard className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-md border border-rose-500/20">
                  映画 • Cinema HD
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-white group-hover:text-rose-400 transition-colors">
                  Movie & Series
                </h3>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  Streaming film bioskop box office, serial TV internasional, dan tayangan terbaru dengan multi-server berkecepatan tinggi.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-white/5 flex items-center justify-between text-xs font-bold text-text-secondary group-hover:text-white">
              <span>Buka Saluran Movies</span>
              <ChevronRight className="w-4 h-4 text-rose-400 transform group-hover:translate-x-1.5 transition-transform" />
            </div>
          </Link>

          {/* Channel 5: Music */}
          <Link
            to="/music"
            className="group relative rounded-2xl overflow-hidden bg-surface border border-border-subtle hover:border-[#1DB954]/50 hover:shadow-xl hover:shadow-[#1DB954]/10 transition-all duration-300 p-6 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-[#1DB954]/10 border border-[#1DB954]/20 flex items-center justify-center text-[#1DB954] group-hover:scale-110 transition-transform">
                  <Headphones className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#1DB954] bg-[#1DB954]/10 px-2.5 py-1 rounded-md border border-[#1DB954]/20">
                  音楽 • Spotify Style
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-white group-hover:text-[#1DB954] transition-colors">
                  Music
                </h3>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  Streaming musik YouTube Music: ribuan lagu hits, lirik real-time, background keep-alive, smart autoplay & mini player.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-white/5 flex items-center justify-between text-xs font-bold text-text-secondary group-hover:text-white">
              <span>Buka Saluran Musik</span>
              <ChevronRight className="w-4 h-4 text-[#1DB954] transform group-hover:translate-x-1.5 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* 4. Live Updates Multi-Column Feed (Manga, Anime, Donghua, Movies, Music) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent-primary" />
              <span className="text-[11px] font-black uppercase tracking-wider text-accent-soft">
                最新リリース • REALTIME FEEDS
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>UPDATE TERBARU HARI INI</span>
            </h2>
          </div>

          {/* Responsive Filter Tab Switcher Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface border border-border-subtle text-xs font-bold overflow-x-auto scrollbar-none max-w-full pb-1">
            <button
              onClick={() => setActiveMediaTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 whitespace-nowrap active:scale-95 ${
                activeMediaTab === 'all' ? 'bg-white/10 text-white' : 'text-text-muted hover:text-white'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setActiveMediaTab('manga')}
              className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 whitespace-nowrap active:scale-95 ${
                activeMediaTab === 'manga' ? 'bg-[#8B5CF6] text-white' : 'text-text-muted hover:text-white'
              }`}
            >
              Manga
            </button>
            <button
              onClick={() => setActiveMediaTab('anime')}
              className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 whitespace-nowrap active:scale-95 ${
                activeMediaTab === 'anime' ? 'bg-amber-500 text-black font-extrabold' : 'text-text-muted hover:text-white'
              }`}
            >
              Anime
            </button>
            <button
              onClick={() => setActiveMediaTab('donghua')}
              className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 whitespace-nowrap active:scale-95 ${
                activeMediaTab === 'donghua' ? 'bg-emerald-500 text-black font-extrabold' : 'text-text-muted hover:text-white'
              }`}
            >
              Donghua
            </button>
            <button
              onClick={() => setActiveMediaTab('movie')}
              className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 whitespace-nowrap active:scale-95 ${
                activeMediaTab === 'movie' ? 'bg-rose-500 text-white font-extrabold' : 'text-text-muted hover:text-white'
              }`}
            >
              Movie
            </button>
            <button
              onClick={() => setActiveMediaTab('music')}
              className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 whitespace-nowrap active:scale-95 flex items-center gap-1.5 ${
                activeMediaTab === 'music' ? 'bg-[#1DB954] text-black font-extrabold shadow-md shadow-[#1DB954]/20' : 'text-text-muted hover:text-white'
              }`}
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>Musik</span>
            </button>
          </div>
        </div>

        {/* 5-Column Parallel Live Feeds with Responsive Scaling */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
          {/* Column A: Manga Latest */}
          {(activeMediaTab === 'all' || activeMediaTab === 'manga') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-violet-400 border-b border-violet-500/20 pb-2">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" /> Komik Terbaru
                </span>
                <Link to="/manga" className="text-[11px] text-text-muted hover:text-white transition-colors">
                  Lihat Semua →
                </Link>
              </div>

              {mangaLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-16 rounded-xl bg-surface animate-shimmer" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {latestManga.map((manga) => (
                    <Link
                      key={manga.slug}
                      to={`/manga/${manga.slug}`}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-surface hover:bg-surface-elevated border border-border-subtle hover:border-violet-500/30 transition-all group"
                    >
                      <img
                        src={manga.cover}
                        alt={manga.title}
                        referrerPolicy="no-referrer"
                        className="w-12 h-16 object-cover rounded-lg bg-slate-900 shrink-0 group-hover:scale-105 transition-transform"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-text-primary group-hover:text-violet-400 truncate transition-colors">
                          {manga.title}
                        </p>
                        <p className="text-[11px] text-violet-400 font-semibold mt-0.5 truncate">
                          {manga.chapter || 'Chapter Baru'}
                        </p>
                        <p className="text-[10px] text-text-muted mt-0.5">{manga.date || 'Baru rilis'}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Column B: Anime Latest */}
          {(activeMediaTab === 'all' || activeMediaTab === 'anime') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-amber-400 border-b border-amber-500/20 pb-2">
                <span className="flex items-center gap-1.5">
                  <Film className="w-4 h-4" /> Anime Terbaru
                </span>
                <Link to="/anime" className="text-[11px] text-text-muted hover:text-white transition-colors">
                  Lihat Semua →
                </Link>
              </div>

              {animeLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-16 rounded-xl bg-surface animate-shimmer" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {latestAnime.map((anime) => (
                    <Link
                      key={anime.id}
                      to={`/anime/detail/otakudesu/${anime.id}`}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-surface hover:bg-surface-elevated border border-border-subtle hover:border-amber-500/30 transition-all group"
                    >
                      <img
                        src={anime.poster}
                        alt={anime.title}
                        referrerPolicy="no-referrer"
                        className="w-12 h-16 object-cover rounded-lg bg-slate-900 shrink-0 group-hover:scale-105 transition-transform"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-text-primary group-hover:text-amber-400 truncate transition-colors">
                          {anime.title}
                        </p>
                        <p className="text-[11px] text-amber-400 font-semibold mt-0.5">
                          Episode {anime.episodes || '?'}
                        </p>
                        <p className="text-[10px] text-text-muted mt-0.5">{anime.releasedOn || 'Baru rilis'}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Column C: Donghua Latest */}
          {(activeMediaTab === 'all' || activeMediaTab === 'donghua') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-emerald-400 border-b border-emerald-500/20 pb-2">
                <span className="flex items-center gap-1.5">
                  <Tv className="w-4 h-4" /> Donghua Terbaru
                </span>
                <Link to="/donghua" className="text-[11px] text-text-muted hover:text-white transition-colors">
                  Lihat Semua →
                </Link>
              </div>

              {donghuaLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-16 rounded-xl bg-surface animate-shimmer" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {latestDonghua.map((donghua) => (
                    <Link
                      key={donghua.slug}
                      to={`/donghua/detail/${donghua.slug}`}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-surface hover:bg-surface-elevated border border-border-subtle hover:border-emerald-500/30 transition-all group"
                    >
                      <img
                        src={donghua.poster}
                        alt={donghua.title}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%22%20height%3D%22140%22%20viewBox%3D%220%200%20100%20140%22%3E%3Crect%20fill%3D%22%23181827%22%20width%3D%22100%22%20height%3D%22140%22%2F%3E%3Ctext%20fill%3D%22%2310b981%22%20font-family%3D%22sans-serif%22%20font-size%3D%2210%22%20dy%3D%227%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%3EDONGHUA%3C%2Ftext%3E%3C%2Fsvg%3E";
                        }}
                        className="w-12 h-16 object-cover rounded-lg bg-slate-900 shrink-0 group-hover:scale-105 transition-transform"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-text-primary group-hover:text-emerald-400 truncate transition-colors">
                          {donghua.title}
                        </p>
                        <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">
                          {donghua.currentEpisode || 'Episode Baru'}
                        </p>
                        <p className="text-[10px] text-text-muted mt-0.5">Anichin Sub Indo</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Column D: Movie & Series Latest */}
          {(activeMediaTab === 'all' || activeMediaTab === 'movie') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-rose-400 border-b border-rose-500/20 pb-2">
                <span className="flex items-center gap-1.5">
                  <Clapperboard className="w-4 h-4" /> Movie & Series
                </span>
                <Link to="/movies" className="text-[11px] text-text-muted hover:text-white transition-colors">
                  Lihat Semua →
                </Link>
              </div>

              {moviesLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-16 rounded-xl bg-surface animate-shimmer" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {latestMovies.map((movie) => (
                    <Link
                      key={movie.id}
                      to={`/movies/${movie.id}`}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-surface hover:bg-surface-elevated border border-border-subtle hover:border-rose-500/30 transition-all group"
                    >
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="w-12 h-16 object-cover rounded-lg bg-slate-900 shrink-0 group-hover:scale-105 transition-transform"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-text-primary group-hover:text-rose-400 truncate transition-colors">
                          {movie.title}
                        </p>
                        <p className="text-[11px] text-rose-400 font-semibold mt-0.5">
                          {movie.mediaType === 'tv' ? 'Serial TV' : 'Film Bioskop'}
                        </p>
                        <p className="text-[10px] text-text-muted mt-0.5">
                          {movie.ratingValue ? `★ ${movie.ratingValue.toFixed(1)} TMDB` : 'HD Cinema'}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Column E: Music Populer & Trending */}
          {(activeMediaTab === 'all' || activeMediaTab === 'music') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-[#1DB954] border-b border-[#1DB954]/20 pb-2">
                <span className="flex items-center gap-1.5">
                  <Headphones className="w-4 h-4" /> Musik Trending
                </span>
                <Link to="/music" className="text-[11px] text-text-muted hover:text-white transition-colors">
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
                        localStorage.setItem(
                          'sonora_queue_first',
                          JSON.stringify({
                            id: track.id,
                            youtubeId: track.youtubeId,
                            title: track.title,
                            artist: track.artist,
                            thumbnail: track.thumbnail,
                            album: track.album || track.title,
                          })
                        );
                      } catch {
                        // ignore
                      }
                    }}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-surface hover:bg-surface-elevated border border-border-subtle hover:border-[#1DB954]/40 transition-all group"
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
                      <p className="text-xs font-bold text-text-primary group-hover:text-[#1DB954] truncate transition-colors">
                        {track.title}
                      </p>
                      <p className="text-[11px] text-[#1DB954] font-semibold mt-0.5 truncate">
                        {track.artist}
                      </p>
                      <p className="text-[10px] text-text-muted mt-0.5 flex items-center gap-1.5">
                        <span className="text-text-secondary">{track.tag || 'Lagu Hits'}</span>
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
