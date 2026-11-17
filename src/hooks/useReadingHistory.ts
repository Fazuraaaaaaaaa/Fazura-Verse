import { useState, useEffect, useCallback } from 'react';
import type { ReadingHistoryItem } from '../types/manga';

const STORAGE_KEY = 'fazuraverse_reading_history';
const LEGACY_STORAGE_KEY = 'mangaverse_reading_history';
const EVENT_NAME = 'fazuraverse_history_updated';

function getStoredHistory(): ReadingHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to parse reading history from localStorage:', e);
    return [];
  }
}

function persistHistory(items: ReadingHistoryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(EVENT_NAME));
  } catch (e) {
    console.error('Failed to persist reading history to localStorage:', e);
  }
}

export function useReadingHistory() {
  const [history, setHistory] = useState<ReadingHistoryItem[]>(getStoredHistory);

  useEffect(() => {
    const handler = () => {
      setHistory(getStoredHistory());
    };

    window.addEventListener(EVENT_NAME, handler);
    window.addEventListener('storage', handler);

    return () => {
      window.removeEventListener(EVENT_NAME, handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const getHistory = useCallback((): ReadingHistoryItem[] => {
    return getStoredHistory();
  }, []);

  const getLastRead = useCallback(
    (mangaSlug: string): ReadingHistoryItem | undefined => {
      if (!mangaSlug) return undefined;
      return history.find((item) => item.slug === mangaSlug);
    },
    [history]
  );

  const saveProgress = useCallback(
    (
      data: Omit<ReadingHistoryItem, 'lastReadAt'> & {
        lastReadAt?: number;
      }
    ) => {
      const current = getStoredHistory();
      const updatedItem: ReadingHistoryItem = {
        slug: data.slug,
        mangaTitle: data.mangaTitle,
        mangaCover: data.mangaCover,
        chapterSlug: data.chapterSlug,
        chapterTitle: data.chapterTitle,
        lastReadAt: data.lastReadAt || Date.now(),
        progress: typeof data.progress === 'number' ? data.progress : 0,
      };

      // Remove previous entry for this manga so the most recent is at index 0
      const filtered = current.filter((item) => item.slug !== data.slug);
      const updated = [updatedItem, ...filtered].slice(0, 100); // keep up to 100 items

      persistHistory(updated);
      setHistory(updated);
    },
    []
  );

  const removeHistoryItem = useCallback((mangaSlug: string) => {
    const current = getStoredHistory();
    const updated = current.filter((item) => item.slug !== mangaSlug);
    persistHistory(updated);
    setHistory(updated);
  }, []);

  const clearHistory = useCallback(() => {
    persistHistory([]);
    setHistory([]);
  }, []);

  return {
    history,
    saveProgress,
    getHistory,
    getLastRead,
    removeHistoryItem,
    clearHistory,
  };
}

