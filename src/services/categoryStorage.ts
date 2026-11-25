import { useState, useEffect, useCallback, useMemo } from 'react';

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

// -------------------------------------------------------------
// Unified Multi-Category Helpers & Backup/Restore
// -------------------------------------------------------------

export const ALL_CATEGORIES: CategoryType[] = ['manga', 'anime', 'donghua', 'movies', 'music'];

export interface BackupData {
  version: number;
  exportedAt: string;
  source: string;
  bookmarks: Record<CategoryType, CategoryBookmarkItem[]>;
  history: Record<CategoryType, CategoryHistoryItem[]>;
}

export function getAllCategoryBookmarks(): Record<CategoryType, CategoryBookmarkItem[]> {
  return {
    manga: getCategoryBookmarks('manga'),
    anime: getCategoryBookmarks('anime'),
    donghua: getCategoryBookmarks('donghua'),
    movies: getCategoryBookmarks('movies'),
    music: getCategoryBookmarks('music'),
  };
}

export function getAllCategoryHistory(): Record<CategoryType, CategoryHistoryItem[]> {
  return {
    manga: getCategoryHistory('manga'),
    anime: getCategoryHistory('anime'),
    donghua: getCategoryHistory('donghua'),
    movies: getCategoryHistory('movies'),
    music: getCategoryHistory('music'),
  };
}

export function useAllCategoryBookmarks() {
  const [data, setData] = useState<Record<CategoryType, CategoryBookmarkItem[]>>(() =>
    getAllCategoryBookmarks()
  );

  const refresh = useCallback(() => {
    setData(getAllCategoryBookmarks());
  }, []);

  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener(BOOKMARK_EVENT, handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener(BOOKMARK_EVENT, handler);
      window.removeEventListener('storage', handler);
    };
  }, [refresh]);

  const removeBookmark = useCallback((category: CategoryType, id: string) => {
    const current = getCategoryBookmarks(category);
    const next = current.filter((b) => String(b.id) !== String(id));
    saveCategoryBookmarks(category, next);
  }, []);

  const clearBookmarks = useCallback((category?: CategoryType) => {
    if (category) {
      saveCategoryBookmarks(category, []);
    } else {
      for (const cat of ALL_CATEGORIES) {
        saveCategoryBookmarks(cat, []);
      }
    }
  }, []);

  const allItems = useMemo(() => {
    return [
      ...data.manga,
      ...data.anime,
      ...data.donghua,
      ...data.movies,
      ...data.music,
    ].sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
  }, [data]);

  return {
    byCategory: data,
    allItems,
    totalCount: allItems.length,
    removeBookmark,
    clearBookmarks,
    refresh,
  };
}

export function useAllCategoryHistory() {
  const [data, setData] = useState<Record<CategoryType, CategoryHistoryItem[]>>(() =>
    getAllCategoryHistory()
  );

  const refresh = useCallback(() => {
    setData(getAllCategoryHistory());
  }, []);

  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener(HISTORY_EVENT, handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener(HISTORY_EVENT, handler);
      window.removeEventListener('storage', handler);
    };
  }, [refresh]);

  const removeHistoryItem = useCallback((category: CategoryType, id: string) => {
    const current = getCategoryHistory(category);
    const next = current.filter((h) => String(h.id) !== String(id));
    saveCategoryHistory(category, next);
  }, []);

  const clearHistory = useCallback((category?: CategoryType) => {
    if (category) {
      saveCategoryHistory(category, []);
    } else {
      for (const cat of ALL_CATEGORIES) {
        saveCategoryHistory(cat, []);
      }
    }
  }, []);

  const allItems = useMemo(() => {
    return [
      ...data.manga,
      ...data.anime,
      ...data.donghua,
      ...data.movies,
      ...data.music,
    ].sort((a, b) => (b.watchedAt || 0) - (a.watchedAt || 0));
  }, [data]);

  return {
    byCategory: data,
    allItems,
    totalCount: allItems.length,
    removeHistoryItem,
    clearHistory,
    refresh,
  };
}

export function createBackupData(): BackupData {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    source: 'fazurastream',
    bookmarks: getAllCategoryBookmarks(),
    history: getAllCategoryHistory(),
  };
}

export interface BackupValidationResult {
  valid: boolean;
  error?: string;
  data?: BackupData;
  summary?: {
    totalBookmarks: number;
    totalHistory: number;
    byCategory: Record<CategoryType, { bookmarks: number; history: number }>;
  };
}

export function validateBackupData(jsonString: string): BackupValidationResult {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') {
      return { valid: false, error: 'File JSON tidak valid atau kosong.' };
    }

    const hasBookmarks = parsed.bookmarks && typeof parsed.bookmarks === 'object';
    const hasHistory = parsed.history && typeof parsed.history === 'object';

    if (!hasBookmarks && !hasHistory) {
      return { valid: false, error: 'Format backup tidak dikenali. Objek bookmarks atau history tidak ditemukan.' };
    }

    const summary = {
      totalBookmarks: 0,
      totalHistory: 0,
      byCategory: {
        manga: { bookmarks: 0, history: 0 },
        anime: { bookmarks: 0, history: 0 },
        donghua: { bookmarks: 0, history: 0 },
        movies: { bookmarks: 0, history: 0 },
        music: { bookmarks: 0, history: 0 },
      },
    };

    const sanitizedBookmarks: Record<CategoryType, CategoryBookmarkItem[]> = {
      manga: [],
      anime: [],
      donghua: [],
      movies: [],
      music: [],
    };

    const sanitizedHistory: Record<CategoryType, CategoryHistoryItem[]> = {
      manga: [],
      anime: [],
      donghua: [],
      movies: [],
      music: [],
    };

    if (hasBookmarks) {
      for (const cat of ALL_CATEGORIES) {
        const items = parsed.bookmarks[cat];
        if (Array.isArray(items)) {
          const validItems = items.filter((item: any) => item && (item.id || item.slug) && item.title);
          sanitizedBookmarks[cat] = validItems.map((item: any) => ({
            id: String(item.id || item.slug),
            category: cat,
            title: String(item.title),
            cover: String(item.cover || ''),
            link: String(item.link || `/manga/${item.slug || item.id}`),
            subtitle: item.subtitle ? String(item.subtitle) : undefined,
            type: item.type ? String(item.type) : undefined,
            addedAt: Number(item.addedAt) || Date.now(),
            extra: item.extra || undefined,
          }));
          summary.byCategory[cat].bookmarks = sanitizedBookmarks[cat].length;
          summary.totalBookmarks += sanitizedBookmarks[cat].length;
        }
      }
    }

    if (hasHistory) {
      for (const cat of ALL_CATEGORIES) {
        const items = parsed.history[cat];
        if (Array.isArray(items)) {
          const validItems = items.filter(
            (item: any) => item && (item.id || item.slug) && (item.title || item.mangaTitle)
          );
          sanitizedHistory[cat] = validItems.map((item: any) => ({
            id: String(item.id || item.slug),
            category: cat,
            title: String(item.title || item.mangaTitle),
            cover: String(item.cover || item.mangaCover || ''),
            lastItemTitle: item.lastItemTitle
              ? String(item.lastItemTitle)
              : item.chapterTitle
              ? String(item.chapterTitle)
              : undefined,
            lastItemLink: String(
              item.lastItemLink || (item.chapterSlug ? `/chapter/${item.chapterSlug}` : '')
            ),
            watchedAt: Number(item.watchedAt || item.lastReadAt) || Date.now(),
            progress: typeof item.progress === 'number' ? item.progress : undefined,
            extra: item.extra || undefined,
          }));
          summary.byCategory[cat].history = sanitizedHistory[cat].length;
          summary.totalHistory += sanitizedHistory[cat].length;
        }
      }
    }

    if (summary.totalBookmarks === 0 && summary.totalHistory === 0) {
      return { valid: false, error: 'File backup tidak memiliki bookmark atau riwayat yang dapat dipulihkan.' };
    }

    const backupData: BackupData = {
      version: parsed.version || 1,
      exportedAt: parsed.exportedAt || new Date().toISOString(),
      source: 'fazurastream',
      bookmarks: sanitizedBookmarks,
      history: sanitizedHistory,
    };

    return {
      valid: true,
      data: backupData,
      summary,
    };
  } catch (err: any) {
    return { valid: false, error: `Gagal memproses file JSON: ${err?.message || 'Error tidak diketahui'}` };
  }
}

export function applyBackupData(
  backup: BackupData,
  mode: 'merge' | 'overwrite' = 'merge'
): { bookmarksImported: number; historyImported: number } {
  // Snapshot existing state so failed writes never erase user's previous library
  const snapshotBookmarks = getAllCategoryBookmarks();
  const snapshotHistory = getAllCategoryHistory();

  let bookmarksImported = 0;
  let historyImported = 0;

  try {
    for (const cat of ALL_CATEGORIES) {
      const newBookmarks = backup.bookmarks[cat] || [];
      if (mode === 'overwrite') {
        localStorage.setItem(getBookmarkKey(cat), JSON.stringify(newBookmarks));
        bookmarksImported += newBookmarks.length;
      } else {
        const current = getCategoryBookmarks(cat);
        const currentIds = new Set(current.map((b) => String(b.id)));
        const itemsToAdd = newBookmarks.filter((b) => !currentIds.has(String(b.id)));
        const merged = [...itemsToAdd, ...current];
        localStorage.setItem(getBookmarkKey(cat), JSON.stringify(merged));
        bookmarksImported += itemsToAdd.length;
      }

      const newHistory = backup.history[cat] || [];
      if (mode === 'overwrite') {
        localStorage.setItem(getHistoryKey(cat), JSON.stringify(newHistory));
        historyImported += newHistory.length;
      } else {
        const current = getCategoryHistory(cat);
        const currentIds = new Set(current.map((h) => String(h.id)));
        const itemsToAdd = newHistory.filter((h) => !currentIds.has(String(h.id)));
        const merged = [...itemsToAdd, ...current].slice(0, 100);
        localStorage.setItem(getHistoryKey(cat), JSON.stringify(merged));
        historyImported += itemsToAdd.length;
      }
    }

    window.dispatchEvent(new CustomEvent(BOOKMARK_EVENT, { detail: { category: undefined } }));
    window.dispatchEvent(new CustomEvent(HISTORY_EVENT, { detail: { category: undefined } }));

    return { bookmarksImported, historyImported };
  } catch (err) {
    // Rollback to pre-import snapshot on storage error
    try {
      for (const cat of ALL_CATEGORIES) {
        localStorage.setItem(getBookmarkKey(cat), JSON.stringify(snapshotBookmarks[cat] || []));
        localStorage.setItem(getHistoryKey(cat), JSON.stringify(snapshotHistory[cat] || []));
      }
    } catch {
      // ignore secondary rollback failure
    }
    throw err;
  }
}

export function downloadBackupFile() {
  const data = createBackupData();
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `fazurastream-backup-${dateStr}.json`;
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
