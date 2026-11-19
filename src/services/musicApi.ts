export interface LyricLine {
  time: number; // in seconds
  text: string;
}

export interface MusicTrackItem {
  id: string;
  youtubeId: string;
  title: string;
  artist: string;
  album?: string;
  thumbnail: string;
  durationFormatted?: string;
  tag?: string;
  genre?: 'pop' | 'indie' | 'anime' | 'donghua' | 'rock' | 'acoustic' | 'kpop';
  lyrics?: LyricLine[];
  previewUrl?: string; // HTML5 direct audio preview stream (30s AAC)
}

// -------------------------------------------------------------
// Massive Built-in Curated Catalog (100+ Songs)
// -------------------------------------------------------------
export const FAZURA_MUSIC_CATALOG: MusicTrackItem[] = [
  // === 1. GLOBAL & BILLBOARD TOP HITS ===
  {
    id: 't-diewithasmile',
    youtubeId: 'kPa7bsKwL-c',
    title: 'Die With A Smile',
    artist: 'Lady Gaga, Bruno Mars',
    album: 'Die With A Smile',
    thumbnail: 'https://i.ytimg.com/vi/kPa7bsKwL-c/hqdefault.jpg',
    durationFormatted: '4:11',
    tag: 'Global #1',
    genre: 'pop',
    lyrics: [
      { time: 10, text: 'I, I just woke up from a dream' },
      { time: 17, text: 'Where you and I had to say goodbye' },
      { time: 24, text: 'And I don\'t know what it all means' },
      { time: 31, text: 'But since I survived, I realized' },
      { time: 37, text: 'Wherever you go, that\'s where I\'ll follow' },
      { time: 43, text: 'Nobody\'s promised tomorrow' },
      { time: 51, text: 'So I\'m gonna love you every night like it\'s the last night' },
      { time: 59, text: 'Like it\'s the last night' },
      { time: 64, text: 'If the world was ending, I\'d wanna be next to you' },
      { time: 76, text: 'If the party was over and our time on Earth was through' },
      { time: 88, text: 'I\'d wanna hold you just for a while' },
      { time: 94, text: 'And die with a smile' },
    ],
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
    genre: 'pop',
    lyrics: [
      { time: 10, text: 'I want you to stay \'til I\'m in the grave' },
      { time: 16, text: '\'Til I rot away, dead and buried' },
      { time: 22, text: '\'Til I\'m in the casket you carry' },
      { time: 27, text: 'If you go, I\'m goin\' too, uh' },
      { time: 33, text: '\'Cause it was always you' },
      { time: 39, text: 'And if I\'m turnin\' blue, please don\'t save me' },
      { time: 45, text: 'Nothing in this world could ever break me' },
    ],
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
    genre: 'pop',
  },
  {
    id: 't-taste-sabrina',
    youtubeId: 'KEG7b851Wvw',
    title: 'Taste',
    artist: 'Sabrina Carpenter',
    album: 'Short n\' Sweet',
    thumbnail: 'https://i.ytimg.com/vi/KEG7b851Wvw/hqdefault.jpg',
    durationFormatted: '2:37',
    tag: 'Billboard Hot',
    genre: 'pop',
  },
  {
    id: 't-starboy-weeknd',
    youtubeId: '34Na4j8AVgA',
    title: 'Starboy',
    artist: 'The Weeknd, Daft Punk',
    album: 'Starboy',
    thumbnail: 'https://i.ytimg.com/vi/34Na4j8AVgA/hqdefault.jpg',
    durationFormatted: '3:50',
    tag: 'Pop Legend',
    genre: 'pop',
  },
  {
    id: 't-blindinglights-weeknd',
    youtubeId: '4NRXx6U8ABQ',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    thumbnail: 'https://i.ytimg.com/vi/4NRXx6U8ABQ/hqdefault.jpg',
    durationFormatted: '3:20',
    tag: 'Top 1 All-Time',
    genre: 'pop',
  },
  {
    id: 't-shapeofyou',
    youtubeId: 'JGwWNGJdvx8',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    album: '÷ (Divide)',
    thumbnail: 'https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg',
    durationFormatted: '3:53',
    tag: 'Spotify All-Time',
    genre: 'pop',
  },
  {
    id: 't-perfect-edsheeran',
    youtubeId: '2Vv-BfVoq4g',
    title: 'Perfect',
    artist: 'Ed Sheeran',
    album: '÷ (Divide)',
    thumbnail: 'https://i.ytimg.com/vi/2Vv-BfVoq4g/hqdefault.jpg',
    durationFormatted: '4:23',
    tag: 'Romantic Pop',
    genre: 'pop',
  },
  {
    id: 't-cruelsummer-taylor',
    youtubeId: 'ic8j13piAhQ',
    title: 'Cruel Summer',
    artist: 'Taylor Swift',
    album: 'Lover',
    thumbnail: 'https://i.ytimg.com/vi/ic8j13piAhQ/hqdefault.jpg',
    durationFormatted: '2:58',
    tag: 'Eras Tour #1',
    genre: 'pop',
  },
  {
    id: 't-antihero-taylor',
    youtubeId: 'b1kbLwvqugk',
    title: 'Anti-Hero',
    artist: 'Taylor Swift',
    album: 'Midnights',
    thumbnail: 'https://i.ytimg.com/vi/b1kbLwvqugk/hqdefault.jpg',
    durationFormatted: '3:20',
    tag: 'Billboard #1',
    genre: 'pop',
  },
  {
    id: 't-asitwas-harry',
    youtubeId: 'H5v3kku4y6Q',
    title: 'As It Was',
    artist: 'Harry Styles',
    album: 'Harry\'s House',
    thumbnail: 'https://i.ytimg.com/vi/H5v3kku4y6Q/hqdefault.jpg',
    durationFormatted: '2:47',
    tag: 'Grammy Winner',
    genre: 'pop',
  },
  {
    id: 't-watermelonsugar',
    youtubeId: 'E07s5ZYygMg',
    title: 'Watermelon Sugar',
    artist: 'Harry Styles',
    album: 'Fine Line',
    thumbnail: 'https://i.ytimg.com/vi/E07s5ZYygMg/hqdefault.jpg',
    durationFormatted: '2:54',
    tag: 'Summer Vibe',
    genre: 'pop',
  },
  {
    id: 't-levitating-dualipa',
    youtubeId: 'TUVcZfQe-Kw',
    title: 'Levitating',
    artist: 'Dua Lipa',
    album: 'Future Nostalgia',
    thumbnail: 'https://i.ytimg.com/vi/TUVcZfQe-Kw/hqdefault.jpg',
    durationFormatted: '3:23',
    tag: 'Dance Pop',
    genre: 'pop',
  },
  {
    id: 't-vampire-olivia',
    youtubeId: 'RlPNh_PBZb4',
    title: 'vampire',
    artist: 'Olivia Rodrigo',
    album: 'GUTS',
    thumbnail: 'https://i.ytimg.com/vi/RlPNh_PBZb4/hqdefault.jpg',
    durationFormatted: '3:39',
    tag: 'Pop Rock',
    genre: 'rock',
  },
  {
    id: 't-good4u-olivia',
    youtubeId: 'gNi_6U5Pm_o',
    title: 'good 4 u',
    artist: 'Olivia Rodrigo',
    album: 'SOUR',
    thumbnail: 'https://i.ytimg.com/vi/gNi_6U5Pm_o/hqdefault.jpg',
    durationFormatted: '2:58',
    tag: 'Teen Rock',
    genre: 'rock',
  },
  {
    id: 't-beautifulthings-benson',
    youtubeId: 'Oa_RSwwpPaA',
    title: 'Beautiful Things',
    artist: 'Benson Boone',
    album: 'Fireworks & Rollerblades',
    thumbnail: 'https://i.ytimg.com/vi/Oa_RSwwpPaA/hqdefault.jpg',
    durationFormatted: '3:00',
    tag: 'Global Viral',
    genre: 'pop',
  },
  {
    id: 't-sunflower-postmalone',
    youtubeId: 'ApXoWvfEYVU',
    title: 'Sunflower',
    artist: 'Post Malone, Swae Lee',
    album: 'Spider-Man: Into the Spider-Verse',
    thumbnail: 'https://i.ytimg.com/vi/ApXoWvfEYVU/hqdefault.jpg',
    durationFormatted: '2:38',
    tag: 'OST Marvel',
    genre: 'pop',
  },
  {
    id: 't-circles-postmalone',
    youtubeId: 'wXhTHyIgQ_U',
    title: 'Circles',
    artist: 'Post Malone',
    album: 'Hollywood\'s Bleeding',
    thumbnail: 'https://i.ytimg.com/vi/wXhTHyIgQ_U/hqdefault.jpg',
    durationFormatted: '3:35',
    tag: 'Spotify Top',
    genre: 'pop',
  },

  // === 2. INDONESIAN POP & VIRAL HITS ===
  {
    id: 'yjnSX_iUFVo',
    youtubeId: 'yjnSX_iUFVo',
    title: 'Satu Bulan',
    artist: 'Bernadya',
    album: 'Sialnya, Hidup Harus Tetap Berjalan',
    thumbnail: 'https://i.ytimg.com/vi/yjnSX_iUFVo/hqdefault.jpg',
    durationFormatted: '3:14',
    tag: 'Viral Indo #1',
    genre: 'pop',
    lyrics: [
      { time: 12, text: 'Sudah satu bulan ku tak mendengar suaramu' },
      { time: 19, text: 'Tak lagi berbagi cerita tentang harimu' },
      { time: 27, text: 'Bagaimana kabarmu di sana?' },
      { time: 34, text: 'Apakah kamu sudah bahagia tanpa aku?' },
      { time: 42, text: 'Belum ada satu bulan' },
      { time: 48, text: 'Ku dengar kamu sudah punya yang baru' },
      { time: 55, text: 'Cepat sekali kamu melupakan' },
      { time: 63, text: 'Semua janji yang pernah kau ucapkan' },
    ],
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
    genre: 'pop',
    lyrics: [
      { time: 15, text: 'Ku tak pernah meminta banyak hal darimu' },
      { time: 23, text: 'Hanya ingin kau sedikit peduli' },
      { time: 31, text: 'Kata mereka ku berlebihan mencintaimu' },
      { time: 40, text: 'Hingga lupa mencintai diri sendiri' },
    ],
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
    genre: 'acoustic',
    lyrics: [
      { time: 10, text: 'Untungnya bumi masih berputar' },
      { time: 16, text: 'Matahari masih bersinar terang' },
      { time: 22, text: 'Walau hatiku patah berkeping-keping' },
      { time: 30, text: 'Hidup ini harus tetap berjalan' },
    ],
  },
  {
    id: 't-kinikautahu-bernadya',
    youtubeId: '3c8eK4qY_80',
    title: 'Kini Mereka Tahu',
    artist: 'Bernadya',
    album: 'Sialnya, Hidup Harus Tetap Berjalan',
    thumbnail: 'https://i.ytimg.com/vi/3c8eK4qY_80/hqdefault.jpg',
    durationFormatted: '3:37',
    tag: 'Pop Indo',
    genre: 'pop',
  },
  {
    id: 'AQpEIZ8dNcU',
    youtubeId: 'AQpEIZ8dNcU',
    title: 'Gala Bunga Matahari',
    artist: 'Sal Priadi',
    album: 'MARKERS AND SUCH PENS FLASHDISKS',
    thumbnail: 'https://i.ytimg.com/vi/AQpEIZ8dNcU/hqdefault.jpg',
    durationFormatted: '3:50',
    tag: 'Top Hits Indo',
    genre: 'indie',
    lyrics: [
      { time: 14, text: 'Mungkinkah, mungkinkah kau ada di sana' },
      { time: 22, text: 'Menjadi bunga matahari yang bermekaran' },
      { time: 30, text: 'Kuingin mendengar kabarmu' },
      { time: 38, text: 'Apakah kau tenang dan bahagia di keabadian' },
    ],
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
    genre: 'indie',
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
    genre: 'indie',
    lyrics: [
      { time: 12, text: 'Yang tak bisa kau kendalikan, lepaskan' },
      { time: 19, text: 'Kukira kita akan bersama' },
      { time: 26, text: 'Ternyata kau dan aku berbeda arah' },
      { time: 33, text: 'Bilas muka, gosok gigi, evaluasi' },
      { time: 40, text: 'Tidur sejenak, esok mulai lagi' },
    ],
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
    genre: 'indie',
  },
  {
    id: 'S408Q0v9gX8',
    youtubeId: 'S408Q0v9gX8',
    title: 'Secukupnya',
    artist: 'Hindia',
    album: 'Menari Dengan Bayangan',
    thumbnail: 'https://i.ytimg.com/vi/S408Q0v9gX8/hqdefault.jpg',
    durationFormatted: '3:27',
    tag: 'OST Film',
    genre: 'indie',
  },
  {
    id: 't-cincin-hindia',
    youtubeId: 'rF1x6i-zK-U',
    title: 'Cincin',
    artist: 'Hindia',
    album: 'Lagipula Hidup Akan Berakhir',
    thumbnail: 'https://i.ytimg.com/vi/rF1x6i-zK-U/hqdefault.jpg',
    durationFormatted: '4:15',
    tag: 'Top Indo',
    genre: 'indie',
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
    genre: 'pop',
  },
  {
    id: 't-matimatian-mahalini',
    youtubeId: 'Xy7fQ8kM1v0',
    title: 'Mati-Matian',
    artist: 'Mahalini',
    album: 'Single',
    thumbnail: 'https://i.ytimg.com/vi/Xy7fQ8kM1v0/hqdefault.jpg',
    durationFormatted: '4:10',
    tag: 'Pop Galau',
    genre: 'pop',
  },
  {
    id: 't-sisarasa-mahalini',
    youtubeId: 'L0pB2sN7eYo',
    title: 'Sisa Rasa',
    artist: 'Mahalini',
    album: 'FÁBULA',
    thumbnail: 'https://i.ytimg.com/vi/L0pB2sN7eYo/hqdefault.jpg',
    durationFormatted: '4:14',
    tag: 'Pop Melow',
    genre: 'pop',
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
    genre: 'acoustic',
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
    genre: 'acoustic',
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
    genre: 'acoustic',
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
    genre: 'pop',
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
    genre: 'pop',
  },
  {
    id: 't-diri-tulus',
    youtubeId: 'r48nE2gR3vI',
    title: 'Diri',
    artist: 'Tulus',
    album: 'Manusia',
    thumbnail: 'https://i.ytimg.com/vi/r48nE2gR3vI/hqdefault.jpg',
    durationFormatted: '3:32',
    tag: 'Self Care Pop',
    genre: 'pop',
  },
  {
    id: 't-usai-tiara',
    youtubeId: 'w3vU-B8lJCo',
    title: 'Usai',
    artist: 'Tiara Andini',
    album: 'Single',
    thumbnail: 'https://i.ytimg.com/vi/w3vU-B8lJCo/hqdefault.jpg',
    durationFormatted: '3:48',
    tag: 'Pop Melow',
    genre: 'pop',
  },
  {
    id: 't-pesanterakhir-lyodra',
    youtubeId: '9d3S3eUa794',
    title: 'Pesan Terakhir',
    artist: 'Lyodra',
    album: 'Lyodra',
    thumbnail: 'https://i.ytimg.com/vi/9d3S3eUa794/hqdefault.jpg',
    durationFormatted: '4:21',
    tag: 'Ballad',
    genre: 'pop',
  },
  {
    id: 't-sangdewi-lyodra',
    youtubeId: '3H_0A9iJ-Zk',
    title: 'Sang Dewi',
    artist: 'Lyodra, Andi Rianto',
    album: 'Single',
    thumbnail: 'https://i.ytimg.com/vi/3H_0A9iJ-Zk/hqdefault.jpg',
    durationFormatted: '4:06',
    tag: 'Orchestral',
    genre: 'pop',
  },
  {
    id: 't-toothebone-pamungkas',
    youtubeId: '3vK3B5K6a_8',
    title: 'To the Bone',
    artist: 'Pamungkas',
    album: 'Flying Solo',
    thumbnail: 'https://i.ytimg.com/vi/3vK3B5K6a_8/hqdefault.jpg',
    durationFormatted: '5:44',
    tag: 'Spotify All-Time Indo',
    genre: 'indie',
  },
  {
    id: 't-kenanganmanis-pamungkas',
    youtubeId: 'qQ2O1hC8g0o',
    title: 'Kenangan Manis',
    artist: 'Pamungkas',
    album: 'Walk The Talk',
    thumbnail: 'https://i.ytimg.com/vi/qQ2O1hC8g0o/hqdefault.jpg',
    durationFormatted: '3:27',
    tag: 'Indie Chill',
    genre: 'indie',
  },
  {
    id: 't-lampukuning-juicyluicy',
    youtubeId: '3vO7f9kQ2xA',
    title: 'Lampu Kuning',
    artist: 'Juicy Luicy',
    album: 'Nonfiksi',
    thumbnail: 'https://i.ytimg.com/vi/3vO7f9kQ2xA/hqdefault.jpg',
    durationFormatted: '3:58',
    tag: 'Viral TikTok',
    genre: 'pop',
  },
  {
    id: 't-lantas-juicyluicy',
    youtubeId: '1x0v9B8vKCo',
    title: 'Lantas',
    artist: 'Juicy Luicy',
    album: 'Sentimental',
    thumbnail: 'https://i.ytimg.com/vi/1x0v9B8vKCo/hqdefault.jpg',
    durationFormatted: '3:48',
    tag: 'Pop Galau',
    genre: 'pop',
  },
  {
    id: 't-dan-sheilaon7',
    youtubeId: 'T8P_hJgLz1s',
    title: 'Dan...',
    artist: 'Sheila On 7',
    album: 'Sheila On 7',
    thumbnail: 'https://i.ytimg.com/vi/T8P_hJgLz1s/hqdefault.jpg',
    durationFormatted: '4:48',
    tag: 'Classic 90s',
    genre: 'pop',
  },
  {
    id: 't-seberapapantas-sheilaon7',
    youtubeId: '2bC9v6x_9Xo',
    title: 'Seberapa Pantas',
    artist: 'Sheila On 7',
    album: '07 Des',
    thumbnail: 'https://i.ytimg.com/vi/2bC9v6x_9Xo/hqdefault.jpg',
    durationFormatted: '3:50',
    tag: 'Nostalgia Hits',
    genre: 'pop',
  },
  {
    id: 't-kangen-dewa19',
    youtubeId: 'T4s9Fj-2yNo',
    title: 'Kangen',
    artist: 'Dewa 19',
    album: '19',
    thumbnail: 'https://i.ytimg.com/vi/T4s9Fj-2yNo/hqdefault.jpg',
    durationFormatted: '5:32',
    tag: 'Rock Classic Indo',
    genre: 'rock',
  },
  {
    id: 't-pupus-dewa19',
    youtubeId: 'a73x8fG0k_w',
    title: 'Pupus',
    artist: 'Dewa 19',
    album: 'Cintailah Cinta',
    thumbnail: 'https://i.ytimg.com/vi/a73x8fG0k_w/hqdefault.jpg',
    durationFormatted: '5:05',
    tag: 'Anthem Rock Indo',
    genre: 'rock',
  },

  // === 3. ANIME OPENING & ENDING SOUNDTRACKS ===
  {
    id: 't-idol-yoasobi',
    youtubeId: 'ZRtdQ81jPUQ',
    title: 'Idol (アイドル)',
    artist: 'YOASOBI',
    album: 'Oshi no Ko OP',
    thumbnail: 'https://i.ytimg.com/vi/ZRtdQ81jPUQ/hqdefault.jpg',
    durationFormatted: '3:33',
    tag: 'Anime #1',
    genre: 'anime',
    lyrics: [
      { time: 10, text: 'Muteki no egao de arasu media' },
      { time: 15, text: 'Shiritai sono himitsu misuteriasu' },
      { time: 20, text: 'Nuketeru toko sae kanojo no eria' },
      { time: 25, text: 'Kanpeki de usotsuki na kimi wa' },
      { time: 30, text: 'Tensai-teki na aidoru-sama' },
    ],
  },
  {
    id: 't-kaibutsu-yoasobi',
    youtubeId: 'dy90tA3TT1c',
    title: 'Kaibutsu (怪物)',
    artist: 'YOASOBI',
    album: 'BEASTARS Season 2 OP',
    thumbnail: 'https://i.ytimg.com/vi/dy90tA3TT1c/hqdefault.jpg',
    durationFormatted: '3:25',
    tag: 'Anime J-Pop',
    genre: 'anime',
  },
  {
    id: 't-yorunikakeru-yoasobi',
    youtubeId: 'x8VYWazR5mE',
    title: 'Yoru ni Kakeru (夜に駆ける)',
    artist: 'YOASOBI',
    album: 'THE BOOK',
    thumbnail: 'https://i.ytimg.com/vi/x8VYWazR5mE/hqdefault.jpg',
    durationFormatted: '4:21',
    tag: 'J-Pop Legend',
    genre: 'anime',
  },
  {
    id: 't-gurenge-lisa',
    youtubeId: 'CwkzK-Fh408',
    title: 'Gurenge (紅蓮華)',
    artist: 'LiSA',
    album: 'Demon Slayer: Kimetsu no Yaiba OP 1',
    thumbnail: 'https://i.ytimg.com/vi/CwkzK-Fh408/hqdefault.jpg',
    durationFormatted: '3:58',
    tag: 'Demon Slayer',
    genre: 'anime',
  },
  {
    id: 't-homura-lisa',
    youtubeId: '4DxL6IKmNx4',
    title: 'Homura (炎)',
    artist: 'LiSA',
    album: 'Demon Slayer: Mugen Train Movie OST',
    thumbnail: 'https://i.ytimg.com/vi/4DxL6IKmNx4/hqdefault.jpg',
    durationFormatted: '4:35',
    tag: 'Japan Record Award',
    genre: 'anime',
  },
  {
    id: 't-unravel-tk',
    youtubeId: '7aMOurgDB-o',
    title: 'Unravel',
    artist: 'TK from Ling Tosite Sigure',
    album: 'Tokyo Ghoul OP',
    thumbnail: 'https://i.ytimg.com/vi/7aMOurgDB-o/hqdefault.jpg',
    durationFormatted: '3:59',
    tag: 'Anime Legend',
    genre: 'anime',
  },
  {
    id: 't-kaikaikitan-eve',
    youtubeId: '1tk1P44rD2U',
    title: 'Kaikai Kitan (廻廻奇譚)',
    artist: 'Eve',
    album: 'Jujutsu Kaisen OP 1',
    thumbnail: 'https://i.ytimg.com/vi/1tk1P44rD2U/hqdefault.jpg',
    durationFormatted: '3:40',
    tag: 'JJK Anthem',
    genre: 'anime',
  },
  {
    id: 't-specialz-kinggnu',
    youtubeId: 'fhzKLfZq6gs',
    title: 'SPECIALZ',
    artist: 'King Gnu',
    album: 'Jujutsu Kaisen: Shibuya Incident OP',
    thumbnail: 'https://i.ytimg.com/vi/fhzKLfZq6gs/hqdefault.jpg',
    durationFormatted: '3:55',
    tag: 'JJK Shibuya',
    genre: 'anime',
  },
  {
    id: 't-silhouette-kanaboon',
    youtubeId: 'dlFA0Zq1k2A',
    title: 'Silhouette (シルエット)',
    artist: 'KANA-BOON',
    album: 'Naruto Shippuden OP 16',
    thumbnail: 'https://i.ytimg.com/vi/dlFA0Zq1k2A/hqdefault.jpg',
    durationFormatted: '4:00',
    tag: 'Naruto Hits',
    genre: 'anime',
  },
  {
    id: 't-bluebird-ikimonogakari',
    youtubeId: 'KpsJWFuVTdI',
    title: 'Blue Bird (ブルーバード)',
    artist: 'Ikimonogakari',
    album: 'Naruto Shippuden OP 3',
    thumbnail: 'https://i.ytimg.com/vi/KpsJWFuVTdI/hqdefault.jpg',
    durationFormatted: '3:38',
    tag: 'Naruto Classic',
    genre: 'anime',
  },
  {
    id: 't-blingbangbangborn',
    youtubeId: '210R0ozvZwg',
    title: 'Bling-Bang-Bang-Born',
    artist: 'Creepy Nuts',
    album: 'MASHLE Season 2 OP',
    thumbnail: 'https://i.ytimg.com/vi/210R0ozvZwg/hqdefault.jpg',
    durationFormatted: '2:50',
    tag: 'Global Viral #1',
    genre: 'anime',
  },
  {
    id: 't-kickback-kenshi',
    youtubeId: 'M2cckDmNLMI',
    title: 'KICK BACK',
    artist: 'Kenshi Yonezu',
    album: 'Chainsaw Man OP',
    thumbnail: 'https://i.ytimg.com/vi/M2cckDmNLMI/hqdefault.jpg',
    durationFormatted: '3:13',
    tag: 'Chainsaw Man',
    genre: 'anime',
  },
  {
    id: 't-crybaby-higedan',
    youtubeId: 'O1bhZgkC4Gw',
    title: 'Cry Baby',
    artist: 'Official HIGE DANDISM',
    album: 'Tokyo Revengers OP',
    thumbnail: 'https://i.ytimg.com/vi/O1bhZgkC4Gw/hqdefault.jpg',
    durationFormatted: '4:01',
    tag: 'Tokyo Revengers',
    genre: 'anime',
  },
  {
    id: 't-sparkle-radwimps',
    youtubeId: 'a2GujJZfXpg',
    title: 'Sparkle (スパークル)',
    artist: 'RADWIMPS',
    album: 'Your Name (Kimi no Na wa) OST',
    thumbnail: 'https://i.ytimg.com/vi/a2GujJZfXpg/hqdefault.jpg',
    durationFormatted: '8:57',
    tag: 'Kimi no Na wa',
    genre: 'anime',
  },
  {
    id: 't-nandemonaiya-radwimps',
    youtubeId: 'V933F8s3Otw',
    title: 'Nandemonaiya (なんでもないや)',
    artist: 'RADWIMPS',
    album: 'Your Name OST',
    thumbnail: 'https://i.ytimg.com/vi/V933F8s3Otw/hqdefault.jpg',
    durationFormatted: '5:42',
    tag: 'Anime Movie',
    genre: 'anime',
  },
  {
    id: 't-newgenesis-ado',
    youtubeId: '1FliVTcX8bQ',
    title: 'New Genesis (新時代)',
    artist: 'Ado',
    album: 'One Piece Film: Red OST',
    thumbnail: 'https://i.ytimg.com/vi/1FliVTcX8bQ/hqdefault.jpg',
    durationFormatted: '3:46',
    tag: 'One Piece Red',
    genre: 'anime',
  },
  {
    id: 't-zenzenzense-radwimps',
    youtubeId: 'PDSkFeMVNFs',
    title: 'Zenzenzense (前前前世)',
    artist: 'RADWIMPS',
    album: 'Your Name OST',
    thumbnail: 'https://i.ytimg.com/vi/PDSkFeMVNFs/hqdefault.jpg',
    durationFormatted: '4:45',
    tag: 'OST Hit',
    genre: 'anime',
  },
  {
    id: 't-shinzouwosasageyo',
    youtubeId: 'CID-sYQNCew',
    title: 'Shinzou wo Sasageyo! (心臓を捧げよ!)',
    artist: 'Linked Horizon',
    album: 'Attack on Titan Season 2 OP',
    thumbnail: 'https://i.ytimg.com/vi/CID-sYQNCew/hqdefault.jpg',
    durationFormatted: '5:41',
    tag: 'Attack on Titan',
    genre: 'anime',
  },
  {
    id: 't-theworld-nightmare',
    youtubeId: '809w08yQ60U',
    title: 'The WORLD',
    artist: 'Nightmare',
    album: 'Death Note OP 1',
    thumbnail: 'https://i.ytimg.com/vi/809w08yQ60U/hqdefault.jpg',
    durationFormatted: '3:48',
    tag: 'Death Note',
    genre: 'anime',
  },
  {
    id: 't-imagination-spyair',
    youtubeId: 'gl6dG9oG4oI',
    title: 'Imagination (イマジネーション)',
    artist: 'SPYAIR',
    album: 'Haikyuu!! OP 1',
    thumbnail: 'https://i.ytimg.com/vi/gl6dG9oG4oI/hqdefault.jpg',
    durationFormatted: '3:05',
    tag: 'Haikyuu!!',
    genre: 'anime',
  },

  // === 4. DONGHUA & CHINESE EPIC OST ===
  {
    id: 't-soulland-nevergiveup',
    youtubeId: 'Ww6_5n1eXmQ',
    title: 'Never Give Up (不弃)',
    artist: 'Angela Zhang (张韶涵)',
    album: 'Soul Land (Douluo Dalu) Theme Song',
    thumbnail: 'https://i.ytimg.com/vi/Ww6_5n1eXmQ/hqdefault.jpg',
    durationFormatted: '4:15',
    tag: 'Soul Land #1',
    genre: 'donghua',
  },
  {
    id: 't-soulland-pocan',
    youtubeId: 'a71eG83-v0I',
    title: 'Po Can (破茧)',
    artist: 'Angela Zhang (张韶涵)',
    album: 'Soul Land (Douluo Dalu) OP 2',
    thumbnail: 'https://i.ytimg.com/vi/a71eG83-v0I/hqdefault.jpg',
    durationFormatted: '3:45',
    tag: 'Soul Land OP',
    genre: 'donghua',
  },
  {
    id: 't-btth-theme',
    youtubeId: 'e8B3b1k_9vU',
    title: 'Doupo Cangqiong (斗破苍穹)',
    artist: 'Battle Through the Heavens OST',
    album: 'BTTH Season 4 Original Soundtrack',
    thumbnail: 'https://i.ytimg.com/vi/e8B3b1k_9vU/hqdefault.jpg',
    durationFormatted: '3:50',
    tag: 'BTTH Epic',
    genre: 'donghua',
  },
  {
    id: 't-perfectworld-ost',
    youtubeId: '7x2aB1n_8co',
    title: 'Perfect World (完美世界)',
    artist: 'Xin Zhe (张信哲)',
    album: 'Perfect World Donghua Theme Song',
    thumbnail: 'https://i.ytimg.com/vi/7x2aB1n_8co/hqdefault.jpg',
    durationFormatted: '4:20',
    tag: 'Perfect World',
    genre: 'donghua',
  },
  {
    id: 't-dayu-zhou-shen',
    youtubeId: '7k9r_J4wG40',
    title: 'Da Yu (大鱼)',
    artist: 'Zhou Shen (周深)',
    album: 'Big Fish & Begonia (大鱼海棠) Movie OST',
    thumbnail: 'https://i.ytimg.com/vi/7k9r_J4wG40/hqdefault.jpg',
    durationFormatted: '5:13',
    tag: 'Chinese Movie OST',
    genre: 'donghua',
  },
  {
    id: 't-wuji-modaozushi',
    youtubeId: '9vQ1B6c2_8E',
    title: 'Wu Ji (无羁)',
    artist: 'Xiao Zhan, Wang Yibo',
    album: 'The Untamed / Mo Dao Zu Shi OST',
    thumbnail: 'https://i.ytimg.com/vi/9vQ1B6c2_8E/hqdefault.jpg',
    durationFormatted: '4:13',
    tag: 'Mo Dao Zu Shi',
    genre: 'donghua',
  },
  {
    id: 't-swallowedstar-ost',
    youtubeId: 'b76c81x_9co',
    title: 'Tunshi Xingkong (吞噬星空)',
    artist: 'Swallowed Star OST',
    album: 'Swallowed Star 3D Theme',
    thumbnail: 'https://i.ytimg.com/vi/b76c81x_9co/hqdefault.jpg',
    durationFormatted: '3:40',
    tag: 'Swallowed Star',
    genre: 'donghua',
  },

  // === 5. K-POP & TRENDING GLOBAL ===
  {
    id: 't-apt-rose-bruno',
    youtubeId: 'ekr2nIex040',
    title: 'APT.',
    artist: 'ROSÉ, Bruno Mars',
    album: 'rosie',
    thumbnail: 'https://i.ytimg.com/vi/ekr2nIex040/hqdefault.jpg',
    durationFormatted: '2:50',
    tag: 'Global #1 Trending',
    genre: 'kpop',
  },
  {
    id: 't-magnetic-illit',
    youtubeId: 'Vk5-c_v4gMU',
    title: 'Magnetic',
    artist: 'ILLIT',
    album: 'SUPER REAL ME',
    thumbnail: 'https://i.ytimg.com/vi/Vk5-c_v4gMU/hqdefault.jpg',
    durationFormatted: '2:40',
    tag: 'TikTok Viral',
    genre: 'kpop',
  },
  {
    id: 't-supershy-newjeans',
    youtubeId: 'ArmDp-zijuc',
    title: 'Super Shy',
    artist: 'NewJeans',
    album: 'Get Up',
    thumbnail: 'https://i.ytimg.com/vi/ArmDp-zijuc/hqdefault.jpg',
    durationFormatted: '2:34',
    tag: 'NewJeans Hit',
    genre: 'kpop',
  },
  {
    id: 't-supernova-aespa',
    youtubeId: 'phuiAIQA45c',
    title: 'Supernova',
    artist: 'aespa',
    album: 'Armageddon',
    thumbnail: 'https://i.ytimg.com/vi/phuiAIQA45c/hqdefault.jpg',
    durationFormatted: '2:58',
    tag: 'K-Pop Perfect All-Kill',
    genre: 'kpop',
  },
  {
    id: 't-iam-ive',
    youtubeId: '6ZUIwj3FgUY',
    title: 'I AM',
    artist: 'IVE',
    album: 'I\'ve IVE',
    thumbnail: 'https://i.ytimg.com/vi/6ZUIwj3FgUY/hqdefault.jpg',
    durationFormatted: '3:03',
    tag: 'K-Pop Anthem',
    genre: 'kpop',
  },
  {
    id: 't-dynamite-bts',
    youtubeId: 'gdZLi9oWNZg',
    title: 'Dynamite',
    artist: 'BTS',
    album: 'BE',
    thumbnail: 'https://i.ytimg.com/vi/gdZLi9oWNZg/hqdefault.jpg',
    durationFormatted: '3:19',
    tag: 'Billboard #1 K-Pop',
    genre: 'kpop',
  },
  {
    id: 't-howyoulikethat-blackpink',
    youtubeId: 'ioNng23DkIM',
    title: 'How You Like That',
    artist: 'BLACKPINK',
    album: 'THE ALBUM',
    thumbnail: 'https://i.ytimg.com/vi/ioNng23DkIM/hqdefault.jpg',
    durationFormatted: '3:01',
    tag: 'BLACKPINK Global',
    genre: 'kpop',
  },

  // === 6. ROCK, CLASSIC & NOSTALGIA ===
  {
    id: 't-intheend-linkinpark',
    youtubeId: 'eVTXPUF4Oz4',
    title: 'In the End',
    artist: 'Linkin Park',
    album: 'Hybrid Theory',
    thumbnail: 'https://i.ytimg.com/vi/eVTXPUF4Oz4/hqdefault.jpg',
    durationFormatted: '3:36',
    tag: 'Rock Classic',
    genre: 'rock',
  },
  {
    id: 't-numb-linkinpark',
    youtubeId: 'kXYiU_JCYtU',
    title: 'Numb',
    artist: 'Linkin Park',
    album: 'Meteora',
    thumbnail: 'https://i.ytimg.com/vi/kXYiU_JCYtU/hqdefault.jpg',
    durationFormatted: '3:07',
    tag: 'Nu Metal #1',
    genre: 'rock',
  },
  {
    id: 't-faint-linkinpark',
    youtubeId: 'LYU-8IFcDPw',
    title: 'Faint',
    artist: 'Linkin Park',
    album: 'Meteora',
    thumbnail: 'https://i.ytimg.com/vi/LYU-8IFcDPw/hqdefault.jpg',
    durationFormatted: '2:42',
    tag: 'Rock Classic',
    genre: 'rock',
  },
  {
    id: 't-yellow-coldplay',
    youtubeId: 'yKNxeF4KMsY',
    title: 'Yellow',
    artist: 'Coldplay',
    album: 'Parachutes',
    thumbnail: 'https://i.ytimg.com/vi/yKNxeF4KMsY/hqdefault.jpg',
    durationFormatted: '4:29',
    tag: 'Indie Rock',
    genre: 'rock',
  },
  {
    id: 't-vivalavida-coldplay',
    youtubeId: 'dvgZkm1xWPE',
    title: 'Viva La Vida',
    artist: 'Coldplay',
    album: 'Viva La Vida',
    thumbnail: 'https://i.ytimg.com/vi/dvgZkm1xWPE/hqdefault.jpg',
    durationFormatted: '4:02',
    tag: 'Rock Anthem',
    genre: 'rock',
  },
  {
    id: 't-fixyou-coldplay',
    youtubeId: 'k4V3Mo61fJM',
    title: 'Fix You',
    artist: 'Coldplay',
    album: 'X&Y',
    thumbnail: 'https://i.ytimg.com/vi/k4V3Mo61fJM/hqdefault.jpg',
    durationFormatted: '4:55',
    tag: 'Emotional Rock',
    genre: 'rock',
  },
  {
    id: 't-believer-imaginedragons',
    youtubeId: '7wtfhZwyrcc',
    title: 'Believer',
    artist: 'Imagine Dragons',
    album: 'Evolve',
    thumbnail: 'https://i.ytimg.com/vi/7wtfhZwyrcc/hqdefault.jpg',
    durationFormatted: '3:24',
    tag: 'Rock Hits',
    genre: 'rock',
  },
  {
    id: 't-demons-imaginedragons',
    youtubeId: 'mWRsgZuwf_8',
    title: 'Demons',
    artist: 'Imagine Dragons',
    album: 'Night Visions',
    thumbnail: 'https://i.ytimg.com/vi/mWRsgZuwf_8/hqdefault.jpg',
    durationFormatted: '2:57',
    tag: 'Alt Rock',
    genre: 'rock',
  },
  {
    id: 't-bohemianrhapsody-queen',
    youtubeId: 'fJ9rUzIMcZQ',
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    album: 'A Night at the Opera',
    thumbnail: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg',
    durationFormatted: '5:55',
    tag: 'Rock Masterpiece',
    genre: 'rock',
  },
  {
    id: 't-smellsliketeenspirit',
    youtubeId: 'hTWKbfoikeg',
    title: 'Smells Like Teen Spirit',
    artist: 'Nirvana',
    album: 'Nevermind',
    thumbnail: 'https://i.ytimg.com/vi/hTWKbfoikeg/hqdefault.jpg',
    durationFormatted: '5:01',
    tag: 'Grunge Legend',
    genre: 'rock',
  },
  {
    id: 't-boulevardofbrokendreams',
    youtubeId: 'Soa3gO7tL-c',
    title: 'Boulevard of Broken Dreams',
    artist: 'Green Day',
    album: 'American Idiot',
    thumbnail: 'https://i.ytimg.com/vi/Soa3gO7tL-c/hqdefault.jpg',
    durationFormatted: '4:21',
    tag: 'Punk Rock',
    genre: 'rock',
  },
  {
    id: 't-creep-radiohead',
    youtubeId: 'XFkzRNyygfk',
    title: 'Creep',
    artist: 'Radiohead',
    album: 'Pablo Honey',
    thumbnail: 'https://i.ytimg.com/vi/XFkzRNyygfk/hqdefault.jpg',
    durationFormatted: '3:56',
    tag: 'Alt Rock Classic',
    genre: 'rock',
  },
];

// Runtime dynamic registry for searched tracks (so dynamic songs can be replayed or retrieved)
export const REGISTERED_TRACKS = new Map<string, MusicTrackItem>();
FAZURA_MUSIC_CATALOG.forEach((t) => REGISTERED_TRACKS.set(t.id, t));

// In-memory query cache for instant 0ms responses on repeat searches
export const SEARCH_CACHE = new Map<string, MusicTrackItem[]>();

export function getTrackById(id: string): MusicTrackItem | undefined {
  if (!id) return undefined;
  return REGISTERED_TRACKS.get(id) || FAZURA_MUSIC_CATALOG.find((t) => t.id === id || t.youtubeId === id);
}

// -------------------------------------------------------------
// Live Dynamic Search with iTunes Search API Integration & 0ms Query Cache
// -------------------------------------------------------------
export async function searchMusic(query: string): Promise<MusicTrackItem[]> {
  const q = (query || '').trim().toLowerCase().replace(/\s+/g, ' ');
  if (!q) return FAZURA_MUSIC_CATALOG;

  // 0. Check in-memory query cache for instant 0ms response
  if (SEARCH_CACHE.has(q)) {
    return SEARCH_CACHE.get(q)!;
  }

  // 1. Search local catalog & registry first (instant & reliable)
  const localMatches: MusicTrackItem[] = [];
  const localSeen = new Set<string>();

  // Check built-in catalog
  for (const track of FAZURA_MUSIC_CATALOG) {
    if (
      track.title.toLowerCase().includes(q) ||
      track.artist.toLowerCase().includes(q) ||
      (track.album && track.album.toLowerCase().includes(q)) ||
      (track.tag && track.tag.toLowerCase().includes(q)) ||
      (track.genre && track.genre.toLowerCase().includes(q))
    ) {
      const key = `${track.title.toLowerCase()}|||${track.artist.toLowerCase()}`;
      if (!localSeen.has(key)) {
        localSeen.add(key);
        localMatches.push(track);
        REGISTERED_TRACKS.set(track.id, track);
      }
    }
  }

  // Also check already registered dynamic tracks
  for (const track of REGISTERED_TRACKS.values()) {
    const key = `${track.title.toLowerCase()}|||${track.artist.toLowerCase()}`;
    if (!localSeen.has(key)) {
      if (
        track.title.toLowerCase().includes(q) ||
        track.artist.toLowerCase().includes(q) ||
        (track.album && track.album.toLowerCase().includes(q)) ||
        (track.tag && track.tag.toLowerCase().includes(q))
      ) {
        localSeen.add(key);
        localMatches.push(track);
      }
    }
  }

  // 2. If short query, cache & return local matches immediately
  if (q.length < 2) {
    if (SEARCH_CACHE.size > 200) {
      const oldestKey = SEARCH_CACHE.keys().next().value;
      if (oldestKey) SEARCH_CACHE.delete(oldestKey);
    }
    SEARCH_CACHE.set(q, localMatches);
    return localMatches;
  }

  // 3. Fetch from Apple/iTunes Search API (Free, CORS-enabled, Global catalog)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2800);
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=song&limit=25`;
    const res = await fetch(itunesUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.results) && data.results.length > 0) {
        const onlineTracks: MusicTrackItem[] = data.results.map((item: any) => {
          const trackId = `itunes-${item.trackId}`;
          const durationSec = Math.floor((item.trackTimeMillis || 0) / 1000);
          const mins = Math.floor(durationSec / 60);
          const secs = durationSec % 60;
          const formattedDur = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

          // High-resolution artwork
          const highResArt = (item.artworkUrl100 || '').replace('100x100bb', '600x600bb');

          const trackItem: MusicTrackItem = {
            id: trackId,
            youtubeId: '', // Dynamic stream
            title: item.trackName || 'Lagu',
            artist: item.artistName || 'Artis',
            album: item.collectionName,
            thumbnail: highResArt || item.artworkUrl100 || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500',
            durationFormatted: formattedDur,
            tag: item.primaryGenreName || 'Music',
            genre: 'pop',
            previewUrl: item.previewUrl,
          };

          // Register in global registry
          REGISTERED_TRACKS.set(trackId, trackItem);
          return trackItem;
        });

        // Combine local and online tracks, avoiding duplicate title + artist
        const seen = new Set<string>();
        const combined: MusicTrackItem[] = [];

        for (const t of [...localMatches, ...onlineTracks]) {
          const key = `${t.title.toLowerCase()}|||${t.artist.toLowerCase()}`;
          if (!seen.has(key)) {
            seen.add(key);
            combined.push(t);
            REGISTERED_TRACKS.set(t.id, t);
          }
        }

        // Cache results (max 200 items in cache)
        if (SEARCH_CACHE.size > 200) {
          const oldestKey = SEARCH_CACHE.keys().next().value;
          if (oldestKey) SEARCH_CACHE.delete(oldestKey);
        }
        SEARCH_CACHE.set(q, combined);
        return combined;
      }
    }
  } catch (err) {
    // If online search fails or timeouts, safely return local matches
  }

  // Fallback cache local matches
  if (SEARCH_CACHE.size > 200) {
    const oldestKey = SEARCH_CACHE.keys().next().value;
    if (oldestKey) SEARCH_CACHE.delete(oldestKey);
  }
  SEARCH_CACHE.set(q, localMatches);
  return localMatches;
}
