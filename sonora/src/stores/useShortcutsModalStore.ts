import { create } from 'zustand';

interface ShortcutsModalState {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  toggleModal: () => void;
}

export const useShortcutsModalStore = create<ShortcutsModalState>((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
  toggleModal: () => set((s) => ({ isOpen: !s.isOpen })),
}));
