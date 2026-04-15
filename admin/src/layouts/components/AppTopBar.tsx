import { Avatar, Button, Dropdown, Input, Space, Tooltip } from 'tdesign-react';
import {
  HelpCircleIcon,
  MenuFoldIcon,
  MenuUnfoldIcon,
  SearchIcon,
  SettingIcon,
} from 'tdesign-icons-react';

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
  return (
    <div className="app-header">
      <Space align="center" size={16}>
        <Button
          variant="text"
          shape="square"
          icon={collapsed ? <MenuUnfoldIcon /> : <MenuFoldIcon />}
          onClick={onToggleCollapsed}
        />
        <Input className="header-search" placeholder="请输入搜索内容" suffixIcon={<SearchIcon />} clearable />
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
