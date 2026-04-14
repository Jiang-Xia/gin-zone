import { Drawer, Switch } from 'tdesign-react';
import { presetThemeColors } from '../../store/layout';

type ThemeMode = 'light' | 'dark' | 'auto';
type NavLayout = 'side' | 'top' | 'mix';

interface LayoutSettings {
  collapsed: boolean;
  compactMode: boolean;
  navLayout: NavLayout;
  themeMode: ThemeMode;
  themeColor: string;
  showHeader: boolean;
  showBreadcrumbs: boolean;
  showFooter: boolean;
}

interface LayoutSettingDrawerProps {
  visible: boolean;
  settings: LayoutSettings;
  onClose: () => void;
  onCollapsedChange: (value: boolean) => void;
  onCompactModeChange: (value: boolean) => void;
  onNavLayoutChange: (value: NavLayout) => void;
  onThemeModeChange: (value: ThemeMode) => void;
  onThemeColorChange: (value: string) => void;
  onShowHeaderChange: (value: boolean) => void;
  onShowBreadcrumbsChange: (value: boolean) => void;
  onShowFooterChange: (value: boolean) => void;
}

export default function LayoutSettingDrawer({
  visible,
  settings,
  onClose,
  onCollapsedChange,
  onCompactModeChange,
  onNavLayoutChange,
  onThemeModeChange,
  onThemeColorChange,
  onShowHeaderChange,
  onShowBreadcrumbsChange,
  onShowFooterChange,
}: LayoutSettingDrawerProps) {
  const themeOptions: Array<{ value: ThemeMode; label: string; cls: string }> = [
    { value: 'light', label: '明亮', cls: 'light' },
    { value: 'dark', label: '黑暗', cls: 'dark' },
    { value: 'auto', label: '跟随系统', cls: 'auto' },
  ];

  const layoutOptions = [
    { value: 'side', label: '侧边布局' },
    { value: 'top', label: '顶部布局' },
    { value: 'mix', label: '混合布局' },
  ];

  return (
    <Drawer visible={visible} header="页面配置" size="380px" footer={false} onClose={onClose}>
      <div className="setting-panel">
        <div className="setting-group-title">主题模式</div>
        <div className="setting-card-grid setting-card-grid-3">
          {themeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`setting-card ${settings.themeMode === option.value ? 'active' : ''}`}
              onClick={() => onThemeModeChange(option.value)}
              aria-label={`切换主题模式 ${option.label}`}
            >
              <div className={`setting-theme-preview ${option.cls}`} />
              <span>{option.label}</span>
            </button>
          ))}
        </div>

        <div className="setting-group-title">主题色</div>
        <div className="theme-color-list">
          {presetThemeColors.map((color) => (
            <button
              key={color}
              type="button"
              className={`theme-color-dot ${settings.themeColor.toLowerCase() === color.toLowerCase() ? 'active' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => onThemeColorChange(color)}
              aria-label={`切换主题色 ${color}`}
            />
          ))}
        </div>

        <div className="setting-group-title">导航布局</div>
        <div className="setting-card-grid setting-card-grid-3">
          {layoutOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`setting-card ${settings.navLayout === option.value ? 'active' : ''}`}
              onClick={() => onNavLayoutChange(option.value as NavLayout)}
              aria-label={option.label}
            >
              <div className={`setting-layout-preview ${option.value}`} />
              <span>{option.label}</span>
            </button>
          ))}
        </div>

        <div className="setting-group-title">元素开关</div>
        <div className="setting-item">
          <span>折叠菜单</span>
          <Switch value={settings.collapsed} onChange={(value) => onCollapsedChange(Boolean(value))} />
        </div>
        <div className="setting-item">
          <span>紧凑内容</span>
          <Switch value={settings.compactMode} onChange={(value) => onCompactModeChange(Boolean(value))} />
        </div>
        <div className="setting-item">
          <span>显示 Header</span>
          <Switch value={settings.showHeader} onChange={(value) => onShowHeaderChange(Boolean(value))} />
        </div>
        <div className="setting-item">
          <span>显示 Breadcrumbs</span>
          <Switch value={settings.showBreadcrumbs} onChange={(value) => onShowBreadcrumbsChange(Boolean(value))} />
        </div>
        <div className="setting-item">
          <span>显示 Footer</span>
          <Switch value={settings.showFooter} onChange={(value) => onShowFooterChange(Boolean(value))} />
        </div>
      </div>
    </Drawer>
  );
}
