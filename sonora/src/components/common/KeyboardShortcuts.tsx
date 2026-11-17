'use client';

import React, { useEffect } from 'react';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { useToastStore } from '@/stores/useToastStore';

export default function KeyboardShortcuts() {
  const {
    currentTrack,
    isPlaying,
    isMuted,
    togglePlay,
    nextTrack,
    previousTrack,
    toggleMute,
    toggleLyrics,
    toggleQueue,
  } = usePlayerStore();
  const { showToast } = useToastStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input or textarea
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      // Space: Toggle Play / Pause
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
        return;
      }

      // Shift + ArrowRight: Next Track
      if (e.shiftKey && e.code === 'ArrowRight') {
        e.preventDefault();
        nextTrack();
        showToast('Next track', 'info');
        return;
      }

      // Shift + ArrowLeft: Previous Track
      if (e.shiftKey && e.code === 'ArrowLeft') {
        e.preventDefault();
        previousTrack();
        showToast('Previous track', 'info');
        return;
      }

      // KeyM: Toggle Mute
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
        showToast(isMuted ? 'Unmuted' : 'Muted', 'info');
        return;
      }

      // KeyL: Toggle Lyrics
      if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        toggleLyrics();
        return;
      }

      // KeyQ: Toggle Queue
      if (e.key === 'q' || e.key === 'Q') {
        e.preventDefault();
        toggleQueue();
        return;
      }

      // KeyP: Open Pop-up Miniplayer
      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        if (typeof window !== 'undefined') {
          window.open(
            '/miniplayer',
            'sonora_miniplayer',
            'width=380,height=540,resizable=yes,scrollbars=no,status=no'
          );
          showToast('Opened Pop-up Mini Player', 'info');
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    isPlaying,
    isMuted,
    togglePlay,
    nextTrack,
    previousTrack,
    toggleMute,
    toggleLyrics,
    toggleQueue,
    showToast,
  ]);

  return null;
}
