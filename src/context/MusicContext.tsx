import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { type MusicTrackItem, FAZURA_MUSIC_CATALOG } from '../services/musicApi';
import { recordCategoryHistory } from '../services/categoryStorage';

// YouTube Iframe API types declaration
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

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
}

const MusicContext = createContext<MusicContextType | null>(null);

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<MusicTrackItem | null>(() => FAZURA_MUSIC_CATALOG[0]);
  const [queue, setQueue] = useState<MusicTrackItem[]>(() => FAZURA_MUSIC_CATALOG);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(80);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('all');
  const [showLyrics, setShowLyrics] = useState<boolean>(false);

  const playerRef = useRef<any>(null);
  const isApiReadyRef = useRef<boolean>(false);
  const currentTrackRef = useRef<MusicTrackItem | null>(currentTrack);
  const queueRef = useRef<MusicTrackItem[]>(queue);
  const repeatModeRef = useRef(repeatMode);
  const isShuffleRef = useRef(isShuffle);

  currentTrackRef.current = currentTrack;
  queueRef.current = queue;
  repeatModeRef.current = repeatMode;
  isShuffleRef.current = isShuffle;

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
          videoId: currentTrackRef.current?.youtubeId || 'kPa7bsKwL-c',
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
              isApiReadyRef.current = true;
              event.target.setVolume(80);
            },
            onStateChange: (event: any) => {
              // 1 = PLAYING, 2 = PAUSED, 0 = ENDED, 3 = BUFFERING
              if (event.data === 1) {
                setIsPlaying(true);
              } else if (event.data === 2) {
                setIsPlaying(false);
              } else if (event.data === 0) {
                handleTrackEnd();
              }
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

    return () => {
      // Keep player intact across pages
    };
  }, []);

  // Sync current time & duration timer
  useEffect(() => {
    const timer = setInterval(() => {
      if (playerRef.current && isPlaying) {
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
      if (playerRef.current?.seekTo) {
        playerRef.current.seekTo(0);
        playerRef.current.playVideo();
      }
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

  const playTrackInternal = (track: MusicTrackItem) => {
    setCurrentTrack(track);
    setCurrentTime(0);
    setIsPlaying(true);

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
      },
    });

    if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
      try {
        playerRef.current.loadVideoById(track.youtubeId);
        playerRef.current.playVideo();
      } catch (err) {
        console.warn('Error loading video by ID:', err);
      }
    }
  };

  const playTrack = useCallback((track: MusicTrackItem, newQueue?: MusicTrackItem[]) => {
    if (newQueue && newQueue.length > 0) {
      setQueue(newQueue);
      queueRef.current = newQueue;
    }
    playTrackInternal(track);
  }, []);

  const togglePlay = useCallback(() => {
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
    if (playerRef.current?.pauseVideo) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    }
  }, []);

  const resume = useCallback(() => {
    if (playerRef.current?.playVideo) {
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
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
    const clamped = Math.max(0, Math.min(100, vol));
    setVolumeState(clamped);
    if (playerRef.current?.setVolume) {
      playerRef.current.setVolume(clamped);
      if (clamped > 0 && isMuted) {
        playerRef.current.unMute();
        setIsMuted(false);
      }
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
    } else {
      playerRef.current.mute();
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
      }}
    >
      {children}
      {/* Hidden YouTube Audio Engine */}
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
