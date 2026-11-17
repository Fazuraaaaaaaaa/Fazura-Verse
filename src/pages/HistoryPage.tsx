import React from 'react';
import { Link } from 'react-router-dom';
import { History, Trash2, PlayCircle, Clock, Compass, BookOpen } from 'lucide-react';
import { useReadingHistory } from '../hooks/useReadingHistory';

export function HistoryPage() {
  const { history, removeHistoryItem, clearHistory } = useReadingHistory();

  const formatDate = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min ago`;
    if (hours < 24) return `${hours} hr ago`;
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black text-white flex items-center gap-3">
            <History className="w-8 h-8 text-accent-indigo" />
            Reading History
          </h1>
          <p className="text-sm text-slate-400">
            Recently read manga chapters and reading progress ({history.length} items)
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to clear your reading history?')) {
                clearHistory();
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors self-start sm:self-auto"
          >
            <Trash2 className="w-4 h-4" />
            Clear History
          </button>
        )}
      </div>

      {/* History Items List */}
      {history.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-card/40 border border-white/5 max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-accent-indigo/10 text-accent-indigo flex items-center justify-center mx-auto">
            <History className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">No Reading History</h3>
          <p className="text-sm text-slate-400">
            You haven't read any manga chapters yet. Your reading history and progress will appear here automatically.
          </p>
          <Link
            to="/browse"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-indigo text-white font-bold text-sm shadow-lg shadow-accent-indigo/30 hover:bg-accent-indigo/90 transition-all"
          >
            <Compass className="w-4 h-4" />
            Browse Manga Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {history.map((item) => (
            <div
              key={`${item.slug}-${item.chapterSlug}`}
              className="flex items-center justify-between p-4 rounded-2xl bg-card border border-white/5 hover:border-accent-indigo/40 shadow-lg transition-all gap-4 group"
            >
              <div className="flex items-center gap-4 min-w-0">
                {/* Manga Cover */}
                <Link
                  to={`/manga/${item.slug}`}
                  className="relative w-16 h-22 rounded-xl overflow-hidden shrink-0 border border-white/10 group-hover:scale-105 transition-transform bg-slate-900"
                >
                  <img
                    src={item.mangaCover}
                    alt={item.mangaTitle}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </Link>

                {/* Details */}
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-accent-cyan" />
                      {formatDate(item.lastReadAt)}
                    </span>
                    {item.progress ? (
                      <span className="text-slate-500">• {Math.round(item.progress)}% read</span>
                    ) : null}
                  </div>

                  <Link
                    to={`/manga/${item.slug}`}
                    className="font-bold text-white hover:text-accent-indigo transition-colors truncate block text-sm sm:text-base"
                  >
                    {item.mangaTitle}
                  </Link>

                  <p className="text-xs text-accent-indigo font-semibold truncate">
                    {item.chapterTitle}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to={`/chapter/${item.chapterSlug}`}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-accent-indigo hover:bg-accent-indigo/90 text-white font-bold text-xs shadow-md shadow-accent-indigo/20 transition-all"
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Resume</span>
                </Link>

                <button
                  onClick={() => removeHistoryItem(item.slug)}
                  title="Remove from history"
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
