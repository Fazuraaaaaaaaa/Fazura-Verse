'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { usePlayerStore } from '@/stores/usePlayerStore';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export function useYouTubePlayer() {
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const lastLoadedIdRef = useRef<string | null>(null);

  const {
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    repeatMode,
    seekRequest,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    nextTrack,
    clearSeekRequest,
  } = usePlayerStore();

  // Load YouTube IFrame API script once
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // Initialize YouTube Player
  const initPlayer = useCallback(() => {
    if (typeof window === 'undefined' || !window.YT || !window.YT.Player) return;
    if (playerRef.current) return;

    const container = document.getElementById('sonora-hidden-youtube-iframe');
    if (!container) return;

    try {
      playerRef.current = new window.YT.Player('sonora-hidden-youtube-iframe', {
        height: '200',
        width: '200',
        videoId: currentTrack?.youtubeId || '',
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          origin: window.location.origin,
          playsinline: 1,
        },
        events: {
          onReady: (event: any) => {
            setIsPlayerReady(true);
            const p = event.target;
            if (isMuted) {
              p.mute();
            } else {
              p.unMute();
              p.setVolume(volume);
            }

            if (currentTrack?.youtubeId) {
              lastLoadedIdRef.current = currentTrack.youtubeId;
              if (isPlaying) {
                p.loadVideoById(currentTrack.youtubeId);
                p.playVideo();
              } else {
                p.cueVideoById(currentTrack.youtubeId);
              }
            }
          },
          onStateChange: (event: any) => {
            const state = event.data;
            // YT.PlayerState: ENDED = 0, PLAYING = 1, PAUSED = 2, BUFFERING = 3, CUED = 5
            if (state === 0) {
              // ENDED
              const currentRepeat = usePlayerStore.getState().repeatMode;
              if (currentRepeat === 'one') {
                event.target.seekTo(0, true);
                event.target.playVideo();
              } else {
                usePlayerStore.getState().nextTrack();
              }
            } else if (state === 1) {
              // PLAYING
              setIsPlaying(true);
              const dur = event.target.getDuration();
              if (dur && dur > 0) {
                setDuration(dur);
              }
            } else if (state === 2) {
              // PAUSED
              setIsPlaying(false);
            }
          },
          onError: (event: any) => {
            console.warn('[SONORA Player] YouTube playback error code:', event.data);
            // Error 100: not found, 101/150: playback restricted by owner
            // Automatically skip to next track after 1s
            setTimeout(() => {
              usePlayerStore.getState().nextTrack();
            }, 1000);
          },
        },
      });
    } catch (err) {
      console.error('[SONORA Player] Failed to instantiate YouTube player:', err);
    }
  }, [currentTrack?.youtubeId, isPlaying, isMuted, volume, setIsPlaying, setDuration]);

  // Handle YouTube API ready callback
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        initPlayer();
      };
    }
  }, [initPlayer]);

  // Synchronize Track Changes
  useEffect(() => {
    if (!isPlayerReady || !playerRef.current) return;
    if (!currentTrack?.youtubeId) return;

    const ytId = currentTrack.youtubeId;
    if (ytId !== lastLoadedIdRef.current) {
      lastLoadedIdRef.current = ytId;
      try {
        if (isPlaying) {
          playerRef.current.loadVideoById({
            videoId: ytId,
            startSeconds: 0,
          });
          playerRef.current.playVideo();
        } else {
          playerRef.current.cueVideoById({
            videoId: ytId,
            startSeconds: 0,
          });
        }
      } catch (err) {
        console.error('[SONORA Player] Error loading track:', err);
      }
    }
  }, [currentTrack?.youtubeId, isPlayerReady, isPlaying]);

  // Synchronize Play/Pause
  useEffect(() => {
    if (!isPlayerReady || !playerRef.current) return;

    try {
      const playerState = playerRef.current.getPlayerState?.();
      if (isPlaying) {
        if (playerState !== 1 && playerState !== 3) {
          playerRef.current.playVideo();
        }
      } else {
        if (playerState === 1 || playerState === 3) {
          playerRef.current.pauseVideo();
        }
      }
    } catch (err) {
      // player might not be fully active
    }
  }, [isPlaying, isPlayerReady]);

  // Synchronize Volume and Mute
  useEffect(() => {
    if (!isPlayerReady || !playerRef.current) return;

    try {
      if (isMuted) {
        playerRef.current.mute();
      } else {
        playerRef.current.unMute();
        playerRef.current.setVolume(volume);
      }
    } catch (err) {
      // Ignore
    }
  }, [volume, isMuted, isPlayerReady]);

  // Synchronize Seek Requests
  useEffect(() => {
    if (!isPlayerReady || !playerRef.current || seekRequest === null) return;

    try {
      playerRef.current.seekTo(seekRequest, true);
      clearSeekRequest();
    } catch (err) {
      // Ignore
    }
  }, [seekRequest, isPlayerReady, clearSeekRequest]);

  // Synchronize Timeline updates (polling current time)
  useEffect(() => {
    if (!isPlayerReady || !isPlaying) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      if (!playerRef.current) return;
      try {
        const time = playerRef.current.getCurrentTime();
        if (typeof time === 'number' && !isNaN(time)) {
          setCurrentTime(time);
        }
        const dur = playerRef.current.getDuration();
        if (typeof dur === 'number' && !isNaN(dur) && dur > 0) {
          setDuration(dur);
        }
      } catch (err) {
        // Ignore
      }
    }, 250);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlayerReady, isPlaying, setCurrentTime, setDuration]);

  return {
    isPlayerReady,
    player: playerRef.current,
  };
}
