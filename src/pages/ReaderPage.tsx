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
  Sparkles,
} from 'lucide-react';
import { getChapter, getDetail } from '../services/api';
import { useReaderSettings } from '../hooks/useReaderSettings';
import { useReadingHistory } from '../hooks/useReadingHistory';
import { ReaderControls } from '../components/reader/ReaderControls';
import { ReaderImage } from '../components/reader/ReaderImage';
import { ReaderSkeleton } from '../components/SkeletonLoader';
import { usePageMeta } from '../hooks/usePageMeta';

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
  const isRtl = settings.direction === 'rtl';

  usePageMeta({
    title: chapter?.title
      ? `${chapter.title} - Baca Komik`
      : 'Baca Komik - FazuraStream Reader',
    description: parentDetail?.title
      ? `Baca ${chapter?.title || 'chapter terbaru'} dari ${parentDetail.title} sub Indo gratis di FazuraStream.`
      : 'Baca komik manga, manhwa & manhua kualitas HD di FazuraStream Reader.',
    image: parentDetail?.cover || images[0],
    type: 'article',
  });

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

  // Keyboard Navigation (respects LTR / RTL reading direction)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (settings.mode !== 'single' && settings.mode !== 'double') return;
      const step = settings.mode === 'double' ? 2 : 1;
      const goNext = () =>
        setSinglePageIndex((prev) => Math.min(Math.max(0, totalPages - 1), prev + step));
      const goPrev = () => setSinglePageIndex((prev) => Math.max(0, prev - step));

      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        if (isRtl) goPrev();
        else goNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        if (isRtl) goNext();
        else goPrev();
      }
    },
    [settings.mode, totalPages, isRtl]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleNavigateChapter = (chSlug: string) => {
    navigate(`/chapter/${chSlug}`);
  };

  // Background color selection matching Phase 2 tokens (deep reading black/obsidian)
  const bgClass =
    settings.background === 'black'
      ? 'bg-black text-[#F2F0EC]'
      : settings.background === 'gray'
      ? 'bg-[#191C25] text-[#F2F0EC]'
      : 'bg-[#0B0C10] text-[#F2F0EC]'; // obsidian dark default

  if (chapterLoading) {
    return <ReaderSkeleton />;
  }

  if (chapterError || !chapter) {
    return (
      <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-2xl bg-[#191C25] border border-[#343744] text-center space-y-5 shadow-dialog">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-[#F2F0EC] font-heading">Gagal Memuat Chapter</h2>
            <p className="text-xs text-[#A2A4B1]">
              {(chapterError as any)?.message ||
                'Tidak dapat mengambil gambar chapter ini dari server. Silakan coba kembali.'}
            </p>
          </div>
          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={() => refetchChapter()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#F0A15B] hover:bg-[#F6B779] text-[#0B0C10] font-bold text-xs transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Coba Lagi
            </button>
            <Link
              to={parentSlugGuess ? `/manga/${parentSlugGuess}` : '/manga'}
              className="px-5 py-2.5 rounded-[10px] bg-[#232633] hover:bg-[#343744] text-[#F2F0EC] font-semibold text-xs border border-[#343744] transition-colors"
            >
              Kembali ke Komik
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
      {/* Top Floating Controls Header */}
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
        chapterImages={chapter.images || []}
      />

      {/* Progress Bar at the Top */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-[#0B0C10]/80">
        <div
          className="h-full bg-[#F0A15B] transition-all duration-150"
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
            <BookOpen className="w-12 h-12 text-[#747887] mx-auto" />
            <h3 className="text-lg font-bold text-[#F2F0EC] font-heading">Gambar Tidak Tersedia</h3>
            <p className="text-xs text-[#A2A4B1]">
              Chapter ini belum memiliki gambar yang dapat dimuat dari penyedia sumber.
            </p>
          </div>
        ) : settings.mode === 'vertical' ? (
          /* Mode 1: Vertical Continuous Scroll (Webtoon) */
          <div
            className={`flex flex-col items-center transition-all ${
              settings.invertColors ? 'filter invert hue-rotate-180 contrast-105' : ''
            }`}
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
              className={`relative w-full flex items-center justify-center cursor-pointer select-none transition-all ${
                settings.invertColors ? 'filter invert hue-rotate-180 contrast-105' : ''
              }`}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const clickedRight = clickX > rect.width / 2;
                const advance = isRtl ? !clickedRight : clickedRight;
                if (advance) {
                  setSinglePageIndex((prev) => Math.min(totalPages - 1, prev + 1));
                } else {
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
            <div className="flex items-center justify-between w-full max-w-lg px-4 py-3 rounded-2xl bg-[#191C25]/95 border border-[#343744] backdrop-blur-md shadow-dialog">
              <button
                onClick={() => setSinglePageIndex((prev) => Math.max(0, prev - 1))}
                disabled={singlePageIndex === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] bg-[#232633] hover:bg-[#343744] disabled:opacity-35 text-[#F2F0EC] text-xs font-semibold border border-[#343744] transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Sebelumnya
              </button>

              <span className="text-xs font-bold text-[#75C9A0]">
                {singlePageIndex + 1} / {totalPages}
              </span>

              <button
                onClick={() => setSinglePageIndex((prev) => Math.min(totalPages - 1, prev + 1))}
                disabled={singlePageIndex >= totalPages - 1}
                className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] bg-[#F0A15B] hover:bg-[#F6B779] disabled:opacity-35 text-[#0B0C10] text-xs font-bold transition-colors"
              >
                Selanjutnya
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Mode 3: Double Page View */
          <div className="flex flex-col items-center space-y-4">
            <div
              className={`flex ${isRtl ? 'flex-row-reverse' : 'flex-row'} justify-center items-center gap-2 max-w-full overflow-hidden transition-all ${
                settings.invertColors ? 'filter invert hue-rotate-180 contrast-105' : ''
              }`}
            >
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

            <div className="flex items-center justify-between w-full max-w-lg px-4 py-3 rounded-2xl bg-[#191C25]/95 border border-[#343744] backdrop-blur-md shadow-dialog">
              <button
                onClick={() => setSinglePageIndex((prev) => Math.max(0, prev - 2))}
                disabled={singlePageIndex === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] bg-[#232633] hover:bg-[#343744] disabled:opacity-35 text-[#F2F0EC] text-xs font-semibold border border-[#343744] transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Sebelumnya
              </button>

              <span className="text-xs font-bold text-[#75C9A0]">
                Halaman {singlePageIndex + 1}
                {singlePageIndex + 1 < totalPages ? `-${singlePageIndex + 2}` : ''} dari {totalPages}
              </span>

              <button
                onClick={() => setSinglePageIndex((prev) => Math.min(totalPages - 1, prev + 2))}
                disabled={singlePageIndex >= totalPages - 2}
                className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] bg-[#F0A15B] hover:bg-[#F6B779] disabled:opacity-35 text-[#0B0C10] text-xs font-bold transition-colors"
              >
                Selanjutnya
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* End of Chapter Card */}
        <div className="mt-14 p-6 sm:p-8 rounded-2xl bg-[#191C25] border border-[#343744] text-center space-y-5 max-w-xl mx-auto shadow-dialog">
          <div className="w-14 h-14 rounded-2xl bg-[#232633] text-[#75C9A0] flex items-center justify-center mx-auto border border-[#75C9A0]/35">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-bold text-[#F2F0EC] font-heading">
              Selesai Membaca Chapter Ini!
            </h3>
            <p className="text-xs sm:text-sm text-[#A2A4B1]">
              Kamu telah menyelesaikan {chapter.title}. Lanjut ke chapter berikutnya?
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {chapter.navigation.prev && (
              <button
                onClick={() => handleNavigateChapter(chapter.navigation.prev!)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-[#232633] hover:bg-[#343744] text-[#F2F0EC] text-xs sm:text-sm font-semibold border border-[#343744] transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Chapter Sebelumnya
              </button>
            )}

            {parentSlugGuess && (
              <Link
                to={`/manga/${parentSlugGuess}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-[#232633] hover:bg-[#343744] text-[#F2F0EC] text-xs sm:text-sm font-semibold border border-[#343744] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Daftar Chapter
              </Link>
            )}

            {chapter.navigation.next && (
              <button
                onClick={() => handleNavigateChapter(chapter.navigation.next!)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#F0A15B] hover:bg-[#F6B779] text-[#0B0C10] text-xs sm:text-sm font-bold transition-colors"
              >
                Chapter Berikutnya
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Floating Non-Intrusive Reading Progress Indicator */}
      {totalPages > 0 && (
        <div
          aria-hidden="true"
          className="fixed bottom-4 right-4 z-40 px-3 py-1.5 rounded-full bg-[#191C25]/95 border border-[#343744] backdrop-blur-md text-[11px] font-mono font-bold text-[#A2A4B1] shadow-subtle-menu pointer-events-none"
        >
          {settings.mode === 'vertical'
            ? `${Math.round(scrollProgress)}% • ${totalPages} Hal`
            : `Hal ${singlePageIndex + 1} / ${totalPages}`}
        </div>
      )}
    </div>
  );
}
