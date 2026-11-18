import {
  MusicProvider,
  TrendingResponse,
  SongDetailsResponse,
  RecommendationResponse,
  HomeShelves,
} from './types';
import {
  FALLBACK_TRACKS,
  FALLBACK_ARTISTS,
  FALLBACK_ALBUMS,
  FALLBACK_PLAYLISTS,
  FALLBACK_LYRICS,
  INDONESIAN_HITS,
  GLOBAL_TOP_50,
  KPOP_DAEBAK,
  CHILL_LOFI,
  ROCK_CLASSICS,
} from './fallbackData';
import { Track, Artist, Album, Playlist, SearchResults, LyricsData, HomeFeedSection } from '@/types/music';
import {
  generateDailyMixes,
  generateDiscoverWeekly,
  generateRadioStation,
  RadioStationResponse,
} from '@/lib/recommendation';

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
    const topTracks = FALLBACK_TRACKS.slice(0, 15);
    const trendingTracks = FALLBACK_TRACKS.slice(15, 30);
    const quickPicks = [
      FALLBACK_TRACKS[0],  // Satu Bulan (Bernadya)
      FALLBACK_TRACKS[20], // Die With A Smile (Lady Gaga, Bruno Mars)
      FALLBACK_TRACKS[3],  // Gala Bunga Matahari (Sal Priadi)
      FALLBACK_TRACKS[21], // Espresso (Sabrina Carpenter)
      FALLBACK_TRACKS[24], // BIRDS OF A FEATHER (Billie Eilish)
      FALLBACK_TRACKS[27], // Blinding Lights (The Weeknd)
    ];

    const hipHopBeats = FALLBACK_TRACKS.filter(t =>
      t.artist.includes('Kendrick') ||
      t.artist.includes('Drake') ||
      t.artist.includes('Travis') ||
      t.artist.includes('Eminem')
    ).slice(0, 15);

    const rbSoul = FALLBACK_TRACKS.filter(t =>
      t.artist.includes('SZA') ||
      t.artist.includes('Bruno Mars') ||
      t.title.includes('All The Stars')
    ).slice(0, 15);

    const electronicDance = FALLBACK_TRACKS.filter(t =>
      t.artist.includes('Daft Punk') ||
      t.artist.includes('Avicii') ||
      t.title.includes('Starboy')
    ).slice(0, 10);

    const moodChill = [
      FALLBACK_TRACKS[0],  // Satu Bulan
      FALLBACK_TRACKS[3],  // Gala Bunga Matahari
      FALLBACK_TRACKS[11], // Rayuan Perempuan Gila
      FALLBACK_TRACKS[24], // Birds of a Feather
      ...CHILL_LOFI,
    ].slice(0, 15);

    const moodEnergy = [
      FALLBACK_TRACKS[20], // Die With A Smile
      FALLBACK_TRACKS[21], // Espresso
      FALLBACK_TRACKS[44], // Supernova (aespa)
      FALLBACK_TRACKS[48], // Dynamite (BTS)
      FALLBACK_TRACKS[65], // Numb (Linkin Park)
      FALLBACK_TRACKS[68], // Don't Stop Me Now (Queen)
      FALLBACK_TRACKS[74], // FE!N (Travis Scott)
    ];

    const moodFocus = [
      ...CHILL_LOFI,
      FALLBACK_TRACKS[13], // Bertaut
      FALLBACK_TRACKS[8],  // Evaluasi
    ].slice(0, 15);

    const dailyMixes = generateDailyMixes();
    const discoverWeekly = generateDiscoverWeekly().tracks;

    const shelves: HomeShelves = {
      trendingNow: topTracks,
      popularSongs: trendingTracks,
      newReleases: FALLBACK_ALBUMS,
      quickPicks,
      dailyMixes,
      discoverWeekly,
      indonesianHits: INDONESIAN_HITS,
      globalTop50: GLOBAL_TOP_50,
      kpopDaebak: KPOP_DAEBAK,
      rockClassics: ROCK_CLASSICS,
      chillLofi: CHILL_LOFI,
      hipHopBeats,
      rbSoul,
      electronicDance,
      moodChill,
      moodEnergy,
      moodFocus,
    };

    const sections: HomeFeedSection[] = [
      {
        id: 'sec_quick_picks',
        title: 'Quick Picks',
        subtitle: 'Listen back to your favorite tunes',
        type: 'tracks',
        items: quickPicks,
      },
      {
        id: 'sec_indo_hits',
        title: 'Indonesian Top Hits & Viral',
        subtitle: 'Lagu terpopuler dari Bernadya, Sal Priadi, Mahalini, Hindia, Nadin Amizah, Tulus, Sheila On 7',
        type: 'tracks',
        items: INDONESIAN_HITS,
      },
      {
        id: 'sec_global_top',
        title: 'Global Top 50',
        subtitle: 'The biggest hits across the world right now',
        type: 'tracks',
        items: GLOBAL_TOP_50,
      },
      {
        id: 'sec_kpop_daebak',
        title: 'K-Pop Daebak!',
        subtitle: 'The best of K-Pop: NewJeans, BTS, BLACKPINK, aespa, LE SSERAFIM, ILLIT',
        type: 'tracks',
        items: KPOP_DAEBAK,
      },
      {
        id: 'sec_trending_now',
        title: 'Trending Now',
        subtitle: 'Trending songs catching fire today',
        type: 'tracks',
        items: topTracks,
      },
      {
        id: 'sec_popular_songs',
        title: 'Popular Songs',
        subtitle: 'All-time crowd favorites',
        type: 'tracks',
        items: trendingTracks,
      },
      {
        id: 'sec_discover_weekly',
        title: 'Discover Weekly',
        subtitle: 'Fresh music discoveries picked just for you',
        type: 'tracks',
        items: discoverWeekly,
      },
      {
        id: 'sec_chill_lofi',
        title: 'Chill Lo-Fi Beats',
        subtitle: 'Calm beats to study, code and unwind',
        type: 'tracks',
        items: CHILL_LOFI,
      },
      {
        id: 'sec_rock_classics',
        title: 'Rock & Alternative Classics',
        subtitle: 'Legendary anthems and modern rock hits',
        type: 'tracks',
        items: ROCK_CLASSICS,
      },
      {
        id: 'sec_hiphop_beats',
        title: 'Hip-Hop & Rap Heavyweights',
        subtitle: 'Kendrick Lamar, Drake, Travis Scott, Eminem',
        type: 'tracks',
        items: hipHopBeats,
      },
      {
        id: 'sec_rb_soul',
        title: 'R&B & Soul Essentials',
        subtitle: 'Smooth vocals and heartfelt grooves',
        type: 'tracks',
        items: rbSoul,
      },
      {
        id: 'sec_electronic_dance',
        title: 'Electronic & Dance Anthems',
        subtitle: 'Daft Punk, Avicii and pulse-pounding club anthems',
        type: 'tracks',
        items: electronicDance,
      },
      {
        id: 'sec_mood_chill',
        title: 'Mellow & Chill Moods',
        subtitle: 'Gentle melodies to soothe your soul',
        type: 'tracks',
        items: moodChill,
      },
      {
        id: 'sec_mood_energy',
        title: 'High Energy & Workout',
        subtitle: 'Pump up your heartbeat with intense rhythm',
        type: 'tracks',
        items: moodEnergy,
      },
      {
        id: 'sec_mood_focus',
        title: 'Deep Focus & Coding',
        subtitle: 'Instrumental tunes designed for deep concentration',
        type: 'tracks',
        items: moodFocus,
      },
      {
        id: 'sec_featured_playlists',
        title: 'Featured Playlists',
        subtitle: 'Hand-picked by Sonora editors',
        type: 'playlists',
        items: FALLBACK_PLAYLISTS,
      },
      {
        id: 'sec_new_releases',
        title: 'Popular Albums & Releases',
        subtitle: 'New albums and singles to explore',
        type: 'albums',
        items: FALLBACK_ALBUMS,
      },
    ];

    return {
      topTracks,
      trendingTracks,
      newReleases: FALLBACK_ALBUMS,
      quickPicks,
      featuredPlaylists: FALLBACK_PLAYLISTS,
      shelves,
      sections,
    };
  }

  async getSearchSuggestions(query: string): Promise<string[]> {
    const q = (query || '').trim().toLowerCase();
    if (!q) {
      return ['Bernadya', 'Sal Priadi', 'Taylor Swift', 'NewJeans', 'Lofi Girl', 'Coldplay'];
    }

    const suggestions = new Set<string>();

    // 1. Check artists
    for (const artist of FALLBACK_ARTISTS) {
      if (artist.name.toLowerCase().includes(q)) {
        suggestions.add(artist.name);
      }
    }

    // 2. Check tracks
    for (const track of FALLBACK_TRACKS) {
      if (track.title.toLowerCase().includes(q)) {
        suggestions.add(track.title);
      }
      if (`${track.title} ${track.artist}`.toLowerCase().includes(q)) {
        suggestions.add(`${track.title} - ${track.artist}`);
      }
    }

    // 3. Check albums & playlists
    for (const album of FALLBACK_ALBUMS) {
      if (album.title.toLowerCase().includes(q)) {
        suggestions.add(album.title);
      }
    }
    for (const pl of FALLBACK_PLAYLISTS) {
      if (pl.title.toLowerCase().includes(q)) {
        suggestions.add(pl.title);
      }
    }

    return Array.from(suggestions).slice(0, 8);
  }

  async getRadioStation(seedTrackId: string, limit = 30): Promise<RadioStationResponse | null> {
    return generateRadioStation(seedTrackId, limit);
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
