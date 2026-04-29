import { useEffect, useMemo, useState } from 'react';
import { SearchIcon } from 'tdesign-icons-react';
import { Button, Dialog, Form, Input } from 'tdesign-react';
import type { UploadFile } from 'tdesign-react';
import { changePassword, updateUser } from '../../api/modules/user';
import { useAuth } from '../../store/auth';
import commonStyles from '../../styles/common.module.less';
import { useApiMessage } from '../../hooks/useApiMessage';
import PageContainer from '../../components/PageContainer';
import ListToolbar from '../../components/ListToolbar';
import CaImageUpload from '../../components/CaImageUpload';
const { FormItem } = Form;

export default function ProfilePage() {
  const { userInfo, setLogin, token } = useAuth();
  const message = useApiMessage();
  // Upload 绑定字段使用 UploadFile[]，这里把头像 URL 转成单文件数组
  const buildAvatarFiles = (url?: string): UploadFile[] => {
    const resolved = String(url ?? '');
    if (!resolved) return [];
    return [
      {
        name: 'avatar',
        url: resolved,
        status: 'success',
      } as UploadFile,
    ];
  };
  // 提交时需要把 UploadFile[] 提取为后端需要的头像 URL
  const resolveAvatarUrl = (files?: UploadFile[]) => String(files?.[0]?.url ?? files?.[0]?.response?.url ?? '');
  // 个人资料初始值：用于首次渲染与重置
  const profileInitialData = useMemo(
    () => ({
      nickName: String(userInfo?.nickName ?? ''),
      avatar: buildAvatarFiles(userInfo?.avatar),
      intro: String(userInfo?.intro ?? ''),
      email: String(userInfo?.email ?? ''),
      gender: Number(userInfo?.gender ?? 1),
    }),
    [userInfo],
  );
  // 修改密码初始值：默认用户名回填当前登录用户
  const passwordInitialData = useMemo(
    () => ({
      userName: String(userInfo?.userName ?? ''),
      password: '',
      newPassword: '',
    }),
    [userInfo],
  );
  // FormItem 使用 name 后，字段值统一由 Form 实例管理
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [profileFormKey, setProfileFormKey] = useState(0);
  const [passwordFormKey, setPasswordFormKey] = useState(0);
  const [profileData, setProfileData] = useState(profileInitialData);
  const [passwordData, setPasswordData] = useState(passwordInitialData);
  // 头像字段用 UploadFile[]，用组件 state 保证类型稳定 + 可回显
  const [avatarFiles, setAvatarFiles] = useState<UploadFile[]>(profileInitialData.avatar);
  // 修改密码弹窗开关
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  // 顶部工具栏搜索关键词（用于快速触发常见操作）
  const [keyword, setKeyword] = useState('');

  // 用户主键（用于更新资料接口）
  const userId = useMemo(() => Number(userInfo?.id ?? 0), [userInfo?.id]);

  useEffect(() => {
    // userInfo 可能是异步加载；变化时回填表单，保证“回显”
    setProfileData(profileInitialData);
    setPasswordData(passwordInitialData);
    setAvatarFiles(profileInitialData.avatar);
    setProfileFormKey((prev) => prev + 1);
    setPasswordFormKey((prev) => prev + 1);
  }, [userInfo, profileInitialData, passwordInitialData]);

  // 更新资料：成功后刷新一次用户信息缓存（避免页面展示旧数据）
  const onUpdateProfile = async () => {
    if (!userId) {
      message.warning('当前用户ID无效');
      return;
    }
    const values = (profileForm?.getFieldsValue?.(true) ?? {}) as typeof profileInitialData;
    try {
      const payload = {
        ...values,
        // 接口需要 string，这里把 UploadFile[] 转成 url
        avatar: resolveAvatarUrl(values.avatar),
      };
      await updateUser(userId, payload);
      message.success('资料更新成功');
      if (token) {
        await setLogin(token);
      }
    } catch (error) {
      message.error(error, '资料更新失败');
    }
  };

  // 修改密码：成功后关闭弹窗并清空输入
  const onChangePassword = async () => {
    const values = (passwordForm?.getFieldsValue?.(true) ?? {}) as typeof passwordInitialData;
    try {
      await changePassword(values);
      message.success('密码修改成功');
      const nextPasswordData = { ...passwordInitialData, password: '', newPassword: '' };
      setPasswordData(nextPasswordData);
      setPasswordFormKey((prev) => prev + 1);
      setShowPasswordDialog(false);
    } catch (error) {
      message.error(error, '密码修改失败');
    }
  };

  return (
    <PageContainer>
      <ListToolbar
        left={
        <>
          <Button theme="warning" onClick={() => setShowPasswordDialog(true)}>
            修改密码
          </Button>
          <Button
            theme="default"
            variant="outline"
            onClick={() => {
              setProfileData(profileInitialData);
              setProfileFormKey((prev) => prev + 1);
            }}
          >
            重置表单
          </Button>
          <span className={commonStyles.selectedInfo}>当前为个人中心资料维护</span>
        </>
        }
        right={
        <Input
          className={commonStyles.search}
          value={keyword}
          onChange={setKeyword}
          placeholder="输入“密码”可快速打开修改密码"
          suffixIcon={<SearchIcon />}
          clearable
          onEnter={() => {
            if (keyword.includes('密码')) {
              setShowPasswordDialog(true);
            }
          }}
        />
        }
      />

      <div className="page-subsection">
        <div className="subsection-title">个人资料更新</div>
        <div
          className="profile-form-centered"
        >
          <Form
            key={profileFormKey}
            layout="vertical"
            labelAlign="left"
            className="ca-form-row"
            style={{ '--ca-form-label-width': '160px' } as React.CSSProperties}
            form={profileForm}
            initialData={profileData}
          >
            <FormItem label="昵称" name="nickName">
              <Input />
            </FormItem>
            <FormItem label="邮箱" name="email">
              <Input />
            </FormItem>
            <FormItem label="简介" name="intro">
              <Input />
            </FormItem>
            <FormItem label="头像（上传后自动更新）" name="avatar">
              <CaImageUpload
                value={avatarFiles}
                onChange={(nextValue) => {
                  setAvatarFiles(nextValue);
                  profileForm?.setFieldsValue?.({ avatar: nextValue });
                }}
              />
            </FormItem>
            <FormItem>
              <Button block theme="primary" onClick={() => onUpdateProfile().catch(() => undefined)}>
                更新资料
              </Button>
            </FormItem>
          </Form>
        </div>
      </div>

      <Dialog
        header="修改密码"
        visible={showPasswordDialog}
        onClose={() => setShowPasswordDialog(false)}
        onConfirm={onChangePassword}
      >
        <Form
          key={passwordFormKey}
          layout="vertical"
          labelAlign="left"
          className="ca-form-row"
          style={{ '--ca-form-label-width': '90px' } as React.CSSProperties}
          form={passwordForm}
          initialData={passwordData}
        >
          <FormItem label="用户名" name="userName">
            <Input placeholder="用户名" />
          </FormItem>
          <FormItem label="旧密码" name="password">
            <Input type="password" placeholder="旧密码" />
          </FormItem>
          <FormItem label="新密码" name="newPassword">
            <Input type="password" placeholder="新密码" />
          </FormItem>
        </Form>
      </Dialog>
    </PageContainer>
  );
}
