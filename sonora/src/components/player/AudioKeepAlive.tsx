'use client';

import React, { useEffect, useRef } from 'react';
import { usePlayerStore } from '@/stores/usePlayerStore';

// Ultra-lightweight base64-encoded silent WAV audio loop (44.1kHz PCM)
const SILENT_WAV_BASE64 =
  'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';

/**
 * AudioKeepAlive creates an unobtrusive HTML5 audio loop playing silence
 * synchronized with the player's `isPlaying` state.
 *
 * This keeps the mobile (iOS Safari / Android Chrome) and background desktop
 * tab audio session active, preventing browser power management from suspending
 * the YouTube IFrame player when the user minimizes the tab or locks their device.
 */
export const AudioKeepAlive: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { isPlaying } = usePlayerStore();

  useEffect(() => {
    // Create audio element if not already present
    if (!audioRef.current && typeof window !== 'undefined') {
      const audio = new Audio();
      audio.src = SILENT_WAV_BASE64;
      audio.loop = true;
      audio.volume = 0.01; // minimal volume to ensure browser recognizes active stream
      audioRef.current = audio;
    }

    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(() => {
        // Autoplay policy might require initial user interaction
        const unlock = () => {
          if (audioRef.current && usePlayerStore.getState().isPlaying) {
            audioRef.current.play().catch(() => {});
          }
          window.removeEventListener('click', unlock);
          window.removeEventListener('keydown', unlock);
          window.removeEventListener('touchstart', unlock);
        };
        window.addEventListener('click', unlock, { once: true });
        window.addEventListener('keydown', unlock, { once: true });
        window.addEventListener('touchstart', unlock, { once: true });
      });
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  return null;
};

export default AudioKeepAlive;
