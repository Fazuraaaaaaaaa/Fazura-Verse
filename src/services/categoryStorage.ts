import { useState, useEffect, useCallback } from 'react';

export type CategoryType = 'anime' | 'manga' | 'donghua' | 'movies' | 'music';

export interface CategoryBookmarkItem {
  id: string; // Unique identifier (slug, animeId, movieId, trackId)
  category: CategoryType;
  title: string;
  cover: string;
  link: string;
  subtitle?: string; // e.g. "Action, Fantasy" or "Bernadya" or "Movie 2024"
  type?: string;     // e.g. "TV", "Manga", "Donghua 3D", "Lagu"
  addedAt: number;
  extra?: Record<string, any>;
}

export interface CategoryHistoryItem {
  id: string;
  category: CategoryType;
  title: string;
  cover: string;
  lastItemTitle?: string; // e.g. "Episode 12", "Chapter 105", "Durasi 03:45"
  lastItemLink: string;   // direct link to resume playing or reading
  watchedAt: number;
  progress?: number;      // percentage or timestamp
  extra?: Record<string, any>;
}

function getBookmarkKey(category: CategoryType): string {
  return `fazura_bookmarks_${category}`;
}

function getHistoryKey(category: CategoryType): string {
  return `fazura_history_${category}`;
}

const BOOKMARK_EVENT = 'fazura_bookmarks_changed';
const HISTORY_EVENT = 'fazura_history_changed';

// Initial migration for existing Manga bookmarks & reading history
function ensureMangaMigration() {
  if (typeof window === 'undefined') return;
  try {
    const mangaBookmarkKey = getBookmarkKey('manga');
    if (!localStorage.getItem(mangaBookmarkKey)) {
      const legacyBookmarks =
        localStorage.getItem('fazuraverse_bookmarks') ||
        localStorage.getItem('mangaverse_bookmarks');
      if (legacyBookmarks) {
        const parsed = JSON.parse(legacyBookmarks);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const migrated: CategoryBookmarkItem[] = parsed.map((item: any) => ({
            id: item.slug || item.id,
            category: 'manga',
            title: item.title,
            cover: item.cover,
            link: `/manga/${item.slug || item.id}`,
            type: item.type || 'Manga',
            addedAt: item.addedAt || Date.now(),
          }));
          localStorage.setItem(mangaBookmarkKey, JSON.stringify(migrated));
        }
      }
    }

    const mangaHistoryKey = getHistoryKey('manga');
    if (!localStorage.getItem(mangaHistoryKey)) {
      const legacyHistory =
        localStorage.getItem('fazuraverse_reading_history') ||
        localStorage.getItem('mangaverse_reading_history');
      if (legacyHistory) {
        const parsed = JSON.parse(legacyHistory);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const migrated: CategoryHistoryItem[] = parsed.map((item: any) => ({
            id: item.slug,
            category: 'manga',
            title: item.mangaTitle || item.title || 'Manga',
            cover: item.mangaCover || item.cover || '',
            lastItemTitle: item.chapterTitle || 'Chapter Terakhir',
            lastItemLink: `/chapter/${item.chapterSlug}`,
            watchedAt: item.lastReadAt || Date.now(),
            progress: item.progress || 0,
          }));
          localStorage.setItem(mangaHistoryKey, JSON.stringify(migrated));
        }
      }
    }
  } catch (err) {
    console.error('Error during manga storage migration:', err);
  }
}

// -------------------------------------------------------------
// Category Bookmarks Implementation
// -------------------------------------------------------------

export function getCategoryBookmarks(category: CategoryType): CategoryBookmarkItem[] {
  if (typeof window === 'undefined') return [];
  ensureMangaMigration();
  try {
    const raw = localStorage.getItem(getBookmarkKey(category));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error(`Error reading bookmarks for ${category}:`, err);
    return [];
  }
}

export function saveCategoryBookmarks(category: CategoryType, items: CategoryBookmarkItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getBookmarkKey(category), JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(BOOKMARK_EVENT, { detail: { category } }));
  } catch (err) {
    console.error(`Error saving bookmarks for ${category}:`, err);
  }
}

export function useCategoryBookmarks(category: CategoryType) {
  const [bookmarks, setBookmarks] = useState<CategoryBookmarkItem[]>(() =>
    getCategoryBookmarks(category)
  );

  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (!customEvent.detail || customEvent.detail.category === category) {
        setBookmarks(getCategoryBookmarks(category));
      }
    };

    window.addEventListener(BOOKMARK_EVENT, handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener(BOOKMARK_EVENT, handler);
      window.removeEventListener('storage', handler);
    };
  }, [category]);

  const isBookmarked = useCallback(
    (id: string): boolean => {
      if (!id) return false;
      return bookmarks.some((b) => String(b.id) === String(id));
    },
    [bookmarks]
  );

  const toggleBookmark = useCallback(
    (item: Omit<CategoryBookmarkItem, 'addedAt'> & { addedAt?: number }) => {
      const current = getCategoryBookmarks(category);
      const exists = current.some((b) => String(b.id) === String(item.id));
      let next: CategoryBookmarkItem[];
      if (exists) {
        next = current.filter((b) => String(b.id) !== String(item.id));
      } else {
        const newItem: CategoryBookmarkItem = {
          ...item,
          category,
          addedAt: item.addedAt || Date.now(),
        };
        next = [newItem, ...current];
      }
      saveCategoryBookmarks(category, next);
      setBookmarks(next);
    },
    [category]
  );

  const removeBookmark = useCallback(
    (id: string) => {
      const current = getCategoryBookmarks(category);
      const next = current.filter((b) => String(b.id) !== String(id));
      saveCategoryBookmarks(category, next);
      setBookmarks(next);
    },
    [category]
  );

  const clearBookmarks = useCallback(() => {
    saveCategoryBookmarks(category, []);
    setBookmarks([]);
  }, [category]);

  return {
    bookmarks,
    isBookmarked,
    toggleBookmark,
    removeBookmark,
    clearBookmarks,
  };
}

// -------------------------------------------------------------
// Category History Implementation
// -------------------------------------------------------------

export function getCategoryHistory(category: CategoryType): CategoryHistoryItem[] {
  if (typeof window === 'undefined') return [];
  ensureMangaMigration();
  try {
    const raw = localStorage.getItem(getHistoryKey(category));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error(`Error reading history for ${category}:`, err);
    return [];
  }
}

export function saveCategoryHistory(category: CategoryType, items: CategoryHistoryItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getHistoryKey(category), JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(HISTORY_EVENT, { detail: { category } }));
  } catch (err) {
    console.error(`Error saving history for ${category}:`, err);
  }
}

export function recordCategoryHistory(
  category: CategoryType,
  item: Omit<CategoryHistoryItem, 'watchedAt'> & { watchedAt?: number }
) {
  const current = getCategoryHistory(category);
  const filtered = current.filter((h) => String(h.id) !== String(item.id));
  const entry: CategoryHistoryItem = {
    ...item,
    category,
    watchedAt: item.watchedAt || Date.now(),
  };
  const next = [entry, ...filtered].slice(0, 100);
  saveCategoryHistory(category, next);
}

export function useCategoryHistory(category: CategoryType) {
  const [history, setHistory] = useState<CategoryHistoryItem[]>(() =>
    getCategoryHistory(category)
  );

  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (!customEvent.detail || customEvent.detail.category === category) {
        setHistory(getCategoryHistory(category));
      }
    };

    window.addEventListener(HISTORY_EVENT, handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener(HISTORY_EVENT, handler);
      window.removeEventListener('storage', handler);
    };
  }, [category]);

  const recordHistory = useCallback(
    (item: Omit<CategoryHistoryItem, 'watchedAt'> & { watchedAt?: number }) => {
      const current = getCategoryHistory(category);
      const filtered = current.filter((h) => String(h.id) !== String(item.id));
      const entry: CategoryHistoryItem = {
        ...item,
        category,
        watchedAt: item.watchedAt || Date.now(),
      };
      const next = [entry, ...filtered].slice(0, 100); // max 100 entries per category
      saveCategoryHistory(category, next);
      setHistory(next);
    },
    [category]
  );

  const removeHistoryItem = useCallback(
    (id: string) => {
      const current = getCategoryHistory(category);
      const next = current.filter((h) => String(h.id) !== String(id));
      saveCategoryHistory(category, next);
      setHistory(next);
    },
    [category]
  );

  const clearHistory = useCallback(() => {
    saveCategoryHistory(category, []);
    setHistory([]);
  }, [category]);

  return {
    history,
    recordHistory,
    removeHistoryItem,
    clearHistory,
  };
}
