import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Info, ChevronLeft, ChevronRight, Star, Flame } from 'lucide-react';
import type { MangaItem } from '../types/manga';
import { HeroSkeleton } from './SkeletonLoader';

interface MangaHeroProps {
  items?: MangaItem[];
  isLoading?: boolean;
}

export function MangaHero({ items = [], isLoading = false }: MangaHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Take up to 6 featured manga
  const featured = items.slice(0, 6);

  useEffect(() => {
    if (featured.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featured.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [featured.length]);

  if (isLoading) {
    return <HeroSkeleton />;
  }

  if (featured.length === 0) {
    return null;
  }

  const current = featured[currentIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentIndex((prev) => (prev === 0 ? featured.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentIndex((prev) => (prev + 1) % featured.length);
  };

  const rawType = (current.type || 'manga').toLowerCase().trim();
  const typeBadgeColors =
    rawType === 'manhwa'
      ? 'bg-purple-500/90 text-white border-purple-400/40'
      : rawType === 'manhua'
      ? 'bg-emerald-500/90 text-white border-emerald-400/40'
      : 'bg-indigo-500/90 text-white border-indigo-400/40';

  return (
    <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-card border border-white/10 shadow-2xl min-h-[380px] sm:min-h-[460px] flex items-end">
      {/* Background Cover Image with Blur Backdrop */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={current.cover}
          alt={current.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter blur-xl scale-110 opacity-30 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 w-full p-6 sm:p-10 flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
        <div className="max-w-2xl space-y-4 text-center md:text-left">
          {/* Badges */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent-indigo/20 border border-accent-indigo/40 text-accent-indigo text-xs font-bold uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 text-accent-cyan" />
              Spotlight #{currentIndex + 1}
            </span>
            <span
              className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${typeBadgeColors}`}
            >
              {current.type || 'Manga'}
            </span>
            {current.rating && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
                <Star className="w-3 h-3 fill-amber-300" />
                {current.rating}
              </span>
            )}
            {current.chapter && (
              <span className="px-2.5 py-1 rounded-full bg-card/80 border border-white/10 text-accent-cyan text-xs font-semibold">
                {current.chapter}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight line-clamp-2">
            {current.title}
          </h1>

          {/* Description snippet */}
          <p className="text-slate-300 text-sm sm:text-base line-clamp-2 max-w-xl">
            {current.date ? `Update rilis ${current.date} di BacaKomik. ` : ''}
            Baca bab terbaru {current.title} dengan kualitas gambar jernih dan mode reader Webtoon di FAZURAVERSE.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
            <Link
              to={`/manga/${current.slug}`}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all transform hover:scale-[1.02]"
            >
              <BookOpen className="w-4 h-4" />
              Baca Sekarang
            </Link>
            <Link
              to={`/manga/${current.slug}`}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-card/90 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-sm border border-white/10 transition-all"
            >
              <Info className="w-4 h-4" />
              Detail Komik
            </Link>
          </div>
        </div>

        {/* Big Cover Poster for Desktop */}
        <div className="hidden md:flex flex-col items-center shrink-0">
          <Link
            to={`/manga/${current.slug}`}
            className="group relative w-44 lg:w-52 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10 hover:border-accent-indigo transition-all transform hover:scale-105"
          >
            <img
              src={current.cover}
              alt={current.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-3">
              <span className="text-xs font-bold text-white bg-accent-indigo px-3 py-1 rounded-lg">
                Explore Title
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* Navigation Arrows & Indicators */}
      {featured.length > 1 && (
        <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-20 flex items-center gap-2">
          <button
            onClick={handlePrev}
            aria-label="Previous slide"
            className="w-9 h-9 rounded-xl bg-surface/80 hover:bg-surface text-slate-300 hover:text-white border border-white/10 backdrop-blur-md flex items-center justify-center transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex gap-1.5 px-2">
            {featured.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentIndex === idx
                    ? 'w-6 bg-accent-indigo'
                    : 'w-2 bg-slate-600 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
          <button
            onClick={handleNext}
            aria-label="Next slide"
            className="w-9 h-9 rounded-xl bg-surface/80 hover:bg-surface text-slate-300 hover:text-white border border-white/10 backdrop-blur-md flex items-center justify-center transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
