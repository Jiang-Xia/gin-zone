import { useEffect, useState } from 'react';
import { Button, Dialog, Input, MessagePlugin, Popconfirm, Table } from 'tdesign-react';
import { SearchIcon } from 'tdesign-icons-react';
import { deleteUser, getUserList, registerUser } from '../../api/modules/user';
import type { UserInfo } from '../../store/auth';

export default function UserManagePage() {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [registerForm, setRegisterForm] = useState({
    userName: '',
    password: '',
    nickName: '',
    email: '',
  });
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const fetchUsers = async (keyword = q) => {
    setLoading(true);
    try {
      const res = await getUserList(keyword);
      setUsers(res?.list ?? []);
    } catch (error) {
      MessagePlugin.error(error instanceof Error ? error.message : '获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRegister = async () => {
    if (!registerForm.userName || !registerForm.password) {
      MessagePlugin.warning('用户名和密码必填');
      return;
    }
    try {
      await registerUser({
        ...registerForm,
        gender: 1,
      });
      MessagePlugin.success('新增用户成功');
      setRegisterForm({ userName: '', password: '', nickName: '', email: '' });
      setShowCreateDialog(false);
      fetchUsers();
    } catch (error) {
      MessagePlugin.error(error instanceof Error ? error.message : '新增用户失败');
    }
  };

  const onDelete = async (id: number) => {
    try {
      await deleteUser(id);
      MessagePlugin.success('删除成功');
      fetchUsers();
    } catch (error) {
      MessagePlugin.error(error instanceof Error ? error.message : '删除失败');
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
        <Popconfirm content="确认删除该用户吗？" onConfirm={() => onDelete(Number(row.id))}>
          <Button size="small" theme="danger" variant="text">
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="list-page">
      <div className="list-toolbar">
        <div className="list-toolbar-left">
          <Button theme="primary" onClick={() => setShowCreateDialog(true)}>
            新增用户
          </Button>
          <Button theme="primary" onClick={() => fetchUsers()}>
            刷新列表
          </Button>
          <span className="selected-info">共 {users.length} 项</span>
        </div>
        <Input
          className="list-search"
          value={q}
          onChange={setQ}
          placeholder="请输入你需要搜索的用户名"
          suffixIcon={<SearchIcon />}
          clearable
          onEnter={() => fetchUsers(q)}
        />
      </div>
      <Table rowKey="id" data={users} columns={columns} loading={loading} hover bordered stripe />

      <Dialog
        header="新增用户"
        visible={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
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
    </div>
  );
}
