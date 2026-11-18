'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { X, Sparkles } from 'lucide-react';

interface AudioVisualizerProps {
  variant?: 'compact' | 'overlay';
  onClose?: () => void;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  variant = 'compact',
  onClose,
}) => {
  const { isPlaying, currentTrack } = usePlayerStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Compact CSS bars for fast inline rendering
  const [compactBars, setCompactBars] = useState([40, 75, 55, 90, 60, 80]);

  useEffect(() => {
    if (!isPlaying) {
      setCompactBars([15, 20, 15, 25, 18, 20]);
      return;
    }

    const interval = setInterval(() => {
      setCompactBars([
        Math.floor(20 + Math.random() * 80),
        Math.floor(30 + Math.random() * 70),
        Math.floor(25 + Math.random() * 75),
        Math.floor(40 + Math.random() * 60),
        Math.floor(20 + Math.random() * 80),
        Math.floor(35 + Math.random() * 65),
      ]);
    }, 120);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Canvas visualizer for overlay mode
  useEffect(() => {
    if (variant !== 'overlay') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const numBars = 36;
    const barValues = new Array(numBars).fill(10);

    const render = () => {
      phase += 0.08;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const barWidth = (width / numBars) * 0.7;
      const gap = (width / numBars) * 0.3;

      for (let i = 0; i < numBars; i++) {
        const target = isPlaying
          ? Math.sin(phase + i * 0.25) * 35 +
            Math.cos(phase * 1.5 + i * 0.15) * 25 +
            Math.random() * 20 +
            30
          : 6;

        barValues[i] += (target - barValues[i]) * 0.2;
        const barHeight = Math.max(4, Math.min(height - 10, barValues[i]));

        const x = i * (barWidth + gap) + gap / 2;
        const y = height - barHeight;

        // Gradient: Spotify Green -> Cyan / Purple
        const grad = ctx.createLinearGradient(0, height, 0, 0);
        grad.addColorStop(0, '#1DB954');
        grad.addColorStop(0.6, '#1ed760');
        grad.addColorStop(1, '#8b5cf6');

        ctx.fillStyle = grad;
        ctx.beginPath();
        // Rounded bar top
        ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [variant, isPlaying]);

  if (variant === 'compact') {
    return (
      <div className="flex items-end gap-[2px] h-4 w-5 justify-center py-0.5" title="Audio rhythm">
        {compactBars.map((height, i) => (
          <span
            key={i}
            className="w-[2.5px] rounded-full bg-[#1DB954] transition-all duration-150"
            style={{
              height: `${isPlaying ? height : 20}%`,
              opacity: isPlaying ? 0.9 : 0.4,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 rounded-2xl bg-[#121212]/95 border border-[#282828] p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-300 select-none">
      <div className="flex items-center justify-between pb-3 border-b border-[#282828]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#1DB954] animate-spin-slow" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Audio Rhythm Visualizer
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full text-[#b3b3b3] hover:text-white hover:bg-white/10 transition-colors"
          title="Close visualizer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="py-3 flex flex-col items-center">
        <canvas
          ref={canvasRef}
          width={340}
          height={90}
          className="w-full h-[90px] rounded-lg bg-black/40"
        />

        {currentTrack && (
          <div className="mt-3 text-center min-w-0 w-full px-2">
            <p className="text-xs font-semibold text-white truncate">{currentTrack.title}</p>
            <p className="text-[11px] text-[#b3b3b3] truncate">{currentTrack.artist}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioVisualizer;
