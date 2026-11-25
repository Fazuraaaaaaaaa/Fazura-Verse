import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { LazyMotion, domAnimation, MotionConfig, m } from 'framer-motion';
import {
  Play,
  Pause,
  Star,
  Clock,
  ArrowRight,
  Search,
} from 'lucide-react';
import { getLatest, getPopular } from '../services/api';
import { getOtakudesuHome } from '../services/animeApi';
import { getDonghuaHome, proxyDonghuaPoster } from '../services/donghuaApi';
import { getMovies } from '../services/movieApi';
import { FAZURA_MUSIC_CATALOG } from '../services/musicApi';
import { useAllCategoryHistory, useAllCategoryBookmarks } from '../services/categoryStorage';
import { useMusic } from '../context/MusicContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { SectionHeader } from '../components/common/SectionHeader';
import { Badge } from '../components/common/Badge';
import { buttonClasses } from '../components/common/Button';
import { ErrorState } from '../components/common/StateViews';
import { MediaCard } from '../components/media/MediaCard';
import { MediaCarousel } from '../components/media/MediaCarousel';
import { MangaCard } from '../components/MangaCard';
import { AnimeGridCard } from '../components/anime/AnimeGridCard';
import {
  CATEGORY_THEMES,
  createPosterFallbackSvg,
  type MediaCategory,
} from '../utils/categoryTheme';
import {
  MUSIC_FALLBACK_SVG,
  handleMusicImageError,
  handleMusicImageLoad,
} from '../utils/musicThumbnail';

const SPOTLIGHT_CHANNELS: { id: MediaCategory; label: string }[] = [
  { id: 'movies', label: 'Movies' },
  { id: 'anime', label: 'Anime' },
  { id: 'manga', label: 'Manga' },
  { id: 'donghua', label: 'Donghua' },
  { id: 'music', label: 'Music' },
];

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
  return new Date(timestamp).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
  });
}

function CarouselSkeletonStrip({ square = false }: { square?: boolean }) {
  return (
    <div className="flex gap-3.5 sm:gap-4 overflow-hidden py-1">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div
          key={idx}
          className="w-[152px] sm:w-[172px] lg:w-[184px] shrink-0 rounded-[10px] overflow-hidden bg-[#191C25] border border-[#343744]"
        >
          <div className={`${square ? 'aspect-square' : 'aspect-[2/3]'} w-full skeleton-shimmer`} />
          <div className="p-3 space-y-2">
            <div className="h-3.5 rounded bg-[#232633] w-4/5" />
            <div className="h-3 rounded bg-[#232633]/70 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function LandingPage() {
  usePageMeta({
    title: 'FazuraStream - Your Universe of Entertainment',
    description:
      'FazuraStream - Platform hiburan terpadu untuk streaming anime, film bioskop & serial TV, donghua, komik manga/manhwa/manhua, dan musik online.',
    jsonLd: {
      '@type': 'WebSite',
      name: 'FazuraStream',
      url: 'https://fazurastream.web.id/',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://fazurastream.web.id/search?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
  });

  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [spotlightChannel, setSpotlightChannel] = useState<MediaCategory>('movies');

  const { allItems: allHistoryItems } = useAllCategoryHistory();
  const { allItems: allBookmarks } = useAllCategoryBookmarks();
  const activeHistory = useMemo(() => allHistoryItems.slice(0, 12), [allHistoryItems]);
  const { playTrack, currentTrack, isPlaying, togglePlay } = useMusic();

  // Live API queries (preserve original cache keys and fetchers)
  const { data: mangaData, isLoading: mangaLoading, isError: mangaError, refetch: refetchManga } = useQuery({
    queryKey: ['landing', 'manga'],
    queryFn: () => getLatest(1),
  });

  const { data: popularMangaData, isLoading: popularMangaLoading } = useQuery({
    queryKey: ['landing', 'popular_manga'],
    queryFn: getPopular,
  });

  const { data: animeData, isLoading: animeLoading, isError: animeError, refetch: refetchAnime } = useQuery({
    queryKey: ['landing', 'anime'],
    queryFn: getOtakudesuHome,
  });

  const { data: donghuaData, isLoading: donghuaLoading, isError: donghuaError, refetch: refetchDonghua } = useQuery({
    queryKey: ['landing', 'donghua'],
    queryFn: getDonghuaHome,
  });

  const { data: moviesData, isLoading: moviesLoading, isError: moviesError, refetch: refetchMovies } = useQuery({
    queryKey: ['landing', 'movies'],
    queryFn: () => getMovies({ collection: 'trending', perPage: 12 }),
  });

  const latestManga = mangaData?.komikList?.slice(0, 12) || [];
  const popularManga = popularMangaData?.komikList?.slice(0, 10) || latestManga.slice(0, 10);
  const popularAnime = animeData?.ongoing?.slice(0, 12) || [];
  const latestAnimeUpdates = (animeData?.completed || animeData?.ongoing || []).slice(0, 10);
  const popularDonghua = donghuaData?.latestRelease?.slice(0, 12) || [];
  const latestMovies = moviesData?.data?.slice(0, 12) || [];
  const trendingMusic = FAZURA_MUSIC_CATALOG.slice(0, 12);

  // Featured Spotlight derived strictly from live platform data (zero fake ratings or stock imagery)
  const topMovie = latestMovies[0];
  const topAnime = popularAnime[0];
  const topManga = popularManga[0] || latestManga[0];
  const topDonghua = popularDonghua[0];
  const topTrack = trendingMusic[0];

  const featured = useMemo(() => {
    const heroFallback = createPosterFallbackSvg('FAZURASTREAM', CATEGORY_THEMES[spotlightChannel].accentHex);

    if (spotlightChannel === 'anime' && topAnime) {
      return {
        category: 'anime' as MediaCategory,
        title: topAnime.title,
        description:
          'Ikuti episode terbaru dengan subtitle Indonesia, pilihan server HD, dan urutan seri lengkap.',
        meta: [
          topAnime.episodes ? `Episode ${topAnime.episodes}` : null,
          topAnime.releaseDay ? `Rilis ${topAnime.releaseDay}` : null,
          topAnime.score ? `★ ${topAnime.score}` : null,
        ].filter(Boolean) as string[],
        backdrop: topAnime.poster || heroFallback,
        primaryLabel: 'Tonton Sekarang',
        primaryLink: `/anime/detail/${topAnime.provider || 'otakudesu'}/${topAnime.id}`,
        secondaryLink: `/anime/detail/${topAnime.provider || 'otakudesu'}/${topAnime.id}`,
        isMusic: false,
      };
    }

    if (spotlightChannel === 'manga' && topManga) {
      return {
        category: 'manga' as MediaCategory,
        title: topManga.title,
        description:
          'Baca chapter terbaru dengan pembaca vertikal halus, navigasi cepat, dan penyimpanan progres otomatis.',
        meta: [
          topManga.type || 'Manga',
          topManga.chapter || null,
          topManga.rating ? `★ ${topManga.rating}` : null,
        ].filter(Boolean) as string[],
        backdrop: topManga.cover || heroFallback,
        primaryLabel: 'Baca Sekarang',
        primaryLink: `/manga/${topManga.slug}`,
        secondaryLink: '/manga',
        isMusic: false,
      };
    }

    if (spotlightChannel === 'donghua' && topDonghua) {
      const donghuaImg = proxyDonghuaPoster(topDonghua.poster || '') || topDonghua.poster || heroFallback;
      return {
        category: 'donghua' as MediaCategory,
        title: topDonghua.title,
        description:
          'Saksikan animasi kultivasi 3D dan 2D populer dengan terjemahan Indonesia dan pemutar multi-server.',
        meta: [
          topDonghua.currentEpisode || 'Episode Terbaru',
          topDonghua.status || null,
        ].filter(Boolean) as string[],
        backdrop: donghuaImg,
        primaryLabel: 'Tonton Sekarang',
        primaryLink: `/donghua/detail/${topDonghua.slug}`,
        secondaryLink: '/donghua',
        isMusic: false,
      };
    }

    if (spotlightChannel === 'music' && topTrack) {
      return {
        category: 'music' as MediaCategory,
        title: `${topTrack.title} — ${topTrack.artist}`,
        description:
          'Nikmati lagu pilihan dengan pemutar audio persisten lintas halaman, antrean lagu, playlist kustom, dan lirik sinkron.',
        meta: [
          topTrack.album || 'Single',
          topTrack.durationFormatted || null,
        ].filter(Boolean) as string[],
        backdrop: topTrack.thumbnail || MUSIC_FALLBACK_SVG,
        primaryLabel: currentTrack?.id === topTrack.id && isPlaying ? 'Jeda Musik' : 'Putar Sekarang',
        primaryLink: `/music?play=${encodeURIComponent(topTrack.id)}`,
        secondaryLink: '/music',
        isMusic: true,
      };
    }

    // Default: Movies spotlight
    return {
      category: 'movies' as MediaCategory,
      title: topMovie?.title || 'FazuraStream Cinema',
      description:
        topMovie?.description ||
        'Jelajahi film bioskop box office dan serial TV populer dari berbagai genre dengan kualitas pemutaran HD.',
      meta: [
        topMovie?.mediaType === 'tv' ? 'Serial TV' : 'Film',
        topMovie?.releaseDate ? String(new Date(topMovie.releaseDate).getFullYear()) : null,
        topMovie?.ratingValue ? `★ ${topMovie.ratingValue.toFixed(1)}` : null,
      ].filter(Boolean) as string[],
      backdrop: topMovie?.backdropUrl || topMovie?.posterUrl || heroFallback,
      primaryLabel: 'Tonton Sekarang',
      primaryLink: topMovie ? `/movies/watch/${topMovie.id}` : '/movies',
      secondaryLink: topMovie ? `/movies/${topMovie.id}` : '/movies',
      isMusic: false,
    };
  }, [spotlightChannel, topMovie, topAnime, topManga, topDonghua, topTrack, currentTrack?.id, isPlaying]);

  // Combined "Trending This Week" top 10 posters from Movies & Manga/Anime
  const trendingThisWeek = useMemo(() => {
    const combined: Array<{
      id: string;
      category: MediaCategory;
      title: string;
      poster: string;
      link: string;
      meta: string;
      rating?: number | string;
    }> = [];

    latestMovies.slice(0, 5).forEach((m) => {
      combined.push({
        id: `trend-movie-${m.id}`,
        category: 'movies',
        title: m.title,
        poster: m.posterUrl || '',
        link: `/movies/${m.id}`,
        meta: m.mediaType === 'tv' ? 'Serial TV' : 'Movie',
        rating: m.ratingValue,
      });
    });

    popularManga.slice(0, 5).forEach((mg) => {
      combined.push({
        id: `trend-manga-${mg.slug}`,
        category: 'manga',
        title: mg.title,
        poster: mg.cover || '',
        link: `/manga/${mg.slug}`,
        meta: mg.chapter || mg.type || 'Manga',
        rating: mg.rating,
      });
    });

    return combined.slice(0, 10);
  }, [latestMovies, popularManga]);

  // Personalized picks from saved bookmarks' preferred category
  const preferredCategory: MediaCategory | null = useMemo(() => {
    if (allBookmarks.length === 0) return null;
    const counts: Partial<Record<MediaCategory, number>> = {};
    allBookmarks.forEach((b) => {
      const cat = b.category as MediaCategory;
      counts[cat] = (counts[cat] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return (sorted[0]?.[0] as MediaCategory) || null;
  }, [allBookmarks]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <div className="min-h-screen bg-[#12141B] text-[#F2F0EC] pb-20">
          {/* 1. FEATURED HERO */}
          <section className="relative w-full h-[360px] sm:h-[440px] lg:h-[480px] bg-[#0B0C10] border-b border-[#2D303E] overflow-hidden">
            {/* Top Category Ambient Hairline */}
            <div
              className="absolute inset-x-0 top-0 h-[2px] z-20 transition-all duration-700"
              style={{
                backgroundColor: CATEGORY_THEMES[featured.category].accentHex,
                boxShadow: `0 0 20px ${CATEGORY_THEMES[featured.category].accentHex}88`,
              }}
            />

            {/* Atmospheric Ambient Glow behind hero */}
            <div
              className="absolute -top-20 -left-20 w-[550px] h-[550px] rounded-full blur-[140px] pointer-events-none opacity-25 transition-all duration-700"
              style={{ backgroundColor: CATEGORY_THEMES[featured.category].accentHex }}
            />

            {/* Background Artwork */}
            <img
              key={featured.backdrop}
              src={featured.backdrop}
              alt={featured.title}
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = createPosterFallbackSvg(
                  'FAZURASTREAM',
                  CATEGORY_THEMES[featured.category].accentHex
                );
              }}
              className="absolute inset-0 w-full h-full object-cover object-top opacity-55 sm:opacity-65 transition-opacity duration-500"
            />
            {/* Clean Directional Vignettes for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C10] via-[#0B0C10]/65 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B0C10] via-[#0B0C10]/85 via-50% to-transparent" />

            <div className="relative z-10 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-between py-6 sm:py-10">
              {/* Channel Switcher */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
                {SPOTLIGHT_CHANNELS.map((ch) => {
                  const isActive = spotlightChannel === ch.id;
                  const chTheme = CATEGORY_THEMES[ch.id];
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setSpotlightChannel(ch.id)}
                      className={`px-3.5 py-1.5 min-h-[36px] rounded-[10px] text-xs font-semibold border transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer ${
                        isActive
                          ? `${chTheme.activeTabClass} shadow-[0_2px_12px_rgba(0,0,0,0.5)]`
                          : 'bg-[#191C25]/80 hover:bg-[#232633] text-[#A2A4B1] hover:text-[#F2F0EC] border-[#343744]'
                      }`}
                    >
                      {ch.label}
                    </button>
                  );
                })}
              </div>

              {/* Hero Copy & Max 2 Actions */}
              <m.div
                key={spotlightChannel}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="max-w-2xl space-y-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="category" category={featured.category}>
                    {CATEGORY_THEMES[featured.category].label}
                  </Badge>
                  {featured.meta.map((item) => (
                    <span
                      key={item}
                      className="text-xs font-semibold px-2.5 py-0.5 rounded-full backdrop-blur-md bg-white/10 border border-white/15 text-white/90 shadow-sm"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F2F0EC] tracking-tight leading-[1.1] line-clamp-2">
                  {featured.title}
                </h1>

                <p className="text-sm text-[#A2A4B1] line-clamp-2 leading-relaxed max-w-xl">
                  {featured.description}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {featured.isMusic && topTrack ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (currentTrack?.id === topTrack.id) {
                          togglePlay();
                        } else {
                          playTrack(topTrack, FAZURA_MUSIC_CATALOG);
                        }
                      }}
                      className={buttonClasses({ variant: 'primary', size: 'lg' })}
                    >
                      {currentTrack?.id === topTrack.id && isPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current" />
                      )}
                      <span>{featured.primaryLabel}</span>
                    </button>
                  ) : (
                    <Link
                      to={featured.primaryLink}
                      className={buttonClasses({ variant: 'primary', size: 'lg' })}
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>{featured.primaryLabel}</span>
                    </Link>
                  )}

                  <Link
                    to={featured.secondaryLink}
                    className={buttonClasses({ variant: 'secondary', size: 'lg' })}
                  >
                    <span>Selengkapnya</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </m.div>
            </div>
          </section>

          {/* Compact Search Strip */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center gap-2 p-1.5 rounded-[10px] bg-[#191C25] border border-[#343744]"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#747887] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari anime, film, komik manga, donghua, atau lagu..."
                  className="w-full h-10 pl-9 pr-4 bg-transparent text-sm text-[#F2F0EC] placeholder-[#747887] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className={buttonClasses({ variant: 'primary', size: 'md' })}
              >
                Cari
              </button>
            </form>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pt-10">
            {/* 2. CONTINUE WATCHING / READING (Landscape Cards) */}
            {activeHistory.length > 0 && (
              <section className="space-y-4">
                <SectionHeader
                  title="Lanjutkan Terakhir"
                  subtitle="Lanjutkan tontonan, bacaan, atau lagu dari posisi terakhir Anda"
                  viewAllTo="/history"
                  viewAllLabel="Semua Riwayat"
                />
                <MediaCarousel id="landing-continue">
                  {activeHistory.map((item) => {
                    const cat = (item.category as MediaCategory) || 'anime';
                    const catTheme = CATEGORY_THEMES[cat] || CATEGORY_THEMES.anime;
                    const progressPct =
                      typeof item.progress === 'number' && item.progress > 0
                        ? Math.min(100, Math.max(4, item.progress <= 1 ? Math.round(item.progress * 100) : Math.round(item.progress)))
                        : null;

                    return (
                      <Link
                        key={`${item.category}-${item.id}`}
                        to={item.lastItemLink || `/${item.category}`}
                        className="group w-64 sm:w-72 shrink-0 snap-start rounded-[10px] overflow-hidden bg-[#191C25] border border-[#343744] hover:border-[#454958] transition-colors flex flex-col"
                      >
                        <div className="relative aspect-video w-full bg-[#0B0C10] overflow-hidden">
                          <img
                            src={
                              item.cover ||
                              createPosterFallbackSvg(catTheme.label.toUpperCase(), catTheme.accentHex)
                            }
                            alt={item.title}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            onLoad={(e) => {
                              if (cat === 'music') {
                                handleMusicImageLoad(e);
                              } else {
                                const img = e.currentTarget;
                                if (img.naturalWidth > 0 && img.naturalWidth <= 120 && img.naturalHeight <= 90) {
                                  img.src = createPosterFallbackSvg(catTheme.label.toUpperCase(), catTheme.accentHex);
                                }
                              }
                            }}
                            onError={(e) => {
                              if (cat === 'music') {
                                handleMusicImageError(e);
                              } else {
                                (e.currentTarget as HTMLImageElement).src = createPosterFallbackSvg(
                                  catTheme.label.toUpperCase(),
                                  catTheme.accentHex
                                );
                              }
                            }}
                            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C10]/90 via-transparent to-transparent" />
                          <span
                            className="absolute top-2 left-2 px-2 py-0.5 rounded-[6px] bg-[#0B0C10]/85 border border-[#343744] text-[10px] font-semibold uppercase"
                            style={{ color: catTheme.accentHex }}
                          >
                            {catTheme.label}
                          </span>
                        </div>
                        <div className="p-3 space-y-2">
                          <div>
                            <h3 className="text-[13px] font-semibold text-[#F2F0EC] group-hover:text-[#F0A15B] transition-colors truncate">
                              {item.title}
                            </h3>
                            <p className="text-xs text-[#A2A4B1] truncate mt-0.5">
                              {item.lastItemTitle || 'Lanjutkan'}
                            </p>
                          </div>
                          {progressPct !== null && (
                            <div className="w-full h-1 rounded-full bg-[#232633] overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${progressPct}%`,
                                  backgroundColor: catTheme.accentHex,
                                }}
                              />
                            </div>
                          )}
                          <div className="flex items-center justify-between text-[11px] text-[#747887]">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatRelativeTime(item.watchedAt)}
                            </span>
                            {progressPct !== null && <span>{progressPct}%</span>}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </MediaCarousel>
              </section>
            )}

            {/* 3. TRENDING THIS WEEK */}
            {(trendingThisWeek.length > 0 || moviesLoading || popularMangaLoading) && (
              <section className="space-y-4">
                <SectionHeader
                  title="Trending Minggu Ini"
                  subtitle="Pilihan film dan komik yang paling ramai diakses minggu ini"
                  viewAllTo="/search"
                  viewAllLabel="Jelajahi Semua"
                />
                {moviesLoading && trendingThisWeek.length === 0 ? (
                  <CarouselSkeletonStrip />
                ) : (
                  <MediaCarousel id="landing-trending">
                    {trendingThisWeek.map((entry, idx) => (
                      <div key={entry.id} className="w-[152px] sm:w-[172px] lg:w-[184px] shrink-0 snap-start">
                        <MediaCard
                          id={entry.id}
                          category={entry.category}
                          title={entry.title}
                          imageUrl={entry.poster}
                          link={entry.link}
                          ranking={idx + 1}
                          rating={entry.rating}
                          metaPrimary={entry.meta}
                        />
                      </div>
                    ))}
                  </MediaCarousel>
                )}
              </section>
            )}

            {/* 4. POPULAR ANIME */}
            <section className="space-y-4">
              <SectionHeader
                category="anime"
                title="Anime Populer & Ongoing"
                subtitle="Serial anime terbaru subtitle Indonesia dengan server HD"
                viewAllTo="/anime"
                viewAllLabel="Lihat Semua Anime"
              />
              {animeLoading ? (
                <CarouselSkeletonStrip />
              ) : animeError || popularAnime.length === 0 ? (
                <ErrorState
                  title="Daftar Anime Tidak Tersedia"
                  description="Feed anime terbaru belum dapat dimuat."
                  onRetry={() => refetchAnime()}
                />
              ) : (
                <MediaCarousel id="landing-anime">
                  {popularAnime.map((anime) => (
                    <div key={anime.id} className="w-[152px] sm:w-[172px] lg:w-[184px] shrink-0 snap-start">
                      <AnimeGridCard anime={anime} />
                    </div>
                  ))}
                </MediaCarousel>
              )}
            </section>

            {/* 5. LATEST MOVIES */}
            <section className="space-y-4">
              <SectionHeader
                category="movies"
                title="Film & Serial Terbaru"
                subtitle="Rilis film box office dan tayangan serial pilihan"
                viewAllTo="/movies"
                viewAllLabel="Lihat Semua Film"
              />
              {moviesLoading ? (
                <CarouselSkeletonStrip />
              ) : moviesError || latestMovies.length === 0 ? (
                <ErrorState
                  title="Daftar Film Tidak Tersedia"
                  description="Katalog film sementara tidak dapat diakses."
                  onRetry={() => refetchMovies()}
                />
              ) : (
                <MediaCarousel id="landing-movies">
                  {latestMovies.map((movie) => (
                    <div key={movie.id} className="w-[152px] sm:w-[172px] lg:w-[184px] shrink-0 snap-start">
                      <MediaCard
                        id={movie.id}
                        category="movies"
                        title={movie.title}
                        imageUrl={movie.posterUrl || ''}
                        link={`/movies/${movie.id}`}
                        topBadge={movie.mediaType === 'tv' ? 'Serial TV' : 'Film'}
                        rating={movie.ratingValue}
                        metaPrimary={movie.genres?.[0] || (movie.mediaType === 'tv' ? 'Serial TV' : 'Bioskop')}
                        metaSecondary={
                          movie.releaseDate
                            ? String(new Date(movie.releaseDate).getFullYear())
                            : undefined
                        }
                        bookmarkType={movie.mediaType === 'tv' ? 'Serial TV' : 'Movie'}
                      />
                    </div>
                  ))}
                </MediaCarousel>
              )}
            </section>

            {/* 6. RECENTLY UPDATED MANGA */}
            <section className="space-y-4">
              <SectionHeader
                category="manga"
                title="Pembaruan Komik Manga"
                subtitle="Chapter terbaru manga Jepang, manhwa Korea, dan manhua"
                viewAllTo="/manga"
                viewAllLabel="Lihat Katalog Manga"
              />
              {mangaLoading ? (
                <CarouselSkeletonStrip />
              ) : mangaError || latestManga.length === 0 ? (
                <ErrorState
                  title="Daftar Komik Tidak Tersedia"
                  description="Pembaruan chapter manga gagal dimuat."
                  onRetry={() => refetchManga()}
                />
              ) : (
                <MediaCarousel id="landing-manga">
                  {latestManga.map((manga) => (
                    <div key={manga.slug} className="w-[152px] sm:w-[172px] lg:w-[184px] shrink-0 snap-start">
                      <MangaCard manga={manga} />
                    </div>
                  ))}
                </MediaCarousel>
              )}
            </section>

            {/* 7. POPULAR DONGHUA */}
            <section className="space-y-4">
              <SectionHeader
                category="donghua"
                title="Donghua Populer"
                subtitle="Animasi 3D dan 2D kultivasi Tiongkok sub Indo"
                viewAllTo="/donghua"
                viewAllLabel="Lihat Semua Donghua"
              />
              {donghuaLoading ? (
                <CarouselSkeletonStrip />
              ) : donghuaError || popularDonghua.length === 0 ? (
                <ErrorState
                  title="Daftar Donghua Tidak Tersedia"
                  description="Feed donghua terbaru gagal dimuat."
                  onRetry={() => refetchDonghua()}
                />
              ) : (
                <MediaCarousel id="landing-donghua">
                  {popularDonghua.map((donghua) => (
                    <div key={donghua.slug} className="w-[152px] sm:w-[172px] lg:w-[184px] shrink-0 snap-start">
                      <MediaCard
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
                    </div>
                  ))}
                </MediaCarousel>
              )}
            </section>

            {/* 8. MUSIC DISCOVERY (Strict 1:1 Square Artwork) */}
            <section className="space-y-4">
              <SectionHeader
                category="music"
                title="Eksplorasi Musik"
                subtitle="Putar langsung trek populer ke pemutar persisten FazuraStream"
                viewAllTo="/music"
                viewAllLabel="Buka Music Hub"
              />
              <MediaCarousel id="landing-music">
                {trendingMusic.map((track) => {
                  const isActiveTrack = currentTrack?.id === track.id;
                  const isTrackPlaying = isActiveTrack && isPlaying;

                  return (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() => {
                        if (isActiveTrack) {
                          togglePlay();
                        } else {
                          playTrack(track, FAZURA_MUSIC_CATALOG);
                        }
                      }}
                      className={`group w-[152px] sm:w-[172px] lg:w-[184px] shrink-0 snap-start text-left rounded-[10px] overflow-hidden bg-[#191C25] border transition-colors cursor-pointer ${
                        isActiveTrack
                          ? 'border-[#E68BA6]'
                          : 'border-[#343744] hover:border-[#454958]'
                      }`}
                    >
                      <div className="relative aspect-square w-full bg-[#12141B] overflow-hidden">
                        <img
                          src={track.thumbnail || MUSIC_FALLBACK_SVG}
                          alt={track.title}
                          loading="lazy"
                          onLoad={handleMusicImageLoad}
                          onError={handleMusicImageError}
                          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                        />
                        <div className="absolute inset-0 bg-[#0B0C10]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="w-10 h-10 rounded-full bg-[#F0A15B] text-[#0B0C10] flex items-center justify-center">
                            {isTrackPlaying ? (
                              <Pause className="w-4 h-4 fill-current" />
                            ) : (
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="p-3 space-y-1">
                        <h3 className="text-[13px] font-semibold text-[#F2F0EC] group-hover:text-[#F0A15B] truncate">
                          {track.title}
                        </h3>
                        <p className="text-xs text-[#A2A4B1] truncate">{track.artist}</p>
                        {track.durationFormatted && (
                          <p className="text-[11px] text-[#747887]">{track.durationFormatted}</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </MediaCarousel>
            </section>

            {/* 9. PERSONALIZED RECOMMENDATIONS (If saved bookmarks exist) */}
            {preferredCategory && (
              <section className="space-y-4">
                <SectionHeader
                  category={preferredCategory}
                  title={`Rekomendasi ${CATEGORY_THEMES[preferredCategory].label} untuk Anda`}
                  subtitle="Disusun berdasarkan koleksi favorit yang sering Anda simpan"
                  viewAllTo={`/${preferredCategory === 'movies' ? 'movies' : preferredCategory}`}
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {preferredCategory === 'anime' &&
                    latestAnimeUpdates.slice(0, 5).map((a) => (
                      <AnimeGridCard key={`pref-${a.id}`} anime={a} />
                    ))}
                  {preferredCategory === 'manga' &&
                    popularManga.slice(0, 5).map((m) => (
                      <MangaCard key={`pref-${m.slug}`} manga={m} />
                    ))}
                  {preferredCategory === 'movies' &&
                    latestMovies.slice(0, 5).map((mv) => (
                      <MediaCard
                        key={`pref-${mv.id}`}
                        id={mv.id}
                        category="movies"
                        title={mv.title}
                        imageUrl={mv.posterUrl || ''}
                        link={`/movies/${mv.id}`}
                        rating={mv.ratingValue}
                        metaPrimary={mv.mediaType === 'tv' ? 'Serial TV' : 'Film'}
                      />
                    ))}
                  {preferredCategory === 'donghua' &&
                    popularDonghua.slice(0, 5).map((d) => (
                      <MediaCard
                        key={`pref-${d.slug}`}
                        id={d.slug}
                        category="donghua"
                        title={d.title}
                        imageUrl={proxyDonghuaPoster(d.poster || '') || d.poster}
                        link={`/donghua/detail/${d.slug}`}
                        metaPrimary={d.currentEpisode || 'Donghua'}
                      />
                    ))}
                  {preferredCategory === 'music' &&
                    trendingMusic.slice(0, 5).map((tr) => (
                      <button
                        key={`pref-${tr.id}`}
                        type="button"
                        onClick={() => playTrack(tr, FAZURA_MUSIC_CATALOG)}
                        className="text-left rounded-[10px] overflow-hidden bg-[#191C25] border border-[#343744] hover:border-[#454958] p-3 flex items-center gap-3 cursor-pointer"
                      >
                        <img
                          src={tr.thumbnail || MUSIC_FALLBACK_SVG}
                          alt={tr.title}
                          onLoad={handleMusicImageLoad}
                          onError={handleMusicImageError}
                          className="w-12 h-12 rounded-[6px] object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-[#F2F0EC] truncate">{tr.title}</p>
                          <p className="text-xs text-[#A2A4B1] truncate">{tr.artist}</p>
                        </div>
                      </button>
                    ))}
                </div>
              </section>
            )}

            {/* 10. LATEST UPDATES SUMMARY */}
            {latestAnimeUpdates.length > 0 && (
              <section className="space-y-4">
                <SectionHeader
                  title="Update Katalog Terbaru"
                  subtitle="Daftar rilis terkini lintas seri anime dan komik yang siap ditonton"
                  viewAllTo="/anime?tab=completed"
                  viewAllLabel="Lihat Arsip Lengkap"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {latestAnimeUpdates.slice(0, 6).map((item) => (
                    <Link
                      key={`upd-${item.id}`}
                      to={`/anime/detail/${item.provider || 'otakudesu'}/${item.id}`}
                      className="flex items-center gap-3 p-2.5 rounded-[10px] bg-[#191C25] border border-[#343744] hover:border-[#454958] transition-colors group"
                    >
                      <img
                        src={item.poster || createPosterFallbackSvg('ANIME', '#A78BFA')}
                        alt={item.title}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = createPosterFallbackSvg(
                            'ANIME',
                            '#A78BFA'
                          );
                        }}
                        className="w-12 aspect-[2/3] rounded-[6px] object-cover shrink-0 bg-[#12141B]"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold text-[#F2F0EC] group-hover:text-[#F0A15B] truncate">
                          {item.title}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-[#A2A4B1] mt-1">
                          {item.episodes && <span>{item.episodes} Ep</span>}
                          {item.score && (
                            <span className="inline-flex items-center gap-0.5 text-[#F0A15B]">
                              <Star className="w-3 h-3 fill-[#F0A15B]" />
                              {item.score}
                            </span>
                          )}
                          {item.releasedOn && <span className="truncate text-[#747887]">{item.releasedOn}</span>}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </MotionConfig>
    </LazyMotion>
  );
}
