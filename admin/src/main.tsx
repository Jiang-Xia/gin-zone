import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'tdesign-react/es/style/index.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './store/auth';
import { LayoutSettingsProvider } from './store/layout';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    {/* Router + 全局 Provider 注入入口 */}
    <BrowserRouter>
      {/* 登录态与用户信息 */}
      <AuthProvider>
        {/* 页面配置：主题/布局/元素开关等 */}
        <LayoutSettingsProvider>
          <App />
        </LayoutSettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
