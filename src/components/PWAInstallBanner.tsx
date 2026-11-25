import React, { useEffect, useState } from 'react';
import { Download, X, Sparkles } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'fazura_pwa_prompt_dismissed_at';
const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Skip if already installed as standalone app
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    try {
      const dismissedAt = parseInt(localStorage.getItem(DISMISS_KEY) || '0', 10);
      if (dismissedAt && Date.now() - dismissedAt < DISMISS_COOLDOWN_MS) {
        return;
      }
    } catch {
      // ignore storage failure
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setVisible(false);
        setDeferredPrompt(null);
      }
    } catch {
      setVisible(false);
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // ignore
    }
  };

  if (!visible || !deferredPrompt) return null;

  return (
    <div
      role="region"
      aria-label="Pasang Aplikasi FazuraStream"
      className="fixed bottom-16 md:bottom-5 left-3 right-3 sm:left-auto sm:right-5 sm:max-w-sm z-40 p-3.5 rounded-2xl bg-surface/95 backdrop-blur-xl border border-accent-primary/40 shadow-2xl shadow-black/70 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300"
    >
      <div className="w-10 h-10 rounded-xl bg-accent-primary/15 border border-accent-primary/30 flex items-center justify-center shrink-0">
        <Sparkles className="w-5 h-5 text-accent-primary" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-white truncate">Pasang FazuraStream App</p>
        <p className="text-[11px] text-text-secondary truncate">
          Akses lebih cepat & baca manga tersimpan offline
        </p>
      </div>

      <button
        type="button"
        onClick={handleInstall}
        className="min-h-[40px] px-3 py-1.5 rounded-xl bg-accent-primary hover:bg-accent-primary/90 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-md shadow-accent-primary/25 transition-all"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install</span>
      </button>

      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Tutup banner instalasi"
        className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-xl text-text-muted hover:text-white hover:bg-white/5 flex items-center justify-center shrink-0 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
