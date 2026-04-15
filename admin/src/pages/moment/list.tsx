import { useMemo, useState } from 'react';
import { Avatar, Button, Dialog, Input, Table, Tag } from 'tdesign-react';
import { SearchIcon } from 'tdesign-icons-react';
import { getMomentList, MomentItem } from '../../api/modules/moment';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '../../constants/pagination';
import styles from './list.module.less';
import { useListPage } from '../../hooks/useListPage';
import { useApiMessage } from '../../hooks/useApiMessage';
import PageContainer from '../../components/PageContainer';
import ListToolbar from '../../components/ListToolbar';

// 静态资源前缀（用于拼接图片完整访问地址）
const baseUrl = import.meta.env.VITE_BASE_URL;

export default function MomentListPage() {
  const message = useApiMessage();
  // 关键字搜索
  const [keyword, setKeyword] = useState('');
  const [riskOnly, setRiskOnly] = useState(false);
  const [lowQualityOnly, setLowQualityOnly] = useState(false);
  const [riskKeywords, setRiskKeywords] = useState('违规,广告,引流,辱骂,spam');
  // 表格多选：记录选中行 id
  const [selectedRowKeys, setSelectedRowKeys] = useState<Array<string | number>>([]);
  // 图片预览弹窗：保存当前预览图片地址
  const [previewImage, setPreviewImage] = useState('');
  // 列表页公共状态：集中管理分页查询、loading 与请求刷新
  const { query, list, total, loading, reload } = useListPage<
    MomentItem,
    { page: number; pageSize: number; content: string }
  >({
    initialQuery: {
      page: DEFAULT_PAGE,
      pageSize: DEFAULT_PAGE_SIZE,
      content: '',
    },
    request: async (nextQuery) => {
      try {
        return await getMomentList(nextQuery);
      } catch (error) {
        message.error(error, '获取动态列表失败');
        return { list: [], total: 0 };
      }
    },
  });

  const rows = useMemo(
    () =>
      list.map(item => ({
        ...item,
        // 后端 urls 为逗号分隔字符串，这里转成数组供表格渲染
        imageList: item.urls ? item.urls.split(',').filter(Boolean) : [],
      })),
    [list],
  );

  const riskWordList = useMemo(
    () =>
      riskKeywords
        .split(',')
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean),
    [riskKeywords],
  );

  const displayRows = useMemo(
    () =>
      rows.filter((row) => {
        const content = String(row.content ?? '').toLowerCase();
        const contentLength = content.trim().length;
        const hasRisk = riskWordList.length > 0 && riskWordList.some((word) => content.includes(word));
        // 低质量规则：内容过短，或同字符重复过多（如“哈哈哈哈哈哈”）
        const hasRepeatChars = /(.)\1{5,}/.test(content);
        const isLowQuality = contentLength > 0 && (contentLength < 8 || hasRepeatChars);
        if (riskOnly && !hasRisk) {
          return false;
        }
        if (lowQualityOnly && !isLowQuality) {
          return false;
        }
        return true;
      }),
    [rows, riskOnly, lowQualityOnly, riskWordList],
  );

  const columns = [
    {
      colKey: 'userInfo',
      title: '用户',
      width: 200,
      cell: ({ row }: { row: MomentItem }) => (
        <div className={styles.userCell}>
          <Avatar image={row.userInfo?.avatar} />
          <span>{row.userInfo?.nickName || '-'}</span>
        </div>
      ),
    },
    { colKey: 'content', title: '动态内容', width: 360 },
    {
      colKey: 'urls',
      title: '动态图片',
      width: 220,
      cell: ({ row }: { row: MomentItem & { imageList?: string[] } }) => (
        <div className={styles.imgCell}>
          {(row.imageList ?? []).slice(0, 3).map(url => (
            <img
              key={url}
              src={`${baseUrl}${url}`}
              alt="moment"
              className={styles.clickableImage}
              onClick={() => setPreviewImage(`${baseUrl}${url}`)}
            />
          ))}
        </div>
      ),
    },
    { colKey: 'location', title: '位置', width: 280, cell: ({ row }: { row: MomentItem }) => row.location || '-' },
    {
      colKey: 'stats',
      title: '点赞/浏览',
      width: 140,
      cell: ({ row }: { row: MomentItem }) => (
        <Tag theme="primary" variant="light">
          {row.likes} / {row.views}
        </Tag>
      ),
    },
  ];

  return (
    <PageContainer>
      <ListToolbar
        className={styles.toolbar}
        leftClassName={styles.toolbarLeft}
        left={
          <>
            <Button
              theme="default"
              variant="outline"
              onClick={() => {
                reload({
                  page: query.page,
                  pageSize: query.pageSize,
                  content: keyword,
                }).catch((error) => message.error(error, '刷新失败'));
              }}
            >
              刷新列表
            </Button>
            <Button
              theme={riskOnly ? 'warning' : 'default'}
              variant={riskOnly ? 'base' : 'outline'}
              onClick={() => setRiskOnly((prev) => !prev)}
            >
              {riskOnly ? '已启用敏感筛选' : '仅看敏感动态'}
            </Button>
            <Button
              theme={lowQualityOnly ? 'primary' : 'default'}
              variant={lowQualityOnly ? 'base' : 'outline'}
              onClick={() => setLowQualityOnly((prev) => !prev)}
            >
              {lowQualityOnly ? '已启用低质筛选' : '仅看低质量动态'}
            </Button>
            <span className={styles.selectedInfo}>已选 {selectedRowKeys.length} 项，显示 {displayRows.length} / 总 {rows.length}</span>
          </>
        }
        right={
          <div className="form-grid inline-form">
            <Input
              className={styles.search}
              value={keyword}
              onChange={setKeyword}
              placeholder="请输入你需要搜索的动态"
              suffixIcon={<SearchIcon />}
              clearable
              onEnter={() => {
                if (query.page === 1) {
                  reload({ content: keyword });
                  return;
                }
                reload({
                  page: 1,
                  content: keyword,
                });
              }}
            />
            <Input value={riskKeywords} onChange={setRiskKeywords} placeholder="敏感词（逗号分隔）" clearable />
          </div>
        }
      />

      <div className={styles.tableWrap}>
        <Table
          rowKey="id"
          data={displayRows}
          loading={loading}
          hover
          bordered
          stripe
          tableLayout="fixed"
          columns={[
            { colKey: 'row-select', type: 'multiple', width: 58, fixed: 'left' as const },
            ...columns,
          ]}
          selectedRowKeys={selectedRowKeys}
          onSelectChange={value => setSelectedRowKeys(value)}
          pagination={{
            current: query.page,
            pageSize: query.pageSize,
            total,
            showJumper: true,
            showPageSize: true,
            pageSizeOptions: PAGE_SIZE_OPTIONS,
            onCurrentChange: currentValue => {
              reload({
                page: currentValue,
              });
            },
            onPageSizeChange: size => {
              reload({
                page: 1,
                pageSize: size,
              });
            },
          }}
        />
      </div>

      <Dialog
        header="图片预览"
        visible={Boolean(previewImage)}
        onClose={() => setPreviewImage('')}
        footer={false}
      >
        {previewImage ? <img className={styles.previewImage} src={previewImage} alt="preview" /> : null}
      </Dialog>
    </PageContainer>
  );
}
