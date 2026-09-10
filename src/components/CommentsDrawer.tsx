import React, { useState } from 'react';
import { X, Heart, Send, Sparkles, Smile, ShieldCheck } from 'lucide-react';
import { CommentItem, ReelItem } from '../types';

interface CommentsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  reel: ReelItem;
  onAddComment: (reelId: string, commentText: string) => void;
  onToggleLikeComment: (reelId: string, commentId: string) => void;
}

const QUICK_EMOJIS = ['😂', '🤣', '💀', '👏', '🔥', '🤡', '👑', '💯'];

export const CommentsDrawer: React.FC<CommentsDrawerProps> = ({
  isOpen,
  onClose,
  reel,
  onAddComment,
  onToggleLikeComment,
}) => {
  const [commentText, setCommentText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(reel.id, commentText.trim());
    setCommentText('');
  };

  const handleEmojiClick = (emoji: string) => {
    setCommentText((prev) => prev + emoji);
  };

  const comments = reel.comments || [];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs transition-opacity">
      {/* Click backdrop to dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Card */}
      <div 
        className="relative z-10 w-full max-w-md h-[68vh] max-h-[640px] bg-zinc-900 border-t border-zinc-800 rounded-t-3xl flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Handle & Title */}
        <div className="pt-3 pb-2 px-4 border-b border-zinc-800/80 flex flex-col items-center">
          <div className="w-10 h-1.5 bg-zinc-700 rounded-full mb-3" />
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-zinc-100 font-display">
                {reel.commentsCount + comments.length} Comments
              </h3>
              <span className="text-xs px-2 py-0.5 bg-rose-500/10 text-rose-400 font-medium rounded-full border border-rose-500/20">
                Comedy Room
              </span>
            </div>
            <button
              id="btn-close-comments"
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-zinc-500 py-10">
              <span className="text-4xl mb-2">🎤</span>
              <p className="font-semibold text-zinc-300">No punchlines yet!</p>
              <p className="text-xs text-zinc-500 mt-1 max-w-[240px]">
                Be the first comedian to drop a comment or joke on this reel.
              </p>
            </div>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex items-start gap-3 group">
                <img
                  src={c.authorAvatar}
                  alt={c.authorName}
                  className="w-9 h-9 rounded-full object-cover shrink-0 border border-zinc-700/60"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-xs text-zinc-200 truncate">
                      {c.authorName}
                    </span>
                    {c.isOwner && (
                      <span className="flex items-center gap-0.5 text-[10px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.2 rounded-full border border-amber-500/30">
                        <ShieldCheck className="w-3 h-3 text-amber-400" />
                        Mohammad
                      </span>
                    )}
                    <span className="text-[11px] text-zinc-500">
                      @{c.authorHandle.replace('@', '')}
                    </span>
                    <span className="text-[11px] text-zinc-600">· {c.timeAgo}</span>
                  </div>
                  <p className="text-sm text-zinc-300 mt-0.5 leading-snug break-words">
                    {c.text}
                  </p>
                </div>
                {/* Like Comment button */}
                <button
                  id={`btn-like-comment-${c.id}`}
                  onClick={() => onToggleLikeComment(reel.id, c.id)}
                  className="flex flex-col items-center pt-1 text-zinc-400 hover:text-rose-500 transition-colors"
                >
                  <Heart
                    className={`w-4 h-4 transition-transform active:scale-125 ${
                      c.isLiked ? 'text-rose-500 fill-rose-500' : 'text-zinc-500'
                    }`}
                  />
                  <span className="text-[10px] text-zinc-500 mt-0.5 font-medium">
                    {c.likes + (c.isLiked ? 1 : 0)}
                  </span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Quick Emojis Row */}
        <div className="px-4 py-2 bg-zinc-950/60 border-t border-zinc-800/80 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleEmojiClick(emoji)}
              className="text-lg hover:scale-125 active:scale-95 transition-transform p-1 rounded-md"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Comment Input Form */}
        <form
          onSubmit={handleSubmit}
          className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              id="input-new-comment"
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a hilarious comment..."
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-sm rounded-full pl-4 pr-10 py-2.5 focus:outline-none focus:border-rose-500/80 transition-colors"
            />
            <Smile className="w-4 h-4 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <button
            id="btn-submit-comment"
            type="submit"
            disabled={!commentText.trim()}
            className="p-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:hover:bg-rose-600 text-white rounded-full transition-all shrink-0 active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
