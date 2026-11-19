import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Headphones,
  Play,
  Pause,
  Heart,
  Search,
  Sparkles,
  Flame,
  Radio,
  Bookmark,
  History,
  Trash2,
  Mic2,
  Music,
  Disc3,
  TrendingUp,
  Volume2,
} from 'lucide-react';
import { FAZURA_MUSIC_CATALOG, type MusicTrackItem } from '../services/musicApi';
import { useMusic } from '../context/MusicContext';
import { useCategoryBookmarks, useCategoryHistory } from '../services/categoryStorage';

type MusicTabType = 'all' | 'viral' | 'pop_indo' | 'anime' | 'rock' | 'bookmarks' | 'history';

export function MusicHubPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const playParam = searchParams.get('play');
  const tabParam = (searchParams.get('tab') as MusicTabType) || 'all';

  const [activeTab, setActiveTab] = useState<MusicTabType>(
    tabParam === 'bookmarks' || tabParam === 'history' ? tabParam : 'all'
  );
  const [searchQuery, setSearchQuery] = useState<string>('');

  const {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    setShowLyrics,
  } = useMusic();

  const {
    bookmarks,
    isBookmarked,
    toggleBookmark,
    removeBookmark,
  } = useCategoryBookmarks('music');

  const {
    history,
    clearHistory,
    removeHistoryItem,
  } = useCategoryHistory('music');

  // Handle auto-play from query param (?play=t-diewithasmile)
  useEffect(() => {
    if (playParam) {
      const found = FAZURA_MUSIC_CATALOG.find(
        (t) => t.id === playParam || t.youtubeId === playParam
      );
      if (found) {
        playTrack(found, FAZURA_MUSIC_CATALOG);
      }
    }
  }, [playParam]);

  // Sync tab with search params
  useEffect(() => {
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Filtered tracks based on query and active tab
  const filteredTracks = useMemo(() => {
    let list = FAZURA_MUSIC_CATALOG;

    if (activeTab === 'viral') {
      list = list.filter((t) => t.tag?.toLowerCase().includes('global') || t.tag?.toLowerCase().includes('viral') || t.tag?.toLowerCase().includes('top'));
    } else if (activeTab === 'pop_indo') {
      list = list.filter((t) => t.genre === 'pop' || t.genre === 'indie' || t.genre === 'acoustic');
    } else if (activeTab === 'anime') {
      list = list.filter((t) => t.genre === 'anime');
    } else if (activeTab === 'rock') {
      list = list.filter((t) => t.genre === 'rock');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.artist.toLowerCase().includes(q) ||
          (t.album && t.album.toLowerCase().includes(q)) ||
          (t.tag && t.tag.toLowerCase().includes(q))
      );
    }

    return list;
  }, [activeTab, searchQuery]);

  const heroTrack = currentTrack || FAZURA_MUSIC_CATALOG[0];
  const isHeroPlaying = isPlaying && currentTrack?.id === heroTrack.id;
  const isHeroBookmarked = isBookmarked(heroTrack.id);

  const handleHeroBookmark = () => {
    toggleBookmark({
      id: heroTrack.id,
      category: 'music',
      title: heroTrack.title,
      cover: heroTrack.thumbnail,
      link: `/music?play=${encodeURIComponent(heroTrack.id)}`,
      subtitle: `${heroTrack.artist} • ${heroTrack.durationFormatted || 'Audio'}`,
      type: 'Lagu',
      addedAt: Date.now(),
      extra: {
        youtubeId: heroTrack.youtubeId,
        album: heroTrack.album,
      },
    });
  };

  return (
    <div className="flex-1 w-full bg-[#0a0d14] text-slate-100 min-h-screen pb-28">
      {/* Top Hero Spotlight */}
      <div className="relative w-full overflow-hidden bg-gradient-to-b from-[#151c2c] to-[#0a0d14] border-b border-white/5 py-8 md:py-14 px-4 sm:px-6 lg:px-8">
        {/* Ambient Blur Background */}
        <div
          className="absolute inset-0 opacity-20 filter blur-3xl scale-125 bg-cover bg-center pointer-events-none"
          style={{ backgroundImage: `url(${heroTrack.thumbnail})` }}
        />

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-10">
          {/* Album Cover Art */}
          <div className="relative group shrink-0">
            <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden shadow-2xl shadow-black/80 border border-white/10 group-hover:scale-105 transition-transform duration-300">
              <img
                src={heroTrack.thumbnail}
                alt={heroTrack.title}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://i.ytimg.com/vi/kPa7bsKwL-c/hqdefault.jpg";
                }}
                className="w-full h-full object-cover"
              />
            </div>
            {isHeroPlaying && (
              <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-[#1DB954] text-black text-[10px] font-black uppercase flex items-center gap-1 shadow-lg">
                <Volume2 className="w-3 h-3 animate-pulse" /> Sedang Diputar
              </span>
            )}
          </div>

          {/* Hero Details */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="px-2.5 py-1 rounded-full bg-[#1DB954]/20 border border-[#1DB954]/30 text-[#1DB954] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Headphones className="w-3.5 h-3.5" /> Music Spotlight
              </span>
              {heroTrack.tag && (
                <span className="px-2.5 py-1 rounded-full bg-white/10 text-white text-xs font-semibold">
                  {heroTrack.tag}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              {heroTrack.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-medium">
              {heroTrack.artist} {heroTrack.album ? `• ${heroTrack.album}` : ''}
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <button
                onClick={() => {
                  if (currentTrack?.id === heroTrack.id) {
                    togglePlay();
                  } else {
                    playTrack(heroTrack, FAZURA_MUSIC_CATALOG);
                  }
                }}
                className="px-6 py-3 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-sm flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg shadow-[#1DB954]/25"
              >
                {isHeroPlaying ? (
                  <>
                    <Pause className="w-5 h-5 fill-current" /> Jeda Musik
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current ml-0.5" /> Putar Sekarang
                  </>
                )}
              </button>

              <button
                onClick={handleHeroBookmark}
                className={`px-4 py-3 rounded-full border transition-all text-sm font-semibold flex items-center gap-2 ${
                  isHeroBookmarked
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                    : 'bg-white/5 hover:bg-white/10 text-slate-200 border-white/10'
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${
                    isHeroBookmarked ? 'fill-rose-500 text-rose-500' : 'text-slate-300'
                  }`}
                />
                {isHeroBookmarked ? 'Tersimpan di Favorit' : 'Tambah ke Favorit'}
              </button>

              <button
                onClick={() => setShowLyrics(true)}
                className="px-4 py-3 rounded-full bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-sm font-semibold flex items-center gap-2 transition-colors"
              >
                <Mic2 className="w-4 h-4 text-[#1DB954]" /> Lirik Real-Time
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Navigation Tabs & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none text-xs sm:text-sm font-semibold">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-2 rounded-xl transition-all shrink-0 ${
                activeTab === 'all'
                  ? 'bg-white/10 text-white font-bold border border-white/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Semua Lagu
            </button>

            <button
              onClick={() => setActiveTab('viral')}
              className={`px-3.5 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 ${
                activeTab === 'viral'
                  ? 'bg-[#1DB954]/20 text-[#1DB954] font-bold border border-[#1DB954]/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Flame className="w-3.5 h-3.5" /> Viral Hits
            </button>

            <button
              onClick={() => setActiveTab('pop_indo')}
              className={`px-3.5 py-2 rounded-xl transition-all shrink-0 ${
                activeTab === 'pop_indo'
                  ? 'bg-[#1DB954]/20 text-[#1DB954] font-bold border border-[#1DB954]/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Pop Indonesia
            </button>

            <button
              onClick={() => setActiveTab('anime')}
              className={`px-3.5 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 ${
                activeTab === 'anime'
                  ? 'bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Disc3 className="w-3.5 h-3.5" /> Anime & Donghua OST
            </button>

            <button
              onClick={() => setActiveTab('rock')}
              className={`px-3.5 py-2 rounded-xl transition-all shrink-0 ${
                activeTab === 'rock'
                  ? 'bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Rock & Klasik
            </button>

            {/* Category Bookmarks Tab */}
            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`px-3.5 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 ${
                activeTab === 'bookmarks'
                  ? 'bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Heart className="w-3.5 h-3.5 fill-rose-500/30" />
              Lagu Favorit
              {bookmarks.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500/30 text-rose-300 text-[10px] font-bold">
                  {bookmarks.length}
                </span>
              )}
            </button>

            {/* Category History Tab */}
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-indigo-500/20 text-indigo-400 font-bold border border-indigo-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <History className="w-3.5 h-3.5 text-indigo-400" />
              Riwayat Putar
              {history.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/30 text-indigo-300 text-[10px] font-bold">
                  {history.length}
                </span>
              )}
            </button>
          </div>

          {/* Live Search Input */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari lagu, artis, album..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#111622] border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-[#1DB954] transition-all"
            />
          </div>
        </div>

        {/* ======================================================== */}
        {/* VIEW 1: BOOKMARKS TAB (LAGU FAVORIT)                     */}
        {/* ======================================================== */}
        {activeTab === 'bookmarks' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                  Koleksi Lagu Favorit Saya
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Daftar lagu favorit khusus kategori Musik FAZURAVERSE ({bookmarks.length} lagu tersimpan).
                </p>
              </div>
            </div>

            {bookmarks.length > 0 ? (
              <div className="bg-[#111622] border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
                {bookmarks.map((b, idx) => {
                  const isTrackActive = currentTrack?.id === b.id;
                  const isTrackPlaying = isTrackActive && isPlaying;

                  return (
                    <div
                      key={b.id}
                      className="flex items-center justify-between p-3 sm:p-4 hover:bg-white/5 transition-colors group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <span className="text-xs font-mono text-slate-500 w-6 text-center shrink-0">
                          {idx + 1}
                        </span>

                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-800 shrink-0 shadow-md">
                          <img
                            src={b.cover}
                            alt={b.title}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => {
                              const matchTrack = FAZURA_MUSIC_CATALOG.find((t) => t.id === b.id) || {
                                id: b.id,
                                youtubeId: b.extra?.youtubeId || b.id,
                                title: b.title,
                                artist: b.extra?.artist || b.subtitle || 'FAZURAVERSE',
                                thumbnail: b.cover,
                              };
                              if (isTrackActive) {
                                togglePlay();
                              } else {
                                playTrack(matchTrack, FAZURA_MUSIC_CATALOG);
                              }
                            }}
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                          >
                            {isTrackPlaying ? (
                              <Pause className="w-5 h-5 fill-current" />
                            ) : (
                              <Play className="w-5 h-5 fill-current ml-0.5" />
                            )}
                          </button>
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4
                            onClick={() => {
                              const matchTrack = FAZURA_MUSIC_CATALOG.find((t) => t.id === b.id) || {
                                id: b.id,
                                youtubeId: b.extra?.youtubeId || b.id,
                                title: b.title,
                                artist: b.extra?.artist || b.subtitle || 'FAZURAVERSE',
                                thumbnail: b.cover,
                              };
                              playTrack(matchTrack, FAZURA_MUSIC_CATALOG);
                            }}
                            className={`text-sm font-bold truncate cursor-pointer hover:underline ${
                              isTrackActive ? 'text-[#1DB954]' : 'text-white'
                            }`}
                          >
                            {b.title}
                          </h4>
                          <p className="text-xs text-slate-400 truncate">
                            {b.subtitle || 'FAZURAVERSE Music'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          onClick={() => removeBookmark(b.id)}
                          title="Hapus dari Bookmark Musik"
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center bg-[#111622] rounded-2xl border border-white/5 space-y-3 p-6">
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                  <Heart className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white">Belum Ada Lagu Favorit</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Tekan tombol ikon hati pada lagu manapun untuk menyimpannya ke koleksi lagu favorit Anda.
                </p>
                <button
                  onClick={() => setActiveTab('all')}
                  className="px-4 py-2 rounded-xl bg-[#1DB954] text-black font-bold text-xs"
                >
                  Jelajahi Musik
                </button>
              </div>
            )}
          </div>
        ) : activeTab === 'history' ? (
          /* ======================================================== */
          /* VIEW 2: HISTORY TAB (RIWAYAT PUTAR)                      */
          /* ======================================================== */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-400" />
                  Riwayat Pemutaran Musik
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Lagu-lagu yang baru saja Anda dengarkan di FAZURAVERSE ({history.length} lagu).
                </p>
              </div>

              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 text-xs font-semibold text-slate-400 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Hapus Semua Riwayat
                </button>
              )}
            </div>

            {history.length > 0 ? (
              <div className="bg-[#111622] border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
                {history.map((h, idx) => {
                  const isTrackActive = currentTrack?.id === h.id;
                  const isTrackPlaying = isTrackActive && isPlaying;
                  const timeStr = new Date(h.watchedAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={`${h.id}-${idx}`}
                      className="flex items-center justify-between p-3 sm:p-4 hover:bg-white/5 transition-colors group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <span className="text-xs font-mono text-slate-500 w-6 text-center shrink-0">
                          {idx + 1}
                        </span>

                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-800 shrink-0 shadow-md">
                          <img
                            src={h.cover}
                            alt={h.title}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => {
                              const matchTrack = FAZURA_MUSIC_CATALOG.find((t) => t.id === h.id) || {
                                id: h.id,
                                youtubeId: h.extra?.youtubeId || h.id,
                                title: h.title,
                                artist: h.extra?.artist || 'FAZURAVERSE',
                                thumbnail: h.cover,
                              };
                              if (isTrackActive) {
                                togglePlay();
                              } else {
                                playTrack(matchTrack, FAZURA_MUSIC_CATALOG);
                              }
                            }}
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                          >
                            {isTrackPlaying ? (
                              <Pause className="w-5 h-5 fill-current" />
                            ) : (
                              <Play className="w-5 h-5 fill-current ml-0.5" />
                            )}
                          </button>
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4
                            onClick={() => {
                              const matchTrack = FAZURA_MUSIC_CATALOG.find((t) => t.id === h.id) || {
                                id: h.id,
                                youtubeId: h.extra?.youtubeId || h.id,
                                title: h.title,
                                artist: h.extra?.artist || 'FAZURAVERSE',
                                thumbnail: h.cover,
                              };
                              playTrack(matchTrack, FAZURA_MUSIC_CATALOG);
                            }}
                            className={`text-sm font-bold truncate cursor-pointer hover:underline ${
                              isTrackActive ? 'text-[#1DB954]' : 'text-white'
                            }`}
                          >
                            {h.title}
                          </h4>
                          <p className="text-xs text-slate-400 truncate">
                            {h.lastItemTitle || 'Baru saja diputar'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 text-right">
                        <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                          Diputar {timeStr}
                        </span>
                        <button
                          onClick={() => removeHistoryItem(h.id)}
                          title="Hapus item riwayat"
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center bg-[#111622] rounded-2xl border border-white/5 space-y-3 p-6">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                  <History className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white">Belum Ada Riwayat Pemutaran</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Lagu yang Anda putar akan tercatat secara otomatis di sini sehingga mudah untuk diputar kembali.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* ======================================================== */
          /* VIEW 3: TRACK LIST / TABLE                               */
          /* ======================================================== */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Music className="w-5 h-5 text-[#1DB954]" />
                  Daftar Lagu ({filteredTracks.length} Lagu Tersedia)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Klik lagu untuk memutar langsung audio YouTube kualitas tinggi dengan kontrol Spotify.
                </p>
              </div>
            </div>

            <div className="bg-[#111622] border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
              {filteredTracks.map((track, idx) => {
                const isTrackActive = currentTrack?.id === track.id;
                const isTrackPlaying = isTrackActive && isPlaying;
                const trackBookmarked = isBookmarked(track.id);

                return (
                  <div
                    key={track.id}
                    className={`flex items-center justify-between p-3 sm:p-4 hover:bg-white/5 transition-colors group ${
                      isTrackActive ? 'bg-[#1DB954]/5' : ''
                    }`}
                  >
                    {/* Left: Number, Poster, Title & Artist */}
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                      <span className="text-xs font-mono text-slate-500 w-5 text-center shrink-0">
                        {idx + 1}
                      </span>

                      <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-slate-800 shrink-0 shadow-md">
                        <img
                          src={track.thumbnail}
                          alt={track.title}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://i.ytimg.com/vi/kPa7bsKwL-c/hqdefault.jpg";
                          }}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => {
                            if (isTrackActive) {
                              togglePlay();
                            } else {
                              playTrack(track, filteredTracks);
                            }
                          }}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                        >
                          {isTrackPlaying ? (
                            <Pause className="w-5 h-5 fill-current" />
                          ) : (
                            <Play className="w-5 h-5 fill-current ml-0.5" />
                          )}
                        </button>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4
                            onClick={() => playTrack(track, filteredTracks)}
                            className={`text-xs sm:text-sm font-bold truncate cursor-pointer hover:underline ${
                              isTrackActive ? 'text-[#1DB954]' : 'text-white'
                            }`}
                          >
                            {track.title}
                          </h4>
                          {track.tag && (
                            <span className="hidden sm:inline-block text-[9px] px-1.5 py-0.2 rounded font-semibold bg-white/10 text-slate-300">
                              {track.tag}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] sm:text-xs text-slate-400 truncate mt-0.5">
                          {track.artist} {track.album ? `• ${track.album}` : ''}
                        </p>
                      </div>
                    </div>

                    {/* Right: Actions, Duration & Bookmark */}
                    <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                      <span className="text-xs font-mono text-slate-400">
                        {track.durationFormatted || '3:30'}
                      </span>

                      <button
                        onClick={() =>
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
                            },
                          })
                        }
                        title={trackBookmarked ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                      >
                        <Heart
                          className={`w-4 h-4 transition-colors ${
                            trackBookmarked ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
                          }`}
                        />
                      </button>

                      <button
                        onClick={() => {
                          if (isTrackActive) {
                            togglePlay();
                          } else {
                            playTrack(track, filteredTracks);
                          }
                        }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          isTrackActive
                            ? 'bg-[#1DB954] text-black shadow-md shadow-[#1DB954]/30'
                            : 'bg-white/10 hover:bg-[#1DB954] hover:text-black text-white'
                        }`}
                      >
                        {isTrackPlaying ? (
                          <Pause className="w-4 h-4 fill-current" />
                        ) : (
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
