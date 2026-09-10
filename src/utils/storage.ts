// Offline storage for Humor Tok saved reels
import { ReelItem } from '../types';

const OFFLINE_REELS_KEY = 'humortok_offline_reels_v1';
const LIKED_REELS_KEY = 'humortok_liked_reels_v1';
const SIMULATED_OFFLINE_KEY = 'humortok_simulate_offline_v1';

export function sanitizeVideoUrl(url?: string): string {
  if (!url || url.includes('commondatastorage.googleapis.com')) {
    return '/videos/comedy-1.mp4';
  }
  return url;
}

export function getOfflineReels(): ReelItem[] {
  try {
    const raw = localStorage.getItem(OFFLINE_REELS_KEY);
    if (!raw) return [];
    const list: ReelItem[] = JSON.parse(raw);
    return list.map((r) => ({
      ...r,
      videoUrl: sanitizeVideoUrl(r.videoUrl),
    }));
  } catch (err) {
    console.error('Failed to read offline reels:', err);
    return [];
  }
}

export function saveReelOffline(reel: ReelItem): boolean {
  try {
    const list = getOfflineReels();
    const sanitized = {
      ...reel,
      videoUrl: sanitizeVideoUrl(reel.videoUrl),
      isSaved: true,
    };
    const existingIndex = list.findIndex((r) => r.id === reel.id);
    if (existingIndex >= 0) {
      list[existingIndex] = sanitized;
    } else {
      list.unshift(sanitized);
    }
    localStorage.setItem(OFFLINE_REELS_KEY, JSON.stringify(list));
    return true;
  } catch (err) {
    console.error('Failed to save reel offline:', err);
    return false;
  }
}

export function removeOfflineReel(reelId: string): boolean {
  try {
    const list = getOfflineReels();
    const filtered = list.filter((r) => r.id !== reelId);
    localStorage.setItem(OFFLINE_REELS_KEY, JSON.stringify(filtered));
    return true;
  } catch (err) {
    console.error('Failed to remove offline reel:', err);
    return false;
  }
}

export function isReelSavedOffline(reelId: string): boolean {
  const list = getOfflineReels();
  return list.some((r) => r.id === reelId);
}

export function getLikedReelsSet(): Set<string> {
  try {
    const raw = localStorage.getItem(LIKED_REELS_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

export function toggleLikedReelStorage(reelId: string, isLiked: boolean) {
  try {
    const set = getLikedReelsSet();
    if (isLiked) {
      set.add(reelId);
    } else {
      set.delete(reelId);
    }
    localStorage.setItem(LIKED_REELS_KEY, JSON.stringify(Array.from(set)));
  } catch (e) {
    console.error(e);
  }
}

export function getSimulatedOffline(): boolean {
  try {
    return localStorage.getItem(SIMULATED_OFFLINE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setSimulatedOffline(val: boolean) {
  try {
    localStorage.setItem(SIMULATED_OFFLINE_KEY, val ? 'true' : 'false');
  } catch (e) {
    console.error(e);
  }
}
