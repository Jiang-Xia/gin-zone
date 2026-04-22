import { ChatIcon, UsergroupIcon } from 'tdesign-icons-react';
import ChatFriendsManagePage from '../../pages/chat/friends';
import ChatGroupsManagePage from '../../pages/chat/groups';
import type { AppRouteItem } from '../types';

const chatRoutes: AppRouteItem[] = [
  {
    path: '/chat/friends',
    element: <ChatFriendsManagePage />,
    requiresAuth: true,
    meta: {
      title: '好友关系管理',
      icon: <ChatIcon />,
      roles: ['admin'],
      breadcrumbs: ['内容管理', '好友关系管理'],
    },
  },
  {
    path: '/chat/groups',
    element: <ChatGroupsManagePage />,
    requiresAuth: true,
    meta: {
      title: '群组管理',
      icon: <UsergroupIcon />,
      roles: ['admin'],
      breadcrumbs: ['内容管理', '群组管理'],
    },
  },
];

export default chatRoutes;

