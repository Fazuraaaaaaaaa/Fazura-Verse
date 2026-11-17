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
} from 'lucide-react';
import { getDetail } from '../services/api';
import { useBookmarks } from '../hooks/useBookmarks';
import { useReadingHistory } from '../hooks/useReadingHistory';
import { DetailSkeleton } from '../components/SkeletonLoader';

export function MangaDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchChapter, setSearchChapter] = useState('');
  const [sortDescending, setSortDescending] = useState(true);
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);

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

  // Filter and sort chapters
  const filteredChapters = useMemo(() => {
    if (!manga?.chapters) return [];

    let list = manga.chapters.filter((ch) =>
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

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (error || !manga) {
    return (
      <div className="max-w-xl mx-auto py-24 px-4 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-white">Manga Not Found</h2>
        <p className="text-sm text-slate-400">
          {(error as any)?.message ||
            'We could not load this title. It might be unavailable or removed from the provider.'}
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-indigo text-white font-semibold text-sm hover:bg-accent-indigo/90"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            to="/"
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold text-sm hover:text-white"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const rawType = (manga.type || 'manga').toLowerCase().trim();
  const typeBadgeColors =
    rawType === 'manhwa'
      ? 'bg-purple-500/90 text-white border-purple-400/40'
      : rawType === 'manhua'
      ? 'bg-emerald-500/90 text-white border-emerald-400/40'
      : 'bg-indigo-500/90 text-white border-indigo-400/40';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Backdrop Header */}
      <div className="relative rounded-3xl overflow-hidden bg-card border border-white/10 p-6 sm:p-10 shadow-2xl">
        {/* Blurred Cover Backdrop */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img
            src={manga.cover}
            alt={manga.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover filter blur-3xl scale-125 opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/90 to-card/60" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Cover Poster */}
          <div className="relative w-52 sm:w-64 aspect-[3/4] rounded-2xl overflow-hidden shrink-0 shadow-2xl border-2 border-white/10 bg-slate-900">
            <img
              src={manga.cover}
              alt={manga.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            {manga.rating && (
              <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-amber-300 text-xs font-bold border border-white/10 shadow-lg">
                <Star className="w-3.5 h-3.5 fill-amber-300" />
                {manga.rating}
              </div>
            )}
          </div>

          {/* Info & Synopsis */}
          <div className="flex-1 space-y-4 text-center md:text-left min-w-0">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm ${typeBadgeColors}`}
              >
                {manga.type || 'Manga'}
              </span>
              {manga.status && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                  {manga.status}
                </span>
              )}
              {manga.release && (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-card text-slate-300 border border-white/5">
                  <Calendar className="w-3.5 h-3.5 text-accent-cyan" />
                  {manga.release}
                </span>
              )}
              {manga.reader && (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-card text-slate-300 border border-white/5">
                  <Users className="w-3.5 h-3.5 text-accent-purple" />
                  {manga.reader}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              {manga.title}
            </h1>

            {manga.otherTitle && (
              <p className="text-xs sm:text-sm text-slate-400 font-medium line-clamp-2">
                Alt: {manga.otherTitle}
              </p>
            )}

            {/* Author / Artist */}
            {(manga.author || manga.artist) && (
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-300 pt-1">
                {manga.author && (
                  <span className="flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5 text-accent-indigo" />
                    <strong className="text-slate-400">Author:</strong> {manga.author}
                  </span>
                )}
                {manga.artist && manga.artist !== manga.author && (
                  <span className="flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5 text-accent-cyan" />
                    <strong className="text-slate-400">Artist:</strong> {manga.artist}
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
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-surface/80 hover:bg-accent-indigo/20 text-slate-300 hover:text-accent-indigo border border-white/5 hover:border-accent-indigo/30 transition-all"
                  >
                    <Tag className="w-3 h-3 text-accent-indigo" />
                    {g.title}
                  </Link>
                ))}
              </div>
            )}

            {/* Synopsis */}
            <div className="pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Synopsis
              </h3>
              <p
                className={`text-sm text-slate-300 leading-relaxed ${
                  !synopsisExpanded ? 'line-clamp-4' : ''
                }`}
              >
                {manga.synopsis}
              </p>
              {manga.synopsis.length > 250 && (
                <button
                  onClick={() => setSynopsisExpanded(!synopsisExpanded)}
                  className="mt-1 text-xs font-bold text-accent-indigo hover:text-accent-cyan transition-colors"
                >
                  {synopsisExpanded ? 'Show Less' : 'Read Full Synopsis...'}
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-4">
              {/* Continue Reading or Start Reading */}
              {lastRead ? (
                <Link
                  to={`/chapter/${lastRead.chapterSlug}`}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-indigo hover:bg-accent-indigo/90 text-white font-bold text-sm shadow-lg shadow-accent-indigo/30 transition-all transform hover:scale-[1.02]"
                >
                  <PlayCircle className="w-4 h-4" />
                  Continue {lastRead.chapterTitle}
                </Link>
              ) : firstChapter ? (
                <Link
                  to={`/chapter/${firstChapter.slug}`}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-indigo hover:bg-accent-indigo/90 text-white font-bold text-sm shadow-lg shadow-accent-indigo/30 transition-all transform hover:scale-[1.02]"
                >
                  <BookOpen className="w-4 h-4" />
                  Start Reading (Ch. 1)
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
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold border transition-all ${
                  bookmarked
                    ? 'bg-accent-cyan/15 border-accent-cyan/30 text-accent-cyan'
                    : 'bg-card hover:bg-slate-800 text-slate-200 border-white/10 hover:text-white'
                }`}
              >
                {bookmarked ? (
                  <>
                    <BookmarkCheck className="w-4 h-4 fill-accent-cyan/20" />
                    In Favorites
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" />
                    Add to Favorites
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chapters Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-accent-indigo" />
              Chapter List
            </h2>
            <p className="text-xs text-slate-400">
              {manga.chapters?.length || 0} total chapters available
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Search Chapter */}
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search chapter..."
                value={searchChapter}
                onChange={(e) => setSearchChapter(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-card border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-accent-indigo"
              />
            </div>

            {/* Sort Toggle */}
            <button
              onClick={() => setSortDescending(!sortDescending)}
              title={sortDescending ? 'Sort: Newest First' : 'Sort: Oldest First'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>{sortDescending ? 'Newest' : 'Oldest'}</span>
            </button>
          </div>
        </div>

        {/* Chapters Grid */}
        {filteredChapters.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-card/40 border border-white/5 text-sm text-slate-400">
            No chapters match your search query.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[700px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredChapters.map((ch) => {
              const isRead = readChapterSlugs.has(ch.slug);
              return (
                <Link
                  key={ch.slug}
                  to={`/chapter/${ch.slug}`}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 group ${
                    isRead
                      ? 'bg-card/40 border-white/5 hover:border-accent-indigo/40 opacity-70 hover:opacity-100'
                      : 'bg-card hover:bg-slate-800 border-white/10 hover:border-accent-indigo/50 hover:shadow-md'
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p
                      className={`text-xs sm:text-sm font-bold truncate group-hover:text-accent-indigo transition-colors ${
                        isRead ? 'text-slate-400' : 'text-slate-100'
                      }`}
                    >
                      {ch.title}
                    </p>
                    {ch.date && (
                      <p className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {ch.date}
                      </p>
                    )}
                  </div>

                  {isRead ? (
                    <span
                      title="Already Read"
                      className="text-emerald-400 shrink-0 p-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-accent-indigo opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      Read →
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
