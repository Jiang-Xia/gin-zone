import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { Color } from 'tvision-color';

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
// 产品要求的默认主题色
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

/**
 * 解析十六进制颜色字符串：
 * - 支持 `#RGB` / `#RRGGBB` / `RGB` / `RRGGBB`
 * - 非法输入返回 null
 */
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

/**
 * 将单个品牌色映射到一组 TDesign 常用 CSS 变量。
 * 这里不是完整调色板实现，只提供 hover/active/浅色背景等基础能力，保证交互态一致。
 */
function applyThemeColor(color: string, mode: 'light' | 'dark') {
  // 使用 tvision-color 生成 10 阶色板（与 demo-admin 一致），确保 hover/active/focus 等变量完整覆盖
  const hex = parseHexColor(color) ? color : DEFAULT_THEME_COLOR;
  const root = document.documentElement;

  const gradations = Color.getColorGradations({
    colors: [hex],
    step: 10,
    remainInput: false,
  })?.[0];
  if (!gradations?.colors?.length) {
    return;
  }

  let palette = [...gradations.colors];
  let brandIndex = gradations.primary;

  // 暗色模式下将色板反转，并轻微调整饱和度，让层级更自然（参考 demo-admin）
  if (mode === 'dark') {
    palette = palette
      .reverse()
      .map((c) => {
        const [h, s, l] = Color.colorTransform(c, 'hex', 'hsl');
        return Color.colorTransform([h, Number(s) - 4, l], 'hsl', 'hex') as string;
      });
    brandIndex = 10 - brandIndex;
    palette[0] = `${palette[brandIndex]}20`;
  }

  // 写入完整 brand 色阶变量（1~10），避免组件 hover 仍使用默认蓝色
  root.style.setProperty('--td-brand-color', palette[brandIndex]);
  root.style.setProperty('--td-brand-color-1', palette[0]);
  root.style.setProperty('--td-brand-color-2', palette[1]);
  root.style.setProperty('--td-brand-color-3', palette[2]);
  root.style.setProperty('--td-brand-color-4', palette[3]);
  root.style.setProperty('--td-brand-color-5', palette[4]);
  root.style.setProperty('--td-brand-color-6', palette[5]);
  root.style.setProperty('--td-brand-color-7', brandIndex > 0 ? palette[brandIndex - 1] : palette[brandIndex]);
  root.style.setProperty('--td-brand-color-8', palette[brandIndex]);
  root.style.setProperty('--td-brand-color-9', brandIndex > 8 ? palette[brandIndex] : palette[brandIndex + 1]);
  root.style.setProperty('--td-brand-color-10', palette[9]);

  // 兼容 demo-admin 的属性（方便以后复用其插入样式的策略）
  root.setAttribute('theme-color', hex || '');
}

/**
 * 从 localStorage 恢复页面配置，并做严格校验+默认值兜底。
 * 目的：避免本地缓存被手工改坏/字段变更后导致页面白屏。
 */
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
  // 仅 themeMode === 'auto' 时使用：跟随系统深色模式
  const [systemDark, setSystemDark] = useState<boolean>(() => window.matchMedia('(prefers-color-scheme: dark)').matches);

  // 实际应用到页面的主题：当 themeMode=auto 时由系统主题决定
  const resolvedTheme: 'light' | 'dark' = settings.themeMode === 'auto' ? (systemDark ? 'dark' : 'light') : settings.themeMode;

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    // 持久化页面配置：刷新后保持用户偏好
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    // 1) CSS 用 [theme-mode] 选择器做亮/暗变量切换
    // 2) 同时注入品牌色相关变量，保持组件高亮色一致
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
