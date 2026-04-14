import { Breadcrumb, Layout, Menu } from 'tdesign-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useAuth } from '../store/auth';
import { menuRoutes } from '../router/routes';
import SideNav from './components/SideNav';
import AppTopBar from './components/AppTopBar';
import LayoutSettingDrawer from './components/LayoutSettingDrawer';
import { useLayoutSettings } from '../store/layout';

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo, logout } = useAuth();
  const [showSetting, setShowSetting] = useState(false);
  const {
    settings,
    resolvedTheme,
    setCollapsed,
    setCompactMode,
    setNavLayout,
    setThemeMode,
    setThemeColor,
    setShowHeader,
    setShowBreadcrumbs,
    setShowFooter,
  } = useLayoutSettings();

  const currentMenuLabel = useMemo(
    () => menuRoutes.find((item) => item.path === location.pathname)?.meta?.title ?? '控制台',
    [location.pathname],
  );
  const menuItems = useMemo(
    () => {
      const roleList = Array.isArray(userInfo?.roles) ? (userInfo?.roles as string[]) : [];
      const isAdmin = Boolean(userInfo?.isAdmin);
      return menuRoutes
        .filter((route) => {
          const roles = route.meta?.roles;
          if (!roles || roles.length === 0) {
            return true;
          }
          return isAdmin || roles.some((role) => roleList.includes(role));
        })
        .map((route) => ({
          label: route.meta?.title ?? route.path,
          value: route.path,
          icon: route.meta?.icon,
        }));
    },
    [userInfo?.isAdmin, userInfo?.roles],
  );

  return (
    <Layout className="td-layout-shell">
      <Layout className="td-layout-main">
        {settings.navLayout !== 'top' && (
          <SideNav
            collapsed={settings.navLayout === 'mix' ? true : settings.collapsed}
            theme={resolvedTheme}
            activePath={location.pathname}
            items={menuItems}
            onSelect={(path) => navigate(path)}
          />
        )}

        <Layout className="app-main">
          {settings.showHeader && (
            <Layout.Header>
              <AppTopBar
                collapsed={settings.collapsed}
                userName={userInfo?.nickName ?? '未登录用户'}
                avatar={userInfo?.avatar}
                onToggleCollapsed={() => setCollapsed(!settings.collapsed)}
                onOpenSetting={() => setShowSetting(true)}
                onProfile={() => navigate('/profile')}
                onLogout={() => {
                  logout();
                  navigate('/login');
                }}
              />
            </Layout.Header>
          )}
          {settings.navLayout === 'top' && (
            <div className="top-nav-wrap">
              <Menu
                className="top-nav-menu"
                theme={resolvedTheme}
                value={location.pathname}
                onChange={(value) => navigate(String(value))}
              >
                {menuItems.map((item) => (
                  <Menu.MenuItem key={item.value} value={item.value} icon={item.icon}>
                    {item.label}
                  </Menu.MenuItem>
                ))}
              </Menu>
            </div>
          )}
          <Layout.Content className={`app-content ${settings.compactMode ? 'compact' : ''}`}>
            {settings.showBreadcrumbs && (
              <div className="page-header">
                <Breadcrumb options={[{ content: '列表页' }, { content: currentMenuLabel }]} />
              </div>
            )}
            <div className="page-body">
              <Outlet />
            </div>
          </Layout.Content>
          {settings.showFooter && <Layout.Footer className="app-footer">Zone Admin - Powered by TDesign</Layout.Footer>}
        </Layout>
      </Layout>

      <LayoutSettingDrawer
        visible={showSetting}
        onClose={() => setShowSetting(false)}
        settings={settings}
        onCollapsedChange={setCollapsed}
        onCompactModeChange={setCompactMode}
        onNavLayoutChange={setNavLayout}
        onThemeModeChange={setThemeMode}
        onThemeColorChange={setThemeColor}
        onShowHeaderChange={setShowHeader}
        onShowBreadcrumbsChange={setShowBreadcrumbs}
        onShowFooterChange={setShowFooter}
      />
    </Layout>
  );
}
