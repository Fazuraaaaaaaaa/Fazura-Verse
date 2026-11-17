import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Flame,
  Clock,
  Sparkles,
  Award,
  Palette,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  getLatest,
  getPopular,
  getRecommendations,
  getTop,
  getColored,
  getGenres,
} from '../services/api';
import { MangaHero } from '../components/MangaHero';
import { MangaGrid } from '../components/MangaGrid';
import { ContinueReadingBanner } from '../components/ContinueReadingBanner';
import { GenreChips } from '../components/GenreChips';
import { useNavigate } from 'react-router-dom';

export function HomePage() {
  const navigate = useNavigate();

  // Queries for homepage sections
  const { data: recData, isLoading: recLoading } = useQuery({
    queryKey: ['recommendations'],
    queryFn: getRecommendations,
  });

  const { data: latestData, isLoading: latestLoading } = useQuery({
    queryKey: ['latest', 1],
    queryFn: () => getLatest(1),
  });

  const { data: popularData, isLoading: popularLoading } = useQuery({
    queryKey: ['popular'],
    queryFn: getPopular,
  });

  const { data: topData, isLoading: topLoading } = useQuery({
    queryKey: ['top'],
    queryFn: getTop,
  });

  const { data: coloredData, isLoading: coloredLoading } = useQuery({
    queryKey: ['colored', 1],
    queryFn: () => getColored(1),
  });

  const { data: genreData, isLoading: genreLoading } = useQuery({
    queryKey: ['genres'],
    queryFn: getGenres,
  });

  const featuredList = recData?.komikList?.length
    ? recData.komikList
    : popularData?.komikList || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12">
      {/* 1. Hero Spotlight Carousel */}
      <section>
        <MangaHero items={featuredList} isLoading={recLoading && popularLoading} />
      </section>

      {/* 2. Continue Reading Banner (if active) */}
      <section>
        <ContinueReadingBanner />
      </section>

      {/* 3. Quick Genre Tags */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent-cyan" />
            Explore Genres
          </h2>
          <Link
            to="/browse?tab=genres"
            className="text-xs font-semibold text-accent-indigo hover:text-accent-cyan transition-colors"
          >
            All Genres →
          </Link>
        </div>
        <GenreChips
          genres={genreData?.genres || []}
          isLoading={genreLoading}
          onSelectGenre={(slug) => {
            if (slug) {
              navigate(`/browse?genre=${encodeURIComponent(slug)}`);
            } else {
              navigate('/browse');
            }
          }}
        />
      </section>

      {/* 4. Latest Updates Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="space-y-0.5">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-emerald-400" />
              Latest Updates
            </h2>
            <p className="text-xs text-slate-400">
              Freshly translated chapters directly from BacaKomik
            </p>
          </div>
          <Link
            to="/browse?tab=latest"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card hover:bg-slate-800 text-slate-300 hover:text-white border border-white/5 text-xs font-semibold transition-all"
          >
            View More
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <MangaGrid
          items={latestData?.komikList?.slice(0, 12)}
          isLoading={latestLoading}
          skeletonCount={12}
        />
      </section>

      {/* 5. Popular Manga Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="space-y-0.5">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
              <Flame className="w-5 h-5 text-amber-400" />
              Popular Manga
            </h2>
            <p className="text-xs text-slate-400">
              Most trending and most read titles by readers
            </p>
          </div>
          <Link
            to="/browse?tab=popular"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card hover:bg-slate-800 text-slate-300 hover:text-white border border-white/5 text-xs font-semibold transition-all"
          >
            View Ranking
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <MangaGrid
          items={popularData?.komikList?.slice(0, 12)}
          isLoading={popularLoading}
          skeletonCount={12}
          showRanking
        />
      </section>

      {/* 6. Top Ranked Comics */}
      {topData?.komikList && topData.komikList.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="space-y-0.5">
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
                <Award className="w-5 h-5 text-accent-indigo" />
                Top Rated Hall of Fame
              </h2>
              <p className="text-xs text-slate-400">
                Highest rated manga across all categories
              </p>
            </div>
            <Link
              to="/browse?tab=top"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card hover:bg-slate-800 text-slate-300 hover:text-white border border-white/5 text-xs font-semibold transition-all"
            >
              All Top
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <MangaGrid
            items={topData?.komikList?.slice(0, 6)}
            isLoading={topLoading}
            skeletonCount={6}
          />
        </section>
      )}

      {/* 7. Colored Comics (Komik Berwarna) */}
      {coloredData?.komikList && coloredData.komikList.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="space-y-0.5">
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
                <Palette className="w-5 h-5 text-accent-purple" />
                Full Color Comics
              </h2>
              <p className="text-xs text-slate-400">
                Vibrant manhwa & manhua in full visual color
              </p>
            </div>
            <Link
              to="/browse?tab=colored"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card hover:bg-slate-800 text-slate-300 hover:text-white border border-white/5 text-xs font-semibold transition-all"
            >
              View Colored
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <MangaGrid
            items={coloredData?.komikList?.slice(0, 6)}
            isLoading={coloredLoading}
            skeletonCount={6}
          />
        </section>
      )}
    </div>
  );
}
