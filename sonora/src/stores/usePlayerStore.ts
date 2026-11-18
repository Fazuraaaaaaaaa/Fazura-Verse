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
  playbackSpeed: number; // 0.5, 0.75, 1, 1.25, 1.5, 2
  autoplay: boolean; // Smart autoplay continuation

  // Queue & Smart Shuffle state
  queue: Track[];
  queueIndex: number;
  unplayedShuffleDeck: number[]; // indices of unplayed tracks in shuffle mode

  // View state
  isFullscreen: boolean;
  showQueue: boolean;
  showLyrics: boolean;
  miniPlayer: boolean;
  showVisualizer: boolean;

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
  setPlaybackSpeed: (speed: number) => void;
  toggleAutoplay: () => void;
  triggerAutoplay: () => Promise<void>;
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
  toggleVisualizer: () => void;
  setShowVisualizer: (show: boolean) => void;

  // Persistence (Remember & Restore)
  restorePlaybackState: () => void;
  saveResumeState: () => void;
}

// Fisher-Yates shuffle helper
function createShuffleDeck(queueLength: number, excludeIndex: number): number[] {
  const indices: number[] = [];
  for (let i = 0; i < queueLength; i++) {
    if (i !== excludeIndex) indices.push(i);
  }
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
}

const RESUME_STORAGE_KEY = 'sonora_player_resume';

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
  playbackSpeed: 1,
  autoplay: true,

  queue: [],
  queueIndex: -1,
  unplayedShuffleDeck: [],

  isFullscreen: false,
  showQueue: false,
  showLyrics: false,
  miniPlayer: false,
  showVisualizer: false,

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

    // Build new smart shuffle deck if shuffle is enabled
    const newShuffleDeck = get().isShuffle
      ? createShuffleDeck(targetQueue.length, targetIndex)
      : [];

    set({
      currentTrack: track,
      isPlaying: true,
      currentTime: 0,
      duration: track.duration || 0,
      queue: targetQueue,
      queueIndex: targetIndex,
      unplayedShuffleDeck: newShuffleDeck,
      seekRequest: 0,
    });

    try {
      useLibraryStore.getState().addToHistory(track);
    } catch {
      // Safe fallback
    }

    get().saveResumeState();
  },

  togglePlay: () => {
    const { isPlaying, currentTrack, queue } = get();
    if (!currentTrack && queue.length > 0) {
      get().playTrack(queue[0]);
      return;
    }
    set({ isPlaying: !isPlaying });
    get().saveResumeState();
  },

  setIsPlaying: (isPlaying: boolean) => {
    set({ isPlaying });
  },

  nextTrack: () => {
    const { queue, queueIndex, repeatMode, isShuffle, unplayedShuffleDeck, autoplay } = get();
    if (queue.length === 0) return;

    if (repeatMode === 'one') {
      set({ currentTime: 0, seekRequest: 0, isPlaying: true });
      return;
    }

    // 1. Smart Shuffle logic (non-repeating deck cycle)
    if (isShuffle && queue.length > 1) {
      let deck = [...unplayedShuffleDeck];
      // Filter out invalid indices if queue changed
      deck = deck.filter((i) => i >= 0 && i < queue.length && i !== queueIndex);

      if (deck.length === 0) {
        // Reshuffle entire deck
        deck = createShuffleDeck(queue.length, queueIndex);
      }

      if (deck.length > 0) {
        const nextIdx = deck.pop()!;
        const nextT = queue[nextIdx];
        set({
          currentTrack: nextT,
          queueIndex: nextIdx,
          unplayedShuffleDeck: deck,
          currentTime: 0,
          duration: nextT.duration || 0,
          seekRequest: 0,
          isPlaying: true,
        });
        try {
          useLibraryStore.getState().addToHistory(nextT);
        } catch {}
        get().saveResumeState();
        return;
      }
    }

    // 2. Normal sequential playback
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
      get().saveResumeState();
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
      get().saveResumeState();
    } else if (autoplay) {
      // 3. Smart Autoplay: end of queue reached, trigger recommendations!
      get().triggerAutoplay();
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
      get().saveResumeState();
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
      get().saveResumeState();
    } else {
      set({ currentTime: 0, seekRequest: 0 });
    }
  },

  seekTo: (seconds: number) => {
    const { duration } = get();
    const target = Math.max(0, Math.min(seconds, duration || 999999));
    set({ currentTime: target, seekRequest: target });
    get().saveResumeState();
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
    get().saveResumeState();
  },

  toggleMute: () => {
    const { isMuted, volume } = get();
    if (isMuted) {
      set({ isMuted: false, volume: volume === 0 ? 50 : volume });
    } else {
      set({ isMuted: true });
    }
    get().saveResumeState();
  },

  toggleShuffle: () => {
    set((state) => {
      const nextShuffle = !state.isShuffle;
      const deck = nextShuffle
        ? createShuffleDeck(state.queue.length, state.queueIndex)
        : [];
      return { isShuffle: nextShuffle, unplayedShuffleDeck: deck };
    });
    get().saveResumeState();
  },

  toggleRepeat: () => {
    set((state) => {
      const modes: RepeatMode[] = ['off', 'all', 'one'];
      const currentIndex = modes.indexOf(state.repeatMode);
      const nextMode = modes[(currentIndex + 1) % modes.length];
      return { repeatMode: nextMode };
    });
    get().saveResumeState();
  },

  setPlaybackSpeed: (speed: number) => {
    set({ playbackSpeed: speed });
    get().saveResumeState();
  },

  toggleAutoplay: () => {
    set((state) => ({ autoplay: !state.autoplay }));
    get().saveResumeState();
  },

  // Smart Autoplay Continuation
  triggerAutoplay: async () => {
    const { currentTrack, queue } = get();
    if (!currentTrack) return;

    try {
      const seedId = currentTrack.id || currentTrack.youtubeId;
      const res = await fetch(`/api/ytmusic/recommendations?seedTrack=${encodeURIComponent(seedId)}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        const recTracks: Track[] = (data.tracks || []).filter(
          (rt: Track) => !queue.some((q) => q.id === rt.id || q.youtubeId === rt.youtubeId)
        );

        if (recTracks.length > 0) {
          const updatedQueue = [...queue, ...recTracks];
          const nextIndex = queue.length;
          const nextSong = updatedQueue[nextIndex];

          set({
            queue: updatedQueue,
            queueIndex: nextIndex,
            currentTrack: nextSong,
            currentTime: 0,
            duration: nextSong.duration || 0,
            seekRequest: 0,
            isPlaying: true,
          });

          try {
            useLibraryStore.getState().addToHistory(nextSong);
          } catch {}
          get().saveResumeState();
          return;
        }
      }
    } catch (err) {
      console.warn('[Smart Autoplay] Failed to fetch auto-recommendations:', err);
    }

    // Fallback if recommendations fail: loop queue from beginning
    if (queue.length > 0) {
      set({
        queueIndex: 0,
        currentTrack: queue[0],
        currentTime: 0,
        duration: queue[0].duration || 0,
        seekRequest: 0,
        isPlaying: true,
      });
      get().saveResumeState();
    } else {
      set({ isPlaying: false });
    }
  },

  setCurrentTime: (currentTime: number) => {
    set({ currentTime });
  },

  setDuration: (duration: number) => {
    set({ duration });
  },

  addToQueue: (track: Track) => {
    set((state) => {
      const newQueue = [...state.queue, track];
      let newDeck = state.unplayedShuffleDeck;
      if (state.isShuffle) {
        newDeck = [...newDeck, newQueue.length - 1];
      }
      return {
        queue: newQueue,
        unplayedShuffleDeck: newDeck,
      };
    });
    get().saveResumeState();
  },

  playNext: (track: Track) => {
    set((state) => {
      const newQueue = [...state.queue];
      const insertAt = state.queueIndex >= 0 ? state.queueIndex + 1 : 0;
      newQueue.splice(insertAt, 0, track);
      return { queue: newQueue };
    });
    get().saveResumeState();
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
        unplayedShuffleDeck: state.unplayedShuffleDeck.filter((i) => i !== targetIndex),
      };
    });
    get().saveResumeState();
  },

  clearQueue: () => {
    set((state) => {
      if (state.currentTrack) {
        return {
          queue: [state.currentTrack],
          queueIndex: 0,
          unplayedShuffleDeck: [],
        };
      }
      return {
        queue: [],
        queueIndex: -1,
        unplayedShuffleDeck: [],
      };
    });
    get().saveResumeState();
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
    get().saveResumeState();
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

  toggleVisualizer: () => {
    set((state) => ({ showVisualizer: !state.showVisualizer }));
  },

  setShowVisualizer: (show: boolean) => {
    set({ showVisualizer: show });
  },

  // Remember & Restore State Logic
  saveResumeState: () => {
    if (typeof window === 'undefined') return;
    try {
      const state = get();
      const payload = {
        currentTrack: state.currentTrack,
        queue: state.queue,
        queueIndex: state.queueIndex,
        volume: state.volume,
        currentTime: Math.floor(state.currentTime),
        duration: state.duration,
        repeatMode: state.repeatMode,
        isShuffle: state.isShuffle,
        playbackSpeed: state.playbackSpeed,
        autoplay: state.autoplay,
      };
      localStorage.setItem(RESUME_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Storage quota or private mode fallback
    }
  },

  restorePlaybackState: () => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(RESUME_STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data && data.currentTrack) {
        set({
          currentTrack: data.currentTrack,
          queue: data.queue || [data.currentTrack],
          queueIndex: typeof data.queueIndex === 'number' ? data.queueIndex : 0,
          volume: typeof data.volume === 'number' ? data.volume : 75,
          currentTime: typeof data.currentTime === 'number' ? data.currentTime : 0,
          duration: typeof data.duration === 'number' ? data.duration : (data.currentTrack.duration || 0),
          repeatMode: data.repeatMode || 'off',
          isShuffle: !!data.isShuffle,
          playbackSpeed: data.playbackSpeed || 1,
          autoplay: data.autoplay !== undefined ? data.autoplay : true,
          isPlaying: false, // restore in paused state to respect browser autoplay policies
          seekRequest: data.currentTime || 0,
        });
      }
    } catch {
      // Fail silently
    }
  },
}));
