'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Play, Pause, Heart, Sparkles, Compass, Flame } from 'lucide-react';
import QuickPickCard from '@/components/cards/QuickPickCard';
import SectionCarousel from '@/components/cards/SectionCarousel';
import { HomeFeedSection, Track } from '@/types/music';
import { fetchHomeFeed } from '@/lib/api';
import { MOCK_TRACKS } from '@/lib/mockData';
import { INDONESIAN_HITS } from '@/lib/api';
import { useLibraryStore } from '@/stores/useLibraryStore';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const [sections, setSections] = useState<HomeFeedSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('Good day');
  const { listeningHistory, isSongLiked, toggleLikeSong } = useLibraryStore();
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayerStore();

  useEffect(() => {
    // Dynamic Time-based Greeting
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }

    let isMounted = true;
    fetchHomeFeed()
      .then((data) => {
        if (isMounted) {
          setSections(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Home feed error:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Spotlight featured track (Die With A Smile or Satu Bulan)
  const featuredTrack: Track = {
    id: 'kPa7bsKwL-8',
    youtubeId: 'kPa7bsKwL-8',
    title: 'Die With A Smile',
    artist: 'Lady Gaga, Bruno Mars',
    album: 'Die With A Smile - Single',
    duration: 251,
    durationFormatted: '4:11',
    thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
    views: '850M',
    releaseDate: '2024',
  };

  const isFeaturedPlaying = Boolean(
    currentTrack &&
      ((currentTrack.id && currentTrack.id === featuredTrack.id) ||
        (currentTrack.youtubeId && currentTrack.youtubeId === featuredTrack.youtubeId)) &&
      isPlaying
  );

  const isFeaturedLiked = isSongLiked(featuredTrack.id) || isSongLiked(featuredTrack.youtubeId);

  const handlePlayFeatured = () => {
    if (isFeaturedPlaying) {
      togglePlay();
    } else {
      playTrack(featuredTrack, [featuredTrack, ...MOCK_TRACKS]);
    }
  };

  // Top 6 quick pick items (from history if available or top curated songs)
  const quickPickTracks: Track[] =
    listeningHistory.length >= 6
      ? listeningHistory.slice(0, 6).map((h) => h.track)
      : [
          INDONESIAN_HITS[0] || MOCK_TRACKS[0],
          featuredTrack,
          INDONESIAN_HITS[1] || MOCK_TRACKS[1],
          MOCK_TRACKS[5],
          INDONESIAN_HITS[2] || MOCK_TRACKS[2],
          MOCK_TRACKS[7],
        ];

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* 1. Premium Hero Billboard */}
      <section className="relative overflow-hidden rounded-2xl p-6 sm:p-10 shadow-2xl border border-white/10 bg-gradient-to-r from-[#431448]/80 via-[#1c182a]/90 to-[#121212]">
        {/* Ambient background glow */}
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-pink-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 right-1/4 h-80 w-80 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 sm:gap-8">
          {/* Billboard Info */}
          <div className="flex flex-col gap-3 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-md px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-pink-300 border border-pink-400/20">
                <Flame size={13} className="text-pink-400 fill-pink-400" />
                Featured Spotlight
              </span>
              <span className="text-xs font-semibold text-[#B3B3B3]">#1 Global Charts</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-none drop-shadow-md">
              {featuredTrack.title}
            </h1>

            <p className="text-base sm:text-lg font-bold text-white/90">
              {featuredTrack.artist}
            </p>

            <p className="text-xs sm:text-sm text-[#B3B3B3] line-clamp-2 leading-relaxed">
              The chart-topping global powerhouse collaboration uniting two of the world&apos;s greatest musical icons. Over 850 million streams worldwide.
            </p>

            {/* Action buttons */}
            <div className="flex items-center gap-4 pt-2">
              <button
                type="button"
                onClick={handlePlayFeatured}
                className="flex items-center gap-3 rounded-full bg-[#1DB954] hover:bg-[#1ed760] px-7 py-3 text-sm font-extrabold text-black shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                {isFeaturedPlaying ? (
                  <>
                    <Pause size={18} className="fill-black" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play size={18} className="fill-black ml-0.5" />
                    <span>Play Now</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => toggleLikeSong(featuredTrack)}
                className={cn(
                  'flex items-center justify-center h-11 w-11 rounded-full border border-white/20 bg-black/40 hover:bg-black/60 hover:scale-105 active:scale-95 transition-all',
                  isFeaturedLiked ? 'text-[#1DB954] border-[#1DB954]' : 'text-white'
                )}
                title={isFeaturedLiked ? 'Saved to Liked Songs' : 'Save to Liked Songs'}
              >
                <Heart size={20} className={isFeaturedLiked ? 'fill-[#1DB954]' : ''} />
              </button>

              <Link
                href="/search?q=Lady+Gaga"
                className="flex items-center gap-1.5 rounded-full border border-white/20 px-4 py-2.5 text-xs sm:text-sm font-bold text-white hover:border-white hover:bg-white/10 transition-colors"
              >
                <Compass size={16} />
                <span>Explore</span>
              </Link>
            </div>
          </div>

          {/* Large Album Artwork Preview with Vinyl Illusion */}
          <div className="relative flex-shrink-0 self-center md:self-auto">
            <div className="relative h-48 w-48 sm:h-64 sm:w-64 rounded-xl overflow-hidden shadow-2xl bg-[#282828] border border-white/10 group">
              <img
                src={featuredTrack.thumbnail}
                alt={featuredTrack.title}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-3 left-3 right-3 text-center">
                <span className="text-[11px] font-bold text-white uppercase tracking-wider bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full">
                  Sonora Premiere
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Top Quick Picks with Dynamic Greeting */}
      <section className="space-y-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          {greeting}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
          {quickPickTracks.map((track, idx) => (
            <QuickPickCard
              key={`${track.id}-${idx}`}
              track={track}
              playlistContext={quickPickTracks}
            />
          ))}
        </div>
      </section>

      {/* 3. 17 Rich Discovery Shelves */}
      {loading ? (
        /* High-fidelity loading skeletons */
        <div className="space-y-10 py-4">
          {[1, 2, 3, 4].map((shelf) => (
            <div key={shelf} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-7 w-56 rounded-md bg-white/10 animate-pulse" />
                <div className="h-5 w-16 rounded-md bg-white/10 animate-pulse" />
              </div>
              <div className="flex gap-4 overflow-hidden">
                {[1, 2, 3, 4, 5, 6].map((card) => (
                  <div
                    key={card}
                    className="h-56 w-44 flex-shrink-0 rounded-lg bg-white/5 p-4 space-y-3 animate-pulse"
                  >
                    <div className="aspect-square w-full rounded-md bg-white/10" />
                    <div className="h-4 w-3/4 rounded bg-white/10" />
                    <div className="h-3 w-1/2 rounded bg-white/10" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {sections.map((section) => (
            <SectionCarousel
              key={section.id}
              id={section.id}
              title={section.title}
              subtitle={section.subtitle}
              type={section.type}
              items={section.items}
            />
          ))}
        </div>
      )}
    </div>
  );
}
