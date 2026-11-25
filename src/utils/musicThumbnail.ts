import type React from 'react';

/** Branded SVG data URI fallback when a music cover fails or resolves to YouTube's 120x90 grey placeholder. */
export const MUSIC_FALLBACK_SVG =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <defs>
        <linearGradient id="fmbg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#181827"/>
          <stop offset="55%" stop-color="#11111D"/>
          <stop offset="100%" stop-color="#090912"/>
        </linearGradient>
        <linearGradient id="fmaccent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1DB954"/>
          <stop offset="100%" stop-color="#8B5CF6"/>
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="16" fill="url(#fmbg)"/>
      <circle cx="60" cy="60" r="34" fill="url(#fmaccent)" opacity="0.16"/>
      <path d="M72 34v36.5a11.5 11.5 0 1 1-7-10.6V45l-18 4.2v25.3a11.5 11.5 0 1 1-7-10.6V40.5a4 4 0 0 1 3.1-3.9l24-5.6A4 4 0 0 1 72 34Z" fill="url(#fmaccent)"/>
    </svg>`
  );

export function handleMusicImageError(e: React.SyntheticEvent<HTMLImageElement>): void {
  const img = e.currentTarget;
  if (!img.src.startsWith('data:image/svg+xml')) {
    img.src = MUSIC_FALLBACK_SVG;
  }
}

/** YouTube returns a 120x90 grey placeholder image with HTTP 404/200 when a video ID thumbnail is missing. */
export function handleMusicImageLoad(e: React.SyntheticEvent<HTMLImageElement>): void {
  const img = e.currentTarget;
  if (
    !img.src.startsWith('data:image/svg+xml') &&
    img.naturalWidth > 0 &&
    img.naturalWidth <= 120 &&
    img.naturalHeight <= 90
  ) {
    img.src = MUSIC_FALLBACK_SVG;
  }
}
