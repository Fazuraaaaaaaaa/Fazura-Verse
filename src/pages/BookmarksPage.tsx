import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Trash2, BookOpen, Compass, Search } from 'lucide-react';
import { useBookmarks } from '../hooks/useBookmarks';
import { MangaCard } from '../components/MangaCard';
import type { MangaItem } from '../types/manga';

export function BookmarksPage() {
  const { bookmarks, removeBookmark, clearBookmarks } = useBookmarks();
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Map BookmarkItem to MangaItem for MangaCard rendering
  const mangaItems: MangaItem[] = bookmarks.map((b) => ({
    title: b.title,
    slug: b.slug,
    cover: b.cover,
    type: b.type,
  }));

  const filtered = mangaItems.filter((m) => {
    const matchesQuery = m.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      filterType === 'all' || (m.type || '').toLowerCase() === filterType.toLowerCase();
    return matchesQuery && matchesType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black text-white flex items-center gap-3">
            <Bookmark className="w-8 h-8 text-accent-indigo" />
            Favorite Manga
          </h1>
          <p className="text-sm text-slate-400">
            Your personal manga library saved locally in your browser ({bookmarks.length} saved)
          </p>
        </div>

        {bookmarks.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to clear all bookmarked manga?')) {
                clearBookmarks();
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors self-start sm:self-auto"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      {/* Filter and Search Bar if bookmarks exist */}
      {bookmarks.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search your favorites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-card border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-accent-indigo"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            {['all', 'manga', 'manhwa', 'manhua'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize border transition-all ${
                  filterType === t
                    ? 'bg-accent-indigo text-white border-accent-indigo'
                    : 'bg-card/70 hover:bg-card text-slate-300 border-white/5'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      {bookmarks.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-card/40 border border-white/5 max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-accent-indigo/10 text-accent-indigo flex items-center justify-center mx-auto">
            <Bookmark className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">No Bookmarks Saved Yet</h3>
          <p className="text-sm text-slate-400">
            Browse our huge manga collection and click "Add to Favorites" to keep track of your favorite titles.
          </p>
          <Link
            to="/browse"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-indigo text-white font-bold text-sm shadow-lg shadow-accent-indigo/30 hover:bg-accent-indigo/90 transition-all"
          >
            <Compass className="w-4 h-4" />
            Explore Manga Catalog
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-sm text-slate-400">
          No favorites match your search or filter.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-5">
          {filtered.map((manga) => (
            <div key={manga.slug} className="relative group">
              <MangaCard manga={manga} />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  removeBookmark(manga.slug);
                }}
                title="Remove from bookmarks"
                className="absolute top-2 right-2 z-30 p-1.5 rounded-lg bg-black/80 hover:bg-rose-600 text-slate-300 hover:text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
