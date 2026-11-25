import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Play,
  Server,
  Maximize2,
  Minimize2,
  RotateCcw,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Tv,
  Film,
  Star,
  Clock,
  Sparkles,
  Info,
  Layers,
  MessageSquare,
  FastForward,
} from 'lucide-react';
import {
  getMovieDetail,
  getMovieStream,
  getMovieSeasons,
  getMovieEpisodes,
} from '../services/movieApi';
import type { StreamResponse, StreamServer, SeasonItem, EpisodeItem } from '../types/movie';
import { useCategoryHistory } from '../services/categoryStorage';
import { usePageMeta } from '../hooks/usePageMeta';

export function MovieWatchPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const seasonParam = parseInt(searchParams.get('season') || '1', 10);
  const episodeParam = parseInt(searchParams.get('episode') || '1', 10);

  const [activeServerUrl, setActiveServerUrl] = useState<string>('');
  const [activeServerName, setActiveServerName] = useState<string>('');
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);
  const [reloadKey, setReloadKey] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const SKIP_OP_SECONDS = 85;

  const isDirectVideoStream = (url?: string): boolean => {
    if (!url) return false;
    const u = url.toLowerCase();
    return u.endsWith('.mp4') || u.includes('.mp4?');
  };

  const skipOpening = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(
        videoRef.current.currentTime + SKIP_OP_SECONDS,
        videoRef.current.duration || Infinity
      );
    }
  };

  // 1. Fetch Movie Detail
  const { data: detailResponse, isLoading: detailLoading } = useQuery({
    queryKey: ['movieDetail', id],
    queryFn: () => getMovieDetail(id!),
    enabled: Boolean(id),
  });

  const movie = detailResponse?.data;
  const isTv = movie?.mediaType === 'tv';

  usePageMeta({
    title: movie?.title
      ? `${movie.title}${isTv ? ` S${seasonParam}E${episodeParam}` : ''} - Nonton Online`
      : 'Cinema Player',
    description: movie?.description?.slice(0, 155) || 'Pemutar film dan serial TV multi-server HD di FazuraStream.',
    image: movie?.posterUrl,
    type: 'video.movie',
  });

  const { recordHistory } = useCategoryHistory('movies');

  useEffect(() => {
    if (movie && id) {
      recordHistory({
        id: String(id),
        category: 'movies',
        title: movie.title,
        cover: movie.posterUrl || '',
        lastItemTitle: isTv ? `Season ${seasonParam} Ep ${episodeParam}` : (movie.duration || 'Film Bioskop'),
        lastItemLink: `/movies/watch/${id}${isTv ? `?season=${seasonParam}&episode=${episodeParam}` : ''}`,
        watchedAt: Date.now(),
      });
    }
  }, [movie, id, isTv, seasonParam, episodeParam]);

  // 2. Fetch Stream Data
  const {
    data: streamData,
    isLoading: streamLoading,
    isError: streamError,
    refetch: refetchStream,
  } = useQuery({
    queryKey: ['movieStream', id, seasonParam, episodeParam],
    queryFn: () => getMovieStream(id!, seasonParam, episodeParam),
    enabled: Boolean(id),
  });

  // Set default server when streamData arrives
  useEffect(() => {
    if (streamData) {
      const defaultServer = streamData.streams[0];
      setActiveServerUrl(streamData.streamUrl || defaultServer?.url || '');
      setActiveServerName(defaultServer?.serverName || 'Server Default');
    }
  }, [streamData]);

  // 3. Fetch Seasons & Episodes for TV series
  const { data: seasons = [] } = useQuery({
    queryKey: ['movieSeasons', id],
    queryFn: () => getMovieSeasons(id!),
    enabled: Boolean(id && isTv),
  });

  const { data: episodes = [] } = useQuery({
    queryKey: ['movieEpisodes', id, seasonParam],
    queryFn: () => getMovieEpisodes(id!, seasonParam),
    enabled: Boolean(id && isTv),
  });

  const handleSelectServer = (server: StreamServer) => {
    setActiveServerUrl(server.url);
    setActiveServerName(server.serverName);
  };

  const handleSelectSeason = (seasonNum: number) => {
    setSearchParams({ season: String(seasonNum), episode: '1' });
  };

  const handleSelectEpisode = (epNum: number) => {
    setSearchParams({ season: String(seasonParam), episode: String(epNum) });
  };

  // Previous & Next navigation
  const currentEpIndex = episodes.findIndex((e) => e.episodeNumber === episodeParam);
  const hasPrev = currentEpIndex > 0;
  const hasNext = currentEpIndex >= 0 && currentEpIndex < episodes.length - 1;

  const handlePrevEpisode = () => {
    if (hasPrev) {
      handleSelectEpisode(episodes[currentEpIndex - 1].episodeNumber);
    }
  };

  const handleNextEpisode = () => {
    if (hasNext) {
      handleSelectEpisode(episodes[currentEpIndex + 1].episodeNumber);
    }
  };

  return (
    <div className="min-h-screen bg-[#12141B] pb-20">
      {/* Top Bar Navigation */}
      <div className="bg-[#191C25] border-b border-[#343744] py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to={id ? `/movies/${id}` : '/movies'}
              className="p-2 rounded-[10px] bg-[#232633] hover:bg-[#343744] text-[#A2A4B1] hover:text-[#F2F0EC] border border-[#343744] shrink-0 transition-colors"
              title="Kembali ke Detail Film"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm font-bold text-[#F2F0EC] truncate">
                {movie?.title || 'Memuat Pemutar Video...'}
              </h1>
              <p className="text-[11px] text-[#F0A15B] font-semibold truncate">
                {isTv ? `Season ${seasonParam} • Episode ${episodeParam}` : 'Full Movie • Box Office'}
                {activeServerName && ` — ${activeServerName}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              disabled={!isDirectVideoStream(activeServerUrl)}
              onClick={skipOpening}
              className="p-2 rounded-[10px] bg-[#232633] text-[#A2A4B1] border border-[#343744] text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:bg-[#343744] hover:enabled:text-[#F0A15B]"
              title={isDirectVideoStream(activeServerUrl) ? 'Skip Opening +85 detik' : 'Skip OP hanya tersedia untuk stream langsung MP4'}
            >
              <FastForward className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Skip OP</span>
            </button>
            <button
              onClick={() => setReloadKey((k) => k + 1)}
              className="p-2 rounded-[10px] bg-[#232633] hover:bg-[#343744] text-[#A2A4B1] hover:text-[#F2F0EC] border border-[#343744] text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Muat Ulang Server"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reload</span>
            </button>
            <button
              onClick={() => setIsTheaterMode(!isTheaterMode)}
              className="p-2 rounded-[10px] bg-[#232633] hover:bg-[#343744] text-[#A2A4B1] hover:text-[#F2F0EC] border border-[#343744] text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Mode Bioskop"
            >
              {isTheaterMode ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Normal</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Bioskop</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Player Section Container */}
      <div
        className={`mx-auto px-4 sm:px-6 lg:px-8 pt-4 transition-all duration-300 ${
          isTheaterMode ? 'max-w-[1600px]' : 'max-w-7xl'
        }`}
      >
        {/* Responsive 16:9 Cinema Player */}
        <div className="relative aspect-video w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-black shadow-2xl shadow-rose-950/20 border border-white/10">
          {streamLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 gap-3">
              <div className="w-12 h-12 rounded-full border-4 border-rose-500 border-t-transparent animate-spin" />
              <p className="text-xs font-semibold text-slate-400">
                Menghubungkan ke Server Streaming...
              </p>
            </div>
          ) : activeServerUrl ? (
            <iframe
              key={`${activeServerUrl}-${reloadKey}`}
              src={activeServerUrl}
              title={movie?.title || 'Video Player'}
              className="w-full h-full border-0"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 gap-3 p-4 text-center">
              <Film className="w-12 h-12 text-rose-500" />
              <p className="text-sm font-bold text-white">Aliran Video Tidak Tersedia</p>
              <button
                onClick={() => refetchStream()}
                className="px-4 py-2 rounded-[10px] bg-[#F0A15B] hover:bg-[#F6B779] text-[#0B0C10] text-xs font-bold transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          )}
        </div>

        {/* Multi-Server Selector Bar */}
        {streamData && streamData.streams.length > 0 && (
          <div className="mt-4 bg-[#191C25] p-3.5 rounded-[12px] border border-[#343744] space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-[#F0A15B]" />
                <span className="text-xs font-bold text-[#F2F0EC] uppercase tracking-wider">
                  Pilihan Server Pemutar (Multi-Server):
                </span>
              </div>
              <span className="text-[11px] text-[#747887]">
                Ganti server jika pemutaran lambat atau buffering
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {streamData.streams.map((server, idx) => {
                const isActive = activeServerUrl === server.url;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectServer(server)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                      isActive
                        ? 'bg-[#F0A15B] text-[#0B0C10] border-[#F0A15B] font-bold'
                        : 'bg-[#12141B] hover:bg-[#232633] text-[#A2A4B1] hover:text-[#F2F0EC] border border-[#343744]'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{server.serverName}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-black/40 text-slate-300 uppercase">
                      {server.type}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TV Series Episode Navigator (if TV) */}
        {isTv && (
          <div className="mt-6 bg-[#191C25] p-5 rounded-[12px] border border-[#343744] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Tv className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Navigasi Episode & Season</h3>
              </div>

              {/* Previous & Next Episode Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevEpisode}
                  disabled={!hasPrev}
                  className="px-3 py-1.5 rounded-[10px] bg-[#232633] hover:bg-[#343744] disabled:opacity-35 disabled:pointer-events-none text-[#F2F0EC] text-xs font-semibold border border-[#343744] flex items-center gap-1 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Eps Sebelumnya
                </button>
                <button
                  onClick={handleNextEpisode}
                  disabled={!hasNext}
                  className="px-3 py-1.5 rounded-[10px] bg-[#232633] hover:bg-[#343744] disabled:opacity-35 disabled:pointer-events-none text-[#F2F0EC] text-xs font-semibold border border-[#343744] flex items-center gap-1 transition-colors"
                >
                  Eps Selanjutnya
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Season Selector */}
            {seasons.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {seasons.map((s) => (
                  <button
                    key={s.seasonNumber}
                    onClick={() => handleSelectSeason(s.seasonNumber)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      seasonParam === s.seasonNumber
                        ? 'bg-[#F0A15B] text-[#0B0C10] font-bold'
                        : 'bg-[#12141B] text-[#A2A4B1] hover:text-[#F2F0EC] border border-[#343744]'
                    }`}
                  >
                    {s.name || `Season ${s.seasonNumber}`}
                  </button>
                ))}
              </div>
            )}

            {/* Episode List Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-56 overflow-y-auto pr-1">
              {episodes.map((ep) => {
                const isActive = ep.episodeNumber === episodeParam;
                return (
                  <button
                    key={ep.episodeNumber}
                    onClick={() => handleSelectEpisode(ep.episodeNumber)}
                    className={`p-2 rounded-xl text-left transition-all border ${
                      isActive
                        ? 'bg-[#F0A15B] text-[#0B0C10] border-[#F0A15B] font-bold'
                        : 'bg-[#12141B] hover:bg-[#232633] text-[#A2A4B1] hover:text-[#F2F0EC] border-[#343744]'
                    }`}
                  >
                    <div className="text-[10px] text-slate-300 font-medium truncate">
                      Eps {ep.episodeNumber}
                    </div>
                    <div className="text-xs truncate">{ep.name || ep.title || `Episode ${ep.episodeNumber}`}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Video & Movie Information Under Player */}
        {movie && (
          <div className="mt-6 bg-[#191C25] p-5 rounded-[12px] border border-[#343744] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white">{movie.title}</h2>
                {movie.releaseDate && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    Rilis: {movie.releaseDate} • {movie.duration || 'Full Length'}
                  </p>
                )}
              </div>

              {movie.ratingValue && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {movie.ratingValue.toFixed(1)} / 10
                </div>
              )}
            </div>

            {movie.description && (
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-2 border-t border-white/5">
                {movie.description}
              </p>
            )}

            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to={`/movies/${movie.id}`}
                className="text-xs font-semibold text-[#F0A15B] hover:text-[#F6B779] underline flex items-center gap-1"
              >
                <Info className="w-3.5 h-3.5" />
                Lihat Pemeran, Trailer & Ulasan Lengkap
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
