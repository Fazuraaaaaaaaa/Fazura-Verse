export interface Thumbnail {
  url: string;
  width?: number;
  height?: number;
}

export interface TrackArtist {
  id?: string;
  name: string;
}

export interface Track {
  id: string; // YouTube video ID or identifier
  youtubeId: string; // Direct YouTube video ID for iframe playback
  title: string;
  artist: string;
  artists?: TrackArtist[];
  album?: string;
  albumId?: string;
  duration: number; // in seconds
  durationFormatted?: string; // "3:45"
  thumbnail: string;
  thumbnails?: Thumbnail[];
  audioUrl?: string; // fallback or stream URL
  views?: string | number;
  releaseDate?: string;
  explicit?: boolean;
  isLiked?: boolean;
}

export type Song = Track;

export interface Artist {
  id: string;
  name: string;
  avatar: string;
  banner?: string;
  bio?: string;
  monthlyListeners?: string | number;
  topTracks?: Track[];
  albums?: Album[];
  singles?: Album[];
  relatedArtists?: Artist[];
  isFollowed?: boolean;
  thumbnails?: Thumbnail[];
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  cover: string;
  releaseYear?: string | number;
  trackCount?: number;
  totalDuration?: number; // seconds
  tracks?: Track[];
  type?: 'album' | 'single' | 'ep';
  description?: string;
  thumbnails?: Thumbnail[];
}

export interface Playlist {
  id: string;
  title: string;
  description?: string;
  cover: string;
  creator?: {
    id?: string;
    name: string;
  };
  trackCount?: number;
  tracks?: Track[];
  isCustom?: boolean;
  createdAt?: number;
  updatedAt?: number;
  thumbnails?: Thumbnail[];
}

export interface SearchResults {
  query: string;
  tracks: Track[];
  artists: Artist[];
  albums: Album[];
  playlists: Playlist[];
  topResult?: {
    type: 'track' | 'artist' | 'album' | 'playlist';
    item: Track | Artist | Album | Playlist;
  };
}

export type RepeatMode = 'off' | 'all' | 'one';

export interface QueueItem {
  queueId: string; // Unique instance ID for the queue slot
  track: Track;
  addedAt: number;
  source?: string;
}

export interface PlaybackState {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number; // 0 to 100
  isMuted: boolean;
  currentTime: number; // in seconds
  duration: number; // in seconds
  isShuffle: boolean;
  repeatMode: RepeatMode;
  queue: Track[];
  queueIndex: number;
  history: Track[];
  isFullscreen: boolean;
  showQueue: boolean;
  showLyrics: boolean;
}

export interface UserPlaylist {
  id: string;
  title: string;
  description: string;
  cover: string;
  trackIds: string[];
  tracks: Track[];
  createdAt: number;
  updatedAt: number;
}

export interface HistoryItem {
  track: Track;
  playedAt: number;
}

export interface UserLibrary {
  likedSongs: Track[];
  playlists: UserPlaylist[];
  savedAlbums: Album[];
  followedArtists: Artist[];
  recentlyPlayed: HistoryItem[];
}

export interface GenreCategory {
  id: string;
  name: string;
  color: string;
  cover?: string;
}

export interface HomeFeedSection {
  id: string;
  title: string;
  subtitle?: string;
  type: 'tracks' | 'albums' | 'playlists' | 'artists';
  items: (Track | Album | Playlist | Artist)[];
}

export interface LyricsLine {
  time: number; // in seconds or milliseconds
  text: string;
}

export interface LyricsData {
  trackId: string;
  synced: boolean;
  lines: LyricsLine[];
}
