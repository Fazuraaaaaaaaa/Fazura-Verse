import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Star,
  Users,
  Calendar,
  PenTool,
  ArrowUpDown,
  Search,
  Clock,
  CheckCircle,
  PlayCircle,
  Tag,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Share2,
  ArrowLeft,
} from 'lucide-react';
import { getDetail, getByGenre } from '../services/api';
import { useBookmarks } from '../hooks/useBookmarks';
import { useReadingHistory } from '../hooks/useReadingHistory';
import { DetailSkeleton } from '../components/SkeletonLoader';
import { MangaCard } from '../components/MangaCard';

export function MangaDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchChapter, setSearchChapter] = useState('');
  // Urutan default: Chapter 1 paling atas (Ascending)
  const [sortDescending, setSortDescending] = useState(false);
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { history, getLastRead } = useReadingHistory();

  const {
    data: manga,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['detail', slug],
    queryFn: () => getDetail(slug || ''),
    enabled: Boolean(slug),
  });

  const bookmarked = slug ? isBookmarked(slug) : false;
  const lastRead = slug ? getLastRead(slug) : undefined;

  // Query Rekomendasi Terkait sesuai Genre Manga
  const primaryGenre = useMemo(() => {
    if (!manga?.genres || manga.genres.length === 0) return null;
    const first = manga.genres[0];
    const genreSlug = first.slug || first.title.toLowerCase().replace(/\s+/g, '-');
    return {
      slug: genreSlug,
      title: first.title,
    };
  }, [manga?.genres]);

  const { data: relatedMangaData } = useQuery({
    queryKey: ['manga', 'related', primaryGenre?.slug],
    queryFn: () => getByGenre(primaryGenre?.slug || ''),
    enabled: Boolean(primaryGenre?.slug),
  });

  const relatedMangaList = useMemo(() => {
    if (!relatedMangaData) return [];
    const list: any[] = Array.isArray(relatedMangaData)
      ? relatedMangaData
      : (relatedMangaData as any).komikList || [];
    return list
      .filter((item: any) => item.slug !== slug && !item.slug.includes(slug || ''))
      .slice(0, 12);
  }, [relatedMangaData, slug]);

  // Filter and sort chapters
  const filteredChapters = useMemo(() => {
    if (!manga?.chapters) return [];

    let list = manga.chapters.filter(
      (ch) =>
        ch.title.toLowerCase().includes(searchChapter.toLowerCase()) ||
        ch.slug.toLowerCase().includes(searchChapter.toLowerCase())
    );

    if (!sortDescending) {
      list = [...list].reverse();
    }

    return list;
  }, [manga?.chapters, searchChapter, sortDescending]);

  // Earliest chapter for "Start Reading" button
  const firstChapter = useMemo(() => {
    if (!manga?.chapters || manga.chapters.length === 0) return null;
    return manga.chapters[manga.chapters.length - 1]; // bottom-most is typically Ch 1
  }, [manga?.chapters]);

  // Check which chapters have been read
  const readChapterSlugs = useMemo(() => {
    const set = new Set<string>();
    history.forEach((h) => {
      if (h.slug === slug) {
        set.add(h.chapterSlug);
      }
    });
    return set;
  }, [history, slug]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (error || !manga) {
    return (
      <div className="max-w-xl mx-auto py-24 px-4 text-center space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20 shadow-lg shadow-rose-500/10">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-white font-heading">Komik Tidak Ditemukan</h2>
          <p className="text-xs text-text-secondary">
            {(error as any)?.message ||
              'Tidak dapat memuat judul ini. Judul mungkin sedang tidak tersedia di provider.'}
          </p>
        </div>
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-primary text-white font-bold text-xs shadow-lg shadow-accent-primary/20 hover:bg-accent-primary/90 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Coba Lagi
          </button>
          <Link
            to="/manga"
            className="px-5 py-2.5 rounded-xl bg-surface hover:bg-surface-elevated text-slate-300 hover:text-white font-semibold text-xs border border-white/10 transition-colors"
          >
            Kembali ke Manga Hub
          </Link>
        </div>
      </div>
    );
  }

  const rawType = (manga.type || 'manga').toLowerCase().trim();
  const typeBadgeColors =
    rawType === 'manhwa'
      ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
      : rawType === 'manhua'
      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
      : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-10 min-w-0">
      {/* Cinematic Hero Backdrop Header */}
      <div className="relative rounded-3xl overflow-hidden bg-surface border border-white/10 shadow-2xl">
        {/* Blurred Cover Backdrop */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img
            src={manga.cover}
            alt={manga.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover filter blur-3xl scale-125 opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-surface/90 to-surface/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/90 via-transparent to-bg-primary/90" />
        </div>

        <div className="relative z-10 p-6 sm:p-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Cover Poster with Floating Badges */}
          <div className="relative group w-52 sm:w-64 aspect-[3/4] rounded-2xl overflow-hidden shrink-0 shadow-2xl border-2 border-white/10 bg-surface-elevated">
            <img
              src={manga.cover}
              alt={manga.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Rating Badge */}
            {manga.rating && (
              <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#090912]/85 backdrop-blur-md text-amber-300 text-xs font-black border border-white/10 shadow-lg">
                <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                {manga.rating}
              </div>
            )}
            {/* Status Pill */}
            {manga.status && (
              <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#090912]/85 backdrop-blur-md text-emerald-400 text-[11px] font-bold border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {manga.status}
              </div>
            )}
          </div>

          {/* Info & Synopsis */}
          <div className="flex-1 space-y-4 text-center md:text-left min-w-0">
            {/* Chips Header */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm ${typeBadgeColors}`}
              >
                {manga.type || 'Manga'}
              </span>
              {manga.release && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-surface-elevated text-slate-300 border border-white/8">
                  <Calendar className="w-3.5 h-3.5 text-accent-soft" />
                  {manga.release}
                </span>
              )}
              {manga.reader && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-surface-elevated text-slate-300 border border-white/8">
                  <Users className="w-3.5 h-3.5 text-accent-primary" />
                  {manga.reader} Pembaca
                </span>
              )}
              {manga.chapters && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-surface-elevated text-slate-300 border border-white/8">
                  <BookOpen className="w-3.5 h-3.5 text-accent-soft" />
                  {manga.chapters.length} Chapter
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white font-heading tracking-tight leading-tight">
              {manga.title}
            </h1>

            {manga.otherTitle && (
              <p className="text-xs sm:text-sm text-text-secondary font-medium line-clamp-2">
                Judul Lain: {manga.otherTitle}
              </p>
            )}

            {/* Author / Artist */}
            {(manga.author || manga.artist) && (
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-300 pt-1">
                {manga.author && (
                  <span className="flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5 text-accent-soft" />
                    <strong className="text-text-muted">Author:</strong> {manga.author}
                  </span>
                )}
                {manga.artist && manga.artist !== manga.author && (
                  <span className="flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5 text-accent-primary" />
                    <strong className="text-text-muted">Artist:</strong> {manga.artist}
                  </span>
                )}
              </div>
            )}

            {/* Genre Pills */}
            {manga.genres && manga.genres.length > 0 && (
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 pt-1">
                {manga.genres.map((g) => (
                  <Link
                    key={g.slug}
                    to={`/browse?genre=${encodeURIComponent(g.slug)}`}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-surface-elevated/90 hover:bg-accent-primary/20 text-text-secondary hover:text-white border border-white/5 hover:border-accent-primary/30 transition-all"
                  >
                    <Tag className="w-3 h-3 text-accent-soft" />
                    {g.title}
                  </Link>
                ))}
              </div>
            )}

            {/* Synopsis */}
            {manga.synopsis && (
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
                  {manga.synopsis}
                </p>
                {manga.synopsis.length > 250 && (
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
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center md:justify-start gap-3 pt-4">
              {/* Continue Reading or Start Reading */}
              {lastRead ? (
                <Link
                  to={`/chapter/${lastRead.chapterSlug}`}
                  className="flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-accent-primary hover:bg-accent-primary/90 text-white font-black text-xs sm:text-sm shadow-lg shadow-accent-primary/25 transition-all transform hover:scale-[1.02] text-center"
                >
                  <PlayCircle className="w-4 h-4 fill-white" />
                  Lanjutkan {lastRead.chapterTitle}
                </Link>
              ) : firstChapter ? (
                <Link
                  to={`/chapter/${firstChapter.slug}`}
                  className="flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-accent-primary hover:bg-accent-primary/90 text-white font-black text-xs sm:text-sm shadow-lg shadow-accent-primary/25 transition-all transform hover:scale-[1.02] text-center"
                >
                  <BookOpen className="w-4 h-4" />
                  Mulai Baca (Ch. 1)
                </Link>
              ) : null}

              {/* Bookmark Button */}
              <button
                onClick={() =>
                  slug &&
                  toggleBookmark({
                    slug,
                    title: manga.title,
                    cover: manga.cover,
                    type: manga.type,
                  })
                }
                className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold border transition-all text-center ${
                  bookmarked
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 shadow-sm'
                    : 'bg-surface-elevated hover:bg-surface text-slate-200 border-white/10 hover:text-white'
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
                title="Salin Tautan Komik"
              >
                <Share2 className="w-4 h-4" />
                {copiedLink ? 'Tersalin!' : 'Bagikan'}
              </button>

              {/* Back to Manga Hub */}
              <Link
                to="/manga"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-surface-elevated hover:bg-surface text-slate-300 hover:text-white text-xs font-semibold border border-white/10 text-center transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Hub
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Chapters Directory */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-heading flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-accent-primary" />
              Daftar Chapter
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              {manga.chapters?.length || 0} total chapter tersedia untuk dibaca
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Search Chapter */}
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari chapter..."
                value={searchChapter}
                onChange={(e) => setSearchChapter(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs bg-surface border border-white/10 rounded-xl text-white placeholder-text-muted focus:outline-none focus:border-accent-primary transition-colors"
              />
            </div>

            {/* Sort Toggle */}
            <button
              onClick={() => setSortDescending(!sortDescending)}
              title={sortDescending ? 'Urutkan: Chapter 1 Teratas' : 'Urutkan: Chapter Terbaru'}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface hover:bg-surface-elevated text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-accent-soft" />
              <span>{sortDescending ? 'Ch Terbaru' : 'Ch 1 Teratas'}</span>
            </button>
          </div>
        </div>

        {/* Chapters Grid */}
        {filteredChapters.length === 0 ? (
          <div className="p-10 text-center rounded-2xl bg-surface/50 border border-white/5 text-sm text-text-secondary">
            Tidak ada chapter yang cocok dengan pencarian "{searchChapter}".
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[720px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredChapters.map((ch) => {
              const isRead = readChapterSlugs.has(ch.slug);
              return (
                <Link
                  key={ch.slug}
                  to={`/chapter/${ch.slug}`}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 group ${
                    isRead
                      ? 'bg-surface/50 border-white/5 hover:border-accent-primary/40 opacity-75 hover:opacity-100'
                      : 'bg-surface hover:bg-surface-elevated border-white/10 hover:border-accent-primary/50 hover:shadow-lg hover:shadow-accent-primary/10'
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p
                      className={`text-xs sm:text-sm font-bold truncate group-hover:text-accent-primary transition-colors ${
                        isRead ? 'text-slate-400' : 'text-slate-100'
                      }`}
                    >
                      {ch.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {ch.date && (
                        <p className="flex items-center gap-1 text-[11px] text-text-muted">
                          <Clock className="w-3 h-3 text-accent-soft" />
                          {ch.date}
                        </p>
                      )}
                      {isRead && (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                          <CheckCircle className="w-3 h-3" /> Sudah Dibaca
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-accent-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    Baca →
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Rekomendasi Terkait Sesuai Genre Manga */}
      {relatedMangaList.length > 0 && (
        <section className="space-y-4 pt-6 border-t border-white/5 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#8B5CF6]/20 text-[#A78BFA] border border-[#8B5CF6]/30">
                  REKOMENDASI GENRE
                </span>
                {primaryGenre && (
                  <span className="text-xs text-text-muted capitalize">
                    Genre: <strong className="text-accent-primary">{primaryGenre.title}</strong>
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 font-heading">
                <Sparkles className="w-5 h-5 text-accent-primary" />
                <span>Rekomendasi Komik Terkait</span>
              </h2>
              <p className="text-xs text-text-secondary">
                Komik populer lainnya dengan genre yang serupa untuk menemani bacaan Anda
              </p>
            </div>

            {primaryGenre && (
              <Link
                to={`/manga?tab=genres&genre=${encodeURIComponent(primaryGenre.slug)}`}
                className="text-xs font-bold text-accent-primary hover:text-accent-soft flex items-center gap-1 self-start sm:self-auto"
              >
                <span>Lihat Genre {primaryGenre.title} Lainnya</span>
                <span aria-hidden="true">→</span>
              </Link>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {relatedMangaList.map((item: any) => (
              <MangaCard key={item.slug} manga={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
