import { useEffect, useState } from 'react';
import { Button, Input, Popconfirm, Table } from 'tdesign-react';
import { SearchIcon } from 'tdesign-icons-react';
import dayjs from 'dayjs';
import { deleteMomentComment, getMomentCommentList, MomentCommentItem } from '../../api/modules/moment';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '../../constants/pagination';
import { useApiMessage } from '../../hooks/useApiMessage';
import ListToolbar from '../../components/ListToolbar';
import PageContainer from '../../components/PageContainer';

const TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export default function MomentCommentManagePage() {
  const message = useApiMessage();
  const [momentId, setMomentId] = useState('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<MomentCommentItem[]>([]);

  // 评论/回复管理列表：支持按动态ID和关键词筛选
  const load = async (override?: Partial<{ page: number; pageSize: number }>) => {
    setLoading(true);
    try {
      const nextPage = override?.page ?? page;
      const nextPageSize = override?.pageSize ?? pageSize;
      const data = await getMomentCommentList({
        page: nextPage,
        pageSize: nextPageSize,
        keyword: keyword.trim() || undefined,
        momentId: Number(momentId) || undefined,
      });
      setRows(data.list || []);
      setTotal(data.total || 0);
      setPage(nextPage);
      setPageSize(nextPageSize);
    } catch (error) {
      message.error(error, '获取动态评论失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  return (
    <PageContainer>
      <ListToolbar
        left={
          <>
            <Button theme="primary" onClick={() => load({ page: 1 }).catch(() => undefined)}>
              查询
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setMomentId('');
                setKeyword('');
                load({ page: 1 }).catch(() => undefined);
              }}
            >
              重置
            </Button>
          </>
        }
        right={
          <div className="form-grid inline-form">
            <Input value={momentId} onChange={setMomentId} placeholder="动态ID" clearable />
            <Input value={keyword} onChange={setKeyword} placeholder="评论关键词" suffixIcon={<SearchIcon />} clearable />
          </div>
        }
      />
      <div className="page-subsection">
        <div className="subsection-title">动态评论管理</div>
        <Table
          rowKey="id"
          data={rows}
          loading={loading}
          bordered
          stripe
          hover
          columns={[
            { colKey: 'momentId', title: '动态ID', width: 90 },
            { colKey: 'id', title: '评论ID', width: 90 },
            { colKey: 'parentId', title: '父评论ID', width: 100 },
            {
              colKey: 'userInfo',
              title: '评论人',
              width: 140,
              cell: ({ row }: { row: MomentCommentItem }) => row.userInfo?.nickName || row.userId || '-',
            },
            {
              colKey: 'replyToUserInfo',
              title: '被回复人',
              width: 140,
              cell: ({ row }: { row: MomentCommentItem }) => row.replyToUserInfo?.nickName || row.replyToUserId || '-',
            },
            { colKey: 'content', title: '内容', ellipsis: true },
            {
              colKey: 'createdAt',
              title: '时间',
              width: 180,
              cell: ({ row }: { row: MomentCommentItem }) => dayjs(row.createdAt).format(TIME_FORMAT),
            },
            {
              colKey: 'op',
              title: '操作',
              width: 100,
              cell: ({ row }: { row: MomentCommentItem }) => (
                <Popconfirm
                  content="确认删除该评论/回复吗？"
                  onConfirm={async () => {
                    try {
                      await deleteMomentComment(row.id);
                      message.success('删除成功');
                      await load();
                    } catch (error) {
                      message.error(error, '删除失败');
                    }
                  }}
                >
                  <Button theme="danger" variant="text">
                    删除
                  </Button>
                </Popconfirm>
              ),
            },
          ]}
          pagination={{
            current: page,
            pageSize,
            total,
            showJumper: true,
            showPageSize: true,
            pageSizeOptions: PAGE_SIZE_OPTIONS,
            onCurrentChange: (value) => load({ page: value }).catch(() => undefined),
            onPageSizeChange: (value) => load({ page: 1, pageSize: value }).catch(() => undefined),
          }}
        />
      </div>
    </PageContainer>
  );
}
