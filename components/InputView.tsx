'use client';

import { useState, useRef } from 'react';
import { extractFromFile } from '@/lib/extractText';

interface InputViewProps {
  onTextReady: (text: string) => void;
  theme: string;
}

export default function InputView({ onTextReady, theme }: InputViewProps) {
  const [mode, setMode] = useState<'paste' | 'url' | 'file'>('paste');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const bg = theme === 'dark' ? 'bg-zinc-800' : theme === 'sepia' ? 'bg-amber-100' : 'bg-white';
  const border = theme === 'dark' ? 'border-zinc-600' : theme === 'sepia' ? 'border-amber-300' : 'border-gray-300';
  const inputBg = theme === 'dark' ? 'bg-zinc-900 text-white' : theme === 'sepia' ? 'bg-amber-50 text-amber-950' : 'bg-gray-50 text-gray-900';
  const tabActive = theme === 'dark' ? 'bg-zinc-600 text-white' : theme === 'sepia' ? 'bg-amber-700 text-white' : 'bg-blue-600 text-white';
  const tabInactive = theme === 'dark' ? 'bg-zinc-700 text-zinc-300' : theme === 'sepia' ? 'bg-amber-200 text-amber-800' : 'bg-gray-200 text-gray-700';

  const handlePaste = () => {
    if (text.trim()) onTextReady(text.trim());
  };

  const handleUrl = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/extract-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to extract text');
      if (data.text?.trim()) onTextReady(data.text.trim());
      else throw new Error('No readable text found');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const extracted = await extractFromFile(file);
      if (extracted.trim()) onTextReady(extracted.trim());
      else throw new Error('No text found in file');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to read file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
      <div className="w-full max-w-lg">
        <h1 className="text-4xl font-bold text-center mb-2 tracking-tight">FlowRead</h1>
        <p className="text-center opacity-60 mb-8 text-sm">Speed read anything. One word at a time.</p>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 rounded-lg overflow-hidden">
          {(['paste', 'url', 'file'] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); }}
              className={`flex-1 py-3 text-sm font-medium capitalize transition-colors ${mode === m ? tabActive : tabInactive}`}
            >
              {m === 'paste' ? 'Paste Text' : m === 'url' ? 'Enter URL' : 'Upload File'}
            </button>
          ))}
        </div>

        <div className={`${bg} ${border} border rounded-xl p-5`}>
          {mode === 'paste' && (
            <>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Paste your text here..."
                className={`w-full h-48 p-3 rounded-lg border ${border} ${inputBg} resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
              />
              <button
                onClick={handlePaste}
                disabled={!text.trim()}
                className="w-full mt-3 py-3 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-40 active:bg-blue-700 transition-colors text-base"
              >
                Start Reading
              </button>
            </>
          )}

          {mode === 'url' && (
            <>
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://example.com/article"
                className={`w-full p-3 rounded-lg border ${border} ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
              />
              <button
                onClick={handleUrl}
                disabled={!url.trim() || loading}
                className="w-full mt-3 py-3 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-40 active:bg-blue-700 transition-colors text-base"
              >
                {loading ? 'Extracting...' : 'Fetch & Read'}
              </button>
            </>
          )}

          {mode === 'file' && (
            <>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.txt,.md,.docx"
                onChange={handleFile}
                className="hidden"
              />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={loading}
                className={`w-full py-12 border-2 border-dashed ${border} rounded-lg text-center transition-colors active:opacity-70`}
              >
                <span className="block text-3xl mb-2">📄</span>
                <span className="text-sm opacity-70">
                  {loading ? 'Processing...' : 'Tap to choose a file'}
                </span>
                <span className="block text-xs opacity-40 mt-1">PDF, TXT, DOCX, MD</span>
              </button>
            </>
          )}

          {error && <p className="mt-3 text-red-500 text-sm text-center">{error}</p>}
        </div>
      </div>
    </div>
  );
}
