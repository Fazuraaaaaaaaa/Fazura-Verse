import React, { useState } from 'react';
import { RefreshCw, ImageOff } from 'lucide-react';
import type { ReaderSettings } from '../../types/manga';

interface ReaderImageProps {
  src: string;
  index: number;
  total: number;
  fit: ReaderSettings['fit'];
}

export function ReaderImage({ src, index, total, fit }: ReaderImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const handleRetry = () => {
    setError(false);
    setLoaded(false);
    setRetryKey((prev) => prev + 1);
  };

  // Image Fit class
  const fitClass =
    fit === 'height'
      ? 'max-h-screen w-auto object-contain mx-auto'
      : fit === 'original'
      ? 'w-auto max-w-full mx-auto object-none'
      : 'w-full max-w-4xl mx-auto object-contain'; // default 'width'

  return (
    <div className="relative min-h-[300px] flex items-center justify-center bg-black/40">
      {/* Loading Shimmer Skeleton */}
      {!loaded && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/60 animate-pulse min-h-[400px]">
          <div className="w-8 h-8 border-3 border-accent-indigo border-t-transparent rounded-full animate-spin mb-2" />
          <span className="text-xs text-slate-400 font-medium">
            Page {index + 1} of {total}
          </span>
        </div>
      )}

      {/* Error Retry State */}
      {error ? (
        <div className="p-8 text-center rounded-xl bg-card/60 border border-white/5 my-4 space-y-3">
          <ImageOff className="w-8 h-8 text-rose-400 mx-auto" />
          <p className="text-xs text-slate-300">Failed to load page {index + 1}</p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-indigo/20 text-accent-indigo hover:bg-accent-indigo hover:text-white text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      ) : (
        <img
          key={retryKey}
          src={src}
          alt={`Page ${index + 1}`}
          loading="lazy"
          referrerPolicy="no-referrer"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`${fitClass} transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
}
