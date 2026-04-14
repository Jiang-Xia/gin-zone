import { FormEvent, useMemo, useState } from 'react';
import { Button, Dialog, Input, MessagePlugin, Upload } from 'tdesign-react';
import type { UploadFile } from 'tdesign-react';
import { changePassword, updateUser } from '../../api/modules/user';
import { useAuth } from '../../store/auth';
import { uploadFile } from '../../api/modules/base';

export default function ProfilePage() {
  const { userInfo, setLogin, token } = useAuth();
  const [profile, setProfile] = useState({
    nickName: String(userInfo?.nickName ?? ''),
    avatar: String(userInfo?.avatar ?? ''),
    intro: String(userInfo?.intro ?? ''),
    email: String(userInfo?.email ?? ''),
    gender: Number(userInfo?.gender ?? 1),
  });
  const [passwordForm, setPasswordForm] = useState({
    userName: String(userInfo?.userName ?? ''),
    password: '',
    newPassword: '',
  });
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  const userId = useMemo(() => Number(userInfo?.id ?? 0), [userInfo?.id]);

  const onUpdateProfile = async (event: FormEvent) => {
    event.preventDefault();
    if (!userId) {
      MessagePlugin.warning('当前用户ID无效');
      return;
    }
    try {
      await updateUser(userId, profile);
      MessagePlugin.success('资料更新成功');
      if (token) {
        await setLogin(token);
      }
    } catch (error) {
      MessagePlugin.error(error instanceof Error ? error.message : '资料更新失败');
    }
  };

  const onChangePassword = async () => {
    try {
      await changePassword(passwordForm);
      MessagePlugin.success('密码修改成功');
      setPasswordForm((prev) => ({ ...prev, password: '', newPassword: '' }));
      setShowPasswordDialog(false);
    } catch (error) {
      MessagePlugin.error(error instanceof Error ? error.message : '密码修改失败');
    }
  };

  const onUploadAvatar = async (file: File) => {
    try {
      const res = await uploadFile(file);
      if (res?.url) {
        setProfile((prev) => ({ ...prev, avatar: res.url }));
        MessagePlugin.success('上传成功');
      } else {
        MessagePlugin.error('上传失败');
      }
    } catch (error) {
      MessagePlugin.error(error instanceof Error ? error.message : '上传失败');
    }
  };

  return (
    <div className="list-page">
      <div className="list-toolbar">
        <div className="list-toolbar-left">
          <Button theme="warning" onClick={() => setShowPasswordDialog(true)}>
            修改密码
          </Button>
        </div>
      </div>

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
    </div>
  );
}
