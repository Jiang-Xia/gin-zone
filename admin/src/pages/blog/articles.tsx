import { useMemo, useState } from 'react';
import { Button, Dialog, Input, Table } from 'tdesign-react';
import { SearchIcon } from 'tdesign-icons-react';
import PageContainer from '../../components/PageContainer';
import ListToolbar from '../../components/ListToolbar';
import { useApiMessage } from '../../hooks/useApiMessage';
import { getBlogArticleInfo, postBlogArticleList } from '../../api/modules/blog';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '../../constants/pagination';

function extractList(data: unknown) {
  if (Array.isArray(data)) {
    return data as Array<Record<string, unknown>>;
  }
  const payload = data as Record<string, unknown> | undefined;
  const candidates = [payload?.list, payload?.rows, payload?.records, payload?.data];
  for (const item of candidates) {
    if (Array.isArray(item)) {
      return item as Array<Record<string, unknown>>;
    }
  }
  return [];
}

function extractTotal(data: unknown, listLength: number) {
  const payload = data as Record<string, unknown> | undefined;
  const candidates = [payload?.total, payload?.count];
  for (const item of candidates) {
    const n = Number(item);
    if (!Number.isNaN(n) && n >= 0) {
      return n;
    }
  }
  return listLength;
}

export default function BlogArticleManagePage() {
  const message = useApiMessage();
  const [keyword, setKeyword] = useState('');
  const [tag, setTag] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [total, setTotal] = useState(0);
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailJson, setDetailJson] = useState('');

  const queryPayload = useMemo(
    () => ({
      pageNum: page,
      pageSize,
      keyword: keyword.trim() || undefined,
      tag: tag.trim() || undefined,
      category: category.trim() || undefined,
    }),
    [page, pageSize, keyword, tag, category],
  );

  const load = async (override?: Partial<typeof queryPayload>) => {
    const finalPayload = { ...queryPayload, ...override };
    setLoading(true);
    try {
      const res = await postBlogArticleList(finalPayload);
      const list = extractList(res);
      setRows(list);
      setTotal(extractTotal(res, list.length));
    } catch (error) {
      message.error(error, '获取文章列表失败');
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (row: Record<string, unknown>) => {
    const id = row.id ?? row.articleId;
    if (!id) {
      message.warning('当前行缺少文章ID');
      return;
    }
    setDetailVisible(true);
    setDetailLoading(true);
    try {
      const res = await getBlogArticleInfo({ id });
      setDetailJson(JSON.stringify(res, null, 2));
    } catch (error) {
      message.error(error, '获取文章详情失败');
      setDetailJson('');
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <PageContainer>
      <ListToolbar
        left={
          <>
            <Button
              theme="primary"
              onClick={() => {
                setPage(1);
                load({ pageNum: 1 }).catch(() => undefined);
              }}
            >
              查询
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setKeyword('');
                setTag('');
                setCategory('');
                setPage(1);
                load({
                  pageNum: 1,
                  keyword: undefined,
                  tag: undefined,
                  category: undefined,
                }).catch(() => undefined);
              }}
            >
              重置
            </Button>
            <span>共 {total} 项</span>
          </>
        }
        right={
          <div className="form-grid inline-form">
            <Input value={keyword} onChange={setKeyword} placeholder="按标题/关键字筛选" suffixIcon={<SearchIcon />} clearable />
            <Input value={tag} onChange={setTag} placeholder="按标签筛选" clearable />
            <Input value={category} onChange={setCategory} placeholder="按分类筛选" clearable />
          </div>
        }
      />

      <div className="page-subsection">
        <div className="subsection-title">文章管理</div>
        <Table
          rowKey="id"
          data={rows}
          loading={loading}
          bordered
          stripe
          hover
          columns={[
            { colKey: 'id', title: 'ID', width: 90 },
            { colKey: 'title', title: '标题', ellipsis: true },
            { colKey: 'author', title: '作者', width: 140 },
            { colKey: 'categoryName', title: '分类', width: 140 },
            { colKey: 'tags', title: '标签', width: 180, ellipsis: true },
            { colKey: 'viewCount', title: '浏览量', width: 110 },
            { colKey: 'createdAt', title: '创建时间', width: 180 },
            {
              colKey: 'operation',
              title: '操作',
              width: 120,
              cell: ({ row }: { row: Record<string, unknown> }) => (
                <Button theme="primary" variant="text" onClick={() => openDetail(row)}>
                  查看详情
                </Button>
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
            onCurrentChange: (value) => {
              setPage(value);
              load({ pageNum: value }).catch(() => undefined);
            },
            onPageSizeChange: (value) => {
              setPage(1);
              setPageSize(value);
              load({ pageNum: 1, pageSize: value }).catch(() => undefined);
            },
          }}
        />
      </div>

      <Dialog
        header="文章详情"
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        confirmBtn={null}
        cancelBtn="关闭"
      >
        {detailLoading ? '加载中...' : <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{detailJson || '暂无数据'}</pre>}
      </Dialog>
    </PageContainer>
  );
}

