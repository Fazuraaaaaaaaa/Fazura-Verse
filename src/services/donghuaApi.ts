import type {
  DonghuaItem,
  DonghuaDetail,
  DonghuaEpisodeData,
  DonghuaScheduleDay,
  DonghuaGenre,
} from '../types/media';

const DONGHUA_BASE_URL = 'https://www.sankavollerei.web.id/anime/donghua';

/**
 * Proxy anichin.moe poster images to bypass Cloudflare 403 hotlink protection
 */
export function proxyDonghuaPoster(rawUrl?: string): string {
  if (!rawUrl) return '';
  if (rawUrl.startsWith('/api/image-proxy')) return rawUrl;
  if (rawUrl.includes('anichin.moe') || rawUrl.includes('wp-content')) {
    return `/api/image-proxy?url=${encodeURIComponent(rawUrl)}`;
  }
  return rawUrl;
}

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
      throw new Error(`HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
    clearTimeout(timeoutId);
    throw new Error(`Donghua API Error: ${err.message || 'Network failed'}`);
  }
}

export async function getDonghuaHome(): Promise<{
  latestRelease: DonghuaItem[];
  completed: DonghuaItem[];
}> {
  const json: any = await fetchJson(`${DONGHUA_BASE_URL}/home`);

  const latestRelease: DonghuaItem[] = (json?.latest_release || []).map((item: any) => ({
    slug: item.slug,
    title: item.title,
    poster: proxyDonghuaPoster(item.poster),
    status: item.status,
    type: item.type,
    currentEpisode: item.current_episode,
  }));

  const completed: DonghuaItem[] = (json?.completed || []).map((item: any) => ({
    slug: item.slug,
    title: item.title,
    poster: proxyDonghuaPoster(item.poster),
    status: item.status,
    type: item.type,
  }));

  return { latestRelease, completed };
}

export async function getDonghuaDetail(slug: string): Promise<DonghuaDetail> {
  let json: any = null;

  // 1. Try exact slug with /detail
  try {
    json = await fetchJson(`${DONGHUA_BASE_URL}/detail/${encodeURIComponent(slug)}`);
  } catch {
    // 2. Try cleaned slug (without episode parts)
    const cleanSlug = slug.replace(/-episode-\d+.*$/i, '').replace(/episode-\d+.*$/i, '').trim();
    if (cleanSlug && cleanSlug !== slug) {
      try {
        json = await fetchJson(`${DONGHUA_BASE_URL}/detail/${encodeURIComponent(cleanSlug)}`);
      } catch {
        // Continue to fallback 3
      }
    }

    // 3. Fallback: try fetching /episode/:slug which contains donghua_details & episodes_list!
    if (!json) {
      try {
        const epJson: any = await fetchJson(`${DONGHUA_BASE_URL}/episode/${encodeURIComponent(slug)}`);
        if (epJson) {
          const dDetails = epJson.donghua_details || {};
          const epList = (epJson.episodes_list || []).map((ep: any) => ({
            episode: ep.episode,
            slug: ep.slug,
          }));

          return {
            title: dDetails.title || epJson.episode || slug,
            slug: dDetails.slug || slug,
            poster: proxyDonghuaPoster(dDetails.poster || ''),
            status: 'Ongoing',
            type: dDetails.type || 'Donghua',
            genres: [],
            synopsis: `Serial Donghua populer "${dDetails.title || slug}". Tonton semua episode lengkap dengan subtitle Indonesia.`,
            episodesList: epList,
          };
        }
      } catch {
        throw new Error(`Gagal memuat serial donghua: ${slug}`);
      }
    }
  }

  if (!json) {
    throw new Error(`Data donghua tidak ditemukan untuk ${slug}`);
  }

  return {
    title: json?.title || slug,
    slug,
    alterTitle: json?.alter_title,
    poster: proxyDonghuaPoster(json?.poster || ''),
    rating: json?.rating,
    followers: json?.followers,
    studio: json?.studio,
    network: json?.network,
    released: json?.released,
    duration: json?.duration,
    status: json?.status,
    type: json?.type,
    episodesCount: json?.episodes_count,
    genres: (json?.genres || []).map((g: any) => ({
      name: g.name,
      slug: g.slug,
    })),
    synopsis: json?.synopsis || 'Tidak ada sinopsis.',
    episodesList: (json?.episodes_list || []).map((ep: any) => ({
      episode: ep.episode,
      slug: ep.slug,
      number: ep.episode_number,
      releaseDate: ep.release_date,
    })),
  };
}

export async function getDonghuaEpisode(slug: string): Promise<DonghuaEpisodeData> {
  const json: any = await fetchJson(`${DONGHUA_BASE_URL}/episode/${encodeURIComponent(slug)}`);

  const servers = (json?.streaming?.servers || []).map((s: any) => ({
    name: s.name,
    url: s.url,
  }));

  return {
    episode: json?.episode || slug,
    mainStreamUrl: json?.streaming?.main_url?.url || servers[0]?.url || '',
    servers,
    donghuaDetails: json?.donghua_details,
    navigation: {
      prevSlug: json?.navigation?.previous_episode?.slug,
      nextSlug: json?.navigation?.next_episode?.slug,
      allEpisodesSlug: json?.navigation?.all_episodes?.slug,
    },
    episodesList: (json?.episodes_list || []).map((ep: any) => ({
      episode: ep.episode,
      slug: ep.slug,
    })),
    downloads: json?.download_url,
  };
}

export async function searchDonghua(query: string): Promise<DonghuaItem[]> {
  try {
    const json: any = await fetchJson(`${DONGHUA_BASE_URL}/search/${encodeURIComponent(query)}`);
    const list = json?.data || json?.results || json?.donghua || [];
    return (Array.isArray(list) ? list : []).map((item: any) => ({
      slug: item.slug,
      title: item.title,
      poster: proxyDonghuaPoster(item.poster),
      status: item.status,
      type: item.type,
      currentEpisode: item.current_episode,
    }));
  } catch (err) {
    console.warn('Donghua search warning:', err);
    return [];
  }
}

/**
 * Paginated Ongoing Donghua
 * Endpoint: /ongoing/:page
 */
export async function getDonghuaOngoing(page = 1): Promise<{
  donghuaList: DonghuaItem[];
  currentPage: number;
  hasNextPage: boolean;
}> {
  const json: any = await fetchJson(`${DONGHUA_BASE_URL}/ongoing/${page}`);
  const raw = json?.ongoing_donghua || json?.data || [];
  const list: DonghuaItem[] = (Array.isArray(raw) ? raw : []).map((item: any) => ({
    slug: item.slug,
    title: item.title,
    poster: proxyDonghuaPoster(item.poster),
    status: item.status || 'Ongoing',
    type: item.type || 'Donghua',
    currentEpisode: item.sub || item.current_episode,
  }));

  return {
    donghuaList: list,
    currentPage: page,
    hasNextPage: list.length >= 30,
  };
}

/**
 * Paginated Completed Donghua
 * Endpoint: /completed/:page
 */
export async function getDonghuaCompleted(page = 1): Promise<{
  donghuaList: DonghuaItem[];
  currentPage: number;
  hasNextPage: boolean;
}> {
  const json: any = await fetchJson(`${DONGHUA_BASE_URL}/completed/${page}`);
  const raw = json?.completed_donghua || json?.data || [];
  const list: DonghuaItem[] = (Array.isArray(raw) ? raw : []).map((item: any) => ({
    slug: item.slug,
    title: item.title,
    poster: proxyDonghuaPoster(item.poster),
    status: item.status || 'Completed',
    type: item.type || 'Donghua',
    currentEpisode: item.sub || item.current_episode,
  }));

  return {
    donghuaList: list,
    currentPage: page,
    hasNextPage: list.length >= 30,
  };
}

/**
 * Weekly Release Schedule for Donghua
 * Endpoint: /schedule
 */
export async function getDonghuaSchedule(): Promise<DonghuaScheduleDay[]> {
  const json: any = await fetchJson(`${DONGHUA_BASE_URL}/schedule`);
  const raw = json?.schedule || [];
  return (Array.isArray(raw) ? raw : []).map((d: any) => ({
    day: d.day,
    donghuaList: (d.donghua_list || []).map((item: any) => ({
      title: item.title,
      slug: item.slug,
      href: item.href,
    })),
  }));
}

/**
 * All 102 Donghua Genres
 * Endpoint: /genres
 */
export async function getDonghuaGenres(): Promise<DonghuaGenre[]> {
  const json: any = await fetchJson(`${DONGHUA_BASE_URL}/genres`);
  const raw = json?.data || [];
  return (Array.isArray(raw) ? raw : []).map((g: any) => ({
    name: g.name,
    slug: g.slug,
    href: g.href,
  }));
}

/**
 * Donghua filtered by Genre
 * Endpoint: /genres/:slug/:page
 */
export async function getDonghuaByGenre(
  genreSlug: string,
  page = 1
): Promise<{
  donghuaList: DonghuaItem[];
  currentPage: number;
  hasNextPage: boolean;
}> {
  const clean = encodeURIComponent(genreSlug.trim());
  const json: any = await fetchJson(`${DONGHUA_BASE_URL}/genres/${clean}/${page}`);
  const raw = json?.data || [];
  const list: DonghuaItem[] = (Array.isArray(raw) ? raw : []).map((item: any) => ({
    slug: item.slug,
    title: item.title,
    poster: proxyDonghuaPoster(item.poster),
    status: item.status,
    type: item.type,
    currentEpisode: item.sub || item.current_episode,
  }));

  return {
    donghuaList: list,
    currentPage: page,
    hasNextPage: list.length >= 10,
  };
}
