// Humor Tok Watermark Generator & Video Exporter
import { ReelItem } from '../types';

export interface WatermarkOptions {
  watermarkPosition?: 'top-left' | 'bottom-right' | 'both';
  includeHandle?: boolean;
  includeAudio?: boolean;
  scale?: number;
}

/**
 * Draws the Humor Tok brand watermark onto a canvas 2D context
 */
export function drawHumorTokWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  reel: ReelItem,
  options: WatermarkOptions = {}
) {
  const {
    watermarkPosition = 'both',
    includeHandle = true,
    includeAudio = true,
  } = options;

  ctx.save();

  const primaryFontSize = Math.max(16, Math.floor(width * 0.038));
  const subFontSize = Math.max(12, Math.floor(width * 0.026));

  // Function to draw the iconic Humor Tok badge
  const drawBadge = (x: number, y: number, align: 'left' | 'right' = 'left') => {
    ctx.save();
    ctx.textAlign = align;

    // Background pill glow for maximum contrast over any video frame
    const pillWidth = primaryFontSize * 11;
    const pillHeight = primaryFontSize * 2.5;
    const pillX = align === 'left' ? x - 10 : x - pillWidth + 10;
    const pillY = y - primaryFontSize * 1.2;

    ctx.fillStyle = 'rgba(9, 9, 11, 0.72)';
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 14);
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
    ctx.stroke();

    // Dual offset TikTok-style cyan & magenta glitch drop shadows
    const title = '🤣 Humor Tok';
    
    // Cyan shadow
    ctx.font = `800 ${primaryFontSize}px 'Outfit', sans-serif`;
    ctx.fillStyle = '#06b6d4';
    ctx.fillText(title, x - 1.5, y + 1);

    // Coral shadow
    ctx.fillStyle = '#f43f5e';
    ctx.fillText(title, x + 1.5, y - 1);

    // Main crisp white text
    ctx.fillStyle = '#ffffff';
    ctx.fillText(title, x, y);

    // Handle subtitle
    if (includeHandle) {
      ctx.font = `600 ${subFontSize}px 'Plus Jakarta Sans', sans-serif`;
      ctx.fillStyle = '#e4e4e7';
      const handleText = `@${reel.author.handle.replace('@', '')}`;
      ctx.fillText(handleText, x, y + primaryFontSize * 0.95);
    }

    ctx.restore();
  };

  // Top Left Watermark
  if (watermarkPosition === 'top-left' || watermarkPosition === 'both') {
    const marginX = Math.max(20, width * 0.05);
    const marginY = Math.max(40, height * 0.07);
    drawBadge(marginX, marginY, 'left');
  }

  // Bottom Right Watermark with sound attribution
  if (watermarkPosition === 'bottom-right' || watermarkPosition === 'both') {
    const marginX = width - Math.max(20, width * 0.05);
    const marginY = height - Math.max(50, height * 0.09);
    drawBadge(marginX, marginY, 'right');

    if (includeAudio && reel.audio) {
      ctx.save();
      ctx.textAlign = 'right';
      ctx.font = `500 ${subFontSize * 0.9}px 'Plus Jakarta Sans', sans-serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 6;
      ctx.fillText(`🎵 ${reel.audio.title}`, marginX, marginY + primaryFontSize * 1.8);
      ctx.restore();
    }
  }

  // Draw punchline overlay if reel has one
  if (reel.punchlineOverlay?.text) {
    ctx.save();
    const punchFontSize = Math.max(20, Math.floor(width * 0.052));
    ctx.font = `800 ${punchFontSize}px 'Outfit', sans-serif`;
    ctx.textAlign = 'center';

    let punchY = height * 0.5;
    if (reel.punchlineOverlay.position === 'top') punchY = height * 0.22;
    if (reel.punchlineOverlay.position === 'bottom') punchY = height * 0.76;

    // Background banner
    const textMetrics = ctx.measureText(reel.punchlineOverlay.text);
    const boxWidth = Math.min(width * 0.9, textMetrics.width + 36);
    const boxHeight = punchFontSize * 2;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.82)';
    ctx.beginPath();
    ctx.roundRect((width - boxWidth) / 2, punchY - boxHeight * 0.65, boxWidth, boxHeight, 12);
    ctx.fill();
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#facc15';
    ctx.fillText(reel.punchlineOverlay.text, width / 2, punchY);
    ctx.restore();
  }

  ctx.restore();
}

/**
 * Captures the current video frame, renders the Humor Tok watermark, and triggers file download
 */
export async function downloadWatermarkedFrame(
  videoElement: HTMLVideoElement | null,
  reel: ReelItem,
  onProgress?: (progress: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      if (onProgress) onProgress(20);

      const canvas = document.createElement('canvas');
      const width = videoElement?.videoWidth || 720;
      const height = videoElement?.videoHeight || 1280;

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not initialize canvas context');

      if (videoElement && videoElement.readyState >= 2) {
        ctx.drawImage(videoElement, 0, 0, width, height);
      } else {
        // Fallback stylish comedy gradient frame
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, '#18181b');
        grad.addColorStop(0.5, '#27272a');
        grad.addColorStop(1, '#09090b');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }

      if (onProgress) onProgress(60);

      // Draw official Humor Tok Watermark
      drawHumorTokWatermark(ctx, width, height, reel);

      if (onProgress) onProgress(85);

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to generate watermarked image'));
          return;
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const sanitizedTitle = reel.title.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 24);
        a.download = `HumorTok_${sanitizedTitle}_watermarked.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        if (onProgress) onProgress(100);
        resolve(url);
      }, 'image/jpeg', 0.95);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Records a 4-second watermarked video snippet using MediaRecorder and Canvas
 */
export async function downloadWatermarkedVideo(
  videoElement: HTMLVideoElement | null,
  reel: ReelItem,
  onProgress?: (progress: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      if (!videoElement) {
        // If no video tag, fallback to image
        return downloadWatermarkedFrame(videoElement, reel, onProgress).then(resolve).catch(reject);
      }

      const canvas = document.createElement('canvas');
      const width = 720;
      const height = 1280;
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      const stream = canvas.captureStream(30);
      let mediaRecorder: MediaRecorder;

      try {
        mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp9',
        });
      } catch (e) {
        try {
          mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'video/webm',
          });
        } catch (e2) {
          // Fallback to high-res watermarked frame
          return downloadWatermarkedFrame(videoElement, reel, onProgress).then(resolve).catch(reject);
        }
      }

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const videoBlob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(videoBlob);
        const a = document.createElement('a');
        a.href = url;
        const sanitizedTitle = reel.title.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 24);
        a.download = `HumorTok_${sanitizedTitle}_watermark.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        if (onProgress) onProgress(100);
        resolve(url);
      };

      mediaRecorder.start();

      let framesRendered = 0;
      const maxFrames = 90; // ~3 seconds at 30fps

      const renderInterval = setInterval(() => {
        framesRendered++;
        const percent = Math.min(95, Math.floor((framesRendered / maxFrames) * 100));
        if (onProgress) onProgress(percent);

        if (videoElement.readyState >= 2) {
          ctx.drawImage(videoElement, 0, 0, width, height);
        }
        drawHumorTokWatermark(ctx, width, height, reel);

        if (framesRendered >= maxFrames) {
          clearInterval(renderInterval);
          mediaRecorder.stop();
        }
      }, 33);
    } catch (err) {
      console.warn('Video recorder error, falling back to frame:', err);
      downloadWatermarkedFrame(videoElement, reel, onProgress).then(resolve).catch(reject);
    }
  });
}
