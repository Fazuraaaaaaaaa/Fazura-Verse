import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sparkles,
  BookOpen,
  Film,
  Tv,
  Clapperboard,
  Headphones,
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';

export function MobileBottomNav() {
  const location = useLocation();
  const isReaderPage = location.pathname.startsWith('/chapter/');
  const { isPlaying } = useMusic();

  if (isReaderPage) return null;

  const NAV_ITEMS = [
    { to: '/', label: 'Home', icon: Sparkles, exact: true, accent: 'text-[#8B5CF6]' },
    { to: '/manga', label: 'Manga', icon: BookOpen, accent: 'text-[#8B5CF6]' },
    { to: '/anime', label: 'Anime', icon: Film, accent: 'text-amber-400' },
    { to: '/donghua', label: 'Donghua', icon: Tv, accent: 'text-emerald-400' },
    { to: '/movies', label: 'Movies', icon: Clapperboard, accent: 'text-rose-400' },
    { to: '/music', label: 'Music', icon: Headphones, accent: 'text-[#1DB954]' },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 md:hidden h-14 bg-[#090912]/95 backdrop-blur-xl border-t border-white/10 px-0.5 flex items-center justify-around shadow-2xl transition-all select-none"
      aria-label="Mobile Navigation Bar"
    >
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.exact}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full min-h-[44px] min-w-[44px] py-1 text-[9px] min-[360px]:text-[10px] min-[400px]:text-[11px] font-semibold transition-all active:scale-95 relative ${
              isActive
                ? 'text-white font-bold'
                : 'text-[#A1A1B5] hover:text-white'
            }`
          }
        >
          {({ isActive }) => (
            <>
              {/* Active Top Highlight Pill */}
              {isActive && (
                <span className="absolute top-0 w-8 h-[2px] bg-gradient-to-r from-transparent via-[#8B5CF6] to-transparent rounded-full shadow-[0_0_8px_#8B5CF6]" />
              )}

              {/* Icon Container with min 24px box */}
              <div className="relative flex items-center justify-center">
                <item.icon
                  className={`w-4 h-4 mb-0.5 transition-transform ${
                    isActive
                      ? `${item.accent || 'text-[#8B5CF6]'} scale-110 drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]`
                      : 'text-[#717187]'
                  }`}
                />

                {/* Animated pulse indicator if music is playing on Music tab */}
                {item.label === 'Music' && isPlaying && (
                  <span className="absolute -top-0.5 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1DB954] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1DB954]" />
                  </span>
                )}
              </div>

              {/* Label - responsive font size for 320px/360px/390px/430px */}
              <span className="truncate max-w-[50px] min-[360px]:max-w-none tracking-tight leading-none mt-0.5">
                {item.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
