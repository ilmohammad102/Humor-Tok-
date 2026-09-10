import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Camera,
  Sparkles,
  Music,
  Smile,
  Check,
  Video,
  Volume2,
  RefreshCw,
  Plus
} from 'lucide-react';
import { ReelItem, PunchlineOverlay, AudioTrack } from '../types';
import { COMEDY_SOUND_EFFECTS } from '../data/initialReels';
import { comedyAudio } from '../utils/audioSynth';

interface CreateReelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublishReel: (newReel: ReelItem) => void;
  currentUser: {
    name: string;
    handle: string;
    avatar: string;
    isOwner: boolean;
  };
}

const COMEDY_TEMPLATES = [
  {
    id: 'template-standup',
    name: '🎤 Stand-up Stage',
    videoUrl: '/videos/comedy-1.mp4',
    defaultPunchline: 'When nobody laughs so you laugh at your own joke.',
  },
  {
    id: 'template-cat',
    name: '🐱 Pet Antics & Fail',
    videoUrl: '/videos/comedy-2.mp4',
    defaultPunchline: 'Calculated the jump. Bad at math.',
  },
  {
    id: 'template-office',
    name: '💼 WFH Relatable Skit',
    videoUrl: '/videos/comedy-4.mp4',
    defaultPunchline: 'Surviving another meeting that could have been an email.',
  },
  {
    id: 'template-meme',
    name: '🤯 Brain Lag Moment',
    videoUrl: '/videos/comedy-3.mp4',
    defaultPunchline: 'Looking for phone while talking on phone.',
  },
];

export const CreateReelModal: React.FC<CreateReelModalProps> = ({
  isOpen,
  onClose,
  onPublishReel,
  currentUser,
}) => {
  const [videoSourceType, setVideoSourceType] = useState<'upload' | 'camera' | 'template'>('template');
  const [videoUrl, setVideoUrl] = useState(COMEDY_TEMPLATES[0].videoUrl);
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [punchlineText, setPunchlineText] = useState(COMEDY_TEMPLATES[0].defaultPunchline);
  const [punchlinePosition, setPunchlinePosition] = useState<'top' | 'center' | 'bottom'>('top');
  const [punchlineStyle, setPunchlineStyle] = useState<'meme' | 'comic' | 'neon' | 'classic'>('meme');
  const [selectedSound, setSelectedSound] = useState(COMEDY_SOUND_EFFECTS[0]);
  const [tagsInput, setTagsInput] = useState('#humortok #comedy #viral');

  // AI Assistant state
  const [aiTopic, setAiTopic] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);

  // Camera recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Clean up camera stream when modal closes
  useEffect(() => {
    if (!isOpen && cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
      setIsRecording(false);
    }
  }, [isOpen, cameraStream]);

  if (!isOpen) return null;

  // Handle local video file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setVideoSourceType('upload');
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, '').slice(0, 30));
      }
    }
  };

  // Start live camera stream
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 720, height: 1280 },
        audio: true,
      });
      setCameraStream(stream);
      setVideoSourceType('camera');
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.warn('Camera access error:', err);
      alert('Could not access camera. Please allow camera permissions or upload a video file.');
    }
  };

  // Start live recording
  const startRecording = () => {
    if (!cameraStream) return;
    recordedChunksRef.current = [];
    try {
      const recorder = new MediaRecorder(cameraStream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const recordedUrl = URL.createObjectURL(blob);
        setVideoUrl(recordedUrl);
        // Stop stream preview
        if (cameraStream) {
          cameraStream.getTracks().forEach((t) => t.stop());
          setCameraStream(null);
        }
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingSeconds(0);

      const timer = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 15) {
            stopRecording();
            clearInterval(timer);
            return 15;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (e) {
      console.error(e);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // AI Punchline Generator
  const handleGenerateAiPunchline = async () => {
    if (isGeneratingAi) return;
    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/generate-punchline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiTopic || 'Everyday embarrassing situations & relatable struggles',
          style: 'Viral short video punchline',
        }),
      });
      const data = await res.json();
      if (data.ideas && data.ideas.length > 0) {
        setAiSuggestions(data.ideas);
        // Auto apply first
        const first = data.ideas[0];
        setTitle(first.title);
        setPunchlineText(first.punchline);
        setCaption(first.caption);
        if (first.tags) {
          setTagsInput(first.tags.join(' '));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Test sound effect
  const handlePlaySound = (sound: typeof COMEDY_SOUND_EFFECTS[0]) => {
    setSelectedSound(sound);
    comedyAudio.playPreset(sound.preset);
  };

  // Publish reel
  const handlePublish = () => {
    if (!title.trim()) {
      alert('Please enter a comedy title for your reel');
      return;
    }

    const tagsArray = tagsInput
      .split(/[\s,]+/)
      .map((t) => (t.startsWith('#') ? t : `#${t}`))
      .filter((t) => t.length > 1);

    const newReel: ReelItem = {
      id: `reel-user-${Date.now()}`,
      title: title.trim(),
      caption: caption.trim() || `${title} 🤣 ${tagsInput}`,
      videoUrl: videoUrl,
      author: {
        id: `author-${currentUser.handle}`,
        name: currentUser.name,
        handle: currentUser.handle,
        avatar: currentUser.avatar,
        isOwner: currentUser.isOwner,
        isVerified: currentUser.isOwner,
        followersCount: '1.2K',
      },
      audio: {
        id: `sound-${selectedSound.id}`,
        title: selectedSound.name,
        artist: `${currentUser.name} • Comedy Audio`,
        soundType: selectedSound.id as any,
        synthPreset: selectedSound.preset,
      },
      likesCount: 1,
      commentsCount: 0,
      sharesCount: 0,
      savesCount: 0,
      isLiked: true,
      isSaved: false,
      comedyTags: tagsArray.length > 0 ? tagsArray : ['#humortok', '#comedy'],
      createdAt: 'Just now',
      punchlineOverlay: punchlineText.trim()
        ? {
            text: punchlineText.trim(),
            position: punchlinePosition,
            style: punchlineStyle,
          }
        : undefined,
      comments: [],
    };

    onPublishReel(newReel);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative z-10 w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-2xl my-auto max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-sm shadow-md">
              🎭
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-100 font-display">Comedy Reel Creator</h3>
              <p className="text-[11px] text-zinc-400">Record, upload or remix comedy videos</p>
            </div>
          </div>
          <button
            id="btn-close-create"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Scrollable */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 no-scrollbar">
          {/* Video Source Selection Tabs */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 mb-1.5 block">
              1. Choose Video Source
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setVideoSourceType('template')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-colors ${
                  videoSourceType === 'template'
                    ? 'bg-rose-500/10 border-rose-500 text-rose-400'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                }`}
              >
                <Smile className="w-3.5 h-3.5" />
                Templates
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-colors ${
                  videoSourceType === 'upload'
                    ? 'bg-rose-500/10 border-rose-500 text-rose-400'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Clip
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={startCamera}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-colors ${
                  videoSourceType === 'camera'
                    ? 'bg-rose-500/10 border-rose-500 text-rose-400'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                Live Camera
              </button>
            </div>
          </div>

          {/* Template Choices (if template mode) */}
          {videoSourceType === 'template' && (
            <div className="grid grid-cols-2 gap-2">
              {COMEDY_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => {
                    setVideoUrl(tmpl.videoUrl);
                    setPunchlineText(tmpl.defaultPunchline);
                    if (!title) setTitle(tmpl.name);
                  }}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                    videoUrl === tmpl.videoUrl
                      ? 'bg-zinc-800 border-amber-400 text-amber-300 ring-1 ring-amber-400/40'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="font-semibold text-zinc-200">{tmpl.name}</div>
                  <div className="text-[10px] text-zinc-500 mt-1 truncate">{tmpl.defaultPunchline}</div>
                </button>
              ))}
            </div>
          )}

          {/* Camera View & Record Button (if camera mode) */}
          {videoSourceType === 'camera' && cameraStream && (
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-zinc-700">
              <video
                ref={videoPreviewRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 flex items-center gap-3">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1.5"
                  >
                    <span className="w-3 h-3 rounded-full bg-white animate-pulse" />
                    Record Comedy (15s)
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="px-4 py-2 bg-zinc-900/90 border border-rose-500 text-rose-400 text-xs font-bold rounded-full shadow-lg flex items-center gap-2"
                  >
                    <span className="w-2.5 h-2.5 bg-rose-500 rounded-xs" />
                    Stop ({recordingSeconds}s)
                  </button>
                )}
              </div>
            </div>
          )}

          {/* AI Comedy Assistant Box */}
          <div className="p-3.5 bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-amber-950/40 border border-purple-500/30 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                AI Comedy Script & Punchline Generator
              </div>
              <span className="text-[10px] px-1.5 py-0.5 bg-purple-500/20 text-purple-300 font-mono rounded">
                Gemini
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                placeholder="Topic: e.g. 'Coffee addiction', 'Cat judging me'..."
                className="flex-1 bg-zinc-900/90 border border-zinc-700/80 rounded-xl px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500"
              />
              <button
                type="button"
                onClick={handleGenerateAiPunchline}
                disabled={isGeneratingAi}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl flex items-center gap-1 transition-colors shrink-0 shadow-md"
              >
                {isGeneratingAi ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>Generate</span>
              </button>
            </div>

            {/* AI Suggestions dropdown if available */}
            {aiSuggestions.length > 0 && (
              <div className="mt-2.5 space-y-1.5">
                <span className="text-[10px] text-purple-300 font-semibold uppercase">Pick an AI Punchline:</span>
                {aiSuggestions.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setTitle(item.title);
                      setPunchlineText(item.punchline);
                      setCaption(item.caption);
                      if (item.tags) setTagsInput(item.tags.join(' '));
                    }}
                    className="p-2 bg-zinc-900/90 hover:bg-zinc-800 border border-purple-500/20 hover:border-purple-400 rounded-lg cursor-pointer text-xs transition-colors"
                  >
                    <div className="font-semibold text-zinc-200">{item.title}</div>
                    <div className="text-purple-300 text-[11px] mt-0.5">{item.punchline}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Title & Caption */}
          <div className="space-y-2">
            <div>
              <label className="text-xs font-semibold text-zinc-300 mb-1 block">
                Comedy Reel Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. When you check your bank account after weekend"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 mb-1 block">
                Caption & Description
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write funny context or punchline details..."
                rows={2}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-500 resize-none"
              />
            </div>
          </div>

          {/* Punchline Banner Overlay */}
          <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-amber-400 flex items-center gap-1">
                <span>💬 Burned-in Punchline Text Banner</span>
              </label>
              <div className="flex gap-1 text-[11px]">
                {(['top', 'center', 'bottom'] as const).map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setPunchlinePosition(pos)}
                    className={`px-2 py-0.5 rounded capitalize border ${
                      punchlinePosition === pos
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'border-zinc-800 text-zinc-500'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="text"
              value={punchlineText}
              onChange={(e) => setPunchlineText(e.target.value)}
              placeholder="e.g. MY HEART DROPPED INTO MY SHOES 😭"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-amber-300 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Comedy Sound Effect Picker */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-rose-400" />
              <span>Select Comedy Audio Track</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COMEDY_SOUND_EFFECTS.map((sound) => (
                <button
                  key={sound.id}
                  type="button"
                  onClick={() => handlePlaySound(sound)}
                  className={`p-2 rounded-xl border text-left flex items-center justify-between text-xs transition-colors ${
                    selectedSound.id === sound.id
                      ? 'bg-rose-500/10 border-rose-500 text-rose-300'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span>{sound.icon}</span>
                    <span className="truncate">{sound.name}</span>
                  </div>
                  <Volume2 className="w-3.5 h-3.5 shrink-0 opacity-60 hover:opacity-100" />
                </button>
              ))}
            </div>
          </div>

          {/* Hashtags */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 mb-1 block">
              Comedy Tags
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="#humortok #standup #skit"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        {/* Modal Footer / Publish Button */}
        <div className="pt-3 border-t border-zinc-800 shrink-0 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            id="btn-publish-reel"
            type="button"
            onClick={handlePublish}
            className="flex-1 py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Publish to Humor Tok</span>
          </button>
        </div>
      </div>
    </div>
  );
};
