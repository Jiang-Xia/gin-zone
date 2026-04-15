import { Button } from 'tdesign-react';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="list-page">
      <div className="page-subsection">
        <div className="subsection-title">404 页面不存在</div>
        {/* 未匹配路由的兜底页（见 router/index.tsx） */}
        <p>你访问的页面不存在或已被移除。</p>
        <Button theme="primary" onClick={() => navigate('/welcome')}>
          返回首页
        </Button>
      </div>
    </div>
  );
}
