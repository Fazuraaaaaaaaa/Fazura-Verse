import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Film,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  Server,
  ExternalLink,
  AlertCircle,
  Play,
  Loader2,
  CheckCircle2,
  RefreshCw,
  Info,
  Bookmark,
  BookmarkCheck,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  getOtakudesuEpisode,
  getSamehadakuEpisode,
  getNimegamiEpisode,
  getOtakudesuDetail,
  getSamehadakuDetail,
  getNimegamiDetail,
  getAnimeServerUrl,
  getOtakudesuByGenre,
} from '../services/animeApi';
import { useCategoryBookmarks, useCategoryHistory } from '../services/categoryStorage';
import { AnimeGridCard } from '../components/anime/AnimeGridCard';

function formatEpisodeName(rawTitle: string | number, fallbackSlug?: string): string {
  const str = String(rawTitle || '').trim();
  const match = str.match(/(?:Episode|Eps|Ep\.?)\s*(\d+(?:\.\d+)?)/i);
  if (match) return `Episode ${match[1]}`;
  if (/^\d+$/.test(str)) return `Episode ${str}`;
  if (fallbackSlug) {
    const slugMatch = fallbackSlug.match(/(?:episode|eps|ep)-(\d+)/i);
    if (slugMatch) return `Episode ${slugMatch[1]}`;
  }
  if (/batch/i.test(str)) return 'Batch Full';
  return str.replace(/\s*(?:Subtitle\s+Indonesia|Sub\s+Indo).*$/i, '').trim() || str;
}

export function AnimeWatchPage() {
  const { provider, episodeId } = useParams<{
    provider: 'samehadaku' | 'otakudesu' | 'nimegami';
    episodeId: string;
  }>();
  const navigate = useNavigate();

  const isSame = provider === 'samehadaku';
  const isNime = provider === 'nimegami';

  const { data: episode, isLoading, error } = useQuery({
    queryKey: ['anime', 'episode', provider, episodeId],
    queryFn: () => {
      if (isNime) return getNimegamiEpisode(episodeId || '');
      if (isSame) return getSamehadakuEpisode(episodeId || '');
      return getOtakudesuEpisode(episodeId || '');
    },
    enabled: Boolean(episodeId),
  });

  const [customStreamUrl, setCustomStreamUrl] = useState<string>('');
  const [activeServerId, setActiveServerId] = useState<string>('');
  const [switchingServer, setSwitchingServer] = useState<boolean>(false);
  const [switchingServerName, setSwitchingServerName] = useState<string>('');
  const [switchError, setSwitchError] = useState<string>('');
  const [playerKey, setPlayerKey] = useState<number>(0);
  const autoSelectedEpisodeRef = useRef<string>('');

  const { recordHistory, history } = useCategoryHistory('anime');
  const animeId =
    episode?.animeId ||
    (episodeId ? (episodeId.includes('__') ? episodeId.split('__')[0] : episodeId.split('-episode-')[0]) : '');

  // Query anime detail to get full episode list for quick navigation & drawer
  const { data: animeDetail } = useQuery({
    queryKey: ['anime', 'detail', provider, animeId],
    queryFn: () => {
      if (isNime) return getNimegamiDetail(animeId);
      if (isSame) return getSamehadakuDetail(animeId);
      return getOtakudesuDetail(animeId);
    },
    enabled: Boolean(animeId),
  });

  const { isBookmarked, toggleBookmark } = useCategoryBookmarks('anime');
  const bookmarked = animeId ? isBookmarked(animeId) : false;

  // Record history
  useEffect(() => {
    if (episode && episodeId) {
      recordHistory({
        id: animeId || episodeId,
        category: 'anime',
        title: animeDetail?.title || episode.title || 'Anime',
        cover: animeDetail?.poster || '',
        lastItemTitle: episode.title || `Episode ${episodeId}`,
        lastItemLink: `/anime/watch/${provider || 'otakudesu'}/${episodeId}`,
        watchedAt: Date.now(),
      });
    }
  }, [episode, episodeId, provider, animeId, animeDetail, recordHistory]);

  // Reset custom server when route changes
  useEffect(() => {
    setCustomStreamUrl('');
    setActiveServerId('');
    setSwitchError('');
    setSwitchingServerName('');
  }, [episodeId]);

  const activeStream = customStreamUrl || (!activeServerId ? episode?.streamUrl : '') || '';

  const handleSelectServer = async (serverId: string, serverTitle: string) => {
    try {
      setSwitchingServer(true);
      setSwitchingServerName(serverTitle);
      setSwitchError('');
      setActiveServerId(serverId);

      const realEmbedUrl = await getAnimeServerUrl(
        provider || 'otakudesu',
        serverId
      );

      if (realEmbedUrl) {
        setCustomStreamUrl(realEmbedUrl);
      } else {
        throw new Error('URL stream tidak ditemukan');
      }
    } catch (err: any) {
      console.error('Server switch error:', err);
      setSwitchError(`Gagal memuat server ${serverTitle}. Mengalihkan ke stream cadangan.`);
      if (episode?.streamUrl) {
        setCustomStreamUrl(episode.streamUrl);
      }
    } finally {
      setSwitchingServer(false);
      setSwitchingServerName('');
    }
  };

  // Watched episodes set
  const watchedEpisodeSlugs = useMemo(() => {
    const set = new Set<string>();
    history.forEach((h) => {
      if (h.lastItemLink) {
        const parts = h.lastItemLink.split('/');
        const epSlug = parts[parts.length - 1];
        if (epSlug) set.add(epSlug);
      }
    });
    return set;
  }, [history]);

  // Sorted episodes (Episode 1 first at the top)
  const sortedEpisodes = useMemo(() => {
    if (!animeDetail?.episodeList) return [];
    return [...animeDetail.episodeList].reverse();
  }, [animeDetail?.episodeList]);

  // Primary genre for related anime recommendations
  const primaryGenre = useMemo(() => {
    if (!animeDetail?.genres || animeDetail.genres.length === 0) return null;
    const first = animeDetail.genres[0];
    const genreId = first.id || first.title.toLowerCase().replace(/\s+/g, '-');
    return {
      id: genreId,
      title: first.title,
    };
  }, [animeDetail?.genres]);

  const { data: relatedAnimeData } = useQuery({
    queryKey: ['anime', 'related', primaryGenre?.id],
    queryFn: () => getOtakudesuByGenre(primaryGenre?.id || ''),
    enabled: Boolean(primaryGenre?.id),
  });

  const relatedAnimeList = useMemo(() => {
    if (!relatedAnimeData?.animeList) return [];
    return relatedAnimeData.animeList
      .filter((item) => item.id !== animeId && !item.id.includes(animeId || ''))
      .slice(0, 12);
  }, [relatedAnimeData?.animeList, animeId]);

  // Filter out unwanted servers (ODStream HD, ondesuhd/OnDesu, and OCDCN/ODCDN)
  const filteredServers = useMemo(() => {
    if (!episode?.servers) return [];
    const isExcluded = (title: string) => {
      const clean = (title || '').toLowerCase().replace(/[\s\-_]/g, '');
      return (
        clean.includes('odstream') ||
        clean.includes('ondesu') ||
        clean.includes('odcdn') ||
        clean.includes('ocdcn')
      );
    };

    return episode.servers
      .map((q) => ({
        ...q,
        serverList: (q.serverList || []).filter((srv) => !isExcluded(srv.title)),
      }))
      .filter((q) => q.serverList.length > 0);
  }, [episode?.servers]);

  // Auto-direct to VidHide 720p server as soon as user opens an episode
  useEffect(() => {
    if (!episode || !filteredServers || filteredServers.length === 0 || !episodeId) return;

    // Check if we already auto-selected a server for this episode
    if (autoSelectedEpisodeRef.current === episodeId) return;
    autoSelectedEpisodeRef.current = episodeId;

    // Search for VidHide 720p server
    let targetServer: { serverId: string; title: string; quality: string } | null = null;

    // Priority 1: 720p quality with server title containing 'vidhide'
    const q720 = filteredServers.find((q) => q.quality.toLowerCase().includes('720'));
    if (q720) {
      const vidhide720 = q720.serverList.find((s) => {
        const clean = (s.title || '').toLowerCase().replace(/[\s\-_]/g, '');
        return clean.includes('vidhide') || s.serverId.toLowerCase().includes('vidhide');
      });
      if (vidhide720) {
        targetServer = {
          serverId: vidhide720.serverId,
          title: vidhide720.title,
          quality: q720.quality,
        };
      }
    }

    // Priority 2: Any other quality (1080p, 480p, 360p) with VidHide server
    if (!targetServer) {
      for (const q of filteredServers) {
        const vidhide = q.serverList.find((s) => {
          const clean = (s.title || '').toLowerCase().replace(/[\s\-_]/g, '');
          return clean.includes('vidhide') || s.serverId.toLowerCase().includes('vidhide');
        });
        if (vidhide) {
          targetServer = {
            serverId: vidhide.serverId,
            title: vidhide.title,
            quality: q.quality,
          };
          break;
        }
      }
    }

    // Priority 3: Fallback to any 720p server if VidHide not available
    if (!targetServer && q720 && q720.serverList.length > 0) {
      targetServer = {
        serverId: q720.serverList[0].serverId,
        title: q720.serverList[0].title,
        quality: q720.quality,
      };
    }

    if (targetServer) {
      handleSelectServer(targetServer.serverId, `${targetServer.quality} - ${targetServer.title}`);
    }
  }, [episodeId, episode, filteredServers]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-text-secondary font-semibold">Memuat pemutar episode anime...</p>
      </div>
    );
  }

  if (error || !episode) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-white font-heading">Gagal Memuat Episode</h2>
        <p className="text-xs text-text-secondary">
          {(error as any)?.message || 'Server episode sedang tidak merespon.'}
        </p>
        <Link
          to="/anime"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-primary text-white font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Anime Hub
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 min-w-0">
      {/* Top Header & Episode Navigation Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to={episode.animeId ? `/anime/detail/${provider}/${episode.animeId}` : '/anime'}
            className="p-2.5 rounded-xl bg-surface hover:bg-surface-elevated text-slate-300 hover:text-white border border-white/10 shrink-0 transition-colors"
            title="Kembali ke Detail Anime"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-white truncate font-heading">
              {episode.title}
            </h1>
            <p className="text-[11px] text-accent-soft font-semibold flex items-center gap-2">
              <span>Server: {(provider || 'otakudesu').toUpperCase()}</span>
              {animeDetail?.title && (
                <span className="hidden sm:inline text-text-muted">• {animeDetail.title}</span>
              )}
            </p>
          </div>
        </div>

        {/* Navigation Toolbar (Prev, Dropdown, Next & Bookmark) */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-between lg:justify-end shrink-0">
          {/* Bookmark Button */}
          {animeId && (
            <button
              onClick={() =>
                toggleBookmark({
                  id: animeId,
                  category: 'anime',
                  title: animeDetail?.title || episode.title || 'Anime',
                  cover: animeDetail?.poster || '',
                  link: `/anime/detail/${provider || 'otakudesu'}/${animeId}`,
                  subtitle: `Episode ${episodeId}`,
                  type: 'Anime',
                  addedAt: Date.now(),
                })
              }
              title={bookmarked ? 'Hapus Bookmark' : 'Bookmark Anime'}
              className={`p-2 rounded-xl border transition-all text-xs font-semibold flex items-center gap-1.5 ${
                bookmarked
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                  : 'bg-surface hover:bg-surface-elevated text-slate-300 border-white/10'
              }`}
            >
              {bookmarked ? (
                <BookmarkCheck className="w-4 h-4 text-rose-400" />
              ) : (
                <Bookmark className="w-4 h-4 text-slate-400" />
              )}
              <span className="hidden md:inline">{bookmarked ? 'Tersimpan' : 'Bookmark'}</span>
            </button>
          )}

          {/* Episode Quick Dropdown (when detail is available) */}
          {animeDetail?.episodeList && animeDetail.episodeList.length > 0 && (
            <div className="relative">
              <select
                value={episodeId}
                onChange={(e) => navigate(`/anime/watch/${provider}/${e.target.value}`)}
                className="bg-surface text-xs text-slate-200 border border-white/10 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-accent-primary cursor-pointer max-w-[150px] sm:max-w-[200px] truncate"
              >
                {sortedEpisodes.map((ep) => (
                  <option key={ep.episodeId} value={ep.episodeId}>
                    {formatEpisodeName(ep.title, ep.episodeId)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Previous Episode Button */}
          <button
            onClick={() => {
              if (episode.prevEpisodeId) {
                navigate(`/anime/watch/${provider}/${episode.prevEpisodeId}`);
              }
            }}
            disabled={!episode.hasPrev || !episode.prevEpisodeId}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-surface hover:bg-surface-elevated disabled:opacity-30 text-white text-xs font-semibold border border-white/10 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Prev Ep</span>
          </button>

          {/* Next Episode Button */}
          <button
            onClick={() => {
              if (episode.nextEpisodeId) {
                navigate(`/anime/watch/${provider}/${episode.nextEpisodeId}`);
              }
            }}
            disabled={!episode.hasNext || !episode.nextEpisodeId}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3.5 py-1.5 rounded-xl bg-accent-primary hover:bg-accent-primary/90 disabled:opacity-30 text-white text-xs font-bold transition-all shadow-md shadow-accent-primary/20"
          >
            <span className="hidden sm:inline">Next Ep</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Video Player Frame */}
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl">
        {switchingServer && (
          <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-2">
            <Loader2 className="w-8 h-8 text-accent-primary animate-spin" />
            <p className="text-xs text-text-primary font-medium">
              {switchingServerName ? `Menghubungkan ke ${switchingServerName}...` : 'Beralih server video...'}
            </p>
          </div>
        )}

        {activeStream ? (
          activeStream.endsWith('.mp4') ||
          activeStream.includes('.mp4?') ||
          activeStream.includes('stream-stor') ||
          activeStream.includes('berkasdrive.com/v/') ? (
            <video
              key={`${activeStream}-${playerKey}`}
              src={activeStream}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain bg-black"
            />
          ) : (
            <iframe
              key={`${activeStream}-${playerKey}`}
              src={activeStream}
              title={episode.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              className="w-full h-full border-0"
            />
          )
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3">
            <Film className="w-12 h-12 text-slate-600" />
            <p className="text-sm text-text-secondary">
              Pilih salah satu server atau kualitas di bawah untuk mulai menonton.
            </p>
          </div>
        )}
      </div>

      {/* External Player link fallback & errors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {switchError ? (
          <span className="text-rose-400 flex items-center gap-1 font-semibold">
            <AlertCircle className="w-3.5 h-3.5" />
            {switchError}
          </span>
        ) : (
          <span className="text-text-muted flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-accent-soft shrink-0" />
            Pilih resolusi dan server di bawah (1080p, 720p HD, 480p SD, 360p).
          </span>
        )}

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => setPlayerKey((k) => k + 1)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface hover:bg-surface-elevated text-slate-300 hover:text-white border border-white/10 transition-colors"
            title="Muat ulang pemutar jika terjadi error buffer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-accent-soft" />
            Reload Player
          </button>

          {activeStream && (
            <a
              href={activeStream}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface hover:bg-surface-elevated text-slate-300 hover:text-accent-primary border border-white/10 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Buka Tab Baru
            </a>
          )}
        </div>
      </div>

      {/* Server & Quality Selection Bar */}
      {filteredServers && filteredServers.length > 0 && (
        <div className="p-5 rounded-2xl bg-surface border border-white/10 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-white/5 pb-3">
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-heading">
              <Server className="w-4 h-4 text-accent-primary" />
              Pilihan Kualitas & Server Streaming
            </h3>
            <span className="text-[11px] text-text-muted">
              Klik server untuk berganti kualitas secara langsung
            </span>
          </div>

          <div className="space-y-3">
            {filteredServers.map((q) => (
              <div
                key={q.quality}
                className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-2.5 rounded-xl bg-surface-elevated/70 border border-white/5"
              >
                <div className="sm:w-28 shrink-0">
                  <span className="px-2.5 py-1 rounded-lg bg-accent-primary/15 border border-accent-primary/30 text-accent-soft text-xs font-bold uppercase tracking-wider">
                    {q.quality}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {q.serverList.map((srv) => {
                    const isSelected = activeServerId === srv.serverId;
                    return (
                      <button
                        key={srv.serverId}
                        disabled={switchingServer}
                        onClick={() => handleSelectServer(srv.serverId, `${q.quality} - ${srv.title}`)}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          isSelected
                            ? 'bg-accent-primary text-white border-accent-soft shadow-md shadow-accent-primary/25'
                            : 'bg-surface hover:bg-surface-elevated text-slate-200 hover:text-white border-white/5'
                        }`}
                      >
                        {isSelected ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        ) : (
                          <Play className="w-3 h-3 fill-current text-accent-soft" />
                        )}
                        {srv.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visual Episode Drawer / Grid below Player */}
      {animeDetail?.episodeList && animeDetail.episodeList.length > 0 && (
        <div className="p-5 rounded-2xl bg-surface border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-heading">
              <Layers className="w-4 h-4 text-accent-primary" />
              Navigasi Episode Lainnya ({animeDetail.episodeList.length} Episode)
            </h3>
            <span className="text-[11px] text-text-muted">Klik untuk langsung menonton</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
            {sortedEpisodes.map((ep) => {
              const isCurrent = ep.episodeId === episodeId;
              const isWatched = watchedEpisodeSlugs.has(ep.episodeId);
              const displayName = formatEpisodeName(ep.title, ep.episodeId);

              return (
                <Link
                  key={ep.episodeId}
                  to={`/anime/watch/${provider}/${ep.episodeId}`}
                  className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all border ${
                    isCurrent
                      ? 'bg-accent-primary text-white border-accent-soft shadow-md shadow-accent-primary/25'
                      : isWatched
                      ? 'bg-surface-elevated/40 border-white/5 text-slate-400 hover:text-white hover:border-accent-primary/30'
                      : 'bg-surface-elevated hover:bg-surface text-slate-200 hover:text-white border-white/5 hover:border-accent-primary/40'
                  }`}
                >
                  <span className="truncate pr-1">{displayName}</span>
                  {isCurrent ? (
                    <Play className="w-3 h-3 fill-current text-white shrink-0" />
                  ) : isWatched ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  ) : null}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Download Mirrors Section */}
      {episode.downloads && episode.downloads.length > 0 && (
        <div className="p-5 rounded-2xl bg-surface border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-heading">
              <Download className="w-4 h-4 text-emerald-400" />
              Link Unduhan Episode
            </h3>
            <span className="text-[11px] text-text-muted">Tersedia beragam resolusi dan format</span>
          </div>

          <div className="space-y-3">
            {episode.downloads.map((d, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-2.5 rounded-xl bg-surface-elevated/70 border border-white/5"
              >
                <div className="sm:w-36 shrink-0">
                  <span className="font-bold text-slate-200 text-xs">
                    {d.quality} {d.size ? `(${d.size})` : ''}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {d.urls.map((u, i) => (
                    <a
                      key={i}
                      href={u.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 rounded-lg bg-surface hover:bg-emerald-600/20 text-slate-300 hover:text-emerald-400 text-xs font-semibold border border-white/5 transition-colors"
                    >
                      {u.title}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rekomendasi Terkait Sesuai Genre Anime */}
      {relatedAnimeList.length > 0 && (
        <div className="p-5 rounded-2xl bg-surface border border-white/10 shadow-xl space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  REKOMENDASI GENRE
                </span>
                {primaryGenre && (
                  <span className="text-xs text-text-muted capitalize">
                    Genre: <strong className="text-amber-400">{primaryGenre.title}</strong>
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 font-heading">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Rekomendasi Anime Terkait Lainnya</span>
              </h3>
            </div>

            {primaryGenre && (
              <Link
                to={`/anime?tab=genres&genre=${encodeURIComponent(primaryGenre.id)}`}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 self-start sm:self-auto"
              >
                <span>Lihat Koleksi Genre {primaryGenre.title}</span>
                <span aria-hidden="true">→</span>
              </Link>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {relatedAnimeList.map((item) => (
              <AnimeGridCard key={item.id} anime={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
