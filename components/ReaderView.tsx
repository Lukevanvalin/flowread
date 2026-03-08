'use client';

import { useEffect } from 'react';
import { useSwipe } from '@/hooks/useSwipe';
import { FONT_MAP, WPM_PRESETS } from '@/lib/types';
import type { Settings } from '@/lib/types';

interface ReaderViewProps {
  currentWord: string;
  contextBefore: string[];
  contextAfter: string[];
  index: number;
  totalWords: number;
  progress: number;
  wordsRemaining: number;
  estimatedSeconds: number;
  isPlaying: boolean;
  settings: Settings;
  onToggle: () => void;
  onStepForward: () => void;
  onStepBack: () => void;
  onJumpForward: () => void;
  onJumpBack: () => void;
  onRestart: () => void;
  onBack: () => void;
  onOpenSettings: () => void;
  onWpmChange: (wpm: number) => void;
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export default function ReaderView({
  currentWord,
  contextBefore,
  contextAfter,
  index,
  totalWords,
  progress,
  wordsRemaining,
  estimatedSeconds,
  isPlaying,
  settings,
  onToggle,
  onStepForward,
  onStepBack,
  onJumpForward,
  onJumpBack,
  onRestart,
  onBack,
  onOpenSettings,
  onWpmChange,
}: ReaderViewProps) {
  // Keyboard controls
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case ' ':
          e.preventDefault();
          onToggle();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          e.shiftKey ? onJumpBack() : onStepBack();
          break;
        case 'ArrowRight':
          e.preventDefault();
          e.shiftKey ? onJumpForward() : onStepForward();
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onToggle, onStepForward, onStepBack, onJumpForward, onJumpBack]);

  const swipe = useSwipe({
    onSwipeLeft: onStepForward,
    onSwipeRight: onStepBack,
  });

  const fontFamily = FONT_MAP[settings.fontFamily];

  return (
    <div
      className="flex flex-col min-h-screen select-none"
      {...swipe}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-safe-top py-3">
        <button onClick={onBack} className="p-2 -ml-2 opacity-60 active:opacity-100 text-sm">
          ← Back
        </button>
        <div className="text-xs opacity-40">
          {index + 1} / {totalWords}
        </div>
        <button onClick={onOpenSettings} className="p-2 -mr-2 opacity-60 active:opacity-100 text-sm">
          ⚙ Settings
        </button>
      </div>

      {/* Main reading area */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-4"
        onClick={onToggle}
      >
        {/* Context before */}
        <div className="text-center opacity-25 text-sm mb-4 h-5 truncate max-w-[90vw]" style={{ fontFamily }}>
          {contextBefore.join(' ')}
        </div>

        {/* Current word */}
        <div
          className="text-center font-semibold transition-none leading-tight max-w-[95vw] break-all"
          style={{
            fontFamily,
            fontSize: `${settings.fontSize}px`,
          }}
        >
          {currentWord || '\u00A0'}
        </div>

        {/* Context after */}
        <div className="text-center opacity-25 text-sm mt-4 h-5 truncate max-w-[90vw]" style={{ fontFamily }}>
          {contextAfter.join(' ')}
        </div>

        {/* Tap hint */}
        {!isPlaying && index === 0 && (
          <div className="mt-8 text-xs opacity-30 animate-pulse">
            Tap to start · Space to play/pause
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="px-4 pb-2">
        {/* WPM presets */}
        <div className="flex justify-center gap-2 mb-3">
          {WPM_PRESETS.map(p => (
            <button
              key={p.value}
              onClick={() => onWpmChange(p.value)}
              className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                settings.wpm === p.value
                  ? 'bg-blue-600 text-white'
                  : 'opacity-40 hover:opacity-70 active:opacity-100'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* WPM slider */}
        <div className="flex items-center gap-3 mb-3 px-2">
          <span className="text-xs opacity-40 w-12 text-right">{settings.wpm} wpm</span>
          <input
            type="range"
            min={100}
            max={1000}
            step={10}
            value={settings.wpm}
            onChange={e => onWpmChange(Number(e.target.value))}
            className="flex-1 h-1 accent-blue-600"
            onClick={e => e.stopPropagation()}
          />
        </div>

        {/* Playback buttons */}
        <div className="flex items-center justify-center gap-1 mb-3">
          <button onClick={onJumpBack} className="p-3 opacity-50 active:opacity-100 text-lg" title="Jump back 10">
            ⏪
          </button>
          <button onClick={onStepBack} className="p-3 opacity-50 active:opacity-100 text-lg" title="Step back">
            ◀
          </button>
          <button onClick={onToggle} className="p-4 text-2xl active:scale-95 transition-transform" title="Play/Pause">
            {isPlaying ? '⏸' : '▶️'}
          </button>
          <button onClick={onStepForward} className="p-3 opacity-50 active:opacity-100 text-lg" title="Step forward">
            ▶
          </button>
          <button onClick={onJumpForward} className="p-3 opacity-50 active:opacity-100 text-lg" title="Jump forward 10">
            ⏩
          </button>
          <button onClick={onRestart} className="p-3 opacity-50 active:opacity-100 text-base ml-2" title="Restart">
            ↺
          </button>
        </div>

        {/* Stats */}
        <div className="text-center text-xs opacity-30 mb-2">
          {wordsRemaining} words left · ~{formatTime(estimatedSeconds)} remaining
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full bg-current opacity-10">
        <div
          className="h-full bg-blue-600 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Safe area bottom spacer */}
      <div className="pb-safe-bottom" />
    </div>
  );
}
