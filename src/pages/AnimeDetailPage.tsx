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
import { getOtakudesuDetail, getSamehadakuDetail, getOtakudesuByGenre } from '../services/animeApi';
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

export function AnimeDetailPage() {
  const { provider, id } = useParams<{ provider: 'samehadaku' | 'otakudesu'; id: string }>();
  const [searchEpisode, setSearchEpisode] = useState('');
  // Urutan default: Episode 1 paling atas (Ascending)
  const [sortDescending, setSortDescending] = useState(false);
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const isSame = provider === 'samehadaku';

  const { isBookmarked, toggleBookmark } = useCategoryBookmarks('anime');
  const bookmarked = id ? isBookmarked(id) : false;

  const { history } = useCategoryHistory('anime');

  const { data: anime, isLoading, error } = useQuery({
    queryKey: ['anime', 'detail', provider, id],
    queryFn: () => (isSame ? getSamehadakuDetail(id || '') : getOtakudesuDetail(id || '')),
    enabled: Boolean(id),
  });

  // Query Rekomendasi Terkait sesuai Genre Anime
  const primaryGenre = useMemo(() => {
    if (!anime?.genres || anime.genres.length === 0) return null;
    const first = anime.genres[0];
    const genreId = first.id || first.title.toLowerCase().replace(/\s+/g, '-');
    return {
      id: genreId,
      title: first.title,
    };
  }, [anime?.genres]);

  const { data: relatedAnimeData } = useQuery({
    queryKey: ['anime', 'related', primaryGenre?.id],
    queryFn: () => getOtakudesuByGenre(primaryGenre?.id || ''),
    enabled: Boolean(primaryGenre?.id),
  });

  const relatedAnimeList = useMemo(() => {
    if (!relatedAnimeData?.animeList) return [];
    return relatedAnimeData.animeList
      .filter((item) => item.id !== id && !item.id.includes(id || ''))
      .slice(0, 12);
  }, [relatedAnimeData?.animeList, id]);

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
        <div className="h-96 rounded-3xl bg-surface border border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skeleton-shimmer" />
        </div>
        {/* Episode list skeleton */}
        <div className="h-64 rounded-3xl bg-surface border border-white/5" />
      </div>
    );
  }

  if (error || !anime) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20 shadow-lg shadow-rose-500/10">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-white font-heading">Detail Anime Tidak Ditemukan</h2>
          <p className="text-xs text-text-secondary">
            {(error as any)?.message || 'Anime ini mungkin tidak tersedia di provider yang dipilih.'}
          </p>
        </div>
        <Link
          to="/anime"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-primary hover:bg-accent-primary/90 text-white font-bold text-xs shadow-lg shadow-accent-primary/20 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Anime Hub
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-10 min-w-0">
      {/* Cinematic Hero Backdrop */}
      <div className="relative rounded-3xl overflow-hidden bg-surface border border-white/10 shadow-2xl">
        {/* Ambient Blurred Backdrop */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img
            src={anime.poster}
            alt={anime.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover filter blur-3xl scale-125 opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-surface/90 to-surface/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/90 via-transparent to-bg-primary/90" />
        </div>

        <div className="relative z-10 p-6 sm:p-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Elevated Poster with Floating Badges */}
          <div className="relative group w-48 sm:w-60 aspect-[3/4] rounded-2xl overflow-hidden shrink-0 shadow-2xl border-2 border-white/10 bg-surface-elevated">
            <img
              src={anime.poster}
              alt={anime.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Top Score Badge */}
            {anime.score && (
              <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#090912]/85 backdrop-blur-md text-amber-300 text-xs font-black border border-white/10 shadow-lg">
                <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                {anime.score}
              </div>
            )}
            {/* Status floating pill */}
            {anime.status && (
              <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#090912]/85 backdrop-blur-md text-emerald-400 text-[11px] font-bold border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {anime.status}
              </div>
            )}
          </div>

          {/* Details & Metadata Grid */}
          <div className="flex-1 space-y-4 text-center md:text-left min-w-0">
            {/* Chips Header */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-accent-primary/15 text-accent-soft border border-accent-primary/30 flex items-center gap-1.5">
                <Tv className="w-3.5 h-3.5 text-accent-primary" />
                Server: {(provider || 'samehadaku').toUpperCase()}
              </span>
              {anime.type && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-surface-elevated text-slate-300 border border-white/8">
                  {anime.type}
                </span>
              )}
              {anime.duration && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-surface-elevated text-slate-300 border border-white/8">
                  <Clock className="w-3 h-3 text-accent-soft" />
                  {anime.duration}
                </span>
              )}
              {anime.episodeList && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-surface-elevated text-slate-300 border border-white/8">
                  <Layers className="w-3 h-3 text-accent-primary" />
                  {anime.episodeList.length} Episode
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white font-heading tracking-tight leading-tight">
              {anime.title}
            </h1>

            {anime.japanese && (
              <p className="text-xs sm:text-sm text-text-secondary font-medium tracking-wide">
                {anime.japanese}
              </p>
            )}

            {/* Genres */}
            {anime.genres && anime.genres.length > 0 && (
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 pt-1">
                {anime.genres.map((g) => (
                  <span
                    key={g.id}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-surface-elevated/90 hover:bg-accent-primary/20 text-text-secondary hover:text-white border border-white/5 hover:border-accent-primary/30 transition-all"
                  >
                    <Tag className="w-3 h-3 text-accent-soft" />
                    {g.title}
                  </span>
                ))}
              </div>
            )}

            {/* Synopsis */}
            {anime.synopsis && (
              <div className="pt-2 text-left">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-accent-soft" />
                  Sinopsis
                </h3>
                <p
                  className={`text-xs sm:text-sm text-slate-300 leading-relaxed ${
                    !synopsisExpanded ? 'line-clamp-3' : ''
                  }`}
                >
                  {anime.synopsis}
                </p>
                {anime.synopsis.length > 200 && (
                  <button
                    onClick={() => setSynopsisExpanded(!synopsisExpanded)}
                    className="mt-1 text-xs font-bold text-accent-primary hover:text-accent-secondary transition-colors"
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
                  className="flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-accent-primary hover:bg-accent-primary/90 text-white font-black text-xs sm:text-sm shadow-lg shadow-accent-primary/25 transition-all transform hover:scale-[1.02] text-center"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Lanjutkan {lastWatchedItem.lastItemTitle || 'Episode'}
                </Link>
              ) : firstEpisode ? (
                <Link
                  to={`/anime/watch/${provider || 'otakudesu'}/${firstEpisode.episodeId}`}
                  className="flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-accent-primary hover:bg-accent-primary/90 text-white font-black text-xs sm:text-sm shadow-lg shadow-accent-primary/25 transition-all transform hover:scale-[1.02] text-center"
                >
                  <Play className="w-4 h-4 fill-white" />
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
                className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all border ${
                  bookmarked
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-sm'
                    : 'bg-surface-elevated hover:bg-surface text-slate-300 hover:text-white border-white/10'
                }`}
              >
                {bookmarked ? (
                  <>
                    <BookmarkCheck className="w-4 h-4 text-rose-400" />
                    Tersimpan di Favorit
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4 text-slate-400" />
                    Simpan ke Favorit
                  </>
                )}
              </button>

              {/* Share Button */}
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-surface-elevated hover:bg-surface text-slate-300 hover:text-white text-xs font-semibold border border-white/10 transition-colors"
                title="Salin Tautan Anime"
              >
                <Share2 className="w-4 h-4" />
                {copiedLink ? 'Tersalin!' : 'Bagikan'}
              </button>

              {/* Back to Hub */}
              <Link
                to="/anime"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-surface-elevated hover:bg-surface text-slate-300 hover:text-white text-xs font-semibold border border-white/10 text-center transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Hub
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Episode Directory */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-heading flex items-center gap-2">
              <Film className="w-5 h-5 text-accent-primary" />
              Daftar Episode
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              {anime.episodeList?.length || 0} episode tersedia untuk streaming HD
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Episode Search Bar */}
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari episode..."
                value={searchEpisode}
                onChange={(e) => setSearchEpisode(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs bg-surface border border-white/10 rounded-xl text-white placeholder-text-muted focus:outline-none focus:border-accent-primary transition-colors"
              />
            </div>

            {/* Sort Toggle */}
            <button
              onClick={() => setSortDescending(!sortDescending)}
              title={sortDescending ? 'Beralih: Urutkan Episode 1 Pertama' : 'Beralih: Urutkan Episode Terbaru Pertama'}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface hover:bg-surface-elevated text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition-colors shrink-0"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-accent-soft" />
              <span>{sortDescending ? 'Eps Terbaru' : 'Eps 1 Teratas'}</span>
            </button>
          </div>
        </div>

        {filteredEpisodes.length === 0 ? (
          <div className="p-10 text-center rounded-2xl bg-surface/50 border border-white/5 text-sm text-text-secondary">
            Tidak ada episode yang cocok dengan pencarian "{searchEpisode}".
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[620px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredEpisodes.map((ep) => {
              const displayName = formatEpisodeName(ep.title, ep.episodeId);
              const isWatched = watchedEpisodeMap.has(ep.episodeId);

              return (
                <Link
                  key={ep.episodeId}
                  to={`/anime/watch/${provider || 'otakudesu'}/${ep.episodeId}`}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all group ${
                    isWatched
                      ? 'bg-surface/50 border-white/5 hover:border-accent-primary/40 opacity-80 hover:opacity-100'
                      : 'bg-surface hover:bg-surface-elevated border-white/10 hover:border-accent-primary/50 hover:shadow-lg hover:shadow-accent-primary/10'
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-accent-primary truncate transition-colors">
                      {displayName}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {ep.date && (
                        <p className="text-[10px] text-text-muted">{ep.date}</p>
                      )}
                      {isWatched && (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3 h-3" /> Ditonton
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isWatched
                        ? 'bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black'
                        : 'bg-accent-primary/15 text-accent-soft group-hover:bg-accent-primary group-hover:text-white'
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

      {/* Rekomendasi Terkait Sesuai Genre Anime */}
      {relatedAnimeList.length > 0 && (
        <section className="space-y-4 pt-6 border-t border-white/5 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
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
              <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 font-heading">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>Rekomendasi Anime Terkait</span>
              </h2>
              <p className="text-xs text-text-secondary">
                Anime populer lainnya dengan genre yang serupa untuk menemani tontonan Anda
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
              <AnimeGridCard key={item.id} anime={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
