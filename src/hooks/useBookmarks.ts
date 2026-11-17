import { useState, useEffect, useCallback } from 'react';
import type { BookmarkItem } from '../types/manga';

const STORAGE_KEY = 'fazuraverse_bookmarks';
const LEGACY_STORAGE_KEY = 'mangaverse_bookmarks';
const EVENT_NAME = 'fazuraverse_bookmarks_updated';

function getStoredBookmarks(): BookmarkItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to parse bookmarks from localStorage:', e);
    return [];
  }
}

function persistBookmarks(items: BookmarkItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(EVENT_NAME));
  } catch (e) {
    console.error('Failed to persist bookmarks to localStorage:', e);
  }
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(getStoredBookmarks);

  useEffect(() => {
    const handler = () => {
      setBookmarks(getStoredBookmarks());
    };

    window.addEventListener(EVENT_NAME, handler);
    window.addEventListener('storage', handler);

    return () => {
      window.removeEventListener(EVENT_NAME, handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const getAll = useCallback((): BookmarkItem[] => {
    return getStoredBookmarks();
  }, []);

  const isBookmarked = useCallback(
    (slug: string): boolean => {
      if (!slug) return false;
      return bookmarks.some((item) => item.slug === slug);
    },
    [bookmarks]
  );

  const addBookmark = useCallback((item: Omit<BookmarkItem, 'addedAt'> & { addedAt?: number }) => {
    const current = getStoredBookmarks();
    const existingIndex = current.findIndex((b) => b.slug === item.slug);
    const newBookmark: BookmarkItem = {
      slug: item.slug,
      title: item.title,
      cover: item.cover,
      type: item.type,
      addedAt: item.addedAt || Date.now(),
    };

    let updated: BookmarkItem[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = newBookmark;
    } else {
      updated = [newBookmark, ...current];
    }

    persistBookmarks(updated);
    setBookmarks(updated);
  }, []);

  const removeBookmark = useCallback((slug: string) => {
    const current = getStoredBookmarks();
    const updated = current.filter((b) => b.slug !== slug);
    persistBookmarks(updated);
    setBookmarks(updated);
  }, []);

  const toggleBookmark = useCallback(
    (item: Omit<BookmarkItem, 'addedAt'> & { addedAt?: number }) => {
      if (isBookmarked(item.slug)) {
        removeBookmark(item.slug);
      } else {
        addBookmark(item);
      }
    },
    [isBookmarked, addBookmark, removeBookmark]
  );

  const clearBookmarks = useCallback(() => {
    persistBookmarks([]);
    setBookmarks([]);
  }, []);

  return {
    bookmarks,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    isBookmarked,
    getAll,
    clearBookmarks,
  };
}

