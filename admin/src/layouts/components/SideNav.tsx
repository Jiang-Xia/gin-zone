import { Menu } from 'tdesign-react';
import type { ReactElement } from 'react';
import logoImage from '../../assets/images/logos/logo512.png';

export interface SideMenuItem {
  label: string;
  value: string;
  icon?: ReactElement;
}

interface SideNavProps {
  collapsed: boolean;
  theme: 'light' | 'dark';
  activePath: string;
  items: SideMenuItem[];
  onSelect: (path: string) => void;
}

export default function SideNav({ collapsed, theme, activePath, items, onSelect }: SideNavProps) {
  return (
    <div className={`td-layout-sider-wrap ${collapsed ? 'collapsed' : ''}`}>
      <div className="app-logo-wrap">
        <div className="app-logo-row">
          <img className="app-logo-img" src={logoImage} alt="Zone Admin Logo" />
          {!collapsed && <h3 className="app-logo">Zone Admin</h3>}
        </div>
        {!collapsed && <p className="app-logo-subtitle">TDesign Console</p>}
      </div>
      <Menu
        className="app-menu"
        theme={theme}
        collapsed={collapsed}
        value={activePath}
        onChange={(value) => onSelect(String(value))}
      >
        {items.map((item) => (
          <Menu.MenuItem key={item.value} value={item.value} icon={item.icon}>
            {item.label}
          </Menu.MenuItem>
        ))}
      </Menu>
      {!collapsed && <div className="sider-footer">TDesign Starter 0.3.1</div>}
    </div>
  );
}
