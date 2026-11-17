import React, { useState } from 'react';
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
} from 'lucide-react';
import {
  getOtakudesuEpisode,
  getSamehadakuEpisode,
  getAnimeServerUrl,
} from '../services/animeApi';

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

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-400 font-semibold">Memuat episode anime...</p>
      </div>
    );
  }

  if (error || !episode) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Gagal Memuat Episode</h2>
        <p className="text-xs text-slate-400">
          {(error as any)?.message || 'Server episode sedang tidak merespon.'}
        </p>
        <Link
          to="/anime"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Anime Hub
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Header & Episode Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to={episode.animeId ? `/anime/detail/${provider}/${episode.animeId}` : '/anime'}
            className="p-2 rounded-xl bg-card hover:bg-slate-800 text-slate-300 hover:text-white border border-white/5 shrink-0"
            title="Kembali ke Detail Anime"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-white truncate">
              {episode.title}
            </h1>
            <p className="text-[11px] text-amber-400 font-semibold">
              Server Provider: {(provider || 'otakudesu').toUpperCase()}
            </p>
          </div>
        </div>

        {/* Previous & Next Episode Navigation */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            onClick={() => {
              setCustomStreamUrl('');
              setActiveServerId('');
              if (episode.prevEpisodeId) {
                navigate(`/anime/watch/${provider}/${episode.prevEpisodeId}`);
              }
            }}
            disabled={!episode.hasPrev || !episode.prevEpisodeId}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-card hover:bg-slate-800 disabled:opacity-30 text-white text-xs font-semibold border border-white/5"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev Ep
          </button>

          <button
            onClick={() => {
              setCustomStreamUrl('');
              setActiveServerId('');
              if (episode.nextEpisodeId) {
                navigate(`/anime/watch/${provider}/${episode.nextEpisodeId}`);
              }
            }}
            disabled={!episode.hasNext || !episode.nextEpisodeId}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-30 text-black text-xs font-bold"
          >
            Next Ep
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Video Player Frame */}
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl">
        {switchingServer && (
          <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-2">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            <p className="text-xs text-slate-300 font-medium">Beralih server video...</p>
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
            <p className="text-sm text-slate-400">
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
          <span className="text-slate-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            Tips: Gunakan tombol kualitas di bawah: 1080p Mega, 720p HD, 480p SD, atau 360p Blogspot.
          </span>
        )}

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => setPlayerKey((k) => k + 1)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card hover:bg-slate-800 text-slate-300 hover:text-white border border-white/5 transition-colors"
            title="Muat ulang pemutar jika terjadi error buffer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            Reload Player
          </button>

          {activeStream && (
            <a
              href={activeStream}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-white/5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Buka Tab Baru
            </a>
          )}
        </div>
      </div>

      {/* Server & Quality Selection Bar (Otakudesu & Samehadaku) */}
      {episode.servers && episode.servers.length > 0 && (
        <div className="p-5 rounded-2xl bg-card border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Server className="w-4 h-4 text-amber-400" />
              Pilihan Kualitas & Server Pemutar (1080p Mega, 720p HD, 480p SD, 360p Blogspot)
            </h3>
            <span className="text-[11px] text-slate-400">
              Klik server untuk langsung berganti kualitas video
            </span>
          </div>

          <div className="space-y-3">
            {episode.servers.map((q) => (
              <div
                key={q.quality}
                className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-2.5 rounded-xl bg-surface/70 border border-white/5"
              >
                <div className="sm:w-28 shrink-0">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
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
                            ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20'
                            : 'bg-card hover:bg-slate-800 text-slate-200 hover:text-white border-white/5'
                        }`}
                      >
                        {isSelected ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                        ) : (
                          <Play className="w-3 h-3 fill-current text-amber-400" />
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

      {/* Download Mirrors Section */}
      {episode.downloads && episode.downloads.length > 0 && (
        <div className="p-5 rounded-2xl bg-card border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-400" />
              Link Download Episode ({(provider || 'otakudesu').toUpperCase()})
            </h3>
            <span className="text-[11px] text-slate-400">Tersedia beragam resolusi dan format</span>
          </div>

          <div className="space-y-3">
            {episode.downloads.map((d, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-2.5 rounded-xl bg-surface/70 border border-white/5"
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
                      className="px-3 py-1 rounded-lg bg-card hover:bg-emerald-600/20 text-slate-300 hover:text-emerald-400 text-xs font-semibold border border-white/5 transition-colors"
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
