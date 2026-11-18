import { Track, HistoryItem } from '@/types/music';
import {
  FALLBACK_TRACKS,
  INDONESIAN_HITS,
  GLOBAL_TOP_50,
  KPOP_DAEBAK,
  CHILL_LOFI,
  ROCK_CLASSICS,
} from '@/services/providers/fallbackData';

export interface DailyMix {
  id: string;
  title: string;
  description: string;
  cover: string;
  genre: string;
  color: string;
  tracks: Track[];
}

export interface RecommendationOptions {
  likedSongs?: Track[];
  listeningHistory?: HistoryItem[];
  skippedTrackIds?: string[];
  seedGenre?: string;
  limit?: number;
}

export interface RadioStationResponse {
  seedTrack: Track;
  stationName: string;
  description: string;
  cover: string;
  tracks: Track[];
}

/**
 * Detects the musical genre of a track based on artist or title keywords.
 */
export function getTrackGenre(track: Track): 'indonesian' | 'global_pop' | 'kpop' | 'rock' | 'lofi' | 'hiphop' | 'electronic' {
  const artist = track.artist.toLowerCase();
  const title = track.title.toLowerCase();

  if (
    artist.includes('bernadya') ||
    artist.includes('sal priadi') ||
    artist.includes('mahalini') ||
    artist.includes('hindia') ||
    artist.includes('nadin') ||
    artist.includes('tulus') ||
    artist.includes('juicy') ||
    artist.includes('sheila')
  ) {
    return 'indonesian';
  }

  if (
    artist.includes('newjeans') ||
    artist.includes('bts') ||
    artist.includes('blackpink') ||
    artist.includes('aespa') ||
    artist.includes('le sserafim') ||
    artist.includes('illit') ||
    artist.includes('ive')
  ) {
    return 'kpop';
  }

  if (
    artist.includes('arctic') ||
    artist.includes('linkin') ||
    artist.includes('queen') ||
    artist.includes('nirvana') ||
    artist.includes('oasis') ||
    artist.includes('green day') ||
    artist.includes('hozier') ||
    artist.includes('neighbourhood') ||
    artist.includes('radiohead') ||
    artist.includes('the killers')
  ) {
    return 'rock';
  }

  if (
    artist.includes('lofi') ||
    artist.includes('idealism') ||
    artist.includes('kupla') ||
    artist.includes('potsu') ||
    artist.includes('shiloh') ||
    artist.includes('jinsang') ||
    title.includes('lofi') ||
    title.includes('chill')
  ) {
    return 'lofi';
  }

  if (
    artist.includes('kendrick') ||
    artist.includes('drake') ||
    artist.includes('travis') ||
    artist.includes('eminem') ||
    artist.includes('future') ||
    artist.includes('post malone')
  ) {
    return 'hiphop';
  }

  if (artist.includes('daft punk') || artist.includes('avicii') || artist.includes('calvin harris')) {
    return 'electronic';
  }

  return 'global_pop';
}

/**
 * Smart recommendation algorithm combining Listening History, Liked Songs,
 * Artist Similarity, and Skip Behavior.
 */
export function generatePersonalizedRecommendations(options: RecommendationOptions = {}): Track[] {
  const {
    likedSongs = [],
    listeningHistory = [],
    skippedTrackIds = [],
    seedGenre,
    limit = 20,
  } = options;

  const skippedSet = new Set(skippedTrackIds);
  const playedIds = new Set(listeningHistory.map(h => h.track.id || h.track.youtubeId));

  // 1. Calculate artist affinity weights
  const artistWeights: Record<string, number> = {};
  for (const song of likedSongs) {
    artistWeights[song.artist] = (artistWeights[song.artist] || 0) + 3; // Liked songs weight = 3
  }
  for (const item of listeningHistory) {
    artistWeights[item.track.artist] = (artistWeights[item.track.artist] || 0) + 1; // Play history weight = 1
  }

  // 2. Identify favorite genres
  const genreWeights: Record<string, number> = {};
  for (const song of likedSongs) {
    const genre = getTrackGenre(song);
    genreWeights[genre] = (genreWeights[genre] || 0) + 2;
  }
  for (const item of listeningHistory) {
    const genre = getTrackGenre(item.track);
    genreWeights[genre] = (genreWeights[genre] || 0) + 1;
  }

  // 3. Score candidate tracks
  const scoredTracks: { track: Track; score: number }[] = [];

  for (const track of FALLBACK_TRACKS) {
    const id = track.id || track.youtubeId;

    // Heavily penalize or filter skipped tracks
    if (skippedSet.has(id)) {
      continue;
    }

    let score = Math.random() * 2; // base organic discovery jitter

    // Artist affinity bonus
    if (artistWeights[track.artist]) {
      score += artistWeights[track.artist] * 2.5;
    }

    // Genre affinity bonus
    const trackGenre = getTrackGenre(track);
    if (genreWeights[trackGenre]) {
      score += genreWeights[trackGenre] * 1.5;
    }

    // Explicit seed genre boost
    if (seedGenre && trackGenre === seedGenre.toLowerCase()) {
      score += 10;
    }

    // Mild boost for unplayed songs to encourage discovery
    if (!playedIds.has(id)) {
      score += 2.0;
    }

    scoredTracks.push({ track, score });
  }

  // Sort descending by score
  scoredTracks.sort((a, b) => b.score - a.score);

  return scoredTracks.slice(0, limit).map(s => s.track);
}

/**
 * Generates similar tracks tailored to a seed song or track ID.
 */
export function generateSimilarTracks(seedTrackOrId: Track | string, limit = 15): Track[] {
  let seed: Track | undefined;
  if (typeof seedTrackOrId === 'string') {
    seed = FALLBACK_TRACKS.find(t => t.id === seedTrackOrId || t.youtubeId === seedTrackOrId);
    if (!seed) {
      seed = FALLBACK_TRACKS[0];
    }
  } else {
    seed = seedTrackOrId;
  }

  const seedGenre = getTrackGenre(seed);
  const seedArtist = seed.artist.toLowerCase();
  const seedId = seed.id || seed.youtubeId;

  // Filter candidates excluding seed
  const candidates = FALLBACK_TRACKS.filter(t => (t.id || t.youtubeId) !== seedId);

  // Score similarity: same artist -> same genre -> overall pool
  const scored = candidates.map(track => {
    let similarity = 0;
    if (track.artist.toLowerCase() === seedArtist) {
      similarity += 15;
    } else if (track.artist.toLowerCase().includes(seedArtist) || seedArtist.includes(track.artist.toLowerCase())) {
      similarity += 10;
    }

    if (getTrackGenre(track) === seedGenre) {
      similarity += 6;
    }

    // duration similarity (± 45 seconds)
    if (Math.abs(track.duration - seed.duration) < 45) {
      similarity += 2;
    }

    similarity += Math.random() * 2;
    return { track, similarity };
  });

  scored.sort((a, b) => b.similarity - a.similarity);
  return scored.slice(0, limit).map(s => s.track);
}

/**
 * Discover Weekly: Generates fresh unlistened songs based on user taste profiles.
 */
export function generateDiscoverWeekly(options: RecommendationOptions = {}): {
  id: string;
  title: string;
  description: string;
  cover: string;
  tracks: Track[];
} {
  const { likedSongs = [], listeningHistory = [] } = options;
  const playedIds = new Set([
    ...likedSongs.map(s => s.id || s.youtubeId),
    ...listeningHistory.map(h => h.track.id || h.track.youtubeId),
  ]);

  // Find unplayed candidates
  const unplayed = FALLBACK_TRACKS.filter(t => !playedIds.has(t.id || t.youtubeId));
  const pool = unplayed.length >= 20 ? unplayed : FALLBACK_TRACKS;

  // Shuffle and pick 20 fresh tracks
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  const tracks = shuffled.slice(0, 20);

  return {
    id: 'pl_discover_weekly',
    title: 'Discover Weekly',
    description: 'Your weekly mixtape of fresh music. Enjoy new discoveries and deep cuts picked just for you.',
    cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    tracks,
  };
}

/**
 * Generates 4 tailored Daily Mixes based on listening patterns and distinct genre clusters.
 */
export function generateDailyMixes(options: RecommendationOptions = {}): DailyMix[] {
  const { likedSongs = [] } = options;

  // Helper to prioritize user likes within each cluster
  const clusterWithLikes = (cluster: Track[], liked: Track[]): Track[] => {
    const likedInCluster = liked.filter(l => cluster.some(c => (c.id || c.youtubeId) === (l.id || l.youtubeId)));
    const others = cluster.filter(c => !liked.some(l => (l.id || l.youtubeId) === (c.id || c.youtubeId)));
    return [...likedInCluster, ...others].slice(0, 25);
  };

  return [
    {
      id: 'daily_mix_1',
      title: 'Daily Mix 1',
      description: 'Taylor Swift, Sabrina Carpenter, Lady Gaga, Bruno Mars, and Billie Eilish.',
      cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
      genre: 'Global Pop',
      color: '#1DB954',
      tracks: clusterWithLikes(GLOBAL_TOP_50, likedSongs),
    },
    {
      id: 'daily_mix_2',
      title: 'Daily Mix 2',
      description: 'Bernadya, Sal Priadi, Mahalini, Hindia, Nadin Amizah, Tulus, Sheila On 7.',
      cover: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
      genre: 'Indonesian Pop & Indie',
      color: '#8b5cf6',
      tracks: clusterWithLikes(INDONESIAN_HITS, likedSongs),
    },
    {
      id: 'daily_mix_3',
      title: 'Daily Mix 3',
      description: 'NewJeans, BTS, BLACKPINK, aespa, LE SSERAFIM, and ILLIT.',
      cover: 'https://images.unsplash.com/photo-1526478806334-5fd488fcaabc?w=600&auto=format&fit=crop&q=80',
      genre: 'K-Pop Daebak!',
      color: '#ec4899',
      tracks: clusterWithLikes(KPOP_DAEBAK, likedSongs),
    },
    {
      id: 'daily_mix_4',
      title: 'Daily Mix 4',
      description: 'Arctic Monkeys, Linkin Park, Queen, Oasis, and soothing Chill Lo-Fi.',
      cover: 'https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?w=600&auto=format&fit=crop&q=80',
      genre: 'Rock & Chill Lo-Fi',
      color: '#3b82f6',
      tracks: clusterWithLikes([...ROCK_CLASSICS, ...CHILL_LOFI], likedSongs),
    },
  ];
}

/**
 * Radio Mode: Generates a continuous dynamic radio station seeded by a song.
 */
export function generateRadioStation(seedTrackOrId: Track | string, limit = 30): RadioStationResponse {
  let seed: Track | undefined;
  if (typeof seedTrackOrId === 'string') {
    seed = FALLBACK_TRACKS.find(t => t.id === seedTrackOrId || t.youtubeId === seedTrackOrId);
    if (!seed) {
      seed = FALLBACK_TRACKS[0];
    }
  } else {
    seed = seedTrackOrId;
  }

  const similar = generateSimilarTracks(seed, limit - 1);
  const tracks = [seed, ...similar];

  return {
    seedTrack: seed,
    stationName: `${seed.title} Radio`,
    description: `An endless station featuring ${seed.artist} and similar artists.`,
    cover: seed.thumbnail,
    tracks,
  };
}
