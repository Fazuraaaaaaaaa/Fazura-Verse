import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Tv,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Server,
  Download,
  ExternalLink,
  AlertCircle,
  Play,
  RefreshCw,
  Info,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';
import { getDonghuaEpisode } from '../services/donghuaApi';
import { useCategoryBookmarks, useCategoryHistory } from '../services/categoryStorage';
import { usePageMeta } from '../hooks/usePageMeta';

export function DonghuaWatchPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: episode, isLoading, error } = useQuery({
    queryKey: ['donghua', 'episode', slug],
    queryFn: () => getDonghuaEpisode(slug || ''),
    enabled: Boolean(slug),
  });

  usePageMeta({
    title: episode?.episode ? `${episode.episode} - Streaming Donghua` : 'Nonton Donghua Sub Indo',
    description: `Streaming ${episode?.episode || 'episode donghua'} subtitle Indonesia HD di FazuraStream.`,
    type: 'video.episode',
  });

  const [selectedServerUrl, setSelectedServerUrl] = useState<string>('');
  const [playerKey, setPlayerKey] = useState<number>(0);

  const { recordHistory } = useCategoryHistory('donghua');
  const { isBookmarked, toggleBookmark } = useCategoryBookmarks('donghua');

  const parentSlug =
    episode?.donghuaDetails?.slug ||
    episode?.navigation?.allEpisodesSlug ||
    slug?.replace(/-episode-\d+.*$/i, '');

  const bookmarked = parentSlug ? isBookmarked(parentSlug) : false;

  useEffect(() => {
    if (episode && slug) {
      recordHistory({
        id: parentSlug || slug,
        category: 'donghua',
        title: episode.donghuaDetails?.title || episode.episode || 'Donghua',
        cover: episode.donghuaDetails?.poster || '',
        lastItemTitle: episode.episode || `Episode ${slug}`,
        lastItemLink: `/donghua/watch/${slug}`,
        watchedAt: Date.now(),
      });
    }
  }, [episode, slug, parentSlug, recordHistory]);

  const currentStream = selectedServerUrl || episode?.mainStreamUrl || '';

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#67BFD5] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-[#A2A4B1] font-semibold">Memuat video player donghua...</p>
      </div>
    );
  }

  if (error || !episode) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold font-heading text-[#F2F0EC]">Gagal Memuat Episode Donghua</h2>
        <p className="text-xs text-[#A2A4B1]">
          {(error as any)?.message || 'Server episode ini sedang offline atau tidak dapat diakses.'}
        </p>
        <Link
          to="/donghua"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#F0A15B] hover:bg-[#F6B779] text-[#0B0C10] font-bold text-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Donghua Hub
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 min-w-0">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#343744] pb-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to={parentSlug ? `/donghua/detail/${parentSlug}` : '/donghua'}
            className="p-2 rounded-[10px] bg-[#191C25] hover:bg-[#232633] text-[#A2A4B1] hover:text-[#F2F0EC] border border-[#343744] shrink-0 transition-colors"
            title="Kembali ke Detail Donghua"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold font-heading text-[#F2F0EC] truncate">
              {episode.episode}
            </h1>
            <p className="text-[11px] text-[#67BFD5] font-semibold">
              Provider: Anichin
            </p>
          </div>
        </div>

        {/* Next / Prev Navigation & Bookmark */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end shrink-0">
          {parentSlug && (
            <button
              onClick={() =>
                toggleBookmark({
                  id: parentSlug,
                  category: 'donghua',
                  title: episode.donghuaDetails?.title || episode.episode || 'Donghua',
                  cover: episode.donghuaDetails?.poster || '',
                  link: `/donghua/detail/${parentSlug}`,
                  subtitle: episode.episode,
                  type: 'Donghua 3D',
                  addedAt: Date.now(),
                })
              }
              title={bookmarked ? 'Hapus Bookmark' : 'Bookmark Donghua'}
              className={`p-2 rounded-[10px] border transition-colors text-xs font-semibold flex items-center gap-1.5 ${
                bookmarked
                  ? 'bg-[#232633] text-[#F0A15B] border-[#F0A15B]'
                  : 'bg-[#191C25] hover:bg-[#232633] text-[#A2A4B1] hover:text-[#F2F0EC] border-[#343744]'
              }`}
            >
              {bookmarked ? (
                <BookmarkCheck className="w-4 h-4 text-[#F0A15B]" />
              ) : (
                <Bookmark className="w-4 h-4 text-[#A2A4B1]" />
              )}
              <span className="hidden md:inline">{bookmarked ? 'Tersimpan' : 'Bookmark'}</span>
            </button>
          )}

          <button
            onClick={() =>
              episode.navigation.prevSlug &&
              navigate(`/donghua/watch/${episode.navigation.prevSlug}`)
            }
            disabled={!episode.navigation.prevSlug}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-2 rounded-[10px] bg-[#191C25] hover:bg-[#232633] disabled:opacity-35 text-[#F2F0EC] text-xs font-semibold border border-[#343744] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev Ep
          </button>

          <button
            onClick={() =>
              episode.navigation.nextSlug &&
              navigate(`/donghua/watch/${episode.navigation.nextSlug}`)
            }
            disabled={!episode.navigation.nextSlug}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3.5 py-2 rounded-[10px] bg-[#F0A15B] hover:bg-[#F6B779] disabled:opacity-35 text-[#0B0C10] text-xs font-bold transition-colors"
          >
            Next Ep
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Video Player Frame */}
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl">
        {currentStream ? (
          <iframe
            key={`${currentStream}-${playerKey}`}
            src={currentStream}
            title={episode.episode}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            className="w-full h-full border-0"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3">
            <Tv className="w-12 h-12 text-slate-600" />
            <p className="text-sm text-slate-400">
              Tidak ada stream default langsung. Silakan pilih salah satu server di bawah ini.
            </p>
          </div>
        )}
      </div>

      {/* External Player link fallback & Player Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <span className="text-slate-400 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          Tips: Jika video buffering, pilih server alternatif di bawah (Rumble, OK.ru, D-Tube, dll).
        </span>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => setPlayerKey((k) => k + 1)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-[#191C25] hover:bg-[#232633] text-[#A2A4B1] hover:text-[#F2F0EC] border border-[#343744] transition-colors"
            title="Muat ulang pemutar jika terjadi error buffer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            Reload Player
          </button>

          {currentStream && (
            <a
              href={currentStream}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-[#191C25] hover:bg-[#232633] text-[#A2A4B1] hover:text-[#67BFD5] border border-[#343744] transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Buka Tab Baru
            </a>
          )}
        </div>
      </div>

      {/* Streaming Server Switcher */}
      {episode.servers && episode.servers.length > 0 && (
        <div className="p-4 rounded-[12px] bg-[#191C25] border border-[#343744] space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-400" />
            Pilih Server Pemutar Video
          </h3>
          <div className="flex flex-wrap gap-2">
            {episode.servers.map((srv, idx) => {
              const isSelected = currentStream === srv.url;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedServerUrl(srv.url)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    isSelected
                      ? 'bg-[#F0A15B] text-[#0B0C10] border-[#F0A15B]'
                      : 'bg-[#191C25] hover:bg-[#232633] text-[#A2A4B1] hover:text-[#F2F0EC] border-[#343744]'
                  }`}
                >
                  <Play className="w-3 h-3 fill-current" />
                  {srv.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Download URLs */}
      {episode.downloads && Object.keys(episode.downloads).length > 0 && (
        <div className="p-4 rounded-[12px] bg-[#191C25] border border-[#343744] space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Download className="w-4 h-4 text-emerald-400" />
            Download Episode Donghua
          </h3>
          <div className="space-y-2">
            {Object.entries(episode.downloads).map(([quality, links]) => (
              <div key={quality} className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs p-2.5 rounded-[10px] bg-[#12141B] border border-[#343744]">
                <span className="font-bold text-slate-300 sm:w-28 uppercase shrink-0">
                  {quality.replace('download_url_', '')}:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {Object.entries(links).map(([host, url]) => (
                    <a
                      key={host}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-[6px] bg-[#191C25] hover:bg-[#232633] text-[#A2A4B1] hover:text-[#67BFD5] border border-[#343744] transition-colors"
                    >
                      {host}
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
