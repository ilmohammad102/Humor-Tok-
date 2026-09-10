import React from 'react';
import { Home, Compass, Plus, Bookmark, Crown, User } from 'lucide-react';

interface BottomTabBarProps {
  currentTab: 'home' | 'discover' | 'vault' | 'profile';
  onSelectTab: (tab: 'home' | 'discover' | 'vault' | 'profile') => void;
  onOpenCreate: () => void;
  savedCount: number;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  currentTab,
  onSelectTab,
  onOpenCreate,
  savedCount,
}) => {
  return (
    <div className="absolute bottom-0 inset-x-0 z-40 bg-zinc-950/90 border-t border-zinc-800/80 backdrop-blur-md px-4 py-2 flex items-center justify-around text-zinc-400">
      {/* Home Feed */}
      <button
        id="tab-btn-home"
        onClick={() => onSelectTab('home')}
        className={`flex flex-col items-center gap-0.5 transition-colors py-1 ${
          currentTab === 'home' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        <Home className={`w-5 h-5 ${currentTab === 'home' ? 'stroke-[2.5]' : ''}`} />
        <span className="text-[10px] font-bold">Home</span>
      </button>

      {/* Discover / Trending */}
      <button
        id="tab-btn-discover"
        onClick={() => onSelectTab('discover')}
        className={`flex flex-col items-center gap-0.5 transition-colors py-1 ${
          currentTab === 'discover' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        <Compass className={`w-5 h-5 ${currentTab === 'discover' ? 'stroke-[2.5]' : ''}`} />
        <span className="text-[10px] font-bold">Discover</span>
      </button>

      {/* Center (+) Create Button with iconic TikTok vibrant styling */}
      <button
        id="btn-tab-create"
        onClick={onOpenCreate}
        className="relative group -mt-3 active:scale-95 transition-transform"
        title="Create & Upload Comedy Reel"
      >
        <div className="w-12 h-8 rounded-lg bg-gradient-to-r from-cyan-400 via-white to-rose-500 p-0.5 shadow-lg shadow-rose-500/20 flex items-center justify-center">
          <div className="w-full h-full bg-zinc-950 rounded-[7px] flex items-center justify-center">
            <Plus className="w-5 h-5 text-white stroke-[3]" />
          </div>
        </div>
      </button>

      {/* Offline Saved Vault */}
      <button
        id="tab-btn-vault"
        onClick={() => onSelectTab('vault')}
        className={`flex flex-col items-center gap-0.5 transition-colors py-1 relative ${
          currentTab === 'vault' ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        <Bookmark className={`w-5 h-5 ${currentTab === 'vault' ? 'fill-amber-400 stroke-[2.5]' : ''}`} />
        <span className="text-[10px] font-bold">Offline</span>
        {savedCount > 0 && (
          <span className="absolute -top-1 right-1 w-3.5 h-3.5 bg-amber-500 text-zinc-950 text-[8px] font-bold rounded-full flex items-center justify-center">
            {savedCount}
          </span>
        )}
      </button>

      {/* Owner / Profile */}
      <button
        id="tab-btn-profile"
        onClick={() => onSelectTab('profile')}
        className={`flex flex-col items-center gap-0.5 transition-colors py-1 ${
          currentTab === 'profile' ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        <Crown className={`w-5 h-5 ${currentTab === 'profile' ? 'fill-amber-400' : ''}`} />
        <span className="text-[10px] font-bold">Mohammad</span>
      </button>
    </div>
  );
};
