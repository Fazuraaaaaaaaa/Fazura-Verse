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
  const [fallbackStep, setFallbackStep] = useState<0 | 1 | 2>(0); // 0=direct, 1=https-upgraded, 2=proxy
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Sync state when src prop changes
  useEffect(() => {
    setCurrentSrc(src);
    setFallbackStep(0);
    setLoaded(false);
    setError(false);
  }, [src]);

  // Controlled fallback chain (max 2 automatic retries, zero infinite loops)
  const handleError = useCallback(() => {
    if (!src) {
      setError(true);
      setLoaded(false);
      return;
    }

    if (fallbackStep === 0 && src.startsWith('http://')) {
      // Step 1: Attempt HTTPS upgrade before proxy
      setFallbackStep(1);
      setLoaded(false);
      setCurrentSrc(src.replace(/^http:\/\//i, 'https://'));
      return;
    }

    if (fallbackStep < 2) {
      // Step 2: Safe single-attempt proxy fallback for hotlink/CORS-blocked CDN images
      setFallbackStep(2);
      setLoaded(false);
      setCurrentSrc(`/api/image-proxy?url=${encodeURIComponent(src)}`);
      return;
    }

    // All controlled fallbacks exhausted
    setError(true);
    setLoaded(false);
  }, [fallbackStep, src]);

  const handleRetry = useCallback(() => {
    setError(false);
    setLoaded(false);
    setFallbackStep(0);
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
    <div
      className={`relative w-full flex items-center justify-center bg-black/30 overflow-hidden ${
        !loaded || error ? 'min-h-[260px]' : 'min-h-0'
      }`}
    >
      {/* Loading Shimmer Skeleton Overlay */}
      {!loaded && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#12141B]/95 min-h-[260px] z-10">
          <div className="w-8 h-8 border-[3px] border-[#75C9A0] border-t-transparent rounded-full animate-spin mb-2" />
          <span className="text-xs text-[#A2A4B1] font-medium">
            Halaman {index + 1} / {total}{' '}
            {fallbackStep === 2 ? '(Proxy CDN)' : fallbackStep === 1 ? '(HTTPS)' : ''}
          </span>
        </div>
      )}

      {/* Error Retry State */}
      {error ? (
        <div className="p-8 text-center rounded-2xl bg-[#191C25] border border-[#343744] my-4 space-y-3 z-20 max-w-xs">
          <ImageOff className="w-8 h-8 text-rose-400 mx-auto" />
          <p className="text-xs text-[#A2A4B1]">Gagal memuat gambar halaman {index + 1}</p>
          <button
            type="button"
            onClick={handleRetry}
            className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2 rounded-[10px] bg-[#F0A15B] hover:bg-[#F6B779] text-[#0B0C10] text-xs font-bold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Muat Ulang Halaman
          </button>
        </div>
      ) : (
        <img
          src={currentSrc}
          alt={`Halaman ${index + 1} dari ${total}`}
          loading="lazy"
          decoding="async"
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
