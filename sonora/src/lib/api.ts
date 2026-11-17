import { Track, Artist, Album, Playlist, SearchResults, LyricsData, HomeFeedSection } from '@/types/music';
import { MOCK_TRACKS, MOCK_ARTISTS, MOCK_ALBUMS, MOCK_PLAYLISTS, MOCK_GENRES, MOCK_LYRICS } from './mockData';

const BASE_URL = '/api/ytmusic';

export async function fetchHomeFeed(): Promise<HomeFeedSection[]> {
  try {
    const res = await fetch(`${BASE_URL}/trending`);
    if (res.ok) {
      const data = await res.json();
      if (data) {
        const sections: HomeFeedSection[] = [];
        if (data.featuredPlaylists?.length > 0) {
          sections.push({
            id: 'made-for-you',
            title: 'Made For You',
            subtitle: 'Personalized playlists based on your listening taste',
            type: 'playlists',
            items: data.featuredPlaylists,
          });
        }
        if (data.trendingTracks?.length > 0) {
          sections.push({
            id: 'trending',
            title: 'Trending Songs',
            subtitle: 'The hottest tracks taking over the charts worldwide',
            type: 'tracks',
            items: data.trendingTracks,
          });
        }
        sections.push({
          id: 'popular-artists',
          title: 'Popular Artists',
          subtitle: 'The voices ruling global airwaves',
          type: 'artists',
          items: MOCK_ARTISTS,
        });
        sections.push({
          id: 'popular-albums',
          title: 'Popular Albums',
          subtitle: 'Full-length records defining modern sound',
          type: 'albums',
          items: MOCK_ALBUMS,
        });
        if (data.newReleases?.length > 0) {
          sections.push({
            id: 'new-releases',
            title: 'New Releases',
            subtitle: 'Fresh arrivals hot off the press',
            type: 'tracks',
            items: data.newReleases,
          });
        }
        if (sections.length > 0) return sections;
      }
    }
  } catch (e) {
    console.warn('Backend API trending fetch error, using fallback data', e);
  }

  // Fallback rich home feed sections
  return [
    {
      id: 'made-for-you',
      title: 'Made For You',
      subtitle: 'Personalized recommendations based on your listening taste',
      type: 'playlists',
      items: MOCK_PLAYLISTS,
    },
    {
      id: 'recently-played',
      title: 'Recently Played',
      subtitle: 'Pick up where you left off',
      type: 'tracks',
      items: MOCK_TRACKS.slice(0, 6),
    },
    {
      id: 'trending',
      title: 'Trending Songs',
      subtitle: 'The hottest tracks taking over the charts worldwide',
      type: 'tracks',
      items: [MOCK_TRACKS[0], MOCK_TRACKS[5], MOCK_TRACKS[7], MOCK_TRACKS[1], MOCK_TRACKS[2]],
    },
    {
      id: 'popular-artists',
      title: 'Popular Artists',
      subtitle: 'The voices ruling global airwaves',
      type: 'artists',
      items: MOCK_ARTISTS,
    },
    {
      id: 'popular-albums',
      title: 'Popular Albums',
      subtitle: 'Full-length records defining modern sound',
      type: 'albums',
      items: MOCK_ALBUMS,
    },
    {
      id: 'new-releases',
      title: 'New Releases',
      subtitle: 'Fresh arrivals hot off the press',
      type: 'tracks',
      items: [MOCK_TRACKS[7], MOCK_TRACKS[5], MOCK_TRACKS[2], MOCK_TRACKS[3]],
    },
  ];
}

export async function searchMusic(query: string, filter?: string): Promise<SearchResults> {
  const q = query.trim();
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
    const params = new URLSearchParams({ q });
    if (filter && filter !== 'all') params.append('filter', filter);
    const res = await fetch(`${BASE_URL}/search?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data && (data.tracks?.length || data.artists?.length || data.albums?.length || data.playlists?.length)) {
        return data;
      }
    }
  } catch (e) {
    console.warn('Backend API search error, using fallback search', e);
  }

  // Fallback local search
  const lowerQ = q.toLowerCase();
  const matchedTracks = MOCK_TRACKS.filter(
    (t) => t.title.toLowerCase().includes(lowerQ) || t.artist.toLowerCase().includes(lowerQ)
  );
  const matchedArtists = MOCK_ARTISTS.filter((a) => a.name.toLowerCase().includes(lowerQ));
  const matchedAlbums = MOCK_ALBUMS.filter(
    (al) => al.title.toLowerCase().includes(lowerQ) || al.artist.toLowerCase().includes(lowerQ)
  );
  const matchedPlaylists = MOCK_PLAYLISTS.filter(
    (p) => p.title.toLowerCase().includes(lowerQ) || p.description?.toLowerCase().includes(lowerQ)
  );

  let topResult: SearchResults['topResult'];
  if (matchedTracks.length > 0) {
    topResult = { type: 'track', item: matchedTracks[0] };
  } else if (matchedArtists.length > 0) {
    topResult = { type: 'artist', item: matchedArtists[0] };
  } else if (matchedAlbums.length > 0) {
    topResult = { type: 'album', item: matchedAlbums[0] };
  } else if (matchedPlaylists.length > 0) {
    topResult = { type: 'playlist', item: matchedPlaylists[0] };
  }

  return {
    query: q,
    tracks: matchedTracks,
    artists: matchedArtists,
    albums: matchedAlbums,
    playlists: matchedPlaylists,
    topResult,
  };
}

export async function fetchArtist(id: string): Promise<Artist | null> {
  try {
    const res = await fetch(`${BASE_URL}/artist/${encodeURIComponent(id)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.name) return data;
    }
  } catch (e) {
    console.warn(`Backend fetchArtist failed for ${id}, using fallback`, e);
  }

  const found = MOCK_ARTISTS.find((a) => a.id === id || a.name.toLowerCase() === id.toLowerCase());
  if (found) return found;

  return {
    id,
    name: decodeURIComponent(id).replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    avatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1600&auto=format&fit=crop&q=80',
    monthlyListeners: '45,210,990',
    bio: 'Verified Artist on Sonora Web Player.',
    topTracks: MOCK_TRACKS.slice(0, 5),
    albums: MOCK_ALBUMS.slice(0, 2),
    singles: MOCK_ALBUMS.slice(2, 4),
    relatedArtists: MOCK_ARTISTS.filter((a) => a.id !== id),
  };
}

export async function fetchAlbum(id: string): Promise<Album | null> {
  try {
    const res = await fetch(`${BASE_URL}/album/${encodeURIComponent(id)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.title) return data;
    }
  } catch (e) {
    console.warn(`Backend fetchAlbum failed for ${id}, using fallback`, e);
  }

  const found = MOCK_ALBUMS.find((a) => a.id === id);
  if (found) return found;

  return {
    id,
    title: decodeURIComponent(id).replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    artist: 'Various Artists',
    cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    releaseYear: 2024,
    trackCount: 8,
    totalDuration: 1680,
    tracks: MOCK_TRACKS.slice(0, 8),
    type: 'album',
  };
}

export async function fetchPlaylist(id: string): Promise<Playlist | null> {
  try {
    const res = await fetch(`${BASE_URL}/playlist/${encodeURIComponent(id)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.title) return data;
    }
  } catch (e) {
    console.warn(`Backend fetchPlaylist failed for ${id}, using fallback`, e);
  }

  const found = MOCK_PLAYLISTS.find((p) => p.id === id);
  if (found) return found;

  return {
    id,
    title: decodeURIComponent(id).replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    description: 'A curated music journey on Sonora Web Player.',
    cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    creator: { name: 'Sonora' },
    trackCount: MOCK_TRACKS.length,
    tracks: MOCK_TRACKS,
  };
}

export async function fetchLyrics(trackId: string, title?: string, artist?: string): Promise<LyricsData | null> {
  try {
    const params = new URLSearchParams({ trackId });
    if (title) params.append('title', title);
    if (artist) params.append('artist', artist);

    const res = await fetch(`${BASE_URL}/lyrics?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.lines?.length) return data;
    }
  } catch (e) {
    // fallback
  }

  try {
    const songRes = await fetch(`${BASE_URL}/song/${encodeURIComponent(trackId)}`);
    if (songRes.ok) {
      const songData = await songRes.json();
      if (songData && songData.lyrics) return songData.lyrics;
    }
  } catch (e) {
    // fallback
  }

  if (MOCK_LYRICS[trackId]) {
    return MOCK_LYRICS[trackId];
  }

  // Generative default lyrics for demo
  return {
    trackId,
    synced: true,
    lines: [
      { time: 0, text: '♪ (Instrumental Intro) ♪' },
      { time: 10, text: 'Feel the rhythm flowing through the night' },
      { time: 16, text: 'Lost in the harmony, holding the light' },
      { time: 22, text: 'Every melody taking us high' },
      { time: 28, text: 'Underneath the endless starry sky' },
      { time: 35, text: 'Listen to the sound of freedom' },
      { time: 42, text: 'Where the music never ends' },
      { time: 48, text: 'Turn the volume up and dive into the beat' },
      { time: 55, text: 'Sonora playing on repeat' },
    ],
  };
}
