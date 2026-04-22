import type { ReactNode } from 'react';
import commonStyles from '../../styles/common.module.less';

interface ListToolbarProps {
  // 左侧操作区：按钮、统计等
  left?: ReactNode;
  // 右侧操作区：搜索、筛选等
  right?: ReactNode;
  // 工具栏容器样式（可按页面覆盖）
  className?: string;
  // 左侧区域样式（可按页面覆盖）
  leftClassName?: string;
  // 右侧区域样式（可按页面覆盖）
  rightClassName?: string;
}

export default function ListToolbar({
  left,
  right,
  className,
  leftClassName,
  rightClassName,
}: ListToolbarProps) {
  // 默认使用 common 样式，允许页面按需覆盖（如 moment 的 module.less）
  const rootClassName = className ?? commonStyles.toolbar;
  const leftRootClassName = leftClassName ?? commonStyles.toolbarLeft;
  const rightRootClassName = rightClassName ?? commonStyles.toolbarRight;

  return (
    <div className={rootClassName}>
      <div className={leftRootClassName}>{left}</div>
      {right ? <div className={rightRootClassName}>{right}</div> : null}
    </div>
  );
}
