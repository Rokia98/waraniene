'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Ne pas afficher si l'app est déjà installée en mode standalone
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    // Ne pas réafficher si l'utilisateur a déjà refusé
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) return;

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    const onAppInstalled = () => setShowPrompt(false);

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:max-w-xs">
      <div className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-white p-4 shadow-2xl ring-1 ring-stone-900/5">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-amber-700">
          <Download className="h-5 w-5 text-white" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-stone-900">
            Installer l&apos;application
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-stone-500">
            Accédez à la boutique hors ligne depuis votre écran d&apos;accueil.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleInstall}
              className="rounded-full bg-amber-700 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-amber-800 active:scale-95"
            >
              Installer
            </button>
            <button
              onClick={handleDismiss}
              className="rounded-full border border-stone-200 px-4 py-1.5 text-xs font-semibold text-stone-600 transition-colors hover:border-stone-300"
            >
              Plus tard
            </button>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          aria-label="Fermer le message d'installation"
          className="flex-shrink-0 rounded-full p-1 text-stone-400 transition-colors hover:text-stone-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
