import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  BookOpen,
  Film,
  Tv,
  Play,
  Clock,
  Search,
  ArrowRight,
  TrendingUp,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Clapperboard,
  Headphones,
  Star,
  RotateCcw,
} from 'lucide-react';
import { getLatest, getPopular } from '../services/api';
import { getOtakudesuHome } from '../services/animeApi';
import { getDonghuaHome } from '../services/donghuaApi';
import { getMovies } from '../services/movieApi';
import { FAZURA_MUSIC_CATALOG } from '../services/musicApi';
import { useAllCategoryHistory } from '../services/categoryStorage';
import { useMusic } from '../context/MusicContext';

function formatRelativeTime(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return 'Baru saja';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} mnt lalu`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} jam lalu`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Kemarin';
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return new Date(timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

export function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMediaTab, setActiveMediaTab] = useState<'all' | 'manga' | 'anime' | 'donghua' | 'movie' | 'music'>('all');
  const [spotlightChannel, setSpotlightChannel] = useState<'anime' | 'manga' | 'donghua' | 'movie' | 'music'>('anime');
  const { allItems: allHistoryItems } = useAllCategoryHistory();
  const activeHistory = useMemo(() => allHistoryItems.slice(0, 12), [allHistoryItems]);
  const navigate = useNavigate();
  const { playTrack } = useMusic();

  // Smooth scroll handler for horizontal carousels
  const scrollCarousel = (id: string, direction: 'left' | 'right') => {
    const el = document.getElementById(id);
    if (el) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

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
    queryFn: () => getMovies({ collection: 'trending', perPage: 12 }),
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const latestManga = mangaData?.komikList?.slice(0, 12) || [];
  const latestAnime = animeData?.ongoing?.slice(0, 12) || [];
  const latestDonghua = donghuaData?.latestRelease?.slice(0, 12) || [];
  const latestMovies = moviesData?.data?.slice(0, 12) || [];
  const trendingMusicList = FAZURA_MUSIC_CATALOG.slice(0, 12);

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
        btnBg: 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 shadow-rose-600/30 text-white',
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
        btnBg: 'bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#9061F9] hover:to-[#6D28D9] shadow-[#8B5CF6]/30 text-white',
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
        btnBg: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/30 text-white',
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
        btnBg: 'bg-gradient-to-r from-[#1DB954] to-[#1ed760] hover:from-[#1ed760] hover:to-[#17a34a] text-black font-extrabold shadow-[#1DB954]/30',
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
      btnBg: 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black shadow-amber-500/30',
    };
  }, [spotlightChannel, topAnime, topManga, topDonghua, topMovie]);

  return (
    <div className="min-h-screen bg-[#090912] text-text-primary pb-24 w-full overflow-x-hidden min-w-0 font-sans selection:bg-[#8B5CF6] selection:text-white">
      {/* 1. Grand High-Impact Cinematic Hero Spotlight */}
      <section className="relative w-full min-h-[500px] sm:min-h-[580px] lg:min-h-[640px] flex items-end overflow-hidden border-b border-white/5 bg-[#090912]">
        {/* Ambient Glow Spheres */}
        <div
          className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full bg-[#8B5CF6]/15 blur-[140px] pointer-events-none transform-gpu animate-pulse"
          aria-hidden="true"
        />
        <div
          className="absolute top-1/4 right-0 w-[450px] h-[450px] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none transform-gpu"
          aria-hidden="true"
        />

        {/* Cinematic Backdrop with Clean Multi-Stop Gradient Overlays */}
        <div className="absolute inset-0 bg-[#090912]">
          <img
            key={featuredItem.backdrop}
            src={featuredItem.backdrop}
            alt={featuredItem.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-top opacity-35 filter scale-105 transition-all duration-1000 ease-out"
          />
          {/* Top subtle vignette */}
          <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[#090912] via-[#090912]/80 to-transparent" />
          {/* Bottom solid vignette merging seamlessly into page */}
          <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-[#090912] via-[#090912]/95 to-transparent" />
          {/* Left horizontal vignette for text legibility */}
          <div className="absolute inset-y-0 left-0 w-full lg:w-3/4 bg-gradient-to-r from-[#090912] via-[#090912]/90 to-transparent" />
          {/* Japanese digital grid line pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
        </div>

        {/* Foreground Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 w-full flex flex-col lg:flex-row lg:items-end justify-between gap-8 sm:gap-12">
          {/* Left Column: Spotlight details */}
          <div className="max-w-2xl space-y-4 sm:space-y-5">
            {/* Spotlight Channel Switcher Pills */}
            <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#11111D]/80 backdrop-blur-xl border border-white/10 w-fit overflow-x-auto max-w-full scrollbar-none shadow-2xl">
              <button
                type="button"
                onClick={() => setSpotlightChannel('anime')}
                className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-xl text-xs font-black transition-all shrink-0 whitespace-nowrap active:scale-95 ${
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
                className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-xl text-xs font-black transition-all shrink-0 whitespace-nowrap active:scale-95 ${
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
                className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-xl text-xs font-black transition-all shrink-0 whitespace-nowrap active:scale-95 ${
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
                className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-xl text-xs font-black transition-all shrink-0 whitespace-nowrap active:scale-95 ${
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
                className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-xl text-xs font-black transition-all shrink-0 whitespace-nowrap active:scale-95 ${
                  spotlightChannel === 'music'
                    ? 'bg-[#1DB954] text-black shadow-lg shadow-[#1DB954]/25'
                    : 'text-text-secondary hover:text-white hover:bg-white/5'
                }`}
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>Music 音楽</span>
              </button>
            </div>

            {/* Badges & Meta strip */}
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
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-text-primary tracking-tight leading-[1.08] drop-shadow-xl line-clamp-2 font-heading">
              {featuredItem.title}
            </h1>

            {/* Synopsis */}
            <p className="text-text-secondary text-xs sm:text-sm md:text-base leading-relaxed line-clamp-3 max-w-xl">
              {featuredItem.description}
            </p>

            {/* Action CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                to={featuredItem.actionLink}
                className={`flex items-center gap-2.5 px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl font-extrabold text-sm sm:text-base transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-xl group ${featuredItem.btnBg}`}
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current transition-transform group-hover:scale-110" />
                <span>{featuredItem.actionText}</span>
              </Link>

              <Link
                to={featuredItem.channelLink}
                className="flex items-center gap-2 px-5 py-3 sm:py-3.5 rounded-xl bg-surface-elevated/80 hover:bg-surface-elevated text-text-primary font-bold text-sm sm:text-base border border-white/10 backdrop-blur-md hover:border-white/20 transition-all shadow-md group"
              >
                <span>{featuredItem.channelText}</span>
                <ArrowRight className="w-4 h-4 text-accent-secondary transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Column: Floating 3D Artwork Showcase (Desktop only) */}
          <div className="hidden lg:block relative flex-shrink-0">
            <div className="relative w-64 h-[350px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-surface shadow-black/80 group">
              <img
                src={featuredItem.poster}
                alt={featuredItem.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090912] via-transparent to-transparent opacity-85" />
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

      {/* 2. Global Search Input Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-7 relative z-20">
        <form
          onSubmit={handleSearchSubmit}
          className="p-2 sm:p-2.5 rounded-2xl bg-[#181827]/90 border border-white/10 shadow-2xl backdrop-blur-2xl flex flex-col sm:flex-row items-center gap-2"
        >
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 text-accent-soft absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari ribuan komik, anime, donghua, movie, atau lagu favorit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-transparent text-text-primary text-sm placeholder-text-muted focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-extrabold text-sm transition-all shadow-lg shadow-[#8B5CF6]/25 shrink-0 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Cari Konten
          </button>
        </form>
      </div>

      {/* 3. Lanjutkan Tonton & Baca (Quick Resume Section if user has history) */}
      {activeHistory.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8B5CF6] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8B5CF6]" />
                </span>
                <span className="text-[11px] font-black uppercase tracking-wider text-[#A78BFA]">
                  最近の履歴 • QUICK RESUME
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 font-heading">
                <RotateCcw className="w-5 h-5 text-[#8B5CF6]" />
                <span>Lanjutkan Tonton & Baca</span>
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/history"
                className="text-xs font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-1 hidden xs:flex"
              >
                <span>Semua Riwayat</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => scrollCarousel('history-carousel', 'left')}
                  aria-label="Geser riwayat ke kiri"
                  className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-xl bg-surface border border-white/10 hover:border-[#8B5CF6]/50 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollCarousel('history-carousel', 'right')}
                  aria-label="Geser riwayat ke kanan"
                  className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-xl bg-surface border border-white/10 hover:border-[#8B5CF6]/50 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick-Resume Horizontal Carousel */}
          <div
            id="history-carousel"
            className="flex items-stretch gap-3.5 overflow-x-auto scrollbar-none snap-x snap-mandatory py-2 scroll-smooth"
          >
            {activeHistory.map((item) => {
              const categoryBadgeColor =
                item.category === 'anime'
                  ? 'bg-amber-500/90 text-black'
                  : item.category === 'donghua'
                  ? 'bg-emerald-500/90 text-black'
                  : item.category === 'movies'
                  ? 'bg-rose-500/90 text-white'
                  : item.category === 'music'
                  ? 'bg-[#1DB954]/90 text-black'
                  : 'bg-[#8B5CF6]/90 text-white';

              return (
                <Link
                  key={`${item.category}-${item.id}`}
                  to={item.lastItemLink || `/${item.category}`}
                  className="w-60 sm:w-72 shrink-0 snap-start flex items-center gap-3 p-2.5 rounded-2xl bg-[#181827]/90 hover:bg-[#1f1f33] border border-white/5 hover:border-[#8B5CF6]/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#8B5CF6]/15 group"
                >
                  <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-white/5">
                    <img
                      src={item.cover}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%22%20height%3D%22140%22%20viewBox%3D%220%200%20100%20140%22%3E%3Crect%20fill%3D%22%23181827%22%20width%3D%22100%22%20height%3D%22140%22%2F%3E%3C/svg%3E";
                      }}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute top-1 left-1">
                      <span className={`px-1.5 py-0.2 text-[9px] font-black uppercase rounded shadow-sm ${categoryBadgeColor}`}>
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-[#A78BFA] truncate transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-[#A78BFA] font-semibold truncate mt-0.5">
                        {item.lastItemTitle || 'Lanjutkan'}
                      </p>
                    </div>

                    <div className="pt-1">
                      {typeof item.progress === 'number' && item.progress > 0 && (
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-1">
                          <div
                            className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] rounded-full"
                            style={{ width: `${Math.min(100, Math.max(5, item.progress))}%` }}
                          />
                        </div>
                      )}
                      <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{formatRelativeTime(item.watchedAt)}</span>
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. Five Dedicated Media Gateways (Channel Grid) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 space-y-6">
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
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 mt-1 font-heading">
              <TrendingUp className="w-5 h-5 text-accent-primary" />
              <span>PILIH SALURAN HIBURAN</span>
            </h2>
          </div>
          <p className="text-xs text-text-muted">
            Multi-portal terintegrasi dengan ribuan konten dan server berkecepatan tinggi
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* Channel 1: Manga */}
          <Link
            to="/manga"
            className="group relative rounded-2xl overflow-hidden bg-[#181827]/90 border border-white/5 hover:border-violet-500/50 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300 p-5 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-md border border-violet-500/20">
                  漫画 • BacaKomik
                </span>
              </div>
              <div>
                <h3 className="text-base font-black text-white group-hover:text-violet-400 transition-colors font-heading">
                  Manga & Komik
                </h3>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  Ribuan manga Jepang, manhwa Korea, & manhua China dengan vertical webtoon reader.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-3 border-t border-white/5 flex items-center justify-between text-xs font-bold text-text-secondary group-hover:text-white">
              <span>Buka Saluran Manga</span>
              <ChevronRight className="w-4 h-4 text-violet-400 transform group-hover:translate-x-1.5 transition-transform" />
            </div>
          </Link>

          {/* Channel 2: Anime */}
          <Link
            to="/anime"
            className="group relative rounded-2xl overflow-hidden bg-[#181827]/90 border border-white/5 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 p-5 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <Film className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                  アニメ • Otakudesu
                </span>
              </div>
              <div>
                <h3 className="text-base font-black text-white group-hover:text-amber-400 transition-colors font-heading">
                  Anime Streaming
                </h3>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  Streaming anime sub Indo multi-server 1080p Mega HD & 720p HD rilis ongoing.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-3 border-t border-white/5 flex items-center justify-between text-xs font-bold text-text-secondary group-hover:text-white">
              <span>Buka Saluran Anime</span>
              <ChevronRight className="w-4 h-4 text-amber-400 transform group-hover:translate-x-1.5 transition-transform" />
            </div>
          </Link>

          {/* Channel 3: Donghua */}
          <Link
            to="/donghua"
            className="group relative rounded-2xl overflow-hidden bg-[#181827]/90 border border-white/5 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 p-5 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <Tv className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                  动画 • Anichin
                </span>
              </div>
              <div>
                <h3 className="text-base font-black text-white group-hover:text-emerald-400 transition-colors font-heading">
                  Donghua 3D/2D
                </h3>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  Animasi kultivasi Xianxia: Soul Land, BTTH, Swallowed Star, & Renegade Immortal.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-3 border-t border-white/5 flex items-center justify-between text-xs font-bold text-text-secondary group-hover:text-white">
              <span>Buka Saluran Donghua</span>
              <ChevronRight className="w-4 h-4 text-emerald-400 transform group-hover:translate-x-1.5 transition-transform" />
            </div>
          </Link>

          {/* Channel 4: Movies & Series */}
          <Link
            to="/movies"
            className="group relative rounded-2xl overflow-hidden bg-[#181827]/90 border border-white/5 hover:border-rose-500/50 hover:shadow-xl hover:shadow-rose-500/10 transition-all duration-300 p-5 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                  <Clapperboard className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-md border border-rose-500/20">
                  映画 • Cinema HD
                </span>
              </div>
              <div>
                <h3 className="text-base font-black text-white group-hover:text-rose-400 transition-colors font-heading">
                  Movie & Series
                </h3>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  Film bioskop box office & serial TV internasional dengan multi-server stream.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-3 border-t border-white/5 flex items-center justify-between text-xs font-bold text-text-secondary group-hover:text-white">
              <span>Buka Saluran Movies</span>
              <ChevronRight className="w-4 h-4 text-rose-400 transform group-hover:translate-x-1.5 transition-transform" />
            </div>
          </Link>

          {/* Channel 5: Music */}
          <Link
            to="/music"
            className="group relative rounded-2xl overflow-hidden bg-[#181827]/90 border border-white/5 hover:border-[#1DB954]/50 hover:shadow-xl hover:shadow-[#1DB954]/10 transition-all duration-300 p-5 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-[#1DB954]/15 border border-[#1DB954]/30 flex items-center justify-center text-[#1DB954] group-hover:scale-110 transition-transform">
                  <Headphones className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#1DB954] bg-[#1DB954]/10 px-2.5 py-1 rounded-md border border-[#1DB954]/20">
                  音楽 • Spotify Style
                </span>
              </div>
              <div>
                <h3 className="text-base font-black text-white group-hover:text-[#1DB954] transition-colors font-heading">
                  Music
                </h3>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  Streaming jutaan lagu YouTube Music: lirik sinkronisasi & mini player.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-3 border-t border-white/5 flex items-center justify-between text-xs font-bold text-text-secondary group-hover:text-white">
              <span>Buka Saluran Musik</span>
              <ChevronRight className="w-4 h-4 text-[#1DB954] transform group-hover:translate-x-1.5 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* 5. Live Updates & Realtime Feeds (Optimized Horizontal Carousels to Prevent Endless Vertical Scroll) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent-primary" />
              <span className="text-[11px] font-black uppercase tracking-wider text-accent-soft">
                最新リリース • REALTIME FEEDS
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 font-heading">
              <Clock className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>UPDATE TERBARU HARI INI</span>
            </h2>
          </div>

          {/* Interactive Filter Tab Switcher Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#181827] border border-white/10 text-xs font-bold overflow-x-auto scrollbar-none max-w-full pb-1">
            <button
              onClick={() => setActiveMediaTab('all')}
              className={`px-3 py-1.5 min-h-[36px] rounded-lg transition-colors shrink-0 whitespace-nowrap active:scale-95 ${
                activeMediaTab === 'all' ? 'bg-white/10 text-white font-black' : 'text-text-muted hover:text-white'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setActiveMediaTab('manga')}
              className={`px-3 py-1.5 min-h-[36px] rounded-lg transition-colors shrink-0 whitespace-nowrap active:scale-95 ${
                activeMediaTab === 'manga' ? 'bg-[#8B5CF6] text-white font-black' : 'text-text-muted hover:text-white'
              }`}
            >
              Manga
            </button>
            <button
              onClick={() => setActiveMediaTab('anime')}
              className={`px-3 py-1.5 min-h-[36px] rounded-lg transition-colors shrink-0 whitespace-nowrap active:scale-95 ${
                activeMediaTab === 'anime' ? 'bg-amber-500 text-black font-black' : 'text-text-muted hover:text-white'
              }`}
            >
              Anime
            </button>
            <button
              onClick={() => setActiveMediaTab('donghua')}
              className={`px-3 py-1.5 min-h-[36px] rounded-lg transition-colors shrink-0 whitespace-nowrap active:scale-95 ${
                activeMediaTab === 'donghua' ? 'bg-emerald-500 text-black font-black' : 'text-text-muted hover:text-white'
              }`}
            >
              Donghua
            </button>
            <button
              onClick={() => setActiveMediaTab('movie')}
              className={`px-3 py-1.5 min-h-[36px] rounded-lg transition-colors shrink-0 whitespace-nowrap active:scale-95 ${
                activeMediaTab === 'movie' ? 'bg-rose-500 text-white font-black' : 'text-text-muted hover:text-white'
              }`}
            >
              Movie
            </button>
            <button
              onClick={() => setActiveMediaTab('music')}
              className={`px-3 py-1.5 min-h-[36px] rounded-lg transition-colors shrink-0 whitespace-nowrap active:scale-95 flex items-center gap-1.5 ${
                activeMediaTab === 'music' ? 'bg-[#1DB954] text-black font-black shadow-md shadow-[#1DB954]/20' : 'text-text-muted hover:text-white'
              }`}
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>Musik</span>
            </button>
          </div>
        </div>

        {/* Carousel Stream Rows (Prevent Excessive Vertical Scrolling) */}
        <div className="space-y-10">
          {/* Row 1: Manga Carousel */}
          {(activeMediaTab === 'all' || activeMediaTab === 'manga') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#8B5CF6]/20 pb-2">
                <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#A78BFA] font-heading">
                  <BookOpen className="w-4 h-4 text-[#8B5CF6]" />
                  <span>Komik & Manga Terbaru (BacaKomik)</span>
                </span>
                <div className="flex items-center gap-2">
                  <Link to="/manga" className="text-xs text-slate-400 hover:text-white transition-colors">
                    Lihat Semua →
                  </Link>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => scrollCarousel('manga-row', 'left')}
                      aria-label="Geser manga ke kiri"
                      className="w-8 h-8 rounded-lg bg-[#181827] border border-white/10 hover:border-[#8B5CF6]/50 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollCarousel('manga-row', 'right')}
                      aria-label="Geser manga ke kanan"
                      className="w-8 h-8 rounded-lg bg-[#181827] border border-white/10 hover:border-[#8B5CF6]/50 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {mangaLoading ? (
                <div className="flex gap-3 overflow-hidden py-1">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="w-40 sm:w-48 h-64 rounded-2xl bg-[#181827] animate-pulse shrink-0" />
                  ))}
                </div>
              ) : (
                <div
                  id="manga-row"
                  className="flex items-stretch gap-3.5 overflow-x-auto scrollbar-none snap-x snap-mandatory py-2 scroll-smooth"
                >
                  {latestManga.map((manga) => (
                    <Link
                      key={manga.slug}
                      to={`/manga/${manga.slug}`}
                      className="w-36 sm:w-44 shrink-0 snap-start flex flex-col rounded-2xl overflow-hidden bg-[#181827]/90 border border-white/5 hover:border-[#8B5CF6]/40 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-[#8B5CF6]/15 group"
                    >
                      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#11111D]">
                        <img
                          src={manga.cover}
                          alt={manga.title}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        />
                        <div className="absolute top-1.5 left-1.5 z-10">
                          <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase rounded bg-[#8B5CF6]/90 text-white border border-[#A78BFA]/30">
                            {manga.type || 'Manga'}
                          </span>
                        </div>
                        {manga.chapter && (
                          <div className="absolute bottom-1.5 left-1.5 right-1.5 z-10">
                            <span className="inline-block px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[#C4B5FD] text-[10px] font-bold truncate max-w-full border border-white/10">
                              {manga.chapter}
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#090912] via-transparent to-transparent opacity-80" />
                      </div>
                      <div className="p-2.5 flex-1 flex flex-col justify-between gap-1">
                        <h4 className="text-xs font-bold text-slate-100 group-hover:text-[#A78BFA] line-clamp-2 transition-colors">
                          {manga.title}
                        </h4>
                        <span className="text-[10px] text-slate-500">{manga.date || 'Rilis'}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Row 2: Anime Carousel */}
          {(activeMediaTab === 'all' || activeMediaTab === 'anime') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400 font-heading">
                  <Film className="w-4 h-4" />
                  <span>Anime Streaming Terbaru (Otakudesu)</span>
                </span>
                <div className="flex items-center gap-2">
                  <Link to="/anime" className="text-xs text-slate-400 hover:text-white transition-colors">
                    Lihat Semua →
                  </Link>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => scrollCarousel('anime-row', 'left')}
                      aria-label="Geser anime ke kiri"
                      className="w-8 h-8 rounded-lg bg-[#181827] border border-white/10 hover:border-amber-400/50 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollCarousel('anime-row', 'right')}
                      aria-label="Geser anime ke kanan"
                      className="w-8 h-8 rounded-lg bg-[#181827] border border-white/10 hover:border-amber-400/50 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {animeLoading ? (
                <div className="flex gap-3 overflow-hidden py-1">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="w-40 sm:w-48 h-64 rounded-2xl bg-[#181827] animate-pulse shrink-0" />
                  ))}
                </div>
              ) : (
                <div
                  id="anime-row"
                  className="flex items-stretch gap-3.5 overflow-x-auto scrollbar-none snap-x snap-mandatory py-2 scroll-smooth"
                >
                  {latestAnime.map((anime) => (
                    <Link
                      key={anime.id}
                      to={`/anime/detail/otakudesu/${anime.id}`}
                      className="w-36 sm:w-44 shrink-0 snap-start flex flex-col rounded-2xl overflow-hidden bg-[#181827]/90 border border-white/5 hover:border-amber-500/40 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-amber-500/10 group"
                    >
                      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#11111D]">
                        <img
                          src={anime.poster}
                          alt={anime.title}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        />
                        <div className="absolute top-1.5 left-1.5 z-10">
                          <span className="px-1.5 py-0.2 text-[9px] font-black uppercase rounded bg-amber-500/90 text-black border border-amber-400/30">
                            Anime
                          </span>
                        </div>
                        <div className="absolute bottom-1.5 left-1.5 right-1.5 z-10">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-amber-300 text-[10px] font-bold truncate max-w-full border border-white/10">
                            Episode {anime.episodes || '?'}
                          </span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#090912] via-transparent to-transparent opacity-80" />
                      </div>
                      <div className="p-2.5 flex-1 flex flex-col justify-between gap-1">
                        <h4 className="text-xs font-bold text-slate-100 group-hover:text-amber-400 line-clamp-2 transition-colors">
                          {anime.title}
                        </h4>
                        <span className="text-[10px] text-slate-500">{anime.releasedOn || 'Baru'}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Row 3: Donghua Carousel */}
          {(activeMediaTab === 'all' || activeMediaTab === 'donghua') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-400 font-heading">
                  <Tv className="w-4 h-4" />
                  <span>Donghua Animasi Xianxia (Anichin)</span>
                </span>
                <div className="flex items-center gap-2">
                  <Link to="/donghua" className="text-xs text-slate-400 hover:text-white transition-colors">
                    Lihat Semua →
                  </Link>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => scrollCarousel('donghua-row', 'left')}
                      aria-label="Geser donghua ke kiri"
                      className="w-8 h-8 rounded-lg bg-[#181827] border border-white/10 hover:border-emerald-400/50 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollCarousel('donghua-row', 'right')}
                      aria-label="Geser donghua ke kanan"
                      className="w-8 h-8 rounded-lg bg-[#181827] border border-white/10 hover:border-emerald-400/50 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {donghuaLoading ? (
                <div className="flex gap-3 overflow-hidden py-1">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="w-40 sm:w-48 h-64 rounded-2xl bg-[#181827] animate-pulse shrink-0" />
                  ))}
                </div>
              ) : (
                <div
                  id="donghua-row"
                  className="flex items-stretch gap-3.5 overflow-x-auto scrollbar-none snap-x snap-mandatory py-2 scroll-smooth"
                >
                  {latestDonghua.map((donghua) => (
                    <Link
                      key={donghua.slug}
                      to={`/donghua/detail/${donghua.slug}`}
                      className="w-36 sm:w-44 shrink-0 snap-start flex flex-col rounded-2xl overflow-hidden bg-[#181827]/90 border border-white/5 hover:border-emerald-500/40 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-emerald-500/10 group"
                    >
                      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#11111D]">
                        <img
                          src={donghua.poster}
                          alt={donghua.title}
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%22%20height%3D%22140%22%20viewBox%3D%220%200%20100%20140%22%3E%3Crect%20fill%3D%22%23181827%22%20width%3D%22100%22%20height%3D%22140%22%2F%3E%3C/svg%3E";
                          }}
                          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        />
                        <div className="absolute top-1.5 left-1.5 z-10">
                          <span className="px-1.5 py-0.2 text-[9px] font-black uppercase rounded bg-emerald-500/90 text-black border border-emerald-400/30">
                            Donghua
                          </span>
                        </div>
                        {donghua.currentEpisode && (
                          <div className="absolute bottom-1.5 left-1.5 right-1.5 z-10">
                            <span className="inline-block px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-emerald-300 text-[10px] font-bold truncate max-w-full border border-white/10">
                              {donghua.currentEpisode}
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#090912] via-transparent to-transparent opacity-80" />
                      </div>
                      <div className="p-2.5 flex-1 flex flex-col justify-between gap-1">
                        <h4 className="text-xs font-bold text-slate-100 group-hover:text-emerald-400 line-clamp-2 transition-colors">
                          {donghua.title}
                        </h4>
                        <span className="text-[10px] text-slate-500">Anichin Sub Indo</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Row 4: Movies & Series Carousel */}
          {(activeMediaTab === 'all' || activeMediaTab === 'movie') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-rose-500/20 pb-2">
                <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-rose-400 font-heading">
                  <Clapperboard className="w-4 h-4" />
                  <span>Movie & Serial TV Bioskop (Cinema HD)</span>
                </span>
                <div className="flex items-center gap-2">
                  <Link to="/movies" className="text-xs text-slate-400 hover:text-white transition-colors">
                    Lihat Semua →
                  </Link>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => scrollCarousel('movies-row', 'left')}
                      aria-label="Geser film ke kiri"
                      className="w-8 h-8 rounded-lg bg-[#181827] border border-white/10 hover:border-rose-400/50 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollCarousel('movies-row', 'right')}
                      aria-label="Geser film ke kanan"
                      className="w-8 h-8 rounded-lg bg-[#181827] border border-white/10 hover:border-rose-400/50 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {moviesLoading ? (
                <div className="flex gap-3 overflow-hidden py-1">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="w-40 sm:w-48 h-64 rounded-2xl bg-[#181827] animate-pulse shrink-0" />
                  ))}
                </div>
              ) : (
                <div
                  id="movies-row"
                  className="flex items-stretch gap-3.5 overflow-x-auto scrollbar-none snap-x snap-mandatory py-2 scroll-smooth"
                >
                  {latestMovies.map((movie) => (
                    <Link
                      key={movie.id}
                      to={`/movies/${movie.id}`}
                      className="w-36 sm:w-44 shrink-0 snap-start flex flex-col rounded-2xl overflow-hidden bg-[#181827]/90 border border-white/5 hover:border-rose-500/40 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-rose-500/10 group"
                    >
                      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#11111D]">
                        <img
                          src={movie.posterUrl}
                          alt={movie.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        />
                        <div className="absolute top-1.5 left-1.5 z-10">
                          <span
                            className={`px-1.5 py-0.2 text-[9px] font-black uppercase rounded text-white shadow-sm ${
                              movie.mediaType === 'tv'
                                ? 'bg-indigo-600/90 border border-indigo-400/30'
                                : 'bg-rose-600/90 border border-rose-400/30'
                            }`}
                          >
                            {movie.mediaType === 'tv' ? 'Series' : 'Movie'}
                          </span>
                        </div>
                        {movie.ratingValue && (
                          <div className="absolute bottom-1.5 left-1.5 z-10">
                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-amber-400 text-[10px] font-bold border border-white/10">
                              ★ {movie.ratingValue.toFixed(1)}
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#090912] via-transparent to-transparent opacity-80" />
                      </div>
                      <div className="p-2.5 flex-1 flex flex-col justify-between gap-1">
                        <h4 className="text-xs font-bold text-slate-100 group-hover:text-rose-400 line-clamp-2 transition-colors">
                          {movie.title}
                        </h4>
                        <span className="text-[10px] text-slate-500">
                          {movie.mediaType === 'tv' ? 'Serial TV' : 'Film Bioskop'}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Row 5: Music Hits Carousel */}
          {(activeMediaTab === 'all' || activeMediaTab === 'music') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#1DB954]/20 pb-2">
                <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#1DB954] font-heading">
                  <Headphones className="w-4 h-4" />
                  <span>Musik & Lagu Trending (YouTube Music)</span>
                </span>
                <div className="flex items-center gap-2">
                  <Link to="/music" className="text-xs text-slate-400 hover:text-white transition-colors">
                    Lihat Semua →
                  </Link>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => scrollCarousel('music-row', 'left')}
                      aria-label="Geser musik ke kiri"
                      className="w-8 h-8 rounded-lg bg-[#181827] border border-white/10 hover:border-[#1DB954]/50 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollCarousel('music-row', 'right')}
                      aria-label="Geser musik ke kanan"
                      className="w-8 h-8 rounded-lg bg-[#181827] border border-white/10 hover:border-[#1DB954]/50 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div
                id="music-row"
                className="flex items-stretch gap-3.5 overflow-x-auto scrollbar-none snap-x snap-mandatory py-2 scroll-smooth"
              >
                {trendingMusicList.map((track) => (
                  <div
                    key={track.id}
                    onClick={() => playTrack(track, trendingMusicList)}
                    className="w-36 sm:w-44 shrink-0 snap-start flex flex-col rounded-2xl overflow-hidden bg-[#181827]/90 border border-white/5 hover:border-[#1DB954]/40 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-[#1DB954]/15 group cursor-pointer"
                  >
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#11111D]">
                      <img
                        src={track.thumbnail}
                        alt={track.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                      <div className="absolute top-1.5 left-1.5 z-10">
                        <span className="px-1.5 py-0.2 text-[9px] font-black uppercase rounded bg-[#1DB954]/90 text-black border border-[#1ed760]/30">
                          Lagu
                        </span>
                      </div>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-9 h-9 rounded-full bg-[#1DB954] text-black flex items-center justify-center shadow-lg">
                          <Play className="w-4 h-4 fill-black ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#090912] via-transparent to-transparent opacity-80" />
                    </div>
                    <div className="p-2.5 flex-1 flex flex-col justify-between gap-1">
                      <div>
                        <h4 className="text-xs font-bold text-slate-100 group-hover:text-[#1DB954] line-clamp-1 transition-colors">
                          {track.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{track.artist}</p>
                      </div>
                      <span className="text-[10px] text-[#1DB954] font-semibold">{track.durationFormatted || 'Audio'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
