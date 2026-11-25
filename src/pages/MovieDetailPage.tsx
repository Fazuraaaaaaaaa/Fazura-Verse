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
      <div className="min-h-screen bg-[#12141B] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-4 border-[#F0A15B] border-t-transparent animate-spin mx-auto" />
          <p className="text-sm font-semibold text-[#A2A4B1]">Memuat detail film...</p>
        </div>
      </div>
    );
  }

  if (detailError || !movie) {
    return (
      <div className="min-h-screen bg-[#12141B] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#191C25] p-6 rounded-2xl border border-[#343744] text-center space-y-4">
          <Film className="w-12 h-12 text-[#F0A15B] mx-auto" />
          <h2 className="text-xl font-bold font-heading text-[#F2F0EC]">Film Tidak Ditemukan</h2>
          <p className="text-xs text-[#A2A4B1]">
            Detail data film atau serial ini gagal diambil dari API. Silakan kembali ke katalog.
          </p>
          <Link
            to="/movies"
            className="inline-block px-5 py-2.5 rounded-[10px] bg-[#F0A15B] hover:bg-[#F6B779] text-[#0B0C10] font-bold text-xs transition-colors"
          >
            Kembali ke Movie Hub
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#12141B] pb-20">
      {/* Backdrop Header */}
      <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[460px] overflow-hidden bg-[#0B0C10]">
        <img
          src={movie.backdropUrl || movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover object-center opacity-30 filter blur-sm scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#12141B] via-[#12141B]/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#12141B] via-transparent to-[#12141B]/60" />

        {/* Back Link Floating */}
        <div className="absolute top-6 left-4 sm:left-8 z-10">
          <Link
            to="/movies"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] bg-[#191C25]/90 hover:bg-[#232633] text-[#F2F0EC] text-xs font-semibold backdrop-blur-md border border-[#343744] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Movie Hub
          </Link>
        </div>
      </div>

      {/* Main Detail Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-44 sm:-mt-56 relative z-10 space-y-10">
        {/* Main Info Card (Poster + Details) */}
        <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-start">
          {/* Left Column: HD Poster & Quick Action (Strict 2:3 ratio) */}
          <div className="w-48 sm:w-56 md:w-64 lg:w-72 shrink-0 mx-auto md:mx-0">
            <div className="aspect-[2/3] rounded-[12px] overflow-hidden shadow-dialog border border-[#343744] bg-[#191C25] relative group">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 rounded-[6px] text-[11px] font-bold uppercase tracking-wider bg-[#0B0C10]/85 text-[#F0A15B] border border-[#343744]">
                  {isTv ? 'Serial TV' : 'Bioskop'}
                </span>
              </div>
            </div>

            {/* Main Action Buttons */}
            <div className="mt-4 space-y-2.5">
              <Link
                to={`/movies/watch/${movie.id}${isTv ? `?season=${selectedSeason}&episode=1` : ''}`}
                className="w-full min-h-[44px] py-3 rounded-[10px] bg-[#F0A15B] hover:bg-[#F6B779] text-[#0B0C10] font-bold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Play className="w-4 h-4 fill-[#0B0C10]" />
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
                  className={`flex-1 min-h-[40px] py-2 rounded-[10px] text-xs font-semibold border transition-colors flex items-center justify-center gap-1.5 ${
                    bookmarked
                      ? 'bg-[#232633] text-[#F0A15B] border-[#F0A15B]'
                      : 'bg-[#191C25] hover:bg-[#232633] text-[#A2A4B1] hover:text-[#F2F0EC] border-[#343744]'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-[#F0A15B] text-[#F0A15B]' : ''}`} />
                  {bookmarked ? 'Tersimpan' : 'Bookmark'}
                </button>

                <button
                  onClick={handleShare}
                  className="flex-1 min-h-[40px] py-2 rounded-[10px] bg-[#191C25] hover:bg-[#232633] text-[#A2A4B1] hover:text-[#F2F0EC] text-xs font-semibold border border-[#343744] flex items-center justify-center gap-1.5 transition-colors"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#75C9A0]" />
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
            <div className="mt-4 bg-[#191C25] p-4 rounded-[12px] border border-[#343744] space-y-2.5 text-xs text-[#A2A4B1]">
              {movie.status && (
                <div className="flex justify-between gap-2">
                  <span className="text-[#747887]">Status:</span>
                  <span className="font-semibold text-[#F2F0EC]">{movie.status}</span>
                </div>
              )}
              {movie.releaseDate && (
                <div className="flex justify-between gap-2">
                  <span className="text-[#747887]">Tanggal Rilis:</span>
                  <span className="font-semibold text-[#F2F0EC]">{movie.releaseDate}</span>
                </div>
              )}
              {movie.duration && (
                <div className="flex justify-between gap-2">
                  <span className="text-[#747887]">Durasi:</span>
                  <span className="font-semibold text-[#F2F0EC]">{movie.duration}</span>
                </div>
              )}
              {movie.spokenLanguages && movie.spokenLanguages.length > 0 && (
                <div className="flex justify-between gap-2">
                  <span className="text-[#747887]">Bahasa & Sub:</span>
                  <span className="font-semibold text-[#F2F0EC] truncate max-w-[140px]">
                    {movie.spokenLanguages.join(', ')}
                  </span>
                </div>
              )}
              {movie.productionCompanies && movie.productionCompanies.length > 0 && (
                <div className="flex justify-between gap-2">
                  <span className="text-[#747887]">Produksi:</span>
                  <span className="font-semibold text-[#F2F0EC] truncate max-w-[140px]">
                    {movie.productionCompanies.join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Title, Synopsis, Cast, Trailer */}
          <div className="flex-1 space-y-6 min-w-0">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                {typeof movie.ratingValue === 'number' && movie.ratingValue > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-[8px] bg-[#232633] text-[#F0A15B] border border-[#343744] text-sm font-bold">
                    <Star className="w-4 h-4 fill-[#F0A15B] text-[#F0A15B]" />
                    <span>{movie.ratingValue.toFixed(1)}</span>
                    {typeof movie.ratingCount === 'number' && movie.ratingCount > 0 && (
                      <span className="text-[11px] text-[#A2A4B1] font-normal">
                        ({movie.ratingCount.toLocaleString()} ulasan)
                      </span>
                    )}
                  </div>
                )}
                {movie.releaseDate && (
                  <span className="text-sm text-[#A2A4B1] font-semibold">
                    {new Date(movie.releaseDate).getFullYear()}
                  </span>
                )}
                {movie.duration && (
                  <span className="text-sm text-[#A2A4B1] font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#747887]" />
                    {movie.duration}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold font-heading text-[#F2F0EC] tracking-tight leading-tight">
                {movie.title}
              </h1>

              {movie.tagline && (
                <p className="text-xs sm:text-sm text-[#F0A15B] italic mt-1 font-medium">
                  "{movie.tagline}"
                </p>
              )}

              {/* Genre Badges */}
              {movie.genres && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {movie.genres.map((g) => (
                    <span
                      key={g}
                      className="px-3 py-1 rounded-[6px] bg-[#191C25] text-[#A2A4B1] text-xs font-semibold border border-[#343744]"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Synopsis / Overview */}
            <div className="bg-[#191C25] p-5 rounded-[12px] border border-[#343744] space-y-2">
              <h2 className="text-sm font-bold font-heading text-[#F2F0EC] uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F0A15B]" />
                Sinopsis & Alur Cerita
              </h2>
              <p className="text-xs sm:text-sm text-[#A2A4B1] leading-relaxed">
                {movie.description || 'Sinopsis resmi untuk tayangan ini belum tersedia.'}
              </p>
            </div>

            {/* Cast / Pemeran */}
            {movie.cast && movie.cast.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-bold font-heading text-[#F2F0EC] uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#F0A15B]" />
                  Pemeran Utama (Cast)
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {movie.cast.map((actor, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-2.5 rounded-[10px] bg-[#191C25] border border-[#343744]"
                    >
                      {actor.profileUrl ? (
                        <img
                          src={actor.profileUrl}
                          alt={actor.name}
                          className="w-10 h-10 rounded-full object-cover shrink-0 bg-[#232633]"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#232633] flex items-center justify-center text-xs font-bold text-[#A2A4B1] shrink-0">
                          {actor.name[0]}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#F2F0EC] truncate">{actor.name}</p>
                        {actor.character && (
                          <p className="text-[11px] text-[#747887] truncate">{actor.character}</p>
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
                <h2 className="text-sm font-bold font-heading text-[#F2F0EC] uppercase tracking-wider flex items-center gap-2">
                  <Film className="w-4 h-4 text-[#F0A15B]" />
                  Official Trailer
                </h2>
                <div className="aspect-video w-full rounded-[12px] overflow-hidden bg-[#0B0C10] border border-[#343744]">
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
          <div className="bg-[#191C25] p-6 rounded-2xl border border-[#343744] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#343744] pb-4">
              <div className="flex items-start gap-3">
                <span className="w-1 h-6 rounded-full bg-[#F0A15B] mt-0.5 shrink-0" />
                <div>
                  <h2 className="text-lg font-bold font-heading text-[#F2F0EC] flex items-center gap-2">
                    <Tv className="w-5 h-5 text-[#F0A15B]" />
                    Daftar Episode
                  </h2>
                  <p className="text-xs text-[#747887]">Pilih season dan nomor episode untuk menonton.</p>
                </div>
              </div>

              {/* Season Selector Tabs */}
              {seasons.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {seasons.map((s) => (
                    <button
                      key={s.seasonNumber}
                      onClick={() => setSelectedSeason(s.seasonNumber)}
                      className={`px-3.5 py-1.5 rounded-[8px] text-xs font-bold whitespace-nowrap transition-colors border ${
                        selectedSeason === s.seasonNumber
                          ? 'bg-[#232633] text-[#F0A15B] border-[#F0A15B]'
                          : 'bg-[#12141B] text-[#A2A4B1] hover:text-[#F2F0EC] border-[#343744]'
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
                  className="group flex gap-3 p-3 rounded-[10px] bg-[#12141B] hover:bg-[#232633] border border-[#343744] hover:border-[#F0A15B]/60 transition-colors"
                >
                  <div className="w-24 sm:w-28 aspect-video rounded-[8px] overflow-hidden bg-[#232633] shrink-0 relative">
                    <img
                      src={ep.thumbnailUrl || ep.stillUrl || movie.backdropUrl || movie.posterUrl}
                      alt={ep.name || `Episode ${ep.episodeNumber}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-[#0B0C10]/45 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-5 h-5 text-[#F0A15B] fill-[#F0A15B]" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 flex flex-col justify-center">
                    <span className="text-[11px] font-bold text-[#F0A15B] uppercase">
                      Episode {ep.episodeNumber}
                    </span>
                    <h3 className="text-xs sm:text-sm font-semibold text-[#F2F0EC] truncate group-hover:text-[#F0A15B] transition-colors">
                      {ep.title || ep.name || `Episode ${ep.episodeNumber}`}
                    </h3>
                    {ep.duration && (
                      <span className="text-[11px] text-[#747887] mt-0.5">{ep.duration}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Comments & User Reviews Section */}
        <div className="bg-[#191C25] p-6 rounded-2xl border border-[#343744] space-y-6">
          <div className="flex items-center justify-between border-b border-[#343744] pb-4">
            <div className="flex items-start gap-3">
              <span className="w-1 h-6 rounded-full bg-[#F0A15B] mt-0.5 shrink-0" />
              <div>
                <h2 className="text-lg font-bold font-heading text-[#F2F0EC] flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#F0A15B]" />
                  Ulasan & Komentar Penonton ({comments.length})
                </h2>
                <p className="text-xs text-[#747887]">
                  Bagikan impresi dan pendapatmu tentang film atau serial ini.
                </p>
              </div>
            </div>
          </div>

          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="space-y-3 bg-[#12141B] p-4 rounded-[12px] border border-[#343744]">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Nama Anda (Opsional)..."
                value={commentAuthor}
                onChange={(e) => setCommentAuthor(e.target.value)}
                className="flex-1 h-9 px-3.5 text-xs bg-[#191C25] border border-[#343744] focus:border-[#F0A15B] rounded-[10px] text-[#F2F0EC] placeholder-[#747887] focus:outline-none"
              />

              <div className="flex items-center gap-2">
                <span className="text-xs text-[#747887]">Rating:</span>
                <select
                  value={commentRating}
                  onChange={(e) => setCommentRating(Number(e.target.value))}
                  className="h-9 px-3 text-xs font-bold bg-[#191C25] border border-[#343744] rounded-[10px] text-[#F0A15B] focus:outline-none focus:border-[#F0A15B]"
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
              className="w-full px-3.5 py-2.5 text-xs bg-[#191C25] border border-[#343744] focus:border-[#F0A15B] rounded-[10px] text-[#F2F0EC] placeholder-[#747887] focus:outline-none"
              required
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <label className="flex items-center gap-2 text-xs text-[#A2A4B1] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isSpoiler}
                  onChange={(e) => setIsSpoiler(e.target.checked)}
                  className="rounded border-[#343744] text-[#F0A15B] focus:ring-[#F0A15B]"
                />
                <span className="flex items-center gap-1 text-amber-400 font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Mengandung Spoiler
                </span>
              </label>

              <button
                type="submit"
                disabled={commentMutation.isPending || !commentText.trim()}
                className="px-5 py-2 rounded-[10px] bg-[#F0A15B] hover:bg-[#F6B779] disabled:opacity-50 text-[#0B0C10] font-bold text-xs flex items-center gap-1.5 transition-colors"
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
                  className="p-4 rounded-[12px] bg-[#12141B] border border-[#343744] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#232633] border border-[#343744] flex items-center justify-center font-bold text-[#F0A15B] text-xs">
                        {comm.author[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#F2F0EC]">{comm.author}</span>
                        <p className="text-[10px] text-[#747887]">{comm.createdAt}</p>
                      </div>
                    </div>

                    {comm.rating && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-[6px] bg-[#232633] text-[#F0A15B] border border-[#343744] text-xs font-bold">
                        <Star className="w-3 h-3 fill-[#F0A15B]" />
                        {comm.rating}/10
                      </span>
                    )}
                  </div>

                  {/* Spoiler Alert Box */}
                  {comm.isSpoiler && (
                    <div className="flex items-center justify-between px-3 py-1.5 rounded-[8px] bg-amber-500/10 border border-amber-500/25 text-xs text-amber-300">
                      <span className="flex items-center gap-1.5 font-semibold text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        Ulasan ini ditandai mengandung spoiler
                      </span>
                      <button
                        onClick={() => toggleRevealSpoiler(comm.id)}
                        className="text-[11px] font-bold text-[#F0A15B] hover:text-[#F2F0EC] underline flex items-center gap-1"
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
                    className={`text-xs text-[#A2A4B1] leading-relaxed transition-all ${
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
            <h2 className="text-lg font-bold font-heading text-[#F2F0EC] flex items-center gap-2">
              <Film className="w-5 h-5 text-[#F0A15B]" />
              Rekomendasi Terkait
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {related.map((m) => (
                <Link
                  key={m.id}
                  to={`/movies/${m.id}`}
                  className="group rounded-[10px] overflow-hidden bg-[#191C25] border border-[#343744] hover:border-[#F0A15B]/60 transition-all hover:-translate-y-0.5"
                >
                  <div className="aspect-[2/3] overflow-hidden bg-[#232633]">
                    <img
                      src={m.posterUrl}
                      alt={m.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-xs text-[#F2F0EC] truncate group-hover:text-[#F0A15B] transition-colors">
                      {m.title}
                    </h3>
                    <div className="flex items-center justify-between text-[11px] text-[#747887] mt-1">
                      <span>{m.releaseDate ? new Date(m.releaseDate).getFullYear() : 'Cinema'}</span>
                      {typeof m.ratingValue === 'number' && m.ratingValue > 0 && (
                        <span className="text-[#F0A15B] font-bold">★ {m.ratingValue.toFixed(1)}</span>
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
