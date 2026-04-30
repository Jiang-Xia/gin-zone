import { Avatar, Button, Dropdown, Select, Space, Tooltip } from 'tdesign-react';
import {
  HelpCircleIcon,
  MenuFoldIcon,
  MenuUnfoldIcon,
  SearchIcon,
  SettingIcon,
} from 'tdesign-icons-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { flatRoutes } from '../../router/routes';
import { useAuth } from '../../store/auth';
import { canAccessRoute } from '../../router/permissions';

interface AppTopBarProps {
  collapsed: boolean;
  userName: string;
  avatar?: string;
  // 切换侧边导航折叠状态
  onToggleCollapsed: () => void;
  // 打开“页面配置”抽屉
  onOpenSetting: () => void;
  onProfile: () => void;
  onLogout: () => void;
}

export default function AppTopBar({
  collapsed,
  userName,
  avatar,
  onToggleCollapsed,
  onOpenSetting,
  onProfile,
  onLogout,
}: AppTopBarProps) {
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const [jumpValue, setJumpValue] = useState<string>('');

  // 右上角快捷跳转：从路由表生成可访问的页面选项
  const jumpOptions = useMemo(() => {
    return flatRoutes
      .filter((route) => Boolean(route.element) && Boolean(route.meta?.title))
      .filter((route) => canAccessRoute(userInfo, route.meta))
      .map((route) => ({
        label: route.meta?.title ?? route.path,
        value: route.path,
      }));
  }, [userInfo]);

  return (
    <div className="app-header">
      <Space align="center" size={16}>
        <Button
          variant="text"
          shape="square"
          icon={collapsed ? <MenuUnfoldIcon /> : <MenuFoldIcon />}
          onClick={onToggleCollapsed}
        />
        <Select
          className="header-search"
          value={jumpValue}
          onChange={(value) => {
            const path = String(value);
            setJumpValue(path);
            if (path) {
              navigate(path);
            }
          }}
          options={jumpOptions}
          filterable
          clearable
          placeholder="搜索并跳转到页面"
          prefixIcon={<SearchIcon />}
        />
      </Space>
      <div className="header-right">
        <Space align="center" size={12}>
          <Tooltip content="帮助">
            <Button variant="text" shape="square" icon={<HelpCircleIcon />} />
          </Tooltip>
          <Tooltip content="布局设置">
            <Button variant="text" shape="square" icon={<SettingIcon />} onClick={onOpenSetting} />
          </Tooltip>
        </Space>
        <Dropdown
          options={[
            { content: '个人中心', value: 'profile' },
            { content: '退出登录', value: 'logout' },
          ]}
          onClick={({ value }) => {
            if (value === 'profile') onProfile();
            if (value === 'logout') onLogout();
          }}
        >
          <div className="user-block clickable">
            <Avatar image={avatar} alt={userName} />
            <span>{userName}</span>
          </div>
        </Dropdown>
      </div>
    </div>
  );
}
