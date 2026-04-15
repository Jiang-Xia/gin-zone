import { useMemo, useState } from 'react';
import { Avatar, Button, Dialog, Input, Table, Tag } from 'tdesign-react';
import { SearchIcon } from 'tdesign-icons-react';
import { addMoment, getMomentList, MomentItem, updateMoment } from '../../api/modules/moment';
import { useAuth } from '../../store/auth';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '../../constants/pagination';
import styles from './list.module.less';
import { useListPage } from '../../hooks/useListPage';
import { useDialogForm } from '../../hooks/useDialogForm';
import { useApiMessage } from '../../hooks/useApiMessage';
import PageContainer from '../../components/PageContainer';
import ListToolbar from '../../components/ListToolbar';

// 静态资源前缀（用于拼接图片完整访问地址）
const baseUrl = import.meta.env.VITE_BASE_URL;

export default function MomentListPage() {
  const { userInfo } = useAuth();
  const message = useApiMessage();
  // 关键字搜索
  const [keyword, setKeyword] = useState('');
  // 表格多选：记录选中行 id
  const [selectedRowKeys, setSelectedRowKeys] = useState<Array<string | number>>([]);
  // 图片预览弹窗：保存当前预览图片地址
  const [previewImage, setPreviewImage] = useState('');
  // 发布动态弹窗表单：复用弹窗状态与表单重置逻辑
  const {
    visible: showPublish,
    form: publishForm,
    setForm: setPublishForm,
    openDialog: openPublishDialog,
    closeDialog: closePublishDialog,
    resetForm: resetPublishForm,
  } = useDialogForm({
    initialValues: {
      content: '',
      urls: '',
      location: '',
      userId: String(userInfo?.userId ?? ''),
    },
  });
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

  // 操作：点赞/浏览量（示例接口）
  const onOperate = async (id: number, type: 'like' | 'view') => {
    try {
      await updateMoment(id, type);
      message.success(type === 'like' ? '点赞成功' : '浏览量更新成功');
      await reload();
    } catch (error) {
      message.error(error, '操作失败');
    }
  };

  // 发布动态：成功后关闭弹窗并清空表单
  const onPublish = async () => {
    try {
      await addMoment(publishForm);
      message.success('发布动态成功');
      resetPublishForm();
      closePublishDialog(false);
      await reload();
    } catch (error) {
      message.error(error, '发布失败');
    }
  };

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
    <PageContainer>
      <ListToolbar
        className={styles.toolbar}
        leftClassName={styles.toolbarLeft}
        left={
          <>
            <Button
              theme="primary"
              onClick={() =>
                openPublishDialog({
                  userId: String(userInfo?.userId ?? ''),
                })
              }
            >
              发布动态
            </Button>
            <Button theme="default" variant="outline">
              导出列表
            </Button>
            <span className={styles.selectedInfo}>已选 {selectedRowKeys.length} 项</span>
          </>
        }
        right={
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
        }
      />

      <div className={styles.tableWrap}>
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
        header="发布动态"
        visible={showPublish}
        onClose={() => closePublishDialog()}
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
        {previewImage ? <img className={styles.previewImage} src={previewImage} alt="preview" /> : null}
      </Dialog>
    </PageContainer>
  );
}
