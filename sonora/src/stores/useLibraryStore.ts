import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Track, Album, Artist, UserPlaylist, HistoryItem } from '@/types/music';

interface LibraryState {
  likedSongs: Track[];
  myPlaylists: UserPlaylist[];
  savedAlbums: Album[];
  followedArtists: Artist[];
  listeningHistory: HistoryItem[];

  // Liked Songs
  toggleLikeSong: (track: Track) => void;
  isSongLiked: (trackId: string) => boolean;

  // Playlists CRUD
  createPlaylist: (title?: string, description?: string, cover?: string) => UserPlaylist;
  updatePlaylist: (id: string, updates: Partial<UserPlaylist>) => void;
  deletePlaylist: (id: string) => void;
  duplicatePlaylist: (id: string) => UserPlaylist | null;
  addSongToPlaylist: (playlistId: string, track: Track) => void;
  removeSongFromPlaylist: (playlistId: string, trackId: string) => void;
  reorderPlaylistTracks: (playlistId: string, startIndex: number, endIndex: number) => void;

  // Albums
  toggleSaveAlbum: (album: Album) => void;
  isAlbumSaved: (albumId: string) => boolean;

  // Artists
  toggleFollowArtist: (artist: Artist) => void;
  isArtistFollowed: (artistId: string) => boolean;

  // Listening History
  addToHistory: (track: Track) => void;
  clearHistory: () => void;
}

const INITIAL_PLAYLISTS: UserPlaylist[] = [
  {
    id: 'user-pl-1',
    title: 'My Favorites',
    description: 'Songs you have saved and love listening to.',
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60',
    trackIds: [],
    tracks: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'user-pl-2',
    title: 'Chill Vibes & Focus',
    description: 'Perfect background music for late night coding and chilling.',
    cover: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop&q=60',
    trackIds: [],
    tracks: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      likedSongs: [],
      myPlaylists: INITIAL_PLAYLISTS,
      savedAlbums: [],
      followedArtists: [],
      listeningHistory: [],

      toggleLikeSong: (track: Track) => {
        const { likedSongs } = get();
        const exists = likedSongs.some((s) => s.id === track.id || s.youtubeId === track.youtubeId);
        if (exists) {
          set({
            likedSongs: likedSongs.filter(
              (s) => s.id !== track.id && s.youtubeId !== track.youtubeId
            ),
          });
        } else {
          set({
            likedSongs: [{ ...track, isLiked: true }, ...likedSongs],
          });
        }
      },

      isSongLiked: (trackId: string) => {
        const { likedSongs } = get();
        return likedSongs.some((s) => s.id === trackId || s.youtubeId === trackId);
      },

      createPlaylist: (title?: string, description?: string, cover?: string) => {
        const { myPlaylists } = get();
        const playlistNumber = myPlaylists.length + 1;
        const newPlaylist: UserPlaylist = {
          id: `playlist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          title: title?.trim() || `My Playlist #${playlistNumber}`,
          description: description?.trim() || 'A custom playlist created on SONORA.',
          cover:
            cover ||
            'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60',
          trackIds: [],
          tracks: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set({
          myPlaylists: [newPlaylist, ...myPlaylists],
        });

        return newPlaylist;
      },

      updatePlaylist: (id: string, updates: Partial<UserPlaylist>) => {
        set((state) => ({
          myPlaylists: state.myPlaylists.map((pl) =>
            pl.id === id ? { ...pl, ...updates, updatedAt: Date.now() } : pl
          ),
        }));
      },

      deletePlaylist: (id: string) => {
        set((state) => ({
          myPlaylists: state.myPlaylists.filter((pl) => pl.id !== id),
        }));
      },

      duplicatePlaylist: (id: string) => {
        const { myPlaylists } = get();
        const original = myPlaylists.find((p) => p.id === id);
        if (!original) return null;

        const duplicated: UserPlaylist = {
          ...original,
          id: `playlist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          title: `${original.title} (Copy)`,
          tracks: [...original.tracks],
          trackIds: [...original.trackIds],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set({ myPlaylists: [duplicated, ...myPlaylists] });
        return duplicated;
      },

      addSongToPlaylist: (playlistId: string, track: Track) => {
        set((state) => ({
          myPlaylists: state.myPlaylists.map((pl) => {
            if (pl.id !== playlistId) return pl;
            const alreadyInPlaylist = pl.tracks.some(
              (t) => t.id === track.id || t.youtubeId === track.youtubeId
            );
            if (alreadyInPlaylist) return pl;

            return {
              ...pl,
              trackIds: [...pl.trackIds, track.id || track.youtubeId],
              tracks: [...pl.tracks, track],
              updatedAt: Date.now(),
            };
          }),
        }));
      },

      removeSongFromPlaylist: (playlistId: string, trackId: string) => {
        set((state) => ({
          myPlaylists: state.myPlaylists.map((pl) => {
            if (pl.id !== playlistId) return pl;
            return {
              ...pl,
              trackIds: pl.trackIds.filter((id) => id !== trackId),
              tracks: pl.tracks.filter((t) => t.id !== trackId && t.youtubeId !== trackId),
              updatedAt: Date.now(),
            };
          }),
        }));
      },

      reorderPlaylistTracks: (playlistId: string, startIndex: number, endIndex: number) => {
        set((state) => ({
          myPlaylists: state.myPlaylists.map((pl) => {
            if (pl.id !== playlistId) return pl;
            const newTracks = Array.from(pl.tracks);
            const [movedTrack] = newTracks.splice(startIndex, 1);
            newTracks.splice(endIndex, 0, movedTrack);

            return {
              ...pl,
              tracks: newTracks,
              trackIds: newTracks.map((t) => t.id || t.youtubeId),
              updatedAt: Date.now(),
            };
          }),
        }));
      },

      toggleSaveAlbum: (album: Album) => {
        const { savedAlbums } = get();
        const exists = savedAlbums.some((a) => a.id === album.id);
        if (exists) {
          set({ savedAlbums: savedAlbums.filter((a) => a.id !== album.id) });
        } else {
          set({ savedAlbums: [album, ...savedAlbums] });
        }
      },

      isAlbumSaved: (albumId: string) => {
        const { savedAlbums } = get();
        return savedAlbums.some((a) => a.id === albumId);
      },

      toggleFollowArtist: (artist: Artist) => {
        const { followedArtists } = get();
        const exists = followedArtists.some((a) => a.id === artist.id);
        if (exists) {
          set({ followedArtists: followedArtists.filter((a) => a.id !== artist.id) });
        } else {
          set({ followedArtists: [artist, ...followedArtists] });
        }
      },

      isArtistFollowed: (artistId: string) => {
        const { followedArtists } = get();
        return followedArtists.some((a) => a.id === artistId);
      },

      addToHistory: (track: Track) => {
        set((state) => {
          const filtered = state.listeningHistory.filter(
            (h) => h.track.id !== track.id && h.track.youtubeId !== track.youtubeId
          );
          const newHistory: HistoryItem = {
            track,
            playedAt: Date.now(),
          };
          // Keep up to 50 items
          return {
            listeningHistory: [newHistory, ...filtered].slice(0, 50),
          };
        });
      },

      clearHistory: () => {
        set({ listeningHistory: [] });
      },
    }),
    {
      name: 'sonora_library_storage',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined'
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
      ),
    }
  )
);
