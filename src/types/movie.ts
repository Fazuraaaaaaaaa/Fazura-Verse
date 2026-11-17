export interface Movie {
  id: string; // ID TMDB
  title: string;
  description?: string;
  posterUrl?: string;
  backdropUrl?: string;
  releaseDate?: string;
  genres?: string[];
  ratingValue?: number;
  ratingCount?: number;
  duration?: string;
  mediaType?: 'movie' | 'tv';
}

export interface MovieCast {
  id?: string | number;
  name: string;
  character?: string;
  profileUrl?: string;
}

export interface MovieDetail extends Movie {
  tagline?: string;
  trailerUrl?: string;
  trailerKey?: string;
  cast?: MovieCast[];
  status?: string;
  budget?: number;
  revenue?: number;
  runtime?: number;
  spokenLanguages?: string[];
  productionCompanies?: string[];
  numberOfSeasons?: number;
  numberOfEpisodes?: number;
  seasons?: SeasonItem[];
}

export interface MoviesResponse {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  data: Movie[];
}

export interface MovieDetailResponse {
  data: MovieDetail;
  related: Movie[];
}

export interface StreamServer {
  serverName: string;
  url: string;
  type: 'iframe' | 'hls';
}

export interface StreamResponse {
  id: string;
  title: string;
  streams: StreamServer[];
  streamUrl: string; // URL server default
  type: 'iframe' | 'hls';
  sourceLabel: string;
  mediaType: 'movie' | 'tv';
  season: number;
  episode: number;
}

export interface SeasonItem {
  id?: string | number;
  seasonNumber: number;
  name: string;
  episodeCount?: number;
  posterUrl?: string;
  airDate?: string;
  overview?: string;
}

export interface EpisodeItem {
  id?: string | number;
  episodeNumber: number;
  seasonNumber?: number;
  name?: string;
  title?: string;
  overview?: string;
  thumbnailUrl?: string;
  stillUrl?: string;
  airDate?: string;
  duration?: string;
  ratingValue?: number;
}

export interface MovieComment {
  id: string;
  author: string;
  text: string;
  rating?: number;
  isSpoiler?: boolean;
  createdAt: string;
}

export interface CreateCommentPayload {
  author: string;
  text: string;
  rating?: number;
  isSpoiler?: boolean;
}

export interface MovieQueryParams {
  q?: string;
  collection?: 'popular' | 'top_rated' | 'now_playing' | 'upcoming' | 'trending' | string;
  genre?: string;
  minRating?: number;
  sort?: 'default' | 'rating_desc' | 'date_desc' | 'title_asc' | 'date_asc';
  page?: number;
  perPage?: number;
}
