import React, { useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown, Sparkles } from 'lucide-react';
import { ReelItem } from '../types';
import { ReelItemView } from './ReelItemView';

interface ReelsFeedProps {
  reels: ReelItem[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onToggleLike: (reelId: string) => void;
  onOpenComments: (reel: ReelItem) => void;
  onOpenShare: (reel: ReelItem, videoEl: HTMLVideoElement | null) => void;
  onToggleSaveOffline: (reel: ReelItem) => void;
  savedReelIds: Set<string>;
  onSelectTag: (tag: string) => void;
}

export const ReelsFeed: React.FC<ReelsFeedProps> = ({
  reels,
  currentIndex,
  onIndexChange,
  isMuted,
  onToggleMute,
  onToggleLike,
  onOpenComments,
  onOpenShare,
  onToggleSaveOffline,
  savedReelIds,
  onSelectTag,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Scroll to currentIndex when changed programmatically
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const targetChild = container.children[currentIndex] as HTMLElement;
    if (targetChild) {
      targetChild.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentIndex]);

  // Handle keyboard arrow navigation (Up/Down)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((e.target as HTMLElement).tagName.toLowerCase())) {
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'j' || e.key === 'PageDown') {
        e.preventDefault();
        if (currentIndex < reels.length - 1) {
          onIndexChange(currentIndex + 1);
        }
      } else if (e.key === 'ArrowUp' || e.key === 'k' || e.key === 'PageUp') {
        e.preventDefault();
        if (currentIndex > 0) {
          onIndexChange(currentIndex - 1);
        }
      } else if (e.key === 'm' || e.key === 'M') {
        onToggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, reels.length, onIndexChange, onToggleMute]);

  // Scroll listener to update active index on manual scroll / touch swipe
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    const scrollTop = container.scrollTop;
    const itemHeight = container.clientHeight;
    if (itemHeight > 0) {
      const index = Math.round(scrollTop / itemHeight);
      if (index !== currentIndex && index >= 0 && index < reels.length) {
        onIndexChange(index);
      }
    }
  };

  if (reels.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-zinc-400">
        <div className="text-5xl mb-3">🎭</div>
        <h3 className="font-bold text-base text-zinc-200">No Comedy Reels Found</h3>
        <p className="text-xs text-zinc-500 mt-1 max-w-[260px]">
          No reels match this comedy tag. Tap "All Comedy" or create your own skit!
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Scroll Snap Feed Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar"
        style={{ scrollSnapType: 'y mandatory' }}
      >
        {reels.map((reel, index) => {
          const isActive = index === currentIndex;
          const isSaved = savedReelIds.has(reel.id);

          return (
            <div
              key={reel.id}
              className="w-full h-full snap-start snap-always shrink-0 relative"
            >
              <ReelItemView
                reel={reel}
                isActive={isActive}
                isMuted={isMuted}
                onToggleMute={onToggleMute}
                onToggleLike={onToggleLike}
                onOpenComments={onOpenComments}
                onOpenShare={onOpenShare}
                onToggleSaveOffline={onToggleSaveOffline}
                isSavedOffline={isSaved}
                onSelectTag={onSelectTag}
              />
            </div>
          );
        })}
      </div>

      {/* Desktop / Large Screen Next/Prev Floaters */}
      <div className="hidden md:flex flex-col gap-2 absolute right-6 top-1/2 -translate-y-1/2 z-30 pointer-events-auto">
        <button
          id="btn-feed-prev-desktop"
          disabled={currentIndex === 0}
          onClick={() => onIndexChange(Math.max(0, currentIndex - 1))}
          className="p-3 rounded-full bg-zinc-900/80 hover:bg-zinc-800 disabled:opacity-30 text-white border border-zinc-700/60 shadow-xl transition-all active:scale-90"
          title="Previous Reel (Arrow Up)"
        >
          <ChevronUp className="w-5 h-5" />
        </button>

        <button
          id="btn-feed-next-desktop"
          disabled={currentIndex === reels.length - 1}
          onClick={() => onIndexChange(Math.min(reels.length - 1, currentIndex + 1))}
          className="p-3 rounded-full bg-zinc-900/80 hover:bg-zinc-800 disabled:opacity-30 text-white border border-zinc-700/60 shadow-xl transition-all active:scale-90"
          title="Next Reel (Arrow Down)"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
