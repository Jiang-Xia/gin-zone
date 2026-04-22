import { useState } from 'react';
import { Avatar, Button, Input, Popconfirm, Table } from 'tdesign-react';
import { SearchIcon } from 'tdesign-icons-react';
import PageContainer from '../../components/PageContainer';
import ListToolbar from '../../components/ListToolbar';
import commonStyles from '../../styles/common.module.less';
import { useApiMessage } from '../../hooks/useApiMessage';
import { useListPage } from '../../hooks/useListPage';
import { deleteAdminChatFriendRelation, getAdminChatFriends, type AdminChatFriendRow } from '../../api/modules/chatAdmin';

export default function ChatFriendsManagePage() {
  const message = useApiMessage();
  const [userId, setUserId] = useState('');
  const [friendId, setFriendId] = useState('');
  const [groupId, setGroupId] = useState('');

  const { query, list, total, loading, reload } = useListPage<
    AdminChatFriendRow,
    { page: number; pageSize: number; userId: string; friendId: string; groupId: string }
  >({
    initialQuery: { page: 1, pageSize: 20, userId: '', friendId: '', groupId: '' },
    request: async (query) => {
      try {
        const res = await getAdminChatFriends({
          page: query.page,
          pageSize: query.pageSize,
          userId: query.userId || undefined,
          friendId: query.friendId || undefined,
          groupId: Number(query.groupId || 0) || undefined,
        });
        return { list: res.list ?? [], total: res.total ?? 0 };
      } catch (error) {
        message.error(error, '获取关系列表失败');
        return { list: [], total: 0 };
      }
    },
  });

  const onDelete = async (id: number) => {
    try {
      await deleteAdminChatFriendRelation(id);
      message.success('删除成功');
      await reload();
    } catch (error) {
      message.error(error, '删除失败');
    }
  };

  const columns = [
    { colKey: 'id', title: 'ID', width: 90 },
    { colKey: 'userId', title: 'userId', width: 180 },
    {
      colKey: 'userAvatar',
      title: '用户头像',
      width: 100,
      cell: ({ row }: { row: AdminChatFriendRow }) => <Avatar size="small" image={row.userAvatar} />,
    },
    { colKey: 'userNickName', title: '用户昵称', width: 140, cell: ({ row }: { row: AdminChatFriendRow }) => row.userNickName || '-' },
    { colKey: 'friendId', title: 'friendId', width: 180, cell: ({ row }: { row: AdminChatFriendRow }) => row.friendId || '-' },
    {
      colKey: 'friendAvatar',
      title: '好友头像',
      width: 100,
      cell: ({ row }: { row: AdminChatFriendRow }) => <Avatar size="small" image={row.friendAvatar} />,
    },
    { colKey: 'friendNickName', title: '好友昵称', width: 140, cell: ({ row }: { row: AdminChatFriendRow }) => row.friendNickName || '-' },
    { colKey: 'groupId', title: 'groupId', width: 110, cell: ({ row }: { row: AdminChatFriendRow }) => row.groupId || '-' },
    { colKey: 'groupName', title: '群名称', width: 160, cell: ({ row }: { row: AdminChatFriendRow }) => row.groupName || '-' },
    { colKey: 'createdAt', title: '创建时间', width: 180, cell: ({ row }: { row: AdminChatFriendRow }) => row.createdAt || '-' },
    {
      colKey: 'operation',
      title: '操作',
      width: 120,
      fixed: 'right' as const,
      cell: ({ row }: { row: AdminChatFriendRow }) => (
        <Popconfirm content="确认删除该关系吗？" onConfirm={() => onDelete(Number(row.id))}>
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
            <Button theme="default" variant="outline" onClick={() => reload({ page: 1, userId, friendId, groupId })}>
              刷新列表
            </Button>
            <span className={commonStyles.selectedInfo}>共 {total} 项</span>
          </>
        }
        right={
          <div className="form-grid inline-form">
            <Input value={userId} onChange={setUserId} placeholder="userId" clearable suffixIcon={<SearchIcon />} />
            <Input value={friendId} onChange={setFriendId} placeholder="friendId" clearable />
            <Input value={groupId} onChange={setGroupId} placeholder="groupId" clearable />
            <Button theme="primary" onClick={() => reload({ page: 1, userId, friendId, groupId })}>
              查询
            </Button>
          </div>
        }
      />

      <Table
        rowKey="id"
        data={list}
        loading={loading}
        columns={columns}
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
    </PageContainer>
  );
}

