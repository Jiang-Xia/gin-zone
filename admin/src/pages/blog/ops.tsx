import { useState } from 'react';
import { Button, Input, Table } from 'tdesign-react';
import { SearchIcon } from 'tdesign-icons-react';
import PageContainer from '../../components/PageContainer';
import ListToolbar from '../../components/ListToolbar';
import { useApiMessage } from '../../hooks/useApiMessage';
import {
  getBlogArticleInfo,
  getBlogArticleViews,
  getBlogCategory,
  getBlogCommentAll,
  getBlogDailyImage,
  getBlogTag,
  postBlogArticleList,
} from '../../api/modules/blog';

function parseJsonObject(value: string) {
  if (!value.trim()) {
    return {};
  }
  return JSON.parse(value) as Record<string, unknown>;
}

export default function BlogOpsPage() {
  const message = useApiMessage();
  const [queryText, setQueryText] = useState('{}');
  const [payloadText, setPayloadText] = useState('{}');
  const [resultRows, setResultRows] = useState<Array<Record<string, unknown>>>([]);
  const [resultText, setResultText] = useState('');
  const [loading, setLoading] = useState(false);

  const run = async (action: () => Promise<unknown>, successText: string) => {
    setLoading(true);
    try {
      const data = await action();
      if (Array.isArray(data)) {
        setResultRows(data as Array<Record<string, unknown>>);
      } else {
        const maybeList = (data as { list?: Array<Record<string, unknown>> })?.list;
        if (Array.isArray(maybeList)) {
          setResultRows(maybeList);
        } else {
          setResultRows([]);
        }
      }
      setResultText(JSON.stringify(data, null, 2));
      message.success(successText);
    } catch (error) {
      message.error(error, successText.replace('成功', '失败'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <ListToolbar
        left={<span>博客运营（代理 blog 服务）</span>}
        right={<span>按需填写 query/payload JSON 后点击对应接口</span>}
      />

      <div className="page-subsection">
        <div className="subsection-title">参数区</div>
        <div className="form-grid">
          <Input
            value={queryText}
            onChange={setQueryText}
            placeholder='query json，例如 {"id":1}'
            suffixIcon={<SearchIcon />}
          />
          <Input
            value={payloadText}
            onChange={setPayloadText}
            placeholder='payload json，例如 {"pageNum":1,"pageSize":10}'
          />
        </div>
      </div>

      <div className="page-subsection">
        <div className="subsection-title">文章与基础数据</div>
        <div className="form-grid inline-form">
          <Button onClick={() => run(() => postBlogArticleList(parseJsonObject(payloadText)), '查询文章列表成功')}>
            POST /blog/article/list
          </Button>
          <Button onClick={() => run(() => getBlogArticleInfo(parseJsonObject(queryText)), '查询文章详情成功')}>
            GET /blog/article/info
          </Button>
          <Button onClick={() => run(() => getBlogTag(parseJsonObject(queryText)), '查询标签成功')}>GET /blog/tag</Button>
          <Button onClick={() => run(() => getBlogCategory(parseJsonObject(queryText)), '查询分类成功')}>
            GET /blog/category
          </Button>
          <Button onClick={() => run(() => getBlogCommentAll(parseJsonObject(queryText)), '查询评论成功')}>
            GET /blog/comment/findAll
          </Button>
          <Button onClick={() => run(() => getBlogArticleViews(parseJsonObject(queryText)), '查询阅读统计成功')}>
            GET /blog/article/views
          </Button>
          <Button onClick={() => run(() => getBlogDailyImage(parseJsonObject(queryText)), '查询每日图片成功')}>
            GET /blog/resources/daily-img
          </Button>
        </div>
      </div>

      <div className="page-subsection">
        <div className="subsection-title">结果数据</div>
        <Table
          rowKey="id"
          data={resultRows}
          loading={loading}
          columns={[
            { colKey: 'id', title: 'ID', width: 100 },
            { colKey: 'title', title: '标题', ellipsis: true },
            { colKey: 'name', title: '名称', width: 180 },
            { colKey: 'createdAt', title: '时间', width: 180 },
          ]}
          bordered
          stripe
          hover
        />
        <pre style={{ marginTop: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{resultText || '暂无结果'}</pre>
      </div>
    </PageContainer>
  );
}

