import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { type MusicTrackItem, FAZURA_MUSIC_CATALOG, resolveTrackYouTubeId } from '../services/musicApi';
import { recordCategoryHistory } from '../services/categoryStorage';

// YouTube Iframe API types declaration
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const VOLUME_STORAGE_KEY = 'fazura_player_volume';

const getInitialVolume = (): number => {
  if (typeof window === 'undefined') return 80;
  try {
    const saved = localStorage.getItem(VOLUME_STORAGE_KEY);
    if (saved !== null) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return 80;
};

interface MusicContextType {
  currentTrack: MusicTrackItem | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  queue: MusicTrackItem[];
  showLyrics: boolean;
  isPlayerDismissed: boolean;
  playTrack: (track: MusicTrackItem, newQueue?: MusicTrackItem[]) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setShowLyrics: (show: boolean | ((prev: boolean) => boolean)) => void;
  dismissPlayer: () => void;
}

const MusicContext = createContext<MusicContextType | null>(null);

export function MusicProvider({ children }: { children: React.ReactNode }) {
  // Start with null so that player bar does NOT overlap or show until user initiates playback
  const [currentTrack, setCurrentTrack] = useState<MusicTrackItem | null>(null);
  const [queue, setQueue] = useState<MusicTrackItem[]>(() => FAZURA_MUSIC_CATALOG);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(getInitialVolume);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('all');
  const [showLyrics, setShowLyrics] = useState<boolean>(false);
  const [isPlayerDismissed, setIsPlayerDismissed] = useState<boolean>(false);

  const playerRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrackRef = useRef<MusicTrackItem | null>(currentTrack);
  const queueRef = useRef<MusicTrackItem[]>(queue);
  const repeatModeRef = useRef(repeatMode);
  const isShuffleRef = useRef(isShuffle);
  const handleTrackEndRef = useRef<() => void>(() => {});
  const consecutiveErrorsRef = useRef<number>(0);

  currentTrackRef.current = currentTrack;
  queueRef.current = queue;
  repeatModeRef.current = repeatMode;
  isShuffleRef.current = isShuffle;

  // Initialize HTML5 Audio instance for preview streams
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const audio = new Audio();
    audio.volume = Math.max(0, Math.min(1, volume / 100));
    audioRef.current = audio;

    const onPlay = () => {
      setIsPlaying(true);
      consecutiveErrorsRef.current = 0;
    };
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      // If preview ended and track now has a resolved YouTube ID, switch seamlessly to full YouTube playback!
      const current = currentTrackRef.current;
      if (current?.youtubeId && current.youtubeId.length === 11 && playerRef.current) {
        if (audioRef.current) audioRef.current.pause();
        try {
          playerRef.current.loadVideoById(current.youtubeId);
          playerRef.current.playVideo();
          return;
        } catch {
          // ignore
        }
      }
      handleTrackEndRef.current();
    };
    const onError = (e: Event) => {
      console.warn('[AudioPreview] HTML5 audio error on track:', currentTrackRef.current?.title, e);
      consecutiveErrorsRef.current += 1;
      if (consecutiveErrorsRef.current >= 4) {
        console.warn('[AudioPreview] Too many consecutive audio errors. Halting to protect UI.');
        setIsPlaying(false);
        consecutiveErrorsRef.current = 0;
        return;
      }
      // Attempt safe transition to next track
      setTimeout(() => {
        handleTrackEndRef.current();
      }, 250);
    };
    const onTimeUpdate = () => {
      if (audioRef.current && currentTrackRef.current?.previewUrl && !currentTrackRef.current?.youtubeId) {
        setCurrentTime(audioRef.current.currentTime);
        if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
          setDuration(audioRef.current.duration);
        }
      }
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    audio.addEventListener('timeupdate', onTimeUpdate);

    return () => {
      audio.pause();
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, []);

  // Initialize YouTube Iframe API
  useEffect(() => {
    if (typeof window === 'undefined') return;

    function initPlayer() {
      if (!window.YT || !window.YT.Player) return;
      if (playerRef.current) return;

      try {
        playerRef.current = new window.YT.Player('yt-music-audio-engine', {
          height: '1',
          width: '1',
          videoId: 'kPa7bsKwL-c',
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
          },
          events: {
            onReady: (event: any) => {
              try {
                const currentVol = getInitialVolume();
                event.target.setVolume(currentVol);
              } catch {
                // ignore
              }
            },
            onStateChange: (event: any) => {
              // 1 = PLAYING, 2 = PAUSED, 0 = ENDED, 3 = BUFFERING
              if (event.data === 1) {
                setIsPlaying(true);
                consecutiveErrorsRef.current = 0;
              } else if (event.data === 2) {
                setIsPlaying(false);
              } else if (event.data === 0) {
                handleTrackEndRef.current();
              }
            },
            onError: (event: any) => {
              // YouTube Iframe error codes:
              // 2: Invalid video ID parameter
              // 5: HTML5 player error
              // 100: Video not found, removed, or private
              // 101, 150: Video owner prohibits embedded playback
              consecutiveErrorsRef.current += 1;
              console.warn(
                `[YouTubePlayer] Error code ${event.data} on track: ${currentTrackRef.current?.title} (consecutive: ${consecutiveErrorsRef.current})`
              );

              // Guard against infinite skipping loops that freeze the UI
              if (consecutiveErrorsRef.current >= 4) {
                console.warn('[YouTubePlayer] Exceeded error threshold. Pausing playback to avoid UI lockup.');
                setIsPlaying(false);
                consecutiveErrorsRef.current = 0;
                return;
              }

              // Check if track has previewUrl fallback
              const current = currentTrackRef.current;
              if (current?.previewUrl && audioRef.current && (!audioRef.current.src || audioRef.current.paused)) {
                try {
                  audioRef.current.src = current.previewUrl;
                  audioRef.current.currentTime = 0;
                  audioRef.current
                    .play()
                    .then(() => {
                      setIsPlaying(true);
                      consecutiveErrorsRef.current = 0;
                    })
                    .catch(() => {
                      setTimeout(() => handleTrackEndRef.current(), 250);
                    });
                  return;
                } catch {
                  // ignore
                }
              }

              // Auto-advance safely to next track
              setTimeout(() => {
                handleTrackEndRef.current();
              }, 300);
            },
          },
        });
      } catch (err) {
        console.warn('Failed to initialize YouTube Audio Player:', err);
      }
    }

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        initPlayer();
      };

      if (!document.getElementById('youtube-iframe-api-script')) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api-script';
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      }
    }
  }, []);

  // Sync current time & duration timer for YouTube Player
  useEffect(() => {
    const timer = setInterval(() => {
      if (playerRef.current && isPlaying && currentTrackRef.current?.youtubeId) {
        try {
          if (typeof playerRef.current.getCurrentTime === 'function') {
            const cur = playerRef.current.getCurrentTime() || 0;
            const dur = playerRef.current.getDuration() || 0;
            setCurrentTime(cur);
            if (dur > 0) setDuration(dur);
          }
        } catch {
          // ignore transient errors
        }
      }
    }, 350);

    return () => clearInterval(timer);
  }, [isPlaying]);

  // Handler for track end
  const handleTrackEnd = useCallback(() => {
    if (repeatModeRef.current === 'one') {
      seekTo(0);
      resume();
      return;
    }

    // Play next track
    const currentQ = queueRef.current;
    if (currentQ.length === 0) return;

    if (isShuffleRef.current && currentQ.length > 1) {
      const randomIndex = Math.floor(Math.random() * currentQ.length);
      playTrackInternal(currentQ[randomIndex]);
      return;
    }

    const currentIndex = currentQ.findIndex(
      (t) => t.id === currentTrackRef.current?.id || t.youtubeId === currentTrackRef.current?.youtubeId
    );

    if (currentIndex >= 0 && currentIndex < currentQ.length - 1) {
      playTrackInternal(currentQ[currentIndex + 1]);
    } else if (repeatModeRef.current === 'all' && currentQ.length > 0) {
      playTrackInternal(currentQ[0]);
    } else {
      setIsPlaying(false);
    }
  }, []);
  handleTrackEndRef.current = handleTrackEnd;

  const playTrackInternal = (track: MusicTrackItem) => {
    setCurrentTrack(track);
    setCurrentTime(0);
    setIsPlaying(true);
    setIsPlayerDismissed(false); // Un-dismiss when user plays a song

    // Save to Music History
    recordCategoryHistory('music', {
      id: track.id,
      category: 'music',
      title: track.title,
      cover: track.thumbnail,
      lastItemTitle: `${track.artist} (${track.durationFormatted || 'Audio'})`,
      lastItemLink: `/music?play=${encodeURIComponent(track.id)}`,
      watchedAt: Date.now(),
      extra: {
        youtubeId: track.youtubeId,
        artist: track.artist,
        album: track.album,
        previewUrl: track.previewUrl,
      },
    });

    // 1. If track already has full-length YouTube ID (11 chars), play FULL track immediately on YouTube engine!
    if (track.youtubeId && track.youtubeId.length === 11) {
      if (audioRef.current) {
        try {
          audioRef.current.pause();
        } catch {
          // ignore
        }
      }
      if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
        try {
          playerRef.current.loadVideoById(track.youtubeId);
          playerRef.current.playVideo();
        } catch (err) {
          console.warn('Error loading video by ID:', err);
        }
      }
      return;
    }

    // 2. If track does NOT yet have a YouTube ID (e.g. newly searched online track):
    // Start preview audio instantly if available so user gets instant sound in 0ms without waiting
    if (track.previewUrl && audioRef.current) {
      try {
        audioRef.current.src = track.previewUrl;
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((err) => console.warn('Audio play error:', err));
      } catch (err) {
        console.warn('Preview play error:', err);
      }
    }

    // 3. Concurrently resolve the official FULL YouTube video ID for complete full-length song playback!
    resolveTrackYouTubeId(track).then((resolvedId) => {
      // Only switch if this track is still the currently active track
      if (resolvedId && currentTrackRef.current?.id === track.id) {
        track.youtubeId = resolvedId;
        // Pause preview and switch to full YouTube video player
        if (audioRef.current) {
          try {
            audioRef.current.pause();
          } catch {
            // ignore
          }
        }
        if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
          try {
            playerRef.current.loadVideoById(resolvedId);
            playerRef.current.playVideo();
          } catch (err) {
            console.warn('Failed to switch to full YouTube video:', err);
          }
        }
      }
    });
  };

  const playTrack = useCallback((track: MusicTrackItem, newQueue?: MusicTrackItem[]) => {
    if (newQueue && newQueue.length > 0) {
      setQueue(newQueue);
      queueRef.current = newQueue;
    }
    playTrackInternal(track);
  }, []);

  const togglePlay = useCallback(() => {
    const track = currentTrackRef.current;
    if (!track) {
      // Default to first track if clicked
      const first = FAZURA_MUSIC_CATALOG[0];
      playTrackInternal(first);
      return;
    }

    if (track.previewUrl && !track.youtubeId && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((err) => console.warn('Audio play error:', err));
      }
      return;
    }

    if (!playerRef.current) return;
    try {
      if (isPlaying) {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        playerRef.current.playVideo();
        setIsPlaying(true);
      }
    } catch (err) {
      console.warn('Toggle play error:', err);
    }
  }, [isPlaying]);

  const pause = useCallback(() => {
    const track = currentTrackRef.current;
    if (track?.previewUrl && !track?.youtubeId && audioRef.current) {
      try {
        audioRef.current.pause();
      } catch {
        // ignore
      }
    } else if (playerRef.current?.pauseVideo) {
      try {
        playerRef.current.pauseVideo();
      } catch {
        // ignore
      }
    }
    setIsPlaying(false);
  }, []);

  const resume = useCallback(() => {
    const track = currentTrackRef.current;
    if (track?.previewUrl && !track?.youtubeId && audioRef.current) {
      try {
        audioRef.current.play().catch((err) => console.warn('Audio play error:', err));
      } catch {
        // ignore
      }
    } else if (playerRef.current?.playVideo) {
      try {
        playerRef.current.playVideo();
      } catch {
        // ignore
      }
    }
    setIsPlaying(true);
  }, []);

  const nextTrack = useCallback(() => {
    const currentQ = queueRef.current;
    if (currentQ.length === 0) return;

    if (isShuffleRef.current && currentQ.length > 1) {
      const randomIndex = Math.floor(Math.random() * currentQ.length);
      playTrackInternal(currentQ[randomIndex]);
      return;
    }

    const currentIndex = currentQ.findIndex(
      (t) => t.id === currentTrackRef.current?.id || t.youtubeId === currentTrackRef.current?.youtubeId
    );

    if (currentIndex >= 0 && currentIndex < currentQ.length - 1) {
      playTrackInternal(currentQ[currentIndex + 1]);
    } else if (currentQ.length > 0) {
      playTrackInternal(currentQ[0]);
    }
  }, []);

  const prevTrack = useCallback(() => {
    const currentQ = queueRef.current;
    if (currentQ.length === 0) return;

    if (currentTime > 3) {
      seekTo(0);
      return;
    }

    const currentIndex = currentQ.findIndex(
      (t) => t.id === currentTrackRef.current?.id || t.youtubeId === currentTrackRef.current?.youtubeId
    );

    if (currentIndex > 0) {
      playTrackInternal(currentQ[currentIndex - 1]);
    } else if (currentQ.length > 0) {
      playTrackInternal(currentQ[currentQ.length - 1]);
    }
  }, [currentTime]);

  const seekTo = useCallback((seconds: number) => {
    const track = currentTrackRef.current;
    if (track?.previewUrl && !track?.youtubeId && audioRef.current) {
      audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
      return;
    }

    if (playerRef.current?.seekTo) {
      try {
        playerRef.current.seekTo(seconds, true);
        setCurrentTime(seconds);
      } catch (err) {
        console.warn('Seek error:', err);
      }
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(vol)));
    setVolumeState(clamped);

    // Save volume to localStorage for persistent memory
    try {
      localStorage.setItem(VOLUME_STORAGE_KEY, clamped.toString());
    } catch {
      // ignore
    }

    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, clamped / 100));
      if (clamped > 0 && isMuted) {
        audioRef.current.muted = false;
      }
    }

    if (playerRef.current?.setVolume) {
      try {
        playerRef.current.setVolume(clamped);
        if (clamped > 0 && isMuted) {
          playerRef.current.unMute();
          setIsMuted(false);
        }
      } catch {
        // ignore
      }
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    if (isMuted) {
      if (audioRef.current) audioRef.current.muted = false;
      if (playerRef.current?.unMute) {
        try {
          playerRef.current.unMute();
        } catch {
          // ignore
        }
      }
      setIsMuted(false);
    } else {
      if (audioRef.current) audioRef.current.muted = true;
      if (playerRef.current?.mute) {
        try {
          playerRef.current.mute();
        } catch {
          // ignore
        }
      }
      setIsMuted(true);
    }
  }, [isMuted]);

  const toggleShuffle = useCallback(() => {
    setIsShuffle((prev) => !prev);
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  const dismissPlayer = useCallback(() => {
    pause();
    setIsPlayerDismissed(true);
  }, [pause]);

  // MediaSession API Integration: Metadata updates on track change
  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    if (!currentTrack) {
      try {
        navigator.mediaSession.metadata = null;
      } catch {
        // ignore
      }
      return;
    }

    try {
      const artworkSrc = currentTrack.thumbnail || '/favicon.svg';
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title || 'FAZURAVERSE Music',
        artist: currentTrack.artist || 'FAZURAVERSE',
        album: currentTrack.album || 'FAZURAVERSE Super-Hub',
        artwork: [
          { src: artworkSrc, sizes: '96x96', type: 'image/png' },
          { src: artworkSrc, sizes: '128x128', type: 'image/png' },
          { src: artworkSrc, sizes: '192x192', type: 'image/png' },
          { src: artworkSrc, sizes: '256x256', type: 'image/png' },
          { src: artworkSrc, sizes: '512x512', type: 'image/png' },
        ],
      });
    } catch (err) {
      console.warn('[MediaSession] Metadata update error:', err);
    }
  }, [currentTrack]);

  // MediaSession API Integration: Playback state synchronization
  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    } catch {
      // ignore
    }
  }, [isPlaying]);

  // MediaSession API Integration: Position state
  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;
    if (typeof navigator.mediaSession.setPositionState !== 'function') return;

    if (duration > 0 && currentTime >= 0 && currentTime <= duration) {
      try {
        navigator.mediaSession.setPositionState({
          duration: duration,
          playbackRate: 1,
          position: Math.min(currentTime, duration),
        });
      } catch {
        // ignore transient position errors
      }
    }
  }, [currentTime, duration]);

  // MediaSession API Integration: Control action handlers
  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    const actionList: [MediaSessionAction, MediaSessionActionHandler][] = [
      ['play', () => resume()],
      ['pause', () => pause()],
      ['previoustrack', () => prevTrack()],
      ['nexttrack', () => nextTrack()],
      [
        'seekto',
        (details) => {
          if (typeof details.seekTime === 'number') {
            seekTo(details.seekTime);
          }
        },
      ],
      ['stop', () => dismissPlayer()],
    ];

    actionList.forEach(([action, handler]) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch {
        // some action handlers might not be supported on all browsers
      }
    });

    return () => {
      actionList.forEach(([action]) => {
        try {
          navigator.mediaSession.setActionHandler(action, null);
        } catch {
          // ignore
        }
      });
    };
  }, [resume, pause, prevTrack, nextTrack, seekTo, dismissPlayer]);

  return (
    <MusicContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        isShuffle,
        repeatMode,
        queue,
        showLyrics,
        isPlayerDismissed,
        playTrack,
        togglePlay,
        pause,
        resume,
        nextTrack,
        prevTrack,
        seekTo,
        setVolume,
        toggleMute,
        toggleShuffle,
        toggleRepeat,
        setShowLyrics,
        dismissPlayer,
      }}
    >
      {children}
      {/* Hidden YouTube Audio Engine - DO NOT REMOVE */}
      <div
        style={{
          position: 'fixed',
          top: '-9999px',
          left: '-9999px',
          width: '1px',
          height: '1px',
          opacity: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
          zIndex: -1,
        }}
      >
        <div id="yt-music-audio-engine" />
      </div>
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
}
