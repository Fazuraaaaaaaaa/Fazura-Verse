'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Library, ListMusic } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex h-14 items-center justify-around bg-black/95 backdrop-blur-lg border-t border-white/10 px-2 select-none">
      <Link
        href="/"
        className={cn(
          'flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors',
          pathname === '/' ? 'text-white' : 'text-[#B3B3B3] hover:text-white'
        )}
      >
        <Home size={20} />
        <span>Home</span>
      </Link>

      <Link
        href="/search"
        className={cn(
          'flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors',
          pathname.startsWith('/search') ? 'text-white' : 'text-[#B3B3B3] hover:text-white'
        )}
      >
        <Search size={20} />
        <span>Search</span>
      </Link>

      <Link
        href="/library"
        className={cn(
          'flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors',
          pathname.startsWith('/library') ? 'text-white' : 'text-[#B3B3B3] hover:text-white'
        )}
      >
        <Library size={20} />
        <span>Your Library</span>
      </Link>

      <Link
        href="/queue"
        className={cn(
          'flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors',
          pathname.startsWith('/queue') ? 'text-white' : 'text-[#B3B3B3] hover:text-white'
        )}
      >
        <ListMusic size={20} />
        <span>Queue</span>
      </Link>
    </nav>
  );
}
