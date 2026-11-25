import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Play,
  Search,
  Menu,
  X,
  Loader2,
  Bookmark,
  History,
  BookOpen,
  Film,
  Tv,
  Clapperboard,
  Headphones,
  Home,
} from 'lucide-react';
import { CATEGORY_THEMES } from '../utils/categoryTheme';

interface SearchDropdownItem {
  id: string;
  title: string;
  poster: string;
  typeLabel: string;
  accentHex: string;
  link: string;
  subtitle?: string;
}

const DESKTOP_NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Home, exact: true },
  { to: '/manga', label: 'Manga', icon: BookOpen },
  { to: '/anime', label: 'Anime', icon: Film },
  { to: '/donghua', label: 'Donghua', icon: Tv },
  { to: '/movies', label: 'Movies', icon: Clapperboard },
  { to: '/music', label: 'Music', icon: Headphones },
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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
              accentHex: CATEGORY_THEMES.movies.accentHex,
              link: `/movies/${m.id}`,
              subtitle: m.ratingValue ? `★ ${m.ratingValue.toFixed(1)}` : 'Movies',
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
              accentHex: CATEGORY_THEMES.anime.accentHex,
              link: `/anime/detail/otakudesu/${a.id}`,
              subtitle: a.status || (a.score ? `★ ${a.score}` : 'Anime'),
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
              accentHex: CATEGORY_THEMES.donghua.accentHex,
              link: `/donghua/detail/${d.slug}`,
              subtitle: d.currentEpisode || 'Donghua',
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
              accentHex: CATEGORY_THEMES.manga.accentHex,
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
              accentHex: CATEGORY_THEMES.music.accentHex,
              link: `/music?play=${encodeURIComponent(track.id)}`,
              subtitle: `${track.artist}${track.durationFormatted ? ` • ${track.durationFormatted}` : ''}`,
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
      className={`sticky top-0 z-50 transition-colors duration-200 border-b ${
        scrolled
          ? 'bg-[#0B0C10]/95 backdrop-blur-md border-[#343744]'
          : 'bg-[#0B0C10]/80 backdrop-blur-sm border-[#343744]/60'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[68px] flex items-center justify-between gap-4">
        {/* LEFT: Brand Mark */}
        <Link
          to="/"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center gap-2.5 group shrink-0"
        >
          <span className="w-9 h-9 rounded-[10px] bg-[#191C25] border border-[#343744] group-hover:border-[#F0A15B] flex items-center justify-center transition-colors">
            <Play className="w-4 h-4 text-[#F0A15B] fill-[#F0A15B] ml-0.5" />
          </span>
          <div className="flex flex-col">
            <span className="font-heading font-bold text-lg sm:text-xl tracking-tight text-[#F2F0EC] leading-none">
              Fazura<span className="text-[#F0A15B]">Stream</span>
            </span>
            <span className="hidden 2xl:block text-[10px] text-[#747887] font-medium tracking-wide mt-0.5">
              Your Universe of Entertainment
            </span>
          </div>
        </Link>

        {/* CENTER: Category Navigation */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Navigasi Utama">
          {DESKTOP_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `relative px-3.5 py-2 text-[14px] font-medium whitespace-nowrap transition-colors duration-150 ${
                  isActive
                    ? 'text-[#F2F0EC] font-semibold'
                    : 'text-[#A2A4B1] hover:text-[#F2F0EC]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute inset-x-3 -bottom-[14px] h-[2px] bg-[#F0A15B] rounded-full" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* RIGHT: Search, Library, History */}
        <div className="flex items-center gap-2 shrink-0">
          <div ref={searchRef} className="relative hidden sm:block w-48 md:w-56 xl:w-64 shrink-0">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <Search className="w-4 h-4 text-[#747887] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                  className="w-full h-10 pl-9 pr-8 text-[13px] bg-[#191C25] border border-[#343744] hover:border-[#454958] focus:border-[#F0A15B] rounded-[10px] text-[#F2F0EC] placeholder-[#747887] focus:outline-none transition-colors"
                />
                {searchLoading ? (
                  <Loader2 className="w-3.5 h-3.5 text-[#F0A15B] animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                ) : searchQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    aria-label="Kosongkan pencarian"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#747887] hover:text-[#F2F0EC] p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : null}
              </div>
            </form>

            {searchOpen && searchQuery.trim().length >= 2 && (
              <div
                role="listbox"
                className="absolute top-full left-0 right-0 mt-2 rounded-[10px] bg-[#191C25] border border-[#343744] shadow-subtle-menu overflow-hidden z-50"
              >
                {searchLoading && searchResults.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[#A2A4B1] flex items-center justify-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#F0A15B]" />
                    <span>Mencari di seluruh kategori...</span>
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
                        className={`flex items-center gap-3 p-2 rounded-[6px] transition-colors ${
                          highlightedIndex === idx ? 'bg-[#232633]' : 'hover:bg-[#232633]/70'
                        }`}
                      >
                        <img
                          src={
                            item.poster ||
                            "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2260%22%20height%3D%2290%22%20viewBox%3D%220%200%2060%2090%22%3E%3Crect%20fill%3D%22%23191C25%22%20width%3D%2260%22%20height%3D%2290%22%2F%3E%3C%2Fsvg%3E"
                          }
                          alt={item.title}
                          referrerPolicy="no-referrer"
                          className="w-8 h-12 object-cover rounded-[6px] bg-[#12141B] shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span
                              className="px-1.5 py-0.2 rounded-[4px] text-[10px] font-semibold border border-[#343744] bg-[#12141B]"
                              style={{ color: item.accentHex }}
                            >
                              {item.typeLabel}
                            </span>
                            {item.subtitle && (
                              <span className="text-[11px] text-[#747887] truncate">
                                {item.subtitle}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-[#F2F0EC] truncate">
                            {item.title}
                          </p>
                        </div>
                      </Link>
                    ))}
                    <button
                      type="button"
                      onClick={handleSearchSubmit}
                      className="w-full py-2.5 px-3 text-center text-xs font-semibold text-[#F0A15B] hover:text-[#F6B779] bg-[#12141B] border-t border-[#343744] transition-colors cursor-pointer"
                    >
                      Lihat semua hasil untuk &quot;{searchQuery}&quot; →
                    </button>
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-[#A2A4B1] space-y-2">
                    <p>Tidak ditemukan hasil cepat untuk &quot;{searchQuery}&quot;</p>
                    <button
                      type="button"
                      onClick={handleSearchSubmit}
                      className="text-[#F0A15B] hover:underline font-semibold"
                    >
                      Cari lengkap →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <Link
            to="/bookmarks"
            title="Favorit & Koleksi"
            aria-label="Unified Library Favorit"
            className="hidden sm:flex items-center justify-center w-10 h-10 rounded-[10px] bg-[#191C25] hover:bg-[#232633] text-[#A2A4B1] hover:text-[#F0A15B] border border-[#343744] hover:border-[#454958] transition-colors"
          >
            <Bookmark className="w-4 h-4" />
          </Link>

          <Link
            to="/history"
            title="Riwayat Tonton & Baca"
            aria-label="Riwayat Tonton dan Baca"
            className="hidden sm:flex items-center justify-center w-10 h-10 rounded-[10px] bg-[#191C25] hover:bg-[#232633] text-[#A2A4B1] hover:text-[#F0A15B] border border-[#343744] hover:border-[#454958] transition-colors"
          >
            <History className="w-4 h-4" />
          </Link>

          <Link
            to="/search"
            aria-label="Cari Konten"
            className="sm:hidden w-10 h-10 min-w-[44px] min-h-[44px] rounded-[10px] bg-[#191C25] text-[#A2A4B1] hover:text-[#F2F0EC] border border-[#343744] flex items-center justify-center"
          >
            <Search className="w-4 h-4" />
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            className="lg:hidden w-10 h-10 min-w-[44px] min-h-[44px] rounded-[10px] bg-[#191C25] text-[#F2F0EC] border border-[#343744] flex items-center justify-center"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-[#F0A15B]" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Tablet / Mobile Header Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#343744] bg-[#0B0C10] px-4 py-4 space-y-2 max-h-[85vh] overflow-y-auto shadow-dialog">
          <form onSubmit={handleSearchSubmit} className="mb-3 sm:hidden">
            <div className="relative">
              <Search className="w-4 h-4 text-[#747887] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari komik, anime, movie, musik..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-9 pr-4 text-sm bg-[#191C25] border border-[#343744] focus:border-[#F0A15B] rounded-[10px] text-[#F2F0EC] placeholder-[#747887] focus:outline-none"
              />
            </div>
          </form>

          {DESKTOP_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 min-h-[44px] rounded-[10px] text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#232633] text-[#F0A15B] font-semibold border border-[#F0A15B]/35'
                    : 'text-[#A2A4B1] hover:text-[#F2F0EC] hover:bg-[#191C25]'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}

          <div className="pt-2 border-t border-[#343744] grid grid-cols-2 gap-2">
            <Link
              to="/bookmarks"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 min-h-[44px] px-3 py-2 rounded-[10px] bg-[#191C25] border border-[#343744] text-xs font-semibold text-[#F2F0EC]"
            >
              <Bookmark className="w-4 h-4 text-[#F0A15B]" />
              <span>Favorit</span>
            </Link>
            <Link
              to="/history"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 min-h-[44px] px-3 py-2 rounded-[10px] bg-[#191C25] border border-[#343744] text-xs font-semibold text-[#F2F0EC]"
            >
              <History className="w-4 h-4 text-[#F0A15B]" />
              <span>Riwayat</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
