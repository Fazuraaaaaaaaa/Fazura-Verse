import React from 'react';
import { CardGridSkeleton } from './common/StateViews';

export function PageSkeletonLoader() {
  return (
    <div className="w-full min-h-[calc(100vh-68px)] bg-[#12141B] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Skeleton */}
        <div className="w-full rounded-[20px] bg-[#191C25] border border-[#343744] min-h-[260px] sm:min-h-[340px] p-6 sm:p-10 flex flex-col justify-end skeleton-shimmer">
          <div className="max-w-xl space-y-4">
            <div className="w-28 h-5 rounded-[6px] bg-[#232633]" />
            <div className="h-9 sm:h-11 rounded-[10px] bg-[#232633] w-4/5" />
            <div className="space-y-2">
              <div className="h-3.5 rounded bg-[#232633]/80 w-full" />
              <div className="h-3.5 rounded bg-[#232633]/70 w-3/4" />
            </div>
            <div className="flex gap-3 pt-2">
              <div className="w-36 h-11 rounded-[10px] bg-[#F0A15B]/25" />
              <div className="w-28 h-11 rounded-[10px] bg-[#232633]" />
            </div>
          </div>
        </div>

        {/* Filter Bar Skeleton */}
        <div className="h-14 rounded-[16px] bg-[#191C25] border border-[#343744] skeleton-shimmer" />

        {/* 2:3 Poster Grid Skeleton */}
        <CardGridSkeleton count={12} />
      </div>
    </div>
  );
}

export default PageSkeletonLoader;
