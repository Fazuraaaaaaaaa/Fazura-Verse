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
import { usePageMeta } from '../hooks/usePageMeta';

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

  usePageMeta({
    title: manga?.title ? `${manga.title} - Baca Komik Sub Indo` : 'Detail Komik',
    description: manga?.synopsis?.slice(0, 155) || 'Baca komik manga, manhwa, dan manhua sub Indo lengkap di FazuraStream.',
    image: manga?.cover,
    type: 'article',
    jsonLd: manga?.title
      ? {
          '@type': 'Book',
          name: manga.title,
          image: manga.cover,
          author: manga.author,
          description: manga.synopsis?.slice(0, 200),
        }
      : undefined,
  });

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
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-[#F2F0EC] font-heading">Komik Tidak Ditemukan</h2>
          <p className="text-xs text-[#A2A4B1]">
            {(error as any)?.message ||
              'Tidak dapat memuat judul ini. Judul mungkin sedang tidak tersedia di provider.'}
          </p>
        </div>
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#F0A15B] hover:bg-[#F6B779] text-[#0B0C10] font-bold text-xs transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Coba Lagi
          </button>
          <Link
            to="/manga"
            className="px-5 py-2.5 rounded-[10px] bg-[#191C25] hover:bg-[#232633] text-[#A2A4B1] hover:text-[#F2F0EC] font-semibold text-xs border border-[#343744] transition-colors"
          >
            Kembali ke Manga Hub
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-10 min-w-0">
      {/* Cinematic Hero Backdrop Header */}
      <div className="relative rounded-2xl overflow-hidden bg-[#191C25] border border-[#343744] shadow-dialog">
        {/* Blurred Cover Backdrop */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img
            src={manga.cover}
            alt={manga.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover filter blur-2xl scale-125 opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#12141B] via-[#191C25]/90 to-[#191C25]/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#12141B]/90 via-transparent to-[#12141B]/90" />
        </div>

        <div className="relative z-10 p-6 sm:p-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Cover Poster (strict 2:3 ratio) */}
          <div className="relative group w-48 sm:w-56 aspect-[2/3] rounded-[12px] overflow-hidden shrink-0 shadow-dialog border border-[#343744] bg-[#232633]">
            <img
              src={manga.cover}
              alt={manga.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Rating Badge */}
            {manga.rating && (
              <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-[#0B0C10]/85 text-[#F0A15B] text-xs font-bold border border-[#343744]">
                <Star className="w-3.5 h-3.5 fill-[#F0A15B] text-[#F0A15B]" />
                {manga.rating}
              </div>
            )}
            {/* Status Pill */}
            {manga.status && (
              <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-[6px] bg-[#0B0C10]/85 text-[#75C9A0] text-[11px] font-semibold border border-[#343744]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#75C9A0]" />
                {manga.status}
              </div>
            )}
          </div>

          {/* Info & Synopsis */}
          <div className="flex-1 space-y-4 text-center md:text-left min-w-0">
            {/* Chips Header */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#232633] text-[#75C9A0] border border-[#75C9A0]/35">
                {manga.type || 'Manga'}
              </span>
              {manga.release && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#232633] text-[#A2A4B1] border border-[#343744]">
                  <Calendar className="w-3.5 h-3.5 text-[#75C9A0]" />
                  {manga.release}
                </span>
              )}
              {manga.reader && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#232633] text-[#A2A4B1] border border-[#343744]">
                  <Users className="w-3.5 h-3.5 text-[#75C9A0]" />
                  {manga.reader} Pembaca
                </span>
              )}
              {manga.chapters && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#232633] text-[#A2A4B1] border border-[#343744]">
                  <BookOpen className="w-3.5 h-3.5 text-[#75C9A0]" />
                  {manga.chapters.length} Chapter
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-[#F2F0EC] font-heading tracking-tight leading-tight">
              {manga.title}
            </h1>

            {manga.otherTitle && (
              <p className="text-xs sm:text-sm text-[#A2A4B1] font-medium line-clamp-2">
                Judul Lain: {manga.otherTitle}
              </p>
            )}

            {/* Author / Artist */}
            {(manga.author || manga.artist) && (
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-[#A2A4B1] pt-1">
                {manga.author && (
                  <span className="flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5 text-[#75C9A0]" />
                    <strong className="text-[#747887]">Author:</strong> {manga.author}
                  </span>
                )}
                {manga.artist && manga.artist !== manga.author && (
                  <span className="flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5 text-[#75C9A0]" />
                    <strong className="text-[#747887]">Artist:</strong> {manga.artist}
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
                    className="flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-xs font-semibold bg-[#232633] hover:border-[#75C9A0] text-[#A2A4B1] hover:text-[#F2F0EC] border border-[#343744] transition-colors"
                  >
                    <Tag className="w-3 h-3 text-[#75C9A0]" />
                    {g.title}
                  </Link>
                ))}
              </div>
            )}

            {/* Synopsis */}
            {manga.synopsis && (
              <div className="pt-2 text-left">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#747887] mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#75C9A0]" />
                  Sinopsis
                </h3>
                <p
                  className={`text-xs sm:text-sm text-[#A2A4B1] leading-relaxed ${
                    !synopsisExpanded ? 'line-clamp-3' : ''
                  }`}
                >
                  {manga.synopsis}
                </p>
                {manga.synopsis.length > 250 && (
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
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center md:justify-start gap-3 pt-4">
              {/* Continue Reading or Start Reading */}
              {lastRead ? (
                <Link
                  to={`/chapter/${lastRead.chapterSlug}`}
                  className="flex items-center justify-center gap-2 min-h-[44px] px-6 py-2.5 rounded-[10px] bg-[#F0A15B] hover:bg-[#F6B779] text-[#0B0C10] font-bold text-xs sm:text-sm transition-colors text-center"
                >
                  <PlayCircle className="w-4 h-4" />
                  Lanjutkan {lastRead.chapterTitle}
                </Link>
              ) : firstChapter ? (
                <Link
                  to={`/chapter/${firstChapter.slug}`}
                  className="flex items-center justify-center gap-2 min-h-[44px] px-6 py-2.5 rounded-[10px] bg-[#F0A15B] hover:bg-[#F6B779] text-[#0B0C10] font-bold text-xs sm:text-sm transition-colors text-center"
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
                className={`flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-[10px] text-xs font-semibold border transition-colors text-center ${
                  bookmarked
                    ? 'bg-[#232633] border-[#F0A15B] text-[#F0A15B]'
                    : 'bg-[#232633] hover:bg-[#343744] text-[#A2A4B1] border-[#343744] hover:text-[#F2F0EC]'
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
                title="Salin Tautan Komik"
              >
                <Share2 className="w-4 h-4" />
                {copiedLink ? 'Tersalin!' : 'Bagikan'}
              </button>

              {/* Back to Manga Hub */}
              <Link
                to="/manga"
                className="flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-[10px] bg-transparent hover:bg-[#232633] text-[#A2A4B1] hover:text-[#F2F0EC] text-xs font-semibold border border-[#343744] text-center transition-colors"
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
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-[#343744] pb-4">
          <div className="flex items-start gap-3">
            <span className="w-1 h-6 rounded-full bg-[#75C9A0] mt-1 shrink-0" />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#F2F0EC] font-heading flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#75C9A0]" />
                Daftar Chapter
              </h2>
              <p className="text-xs text-[#747887] mt-0.5">
                {manga.chapters?.length || 0} total chapter tersedia untuk dibaca
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Search Chapter */}
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 text-[#747887] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari chapter..."
                value={searchChapter}
                onChange={(e) => setSearchChapter(e.target.value)}
                className="w-full h-9 pl-8 pr-3 text-xs bg-[#191C25] border border-[#343744] rounded-[10px] text-[#F2F0EC] placeholder-[#747887] focus:outline-none focus:border-[#75C9A0] transition-colors"
              />
            </div>

            {/* Sort Toggle */}
            <button
              onClick={() => setSortDescending(!sortDescending)}
              title={sortDescending ? 'Urutkan: Chapter 1 Teratas' : 'Urutkan: Chapter Terbaru'}
              className="flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] bg-[#191C25] hover:bg-[#232633] text-[#A2A4B1] hover:text-[#F2F0EC] border border-[#343744] text-xs font-semibold transition-colors shrink-0"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-[#75C9A0]" />
              <span>{sortDescending ? 'Ch Terbaru' : 'Ch 1 Teratas'}</span>
            </button>
          </div>
        </div>

        {/* Chapters Grid */}
        {filteredChapters.length === 0 ? (
          <div className="p-10 text-center rounded-[12px] bg-[#191C25] border border-[#343744] text-sm text-[#A2A4B1]">
            Tidak ada chapter yang cocok dengan pencarian "{searchChapter}".
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[720px] overflow-y-auto pr-1">
            {filteredChapters.map((ch) => {
              const isRead = readChapterSlugs.has(ch.slug);
              return (
                <Link
                  key={ch.slug}
                  to={`/chapter/${ch.slug}`}
                  className={`flex items-center justify-between p-3.5 rounded-[10px] border transition-colors group ${
                    isRead
                      ? 'bg-[#12141B] border-[#343744] hover:border-[#75C9A0]/50 opacity-80 hover:opacity-100'
                      : 'bg-[#191C25] hover:bg-[#232633] border-[#343744] hover:border-[#75C9A0]/60'
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p
                      className={`text-xs sm:text-sm font-semibold truncate group-hover:text-[#75C9A0] transition-colors ${
                        isRead ? 'text-[#A2A4B1]' : 'text-[#F2F0EC]'
                      }`}
                    >
                      {ch.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {ch.date && (
                        <p className="flex items-center gap-1 text-[11px] text-[#747887]">
                          <Clock className="w-3 h-3 text-[#75C9A0]" />
                          {ch.date}
                        </p>
                      )}
                      {isRead && (
                        <span className="flex items-center gap-1 text-[10px] text-[#75C9A0] font-semibold">
                          <CheckCircle className="w-3 h-3" /> Sudah Dibaca
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-[#F0A15B] opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
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
        <section className="space-y-4 pt-6 border-t border-[#343744] animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#232633] text-[#75C9A0] border border-[#75C9A0]/35">
                  Rekomendasi Genre
                </span>
                {primaryGenre && (
                  <span className="text-xs text-[#747887] capitalize">
                    Genre: <strong className="text-[#75C9A0]">{primaryGenre.title}</strong>
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-2xl font-bold text-[#F2F0EC] tracking-tight flex items-center gap-2 font-heading">
                <Sparkles className="w-5 h-5 text-[#75C9A0]" />
                <span>Rekomendasi Komik Terkait</span>
              </h2>
              <p className="text-xs text-[#A2A4B1]">
                Komik populer lainnya dengan genre yang serupa untuk menemani bacaan Anda
              </p>
            </div>

            {primaryGenre && (
              <Link
                to={`/manga?tab=genres&genre=${encodeURIComponent(primaryGenre.slug)}`}
                className="text-xs font-semibold text-[#F0A15B] hover:text-[#F6B779] flex items-center gap-1 self-start sm:self-auto"
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
