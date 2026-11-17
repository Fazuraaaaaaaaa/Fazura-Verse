import React from 'react';

export function CardSkeleton() {
  return (
    <div className="group relative flex flex-col rounded-xl overflow-hidden bg-card/60 border border-white/5 animate-pulse">
      <div className="relative aspect-[3/4] w-full bg-slate-800/80">
        <div className="absolute top-2 left-2 w-14 h-5 rounded bg-slate-700/60" />
        <div className="absolute top-2 right-2 w-10 h-5 rounded bg-slate-700/60" />
      </div>
      <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          <div className="h-4 bg-slate-700/70 rounded w-5/6" />
          <div className="h-3 bg-slate-700/40 rounded w-3/5" />
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-white/5">
          <div className="h-3 bg-slate-700/50 rounded w-1/3" />
          <div className="h-3 bg-slate-700/50 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-card/60 border border-white/5 min-h-[360px] sm:min-h-[440px] animate-pulse p-6 sm:p-10 flex flex-col justify-end">
      <div className="max-w-xl space-y-4">
        <div className="w-24 h-6 rounded-full bg-slate-700/70" />
        <div className="h-8 sm:h-12 bg-slate-700/80 rounded w-4/5" />
        <div className="space-y-2">
          <div className="h-3.5 bg-slate-700/50 rounded w-full" />
          <div className="h-3.5 bg-slate-700/50 rounded w-5/6" />
        </div>
        <div className="flex gap-2 pt-2">
          <div className="w-28 h-10 rounded-xl bg-slate-700/80" />
          <div className="w-28 h-10 rounded-xl bg-slate-700/40" />
        </div>
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-8">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="w-56 sm:w-64 aspect-[3/4] rounded-2xl bg-slate-800 shrink-0 border border-white/5" />
        <div className="flex-1 space-y-4 w-full">
          <div className="w-32 h-6 rounded-full bg-slate-700/70" />
          <div className="h-8 sm:h-10 bg-slate-700/80 rounded w-3/4" />
          <div className="h-4 bg-slate-700/50 rounded w-1/2" />
          <div className="flex gap-2">
            <div className="w-20 h-7 rounded-lg bg-slate-700/50" />
            <div className="w-20 h-7 rounded-lg bg-slate-700/50" />
            <div className="w-20 h-7 rounded-lg bg-slate-700/50" />
          </div>
          <div className="space-y-2 pt-4">
            <div className="h-3.5 bg-slate-700/40 rounded w-full" />
            <div className="h-3.5 bg-slate-700/40 rounded w-full" />
            <div className="h-3.5 bg-slate-700/40 rounded w-4/5" />
          </div>
          <div className="flex gap-4 pt-4">
            <div className="w-36 h-11 rounded-xl bg-slate-700/80" />
            <div className="w-36 h-11 rounded-xl bg-slate-700/50" />
          </div>
        </div>
      </div>
      <div className="space-y-4 pt-6 border-t border-white/5">
        <div className="h-6 bg-slate-700/60 rounded w-40" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-slate-800/50 border border-white/5" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ReaderSkeleton() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="w-12 h-12 rounded-full border-4 border-accent-indigo border-t-transparent animate-spin mb-4" />
      <p className="text-slate-400 text-sm font-medium">Loading chapter images...</p>
    </div>
  );
}
