import React, { useState, useEffect } from 'react';
import { X, Smartphone, Download, Share2, PlusSquare, CheckCircle, Sparkles } from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Check if already in standalone mode (already installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) {
      setIsInstalled(true);
    }

    // Capture beforeinstallprompt for Android / Chrome / Edge
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose} />

      <div 
        className="relative z-10 w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-2xl overflow-hidden text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold text-base text-zinc-100 font-display">
              Install Humor Tok on Mobile
            </h3>
          </div>
          <button
            id="btn-close-install"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* App Preview Card */}
        <div className="mt-4 p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 via-amber-400 to-cyan-400 p-0.5 shadow-lg shrink-0">
            <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center text-2xl">
              🤣
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-extrabold text-sm text-white font-display flex items-center gap-1.5">
              Humor Tok App
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-sans border border-rose-500/30">
                PWA
              </span>
            </h4>
            <p className="text-xs text-zinc-400 truncate">
              Full-screen TikTok comedy reels & offline mode
            </p>
          </div>
        </div>

        {isInstalled ? (
          <div className="mt-5 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="font-bold text-sm text-emerald-300">Humor Tok is Already Installed!</p>
            <p className="text-xs text-zinc-400 mt-1">
              You can launch it directly from your home screen like a native mobile app.
            </p>
          </div>
        ) : isIOS ? (
          /* iOS Safari Instructions */
          <div className="mt-4 space-y-3">
            <p className="text-xs text-zinc-300 font-medium">
              iPhone par install karne ke aasan 3 steps:
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center text-[11px] shrink-0">
                  1
                </span>
                <span className="flex-1 text-zinc-300">
                  Safari browser me neeche <Share2 className="w-3.5 h-3.5 inline text-cyan-400 mx-1" /> <strong>Share</strong> button dabayein.
                </span>
              </div>
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center text-[11px] shrink-0">
                  2
                </span>
                <span className="flex-1 text-zinc-300">
                  Thoda neeche scroll karke <PlusSquare className="w-3.5 h-3.5 inline text-amber-400 mx-1" /> <strong>'Add to Home Screen'</strong> chunein.
                </span>
              </div>
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center text-[11px] shrink-0">
                  3
                </span>
                <span className="flex-1 text-zinc-300">
                  Upar daayein kone me <strong>'Add'</strong> par tap karein. App ready!
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Android / Chrome Instructions & Direct Install Button */
          <div className="mt-4 space-y-3">
            <p className="text-xs text-zinc-300">
              Android ya Chrome par Humor Tok ko direct install karein. Ye bina Play Store ke fast install hota hai aur offline reels support karta hai.
            </p>

            {deferredPrompt ? (
              <button
                id="btn-install-pwa-direct"
                onClick={handleInstallClick}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-bold text-sm shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 active:scale-98 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Install Humor Tok App Now</span>
              </button>
            ) : (
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-zinc-300">
                  Chrome browser me upar daayein <strong>3 Dots (⋮)</strong> par click karein aur <strong>"Install app"</strong> ya <strong>"Add to Home screen"</strong> par tap karein.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Benefits list */}
        <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-around text-[10px] text-zinc-400">
          <span className="flex items-center gap-1">⚡ Fast & Smooth</span>
          <span className="flex items-center gap-1">📴 Offline Reels</span>
          <span className="flex items-center gap-1">📱 Full Screen</span>
        </div>
      </div>
    </div>
  );
};
