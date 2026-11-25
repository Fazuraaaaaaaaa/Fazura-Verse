import React from 'react';
import { Sparkles } from 'lucide-react';

const SHIMMER_EFFECT =
  'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent';

export function PageSkeletonLoader() {
  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-[#090912] flex flex-col items-center justify-start pt-6 pb-16 px-4 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
      {/* Animated FazuraStream Logo Pulse Header */}
      <div className="flex flex-col items-center justify-center space-y-2.5 py-4">
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-[#8B5CF6]/25 blur-xl animate-pulse" />
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#8B5CF6] via-[#A78BFA] to-amber-400 p-[2px] shadow-lg shadow-[#8B5CF6]/30 animate-pulse">
            <div className="w-full h-full bg-[#11111D] rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-[#8B5CF6] animate-pulse" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-heading font-black text-xl tracking-tight text-white">
            FAZURA<span className="text-[#8B5CF6] drop-shadow-[0_0_12px_rgba(139,92,246,0.5)]">STREAM</span>
          </span>
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#8B5CF6]/15 text-[#A78BFA] border border-[#8B5CF6]/30">
            次元
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] animate-ping" />
          <span className="text-[11px] font-medium text-[#A1A1B5] tracking-wide">
            Memuat konten semesta...
          </span>
        </div>
      </div>

      {/* Main Skeleton Content Structure */}
      <div className="w-full max-w-7xl space-y-8">
        {/* Elevated Hero Banner Skeleton */}
        <div
          className={`w-full rounded-3xl bg-[#181827]/80 border border-white/5 min-h-[260px] sm:min-h-[340px] p-6 sm:p-10 flex flex-col justify-end ${SHIMMER_EFFECT}`}
        >
          <div className="max-w-xl space-y-4">
            <div className="w-28 h-6 rounded-full bg-[#202033]" />
            <div className="h-8 sm:h-12 bg-[#202033] rounded-2xl w-4/5" />
            <div className="space-y-2">
              <div className="h-3.5 bg-[#202033]/70 rounded w-full" />
              <div className="h-3.5 bg-[#202033]/70 rounded w-3/4" />
            </div>
            <div className="flex gap-3 pt-2">
              <div className="w-32 h-10 rounded-xl bg-[#202033]" />
              <div className="w-28 h-10 rounded-xl bg-[#202033]/60" />
            </div>
          </div>
        </div>

        {/* Category Pills Bar Skeleton */}
        <div className="flex items-center gap-2.5 overflow-hidden py-1">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`h-9 rounded-xl bg-[#181827]/80 border border-white/5 shrink-0 ${
                i === 0 ? 'w-24 bg-[#8B5CF6]/20 border-[#8B5CF6]/30' : 'w-20'
              } ${SHIMMER_EFFECT}`}
            />
          ))}
        </div>

        {/* Responsive Content Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-5">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className={`flex flex-col rounded-2xl overflow-hidden bg-[#181827]/80 border border-white/5 ${SHIMMER_EFFECT}`}
            >
              <div className="relative aspect-[3/4] w-full bg-[#11111D]">
                <div className="absolute top-2 left-2 w-12 h-5 rounded-md bg-[#202033]" />
                <div className="absolute top-2 right-2 w-9 h-5 rounded-md bg-[#202033]" />
              </div>
              <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="h-4 bg-[#202033] rounded-md w-4/5" />
                  <div className="h-3 bg-[#202033]/60 rounded-md w-3/5" />
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                  <div className="h-3 bg-[#202033]/70 rounded-md w-1/3" />
                  <div className="h-3 bg-[#202033]/50 rounded-md w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PageSkeletonLoader;
