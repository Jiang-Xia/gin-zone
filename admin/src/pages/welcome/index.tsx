import { Button } from 'tdesign-react';
import { useNavigate } from 'react-router-dom';

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="list-page">
      <div className="list-toolbar">
        <div className="list-toolbar-left">
          <Button theme="primary" onClick={() => navigate('/moment/list')}>
            进入动态列表
          </Button>
          <Button theme="default" variant="outline" onClick={() => navigate('/user/list')}>
            进入用户管理
          </Button>
          <span className="selected-info">当前为后台首页</span>
        </div>
      </div>

      <div className="page-subsection">
        <div className="subsection-title">系统说明</div>
        <p>基于 React + TypeScript + Vite + TDesign 的后台管理系统。</p>
        <p>页面样式统一按 demo-admin 列表页规范进行对齐。</p>
        <p>当前已接入用户、动态、资料维护等核心接口能力。</p>
      </div>
    </div>
  );
}
