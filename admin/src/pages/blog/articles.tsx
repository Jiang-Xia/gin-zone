import { useEffect, useMemo, useState } from 'react';
import { Button, Input, Table } from 'tdesign-react';
import { SearchIcon } from 'tdesign-icons-react';
import dayjs from 'dayjs';
import PageContainer from '../../components/PageContainer';
import ListToolbar from '../../components/ListToolbar';
import { useApiMessage } from '../../hooks/useApiMessage';
import { postBlogArticleList } from '../../api/modules/blog';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '../../constants/pagination';

type BlogTag = {
  id: string;
  label: string;
  value: string;
};

type BlogCategory = {
  id: string;
  label: string;
  value: string;
};

type BlogUserInfo = {
  id: number;
  nickname: string;
  avatar: string;
};

type BlogArticleRow = {
  id: number;
  title: string;
  uid: number;
  createTime: string;
  updateTime: string;
  views: number;
  likes: number;
  status: string;
  topping: boolean;
  isDelete: boolean;
  cover: string;
  commentCount: number;
  description: string;
  category: BlogCategory;
  tags: BlogTag[];
  userInfo: BlogUserInfo;
};

type BlogPagination = {
  total: number;
  page: number;
  pageSize: number;
  pages: number;
};

type BlogArticleListResponse = {
  list: BlogArticleRow[];
  pagination: BlogPagination;
};

const BLOG_DETAIL_URL_PREFIX = 'https://jiang-xia.top/detail/';
const TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

// 统一时间展示格式，避免列表显示 ISO 原始串
const formatTime = (value: string) => (value ? dayjs(value).format(TIME_FORMAT) : '-');

export default function BlogArticleManagePage() {
  const message = useApiMessage();
  const [keyword, setKeyword] = useState('');
  const [tag, setTag] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<BlogArticleRow[]>([]);
  const [total, setTotal] = useState(0);

  const queryPayload = useMemo(
    () => ({
      pageNum: page,
      page,
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
      const res = await postBlogArticleList(finalPayload as Record<string, unknown>);
      const payload = res as BlogArticleListResponse;
      // 文章列表严格按外部服务返回结构解析：data.list + data.pagination
      setRows(payload.list);
      setTotal(payload.pagination.total);
      setPage(payload.pagination.page);
      setPageSize(payload.pagination.pageSize);
    } catch (error) {
      message.error(error, '获取文章列表失败');
    } finally {
      setLoading(false);
    }
  };

  const jumpToDetail = (row: BlogArticleRow) => {
    window.open(`${BLOG_DETAIL_URL_PREFIX}${row.id}`, '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  return (
    <PageContainer>
      <ListToolbar
        left={
          <>
            <Button
              theme="primary"
              onClick={() => {
                setPage(1);
                load({ pageNum: 1, page: 1 }).catch(() => undefined);
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
                  page: 1,
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
            { colKey: 'title', title: '标题', ellipsis: true },
            { colKey: 'description', title: '描述', ellipsis: true },
            {
              colKey: 'cover',
              title: '封面',
              width: 100,
              cell: ({ row }: { row: BlogArticleRow }) =>
                row.cover ? (
                  <img
                    src={row.cover}
                    alt={row.title || 'cover'}
                    style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover' }}
                  />
                ) : (
                  '-'
                ),
            },
            { colKey: 'category.label', title: '分类', width: 140 },
            {
              colKey: 'tags',
              title: '标签',
              width: 180,
              ellipsis: true,
              cell: ({ row }: { row: BlogArticleRow }) => row.tags.map((item) => item.label).join(', ') || '-',
            },
            { colKey: 'views', title: '查看', width: 100 },
            { colKey: 'likes', title: '点赞', width: 100 },
            { colKey: 'commentCount', title: '评论数', width: 100 },
            {
              colKey: 'updateTime',
              title: '更新时间',
              width: 180,
              cell: ({ row }: { row: BlogArticleRow }) => formatTime(row.updateTime),
            },
            {
              colKey: 'operation',
              title: '操作',
              width: 120,
              fixed: 'right' as const,
              cell: ({ row }: { row: BlogArticleRow }) => (
                <Button theme="primary" variant="text" onClick={() => jumpToDetail(row)}>
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
              load({ pageNum: value, page: value }).catch(() => undefined);
            },
            onPageSizeChange: (value) => {
              setPage(1);
              setPageSize(value);
              load({ pageNum: 1, page: 1, pageSize: value }).catch(() => undefined);
            },
          }}
        />
      </div>
    </PageContainer>
  );
}

