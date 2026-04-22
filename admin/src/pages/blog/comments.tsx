import { useEffect, useState } from 'react';
import { Button, Input, Table } from 'tdesign-react';
import { SearchIcon } from 'tdesign-icons-react';
import dayjs from 'dayjs';
import PageContainer from '../../components/PageContainer';
import ListToolbar from '../../components/ListToolbar';
import { useApiMessage } from '../../hooks/useApiMessage';
import { getBlogCommentAll } from '../../api/modules/blog';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '../../constants/pagination';

type BlogUserInfo = {
  nickname: string;
  id: number;
  avatar: string;
};

type BlogReply = {
  id: string;
  createTime: string;
  updateTime: string;
  parentId: string;
  replyUid: string;
  content: string;
  uid: number;
  userInfo: BlogUserInfo;
  tUserInfo: BlogUserInfo;
  replys?: BlogReply[];
};

type BlogCommentRow = {
  id: string;
  createTime: string;
  updateTime: string;
  content: string;
  uid: number;
  userInfo: BlogUserInfo;
  replys: BlogReply[];
  allReplyCount: number;
  articleId: number;
};

type BlogCommentDisplayRow = {
  id: string;
  createTime: string;
  content: string;
  allReplyCount: number;
  userInfo: BlogUserInfo;
  tUserInfo?: BlogUserInfo;
  uid: number;
  level: number;
  children?: BlogCommentDisplayRow[];
};

type BlogPagination = {
  total: number;
  page: number;
  pageSize: number;
  pages: number;
};

type BlogCommentListResponse = {
  list: BlogCommentRow[];
  pagination: BlogPagination;
};

const TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

// 评论时间统一用 dayjs 格式化，保持和文章列表一致
const formatTime = (value: string) => (value ? dayjs(value).format(TIME_FORMAT) : '-');

// 昵称为空时回退展示用户ID，避免表格出现大量 "-"
function getDisplayNickname(nickname?: string, uid?: number) {
  const name = (nickname || '').trim();
  if (name) return name;
  if (typeof uid === 'number') return `用户${uid}`;
  return '-';
}

// 递归构建评论树节点，支持 replys 的多层级结构
function buildReplyNode(reply: BlogReply, level: number): BlogCommentDisplayRow {
  return {
    id: reply.id,
    createTime: reply.createTime,
    content: reply.content,
    allReplyCount: Array.isArray(reply.replys) ? reply.replys.length : 0,
    userInfo: reply.userInfo,
    tUserInfo: reply.tUserInfo,
    uid: reply.uid,
    level,
    children: (reply.replys || []).map((item) => buildReplyNode(item, level + 1)),
  };
}

// 将后端树形评论结构映射为表格树结构
function buildCommentTree(rows: BlogCommentRow[]) {
  return rows.map((comment) => ({
    id: comment.id,
    createTime: comment.createTime,
    content: comment.content,
    allReplyCount: comment.allReplyCount,
    userInfo: comment.userInfo,
    uid: comment.uid,
    level: 0,
    children: comment.replys.map((reply) => buildReplyNode(reply, 1)),
  }));
}

// 树形筛选：命中当前节点或任一子节点时保留整条链路
function filterCommentTree(
  rows: BlogCommentDisplayRow[],
  predicate: (row: BlogCommentDisplayRow) => boolean,
): BlogCommentDisplayRow[] {
  // 避免返回 null，直接构建符合类型约束的过滤结果
  const filteredRows: BlogCommentDisplayRow[] = [];
  rows.forEach((row) => {
    const children = row.children ? filterCommentTree(row.children, predicate) : [];
    if (predicate(row) || children.length > 0) {
      filteredRows.push({ ...row, children });
    }
  });
  return filteredRows;
}

export default function BlogCommentManagePage() {
  const message = useApiMessage();
  const [articleId, setArticleId] = useState('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [total, setTotal] = useState(0);
  const [riskOnly, setRiskOnly] = useState(false);
  const [pendingOnly, setPendingOnly] = useState(false);
  const [riskKeywords, setRiskKeywords] = useState('违规,广告,引流,辱骂,spam');
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<BlogCommentDisplayRow[]>([]);

  const load = async (override?: Record<string, unknown>) => {
    setLoading(true);
    try {
      const params = {
        articleId: articleId.trim() || undefined,
        keyword: keyword.trim() || undefined,
        page,
        pageSize,
        ...override,
      };
      const res = await getBlogCommentAll(params);
      const payload = res as BlogCommentListResponse;
      // 评论列表严格按外部服务返回结构解析：data.list + data.pagination
      setRows(buildCommentTree(payload.list));
      setTotal(payload.pagination.total);
      setPage(payload.pagination.page);
      setPageSize(payload.pagination.pageSize);
    } catch (error) {
      message.error(error, '获取评论列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  const riskWordList = riskKeywords
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  const displayRows = filterCommentTree(rows, (row) => {
    const content = String(row.content ?? '').toLowerCase();
    const hasRisk = riskWordList.length > 0 && riskWordList.some((word) => content.includes(word));
    const isPending = row.level === 0;
    if (riskOnly && !hasRisk) {
      return false;
    }
    if (pendingOnly && !isPending) {
      return false;
    }
    return true;
  });

  return (
    <PageContainer>
      <ListToolbar
        left={
          <>
            <Button theme="primary" onClick={() => load().catch(() => undefined)}>
              查询
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setArticleId('');
                setKeyword('');
                setPage(1);
                load({ articleId: undefined, keyword: undefined, page: 1 }).catch(() => undefined);
              }}
            >
              重置
            </Button>
            <Button variant="text" onClick={() => load().catch(() => undefined)}>
              刷新
            </Button>
            <Button
              theme={riskOnly ? 'warning' : 'default'}
              variant={riskOnly ? 'base' : 'outline'}
              onClick={() => setRiskOnly((prev) => !prev)}
            >
              {riskOnly ? '已启用高风险筛选' : '仅看高风险'}
            </Button>
            <Button
              theme={pendingOnly ? 'primary' : 'default'}
              variant={pendingOnly ? 'base' : 'outline'}
              onClick={() => setPendingOnly((prev) => !prev)}
            >
              {pendingOnly ? '已启用待处理筛选' : '仅看待处理'}
            </Button>
            <span>
              显示 {displayRows.length} / 总 {total} 项
            </span>
          </>
        }
        right={
          <div className="form-grid inline-form">
            <Input value={articleId} onChange={setArticleId} placeholder="按文章ID筛选" clearable />
            <Input value={keyword} onChange={setKeyword} placeholder="按评论内容关键字筛选" suffixIcon={<SearchIcon />} clearable />
            <Input
              value={riskKeywords}
              onChange={setRiskKeywords}
              placeholder="高风险关键词（逗号分隔）"
              clearable
            />
          </div>
        }
      />

      <div className="page-subsection">
        <div className="subsection-title">评论管理</div>
        <Table
          rowKey="id"
          data={displayRows}
          loading={loading}
          bordered
          stripe
          hover
          columns={[
            {
              colKey: 'userInfo.avatar',
              title: '评论人头像',
              width: 100,
              cell: ({ row }: { row: BlogCommentDisplayRow }) =>
                row.userInfo.avatar ? (
                  <img
                    src={row.userInfo.avatar}
                    alt={row.userInfo.nickname || 'avatar'}
                    style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  '-'
                ),
            },
            {
              colKey: 'userInfo.nickname',
              title: <span style={{ whiteSpace: 'nowrap' }}>评论人昵称</span>,
              width: 180,
              cell: ({ row }: { row: BlogCommentDisplayRow }) =>
                getDisplayNickname(row.userInfo.nickname, row.userInfo.id ?? row.uid),
            },
            {
              colKey: 'replys.tUserInfo.nickname',
              title: <span style={{ whiteSpace: 'nowrap' }}>被回复人昵称</span>,
              width: 180,
              cell: ({ row }: { row: BlogCommentDisplayRow }) => getDisplayNickname(row.tUserInfo?.nickname, row.tUserInfo?.id),
            },
            {
              colKey: 'replys.tUserInfo.avatar',
              title: '被回复人头像',
              width: 100,
              cell: ({ row }: { row: BlogCommentDisplayRow }) => {
                const avatar = row.tUserInfo?.avatar;
                const nickname = row.tUserInfo?.nickname || 'avatar';
                return avatar ? (
                  <img src={avatar} alt={nickname} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  '-'
                );
              },
            },
            {
              colKey: 'content',
              title: '评论内容',
              ellipsis: true,
              cell: ({ row }: { row: BlogCommentDisplayRow }) => (row.level > 0 ? `↳ ${row.content}` : row.content),
            },
            { colKey: 'allReplyCount', title: '回复数', width: 100 },
            {
              colKey: 'createTime',
              title: '评论时间',
              width: 180,
              cell: ({ row }: { row: BlogCommentDisplayRow }) => formatTime(row.createTime),
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
              load({ page: value }).catch(() => undefined);
            },
            onPageSizeChange: (value) => {
              setPage(1);
              setPageSize(value);
              load({ page: 1, pageSize: value }).catch(() => undefined);
            },
          }}
        />
      </div>
    </PageContainer>
  );
}

