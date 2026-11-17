'use client';

import React from 'react';
import Link from 'next/link';
import { Trash2, X, Music, Play, Pause, ListPlus } from 'lucide-react';
import { usePlayerStore } from '@/stores/usePlayerStore';
import TrackRow from '@/components/track/TrackRow';
import PlayButton from '@/components/common/PlayButton';
import LikeButton from '@/components/common/LikeButton';
import { formatDuration } from '@/lib/utils';

export default function QueuePage() {
  const {
    currentTrack,
    isPlaying,
    queue,
    queueIndex,
    togglePlay,
    playTrack,
    removeFromQueue,
    clearQueue,
  } = usePlayerStore();

  const nowPlaying = currentTrack;
  const nextInQueue = queue.slice(queueIndex + 1);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Play Queue</h1>
          <p className="text-xs sm:text-sm text-[#B3B3B3] mt-1">
            Manage songs currently queued to play
          </p>
        </div>

        {nextInQueue.length > 0 && (
          <button
            type="button"
            onClick={clearQueue}
            className="flex items-center gap-1.5 rounded-full border border-white/20 px-4 py-1.5 text-xs font-bold text-white hover:border-white hover:bg-white/10 transition-colors"
          >
            <Trash2 size={14} />
            <span>Clear Queue</span>
          </button>
        )}
      </div>

      {/* Now Playing Section */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#B3B3B3]">
          Now Playing
        </h2>

        {nowPlaying ? (
          <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-white/10 to-transparent p-4 sm:p-5 shadow">
            <div className="flex items-center gap-4 min-w-0">
              <div className="relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 rounded-md overflow-hidden bg-[#282828] shadow">
                {nowPlaying.thumbnail ? (
                  <img
                    src={nowPlaying.thumbnail}
                    alt={nowPlaying.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xl text-[#B3B3B3]">
                    <Music size={24} />
                  </div>
                )}
              </div>

              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-base sm:text-xl text-[#1DB954] truncate">
                  {nowPlaying.title}
                </span>
                <span className="text-xs sm:text-sm text-white/90 truncate mt-0.5">
                  {nowPlaying.artist}
                </span>
                {nowPlaying.album && (
                  <span className="text-xs text-[#B3B3B3] truncate mt-0.5">
                    {nowPlaying.album}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0 ml-4">
              <LikeButton track={nowPlaying} size={20} />
              <PlayButton size="md" isPlaying={isPlaying} onClick={togglePlay} />
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-[#B3B3B3] text-sm bg-white/5 rounded-lg">
            No song is currently playing. Pick a song to start listening!
          </div>
        )}
      </section>

      {/* Next In Queue Section */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#B3B3B3]">
          Next Up ({nextInQueue.length})
        </h2>

        {nextInQueue.length === 0 ? (
          <div className="py-12 text-center text-[#B3B3B3] text-sm bg-white/5 rounded-lg space-y-2">
            <ListPlus size={32} className="mx-auto opacity-40" />
            <p className="font-medium text-white">Your queue is empty</p>
            <p className="text-xs text-[#B3B3B3]">
              Add songs to your queue from any album, playlist, or song menu.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {nextInQueue.map((track, idx) => {
              const actualQueueIndex = queueIndex + 1 + idx;
              return (
                <div
                  key={`${track.id}-${actualQueueIndex}`}
                  className="group flex items-center justify-between rounded-md px-3 py-2 hover:bg-white/10 transition-colors select-none"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-xs font-semibold text-[#B3B3B3] w-5 text-right">
                      {idx + 1}
                    </span>
                    <div className="relative h-10 w-10 flex-shrink-0 rounded overflow-hidden bg-[#282828]">
                      {track.thumbnail ? (
                        <img
                          src={track.thumbnail}
                          alt={track.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-[#B3B3B3]">
                          ♪
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-white truncate">
                        {track.title}
                      </span>
                      <span className="text-xs text-[#B3B3B3] truncate">
                        {track.artist}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#B3B3B3] tabular-nums">
                      {track.durationFormatted || formatDuration(track.duration)}
                    </span>
                    <button
                      type="button"
                      title="Remove from queue"
                      onClick={() => removeFromQueue(actualQueueIndex)}
                      className="p-1 rounded-full text-[#B3B3B3] hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
