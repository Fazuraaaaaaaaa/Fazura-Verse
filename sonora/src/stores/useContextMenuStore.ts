import { create } from 'zustand';
import { Track } from '@/types/music';

interface ContextMenuState {
  isOpen: boolean;
  position: { x: number; y: number };
  track: Track | null;
  playlistContext?: Track[];
  openContextMenu: (e: React.MouseEvent, track: Track, playlistContext?: Track[]) => void;
  closeContextMenu: () => void;
}

export const useContextMenuStore = create<ContextMenuState>((set) => ({
  isOpen: false,
  position: { x: 0, y: 0 },
  track: null,
  playlistContext: undefined,

  openContextMenu: (e: React.MouseEvent, track: Track, playlistContext?: Track[]) => {
    e.preventDefault();
    e.stopPropagation();

    // Clamp inside viewport
    const menuWidth = 240;
    const menuHeight = 320;
    const x = Math.min(e.clientX, window.innerWidth - menuWidth - 10);
    const y = Math.min(e.clientY, window.innerHeight - menuHeight - 10);

    set({
      isOpen: true,
      position: { x: Math.max(10, x), y: Math.max(10, y) },
      track,
      playlistContext,
    });
  },

  closeContextMenu: () => {
    set({ isOpen: false, track: null, playlistContext: undefined });
  },
}));
