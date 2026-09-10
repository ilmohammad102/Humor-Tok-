/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ReelItem, AppAnnouncement } from './types';
import { INITIAL_REELS } from './data/initialReels';
import {
  getOfflineReels,
  saveReelOffline,
  removeOfflineReel,
  getSimulatedOffline,
  setSimulatedOffline,
  getLikedReelsSet,
  toggleLikedReelStorage,
  sanitizeVideoUrl,
} from './utils/storage';
import { ReelsFeed } from './components/ReelsFeed';
import { TopNav } from './components/TopNav';
import { BottomTabBar } from './components/BottomTabBar';
import { CommentsDrawer } from './components/CommentsDrawer';
import { ShareAndDownloadModal } from './components/ShareAndDownloadModal';
import { CreateReelModal } from './components/CreateReelModal';
import { OfflineVaultDrawer } from './components/OfflineVaultDrawer';
import { AdminDashboard } from './components/AdminDashboard';
import { DiscoverView } from './components/DiscoverView';
import { InstallAppModal } from './components/InstallAppModal';
import { Megaphone, X, Sparkles } from 'lucide-react';
import { comedyAudio } from './utils/audioSynth';

const USER_REELS_STORAGE_KEY = 'humortok_user_reels_v1';

export default function App() {
  // Main reels list
  const [reels, setReels] = useState<ReelItem[]>(() => {
    try {
      const savedUserReels = localStorage.getItem(USER_REELS_STORAGE_KEY);
      const userReels: ReelItem[] = savedUserReels ? JSON.parse(savedUserReels) : [];
      const likedSet = getLikedReelsSet();
      const combined = [...userReels, ...INITIAL_REELS];
      return combined.map((r) => ({
        ...r,
        videoUrl: sanitizeVideoUrl(r.videoUrl),
        isLiked: likedSet.has(r.id),
      }));
    } catch {
      return INITIAL_REELS.map((r) => ({
        ...r,
        videoUrl: sanitizeVideoUrl(r.videoUrl),
      }));
    }
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedTab, setFeedTab] = useState<'forYou' | 'following'>('forYou');
  const [selectedTag, setSelectedTag] = useState<string>('#All');
  const [bottomTab, setBottomTab] = useState<'home' | 'discover' | 'vault' | 'profile'>('home');
  const [isMuted, setIsMuted] = useState(false);

  // Modals & Drawers state
  const [activeCommentsReel, setActiveCommentsReel] = useState<ReelItem | null>(null);
  const [activeShareReel, setActiveShareReel] = useState<ReelItem | null>(null);
  const [shareVideoEl, setShareVideoEl] = useState<HTMLVideoElement | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  // Offline Saved Reels state
  const [savedReels, setSavedReels] = useState<ReelItem[]>([]);
  const [isSimulatedOffline, setIsSimulatedOfflineState] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // App Announcement by Mohammad
  const [announcement, setAnnouncement] = useState<AppAnnouncement>({
    id: 'announcement-1',
    text: "🎉 Mohammad's Weekly Stand-Up Contest is LIVE! Upload your best 15s comedy skit to win verified creator crown 👑",
    active: true,
    type: 'contest',
    author: 'Mohammad',
  });

  // Current logged in user (Mohammad Owner profile)
  const currentUser = {
    name: 'Mohammad',
    handle: 'mohammad_comedy',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
    isOwner: true,
  };

  // Load offline reels & simulation state on mount
  useEffect(() => {
    const loaded = getOfflineReels();
    setSavedReels(loaded);
    setIsSimulatedOfflineState(getSimulatedOffline());
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    comedyAudio.setMuted(nextMuted);
  };

  // Toggle Like on Reel
  const handleToggleLike = (reelId: string) => {
    setReels((prev) =>
      prev.map((r) => {
        if (r.id === reelId) {
          const nextLiked = !r.isLiked;
          toggleLikedReelStorage(reelId, nextLiked);
          return {
            ...r,
            isLiked: nextLiked,
            likesCount: r.likesCount + (nextLiked ? 1 : -1),
          };
        }
        return r;
      })
    );
  };

  // Add comment to Reel
  const handleAddComment = (reelId: string, text: string) => {
    const newComment = {
      id: `c-${Date.now()}`,
      reelId,
      authorName: currentUser.name,
      authorHandle: currentUser.handle,
      authorAvatar: currentUser.avatar,
      isOwner: currentUser.isOwner,
      text,
      timeAgo: 'Just now',
      likes: 0,
      isLiked: false,
    };

    setReels((prev) =>
      prev.map((r) => {
        if (r.id === reelId) {
          const updatedComments = [newComment, ...(r.comments || [])];
          return {
            ...r,
            commentsCount: r.commentsCount + 1,
            comments: updatedComments,
          };
        }
        return r;
      })
    );

    // Update active comments reel state as well
    setActiveCommentsReel((prev) => {
      if (prev && prev.id === reelId) {
        return {
          ...prev,
          commentsCount: prev.commentsCount + 1,
          comments: [newComment, ...(prev.comments || [])],
        };
      }
      return prev;
    });

    showToast('Comedy punchline posted! 🤣');
  };

  // Toggle like on comment
  const handleToggleLikeComment = (reelId: string, commentId: string) => {
    setReels((prev) =>
      prev.map((r) => {
        if (r.id === reelId && r.comments) {
          return {
            ...r,
            comments: r.comments.map((c) =>
              c.id === commentId ? { ...c, isLiked: !c.isLiked } : c
            ),
          };
        }
        return r;
      })
    );

    setActiveCommentsReel((prev) => {
      if (prev && prev.id === reelId && prev.comments) {
        return {
          ...prev,
          comments: prev.comments.map((c) =>
            c.id === commentId ? { ...c, isLiked: !c.isLiked } : c
          ),
        };
      }
      return prev;
    });
  };

  // Toggle Save to Offline Vault
  const handleToggleSaveOffline = (reel: ReelItem) => {
    const isAlreadySaved = savedReels.some((r) => r.id === reel.id);
    if (isAlreadySaved) {
      removeOfflineReel(reel.id);
      const updated = getOfflineReels();
      setSavedReels(updated);
      showToast('Removed from Offline Vault');
    } else {
      saveReelOffline(reel);
      const updated = getOfflineReels();
      setSavedReels(updated);
      showToast('Saved to Offline Comedy Vault! 📦');
    }
  };

  const handleRemoveOfflineReel = (reelId: string) => {
    removeOfflineReel(reelId);
    setSavedReels(getOfflineReels());
    showToast('Removed from Offline Vault');
  };

  const handleToggleSimulatedOffline = () => {
    const nextVal = !isSimulatedOffline;
    setIsSimulatedOfflineState(nextVal);
    setSimulatedOffline(nextVal);
    showToast(nextVal ? 'Simulated Offline Mode Enabled' : 'Online Mode Restored');
  };

  // Publish new reel created by user
  const handlePublishReel = (newReel: ReelItem) => {
    const updated = [newReel, ...reels];
    setReels(updated);
    setCurrentIndex(0);
    setBottomTab('home');

    // Save to user reels storage
    try {
      const existingRaw = localStorage.getItem(USER_REELS_STORAGE_KEY);
      const userReels = existingRaw ? JSON.parse(existingRaw) : [];
      userReels.unshift(newReel);
      localStorage.setItem(USER_REELS_STORAGE_KEY, JSON.stringify(userReels));
    } catch (e) {
      console.error(e);
    }

    showToast('Reel published to Humor Tok! 🚀');
  };

  // Owner Actions: Pin Reel
  const handleTogglePinReel = (reelId: string) => {
    setReels((prev) => {
      const target = prev.find((r) => r.id === reelId);
      if (!target) return prev;
      const isPinned = !target.isPinned;
      const updated = prev.map((r) =>
        r.id === reelId ? { ...r, isPinned } : r
      );
      // Sort pinned to front
      return updated.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
    });
    showToast('Reel pin status updated 📌');
  };

  // Owner Actions: Feature Reel
  const handleToggleFeatureReel = (reelId: string) => {
    setReels((prev) =>
      prev.map((r) =>
        r.id === reelId ? { ...r, isFeatured: !r.isFeatured } : r
      )
    );
    showToast('Reel feature status updated ⭐');
  };

  // Owner Actions: Delete Reel
  const handleDeleteReel = (reelId: string) => {
    setReels((prev) => prev.filter((r) => r.id !== reelId));
    showToast('Reel deleted from platform 🗑️');
  };

  // Owner Actions: Boost Reel
  const handleBoostReel = (reelId: string) => {
    setReels((prev) =>
      prev.map((r) =>
        r.id === reelId
          ? {
              ...r,
              likesCount: r.likesCount + 15400,
              sharesCount: r.sharesCount + 8200,
            }
          : r
      )
    );
    showToast('Viral Boost Applied! (+50K Impression algorithm) 🚀');
  };

  // Owner Actions: Announcement
  const handleUpdateAnnouncement = (text: string, active: boolean) => {
    setAnnouncement((prev) => ({ ...prev, text, active }));
    showToast('Broadcast banner updated live! 📢');
  };

  // Filter reels based on selected category tag, simulated offline, and following feed
  const displayedReels = (() => {
    let list = reels;

    if (isSimulatedOffline) {
      // In offline mode, strictly show saved reels!
      list = savedReels.length > 0 ? savedReels : reels.slice(0, 2);
    }

    if (feedTab === 'following') {
      list = list.filter((r) => r.author.isOwner || r.author.isVerified);
    }

    if (selectedTag && selectedTag !== '#All') {
      list = list.filter((r) =>
        r.comedyTags.some((t) => t.toLowerCase() === selectedTag.toLowerCase())
      );
    }

    return list;
  })();

  const savedReelIds = new Set(savedReels.map((r) => r.id));

  return (
    <div className="relative w-screen h-screen bg-zinc-950 flex items-center justify-center overflow-hidden">
      {/* Subtle Ambient Background Lighting for Desktop View */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Responsive Frame: 100% full viewport on mobile, sleek phone chassis on desktop */}
      <main className="relative w-full h-full sm:max-w-[430px] sm:max-h-[92vh] sm:rounded-[44px] sm:border-[8px] sm:border-zinc-800/80 bg-black flex flex-col shadow-2xl overflow-hidden ring-1 ring-zinc-700/40">
        {/* Dynamic Island / Speaker cutout on desktop container */}
        <div className="hidden sm:block absolute top-3 left-1/2 -translate-x-1/2 w-28 h-4 bg-zinc-900 rounded-full z-40 border border-zinc-800/80 pointer-events-none" />

        {/* Mohammad's Broadcast Announcement Banner if active */}
        {announcement.active && announcement.text && (
          <div className="relative z-40 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-zinc-950 px-3 py-1.5 flex items-center justify-between text-xs font-bold shadow-md">
            <div className="flex items-center gap-1.5 truncate">
              <Megaphone className="w-3.5 h-3.5 shrink-0 animate-bounce" />
              <span className="truncate">{announcement.text}</span>
            </div>
            <button
              onClick={() => setAnnouncement((prev) => ({ ...prev, active: false }))}
              className="p-0.5 hover:bg-black/10 rounded ml-2 shrink-0"
              title="Dismiss banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Top Navigation Bar */}
        {bottomTab === 'home' && (
          <TopNav
            feedTab={feedTab}
            onSelectFeedTab={(tab) => {
              setFeedTab(tab);
              setCurrentIndex(0);
            }}
            selectedTag={selectedTag}
            onSelectTag={(tag) => {
              setSelectedTag(tag);
              setCurrentIndex(0);
            }}
            onOpenAdmin={() => setIsAdminOpen(true)}
            onOpenVault={() => setIsVaultOpen(true)}
            onOpenInstall={() => setIsInstallModalOpen(true)}
            savedReelsCount={savedReels.length}
            isSimulatedOffline={isSimulatedOffline}
          />
        )}

        {/* Main Body Area depending on Bottom Tab */}
        <div className="flex-1 w-full h-full relative overflow-hidden">
          {bottomTab === 'home' && (
            <ReelsFeed
              reels={displayedReels}
              currentIndex={currentIndex}
              onIndexChange={setCurrentIndex}
              isMuted={isMuted}
              onToggleMute={handleToggleMute}
              onToggleLike={handleToggleLike}
              onOpenComments={(reel) => setActiveCommentsReel(reel)}
              onOpenShare={(reel, videoEl) => {
                setActiveShareReel(reel);
                setShareVideoEl(videoEl);
              }}
              onToggleSaveOffline={handleToggleSaveOffline}
              savedReelIds={savedReelIds}
              onSelectTag={(tag) => {
                setSelectedTag(tag);
                setCurrentIndex(0);
              }}
            />
          )}

          {bottomTab === 'discover' && (
            <DiscoverView
              reels={reels}
              onSelectReel={(selected) => {
                const targetIdx = reels.findIndex((r) => r.id === selected.id);
                if (targetIdx >= 0) setCurrentIndex(targetIdx);
                setBottomTab('home');
              }}
              onSelectTag={(tag) => {
                setSelectedTag(tag);
                setCurrentIndex(0);
                setBottomTab('home');
              }}
              onOpenOwner={() => setIsAdminOpen(true)}
            />
          )}

          {bottomTab === 'vault' && (
            <div className="w-full h-full bg-zinc-950 p-4 pt-16 overflow-y-auto no-scrollbar">
              <OfflineVaultDrawer
                isOpen={true}
                onClose={() => setBottomTab('home')}
                savedReels={savedReels}
                onSelectReel={(selected) => {
                  const targetIdx = reels.findIndex((r) => r.id === selected.id);
                  if (targetIdx >= 0) setCurrentIndex(targetIdx);
                  setBottomTab('home');
                }}
                onRemoveOfflineReel={handleRemoveOfflineReel}
                isSimulatedOffline={isSimulatedOffline}
                onToggleSimulatedOffline={handleToggleSimulatedOffline}
              />
            </div>
          )}

          {bottomTab === 'profile' && (
            <div className="w-full h-full bg-zinc-950 p-4 pt-16 overflow-y-auto no-scrollbar">
              <AdminDashboard
                isOpen={true}
                onClose={() => setBottomTab('home')}
                reels={reels}
                onTogglePinReel={handleTogglePinReel}
                onToggleFeatureReel={handleToggleFeatureReel}
                onDeleteReel={handleDeleteReel}
                onBoostReel={handleBoostReel}
                announcement={announcement}
                onUpdateAnnouncement={handleUpdateAnnouncement}
              />
            </div>
          )}
        </div>

        {/* Bottom Tab Bar */}
        <BottomTabBar
          currentTab={bottomTab}
          onSelectTab={setBottomTab}
          onOpenCreate={() => setIsCreateModalOpen(true)}
          savedCount={savedReels.length}
        />

        {/* Floating Toast Feedback */}
        {toastMessage && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-zinc-900/95 border border-zinc-700 text-white text-xs font-semibold rounded-full shadow-2xl backdrop-blur-md animate-fade-in flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Comments Slide-up Modal */}
        {activeCommentsReel && (
          <CommentsDrawer
            isOpen={Boolean(activeCommentsReel)}
            onClose={() => setActiveCommentsReel(null)}
            reel={activeCommentsReel}
            onAddComment={handleAddComment}
            onToggleLikeComment={handleToggleLikeComment}
          />
        )}

        {/* Share & Watermark Download Modal */}
        {activeShareReel && (
          <ShareAndDownloadModal
            isOpen={Boolean(activeShareReel)}
            onClose={() => setActiveShareReel(null)}
            reel={activeShareReel}
            videoElement={shareVideoEl}
            onSaveOffline={handleToggleSaveOffline}
            isSavedOffline={savedReelIds.has(activeShareReel.id)}
          />
        )}

        {/* Comedy Reel Creator Studio Modal */}
        <CreateReelModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onPublishReel={handlePublishReel}
          currentUser={currentUser}
        />

        {/* Dedicated Offline Vault Drawer */}
        <OfflineVaultDrawer
          isOpen={isVaultOpen}
          onClose={() => setIsVaultOpen(false)}
          savedReels={savedReels}
          onSelectReel={(selected) => {
            const targetIdx = reels.findIndex((r) => r.id === selected.id);
            if (targetIdx >= 0) setCurrentIndex(targetIdx);
            setIsVaultOpen(false);
          }}
          onRemoveOfflineReel={handleRemoveOfflineReel}
          isSimulatedOffline={isSimulatedOffline}
          onToggleSimulatedOffline={handleToggleSimulatedOffline}
        />

        {/* Dedicated Owner / Admin Dashboard for Mohammad */}
        <AdminDashboard
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          reels={reels}
          onTogglePinReel={handleTogglePinReel}
          onToggleFeatureReel={handleToggleFeatureReel}
          onDeleteReel={handleDeleteReel}
          onBoostReel={handleBoostReel}
          announcement={announcement}
          onUpdateAnnouncement={handleUpdateAnnouncement}
        />

        {/* Mobile Install App Modal */}
        <InstallAppModal
          isOpen={isInstallModalOpen}
          onClose={() => setIsInstallModalOpen(false)}
        />
      </main>
    </div>
  );
}
