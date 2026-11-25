import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  Home,
  Compass,
  Bookmark,
  Headphones,
  History,
  BookOpen,
  Film,
  Tv,
  Clapperboard,
  Search,
  X,
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { CATEGORY_THEMES } from '../utils/categoryTheme';

const EXPLORE_DESTINATIONS = [
  {
    to: '/anime',
    label: 'Anime',
    subtitle: 'Series Ongoing & Tamat Sub Indo',
    icon: Film,
    accent: CATEGORY_THEMES.anime.accentHex,
  },
  {
    to: '/movies',
    label: 'Movies & TV',
    subtitle: 'Film Box Office & Serial Populer',
    icon: Clapperboard,
    accent: CATEGORY_THEMES.movies.accentHex,
  },
  {
    to: '/manga',
    label: 'Manga',
    subtitle: 'Komik Jepang, Manhwa & Manhua',
    icon: BookOpen,
    accent: CATEGORY_THEMES.manga.accentHex,
  },
  {
    to: '/donghua',
    label: 'Donghua',
    subtitle: 'Animasi 3D Xianxia & Kultivasi',
    icon: Tv,
    accent: CATEGORY_THEMES.donghua.accentHex,
  },
  {
    to: '/search',
    label: 'Cari Konten',
    subtitle: 'Pencarian Terpadu Lintas Kategori',
    icon: Search,
    accent: '#F0A15B',
  },
];

export function MobileBottomNav() {
  const location = useLocation();
  const isReaderPage = location.pathname.startsWith('/chapter/');
  const { isPlaying } = useMusic();
  const [exploreOpen, setExploreOpen] = useState(false);

  if (isReaderPage) return null;

  const isExploreRoute =
    location.pathname.startsWith('/manga') ||
    location.pathname.startsWith('/browse') ||
    location.pathname.startsWith('/anime') ||
    location.pathname.startsWith('/donghua') ||
    location.pathname.startsWith('/movies') ||
    location.pathname.startsWith('/search');

  return (
    <>
      {/* Explore Categories Sheet */}
      {exploreOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex flex-col justify-end bg-[#0B0C10]/75 backdrop-blur-sm">
          <div className="flex-1" onClick={() => setExploreOpen(false)} />
          <div className="bg-[#191C25] border-t border-[#343744] rounded-t-[20px] p-4 pb-20 space-y-3 shadow-dialog">
            <div className="flex items-center justify-between pb-2 border-b border-[#343744]">
              <h3 className="font-heading text-base font-semibold text-[#F2F0EC]">
                Jelajahi Kategori
              </h3>
              <button
                type="button"
                onClick={() => setExploreOpen(false)}
                aria-label="Tutup menu jelajah"
                className="w-9 h-9 rounded-[10px] bg-[#232633] text-[#A2A4B1] hover:text-[#F2F0EC] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {EXPLORE_DESTINATIONS.map((dest) => (
                <Link
                  key={dest.to}
                  to={dest.to}
                  onClick={() => setExploreOpen(false)}
                  className="flex items-center gap-3.5 p-3 rounded-[10px] bg-[#12141B] border border-[#343744] hover:border-[#454958] transition-colors"
                >
                  <span
                    className="w-10 h-10 rounded-[10px] bg-[#191C25] border border-[#343744] flex items-center justify-center shrink-0"
                    style={{ color: dest.accent }}
                  >
                    <dest.icon className="w-5 h-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#F2F0EC]">{dest.label}</p>
                    <p className="text-xs text-[#A2A4B1] truncate">{dest.subtitle}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Clean 5-Item Mobile Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 md:hidden h-14 bg-[#0B0C10]/95 backdrop-blur-md border-t border-[#343744] px-1 flex items-center justify-around select-none"
        aria-label="Mobile Navigation Bar"
      >
        <NavLink
          to="/"
          end
          aria-label="Home"
          onClick={() => setExploreOpen(false)}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full min-h-[44px] min-w-[44px] gap-0.5 text-[10px] font-medium transition-colors relative ${
              isActive && !exploreOpen ? 'text-[#F0A15B] font-semibold' : 'text-[#A2A4B1]'
            }`
          }
        >
          <Home className="w-4 h-4" />
          <span className="truncate leading-none">Home</span>
        </NavLink>

        <button
          type="button"
          aria-label="Explore"
          aria-expanded={exploreOpen}
          onClick={() => setExploreOpen((prev) => !prev)}
          className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] min-w-[44px] gap-0.5 text-[10px] font-medium transition-colors relative ${
            exploreOpen || isExploreRoute ? 'text-[#F0A15B] font-semibold' : 'text-[#A2A4B1]'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span className="truncate leading-none">Explore</span>
        </button>

        <NavLink
          to="/bookmarks"
          aria-label="Library"
          onClick={() => setExploreOpen(false)}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full min-h-[44px] min-w-[44px] gap-0.5 text-[10px] font-medium transition-colors relative ${
              isActive ? 'text-[#F0A15B] font-semibold' : 'text-[#A2A4B1]'
            }`
          }
        >
          <Bookmark className="w-4 h-4" />
          <span className="truncate leading-none">Library</span>
        </NavLink>

        <NavLink
          to="/music"
          aria-label="Music"
          onClick={() => setExploreOpen(false)}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full min-h-[44px] min-w-[44px] gap-0.5 text-[10px] font-medium transition-colors relative ${
              isActive ? 'text-[#F0A15B] font-semibold' : 'text-[#A2A4B1]'
            }`
          }
        >
          <div className="relative flex items-center justify-center">
            <Headphones className="w-4 h-4" />
            {isPlaying && (
              <span className="absolute -top-0.5 -right-1.5 w-2 h-2 rounded-full bg-[#E68BA6]" />
            )}
          </div>
          <span className="truncate leading-none">Music</span>
        </NavLink>

        <NavLink
          to="/history"
          aria-label="History"
          onClick={() => setExploreOpen(false)}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full min-h-[44px] min-w-[44px] gap-0.5 text-[10px] font-medium transition-colors relative ${
              isActive ? 'text-[#F0A15B] font-semibold' : 'text-[#A2A4B1]'
            }`
          }
        >
          <History className="w-4 h-4" />
          <span className="truncate leading-none">History</span>
        </NavLink>
      </nav>
    </>
  );
}
