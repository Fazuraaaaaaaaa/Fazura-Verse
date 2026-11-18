import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  BookOpen,
  Film,
  Tv,
  Bookmark,
  History,
  Compass,
  Search,
  Menu,
  X,
  Loader2,
  Clapperboard,
  Headphones,
} from 'lucide-react';
import { useBookmarks } from '../hooks/useBookmarks';
import { search as searchManga } from '../services/api';
import { searchOtakudesu } from '../services/animeApi';
import { searchDonghua } from '../services/donghuaApi';
import { getMovies } from '../services/movieApi';
import { searchMusic } from '../services/musicApi';

interface SearchDropdownItem {
  id: string;
  title: string;
  poster: string;
  typeLabel: string;
  badgeStyle: string;
  link: string;
  subtitle?: string;
}

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchDropdownItem[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { bookmarks } = useBookmarks();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const q = searchQuery.trim();
        const [mangaRes, animeRes, donghuaRes, movieRes, musicRes] = await Promise.allSettled([
          searchManga(q),
          searchOtakudesu(q),
          searchDonghua(q),
          getMovies({ q, perPage: 2 }),
          searchMusic(q),
        ]);

        const combined: SearchDropdownItem[] = [];

        // 1. Movie & Series matches (up to 2)
        if (movieRes.status === 'fulfilled' && movieRes.value?.data) {
          movieRes.value.data.slice(0, 2).forEach((m) => {
            combined.push({
              id: `movie-${m.id}`,
              title: m.title,
              poster: m.posterUrl || '',
              typeLabel: m.mediaType === 'tv' ? 'Series' : 'Movie',
              badgeStyle: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
              link: `/movies/${m.id}`,
              subtitle: m.ratingValue ? `★ ${m.ratingValue.toFixed(1)}` : 'Cinema',
            });
          });
        }

        // 2. Anime matches (up to 3)
        if (animeRes.status === 'fulfilled' && Array.isArray(animeRes.value)) {
          animeRes.value.slice(0, 3).forEach((a) => {
            combined.push({
              id: `anime-${a.id}`,
              title: a.title,
              poster: a.poster,
              typeLabel: 'Anime',
              badgeStyle: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
              link: `/anime/detail/otakudesu/${a.id}`,
              subtitle: a.status || (a.score ? `★ ${a.score}` : 'Otakudesu'),
            });
          });
        }

        // 2. Donghua matches (up to 2)
        if (donghuaRes.status === 'fulfilled' && Array.isArray(donghuaRes.value)) {
          donghuaRes.value.slice(0, 2).forEach((d) => {
            combined.push({
              id: `donghua-${d.slug}`,
              title: d.title,
              poster: d.poster,
              typeLabel: 'Donghua',
              badgeStyle: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
              link: `/donghua/detail/${d.slug}`,
              subtitle: d.currentEpisode || 'Donghua 3D',
            });
          });
        }

        // 3. Manga matches (up to 3)
        if (mangaRes.status === 'fulfilled' && mangaRes.value?.komikList) {
          mangaRes.value.komikList.slice(0, 3).forEach((m) => {
            combined.push({
              id: `manga-${m.slug}`,
              title: m.title,
              poster: m.cover,
              typeLabel: m.type || 'Manga',
              badgeStyle: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
              link: `/manga/${m.slug}`,
              subtitle: m.chapter || 'Komik',
            });
          });
        }

        // 5. Music matches (up to 3)
        if (musicRes.status === 'fulfilled' && Array.isArray(musicRes.value)) {
          musicRes.value.slice(0, 3).forEach((track) => {
            combined.push({
              id: `music-${track.id}`,
              title: track.title,
              poster: track.thumbnail,
              typeLabel: 'Music',
              badgeStyle: 'bg-[#1DB954]/20 text-[#1DB954] border-[#1DB954]/30',
              link: `/music?play=${encodeURIComponent(track.id)}`,
              subtitle: `${track.artist} • ${track.durationFormatted || 'Lagu'}`,
            });
          });
        }

        setSearchResults(combined);
      } catch (err) {
        console.error('Navbar search error:', err);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchOpen(false);
    setMobileMenuOpen(false);
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-surface/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link
          to="/"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center gap-2.5 group shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent-indigo via-accent-purple to-amber-500 p-[2px] transition-transform duration-300 group-hover:scale-105 shadow-md shadow-accent-indigo/20">
            <div className="w-full h-full bg-surface rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-accent-indigo group-hover:text-amber-400 transition-colors" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-accent-cyan bg-clip-text text-transparent">
              FAZURA<span className="text-accent-indigo">VERSE</span>
            </span>
            <span className="hidden sm:block text-[9px] text-slate-400 -mt-1 font-bold tracking-wider uppercase">
              Manga • Anime • Donghua • Movie • Music
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1.5 text-xs lg:text-sm font-semibold">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `px-2.5 lg:px-3.5 py-2 rounded-xl transition-all ${
                isActive
                  ? 'bg-white/10 text-white font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-card'
              }`
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/manga"
            className={({ isActive }) =>
              `px-2.5 lg:px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-accent-indigo/20 text-accent-indigo font-bold border border-accent-indigo/30'
                  : 'text-slate-300 hover:text-white hover:bg-card'
              }`
            }
          >
            <BookOpen className="w-4 h-4 text-accent-indigo" />
            Manga
          </NavLink>

          <NavLink
            to="/anime"
            className={({ isActive }) =>
              `px-2.5 lg:px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-card'
              }`
            }
          >
            <Film className="w-4 h-4 text-amber-400" />
            Anime
          </NavLink>

          <NavLink
            to="/donghua"
            className={({ isActive }) =>
              `px-2.5 lg:px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-card'
              }`
            }
          >
            <Tv className="w-4 h-4 text-emerald-400" />
            Donghua
          </NavLink>

          <NavLink
            to="/movies"
            className={({ isActive }) =>
              `px-2.5 lg:px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-card'
              }`
            }
          >
            <Clapperboard className="w-4 h-4 text-rose-400" />
            Movies
          </NavLink>

          <NavLink
            to="/music"
            className={({ isActive }) =>
              `px-2.5 lg:px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-[#1DB954]/20 text-[#1DB954] font-bold border border-[#1DB954]/30'
                  : 'text-slate-300 hover:text-white hover:bg-card'
              }`
            }
          >
            <Headphones className="w-4 h-4 text-[#1DB954]" />
            Music
          </NavLink>
        </nav>

        {/* Search Bar & User Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div ref={searchRef} className="relative hidden sm:block w-36 md:w-48 lg:w-56 xl:w-64 shrink-0">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Cari komik, anime, movie, musik..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  className="w-full pl-9 pr-8 py-1.5 text-xs bg-card/90 hover:bg-card focus:bg-surface border border-white/10 focus:border-accent-indigo rounded-xl text-white placeholder-slate-400 focus:outline-none transition-all shadow-inner"
                />
                {searchLoading && (
                  <Loader2 className="w-3.5 h-3.5 text-accent-indigo animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                )}
              </div>
            </form>

            {/* Dropdown preview */}
            {searchOpen && searchQuery.trim().length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-2 rounded-xl bg-[#111622] border border-white/10 shadow-2xl overflow-hidden z-50">
                {searchLoading && searchResults.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-accent-indigo" />
                    Mencari komik, anime, movie, & musik...
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="p-1.5 space-y-1">
                    {searchResults.map((item) => (
                      <Link
                        key={item.id}
                        to={item.link}
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 transition-colors group"
                      >
                        <img
                          src={item.poster || "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2260%22%20height%3D%2280%22%20viewBox%3D%220%200%2060%2080%22%3E%3Crect%20fill%3D%22%231e293b%22%20width%3D%2260%22%20height%3D%2280%22%2F%3E%3C%2Fsvg%3E"}
                          alt={item.title}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2260%22%20height%3D%2280%22%20viewBox%3D%220%200%2060%2080%22%3E%3Crect%20fill%3D%22%231e293b%22%20width%3D%2260%22%20height%3D%2280%22%2F%3E%3C%2Fsvg%3E";
                          }}
                          className="w-8 h-11 object-cover rounded bg-slate-800 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase border ${item.badgeStyle}`}>
                              {item.typeLabel}
                            </span>
                            {item.subtitle && (
                              <span className="text-[10px] text-slate-400 truncate">
                                {item.subtitle}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-bold text-slate-200 group-hover:text-accent-indigo truncate">
                            {item.title}
                          </p>
                        </div>
                      </Link>
                    ))}
                    <button
                      onClick={handleSearchSubmit}
                      className="w-full py-2.5 px-3 text-center text-xs font-bold text-accent-indigo hover:text-white bg-[#0b0e14] hover:bg-slate-800 border-t border-white/5 transition-colors"
                    >
                      Buka hasil pencarian lengkap untuk "{searchQuery}" →
                    </button>
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400">
                    Tidak ditemukan judul untuk "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          <NavLink
            to="/bookmarks"
            title="Bookmarks"
            className={({ isActive }) =>
              `relative p-2 rounded-xl border border-white/5 transition-all ${
                isActive
                  ? 'bg-accent-indigo/20 text-accent-indigo border-accent-indigo/30'
                  : 'bg-card/70 hover:bg-card text-slate-300 hover:text-white'
              }`
            }
          >
            <Bookmark className="w-4 h-4" />
            {bookmarks.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent-indigo text-white text-[9px] font-black flex items-center justify-center">
                {bookmarks.length > 99 ? '99+' : bookmarks.length}
              </span>
            )}
          </NavLink>

          <NavLink
            to="/history"
            title="Riwayat Baca"
            className={({ isActive }) =>
              `p-2 rounded-xl border border-white/5 transition-all hidden sm:flex ${
                isActive
                  ? 'bg-accent-indigo/20 text-accent-indigo border-accent-indigo/30'
                  : 'bg-card/70 hover:bg-card text-slate-300 hover:text-white'
              }`
            }
          >
            <History className="w-4 h-4" />
          </NavLink>

          {/* Prominent Music Action Button in Navbar */}
          <NavLink
            to="/music"
            title="Buka Fazura Music Player"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border transition-all text-xs font-bold shrink-0 ${
                isActive
                  ? 'bg-[#1DB954] text-black border-[#1DB954] shadow-md shadow-[#1DB954]/30'
                  : 'bg-[#1DB954]/15 hover:bg-[#1DB954]/25 text-[#1DB954] border-[#1DB954]/30 hover:border-[#1DB954]/60 shadow-sm shadow-[#1DB954]/10'
              }`
            }
          >
            <Headphones className="w-3.5 h-3.5 text-[#1DB954] animate-pulse" />
            <span className="font-extrabold tracking-wider hidden sm:inline">MUSIC</span>
          </NavLink>

          {/* Mobile Menu Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="xl:hidden p-2 rounded-xl bg-card/70 text-slate-300 hover:text-white border border-white/5 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-white/10 bg-surface/95 backdrop-blur-xl px-4 py-4 space-y-2 max-h-[85vh] overflow-y-auto">
          <form onSubmit={handleSearchSubmit} className="mb-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari komik, anime, movie, musik..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none"
              />
            </div>
          </form>

          <NavLink
            to="/"
            end
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:bg-card"
          >
            <Sparkles className="w-4 h-4 text-accent-indigo" />
            Home
          </NavLink>

          <NavLink
            to="/manga"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:bg-card"
          >
            <BookOpen className="w-4 h-4 text-accent-indigo" />
            Manga & Komik
          </NavLink>

          <NavLink
            to="/anime"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:bg-card"
          >
            <Film className="w-4 h-4 text-amber-400" />
            Anime Streaming (Otakudesu)
          </NavLink>

          <NavLink
            to="/donghua"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:bg-card"
          >
            <Tv className="w-4 h-4 text-emerald-400" />
            Donghua (Anichin)
          </NavLink>

          <NavLink
            to="/movies"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:bg-card"
          >
            <Clapperboard className="w-4 h-4 text-rose-400" />
            Movie & Series (Bioskop)
          </NavLink>

          <NavLink
            to="/music"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:bg-card"
          >
            <Headphones className="w-4 h-4 text-[#1DB954]" />
            Musik (Fazura Music)
          </NavLink>

          <NavLink
            to="/bookmarks"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:bg-card"
          >
            <span className="flex items-center gap-3">
              <Bookmark className="w-4 h-4 text-accent-indigo" />
              Favorit Saya
            </span>
            {bookmarks.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-accent-indigo text-white text-xs font-bold">
                {bookmarks.length}
              </span>
            )}
          </NavLink>

          <NavLink
            to="/history"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:bg-card"
          >
            <History className="w-4 h-4 text-accent-indigo" />
            Riwayat Baca
          </NavLink>
        </div>
      )}
    </header>
  );
}
