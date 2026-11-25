import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Film,
  Play,
  Star,
  Tv,
  Calendar,
  Clock,
  Search,
  ArrowUpDown,
  Tag,
  ArrowLeft,
  AlertCircle,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Sparkles,
  Share2,
  Layers,
} from 'lucide-react';
import {
  getOtakudesuDetail,
  getSamehadakuDetail,
  getNimegamiDetail,
  getKusonimeDetail,
  getRelatedAnimeRecommendations,
} from '../services/animeApi';
import { useCategoryBookmarks, useCategoryHistory } from '../services/categoryStorage';
import { AnimeGridCard } from '../components/anime/AnimeGridCard';
import { usePageMeta } from '../hooks/usePageMeta';

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

export function AnimeDetailPage() {
  const { provider, id } = useParams<{ provider: 'samehadaku' | 'otakudesu' | 'nimegami' | 'kusonime'; id: string }>();
  const [searchEpisode, setSearchEpisode] = useState('');
  // Urutan default: Episode 1 paling atas (Ascending)
  const [sortDescending, setSortDescending] = useState(false);
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const { isBookmarked, toggleBookmark } = useCategoryBookmarks('anime');
  const bookmarked = id ? isBookmarked(id) : false;

  const { history } = useCategoryHistory('anime');

  const { data: anime, isLoading, error } = useQuery({
    queryKey: ['anime', 'detail', provider, id],
    queryFn: async () => {
      try {
        if (provider === 'nimegami') return await getNimegamiDetail(id || '');
        if (provider === 'kusonime') return await getKusonimeDetail(id || '');
        if (provider === 'samehadaku') return await getSamehadakuDetail(id || '');
        return await getOtakudesuDetail(id || '');
      } catch (err) {
        // Smart fallback: If primary provider returns error, attempt Samehadaku -> Nimegami
        if (provider !== 'samehadaku') {
          try {
            return await getSamehadakuDetail(id || '');
          } catch {}
        }
        if (provider !== 'nimegami') {
          try {
            return await getNimegamiDetail(id || '');
          } catch {}
        }
        throw err;
      }
    },
    enabled: Boolean(id),
  });

  usePageMeta({
    title: anime?.title ? `${anime.title} - Nonton Anime Sub Indo` : 'Detail Anime',
    description: anime?.synopsis?.slice(0, 155) || 'Streaming anime sub Indo kualitas HD di FazuraStream.',
    image: anime?.poster,
    type: 'video.episode',
    jsonLd: anime?.title
      ? {
          '@type': 'TVSeries',
          name: anime.title,
          image: anime.poster,
          description: anime.synopsis?.slice(0, 200),
        }
      : undefined,
  });

  // Query Rekomendasi Terkait (Prioritaskan Seri/Season S1-S3 + Kemiripan Multi-Genre)
  const primaryGenre = useMemo(() => {
    if (!anime?.genres || anime.genres.length === 0) return null;
    const first = anime.genres[0];
    const genreId = first.id || first.title.toLowerCase().replace(/\s+/g, '-');
    return {
      id: genreId,
      title: first.title,
    };
  }, [anime?.genres]);

  const { data: relatedRecommendations } = useQuery({
    queryKey: ['anime', 'related-v2', id, anime?.title, anime?.genres?.map((g) => g.id || g.title).slice(0, 3).join(',')],
    queryFn: () =>
      getRelatedAnimeRecommendations({
        currentId: id || '',
        title: anime?.title || '',
        genres: anime?.genres || [],
      }),
    enabled: Boolean(anime?.title),
    staleTime: 1000 * 60 * 10,
  });

  const relatedAnimeList = relatedRecommendations?.items || [];
  const franchiseCount = relatedRecommendations?.franchiseCount || 0;

  // Track watched episodes
  const watchedEpisodeMap = useMemo(() => {
    const map = new Map<string, string>(); // episodeId -> watched date/title
    history.forEach((h) => {
      if (h.lastItemLink) {
        const parts = h.lastItemLink.split('/');
        const epSlug = parts[parts.length - 1];
        if (epSlug) {
          map.set(epSlug, h.lastItemTitle || 'Ditonton');
        }
      }
    });
    return map;
  }, [history]);

  // Last watched episode for this anime (if any)
  const lastWatchedItem = useMemo(() => {
    return history.find(
      (h) => h.id === id || (h.lastItemLink && h.lastItemLink.includes(id || ''))
    );
  }, [history, id]);

  const filteredEpisodes = useMemo(() => {
    if (!anime?.episodeList) return [];
    let list = anime.episodeList.filter(
      (ep) =>
        String(ep.title).toLowerCase().includes(searchEpisode.toLowerCase()) ||
        ep.episodeId.toLowerCase().includes(searchEpisode.toLowerCase())
    );

    if (!sortDescending) {
      list = [...list].reverse();
    }
    return list;
  }, [anime?.episodeList, searchEpisode, sortDescending]);

  const firstEpisode = useMemo(() => {
    if (!anime?.episodeList || anime.episodeList.length === 0) return null;
    return anime.episodeList[anime.episodeList.length - 1]; // bottom is typically Episode 1
  }, [anime?.episodeList]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
        {/* Banner skeleton */}
        <div className="h-96 rounded-2xl bg-[#191C25] border border-[#343744] relative overflow-hidden">
          <div className="absolute inset-0 skeleton-shimmer" />
        </div>
        {/* Episode list skeleton */}
        <div className="h-64 rounded-2xl bg-[#191C25] border border-[#343744]" />
      </div>
    );
  }

  if (error || !anime) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-[#F2F0EC] font-heading">Detail Anime Tidak Ditemukan</h2>
          <p className="text-xs text-[#A2A4B1]">
            {(error as any)?.message || 'Anime ini mungkin tidak tersedia di provider yang dipilih.'}
          </p>
        </div>
        <Link
          to="/anime"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#F0A15B] hover:bg-[#F6B779] text-[#0B0C10] font-bold text-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Anime Hub
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-10 min-w-0">
      {/* Cinematic Hero Backdrop */}
      <div className="relative rounded-2xl overflow-hidden bg-[#191C25] border border-[#343744] shadow-dialog">
        {/* Ambient Blurred Backdrop */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img
            src={anime.poster}
            alt={anime.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover filter blur-2xl scale-125 opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#12141B] via-[#191C25]/90 to-[#191C25]/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#12141B]/90 via-transparent to-[#12141B]/90" />
        </div>

        <div className="relative z-10 p-6 sm:p-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Elevated Poster (strict 2:3 ratio) */}
          <div className="relative group w-48 sm:w-56 aspect-[2/3] rounded-[12px] overflow-hidden shrink-0 shadow-dialog border border-[#343744] bg-[#232633]">
            <img
              src={anime.poster}
              alt={anime.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Top Score Badge */}
            {anime.score && (
              <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-[#0B0C10]/85 text-[#F0A15B] text-xs font-bold border border-[#343744]">
                <Star className="w-3.5 h-3.5 fill-[#F0A15B] text-[#F0A15B]" />
                {anime.score}
              </div>
            )}
            {/* Status floating pill */}
            {anime.status && (
              <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-[6px] bg-[#0B0C10]/85 text-[#75C9A0] text-[11px] font-semibold border border-[#343744]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#75C9A0]" />
                {anime.status}
              </div>
            )}
          </div>

          {/* Details & Metadata Grid */}
          <div className="flex-1 space-y-4 text-center md:text-left min-w-0">
            {/* Chips Header */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 bg-[#232633] text-[#A78BFA] border border-[#A78BFA]/35">
                <Tv className="w-3.5 h-3.5" />
                Server: {provider === 'nimegami' ? 'NIMEGAMI (KLASIK)' : provider === 'kusonime' ? 'KUSONIME' : (provider || 'samehadaku').toUpperCase()}
              </span>
              {anime.type && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#232633] text-[#A2A4B1] border border-[#343744]">
                  {anime.type}
                </span>
              )}
              {anime.duration && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#232633] text-[#A2A4B1] border border-[#343744]">
                  <Clock className="w-3 h-3 text-[#A78BFA]" />
                  {anime.duration}
                </span>
              )}
              {anime.episodeList && anime.episodeList.length > 0 && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#232633] text-[#A2A4B1] border border-[#343744]">
                  <Layers className="w-3 h-3 text-[#A78BFA]" />
                  {anime.episodeList.length} Episode
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-[#F2F0EC] font-heading tracking-tight leading-tight">
              {anime.title}
            </h1>

            {anime.japanese && (
              <p className="text-xs sm:text-sm text-[#A2A4B1] font-medium tracking-wide">
                {anime.japanese}
              </p>
            )}

            {/* Genres */}
            {anime.genres && anime.genres.length > 0 && (
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 pt-1">
                {anime.genres.map((g) => (
                  <span
                    key={g.id}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-xs font-semibold bg-[#232633] text-[#A2A4B1] border border-[#343744]"
                  >
                    <Tag className="w-3 h-3 text-[#A78BFA]" />
                    {g.title}
                  </span>
                ))}
              </div>
            )}

            {/* Synopsis */}
            {anime.synopsis && (
              <div className="pt-2 text-left">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#747887] mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#A78BFA]" />
                  Sinopsis
                </h3>
                <p
                  className={`text-xs sm:text-sm text-[#A2A4B1] leading-relaxed ${
                    !synopsisExpanded ? 'line-clamp-3' : ''
                  }`}
                >
                  {anime.synopsis}
                </p>
                {anime.synopsis.length > 200 && (
                  <button
                    onClick={() => setSynopsisExpanded(!synopsisExpanded)}
                    className="mt-1 text-xs font-semibold text-[#F0A15B] hover:text-[#F6B779] transition-colors"
                  >
                    {synopsisExpanded ? 'Tampilkan Lebih Sedikit' : 'Baca Selengkapnya...'}
                  </button>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center md:justify-start gap-3 pt-3">
              {/* Play Button (Continue or First Episode) */}
              {lastWatchedItem ? (
                <Link
                  to={lastWatchedItem.lastItemLink}
                  className="flex items-center justify-center gap-2 min-h-[44px] px-6 py-2.5 rounded-[10px] bg-[#F0A15B] hover:bg-[#F6B779] text-[#0B0C10] font-bold text-xs sm:text-sm transition-colors text-center"
                >
                  <Play className="w-4 h-4 fill-[#0B0C10]" />
                  Lanjutkan {lastWatchedItem.lastItemTitle || 'Episode'}
                </Link>
              ) : firstEpisode ? (
                <Link
                  to={`/anime/watch/${anime.provider || provider || 'otakudesu'}/${firstEpisode.episodeId}`}
                  className="flex items-center justify-center gap-2 min-h-[44px] px-6 py-2.5 rounded-[10px] bg-[#F0A15B] hover:bg-[#F6B779] text-[#0B0C10] font-bold text-xs sm:text-sm transition-colors text-center"
                >
                  <Play className="w-4 h-4 fill-[#0B0C10]" />
                  Mulai Nonton {formatEpisodeName(firstEpisode.title, firstEpisode.episodeId)}
                </Link>
              ) : null}

              {/* Bookmark Toggle */}
              <button
                onClick={() =>
                  toggleBookmark({
                    id: id || '',
                    category: 'anime',
                    title: anime.title,
                    cover: anime.poster,
                    link: `/anime/detail/${provider || 'otakudesu'}/${id}`,
                    subtitle:
                      anime.genres?.map((g) => g.title).slice(0, 2).join(', ') ||
                      anime.status ||
                      'Anime',
                    type: anime.type || 'Anime',
                    addedAt: Date.now(),
                  })
                }
                className={`flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-[10px] text-xs font-semibold transition-colors border ${
                  bookmarked
                    ? 'bg-[#232633] text-[#F0A15B] border-[#F0A15B]'
                    : 'bg-[#232633] hover:bg-[#343744] text-[#A2A4B1] hover:text-[#F2F0EC] border-[#343744]'
                }`}
              >
                {bookmarked ? (
                  <>
                    <BookmarkCheck className="w-4 h-4 text-[#F0A15B]" />
                    Tersimpan di Favorit
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4 text-[#A2A4B1]" />
                    Simpan ke Favorit
                  </>
                )}
              </button>

              {/* Share Button */}
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-[10px] bg-[#232633] hover:bg-[#343744] text-[#A2A4B1] hover:text-[#F2F0EC] text-xs font-semibold border border-[#343744] transition-colors"
                title="Salin Tautan Anime"
              >
                <Share2 className="w-4 h-4" />
                {copiedLink ? 'Tersalin!' : 'Bagikan'}
              </button>

              {/* Back to Hub */}
              <Link
                to="/anime"
                className="flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-[10px] bg-transparent hover:bg-[#232633] text-[#A2A4B1] hover:text-[#F2F0EC] text-xs font-semibold border border-[#343744] text-center transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Hub
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Episode Directory */}
      {anime.episodeList && anime.episodeList.length > 0 ? (
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-[#343744] pb-4">
          <div className="flex items-start gap-3">
            <span className="w-1 h-6 rounded-full bg-[#A78BFA] mt-1 shrink-0" />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#F2F0EC] font-heading flex items-center gap-2">
                <Film className="w-5 h-5 text-[#A78BFA]" />
                Daftar Episode
              </h2>
              <p className="text-xs text-[#747887] mt-0.5">
                {anime.episodeList?.length || 0} episode tersedia untuk streaming HD
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Episode Search Bar */}
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 text-[#747887] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari episode..."
                value={searchEpisode}
                onChange={(e) => setSearchEpisode(e.target.value)}
                className="w-full h-9 pl-8 pr-3 text-xs bg-[#191C25] border border-[#343744] rounded-[10px] text-[#F2F0EC] placeholder-[#747887] focus:outline-none focus:border-[#A78BFA] transition-colors"
              />
            </div>

            {/* Sort Toggle */}
            <button
              onClick={() => setSortDescending(!sortDescending)}
              title={sortDescending ? 'Beralih: Urutkan Episode 1 Pertama' : 'Beralih: Urutkan Episode Terbaru Pertama'}
              className="flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] bg-[#191C25] hover:bg-[#232633] text-[#A2A4B1] hover:text-[#F2F0EC] border border-[#343744] text-xs font-semibold transition-colors shrink-0"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-[#A78BFA]" />
              <span>{sortDescending ? 'Eps Terbaru' : 'Eps 1 Teratas'}</span>
            </button>
          </div>
        </div>

        {filteredEpisodes.length === 0 ? (
          <div className="p-10 text-center rounded-[12px] bg-[#191C25] border border-[#343744] text-sm text-[#A2A4B1]">
            Tidak ada episode yang cocok dengan pencarian "{searchEpisode}".
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[620px] overflow-y-auto pr-1">
            {filteredEpisodes.map((ep) => {
              const displayName = formatEpisodeName(ep.title, ep.episodeId);
              const isWatched = watchedEpisodeMap.has(ep.episodeId);

              return (
                <Link
                  key={ep.episodeId}
                  to={`/anime/watch/${anime.provider || provider || 'otakudesu'}/${ep.episodeId}`}
                  className={`flex items-center justify-between p-3.5 rounded-[10px] border transition-colors group ${
                    isWatched
                      ? 'bg-[#12141B] border-[#343744] hover:border-[#A78BFA]/50 opacity-85 hover:opacity-100'
                      : 'bg-[#191C25] hover:bg-[#232633] border-[#343744] hover:border-[#A78BFA]/60'
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="text-xs sm:text-sm font-semibold text-[#F2F0EC] group-hover:text-[#A78BFA] truncate transition-colors">
                      {displayName}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {ep.date && (
                        <p className="text-[11px] text-[#747887]">{ep.date}</p>
                      )}
                      {isWatched && (
                        <span className="flex items-center gap-1 text-[10px] text-[#75C9A0] font-semibold">
                          <CheckCircle2 className="w-3 h-3" /> Ditonton
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    className={`w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0 transition-colors ${
                      isWatched
                        ? 'bg-[#232633] text-[#75C9A0] group-hover:bg-[#75C9A0] group-hover:text-[#0B0C10]'
                        : 'bg-[#232633] text-[#A78BFA] group-hover:bg-[#F0A15B] group-hover:text-[#0B0C10]'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
      ) : (
        <section className="p-8 rounded-[12px] bg-[#191C25] border border-[#343744] text-center space-y-3">
          <Film className="w-10 h-10 text-[#747887] mx-auto" />
          <h3 className="text-base font-bold text-[#F2F0EC]">Server Video Streaming Belum Tersedia</h3>
          <p className="text-xs text-[#A2A4B1] max-w-md mx-auto">
            Anime ini saat ini belum memiliki server pemutar video streaming langsung di FazuraStream. Silakan tonton serial anime lainnya yang tersedia di katalog.
          </p>
        </section>
      )}

      {/* Rekomendasi Terkait Sesuai Genre Anime */}
      {relatedAnimeList.length > 0 && (
        <section className="space-y-4 pt-6 border-t border-white/5 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {franchiseCount > 0 ? 'SERI & GENRE TERKAIT' : 'REKOMENDASI GENRE'}
                </span>
                {primaryGenre && (
                  <span className="text-xs text-text-muted capitalize">
                    Genre: <strong className="text-amber-400">{primaryGenre.title}</strong>
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 font-heading">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>Rekomendasi Anime Terkait</span>
              </h2>
              <p className="text-xs text-text-secondary">
                {franchiseCount > 0
                  ? 'Menampilkan musim lanjutan/terkait (Season 1, 2, 3, Movie) di urutan teratas serta anime bergenre serupa'
                  : 'Anime pilihan dengan kecocokan genre dan rating terbaik untuk menemani tontonan Anda'}
              </p>
            </div>

            {primaryGenre && (
              <Link
                to={`/anime?tab=genres&genre=${encodeURIComponent(primaryGenre.id)}`}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 self-start sm:self-auto"
              >
                <span>Lihat Genre {primaryGenre.title} Lainnya</span>
                <span aria-hidden="true">→</span>
              </Link>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {relatedAnimeList.map((item) => (
              <AnimeGridCard
                key={`${item.provider}-${item.id}`}
                anime={item}
                relationBadge={item.relationBadge}
                highlightRelation={item.isSameFranchise}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
