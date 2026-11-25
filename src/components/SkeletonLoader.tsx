import React from 'react';
import { CardGridSkeleton } from './common/StateViews';

export function CardSkeleton() {
  return (
    <div className="rounded-[10px] overflow-hidden bg-[#191C25] border border-[#343744] flex flex-col">
      <div className="aspect-[2/3] w-full skeleton-shimmer" />
      <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          <div className="h-4 bg-[#232633] rounded-[6px] w-5/6" />
          <div className="h-3 bg-[#232633]/70 rounded-[6px] w-3/5" />
        </div>
        <div className="flex items-center justify-between pt-1.5 border-t border-[#343744]/60">
          <div className="h-3 bg-[#232633]/80 rounded-[6px] w-1/3" />
          <div className="h-3 bg-[#232633]/60 rounded-[6px] w-1/4" />
        </div>
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 12 }: { count?: number }) {
  return <CardGridSkeleton count={count} />;
}

export function HeroSkeleton() {
  return (
    <div className="w-full rounded-[20px] overflow-hidden bg-[#191C25] border border-[#343744] min-h-[340px] sm:min-h-[420px] p-6 sm:p-10 flex flex-col justify-end skeleton-shimmer">
      <div className="max-w-xl space-y-4">
        <div className="w-24 h-5 rounded-[6px] bg-[#232633]" />
        <div className="h-9 sm:h-11 bg-[#232633] rounded-[10px] w-4/5" />
        <div className="space-y-2">
          <div className="h-3.5 bg-[#232633]/70 rounded w-full" />
          <div className="h-3.5 bg-[#232633]/70 rounded w-5/6" />
        </div>
        <div className="flex gap-3 pt-2">
          <div className="w-32 h-10 rounded-[10px] bg-[#F0A15B]/25" />
          <div className="w-28 h-10 rounded-[10px] bg-[#232633]" />
        </div>
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="w-56 sm:w-64 aspect-[2/3] rounded-[16px] bg-[#191C25] shrink-0 border border-[#343744] skeleton-shimmer" />
        <div className="flex-1 space-y-4 w-full">
          <div className="w-28 h-5 rounded-[6px] bg-[#232633]" />
          <div className="h-9 bg-[#232633] rounded-[10px] w-3/4" />
          <div className="h-4 bg-[#232633]/70 rounded w-1/2" />
          <div className="flex gap-2">
            <div className="w-20 h-7 rounded-[6px] bg-[#232633]" />
            <div className="w-20 h-7 rounded-[6px] bg-[#232633]" />
            <div className="w-20 h-7 rounded-[6px] bg-[#232633]" />
          </div>
          <div className="space-y-2 pt-4">
            <div className="h-3.5 bg-[#232633]/70 rounded w-full" />
            <div className="h-3.5 bg-[#232633]/70 rounded w-full" />
            <div className="h-3.5 bg-[#232633]/70 rounded w-4/5" />
          </div>
          <div className="flex gap-3 pt-4">
            <div className="w-36 h-11 rounded-[10px] bg-[#F0A15B]/25" />
            <div className="w-36 h-11 rounded-[10px] bg-[#232633]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReaderSkeleton() {
  return (
    <div className="min-h-screen bg-[#0B0C10] flex flex-col items-center pt-20 px-4 space-y-4">
      <div className="w-full max-w-2xl h-10 rounded-[10px] bg-[#191C25] border border-[#343744] skeleton-shimmer" />
      <div className="w-full max-w-2xl aspect-[2/3] rounded-[12px] bg-[#191C25] border border-[#343744] skeleton-shimmer" />
    </div>
  );
}
