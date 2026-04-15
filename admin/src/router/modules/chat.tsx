import { ChatIcon } from 'tdesign-icons-react';
import ChatManagePage from '../../pages/chat/manage';
import type { AppRouteItem } from '../types';

const chatRoutes: AppRouteItem[] = [
  {
    path: '/chat/manage',
    element: <ChatManagePage />,
    requiresAuth: true,
    meta: {
      title: '聊天管理',
      icon: <ChatIcon />,
      roles: ['admin'],
      breadcrumbs: ['内容管理', '聊天管理'],
    },
  },
];

export default chatRoutes;

