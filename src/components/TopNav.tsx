import React from 'react';
import { Crown, Bookmark, Sparkles, WifiOff, Search, Laugh, Smartphone } from 'lucide-react';
import { POPULAR_TAGS } from '../data/initialReels';

interface TopNavProps {
  feedTab: 'forYou' | 'following';
  onSelectFeedTab: (tab: 'forYou' | 'following') => void;
  selectedTag: string;
  onSelectTag: (tag: string) => void;
  onOpenAdmin: () => void;
  onOpenVault: () => void;
  onOpenInstall: () => void;
  savedReelsCount: number;
  isSimulatedOffline: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  feedTab,
  onSelectFeedTab,
  selectedTag,
  onSelectTag,
  onOpenAdmin,
  onOpenVault,
  onOpenInstall,
  savedReelsCount,
  isSimulatedOffline,
}) => {
  return (
    <div className="absolute top-0 inset-x-0 z-30 flex flex-col pointer-events-auto bg-gradient-to-b from-black/80 via-black/40 to-transparent pb-3 pt-3 px-3">
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-2">
        {/* Logo & Brand */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 via-amber-400 to-cyan-400 p-0.5 shadow-md">
            <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center text-sm">
              🤣
            </div>
          </div>
          <span className="font-extrabold text-base tracking-tight font-display text-white drop-shadow hidden xs:inline">
            Humor<span className="text-rose-500">Tok</span>
          </span>
        </div>

        {/* Following vs For You Feed Switcher */}
        <div className="flex items-center gap-3 text-sm font-bold">
          <button
            id="tab-following"
            onClick={() => onSelectFeedTab('following')}
            className={`transition-colors relative py-1 ${
              feedTab === 'following'
                ? 'text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Following
            {feedTab === 'following' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-rose-500 rounded-full" />
            )}
          </button>

          <span className="text-zinc-600">|</span>

          <button
            id="tab-foryou"
            onClick={() => onSelectFeedTab('forYou')}
            className={`transition-colors relative py-1 flex items-center gap-1 ${
              feedTab === 'forYou'
                ? 'text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>For You</span>
            <span className="text-xs">🔥</span>
            {feedTab === 'forYou' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-rose-500 rounded-full" />
            )}
          </button>
        </div>

        {/* Right Header Icons */}
        <div className="flex items-center gap-1.5">
          {/* Simulated Offline Badge if active */}
          {isSimulatedOffline && (
            <div 
              onClick={onOpenVault}
              className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer animate-pulse"
              title="Simulated Offline Mode active"
            >
              <WifiOff className="w-3 h-3" />
              <span>Offline</span>
            </div>
          )}

          {/* Offline Saved Vault Button */}
          <button
            id="btn-nav-vault"
            onClick={onOpenVault}
            className="relative p-2 rounded-full bg-black/40 hover:bg-black/70 border border-zinc-700/60 text-zinc-300 hover:text-white transition-colors"
            title="Saved Offline Reels"
          >
            <Bookmark className="w-4 h-4" />
            {savedReelsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-zinc-950 font-bold text-[9px] rounded-full flex items-center justify-center">
                {savedReelsCount}
              </span>
            )}
          </button>

          {/* Install Mobile App Button */}
          <button
            id="btn-nav-install"
            onClick={onOpenInstall}
            className="p-1.5 px-2 rounded-full bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-1 active:scale-95 transition-all"
            title="Install Humor Tok on Mobile"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">App</span>
          </button>

          {/* Mohammad Owner Crown Button */}
          <button
            id="btn-nav-owner"
            onClick={onOpenAdmin}
            className="p-1.5 px-2.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-zinc-950 font-extrabold text-xs flex items-center gap-1 shadow-lg shadow-amber-500/20 active:scale-95 transition-transform"
            title="Mohammad's Owner Dashboard"
          >
            <Crown className="w-3.5 h-3.5 fill-zinc-950 text-zinc-950" />
            <span className="hidden sm:inline">Owner</span>
          </button>
        </div>
      </div>

      {/* Category Hashtag Chips Slider */}
      <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto no-scrollbar py-0.5">
        {POPULAR_TAGS.map((tag) => {
          const isSelected = selectedTag === tag;
          return (
            <button
              key={tag}
              onClick={() => onSelectTag(tag)}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                isSelected
                  ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30 scale-105'
                  : 'bg-black/50 text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white backdrop-blur-xs'
              }`}
            >
              {tag === '#All' ? '🌟 All Comedy' : tag}
            </button>
          );
        })}
      </div>
    </div>
  );
};
