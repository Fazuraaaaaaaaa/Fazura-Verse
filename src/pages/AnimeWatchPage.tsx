import React, { useState, useEffect, useMemo } from 'react';
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
  getOtakudesuDetail,
  getSamehadakuDetail,
  getAnimeServerUrl,
} from '../services/animeApi';
import { useCategoryBookmarks, useCategoryHistory } from '../services/categoryStorage';

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
    provider: 'samehadaku' | 'otakudesu';
    episodeId: string;
  }>();
  const navigate = useNavigate();

  const isSame = provider === 'samehadaku';

  const { data: episode, isLoading, error } = useQuery({
    queryKey: ['anime', 'episode', provider, episodeId],
    queryFn: () =>
      isSame
        ? getSamehadakuEpisode(episodeId || '')
        : getOtakudesuEpisode(episodeId || ''),
    enabled: Boolean(episodeId),
  });

  const [customStreamUrl, setCustomStreamUrl] = useState<string>('');
  const [activeServerId, setActiveServerId] = useState<string>('');
  const [switchingServer, setSwitchingServer] = useState<boolean>(false);
  const [switchError, setSwitchError] = useState<string>('');
  const [playerKey, setPlayerKey] = useState<number>(0);

  const { recordHistory, history } = useCategoryHistory('anime');
  const animeId = episode?.animeId || (episodeId ? episodeId.split('-episode-')[0] : '');

  // Query anime detail to get full episode list for quick navigation & drawer
  const { data: animeDetail } = useQuery({
    queryKey: ['anime', 'detail', provider, animeId],
    queryFn: () => (isSame ? getSamehadakuDetail(animeId) : getOtakudesuDetail(animeId)),
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
  }, [episodeId]);

  const activeStream = customStreamUrl || episode?.streamUrl || '';

  const handleSelectServer = async (serverId: string, serverTitle: string) => {
    try {
      setSwitchingServer(true);
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
      setSwitchError(`Gagal memuat server ${serverTitle}. Silakan coba server lain.`);
    } finally {
      setSwitchingServer(false);
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
                {animeDetail.episodeList.map((ep) => (
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
            <p className="text-xs text-text-primary font-medium">Beralih server video...</p>
          </div>
        )}

        {activeStream ? (
          <iframe
            key={`${activeStream}-${playerKey}`}
            src={activeStream}
            title={episode.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            className="w-full h-full border-0"
          />
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
            {animeDetail.episodeList.map((ep) => {
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
    </div>
  );
}
