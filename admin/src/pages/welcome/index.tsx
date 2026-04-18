import { SearchIcon } from 'tdesign-icons-react';
import { Button, Input } from 'tdesign-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import commonStyles from '../../styles/common.module.less';
import PageContainer from '../../components/PageContainer';
import ListToolbar from '../../components/ListToolbar';

export default function WelcomePage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');

  return (
    <PageContainer>
      <ListToolbar
        left={
        <>
          {/* 快捷入口：跳转到核心功能页 */}
          <Button theme="primary" onClick={() => navigate('/moment/list')}>
            进入动态列表
          </Button>
          <Button theme="default" variant="outline" onClick={() => navigate('/user/list')}>
            进入用户管理
          </Button>
          <span className={commonStyles.selectedInfo}>当前为后台首页</span>
        </>
        }
        right={
        <Input
          className={commonStyles.search}
          value={keyword}
          onChange={setKeyword}
          placeholder="请输入你需要跳转的页面关键词"
          suffixIcon={<SearchIcon />}
          clearable
          onEnter={() => {
            if (keyword.includes('动态')) navigate('/moment/list');
            if (keyword.includes('用户')) navigate('/user/list');
            if (keyword.includes('个人')) navigate('/profile');
          }}
        />
        }
      />

      <div className="page-subsection">
        <div className="subsection-title">系统说明</div>
        {/* 简单介绍：首页信息可按需替换为数据概览/统计卡片 */}
        <p>基于 React + TypeScript + Vite + TDesign 的后台管理系统。</p>
        <p>页面样式统一按admin 列表页规范进行对齐。</p>
        <p>当前已接入用户、动态、资料维护等核心接口能力。</p>
      </div>
    </PageContainer>
  );
}
