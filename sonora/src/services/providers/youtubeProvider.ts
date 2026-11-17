import {
  MusicProvider,
  TrendingResponse,
  SongDetailsResponse,
  RecommendationResponse,
} from './types';
import { Track, Artist, Album, Playlist, SearchResults, LyricsData, LyricsLine } from '@/types/music';
import { formatDuration } from '@/lib/utils';

export class YoutubeProvider implements MusicProvider {
  name = 'youtube';

  private readonly userAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

  private parseDurationToSeconds(durationStr?: string): number {
    if (!durationStr) return 180;
    const clean = durationStr.trim();
    const parts = clean.split(':').map(p => parseInt(p, 10));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return parts[0] * 60 + parts[1];
    }
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 180;
  }

  private cleanTitleAndArtist(rawTitle: string, rawChannel?: string): { title: string; artist: string } {
    let title = rawTitle.replace(/\s*\(Official (Music )?Video\)/gi, '')
      .replace(/\s*\[Official (Music )?Video\]/gi, '')
      .replace(/\s*\(Official Audio\)/gi, '')
      .replace(/\s*\[Official Audio\]/gi, '')
      .replace(/\s*\(Lyric Video\)/gi, '')
      .replace(/\s*\[Lyric Video\]/gi, '')
      .replace(/\s*\(Visualizer\)/gi, '')
      .replace(/\s*\[Visualizer\]/gi, '')
      .trim();

    let artist = rawChannel || 'Unknown Artist';
    artist = artist.replace(/ - Topic$/i, '').replace(/VEVO$/i, '').trim();

    if (title.includes(' - ')) {
      const parts = title.split(' - ');
      if (parts.length >= 2) {
        artist = parts[0].trim();
        title = parts.slice(1).join(' - ').trim();
      }
    }

    return { title, artist };
  }

  async search(query: string, filter = 'all', limit = 20): Promise<SearchResults> {
    const q = (query || '').trim();
    if (!q) {
      return {
        query: '',
        tracks: [],
        artists: [],
        albums: [],
        playlists: [],
      };
    }

    try {
      const res = await fetch('https://www.youtube.com/youtubei/v1/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': this.userAgent,
        },
        body: JSON.stringify({
          context: {
            client: {
              clientName: 'WEB',
              clientVersion: '2.20231201.00.00',
              hl: 'en',
              gl: 'US',
            },
          },
          query: q,
        }),
      });

      if (!res.ok) {
        throw new Error(`YouTube search returned status ${res.status}`);
      }

      const data = await res.json();
      const contents =
        data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];
      const itemSection = contents.find((c: any) => c.itemSectionRenderer)?.itemSectionRenderer;
      const rawItems = itemSection?.contents || [];

      const tracks: Track[] = [];
      const artists: Artist[] = [];
      const playlists: Playlist[] = [];

      for (const item of rawItems) {
        if (item.videoRenderer) {
          const v = item.videoRenderer;
          const videoId = v.videoId;
          if (!videoId) continue;

          const rawTitle = v.title?.runs?.map((r: any) => r.text).join('') || 'Unknown Song';
          const rawChannel = v.ownerText?.runs?.map((r: any) => r.text).join('') || '';
          const { title, artist } = this.cleanTitleAndArtist(rawTitle, rawChannel);
          const durationFormatted = v.lengthText?.simpleText || '3:30';
          const duration = this.parseDurationToSeconds(durationFormatted);
          const thumbnail =
            v.thumbnail?.thumbnails?.[v.thumbnail.thumbnails.length - 1]?.url ||
            `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
          const views = v.viewCountText?.simpleText || '';
          const releaseDate = v.publishedTimeText?.simpleText || '';

          tracks.push({
            id: videoId,
            youtubeId: videoId,
            title,
            artist,
            artists: [{ name: artist }],
            duration,
            durationFormatted,
            thumbnail,
            views,
            releaseDate,
          });
        } else if (item.channelRenderer) {
          const c = item.channelRenderer;
          const name = c.title?.simpleText || c.title?.runs?.[0]?.text || '';
          const avatar = c.thumbnail?.thumbnails?.[0]?.url || '';
          const monthly = c.videoCountText?.simpleText || c.subscriberCountText?.simpleText || '';
          artists.push({
            id: c.channelId || `art_${name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
            name,
            avatar,
            monthlyListeners: monthly,
          });
        } else if (item.playlistRenderer) {
          const p = item.playlistRenderer;
          playlists.push({
            id: p.playlistId,
            title: p.title?.simpleText || 'Playlist',
            cover: p.thumbnails?.[0]?.thumbnails?.[0]?.url || '',
            trackCount: parseInt(p.videoCount || '0', 10),
            creator: {
              name: p.shortBylineText?.runs?.[0]?.text || 'YouTube',
            },
          });
        }
      }

      // Group into albums / singles simulation or derived
      const albums: Album[] = [];
      const seenAlbums = new Set<string>();
      for (const t of tracks) {
        const albumName = `${t.title} - Single`;
        if (!seenAlbums.has(albumName) && albums.length < 5) {
          seenAlbums.add(albumName);
          albums.push({
            id: `alb_${t.id}`,
            title: albumName,
            artist: t.artist,
            cover: t.thumbnail,
            releaseYear: t.releaseDate ? t.releaseDate.replace(/[^0-9]/g, '') : new Date().getFullYear(),
            trackCount: 1,
            tracks: [t],
            type: 'single',
          });
        }
      }

      // Determine top result
      let topResult: SearchResults['topResult'] = undefined;
      if (artists.length > 0 && artists[0].name.toLowerCase().includes(q.toLowerCase())) {
        topResult = { type: 'artist', item: artists[0] };
      } else if (tracks.length > 0) {
        topResult = { type: 'track', item: tracks[0] };
      }

      const requestedFilter = (filter || 'all').toLowerCase();

      return {
        query,
        tracks: (requestedFilter === 'all' || requestedFilter === 'songs' || requestedFilter === 'tracks')
          ? tracks.slice(0, limit)
          : [],
        artists: (requestedFilter === 'all' || requestedFilter === 'artists')
          ? artists.slice(0, limit)
          : [],
        albums: (requestedFilter === 'all' || requestedFilter === 'albums')
          ? albums.slice(0, limit)
          : [],
        playlists: (requestedFilter === 'all' || requestedFilter === 'playlists')
          ? playlists.slice(0, limit)
          : [],
        topResult,
      };
    } catch (err) {
      console.warn('[YoutubeProvider] search failed:', err);
      throw err;
    }
  }

  async getTrending(): Promise<TrendingResponse> {
    try {
      // Fetch charts or trending music from YouTube
      const searchRes = await this.search('top hits trending music billboard 2024', 'all', 25);
      const tracks = searchRes.tracks;

      const topTracks = tracks.slice(0, 10);
      const trendingTracks = tracks.slice(10, 20);
      const quickPicks = tracks.slice(0, 6);

      return {
        topTracks,
        trendingTracks,
        newReleases: searchRes.albums,
        quickPicks,
        featuredPlaylists: searchRes.playlists,
      };
    } catch (err) {
      console.warn('[YoutubeProvider] getTrending failed:', err);
      throw err;
    }
  }

  async getSong(id: string): Promise<SongDetailsResponse | null> {
    const videoId = id.trim();
    if (!videoId) return null;

    try {
      // 1. Fetch player details
      const playerRes = await fetch('https://www.youtube.com/youtubei/v1/player', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': this.userAgent,
        },
        body: JSON.stringify({
          context: {
            client: {
              clientName: 'WEB',
              clientVersion: '2.20231201.00.00',
              hl: 'en',
              gl: 'US',
            },
          },
          videoId,
        }),
      });

      if (!playerRes.ok) {
        throw new Error(`Player endpoint returned status ${playerRes.status}`);
      }

      const playerData = await playerRes.json();
      const details = playerData.videoDetails;

      if (!details || !details.title) {
        throw new Error(`Video ${videoId} not found or details empty`);
      }

      const { title, artist } = this.cleanTitleAndArtist(details.title, details.author);
      const duration = parseInt(details.lengthSeconds || '180', 10);
      const durationFormatted = formatDuration(duration);
      const thumbnail =
        details.thumbnail?.thumbnails?.[details.thumbnail.thumbnails.length - 1]?.url ||
        `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

      const track: Track = {
        id: videoId,
        youtubeId: videoId,
        title,
        artist,
        artists: [{ name: artist }],
        duration,
        durationFormatted,
        thumbnail,
        views: details.viewCount,
      };

      // 2. Fetch related songs from next endpoint
      const related: Track[] = [];
      try {
        const nextRes = await fetch('https://www.youtube.com/youtubei/v1/next', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': this.userAgent,
          },
          body: JSON.stringify({
            context: {
              client: {
                clientName: 'WEB',
                clientVersion: '2.20231201.00.00',
                hl: 'en',
                gl: 'US',
              },
            },
            videoId,
          }),
        });

        if (nextRes.ok) {
          const nextData = await nextRes.json();
          const items =
            nextData?.contents?.twoColumnWatchNextResults?.secondaryResults?.secondaryResults?.results ||
            nextData?.contents?.twoColumnWatchNextResults?.secondaryResults?.secondaryResultRenderer?.results ||
            [];

          for (const item of items) {
            let relId = '';
            let relTitle = '';
            let relChannel = '';
            let relThumb = '';
            let relDurationStr = '3:30';

            if (item.compactVideoRenderer) {
              const cv = item.compactVideoRenderer;
              relId = cv.videoId;
              relTitle = cv.title?.simpleText || cv.title?.runs?.map((r: any) => r.text).join('') || '';
              relChannel = cv.shortBylineText?.runs?.[0]?.text || '';
              relThumb = cv.thumbnail?.thumbnails?.[0]?.url || `https://i.ytimg.com/vi/${relId}/hqdefault.jpg`;
              relDurationStr = cv.lengthText?.simpleText || '3:30';
            } else if (item.lockupViewModel) {
              const lv = item.lockupViewModel;
              relId =
                lv.rendererContext?.commandContext?.onTap?.innertubeCommand?.watchEndpoint?.videoId ||
                lv.contentImage?.thumbnailViewModel?.image?.sources?.[0]?.url?.match(/vi\/([a-zA-Z0-9_-]{11})/)?.[1] ||
                '';
              relTitle = lv.metadata?.lockupMetadataViewModel?.title?.content || '';
              relChannel =
                lv.metadata?.lockupMetadataViewModel?.metadata?.contentMetadataViewModel?.metadataRows?.[0]
                  ?.metadataParts?.[0]?.text?.content || '';
              relThumb =
                lv.contentImage?.thumbnailViewModel?.image?.sources?.[0]?.url ||
                (relId ? `https://i.ytimg.com/vi/${relId}/hqdefault.jpg` : '');
            }

            if (relId && relId !== videoId && relTitle) {
              const clean = this.cleanTitleAndArtist(relTitle, relChannel);
              const relDuration = this.parseDurationToSeconds(relDurationStr);
              related.push({
                id: relId,
                youtubeId: relId,
                title: clean.title,
                artist: clean.artist,
                artists: [{ name: clean.artist }],
                duration: relDuration,
                durationFormatted: formatDuration(relDuration),
                thumbnail: relThumb,
              });
            }
          }
        }
      } catch (err) {
        console.warn('[YoutubeProvider] next endpoint warning:', err);
      }

      // 3. Try fetching live synced lyrics
      const lyrics = await this.getLyrics(videoId, title, artist);

      return {
        track,
        related: related.slice(0, 15),
        lyrics: lyrics || undefined,
      };
    } catch (err) {
      console.warn('[YoutubeProvider] getSong failed:', err);
      throw err;
    }
  }

  async getArtist(id: string): Promise<Artist | null> {
    try {
      const searchRes = await this.search(`${id} official songs artist`, 'all', 15);
      const topTracks = searchRes.tracks;
      const artistName = id.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const avatar = topTracks[0]?.thumbnail || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80';

      return {
        id,
        name: artistName,
        avatar,
        monthlyListeners: '3,800,000',
        topTracks,
        albums: searchRes.albums,
        bio: `${artistName} on Sonora.`,
      };
    } catch (err) {
      console.warn('[YoutubeProvider] getArtist failed:', err);
      throw err;
    }
  }

  async getAlbum(id: string): Promise<Album | null> {
    try {
      const searchRes = await this.search(`${id} album full tracks`, 'songs', 10);
      const tracks = searchRes.tracks;
      const albumTitle = id.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const cover = tracks[0]?.thumbnail || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80';
      const totalDuration = tracks.reduce((sum, t) => sum + (t.duration || 180), 0);

      return {
        id,
        title: albumTitle,
        artist: tracks[0]?.artist || 'Various Artists',
        cover,
        releaseYear: new Date().getFullYear(),
        trackCount: tracks.length,
        totalDuration,
        type: 'album',
        tracks,
      };
    } catch (err) {
      console.warn('[YoutubeProvider] getAlbum failed:', err);
      throw err;
    }
  }

  async getPlaylist(id: string): Promise<Playlist | null> {
    try {
      const searchRes = await this.search(`${id} playlist music`, 'songs', 15);
      const tracks = searchRes.tracks;
      const title = id.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const cover = tracks[0]?.thumbnail || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80';

      return {
        id,
        title,
        description: `Sonora playlist collection for ${title}.`,
        cover,
        creator: { name: 'Sonora' },
        trackCount: tracks.length,
        tracks,
      };
    } catch (err) {
      console.warn('[YoutubeProvider] getPlaylist failed:', err);
      throw err;
    }
  }

  async getRecommendations(seedTrackId?: string, genre?: string, limit = 15): Promise<RecommendationResponse> {
    try {
      if (seedTrackId) {
        const songData = await this.getSong(seedTrackId);
        if (songData && songData.related.length > 0) {
          return {
            tracks: songData.related.slice(0, limit),
            seed: { type: 'track', value: songData.track.title },
          };
        }
      }

      const q = genre ? `${genre} popular hit songs playlist` : 'top trending global songs';
      const searchRes = await this.search(q, 'songs', limit);
      return {
        tracks: searchRes.tracks,
        seed: { type: genre ? 'genre' : 'genre', value: genre || 'Top Recommendations' },
      };
    } catch (err) {
      console.warn('[YoutubeProvider] getRecommendations failed:', err);
      throw err;
    }
  }

  async getLyrics(trackId: string, title?: string, artist?: string): Promise<LyricsData | null> {
    if (!title) return null;

    try {
      const cleanTitle = encodeURIComponent(title.split('(')[0].split('-')[0].trim());
      const cleanArtist = encodeURIComponent((artist || '').split(',')[0].trim());
      const url = `https://lrclib.net/api/get?track_name=${cleanTitle}&artist_name=${cleanArtist}`;

      const res = await fetch(url, {
        headers: { 'User-Agent': 'Sonora-Music-Player/1.0' },
      });

      if (!res.ok) return null;
      const data = await res.json();

      if (data.syncedLyrics) {
        const lines: LyricsLine[] = [];
        const rawLines = data.syncedLyrics.split('\n');
        for (const line of rawLines) {
          const match = line.match(/\[(\d+):(\d+\.\d+)\](.*)/);
          if (match) {
            const minutes = parseInt(match[1], 10);
            const seconds = parseFloat(match[2]);
            const text = match[3].trim();
            lines.push({
              time: Math.round((minutes * 60 + seconds) * 10) / 10,
              text,
            });
          }
        }
        if (lines.length > 0) {
          return {
            trackId,
            synced: true,
            lines,
          };
        }
      }

      if (data.plainLyrics) {
        const lines: LyricsLine[] = data.plainLyrics
          .split('\n')
          .filter((l: string) => l.trim().length > 0)
          .map((text: string, idx: number) => ({
            time: idx * 4,
            text: text.trim(),
          }));
        return {
          trackId,
          synced: false,
          lines,
        };
      }

      return null;
    } catch (err) {
      return null;
    }
  }
}
