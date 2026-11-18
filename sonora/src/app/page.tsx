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

  // Spotlight featured track
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

  // Top 6 quick pick items
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
    <div className="space-y-8 sm:space-y-10 animate-in fade-in duration-300">
      {/* Dynamic Top Ambient Glow Header */}
      <div className="relative -mt-4 sm:-mt-6 -mx-3.5 sm:-mx-6 px-3.5 sm:px-6 pt-6 pb-2 bg-gradient-to-b from-[#183324]/60 via-[#121212]/40 to-transparent pointer-events-none" />

      {/* 1. Spotify Top Greeting & 6 Quick Picks */}
      <section className="space-y-4">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white drop-shadow-sm">
          {greeting}
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
          {quickPickTracks.map((track, idx) => (
            <QuickPickCard
              key={`${track.id}-${idx}`}
              track={track}
              playlistContext={quickPickTracks}
            />
          ))}
        </div>
      </section>

      {/* 2. Premium Spotlight Release Card */}
      <section className="relative overflow-hidden rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl border border-white/10 bg-gradient-to-r from-[#182822]/90 via-[#181818]/95 to-[#121212] backdrop-blur-xl group">
        {/* Subtle Spotify Green Ambient Glow */}
        <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full bg-[#1DB954]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 right-1/4 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-5 sm:gap-8">
          {/* Info Column */}
          <div className="flex flex-col gap-2.5 sm:gap-3 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1DB954]/20 border border-[#1DB954]/30 px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-[#1DB954]">
                <Sparkles size={12} className="text-[#1DB954]" />
                Spotlight Release
              </span>
              <span className="text-[11px] sm:text-xs font-semibold text-[#B3B3B3]">#1 Global Charts</span>
            </div>

            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              {featuredTrack.title}
            </h2>

            <p className="text-sm sm:text-base font-bold text-white/90">
              {featuredTrack.artist}
            </p>

            <p className="text-xs sm:text-sm text-[#B3B3B3] line-clamp-2 leading-relaxed">
              Global powerhouse collaboration uniting two of the world&apos;s greatest musical icons. Over 850 million streams worldwide.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handlePlayFeatured}
                className="flex items-center gap-2.5 rounded-full bg-[#1DB954] hover:bg-[#1ed760] px-5 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-sm font-extrabold text-black shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                {isFeaturedPlaying ? (
                  <>
                    <Pause size={17} className="fill-black" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play size={17} className="fill-black ml-0.5" />
                    <span>Play Now</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => toggleLikeSong(featuredTrack)}
                className={cn(
                  'flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 rounded-full border border-white/20 bg-black/40 hover:bg-black/60 hover:scale-105 active:scale-95 transition-all',
                  isFeaturedLiked ? 'text-[#1DB954] border-[#1DB954]' : 'text-white'
                )}
                title={isFeaturedLiked ? 'Saved to Liked Songs' : 'Save to Liked Songs'}
              >
                <Heart size={18} className={isFeaturedLiked ? 'fill-[#1DB954]' : ''} />
              </button>

              <Link
                href="/search?q=Lady+Gaga"
                className="flex items-center gap-1.5 rounded-full border border-white/20 px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white hover:border-white hover:bg-white/10 transition-colors"
              >
                <Compass size={15} />
                <span>Explore</span>
              </Link>
            </div>
          </div>

          {/* Artwork Preview */}
          <div className="relative flex-shrink-0 self-start sm:self-auto">
            <div className="relative h-32 w-32 sm:h-48 sm:w-48 md:h-56 md:w-56 rounded-xl overflow-hidden shadow-2xl bg-[#282828] border border-white/10 group/img">
              <img
                src={featuredTrack.thumbnail}
                alt={featuredTrack.title}
                className="h-full w-full object-cover group-hover/img:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. 17 Rich Discovery Shelves */}
      {loading ? (
        /* High-fidelity loading skeletons */
        <div className="space-y-10 py-4">
          {[1, 2, 3, 4].map((shelf) => (
            <div key={shelf} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-6 w-48 rounded-md bg-white/10 animate-pulse" />
                <div className="h-4 w-14 rounded-md bg-white/10 animate-pulse" />
              </div>
              <div className="flex gap-4 overflow-hidden">
                {[1, 2, 3, 4, 5, 6].map((card) => (
                  <div
                    key={card}
                    className="h-52 w-36 sm:w-44 flex-shrink-0 rounded-lg bg-white/5 p-3 space-y-3 animate-pulse"
                  >
                    <div className="aspect-square w-full rounded-md bg-white/10" />
                    <div className="h-3 w-3/4 rounded bg-white/10" />
                    <div className="h-2.5 w-1/2 rounded bg-white/10" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
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