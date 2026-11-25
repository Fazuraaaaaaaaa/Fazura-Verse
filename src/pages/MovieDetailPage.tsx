import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Play,
  Star,
  Clock,
  Calendar,
  Film,
  Tv,
  Users,
  Eye,
  EyeOff,
  Send,
  MessageSquare,
  Sparkles,
  Share2,
  Bookmark,
  Check,
  ChevronRight,
  Layers,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react';
import {
  getMovieDetail,
  getMovieSeasons,
  getMovieEpisodes,
  getMovieComments,
  postMovieComment,
} from '../services/movieApi';
import type { MovieDetail, SeasonItem, EpisodeItem, MovieComment } from '../types/movie';
import { useCategoryBookmarks } from '../services/categoryStorage';
import { usePageMeta } from '../hooks/usePageMeta';

export function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentRating, setCommentRating] = useState<number>(9);
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [revealedSpoilers, setRevealedSpoilers] = useState<Record<string, boolean>>({});
  const [copiedLink, setCopiedLink] = useState(false);

  const { isBookmarked, toggleBookmark } = useCategoryBookmarks('movies');
  const bookmarked = id ? isBookmarked(id) : false;

  // 1. Fetch Movie Detail & Related
  const {
    data: detailResponse,
    isLoading: detailLoading,
    isError: detailError,
  } = useQuery({
    queryKey: ['movieDetail', id],
    queryFn: () => getMovieDetail(id!),
    enabled: Boolean(id),
  });

  const movie = detailResponse?.data;
  const related = detailResponse?.related || [];
  const isTv = movie?.mediaType === 'tv';

  usePageMeta({
    title: movie?.title ? `${movie.title} - Nonton ${isTv ? 'Serial TV' : 'Film'} HD` : 'Detail Film & Serial',
    description: movie?.description?.slice(0, 155) || 'Streaming film box office & serial TV HD di FazuraStream.',
    image: movie?.posterUrl,
    type: 'video.movie',
    jsonLd: movie?.title
      ? {
          '@type': isTv ? 'TVSeries' : 'Movie',
          name: movie.title,
          image: movie.posterUrl,
          datePublished: movie.releaseDate,
          description: movie.description?.slice(0, 200),
        }
      : undefined,
  });

  // 2. Fetch TV Seasons & Episodes if it's a TV show
  const { data: seasons = [] } = useQuery({
    queryKey: ['movieSeasons', id],
    queryFn: () => getMovieSeasons(id!),
    enabled: Boolean(id && isTv),
  });

  const { data: episodes = [] } = useQuery({
    queryKey: ['movieEpisodes', id, selectedSeason],
    queryFn: () => getMovieEpisodes(id!, selectedSeason),
    enabled: Boolean(id && isTv),
  });

  // 3. Fetch Comments
  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ['movieComments', id],
    queryFn: () => getMovieComments(id!),
    enabled: Boolean(id),
  });

  // 4. Post Comment Mutation
  const commentMutation = useMutation({
    mutationFn: (newComment: {
      author: string;
      text: string;
      rating?: number;
      isSpoiler?: boolean;
    }) => postMovieComment(id!, newComment),
    onSuccess: () => {
      setCommentText('');
      queryClient.invalidateQueries({ queryKey: ['movieComments', id] });
    },
  });

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !id) return;
    commentMutation.mutate({
      author: commentAuthor.trim() || 'Penonton Setia',
      text: commentText.trim(),
      rating: commentRating,
      isSpoiler,
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const toggleRevealSpoiler = (commentId: string) => {
    setRevealedSpoilers((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  if (detailLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-4 border-rose-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-400">Memuat detail film...</p>
        </div>
      </div>
    );
  }

  if (detailError || !movie) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card p-6 rounded-2xl border border-white/10 text-center space-y-4">
          <Film className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-white">Film Tidak Ditemukan</h2>
          <p className="text-xs text-slate-400">
            Detail data film atau serial ini gagal diambil dari API. Silakan kembali ke katalog.
          </p>
          <Link
            to="/movies"
            className="inline-block px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors"
          >
            Kembali ke Movie Hub
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Backdrop Header */}
      <div className="relative w-full h-[320px] sm:h-[440px] lg:h-[500px] overflow-hidden bg-slate-950">
        <img
          src={movie.backdropUrl || movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover object-center opacity-30 filter blur-sm scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background/50" />

        {/* Back Link Floating */}
        <div className="absolute top-6 left-4 sm:left-8 z-10">
          <Link
            to="/movies"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card/80 hover:bg-card text-slate-300 hover:text-white text-xs font-semibold backdrop-blur-md border border-white/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Movie Hub
          </Link>
        </div>
      </div>

      {/* Main Detail Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-48 sm:-mt-64 relative z-10 space-y-10">
        {/* Main Info Card (Poster + Details) */}
        <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-start">
          {/* Left Column: HD Poster & Quick Action */}
          <div className="w-48 sm:w-60 md:w-64 lg:w-72 shrink-0 mx-auto md:mx-0">
            <div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-black/80 border-2 border-white/10 bg-card relative group">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3">
                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                    isTv
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-rose-600 text-white shadow-md'
                  }`}
                >
                  {isTv ? 'Serial TV' : 'Bioskop'}
                </span>
              </div>
            </div>

            {/* Main Action Buttons */}
            <div className="mt-4 space-y-2.5">
              <Link
                to={`/movies/watch/${movie.id}${isTv ? `?season=${selectedSeason}&episode=1` : ''}`}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-sm shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                <Play className="w-4 h-4 fill-white" />
                {isTv ? 'Putar Serial TV' : 'Tonton Film Sekarang'}
              </Link>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    toggleBookmark({
                      id: String(movie.id),
                      category: 'movies',
                      title: movie.title,
                      cover: movie.posterUrl || '',
                      link: `/movies/${movie.id}`,
                      subtitle: movie.genres?.slice(0, 2).join(', ') || (movie.mediaType === 'tv' ? 'Serial TV' : 'Film Bioskop'),
                      type: movie.mediaType === 'tv' ? 'Serial TV' : 'Movie',
                      addedAt: Date.now(),
                    })
                  }
                  className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                    bookmarked
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                      : 'bg-card hover:bg-slate-800 text-slate-300 hover:text-white border-white/5'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-rose-500 text-rose-400' : ''}`} />
                  {bookmarked ? 'Tersimpan' : 'Bookmark'}
                </button>

                <button
                  onClick={handleShare}
                  className="flex-1 py-2.5 rounded-xl bg-card hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-white/5 flex items-center justify-center gap-1.5 transition-colors"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Tersalin!
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      Bagikan
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Metadata Box */}
            <div className="mt-4 bg-card/60 p-4 rounded-2xl border border-white/5 space-y-2.5 text-xs text-slate-400">
              {movie.status && (
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-semibold text-white">{movie.status}</span>
                </div>
              )}
              {movie.releaseDate && (
                <div className="flex justify-between">
                  <span>Tanggal Rilis:</span>
                  <span className="font-semibold text-white">{movie.releaseDate}</span>
                </div>
              )}
              {movie.duration && (
                <div className="flex justify-between">
                  <span>Durasi:</span>
                  <span className="font-semibold text-white">{movie.duration}</span>
                </div>
              )}
              {movie.spokenLanguages && movie.spokenLanguages.length > 0 && (
                <div className="flex justify-between">
                  <span>Bahasa & Sub:</span>
                  <span className="font-semibold text-white truncate max-w-[140px]">
                    {movie.spokenLanguages.join(', ')}
                  </span>
                </div>
              )}
              {movie.productionCompanies && movie.productionCompanies.length > 0 && (
                <div className="flex justify-between">
                  <span>Produksi:</span>
                  <span className="font-semibold text-white truncate max-w-[140px]">
                    {movie.productionCompanies.join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Title, Synopsis, Cast, Trailer */}
          <div className="flex-1 space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                {movie.ratingValue && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-sm font-bold">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{movie.ratingValue.toFixed(1)}</span>
                    <span className="text-[11px] text-amber-400/70 font-normal">
                      ({movie.ratingCount?.toLocaleString() || '1.2k'} ulasan)
                    </span>
                  </div>
                )}
                {movie.releaseDate && (
                  <span className="text-sm text-slate-400 font-semibold">
                    {new Date(movie.releaseDate).getFullYear()}
                  </span>
                )}
                {movie.duration && (
                  <span className="text-sm text-slate-400 font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {movie.duration}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                {movie.title}
              </h1>

              {movie.tagline && (
                <p className="text-xs sm:text-sm text-rose-400 italic mt-1 font-medium">
                  "{movie.tagline}"
                </p>
              )}

              {/* Genre Badges */}
              {movie.genres && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {movie.genres.map((g) => (
                    <span
                      key={g}
                      className="px-3 py-1 rounded-xl bg-card hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-white/5"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Synopsis / Overview */}
            <div className="bg-card/70 p-5 rounded-2xl border border-white/5 space-y-2">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-400" />
                Sinopsis & Alur Cerita
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {movie.description || 'Sinopsis resmi untuk tayangan ini belum tersedia.'}
              </p>
            </div>

            {/* Cast / Pemeran */}
            {movie.cast && movie.cast.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-rose-400" />
                  Pemeran Utama (Cast)
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {movie.cast.map((actor, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-card/60 border border-white/5"
                    >
                      {actor.profileUrl ? (
                        <img
                          src={actor.profileUrl}
                          alt={actor.name}
                          className="w-10 h-10 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
                          {actor.name[0]}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{actor.name}</p>
                        {actor.character && (
                          <p className="text-[11px] text-slate-400 truncate">{actor.character}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Official YouTube Trailer */}
            {movie.trailerUrl && (
              <div className="space-y-3">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Film className="w-4 h-4 text-rose-400" />
                  Official Trailer
                </h2>
                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/10 shadow-lg">
                  <iframe
                    src={movie.trailerUrl}
                    title={`${movie.title} Trailer`}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* TV Series Seasons & Episodes Navigator */}
        {isTv && (
          <div className="bg-card/70 p-6 rounded-3xl border border-white/10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Tv className="w-5 h-5 text-indigo-400" />
                  Episode List
                </h2>
                <p className="text-xs text-slate-400">Pilih season dan nomor episode untuk menonton.</p>
              </div>

              {/* Season Selector Tabs */}
              {seasons.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {seasons.map((s) => (
                    <button
                      key={s.seasonNumber}
                      onClick={() => setSelectedSeason(s.seasonNumber)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                        selectedSeason === s.seasonNumber
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-surface text-slate-300 hover:text-white border border-white/5'
                      }`}
                    >
                      {s.name || `Season ${s.seasonNumber}`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Episode Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {episodes.map((ep) => (
                <Link
                  key={ep.episodeNumber}
                  to={`/movies/watch/${movie.id}?season=${selectedSeason}&episode=${ep.episodeNumber}`}
                  className="group flex gap-3 p-3 rounded-2xl bg-surface hover:bg-slate-800 border border-white/5 hover:border-indigo-500/40 transition-all"
                >
                  <div className="w-24 sm:w-28 aspect-video rounded-xl overflow-hidden bg-slate-900 shrink-0 relative">
                    <img
                      src={ep.thumbnailUrl || ep.stillUrl || movie.backdropUrl || movie.posterUrl}
                      alt={ep.name || `Episode ${ep.episodeNumber}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-5 h-5 text-white fill-white" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 flex flex-col justify-center">
                    <span className="text-[11px] font-bold text-indigo-400 uppercase">
                      Episode {ep.episodeNumber}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-indigo-300 transition-colors">
                      {ep.title || ep.name || `Episode ${ep.episodeNumber}`}
                    </h3>
                    {ep.duration && (
                      <span className="text-[10px] text-slate-400 mt-0.5">{ep.duration}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Comments & User Reviews Section */}
        <div className="bg-card/70 p-6 rounded-3xl border border-white/10 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-rose-400" />
                Ulasan & Komentar Penonton ({comments.length})
              </h2>
              <p className="text-xs text-slate-400">
                Bagikan impresi dan pendapatmu tentang film atau serial ini.
              </p>
            </div>
          </div>

          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="space-y-3 bg-surface/60 p-4 rounded-2xl border border-white/5">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Nama Anda (Opsional)..."
                value={commentAuthor}
                onChange={(e) => setCommentAuthor(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs bg-card border border-white/10 focus:border-rose-500 rounded-xl text-white placeholder-slate-400 focus:outline-none"
              />

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Rating:</span>
                <select
                  value={commentRating}
                  onChange={(e) => setCommentRating(Number(e.target.value))}
                  className="px-3 py-2 text-xs font-bold bg-card border border-white/10 rounded-xl text-amber-400 focus:outline-none"
                >
                  {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      ★ {n}/10
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <textarea
              rows={3}
              placeholder="Tulis ulasan Anda di sini... (Apakah plotnya menarik? Bagaimana sinematografinya?)"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-card border border-white/10 focus:border-rose-500 rounded-xl text-white placeholder-slate-400 focus:outline-none"
              required
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isSpoiler}
                  onChange={(e) => setIsSpoiler(e.target.checked)}
                  className="rounded border-white/20 text-rose-600 focus:ring-rose-500"
                />
                <span className="flex items-center gap-1 text-rose-400 font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Mengandung Spoiler
                </span>
              </label>

              <button
                type="submit"
                disabled={commentMutation.isPending || !commentText.trim()}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                {commentMutation.isPending ? 'Mengirim...' : 'Kirim Ulasan'}
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-3.5">
            {comments.map((comm) => {
              const isHiddenSpoiler = comm.isSpoiler && !revealedSpoilers[comm.id];
              return (
                <div
                  key={comm.id}
                  className="p-4 rounded-2xl bg-surface/80 border border-white/5 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center font-bold text-white text-xs">
                        {comm.author[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white">{comm.author}</span>
                        <p className="text-[10px] text-slate-400">{comm.createdAt}</p>
                      </div>
                    </div>

                    {comm.rating && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {comm.rating}/10
                      </span>
                    )}
                  </div>

                  {/* Spoiler Alert Box */}
                  {comm.isSpoiler && (
                    <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
                      <span className="flex items-center gap-1.5 font-semibold text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        Ulasan ini ditandai mengandung spoiler
                      </span>
                      <button
                        onClick={() => toggleRevealSpoiler(comm.id)}
                        className="text-[11px] font-bold text-rose-400 hover:text-white underline flex items-center gap-1"
                      >
                        {isHiddenSpoiler ? (
                          <>
                            <Eye className="w-3 h-3" /> Tampilkan
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" /> Sembunyikan
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  <p
                    className={`text-xs text-slate-300 leading-relaxed transition-all ${
                      isHiddenSpoiler ? 'filter blur-sm select-none opacity-40' : ''
                    }`}
                  >
                    {comm.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Related Movies Section */}
        {related.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Film className="w-5 h-5 text-rose-400" />
              Rekomendasi Terkait
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {related.map((m) => (
                <Link
                  key={m.id}
                  to={`/movies/${m.id}`}
                  className="group rounded-2xl overflow-hidden bg-card border border-white/5 hover:border-rose-500/50 transition-all hover:-translate-y-1"
                >
                  <div className="aspect-[2/3] overflow-hidden bg-slate-900">
                    <img
                      src={m.posterUrl}
                      alt={m.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-xs text-white truncate group-hover:text-rose-400 transition-colors">
                      {m.title}
                    </h3>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                      <span>{m.releaseDate ? new Date(m.releaseDate).getFullYear() : 'Cinema'}</span>
                      {m.ratingValue && (
                        <span className="text-amber-400 font-bold">★ {m.ratingValue.toFixed(1)}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
