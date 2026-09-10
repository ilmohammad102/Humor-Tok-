import React, { useState } from 'react';
import { X, Download, Copy, Check, Share2, Sparkles, Film, Image as ImageIcon, Bookmark } from 'lucide-react';
import { ReelItem } from '../types';
import { downloadWatermarkedFrame, downloadWatermarkedVideo } from '../utils/watermarkExport';

interface ShareAndDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  reel: ReelItem;
  videoElement: HTMLVideoElement | null;
  onSaveOffline: (reel: ReelItem) => void;
  isSavedOffline: boolean;
}

export const ShareAndDownloadModal: React.FC<ShareAndDownloadModalProps> = ({
  isOpen,
  onClose,
  reel,
  videoElement,
  onSaveOffline,
  isSavedOffline,
}) => {
  const [copied, setCopied] = useState(false);
  const [isExportingVideo, setIsExportingVideo] = useState(false);
  const [isExportingFrame, setIsExportingFrame] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  if (!isOpen) return null;

  const handleCopyLink = () => {
    const url = `${window.location.origin}/#reel-${reel.id}`;
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleDownloadWatermarkedVideo = async () => {
    setIsExportingVideo(true);
    setProgress(10);
    setStatusMessage('Rendering video frames with Humor Tok watermark...');
    try {
      await downloadWatermarkedVideo(videoElement, reel, (p) => {
        setProgress(p);
      });
      setStatusMessage('Watermarked Reel Downloaded!');
      setTimeout(() => {
        setIsExportingVideo(false);
        setProgress(0);
        setStatusMessage('');
      }, 1500);
    } catch (err) {
      console.error('Download video failed:', err);
      // Fallback to frame download
      await handleDownloadWatermarkedFrame();
      setIsExportingVideo(false);
    }
  };

  const handleDownloadWatermarkedFrame = async () => {
    setIsExportingFrame(true);
    setProgress(20);
    setStatusMessage('Applying Humor Tok badge & high-res branding...');
    try {
      await downloadWatermarkedFrame(videoElement, reel, (p) => {
        setProgress(p);
      });
      setStatusMessage('Watermarked Poster Downloaded!');
      setTimeout(() => {
        setIsExportingFrame(false);
        setProgress(0);
        setStatusMessage('');
      }, 1500);
    } catch (err) {
      console.error('Download frame failed:', err);
      setIsExportingFrame(false);
      setStatusMessage('Export failed, please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="absolute inset-0" onClick={onClose} />

      <div 
        className="relative z-10 w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold text-base text-zinc-100 font-display">Share & Download</h3>
          </div>
          <button
            id="btn-close-share"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Watermark Preview Badge Card */}
        <div className="my-4 p-3 bg-zinc-950 border border-zinc-800/90 rounded-2xl relative overflow-hidden">
          <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Official Watermark Preview
          </div>
          <div className="p-3 bg-zinc-900/90 border border-rose-500/30 rounded-xl relative shadow-inner flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-rose-500 to-amber-500 flex items-center justify-center text-xl shadow-md">
                🤣
              </div>
              <div>
                <div className="flex items-center gap-1 font-extrabold text-sm text-white font-display">
                  <span>Humor Tok</span>
                  <span className="text-[10px] px-1 bg-cyan-500/20 text-cyan-300 rounded font-mono">HD</span>
                </div>
                <div className="text-xs text-zinc-400 font-medium">
                  @{reel.author.handle.replace('@', '')}
                </div>
              </div>
            </div>
            <div className="text-right text-[10px] text-zinc-400">
              <div>Watermark</div>
              <div className="text-emerald-400 font-bold">Burned-in</div>
            </div>
          </div>
          <p className="text-[11px] text-zinc-500 mt-2 text-center">
            Downloaded clips include creator handle and audio attribution badge.
          </p>
        </div>

        {/* Download Buttons */}
        <div className="space-y-2.5">
          {/* Download Video with Watermark */}
          <button
            id="btn-download-watermarked-video"
            onClick={handleDownloadWatermarkedVideo}
            disabled={isExportingVideo || isExportingFrame}
            className="w-full flex items-center justify-between px-4 py-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-rose-600/20 active:scale-[0.98]"
          >
            <div className="flex items-center gap-2.5">
              <Film className="w-4 h-4" />
              <span>Download Watermarked Clip</span>
            </div>
            <Download className="w-4 h-4 opacity-80" />
          </button>

          {/* Download Watermarked Poster/Image */}
          <button
            id="btn-download-watermarked-frame"
            onClick={handleDownloadWatermarkedFrame}
            disabled={isExportingVideo || isExportingFrame}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-60 text-zinc-200 font-medium text-sm rounded-xl transition-colors border border-zinc-700/60 active:scale-[0.98]"
          >
            <div className="flex items-center gap-2.5">
              <ImageIcon className="w-4 h-4 text-cyan-400" />
              <span>Save Watermarked Frame (HD)</span>
            </div>
            <Download className="w-4 h-4 opacity-60" />
          </button>

          {/* Save to Offline Vault */}
          <button
            id="btn-save-offline-modal"
            onClick={() => onSaveOffline(reel)}
            className={`w-full flex items-center justify-between px-4 py-2.5 font-medium text-sm rounded-xl transition-colors border active:scale-[0.98] ${
              isSavedOffline
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700/60 text-zinc-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Bookmark className={`w-4 h-4 ${isSavedOffline ? 'fill-amber-400 text-amber-400' : 'text-amber-400'}`} />
              <span>{isSavedOffline ? 'Saved in Offline Vault' : 'Save for Offline Viewing'}</span>
            </div>
            <span className="text-xs text-zinc-400">{isSavedOffline ? '✓ In Vault' : '+ Offline'}</span>
          </button>
        </div>

        {/* Export Progress Bar */}
        {(isExportingVideo || isExportingFrame) && (
          <div className="mt-4 p-3 bg-zinc-950 rounded-xl border border-zinc-800 animate-pulse">
            <div className="flex items-center justify-between text-xs text-zinc-300 mb-1.5 font-medium">
              <span>{statusMessage}</span>
              <span className="font-mono text-rose-400">{progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-cyan-400 transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Copy Link & Social Row */}
        <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center gap-2">
          <button
            id="btn-copy-link"
            onClick={handleCopyLink}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                <span>Copy Reel Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
