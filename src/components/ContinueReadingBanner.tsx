import React from 'react';
import { Link } from 'react-router-dom';
import { PlayCircle, Clock, BookOpen, Trash2 } from 'lucide-react';
import { useReadingHistory } from '../hooks/useReadingHistory';

export function ContinueReadingBanner() {
  const { history, removeHistoryItem } = useReadingHistory();

  if (!history || history.length === 0) return null;

  const latest = history[0];

  return (
    <div className="relative rounded-2xl bg-gradient-to-r from-surface via-card to-surface border border-accent-indigo/20 p-4 sm:p-5 shadow-lg overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Background Accent glow */}
      <div className="absolute top-0 right-0 w-64 h-full bg-accent-indigo/5 blur-3xl pointer-events-none" />

      <div className="flex items-center gap-4 w-full sm:w-auto">
        {/* Cover thumbnail */}
        <Link
          to={`/manga/${latest.slug}`}
          className="relative w-14 h-20 sm:w-16 sm:h-24 rounded-xl overflow-hidden shrink-0 border border-white/10 group"
        >
          <img
            src={latest.mangaCover}
            alt={latest.mangaTitle}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
        </Link>

        {/* Text Details */}
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/20">
              Continue Reading
            </span>
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              <Clock className="w-3 h-3" />
              {new Date(latest.lastReadAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>

          <Link
            to={`/manga/${latest.slug}`}
            className="font-bold text-white hover:text-accent-indigo transition-colors truncate block text-base sm:text-lg"
          >
            {latest.mangaTitle}
          </Link>

          <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2">
            <span className="text-accent-indigo font-semibold">{latest.chapterTitle}</span>
            {latest.progress ? (
              <span className="text-slate-400">({Math.round(latest.progress)}% read)</span>
            ) : null}
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <button
          onClick={() => removeHistoryItem(latest.slug)}
          title="Dismiss"
          aria-label="Dismiss reading entry"
          className="p-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <Link
          to={`/chapter/${latest.chapterSlug}`}
          className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-accent-indigo hover:bg-accent-indigo/90 text-white font-bold text-sm shadow-md shadow-accent-indigo/30 transition-transform active:scale-95"
        >
          <PlayCircle className="w-4 h-4" />
          Resume Chapter
        </Link>
      </div>
    </div>
  );
}
