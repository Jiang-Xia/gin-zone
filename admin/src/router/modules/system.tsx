import { SettingIcon, SecuredIcon, SearchIcon, ViewListIcon } from 'tdesign-icons-react';

import AuditLogsPage from '../../pages/system/auditLogs';
import SensitiveHitsPage from '../../pages/system/sensitiveHits';
import SensitiveWordsPage from '../../pages/system/sensitiveWords';
import SysConfigPage from '../../pages/system/sysConfig';
import type { AppRouteItem } from '../types';

const systemRoutes: AppRouteItem[] = [
  {
    path: '/system/sensitive',
    requiresAuth: true,
    meta: {
      title: '敏感词管理',
      icon: <SecuredIcon />,
      roles: ['admin'],
    },
    children: [
      {
        path: '/system/sensitive-words',
        element: <SensitiveWordsPage />,
        requiresAuth: true,
        meta: {
          title: '敏感词列表',
          icon: <SecuredIcon />,
          roles: ['admin'],
        },
      },
      {
        path: '/system/sensitive-hits',
        element: <SensitiveHitsPage />,
        requiresAuth: true,
        meta: {
          title: '命中记录',
          icon: <SearchIcon />,
          roles: ['admin'],
        },
      },
      {
        path: '/system/audit-logs',
        element: <AuditLogsPage />,
        requiresAuth: true,
        meta: {
          title: '操作日志',
          icon: <ViewListIcon />,
          roles: ['admin'],
        },
      },
    ],
  },
  {
    path: '/system/config',
    element: <SysConfigPage />,
    requiresAuth: true,
    meta: {
      title: '系统配置',
      icon: <SettingIcon />,
      roles: ['admin'],
    },
  },
];

export default systemRoutes;
