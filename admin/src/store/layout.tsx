import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

type ThemeMode = 'light' | 'dark' | 'auto';
type NavLayout = 'side' | 'top' | 'mix';

interface LayoutSettingsState {
  collapsed: boolean;
  compactMode: boolean;
  navLayout: NavLayout;
  themeMode: ThemeMode;
  themeColor: string;
  showHeader: boolean;
  showBreadcrumbs: boolean;
  showFooter: boolean;
}

interface LayoutSettingsContextValue {
  settings: LayoutSettingsState;
  resolvedTheme: 'light' | 'dark';
  setCollapsed: (value: boolean) => void;
  setCompactMode: (value: boolean) => void;
  setNavLayout: (value: NavLayout) => void;
  setThemeMode: (value: ThemeMode) => void;
  setThemeColor: (value: string) => void;
  setShowHeader: (value: boolean) => void;
  setShowBreadcrumbs: (value: boolean) => void;
  setShowFooter: (value: boolean) => void;
}

const STORAGE_KEY = 'layout_settings_v1';
const DEFAULT_THEME_COLOR = '#f00057';

const defaultSettings: LayoutSettingsState = {
  collapsed: false,
  compactMode: true,
  navLayout: 'side',
  themeMode: 'light',
  themeColor: DEFAULT_THEME_COLOR,
  showHeader: true,
  showBreadcrumbs: true,
  showFooter: true,
};

const presetThemeColors = [
  '#f00057',
  '#0052d9',
  '#0594fa',
  '#2ba471',
  '#e34d59',
  '#ed7b2f',
  '#8b5cf6',
];

const LayoutSettingsContext = createContext<LayoutSettingsContextValue | null>(null);

function parseHexColor(input: string): [number, number, number] | null {
  const value = input.trim().replace('#', '');
  const normalized = value.length === 3 ? value.split('').map((c) => `${c}${c}`).join('') : value;
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return null;
  }
  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
  ];
}

function toHexChannel(value: number): string {
  return Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, '0');
}

function rgbToHex(rgb: [number, number, number]): string {
  return `#${toHexChannel(rgb[0])}${toHexChannel(rgb[1])}${toHexChannel(rgb[2])}`;
}

function mixColor(base: [number, number, number], target: [number, number, number], ratio: number): [number, number, number] {
  return [
    base[0] * (1 - ratio) + target[0] * ratio,
    base[1] * (1 - ratio) + target[1] * ratio,
    base[2] * (1 - ratio) + target[2] * ratio,
  ];
}

function applyThemeColor(color: string, mode: 'light' | 'dark') {
  const rgb = parseHexColor(color) ?? parseHexColor(DEFAULT_THEME_COLOR);
  if (!rgb) {
    return;
  }
  const root = document.documentElement;
  const white: [number, number, number] = [255, 255, 255];
  const black: [number, number, number] = [0, 0, 0];
  const light1 = rgbToHex(mixColor(rgb, white, mode === 'light' ? 0.9 : 0.35));
  const light2 = rgbToHex(mixColor(rgb, white, mode === 'light' ? 0.8 : 0.25));
  const hover = rgbToHex(mixColor(rgb, white, mode === 'light' ? 0.1 : 0.2));
  const active = rgbToHex(mixColor(rgb, black, mode === 'light' ? 0.1 : 0.18));
  root.style.setProperty('--td-brand-color', rgbToHex(rgb));
  root.style.setProperty('--td-brand-color-1', light1);
  root.style.setProperty('--td-brand-color-2', light2);
  root.style.setProperty('--td-brand-color-7', hover);
  root.style.setProperty('--td-brand-color-8', rgbToHex(rgb));
  root.style.setProperty('--td-brand-color-9', active);
}

function getInitialSettings(): LayoutSettingsState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return defaultSettings;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<LayoutSettingsState>;
    return {
      ...defaultSettings,
      ...parsed,
      navLayout:
        parsed.navLayout === 'side' || parsed.navLayout === 'top' || parsed.navLayout === 'mix'
          ? parsed.navLayout
          : defaultSettings.navLayout,
      themeColor:
        typeof parsed.themeColor === 'string' && parseHexColor(parsed.themeColor) ? parsed.themeColor : DEFAULT_THEME_COLOR,
      themeMode:
        parsed.themeMode === 'dark' || parsed.themeMode === 'light' || parsed.themeMode === 'auto'
          ? parsed.themeMode
          : defaultSettings.themeMode,
    };
  } catch {
    return defaultSettings;
  }
}

export function LayoutSettingsProvider({ children }: PropsWithChildren) {
  const [settings, setSettings] = useState<LayoutSettingsState>(getInitialSettings);
  const [systemDark, setSystemDark] = useState<boolean>(() => window.matchMedia('(prefers-color-scheme: dark)').matches);

  const resolvedTheme: 'light' | 'dark' = settings.themeMode === 'auto' ? (systemDark ? 'dark' : 'light') : settings.themeMode;

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    document.documentElement.setAttribute('theme-mode', resolvedTheme);
    applyThemeColor(settings.themeColor, resolvedTheme);
  }, [resolvedTheme, settings.themeColor]);

  const value = useMemo<LayoutSettingsContextValue>(
    () => ({
      settings,
      resolvedTheme,
      setCollapsed: (value) => setSettings((prev) => ({ ...prev, collapsed: value })),
      setCompactMode: (value) => setSettings((prev) => ({ ...prev, compactMode: value })),
      setNavLayout: (value) => setSettings((prev) => ({ ...prev, navLayout: value })),
      setThemeMode: (value) => setSettings((prev) => ({ ...prev, themeMode: value })),
      setThemeColor: (value) =>
        setSettings((prev) => ({ ...prev, themeColor: parseHexColor(value) ? value : prev.themeColor })),
      setShowHeader: (value) => setSettings((prev) => ({ ...prev, showHeader: value })),
      setShowBreadcrumbs: (value) => setSettings((prev) => ({ ...prev, showBreadcrumbs: value })),
      setShowFooter: (value) => setSettings((prev) => ({ ...prev, showFooter: value })),
    }),
    [resolvedTheme, settings],
  );

  return <LayoutSettingsContext.Provider value={value}>{children}</LayoutSettingsContext.Provider>;
}

export function useLayoutSettings() {
  const context = useContext(LayoutSettingsContext);
  if (!context) {
    throw new Error('useLayoutSettings must be used within LayoutSettingsProvider');
  }
  return context;
}

export { DEFAULT_THEME_COLOR, presetThemeColors };
