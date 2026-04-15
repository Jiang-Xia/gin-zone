import { FormEvent, useMemo, useState } from 'react';
import { SearchIcon } from 'tdesign-icons-react';
import { Button, Dialog, Input, Upload } from 'tdesign-react';
import type { UploadFile } from 'tdesign-react';
import { changePassword, updateUser } from '../../api/modules/user';
import { useAuth } from '../../store/auth';
import { uploadFile } from '../../api/modules/base';
import commonStyles from '../../styles/common.module.less';
import { useApiMessage } from '../../hooks/useApiMessage';
import PageContainer from '../../components/PageContainer';
import ListToolbar from '../../components/ListToolbar';

export default function ProfilePage() {
  const { userInfo, setLogin, token } = useAuth();
  const message = useApiMessage();
  // 个人资料表单：初始化来自用户信息（为空时兜底为默认值）
  const [profile, setProfile] = useState({
    nickName: String(userInfo?.nickName ?? ''),
    avatar: String(userInfo?.avatar ?? ''),
    intro: String(userInfo?.intro ?? ''),
    email: String(userInfo?.email ?? ''),
    gender: Number(userInfo?.gender ?? 1),
  });
  // 修改密码表单
  const [passwordForm, setPasswordForm] = useState({
    userName: String(userInfo?.userName ?? ''),
    password: '',
    newPassword: '',
  });
  // 修改密码弹窗开关
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  // 顶部工具栏搜索关键词（用于快速触发常见操作）
  const [keyword, setKeyword] = useState('');

  // 用户主键（用于更新资料接口）
  const userId = useMemo(() => Number(userInfo?.id ?? 0), [userInfo?.id]);

  // 更新资料：成功后刷新一次用户信息缓存（避免页面展示旧数据）
  const onUpdateProfile = async (event: FormEvent) => {
    event.preventDefault();
    if (!userId) {
      message.warning('当前用户ID无效');
      return;
    }
    try {
      await updateUser(userId, profile);
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
    try {
      await changePassword(passwordForm);
      message.success('密码修改成功');
      setPasswordForm((prev) => ({ ...prev, password: '', newPassword: '' }));
      setShowPasswordDialog(false);
    } catch (error) {
      message.error(error, '密码修改失败');
    }
  };

  // 上传头像：走上传接口拿到 url，再回填到 profile.avatar
  const onUploadAvatar = async (file: File) => {
    try {
      const res = await uploadFile(file);
      if (res?.url) {
        setProfile((prev) => ({ ...prev, avatar: res.url }));
        message.success('上传成功');
      } else {
        message.error(null, '上传失败');
      }
    } catch (error) {
      message.error(error, '上传失败');
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
            onClick={() =>
              setProfile({
                nickName: String(userInfo?.nickName ?? ''),
                avatar: String(userInfo?.avatar ?? ''),
                intro: String(userInfo?.intro ?? ''),
                email: String(userInfo?.email ?? ''),
                gender: Number(userInfo?.gender ?? 1),
              })
            }
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
        <form className="form-grid profile-form-centered" onSubmit={onUpdateProfile}>
          <Input value={profile.nickName} onChange={value => setProfile(prev => ({ ...prev, nickName: value }))} placeholder="昵称" />
          <Input value={profile.email} onChange={value => setProfile(prev => ({ ...prev, email: value }))} placeholder="邮箱" />
          <Input value={profile.intro} onChange={value => setProfile(prev => ({ ...prev, intro: value }))} placeholder="简介" />
          <Input value={profile.avatar} onChange={value => setProfile(prev => ({ ...prev, avatar: value }))} placeholder="头像URL" />
          <Upload
            theme="image"
            accept="image/*"
            autoUpload={false}
            abridgeName={[6, 6]}
            onSelectChange={async (files: UploadFile | UploadFile[]) => {
              // Upload 组件只负责选择文件，这里手动拿 raw File 调用接口上传
              const current = Array.isArray(files) ? files[0]?.raw : files?.raw;
              if (current instanceof File) {
                await onUploadAvatar(current);
              }
            }}
          />
          <Button type="submit" theme="primary">
            更新资料
          </Button>
        </form>
      </div>

      <Dialog
        header="修改密码"
        visible={showPasswordDialog}
        onClose={() => setShowPasswordDialog(false)}
        onConfirm={onChangePassword}
      >
        <div className="form-grid">
          <Input
            value={passwordForm.userName}
            onChange={value => setPasswordForm(prev => ({ ...prev, userName: value }))}
            placeholder="用户名"
          />
          <Input
            type="password"
            value={passwordForm.password}
            onChange={value => setPasswordForm(prev => ({ ...prev, password: value }))}
            placeholder="旧密码"
          />
          <Input
            type="password"
            value={passwordForm.newPassword}
            onChange={value => setPasswordForm(prev => ({ ...prev, newPassword: value }))}
            placeholder="新密码"
          />
        </div>
      </Dialog>
    </PageContainer>
  );
}
