import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatNumber(num: number | string | undefined): string {
  if (num === undefined || num === null) return '0';
  const n = typeof num === 'string' ? parseInt(num.replace(/[^0-9]/g, ''), 10) : num;
  if (isNaN(n)) return '0';
  return new Intl.NumberFormat().format(n);
}

export function formatPlays(views: string | number | undefined): string {
  if (!views) return '—';
  if (typeof views === 'number') {
    return new Intl.NumberFormat().format(views);
  }
  const clean = views
    .replace(/\s*views?/gi, '')
    .replace(/\s*plays?/gi, '')
    .trim();
  return clean || '—';
}
