import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  BookOpen,
  Film,
  Tv,
  Search,
  Menu,
  X,
  Loader2,
  Clapperboard,
  Headphones,
} from 'lucide-react';
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

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Sparkles, exact: true, accent: 'text-[#8B5CF6]' },
  { to: '/manga', label: 'Manga', icon: BookOpen, accent: 'text-[#8B5CF6]' },
  { to: '/anime', label: 'Anime', icon: Film, accent: 'text-amber-400' },
  { to: '/donghua', label: 'Donghua', icon: Tv, accent: 'text-emerald-400' },
  { to: '/movies', label: 'Movies', icon: Clapperboard, accent: 'text-rose-400' },
  { to: '/music', label: 'Music', icon: Headphones, accent: 'text-[#1DB954]' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchDropdownItem[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Scroll-aware navbar transition
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

        // 3. Donghua matches (up to 2)
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

        // 4. Manga matches (up to 3)
        if (mangaRes.status === 'fulfilled' && mangaRes.value?.komikList) {
          mangaRes.value.komikList.slice(0, 3).forEach((m) => {
            combined.push({
              id: `manga-${m.slug}`,
              title: m.title,
              poster: m.cover,
              typeLabel: m.type || 'Manga',
              badgeStyle: 'bg-[#8B5CF6]/20 text-[#A78BFA] border-[#8B5CF6]/30',
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
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#090912]/95 backdrop-blur-md border-b border-white/10 shadow-xl shadow-black/50'
          : 'bg-[#090912]/75 backdrop-blur-sm border-b border-white/5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo with Japanese Digital Aesthetic */}
        <Link
          to="/"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center gap-2.5 sm:gap-3 group shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8B5CF6] via-[#A78BFA] to-amber-400 p-[2px] transition-transform duration-300 group-hover:scale-105 shadow-md shadow-[#8B5CF6]/25">
            <div className="w-full h-full bg-[#11111D] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#8B5CF6] group-hover:text-amber-400 transition-colors" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-black text-xl tracking-tight text-white group-hover:opacity-95 transition-opacity">
                FAZURA<span className="text-[#8B5CF6] drop-shadow-[0_0_12px_rgba(139,92,246,0.5)]">VERSE</span>
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#8B5CF6]/15 text-[#A78BFA] border border-[#8B5CF6]/30 hidden sm:inline-block">
                次元
              </span>
            </div>
            <span className="hidden sm:block text-[9px] text-[#A1A1B5] -mt-1 font-bold tracking-wider uppercase">
              Manga • Anime • Donghua • Movie • Music
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links with Active Indicator Glow */}
        <nav className="hidden xl:flex items-center gap-1.5 text-xs lg:text-sm font-semibold">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `relative px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 group ${
                  isActive
                    ? 'text-white bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 shadow-md shadow-[#8B5CF6]/20 font-bold'
                    : 'text-[#A1A1B5] hover:text-white hover:bg-white/5 border border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? (item.accent || 'text-[#8B5CF6]') : 'text-[#717187] group-hover:text-white'
                    }`}
                  />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute -bottom-[1px] left-3 right-3 h-[2px] bg-gradient-to-r from-transparent via-[#8B5CF6] to-transparent rounded-full shadow-[0_0_8px_#8B5CF6]" />
                  )}
                </>
              )}
            </NavLink>
          ))}
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
                  className="w-full pl-9 pr-8 py-1.5 text-xs bg-[#11111D]/90 hover:bg-[#11111D] focus:bg-[#181827] border border-white/10 focus:border-[#8B5CF6] rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]/40 transition-all shadow-inner"
                />
                {searchLoading && (
                  <Loader2 className="w-3.5 h-3.5 text-[#8B5CF6] animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                )}
              </div>
            </form>

            {/* Dropdown preview */}
            {searchOpen && searchQuery.trim().length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-2 rounded-xl bg-[#11111D] border border-white/10 shadow-2xl overflow-hidden z-50">
                {searchLoading && searchResults.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#8B5CF6]" />
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
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#181827] transition-colors group"
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
                          <p className="text-xs font-bold text-slate-200 group-hover:text-[#A78BFA] truncate">
                            {item.title}
                          </p>
                        </div>
                      </Link>
                    ))}
                    <button
                      onClick={handleSearchSubmit}
                      className="w-full py-2.5 px-3 text-center text-xs font-bold text-[#A78BFA] hover:text-white bg-[#090912] hover:bg-[#181827] border-t border-white/5 transition-colors"
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

          {/* Mobile Menu Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="xl:hidden p-2 rounded-xl bg-[#11111D] text-slate-300 hover:text-white border border-white/10 active:scale-95 transition-all"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-[#8B5CF6]" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Smooth Animated Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-white/10 bg-[#090912]/98 backdrop-blur-2xl px-4 py-4 space-y-2 max-h-[85vh] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200 shadow-2xl">
          <form onSubmit={handleSearchSubmit} className="mb-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari komik, anime, movie, musik..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs bg-[#11111D] border border-white/10 focus:border-[#8B5CF6] rounded-xl text-white placeholder-slate-400 focus:outline-none"
              />
            </div>
          </form>

          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#8B5CF6]/20 text-white font-bold border border-[#8B5CF6]/30 shadow-md shadow-[#8B5CF6]/15'
                    : 'text-slate-300 hover:text-white hover:bg-[#11111D]'
                }`
              }
            >
              <item.icon className={`w-4 h-4 ${item.accent || 'text-[#8B5CF6]'}`} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}
