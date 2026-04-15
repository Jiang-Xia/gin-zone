import { ColorPickerPanel, Drawer, Popup, Switch } from 'tdesign-react';
import { presetThemeColors } from '../../store/layout';
import themeLightIcon from '../../assets/svg/assets-setting-light.svg';
import themeDarkIcon from '../../assets/svg/assets-setting-dark.svg';
import themeAutoIcon from '../../assets/svg/assets-setting-auto.svg';

type ThemeMode = 'light' | 'dark' | 'auto';
type NavLayout = 'side' | 'top' | 'mix';

interface LayoutSettings {
  collapsed: boolean;
  compactMode: boolean;
  navLayout: NavLayout;
  themeMode: ThemeMode;
  // 主题色（十六进制字符串），例如：#f00057
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
  // 主题模式卡片选项（明亮/黑暗/跟随系统）
  const themeOptions: Array<{ value: ThemeMode; label: string; cls: string }> = [
    { value: 'light', label: '明亮', cls: 'light' },
    { value: 'dark', label: '黑暗', cls: 'dark' },
    { value: 'auto', label: '跟随系统', cls: 'auto' },
  ];

  // 导航布局选项（具体渲染逻辑在 MainLayout 里实现）
  const layoutOptions = [
    { value: 'side', label: '侧边布局' },
    { value: 'top', label: '顶部布局' },
    { value: 'mix', label: '混合布局' },
  ];

  return (
    <Drawer visible={visible} header="页面配置" size="460px" footer={false} onClose={onClose}>
      <div className="setting-panel">
        <div className="setting-group-title">主题模式</div>
        <div className="setting-card-grid setting-card-grid-3 setting-theme-grid">
          {themeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`setting-card setting-theme-card ${settings.themeMode === option.value ? 'active' : ''}`}
              onClick={() => onThemeModeChange(option.value)}
              aria-label={`切换主题模式 ${option.label}`}
            >
              <div className={`setting-theme-preview setting-theme-preview-${option.cls}`}>
                <img
                  className="setting-theme-icon"
                  src={option.value === 'light' ? themeLightIcon : option.value === 'dark' ? themeDarkIcon : themeAutoIcon}
                  alt={option.label}
                />
              </div>
              <span className="setting-theme-label">{option.label}</span>
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

          <Popup
            trigger="click"
            placement="bottom-right"
            expandAnimation
            overlayInnerStyle={{ padding: 0 }}
            content={
              <ColorPickerPanel
                onChange={(v) => onThemeColorChange(String(v))}
                colorModes={['monochrome']}
                format="HEX"
                swatchColors={[]}
                defaultValue={settings.themeColor}
              />
            }
          >
            <button
              type="button"
              className={`theme-color-dot theme-color-dot-picker ${presetThemeColors
                .map((c) => c.toLowerCase())
                .includes(settings.themeColor.toLowerCase())
                ? ''
                : 'active'}`}
              aria-label="自定义主题色"
            />
          </Popup>
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
