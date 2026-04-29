import { useState } from 'react';
import { Button, Input, Popconfirm, Select, Table } from 'tdesign-react';
import { SearchIcon } from 'tdesign-icons-react';
import PageContainer from '../../components/PageContainer';
import ListToolbar from '../../components/ListToolbar';
import { useApiMessage } from '../../hooks/useApiMessage';
import { useListPage } from '../../hooks/useListPage';
import {
  deleteAdminChatMessage,
  getAdminChatMessages,
  revokeAdminChatMessage,
  type AdminChatMessageRow,
} from '../../api/modules/chatAdmin';

const msgTypeOptions = [
  { label: '全部类型', value: 0 },
  { label: '文本', value: 1 },
  { label: '图片', value: 2 },
  { label: '视频', value: 3 },
  { label: '音频', value: 4 },
  { label: '其他', value: 5 },
];

export default function ChatMessagesManagePage() {
  const message = useApiMessage();
  const [senderId, setSenderId] = useState('');
  const [groupId, setGroupId] = useState('');
  const [keyword, setKeyword] = useState('');
  const [msgType, setMsgType] = useState<number>(0);

  // 消息检索按筛选项+分页统一走 useListPage，避免页面内重复管理请求状态
  const { query, list, total, loading, reload } = useListPage<
    AdminChatMessageRow,
    { page: number; pageSize: number; senderId: string; groupId: string; keyword: string; msgType: number }
  >({
    initialQuery: { page: 1, pageSize: 20, senderId: '', groupId: '', keyword: '', msgType: 0 },
    request: async (q) => {
      try {
        const res = await getAdminChatMessages({
          page: q.page,
          pageSize: q.pageSize,
          senderId: q.senderId || undefined,
          groupId: Number(q.groupId || 0) || undefined,
          keyword: q.keyword || undefined,
          msgType: q.msgType || undefined,
        });
        return { list: res.list ?? [], total: res.total ?? 0 };
      } catch (error) {
        message.error(error, '获取消息列表失败');
        return { list: [], total: 0 };
      }
    },
  });

  const onSearch = async () => {
    await reload({ page: 1, senderId, groupId, keyword, msgType });
  };

  const onRevoke = async (id: number) => {
    try {
      await revokeAdminChatMessage(id);
      message.success('消息撤回成功');
      await reload();
    } catch (error) {
      message.error(error, '消息撤回失败');
    }
  };

  const onDelete = async (id: number) => {
    try {
      await deleteAdminChatMessage(id);
      message.success('消息删除成功');
      await reload();
    } catch (error) {
      message.error(error, '消息删除失败');
    }
  };

  return (
    <PageContainer>
      <ListToolbar
        left={
          <>
            <Button theme="default" variant="outline" onClick={() => reload({ page: 1 })}>
              刷新列表
            </Button>
            <span>共 {total} 项</span>
          </>
        }
        right={
          <div style={{ display: 'flex', gap: 8 }}>
            <Input value={senderId} onChange={setSenderId} placeholder="发送人 userId" clearable />
            <Input value={groupId} onChange={setGroupId} placeholder="群ID" clearable />
            <Input value={keyword} onChange={setKeyword} placeholder="关键词" suffixIcon={<SearchIcon />} clearable />
            <Select
              value={msgType}
              options={msgTypeOptions}
              onChange={(value) => setMsgType(Number(value))}
              style={{ width: 120 }}
            />
            <Button theme="primary" onClick={onSearch}>
              查询
            </Button>
          </div>
        }
      />

      <Table
        rowKey="id"
        data={list}
        loading={loading}
        columns={[
          { colKey: 'id', title: '消息ID', width: 100 },
          { colKey: 'senderId', title: '发送人', width: 160 },
          { colKey: 'receiverId', title: '接收人', width: 160 },
          { colKey: 'groupId', title: '群ID', width: 100 },
          { colKey: 'msgType', title: '消息类型', width: 100 },
          {
            colKey: 'status',
            title: '状态',
            width: 140,
            cell: ({ row }: { row: AdminChatMessageRow }) => {
              if (row.isDeleted) return '已删除';
              if (row.isRevoked) return '已撤回';
              return '正常';
            },
          },
          { colKey: 'content', title: '内容', ellipsis: true },
          { colKey: 'createdAt', title: '创建时间', width: 180 },
          {
            colKey: 'operation',
            title: '操作',
            width: 180,
            fixed: 'right' as const,
            cell: ({ row }: { row: AdminChatMessageRow }) => (
              <>
                <Popconfirm content="确认撤回该消息吗？" onConfirm={() => onRevoke(row.id)}>
                  <Button size="small" theme="primary" variant="text" disabled={row.isDeleted || row.isRevoked}>
                    撤回
                  </Button>
                </Popconfirm>
                <Popconfirm content="确认删除该消息吗？" onConfirm={() => onDelete(row.id)}>
                  <Button size="small" theme="danger" variant="text" disabled={row.isDeleted}>
                    删除
                  </Button>
                </Popconfirm>
              </>
            ),
          },
        ]}
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
