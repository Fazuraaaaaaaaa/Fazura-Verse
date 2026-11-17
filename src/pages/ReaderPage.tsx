import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  BookOpen,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { getChapter, getDetail } from '../services/api';
import { useReaderSettings } from '../hooks/useReaderSettings';
import { useReadingHistory } from '../hooks/useReadingHistory';
import { ReaderControls } from '../components/reader/ReaderControls';
import { ReaderImage } from '../components/reader/ReaderImage';
import { ReaderSkeleton } from '../components/SkeletonLoader';

export function ReaderPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { settings, updateSettings } = useReaderSettings();
  const { saveProgress } = useReadingHistory();

  const [controlsVisible, setControlsVisible] = useState(true);
  const [singlePageIndex, setSinglePageIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  const lastScrollY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract parent manga slug guess from chapter slug (e.g., 'blue-lock-chapter-1' -> 'blue-lock')
  const parentSlugGuess = slug
    ? slug.replace(/-chapter-.*$/i, '').replace(/chapter-.*$/i, '').replace(/-ch-.*$/i, '')
    : '';

  // Query chapter data
  const {
    data: chapter,
    isLoading: chapterLoading,
    error: chapterError,
    refetch: refetchChapter,
  } = useQuery({
    queryKey: ['chapter', slug],
    queryFn: () => getChapter(slug || ''),
    enabled: Boolean(slug),
  });

  // Query parent manga detail for chapter dropdown & cover
  const { data: parentDetail } = useQuery({
    queryKey: ['detail', parentSlugGuess],
    queryFn: () => getDetail(parentSlugGuess),
    enabled: Boolean(parentSlugGuess),
  });

  const images = chapter?.images || [];
  const totalPages = images.length;

  // Auto-save history whenever chapter loads or progress updates
  useEffect(() => {
    if (chapter && slug) {
      const mangaTitle = parentDetail?.title || chapter.title.replace(/chapter.*$/i, '').trim();
      const mangaCover = parentDetail?.cover || images[0] || '';
      saveProgress({
        slug: parentSlugGuess || slug,
        mangaTitle: mangaTitle || 'Manga',
        mangaCover,
        chapterSlug: slug,
        chapterTitle: chapter.title || slug.replace(/-/g, ' '),
        progress: scrollProgress,
      });
    }
  }, [chapter, slug, parentDetail, images, scrollProgress, saveProgress, parentSlugGuess]);

  // Reset page index when chapter slug changes
  useEffect(() => {
    setSinglePageIndex(0);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [slug]);

  // Handle scroll to hide/show header & compute reading progress
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const pct = Math.min(100, Math.max(0, (currentScrollY / docHeight) * 100));
        setScrollProgress(pct);
      }

      if (currentScrollY > 100) {
        if (currentScrollY > lastScrollY.current + 10) {
          // Scrolling down
          setControlsVisible(false);
        } else if (currentScrollY < lastScrollY.current - 10) {
          // Scrolling up
          setControlsVisible(true);
        }
      } else {
        setControlsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard Navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        if (settings.mode === 'single') {
          setSinglePageIndex((prev) => Math.min(totalPages - 1, prev + 1));
        } else if (settings.mode === 'double') {
          setSinglePageIndex((prev) => Math.min(totalPages - 1, prev + 2));
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        if (settings.mode === 'single') {
          setSinglePageIndex((prev) => Math.max(0, prev - 1));
        } else if (settings.mode === 'double') {
          setSinglePageIndex((prev) => Math.max(0, prev - 2));
        }
      }
    },
    [settings.mode, totalPages]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleNavigateChapter = (chSlug: string) => {
    navigate(`/chapter/${chSlug}`);
  };

  // Background color selection
  const bgClass =
    settings.background === 'black'
      ? 'bg-black text-slate-200'
      : settings.background === 'gray'
      ? 'bg-[#182030] text-slate-200'
      : 'bg-[#0a0d18] text-slate-200'; // dark default

  if (chapterLoading) {
    return <ReaderSkeleton />;
  }

  if (chapterError || !chapter) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-2xl bg-card border border-white/5 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Failed to load chapter</h2>
          <p className="text-sm text-slate-400">
            {(chapterError as any)?.message ||
              'We were unable to retrieve images for this chapter. Please try again.'}
          </p>
          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={() => refetchChapter()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-indigo text-white font-semibold text-sm hover:bg-accent-indigo/90"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <Link
              to={parentSlugGuess ? `/manga/${parentSlugGuess}` : '/'}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold text-sm hover:text-white"
            >
              Back to Manga
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`min-h-screen transition-colors duration-300 ${bgClass}`}
      onClick={(e) => {
        // Toggle controls if clicking on the background margin
        if (e.target === containerRef.current) {
          setControlsVisible((prev) => !prev);
        }
      }}
    >
      {/* Top Controls Header */}
      <ReaderControls
        title={chapter.title}
        mangaSlug={parentSlugGuess}
        navigation={chapter.navigation}
        visible={controlsVisible}
        settings={settings}
        onUpdateSettings={updateSettings}
        currentPage={singlePageIndex}
        totalPages={totalPages}
        onNavigateChapter={handleNavigateChapter}
        allChapters={parentDetail?.chapters || []}
        currentChapterSlug={slug}
      />

      {/* Progress Bar at the Top */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-black/30">
        <div
          className="h-full bg-gradient-to-r from-accent-indigo to-accent-cyan transition-all duration-150"
          style={{
            width:
              settings.mode === 'vertical'
                ? `${scrollProgress}%`
                : `${((singlePageIndex + 1) / totalPages) * 100}%`,
          }}
        />
      </div>

      {/* Main Content Area */}
      <div className="pt-16 pb-24 max-w-5xl mx-auto px-2 sm:px-4">
        {/* Empty Chapter Warning */}
        {images.length === 0 ? (
          <div className="py-24 text-center space-y-3">
            <BookOpen className="w-12 h-12 text-slate-500 mx-auto" />
            <h3 className="text-lg font-bold text-white">No images available</h3>
            <p className="text-sm text-slate-400">
              This chapter does not have readable images yet from the provider.
            </p>
          </div>
        ) : settings.mode === 'vertical' ? (
          /* Mode 1: Vertical Continuous Scroll */
          <div
            className="flex flex-col items-center"
            style={{ rowGap: `${settings.gap}px` }}
          >
            {images.map((imgUrl, idx) => (
              <ReaderImage
                key={`${imgUrl}-${idx}`}
                src={imgUrl}
                index={idx}
                total={totalPages}
                fit={settings.fit}
              />
            ))}
          </div>
        ) : settings.mode === 'single' ? (
          /* Mode 2: Single Page View */
          <div className="flex flex-col items-center space-y-4">
            <div
              className="relative w-full flex items-center justify-center cursor-pointer select-none"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                if (clickX > rect.width / 2) {
                  // Clicked right side -> Next page
                  setSinglePageIndex((prev) => Math.min(totalPages - 1, prev + 1));
                } else {
                  // Clicked left side -> Prev page
                  setSinglePageIndex((prev) => Math.max(0, prev - 1));
                }
              }}
            >
              <ReaderImage
                key={images[singlePageIndex]}
                src={images[singlePageIndex]}
                index={singlePageIndex}
                total={totalPages}
                fit={settings.fit}
              />
            </div>

            {/* Single Page Navigation Buttons */}
            <div className="flex items-center justify-between w-full max-w-lg px-4 py-3 rounded-2xl bg-surface/90 border border-white/5 backdrop-blur-md">
              <button
                onClick={() => setSinglePageIndex((prev) => Math.max(0, prev - 1))}
                disabled={singlePageIndex === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-card hover:bg-slate-800 disabled:opacity-30 text-white text-xs font-semibold"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <span className="text-xs font-bold text-slate-300">
                {singlePageIndex + 1} / {totalPages}
              </span>

              <button
                onClick={() => setSinglePageIndex((prev) => Math.min(totalPages - 1, prev + 1))}
                disabled={singlePageIndex >= totalPages - 1}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-indigo hover:bg-accent-indigo/90 disabled:opacity-30 text-white text-xs font-semibold"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Mode 3: Double Page View */
          <div className="flex flex-col items-center space-y-4">
            <div className="flex flex-row justify-center items-center gap-2 max-w-full overflow-hidden">
              {singlePageIndex < totalPages && (
                <div className="flex-1 max-w-[50%]">
                  <ReaderImage
                    src={images[singlePageIndex]}
                    index={singlePageIndex}
                    total={totalPages}
                    fit="height"
                  />
                </div>
              )}
              {singlePageIndex + 1 < totalPages && (
                <div className="flex-1 max-w-[50%]">
                  <ReaderImage
                    src={images[singlePageIndex + 1]}
                    index={singlePageIndex + 1}
                    total={totalPages}
                    fit="height"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between w-full max-w-lg px-4 py-3 rounded-2xl bg-surface/90 border border-white/5 backdrop-blur-md">
              <button
                onClick={() => setSinglePageIndex((prev) => Math.max(0, prev - 2))}
                disabled={singlePageIndex === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-card hover:bg-slate-800 disabled:opacity-30 text-white text-xs font-semibold"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <span className="text-xs font-bold text-slate-300">
                Pages {singlePageIndex + 1}
                {singlePageIndex + 1 < totalPages ? `-${singlePageIndex + 2}` : ''} of {totalPages}
              </span>

              <button
                onClick={() => setSinglePageIndex((prev) => Math.min(totalPages - 1, prev + 2))}
                disabled={singlePageIndex >= totalPages - 2}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-indigo hover:bg-accent-indigo/90 disabled:opacity-30 text-white text-xs font-semibold"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* End of Chapter Card */}
        <div className="mt-14 p-6 sm:p-8 rounded-3xl bg-surface border border-white/10 text-center space-y-5 max-w-xl mx-auto shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-bold text-white">
              You've finished this chapter!
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              {chapter.title} has concluded. What would you like to read next?
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {chapter.navigation.prev && (
              <button
                onClick={() => handleNavigateChapter(chapter.navigation.prev!)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card hover:bg-slate-800 text-slate-200 text-xs sm:text-sm font-semibold border border-white/5"
              >
                <ChevronLeft className="w-4 h-4" />
                Prev Chapter
              </button>
            )}

            {parentSlugGuess && (
              <Link
                to={`/manga/${parentSlugGuess}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card hover:bg-slate-800 text-slate-200 text-xs sm:text-sm font-semibold border border-white/5"
              >
                <ArrowLeft className="w-4 h-4" />
                Chapter List
              </Link>
            )}

            {chapter.navigation.next && (
              <button
                onClick={() => handleNavigateChapter(chapter.navigation.next!)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-indigo hover:bg-accent-indigo/90 text-white text-xs sm:text-sm font-bold shadow-lg shadow-accent-indigo/30"
              >
                Next Chapter
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
