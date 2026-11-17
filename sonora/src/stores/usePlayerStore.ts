import { create } from 'zustand';
import { Track, RepeatMode } from '@/types/music';
import { useLibraryStore } from './useLibraryStore';

export interface PlayerState {
  // Playback state
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number; // 0 - 100
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode; // 'off' | 'all' | 'one'
  currentTime: number; // in seconds
  duration: number; // in seconds
  seekRequest: number | null; // pending seek timestamp in seconds

  // Queue state
  queue: Track[];
  queueIndex: number;

  // View state
  isFullscreen: boolean;
  showQueue: boolean;
  showLyrics: boolean;
  miniPlayer: boolean;

  // Playback actions
  playTrack: (track: Track, newQueue?: Track[]) => void;
  togglePlay: () => void;
  setIsPlaying: (isPlaying: boolean) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  seekTo: (seconds: number) => void;
  clearSeekRequest: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;

  // Queue actions
  addToQueue: (track: Track) => void;
  playNext: (track: Track) => void;
  removeFromQueue: (indexOrId: number | string) => void;
  clearQueue: () => void;
  reorderQueue: (startIndex: number, endIndex: number) => void;

  // UI state actions
  toggleFullscreen: () => void;
  setFullscreen: (fullscreen: boolean) => void;
  toggleQueue: () => void;
  setShowQueue: (show: boolean) => void;
  toggleLyrics: () => void;
  setShowLyrics: (show: boolean) => void;
  toggleMiniPlayer: () => void;
  setMiniPlayer: (mini: boolean) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  volume: 75,
  isMuted: false,
  isShuffle: false,
  repeatMode: 'off',
  currentTime: 0,
  duration: 0,
  seekRequest: null,

  queue: [],
  queueIndex: -1,

  isFullscreen: false,
  showQueue: false,
  showLyrics: false,
  miniPlayer: false,

  playTrack: (track: Track, newQueue?: Track[]) => {
    const currentQueue = get().queue;
    let targetQueue = newQueue ? [...newQueue] : [...currentQueue];
    let targetIndex = -1;

    if (newQueue && newQueue.length > 0) {
      targetIndex = newQueue.findIndex(
        (t) => (t.id && t.id === track.id) || (t.youtubeId && t.youtubeId === track.youtubeId)
      );
      if (targetIndex === -1) {
        targetQueue = [track, ...newQueue];
        targetIndex = 0;
      }
    } else {
      targetIndex = targetQueue.findIndex(
        (t) => (t.id && t.id === track.id) || (t.youtubeId && t.youtubeId === track.youtubeId)
      );
      if (targetIndex === -1) {
        targetQueue = [...targetQueue, track];
        targetIndex = targetQueue.length - 1;
      }
    }

    set({
      currentTrack: track,
      isPlaying: true,
      currentTime: 0,
      duration: track.duration || 0,
      queue: targetQueue,
      queueIndex: targetIndex,
      seekRequest: 0,
    });

    try {
      useLibraryStore.getState().addToHistory(track);
    } catch {
      // Safe fallback
    }
  },

  togglePlay: () => {
    const { isPlaying, currentTrack, queue } = get();
    if (!currentTrack && queue.length > 0) {
      get().playTrack(queue[0]);
      return;
    }
    set({ isPlaying: !isPlaying });
  },

  setIsPlaying: (isPlaying: boolean) => {
    set({ isPlaying });
  },

  nextTrack: () => {
    const { queue, queueIndex, repeatMode, isShuffle } = get();
    if (queue.length === 0) return;

    if (repeatMode === 'one') {
      set({ currentTime: 0, seekRequest: 0, isPlaying: true });
      return;
    }

    if (isShuffle && queue.length > 1) {
      let randomIndex = Math.floor(Math.random() * queue.length);
      if (randomIndex === queueIndex) {
        randomIndex = (randomIndex + 1) % queue.length;
      }
      const nextT = queue[randomIndex];
      set({
        currentTrack: nextT,
        queueIndex: randomIndex,
        currentTime: 0,
        duration: nextT.duration || 0,
        seekRequest: 0,
        isPlaying: true,
      });
      try {
        useLibraryStore.getState().addToHistory(nextT);
      } catch {}
      return;
    }

    const nextIndex = queueIndex + 1;
    if (nextIndex < queue.length) {
      const nextT = queue[nextIndex];
      set({
        currentTrack: nextT,
        queueIndex: nextIndex,
        currentTime: 0,
        duration: nextT.duration || 0,
        seekRequest: 0,
        isPlaying: true,
      });
      try {
        useLibraryStore.getState().addToHistory(nextT);
      } catch {}
    } else if (repeatMode === 'all') {
      const nextT = queue[0];
      set({
        currentTrack: nextT,
        queueIndex: 0,
        currentTime: 0,
        duration: nextT.duration || 0,
        seekRequest: 0,
        isPlaying: true,
      });
      try {
        useLibraryStore.getState().addToHistory(nextT);
      } catch {}
    } else {
      set({ isPlaying: false });
    }
  },

  previousTrack: () => {
    const { queue, queueIndex, currentTime, repeatMode } = get();
    if (queue.length === 0) return;

    // Spotify UX: If currentTime > 3s, restart song
    if (currentTime > 3) {
      set({ currentTime: 0, seekRequest: 0, isPlaying: true });
      return;
    }

    const prevIndex = queueIndex - 1;
    if (prevIndex >= 0) {
      const prevT = queue[prevIndex];
      set({
        currentTrack: prevT,
        queueIndex: prevIndex,
        currentTime: 0,
        duration: prevT.duration || 0,
        seekRequest: 0,
        isPlaying: true,
      });
      try {
        useLibraryStore.getState().addToHistory(prevT);
      } catch {}
    } else if (repeatMode === 'all') {
      const lastIndex = queue.length - 1;
      const prevT = queue[lastIndex];
      set({
        currentTrack: prevT,
        queueIndex: lastIndex,
        currentTime: 0,
        duration: prevT.duration || 0,
        seekRequest: 0,
        isPlaying: true,
      });
      try {
        useLibraryStore.getState().addToHistory(prevT);
      } catch {}
    } else {
      set({ currentTime: 0, seekRequest: 0 });
    }
  },

  seekTo: (seconds: number) => {
    const { duration } = get();
    const target = Math.max(0, Math.min(seconds, duration || 999999));
    set({ currentTime: target, seekRequest: target });
  },

  clearSeekRequest: () => {
    set({ seekRequest: null });
  },

  setVolume: (volume: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(volume)));
    set({
      volume: clamped,
      isMuted: clamped === 0,
    });
  },

  toggleMute: () => {
    const { isMuted, volume } = get();
    if (isMuted) {
      set({ isMuted: false, volume: volume === 0 ? 50 : volume });
    } else {
      set({ isMuted: true });
    }
  },

  toggleShuffle: () => {
    set((state) => ({ isShuffle: !state.isShuffle }));
  },

  toggleRepeat: () => {
    set((state) => {
      const modes: RepeatMode[] = ['off', 'all', 'one'];
      const currentIndex = modes.indexOf(state.repeatMode);
      const nextMode = modes[(currentIndex + 1) % modes.length];
      return { repeatMode: nextMode };
    });
  },

  setCurrentTime: (currentTime: number) => {
    set({ currentTime });
  },

  setDuration: (duration: number) => {
    set({ duration });
  },

  addToQueue: (track: Track) => {
    set((state) => ({
      queue: [...state.queue, track],
    }));
  },

  playNext: (track: Track) => {
    set((state) => {
      const newQueue = [...state.queue];
      const insertAt = state.queueIndex >= 0 ? state.queueIndex + 1 : 0;
      newQueue.splice(insertAt, 0, track);
      return { queue: newQueue };
    });
  },

  removeFromQueue: (indexOrId: number | string) => {
    set((state) => {
      let targetIndex = -1;
      if (typeof indexOrId === 'number') {
        targetIndex = indexOrId;
      } else {
        targetIndex = state.queue.findIndex(
          (t) => t.id === indexOrId || t.youtubeId === indexOrId
        );
      }

      if (targetIndex < 0 || targetIndex >= state.queue.length) return state;

      const newQueue = state.queue.filter((_, i) => i !== targetIndex);
      let newQueueIndex = state.queueIndex;
      if (targetIndex < state.queueIndex) {
        newQueueIndex = Math.max(0, state.queueIndex - 1);
      } else if (targetIndex === state.queueIndex) {
        newQueueIndex = Math.min(state.queueIndex, newQueue.length - 1);
      }

      return {
        queue: newQueue,
        queueIndex: newQueueIndex,
      };
    });
  },

  clearQueue: () => {
    set((state) => {
      if (state.currentTrack) {
        return {
          queue: [state.currentTrack],
          queueIndex: 0,
        };
      }
      return {
        queue: [],
        queueIndex: -1,
      };
    });
  },

  reorderQueue: (startIndex: number, endIndex: number) => {
    set((state) => {
      const newQueue = Array.from(state.queue);
      const [removed] = newQueue.splice(startIndex, 1);
      newQueue.splice(endIndex, 0, removed);

      let newQueueIndex = state.queueIndex;
      if (state.currentTrack) {
        const found = newQueue.findIndex(
          (t) =>
            (t.id && t.id === state.currentTrack?.id) ||
            (t.youtubeId && t.youtubeId === state.currentTrack?.youtubeId)
        );
        if (found !== -1) newQueueIndex = found;
      }

      return {
        queue: newQueue,
        queueIndex: newQueueIndex,
      };
    });
  },

  toggleFullscreen: () => {
    set((state) => ({ isFullscreen: !state.isFullscreen }));
  },

  setFullscreen: (fullscreen: boolean) => {
    set({ isFullscreen: fullscreen });
  },

  toggleQueue: () => {
    set((state) => ({ showQueue: !state.showQueue }));
  },

  setShowQueue: (show: boolean) => {
    set({ showQueue: show });
  },

  toggleLyrics: () => {
    set((state) => ({ showLyrics: !state.showLyrics }));
  },

  setShowLyrics: (show: boolean) => {
    set({ showLyrics: show });
  },

  toggleMiniPlayer: () => {
    set((state) => ({ miniPlayer: !state.miniPlayer }));
  },

  setMiniPlayer: (mini: boolean) => {
    set({ miniPlayer: mini });
  },
}));
