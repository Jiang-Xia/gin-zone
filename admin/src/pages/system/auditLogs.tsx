import { useState } from 'react';
import { Button, Input, Table } from 'tdesign-react';
import PageContainer from '../../components/PageContainer';
import ListToolbar from '../../components/ListToolbar';
import { useApiMessage } from '../../hooks/useApiMessage';
import { useListPage } from '../../hooks/useListPage';
import { getAdminAuditLogs, type AdminAuditLogRow } from '../../api/modules/adminSystem';

export default function AuditLogsPage() {
  const message = useApiMessage();
  const [operatorUserId, setOperatorUserId] = useState('');
  const [action, setAction] = useState('');

  // 审计日志查询统一走列表 Hook，保持分页与刷新行为一致
  const { query, list, total, loading, reload } = useListPage<
    AdminAuditLogRow,
    { page: number; pageSize: number; operatorUserId: string; action: string }
  >({
    initialQuery: { page: 1, pageSize: 20, operatorUserId: '', action: '' },
    request: async (q) => {
      try {
        return await getAdminAuditLogs(q);
      } catch (error) {
        message.error(error, '获取审计日志失败');
        return { list: [], total: 0 };
      }
    },
  });

  return (
    <PageContainer>
      <ListToolbar
        left={
          <>
            <Button theme="default" variant="outline" onClick={() => reload({ page: 1, operatorUserId, action })}>
              刷新列表
            </Button>
            <span>共 {total} 项</span>
          </>
        }
        right={
          <div style={{ display: 'flex', gap: 8 }}>
            <Input value={operatorUserId} onChange={setOperatorUserId} placeholder="操作者 userId" clearable />
            <Input value={action} onChange={setAction} placeholder="操作动作（模糊）" clearable />
            <Button theme="primary" onClick={() => reload({ page: 1, operatorUserId, action })}>
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
          { colKey: 'id', title: 'ID', width: 90 },
          { colKey: 'operatorUserId', title: '操作者', width: 160 },
          { colKey: 'action', title: '动作', width: 220 },
          { colKey: 'targetType', title: '对象类型', width: 140 },
          { colKey: 'targetId', title: '对象标识', width: 220 },
          { colKey: 'reason', title: '原因', ellipsis: true },
          { colKey: 'ip', title: 'IP', width: 140 },
          { colKey: 'createdAt', title: '时间', width: 180 },
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
