'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Library, ListMusic } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home', icon: Home, isActive: pathname === '/' },
    { href: '/search', label: 'Search', icon: Search, isActive: pathname.startsWith('/search') },
    { href: '/library', label: 'Your Library', icon: Library, isActive: pathname.startsWith('/library') },
    { href: '/queue', label: 'Queue', icon: ListMusic, isActive: pathname.startsWith('/queue') },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex h-14 items-center justify-around bg-black/95 backdrop-blur-2xl border-t border-white/10 px-2 select-none">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 active:scale-95 group',
              item.isActive ? 'text-white font-bold' : 'text-[#b3b3b3] hover:text-white'
            )}
          >
            <div className="relative flex items-center justify-center">
              <Icon
                size={21}
                className={cn(
                  'transition-transform duration-200 group-hover:scale-110',
                  item.isActive ? 'stroke-[2.5] text-white' : 'stroke-[1.8]'
                )}
              />
              {item.isActive && (
                <span className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-[#1DB954]" />
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-1 leading-none">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}