import type {
  MangaItem,
  MangaDetail,
  ChapterData,
  GenreItem,
  MangaType,
  MangaListResult,
} from '../types/manga';

export const API_BASE_URL = 'https://www.sankavollerei.web.id/comic/bacakomik';

export interface GenreListResult extends Array<GenreItem> {
  genres: GenreItem[];
}

export class ApiError extends Error {
  status?: number;
  endpoint: string;

  constructor(message: string, endpoint: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.endpoint = endpoint;
    this.status = status;
  }
}

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...options?.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new ApiError(
        `Failed to fetch from ${endpoint}: HTTP ${res.status} ${res.statusText}`,
        endpoint,
        res.status
      );
    }

    const data = await res.json();
    return data as T;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new ApiError(`Request timeout for ${endpoint}`, endpoint, 408);
    }
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      `Network error fetching ${endpoint}: ${error.message || 'Unknown error'}`,
      endpoint
    );
  }
}

function wrapMangaList(
  rawList: unknown,
  hasNextPage = false,
  currentPage = 1
): MangaListResult {
  const list: MangaItem[] = Array.isArray(rawList)
    ? rawList.map((item: any) => ({
        title: String(item?.title || item?.name || '').trim(),
        slug: String(item?.slug || item?.endpoint || '').trim(),
        cover: String(item?.cover || item?.thumbnail || item?.image || '').trim(),
        chapter: item?.chapter ? String(item.chapter).trim() : undefined,
        date: item?.date ? String(item.date).trim() : undefined,
        type: item?.type ? String(item.type).trim() : undefined,
        rating: item?.rating ? String(item.rating).trim() : undefined,
        endpoint: item?.endpoint ? String(item.endpoint).trim() : undefined,
      }))
    : [];

  const result = list as MangaListResult;
  result.komikList = list;
  result.hasNextPage = Boolean(hasNextPage);
  result.currentPage = Number(currentPage) || 1;

  return result;
}

function formatChapterTitle(slug: string, rawTitle?: string): string {
  if (rawTitle && rawTitle.trim().length > 0) {
    return rawTitle.trim();
  }
  if (!slug) return 'Chapter';

  const match = slug.match(/chapter-(\d+.*)$/i);
  if (match) {
    const chapterPart = match[1].replace(/-/g, ' ').trim();
    return `Chapter ${chapterPart}`;
  }
  return slug.replace(/-/g, ' ').trim();
}

/**
 * Fetch latest updated manga (paginated)
 * Endpoint: /latest or /latest/:page
 */
export async function getLatest(page = 1): Promise<MangaListResult> {
  const endpoint = `/latest/${page}`;
  const data = await fetchJson<any>(endpoint);
  return wrapMangaList(
    data?.komikList || data?.data,
    data?.hasNextPage,
    data?.currentPage ?? page
  );
}

/**
 * Fetch popular manga
 * Endpoint: /populer
 */
export async function getPopular(): Promise<MangaListResult> {
  const data = await fetchJson<any>('/populer');
  return wrapMangaList(data?.komikList || data?.data, false, 1);
}

/**
 * Fetch top manga
 * Endpoint: /top
 */
export async function getTop(): Promise<MangaListResult> {
  const data = await fetchJson<any>('/top');
  return wrapMangaList(data?.komikList || data?.data, false, 1);
}

/**
 * Fetch manga filtered by type (manga, manhwa, manhua)
 * Endpoint: /only/:type or /only/:type/:page
 */
export async function getByType(
  type: MangaType,
  page = 1
): Promise<MangaListResult> {
  const endpoint = `/only/${type}/${page}`;
  const data = await fetchJson<any>(endpoint);
  return wrapMangaList(
    data?.komikList || data?.data,
    data?.hasNextPage,
    data?.currentPage ?? page
  );
}

/**
 * Fetch all available genres
 * Endpoint: /genres
 */
export async function getGenres(): Promise<GenreListResult> {
  const data = await fetchJson<any>('/genres');
  const rawList = data?.genres || data?.genreList || data?.data;
  const list: GenreItem[] = Array.isArray(rawList)
    ? rawList.map((g: any) => ({
        title: String(g?.title || g?.name || '').trim(),
        slug: String(g?.slug || g?.endpoint || '').trim(),
        endpoint: g?.endpoint ? String(g.endpoint).trim() : undefined,
      }))
    : [];

  const result = list as GenreListResult;
  result.genres = list;
  return result;
}

/**
 * Fetch manga by genre
 * Endpoint: /genre/:genre or /genre/:genre/:page
 */
export async function getByGenre(
  genre: string,
  page = 1
): Promise<MangaListResult> {
  const cleanGenre = encodeURIComponent(genre.trim());
  const endpoint = `/genre/${cleanGenre}/${page}`;
  const data = await fetchJson<any>(endpoint);
  return wrapMangaList(
    data?.komikList || data?.data,
    data?.hasNextPage,
    data?.currentPage ?? page
  );
}

/**
 * Fetch recommended manga
 * Endpoint: /recomen
 */
export async function getRecommendations(): Promise<MangaListResult> {
  const data = await fetchJson<any>('/recomen');
  return wrapMangaList(data?.komikList || data?.data, false, 1);
}

/**
 * Search manga by keyword
 * Endpoint: /search/:query
 */
export async function search(query: string): Promise<MangaListResult> {
  try {
    const cleanQuery = encodeURIComponent(query.trim());
    const data = await fetchJson<any>(`/search/${cleanQuery}`);
    return wrapMangaList(
      data?.komikList || data?.data,
      data?.hasNextPage,
      data?.currentPage ?? 1
    );
  } catch (err) {
    console.warn('Manga search warning:', err);
    return wrapMangaList([], false, 1);
  }
}

/**
 * Fetch manga detail by slug
 * Endpoint: /detail/:slug
 */
export async function getDetail(slug: string): Promise<MangaDetail> {
  const cleanSlug = encodeURIComponent(slug.trim());
  const data = await fetchJson<any>(`/detail/${cleanSlug}`);
  const detail = data?.detail || data?.data || data;

  if (!detail || typeof detail !== 'object') {
    throw new ApiError(`Invalid detail response for slug ${slug}`, `/detail/${slug}`);
  }

  const genres: GenreItem[] = Array.isArray(detail?.genres)
    ? detail.genres.map((g: any) => ({
        title: String(g?.title || g?.name || '').trim(),
        slug: String(g?.slug || '').trim(),
      }))
    : [];

  const chapters = Array.isArray(detail?.chapters)
    ? detail.chapters.map((ch: any) => {
        const chSlug = String(ch?.slug || ch?.endpoint || '').trim();
        return {
          title: formatChapterTitle(chSlug, ch?.title),
          slug: chSlug,
          date: String(ch?.date || '').trim(),
          endpoint: ch?.endpoint ? String(ch.endpoint).trim() : undefined,
        };
      })
    : [];

  return {
    title: String(detail?.title || slug.replace(/-/g, ' ')).trim(),
    cover: String(detail?.cover || detail?.thumbnail || '').trim(),
    rating: detail?.rating ? String(detail.rating).trim() : undefined,
    otherTitle: detail?.otherTitle ? String(detail.otherTitle).trim() : undefined,
    status: detail?.status ? String(detail.status).trim() : undefined,
    type: detail?.type ? String(detail.type).trim() : undefined,
    author: detail?.author ? String(detail.author).trim() : undefined,
    artist: detail?.artist ? String(detail.artist).trim() : undefined,
    release: detail?.release ? String(detail.release).trim() : undefined,
    series: detail?.series ? String(detail.series).trim() : undefined,
    reader: detail?.reader ? String(detail.reader).trim() : undefined,
    synopsis: String(detail?.synopsis || 'No synopsis available.').trim(),
    genres,
    chapters,
  };
}

/**
 * Fetch chapter data and images by slug
 * Endpoint: /chapter/:slug
 */
export async function getChapter(slug: string): Promise<ChapterData> {
  const cleanSlug = encodeURIComponent(slug.trim());
  const data = await fetchJson<any>(`/chapter/${cleanSlug}`);
  const ch = data?.data || data;

  if (!ch) {
    throw new ApiError(`Invalid chapter response for slug ${slug}`, `/chapter/${slug}`);
  }

  const rawImages = ch?.images || data?.images || [];
  const images: string[] = Array.isArray(rawImages)
    ? rawImages.filter(Boolean).map(String)
    : [];

  const nav = ch?.navigation || data?.navigation || {};

  return {
    title: String(ch?.title || data?.title || formatChapterTitle(slug)).trim(),
    images,
    navigation: {
      next: nav?.next ? String(nav.next).trim() : null,
      prev: nav?.prev ? String(nav.prev).trim() : null,
    },
  };
}

/**
 * Fetch colored comics (Komik Berwarna) (paginated)
 * Endpoint: /komikberwarna/:page
 */
export async function getColored(page = 1): Promise<MangaListResult> {
  const data = await fetchJson<any>(`/komikberwarna/${page}`);
  return wrapMangaList(
    data?.komikList || data?.data,
    data?.hasNextPage,
    data?.currentPage ?? page
  );
}

