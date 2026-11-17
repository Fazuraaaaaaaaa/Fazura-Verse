import { Track, Artist, Album, Playlist, SearchResults, LyricsData, HomeFeedSection } from '@/types/music';

export interface HomeShelves {
  indonesianHits: Track[];
  globalTop50: Track[];
  kpopDaebak: Track[];
  chillLofi: Track[];
  rockClassics: Track[];
}

export interface TrendingResponse {
  topTracks: Track[];
  trendingTracks: Track[];
  newReleases: Album[];
  quickPicks: Track[];
  featuredPlaylists: Playlist[];
  shelves?: HomeShelves;
  sections?: HomeFeedSection[];
}

export interface SongDetailsResponse {
  track: Track;
  related: Track[];
  lyrics?: LyricsData;
  streamInfo?: {
    youtubeId: string;
    streamType: string;
    embedUrl: string;
    watchUrl: string;
  };
}

export interface RecommendationResponse {
  tracks: Track[];
  seed?: {
    type: 'track' | 'artist' | 'genre';
    value: string;
  };
}

export interface MusicProvider {
  name: string;
  search(query: string, filter?: string, limit?: number): Promise<SearchResults>;
  getTrending(): Promise<TrendingResponse>;
  getSong(id: string): Promise<SongDetailsResponse | null>;
  getArtist(id: string): Promise<Artist | null>;
  getAlbum(id: string): Promise<Album | null>;
  getPlaylist(id: string): Promise<Playlist | null>;
  getRecommendations(seedTrackId?: string, genre?: string, limit?: number): Promise<RecommendationResponse>;
  getLyrics?(trackId: string, title?: string, artist?: string): Promise<LyricsData | null>;
}
