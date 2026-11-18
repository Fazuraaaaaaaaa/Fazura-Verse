'use client';

import React, { useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsModal({
  isOpen,
  onClose,
}: KeyboardShortcutsModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcutGroups = [
    {
      category: 'Playback Controls',
      items: [
        { key: 'Space', desc: 'Play or pause the current song' },
        { key: 'Shift + →', desc: 'Skip to next song' },
        { key: 'Shift + ←', desc: 'Return to previous song' },
        { key: 'M', desc: 'Mute or unmute audio' },
      ],
    },
    {
      category: 'Views & Panels',
      items: [
        { key: 'L', desc: 'Toggle real-time synced lyrics panel' },
        { key: 'Q', desc: 'Open or close the play queue drawer' },
        { key: 'P', desc: 'Launch standalone Pop-up Mini Player' },
        { key: '?', desc: 'Open this keyboard shortcuts cheat sheet' },
        { key: 'Esc', desc: 'Close open dialogs, fullscreen or panels' },
      ],
    },
    {
      category: 'Mouse & Interactions',
      items: [
        { key: 'Right-Click', desc: 'Open song context menu with quick actions' },
        { key: 'Double-Click', desc: 'Play track immediately' },
      ],
    },
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-xl bg-[#242424] p-6 shadow-2xl border border-white/10 text-white animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1DB954] text-black font-bold">
              <Keyboard size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Keyboard Shortcuts</h2>
              <p className="text-xs text-[#B3B3B3]">Quick controls for power listeners</p>
            </div>
          </div>
          <button
            type="button"
            title="Close"
            onClick={onClose}
            className="p-1 rounded-full text-[#B3B3B3] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-5 max-h-[70vh] overflow-y-auto pr-1">
          {shortcutGroups.map((group) => (
            <div key={group.category} className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1DB954]">
                {group.category}
              </h3>
              <div className="space-y-1.5">
                {group.items.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-white/5 transition-colors"
                  >
                    <span className="text-xs sm:text-sm text-white/90">{item.desc}</span>
                    <kbd className="flex items-center gap-1 rounded bg-[#333333] border border-white/10 px-2 py-0.5 text-xs font-mono font-bold text-white shadow-sm">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-white/10 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white px-5 py-1.5 text-xs font-bold text-black hover:scale-105 active:scale-95 transition-transform"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
