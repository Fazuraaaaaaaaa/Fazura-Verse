import type {
  AnimeItem,
  AnimeDetail,
  AnimeEpisodeData,
  AnimePagination,
  AnimeScheduleDay,
  AnimeGenre,
} from '../types/media';

const ANIME_BASE_URL = 'https://www.sankavollerei.web.id/anime';

async function fetchJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }

    return await res.json();
  } catch (err: any) {
    clearTimeout(timeoutId);
    throw new Error(`Anime API Error: ${err.message || 'Network failed'}`);
  }
}

/**
 * Fetch real embed stream URL for a specific server and quality
 */
export async function getAnimeServerUrl(
  provider: 'samehadaku' | 'otakudesu',
  serverId: string
): Promise<string> {
  // Handle synthetic Mega 1080p server
  if (serverId.startsWith('mega-1080p::')) {
    const rawUrl = serverId.replace('mega-1080p::', '').trim();
    try {
      const res = await fetch(`/api/resolve-mega?url=${encodeURIComponent(rawUrl)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.embedUrl) {
          return json.embedUrl;
        }
      }
    } catch (e) {
      console.warn('Mega 1080p resolver local proxy warning:', e);
    }
    // Direct fallback if it already contains mega.nz
    if (rawUrl.includes('mega.nz/embed/')) return rawUrl;
    if (rawUrl.includes('mega.nz/file/')) return rawUrl.replace('mega.nz/file/', 'mega.nz/embed/');
    return rawUrl;
  }

  const cleanId = encodeURIComponent(serverId.trim());
  const endpoint =
    provider === 'samehadaku'
      ? `${ANIME_BASE_URL}/samehadaku/server/${cleanId}`
      : `${ANIME_BASE_URL}/server/${cleanId}`;

  const json: any = await fetchJson(endpoint);
  const url = json?.data?.url || json?.url || '';

  if (!url) {
    throw new Error('Server URL tidak ditemukan dalam respon API.');
  }

  return url;
}

/* ==================== OTAKUDESU ==================== */

export async function getOtakudesuHome(): Promise<{
  ongoing: AnimeItem[];
  completed: AnimeItem[];
}> {
  const json: any = await fetchJson(`${ANIME_BASE_URL}/home`);
  const data = json?.data || {};

  const ongoing: AnimeItem[] = (data?.ongoing?.animeList || []).map((item: any) => ({
    id: item.animeId,
    title: item.title,
    poster: item.poster,
    episodes: item.episodes,
    releaseDay: item.releaseDay,
    releasedOn: item.latestReleaseDate,
    provider: 'otakudesu' as const,
  }));

  const completed: AnimeItem[] = (data?.completed?.animeList || []).map((item: any) => ({
    id: item.animeId,
    title: item.title,
    poster: item.poster,
    episodes: item.episodes,
    score: item.score,
    releasedOn: item.lastReleaseDate,
    provider: 'otakudesu' as const,
  }));

  return { ongoing, completed };
}

export async function getOtakudesuDetail(id: string): Promise<AnimeDetail> {
  const json: any = await fetchJson(`${ANIME_BASE_URL}/anime/${encodeURIComponent(id)}`);
  const data = json?.data || {};

  return {
    id,
    title: data.title || id,
    poster: data.poster || '',
    score: data.score,
    japanese: data.japanese,
    type: data.type,
    status: data.status,
    episodes: data.episodes,
    duration: data.duration,
    studios: data.studios,
    synopsis: (data.synopsis?.paragraphs || []).join('\n\n') || 'Tidak ada sinopsis.',
    genres: (data.genreList || []).map((g: any) => ({
      title: g.title,
      id: g.genreId,
    })),
    episodeList: (data.episodeList || []).map((ep: any) => ({
      title: ep.title,
      episodeId: ep.episodeId,
      date: ep.date,
    })),
    provider: 'otakudesu',
  };
}

export async function getOtakudesuEpisode(episodeId: string): Promise<AnimeEpisodeData> {
  const json: any = await fetchJson(`${ANIME_BASE_URL}/episode/${encodeURIComponent(episodeId)}`);
  const data = json?.data || {};

  const isExcludedServer = (title: string): boolean => {
    const clean = (title || '').toLowerCase().replace(/[\s\-_]/g, '');
    return (
      clean.includes('odstream') ||
      clean.includes('ondesu') ||
      clean.includes('odcdn') ||
      clean.includes('ocdcn')
    );
  };

  const formatServerTitle = (title: string) => {
    const clean = (title || '').trim().toLowerCase();
    if (clean === 'blogs') return 'Blogspot (Google Video)';
    if (clean === 'mega') return 'Mega.nz';
    if (clean === 'vidhide') return 'VidHide';
    if (clean === 'filedon') return 'FileDon';
    if (clean === 'odstream') return 'ODStream HD';
    if (clean === 'odcdn') return 'ODCDN';
    if (clean === 'ondesu2hd') return 'OnDesu HD';
    return title.trim();
  };

  const rawQualities = data?.server?.qualities || [];
  const servers: { quality: string; serverList: { title: string; serverId: string; href?: string }[] }[] = [];

  // Extract 1080p Mega link from downloadUrl qualities
  const q1080 = (data?.downloadUrl?.qualities || []).find((q: any) =>
    (q.title || '').toLowerCase().includes('1080')
  );
  const mega1080Url = q1080?.urls?.find((u: any) =>
    (u.title || '').toLowerCase().includes('mega')
  )?.url;

  if (mega1080Url) {
    servers.push({
      quality: '1080p (Full HD)',
      serverList: [
        {
          title: 'Mega 1080p',
          serverId: `mega-1080p::${mega1080Url}`,
          href: mega1080Url,
        },
      ],
    });
  }

  // Extract blogs / Blogspot server from Otakudesu qualities (Blogger video stream is 360p resolution)
  let blogspotServer: { title: string; serverId: string; href?: string } | null = null;
  for (const q of rawQualities) {
    const found = (q.serverList || []).find((s: any) => {
      const t = (s.title || '').toLowerCase().trim();
      return t === 'blogs' || t.includes('blogspot') || t.includes('blogger');
    });
    if (found) {
      blogspotServer = {
        title: 'Blogspot 360p',
        serverId: found.serverId,
        href: found.href,
      };
      break;
    }
  }

  // Sort other qualities descending (720p, 480p, 360p)
  const sortedQualities = [...rawQualities].sort((a: any, b: any) => {
    const numA = parseInt(a.title) || 0;
    const numB = parseInt(b.title) || 0;
    return numB - numA;
  });

  for (const q of sortedQualities) {
    const qTitle = (q.title || '').trim();
    let displayQuality = qTitle;
    if (qTitle.includes('720')) displayQuality = '720p (HD)';
    else if (qTitle.includes('480')) displayQuality = '480p (SD)';
    else if (qTitle.includes('360')) displayQuality = '360p (Hemat Data)';

    // Filter out 'blogs' from 480p or other qualities because Blogspot is 360p,
    // and filter out ODStream, ondesuhd/OnDesu, and OCDCN/ODCDN as requested.
    let serverList = (q.serverList || [])
      .filter((s: any) => {
        const t = (s.title || '').toLowerCase().trim();
        if (t === 'blogs' || t.includes('blogspot') || t.includes('blogger')) {
          return false;
        }
        if (isExcludedServer(s.title)) {
          return false;
        }
        return true;
      })
      .map((s: any) => ({
        title: formatServerTitle(s.title),
        serverId: s.serverId,
        href: s.href,
      }))
      .filter((s: any) => !isExcludedServer(s.title));

    // If this quality is 360p, place Blogspot 360p first!
    if (qTitle.includes('360') && blogspotServer) {
      serverList = [blogspotServer, ...serverList];
    }

    if (serverList.length > 0) {
      servers.push({
        quality: displayQuality,
        serverList,
      });
    }
  }

  // If 360p was not present in raw qualities but blogspotServer exists, append 360p
  const has360 = servers.some((s) => s.quality.includes('360'));
  if (!has360 && blogspotServer) {
    servers.push({
      quality: '360p (Hemat Data)',
      serverList: [blogspotServer],
    });
  }

  const downloads = (data?.downloadUrl?.qualities || []).map((d: any) => ({
    quality: d.title,
    size: d.size,
    urls: (d.urls || []).map((u: any) => ({
      title: u.title,
      url: u.url,
    })),
  }));

  return {
    title: data.title || episodeId,
    animeId: data.animeId,
    streamUrl: data.defaultStreamingUrl,
    hasPrev: Boolean(data.hasPrevEpisode),
    hasNext: Boolean(data.hasNextEpisode),
    prevEpisodeId: data.prevEpisode?.episodeId,
    nextEpisodeId: data.nextEpisode?.episodeId,
    servers,
    downloads,
  };
}

/**
 * Clean up title to display anime series name only (strips episode numbers, batch, and subtitle tags)
 */
export function cleanAnimeTitle(rawTitle: string): string {
  if (!rawTitle) return '';
  return rawTitle
    .replace(/\s+(Episode|Eps|Ep\.?)\s+\d+.*$/i, '')
    .replace(/\s+Batch.*$/i, '')
    .replace(/\s+Subtitle\s+Indonesia.*$/i, '')
    .replace(/\s+Sub\s+Indo.*$/i, '')
    .trim();
}

/**
 * Clean up slug to target the main anime series page instead of individual episode pages
 */
export function cleanAnimeSlug(rawSlug: string): string {
  if (!rawSlug) return '';
  return rawSlug
    .replace(/-(episode|eps|ep)-\d+.*$/i, '')
    .replace(/-batch.*$/i, '')
    .trim();
}

export async function searchOtakudesu(query: string): Promise<AnimeItem[]> {
  try {
    const json: any = await fetchJson(`${ANIME_BASE_URL}/search/${encodeURIComponent(query)}`);
    const list = json?.data?.animeList || json?.data || [];
    if (!Array.isArray(list)) return [];

    const seriesMap = new Map<string, AnimeItem>();

    for (const item of list) {
      const cleanTitle = cleanAnimeTitle(item.title || '');
      const key = cleanTitle.toLowerCase();
      if (!seriesMap.has(key)) {
        seriesMap.set(key, {
          id: item.animeId,
          title: cleanTitle || item.title,
          poster: item.poster,
          score: item.score,
          status: item.status,
          provider: 'otakudesu' as const,
        });
      }
    }

    return Array.from(seriesMap.values());
  } catch (err) {
    // Otakudesu API returns 404 or 500 when no items match
    console.warn('Otakudesu search warning:', err);
    return [];
  }
}

/**
 * Otakudesu: Paginated Ongoing Anime (up to 6 pages)
 */
export async function getOtakudesuOngoing(page = 1): Promise<{
  animeList: AnimeItem[];
  pagination: AnimePagination;
}> {
  const json: any = await fetchJson(`${ANIME_BASE_URL}/ongoing-anime?page=${page}`);
  const list: AnimeItem[] = (json?.data?.animeList || []).map((item: any) => ({
    id: item.animeId,
    title: item.title,
    poster: item.poster,
    episodes: item.episodes,
    releaseDay: item.releaseDay,
    releasedOn: item.latestReleaseDate,
    status: 'Ongoing',
    provider: 'otakudesu' as const,
  }));

  const pagination: AnimePagination = json?.pagination || {
    currentPage: page,
    totalPages: 6,
    hasPrevPage: page > 1,
    hasNextPage: page < 6,
    prevPage: page > 1 ? page - 1 : null,
    nextPage: page < 6 ? page + 1 : null,
  };

  return { animeList: list, pagination };
}

/**
 * Otakudesu: Paginated Completed Anime (up to 67+ pages, ~1,600+ anime titles!)
 */
export async function getOtakudesuCompleted(page = 1): Promise<{
  animeList: AnimeItem[];
  pagination: AnimePagination;
}> {
  const json: any = await fetchJson(`${ANIME_BASE_URL}/complete-anime?page=${page}`);
  const list: AnimeItem[] = (json?.data?.animeList || []).map((item: any) => ({
    id: item.animeId,
    title: item.title,
    poster: item.poster,
    episodes: item.episodes,
    score: item.score,
    releasedOn: item.lastReleaseDate,
    status: 'Completed',
    provider: 'otakudesu' as const,
  }));

  const pagination: AnimePagination = json?.pagination || {
    currentPage: page,
    totalPages: 67,
    hasPrevPage: page > 1,
    hasNextPage: page < 67,
    prevPage: page > 1 ? page - 1 : null,
    nextPage: page < 67 ? page + 1 : null,
  };

  return { animeList: list, pagination };
}

/**
 * Otakudesu: Weekly Release Schedule
 */
export async function getOtakudesuSchedule(): Promise<AnimeScheduleDay[]> {
  const json: any = await fetchJson(`${ANIME_BASE_URL}/schedule`);
  const days = json?.data || [];
  return days.map((d: any) => ({
    day: d.day,
    animeList: (d.anime_list || []).map((item: any) => ({
      id: item.slug,
      title: item.title,
      poster: item.poster,
      provider: 'otakudesu' as const,
    })),
  }));
}

/**
 * Otakudesu: All 36 Genres
 * Endpoint: /genre
 */
export async function getOtakudesuGenres(): Promise<{ title: string; genreId: string; href?: string }[]> {
  try {
    const json: any = await fetchJson(`${ANIME_BASE_URL}/genre`);
    const raw = json?.data?.genreList || [];
    return (Array.isArray(raw) ? raw : []).map((g: any) => ({
      title: g.title,
      genreId: g.genreId,
      href: g.href,
    }));
  } catch (err) {
    console.warn('Otakudesu genres warning:', err);
    return [];
  }
}

/**
 * Otakudesu: Paginated Anime by Genre (up to 48+ pages per genre!)
 * Endpoint: /genre/:genreId?page=:page
 */
export async function getOtakudesuByGenre(
  genreId: string,
  page = 1
): Promise<{
  animeList: AnimeItem[];
  pagination: AnimePagination;
}> {
  const cleanGenre = encodeURIComponent(genreId.trim());
  const json: any = await fetchJson(`${ANIME_BASE_URL}/genre/${cleanGenre}?page=${page}`);
  const list: AnimeItem[] = (json?.data?.animeList || []).map((item: any) => ({
    id: item.animeId,
    title: item.title,
    poster: item.poster,
    score: item.score,
    episodes: item.episodes,
    status: item.season || 'Otakudesu',
    provider: 'otakudesu' as const,
  }));

  const pagination: AnimePagination = json?.pagination || {
    currentPage: page,
    totalPages: 1,
    hasPrevPage: page > 1,
    hasNextPage: false,
    prevPage: page > 1 ? page - 1 : null,
    nextPage: null,
  };

  return { animeList: list, pagination };
}

/* ==================== SAMEHADAKU ==================== */

export async function getSamehadakuHome(): Promise<{
  recent: AnimeItem[];
  top10: AnimeItem[];
}> {
  const json: any = await fetchJson(`${ANIME_BASE_URL}/samehadaku/home`);
  const data = json?.data || {};

  const recent: AnimeItem[] = (data?.recent?.animeList || []).map((item: any) => ({
    id: item.animeId,
    title: item.title,
    poster: item.poster,
    episodes: item.episodes,
    releasedOn: item.releasedOn,
    provider: 'samehadaku' as const,
  }));

  const top10: AnimeItem[] = (data?.top10?.animeList || []).map((item: any) => ({
    id: item.animeId,
    title: item.title,
    poster: item.poster,
    score: item.score,
    rank: item.rank,
    provider: 'samehadaku' as const,
  }));

  return { recent, top10 };
}

export async function getSamehadakuDetail(id: string): Promise<AnimeDetail> {
  const json: any = await fetchJson(`${ANIME_BASE_URL}/samehadaku/anime/${encodeURIComponent(id)}`);
  const data = json?.data || {};

  return {
    id,
    title: data.title || id,
    poster: data.poster || '',
    score: data.score?.value,
    japanese: data.japanese,
    type: data.type,
    status: data.status,
    episodes: data.episodes,
    duration: data.duration,
    studios: data.studios,
    synopsis: (data.synopsis?.paragraphs || []).join('\n\n') || 'Tidak ada sinopsis.',
    genres: (data.genreList || []).map((g: any) => ({
      title: g.title,
      id: g.genreId,
    })),
    episodeList: (data.episodeList || []).map((ep: any) => ({
      title: `Episode ${ep.title}`,
      episodeId: ep.episodeId,
    })),
    provider: 'samehadaku',
  };
}

export async function getSamehadakuEpisode(episodeId: string): Promise<AnimeEpisodeData> {
  const json: any = await fetchJson(
    `${ANIME_BASE_URL}/samehadaku/episode/${encodeURIComponent(episodeId)}`
  );
  const data = json?.data || {};

  // Parse Samehadaku server qualities: ONLY KEEP BLOGSPOT (delete all other servers as requested)
  const rawServers = data?.server?.qualities || [];
  const servers: { quality: string; serverList: { title: string; serverId: string; href?: string }[] }[] = [];

  for (const q of rawServers) {
    const blogspotServers = (q.serverList || []).filter((s: any) =>
      (s.title || '').toLowerCase().includes('blogspot') || (s.title || '').toLowerCase().includes('blogger')
    );
    if (blogspotServers.length > 0) {
      servers.push({
        quality: '360p (Hemat Data)',
        serverList: blogspotServers.map((s: any) => ({
          title: 'Blogspot 360p',
          serverId: s.serverId,
          href: s.href,
        })),
      });
    }
  }

  // Parse Samehadaku download formats (MKV, MP4, x265)
  const rawFormats = data?.downloadUrl?.formats || [];
  const downloads: { quality: string; size?: string; urls: { title: string; url: string }[] }[] = [];

  for (const fmt of rawFormats) {
    const formatName = fmt.title || '';
    for (const q of fmt.qualities || []) {
      downloads.push({
        quality: `${formatName} - ${q.title}`,
        urls: q.urls || [],
      });
    }
  }

  return {
    title: data.title || episodeId,
    animeId: data.animeId,
    streamUrl: data.defaultStreamingUrl,
    hasPrev: Boolean(data.hasPrevEpisode),
    hasNext: Boolean(data.hasNextEpisode),
    prevEpisodeId: data.prevEpisode?.episodeId,
    nextEpisodeId: data.nextEpisode?.episodeId,
    servers,
    downloads,
  };
}

export async function searchSamehadaku(query: string): Promise<AnimeItem[]> {
  try {
    const json: any = await fetchJson(
      `${ANIME_BASE_URL}/samehadaku/search?q=${encodeURIComponent(query)}`
    );
    const rawList = json?.data?.animeList || json?.data || [];
    if (!Array.isArray(rawList)) return [];

    const seriesMap = new Map<string, AnimeItem>();

    for (const item of rawList) {
      const rawTitle = item.title || '';
      const rawId = item.animeId || '';

      const cleanTitle = cleanAnimeTitle(rawTitle);
      const cleanId = cleanAnimeSlug(rawId);

      const key = cleanTitle.toLowerCase();
      if (!seriesMap.has(key)) {
        seriesMap.set(key, {
          id: cleanId || rawId,
          title: cleanTitle || rawTitle,
          poster: item.poster,
          score: item.score,
          status: item.status?.includes('yang lalu') ? 'Series' : item.status,
          type: item.type?.startsWith('Eps') ? 'TV Series' : item.type,
          genres: (item.genreList || []).map((g: any) => g.title).join(', '),
          provider: 'samehadaku' as const,
        });
      }
    }

    return Array.from(seriesMap.values());
  } catch (err) {
    console.warn('Samehadaku search warning:', err);
    return [];
  }
}

/**
 * Samehadaku: Paginated Popular Anime (up to 26+ pages, ~780+ anime)
 */
export async function getSamehadakuPopular(page = 1): Promise<{
  animeList: AnimeItem[];
  pagination: AnimePagination;
}> {
  const json: any = await fetchJson(`${ANIME_BASE_URL}/samehadaku/popular?page=${page}`);
  const list: AnimeItem[] = (json?.data?.animeList || []).map((item: any) => ({
    id: item.animeId,
    title: item.title,
    poster: item.poster,
    score: item.score,
    status: item.status,
    type: item.type,
    genres: (item.genreList || []).map((g: any) => g.title).join(', '),
    provider: 'samehadaku' as const,
  }));

  const pagination: AnimePagination = json?.pagination || {
    currentPage: page,
    totalPages: 26,
    hasPrevPage: page > 1,
    hasNextPage: page < 26,
    prevPage: page > 1 ? page - 1 : null,
    nextPage: page < 26 ? page + 1 : null,
  };

  return { animeList: list, pagination };
}

/**
 * Samehadaku: Paginated Completed Anime (up to 25+ pages, ~750+ anime)
 */
export async function getSamehadakuCompleted(page = 1): Promise<{
  animeList: AnimeItem[];
  pagination: AnimePagination;
}> {
  const json: any = await fetchJson(`${ANIME_BASE_URL}/samehadaku/completed?page=${page}`);
  const list: AnimeItem[] = (json?.data?.animeList || []).map((item: any) => ({
    id: item.animeId,
    title: item.title,
    poster: item.poster,
    score: item.score,
    status: item.status,
    type: item.type,
    genres: (item.genreList || []).map((g: any) => g.title).join(', '),
    provider: 'samehadaku' as const,
  }));

  const pagination: AnimePagination = json?.pagination || {
    currentPage: page,
    totalPages: 25,
    hasPrevPage: page > 1,
    hasNextPage: page < 25,
    prevPage: page > 1 ? page - 1 : null,
    nextPage: page < 25 ? page + 1 : null,
  };

  return { animeList: list, pagination };
}

/**
 * Samehadaku: Paginated Ongoing Anime
 */
export async function getSamehadakuOngoing(page = 1): Promise<{
  animeList: AnimeItem[];
  pagination: AnimePagination;
}> {
  const json: any = await fetchJson(`${ANIME_BASE_URL}/samehadaku/ongoing?page=${page}`);
  const list: AnimeItem[] = (json?.data?.animeList || []).map((item: any) => ({
    id: item.animeId,
    title: item.title,
    poster: item.poster,
    score: item.score,
    status: item.status,
    type: item.type,
    genres: (item.genreList || []).map((g: any) => g.title).join(', '),
    provider: 'samehadaku' as const,
  }));

  const pagination: AnimePagination = json?.pagination || {
    currentPage: page,
    totalPages: 2,
    hasPrevPage: page > 1,
    hasNextPage: page < 2,
    prevPage: page > 1 ? page - 1 : null,
    nextPage: page < 2 ? page + 1 : null,
  };

  return { animeList: list, pagination };
}

/**
 * Samehadaku: Weekly Release Schedule
 */
export async function getSamehadakuSchedule(): Promise<AnimeScheduleDay[]> {
  const json: any = await fetchJson(`${ANIME_BASE_URL}/samehadaku/schedule`);
  const days = json?.data?.days || [];
  return days.map((d: any) => ({
    day: d.day,
    animeList: (d.animeList || []).map((item: any) => ({
      id: item.animeId,
      title: item.title,
      poster: item.poster,
      score: item.score,
      type: item.type,
      estimation: item.estimation,
      genres: item.genres,
      provider: 'samehadaku' as const,
    })),
  }));
}

/**
 * Samehadaku: 84 Genres
 */
export async function getSamehadakuGenres(): Promise<AnimeGenre[]> {
  const json: any = await fetchJson(`${ANIME_BASE_URL}/samehadaku/genres`);
  return json?.data?.genreList || [];
}

/**
 * Samehadaku: Anime by Genre (paginated)
 */
export async function getSamehadakuByGenre(
  genreId: string,
  page = 1
): Promise<{
  animeList: AnimeItem[];
  pagination: AnimePagination;
}> {
  const json: any = await fetchJson(
    `${ANIME_BASE_URL}/samehadaku/genres/${encodeURIComponent(genreId)}?page=${page}`
  );
  const list: AnimeItem[] = (json?.data?.animeList || []).map((item: any) => ({
    id: item.animeId,
    title: item.title,
    poster: item.poster,
    score: item.score,
    status: item.status,
    type: item.type,
    genres: (item.genreList || []).map((g: any) => g.title).join(', '),
    provider: 'samehadaku' as const,
  }));

  const pagination: AnimePagination = json?.pagination || {
    currentPage: page,
    totalPages: 10,
    hasPrevPage: page > 1,
    hasNextPage: true,
    prevPage: page > 1 ? page - 1 : null,
    nextPage: page + 1,
  };

  return { animeList: list, pagination };
}
