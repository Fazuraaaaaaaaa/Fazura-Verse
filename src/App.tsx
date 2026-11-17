import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { HomePage } from './pages/HomePage';
import { BrowsePage } from './pages/BrowsePage';
import { MangaDetailPage } from './pages/MangaDetailPage';
import { ReaderPage } from './pages/ReaderPage';
import { SearchPage } from './pages/SearchPage';
import { BookmarksPage } from './pages/BookmarksPage';
import { HistoryPage } from './pages/HistoryPage';
import { AnimeHubPage } from './pages/AnimeHubPage';
import { AnimeDetailPage } from './pages/AnimeDetailPage';
import { AnimeWatchPage } from './pages/AnimeWatchPage';
import { DonghuaHubPage } from './pages/DonghuaHubPage';
import { DonghuaDetailPage } from './pages/DonghuaDetailPage';
import { DonghuaWatchPage } from './pages/DonghuaWatchPage';
import { MovieHubPage } from './pages/MovieHubPage';
import { MovieDetailPage } from './pages/MovieDetailPage';
import { MovieWatchPage } from './pages/MovieWatchPage';

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

  return (
    <div className="min-h-screen flex flex-col bg-background text-slate-100 selection:bg-accent-indigo selection:text-white">
      {!isReaderPage && <Navbar />}
      <main className="flex-1">{children}</main>
      {!isReaderPage && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ScrollToTop />
        <Layout>
          <Routes>
            {/* Grand Landing Portal */}
            <Route path="/" element={<LandingPage />} />

            {/* Manga Portal */}
            <Route path="/manga" element={<BrowsePage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/manga/:slug" element={<MangaDetailPage />} />
            <Route path="/chapter/:slug" element={<ReaderPage />} />
            <Route path="/search" element={<SearchPage />} />

            {/* Anime Portal (Otakudesu & Samehadaku) */}
            <Route path="/anime" element={<AnimeHubPage />} />
            <Route path="/anime/detail/:provider/:id" element={<AnimeDetailPage />} />
            <Route path="/anime/watch/:provider/:episodeId" element={<AnimeWatchPage />} />

            {/* Donghua Portal (Anichin) */}
            <Route path="/donghua" element={<DonghuaHubPage />} />
            <Route path="/donghua/detail/:slug" element={<DonghuaDetailPage />} />
            <Route path="/donghua/watch/:slug" element={<DonghuaWatchPage />} />

            {/* Movie & Series Portal (FazuraDex Movie & Live TMDB) */}
            <Route path="/movies" element={<MovieHubPage />} />
            <Route path="/movies/:id" element={<MovieDetailPage />} />
            <Route path="/movies/watch/:id" element={<MovieWatchPage />} />
            <Route path="/movies/:id/watch" element={<MovieWatchPage />} />

            {/* Personal Library */}
            <Route path="/bookmarks" element={<BookmarksPage />} />
            <Route path="/history" element={<HistoryPage />} />

            {/* Fallback */}
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </Layout>
      </Router>
    </QueryClientProvider>
  );
}
