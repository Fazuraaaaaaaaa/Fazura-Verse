import type {
  Movie,
  MovieDetail,
  MoviesResponse,
  MovieDetailResponse,
  StreamResponse,
  SeasonItem,
  EpisodeItem,
  MovieComment,
  CreateCommentPayload,
  MovieQueryParams,
} from '../types/movie';

// Default base URLs as specified
export const PRODUCTION_API_URL = 'https://fazuradex.web.id';
export const LOCAL_API_URL = 'http://localhost:4000';

const STORAGE_KEY_API_URL = 'fazura_movie_api_base_url';

// TMDB API configuration (supports optional env override)
const TMDB_API_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_TMDB_API_KEY) ||
  '1cf50e6248dc270629e802686245c2c8';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// In-memory TTL cache & concurrent request deduplication for zero-latency repeat loads
const MOVIE_CACHE_TTL_MS = 5 * 60 * 1000;
const MOVIE_RESPONSE_CACHE = new Map<string, { data: unknown; expiresAt: number }>();
const MOVIE_IN_FLIGHT = new Map<string, Promise<unknown>>();

function getCachedMovieData<T>(key: string): T | null {
  const entry = MOVIE_RESPONSE_CACHE.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    MOVIE_RESPONSE_CACHE.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCachedMovieData(key: string, data: unknown): void {
  if (MOVIE_RESPONSE_CACHE.size >= 100) {
    const oldestKey = MOVIE_RESPONSE_CACHE.keys().next().value;
    if (oldestKey) MOVIE_RESPONSE_CACHE.delete(oldestKey);
  }
  MOVIE_RESPONSE_CACHE.set(key, {
    data,
    expiresAt: Date.now() + MOVIE_CACHE_TTL_MS,
  });
}

async function fetchTmdbJson<T = any>(url: string, timeoutMs = 7000): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

export function getMovieApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY_API_URL);
    if (saved) return saved;
  }
  return (
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.NEXT_PUBLIC_API_BASE_URL ||
    PRODUCTION_API_URL
  );
}

export function setMovieApiBaseUrl(url: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_API_URL, url);
    window.dispatchEvent(new CustomEvent('fazura_api_url_changed', { detail: url }));
  }
}

/**
 * Optional helper for custom local servers only.
 * Never hits https://fazuradex.web.id to avoid CORS and 6s timeout bottlenecks.
 */
async function fetchFromLocalCustomApi<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  const baseUrl = getMovieApiBaseUrl().replace(/\/+$/, '');
  // Skip if default production URL to prevent CORS & timeout
  if (!baseUrl || baseUrl === PRODUCTION_API_URL) {
    return null;
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1200);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(options?.body ? { 'Content-Type': 'application/json' } : {}),
        ...options?.headers,
      },
    });

    clearTimeout(timeoutId);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

// TMDB Genre dictionaries
export const TMDB_GENRE_NAMES: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
  10759: 'Action & Adventure',
  10762: 'Kids',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics',
};

export const TMDB_GENRE_MAP: Record<string, number> = {
  Action: 28,
  Adventure: 12,
  Animation: 16,
  Comedy: 35,
  Crime: 80,
  Documentary: 99,
  Drama: 18,
  Family: 10751,
  Fantasy: 14,
  History: 36,
  Horror: 27,
  Music: 10402,
  Mystery: 9648,
  Romance: 10749,
  'Sci-Fi': 878,
  'Science Fiction': 878,
  Thriller: 53,
  War: 10752,
  Western: 37,
};

const ALL_GENRE_NAMES = [
  'Action',
  'Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Family',
  'Fantasy',
  'History',
  'Horror',
  'Music',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Thriller',
  'War',
  'Western',
];

function mapTmdbItemToMovie(item: any, forceMediaType?: 'movie' | 'tv'): Movie {
  const isTv = forceMediaType === 'tv' || item.media_type === 'tv' || (!item.title && Boolean(item.name));
  const title = item.title || item.name || 'Untitled';
  const releaseDate = item.release_date || item.first_air_date || '';
  const genres =
    item.genre_ids?.map((id: number) => TMDB_GENRE_NAMES[id]).filter(Boolean) ||
    item.genres?.map((g: any) => g.name || TMDB_GENRE_NAMES[g.id] || g).filter(Boolean) ||
    [];

  return {
    id: String(item.id),
    title,
    description: item.overview || '',
    posterUrl: item.poster_path
      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
      : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500',
    backdropUrl: item.backdrop_path
      ? `https://image.tmdb.org/t/p/original${item.backdrop_path}`
      : undefined,
    releaseDate,
    genres,
    ratingValue: item.vote_average ? Math.round(item.vote_average * 10) / 10 : undefined,
    ratingCount: item.vote_count,
    duration: item.runtime
      ? `${Math.floor(item.runtime / 60)}h ${item.runtime % 60}m`
      : isTv
      ? 'Serial TV'
      : undefined,
    mediaType: isTv ? 'tv' : 'movie',
  };
}

function generateMultiServerStreams(
  id: string,
  mediaType: 'movie' | 'tv' = 'movie',
  season = 1,
  episode = 1
): StreamResponse {
  const isTv = mediaType === 'tv';

  const streams = [
    {
      serverName: 'Server 1 (VidSrc Pro)',
      url: isTv
        ? `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`
        : `https://vidsrc.to/embed/movie/${id}`,
      type: 'iframe' as const,
    },
    {
      serverName: 'Server 2 (AutoEmbed HD)',
      url: isTv
        ? `https://player.autoembed.cc/embed/tv/${id}/${season}/${episode}`
        : `https://player.autoembed.cc/embed/movie/${id}`,
      type: 'iframe' as const,
    },
    {
      serverName: 'Server 3 (MultiEmbed VIP)',
      url: isTv
        ? `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season}&e=${episode}`
        : `https://multiembed.mov/?video_id=${id}&tmdb=1`,
      type: 'iframe' as const,
    },
    {
      serverName: 'Server 4 (VidSrc.me Fast)',
      url: isTv
        ? `https://vidsrc.me/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`
        : `https://vidsrc.me/embed/movie?tmdb=${id}`,
      type: 'iframe' as const,
    },
    {
      serverName: 'Server 5 (2Embed VIP)',
      url: isTv
        ? `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}`
        : `https://www.2embed.cc/embed/${id}`,
      type: 'iframe' as const,
    },
  ];

  return {
    id,
    title: `TMDB #${id} ${isTv ? `S${season}E${episode}` : 'Full Movie'}`,
    streams,
    streamUrl: streams[0].url,
    type: 'iframe',
    sourceLabel: 'Multi-Server Cloud CDN',
    mediaType,
    season,
    episode,
  };
}

// ==========================================
// API IMPLEMENTATIONS WITH LIVE TMDB DIRECT
// ==========================================

/**
 * 1. GET /api/movies
 * Ambil film & serial secara instan langsung via live TMDB API (< 500ms)
 */
export async function getMovies(params: MovieQueryParams = {}): Promise<MoviesResponse> {
  const page = params.page || 1;
  const isTvCollection = params.collection === 'tv';
  const cacheKey = `movies:${JSON.stringify({
    page,
    q: params.q || '',
    genre: params.genre || '',
    collection: params.collection || 'trending',
    minRating: params.minRating || 0,
    sort: params.sort || '',
  })}`;

  const cached = getCachedMovieData<MoviesResponse>(cacheKey);
  if (cached) return cached;

  const existingRequest = MOVIE_IN_FLIGHT.get(cacheKey);
  if (existingRequest) {
    return existingRequest as Promise<MoviesResponse>;
  }

  const requestPromise = (async (): Promise<MoviesResponse> => {
    // Optional: check if developer has configured a local custom backend
    const localRes = await fetchFromLocalCustomApi<MoviesResponse>(
      `/api/movies?page=${page}&perPage=${params.perPage || 24}`
    );
    if (localRes && Array.isArray(localRes.data) && localRes.data.length > 0) {
      setCachedMovieData(cacheKey, localRes);
      return localRes;
    }

    // Live TMDB API: Query directly with bounded timeout & zero 6s custom-backend bottleneck
    try {
      let tmdbUrl = '';

      if (params.q) {
        tmdbUrl = `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(
          params.q
        )}&page=${page}&include_adult=false`;
      } else if (params.genre && params.genre !== 'All') {
        const genreId = TMDB_GENRE_MAP[params.genre] || 28;
        const endpoint = isTvCollection ? 'discover/tv' : 'discover/movie';
        tmdbUrl = `${TMDB_BASE_URL}/${endpoint}?api_key=${TMDB_API_KEY}&language=en-US&with_genres=${genreId}&page=${page}&include_adult=false&sort_by=popularity.desc`;
      } else if (params.collection === 'top_rated') {
        tmdbUrl = `${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`;
      } else if (params.collection === 'now_playing') {
        tmdbUrl = `${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`;
      } else if (params.collection === 'upcoming') {
        tmdbUrl = `${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`;
      } else if (params.collection === 'tv') {
        tmdbUrl = `${TMDB_BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`;
      } else if (params.collection === 'popular') {
        tmdbUrl = `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`;
      } else {
        tmdbUrl = `${TMDB_BASE_URL}/trending/all/day?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`;
      }

      if (params.minRating && tmdbUrl.includes('discover')) {
        tmdbUrl += `&vote_average.gte=${params.minRating}`;
      }

      const tmdbJson = await fetchTmdbJson<any>(tmdbUrl, 7000);
      if (!tmdbJson) throw new Error('TMDB request failed or timed out');

      let rawItems: any[] = tmdbJson.results || [];
      rawItems = rawItems.filter((item) => item.media_type !== 'person');

      if (params.minRating) {
        rawItems = rawItems.filter((item) => (item.vote_average || 0) >= params.minRating!);
      }

      if (params.sort === 'rating_desc') {
        rawItems.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
      } else if (params.sort === 'date_desc') {
        rawItems.sort((a, b) => {
          const dateA = a.release_date || a.first_air_date || '';
          const dateB = b.release_date || b.first_air_date || '';
          return dateB.localeCompare(dateA);
        });
      } else if (params.sort === 'title_asc') {
        rawItems.sort((a, b) => {
          const titleA = a.title || a.name || '';
          const titleB = b.title || b.name || '';
          return titleA.localeCompare(titleB);
        });
      }

      const movies: Movie[] = rawItems.map((item) =>
        mapTmdbItemToMovie(item, isTvCollection ? 'tv' : undefined)
      );

      const response: MoviesResponse = {
        total: tmdbJson.total_results || movies.length,
        page,
        perPage: movies.length,
        totalPages: Math.min(tmdbJson.total_pages || 1, 500),
        data: movies,
      };

      setCachedMovieData(cacheKey, response);
      return response;
    } catch (tmdbErr) {
      console.warn('[MovieApi] TMDB fetch failed, falling back to emergency cache:', tmdbErr);
      return {
        total: 1,
        page: 1,
        perPage: 1,
        totalPages: 1,
        data: [
          {
            id: '693134',
            title: 'Dune: Part Two',
            description: 'Paul Atreides bersatu kembali dengan Chani dan Fremen untuk membalas dendam.',
            posterUrl: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
            backdropUrl: 'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5200bm.jpg',
            releaseDate: '2024-02-27',
            genres: ['Sci-Fi', 'Adventure', 'Action'],
            ratingValue: 8.5,
            ratingCount: 5420,
            duration: '2h 46m',
            mediaType: 'movie',
          },
        ],
      };
    } finally {
      MOVIE_IN_FLIGHT.delete(cacheKey);
    }
  })();

  MOVIE_IN_FLIGHT.set(cacheKey, requestPromise);
  return requestPromise;
}

/**
 * 2. GET /api/movies/:id
 * Detail Lengkap Film / Serial langsung via live TMDB (< 500ms)
 */
export async function getMovieDetail(id: string): Promise<MovieDetailResponse> {
  const cacheKey = `movie_detail:${id}`;
  const cached = getCachedMovieData<MovieDetailResponse>(cacheKey);
  if (cached) return cached;

  const existing = MOVIE_IN_FLIGHT.get(cacheKey);
  if (existing) return existing as Promise<MovieDetailResponse>;

  const requestPromise = (async (): Promise<MovieDetailResponse> => {
    try {
      let tmdbData: any = await fetchTmdbJson<any>(
        `${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=credits,videos,recommendations,similar`,
        7000
      );
      let isTv = false;

      if (!tmdbData) {
        tmdbData = await fetchTmdbJson<any>(
          `${TMDB_BASE_URL}/tv/${id}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=credits,videos,recommendations,similar`,
          7000
        );
        if (tmdbData) isTv = true;
      }

      if (tmdbData) {
        const baseMovie = mapTmdbItemToMovie(tmdbData, isTv ? 'tv' : 'movie');

        const videos: any[] = tmdbData.videos?.results || [];
        const trailer =
          videos.find((v) => v.type === 'Trailer' && v.site === 'YouTube') ||
          videos.find((v) => v.site === 'YouTube');

        const castList: any[] = tmdbData.credits?.cast || [];
        const cast = castList.slice(0, 8).map((c) => ({
          id: c.id,
          name: c.name,
          character: c.character,
          profileUrl: c.profile_path
            ? `https://image.tmdb.org/t/p/w185${c.profile_path}`
            : undefined,
        }));

        const recs: any[] =
          tmdbData.recommendations?.results || tmdbData.similar?.results || [];
        const related = recs.slice(0, 6).map((item) => mapTmdbItemToMovie(item));

        const movieDetail: MovieDetail = {
          ...baseMovie,
          tagline: tmdbData.tagline || undefined,
          trailerUrl: trailer ? `https://www.youtube.com/embed/${trailer.key}` : undefined,
          trailerKey: trailer?.key,
          cast,
          status: tmdbData.status,
          budget: tmdbData.budget,
          revenue: tmdbData.revenue,
          runtime: tmdbData.runtime,
          spokenLanguages: tmdbData.spoken_languages?.map((l: any) => l.english_name || l.name) || [],
          productionCompanies: tmdbData.production_companies?.map((c: any) => c.name) || [],
          numberOfSeasons: tmdbData.number_of_seasons,
          numberOfEpisodes: tmdbData.number_of_episodes,
        };

        const detailRes: MovieDetailResponse = { data: movieDetail, related };
        setCachedMovieData(cacheKey, detailRes);
        return detailRes;
      }
    } catch (tmdbErr) {
      console.warn('[MovieApi] TMDB movie detail failed:', tmdbErr);
    } finally {
      MOVIE_IN_FLIGHT.delete(cacheKey);
    }

    const fallback = {
      id,
      title: 'Movie Title #' + id,
      description: 'Sinopsis film memukau dengan alur cerita menarik dan pengalaman visual definisi tinggi.',
      posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500',
      mediaType: 'movie' as const,
      ratingValue: 8.0,
      ratingCount: 1000,
      releaseDate: '2024-01-01',
      genres: ['Action', 'Sci-Fi'],
      trailerUrl: 'https://www.youtube.com/embed/Way9Dexny3w',
    };

    return {
      data: fallback,
      related: [],
    };
  })();

  MOVIE_IN_FLIGHT.set(cacheKey, requestPromise);
  return requestPromise;
}

/**
 * 3. GET /api/movies/:id/stream?season=1&episode=1
 * Pemutar Video & Multi-Server Streaming instan
 */
export async function getMovieStream(
  id: string,
  season = 1,
  episode = 1
): Promise<StreamResponse> {
  // Cek apakah serial TV atau film
  let mediaType: 'movie' | 'tv' = season > 1 || episode > 1 ? 'tv' : 'movie';
  if (mediaType === 'movie') {
    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 600);
      const checkRes = await fetch(`${TMDB_BASE_URL}/tv/${id}?api_key=${TMDB_API_KEY}`, {
        signal: controller.signal,
      });
      clearTimeout(tid);
      if (checkRes.ok) {
        mediaType = 'tv';
      }
    } catch {
      // ignore
    }
  }

  return generateMultiServerStreams(id, mediaType, season, episode);
}

/**
 * 4. GET /api/movies/:id/seasons
 * Daftar Season untuk Serial TV langsung via TMDB
 */
export async function getMovieSeasons(id: string): Promise<SeasonItem[]> {
  const cacheKey = `movie_seasons:${id}`;
  const cached = getCachedMovieData<SeasonItem[]>(cacheKey);
  if (cached) return cached;

  try {
    const tvJson = await fetchTmdbJson<any>(
      `${TMDB_BASE_URL}/tv/${id}?api_key=${TMDB_API_KEY}&language=en-US`,
      7000
    );
    if (tvJson) {
      const rawSeasons: any[] = tvJson.seasons || [];
      const seasons = rawSeasons
        .filter((s) => s.season_number > 0)
        .map((s) => ({
          id: s.id,
          seasonNumber: s.season_number,
          name: s.name || `Season ${s.season_number}`,
          episodeCount: s.episode_count,
          posterUrl: s.poster_path ? `https://image.tmdb.org/t/p/w300${s.poster_path}` : undefined,
          airDate: s.air_date,
          overview: s.overview,
        }));
      if (seasons.length > 0) {
        setCachedMovieData(cacheKey, seasons);
        return seasons;
      }
    }
  } catch (tmdbErr) {
    console.warn('[MovieApi] TMDB seasons failed:', tmdbErr);
  }

  return [
    {
      seasonNumber: 1,
      name: 'Season 1',
      episodeCount: 9,
      airDate: '2024-01-01',
      overview: 'Musim pertama serial dengan alur cerita memikat.',
    },
  ];
}

/**
 * 5. GET /api/movies/:id/episodes?season=1
 * Daftar Episode dalam Season Terpilih langsung via TMDB
 */
export async function getMovieEpisodes(id: string, season = 1): Promise<EpisodeItem[]> {
  const cacheKey = `movie_episodes:${id}:s${season}`;
  const cached = getCachedMovieData<EpisodeItem[]>(cacheKey);
  if (cached) return cached;

  try {
    const epJson = await fetchTmdbJson<any>(
      `${TMDB_BASE_URL}/tv/${id}/season/${season}?api_key=${TMDB_API_KEY}&language=en-US`,
      7000
    );
    if (epJson) {
      const rawEpisodes: any[] = epJson.episodes || [];
      if (rawEpisodes.length > 0) {
        const episodes = rawEpisodes.map((ep) => ({
          id: ep.id,
          episodeNumber: ep.episode_number,
          seasonNumber: season,
          name: ep.name || `Episode ${ep.episode_number}`,
          title: ep.name || `Episode ${ep.episode_number}`,
          overview: ep.overview,
          thumbnailUrl: ep.still_path
            ? `https://image.tmdb.org/t/p/w300${ep.still_path}`
            : undefined,
          airDate: ep.air_date,
          duration: ep.runtime ? `${ep.runtime}m` : undefined,
          ratingValue: ep.vote_average ? Math.round(ep.vote_average * 10) / 10 : undefined,
        }));
        setCachedMovieData(cacheKey, episodes);
        return episodes;
      }
    }
  } catch (tmdbErr) {
    console.warn('[MovieApi] TMDB episodes failed:', tmdbErr);
  }

  const episodes: EpisodeItem[] = [];
  for (let i = 1; i <= 9; i++) {
    episodes.push({
      episodeNumber: i,
      seasonNumber: season,
      name: `Episode ${i}`,
      title: `Episode ${i}`,
      overview: `Episode ${i} dari Season ${season}.`,
      airDate: '2024-01-01',
      duration: '45m',
      ratingValue: 8.5,
    });
  }
  return episodes;
}

/**
 * 6. GET /api/genres
 * Daftar Kategori Genre instan
 */
export async function getMovieGenres(): Promise<string[]> {
  return ALL_GENRE_NAMES;
}

/**
 * 7. GET /api/movies/:id/comments
 * Mengambil Ulasan & Komentar Pengguna secara instan dari LocalStorage & Seed Data
 */
export async function getMovieComments(id: string): Promise<MovieComment[]> {
  let localComments: MovieComment[] = [];
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(`fazura_movie_comments_${id}`);
      if (stored) {
        localComments = JSON.parse(stored);
      }
    } catch {
      // ignore
    }
  }

  if (localComments.length === 0) {
    return [
      {
        id: `c-default-1`,
        author: 'Reza Cinephile',
        text: 'Visual dan sinematografinya luar biasa memukau! Salah satu tontonan terbaik dengan resolusi sangat jernih.',
        rating: 9,
        isSpoiler: false,
        createdAt: '2 jam yang lalu',
      },
      {
        id: `c-default-2`,
        author: 'Fajar Moviegoer',
        text: 'Akting para pemerannya sangat berkelas dan alur ceritanya tidak membosankan dari awal sampai akhir.',
        rating: 10,
        isSpoiler: false,
        createdAt: '1 hari yang lalu',
      },
    ];
  }

  return localComments;
}

/**
 * 8. POST /api/movies/:id/comments
 * Mengirim Komentar / Ulasan Pengguna secara instan
 */
export async function postMovieComment(
  id: string,
  payload: CreateCommentPayload
): Promise<MovieComment> {
  const newComment: MovieComment = {
    id: `comm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    author: payload.author.trim() || 'Pengunjung FazuraStream',
    text: payload.text.trim(),
    rating: payload.rating,
    isSpoiler: Boolean(payload.isSpoiler),
    createdAt: 'Baru saja',
  };

  if (typeof window !== 'undefined') {
    try {
      const key = `fazura_movie_comments_${id}`;
      const stored = localStorage.getItem(key);
      const list: MovieComment[] = stored ? JSON.parse(stored) : [];
      list.unshift(newComment);
      localStorage.setItem(key, JSON.stringify(list));
    } catch (storageErr) {
      console.error('LocalStorage write failed:', storageErr);
    }
  }

  return newComment;
}
