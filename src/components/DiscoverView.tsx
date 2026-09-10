import React, { useState } from 'react';
import { Search, Flame, Music, Sparkles, TrendingUp, Crown, ShieldCheck, Play } from 'lucide-react';
import { ReelItem } from '../types';
import { COMEDY_SOUND_EFFECTS, POPULAR_TAGS } from '../data/initialReels';
import { comedyAudio } from '../utils/audioSynth';

interface DiscoverViewProps {
  reels: ReelItem[];
  onSelectReel: (reel: ReelItem) => void;
  onSelectTag: (tag: string) => void;
  onOpenOwner: () => void;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  reels,
  onSelectReel,
  onSelectTag,
  onOpenOwner,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReels = reels.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.caption.toLowerCase().includes(q) ||
      r.author.name.toLowerCase().includes(q) ||
      r.author.handle.toLowerCase().includes(q) ||
      r.comedyTags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="w-full h-full bg-zinc-950 text-white overflow-y-auto pt-16 pb-20 px-4 no-scrollbar">
      {/* Search Input Bar */}
      <div className="relative mb-4">
        <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          id="input-discover-search"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search comedy skits, dad jokes, #tags, creators..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      {/* Featured Owner Spotlight: Mohammad */}
      {!searchQuery && (
        <div 
          onClick={onOpenOwner}
          className="mb-5 p-4 rounded-3xl bg-gradient-to-r from-amber-950/40 via-zinc-900 to-rose-950/30 border border-amber-500/30 shadow-xl cursor-pointer hover:border-amber-400 transition-colors group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 fill-amber-400" />
              Creator Spotlight
            </span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
              Founder & Owner
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-md">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces"
                alt="Mohammad"
                className="w-full h-full rounded-[14px] object-cover"
              />
            </div>
            <div>
              <div className="font-extrabold text-sm text-zinc-100 flex items-center gap-1 font-display">
                <span>Mohammad</span>
                <ShieldCheck className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xs text-zinc-400 font-medium">@mohammad_comedy · 1.4M Laughs</div>
              <div className="text-[11px] text-amber-300 font-semibold mt-0.5">
                Tap to open Owner & Admin Dashboard →
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trending Comedy Tags Horizontal Slider */}
      {!searchQuery && (
        <div className="mb-5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2.5">
            <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
            <span>Trending Comedy Tags</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {POPULAR_TAGS.slice(1).map((tag, idx) => (
              <button
                key={tag}
                onClick={() => onSelectTag(tag)}
                className="p-3 bg-zinc-900 border border-zinc-800/80 hover:border-rose-500/50 rounded-2xl text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-rose-400 group-hover:text-rose-300">
                    {tag}
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    #{idx + 1}
                  </span>
                </div>
                <div className="text-[10px] text-zinc-400 mt-1">
                  {(180 - idx * 22)}k comedy reels watched
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Comedy Sound Effects Rack */}
      {!searchQuery && (
        <div className="mb-5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2.5">
            <Music className="w-3.5 h-3.5 text-cyan-400" />
            <span>Viral Comedy Sound Bites</span>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {COMEDY_SOUND_EFFECTS.map((snd) => (
              <button
                key={snd.id}
                onClick={() => comedyAudio.playPreset(snd.preset)}
                className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl flex items-center gap-2 text-xs font-medium shrink-0 transition-colors active:scale-95"
              >
                <span className="text-base">{snd.icon}</span>
                <span className="text-zinc-200">{snd.name}</span>
                <Play className="w-3 h-3 text-cyan-400 fill-cyan-400 ml-1" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Comedy Reels Grid */}
      <div>
        <div className="flex items-center justify-between text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2.5">
          <span className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            {searchQuery ? `Search Results (${filteredReels.length})` : 'Popular Comedy Reels'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {filteredReels.map((reel) => (
            <div
              key={reel.id}
              onClick={() => onSelectReel(reel)}
              className="relative aspect-[9/14] bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 hover:border-rose-500/50 cursor-pointer group shadow-md"
            >
              {/* Thumbnail representation */}
              <div className="w-full h-full bg-gradient-to-t from-black via-zinc-900/60 to-zinc-900 flex items-center justify-center relative">
                <span className="text-4xl opacity-80 group-hover:scale-125 transition-transform duration-300">
                  🤣
                </span>
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-full bg-black/60 text-[9px] font-mono text-zinc-300 border border-zinc-700">
                  HumorTok
                </div>
              </div>

              {/* Bottom Details on Card */}
              <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black via-black/80 to-transparent">
                <div className="text-[11px] font-bold text-zinc-100 line-clamp-2 leading-tight">
                  {reel.title}
                </div>
                <div className="flex items-center justify-between mt-1 text-[10px] text-zinc-400">
                  <span>@{reel.author.handle.replace('@', '')}</span>
                  <span className="text-rose-400 font-bold">
                    ❤️ {(reel.likesCount / 1000).toFixed(1)}k
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
