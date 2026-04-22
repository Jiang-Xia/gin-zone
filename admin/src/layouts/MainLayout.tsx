import { Breadcrumb, Layout, Menu } from 'tdesign-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useAuth } from '../store/auth';
import { menuRoutes } from '../router/routes';
import { canAccessRoute } from '../router/permissions';
import SideNav from './components/SideNav';
import AppTopBar from './components/AppTopBar';
import LayoutSettingDrawer from './components/LayoutSettingDrawer';
import { useLayoutSettings } from '../store/layout';

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo, logout } = useAuth();
  // 控制“页面配置”抽屉显示/隐藏
  const [showSetting, setShowSetting] = useState(false);
  const {
    // 页面配置（持久化到 localStorage）：主题/布局/元素开关等
    settings,
    // 实际生效主题（themeMode=auto 时由系统主题决定）
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

  // 当前命中的菜单路由：用于生成标题与面包屑
  const currentRoute = useMemo(
    () => menuRoutes.find((item) => item.path === location.pathname),
    [location.pathname],
  );
  // 面包屑项：优先使用 route.meta.breadcrumbs，其次兜底“控制台 + 标题”
  const breadcrumbOptions = useMemo(
    () =>
      (currentRoute?.meta?.breadcrumbs ?? ['控制台', currentRoute?.meta?.title ?? '控制台']).map((item) => ({
        content: item,
      })),
    [currentRoute?.meta?.breadcrumbs, currentRoute?.meta?.title],
  );

  // 菜单项：按角色过滤后生成可渲染的结构
  const menuItems = useMemo(
    () => {
      return menuRoutes
        // 菜单过滤复用统一权限函数
        .filter((route) => canAccessRoute(userInfo, route.meta))
        .map((route) => ({
          label: route.meta?.title ?? route.path,
          value: route.path,
          icon: route.meta?.icon,
        }));
    },
    [userInfo],
  );

  return (
    <Layout className="td-layout-shell">
      <Layout className="td-layout-main">
        {/* 顶部布局：使用顶栏菜单；其它布局：显示侧边导航 */}
        {settings.navLayout !== 'top' && (
          <SideNav
            // 混合布局：固定窄侧栏（collapsed）形成差异化视觉
            collapsed={settings.navLayout === 'mix' ? true : settings.collapsed}
            theme={resolvedTheme}
            activePath={location.pathname}
            items={menuItems}
            onSelect={(path) => navigate(path)}
          />
        )}

        <Layout className="app-main">
          {/* 元素开关：由页面配置控制 Header/Breadcrumbs/Footer 是否显示 */}
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
                <Breadcrumb options={breadcrumbOptions} />
              </div>
            )}
            <div className="page-body">
              <Outlet />
            </div>
          </Layout.Content>
          {settings.showFooter && <Layout.Footer className="app-footer">Zone Admin - Powered by Zone</Layout.Footer>}
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
