import { useState } from 'react';
import { Button, Input, Table } from 'tdesign-react';
import PageContainer from '../../components/PageContainer';
import ListToolbar from '../../components/ListToolbar';
import { useApiMessage } from '../../hooks/useApiMessage';
import { useListPage } from '../../hooks/useListPage';
import { getSensitiveHits, type SensitiveHitRow } from '../../api/modules/sensitiveWord';

export default function SensitiveHitsPage() {
  const message = useApiMessage();
  const [word, setWord] = useState('');
  const [senderId, setSenderId] = useState('');

  const { query, list, total, loading, reload } = useListPage<
    SensitiveHitRow,
    { page: number; pageSize: number; word: string; senderId: string }
  >({
    initialQuery: { page: 1, pageSize: 20, word: '', senderId: '' },
    request: async (q) => {
      try {
        return await getSensitiveHits(q);
      } catch (error) {
        message.error(error, '获取命中记录失败');
        return { list: [], total: 0 };
      }
    },
  });

  return (
    <PageContainer>
      <ListToolbar
        left={
          <>
            <Button theme="default" variant="outline" onClick={() => reload({ page: 1, word, senderId })}>
              刷新
            </Button>
            <span>共 {total} 项</span>
          </>
        }
        right={
          <div style={{ display: 'flex', gap: 8 }}>
            <Input value={word} onChange={setWord} placeholder="命中词" clearable />
            <Input value={senderId} onChange={setSenderId} placeholder="发送人 userId" clearable />
            <Button theme="primary" onClick={() => reload({ page: 1, word, senderId })}>
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
          { colKey: 'word', title: '命中词', width: 180 },
          { colKey: 'senderId', title: '发送人', width: 160 },
          { colKey: 'groupId', title: '群ID', width: 100 },
          { colKey: 'messageId', title: '消息ID', width: 100 },
          { colKey: 'content', title: '原文', ellipsis: true },
          { colKey: 'createdAt', title: '命中时间', width: 180 },
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
