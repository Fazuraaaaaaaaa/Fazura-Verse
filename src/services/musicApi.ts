export interface MusicTrackItem {
  id: string;
  youtubeId: string;
  title: string;
  artist: string;
  album?: string;
  thumbnail: string;
  durationFormatted?: string;
  tag?: string;
}

export const FAZURA_MUSIC_CATALOG: MusicTrackItem[] = [
  {
    id: 't-diewithasmile',
    youtubeId: 'kPa7bsKwL-c',
    title: 'Die With A Smile',
    artist: 'Lady Gaga, Bruno Mars',
    album: 'Die With A Smile',
    thumbnail: 'https://i.ytimg.com/vi/kPa7bsKwL-c/hqdefault.jpg',
    durationFormatted: '4:11',
    tag: 'Global #1',
  },
  {
    id: 'yjnSX_iUFVo',
    youtubeId: 'yjnSX_iUFVo',
    title: 'Satu Bulan',
    artist: 'Bernadya',
    album: 'Sialnya, Hidup Harus Tetap Berjalan',
    thumbnail: 'https://i.ytimg.com/vi/yjnSX_iUFVo/hqdefault.jpg',
    durationFormatted: '3:14',
    tag: 'Viral Indo',
  },
  {
    id: '9hjMIOIysng',
    youtubeId: '9hjMIOIysng',
    title: 'Kata Mereka Ini Berlebihan',
    artist: 'Bernadya',
    album: 'Sialnya, Hidup Harus Tetap Berjalan',
    thumbnail: 'https://i.ytimg.com/vi/9hjMIOIysng/hqdefault.jpg',
    durationFormatted: '3:12',
    tag: 'Pop Indo',
  },
  {
    id: 'HB8vftGxsIc',
    youtubeId: 'HB8vftGxsIc',
    title: 'Untungnya, Hidup Harus Tetap Berjalan',
    artist: 'Bernadya',
    album: 'Sialnya, Hidup Harus Tetap Berjalan',
    thumbnail: 'https://i.ytimg.com/vi/HB8vftGxsIc/hqdefault.jpg',
    durationFormatted: '3:04',
    tag: 'Acoustic',
  },
  {
    id: 'AQpEIZ8dNcU',
    youtubeId: 'AQpEIZ8dNcU',
    title: 'Gala Bunga Matahari',
    artist: 'Sal Priadi',
    album: 'MARKERS AND SUCH PENS FLASHDISKS',
    thumbnail: 'https://i.ytimg.com/vi/AQpEIZ8dNcU/hqdefault.jpg',
    durationFormatted: '3:50',
    tag: 'Top Hits',
  },
  {
    id: 'Osdp7rUjK6o',
    youtubeId: 'Osdp7rUjK6o',
    title: 'Dari Planet Lain',
    artist: 'Sal Priadi',
    album: 'MARKERS AND SUCH PENS FLASHDISKS',
    thumbnail: 'https://i.ytimg.com/vi/Osdp7rUjK6o/hqdefault.jpg',
    durationFormatted: '2:55',
    tag: 'Indie Hits',
  },
  {
    id: 'fJ56-r_0Qy0',
    youtubeId: 'fJ56-r_0Qy0',
    title: 'Evaluasi',
    artist: 'Hindia',
    album: 'Menari Dengan Bayangan',
    thumbnail: 'https://i.ytimg.com/vi/fJ56-r_0Qy0/hqdefault.jpg',
    durationFormatted: '3:35',
    tag: 'Indie Pop',
  },
  {
    id: 'jE1rC5VvR9E',
    youtubeId: 'jE1rC5VvR9E',
    title: 'Rumah Ke Rumah',
    artist: 'Hindia',
    album: 'Menari Dengan Bayangan',
    thumbnail: 'https://i.ytimg.com/vi/jE1rC5VvR9E/hqdefault.jpg',
    durationFormatted: '4:37',
    tag: 'Trending',
  },
  {
    id: 'S408Q0v9gX8',
    youtubeId: 'S408Q0v9gX8',
    title: 'Secukupnya',
    artist: 'Hindia',
    album: 'Menari Dengan Bayangan',
    thumbnail: 'https://i.ytimg.com/vi/S408Q0v9gX8/hqdefault.jpg',
    durationFormatted: '3:27',
    tag: 'OST Nanti Kita Cerita',
  },
  {
    id: 'hM8e7y0cW7s',
    youtubeId: 'hM8e7y0cW7s',
    title: 'Sial',
    artist: 'Mahalini',
    album: 'FÁBULA',
    thumbnail: 'https://i.ytimg.com/vi/hM8e7y0cW7s/hqdefault.jpg',
    durationFormatted: '4:03',
    tag: 'Viral Hits',
  },
  {
    id: 'Xy7fQ8kM1v0',
    youtubeId: 'Xy7fQ8kM1v0',
    title: 'Mati-Matian',
    artist: 'Mahalini',
    album: 'Single',
    thumbnail: 'https://i.ytimg.com/vi/Xy7fQ8kM1v0/hqdefault.jpg',
    durationFormatted: '4:10',
    tag: 'Pop Galau',
  },
  {
    id: 'L0pB2sN7eYo',
    youtubeId: 'L0pB2sN7eYo',
    title: 'Sisa Rasa',
    artist: 'Mahalini',
    album: 'FÁBULA',
    thumbnail: 'https://i.ytimg.com/vi/L0pB2sN7eYo/hqdefault.jpg',
    durationFormatted: '4:14',
    tag: 'Pop Melow',
  },
  {
    id: 'K8kL3rT6vWo',
    youtubeId: 'K8kL3rT6vWo',
    title: 'Rayuan Perempuan Gila',
    artist: 'Nadin Amizah',
    album: 'Untuk Dunia, Cinta, dan Kotornya',
    thumbnail: 'https://i.ytimg.com/vi/K8kL3rT6vWo/hqdefault.jpg',
    durationFormatted: '4:21',
    tag: 'Folk Pop',
  },
  {
    id: 'w4gQ8y1bZso',
    youtubeId: 'w4gQ8y1bZso',
    title: 'Semua Aku Dirayakan',
    artist: 'Nadin Amizah',
    album: 'Untuk Dunia, Cinta, dan Kotornya',
    thumbnail: 'https://i.ytimg.com/vi/w4gQ8y1bZso/hqdefault.jpg',
    durationFormatted: '4:40',
    tag: 'Acoustic',
  },
  {
    id: 'V1bC9x0kLyo',
    youtubeId: 'V1bC9x0kLyo',
    title: 'Bertaut',
    artist: 'Nadin Amizah',
    album: 'Selamat Ulang Tahun',
    thumbnail: 'https://i.ytimg.com/vi/V1bC9x0kLyo/hqdefault.jpg',
    durationFormatted: '5:16',
    tag: 'Nostalgic',
  },
  {
    id: 'mG_1l7U7Dfo',
    youtubeId: 'mG_1l7U7Dfo',
    title: 'Hati-Hati di Jalan',
    artist: 'Tulus',
    album: 'Manusia',
    thumbnail: 'https://i.ytimg.com/vi/mG_1l7U7Dfo/hqdefault.jpg',
    durationFormatted: '4:02',
    tag: 'Spotify Top',
  },
  {
    id: 'N8vC1bX9yZo',
    youtubeId: 'N8vC1bX9yZo',
    title: 'Monokrom',
    artist: 'Tulus',
    album: 'Monokrom',
    thumbnail: 'https://i.ytimg.com/vi/N8vC1bX9yZo/hqdefault.jpg',
    durationFormatted: '3:34',
    tag: 'Legend Hits',
  },
  {
    id: 't-birdsofafeather',
    youtubeId: 'V9PVRfjEBTI',
    title: 'BIRDS OF A FEATHER',
    artist: 'Billie Eilish',
    album: 'HIT ME HARD AND SOFT',
    thumbnail: 'https://i.ytimg.com/vi/V9PVRfjEBTI/hqdefault.jpg',
    durationFormatted: '3:18',
    tag: 'Billboard #1',
  },
  {
    id: '34Na4j8AVgA',
    youtubeId: '34Na4j8AVgA',
    title: 'Starboy',
    artist: 'The Weeknd, Daft Punk',
    album: 'Starboy',
    thumbnail: 'https://i.ytimg.com/vi/34Na4j8AVgA/hqdefault.jpg',
    durationFormatted: '3:50',
    tag: 'Pop Legend',
  },
  {
    id: '7wtfhZwyrcc',
    youtubeId: '7wtfhZwyrcc',
    title: 'Believer',
    artist: 'Imagine Dragons',
    album: 'Evolve',
    thumbnail: 'https://i.ytimg.com/vi/7wtfhZwyrcc/hqdefault.jpg',
    durationFormatted: '3:24',
    tag: 'Rock Hits',
  },
  {
    id: 'eVTXPUF4Oz4',
    youtubeId: 'eVTXPUF4Oz4',
    title: 'In the End',
    artist: 'Linkin Park',
    album: 'Hybrid Theory',
    thumbnail: 'https://i.ytimg.com/vi/eVTXPUF4Oz4/hqdefault.jpg',
    durationFormatted: '3:36',
    tag: 'Rock Classic',
  },
  {
    id: 't-espresso',
    youtubeId: 'eVli-tstM5E',
    title: 'Espresso',
    artist: 'Sabrina Carpenter',
    album: 'Short n\' Sweet',
    thumbnail: 'https://i.ytimg.com/vi/eVli-tstM5E/hqdefault.jpg',
    durationFormatted: '2:55',
    tag: 'Viral Global',
  },
  {
    id: 'JGwWNGJdvx8',
    youtubeId: 'JGwWNGJdvx8',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    album: '÷ (Divide)',
    thumbnail: 'https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg',
    durationFormatted: '3:53',
    tag: 'Spotify All-Time',
  },
  {
    id: 'dvgZkm1xWPE',
    youtubeId: 'dvgZkm1xWPE',
    title: 'Viva La Vida',
    artist: 'Coldplay',
    album: 'Viva La Vida',
    thumbnail: 'https://i.ytimg.com/vi/dvgZkm1xWPE/hqdefault.jpg',
    durationFormatted: '4:02',
    tag: 'Rock Anthem',
  },
  {
    id: 'yKNxeF4KMsY',
    youtubeId: 'yKNxeF4KMsY',
    title: 'Yellow',
    artist: 'Coldplay',
    album: 'Parachutes',
    thumbnail: 'https://i.ytimg.com/vi/yKNxeF4KMsY/hqdefault.jpg',
    durationFormatted: '4:29',
    tag: 'Indie Rock',
  },
  {
    id: 'TUVcZfQe-Kw',
    youtubeId: 'TUVcZfQe-Kw',
    title: 'Levitating',
    artist: 'Dua Lipa',
    album: 'Future Nostalgia',
    thumbnail: 'https://i.ytimg.com/vi/TUVcZfQe-Kw/hqdefault.jpg',
    durationFormatted: '3:23',
    tag: 'Dance Pop',
  },
  {
    id: 'H5v3kku4y6Q',
    youtubeId: 'H5v3kku4y6Q',
    title: 'As It Was',
    artist: 'Harry Styles',
    album: 'Harry\'s House',
    thumbnail: 'https://i.ytimg.com/vi/H5v3kku4y6Q/hqdefault.jpg',
    durationFormatted: '2:47',
    tag: 'Grammy Winner',
  },
];

export async function searchMusic(query: string): Promise<MusicTrackItem[]> {
  const q = (query || '').trim().toLowerCase();
  if (!q) return [];

  // Try live API query to localhost:3000
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1800);
    const sonoraUrl = import.meta.env.VITE_SONORA_URL || 'http://localhost:3000';
    const res = await fetch(`${sonoraUrl}/api/ytmusic/search?q=${encodeURIComponent(query)}&type=songs`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.tracks) && data.tracks.length > 0) {
        return data.tracks.map((t: any) => ({
          id: t.id || t.youtubeId,
          youtubeId: t.youtubeId || t.id,
          title: t.title,
          artist: t.artist,
          album: t.album,
          thumbnail: t.thumbnail || `https://i.ytimg.com/vi/${t.youtubeId || t.id}/hqdefault.jpg`,
          durationFormatted: t.durationFormatted || '3:30',
          tag: 'YouTube Music',
        }));
      }
    }
  } catch (err) {
    // ignore network errors, proceed to catalog filter
  }

  // Filter local catalog
  return FAZURA_MUSIC_CATALOG.filter((track) => {
    return (
      track.title.toLowerCase().includes(q) ||
      track.artist.toLowerCase().includes(q) ||
      (track.album && track.album.toLowerCase().includes(q))
    );
  });
}
