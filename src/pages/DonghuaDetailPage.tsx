import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Tv,
  Play,
  Star,
  Users,
  Calendar,
  Clock,
  Search,
  ArrowUpDown,
  Tag,
  ArrowLeft,
  AlertCircle,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';
import { getDonghuaDetail } from '../services/donghuaApi';
import { useCategoryBookmarks } from '../services/categoryStorage';
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

export function DonghuaDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchEpisode, setSearchEpisode] = useState('');
  const [sortDescending, setSortDescending] = useState(true);
  const [imgError, setImgError] = useState(false);

  const { isBookmarked, toggleBookmark } = useCategoryBookmarks('donghua');
  const bookmarked = slug ? isBookmarked(slug) : false;

  const fallbackPoster =
    "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22200%22%20height%3D%22300%22%20viewBox%3D%220%200%20200%20300%22%3E%3Crect%20fill%3D%22%230f172a%22%20width%3D%22200%22%20height%3D%22300%22%2F%3E%3Ctext%20fill%3D%22%2310b981%22%20font-family%3D%22sans-serif%22%20font-size%3D%2214%22%20dy%3D%2210.5%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%3EDONGHUA%3C%2Ftext%3E%3C%2Fsvg%3E";

  const { data: donghua, isLoading, error } = useQuery({
    queryKey: ['donghua', 'detail', slug],
    queryFn: () => getDonghuaDetail(slug || ''),
    enabled: Boolean(slug),
  });

  usePageMeta({
    title: donghua?.title ? `${donghua.title} - Streaming Donghua Sub Indo` : 'Detail Donghua',
    description: donghua?.synopsis?.slice(0, 155) || 'Tonton donghua sub Indo lengkap di FazuraStream.',
    image: donghua?.poster,
    type: 'video.episode',
  });

  const filteredEpisodes = useMemo(() => {
    if (!donghua?.episodesList) return [];
    let list = donghua.episodesList.filter((ep) =>
      ep.episode.toLowerCase().includes(searchEpisode.toLowerCase()) ||
      ep.slug.toLowerCase().includes(searchEpisode.toLowerCase())
    );

    if (!sortDescending) {
      list = [...list].reverse();
    }
    return list;
  }, [donghua?.episodesList, searchEpisode, sortDescending]);

  const firstEpisode = useMemo(() => {
    if (!donghua?.episodesList || donghua.episodesList.length === 0) return null;
    return donghua.episodesList[donghua.episodesList.length - 1]; // bottom-most is usually Ep 1
  }, [donghua?.episodesList]);

  const latestEpisode = useMemo(() => {
    if (!donghua?.episodesList || donghua.episodesList.length === 0) return null;
    return donghua.episodesList[0];
  }, [donghua?.episodesList]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse space-y-8">
        <div className="h-72 bg-card rounded-3xl" />
        <div className="h-64 bg-card rounded-3xl" />
      </div>
    );
  }

  if (error || !donghua) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Gagal Memuat Detail Donghua</h2>
        <p className="text-xs text-slate-400">
          {(error as any)?.message || 'Serial donghua ini sedang tidak dapat diakses.'}
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
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-10 min-w-0">
      {/* Header Backdrop */}
      <div className="relative rounded-2xl overflow-hidden bg-[#191C25] border border-[#343744] p-6 sm:p-10 shadow-dialog">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img
            src={imgError || !donghua.poster ? fallbackPoster : donghua.poster}
            alt={donghua.title}
            className="w-full h-full object-cover filter blur-2xl scale-125 opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#12141B] via-[#191C25]/90 to-[#191C25]/60" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Poster (strict 2:3 ratio) */}
          <div className="relative w-48 sm:w-56 aspect-[2/3] rounded-[12px] overflow-hidden shrink-0 shadow-dialog border border-[#343744] bg-[#232633]">
            <img
              src={imgError || !donghua.poster ? fallbackPoster : donghua.poster}
              alt={donghua.title}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
            />
            {donghua.rating && (
              <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-[8px] bg-[#0B0C10]/85 text-[#F0A15B] text-xs font-bold border border-[#343744]">
                <Star className="w-3.5 h-3.5 fill-[#F0A15B]" />
                {donghua.rating}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 space-y-4 text-center md:text-left min-w-0">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#232633] text-[#67BFD5] border border-[#67BFD5]/35">
                {donghua.type || 'Donghua 3D/2D'}
              </span>
              {donghua.status && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#232633] text-[#67BFD5] border border-[#343744]">
                  {donghua.status}
                </span>
              )}
              {donghua.studio && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#232633] text-[#A2A4B1] border border-[#343744]">
                  Studio: {donghua.studio}
                </span>
              )}
              {donghua.network && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#232633] text-[#A2A4B1] border border-[#343744]">
                  {donghua.network}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold font-heading text-[#F2F0EC] tracking-tight leading-tight">
              {donghua.title}
            </h1>

            {donghua.alterTitle && (
              <p className="text-xs sm:text-sm text-[#A2A4B1] font-medium">
                Judul Alternatif: {donghua.alterTitle}
              </p>
            )}

            {/* Genres */}
            {donghua.genres && donghua.genres.length > 0 && (
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 pt-1">
                {donghua.genres.map((g) => (
                  <span
                    key={g.slug}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-xs font-semibold bg-[#232633] text-[#A2A4B1] border border-[#343744]"
                  >
                    <Tag className="w-3 h-3 text-[#67BFD5]" />
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            {/* Synopsis */}
            <div className="pt-2 text-left">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#747887] mb-1">
                Sinopsis
              </h3>
              <p className="text-sm text-[#A2A4B1] leading-relaxed max-h-36 overflow-y-auto pr-2">
                {donghua.synopsis}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center md:justify-start gap-3 pt-3">
              {latestEpisode && (
                <Link
                  to={`/donghua/watch/${latestEpisode.slug}`}
                  className="flex items-center justify-center gap-2 min-h-[44px] px-6 py-2.5 rounded-[10px] bg-[#F0A15B] hover:bg-[#F6B779] text-[#0B0C10] font-bold text-sm transition-colors text-center"
                >
                  <Play className="w-4 h-4 fill-[#0B0C10]" />
                  Episode Terbaru
                </Link>
              )}
              {firstEpisode && (
                <Link
                  to={`/donghua/watch/${firstEpisode.slug}`}
                  className="flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-[10px] bg-[#232633] hover:bg-[#343744] text-[#F2F0EC] text-xs sm:text-sm font-semibold border border-[#343744] transition-colors text-center"
                >
                  <Play className="w-3.5 h-3.5" />
                  Episode 1
                </Link>
              )}

              <button
                onClick={() =>
                  toggleBookmark({
                    id: slug || '',
                    category: 'donghua',
                    title: donghua.title,
                    cover: donghua.poster,
                    link: `/donghua/detail/${slug}`,
                    subtitle: donghua.genres?.map((g) => g.name).slice(0, 2).join(', ') || donghua.status || 'Donghua 3D',
                    type: 'Donghua 3D',
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

              <Link
                to="/donghua"
                className="flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-[10px] bg-transparent hover:bg-[#232633] text-[#A2A4B1] hover:text-[#F2F0EC] text-xs font-semibold border border-[#343744] transition-colors text-center"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Hub
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Episodes Directory */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-[#343744] pb-4">
          <div className="flex items-start gap-3">
            <span className="w-1 h-6 rounded-full bg-[#67BFD5] mt-1 shrink-0" />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-[#F2F0EC] flex items-center gap-2">
                <Tv className="w-5 h-5 text-[#67BFD5]" />
                Daftar Episode
              </h2>
              <p className="text-xs text-[#747887]">
                {donghua.episodesList?.length || 0} episode tersedia untuk ditonton
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-[#747887] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari nomor/judul episode..."
                value={searchEpisode}
                onChange={(e) => setSearchEpisode(e.target.value)}
                className="w-full h-9 pl-8 pr-3 text-xs bg-[#191C25] border border-[#343744] rounded-[10px] text-[#F2F0EC] placeholder-[#747887] focus:outline-none focus:border-[#67BFD5]"
              />
            </div>

            <button
              onClick={() => setSortDescending(!sortDescending)}
              className="flex items-center gap-1.5 h-9 px-3 rounded-[10px] bg-[#191C25] hover:bg-[#232633] text-[#A2A4B1] hover:text-[#F2F0EC] border border-[#343744] text-xs font-semibold transition-colors shrink-0"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>{sortDescending ? 'Terbaru' : 'Terlama'}</span>
            </button>
          </div>
        </div>

        {filteredEpisodes.length === 0 ? (
          <div className="p-8 text-center rounded-[12px] bg-[#191C25] border border-[#343744] text-sm text-[#A2A4B1]">
            Tidak ada episode yang cocok dengan pencarian Anda.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredEpisodes.map((ep) => {
              const displayName = formatEpisodeName(ep.episode, ep.slug);
              return (
                <Link
                  key={ep.slug}
                  to={`/donghua/watch/${ep.slug}`}
                  className="flex items-center justify-between p-3.5 rounded-[10px] bg-[#191C25] hover:bg-[#232633] border border-[#343744] hover:border-[#67BFD5]/60 transition-colors group"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="text-xs sm:text-sm font-semibold text-[#F2F0EC] group-hover:text-[#67BFD5] truncate">
                      {displayName}
                    </p>
                    {ep.releaseDate && (
                      <p className="text-[11px] text-[#747887] mt-0.5">{ep.releaseDate}</p>
                    )}
                  </div>
                  <div className="w-7 h-7 rounded-[8px] bg-[#232633] text-[#67BFD5] flex items-center justify-center shrink-0 group-hover:bg-[#F0A15B] group-hover:text-[#0B0C10] transition-colors">
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
