import { useCategoryHistory } from '../services/categoryStorage';
import type { ReadingHistoryItem } from '../types/manga';

export function useReadingHistory() {
  const { history, recordHistory, removeHistoryItem, clearHistory } =
    useCategoryHistory('manga');

  const mangaHistory: ReadingHistoryItem[] = history.map((h) => ({
    slug: h.id,
    mangaTitle: h.title,
    mangaCover: h.cover,
    chapterSlug: h.extra?.chapterSlug || h.lastItemLink.replace('/chapter/', ''),
    chapterTitle: h.lastItemTitle || 'Chapter Terakhir',
    lastReadAt: h.watchedAt,
    progress: h.progress || 0,
  }));

  const saveProgress = (
    data: Omit<ReadingHistoryItem, 'lastReadAt'> & {
      lastReadAt?: number;
    }
  ) => {
    recordHistory({
      id: data.slug,
      category: 'manga',
      title: data.mangaTitle,
      cover: data.mangaCover,
      lastItemTitle: data.chapterTitle,
      lastItemLink: `/chapter/${data.chapterSlug}`,
      watchedAt: data.lastReadAt || Date.now(),
      progress: data.progress || 0,
      extra: {
        chapterSlug: data.chapterSlug,
      },
    });
  };

  const getLastRead = (mangaSlug: string): ReadingHistoryItem | undefined => {
    return mangaHistory.find((item) => item.slug === mangaSlug);
  };

  return {
    history: mangaHistory,
    saveProgress,
    getLastRead,
    removeHistoryItem,
    clearHistory,
    getHistory: () => mangaHistory,
  };
}
