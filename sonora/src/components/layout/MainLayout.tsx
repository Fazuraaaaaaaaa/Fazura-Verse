'use client';

import React from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import MobileNav from './MobileNav';
import BottomPlayer from '@/components/player/BottomPlayer';
import YouTubePlayer from '@/components/player/YouTubePlayer';
import AudioKeepAlive from '@/components/player/AudioKeepAlive';
import FullscreenPlayer from '@/components/player/FullscreenPlayer';
import QueueDrawer from '@/components/player/QueueDrawer';
import LyricsPanel from '@/components/lyrics/LyricsPanel';
import ContextMenu from '@/components/common/ContextMenu';
import ToastContainer from '@/components/common/ToastContainer';
import KeyboardShortcuts from '@/components/common/KeyboardShortcuts';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="relative flex h-screen w-full flex-col bg-black text-white overflow-hidden select-none">
      {/* Global Keyboard shortcuts */}
      <KeyboardShortcuts />

      {/* Hidden YouTube playback engine & background keepalive */}
      <YouTubePlayer />
      <AudioKeepAlive />

      {/* Main app body */}
      <div className="flex flex-1 overflow-hidden p-0 md:p-2 md:gap-2">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Content Pane */}
        <div className="relative flex flex-1 flex-col overflow-hidden rounded-none md:rounded-lg bg-[#121212]">
          {/* Top Navigation */}
          <TopNav />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 pb-36 md:pb-28">
            {children}
          </main>
        </div>
      </div>

      {/* Persistent Bottom Player Bar */}
      <div className="relative z-40 mb-14 md:mb-0">
        <BottomPlayer />
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav />

      {/* Global Overlays & Modals */}
      <LyricsPanel />
      <QueueDrawer />
      <FullscreenPlayer />
      <ContextMenu />
      <ToastContainer />
    </div>
  );
}
