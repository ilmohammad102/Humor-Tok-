export interface Author {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  isOwner?: boolean;
  isVerified?: boolean;
  bio?: string;
  followersCount: string;
}

export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  soundType: 'laugh' | 'rimshot' | 'vine_boom' | 'music' | 'voiceover' | 'meme';
  soundUrl?: string;
  synthPreset?: string;
  coverUrl?: string;
}

export interface PunchlineOverlay {
  text: string;
  position: 'top' | 'center' | 'bottom';
  style: 'meme' | 'comic' | 'neon' | 'classic';
}

export interface CommentItem {
  id: string;
  reelId: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  isOwner?: boolean;
  text: string;
  timeAgo: string;
  likes: number;
  isLiked: boolean;
}

export interface ReelItem {
  id: string;
  title: string;
  caption: string;
  videoUrl: string;
  posterUrl?: string;
  author: Author;
  audio: AudioTrack;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  savesCount: number;
  isLiked: boolean;
  isSaved: boolean;
  comedyTags: string[];
  createdAt: string;
  duration?: number;
  punchlineOverlay?: PunchlineOverlay;
  isPinned?: boolean;
  isFeatured?: boolean;
  comments?: CommentItem[];
}

export interface OwnerStats {
  totalViews: number;
  totalLikes: number;
  totalReels: number;
  totalShares: number;
  activeCreators: number;
  dailyHoursStreamed: number;
  viralQuotient: number;
}

export interface AppAnnouncement {
  id: string;
  text: string;
  active: boolean;
  type: 'info' | 'contest' | 'trending';
  author: string;
}
