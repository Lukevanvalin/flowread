'use client';

import { Settings, FontFamily, Theme } from '@/lib/types';

interface SettingsPanelProps {
  settings: Settings;
  onUpdate: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  onClose: () => void;
  theme: string;
}

export default function SettingsPanel({ settings, onUpdate, onClose, theme }: SettingsPanelProps) {
  const bg = theme === 'dark' ? 'bg-zinc-800' : theme === 'sepia' ? 'bg-amber-50' : 'bg-white';
  const overlay = 'bg-black/50';
  const label = 'text-xs uppercase tracking-wide opacity-50 mb-2';

  return (
    <div className={`fixed inset-0 z-50 ${overlay}`} onClick={onClose}>
      <div
        className={`absolute bottom-0 left-0 right-0 ${bg} rounded-t-2xl p-6 pb-safe-bottom max-h-[80vh] overflow-y-auto animate-slide-up`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button onClick={onClose} className="p-2 -mr-2 opacity-60 active:opacity-100">
            ✕
          </button>
        </div>

        {/* Theme */}
        <div className="mb-6">
          <div className={label}>Theme</div>
          <div className="flex gap-2">
            {([
              { value: 'light' as Theme, label: 'Light', colors: 'bg-white text-gray-900 border border-gray-300' },
              { value: 'dark' as Theme, label: 'Dark', colors: 'bg-zinc-900 text-white border border-zinc-600' },
              { value: 'sepia' as Theme, label: 'Sepia', colors: 'bg-amber-100 text-amber-950 border border-amber-300' },
            ]).map(t => (
              <button
                key={t.value}
                onClick={() => onUpdate('theme', t.value)}
                className={`flex-1 py-3 rounded-lg text-sm font-medium ${t.colors} ${
                  settings.theme === t.value ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Font Family */}
        <div className="mb-6">
          <div className={label}>Font</div>
          <div className="flex gap-2">
            {([
              { value: 'sans' as FontFamily, label: 'Sans', font: 'font-sans' },
              { value: 'serif' as FontFamily, label: 'Serif', font: 'font-serif' },
              { value: 'mono' as FontFamily, label: 'Mono', font: 'font-mono' },
            ]).map(f => (
              <button
                key={f.value}
                onClick={() => onUpdate('fontFamily', f.value)}
                className={`flex-1 py-3 rounded-lg text-sm ${f.font} ${
                  settings.fontFamily === f.value
                    ? 'bg-blue-600 text-white'
                    : 'opacity-50 hover:opacity-70'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Font Size */}
        <div className="mb-6">
          <div className={label}>Font Size — {settings.fontSize}px</div>
          <input
            type="range"
            min={24}
            max={96}
            step={4}
            value={settings.fontSize}
            onChange={e => onUpdate('fontSize', Number(e.target.value))}
            className="w-full h-2 accent-blue-600"
          />
          <div className="flex justify-between text-xs opacity-30 mt-1">
            <span>Small</span>
            <span>Large</span>
          </div>
        </div>

        {/* Speed */}
        <div className="mb-2">
          <div className={label}>Reading Speed — {settings.wpm} WPM</div>
          <input
            type="range"
            min={100}
            max={1000}
            step={10}
            value={settings.wpm}
            onChange={e => onUpdate('wpm', Number(e.target.value))}
            className="w-full h-2 accent-blue-600"
          />
          <div className="flex justify-between text-xs opacity-30 mt-1">
            <span>100</span>
            <span>1000</span>
          </div>
        </div>
      </div>
    </div>
  );
}
