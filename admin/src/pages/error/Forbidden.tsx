import { Button } from 'tdesign-react';
import { useNavigate } from 'react-router-dom';

export default function ForbiddenPage() {
  const navigate = useNavigate();
  return (
    <div className="list-page">
      <div className="page-subsection">
        <div className="subsection-title">403 无权限访问</div>
        {/* 鉴权失败统一落到该页（见 RequireAuth） */}
        <p>当前账号没有访问该页面的权限。</p>
        <Button theme="primary" onClick={() => navigate('/welcome')}>
          返回首页
        </Button>
      </div>
    </div>
  );
}
