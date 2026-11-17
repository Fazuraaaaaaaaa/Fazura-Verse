import {
  MusicProvider,
  TrendingResponse,
  SongDetailsResponse,
  RecommendationResponse,
} from './types';
import {
  FALLBACK_TRACKS,
  FALLBACK_ARTISTS,
  FALLBACK_ALBUMS,
  FALLBACK_PLAYLISTS,
  FALLBACK_LYRICS,
} from './fallbackData';
import { Track, Artist, Album, Playlist, SearchResults, LyricsData } from '@/types/music';

export class FallbackProvider implements MusicProvider {
  name = 'fallback';

  async search(query: string, filter?: string, limit = 20): Promise<SearchResults> {
    const q = (query || '').trim().toLowerCase();
    
    if (!q) {
      return {
        query: '',
        tracks: FALLBACK_TRACKS.slice(0, 10),
        artists: FALLBACK_ARTISTS.slice(0, 6),
        albums: FALLBACK_ALBUMS.slice(0, 6),
        playlists: FALLBACK_PLAYLISTS.slice(0, 6),
      };
    }

    // Match tracks
    const matchedTracks = FALLBACK_TRACKS.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.artist.toLowerCase().includes(q) ||
      (t.album && t.album.toLowerCase().includes(q))
    );

    // Match artists
    const matchedArtists = FALLBACK_ARTISTS.filter(a =>
      a.name.toLowerCase().includes(q) ||
      (a.bio && a.bio.toLowerCase().includes(q))
    );

    // Match albums
    const matchedAlbums = FALLBACK_ALBUMS.filter(al =>
      al.title.toLowerCase().includes(q) ||
      al.artist.toLowerCase().includes(q)
    );

    // Match playlists
    const matchedPlaylists = FALLBACK_PLAYLISTS.filter(p =>
      p.title.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q))
    );

    // Pick top result
    let topResult: SearchResults['topResult'] = undefined;
    const exactArtist = matchedArtists.find(a => a.name.toLowerCase() === q);
    const exactTrack = matchedTracks.find(t => t.title.toLowerCase() === q);

    if (exactArtist) {
      topResult = { type: 'artist', item: exactArtist };
    } else if (exactTrack) {
      topResult = { type: 'track', item: exactTrack };
    } else if (matchedArtists.length > 0 && (!matchedTracks.length || matchedArtists[0].name.toLowerCase().startsWith(q))) {
      topResult = { type: 'artist', item: matchedArtists[0] };
    } else if (matchedTracks.length > 0) {
      topResult = { type: 'track', item: matchedTracks[0] };
    } else if (matchedAlbums.length > 0) {
      topResult = { type: 'album', item: matchedAlbums[0] };
    } else if (matchedPlaylists.length > 0) {
      topResult = { type: 'playlist', item: matchedPlaylists[0] };
    }

    const requestedFilter = (filter || 'all').toLowerCase();

    return {
      query,
      tracks: (requestedFilter === 'all' || requestedFilter === 'songs' || requestedFilter === 'tracks')
        ? matchedTracks.slice(0, limit)
        : [],
      artists: (requestedFilter === 'all' || requestedFilter === 'artists')
        ? matchedArtists.slice(0, limit)
        : [],
      albums: (requestedFilter === 'all' || requestedFilter === 'albums')
        ? matchedAlbums.slice(0, limit)
        : [],
      playlists: (requestedFilter === 'all' || requestedFilter === 'playlists')
        ? matchedPlaylists.slice(0, limit)
        : [],
      topResult,
    };
  }

  async getTrending(): Promise<TrendingResponse> {
    const topTracks = FALLBACK_TRACKS.slice(0, 10);
    const trendingTracks = FALLBACK_TRACKS.slice(10, 20);
    const quickPicks = [
      FALLBACK_TRACKS[3], // Espresso
      FALLBACK_TRACKS[5], // Birds of a Feather
      FALLBACK_TRACKS[0], // Blinding Lights
      FALLBACK_TRACKS[13], // Not Like Us
      FALLBACK_TRACKS[18], // Do I Wanna Know
      FALLBACK_TRACKS[24], // Magnetic
    ];

    return {
      topTracks,
      trendingTracks,
      newReleases: FALLBACK_ALBUMS,
      quickPicks,
      featuredPlaylists: FALLBACK_PLAYLISTS,
    };
  }

  async getSong(id: string): Promise<SongDetailsResponse | null> {
    const targetId = id.trim();
    let track = FALLBACK_TRACKS.find(t => t.id === targetId || t.youtubeId === targetId);

    if (!track) {
      // Dynamic fallback so any song ID still plays safely
      track = {
        id: targetId,
        youtubeId: targetId,
        title: `Track #${targetId.slice(0, 6)}`,
        artist: 'Featured Artist',
        album: 'Single',
        duration: 210,
        durationFormatted: '3:30',
        thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
        views: '1,200,000',
        releaseDate: '2024',
      };
    }

    // Related songs: same artist or other popular songs excluding current
    const related = FALLBACK_TRACKS.filter(t => t.id !== track!.id).slice(0, 10);
    const lyrics = FALLBACK_LYRICS[track.id] || this.generateFallbackLyrics(track);

    return {
      track,
      related,
      lyrics,
    };
  }

  async getArtist(id: string): Promise<Artist | null> {
    const targetId = id.trim().toLowerCase();
    let artist = FALLBACK_ARTISTS.find(a =>
      a.id.toLowerCase() === targetId ||
      a.name.toLowerCase() === targetId ||
      a.name.toLowerCase().replace(/[^a-z0-9]/g, '') === targetId.replace(/[^a-z0-9]/g, '')
    );

    if (!artist) {
      const topTracks = FALLBACK_TRACKS.filter(t =>
        t.artist.toLowerCase().includes(targetId)
      );
      artist = {
        id: targetId,
        name: id.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        avatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
        monthlyListeners: '2,500,000',
        bio: 'Artist profile on Sonora.',
        topTracks: topTracks.length > 0 ? topTracks : FALLBACK_TRACKS.slice(0, 5),
        albums: FALLBACK_ALBUMS.slice(0, 2),
        isFollowed: false,
      };
    }

    return artist;
  }

  async getAlbum(id: string): Promise<Album | null> {
    const targetId = id.trim().toLowerCase();
    let album = FALLBACK_ALBUMS.find(a =>
      a.id.toLowerCase() === targetId ||
      a.title.toLowerCase() === targetId
    );

    if (!album) {
      album = {
        id: targetId,
        title: id.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        artist: 'Various Artists',
        cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80',
        releaseYear: 2024,
        trackCount: 5,
        totalDuration: 1050,
        type: 'album',
        tracks: FALLBACK_TRACKS.slice(0, 5),
      };
    }

    return album;
  }

  async getPlaylist(id: string): Promise<Playlist | null> {
    const targetId = id.trim().toLowerCase();
    let playlist = FALLBACK_PLAYLISTS.find(p =>
      p.id.toLowerCase() === targetId ||
      p.title.toLowerCase() === targetId
    );

    if (!playlist) {
      playlist = {
        id: targetId,
        title: id.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        description: 'Curated mix on Sonora.',
        cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
        creator: { name: 'Sonora' },
        trackCount: 8,
        tracks: FALLBACK_TRACKS.slice(0, 8),
      };
    }

    return playlist;
  }

  async getRecommendations(seedTrackId?: string, genre?: string, limit = 15): Promise<RecommendationResponse> {
    let pool = [...FALLBACK_TRACKS];

    if (seedTrackId) {
      const seedTrack = FALLBACK_TRACKS.find(t => t.id === seedTrackId);
      if (seedTrack) {
        pool = pool.filter(t => t.id !== seedTrackId);
        // Prioritize same artist
        pool.sort((a, b) => {
          if (a.artist === seedTrack.artist) return -1;
          if (b.artist === seedTrack.artist) return 1;
          return 0;
        });
        return {
          tracks: pool.slice(0, limit),
          seed: { type: 'track', value: seedTrack.title },
        };
      }
    }

    if (genre) {
      const g = genre.toLowerCase();
      const genreMatches = pool.filter(t => {
        if (g.includes('pop')) return t.artist.includes('Sabrina') || t.artist.includes('Taylor') || t.artist.includes('Billie') || t.artist.includes('Weeknd');
        if (g.includes('rap') || g.includes('hip')) return t.artist.includes('Kendrick') || t.artist.includes('Drake') || t.artist.includes('Travis');
        if (g.includes('rock') || g.includes('indie')) return t.artist.includes('Arctic') || t.artist.includes('Linkin') || t.artist.includes('Hozier');
        if (g.includes('k-pop') || g.includes('kpop')) return t.artist.includes('BTS') || t.artist.includes('NewJeans') || t.artist.includes('ILLIT');
        if (g.includes('lofi') || g.includes('chill')) return t.artist.includes('Lofi') || t.artist.includes('idealism') || t.artist.includes('Kupla');
        return true;
      });

      if (genreMatches.length > 0) {
        return {
          tracks: genreMatches.slice(0, limit),
          seed: { type: 'genre', value: genre },
        };
      }
    }

    // Default recommendation: shuffle pool
    const shuffled = pool.sort(() => 0.5 - Math.random());
    return {
      tracks: shuffled.slice(0, limit),
      seed: { type: 'genre', value: 'Today\'s Mix' },
    };
  }

  async getLyrics(trackId: string, title?: string, artist?: string): Promise<LyricsData | null> {
    if (FALLBACK_LYRICS[trackId]) {
      return FALLBACK_LYRICS[trackId];
    }
    const track = FALLBACK_TRACKS.find(t => t.id === trackId);
    return this.generateFallbackLyrics(track || {
      id: trackId,
      youtubeId: trackId,
      title: title || 'Song',
      artist: artist || 'Artist',
      duration: 180,
      thumbnail: '',
    });
  }

  private generateFallbackLyrics(track: Track): LyricsData {
    return {
      trackId: track.id,
      synced: true,
      lines: [
        { time: 5, text: `♪ ${track.title} by ${track.artist} ♪` },
        { time: 12, text: "Listen to the melody flowing through the sound" },
        { time: 18, text: "Lost in the rhythm as the world turns around" },
        { time: 25, text: "Feel every beat, every heartbeat so loud" },
        { time: 32, text: "We're singing along right now with the crowd" },
        { time: 40, text: "Oh, let the music take you all the way" },
        { time: 48, text: "From the night into the light of day" },
        { time: 56, text: `Playing ${track.title} on Sonora` },
      ],
    };
  }
}
