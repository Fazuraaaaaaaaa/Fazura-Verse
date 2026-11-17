import { Track, Artist, Album, Playlist, SearchResults, LyricsData, HomeFeedSection } from '@/types/music';
import { MOCK_TRACKS, MOCK_ARTISTS, MOCK_ALBUMS, MOCK_PLAYLISTS, MOCK_GENRES, MOCK_LYRICS } from './mockData';

const BASE_URL = '/api/ytmusic';

export const INDONESIAN_HITS: Track[] = [
  {
    id: 'zO_85EwV-J0',
    youtubeId: 'zO_85EwV-J0',
    title: 'Satu Bulan',
    artist: 'Bernadya',
    album: 'Sialnya, Hidup Harus Tetap Berjalan',
    duration: 194,
    durationFormatted: '3:14',
    thumbnail: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop&q=80',
    views: '125M',
    releaseDate: '2024',
  },
  {
    id: '0qWvQeO43c0',
    youtubeId: '0qWvQeO43c0',
    title: 'Gala Bunga Matahari',
    artist: 'Sal Priadi',
    album: 'MARKERS AND SUCH PENS FLASHDISKS',
    duration: 232,
    durationFormatted: '3:52',
    thumbnail: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=500&auto=format&fit=crop&q=80',
    views: '98M',
    releaseDate: '2024',
  },
  {
    id: 'VqjGf_m7v0Y',
    youtubeId: 'VqjGf_m7v0Y',
    title: 'Sial',
    artist: 'Mahalini',
    album: 'Fabula',
    duration: 243,
    durationFormatted: '4:03',
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
    views: '210M',
    releaseDate: '2023',
  },
  {
    id: 'g_w7FvN45mU',
    youtubeId: 'g_w7FvN45mU',
    title: 'Evaluasi',
    artist: 'Hindia',
    album: 'Menari Dengan Bayangan',
    duration: 205,
    durationFormatted: '3:25',
    thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80',
    views: '180M',
    releaseDate: '2019',
  },
  {
    id: 'oR1_h94xQ1E',
    youtubeId: 'oR1_h94xQ1E',
    title: 'Rayuan Perempuan Gila',
    artist: 'Nadin Amizah',
    album: 'Untuk Dunia, Cinta, dan Kotornya',
    duration: 228,
    durationFormatted: '3:48',
    thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80',
    views: '115M',
    releaseDate: '2023',
  },
  {
    id: 'k-p0d_Hh3p4',
    youtubeId: 'k-p0d_Hh3p4',
    title: 'Hati-Hati di Jalan',
    artist: 'Tulus',
    album: 'Manusia',
    duration: 242,
    durationFormatted: '4:02',
    thumbnail: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&auto=format&fit=crop&q=80',
    views: '290M',
    releaseDate: '2022',
  },
  {
    id: '1bF-0N2aW2Y',
    youtubeId: '1bF-0N2aW2Y',
    title: 'Lantas',
    artist: 'Juicy Luicy',
    album: 'Sentimental',
    duration: 228,
    durationFormatted: '3:48',
    thumbnail: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&auto=format&fit=crop&q=80',
    views: '160M',
    releaseDate: '2020',
  },
  {
    id: '6KqG0u8pY8w',
    youtubeId: '6KqG0u8pY8w',
    title: 'Dan...',
    artist: 'Sheila On 7',
    album: 'Sheila on 7',
    duration: 286,
    durationFormatted: '4:46',
    thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80',
    views: '190M',
    releaseDate: '1999',
  },
];

export const KPOP_DAEBAK: Track[] = [
  {
    id: 'ArmDp-zijuc',
    youtubeId: 'ArmDp-zijuc',
    title: 'Super Shy',
    artist: 'NewJeans',
    album: 'Get Up',
    duration: 154,
    durationFormatted: '2:34',
    thumbnail: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&auto=format&fit=crop&q=80',
    views: '280M',
    releaseDate: '2023',
  },
  {
    id: 'pSUydWEq46U',
    youtubeId: 'pSUydWEq46U',
    title: 'Ditto',
    artist: 'NewJeans',
    album: 'OMG',
    duration: 185,
    durationFormatted: '3:05',
    thumbnail: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop&q=80',
    views: '310M',
    releaseDate: '2022',
  },
  {
    id: 'gdZLi9oWNZg',
    youtubeId: 'gdZLi9oWNZg',
    title: 'Dynamite',
    artist: 'BTS',
    album: 'BE',
    duration: 199,
    durationFormatted: '3:19',
    thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80',
    views: '1.8B',
    releaseDate: '2020',
  },
  {
    id: 'ioNng23DkIM',
    youtubeId: 'ioNng23DkIM',
    title: 'How You Like That',
    artist: 'BLACKPINK',
    album: 'THE ALBUM',
    duration: 181,
    durationFormatted: '3:01',
    thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80',
    views: '1.3B',
    releaseDate: '2020',
  },
  {
    id: 'Vk5-c_v4gMU',
    youtubeId: 'Vk5-c_v4gMU',
    title: 'Magnetic',
    artist: 'ILLIT',
    album: 'SUPER REAL ME',
    duration: 160,
    durationFormatted: '2:40',
    thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80',
    views: '240M',
    releaseDate: '2024',
  },
];

export async function fetchHomeFeed(): Promise<HomeFeedSection[]> {
  try {
    const res = await fetch(`${BASE_URL}/trending`);
    if (res.ok) {
      const data = await res.json();
      if (data) {
        const sections: HomeFeedSection[] = [];

        // 1. Indonesian Top Hits & Viral
        if (data.shelves?.indonesianHits?.length > 0) {
          sections.push({
            id: 'indonesian-hits',
            title: 'Indonesian Top Hits & Viral',
            subtitle: 'Lagu terpopuler dari Bernadya, Sal Priadi, Mahalini, Hindia & Sheila On 7',
            type: 'tracks',
            items: data.shelves.indonesianHits,
          });
        } else {
          sections.push({
            id: 'indonesian-hits',
            title: 'Indonesian Top Hits & Viral',
            subtitle: 'Lagu terpopuler dari Bernadya, Sal Priadi, Mahalini, Hindia & Sheila On 7',
            type: 'tracks',
            items: INDONESIAN_HITS,
          });
        }

        // 2. Global Top 50
        if (data.shelves?.globalTop50?.length > 0) {
          sections.push({
            id: 'global-top-50',
            title: 'Global Top 50',
            subtitle: 'The biggest tracks on earth right now',
            type: 'tracks',
            items: data.shelves.globalTop50,
          });
        } else if (data.topTracks?.length > 0) {
          sections.push({
            id: 'global-top-50',
            title: 'Global Top 50',
            subtitle: 'The biggest tracks on earth right now',
            type: 'tracks',
            items: data.topTracks,
          });
        }

        // 3. Made For You
        if (data.featuredPlaylists?.length > 0) {
          sections.push({
            id: 'made-for-you',
            title: 'Made For You',
            subtitle: 'Personalized playlists based on your listening taste',
            type: 'playlists',
            items: data.featuredPlaylists,
          });
        }

        // 4. K-Pop Daebak
        if (data.shelves?.kpopDaebak?.length > 0) {
          sections.push({
            id: 'kpop-daebak',
            title: 'K-Pop Daebak!',
            subtitle: 'The best K-Pop bops from NewJeans, BTS, and BLACKPINK',
            type: 'tracks',
            items: data.shelves.kpopDaebak,
          });
        } else {
          sections.push({
            id: 'kpop-daebak',
            title: 'K-Pop Daebak!',
            subtitle: 'The best K-Pop bops from NewJeans, BTS, and BLACKPINK',
            type: 'tracks',
            items: KPOP_DAEBAK,
          });
        }

        // 5. Popular Artists
        sections.push({
          id: 'popular-artists',
          title: 'Popular Artists',
          subtitle: 'The voices ruling global airwaves',
          type: 'artists',
          items: MOCK_ARTISTS,
        });

        // 6. Popular Albums
        sections.push({
          id: 'popular-albums',
          title: 'Popular Albums',
          subtitle: 'Full-length records defining modern sound',
          type: 'albums',
          items: MOCK_ALBUMS,
        });

        // 7. Chill Lo-Fi Beats
        if (data.shelves?.chillLofi?.length > 0) {
          sections.push({
            id: 'chill-lofi',
            title: 'Chill Lo-Fi Beats',
            subtitle: 'Relaxing instrumental soundscapes for coding and focus',
            type: 'tracks',
            items: data.shelves.chillLofi,
          });
        }

        // 8. Rock Classics
        if (data.shelves?.rockClassics?.length > 0) {
          sections.push({
            id: 'rock-classics',
            title: 'Rock & Alternative Classics',
            subtitle: 'Timeless guitar anthems and legendary rock hits',
            type: 'tracks',
            items: data.shelves.rockClassics,
          });
        }

        if (sections.length > 0) return sections;
      }
    }
  } catch (e) {
    console.warn('Backend API trending fetch error, using rich fallback shelves', e);
  }

  // Fallback rich home feed sections with full multi-shelves
  return [
    {
      id: 'indonesian-hits',
      title: 'Indonesian Top Hits & Viral',
      subtitle: 'Lagu terpopuler dari Bernadya, Sal Priadi, Mahalini, Hindia & Sheila On 7',
      type: 'tracks',
      items: INDONESIAN_HITS,
    },
    {
      id: 'global-top-50',
      title: 'Global Top 50',
      subtitle: 'The biggest tracks on earth right now',
      type: 'tracks',
      items: MOCK_TRACKS.slice(0, 8),
    },
    {
      id: 'made-for-you',
      title: 'Made For You',
      subtitle: 'Personalized recommendations based on your listening taste',
      type: 'playlists',
      items: MOCK_PLAYLISTS,
    },
    {
      id: 'kpop-daebak',
      title: 'K-Pop Daebak!',
      subtitle: 'The best K-Pop bops from NewJeans, BTS, and BLACKPINK',
      type: 'tracks',
      items: KPOP_DAEBAK,
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

  // Fallback local search including Indonesian and KPop catalog
  const lowerQ = q.toLowerCase();
  const allTracks = [...MOCK_TRACKS, ...INDONESIAN_HITS, ...KPOP_DAEBAK];
  const matchedTracks = allTracks.filter(
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
