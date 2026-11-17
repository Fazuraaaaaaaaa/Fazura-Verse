'use client';

import React, { useEffect } from 'react';
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer';
import { usePlayerStore } from '@/stores/usePlayerStore';

export const YouTubePlayer: React.FC = () => {
  const { isPlayerReady } = useYouTubePlayer();
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    previousTrack,
    nextTrack,
    seekTo,
  } = usePlayerStore();

  // OS Native MediaSession API integration (Hardware media keys, lockscreen, etc.)
  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    if (currentTrack) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        album: currentTrack.album || 'SONORA Music',
        artwork: [
          {
            src: currentTrack.thumbnail,
            sizes: '512x512',
            type: 'image/jpeg',
          },
        ],
      });

      navigator.mediaSession.setActionHandler('play', () => {
        usePlayerStore.getState().setIsPlaying(true);
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        usePlayerStore.getState().setIsPlaying(false);
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        usePlayerStore.getState().previousTrack();
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        usePlayerStore.getState().nextTrack();
      });
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (typeof details.seekTime === 'number') {
          usePlayerStore.getState().seekTo(details.seekTime);
        }
      });
    }

    return () => {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('previoustrack', null);
        navigator.mediaSession.setActionHandler('nexttrack', null);
        navigator.mediaSession.setActionHandler('seekto', null);
      }
    };
  }, [currentTrack]);

  // Sync playback state with MediaSession
  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
      if (
        'setPositionState' in navigator.mediaSession &&
        duration > 0 &&
        currentTime >= 0 &&
        currentTime <= duration
      ) {
        navigator.mediaSession.setPositionState({
          duration: Math.max(1, duration),
          playbackRate: 1,
          position: Math.min(currentTime, duration),
        });
      }
    } catch {
      // Ignore occasional out-of-range errors during quick scrub
    }
  }, [isPlaying, currentTime, duration]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        left: '-9999px',
        bottom: '-9999px',
        width: '200px',
        height: '200px',
        opacity: 0,
        pointerEvents: 'none',
        zIndex: -1,
      }}
    >
      <div id="sonora-hidden-youtube-iframe" />
    </div>
  );
};

export default YouTubePlayer;
