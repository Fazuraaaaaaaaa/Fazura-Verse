import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, ImageOff } from 'lucide-react';
import type { ReaderSettings } from '../../types/manga';

interface ReaderImageProps {
  src: string;
  index: number;
  total: number;
  fit: ReaderSettings['fit'];
}

export function ReaderImage({ src, index, total, fit }: ReaderImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [attemptedProxy, setAttemptedProxy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Sync state when src prop changes
  useEffect(() => {
    setCurrentSrc(src);
    setAttemptedProxy(false);
    setLoaded(false);
    setError(false);
  }, [src]);

  // Automatic retry fallback with proxy to prevent hotlink/CORS failure
  const handleError = useCallback(() => {
    if (!attemptedProxy && src) {
      setAttemptedProxy(true);
      setLoaded(false);
      // Auto-fallback once via image-proxy
      setCurrentSrc(`/api/image-proxy?url=${encodeURIComponent(src)}`);
    } else {
      // Guard against infinite loop: proxy already attempted, show error
      setError(true);
      setLoaded(false);
    }
  }, [attemptedProxy, src]);

  const handleRetry = useCallback(() => {
    setError(false);
    setLoaded(false);
    setAttemptedProxy(false);
    setCurrentSrc(src);
  }, [src]);

  // Image Fit class
  const fitClass =
    fit === 'height'
      ? 'max-h-screen w-auto object-contain mx-auto'
      : fit === 'original'
      ? 'w-auto max-w-full mx-auto object-none'
      : 'w-full max-w-4xl mx-auto object-contain'; // default 'width'

  return (
    <div className="relative min-h-[300px] w-full flex items-center justify-center bg-black/40 overflow-hidden">
      {/* Loading Shimmer Skeleton Overlay */}
      {!loaded && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/60 animate-pulse min-h-[400px] z-10">
          <div className="w-8 h-8 border-3 border-accent-indigo border-t-transparent rounded-full animate-spin mb-2" />
          <span className="text-xs text-slate-400 font-medium">
            Page {index + 1} of {total} {attemptedProxy ? '(Proxy Stream)' : ''}
          </span>
        </div>
      )}

      {/* Error Retry State */}
      {error ? (
        <div className="p-8 text-center rounded-xl bg-card/60 border border-white/5 my-4 space-y-3 z-20">
          <ImageOff className="w-8 h-8 text-rose-400 mx-auto" />
          <p className="text-xs text-slate-300">Gagal memuat halaman {index + 1}</p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-indigo/20 text-accent-indigo hover:bg-accent-indigo hover:text-white text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Coba Lagi
          </button>
        </div>
      ) : (
        <img
          src={currentSrc}
          alt={`Page ${index + 1}`}
          loading="lazy"
          referrerPolicy="no-referrer"
          onLoad={() => setLoaded(true)}
          onError={handleError}
          className={`${fitClass} transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
}

export default ReaderImage;
