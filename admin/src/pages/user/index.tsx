import { useState } from 'react';
import { Avatar, Button, Dialog, Input, Popconfirm, Select, Table } from 'tdesign-react';
import { SearchIcon } from 'tdesign-icons-react';
import {
  deleteUser,
  getAdminUserDetail,
  getAdminUserList,
  registerUser,
  restrictAdminUser,
} from '../../api/modules/user';
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
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<number>(-1);
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailUser, setDetailUser] = useState<UserInfo | null>(null);
  // 中文注释：当前正在切换启用/禁用状态的行 uid，用于按钮 loading/disabled
  const [togglingUid, setTogglingUid] = useState<string>('');
  // 列表页公共状态：统一管理 loading/list/total 和刷新逻辑
  const { query, list: users, loading, total, reload } = useListPage<
    UserInfo,
    { page: number; pageSize: number; keyword: string; status: number }
  >({
    initialQuery: { page: 1, pageSize: 20, keyword: '', status: -1 },
    request: async (query) => {
      try {
        return await getAdminUserList(query);
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

  const onViewDetail = async (uid?: string) => {
    if (!uid) return;
    try {
      const detail = await getAdminUserDetail(uid);
      setDetailUser(detail);
      setDetailVisible(true);
    } catch (error) {
      message.error(error, '获取用户详情失败');
    }
  };

  const onToggleUserStatus = async (user: UserInfo) => {
    const uid = String(user?.userId || '').trim();
    if (!uid) return;
    const nextIsLock = !Boolean(user.isLock);
    try {
      setTogglingUid(uid);
      await restrictAdminUser(uid, { isLock: nextIsLock });
      message.success(nextIsLock ? '封禁成功' : '解封成功');
      await reload();
    } catch (error) {
      message.error(error, nextIsLock ? '封禁失败' : '解封失败');
    } finally {
      setTogglingUid('');
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
    {
      colKey: 'avatar',
      title: '头像',
      width: 100,
      cell: ({ row }: { row: UserInfo }) => <Avatar size="small" image={String(row.avatar ?? '')} />,
    },
    { colKey: 'userName', title: '用户名', width: 180, cell: ({ row }: { row: UserInfo }) => row.userName || '-' },
    { colKey: 'nickName', title: '昵称', width: 180, cell: ({ row }: { row: UserInfo }) => row.nickName || '-' },
    { colKey: 'email', title: '邮箱', cell: ({ row }: { row: UserInfo }) => row.email || '-' },
    {
      colKey: 'isLock',
      title: '状态',
      width: 100,
      cell: ({ row }: { row: UserInfo }) => (row.isLock ? '已封禁' : '正常'),
    },
    {
      colKey: 'operation',
      title: '操作',
      width: 260,
      fixed: 'right' as const,
      cell: ({ row }: { row: UserInfo }) => (
        <>
          <Button size="small" theme="primary" variant="text" onClick={() => onViewDetail(row.userId)}>
            详情
          </Button>
          <Popconfirm
            content={row.isLock ? '确认解封该用户吗？' : '确认封禁该用户吗？'}
            onConfirm={() => onToggleUserStatus(row)}
          >
            <Button
              size="small"
              theme="warning"
              variant="text"
              loading={togglingUid === String(row.userId || '')}
              disabled={togglingUid === String(row.userId || '')}
            >
              {row.isLock ? '解封' : '封禁'}
            </Button>
          </Popconfirm>
          <Popconfirm content="确认删除该用户吗？" onConfirm={() => onDelete(Number(row.id))}>
            <Button size="small" theme="danger" variant="text">
              删除
            </Button>
          </Popconfirm>
        </>
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
          <Button theme="default" variant="outline" onClick={() => reload({ page: 1, keyword, status })}>
            刷新列表
          </Button>
          <span className={commonStyles.selectedInfo}>共 {total} 项</span>
        </>
        }
        right={
        <>
          <Input
            className={commonStyles.search}
            value={keyword}
            onChange={setKeyword}
            placeholder="请输入用户名/昵称/UID"
            suffixIcon={<SearchIcon />}
            clearable
            onEnter={() => reload({ page: 1, keyword, status })}
          />
          <Select
            style={{ width: 120, marginLeft: 8 }}
            value={status}
            options={[
              { label: '全部状态', value: -1 },
              { label: '正常', value: 0 },
              { label: '封禁', value: 1 },
            ]}
            onChange={(value) => {
              const next = Number(value);
              setStatus(next);
              void reload({ page: 1, status: next, keyword });
            }}
          />
        </>
        }
      />
      <Table
        rowKey="id"
        data={users}
        columns={columns}
        loading={loading}
        hover
        bordered
        stripe
        pagination={{
          current: query.page,
          pageSize: query.pageSize,
          total,
          onCurrentChange: (page) => reload({ page }),
          onPageSizeChange: (pageSize) => reload({ page: 1, pageSize }),
        }}
      />

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

      <Dialog header="用户详情" visible={detailVisible} footer={false} onClose={() => setDetailVisible(false)}>
        <div className="form-grid">
          <div>UID：{detailUser?.userId || '-'}</div>
          <div>用户名：{detailUser?.userName || '-'}</div>
          <div>昵称：{detailUser?.nickName || '-'}</div>
          <div>邮箱：{detailUser?.email || '-'}</div>
          <div>状态：{detailUser?.isLock ? '已封禁' : '正常'}</div>
          <div>简介：{String(detailUser?.intro || '-')}</div>
        </div>
      </Dialog>
    </PageContainer>
  );
}
