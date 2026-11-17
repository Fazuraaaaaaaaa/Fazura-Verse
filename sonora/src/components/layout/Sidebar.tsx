'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Search,
  Library,
  Plus,
  Heart,
  Music,
  Compass,
  ChevronLeft,
  ChevronRight,
  ListMusic,
} from 'lucide-react';
import { useLibraryStore } from '@/stores/useLibraryStore';
import CreatePlaylistModal from '@/components/modal/CreatePlaylistModal';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { likedSongs, myPlaylists } = useLibraryStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <>
      <aside
        className={cn(
          'hidden md:flex flex-col gap-2 p-2 select-none h-full transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-20' : 'w-64 lg:w-72'
        )}
      >
        {/* Top Navigation Box */}
        <div className="flex flex-col rounded-lg bg-[#121212] p-4 gap-4">
          {/* Logo */}
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className={cn(
                'flex items-center gap-2 font-black tracking-wider text-white hover:text-[#1DB954] transition-colors',
                isCollapsed && 'justify-center w-full'
              )}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1DB954] text-black shadow-md flex-shrink-0">
                <Music size={18} className="stroke-[2.5]" />
              </div>
              {!isCollapsed && (
                <span className="text-xl font-extrabold tracking-tight">SONORA</span>
              )}
            </Link>

            {!isCollapsed && (
              <button
                type="button"
                title="Collapse sidebar"
                onClick={() => setIsCollapsed(true)}
                className="text-[#B3B3B3] hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5 mt-1">
            <Link
              href="/"
              title="Home"
              className={cn(
                'flex items-center gap-4 rounded-md px-3 py-2.5 text-sm font-bold transition-colors',
                pathname === '/'
                  ? 'text-white bg-white/10'
                  : 'text-[#B3B3B3] hover:text-white hover:bg-white/5',
                isCollapsed && 'justify-center px-0'
              )}
            >
              <Home size={22} className={pathname === '/' ? 'text-white' : ''} />
              {!isCollapsed && <span>Home</span>}
            </Link>

            <Link
              href="/search"
              title="Search"
              className={cn(
                'flex items-center gap-4 rounded-md px-3 py-2.5 text-sm font-bold transition-colors',
                pathname.startsWith('/search')
                  ? 'text-white bg-white/10'
                  : 'text-[#B3B3B3] hover:text-white hover:bg-white/5',
                isCollapsed && 'justify-center px-0'
              )}
            >
              <Search size={22} className={pathname.startsWith('/search') ? 'text-white' : ''} />
              {!isCollapsed && <span>Search</span>}
            </Link>
          </nav>
        </div>

        {/* Your Library Box */}
        <div className="flex flex-1 flex-col rounded-lg bg-[#121212] p-2 overflow-hidden">
          {/* Library Header */}
          <div className="flex items-center justify-between px-2 py-2">
            <Link
              href="/library"
              title="Your Library"
              className={cn(
                'flex items-center gap-3 text-sm font-bold text-[#B3B3B3] hover:text-white transition-colors',
                isCollapsed && 'justify-center w-full'
              )}
            >
              <Library size={22} />
              {!isCollapsed && <span>Your Library</span>}
            </Link>

            {!isCollapsed && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  title="Create playlist"
                  onClick={() => setShowCreateModal(true)}
                  className="p-1 rounded-full text-[#B3B3B3] hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>
            )}
          </div>

          {/* Collapsed expand button */}
          {isCollapsed && (
            <button
              type="button"
              title="Expand sidebar"
              onClick={() => setIsCollapsed(false)}
              className="mx-auto my-2 text-[#B3B3B3] hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          )}

          {/* Quick Library Links */}
          <div className="flex flex-col gap-1 mt-1 overflow-y-auto scrollbar-none flex-1">
            {/* Liked Songs */}
            <Link
              href="/library?tab=liked"
              title="Liked Songs"
              className={cn(
                'group flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-white/10',
                pathname === '/library' && 'bg-white/5',
                isCollapsed && 'justify-center p-2'
              )}
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-gradient-to-br from-indigo-700 via-purple-600 to-emerald-300 text-white shadow">
                <Heart size={18} className="fill-white" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-white truncate">
                    Liked Songs
                  </span>
                  <span className="text-xs text-[#B3B3B3] truncate">
                    Playlist • {likedSongs.length} songs
                  </span>
                </div>
              )}
            </Link>

            {/* User Playlists */}
            {myPlaylists.map((pl) => (
              <Link
                key={pl.id}
                href={`/playlist/${pl.id}`}
                title={pl.title}
                className={cn(
                  'group flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-white/10',
                  pathname === `/playlist/${pl.id}` && 'bg-white/5',
                  isCollapsed && 'justify-center p-2'
                )}
              >
                <div className="relative h-10 w-10 flex-shrink-0 rounded bg-[#282828] overflow-hidden shadow">
                  {pl.cover ? (
                    <img
                      src={pl.cover}
                      alt={pl.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-[#B3B3B3]">
                      <ListMusic size={16} />
                    </div>
                  )}
                </div>
                {!isCollapsed && (
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-white truncate">
                      {pl.title}
                    </span>
                    <span className="text-xs text-[#B3B3B3] truncate">
                      Playlist • {pl.tracks?.length || pl.trackIds?.length || 0} songs
                    </span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </aside>

      {/* Create Playlist Modal */}
      <CreatePlaylistModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </>
  );
}
