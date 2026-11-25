import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Headphones,
  Play,
  Pause,
  Heart,
  Search,
  History,
  Trash2,
  Mic2,
  Mic,
  Disc3,
  Loader2,
  X,
  ListPlus,
  Plus,
  FolderPlus,
} from 'lucide-react';
import { FAZURA_MUSIC_CATALOG, searchMusic, getTrackById, type MusicTrackItem } from '../services/musicApi';
import { useMusic } from '../context/MusicContext';
import { useCategoryBookmarks, useCategoryHistory } from '../services/categoryStorage';
import { HubHistoryShelf } from '../components/library/HubHistoryShelf';
import { usePageMeta } from '../hooks/usePageMeta';
import {
  MUSIC_FALLBACK_SVG,
  handleMusicImageError,
  handleMusicImageLoad,
} from '../utils/musicThumbnail';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { SectionHeader } from '../components/common/SectionHeader';
import { MediaCarousel } from '../components/media/MediaCarousel';
import { EmptyState } from '../components/common/StateViews';
import { ConfirmModal } from '../components/ConfirmModal';

type MusicTabType =
  | 'all'
  | 'viral'
  | 'pop_indo'
  | 'anime'
  | 'donghua'
  | 'kpop'
  | 'rock'
  | 'playlists'
  | 'bookmarks'
  | 'history';

const GENRE_TABS: { id: MusicTabType; label: string }[] = [
  { id: 'all', label: 'Semua Lagu' },
  { id: 'viral', label: 'Viral Hits' },
  { id: 'pop_indo', label: 'Pop Indo' },
  { id: 'anime', label: 'Anime OST' },
  { id: 'donghua', label: 'Donghua OST' },
  { id: 'kpop', label: 'K-Pop' },
  { id: 'rock', label: 'Rock' },
  { id: 'playlists', label: 'Playlist Saya' },
  { id: 'bookmarks', label: 'Lagu Favorit' },
  { id: 'history', label: 'Riwayat Putar' },
];

export function SoundwaveEqualizer({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) {
  const heightClass = size === 'lg' ? 'h-5' : size === 'md' ? 'h-4' : 'h-3.5';
  return (
    <div className={`flex items-end justify-center gap-[2px] ${heightClass} w-4`} aria-label="Equalizer">
      <span className="w-[2.5px] bg-[#E68BA6] rounded-full animate-soundwave-1" style={{ minHeight: '3px' }} />
      <span className="w-[2.5px] bg-[#E68BA6] rounded-full animate-soundwave-2" style={{ minHeight: '3px' }} />
      <span className="w-[2.5px] bg-[#E68BA6] rounded-full animate-soundwave-3" style={{ minHeight: '3px' }} />
    </div>
  );
}

interface TrackRowProps {
  track: MusicTrackItem;
  index: number;
  isActive: boolean;
  isPlaying: boolean;
  isBookmarked: boolean;
  onPlay: (track: MusicTrackItem) => void;
  onTogglePlay: () => void;
  onToggleBookmark: (track: MusicTrackItem) => void;
  onAddToQueue: (track: MusicTrackItem) => void;
  onOpenPlaylistPicker: (track: MusicTrackItem) => void;
}

export const TrackRow = React.memo(function TrackRow({
  track,
  index,
  isActive,
  isPlaying,
  isBookmarked,
  onPlay,
  onTogglePlay,
  onToggleBookmark,
  onAddToQueue,
  onOpenPlaylistPicker,
}: TrackRowProps) {
  const isThisPlaying = isActive && isPlaying;

  return (
    <div
      className={`grid grid-cols-[28px_1fr_auto] md:grid-cols-[36px_minmax(0,2fr)_minmax(0,1.2fr)_64px_auto] items-center gap-3 px-3 sm:px-4 py-2.5 transition-colors group ${
        isActive ? 'bg-[#232633]/85' : 'hover:bg-[#232633]/45'
      }`}
    >
      {/* Index / Equalizer */}
      <div className="flex items-center justify-center">
        {isThisPlaying ? (
          <SoundwaveEqualizer size="sm" />
        ) : (
          <span
            className={`text-xs font-mono ${
              isActive ? 'text-[#E68BA6] font-semibold' : 'text-[#747887]'
            }`}
          >
            {index + 1}
          </span>
        )}
      </div>

      {/* Artwork + Title & Artist */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative w-11 h-11 rounded-[6px] overflow-hidden bg-[#12141B] border border-[#343744] shrink-0">
          <img
            src={track.thumbnail || MUSIC_FALLBACK_SVG}
            alt={track.title}
            onError={handleMusicImageError}
            onLoad={handleMusicImageLoad}
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={() => (isActive ? onTogglePlay() : onPlay(track))}
            aria-label={isThisPlaying ? `Jeda ${track.title}` : `Putar ${track.title}`}
            className="absolute inset-0 bg-[#0B0C10]/65 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[#F2F0EC] transition-opacity cursor-pointer"
          >
            {isThisPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>
        </div>

        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => (isActive ? onTogglePlay() : onPlay(track))}
            className={`text-[13px] sm:text-[14px] font-semibold truncate block text-left w-full hover:underline cursor-pointer ${
              isActive ? 'text-[#E68BA6]' : 'text-[#F2F0EC]'
            }`}
          >
            {track.title}
          </button>
          <p className="text-xs text-[#A2A4B1] truncate">{track.artist}</p>
        </div>
      </div>

      {/* Album (Desktop table column) */}
      <div className="hidden md:block min-w-0">
        <span className="text-xs text-[#A2A4B1] truncate block">
          {track.album || track.tag || 'Single'}
        </span>
      </div>

      {/* Duration */}
      <div className="hidden md:block text-right">
        <span className="text-xs font-mono text-[#747887]">
          {track.durationFormatted || '3:30'}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={() => onAddToQueue(track)}
          title="Tambahkan ke Antrean"
          aria-label={`Tambahkan ${track.title} ke antrean`}
          className="w-9 h-9 rounded-[6px] text-[#747887] hover:text-[#F2F0EC] hover:bg-[#191C25] flex items-center justify-center transition-colors cursor-pointer"
        >
          <ListPlus className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onOpenPlaylistPicker(track)}
          title="Simpan ke Playlist"
          aria-label={`Tambahkan ${track.title} ke playlist`}
          className="w-9 h-9 rounded-[6px] text-[#747887] hover:text-[#F2F0EC] hover:bg-[#191C25] flex items-center justify-center transition-colors cursor-pointer"
        >
          <FolderPlus className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onToggleBookmark(track)}
          title={isBookmarked ? 'Hapus dari Favorit' : 'Simpan ke Favorit'}
          aria-label={isBookmarked ? 'Hapus dari Favorit' : 'Simpan ke Favorit'}
          className="w-9 h-9 rounded-[6px] text-[#747887] hover:text-[#E68BA6] hover:bg-[#191C25] flex items-center justify-center transition-colors cursor-pointer"
        >
          <Heart
            className={`w-4 h-4 ${isBookmarked ? 'fill-[#E68BA6] text-[#E68BA6]' : ''}`}
          />
        </button>

        <button
          type="button"
          onClick={() => (isActive ? onTogglePlay() : onPlay(track))}
          aria-label={isThisPlaying ? 'Jeda' : 'Putar'}
          className={`w-9 h-9 rounded-[10px] flex items-center justify-center transition-colors cursor-pointer ${
            isActive
              ? 'bg-[#F0A15B] text-[#0B0C10]'
              : 'bg-[#232633] hover:bg-[#F0A15B] text-[#F2F0EC] hover:text-[#0B0C10]'
          }`}
        >
          {isThisPlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
        </button>
      </div>
    </div>
  );
});

export function MusicHubPage() {
  usePageMeta({
    title: 'Fazura Music - Streaming Musik & Playlist',
    description:
      'Streaming lagu populer, Pop Indonesia, Anime OST, K-Pop, dan Donghua OST lengkap dengan pemutar audio persisten, lirik, dan playlist.',
    type: 'music.song',
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const playParam = searchParams.get('play');
  const searchParam = searchParams.get('search') || searchParams.get('q') || '';
  const tabParam = (searchParams.get('tab') as MusicTabType) || 'all';

  const [activeTab, setActiveTab] = useState<MusicTabType>(
    tabParam === 'bookmarks' || tabParam === 'history' || tabParam === 'playlists' ? tabParam : 'all'
  );
  const [searchInput, setSearchInput] = useState<string>(searchParam);
  const [searchQuery, setSearchQuery] = useState<string>(searchParam);
  const [searchedList, setSearchedList] = useState<MusicTrackItem[]>(FAZURA_MUSIC_CATALOG);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [pickerTrack, setPickerTrack] = useState<MusicTrackItem | null>(null);
  const [musicToast, setMusicToast] = useState<string | null>(null);
  const [confirmClearHistoryOpen, setConfirmClearHistoryOpen] = useState(false);

  const {
    currentTrack,
    isPlaying,
    playlists,
    playTrack,
    togglePlay,
    setShowLyrics,
    addToQueue,
    createPlaylist,
    deletePlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
  } = useMusic();

  const showMusicToast = useCallback((msg: string) => {
    setMusicToast(msg);
    setTimeout(() => setMusicToast(null), 2600);
  }, []);

  const { bookmarks, isBookmarked, toggleBookmark, removeBookmark } = useCategoryBookmarks('music');
  const { history, clearHistory, removeHistoryItem } = useCategoryHistory('music');

  // Derive Featured Albums from real catalog data
  const featuredAlbums = useMemo(() => {
    const albumMap = new Map<
      string,
      { name: string; artist: string; thumbnail: string; tracks: MusicTrackItem[] }
    >();
    for (const track of FAZURA_MUSIC_CATALOG) {
      if (!track.album) continue;
      const existing = albumMap.get(track.album);
      if (existing) {
        existing.tracks.push(track);
      } else {
        albumMap.set(track.album, {
          name: track.album,
          artist: track.artist,
          thumbnail: track.thumbnail,
          tracks: [track],
        });
      }
    }
    return Array.from(albumMap.values()).slice(0, 12);
  }, []);

  const handleVoiceSearch = () => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showMusicToast('Pencarian suara tidak didukung pada browser ini.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'id-ID';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onstart = () => setIsVoiceListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          setSearchInput(transcript);
          setSearchQuery(transcript);
          setSearchParams({ q: transcript });
        }
        setIsVoiceListening(false);
      };
      recognition.onerror = () => setIsVoiceListening(false);
      recognition.onend = () => setIsVoiceListening(false);
      recognition.start();
    } catch {
      setIsVoiceListening(false);
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchedList(FAZURA_MUSIC_CATALOG);
      setSearchLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await searchMusic(searchQuery.trim());
        setSearchedList(results);
      } catch (err) {
        console.warn('Music search error:', err);
      } finally {
        setSearchLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (playParam) {
      const found =
        getTrackById(playParam) ||
        FAZURA_MUSIC_CATALOG.find((t) => t.id === playParam || t.youtubeId === playParam);
      if (found) {
        playTrack(found, FAZURA_MUSIC_CATALOG);
      }
    }
  }, [playParam]);

  useEffect(() => {
    if (tabParam && tabParam !== activeTab && !searchParam) {
      setActiveTab(tabParam);
    }
    if (searchParam !== searchQuery) {
      setSearchInput(searchParam);
      setSearchQuery(searchParam);
      if (searchParam) setActiveTab('all');
    }
  }, [tabParam, searchParam]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setSearchQuery(searchInput.trim());
    if (activeTab === 'bookmarks' || activeTab === 'history' || activeTab === 'playlists') {
      setActiveTab('all');
    }
    const next = new URLSearchParams(searchParams);
    next.set('search', searchInput.trim());
    next.delete('q');
    setSearchParams(next);
  };

  const handleQuickSearch = (term: string) => {
    setSearchInput(term);
    setSearchQuery(term);
    setActiveTab('all');
    const next = new URLSearchParams(searchParams);
    next.set('search', term);
    next.delete('q');
    setSearchParams(next);
  };

  const handleResetSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    setActiveTab('all');
    const next = new URLSearchParams(searchParams);
    next.delete('search');
    next.delete('q');
    setSearchParams(next);
  };

  const handleSearchInputChange = (val: string) => {
    setSearchInput(val);
    setSearchQuery(val);
    if (val.trim() && (activeTab === 'bookmarks' || activeTab === 'history' || activeTab === 'playlists')) {
      setActiveTab('all');
    }
  };

  const filteredTracks = useMemo(() => {
    let list = searchedList;
    if (activeTab === 'viral') {
      list = list.filter(
        (t) =>
          t.tag?.toLowerCase().includes('global') ||
          t.tag?.toLowerCase().includes('viral') ||
          t.tag?.toLowerCase().includes('top') ||
          t.tag?.toLowerCase().includes('billboard')
      );
    } else if (activeTab === 'pop_indo') {
      list = list.filter((t) => t.genre === 'pop' || t.genre === 'indie' || t.genre === 'acoustic');
    } else if (activeTab === 'anime') {
      list = list.filter((t) => t.genre === 'anime');
    } else if (activeTab === 'donghua') {
      list = list.filter((t) => t.genre === 'donghua');
    } else if (activeTab === 'kpop') {
      list = list.filter((t) => t.genre === 'kpop');
    } else if (activeTab === 'rock') {
      list = list.filter((t) => t.genre === 'rock');
    }
    return list;
  }, [activeTab, searchedList]);

  const recommendedTracks = useMemo(
    () => FAZURA_MUSIC_CATALOG.filter((t) => t.genre === 'pop' || t.genre === 'anime').slice(0, 8),
    []
  );

  const handlePlayTrack = useCallback(
    (track: MusicTrackItem) => playTrack(track, filteredTracks),
    [playTrack, filteredTracks]
  );

  const handleTogglePlay = useCallback(() => togglePlay(), [togglePlay]);

  const handleToggleBookmark = useCallback(
    (track: MusicTrackItem) => {
      toggleBookmark({
        id: track.id,
        category: 'music',
        title: track.title,
        cover: track.thumbnail,
        link: `/music?play=${encodeURIComponent(track.id)}`,
        subtitle: `${track.artist} • ${track.durationFormatted || 'Audio'}`,
        type: 'Lagu',
        addedAt: Date.now(),
        extra: {
          youtubeId: track.youtubeId,
          album: track.album,
          artist: track.artist,
          previewUrl: track.previewUrl,
        },
      });
    },
    [toggleBookmark]
  );

  const handleAddToQueue = useCallback(
    (track: MusicTrackItem) => {
      addToQueue(track);
      showMusicToast(`"${track.title}" ditambahkan ke antrean`);
    },
    [addToQueue, showMusicToast]
  );

  const handleOpenPlaylistPicker = useCallback((track: MusicTrackItem) => {
    setPickerTrack(track);
  }, []);

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    const created = createPlaylist(newPlaylistName);
    if (created) {
      setNewPlaylistName('');
      showMusicToast(`Playlist "${created.name}" berhasil dibuat`);
    }
  };

  const heroTrack = currentTrack || FAZURA_MUSIC_CATALOG[0];
  const isHeroPlaying = isPlaying && currentTrack?.id === heroTrack.id;
  const isHeroBookmarked = isBookmarked(heroTrack.id);

  return (
    <div className="min-h-screen bg-[#12141B] text-[#F2F0EC] pb-24">
      {musicToast && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 px-4 py-2.5 rounded-[10px] bg-[#191C25] border border-[#E68BA6]/45 text-xs font-semibold text-[#F2F0EC] shadow-dialog flex items-center gap-2">
          <Headphones className="w-4 h-4 text-[#E68BA6]" />
          <span>{musicToast}</span>
        </div>
      )}

      {/* 1. Music Discovery Hero (Clean Dark Composition + Muted Rose Accent) */}
      <section className="relative w-full bg-[#0B0C10] border-b border-[#343744] py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-6 md:gap-8">
          <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-[16px] overflow-hidden bg-[#191C25] border border-[#343744] shrink-0">
            <img
              src={heroTrack.thumbnail || MUSIC_FALLBACK_SVG}
              alt={heroTrack.title}
              onError={handleMusicImageError}
              onLoad={handleMusicImageLoad}
              className="w-full h-full object-cover"
            />
            {isHeroPlaying && (
              <span className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-[6px] bg-[#0B0C10]/90 border border-[#343744] text-[10px] font-semibold text-[#E68BA6] flex items-center gap-1.5">
                <SoundwaveEqualizer size="sm" />
                <span>Diputar</span>
              </span>
            )}
          </div>

          <div className="flex-1 text-center md:text-left space-y-3.5 min-w-0 w-full">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <Badge variant="category" category="music">
                Music Discovery
              </Badge>
              {heroTrack.tag && <Badge variant="metadata">{heroTrack.tag}</Badge>}
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#F2F0EC] tracking-tight leading-tight truncate">
              {heroTrack.title}
            </h1>

            <p className="text-sm text-[#A2A4B1]">
              {heroTrack.artist}
              {heroTrack.album ? ` • ${heroTrack.album}` : ''}
              {heroTrack.durationFormatted ? ` • ${heroTrack.durationFormatted}` : ''}
            </p>

            {/* Max 2 Primary/Secondary CTAs + Favorite Heart */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-1">
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  if (currentTrack?.id === heroTrack.id) togglePlay();
                  else playTrack(heroTrack, FAZURA_MUSIC_CATALOG);
                }}
              >
                {isHeroPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Jeda Musik</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                    <span>Putar Sekarang</span>
                  </>
                )}
              </Button>

              <Button variant="secondary" size="lg" onClick={() => setShowLyrics(true)}>
                <Mic2 className="w-4 h-4 text-[#E68BA6]" />
                <span>Lirik & Karaoke</span>
              </Button>

              <button
                type="button"
                onClick={() => handleToggleBookmark(heroTrack)}
                title={isHeroBookmarked ? 'Hapus dari Favorit' : 'Simpan ke Favorit'}
                aria-label={isHeroBookmarked ? 'Hapus dari Favorit' : 'Simpan ke Favorit'}
                className="w-11 h-11 rounded-[10px] bg-[#191C25] hover:bg-[#232633] border border-[#343744] flex items-center justify-center text-[#A2A4B1] hover:text-[#E68BA6] transition-colors cursor-pointer"
              >
                <Heart className={`w-4 h-4 ${isHeroBookmarked ? 'fill-[#E68BA6] text-[#E68BA6]' : ''}`} />
              </button>
            </div>

            {/* Search & Voice Search */}
            <div className="pt-2 max-w-xl mx-auto md:mx-0 space-y-2">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <Search className="w-4 h-4 text-[#747887] absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Cari lagu, artis, atau album..."
                  value={searchInput}
                  onChange={(e) => handleSearchInputChange(e.target.value)}
                  className="w-full h-11 pl-10 pr-36 text-sm bg-[#191C25] border border-[#343744] focus:border-[#E68BA6] rounded-[10px] text-[#F2F0EC] placeholder-[#747887] focus:outline-none transition-colors"
                />
                <div className="absolute right-1.5 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleVoiceSearch}
                    title={isVoiceListening ? 'Mendengarkan...' : 'Cari dengan suara'}
                    aria-label="Cari dengan suara"
                    className={`w-8 h-8 rounded-[6px] flex items-center justify-center transition-colors cursor-pointer ${
                      isVoiceListening
                        ? 'bg-[#E68BA6] text-[#0B0C10]'
                        : 'text-[#A2A4B1] hover:text-[#F2F0EC] hover:bg-[#232633]'
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                  {searchInput && (
                    <button
                      type="button"
                      onClick={handleResetSearch}
                      aria-label="Hapus pencarian"
                      className="w-7 h-8 text-[#747887] hover:text-[#F2F0EC] flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="h-8 px-3.5 rounded-[6px] bg-[#F0A15B] hover:bg-[#F6B779] text-[#0B0C10] text-xs font-semibold cursor-pointer"
                  >
                    Cari
                  </button>
                </div>
              </form>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 text-xs">
                <span className="text-[#747887]">Populer:</span>
                {['Die With A Smile', 'Yoasobi', 'Bernadya', 'Sabrina Carpenter', 'Coldplay'].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleQuickSearch(term)}
                    className="px-2 py-0.5 rounded-[6px] bg-[#191C25] hover:bg-[#232633] text-[#A2A4B1] hover:text-[#F2F0EC] border border-[#343744] transition-colors cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
        {/* 2. Featured Albums (1:1 Square Covers) */}
        {!searchQuery && activeTab === 'all' && featuredAlbums.length > 0 && (
          <section className="space-y-4">
            <SectionHeader
              category="music"
              title="Album & Kompilasi Pilihan"
              subtitle="Klik album untuk langsung memutar kumpulan lagunya"
            />
            <MediaCarousel id="music-albums">
              {featuredAlbums.map((alb) => (
                <button
                  key={alb.name}
                  type="button"
                  onClick={() => playTrack(alb.tracks[0], alb.tracks)}
                  className="group w-[152px] sm:w-[172px] shrink-0 snap-start text-left rounded-[10px] overflow-hidden bg-[#191C25] border border-[#343744] hover:border-[#454958] transition-colors cursor-pointer"
                >
                  <div className="relative aspect-square w-full bg-[#12141B] overflow-hidden">
                    <img
                      src={alb.thumbnail || MUSIC_FALLBACK_SVG}
                      alt={alb.name}
                      loading="lazy"
                      onLoad={handleMusicImageLoad}
                      onError={handleMusicImageError}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-[#0B0C10]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="w-10 h-10 rounded-full bg-[#F0A15B] text-[#0B0C10] flex items-center justify-center">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </span>
                    </div>
                  </div>
                  <div className="p-3 space-y-1">
                    <p className="text-[13px] font-semibold text-[#F2F0EC] group-hover:text-[#F0A15B] truncate">
                      {alb.name}
                    </p>
                    <p className="text-xs text-[#A2A4B1] truncate">
                      {alb.artist} • {alb.tracks.length} lagu
                    </p>
                  </div>
                </button>
              ))}
            </MediaCarousel>
          </section>
        )}

        {/* 3. Recently Played Shelf */}
        <HubHistoryShelf category="music" />

        {/* 4. Mood / Library Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-[#343744]/60">
          {GENRE_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const count =
              tab.id === 'bookmarks'
                ? bookmarks.length
                : tab.id === 'playlists'
                ? playlists.length
                : tab.id === 'history'
                ? history.length
                : undefined;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] text-[13px] font-semibold border transition-colors shrink-0 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#E68BA6]/15 text-[#E68BA6] border-[#E68BA6]/45'
                    : 'bg-[#191C25] text-[#A2A4B1] hover:text-[#F2F0EC] border-[#343744] hover:border-[#454958]'
                }`}
              >
                <span>{tab.label}</span>
                {typeof count === 'number' && count > 0 && (
                  <span className="px-1.5 py-0.2 rounded-[6px] bg-[#232633] text-[#F2F0EC] text-[11px]">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 5. Active Tab Content */}
        {activeTab === 'playlists' ? (
          <div className="space-y-6">
            <SectionHeader
              category="music"
              title={`Playlist Saya (${playlists.length})`}
              subtitle="Kelola playlist musik lokal Anda yang tersimpan otomatis"
              rightSlot={
                <form onSubmit={handleCreatePlaylist} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nama playlist baru..."
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    className="h-9 px-3 text-xs bg-[#191C25] border border-[#343744] rounded-[10px] text-[#F2F0EC] placeholder-[#747887] focus:outline-none focus:border-[#E68BA6]"
                  />
                  <Button type="submit" variant="primary" size="sm" disabled={!newPlaylistName.trim()}>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Buat</span>
                  </Button>
                </form>
              }
            />

            {playlists.length === 0 ? (
              <EmptyState
                icon={<FolderPlus className="w-5 h-5" />}
                title="Belum Ada Playlist"
                description="Buat playlist baru di atas atau tekan ikon folder pada lagu mana saja untuk menambahkannya."
              />
            ) : (
              <div className="space-y-4">
                {playlists.map((pl) => (
                  <div
                    key={pl.id}
                    className="rounded-[16px] bg-[#191C25] border border-[#343744] overflow-hidden"
                  >
                    <div className="px-4 py-3.5 bg-[#232633]/60 border-b border-[#343744] flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="font-heading text-base font-semibold text-[#F2F0EC] truncate">
                          {pl.name}
                        </h4>
                        <p className="text-xs text-[#A2A4B1]">{pl.tracks.length} lagu</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {pl.tracks.length > 0 && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => playTrack(pl.tracks[0], pl.tracks)}
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Putar</span>
                          </Button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            deletePlaylist(pl.id);
                            showMusicToast(`Playlist "${pl.name}" dihapus`);
                          }}
                          title="Hapus playlist"
                          className="w-9 h-9 rounded-[10px] text-[#747887] hover:text-rose-400 hover:bg-[#191C25] flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {pl.tracks.length === 0 ? (
                      <p className="p-4 text-xs text-[#A2A4B1] text-center">
                        Playlist masih kosong. Tambahkan lagu dari daftar pustaka musik.
                      </p>
                    ) : (
                      <div className="divide-y divide-[#343744]/50">
                        {pl.tracks.map((tr, idx) => (
                          <div
                            key={`${pl.id}-${tr.id}`}
                            className="flex items-center justify-between px-4 py-2.5 hover:bg-[#232633]/40 transition-colors"
                          >
                            <button
                              type="button"
                              onClick={() => playTrack(tr, pl.tracks)}
                              className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer"
                            >
                              <span className="text-xs font-mono text-[#747887] w-4">{idx + 1}</span>
                              <img
                                src={tr.thumbnail || MUSIC_FALLBACK_SVG}
                                alt={tr.title}
                                onError={handleMusicImageError}
                                onLoad={handleMusicImageLoad}
                                className="w-9 h-9 rounded-[6px] object-cover shrink-0 bg-[#12141B]"
                              />
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-[#F2F0EC] truncate">{tr.title}</p>
                                <p className="text-[11px] text-[#A2A4B1] truncate">{tr.artist}</p>
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() => removeTrackFromPlaylist(pl.id, tr.id)}
                              title="Keluarkan dari playlist"
                              className="p-1.5 rounded-[6px] text-[#747887] hover:text-rose-400 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === 'bookmarks' ? (
          <div className="space-y-4">
            <SectionHeader
              category="music"
              title={`Lagu Favorit Saya (${bookmarks.length})`}
              subtitle="Koleksi trek musik yang Anda simpan"
              rightSlot={
                bookmarks.length > 0 ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      const tracks: MusicTrackItem[] = bookmarks.map((b) => ({
                        id: b.id,
                        youtubeId: b.extra?.youtubeId || b.id,
                        title: b.title,
                        artist: b.extra?.artist || b.subtitle || 'FazuraStream',
                        thumbnail: b.cover,
                        previewUrl: b.extra?.previewUrl,
                      }));
                      if (tracks.length > 0) playTrack(tracks[0], tracks);
                    }}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Putar Semua</span>
                  </Button>
                ) : undefined
              }
            />

            {bookmarks.length > 0 ? (
              <div className="rounded-[16px] bg-[#191C25] border border-[#343744] overflow-hidden divide-y divide-[#343744]/50">
                {bookmarks.map((b, idx) => {
                  const isTrackActive = currentTrack?.id === b.id;
                  const matchTrack = getTrackById(b.id) ||
                    FAZURA_MUSIC_CATALOG.find((t) => t.id === b.id) || {
                      id: b.id,
                      youtubeId: b.extra?.youtubeId || b.id,
                      title: b.title,
                      artist: b.extra?.artist || b.subtitle || 'FazuraStream',
                      thumbnail: b.cover,
                      previewUrl: b.extra?.previewUrl,
                    };

                  return (
                    <div
                      key={b.id}
                      className="flex items-center justify-between px-4 py-3 hover:bg-[#232633]/40 transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => (isTrackActive ? togglePlay() : playTrack(matchTrack, FAZURA_MUSIC_CATALOG))}
                        className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer"
                      >
                        <span className="w-5 text-xs font-mono text-[#747887]">{idx + 1}</span>
                        <img
                          src={b.cover || MUSIC_FALLBACK_SVG}
                          alt={b.title}
                          onError={handleMusicImageError}
                          onLoad={handleMusicImageLoad}
                          className="w-11 h-11 rounded-[6px] object-cover shrink-0 bg-[#12141B]"
                        />
                        <div className="min-w-0">
                          <p
                            className={`text-[13px] font-semibold truncate ${
                              isTrackActive ? 'text-[#E68BA6]' : 'text-[#F2F0EC]'
                            }`}
                          >
                            {b.title}
                          </p>
                          <p className="text-xs text-[#A2A4B1] truncate">{b.subtitle || 'Musik'}</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => removeBookmark(b.id)}
                        title="Hapus dari Favorit"
                        className="p-2 rounded-[6px] text-[#747887] hover:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={<Heart className="w-5 h-5" />}
                title="Belum Ada Lagu Favorit"
                description="Tekan ikon hati pada lagu mana pun untuk menyimpannya di koleksi ini."
                actionLabel="Jelajahi Musik"
                onAction={() => setActiveTab('all')}
              />
            )}
          </div>
        ) : activeTab === 'history' ? (
          <div className="space-y-4">
            <SectionHeader
              category="music"
              title={`Riwayat Pemutaran (${history.length})`}
              subtitle="Lagu yang baru-baru ini Anda putar"
              rightSlot={
                history.length > 0 ? (
                  <Button variant="danger" size="sm" onClick={() => setConfirmClearHistoryOpen(true)}>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Semua</span>
                  </Button>
                ) : undefined
              }
            />

            {history.length > 0 ? (
              <div className="rounded-[16px] bg-[#191C25] border border-[#343744] overflow-hidden divide-y divide-[#343744]/50">
                {history.map((h, idx) => {
                  const isTrackActive = currentTrack?.id === h.id;
                  const matchTrack = getTrackById(h.id) ||
                    FAZURA_MUSIC_CATALOG.find((t) => t.id === h.id) || {
                      id: h.id,
                      youtubeId: h.extra?.youtubeId || h.id,
                      title: h.title,
                      artist: h.extra?.artist || 'FazuraStream',
                      thumbnail: h.cover,
                      previewUrl: h.extra?.previewUrl,
                    };

                  return (
                    <div
                      key={`${h.id}-${idx}`}
                      className="flex items-center justify-between px-4 py-3 hover:bg-[#232633]/40 transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => playTrack(matchTrack, FAZURA_MUSIC_CATALOG)}
                        className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer"
                      >
                        <span className="w-5 text-xs font-mono text-[#747887]">{idx + 1}</span>
                        <img
                          src={h.cover || MUSIC_FALLBACK_SVG}
                          alt={h.title}
                          onError={handleMusicImageError}
                          onLoad={handleMusicImageLoad}
                          className="w-11 h-11 rounded-[6px] object-cover shrink-0 bg-[#12141B]"
                        />
                        <div className="min-w-0">
                          <p
                            className={`text-[13px] font-semibold truncate ${
                              isTrackActive ? 'text-[#E68BA6]' : 'text-[#F2F0EC]'
                            }`}
                          >
                            {h.title}
                          </p>
                          <p className="text-xs text-[#A2A4B1] truncate">
                            {h.lastItemTitle || 'Baru saja diputar'}
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => removeHistoryItem(h.id)}
                        title="Hapus dari riwayat"
                        className="p-2 rounded-[6px] text-[#747887] hover:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={<History className="w-5 h-5" />}
                title="Belum Ada Riwayat Putar"
                description="Lagu yang Anda putar akan tercatat secara otomatis di sini."
                actionLabel="Jelajahi Musik"
                onAction={() => setActiveTab('all')}
              />
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Recommended Quick Picks when on default All view without query */}
            {activeTab === 'all' && !searchQuery && recommendedTracks.length > 0 && (
              <section className="space-y-4">
                <SectionHeader
                  category="music"
                  title="Rekomendasi Pilihan"
                  subtitle="Koleksi Pop, Anime OST, dan lagu unggulan siap putar"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {recommendedTracks.map((tr) => {
                    const isAct = currentTrack?.id === tr.id;
                    return (
                      <button
                        key={`rec-${tr.id}`}
                        type="button"
                        onClick={() => (isAct ? togglePlay() : playTrack(tr, recommendedTracks))}
                        className={`flex items-center gap-3 p-2.5 rounded-[10px] bg-[#191C25] border text-left transition-colors cursor-pointer group ${
                          isAct
                            ? 'border-[#E68BA6]'
                            : 'border-[#343744] hover:border-[#454958]'
                        }`}
                      >
                        <img
                          src={tr.thumbnail || MUSIC_FALLBACK_SVG}
                          alt={tr.title}
                          loading="lazy"
                          onLoad={handleMusicImageLoad}
                          onError={handleMusicImageError}
                          className="w-12 h-12 rounded-[6px] object-cover shrink-0 bg-[#12141B]"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-semibold text-[#F2F0EC] group-hover:text-[#F0A15B] truncate">
                            {tr.title}
                          </p>
                          <p className="text-xs text-[#A2A4B1] truncate">{tr.artist}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Main Track Table / List */}
            <section className="space-y-4">
              <SectionHeader
                category="music"
                title={
                  searchQuery
                    ? `Hasil Pencarian: "${searchQuery}" (${filteredTracks.length})`
                    : `Pustaka Lagu (${filteredTracks.length})`
                }
                subtitle="Klik lagu untuk memutar pada pemutar persisten di bagian bawah"
                rightSlot={
                  searchQuery ? (
                    <Button variant="ghost" size="sm" onClick={handleResetSearch}>
                      <X className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </Button>
                  ) : undefined
                }
              />

              {searchLoading ? (
                <div className="py-16 text-center rounded-[16px] bg-[#191C25] border border-[#343744] space-y-3">
                  <Loader2 className="w-8 h-8 text-[#E68BA6] animate-spin mx-auto" />
                  <p className="text-xs text-[#A2A4B1]">Mencari lagu di katalog musik...</p>
                </div>
              ) : filteredTracks.length > 0 ? (
                <div className="rounded-[16px] bg-[#191C25] border border-[#343744] overflow-hidden">
                  {/* Table Column Header on Desktop */}
                  <div className="hidden md:grid grid-cols-[36px_minmax(0,2fr)_minmax(0,1.2fr)_64px_auto] gap-3 px-4 py-2.5 bg-[#12141B] border-b border-[#343744] text-[11px] font-semibold uppercase tracking-wider text-[#747887]">
                    <span className="text-center">#</span>
                    <span>Judul &amp; Artis</span>
                    <span>Album</span>
                    <span className="text-right">Durasi</span>
                    <span className="text-right pr-2">Aksi</span>
                  </div>

                  <div className="divide-y divide-[#343744]/50">
                    {filteredTracks.map((track, idx) => (
                      <TrackRow
                        key={track.id}
                        track={track}
                        index={idx}
                        isActive={currentTrack?.id === track.id}
                        isPlaying={isPlaying}
                        isBookmarked={isBookmarked(track.id)}
                        onPlay={handlePlayTrack}
                        onTogglePlay={handleTogglePlay}
                        onToggleBookmark={handleToggleBookmark}
                        onAddToQueue={handleAddToQueue}
                        onOpenPlaylistPicker={handleOpenPlaylistPicker}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyState
                  icon={<Disc3 className="w-5 h-5" />}
                  title="Lagu Tidak Ditemukan"
                  description={`Tidak ada hasil yang cocok untuk "${searchQuery}".`}
                  actionLabel="Tampilkan Semua Lagu"
                  onAction={handleResetSearch}
                />
              )}
            </section>
          </div>
        )}
      </div>

      {/* Playlist Picker Modal */}
      {pickerTrack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0C10]/80 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setPickerTrack(null)} />
          <div className="relative w-full max-w-md rounded-[16px] bg-[#191C25] border border-[#343744] p-5 shadow-dialog z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-[#343744] pb-3">
              <div className="min-w-0">
                <h3 className="font-heading text-base font-semibold text-[#F2F0EC]">
                  Simpan ke Playlist
                </h3>
                <p className="text-xs text-[#A2A4B1] truncate mt-0.5">{pickerTrack.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setPickerTrack(null)}
                aria-label="Tutup modal playlist"
                className="w-9 h-9 rounded-[10px] text-[#747887] hover:text-[#F2F0EC] hover:bg-[#232633] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePlaylist} className="flex gap-2">
              <input
                type="text"
                placeholder="Nama playlist baru..."
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                className="flex-1 h-10 px-3 text-xs bg-[#12141B] border border-[#343744] rounded-[10px] text-[#F2F0EC] placeholder-[#747887] focus:outline-none focus:border-[#E68BA6]"
              />
              <Button type="submit" variant="primary" size="md" disabled={!newPlaylistName.trim()}>
                <Plus className="w-4 h-4" />
                <span>Buat</span>
              </Button>
            </form>

            <div className="max-h-60 overflow-y-auto space-y-1.5">
              {playlists.length === 0 ? (
                <p className="py-6 text-center text-xs text-[#A2A4B1]">
                  Belum ada playlist. Buat playlist pertamamu di atas.
                </p>
              ) : (
                playlists.map((pl) => {
                  const alreadyIn = pl.tracks.some((t) => t.id === pickerTrack.id);
                  return (
                    <button
                      type="button"
                      key={pl.id}
                      onClick={() => {
                        if (!alreadyIn) {
                          addTrackToPlaylist(pl.id, pickerTrack);
                          showMusicToast(`Ditambahkan ke "${pl.name}"`);
                        }
                        setPickerTrack(null);
                      }}
                      className="w-full p-3 rounded-[10px] bg-[#12141B] hover:bg-[#232633] border border-[#343744] flex items-center justify-between text-left transition-colors cursor-pointer"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#F2F0EC] truncate">{pl.name}</p>
                        <p className="text-[11px] text-[#A2A4B1]">{pl.tracks.length} lagu</p>
                      </div>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-[6px] ${
                          alreadyIn
                            ? 'bg-[#75C9A0]/15 text-[#75C9A0]'
                            : 'bg-[#F0A15B]/15 text-[#F0A15B]'
                        }`}
                      >
                        {alreadyIn ? 'Tersimpan' : '+ Tambah'}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmClearHistoryOpen}
        title="Hapus Semua Riwayat Musik?"
        message="Seluruh riwayat pemutaran lagu lokal Anda akan dibersihkan."
        confirmLabel="Hapus Semua"
        variant="danger"
        onConfirm={() => {
          clearHistory();
          setConfirmClearHistoryOpen(false);
        }}
        onCancel={() => setConfirmClearHistoryOpen(false)}
      />
    </div>
  );
}
