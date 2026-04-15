import { FormEvent, useState } from 'react';
import { Button, Card, Input, MessagePlugin, Tabs } from 'tdesign-react';
import { HelpCircleIcon, LogoGithubIcon, SettingIcon } from 'tdesign-icons-react';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { loginApi } from '../../api/modules/user';
import { useAuth } from '../../store/auth';
import styles from './index.module.less';

// 登录方式：账号密码 / 手机号验证码
type LoginType = 'account' | 'phone';

export default function LoginPage() {
  const navigate = useNavigate();
  // setLogin：保存 token + 拉取用户信息并落地到本地缓存
  const { setLogin } = useAuth();
  // 当前 tab 的登录方式
  const [loginType, setLoginType] = useState<LoginType>('account');
  // 账号密码表单
  const [account, setAccount] = useState({ userName: '', password: '' });
  // 手机号验证码表单（示例用，后端若不支持可按需移除）
  const [phone, setPhone] = useState({ mobile: '', captcha: '' });
  // 控制按钮 loading，避免重复提交
  const [loading, setLoading] = useState(false);

  // 表单提交：根据登录方式拼 payload，成功后写入 token 并跳转
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload =
      loginType === 'account'
        ? { userName: account.userName, password: account.password }
        : { mobile: phone.mobile, captcha: phone.captcha };

    setLoading(true);
    try {
      const res = await loginApi(payload);
      if (res?.token) {
        await setLogin(res.token);
        MessagePlugin.success('登录成功');
        navigate('/welcome');
        return;
      }
      MessagePlugin.error('登录失败');
    } catch (error) {
      // 统一兜底错误信息，避免直接渲染非 Error 对象
      MessagePlugin.error(error instanceof Error ? error.message : '登录失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <header className={styles.header}>
        <h2>Zone Admin</h2>
        <div className={styles.headerActions}>
          <Button variant="text" shape="square" icon={<LogoGithubIcon />} />
          <Button variant="text" shape="square" icon={<HelpCircleIcon />} />
          <Button variant="text" shape="square" icon={<SettingIcon />} />
        </div>
      </header>

      <div className={styles.container}>
        <div className={styles.brand}>
          <h1>登录到</h1>
          <h1>TDesign Admin Console</h1>
          <p>统一管理用户、动态内容和基础服务配置。</p>
          <p>当前时间：{dayjs().format('YYYY-MM-DD HH:mm:ss')}</p>
        </div>

        <Card className={styles.card} title="账号登录" bordered>
          <form onSubmit={submit} className={styles.form}>
            <Tabs
              value={loginType}
              onChange={value => setLoginType(value as LoginType)}
              list={[
                { label: '账号密码登录', value: 'account' },
                { label: '手机号登录', value: 'phone' },
              ]}
            />

            {loginType === 'account' ? (
              <>
                <Input
                  placeholder="请输入用户名，例如：admin"
                  value={account.userName}
                  onChange={value => setAccount(prev => ({ ...prev, userName: value }))}
                  clearable
                />
                <Input
                  type="password"
                  placeholder="请输入密码，例如：123456"
                  value={account.password}
                  onChange={value => setAccount(prev => ({ ...prev, password: value }))}
                  clearable
                />
              </>
            ) : (
              <>
                <Input
                  placeholder="请输入手机号"
                  value={phone.mobile}
                  onChange={value => setPhone(prev => ({ ...prev, mobile: value }))}
                  clearable
                />
                <Input
                  placeholder="请输入验证码（测试可填 1234）"
                  value={phone.captcha}
                  onChange={value => setPhone(prev => ({ ...prev, captcha: value }))}
                  clearable
                />
              </>
            )}

            <Button type="submit" theme="primary" loading={loading} block>
              登录
            </Button>
          </form>
        </Card>
      </div>

      <footer className={styles.footer}>Copyright @ 2021-{new Date().getFullYear()} Tencent. All Rights Reserved</footer>
    </div>
  );
}
