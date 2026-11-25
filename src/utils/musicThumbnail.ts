import type React from 'react';

/** Branded SVG data URI fallback matching FazuraStream palette when a music cover fails or resolves to 120x90 placeholder. */
export const MUSIC_FALLBACK_SVG =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <rect width="120" height="120" rx="12" fill="#191C25"/>
      <circle cx="60" cy="60" r="32" fill="#E68BA6" opacity="0.16"/>
      <path d="M72 34v36.5a11.5 11.5 0 1 1-7-10.6V45l-18 4.2v25.3a11.5 11.5 0 1 1-7-10.6V40.5a4 4 0 0 1 3.1-3.9l24-5.6A4 4 0 0 1 72 34Z" fill="#E68BA6"/>
    </svg>`
  );

export function handleMusicImageError(e: React.SyntheticEvent<HTMLImageElement>): void {
  const img = e.currentTarget;
  const currentSrc = img.src || '';

  // 1. If hqdefault failed, try mqdefault
  if (currentSrc.includes('/hqdefault.jpg')) {
    img.src = currentSrc.replace('/hqdefault.jpg', '/mqdefault.jpg');
    return;
  }
  // 2. If mqdefault failed, try 0.jpg
  if (currentSrc.includes('/mqdefault.jpg')) {
    img.src = currentSrc.replace('/mqdefault.jpg', '/0.jpg');
    return;
  }
  // 3. Fallback to branded SVG
  if (!currentSrc.startsWith('data:image/svg+xml')) {
    img.src = MUSIC_FALLBACK_SVG;
  }
}

/** YouTube returns a 120x90 grey placeholder image when a video ID thumbnail is missing. */
export function handleMusicImageLoad(e: React.SyntheticEvent<HTMLImageElement>): void {
  const img = e.currentTarget;
  const currentSrc = img.src || '';

  if (
    !currentSrc.startsWith('data:image/svg+xml') &&
    img.naturalWidth > 0 &&
    img.naturalWidth <= 120 &&
    img.naturalHeight <= 90
  ) {
    // If it's a 120x90 YouTube placeholder, try alternative format or fallback
    if (currentSrc.includes('/hqdefault.jpg')) {
      img.src = currentSrc.replace('/hqdefault.jpg', '/mqdefault.jpg');
    } else if (currentSrc.includes('/mqdefault.jpg')) {
      img.src = currentSrc.replace('/mqdefault.jpg', '/0.jpg');
    } else {
      img.src = MUSIC_FALLBACK_SVG;
    }
  }
}
