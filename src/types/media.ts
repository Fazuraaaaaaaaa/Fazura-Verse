export interface AnimeItem {
  id: string;
  title: string;
  poster: string;
  episodes?: string | number;
  releaseDay?: string;
  releasedOn?: string;
  score?: string;
  rank?: number;
  status?: string;
  type?: string;
  estimation?: string;
  genres?: string | { title: string; genreId: string }[];
  provider: 'samehadaku' | 'otakudesu';
}

export interface AnimePagination {
  currentPage: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage?: number | null;
  nextPage?: number | null;
}

export interface AnimeGenre {
  title: string;
  genreId: string;
}

export interface AnimeScheduleDay {
  day: string;
  animeList: AnimeItem[];
}

export interface AnimeDetail {
  id: string;
  title: string;
  poster: string;
  score?: string;
  japanese?: string;
  type?: string;
  status?: string;
  episodes?: string | number | null;
  duration?: string;
  studios?: string;
  synopsis: string;
  genres: { title: string; id: string }[];
  episodeList: {
    title: string | number;
    episodeId: string;
    date?: string;
  }[];
  provider: 'samehadaku' | 'otakudesu';
}

export interface AnimeEpisodeData {
  title: string;
  animeId: string;
  streamUrl?: string;
  hasPrev: boolean;
  hasNext: boolean;
  prevEpisodeId?: string | null;
  nextEpisodeId?: string | null;
  servers?: {
    quality: string;
    serverList: { title: string; serverId: string; href?: string }[];
  }[];
  downloads?: {
    quality: string;
    size?: string;
    urls: { title: string; url: string }[];
  }[];
}

export interface DonghuaItem {
  slug: string;
  title: string;
  poster: string;
  status?: string;
  type?: string;
  currentEpisode?: string;
}

export interface DonghuaDetail {
  title: string;
  slug: string;
  alterTitle?: string;
  poster: string;
  rating?: string;
  followers?: string;
  studio?: string;
  network?: string;
  released?: string;
  duration?: string;
  status?: string;
  type?: string;
  episodesCount?: string;
  genres: { name: string; slug: string }[];
  synopsis: string;
  episodesList: {
    episode: string;
    slug: string;
    number?: string;
    releaseDate?: string;
  }[];
}

export interface DonghuaEpisodeData {
  episode: string;
  mainStreamUrl: string;
  servers: { name: string; url: string }[];
  donghuaDetails?: {
    title: string;
    slug: string;
    poster: string;
  };
  navigation: {
    prevSlug?: string | null;
    nextSlug?: string | null;
    allEpisodesSlug?: string;
  };
  episodesList: {
    episode: string;
    slug: string;
  }[];
  downloads?: Record<string, Record<string, string>>;
}

export interface DonghuaScheduleDay {
  day: string;
  donghuaList: {
    title: string;
    slug: string;
    href?: string;
  }[];
}

export interface DonghuaGenre {
  name: string;
  slug: string;
  href?: string;
}
