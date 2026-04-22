import { Menu } from 'tdesign-react';
import type { ReactElement } from 'react';
import logoImage from '../../assets/images/logos/logo512.png';

export interface SideMenuItem {
  label: string;
  value: string;
  icon?: ReactElement;
  children?: SideMenuItem[];
}

interface SideNavProps {
  collapsed: boolean;
  // 控制菜单亮/暗主题，与当前 theme-mode 保持一致
  theme: 'light' | 'dark';
  activePath: string;
  // 菜单项（已在 MainLayout 中按角色过滤成扁平结构）
  items: SideMenuItem[];
  onSelect: (path: string) => void;
}

export default function SideNav({ collapsed, theme, activePath, items, onSelect }: SideNavProps) {
  // 递归渲染菜单节点，支持任意层级路由结构
  const renderMenuItems = (menus: SideMenuItem[]) =>
    menus.map((item) =>
      item.children?.length ? (
        <Menu.SubMenu key={item.value} value={item.value} icon={item.icon} title={item.label}>
          {renderMenuItems(item.children)}
        </Menu.SubMenu>
      ) : (
        <Menu.MenuItem key={item.value} value={item.value} icon={item.icon}>
          {item.label}
        </Menu.MenuItem>
      ),
    );

  return (
    <div className={`td-layout-sider-wrap ${collapsed ? 'collapsed' : ''}`}>
      <div className="app-logo-wrap">
        <div className="app-logo-row">
          <img className="app-logo-img" src={logoImage} alt="Zone Admin Logo" />
          {!collapsed && <h3 className="app-logo">Zone Admin</h3>}
        </div>
        {!collapsed && <p className="app-logo-subtitle">Zone Console</p>}
      </div>
      <Menu
        className="app-menu"
        theme={theme}
        collapsed={collapsed}
        value={activePath}
        onChange={(value) => onSelect(String(value))}
      >
        {renderMenuItems(items)}
      </Menu>
      {!collapsed && <div className="sider-footer">Zone Admin 1.0.0</div>}
    </div>
  );
}
