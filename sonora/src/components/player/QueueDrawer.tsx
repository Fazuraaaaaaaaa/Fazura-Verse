'use client';

import React from 'react';
import { X, Play, Trash2, ListMusic, Music, Volume2 } from 'lucide-react';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { formatDuration } from '@/lib/utils';
import { Track } from '@/types/music';

export const QueueDrawer: React.FC = () => {
  const {
    queue,
    queueIndex,
    currentTrack,
    isPlaying,
    showQueue,
    setShowQueue,
    playTrack,
    removeFromQueue,
    clearQueue,
  } = usePlayerStore();

  if (!showQueue) return null;

  // Upcoming tracks in queue
  const upcomingTracks = queue.slice(queueIndex + 1);

  return (
    <aside
      className="fixed top-0 right-0 bottom-[72px] sm:bottom-[90px] w-80 sm:w-96 bg-[#121212] border-l border-[#282828] z-40 flex flex-col shadow-2xl animate-slideLeft select-none"
      aria-label="Queue Drawer"
    >
      {/* Header */}
      <div className="p-4 border-b border-[#282828] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListMusic className="w-5 h-5 text-[#1DB954]" />
          <h2 className="text-base font-bold text-white">Play Queue</h2>
        </div>

        <div className="flex items-center gap-2">
          {upcomingTracks.length > 0 && (
            <button
              onClick={clearQueue}
              className="text-xs text-[#b3b3b3] hover:text-white px-2 py-1 rounded hover:bg-[#282828] transition-colors"
              title="Clear upcoming songs"
            >
              Clear queue
            </button>
          )}

          <button
            onClick={() => setShowQueue(false)}
            className="p-1.5 text-[#b3b3b3] hover:text-white rounded-full hover:bg-[#282828] transition-colors"
            title="Close queue"
            aria-label="Close queue"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {/* Section 1: Now Playing */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#b3b3b3] mb-3">
            Now Playing
          </h3>

          {currentTrack ? (
            <div className="flex items-center gap-3 p-2 rounded-md bg-[#181818] border border-[#282828] group">
              <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0 bg-[#282828]">
                <img
                  src={currentTrack.thumbnail || '/placeholder-album.png'}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&auto=format&fit=crop&q=60';
                  }}
                />
                {isPlaying && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Volume2 className="w-5 h-5 text-[#1DB954] animate-pulse" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1DB954] truncate">
                  {currentTrack.title}
                </p>
                <p className="text-xs text-[#b3b3b3] truncate mt-0.5">
                  {currentTrack.artist}
                </p>
              </div>

              <span className="text-xs text-[#b3b3b3] font-mono pr-1">
                {formatDuration(currentTrack.duration)}
              </span>
            </div>
          ) : (
            <div className="p-4 rounded-md bg-[#181818] text-center text-[#b3b3b3] text-xs">
              No song currently playing.
            </div>
          )}
        </div>

        {/* Section 2: Next In Queue */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#b3b3b3]">
              Next In Queue ({upcomingTracks.length})
            </h3>
          </div>

          {upcomingTracks.length === 0 ? (
            <div className="p-6 rounded-lg border border-dashed border-[#282828] text-center space-y-2">
              <Music className="w-8 h-8 text-[#b3b3b3] mx-auto opacity-50" />
              <p className="text-xs text-[#b3b3b3]">
                Your queue is empty. Add songs to play them next!
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {upcomingTracks.map((track: Track, idx: number) => {
                const actualIndex = queueIndex + 1 + idx;
                return (
                  <div
                    key={`${track.id || track.youtubeId}-${actualIndex}`}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-[#181818] transition-colors group cursor-pointer"
                    onClick={() => playTrack(track, queue)}
                  >
                    <span className="w-4 text-center text-xs text-[#b3b3b3] group-hover:hidden">
                      {idx + 1}
                    </span>
                    <button
                      className="w-4 hidden group-hover:flex items-center justify-center text-white"
                      title="Play now"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                    </button>

                    <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-[#282828]">
                      <img
                        src={track.thumbnail || '/placeholder-album.png'}
                        alt={track.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&auto=format&fit=crop&q=60';
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate group-hover:text-[#1DB954] transition-colors">
                        {track.title}
                      </p>
                      <p className="text-xs text-[#b3b3b3] truncate">
                        {track.artist}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#b3b3b3] font-mono">
                        {formatDuration(track.duration)}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromQueue(actualIndex);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-[#b3b3b3] hover:text-red-400 transition-opacity"
                        title="Remove from queue"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default QueueDrawer;
