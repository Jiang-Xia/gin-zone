import { useState } from 'react';
import { Button, Dialog, Input, Table } from 'tdesign-react';
import { SearchIcon } from 'tdesign-icons-react';
import PageContainer from '../../components/PageContainer';
import ListToolbar from '../../components/ListToolbar';
import { useApiMessage } from '../../hooks/useApiMessage';
import { getBlogArticleInfo, getBlogCommentAll } from '../../api/modules/blog';

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

export default function BlogCommentManagePage() {
  const message = useApiMessage();
  const [articleId, setArticleId] = useState('');
  const [keyword, setKeyword] = useState('');
  const [riskOnly, setRiskOnly] = useState(false);
  const [pendingOnly, setPendingOnly] = useState(false);
  const [riskKeywords, setRiskKeywords] = useState('违规,广告,引流,辱骂,spam');
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailJson, setDetailJson] = useState('');

  const load = async (override?: Record<string, unknown>) => {
    setLoading(true);
    try {
      const params = {
        articleId: articleId.trim() || undefined,
        keyword: keyword.trim() || undefined,
        ...override,
      };
      const res = await getBlogCommentAll(params);
      setRows(extractList(res));
    } catch (error) {
      message.error(error, '获取评论列表失败');
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (row: Record<string, unknown>) => {
    setDetailVisible(true);
    setDetailLoading(true);
    try {
      const article = row.articleId ? await getBlogArticleInfo({ id: row.articleId }) : null;
      const payload = {
        comment: row,
        article,
      };
      setDetailJson(JSON.stringify(payload, null, 2));
    } catch (error) {
      message.error(error, '加载评论上下文失败');
      setDetailJson(JSON.stringify({ comment: row }, null, 2));
    } finally {
      setDetailLoading(false);
    }
  };

  const riskWordList = riskKeywords
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  const displayRows = rows.filter((row) => {
    const content = String(row.content ?? '').toLowerCase();
    const status = String(row.status ?? '').toLowerCase();
    const hasRisk = riskWordList.length > 0 && riskWordList.some((word) => content.includes(word));
    const isPending = status === 'pending' || status === '0' || status === '';
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
                load({ articleId: undefined, keyword: undefined }).catch(() => undefined);
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
              显示 {displayRows.length} / 总 {rows.length} 项
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
            { colKey: 'id', title: '评论ID', width: 100 },
            { colKey: 'articleId', title: '文章ID', width: 100 },
            { colKey: 'nickName', title: '用户昵称', width: 160 },
            { colKey: 'content', title: '评论内容', ellipsis: true },
            { colKey: 'replyId', title: '回复对象ID', width: 120 },
            { colKey: 'createTime', title: '创建时间', width: 180 },
            {
              colKey: 'operation',
              title: '操作',
              width: 120,
              fixed: 'right' as const,
              cell: ({ row }: { row: Record<string, unknown> }) => (
                <Button theme="primary" variant="text" onClick={() => openDetail(row)}>
                  查看上下文
                </Button>
              ),
            },
          ]}
        />
      </div>

      <Dialog
        header="评论上下文"
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

