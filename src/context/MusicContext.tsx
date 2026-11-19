import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { type MusicTrackItem, FAZURA_MUSIC_CATALOG, getTrackById } from '../services/musicApi';
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
  const [volume, setVolumeState] = useState<number>(80);
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

  currentTrackRef.current = currentTrack;
  queueRef.current = queue;
  repeatModeRef.current = repeatMode;
  isShuffleRef.current = isShuffle;

  // Initialize HTML5 Audio instance for preview streams
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const audio = new Audio();
    audio.volume = 0.8;
    audioRef.current = audio;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => handleTrackEnd();
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
    audio.addEventListener('timeupdate', onTimeUpdate);

    return () => {
      audio.pause();
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
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

    // Check if track has previewUrl and no youtubeId (iTunes search)
    if (track.previewUrl && !track.youtubeId) {
      if (playerRef.current?.pauseVideo) {
        playerRef.current.pauseVideo();
      }
      if (audioRef.current) {
        audioRef.current.src = track.previewUrl;
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((err) => console.warn('Audio play error:', err));
      }
      return;
    }

    // Otherwise play via YouTube
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const yId = track.youtubeId || 'kPa7bsKwL-c';
    if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
      try {
        playerRef.current.loadVideoById(yId);
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
        audioRef.current.play().catch(() => {});
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
      audioRef.current.pause();
    } else if (playerRef.current?.pauseVideo) {
      playerRef.current.pauseVideo();
    }
    setIsPlaying(false);
  }, []);

  const resume = useCallback(() => {
    const track = currentTrackRef.current;
    if (track?.previewUrl && !track?.youtubeId && audioRef.current) {
      audioRef.current.play().catch(() => {});
    } else if (playerRef.current?.playVideo) {
      playerRef.current.playVideo();
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
    const clamped = Math.max(0, Math.min(100, vol));
    setVolumeState(clamped);

    if (audioRef.current) {
      audioRef.current.volume = clamped / 100;
      if (clamped > 0 && isMuted) {
        audioRef.current.muted = false;
      }
    }

    if (playerRef.current?.setVolume) {
      playerRef.current.setVolume(clamped);
      if (clamped > 0 && isMuted) {
        playerRef.current.unMute();
        setIsMuted(false);
      }
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    if (isMuted) {
      if (audioRef.current) audioRef.current.muted = false;
      if (playerRef.current?.unMute) playerRef.current.unMute();
      setIsMuted(false);
    } else {
      if (audioRef.current) audioRef.current.muted = true;
      if (playerRef.current?.mute) playerRef.current.mute();
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
