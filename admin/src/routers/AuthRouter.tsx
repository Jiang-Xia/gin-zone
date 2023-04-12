import { useEffect } from 'react';
// import { useSelector } from 'react-redux';
import { matchRoutes, useLocation, useNavigate } from 'react-router-dom';
import { rootRouter } from './index';

import { AxiosCanceler } from '@/api/helper/axiosCancel';
// import { searchRoute } from '@/utils/util';
import { connect } from 'react-redux';

const axiosCanceler = new AxiosCanceler();
/**
 * @description 路由守卫组件
 * */
const AuthRoute = ({ children, auth, userInfo, token }: any) => {
  const navigate = useNavigate();
  const location = useLocation();
  //   const loginState = useSelector((state: any) => state.public.loginState);
  const mathchs = matchRoutes(rootRouter, location);
  const isExist = mathchs?.some(item => item.pathname === location.pathname);
  useEffect(() => {
    // navigate(location.pathname);
    // 会取消一些请求，造成不确定性
    // axiosCanceler.removeAllPending();
    console.log('当前路径：', location.pathname);
    if (token === '' && isExist) {
      navigate('/login');
    }
    // 这里判断条件是：token 存在并且是匹配到路由并且是已经登录的状态
    if (token && isExist) {
      // 如果你已经登录了，但是你通过浏览器里直接访问login的话不允许直接跳转到login路由，必须通过logout来控制退出登录或者是token过期返回登录界面
      if (location.pathname === '/' || location.pathname === '/login') {
        navigate('/welcome');
      } else {
        // 如果是其他路由就跳到其他的路由
        navigate(location.pathname);
      }
    }
  }, [token, location.pathname, isExist, auth, navigate, userInfo]);

  return children;
};
function mapStateToProps(state: any) {
  const { userInfo, token } = state.global;
  return { userInfo, token };
}
export default connect(mapStateToProps)(AuthRoute);
