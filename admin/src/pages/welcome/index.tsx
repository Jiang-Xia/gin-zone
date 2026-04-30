import { SearchIcon } from 'tdesign-icons-react';
import { Avatar, Button, Card, Input, Tag } from 'tdesign-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import commonStyles from '../../styles/common.module.less';
import PageContainer from '../../components/PageContainer';
import ListToolbar from '../../components/ListToolbar';
import { flatRoutes } from '../../router/routes';
import { useAuth } from '../../store/auth';
import styles from './index.module.less';

export default function WelcomePage() {
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const [keyword, setKeyword] = useState('');

  // 页面统计：用于首页卡片展示（不依赖后端接口，避免首页加载失败）
  const pageStats = useMemo(() => {
    const withElement = flatRoutes.filter((r) => Boolean(r.element));
    const withMeta = flatRoutes.filter((r) => Boolean(r.meta?.title));
    const roleText = userInfo?.isAdmin ? 'admin' : (userInfo?.roles?.[0] ?? 'user');
    return {
      routeCount: flatRoutes.length,
      pageCount: withElement.length,
      menuCount: withMeta.length,
      roleText,
    };
  }, [userInfo]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 6) return '凌晨好';
    if (hour < 12) return '上午好';
    if (hour < 18) return '下午好';
    return '晚上好';
  }, []);

  return (
    <PageContainer>
      <ListToolbar
        left={
          <>
            {/* 快捷入口：跳转到核心功能页 */}
            <Button theme="primary" onClick={() => navigate('/moment/list')}>
              动态列表
            </Button>
            <Button theme="default" variant="outline" onClick={() => navigate('/user/list')}>
              用户管理
            </Button>
            <Button theme="default" variant="outline" onClick={() => navigate('/chat/groups')}>
              群组管理
            </Button>
            <span className={commonStyles.selectedInfo}>控制台首页</span>
          </>
        }
        right={
          <Input
            className={commonStyles.search}
            value={keyword}
            onChange={setKeyword}
            placeholder="输入关键词快速跳转（如：动态/用户/群组/日志）"
            suffixIcon={<SearchIcon />}
            clearable
            onEnter={() => {
              const k = keyword.trim();
              if (!k) return;
              if (k.includes('动态')) navigate('/moment/list');
              if (k.includes('用户')) navigate('/user/list');
              if (k.includes('群') || k.includes('群组')) navigate('/chat/groups');
              if (k.includes('好友')) navigate('/chat/friends');
              if (k.includes('消息')) navigate('/chat/messages');
              if (k.includes('日志') || k.includes('审计')) navigate('/system/audit-logs');
              if (k.includes('命中')) navigate('/system/sensitive-hits');
              if (k.includes('敏感') || k.includes('词')) navigate('/system/sensitive-words');
              if (k.includes('配置')) navigate('/system/config');
              if (k.includes('个人') || k.includes('资料')) navigate('/profile');
            }}
          />
        }
      />

      <Card className={styles.hero} bordered>
        <div className={styles.heroMain}>
          <div className={styles.heroLeft}>
            <div className={styles.heroTitle}>
              {greeting}，{userInfo?.nickName ?? userInfo?.userName ?? '管理员'}。
            </div>
            <div className={styles.heroDesc}>
              今天也保持高效：先从常用入口开始，或用右上角搜索快速跳转到页面。
            </div>
            <div className={styles.heroMeta}>
              <Tag theme="primary" variant="light">
                角色：{pageStats.roleText}
              </Tag>
              <Tag theme="default" variant="light">
                页面：{pageStats.pageCount}
              </Tag>
              <Tag theme="default" variant="light">
                路由：{pageStats.routeCount}
              </Tag>
              <Tag theme="default" variant="light">
                菜单：{pageStats.menuCount}
              </Tag>
            </div>
          </div>
          <div className={styles.heroRight}>
            <Avatar size="64px" image={userInfo?.avatar} />
            <div className={styles.userBlock}>
              <div className={styles.userName}>{userInfo?.nickName ?? userInfo?.userName ?? '-'}</div>
              <div className={styles.userId}>ID：{userInfo?.userId ?? '-'}</div>
            </div>
            <Button theme="default" variant="outline" onClick={() => navigate('/profile')}>
              进入个人中心
            </Button>
          </div>
        </div>
      </Card>

      <div className={styles.grid4}>
        <Card bordered className={styles.statCard}>
          <div className={styles.statLabel}>今日建议</div>
          <div className={styles.statValue}>先处理敏感内容</div>
          <div className={styles.statHint}>系统 → 敏感命中 / 敏感词库</div>
          <Button size="small" theme="primary" variant="text" onClick={() => navigate('/system/sensitive-hits')}>
            去查看
          </Button>
        </Card>
        <Card bordered className={styles.statCard}>
          <div className={styles.statLabel}>内容巡检</div>
          <div className={styles.statValue}>动态列表</div>
          <div className={styles.statHint}>支持关键词筛选、低质内容筛选</div>
          <Button size="small" theme="primary" variant="text" onClick={() => navigate('/moment/list')}>
            去巡检
          </Button>
        </Card>
        <Card bordered className={styles.statCard}>
          <div className={styles.statLabel}>聊天治理</div>
          <div className={styles.statValue}>群组 / 消息</div>
          <div className={styles.statHint}>群组管理、消息检索与处置</div>
          <Button size="small" theme="primary" variant="text" onClick={() => navigate('/chat/messages')}>
            去检索
          </Button>
        </Card>
        <Card bordered className={styles.statCard}>
          <div className={styles.statLabel}>系统维护</div>
          <div className={styles.statValue}>配置 / 审计</div>
          <div className={styles.statHint}>系统配置、操作审计日志</div>
          <Button size="small" theme="primary" variant="text" onClick={() => navigate('/system/audit-logs')}>
            去审计
          </Button>
        </Card>
      </div>

      <div className="page-subsection">
        <div className="subsection-title">常用入口</div>
        <div className={styles.quickGrid}>
          <Button className={styles.quickBtn} theme="primary" onClick={() => navigate('/user/list')}>
            用户管理
          </Button>
          <Button className={styles.quickBtn} theme="default" variant="outline" onClick={() => navigate('/moment/list')}>
            动态巡检
          </Button>
          <Button className={styles.quickBtn} theme="default" variant="outline" onClick={() => navigate('/chat/groups')}>
            群组管理
          </Button>
          <Button className={styles.quickBtn} theme="default" variant="outline" onClick={() => navigate('/chat/friends')}>
            好友关系
          </Button>
          <Button
            className={styles.quickBtn}
            theme="default"
            variant="outline"
            onClick={() => navigate('/system/config')}
          >
            系统配置
          </Button>
          <Button
            className={styles.quickBtn}
            theme="default"
            variant="outline"
            onClick={() => navigate('/tools/api-explorer')}
          >
            API Explorer
          </Button>
        </div>
      </div>

      <div className="page-subsection">
        <div className="subsection-title">使用提示</div>
        <div className={styles.tips}>
          <div className={styles.tipItem}>
            <div className={styles.tipTitle}>统一列表页规范</div>
            <div className={styles.tipDesc}>页面默认使用 `PageContainer + ListToolbar + Table`，保证对齐与可复用。</div>
          </div>
          <div className={styles.tipItem}>
            <div className={styles.tipTitle}>快捷跳转</div>
            <div className={styles.tipDesc}>右上角输入关键词回车：动态 / 用户 / 群组 / 日志 / 配置。</div>
          </div>
          <div className={styles.tipItem}>
            <div className={styles.tipTitle}>权限一致性</div>
            <div className={styles.tipDesc}>菜单与路由守卫统一走权限函数，避免页面越权入口。</div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
