'use client';

import { useState } from 'react';
import { useReader } from '@/hooks/useReader';
import { useSettings } from '@/hooks/useSettings';
import InputView from '@/components/InputView';
import ReaderView from '@/components/ReaderView';
import SettingsPanel from '@/components/SettingsPanel';

export default function Home() {
  const { settings, updateSetting, loaded } = useSettings();
  const reader = useReader(settings.wpm);
  const [showSettings, setShowSettings] = useState(false);

  const themeClasses =
    settings.theme === 'dark'
      ? 'bg-zinc-900 text-white'
      : settings.theme === 'sepia'
        ? 'bg-amber-50 text-amber-950'
        : 'bg-white text-gray-900';

  if (!loaded) return null;

  return (
    <main className={`min-h-screen transition-colors ${themeClasses}`}>
      {reader.totalWords === 0 ? (
        <InputView
          onTextReady={reader.loadText}
          theme={settings.theme}
        />
      ) : (
        <ReaderView
          currentWord={reader.currentWord}
          contextBefore={reader.contextBefore}
          contextAfter={reader.contextAfter}
          index={reader.index}
          totalWords={reader.totalWords}
          progress={reader.progress}
          wordsRemaining={reader.wordsRemaining}
          estimatedSeconds={reader.estimatedSeconds}
          isPlaying={reader.isPlaying}
          settings={settings}
          onToggle={reader.toggle}
          onStepForward={reader.stepForward}
          onStepBack={reader.stepBack}
          onJumpForward={reader.jumpForward}
          onJumpBack={reader.jumpBack}
          onRestart={reader.restart}
          onBack={reader.clearReader}
          onOpenSettings={() => setShowSettings(true)}
          onWpmChange={(wpm) => updateSetting('wpm', wpm)}
        />
      )}

      {showSettings && (
        <SettingsPanel
          settings={settings}
          onUpdate={updateSetting}
          onClose={() => setShowSettings(false)}
          theme={settings.theme}
        />
      )}
    </main>
  );
}
