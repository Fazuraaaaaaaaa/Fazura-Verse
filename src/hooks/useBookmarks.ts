import { useCategoryBookmarks } from '../services/categoryStorage';
import type { BookmarkItem } from '../types/manga';

export function useBookmarks() {
  const { bookmarks, isBookmarked, toggleBookmark, removeBookmark, clearBookmarks } =
    useCategoryBookmarks('manga');

  // Convert CategoryBookmarkItem to Manga BookmarkItem
  const mangaBookmarks: BookmarkItem[] = bookmarks.map((b) => ({
    slug: b.id,
    title: b.title,
    cover: b.cover,
    type: b.type,
    addedAt: b.addedAt,
  }));

  const handleToggle = (item: Omit<BookmarkItem, 'addedAt'> & { addedAt?: number }) => {
    toggleBookmark({
      id: item.slug,
      category: 'manga',
      title: item.title,
      cover: item.cover,
      link: `/manga/${item.slug}`,
      type: item.type,
      addedAt: item.addedAt,
    });
  };

  const handleAdd = (item: Omit<BookmarkItem, 'addedAt'> & { addedAt?: number }) => {
    handleToggle(item);
  };

  return {
    bookmarks: mangaBookmarks,
    getAll: () => mangaBookmarks,
    isBookmarked,
    addBookmark: handleAdd,
    removeBookmark,
    toggleBookmark: handleToggle,
    clearBookmarks,
  };
}
