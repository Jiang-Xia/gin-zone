import { useState } from 'react';
import { Button, Table } from 'tdesign-react';
import PageContainer from '../../components/PageContainer';
import ListToolbar from '../../components/ListToolbar';
import { useApiMessage } from '../../hooks/useApiMessage';
import { getBlogArticleViews, getBlogCategory, getBlogDailyImage, getBlogTag } from '../../api/modules/blog';

function toArray(data: unknown) {
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

export default function BlogDashboardPage() {
  const message = useApiMessage();
  const [loading, setLoading] = useState(false);
  const [views, setViews] = useState<Array<Record<string, unknown>>>([]);
  const [tags, setTags] = useState<Array<Record<string, unknown>>>([]);
  const [categories, setCategories] = useState<Array<Record<string, unknown>>>([]);
  const [dailyImage, setDailyImage] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [viewsRes, tagsRes, categoriesRes, imageRes] = await Promise.all([
        getBlogArticleViews(),
        getBlogTag(),
        getBlogCategory(),
        getBlogDailyImage(),
      ]);
      setViews(toArray(viewsRes));
      setTags(toArray(tagsRes));
      setCategories(toArray(categoriesRes));
      setDailyImage(JSON.stringify(imageRes, null, 2));
    } catch (error) {
      message.error(error, '加载内容统计失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <ListToolbar
        left={
          <>
            <Button theme="primary" onClick={() => load().catch(() => undefined)}>
              刷新统计
            </Button>
            <span>文章统计 {views.length} 条 / 标签 {tags.length} 条 / 分类 {categories.length} 条</span>
          </>
        }
        right={<span>数据来源：/blog/article/views /blog/tag /blog/category /blog/resources/daily-img</span>}
      />

      <div className="page-subsection">
        <div className="subsection-title">文章阅读统计</div>
        <Table
          rowKey="id"
          data={views}
          loading={loading}
          bordered
          stripe
          hover
          columns={[
            { colKey: 'id', title: 'ID', width: 90 },
            { colKey: 'title', title: '文章标题', ellipsis: true },
            { colKey: 'views', title: '阅读量', width: 120 },
          ]}
        />
      </div>

      <div className="page-subsection">
        <div className="subsection-title">标签统计</div>
        <Table
          rowKey="id"
          data={tags}
          loading={loading}
          bordered
          stripe
          hover
          columns={[
            { colKey: 'id', title: 'ID', width: 90 },
            { colKey: 'name', title: '标签名称', width: 180 },
            { colKey: 'count', title: '文章数', width: 120 },
          ]}
        />
      </div>

      <div className="page-subsection">
        <div className="subsection-title">分类统计</div>
        <Table
          rowKey="id"
          data={categories}
          loading={loading}
          bordered
          stripe
          hover
          columns={[
            { colKey: 'id', title: 'ID', width: 90 },
            { colKey: 'name', title: '分类名称', width: 180 },
            { colKey: 'count', title: '文章数', width: 120 },
          ]}
        />
      </div>

      <div className="page-subsection">
        <div className="subsection-title">每日图片</div>
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{dailyImage || '暂无数据'}</pre>
      </div>
    </PageContainer>
  );
}

