import { useState, useEffect, useCallback } from 'react';
import type { ReaderSettings } from '../types/manga';

const STORAGE_KEY = 'fazuraverse_reader_settings';
const LEGACY_STORAGE_KEY = 'mangaverse_reader_settings';
const EVENT_NAME = 'fazuraverse_reader_settings_updated';

export const DEFAULT_READER_SETTINGS: ReaderSettings = {
  mode: 'vertical',
  fit: 'width',
  gap: 12,
  background: 'black',
  invertColors: false,
};

function getStoredSettings(): ReaderSettings {
  if (typeof window === 'undefined') return DEFAULT_READER_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return DEFAULT_READER_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      mode: parsed.mode || DEFAULT_READER_SETTINGS.mode,
      fit: parsed.fit || DEFAULT_READER_SETTINGS.fit,
      gap: typeof parsed.gap === 'number' ? parsed.gap : DEFAULT_READER_SETTINGS.gap,
      background: parsed.background || DEFAULT_READER_SETTINGS.background,
      invertColors: Boolean(parsed.invertColors),
    };
  } catch (e) {
    console.error('Failed to parse reader settings from localStorage:', e);
    return DEFAULT_READER_SETTINGS;
  }
}

function persistSettings(settings: ReaderSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new Event(EVENT_NAME));
  } catch (e) {
    console.error('Failed to persist reader settings to localStorage:', e);
  }
}

export function useReaderSettings() {
  const [settings, setSettings] = useState<ReaderSettings>(getStoredSettings);

  useEffect(() => {
    const handler = () => {
      setSettings(getStoredSettings());
    };

    window.addEventListener(EVENT_NAME, handler);
    window.addEventListener('storage', handler);

    return () => {
      window.removeEventListener(EVENT_NAME, handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const updateSettings = useCallback((partial: Partial<ReaderSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      persistSettings(next);
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    persistSettings(DEFAULT_READER_SETTINGS);
    setSettings(DEFAULT_READER_SETTINGS);
  }, []);

  return {
    settings,
    updateSettings,
    resetSettings,
  };
}

