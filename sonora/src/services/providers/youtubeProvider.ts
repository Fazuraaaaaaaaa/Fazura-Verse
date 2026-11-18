import {
  MusicProvider,
  TrendingResponse,
  SongDetailsResponse,
  RecommendationResponse,
} from './types';
import { Track, Artist, Album, Playlist, SearchResults, LyricsData, LyricsLine } from '@/types/music';
import { formatDuration } from '@/lib/utils';
import { RadioStationResponse } from '@/lib/recommendation';

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

  async search(query: string, filter = 'all', limit = 50): Promise<SearchResults> {
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
      const requestedFilter = (filter || 'all').toLowerCase();
      const songsFilterParam = 'EgWKAQIIAWoQEAMQBBAJEAoQBRAREBAQFA%3D%3D'; // Official YouTube Music Songs filter

      // Run parallel requests: General search and dedicated Songs filter search
      const [mainRes, songsRes] = await Promise.all([
        fetch('https://www.youtube.com/youtubei/v1/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': this.userAgent,
          },
          body: JSON.stringify({
            context: {
              client: {
                clientName: 'WEB_REMIX',
                clientVersion: '1.20240101.01.00',
                hl: 'en',
                gl: 'US',
              },
            },
            query: q,
          }),
        }).then(r => r.ok ? r.json() : null).catch(() => null),

        fetch('https://www.youtube.com/youtubei/v1/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': this.userAgent,
          },
          body: JSON.stringify({
            context: {
              client: {
                clientName: 'WEB_REMIX',
                clientVersion: '1.20240101.01.00',
                hl: 'en',
                gl: 'US',
              },
            },
            query: q,
            params: songsFilterParam,
          }),
        }).then(r => r.ok ? r.json() : null).catch(() => null),
      ]);

      const tracks: Track[] = [];
      const artists: Artist[] = [];
      const albums: Album[] = [];
      const playlists: Playlist[] = [];
      const seenTrackIds = new Set<string>();
      let topResult: SearchResults['topResult'] = undefined;

      // 1. Process main search response
      const mainTabs = mainRes?.contents?.tabbedSearchResultsRenderer?.tabs;
      const mainSections = mainTabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents || [];

      for (const s of mainSections) {
        if (s.musicCardShelfRenderer) {
          const card = s.musicCardShelfRenderer;
          const title = card.title?.runs?.map((r: any) => r.text).join('') || '';
          const subtitle = card.subtitle?.runs?.map((r: any) => r.text).join('') || '';
          const avatar = card.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails?.slice(-1)[0]?.url || '';
          const isArtist = subtitle.toLowerCase().includes('artist');
          const isAlbum = subtitle.toLowerCase().includes('album') || subtitle.toLowerCase().includes('single');

          if (isArtist) {
            const art: Artist = {
              id: `art_${title.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
              name: title,
              avatar,
              monthlyListeners: subtitle.split('•')[1]?.trim() || '500K monthly listeners',
            };
            artists.push(art);
            topResult = { type: 'artist', item: art };
          }

          if (card.contents) {
            for (const c of card.contents) {
              const item = c.musicResponsiveListItemRenderer;
              if (!item) continue;
              const col0 = item.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.map((r: any) => r.text).join('') || '';
              const videoId = item.overlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer?.playNavigationEndpoint?.watchEndpoint?.videoId;
              const thumb = item.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails?.slice(-1)[0]?.url || avatar;

              if (videoId && col0 && !seenTrackIds.has(videoId)) {
                seenTrackIds.add(videoId);
                tracks.push({
                  id: videoId,
                  youtubeId: videoId,
                  title: col0,
                  artist: title,
                  artists: [{ name: title }],
                  duration: 210,
                  durationFormatted: '3:30',
                  thumbnail: thumb,
                });
              }
            }
          }
        }

        const item = s.itemSectionRenderer?.contents?.[0]?.musicResponsiveListItemRenderer;
        if (item) {
          const col0Runs = item.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs || [];
          const col1Runs = item.flexColumns?.[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs || [];
          const title = col0Runs.map((r: any) => r.text).join('');
          const sub = col1Runs.map((r: any) => r.text).join('');
          const subParts = sub.split('•').map((p: string) => p.trim());
          const itemType = (subParts[0] || '').toLowerCase();

          // Strictly filter out non-music items (podcasts, episodes, news)
          if (itemType.includes('episode') || itemType.includes('podcast')) {
            continue;
          }

          const thumb = item.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails?.slice(-1)[0]?.url || '';
          const playNav = item.overlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer?.playNavigationEndpoint;
          const videoId = playNav?.watchEndpoint?.videoId;
          const browseId = item.navigationEndpoint?.browseEndpoint?.browseId;

          if ((itemType === 'song' || itemType === 'video') && videoId && !seenTrackIds.has(videoId)) {
            const rawArtist = subParts[1] || 'Unknown Artist';
            const durationFormatted = subParts[subParts.length - 1]?.match(/^\d+:\d+$/) ? subParts[subParts.length - 1] : '3:30';
            const duration = this.parseDurationToSeconds(durationFormatted);

            // Filter out videos that are not music length (under 45s or over 12m)
            if (duration >= 45 && duration <= 720) {
              seenTrackIds.add(videoId);
              tracks.push({
                id: videoId,
                youtubeId: videoId,
                title,
                artist: rawArtist,
                artists: [{ name: rawArtist }],
                duration,
                durationFormatted,
                thumbnail: thumb,
                views: subParts.find((p: string) => p.includes('views'))?.replace(/\s*views?/i, '') || '',
              });
            }
          } else if (itemType === 'artist') {
            if (!artists.some(a => a.name.toLowerCase() === title.toLowerCase())) {
              artists.push({
                id: browseId || `art_${title.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
                name: title,
                avatar: thumb,
                monthlyListeners: subParts[1] || '1M monthly audience',
              });
            }
          } else if (itemType === 'album' || itemType === 'single' || itemType === 'ep') {
            albums.push({
              id: browseId || `alb_${title.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
              title,
              artist: subParts[1] || 'Artist',
              cover: thumb,
              releaseYear: parseInt(subParts[2]?.replace(/[^0-9]/g, '') || '', 10) || new Date().getFullYear(),
              trackCount: 1,
              tracks: [],
              type: itemType as any,
            });
          } else if (itemType === 'playlist') {
            playlists.push({
              id: browseId || `pl_${title.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
              title,
              cover: thumb,
              creator: { name: subParts[1] || 'YouTube Music' },
              trackCount: parseInt(subParts[2]?.replace(/[^0-9]/g, '') || '20', 10) || 20,
              tracks: [],
            });
          }
        }
      }

      // 2. Process dedicated pure songs response
      const songsTabs = songsRes?.contents?.tabbedSearchResultsRenderer?.tabs;
      const songsSections = songsTabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents || [];
      const songsShelf = songsSections[0]?.musicShelfRenderer?.contents || [];

      for (const c of songsShelf) {
        const item = c.musicResponsiveListItemRenderer;
        if (!item) continue;
        const title = item.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.map((r: any) => r.text).join('') || '';
        const sub = item.flexColumns?.[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.map((r: any) => r.text).join('') || '';
        const videoId = item.overlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer?.playNavigationEndpoint?.watchEndpoint?.videoId;
        const thumb = item.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails?.slice(-1)[0]?.url || '';
        const subParts = sub.split('•').map((p: string) => p.trim());
        const rawArtist = subParts[0] || 'Unknown Artist';
        const albumName = subParts.length > 2 ? subParts[1] : '';
        const durationFormatted = subParts[subParts.length - 1]?.match(/^\d+:\d+$/) ? subParts[subParts.length - 1] : '3:30';
        const duration = this.parseDurationToSeconds(durationFormatted);

        if (videoId && !seenTrackIds.has(videoId) && duration >= 45 && duration <= 720) {
          seenTrackIds.add(videoId);
          tracks.push({
            id: videoId,
            youtubeId: videoId,
            title,
            artist: rawArtist,
            artists: [{ name: rawArtist }],
            album: albumName || undefined,
            duration,
            durationFormatted,
            thumbnail: thumb,
            views: '',
          });
        }
      }

      // 3. Fallback to standard search if zero tracks returned
      if (tracks.length === 0) {
        try {
          const resFallback = await fetch('https://www.youtube.com/youtubei/v1/search', {
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
              query: `${q} music audio song`,
            }),
          });

          if (resFallback.ok) {
            const dataF = await resFallback.json();
            const contentsF =
              dataF?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];
            const itemSectionF = contentsF.find((c: any) => c.itemSectionRenderer)?.itemSectionRenderer;
            const rawItemsF = itemSectionF?.contents || [];

            for (const item of rawItemsF) {
              if (item.videoRenderer) {
                const v = item.videoRenderer;
                const videoId = v.videoId;
                if (!videoId || seenTrackIds.has(videoId)) continue;

                const rawTitle = v.title?.runs?.map((r: any) => r.text).join('') || 'Unknown Song';
                const rawChannel = v.ownerText?.runs?.map((r: any) => r.text).join('') || '';
                const { title, artist } = this.cleanTitleAndArtist(rawTitle, rawChannel);
                const durationFormatted = v.lengthText?.simpleText || '3:30';
                const duration = this.parseDurationToSeconds(durationFormatted);

                // Exclude non-music long videos
                if (duration >= 45 && duration <= 600) {
                  seenTrackIds.add(videoId);
                  tracks.push({
                    id: videoId,
                    youtubeId: videoId,
                    title,
                    artist,
                    artists: [{ name: artist }],
                    duration,
                    durationFormatted,
                    thumbnail:
                      v.thumbnail?.thumbnails?.[v.thumbnail.thumbnails.length - 1]?.url ||
                      `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
                    views: v.viewCountText?.simpleText?.replace(/\s*views?/i, '') || '',
                  });
                }
              }
            }
          }
        } catch {
          // ignore
        }
      }

      // Group into albums / singles simulation if empty
      if (albums.length === 0) {
        const seenAlbums = new Set<string>();
        for (const t of tracks) {
          const albumName = t.album || `${t.title} - Single`;
          if (!seenAlbums.has(albumName) && albums.length < 6) {
            seenAlbums.add(albumName);
            albums.push({
              id: `alb_${t.id}`,
              title: albumName,
              artist: t.artist,
              cover: t.thumbnail,
              releaseYear: new Date().getFullYear(),
              trackCount: 1,
              tracks: [t],
              type: t.album ? 'album' : 'single',
            });
          }
        }
      }

      // Determine top result
      if (!topResult) {
        if (artists.length > 0 && artists[0].name.toLowerCase().includes(q.toLowerCase())) {
          topResult = { type: 'artist', item: artists[0] };
        } else if (tracks.length > 0) {
          topResult = { type: 'track', item: tracks[0] };
        }
      }

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
      const cleanQuery = id.replace(/^art_/, '').replace(/[-_]/g, ' ').trim();
      const searchRes = await this.search(`${cleanQuery}`, 'all', 20);
      const topTracks = searchRes.tracks;
      const artistName = searchRes.artists.find(a => a.name.toLowerCase() === cleanQuery.toLowerCase())?.name ||
        cleanQuery.replace(/\b\w/g, c => c.toUpperCase());
      const avatar = searchRes.artists.find(a => a.name.toLowerCase() === cleanQuery.toLowerCase())?.avatar ||
        topTracks[0]?.thumbnail || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80';

      return {
        id,
        name: artistName,
        avatar,
        monthlyListeners: searchRes.artists[0]?.monthlyListeners || '3,800,000 monthly listeners',
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

  async getSearchSuggestions(query: string): Promise<string[]> {
    const q = (query || '').trim();
    if (!q) return [];

    try {
      const url = `https://suggestqueries-clients6.youtube.com/complete/search?client=youtube&hl=en&gl=US&q=${encodeURIComponent(q)}`;
      const res = await fetch(url, { headers: { 'User-Agent': this.userAgent } });
      if (!res.ok) return [];

      const text = await res.text();
      const json = JSON.parse(text.replace(/^[^\(]*\(/, '').replace(/\)$/, ''));
      if (Array.isArray(json) && Array.isArray(json[1])) {
        const rawSuggestions = json[1].map((item: any) => item[0]).filter((s: any) => typeof s === 'string');
        const clean = Array.from(new Set(rawSuggestions.map(s => (s as string).trim()))).slice(0, 10);
        return clean;
      }
      return [];
    } catch (err) {
      return [];
    }
  }

  async getRadioStation(seedTrackId: string, limit = 25): Promise<RadioStationResponse | null> {
    try {
      const songData = await this.getSong(seedTrackId);
      if (songData && songData.track) {
        const tracks = [songData.track, ...songData.related.slice(0, limit - 1)];
        return {
          seedTrack: songData.track,
          stationName: `${songData.track.title} Radio`,
          description: `An endless radio station seeded by ${songData.track.artist}.`,
          cover: songData.track.thumbnail,
          tracks,
        };
      }
      return null;
    } catch (err) {
      return null;
    }
  }
}
