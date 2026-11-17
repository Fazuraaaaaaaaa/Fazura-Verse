'use client';

import React from 'react';
import { Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlayButtonProps {
  isPlaying?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  title?: string;
}

export default function PlayButton({
  isPlaying = false,
  size = 'md',
  onClick,
  className,
  title = 'Play',
}: PlayButtonProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-14 h-14',
    xl: 'w-16 h-16',
  };

  const iconSizes = {
    sm: 14,
    md: 20,
    lg: 24,
    xl: 28,
  };

  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        'group flex items-center justify-center rounded-full bg-[#1DB954] text-black shadow-xl transition-all duration-200 hover:scale-105 hover:bg-[#1ed760] active:scale-95',
        sizeClasses[size],
        className
      )}
    >
      {isPlaying ? (
        <Pause size={iconSizes[size]} className="fill-black text-black" />
      ) : (
        <Play size={iconSizes[size]} className="ml-0.5 fill-black text-black" />
      )}
    </button>
  );
}
