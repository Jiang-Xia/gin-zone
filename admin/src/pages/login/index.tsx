import { LockOutlined, MobileOutlined, UserOutlined } from '@ant-design/icons';
import { LoginForm, ProFormCaptcha, ProFormCheckbox, ProFormText, ProConfigProvider } from '@ant-design/pro-components';
import { message, Space, Tabs } from 'antd';
import type { CSSProperties } from 'react';
import { useState } from 'react';
import dayjs from 'dayjs';
import { loginApi } from '@/api/modules/user';
import { useNavigate } from 'react-router-dom';
import { setToken, setUserInfo } from '@/redux/modules/global/action';
import { HOME_URL } from '@/config/config';
import { connect } from 'react-redux';
type LoginType = 'phone' | 'account';

const iconStyles: CSSProperties = {
  marginInlineStart: '16px',
  color: 'rgba(0, 0, 0, 0.2)',
  fontSize: '24px',
  verticalAlign: 'middle',
  cursor: 'pointer',
};
const now = () => dayjs().format('YYYY年M月DD日 HH:mm:ss');
const LoginPage = (props: any) => {
  const [loginType, setLoginType] = useState<LoginType>('account');
  const [nowTime, setNowtime] = useState(now());
  setInterval(() => {
    setNowtime(now());
  }, 1000);
  const navigate = useNavigate();
  const handleLogin = async (values: any) => {
    try {
      const res = await loginApi(values);
      const { setToken, setUserInfo } = props;
      if (res.code === 0) {
        setToken(res.data.token);
        message.success('登录成功');
        setUserInfo();
        navigate(HOME_URL);
      } else {
        message.error(res.msg);
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <ProConfigProvider>
        <LoginForm
          logo="/logo512.png"
          title="Zone admin"
          subTitle="Zone 后台管理系统"
          onFinish={handleLogin}
          actions={
            <Space align="center" direction="vertical" style={{ width: '100%', color: '#999' }}>
              {nowTime}
            </Space>
          }
        >
          <Tabs
            centered
            activeKey={loginType}
            onChange={activeKey => setLoginType(activeKey as LoginType)}
            items={[
              {
                key: 'account',
                label: '账号密码登录',
                children: (
                  <>
                    <ProFormText
                      name="userName"
                      fieldProps={{
                        size: 'large',
                        prefix: <UserOutlined className={'prefixIcon'} />,
                      }}
                      placeholder={'请输入用户名 列如:admin'}
                      rules={[
                        {
                          required: true,
                          message: '请输入用户名!',
                        },
                      ]}
                    />
                    <ProFormText.Password
                      name="password"
                      fieldProps={{
                        size: 'large',
                        prefix: <LockOutlined className={'prefixIcon'} />,
                      }}
                      placeholder={'请输入密码 列如:123456'}
                      rules={[
                        {
                          required: true,
                          message: '请输入密码！',
                        },
                      ]}
                    />
                  </>
                ),
              },
              {
                key: 'phone',
                label: '手机号登录',
                children: (
                  <>
                    <ProFormText
                      fieldProps={{
                        size: 'large',
                        prefix: <MobileOutlined className={'prefixIcon'} />,
                      }}
                      name="mobile"
                      placeholder={'手机号'}
                      rules={[
                        {
                          required: true,
                          message: '请输入手机号！',
                        },
                        {
                          pattern: /^1\d{10}$/,
                          message: '手机号格式错误！',
                        },
                      ]}
                    />
                    <ProFormCaptcha
                      fieldProps={{
                        size: 'large',
                        prefix: <LockOutlined className={'prefixIcon'} />,
                      }}
                      captchaProps={{
                        size: 'large',
                      }}
                      placeholder={'请输入验证码'}
                      captchaTextRender={(timing, count) => {
                        if (timing) {
                          return `${count} ${'获取验证码'}`;
                        }
                        return '获取验证码';
                      }}
                      name="captcha"
                      rules={[
                        {
                          required: true,
                          message: '请输入验证码！',
                        },
                      ]}
                      onGetCaptcha={async () => {
                        message.success('获取验证码成功！验证码为：1234');
                      }}
                    />
                  </>
                ),
              },
            ]}
          />

          <div
            style={{
              marginBlockEnd: 24,
            }}
          >
            <ProFormCheckbox noStyle name="autoLogin">
              自动登录
            </ProFormCheckbox>
            <a
              style={{
                float: 'right',
              }}
              href="/"
            >
              忘记密码
            </a>
          </div>
        </LoginForm>
      </ProConfigProvider>
    </>
  );
};
const mapDispatchToProps = { setToken, setUserInfo };
export default connect(null, mapDispatchToProps)(LoginPage);
