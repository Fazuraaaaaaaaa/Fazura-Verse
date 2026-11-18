'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Search, Settings, User, X } from 'lucide-react';

function TopNavContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const isSearchPage = pathname === '/search';

  // Sync input with url when on search page, or clear when leaving search page
  useEffect(() => {
    if (isSearchPage) {
      setSearchValue(searchParams.get('q') || '');
    } else {
      setSearchValue('');
    }
  }, [pathname, searchParams, isSearchPage]);

  // Handle typing in search input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchValue(val);

    // If typing from another page, navigate to search page
    if (!isSearchPage && val.trim()) {
      router.push(`/search?q=${encodeURIComponent(val.trim())}`);
    }
  };

  // Debounced search ONLY when actively on search page
  useEffect(() => {
    if (!isSearchPage) return;

    const timer = setTimeout(() => {
      const currentQ = searchParams.get('q') || '';
      if (searchValue !== currentQ) {
        if (searchValue.trim()) {
          router.replace(`/search?q=${encodeURIComponent(searchValue.trim())}`);
        } else {
          router.replace('/search');
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, isSearchPage, router, searchParams]);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between px-4 sm:px-6 bg-transparent">
      {/* Left: Navigation Buttons & Search */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1 max-w-xl">
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            title="Go back"
            onClick={() => window.history.back()}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-[#B3B3B3] hover:text-white transition-colors"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            title="Go forward"
            onClick={() => window.history.forward()}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-[#B3B3B3] hover:text-white transition-colors"
          >
            <ChevronRight size={22} />
          </button>
        </div>

        {/* Live Search Input */}
        <div className="relative flex-1 max-w-sm sm:max-w-md">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[#B3B3B3]">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={searchValue}
            onChange={handleInputChange}
            placeholder="What do you want to play?"
            className="w-full rounded-full bg-[#242424] py-2 pl-9 pr-8 text-xs sm:text-sm text-white placeholder-[#727272] transition-all hover:bg-[#2a2a2a] hover:ring-1 hover:ring-white/20 focus:bg-[#2a2a2a] focus:outline-none focus:ring-2 focus:ring-white"
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => {
                setSearchValue('');
                if (isSearchPage) router.replace('/search');
              }}
              className="absolute inset-y-0 right-3 flex items-center text-[#B3B3B3] hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Right: Profile pill & settings */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfileMenu((prev) => !prev)}
            className="flex items-center gap-2 rounded-full bg-black/60 p-1 pr-3 hover:bg-black/90 transition-colors border border-transparent hover:border-white/10"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#535353] text-white">
              <User size={16} />
            </div>
            <span className="hidden sm:inline text-xs sm:text-sm font-bold text-white">
              User
            </span>
          </button>

          {showProfileMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowProfileMenu(false)}
              />
              <div className="absolute right-0 top-11 z-50 w-48 rounded-md bg-[#282828] p-1.5 shadow-2xl border border-white/10 text-sm text-white animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-white/10">
                  <div className="font-semibold text-white">Sonora Premium</div>
                  <div className="text-xs text-[#1DB954] font-medium">Free & Open Source</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    router.push('/library');
                    setShowProfileMenu(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded px-3 py-2 text-left hover:bg-white/10"
                >
                  <User size={16} />
                  <span>Profile & Library</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded px-3 py-2 text-left hover:bg-white/10"
                >
                  <Settings size={16} />
                  <span>Settings</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default function TopNav() {
  return (
    <Suspense fallback={<header className="h-16 w-full" />}>
      <TopNavContent />
    </Suspense>
  );
}
