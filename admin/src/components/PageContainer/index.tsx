import type { PropsWithChildren } from 'react';
import commonStyles from '../../styles/common.module.less';

// 页面容器：统一列表页基础布局（工具栏由 ListToolbar 组合）
export default function PageContainer({ children }: PropsWithChildren) {
  return (
    <div className={commonStyles.listPage}>
      {children}
    </div>
  );
}
