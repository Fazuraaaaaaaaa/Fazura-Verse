'use client';

import React, { useEffect, useState } from 'react';
import QuickPickCard from '@/components/cards/QuickPickCard';
import SectionCarousel from '@/components/cards/SectionCarousel';
import { HomeFeedSection, Track } from '@/types/music';
import { fetchHomeFeed } from '@/lib/api';
import { MOCK_TRACKS } from '@/lib/mockData';
import { useLibraryStore } from '@/stores/useLibraryStore';

export default function HomePage() {
  const [sections, setSections] = useState<HomeFeedSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('Good day');
  const { listeningHistory } = useLibraryStore();

  useEffect(() => {
    // Time-based greeting calculation
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

  // Top 6 quick pick items (from history if available or mock tracks)
  const quickPickTracks: Track[] =
    listeningHistory.length >= 6
      ? listeningHistory.slice(0, 6).map((h) => h.track)
      : MOCK_TRACKS.slice(0, 6);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header & Quick Picks */}
      <section className="pt-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-4 sm:mb-6">
          {greeting}
        </h1>

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

      {/* Dynamic Carousels */}
      {loading ? (
        <div className="space-y-8 py-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="space-y-3">
              <div className="h-6 w-48 rounded bg-white/10 animate-pulse" />
              <div className="flex gap-4">
                {[1, 2, 3, 4, 5].map((card) => (
                  <div
                    key={card}
                    className="h-48 w-40 flex-shrink-0 rounded-md bg-white/5 animate-pulse"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        sections.map((section) => (
          <SectionCarousel
            key={section.id}
            id={section.id}
            title={section.title}
            subtitle={section.subtitle}
            type={section.type}
            items={section.items}
          />
        ))
      )}
    </div>
  );
}
