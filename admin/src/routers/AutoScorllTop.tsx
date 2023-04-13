import { useLayoutEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
/* 路由切换滚动条置顶 */
const AutoScorllTop = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  useLayoutEffect(() => {
    document.documentElement.scrollTo(0, 0);
  }, [location.pathname]);
  return <>{children}</>;
};

export default AutoScorllTop;
