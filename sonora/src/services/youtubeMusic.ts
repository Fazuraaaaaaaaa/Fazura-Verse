import {
  MusicProvider,
  TrendingResponse,
  SongDetailsResponse,
  RecommendationResponse,
} from './providers/types';
import { YoutubeProvider } from './providers/youtubeProvider';
import { FallbackProvider } from './providers/fallbackProvider';
import { SearchResults, Track, Artist, Album, Playlist, LyricsData } from '@/types/music';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export class YouTubeMusicService implements MusicProvider {
  name = 'adapter';
  private primary: YoutubeProvider;
  private fallback: FallbackProvider;
  private cache = new Map<string, CacheEntry<any>>();

  constructor() {
    this.primary = new YoutubeProvider();
    this.fallback = new FallbackProvider();
  }

  private getCached<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  private setCache<T>(key: string, data: T, ttlSeconds = 300): void {
    // Keep cache size bounded
    if (this.cache.size > 200) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  private async withTimeout<T>(promise: Promise<T>, ms = 4500): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms)
      ),
    ]);
  }

  async search(query: string, filter = 'all', limit = 50): Promise<SearchResults> {
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const cacheKey = `search:${query.toLowerCase().trim()}:${filter}:${safeLimit}`;
    const cached = this.getCached<SearchResults>(cacheKey);
    if (cached) return cached;

    // Try YouTube provider first
    try {
      const res = await this.withTimeout(this.primary.search(query, filter, safeLimit), 6500);
      if (res.tracks.length > 0 || res.artists.length > 0 || res.albums.length > 0) {
        // If we want more tracks up to limit, enrich with matching fallback tracks
        if (res.tracks.length < safeLimit) {
          const fallbackRes = await this.fallback.search(query, filter, safeLimit);
          const existingIds = new Set(res.tracks.map(t => t.id));
          for (const ft of fallbackRes.tracks) {
            if (!existingIds.has(ft.id) && res.tracks.length < safeLimit) {
              res.tracks.push(ft);
              existingIds.add(ft.id);
            }
          }
        }
        this.setCache(cacheKey, res, 600); // 10 min
        return res;
      }
    } catch (err) {
      console.warn('[YouTubeMusicService] Primary search failed, using fallback:', (err as any)?.message || err);
    }

    // Fallback provider
    const fallbackRes = await this.fallback.search(query, filter, safeLimit);
    this.setCache(cacheKey, fallbackRes, 180);
    return fallbackRes;
  }

  async getTrending(): Promise<TrendingResponse> {
    const cacheKey = 'trending';
    const cached = this.getCached<TrendingResponse>(cacheKey);
    if (cached) return cached;

    const fallbackTrending = await this.fallback.getTrending();

    try {
      const res = await this.withTimeout(this.primary.getTrending(), 4000);
      if (res && res.topTracks.length > 0) {
        // Enrich playlists, new releases, shelves and sections
        if (!res.featuredPlaylists || res.featuredPlaylists.length === 0) {
          res.featuredPlaylists = fallbackTrending.featuredPlaylists;
        }
        if (!res.newReleases || res.newReleases.length === 0) {
          res.newReleases = fallbackTrending.newReleases;
        }
        res.shelves = fallbackTrending.shelves;
        res.sections = fallbackTrending.sections;

        this.setCache(cacheKey, res, 900); // 15 min
        return res;
      }
    } catch (err) {
      console.warn('[YouTubeMusicService] Primary getTrending failed, using fallback:', (err as any)?.message || err);
    }

    this.setCache(cacheKey, fallbackTrending, 300);
    return fallbackTrending;
  }

  async getSong(id: string): Promise<SongDetailsResponse | null> {
    const cacheKey = `song:${id.trim()}`;
    const cached = this.getCached<SongDetailsResponse>(cacheKey);
    if (cached) return cached;

    try {
      const res = await this.withTimeout(this.primary.getSong(id), 4000);
      if (res && res.track) {
        this.setCache(cacheKey, res, 1800); // 30 min
        return res;
      }
    } catch (err) {
      console.warn(`[YouTubeMusicService] Primary getSong(${id}) failed, using fallback:`, (err as any)?.message || err);
    }

    const fallbackRes = await this.fallback.getSong(id);
    if (fallbackRes) {
      this.setCache(cacheKey, fallbackRes, 600);
    }
    return fallbackRes;
  }

  async getArtist(id: string): Promise<Artist | null> {
    const cacheKey = `artist:${id.toLowerCase().trim()}`;
    const cached = this.getCached<Artist>(cacheKey);
    if (cached) return cached;

    // Check fallback catalog first for curated high-quality profile
    const fallbackArtist = await this.fallback.getArtist(id);
    if (fallbackArtist && fallbackArtist.topTracks && fallbackArtist.topTracks.length > 0) {
      // If it's one of our well-curated artists with multiple tracks, return it directly
      if (!id.startsWith('UC') && fallbackArtist.topTracks.length >= 2) {
        this.setCache(cacheKey, fallbackArtist, 1800);
        return fallbackArtist;
      }
    }

    try {
      const res = await this.withTimeout(this.primary.getArtist(id), 4000);
      if (res && res.name) {
        this.setCache(cacheKey, res, 1800);
        return res;
      }
    } catch (err) {
      console.warn(`[YouTubeMusicService] Primary getArtist(${id}) failed, using fallback:`, (err as any)?.message || err);
    }

    this.setCache(cacheKey, fallbackArtist, 600);
    return fallbackArtist;
  }

  async getAlbum(id: string): Promise<Album | null> {
    const cacheKey = `album:${id.toLowerCase().trim()}`;
    const cached = this.getCached<Album>(cacheKey);
    if (cached) return cached;

    // Check fallback curated catalog first
    const fallbackAlbum = await this.fallback.getAlbum(id);
    if (fallbackAlbum && fallbackAlbum.tracks && fallbackAlbum.tracks.length > 1) {
      this.setCache(cacheKey, fallbackAlbum, 1800);
      return fallbackAlbum;
    }

    try {
      const res = await this.withTimeout(this.primary.getAlbum(id), 4000);
      if (res && res.title) {
        this.setCache(cacheKey, res, 1800);
        return res;
      }
    } catch (err) {
      console.warn(`[YouTubeMusicService] Primary getAlbum(${id}) failed, using fallback:`, (err as any)?.message || err);
    }

    this.setCache(cacheKey, fallbackAlbum, 600);
    return fallbackAlbum;
  }

  async getPlaylist(id: string): Promise<Playlist | null> {
    const cacheKey = `playlist:${id.toLowerCase().trim()}`;
    const cached = this.getCached<Playlist>(cacheKey);
    if (cached) return cached;

    // Check fallback curated catalog first
    const fallbackPlaylist = await this.fallback.getPlaylist(id);
    if (fallbackPlaylist && fallbackPlaylist.tracks && fallbackPlaylist.tracks.length > 0) {
      this.setCache(cacheKey, fallbackPlaylist, 1800);
      return fallbackPlaylist;
    }

    try {
      const res = await this.withTimeout(this.primary.getPlaylist(id), 4000);
      if (res && res.title) {
        this.setCache(cacheKey, res, 1800);
        return res;
      }
    } catch (err) {
      console.warn(`[YouTubeMusicService] Primary getPlaylist(${id}) failed, using fallback:`, (err as any)?.message || err);
    }

    this.setCache(cacheKey, fallbackPlaylist, 600);
    return fallbackPlaylist;
  }

  async getRecommendations(seedTrackId?: string, genre?: string, limit = 15): Promise<RecommendationResponse> {
    const cacheKey = `recs:${seedTrackId || ''}:${genre || ''}:${limit}`;
    const cached = this.getCached<RecommendationResponse>(cacheKey);
    if (cached) return cached;

    try {
      const res = await this.withTimeout(this.primary.getRecommendations(seedTrackId, genre, limit), 4000);
      if (res && res.tracks.length > 0) {
        this.setCache(cacheKey, res, 600);
        return res;
      }
    } catch (err) {
      console.warn('[YouTubeMusicService] Primary getRecommendations failed, using fallback:', (err as any)?.message || err);
    }

    const fallbackRes = await this.fallback.getRecommendations(seedTrackId, genre, limit);
    this.setCache(cacheKey, fallbackRes, 300);
    return fallbackRes;
  }

  async getLyrics(trackId: string, title?: string, artist?: string): Promise<LyricsData | null> {
    const cacheKey = `lyrics:${trackId}`;
    const cached = this.getCached<LyricsData>(cacheKey);
    if (cached) return cached;

    try {
      if (this.primary.getLyrics) {
        const res = await this.withTimeout(this.primary.getLyrics(trackId, title, artist), 3000);
        if (res && res.lines.length > 0) {
          this.setCache(cacheKey, res, 3600);
          return res;
        }
      }
    } catch (err) {
      // ignore lyrics network errors
    }

    const fallbackLyrics = await this.fallback.getLyrics(trackId, title, artist);
    if (fallbackLyrics) {
      this.setCache(cacheKey, fallbackLyrics, 3600);
    }
    return fallbackLyrics;
  }
}

// Export singleton instance
export const youtubeMusic = new YouTubeMusicService();
export default youtubeMusic;
