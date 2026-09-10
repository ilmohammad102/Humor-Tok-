import React, { useState } from 'react';
import {
  Crown,
  ShieldCheck,
  TrendingUp,
  Flame,
  Users,
  Film,
  Sparkles,
  Megaphone,
  Radio,
  Volume2,
  Trash2,
  Pin,
  Star,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  X,
  Plus
} from 'lucide-react';
import { ReelItem, AppAnnouncement } from '../types';
import { COMEDY_SOUND_EFFECTS } from '../data/initialReels';
import { comedyAudio } from '../utils/audioSynth';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  reels: ReelItem[];
  onTogglePinReel: (reelId: string) => void;
  onToggleFeatureReel: (reelId: string) => void;
  onDeleteReel: (reelId: string) => void;
  onBoostReel: (reelId: string) => void;
  announcement: AppAnnouncement;
  onUpdateAnnouncement: (text: string, active: boolean) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  reels,
  onTogglePinReel,
  onToggleFeatureReel,
  onDeleteReel,
  onBoostReel,
  announcement,
  onUpdateAnnouncement,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'broadcast' | 'sounds'>('overview');
  const [announcementText, setAnnouncementText] = useState(announcement.text);
  const [isAnnouncementActive, setIsAnnouncementActive] = useState(announcement.active);
  const [savedAnnouncementToast, setSavedAnnouncementToast] = useState(false);

  if (!isOpen) return null;

  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateAnnouncement(announcementText, isAnnouncementActive);
    setSavedAnnouncementToast(true);
    setTimeout(() => setSavedAnnouncementToast(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative z-10 w-full max-w-2xl bg-zinc-900 border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl my-auto max-h-[92vh] flex flex-col overflow-hidden ring-1 ring-amber-500/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 p-0.5 shadow-lg shadow-amber-500/20">
              <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
                <Crown className="w-6 h-6 text-amber-400 fill-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-lg text-white font-display">
                  Mohammad's Owner Dashboard
                </h2>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                  Owner Access
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Logged in as <span className="text-amber-300 font-medium">ilmohammad102@gmail.com</span>
              </p>
            </div>
          </div>
          <button
            id="btn-close-admin"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center gap-1 my-3 bg-zinc-950 p-1 rounded-2xl border border-zinc-800 shrink-0 overflow-x-auto no-scrollbar">
          <button
            id="tab-admin-overview"
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'overview'
                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Analytics
          </button>

          <button
            id="tab-admin-content"
            onClick={() => setActiveTab('content')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'content'
                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            Reel Moderation ({reels.length})
          </button>

          <button
            id="tab-admin-broadcast"
            onClick={() => setActiveTab('broadcast')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'broadcast'
                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            Broadcast Banner
          </button>

          <button
            id="tab-admin-sounds"
            onClick={() => setActiveTab('sounds')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'sounds'
                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            Soundboard
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 no-scrollbar">
          {/* TAB 1: OVERVIEW & KPIS */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Top KPI Bento Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl">
                  <div className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-rose-500" />
                    Total Views
                  </div>
                  <div className="text-xl font-extrabold text-white mt-1 font-display">
                    3,418,920
                  </div>
                  <div className="text-[10px] text-emerald-400 font-medium mt-0.5">
                    ↑ +28.4% this week
                  </div>
                </div>

                <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl">
                  <div className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1">
                    <span>🤣</span>
                    Laughs / Likes
                  </div>
                  <div className="text-xl font-extrabold text-white mt-1 font-display">
                    1,184,320
                  </div>
                  <div className="text-[10px] text-emerald-400 font-medium mt-0.5">
                    ↑ 94.2% positive
                  </div>
                </div>

                <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl">
                  <div className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    Active Creators
                  </div>
                  <div className="text-xl font-extrabold text-white mt-1 font-display">
                    834
                  </div>
                  <div className="text-[10px] text-zinc-400 font-medium mt-0.5">
                    42 live right now
                  </div>
                </div>

                <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl">
                  <div className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                    Viral Score
                  </div>
                  <div className="text-xl font-extrabold text-amber-400 mt-1 font-display">
                    98.6%
                  </div>
                  <div className="text-[10px] text-zinc-400 font-medium mt-0.5">
                    Optimized by Mohammad
                  </div>
                </div>
              </div>

              {/* Owner Status Card */}
              <div className="p-4 bg-gradient-to-r from-amber-950/30 via-zinc-900 to-rose-950/20 border border-amber-500/30 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-amber-300">
                    Platform Status: Optimal Performance
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Watermarking engine active • AI Punchline Assistant online • Cache storage operational
                  </p>
                </div>
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              </div>

              {/* Top Performing Comedy Tags */}
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl">
                <h4 className="font-bold text-xs text-zinc-300 uppercase tracking-wider mb-2.5">
                  Trending Comedy Categories
                </h4>
                <div className="space-y-2">
                  {[
                    { tag: '#mohammadcomedy', shares: '412K', growth: '+45%' },
                    { tag: '#standup', shares: '380K', growth: '+32%' },
                    { tag: '#catcomedy', shares: '294K', growth: '+21%' },
                    { tag: '#dadjokes', shares: '185K', growth: '+15%' },
                    { tag: '#officehumor', shares: '142K', growth: '+19%' },
                  ].map((item) => (
                    <div key={item.tag} className="flex items-center justify-between text-xs py-1 border-b border-zinc-800/60 last:border-0">
                      <span className="font-semibold text-rose-400">{item.tag}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-zinc-400 font-mono">{item.shares} views</span>
                        <span className="text-emerald-400 font-bold">{item.growth}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REEL CONTENT MODERATION */}
          {activeTab === 'content' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400 pb-1">
                <span>Manage, pin, or boost live comedy reels</span>
                <span>{reels.length} Reels Total</span>
              </div>

              {reels.map((r) => (
                <div
                  key={r.id}
                  className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-12 h-16 rounded-xl bg-zinc-800 shrink-0 overflow-hidden flex items-center justify-center text-xl border border-zinc-700">
                      🤣
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-zinc-200 truncate">
                          {r.title}
                        </span>
                        {r.isPinned && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-1.5 rounded">
                            PINNED
                          </span>
                        )}
                        {r.isFeatured && (
                          <span className="text-[10px] bg-rose-500/20 text-rose-300 font-bold px-1.5 rounded">
                            FEATURED
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                        By @{r.author.handle} · {r.audio.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-zinc-500">
                        <span>❤️ {r.likesCount.toLocaleString()}</span>
                        <span>💬 {r.commentsCount}</span>
                        <span>🚀 {r.sharesCount.toLocaleString()} shares</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    {/* Pin button */}
                    <button
                      id={`btn-pin-reel-${r.id}`}
                      onClick={() => onTogglePinReel(r.id)}
                      className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-colors ${
                        r.isPinned
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                      title={r.isPinned ? 'Unpin Reel' : 'Pin to Top'}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>

                    {/* Feature button */}
                    <button
                      id={`btn-feature-reel-${r.id}`}
                      onClick={() => onToggleFeatureReel(r.id)}
                      className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-colors ${
                        r.isFeatured
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                      title={r.isFeatured ? 'Unfeature Reel' : 'Feature on Explore'}
                    >
                      <Star className="w-3.5 h-3.5" />
                    </button>

                    {/* Boost button */}
                    <button
                      id={`btn-boost-reel-${r.id}`}
                      onClick={() => onBoostReel(r.id)}
                      className="px-2.5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-md shadow-cyan-600/20"
                      title="Boost Algorithm"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Boost
                    </button>

                    {/* Delete button */}
                    <button
                      id={`btn-delete-reel-${r.id}`}
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete "${r.title}"?`)) {
                          onDeleteReel(r.id);
                        }
                      }}
                      className="p-2 bg-zinc-900 hover:bg-rose-500/10 border border-zinc-800 hover:border-rose-500/30 text-zinc-400 hover:text-rose-400 rounded-xl transition-colors"
                      title="Delete Reel"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: BROADCAST ANNOUNCEMENT */}
          {activeTab === 'broadcast' && (
            <div className="space-y-4">
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <Megaphone className="w-4 h-4 text-amber-400" />
                  <h4 className="font-bold text-sm text-zinc-100">
                    App-Wide Announcement Banner
                  </h4>
                </div>
                <p className="text-xs text-zinc-400 mb-3">
                  This banner appears at the very top of Humor Tok for all users. Use it to announce standup contests, comedy events, or server updates.
                </p>

                <form onSubmit={handleSaveAnnouncement} className="space-y-3">
                  <textarea
                    rows={3}
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    placeholder="Enter announcement text..."
                    className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                  />

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAnnouncementActive}
                        onChange={(e) => setIsAnnouncementActive(e.target.checked)}
                        className="rounded border-zinc-700 text-amber-500 focus:ring-0 w-4 h-4 bg-zinc-900"
                      />
                      <span className="text-xs font-semibold text-zinc-300">
                        Broadcast Active (Visible to users)
                      </span>
                    </label>

                    <button
                      id="btn-save-announcement"
                      type="submit"
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all"
                    >
                      Publish Announcement
                    </button>
                  </div>
                </form>

                {savedAnnouncementToast && (
                  <div className="mt-3 p-2 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Announcement updated and broadcasted live!</span>
                  </div>
                )}
              </div>

              {/* Banner Live Preview */}
              <div>
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                  Live Banner Preview:
                </span>
                <div className="p-3 bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-purple-500/20 border border-amber-500/30 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-200">
                    <span>👑</span>
                    <span>{announcementText || 'No announcement set'}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-amber-500/30 text-amber-300 font-bold rounded-full">
                    {isAnnouncementActive ? 'LIVE' : 'HIDDEN'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SOUND EFFECTS & AUDIO TRACKS */}
          {activeTab === 'sounds' && (
            <div className="space-y-3">
              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-zinc-200">Comedy Audio Synthesizer Library</h4>
                  <p className="text-[11px] text-zinc-400">Zero-latency synthesized audio effects for reels</p>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                  Web Audio API Ready
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {COMEDY_SOUND_EFFECTS.map((snd) => (
                  <div
                    key={snd.id}
                    className="p-3 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{snd.icon}</span>
                      <div>
                        <div className="font-bold text-xs text-zinc-100">{snd.name}</div>
                        <div className="text-[10px] text-zinc-500">Category: {snd.category}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => comedyAudio.playPreset(snd.preset)}
                      className="p-2 bg-zinc-900 hover:bg-zinc-800 text-amber-400 hover:text-amber-300 rounded-xl border border-zinc-700/60 transition-colors flex items-center gap-1 text-xs font-semibold"
                    >
                      <Volume2 className="w-4 h-4" />
                      Play
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
