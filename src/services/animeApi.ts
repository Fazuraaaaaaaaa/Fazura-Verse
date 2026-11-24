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
  provider: 'samehadaku' | 'otakudesu' | 'nimegami' | 'kusonime',
  serverId: string
): Promise<string> {
  // Handle direct URLs or Nimegami synthetic server
  if (serverId.startsWith('nimegami::')) {
    const rawUrl = serverId.replace('nimegami::', '').trim();
    if (
      rawUrl.endsWith('.mp4') ||
      rawUrl.includes('.mp4?') ||
      rawUrl.includes('stream-stor') ||
      rawUrl.includes('berkasdrive.com/v/')
    ) {
      return rawUrl;
    }
    try {
      const res = await fetch(`/api/resolve-nimegami?url=${encodeURIComponent(rawUrl)}`);
      if (res.ok) {
        const json = await res.json();
        if (
          json.success &&
          json.streamUrl &&
          !json.streamUrl.includes('nimegami.id') &&
          !json.streamUrl.includes('nimegami.com')
        ) {
          return json.streamUrl;
        }
      }
    } catch (e) {
      console.warn('Nimegami resolver proxy warning:', e);
    }
    throw new Error(
      'Server Nimegami tidak dapat disematkan langsung (SAMEORIGIN / Offline). Silakan coba server lain atau gunakan unduhan.'
    );
  }
  if (serverId.startsWith('http://') || serverId.startsWith('https://')) {
    const trimmed = serverId.trim();
    if (trimmed.includes('nimegami.id') || trimmed.includes('nimegami.com')) {
      if (
        trimmed.endsWith('.mp4') ||
        trimmed.includes('.mp4?') ||
        trimmed.includes('stream-stor') ||
        trimmed.includes('berkasdrive.com/v/')
      ) {
        return trimmed;
      }
      try {
        const res = await fetch(`/api/resolve-nimegami?url=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const json = await res.json();
          if (
            json.success &&
            json.streamUrl &&
            !json.streamUrl.includes('nimegami.id') &&
            !json.streamUrl.includes('nimegami.com')
          ) {
            return json.streamUrl;
          }
        }
      } catch (e) {
        console.warn('Nimegami direct resolver proxy warning:', e);
      }
      throw new Error(
        'Server Nimegami tidak dapat disematkan langsung (SAMEORIGIN / Offline). Silakan coba server lain.'
      );
    }
    return trimmed;
  }

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

  if (!url || (json?.message && json.message.toLowerCase().includes('error'))) {
    throw new Error(json?.message || 'Server URL tidak ditemukan dalam respon API.');
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

  // Server whitelist: ONLY Mega, FileDon, and VidHide
  const isAllowedServer = (title: string): boolean => {
    const clean = (title || '').toLowerCase().trim();
    return clean.includes('vidhide') || clean.includes('mega') || clean.includes('filedon');
  };

  const formatServerTitle = (title: string) => {
    const clean = (title || '').trim().toLowerCase();
    if (clean.includes('vidhide')) return 'VidHide';
    if (clean.includes('filedon')) return 'FileDon';
    if (clean.includes('mega')) return 'Mega';
    return title.trim();
  };

  const rawQualities = data?.server?.qualities || [];
  const servers: { quality: string; serverList: { title: string; serverId: string; href?: string }[] }[] = [];

  // Extract 1080p Mega link from downloadUrl qualities if present
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

    // Filter serverList to ONLY VidHide, FileDon, and Mega
    const serverList = (q.serverList || [])
      .filter((s: any) => isAllowedServer(s.title))
      .map((s: any) => ({
        title: formatServerTitle(s.title),
        serverId: s.serverId,
        href: s.href,
      }));

    // Prioritize VidHide first, then FileDon, then Mega
    serverList.sort((a: any, b: any) => {
      const aTitle = (a.title || '').toLowerCase();
      const bTitle = (b.title || '').toLowerCase();
      const getPriority = (t: string) => {
        if (t.includes('vidhide')) return 1;
        if (t.includes('filedon')) return 2;
        if (t.includes('mega')) return 3;
        return 4;
      };
      return getPriority(aTitle) - getPriority(bTitle);
    });

    if (serverList.length > 0) {
      servers.push({
        quality: displayQuality,
        serverList,
      });
    }
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
    .replace(/\s*\[?\bBatch\b\]?.*$/gi, '')
    .replace(/\s+(Episode|Eps|Ep\.?)\s+\d+.*$/i, '')
    .replace(/\s+Subtitle\s+Indonesia.*$/i, '')
    .replace(/\s+Sub\s+Indo.*$/i, '')
    .replace(/\s*\[\s*END\s*\]/gi, '')
    .replace(/\s*\[\s*BD\s*\]/gi, '')
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

  // Server whitelist: VidHide, Mega, FileDon, PLUS stream alternatives for retro anime (Kraken, Pixel, Blogger, Premium)
  const isAllowedServer = (title: string): boolean => {
    const clean = (title || '').toLowerCase().trim();
    return (
      clean.includes('vidhide') ||
      clean.includes('mega') ||
      clean.includes('filedon') ||
      clean.includes('kraken') ||
      clean.includes('pixel') ||
      clean.includes('blogspot') ||
      clean.includes('blogger') ||
      clean.includes('premium') ||
      clean.includes('wibufile')
    );
  };

  const formatServerTitle = (title: string) => {
    const clean = (title || '').trim().toLowerCase();
    if (clean.includes('vidhide')) return 'VidHide';
    if (clean.includes('filedon')) return 'FileDon';
    if (clean.includes('mega')) return 'Mega';
    if (clean.includes('kraken')) return 'KrakenFiles (Stream)';
    if (clean.includes('pixel')) return 'PixelDrain (Stream)';
    if (clean.includes('blogspot') || clean.includes('blogger')) return 'Blogger (Google Stream)';
    if (clean.includes('premium') || clean.includes('wibufile')) return 'FastStream HD';
    return title.trim();
  };

  const rawServers = data?.server?.qualities || [];
  const servers: { quality: string; serverList: { title: string; serverId: string; href?: string }[] }[] = [];

  // Sort raw qualities descending
  const sortedQualities = [...rawServers].sort((a: any, b: any) => {
    const numA = parseInt(a.title) || 0;
    const numB = parseInt(b.title) || 0;
    return numB - numA;
  });

  for (const q of sortedQualities) {
    const allowed = (q.serverList || []).filter((s: any) => isAllowedServer(s.title));
    if (allowed.length > 0) {
      const qTitle = (q.title || '').trim();
      let displayQuality = qTitle;
      if (qTitle.includes('1080')) displayQuality = '1080p (Full HD)';
      else if (qTitle.includes('720')) displayQuality = '720p (HD)';
      else if (qTitle.includes('480')) displayQuality = '480p (SD)';
      else if (qTitle.includes('360')) displayQuality = '360p (Hemat Data)';
      else if (qTitle.toLowerCase().includes('unknown')) displayQuality = 'Multi-Server HD';

      const serverList = allowed.map((s: any) => ({
        title: formatServerTitle(s.title),
        serverId: s.serverId,
        href: s.href,
      }));

      // Sort: VidHide first, then FileDon, then Mega, then direct streams
      serverList.sort((a: any, b: any) => {
        const aTitle = (a.title || '').toLowerCase();
        const bTitle = (b.title || '').toLowerCase();
        const getPriority = (t: string) => {
          if (t.includes('vidhide')) return 1;
          if (t.includes('filedon')) return 2;
          if (t.includes('mega')) return 3;
          if (t.includes('faststream') || t.includes('premium')) return 4;
          if (t.includes('blogger') || t.includes('blogspot')) return 5;
          if (t.includes('kraken')) return 6;
          if (t.includes('pixel')) return 7;
          return 8;
        };
        return getPriority(aTitle) - getPriority(bTitle);
      });

      servers.push({
        quality: displayQuality,
        serverList,
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

/* ==================== NIMEGAMI (RETRO & CLASSIC) ==================== */

export async function searchNimegami(query: string): Promise<AnimeItem[]> {
  try {
    const cleanQ = encodeURIComponent(query.trim());
    const [p1Res, p2Res, p3Res] = await Promise.allSettled([
      fetchJson(`${ANIME_BASE_URL}/nimegami/search/${cleanQ}?page=1`),
      fetchJson(`${ANIME_BASE_URL}/nimegami/search/${cleanQ}?page=2`),
      fetchJson(`${ANIME_BASE_URL}/nimegami/search/${cleanQ}?page=3`),
    ]);

    const raw1 = p1Res.status === 'fulfilled' ? (p1Res.value as any)?.anime_list || [] : [];
    const raw2 = p2Res.status === 'fulfilled' ? (p2Res.value as any)?.anime_list || [] : [];
    const raw3 = p3Res.status === 'fulfilled' ? (p3Res.value as any)?.anime_list || [] : [];
    const combined = [
      ...(Array.isArray(raw1) ? raw1 : []),
      ...(Array.isArray(raw2) ? raw2 : []),
      ...(Array.isArray(raw3) ? raw3 : []),
    ];

    const seenSlugs = new Set<string>();
    const list: AnimeItem[] = [];

    for (const item of combined) {
      if (!item.slug || item.slug.startsWith('#') || !item.title || item.title.startsWith('#')) continue;
      if (seenSlugs.has(item.slug)) continue;
      seenSlugs.add(item.slug);

      list.push({
        id: item.slug,
        title: cleanAnimeTitle(item.title || item.slug),
        poster: item.poster || '',
        status: item.status || 'Completed',
        type: item.type || 'Retro Anime',
        episodes: item.episode || undefined,
        provider: 'nimegami' as const,
      });
    }

    return list;
  } catch (err) {
    console.warn('Nimegami search warning:', err);
    return [];
  }
}

export async function getNimegamiHome(page = 1): Promise<{
  animeList: AnimeItem[];
  pagination: AnimePagination;
}> {
  const json: any = await fetchJson(`${ANIME_BASE_URL}/nimegami/home?page=${page}`);
  const rawList = json?.anime_list || [];

  const list: AnimeItem[] = (Array.isArray(rawList) ? rawList : [])
    .filter((item: any) => item.slug && !item.slug.startsWith('#') && item.title && !item.title.startsWith('#'))
    .map((item: any) => ({
      id: item.slug,
      title: cleanAnimeTitle(item.title || item.slug),
      poster: item.poster || '',
      status: item.status || 'Completed',
      type: item.type || 'Retro Series',
      episodes: item.episode || undefined,
      provider: 'nimegami' as const,
    }));

  const pagination: AnimePagination = {
    currentPage: page,
    totalPages: 50,
    hasPrevPage: page > 1,
    hasNextPage: Boolean(json?.pagination?.hasNext ?? true),
    prevPage: page > 1 ? page - 1 : null,
    nextPage: json?.pagination?.hasNext ? page + 1 : (list.length > 0 ? page + 1 : null),
  };

  return { animeList: list, pagination };
}

export async function getNimegamiDetail(slug: string): Promise<AnimeDetail> {
  const json: any = await fetchJson(`${ANIME_BASE_URL}/nimegami/detail/${encodeURIComponent(slug)}`);
  const data = json || {};
  const d = data.detail || {};
  const info = d.info || {};

  // Parse genres
  let genres: { title: string; id: string }[] = [];
  if (info.genre) {
    genres = info.genre
      .split(',')
      .map((g: string) => g.trim())
      .filter(Boolean)
      .map((g: string) => ({
        title: g,
        id: g.toLowerCase().replace(/\s+/g, '-'),
      }));
  }

  // Parse episodes from streams_by_episode
  const rawEps = Object.keys(data.streams_by_episode || {});
  const getEpNum = (k: string) => {
    const m = k.match(/(\d+)/);
    return m ? parseInt(m[1], 10) : 99999;
  };

  let episodeKeys = rawEps
    .filter((k) => !k.toLowerCase().includes('batch'))
    .sort((a, b) => getEpNum(a) - getEpNum(b));

  // FALLBACK: If streams_by_episode has no individual episodes (e.g. Inuyasha with only 'Batch Streams'),
  // parse episode list from download_groups keys!
  if (episodeKeys.length === 0 && data.download_groups) {
    const dlKeys = Object.keys(data.download_groups);
    episodeKeys = dlKeys
      .filter((k) => !k.toLowerCase().includes('batch') && /episode\s*\d+/i.test(k))
      .sort((a, b) => getEpNum(a) - getEpNum(b))
      .map((k) => {
        const m = k.match(/Episode\s*(\d+)/i);
        return m ? `Episode ${m[1]}` : k;
      });
  }

  const episodeList = episodeKeys.map((key) => ({
    title: key,
    episodeId: `${slug}__${encodeURIComponent(key)}`,
  }));

  return {
    id: slug,
    title: d.title || slug,
    poster: d.poster || '',
    score: info.skor || info.score || '8.2',
    japanese: info.judul_asli || info.japanese,
    type: info.format || info.type || 'TV Series',
    status: info.status || 'Finished Airing',
    episodes: info.total_episode || episodeList.length || 'Full',
    synopsis: d.synopsis || 'Tidak ada sinopsis.',
    genres,
    episodeList,
    provider: 'nimegami',
  };
}

export async function getNimegamiEpisode(episodeId: string): Promise<AnimeEpisodeData> {
  const [slug, epKeyRaw] = episodeId.split('__');
  const epKey = decodeURIComponent(epKeyRaw || 'Episode 1');

  const json: any = await fetchJson(`${ANIME_BASE_URL}/nimegami/detail/${encodeURIComponent(slug)}`);
  const data = json || {};
  const d = data.detail || {};
  const streamsMap = data.streams_by_episode || {};
  const dlGroups = data.download_groups || {};

  // Find stream items matching epKey - strictly ignore batch streams
  let streams = streamsMap[epKey] || [];
  if (!streams || streams.length === 0) {
    const keys = Object.keys(streamsMap).filter((k) => !k.toLowerCase().includes('batch'));
    const matchedKey = keys.find((k) => k.toLowerCase() === epKey.toLowerCase());
    streams = matchedKey ? streamsMap[matchedKey] || [] : [];
  }

  // Build servers list grouped by quality
  const serversByQuality = new Map<string, { title: string; serverId: string; href?: string }[]>();

  for (const s of streams) {
    const quality = s.resolution || 'Default';
    if (!serversByQuality.has(quality)) {
      serversByQuality.set(quality, []);
    }
    const sName = s.name && !s.name.includes('$undefined') ? s.name : 'Server Video';
    serversByQuality.get(quality)!.push({
      title: `${sName} (${quality})`,
      serverId: `nimegami::${s.url}`,
      href: s.url,
    });
  }

  // Parse episode download items strictly for downloads, NOT for video player servers
  const epDlKey = Object.keys(dlGroups).find((k) => k.toLowerCase().includes(epKey.toLowerCase()));
  const epDlItems = epDlKey ? dlGroups[epDlKey] : [];

  const servers = Array.from(serversByQuality.entries()).map(([quality, serverList]) => ({
    quality,
    serverList,
  }));

  // Build episode navigation
  const getEpNum = (k: string) => {
    const m = k.match(/(\d+)/);
    return m ? parseInt(m[1], 10) : 99999;
  };
  let allEpKeys = Object.keys(streamsMap)
    .filter((k) => !k.toLowerCase().includes('batch'))
    .sort((a, b) => getEpNum(a) - getEpNum(b));

  if (allEpKeys.length === 0 && data.download_groups) {
    allEpKeys = Object.keys(data.download_groups)
      .filter((k) => !k.toLowerCase().includes('batch') && /episode\s*\d+/i.test(k))
      .sort((a, b) => getEpNum(a) - getEpNum(b))
      .map((k) => {
        const m = k.match(/Episode\s*(\d+)/i);
        return m ? `Episode ${m[1]}` : k;
      });
  }

  const currentIdx = allEpKeys.indexOf(epKey);
  const prevEpKey = currentIdx > 0 ? allEpKeys[currentIdx - 1] : null;
  const nextEpKey = currentIdx >= 0 && currentIdx < allEpKeys.length - 1 ? allEpKeys[currentIdx + 1] : null;

  const firstUrl = streams[0]?.url || '';
  const defaultStream = firstUrl ? `nimegami::${firstUrl}` : undefined;

  const downloads = Array.isArray(epDlItems) && epDlItems.length > 0 ? [
    {
      quality: epKey,
      urls: epDlItems.map((item: any) => ({
        title: `${item.name || 'Download'} (${item.resolution || ''})`,
        url: item.url,
      })),
    }
  ] : [];

  return {
    title: `${d.title || slug} - ${epKey}`,
    animeId: slug,
    streamUrl: defaultStream,
    hasPrev: Boolean(prevEpKey),
    hasNext: Boolean(nextEpKey),
    prevEpisodeId: prevEpKey ? `${slug}__${encodeURIComponent(prevEpKey)}` : null,
    nextEpisodeId: nextEpKey ? `${slug}__${encodeURIComponent(nextEpKey)}` : null,
    servers,
    downloads,
  };
}

/* ==================== KUSONIME (FULL BATCH DOWNLOADS) ==================== */

export async function searchKusonime(query: string): Promise<AnimeItem[]> {
  try {
    const cleanQ = encodeURIComponent(query.trim());
    const [p1Res, p2Res, p3Res] = await Promise.allSettled([
      fetchJson(`${ANIME_BASE_URL}/kusonime/search/${cleanQ}?page=1`),
      fetchJson(`${ANIME_BASE_URL}/kusonime/search/${cleanQ}?page=2`),
      fetchJson(`${ANIME_BASE_URL}/kusonime/search/${cleanQ}?page=3`),
    ]);

    const raw1 = p1Res.status === 'fulfilled' ? (p1Res.value as any)?.anime_list || [] : [];
    const raw2 = p2Res.status === 'fulfilled' ? (p2Res.value as any)?.anime_list || [] : [];
    const raw3 = p3Res.status === 'fulfilled' ? (p3Res.value as any)?.anime_list || [] : [];
    const combined = [
      ...(Array.isArray(raw1) ? raw1 : []),
      ...(Array.isArray(raw2) ? raw2 : []),
      ...(Array.isArray(raw3) ? raw3 : []),
    ];

    const qWords = query.toLowerCase().split(/\s+/).filter(Boolean);
    const seenSlugs = new Set<string>();
    const list: AnimeItem[] = [];

    for (const item of combined) {
      if (!item.slug || seenSlugs.has(item.slug)) continue;
      const t = (item.title || item.slug || '').toLowerCase();
      // Ensure the title or slug actually matches query terms if multiple pages returned
      const matches = qWords.some((w) => t.includes(w));
      if (!matches && combined.length > 8) continue;

      seenSlugs.add(item.slug);
      list.push({
        id: item.slug,
        title: cleanAnimeTitle(item.title || item.slug),
        poster: item.poster || '',
        status: 'Completed',
        type: 'Series',
        genres: Array.isArray(item.genres) ? item.genres.map((g: any) => g.name).join(', ') : undefined,
        provider: 'kusonime' as const,
      });
    }

    return list;
  } catch (err) {
    console.warn('Kusonime search warning:', err);
    return [];
  }
}

export async function getKusonimeLatest(page = 1): Promise<{
  animeList: AnimeItem[];
  pagination: AnimePagination;
}> {
  const json: any = await fetchJson(`${ANIME_BASE_URL}/kusonime/latest?page=${page}`);
  const rawList = json?.anime_list || [];

  const list: AnimeItem[] = (Array.isArray(rawList) ? rawList : []).map((item: any) => ({
    id: item.slug,
    title: cleanAnimeTitle(item.title || item.slug),
    poster: item.poster || '',
    status: 'Completed',
    type: 'Series',
    genres: Array.isArray(item.genres) ? item.genres.map((g: any) => g.name).join(', ') : undefined,
    releasedOn: item.released,
    provider: 'kusonime' as const,
  }));

  const pagination: AnimePagination = {
    currentPage: page,
    totalPages: 35,
    hasPrevPage: page > 1,
    hasNextPage: true,
    prevPage: page > 1 ? page - 1 : null,
    nextPage: page + 1,
  };

  return { animeList: list, pagination };
}

export async function getKusonimeDetail(slug: string): Promise<AnimeDetail> {
  const json: any = await fetchJson(`${ANIME_BASE_URL}/kusonime/detail/${encodeURIComponent(slug)}`);
  const d = json?.detail || {};
  const info = d.info || {};

  const genres = (d.genres || []).map((g: any) => ({
    title: g.name,
    id: g.slug || g.name.toLowerCase().replace(/\s+/g, '-'),
  }));

  const batchDownloads: { resolution: string; links: { host: string; url: string }[] }[] = [];
  const rawDownloads = d.download_links || [];

  for (const dl of rawDownloads) {
    if (dl.links && Array.isArray(dl.links) && dl.links.length > 0) {
      batchDownloads.push({
        resolution: dl.resolution || 'Batch Download',
        links: dl.links.map((lnk: any) => ({
          host: lnk.host || 'Direct',
          url: lnk.url,
        })),
      });
    }
  }

  return {
    id: slug,
    title: cleanAnimeTitle(d.title || slug),
    poster: d.poster || '',
    score: info.score || '8.0',
    japanese: info.japanese,
    type: info.type || 'Series',
    status: info.status || 'Completed',
    episodes: info.total_episode || 'Full Season',
    duration: info.duration,
    synopsis: d.synopsis || 'Tidak ada sinopsis.',
    genres,
    episodeList: [], // Batch anime has direct batch downloads
    batchDownloads,
    provider: 'kusonime',
  };
}

/* ==================== MULTI-PROVIDER SEARCH ==================== */

/**
 * Clean & normalize anime title for deduplication comparison.
 * Keeps season numbers, movie titles, and distinctive sub-series (Z, GT, Kai, etc.)
 * while removing provider fluff like 'sub indo', 'batch', and 'bd'.
 */
export function normalizeTitleForDeduplication(title: string): string {
  if (!title) return '';
  return title
    .toLowerCase()
    .replace(/\s+sub(title)?\s*(indonesia|indo).*$/gi, '')
    .replace(/\s+batch.*$/gi, '')
    .replace(/\s+bd\b/gi, '')
    .replace(/\s+(episode|eps)\s+\d+.*$/gi, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

export async function searchAllAnime(query: string): Promise<{
  otakudesu: AnimeItem[];
  samehadaku: AnimeItem[];
  nimegami: AnimeItem[];
  kusonime: AnimeItem[];
  all: AnimeItem[];
}> {
  if (!query || !query.trim()) {
    return { otakudesu: [], samehadaku: [], nimegami: [], kusonime: [], all: [] };
  }

  const [otkRes, sameRes, nimeRes, kusoRes] = await Promise.allSettled([
    searchOtakudesu(query),
    searchSamehadaku(query),
    searchNimegami(query),
    searchKusonime(query),
  ]);

  const otakudesu = otkRes.status === 'fulfilled' ? otkRes.value : [];
  const samehadaku = sameRes.status === 'fulfilled' ? sameRes.value : [];
  const nimegami = nimeRes.status === 'fulfilled' ? nimeRes.value : [];
  const kusonime = kusoRes.status === 'fulfilled' ? kusoRes.value : [];

  // Master Rule: Otakudesu is the primary master database.
  // 1. Add all Otakudesu items first and track their normalized titles.
  // 2. Add Samehadaku items (high-quality streaming anime with VidHide, Mega, FileDon, Blogspot).
  // 3. Add Nimegami items (classic/retro anime with direct streaming servers).
  // 4. Do NOT add Kusonime batch archives to 'all': Kusonime has 0 playable video servers.
  //    "kalo gaada server untuk memutar vid animenya jangan dikasi poster"
  const all: AnimeItem[] = [];
  const seenKeys = new Set<string>();

  for (const item of otakudesu) {
    const key = normalizeTitleForDeduplication(item.title);
    if (key) seenKeys.add(key);
    all.push(item);
  }

  // Prioritize Samehadaku before Nimegami for working streams and deduplication
  for (const item of [...samehadaku, ...nimegami]) {
    const key = normalizeTitleForDeduplication(item.title);
    if (key && seenKeys.has(key)) {
      // Already exists in Otakudesu master or earlier provider -> do not add duplicate
      continue;
    }
    if (key) {
      seenKeys.add(key);
    }
    all.push(item);
  }

  return {
    otakudesu,
    samehadaku,
    nimegami,
    kusonime,
    all,
  };
}
