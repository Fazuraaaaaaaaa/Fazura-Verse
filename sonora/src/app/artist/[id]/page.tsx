'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { BadgeCheck, Heart, MoreHorizontal, UserCheck, UserPlus } from 'lucide-react';
import { Artist, Track } from '@/types/music';
import { fetchArtist } from '@/lib/api';
import TrackTable from '@/components/track/TrackTable';
import AlbumCard from '@/components/cards/AlbumCard';
import ArtistCard from '@/components/cards/ArtistCard';
import PlayButton from '@/components/common/PlayButton';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { useLibraryStore } from '@/stores/useLibraryStore';

export default function ArtistPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);

  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayerStore();
  const { isArtistFollowed, toggleFollowArtist } = useLibraryStore();

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    setLoading(true);

    fetchArtist(id)
      .then((data) => {
        if (isMounted) {
          setArtist(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Artist fetch error:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 text-center text-[#B3B3B3]">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#1DB954] border-r-transparent" />
        <p className="mt-3 text-sm">Loading artist profile...</p>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="py-20 text-center text-[#B3B3B3]">
        <h2 className="text-xl font-bold text-white mb-2">Artist not found</h2>
        <p className="text-sm">We could not locate this artist.</p>
      </div>
    );
  }

  const followed = isArtistFollowed(artist.id);

  const hasTopTracks = artist.topTracks && artist.topTracks.length > 0;
  const isArtistPlaying = Boolean(
    hasTopTracks &&
    currentTrack &&
    artist.topTracks?.some((t) => t.id === currentTrack.id || t.youtubeId === currentTrack.youtubeId) &&
    isPlaying
  );

  const handlePlayArtist = () => {
    if (!hasTopTracks) return;
    if (isArtistPlaying) {
      togglePlay();
    } else {
      playTrack(artist.topTracks![0], artist.topTracks);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Banner Header */}
      <div
        className="relative -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 flex min-h-[260px] sm:min-h-[340px] flex-col justify-end p-6 sm:p-10 bg-cover bg-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(18,18,18,0.9) 100%), url(${
            artist.banner || artist.avatar
          })`,
        }}
      >
        <div className="relative z-10 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-white">
            <BadgeCheck size={24} className="fill-[#3D91F4] text-white" />
            <span className="text-sm font-semibold">Verified Artist</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight drop-shadow-md">
            {artist.name}
          </h1>

          <p className="text-sm sm:text-base font-medium text-white/90 drop-shadow">
            {artist.monthlyListeners ? `${artist.monthlyListeners} monthly listeners` : ''}
          </p>
        </div>
      </div>

      {/* Action Controls Bar */}
      <div className="flex items-center gap-4 sm:gap-6 py-2">
        <PlayButton
          size="lg"
          isPlaying={isArtistPlaying}
          onClick={handlePlayArtist}
        />

        <button
          type="button"
          onClick={() => toggleFollowArtist(artist)}
          className={`flex items-center gap-2 rounded-full border px-5 py-1.5 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 ${
            followed
              ? 'border-white/40 bg-white/10 text-white'
              : 'border-[#B3B3B3] text-white hover:border-white'
          }`}
        >
          {followed ? (
            <>
              <UserCheck size={16} />
              <span>Following</span>
            </>
          ) : (
            <>
              <UserPlus size={16} />
              <span>Follow</span>
            </>
          )}
        </button>
      </div>

      {/* Popular Tracks */}
      {artist.topTracks && artist.topTracks.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Popular</h2>
          <TrackTable tracks={artist.topTracks} showAlbum={true} />
        </section>
      )}

      {/* Discography: Albums */}
      {artist.albums && artist.albums.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Albums</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {artist.albums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </section>
      )}

      {/* Discography: Singles & EPs */}
      {artist.singles && artist.singles.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Singles & EPs</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {artist.singles.map((single) => (
              <AlbumCard key={single.id} album={single} />
            ))}
          </div>
        </section>
      )}

      {/* About Section */}
      {artist.bio && (
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-white">About</h2>
          <div className="rounded-lg bg-[#181818] p-6 max-w-3xl space-y-3 text-sm sm:text-base text-[#B3B3B3] leading-relaxed">
            <p>{artist.bio}</p>
            {artist.monthlyListeners && (
              <div className="pt-2 text-white font-bold text-lg">
                {artist.monthlyListeners} monthly listeners
              </div>
            )}
          </div>
        </section>
      )}

      {/* Related Artists */}
      {artist.relatedArtists && artist.relatedArtists.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Fans Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {artist.relatedArtists.map((rel) => (
              <ArtistCard key={rel.id} artist={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
