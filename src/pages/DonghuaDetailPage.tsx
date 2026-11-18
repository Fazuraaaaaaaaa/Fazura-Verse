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
} from 'lucide-react';
import { getDonghuaDetail } from '../services/donghuaApi';

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

  const fallbackPoster =
    "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22200%22%20height%3D%22300%22%20viewBox%3D%220%200%20200%20300%22%3E%3Crect%20fill%3D%22%230f172a%22%20width%3D%22200%22%20height%3D%22300%22%2F%3E%3Ctext%20fill%3D%22%2310b981%22%20font-family%3D%22sans-serif%22%20font-size%3D%2214%22%20dy%3D%2210.5%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%3EDONGHUA%3C%2Ftext%3E%3C%2Fsvg%3E";

  const { data: donghua, isLoading, error } = useQuery({
    queryKey: ['donghua', 'detail', slug],
    queryFn: () => getDonghuaDetail(slug || ''),
    enabled: Boolean(slug),
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
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-black font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Donghua Hub
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 min-w-0">
      {/* Header Backdrop */}
      <div className="relative rounded-3xl overflow-hidden bg-card border border-white/10 p-6 sm:p-10 shadow-2xl">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img
            src={imgError || !donghua.poster ? fallbackPoster : donghua.poster}
            alt={donghua.title}
            className="w-full h-full object-cover filter blur-3xl scale-125 opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/90 to-card/60" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Poster */}
          <div className="relative w-48 sm:w-60 aspect-[3/4] rounded-2xl overflow-hidden shrink-0 shadow-2xl border-2 border-white/10 bg-slate-900">
            <img
              src={imgError || !donghua.poster ? fallbackPoster : donghua.poster}
              alt={donghua.title}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
            />
            {donghua.rating && (
              <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/80 text-amber-300 text-xs font-bold border border-white/10 shadow">
                <Star className="w-3.5 h-3.5 fill-amber-300" />
                {donghua.rating}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 space-y-4 text-center md:text-left min-w-0">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {donghua.type || 'Donghua 3D/2D'}
              </span>
              {donghua.status && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                  {donghua.status}
                </span>
              )}
              {donghua.studio && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-card text-slate-300 border border-white/5">
                  Studio: {donghua.studio}
                </span>
              )}
              {donghua.network && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-card text-slate-300 border border-white/5">
                  {donghua.network}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              {donghua.title}
            </h1>

            {donghua.alterTitle && (
              <p className="text-xs sm:text-sm text-slate-400 font-medium">
                Chinese: {donghua.alterTitle}
              </p>
            )}

            {/* Genres */}
            {donghua.genres && donghua.genres.length > 0 && (
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 pt-1">
                {donghua.genres.map((g) => (
                  <span
                    key={g.slug}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-surface/80 text-slate-300 border border-white/5"
                  >
                    <Tag className="w-3 h-3 text-emerald-400" />
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            {/* Synopsis */}
            <div className="pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Sinopsis
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed max-h-36 overflow-y-auto pr-2 scrollbar-thin">
                {donghua.synopsis}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center md:justify-start gap-3 pt-3">
              {latestEpisode && (
                <Link
                  to={`/donghua/watch/${latestEpisode.slug}`}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-[1.02] text-center"
                >
                  <Play className="w-4 h-4 fill-black" />
                  Episode Terbaru
                </Link>
              )}
              {firstEpisode && (
                <Link
                  to={`/donghua/watch/${firstEpisode.slug}`}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-card hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-white/10 text-center"
                >
                  <Play className="w-3.5 h-3.5" />
                  Episode 1
                </Link>
              )}
              <Link
                to="/donghua"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-card hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 text-center"
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
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Tv className="w-5 h-5 text-emerald-400" />
              Episode List
            </h2>
            <p className="text-xs text-slate-400">
              {donghua.episodesList?.length || 0} episode tersedia untuk ditonton
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari nomor/judul episode..."
                value={searchEpisode}
                onChange={(e) => setSearchEpisode(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-card border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              onClick={() => setSortDescending(!sortDescending)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>{sortDescending ? 'Terbaru' : 'Terlama'}</span>
            </button>
          </div>
        </div>

        {filteredEpisodes.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-card/40 border border-white/5 text-sm text-slate-400">
            Tidak ada episode yang cocok dengan pencarian Anda.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredEpisodes.map((ep) => {
              const displayName = formatEpisodeName(ep.episode, ep.slug);
              return (
                <Link
                  key={ep.slug}
                  to={`/donghua/watch/${ep.slug}`}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-card hover:bg-slate-800 border border-white/10 hover:border-emerald-500/50 transition-all group"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-emerald-400 truncate">
                      {displayName}
                    </p>
                    {ep.releaseDate && (
                      <p className="text-[10px] text-slate-400 mt-0.5">{ep.releaseDate}</p>
                    )}
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
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
