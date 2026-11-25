import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MediaCarouselProps {
  id: string;
  children: React.ReactNode;
  itemWidthClass?: string;
}

export function MediaCarousel({ id, children }: MediaCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollByAmount = (direction: 'left' | 'right') => {
    const el = trackRef.current;
    if (!el) return;
    const step = Math.max(320, el.clientWidth * 0.75);
    el.scrollBy({
      left: direction === 'left' ? -step : step,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative group/carousel">
      <button
        type="button"
        onClick={() => scrollByAmount('left')}
        aria-label="Geser ke kiri"
        className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-[#191C25]/95 border border-[#343744] hover:border-[#F0A15B] text-[#F2F0EC] items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-150 cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div
        id={id}
        ref={trackRef}
        className="flex gap-3.5 sm:gap-4 overflow-x-auto pb-2 scrollbar-none scroll-smooth snap-x snap-mandatory"
      >
        {children}
      </div>

      <button
        type="button"
        onClick={() => scrollByAmount('right')}
        aria-label="Geser ke kanan"
        className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-[#191C25]/95 border border-[#343744] hover:border-[#F0A15B] text-[#F2F0EC] items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-150 cursor-pointer"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
