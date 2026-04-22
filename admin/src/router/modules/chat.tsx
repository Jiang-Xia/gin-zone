import { UserTransmitIcon, ChatIcon, ChatSettingIcon, UsergroupIcon } from 'tdesign-icons-react';
import ChatFriendsManagePage from '../../pages/chat/friends';
import ChatGroupsManagePage from '../../pages/chat/groups';
import ChatMessagesManagePage from '../../pages/chat/messages';
import type { AppRouteItem } from '../types';

const chatRoutes: AppRouteItem[] = [
  {
    path: '/chat',
    requiresAuth: true,
    meta: {
      title: '聊天管理',
      icon: <ChatSettingIcon />,
      roles: ['admin'],
    },
    children: [
      {
        path: '/chat/friends',
        element: <ChatFriendsManagePage />,
        requiresAuth: true,
        meta: {
          title: '好友关系管理',
          icon: <UserTransmitIcon />,
          roles: ['admin'],
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
        },
      },
      {
        path: '/chat/messages',
        element: <ChatMessagesManagePage />,
        requiresAuth: true,
        meta: {
          title: '消息管理',
          icon: <ChatIcon />,
          roles: ['admin'],
        },
      },
    ],
  },
];

export default chatRoutes;

