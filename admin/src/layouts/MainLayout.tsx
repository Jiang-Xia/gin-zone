import { Breadcrumb, Layout, Menu } from 'tdesign-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '../store/auth';
import { appRoutes, flatRoutes, getRouteChainByPath } from '../router/routes';
import { canAccessRoute } from '../router/permissions';
import SideNav, { type SideMenuItem } from './components/SideNav';
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
    () => flatRoutes.find((item) => item.path === location.pathname),
    [location.pathname],
  );
  // 仅允许跳转到真实可访问页面，避免点击父级分组路由进入空页面
  const navigablePathSet = useMemo(
    () => new Set(flatRoutes.filter((route) => route.element).map((route) => route.path)),
    [],
  );
  // 面包屑项：默认按路由树动态组装；meta.breadcrumbs 仅作为自定义覆盖
  const breadcrumbOptions = useMemo(() => {
    if (currentRoute?.meta?.breadcrumbs?.length) {
      return currentRoute.meta.breadcrumbs.map((item) => ({ content: item }));
    }
    const routeChain = getRouteChainByPath(location.pathname);
    const dynamicBreadcrumbs = routeChain
      .map((route) => route.meta?.title)
      .filter((title): title is string => Boolean(title));
    const breadcrumbTitles =
      dynamicBreadcrumbs.length > 0 ? dynamicBreadcrumbs : ['控制台', currentRoute?.meta?.title ?? '控制台'];
    return breadcrumbTitles.map((item) => ({ content: item }));
  }, [location.pathname, currentRoute?.meta?.breadcrumbs, currentRoute?.meta?.title]);

  // 菜单项：按角色过滤后生成可渲染的结构
  const menuItems = useMemo(
    () => {
      // 将个人中心固定在菜单末尾，避免被业务菜单夹在中间
      const placeProfileLast = (items: SideMenuItem[]) => {
        const profileItems = items.filter((item) => item.value === '/profile');
        const otherItems = items.filter((item) => item.value !== '/profile');
        return [...otherItems, ...profileItems];
      };
      // 递归生成菜单：路由树与菜单树保持一致，避免依赖额外分组字段
      const buildMenuItems = (routes: typeof appRoutes): SideMenuItem[] =>
        routes.flatMap((route) => {
          // 菜单过滤复用统一权限函数
          if (!route.meta || route.meta.hideInMenu || !canAccessRoute(userInfo, route.meta)) {
            return [];
          }
          const children = route.children ? buildMenuItems(route.children) : undefined;
          const menuItem: SideMenuItem = {
            label: route.meta.title ?? route.path,
            value: route.path,
            icon: route.meta.icon,
          };
          if (children && children.length > 0) {
            menuItem.children = children;
          }
          return [menuItem];
        });
      return placeProfileLast(buildMenuItems(appRoutes));
    },
    [userInfo],
  );

  // 顶部导航与侧边栏共享同一份树形菜单渲染逻辑
  const renderMenuItems = (items: SideMenuItem[]): ReactNode =>
    items.map((item) =>
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
            onSelect={(path) => {
              if (navigablePathSet.has(path)) {
                navigate(path);
              }
            }}
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
                onChange={(value) => {
                  const path = String(value);
                  if (navigablePathSet.has(path)) {
                    navigate(path);
                  }
                }}
              >
                {renderMenuItems(menuItems)}
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
