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
  Bookmark,
  History,
} from 'lucide-react';

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
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const desktopInputRef = useRef<HTMLInputElement>(null);
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

  // Global keyboard shortcut (Ctrl+K / Cmd+K or '/') to focus quick search
  useEffect(() => {
    const onGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        target?.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        desktopInputRef.current?.focus();
        setSearchOpen(true);
      } else if (!isTyping && e.key === '/') {
        e.preventDefault();
        desktopInputRef.current?.focus();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onGlobalKeyDown);
    return () => window.removeEventListener('keydown', onGlobalKeyDown);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
        setHighlightedIndex(-1);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Dynamically load API search modules only when the user searches (keeps initial bundle lean)
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed || trimmed.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      setHighlightedIndex(-1);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const [mangaRes, animeRes, donghuaRes, movieRes, musicRes] = await Promise.allSettled([
          import('../services/api').then((m) => m.search(trimmed)),
          import('../services/animeApi').then((m) => m.searchOtakudesu(trimmed)),
          import('../services/donghuaApi').then((m) => m.searchDonghua(trimmed)),
          import('../services/movieApi').then((m) => m.getMovies({ q: trimmed, perPage: 2 })),
          import('../services/musicApi').then((m) => m.searchMusic(trimmed)),
        ]);

        if (cancelled) return;

        const combined: SearchDropdownItem[] = [];

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

        if (mangaRes.status === 'fulfilled' && mangaRes.value?.komikList) {
          mangaRes.value.komikList.slice(0, 3).forEach((m) => {
            combined.push({
              id: `manga-${m.slug}`,
              title: m.title,
              poster: m.cover,
              typeLabel: m.type || 'Manga',
              badgeStyle: 'bg-accent-primary/20 text-accent-secondary border-accent-primary/30',
              link: `/manga/${m.slug}`,
              subtitle: m.chapter || 'Komik',
            });
          });
        }

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
        setHighlightedIndex(-1);
      } catch (err) {
        console.error('Navbar search error:', err);
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (highlightedIndex >= 0 && searchResults[highlightedIndex]) {
      const target = searchResults[highlightedIndex];
      setSearchOpen(false);
      setMobileMenuOpen(false);
      setSearchQuery('');
      setHighlightedIndex(-1);
      navigate(target.link);
      return;
    }
    if (!searchQuery.trim()) return;
    setSearchOpen(false);
    setMobileMenuOpen(false);
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setSearchOpen(false);
      setHighlightedIndex(-1);
      desktopInputRef.current?.blur();
      return;
    }
    if (!searchOpen || searchResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % searchResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev <= 0 ? searchResults.length - 1 : prev - 1));
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-bg-primary/95 backdrop-blur-md border-b border-border-subtle shadow-xl shadow-black/50'
          : 'bg-bg-primary/75 backdrop-blur-sm border-b border-white/5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-3">
        {/* Brand Logo with Japanese Digital Aesthetic */}
        <Link
          to="/"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center gap-2 sm:gap-2.5 group shrink-0"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#8B5CF6] via-[#A78BFA] to-amber-400 p-[2px] transition-transform duration-300 group-hover:scale-105 shadow-md shadow-[#8B5CF6]/25">
            <div className="w-full h-full bg-surface-base rounded-[9px] sm:rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-accent-primary group-hover:text-amber-400 transition-colors" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-black text-lg sm:text-xl tracking-tight text-white group-hover:opacity-95 transition-opacity">
                FAZURA<span className="text-accent-primary drop-shadow-[0_0_12px_rgba(139,92,246,0.5)]">STREAM</span>
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-accent-primary/15 text-accent-secondary border border-accent-primary/30 hidden sm:inline-block">
                次元
              </span>
            </div>
            <span className="hidden 2xl:block text-[9px] text-text-secondary -mt-1 font-bold tracking-wider uppercase">
              Manga • Anime • Donghua • Movie • Music
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1 text-xs font-semibold shrink-0" aria-label="Navigasi Utama">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `relative px-2.5 py-2 rounded-xl transition-all flex items-center gap-1.5 group whitespace-nowrap ${
                  isActive
                    ? 'text-white bg-accent-primary/15 border border-accent-primary/30 shadow-md shadow-accent-primary/20 font-bold'
                    : 'text-text-secondary hover:text-white hover:bg-white/5 border border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? item.accent || 'text-accent-primary' : 'text-text-muted group-hover:text-white'
                    }`}
                  />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute -bottom-[1px] left-2.5 right-2.5 h-[2px] bg-gradient-to-r from-transparent via-[#8B5CF6] to-transparent rounded-full shadow-[0_0_8px_#8B5CF6]" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Search Bar & User Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div ref={searchRef} className="relative hidden sm:block w-40 md:w-48 lg:w-52 xl:w-44 2xl:w-60 shrink-0">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={desktopInputRef}
                  type="text"
                  placeholder="Cari... (Ctrl+K)"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchOpen(true);
                  }}
                  onKeyDown={handleInputKeyDown}
                  onFocus={() => setSearchOpen(true)}
                  aria-label="Pencarian cepat"
                  className="w-full pl-9 pr-8 py-1.5 min-h-[38px] text-xs bg-surface-base/90 hover:bg-surface-base focus:bg-surface border border-border-subtle focus:border-accent-primary rounded-xl text-white placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-accent-primary/40 transition-all shadow-inner"
                />
                {searchLoading ? (
                  <Loader2 className="w-3.5 h-3.5 text-accent-primary animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                ) : searchQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    aria-label="Kosongkan pencarian"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-white p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : null}
              </div>
            </form>

            {/* Dropdown preview */}
            {searchOpen && searchQuery.trim().length >= 2 && (
              <div
                role="listbox"
                className="absolute top-full left-0 right-0 mt-2 rounded-xl bg-surface-base border border-border-subtle shadow-2xl overflow-hidden z-50"
              >
                {searchLoading && searchResults.length === 0 ? (
                  <div className="p-4 text-center text-xs text-text-secondary flex items-center justify-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-accent-primary" />
                    Mencari komik, anime, movie, & musik...
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="p-1.5 space-y-1 max-h-[65vh] overflow-y-auto">
                    {searchResults.map((item, idx) => (
                      <Link
                        key={item.id}
                        to={item.link}
                        role="option"
                        aria-selected={highlightedIndex === idx}
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchQuery('');
                          setHighlightedIndex(-1);
                        }}
                        className={`flex items-center gap-3 p-2 rounded-lg transition-colors group ${
                          highlightedIndex === idx ? 'bg-surface-elevated' : 'hover:bg-surface'
                        }`}
                      >
                        <img
                          src={
                            item.poster ||
                            "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2260%22%20height%3D%2280%22%20viewBox%3D%220%200%2060%2080%22%3E%3Crect%20fill%3D%22%23181827%22%20width%3D%2260%22%20height%3D%2280%22%2F%3E%3C%2Fsvg%3E"
                          }
                          alt={item.title}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2260%22%20height%3D%2280%22%20viewBox%3D%220%200%2060%2080%22%3E%3Crect%20fill%3D%22%23181827%22%20width%3D%2260%22%20height%3D%2280%22%2F%3E%3C%2Fsvg%3E";
                          }}
                          className="w-8 h-11 object-cover rounded bg-surface shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span
                              className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase border ${item.badgeStyle}`}
                            >
                              {item.typeLabel}
                            </span>
                            {item.subtitle && (
                              <span className="text-[10px] text-text-secondary truncate">
                                {item.subtitle}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-bold text-slate-200 group-hover:text-accent-secondary truncate">
                            {item.title}
                          </p>
                        </div>
                      </Link>
                    ))}
                    <button
                      onClick={handleSearchSubmit}
                      className="w-full py-2.5 px-3 text-center text-xs font-bold text-accent-secondary hover:text-white bg-bg-primary hover:bg-surface border-t border-border-subtle transition-colors"
                    >
                      Buka hasil pencarian lengkap untuk &quot;{searchQuery}&quot; →
                    </button>
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-text-secondary space-y-2">
                    <p>Tidak ditemukan hasil cepat untuk &quot;{searchQuery}&quot;</p>
                    <button
                      onClick={handleSearchSubmit}
                      className="text-accent-secondary hover:underline font-semibold"
                    >
                      Cari lengkap di halaman pencarian →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Library Quick Links on Desktop */}
          <Link
            to="/bookmarks"
            title="Unified Library (Favorit)"
            aria-label="Unified Library Favorit"
            className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-surface-base/80 hover:bg-surface text-text-secondary hover:text-accent-secondary border border-border-subtle transition-colors"
          >
            <Bookmark className="w-4 h-4" />
          </Link>
          <Link
            to="/history"
            title="Riwayat Tonton & Baca"
            aria-label="Riwayat Tonton dan Baca"
            className="hidden lg:flex items-center justify-center w-10 h-10 rounded-xl bg-surface-base/80 hover:bg-surface text-text-secondary hover:text-accent-secondary border border-border-subtle transition-colors"
          >
            <History className="w-4 h-4" />
          </Link>

          {/* Mobile Search Shortcut Icon (< sm) */}
          <Link
            to="/search"
            aria-label="Cari Konten"
            className="sm:hidden w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-surface-base text-text-secondary hover:text-white border border-border-subtle flex items-center justify-center active:scale-95 transition-all"
          >
            <Search className="w-4 h-4" />
          </Link>

          {/* Mobile Menu Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            className="xl:hidden w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-surface-base text-slate-300 hover:text-white border border-border-subtle flex items-center justify-center active:scale-95 transition-all"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-accent-primary" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Smooth Animated Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-border-subtle bg-bg-primary/98 backdrop-blur-2xl px-4 py-4 space-y-2 max-h-[85vh] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200 shadow-2xl">
          <form onSubmit={handleSearchSubmit} className="mb-3">
            <div className="relative">
              <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari komik, anime, movie, musik..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 min-h-[44px] text-xs bg-surface-base border border-border-subtle focus:border-accent-primary rounded-xl text-white placeholder-text-muted focus:outline-none"
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
                `flex items-center gap-3 px-3.5 py-2.5 min-h-[44px] rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-accent-primary/20 text-white font-bold border border-accent-primary/30 shadow-md shadow-accent-primary/15'
                    : 'text-text-secondary hover:text-white hover:bg-surface-base'
                }`
              }
            >
              <item.icon className={`w-4 h-4 ${item.accent || 'text-accent-primary'}`} />
              <span>{item.label}</span>
            </NavLink>
          ))}

          <div className="pt-2 border-t border-border-subtle grid grid-cols-2 gap-2">
            <Link
              to="/bookmarks"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 min-h-[44px] px-3 py-2 rounded-xl bg-surface-base border border-border-subtle text-xs font-bold text-text-secondary hover:text-white"
            >
              <Bookmark className="w-4 h-4 text-accent-primary" />
              <span>Favorit Saya</span>
            </Link>
            <Link
              to="/history"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 min-h-[44px] px-3 py-2 rounded-xl bg-surface-base border border-border-subtle text-xs font-bold text-text-secondary hover:text-white"
            >
              <History className="w-4 h-4 text-accent-secondary" />
              <span>Riwayat</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
