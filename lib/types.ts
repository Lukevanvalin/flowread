export type Theme = 'light' | 'dark' | 'sepia';
export type FontFamily = 'sans' | 'serif' | 'mono';

export interface Settings {
  wpm: number;
  fontSize: number;
  fontFamily: FontFamily;
  theme: Theme;
}

export const DEFAULT_SETTINGS: Settings = {
  wpm: 300,
  fontSize: 48,
  fontFamily: 'sans',
  theme: 'dark',
};

export const FONT_MAP: Record<FontFamily, string> = {
  sans: '"Inter", ui-sans-serif, system-ui, sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
};

export const WPM_PRESETS = [
  { label: 'Slow', value: 200 },
  { label: 'Normal', value: 300 },
  { label: 'Fast', value: 500 },
  { label: 'Sprint', value: 700 },
] as const;
