'use client';

import React, { useEffect, useRef } from 'react';
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { useLibraryStore } from '@/stores/useLibraryStore';

export const YouTubePlayer: React.FC = () => {
  const { isPlayerReady } = useYouTubePlayer();
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    queue,
    queueIndex,
    togglePlay,
    previousTrack,
    nextTrack,
    seekTo,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    playTrack,
  } = usePlayerStore();

  const channelRef = useRef<BroadcastChannel | null>(null);

  // 1. Two-way BroadcastChannel sync with Pop-up Mini Player
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const channel = new BroadcastChannel('sonora_miniplayer_sync');
    channelRef.current = channel;

    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data) return;

      if (data.type === 'REQUEST_STATE') {
        const state = usePlayerStore.getState();
        channel.postMessage({
          type: 'STATE_UPDATE',
          payload: {
            currentTrack: state.currentTrack,
            isPlaying: state.isPlaying,
            currentTime: state.currentTime,
            duration: state.duration,
            volume: state.volume,
            isMuted: state.isMuted,
            isShuffle: state.isShuffle,
            repeatMode: state.repeatMode,
            queue: state.queue,
            queueIndex: state.queueIndex,
          },
        });
      } else if (data.type === 'COMMAND') {
        const { command, args } = data;
        const store = usePlayerStore.getState();
        switch (command) {
          case 'togglePlay':
            store.togglePlay();
            break;
          case 'nextTrack':
            store.nextTrack();
            break;
          case 'previousTrack':
            store.previousTrack();
            break;
          case 'seekTo':
            store.seekTo(args?.seconds || 0);
            break;
          case 'setVolume':
            store.setVolume(args?.volume ?? 75);
            break;
          case 'toggleMute':
            store.toggleMute();
            break;
          case 'toggleShuffle':
            store.toggleShuffle();
            break;
          case 'toggleRepeat':
            store.toggleRepeat();
            break;
          case 'playTrack':
            if (args?.track) store.playTrack(args.track, args.queue);
            break;
          case 'toggleLike':
            if (args?.track) useLibraryStore.getState().toggleLikeSong(args.track);
            break;
          default:
            break;
        }
      }
    };

    channel.addEventListener('message', handleMessage);

    return () => {
      channel.removeEventListener('message', handleMessage);
      channel.close();
      channelRef.current = null;
    };
  }, []);

  // Broadcast current state to miniplayer whenever playback state changes
  useEffect(() => {
    if (!channelRef.current) return;
    channelRef.current.postMessage({
      type: 'STATE_UPDATE',
      payload: {
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        isShuffle,
        repeatMode,
        queue,
        queueIndex,
      },
    });
  }, [
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    queue,
    queueIndex,
  ]);

  // 2. Comprehensive OS Native MediaSession API (Lockscreen, Notification widget, Hardware Keys)
  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    if (currentTrack) {
      const artworkUrl = currentTrack.thumbnail || '/placeholder-album.png';
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        album: currentTrack.album || 'SONORA Music',
        artwork: [
          { src: artworkUrl, sizes: '96x96', type: 'image/jpeg' },
          { src: artworkUrl, sizes: '128x128', type: 'image/jpeg' },
          { src: artworkUrl, sizes: '192x192', type: 'image/jpeg' },
          { src: artworkUrl, sizes: '256x256', type: 'image/jpeg' },
          { src: artworkUrl, sizes: '384x384', type: 'image/jpeg' },
          { src: artworkUrl, sizes: '512x512', type: 'image/jpeg' },
        ],
      });

      // Actions
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
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        const skipTime = details.seekOffset || 10;
        const current = usePlayerStore.getState().currentTime;
        usePlayerStore.getState().seekTo(Math.max(0, current - skipTime));
      });
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        const skipTime = details.seekOffset || 10;
        const current = usePlayerStore.getState().currentTime;
        const dur = usePlayerStore.getState().duration;
        usePlayerStore.getState().seekTo(Math.min(dur || 9999, current + skipTime));
      });
      navigator.mediaSession.setActionHandler('stop', () => {
        usePlayerStore.getState().setIsPlaying(false);
      });
    }

    return () => {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('previoustrack', null);
        navigator.mediaSession.setActionHandler('nexttrack', null);
        navigator.mediaSession.setActionHandler('seekto', null);
        navigator.mediaSession.setActionHandler('seekbackward', null);
        navigator.mediaSession.setActionHandler('seekforward', null);
        navigator.mediaSession.setActionHandler('stop', null);
      }
    };
  }, [currentTrack]);

  // Sync playback position state with MediaSession
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
      // Ignore occasional out-of-range race conditions
    }
  }, [isPlaying, currentTime, duration]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        right: '0px',
        bottom: '0px',
        width: '2px',
        height: '2px',
        opacity: 0.01,
        pointerEvents: 'none',
        zIndex: -1,
        overflow: 'hidden',
      }}
    >
      <div id="sonora-hidden-youtube-iframe" />
    </div>
  );
};

export default YouTubePlayer;
