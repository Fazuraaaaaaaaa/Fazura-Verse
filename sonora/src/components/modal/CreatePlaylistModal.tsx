'use client';

import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { useLibraryStore } from '@/stores/useLibraryStore';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlistIdToEdit?: string;
  initialTitle?: string;
  initialDescription?: string;
  initialCover?: string;
}

export default function CreatePlaylistModal({
  isOpen,
  onClose,
  playlistIdToEdit,
  initialTitle = '',
  initialDescription = '',
  initialCover = '',
}: CreatePlaylistModalProps) {
  const { createPlaylist, updatePlaylist } = useLibraryStore();
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [cover, setCover] = useState(initialCover);

  useEffect(() => {
    setTitle(initialTitle);
    setDescription(initialDescription);
    setCover(initialCover);
  }, [initialTitle, initialDescription, initialCover, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playlistIdToEdit) {
      updatePlaylist(playlistIdToEdit, {
        title: title.trim() || 'My Playlist',
        description: description.trim(),
        cover: cover.trim() || undefined,
      });
    } else {
      createPlaylist(
        title.trim() || undefined,
        description.trim() || undefined,
        cover.trim() || undefined
      );
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-md rounded-lg bg-[#282828] p-6 shadow-2xl border border-white/10 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <h2 className="text-xl font-bold">
            {playlistIdToEdit ? 'Edit details' : 'Create new playlist'}
          </h2>
          <button
            type="button"
            title="Close"
            onClick={onClose}
            className="p-1 rounded-full text-[#B3B3B3] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#B3B3B3] mb-1.5">
              Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your playlist a title"
              className="w-full rounded bg-[#3E3E3E] px-3.5 py-2.5 text-sm text-white placeholder-[#727272] focus:outline-none focus:ring-2 focus:ring-white"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#B3B3B3] mb-1.5">
              Description (optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add an optional description"
              className="w-full rounded bg-[#3E3E3E] px-3.5 py-2.5 text-sm text-white placeholder-[#727272] focus:outline-none focus:ring-2 focus:ring-white resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#B3B3B3] mb-1.5">
              Cover Image URL (optional)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={cover}
                onChange={(e) => setCover(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full rounded bg-[#3E3E3E] px-3.5 py-2 text-xs text-white placeholder-[#727272] focus:outline-none focus:ring-2 focus:ring-white"
              />
              {cover && (
                <div className="h-9 w-9 rounded overflow-hidden bg-black flex-shrink-0 border border-white/10">
                  <img src={cover} alt="" className="h-full w-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-full text-sm font-bold text-white hover:scale-105 transition-transform"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-full bg-white text-black text-sm font-bold hover:scale-105 active:scale-95 transition-transform"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
