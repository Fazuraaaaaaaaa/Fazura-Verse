import React, { useEffect, Suspense, lazy } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { PageSkeletonLoader } from './components/PageSkeletonLoader';
import { ErrorBoundary } from './components/ErrorBoundary';
import { OfflineStatusBanner } from './components/OfflineStatusBanner';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { MusicProvider, useMusic } from './context/MusicContext';
import { MobileBottomNav } from './components/MobileBottomNav';

// Lazy-load Music overlays so they never block critical path initial JS
const MusicPlayerBar = lazy(() =>
  import('./components/music/MusicPlayerBar').then((m) => ({ default: m.MusicPlayerBar }))
);
const LyricsModal = lazy(() =>
  import('./components/music/LyricsModal').then((m) => ({ default: m.LyricsModal }))
);

// Route-level code-splitting with React.lazy
const LandingPage = lazy(() => import('./pages/LandingPage').then((m) => ({ default: m.LandingPage })));
const BrowsePage = lazy(() => import('./pages/BrowsePage').then((m) => ({ default: m.BrowsePage })));
const MangaDetailPage = lazy(() => import('./pages/MangaDetailPage').then((m) => ({ default: m.MangaDetailPage })));
const ReaderPage = lazy(() => import('./pages/ReaderPage').then((m) => ({ default: m.ReaderPage })));
const SearchPage = lazy(() => import('./pages/SearchPage').then((m) => ({ default: m.SearchPage })));
const BookmarksPage = lazy(() => import('./pages/BookmarksPage').then((m) => ({ default: m.BookmarksPage })));
const HistoryPage = lazy(() => import('./pages/HistoryPage').then((m) => ({ default: m.HistoryPage })));
const AnimeHubPage = lazy(() => import('./pages/AnimeHubPage').then((m) => ({ default: m.AnimeHubPage })));
const AnimeDetailPage = lazy(() => import('./pages/AnimeDetailPage').then((m) => ({ default: m.AnimeDetailPage })));
const AnimeWatchPage = lazy(() => import('./pages/AnimeWatchPage').then((m) => ({ default: m.AnimeWatchPage })));
const DonghuaHubPage = lazy(() => import('./pages/DonghuaHubPage').then((m) => ({ default: m.DonghuaHubPage })));
const DonghuaDetailPage = lazy(() => import('./pages/DonghuaDetailPage').then((m) => ({ default: m.DonghuaDetailPage })));
const DonghuaWatchPage = lazy(() => import('./pages/DonghuaWatchPage').then((m) => ({ default: m.DonghuaWatchPage })));
const MovieHubPage = lazy(() => import('./pages/MovieHubPage').then((m) => ({ default: m.MovieHubPage })));
const MovieDetailPage = lazy(() => import('./pages/MovieDetailPage').then((m) => ({ default: m.MovieDetailPage })));
const MovieWatchPage = lazy(() => import('./pages/MovieWatchPage').then((m) => ({ default: m.MovieWatchPage })));
const MusicHubPage = lazy(() => import('./pages/MusicHubPage').then((m) => ({ default: m.MusicHubPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isReaderPage = location.pathname.startsWith('/chapter/');
  const { currentTrack, isPlayerDismissed, showLyrics } = useMusic();
  const hasActivePlayer = Boolean(currentTrack && !isPlayerDismissed && !isReaderPage);

  return (
    <div className="min-h-screen flex flex-col bg-[#12141B] text-[#F2F0EC] selection:bg-[#F0A15B] selection:text-[#0B0C10] relative w-full overflow-x-hidden min-w-0">
      {!isReaderPage && <OfflineStatusBanner />}
      {!isReaderPage && <Navbar />}
      <main
        className={`flex-1 flex flex-col w-full min-w-0 ${
          hasActivePlayer ? 'pb-44 md:pb-28' : 'pb-16 md:pb-0'
        }`}
      >
        {children}
      </main>
      {!isReaderPage && <Footer />}
      {hasActivePlayer && (
        <Suspense fallback={null}>
          <MusicPlayerBar />
        </Suspense>
      )}
      {showLyrics && (
        <Suspense fallback={null}>
          <LyricsModal />
        </Suspense>
      )}
      {!isReaderPage && <MobileBottomNav />}
      {!isReaderPage && <PWAInstallBanner />}
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MusicProvider>
        <Router>
          <ScrollToTop />
          <Layout>
            <ErrorBoundary>
              <Suspense fallback={<PageSkeletonLoader />}>
                <Routes>
                  {/* Grand Landing Portal */}
                  <Route path="/" element={<LandingPage />} />

                  {/* Manga Portal */}
                  <Route path="/manga" element={<BrowsePage />} />
                  <Route path="/browse" element={<BrowsePage />} />
                  <Route path="/manga/:slug" element={<MangaDetailPage />} />
                  <Route path="/chapter/:slug" element={<ReaderPage />} />
                  <Route path="/search" element={<SearchPage />} />

                  {/* Anime Portal */}
                  <Route path="/anime" element={<AnimeHubPage />} />
                  <Route path="/anime/detail/:provider/:id" element={<AnimeDetailPage />} />
                  <Route path="/anime/watch/:provider/:episodeId" element={<AnimeWatchPage />} />

                  {/* Donghua Portal */}
                  <Route path="/donghua" element={<DonghuaHubPage />} />
                  <Route path="/donghua/detail/:slug" element={<DonghuaDetailPage />} />
                  <Route path="/donghua/watch/:slug" element={<DonghuaWatchPage />} />

                  {/* Movie & Series Portal */}
                  <Route path="/movies" element={<MovieHubPage />} />
                  <Route path="/movies/:id" element={<MovieDetailPage />} />
                  <Route path="/movies/watch/:id" element={<MovieWatchPage />} />
                  <Route path="/movies/:id/watch" element={<MovieWatchPage />} />

                  {/* Music Portal */}
                  <Route path="/music" element={<MusicHubPage />} />

                  {/* Personal Library */}
                  <Route path="/bookmarks" element={<BookmarksPage />} />
                  <Route path="/history" element={<HistoryPage />} />

                  {/* Fallback */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </Layout>
        </Router>
      </MusicProvider>
    </QueryClientProvider>
  );
}
