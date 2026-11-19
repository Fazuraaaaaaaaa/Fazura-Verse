export interface MangaItem {
  title: string;
  slug: string;
  cover: string;
  chapter?: string;
  date?: string;
  type?: string;
  rating?: string;
  endpoint?: string;
}

export interface GenreItem {
  title: string;
  slug: string;
  endpoint?: string;
}

export interface ChapterItem {
  title: string;
  slug: string;
  date: string;
  endpoint?: string;
}

export interface MangaDetail {
  title: string;
  cover: string;
  rating?: string;
  otherTitle?: string;
  status?: string;
  type?: string;
  author?: string;
  artist?: string;
  release?: string;
  series?: string;
  reader?: string;
  synopsis: string;
  genres: GenreItem[];
  chapters: ChapterItem[];
}

export interface ChapterNavigation {
  next: string | null;
  prev: string | null;
}

export interface ChapterData {
  title: string;
  images: string[];
  navigation: ChapterNavigation;
}

export interface MangaListResult extends Array<MangaItem> {
  komikList: MangaItem[];
  hasNextPage: boolean;
  currentPage: number;
}

export interface ReadingHistoryItem {
  slug: string;
  mangaTitle: string;
  mangaCover: string;
  chapterSlug: string;
  chapterTitle: string;
  lastReadAt: number;
  progress?: number;
}

export interface BookmarkItem {
  slug: string;
  title: string;
  cover: string;
  type?: string;
  addedAt: number;
}

export interface ReaderSettings {
  mode: 'vertical' | 'single' | 'double';
  fit: 'width' | 'height' | 'original';
  gap: number;
  background: 'black' | 'dark' | 'gray';
  direction?: 'ltr' | 'rtl';
}

export type MangaType = 'manga' | 'manhwa' | 'manhua';
