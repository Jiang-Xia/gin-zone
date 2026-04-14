import { useEffect, useMemo, useState } from 'react';
import { Avatar, Button, Dialog, Input, MessagePlugin, Table, Tag } from 'tdesign-react';
import { SearchIcon } from 'tdesign-icons-react';
import { addMoment, getMomentList, MomentItem, updateMoment } from '../../api/modules/moment';
import { useAuth } from '../../store/auth';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '../../constants/pagination';

const baseUrl = import.meta.env.VITE_BASE_URL;

export default function MomentListPage() {
  const { userInfo } = useAuth();
  const [list, setList] = useState<MomentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [total, setTotal] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Array<string | number>>([]);
  const [showPublish, setShowPublish] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [publishForm, setPublishForm] = useState({
    content: '',
    urls: '',
    location: '',
    userId: String(userInfo?.userId ?? ''),
  });

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await getMomentList({ page, pageSize, content: keyword });
      const serverList = res?.list ?? [];
      setList(serverList);
      setTotal(res?.total ?? serverList.length);
    } catch (error) {
      MessagePlugin.error(error instanceof Error ? error.message : '获取动态列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const rows = useMemo(
    () =>
      list.map(item => ({
        ...item,
        imageList: item.urls ? item.urls.split(',').filter(Boolean) : [],
      })),
    [list],
  );

  const onOperate = async (id: number, type: 'like' | 'view') => {
    try {
      await updateMoment(id, type);
      MessagePlugin.success(type === 'like' ? '点赞成功' : '浏览量更新成功');
      fetchList();
    } catch (error) {
      MessagePlugin.error(error instanceof Error ? error.message : '操作失败');
    }
  };

  const onPublish = async () => {
    try {
      await addMoment(publishForm);
      MessagePlugin.success('发布动态成功');
      setShowPublish(false);
      setPublishForm((prev) => ({ ...prev, content: '', urls: '', location: '' }));
      fetchList();
    } catch (error) {
      MessagePlugin.error(error instanceof Error ? error.message : '发布失败');
    }
  };

  const columns = [
    {
      colKey: 'userInfo',
      title: '用户',
      width: 200,
      cell: ({ row }: { row: MomentItem }) => (
        <div className="user-cell">
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
        <div className="img-cell">
          {(row.imageList ?? []).slice(0, 3).map(url => (
            <img
              key={url}
              src={`${baseUrl}${url}`}
              alt="moment"
              className="moment-clickable-image"
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
    {
      colKey: 'op',
      title: '操作',
      width: 180,
      fixed: 'right' as const,
      cell: ({ row }: { row: MomentItem }) => (
        <>
          <Button theme="primary" variant="text" onClick={() => onOperate(row.id, 'like')}>
            点赞
          </Button>
          <Button theme="primary" variant="text" onClick={() => onOperate(row.id, 'view')}>
            浏览
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className="list-page">
      <div className="list-toolbar">
        <div className="list-toolbar-left">
          <Button theme="primary" onClick={() => setShowPublish(true)}>
            发布动态
          </Button>
          <Button theme="default" variant="outline">
            导出列表
          </Button>
          <span className="selected-info">已选 {selectedRowKeys.length} 项</span>
        </div>
        <Input
          className="list-search"
          value={keyword}
          onChange={setKeyword}
          placeholder="请输入你需要搜索的型号"
          suffixIcon={<SearchIcon />}
          clearable
          onEnter={() => {
            if (page === 1) {
              fetchList();
              return;
            }
            setPage(1);
          }}
        />
      </div>

      <div className="list-table-wrap">
        <Table
          rowKey="id"
          data={rows}
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
            current: page,
            pageSize,
            total,
            showJumper: true,
            showPageSize: true,
            pageSizeOptions: PAGE_SIZE_OPTIONS,
            onCurrentChange: currentValue => {
              setPage(currentValue);
            },
            onPageSizeChange: size => {
              setPageSize(size);
              setPage(1);
            },
          }}
        />
      </div>

      <Dialog
        header="发布动态"
        visible={showPublish}
        onClose={() => setShowPublish(false)}
        onConfirm={onPublish}
      >
        <div className="form-grid">
          <Input
            value={publishForm.userId}
            onChange={value => setPublishForm(prev => ({ ...prev, userId: value }))}
            placeholder="用户UID（userId）"
          />
          <Input
            value={publishForm.content}
            onChange={value => setPublishForm(prev => ({ ...prev, content: value }))}
            placeholder="动态内容"
          />
          <Input
            value={publishForm.urls}
            onChange={value => setPublishForm(prev => ({ ...prev, urls: value }))}
            placeholder="图片URL，多个逗号分隔"
          />
          <Input
            value={publishForm.location}
            onChange={value => setPublishForm(prev => ({ ...prev, location: value }))}
            placeholder="位置"
          />
        </div>
      </Dialog>

      <Dialog
        header="图片预览"
        visible={Boolean(previewImage)}
        onClose={() => setPreviewImage('')}
        footer={false}
      >
        {previewImage ? <img className="moment-preview-image" src={previewImage} alt="preview" /> : null}
      </Dialog>
    </div>
  );
}
