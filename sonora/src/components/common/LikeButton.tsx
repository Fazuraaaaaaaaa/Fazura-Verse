'use client';

import React from 'react';
import { Heart } from 'lucide-react';
import { useLibraryStore } from '@/stores/useLibraryStore';
import { Track } from '@/types/music';
import { cn } from '@/lib/utils';

interface LikeButtonProps {
  track: Track;
  size?: number;
  className?: string;
  onLikedChange?: (liked: boolean) => void;
}

export default function LikeButton({
  track,
  size = 18,
  className,
  onLikedChange,
}: LikeButtonProps) {
  const { isSongLiked, toggleLikeSong } = useLibraryStore();
  const liked = isSongLiked(track.id) || isSongLiked(track.youtubeId);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLikeSong(track);
    if (onLikedChange) {
      onLikedChange(!liked);
    }
  };

  return (
    <button
      type="button"
      title={liked ? 'Remove from Your Library' : 'Save to Your Library'}
      onClick={handleClick}
      className={cn(
        'transition-transform duration-150 hover:scale-110 active:scale-95',
        liked ? 'text-[#1DB954]' : 'text-[#B3B3B3] hover:text-white',
        className
      )}
    >
      <Heart
        size={size}
        className={cn(
          'transition-colors',
          liked ? 'fill-[#1DB954] text-[#1DB954]' : ''
        )}
      />
    </button>
  );
}
