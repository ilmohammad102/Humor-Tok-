import React from 'react';
import { X, Bookmark, Trash2, Wifi, WifiOff, Play, Film, Sparkles, Download } from 'lucide-react';
import { ReelItem } from '../types';

interface OfflineVaultDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedReels: ReelItem[];
  onSelectReel: (reel: ReelItem) => void;
  onRemoveOfflineReel: (reelId: string) => void;
  isSimulatedOffline: boolean;
  onToggleSimulatedOffline: () => void;
}

export const OfflineVaultDrawer: React.FC<OfflineVaultDrawerProps> = ({
  isOpen,
  onClose,
  savedReels,
  onSelectReel,
  onRemoveOfflineReel,
  isSimulatedOffline,
  onToggleSimulatedOffline,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-xs">
      <div className="absolute inset-0" onClick={onClose} />

      <div 
        className="relative z-10 w-full max-w-md h-[78vh] max-h-[720px] bg-zinc-900 border-t border-zinc-800 rounded-t-3xl flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="pt-3 pb-3 px-4 border-b border-zinc-800 flex flex-col items-center shrink-0">
          <div className="w-10 h-1.5 bg-zinc-700 rounded-full mb-3" />
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Bookmark className="w-4 h-4 fill-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-base text-zinc-100 font-display">Offline Comedy Vault</h3>
                <p className="text-[11px] text-zinc-400">
                  {savedReels.length} saved {savedReels.length === 1 ? 'reel' : 'reels'} ready for offline viewing
                </p>
              </div>
            </div>
            <button
              id="btn-close-vault"
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Network Simulation Bar */}
        <div className="px-4 py-2.5 bg-zinc-950/80 border-b border-zinc-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {isSimulatedOffline ? (
              <WifiOff className="w-4 h-4 text-amber-400" />
            ) : (
              <Wifi className="w-4 h-4 text-emerald-400" />
            )}
            <span className="text-xs font-semibold text-zinc-300">
              {isSimulatedOffline ? 'Mode: Simulated Offline' : 'Mode: Online Network'}
            </span>
          </div>

          <button
            id="btn-toggle-sim-offline"
            onClick={onToggleSimulatedOffline}
            className={`text-xs px-2.5 py-1 rounded-full font-bold transition-all border ${
              isSimulatedOffline
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200'
            }`}
          >
            {isSimulatedOffline ? 'Disable Offline Test' : 'Test Offline Mode'}
          </button>
        </div>

        {/* Saved Reels List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
          {savedReels.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-zinc-500 py-12">
              <div className="w-14 h-14 rounded-2xl bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-center text-2xl mb-3 text-amber-400">
                📦
              </div>
              <h4 className="font-bold text-sm text-zinc-200">No Offline Reels Saved Yet</h4>
              <p className="text-xs text-zinc-400 mt-1 max-w-[260px] leading-relaxed">
                Tap the bookmark ribbon icon on any comedy reel to save it for subway rides, airplanes, or zero-data comedy sessions!
              </p>
            </div>
          ) : (
            savedReels.map((reel) => (
              <div
                key={reel.id}
                className="p-3 bg-zinc-950/90 border border-zinc-800/80 hover:border-zinc-700 rounded-2xl flex items-center gap-3 transition-colors group cursor-pointer"
                onClick={() => {
                  onSelectReel(reel);
                  onClose();
                }}
              >
                {/* Poster / Thumbnail with Play Icon */}
                <div className="relative w-16 h-22 rounded-xl bg-zinc-800 overflow-hidden shrink-0 border border-zinc-700/60 flex items-center justify-center">
                  <div className="w-full h-full bg-gradient-to-t from-black/80 via-transparent to-black/30 absolute inset-0 z-10" />
                  <span className="text-2xl z-0">🤣</span>
                  <div className="absolute inset-0 z-20 flex items-center justify-center opacity-80 group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 text-white fill-white drop-shadow-md" />
                  </div>
                  <div className="absolute bottom-1 right-1 z-20 text-[9px] font-mono bg-black/70 px-1 rounded text-zinc-300">
                    Offline
                  </div>
                </div>

                {/* Reel Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <img
                      src={reel.author.avatar}
                      alt={reel.author.name}
                      className="w-4 h-4 rounded-full object-cover"
                    />
                    <span className="text-xs font-semibold text-zinc-300 truncate">
                      {reel.author.name}
                    </span>
                    {reel.author.isOwner && (
                      <span className="text-[10px] text-amber-400 font-bold">👑</span>
                    )}
                  </div>
                  <h5 className="font-bold text-xs text-zinc-100 line-clamp-2 leading-snug">
                    {reel.title}
                  </h5>
                  <div className="flex items-center gap-2 mt-1.5 text-[11px] text-zinc-500">
                    <span>❤️ {(reel.likesCount / 1000).toFixed(1)}k</span>
                    <span>🎵 {reel.audio.title.slice(0, 18)}...</span>
                  </div>
                </div>

                {/* Delete from offline vault */}
                <button
                  id={`btn-remove-offline-${reel.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveOfflineReel(reel.id);
                  }}
                  className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors shrink-0"
                  title="Remove from offline vault"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
