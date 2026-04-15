import { useState } from 'react';
import { Button, Dialog, Input, Popconfirm, Table } from 'tdesign-react';
import { SearchIcon } from 'tdesign-icons-react';
import { deleteUser, getUserList, registerUser } from '../../api/modules/user';
import type { UserInfo } from '../../store/auth';
import commonStyles from '../../styles/common.module.less';
import { useListPage } from '../../hooks/useListPage';
import { useDialogForm } from '../../hooks/useDialogForm';
import { useApiMessage } from '../../hooks/useApiMessage';
import PageContainer from '../../components/PageContainer';
import ListToolbar from '../../components/ListToolbar';

export default function UserManagePage() {
  const message = useApiMessage();
  // 搜索关键字（后端接口使用 q 进行模糊查询）
  const [q, setQ] = useState('');
  // 列表页公共状态：统一管理 loading/list/total 和刷新逻辑
  const { list: users, loading, total, reload } = useListPage<UserInfo, { q: string }>({
    initialQuery: { q: '' },
    request: async (query) => {
      try {
        return await getUserList(query.q);
      } catch (error) {
        message.error(error, '获取用户列表失败');
        return { list: [], total: 0 };
      }
    },
  });
  // 新增用户弹窗表单：统一管理弹窗显隐与表单重置
  const {
    visible: showCreateDialog,
    form: registerForm,
    setForm: setRegisterForm,
    openDialog: openCreateDialog,
    closeDialog: closeCreateDialog,
    resetForm: resetCreateForm,
  } = useDialogForm({
    initialValues: {
      userName: '',
      password: '',
      nickName: '',
      email: '',
    },
  });

  // 新增用户：校验必填项后调用注册接口
  const onRegister = async () => {
    if (!registerForm.userName || !registerForm.password) {
      message.warning('用户名和密码必填');
      return;
    }
    try {
      await registerUser({
        ...registerForm,
        gender: 1,
      });
      message.success('新增用户成功');
      resetCreateForm();
      closeCreateDialog(false);
      await reload();
    } catch (error) {
      message.error(error, '新增用户失败');
    }
  };

  // 删除用户：走 Popconfirm 二次确认
  const onDelete = async (id: number) => {
    try {
      await deleteUser(id);
      message.success('删除成功');
      await reload();
    } catch (error) {
      message.error(error, '删除失败');
    }
  };

  const columns = [
    { colKey: 'id', title: 'ID', width: 90 },
    { colKey: 'userName', title: '用户名', width: 180, cell: ({ row }: { row: UserInfo }) => row.userName || '-' },
    { colKey: 'nickName', title: '昵称', width: 180, cell: ({ row }: { row: UserInfo }) => row.nickName || '-' },
    { colKey: 'email', title: '邮箱', cell: ({ row }: { row: UserInfo }) => row.email || '-' },
    {
      colKey: 'operation',
      title: '操作',
      width: 120,
      cell: ({ row }: { row: UserInfo }) => (
        // 删除操作单独使用确认弹窗，避免误删
        <Popconfirm content="确认删除该用户吗？" onConfirm={() => onDelete(Number(row.id))}>
          <Button size="small" theme="danger" variant="text">
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <PageContainer>
      <ListToolbar
        left={
        <>
          <Button theme="primary" onClick={() => openCreateDialog()}>
            新增用户
          </Button>
          <Button theme="default" variant="outline" onClick={() => reload({ q })}>
            刷新列表
          </Button>
          <span className={commonStyles.selectedInfo}>共 {total} 项</span>
        </>
        }
        right={
        <Input
          className={commonStyles.search}
          value={q}
          onChange={setQ}
          placeholder="请输入你需要搜索的用户名"
          suffixIcon={<SearchIcon />}
          clearable
          onEnter={() => reload({ q })}
        />
        }
      />
      <Table rowKey="id" data={users} columns={columns} loading={loading} hover bordered stripe />

      <Dialog
        header="新增用户"
        visible={showCreateDialog}
        onClose={() => closeCreateDialog()}
        onConfirm={onRegister}
      >
        <div className="form-grid inline-form">
          <Input
            placeholder="用户名（4-12）"
            value={registerForm.userName}
            onChange={value => setRegisterForm(prev => ({ ...prev, userName: value }))}
          />
          <Input
            type="password"
            placeholder="密码（6-16）"
            value={registerForm.password}
            onChange={value => setRegisterForm(prev => ({ ...prev, password: value }))}
          />
          <Input
            placeholder="昵称"
            value={registerForm.nickName}
            onChange={value => setRegisterForm(prev => ({ ...prev, nickName: value }))}
          />
          <Input
            placeholder="邮箱"
            value={registerForm.email}
            onChange={value => setRegisterForm(prev => ({ ...prev, email: value }))}
          />
        </div>
      </Dialog>
    </PageContainer>
  );
}
