import React, { useRef, useState, useEffect } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Volume2,
  VolumeX,
  Play,
  Music,
  Check,
  Download,
  ShieldCheck,
  Sparkles,
  Plus
} from 'lucide-react';
import { ReelItem } from '../types';
import { comedyAudio } from '../utils/audioSynth';

interface ReelItemViewProps {
  reel: ReelItem;
  isActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onToggleLike: (reelId: string) => void;
  onOpenComments: (reel: ReelItem) => void;
  onOpenShare: (reel: ReelItem, videoEl: HTMLVideoElement | null) => void;
  onToggleSaveOffline: (reel: ReelItem) => void;
  isSavedOffline: boolean;
  onSelectTag: (tag: string) => void;
}

interface HeartBurst {
  id: number;
  x: number;
  y: number;
}

export const ReelItemView: React.FC<ReelItemViewProps> = ({
  reel,
  isActive,
  isMuted,
  onToggleMute,
  onToggleLike,
  onOpenComments,
  onOpenShare,
  onToggleSaveOffline,
  isSavedOffline,
  onSelectTag,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoSrc, setVideoSrc] = useState<string>(reel.videoUrl || '/videos/comedy-1.mp4');
  const [hasVideoError, setHasVideoError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const [heartBursts, setHeartBursts] = useState<HeartBurst[]>([]);
  const [progress, setProgress] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const lastTapRef = useRef<number>(0);

  // Sync videoSrc when reel changes
  useEffect(() => {
    const src = reel.videoUrl && !reel.videoUrl.includes('commondatastorage.googleapis.com')
      ? reel.videoUrl
      : '/videos/comedy-1.mp4';
    setVideoSrc(src);
    setHasVideoError(false);
  }, [reel.videoUrl]);

  const handleVideoError = () => {
    console.warn('Video failed to load:', videoSrc);
    if (videoSrc !== '/videos/comedy-1.mp4') {
      setVideoSrc('/videos/comedy-1.mp4');
    } else {
      setHasVideoError(true);
    }
  };

  // Autoplay / pause when active reel changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.currentTime = 0;
      video.muted = isMuted;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            // If reel has synth audio preset and not muted, play it
            if (!isMuted && reel.audio?.synthPreset) {
              comedyAudio.playPreset(reel.audio.synthPreset);
            }
          })
          .catch((err) => {
            console.warn('Autoplay prevented, retrying muted:', err);
            video.muted = true;
            video.play().catch(() => {});
          });
      }
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [isActive, isMuted, videoSrc, reel.audio?.synthPreset]);

  // Sync mute state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Update progress bar
  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(p);
    }
  };

  // Handle tap for play/pause or double-tap to like
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap detected! Like reel with floating heart burst
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const burstId = now;
      setHeartBursts((prev) => [...prev, { id: burstId, x, y }]);
      setTimeout(() => {
        setHeartBursts((prev) => prev.filter((b) => b.id !== burstId));
      }, 800);

      comedyAudio.playLikePop();
      if (!reel.isLiked) {
        onToggleLike(reel.id);
      }
      lastTapRef.current = 0;
      return;
    }

    lastTapRef.current = now;

    // Single tap toggles play/pause
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }

    setShowPlayIcon(true);
    setTimeout(() => setShowPlayIcon(false), 600);
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div 
      className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden select-none"
      onClick={handleContainerClick}
    >
      {/* Video Element with error fallback */}
      {!hasVideoError ? (
        <video
          ref={videoRef}
          src={videoSrc}
          poster={reel.posterUrl}
          loop
          playsInline
          muted={isMuted}
          onError={handleVideoError}
          onTimeUpdate={handleTimeUpdate}
          className="w-full h-full object-cover sm:object-contain bg-zinc-950 pointer-events-none"
        >
          <source src={videoSrc} type="video/mp4" />
          <source src="/videos/comedy-1.mp4" type="video/mp4" />
        </video>
      ) : (
        <div className="relative w-full h-full bg-zinc-900 flex flex-col items-center justify-center p-6 text-center">
          <img
            src={reel.posterUrl || reel.author.avatar}
            alt={reel.title}
            className="absolute inset-0 w-full h-full object-cover opacity-30 blur-xs"
          />
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-6xl animate-bounce mb-3">🤣</span>
            <h4 className="text-white font-bold text-base font-display max-w-[280px]">
              {reel.title}
            </h4>
            <p className="text-xs text-amber-300 mt-2">
              Playing Humor Tok Comedy Audio 🎵
            </p>
          </div>
        </div>
      )}

      {/* Burned-in Humor Tok Watermark in Upper Left */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none flex items-center gap-2">
        <div className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-rose-500/30 flex items-center gap-1.5 shadow-lg">
          <span className="text-sm">🤣</span>
          <span className="font-extrabold text-xs tracking-wide bg-gradient-to-r from-cyan-400 via-rose-400 to-amber-400 bg-clip-text text-transparent font-display">
            Humor Tok
          </span>
          <span className="text-[9px] text-zinc-400 font-mono">
            @{reel.author.handle.replace('@', '')}
          </span>
        </div>
      </div>

      {/* Mute/Unmute Indicator Button in Upper Right */}
      <div className="absolute top-4 right-4 z-20">
        <button
          id={`btn-mute-toggle-${reel.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleMute();
          }}
          className="p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-zinc-700/60 text-white hover:bg-black/80 transition-all shadow-lg active:scale-95"
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-rose-400" />
          ) : (
            <Volume2 className="w-5 h-5 text-emerald-400 animate-pulse" />
          )}
        </button>
      </div>

      {/* Burned-in Punchline Text Banner Overlay if enabled */}
      {reel.punchlineOverlay?.text && (
        <div 
          className={`absolute left-0 right-0 z-20 px-6 pointer-events-none flex justify-center text-center ${
            reel.punchlineOverlay.position === 'top'
              ? 'top-16'
              : reel.punchlineOverlay.position === 'bottom'
              ? 'bottom-28'
              : 'top-1/2 -translate-y-1/2'
          }`}
        >
          <div className="px-4 py-2 bg-black/80 backdrop-blur-md border-2 border-amber-400/90 rounded-2xl shadow-2xl max-w-[85%] animate-bounce duration-1000">
            <span className="font-black text-amber-300 text-sm sm:text-base font-display tracking-tight drop-shadow-md">
              {reel.punchlineOverlay.text}
            </span>
          </div>
        </div>
      )}

      {/* Play / Pause Flash Icon Indicator */}
      {showPlayIcon && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="w-18 h-18 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white scale-110 animate-ping duration-300">
            {isPlaying ? (
              <Play className="w-8 h-8 fill-white ml-1" />
            ) : (
              <span className="w-6 h-8 border-l-4 border-r-4 border-white inline-block" />
            )}
          </div>
        </div>
      )}

      {/* Double Tap Floating Hearts & Laugh Bursts */}
      {heartBursts.map((b) => (
        <div
          key={b.id}
          style={{ left: b.x - 30, top: b.y - 30 }}
          className="absolute z-30 pointer-events-none animate-heart-burst flex items-center justify-center"
        >
          <div className="relative flex items-center justify-center">
            <Heart className="w-14 h-14 text-rose-500 fill-rose-500 drop-shadow-2xl" />
            <span className="absolute text-xl">🤣</span>
          </div>
        </div>
      ))}

      {/* Ambient Bottom Gradient Overlay */}
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none z-10" />

      {/* Right-Side Floating Actions Column */}
      <div 
        className="absolute right-3 bottom-16 z-20 flex flex-col items-center gap-4 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Author Avatar with Follow button */}
        <div className="relative mb-1">
          <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-rose-500 to-amber-400 shadow-xl">
            <img
              src={reel.author.avatar}
              alt={reel.author.name}
              className="w-full h-full rounded-full object-cover bg-zinc-800"
            />
          </div>
          {!isFollowing && (
            <button
              id={`btn-follow-${reel.author.id}`}
              onClick={() => setIsFollowing(true)}
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-rose-500 hover:bg-rose-400 text-white flex items-center justify-center shadow-md active:scale-125 transition-transform"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          )}
        </div>

        {/* Like / Laugh Reaction Button */}
        <button
          id={`btn-like-${reel.id}`}
          onClick={() => {
            comedyAudio.playLikePop();
            onToggleLike(reel.id);
          }}
          className="flex flex-col items-center gap-1 group active:scale-125 transition-transform"
        >
          <div className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md transition-colors ${
            reel.isLiked ? 'bg-rose-500/20 text-rose-500' : 'bg-black/50 text-white hover:bg-black/70'
          }`}>
            <Heart className={`w-6 h-6 transition-all ${reel.isLiked ? 'fill-rose-500 text-rose-500 scale-110' : ''}`} />
          </div>
          <span className="text-[11px] font-bold tracking-tight text-white drop-shadow">
            {formatCount(reel.likesCount + (reel.isLiked ? 1 : 0))}
          </span>
        </button>

        {/* Comments Button */}
        <button
          id={`btn-comments-${reel.id}`}
          onClick={() => onOpenComments(reel)}
          className="flex flex-col items-center gap-1 group active:scale-125 transition-transform"
        >
          <div className="w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center backdrop-blur-md transition-colors">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-[11px] font-bold tracking-tight text-white drop-shadow">
            {formatCount(reel.commentsCount + (reel.comments?.length || 0))}
          </span>
        </button>

        {/* Save to Offline Vault Button */}
        <button
          id={`btn-save-offline-${reel.id}`}
          onClick={() => onToggleSaveOffline(reel)}
          className="flex flex-col items-center gap-1 group active:scale-125 transition-transform"
          title={isSavedOffline ? 'Saved to Offline Reels' : 'Save for Offline Viewing'}
        >
          <div className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md transition-colors ${
            isSavedOffline ? 'bg-amber-500/30 text-amber-400' : 'bg-black/50 text-white hover:bg-black/70'
          }`}>
            <Bookmark className={`w-6 h-6 ${isSavedOffline ? 'fill-amber-400 text-amber-400' : ''}`} />
          </div>
          <span className="text-[11px] font-bold tracking-tight text-white drop-shadow">
            {isSavedOffline ? 'Saved' : 'Save'}
          </span>
        </button>

        {/* Share & Watermark Download Button */}
        <button
          id={`btn-share-${reel.id}`}
          onClick={() => onOpenShare(reel, videoRef.current)}
          className="flex flex-col items-center gap-1 group active:scale-125 transition-transform"
          title="Share & Download Watermarked Reel"
        >
          <div className="w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center backdrop-blur-md transition-colors">
            <Share2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-[11px] font-bold tracking-tight text-white drop-shadow">
            {formatCount(reel.sharesCount)}
          </span>
        </button>

        {/* Direct Watermark Export Button */}
        <button
          id={`btn-watermark-export-${reel.id}`}
          onClick={() => onOpenShare(reel, videoRef.current)}
          className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center shadow-lg active:scale-110 transition-transform"
          title="Download with Humor Tok Watermark"
        >
          <Download className="w-4 h-4 text-white" />
        </button>

        {/* Spinning Vinyl Record Disc with Floating Musical Notes */}
        <div className="relative mt-1">
          {/* Floating animated musical note icons */}
          <span className="absolute -top-3 left-1 text-[11px] text-rose-400 animate-float-note-1 pointer-events-none">
            🎵
          </span>
          <span className="absolute -top-4 -left-2 text-[10px] text-amber-400 animate-float-note-2 pointer-events-none">
            🎶
          </span>

          <div 
            onClick={() => {
              if (reel.audio.synthPreset) {
                comedyAudio.playPreset(reel.audio.synthPreset);
              }
            }}
            className={`w-11 h-11 rounded-full bg-zinc-900 border-2 border-zinc-700 p-1 flex items-center justify-center shadow-2xl cursor-pointer ${
              isPlaying ? 'animate-spin-slow' : ''
            }`}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-900 flex items-center justify-center relative overflow-hidden">
              <span className="text-xs">🤣</span>
              <div className="absolute inset-0 bg-black/20 rounded-full" />
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-950 border border-zinc-600 z-10" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Info Overlay: Creator, Caption, Tags, Audio Track Marquee */}
      <div 
        className="absolute left-4 right-18 bottom-6 z-20 text-white space-y-2 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Creator Handle with Verified Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-extrabold text-sm sm:text-base text-zinc-100 hover:underline cursor-pointer flex items-center gap-1 font-display">
            @{reel.author.handle.replace('@', '')}
          </span>
          {reel.author.isOwner && (
            <span className="flex items-center gap-1 text-[10px] bg-amber-500/30 text-amber-300 font-extrabold px-2 py-0.5 rounded-full border border-amber-500/40 backdrop-blur-xs">
              <ShieldCheck className="w-3 h-3 text-amber-400" />
              Mohammad · Owner
            </span>
          )}
          {reel.author.isVerified && !reel.author.isOwner && (
            <span className="flex items-center gap-0.5 text-[10px] bg-cyan-500/20 text-cyan-300 font-bold px-1.5 py-0.2 rounded-full border border-cyan-500/30">
              Verified
            </span>
          )}
        </div>

        {/* Caption */}
        <p className="text-xs sm:text-sm text-zinc-200 line-clamp-2 leading-relaxed drop-shadow-sm font-medium">
          {reel.caption}
        </p>

        {/* Comedy Hashtags Row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {reel.comedyTags.map((tag) => (
            <button
              key={tag}
              onClick={() => onSelectTag(tag)}
              className="text-xs font-bold text-amber-300 hover:text-amber-200 hover:underline drop-shadow-sm transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Audio Track Marquee */}
        <div className="flex items-center gap-2 pt-0.5 text-xs text-zinc-300">
          <Music className="w-3.5 h-3.5 text-rose-400 shrink-0 animate-bounce" />
          <div className="overflow-hidden whitespace-nowrap w-48 sm:w-64">
            <div className="inline-block animate-pulse font-medium text-[11px] text-zinc-300">
              {reel.audio.title} · {reel.audio.artist}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Scrubbable Video Progress Bar */}
      <div 
        className="absolute bottom-0 inset-x-0 h-1.5 bg-white/20 hover:h-2 transition-all cursor-pointer z-30"
        onClick={(e) => {
          e.stopPropagation();
          const rect = e.currentTarget.getBoundingClientRect();
          const clickPercent = (e.clientX - rect.left) / rect.width;
          if (videoRef.current && videoRef.current.duration) {
            videoRef.current.currentTime = clickPercent * videoRef.current.duration;
          }
        }}
      >
        <div 
          className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-cyan-400 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
