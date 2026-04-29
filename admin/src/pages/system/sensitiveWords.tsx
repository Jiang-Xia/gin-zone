import { useMemo, useState } from 'react';
import { Button, Dialog, Form, Input, Popconfirm, Select, Table } from 'tdesign-react';
import PageContainer from '../../components/PageContainer';
import ListToolbar from '../../components/ListToolbar';
import { useApiMessage } from '../../hooks/useApiMessage';
import { useDialogForm } from '../../hooks/useDialogForm';
import { useListPage } from '../../hooks/useListPage';
import {
  createSensitiveWord,
  deleteSensitiveWord,
  getSensitiveWords,
  updateSensitiveWord,
  type SensitiveWordRow,
} from '../../api/modules/sensitiveWord';

type SensitiveWordForm = {
  id: number;
  word: string;
  status: number;
  level: number;
  remark: string;
};

const { FormItem } = Form;

export default function SensitiveWordsPage() {
  const message = useApiMessage();
  const [word, setWord] = useState('');
  const [status, setStatus] = useState<number>(-1);
  const [level, setLevel] = useState<number>(-1);
  // 当前正在切换启用/禁用状态的行 id，用于按钮 loading/disabled
  const [togglingId, setTogglingId] = useState<number>(0);
  const initialForm = useMemo<SensitiveWordForm>(() => ({ id: 0, word: '', status: 1, level: 3, remark: '' }), []);
  const { visible, form: dialogData, dialogKey, openDialog, closeDialog, resetForm } = useDialogForm<SensitiveWordForm>({
    initialValues: initialForm,
    enableRemountKey: true,
  });
  const [form] = Form.useForm();

  const wordsList = useListPage<SensitiveWordRow, { page: number; pageSize: number; word: string; status: number; level: number }>({
    initialQuery: { page: 1, pageSize: 20, word: '', status: -1, level: -1 },
    request: async (q) => {
      try {
        return await getSensitiveWords(q);
      } catch (error) {
        message.error(error, '获取敏感词失败');
        return { list: [], total: 0 };
      }
    },
  });

  const onSave = async () => {
    const values = (form?.getFieldsValue?.(true) ?? {}) as SensitiveWordForm;
    if (!String(values.word || '').trim()) {
      message.warning('敏感词不能为空');
      return;
    }
    try {
      if (Number(values.id || 0) > 0) {
        await updateSensitiveWord(Number(values.id), {
          word: String(values.word || '').trim(),
          status: Number(values.status || 0),
          level: Number(values.level || 3),
          remark: String(values.remark || ''),
        });
      } else {
        await createSensitiveWord({
          word: String(values.word || '').trim(),
          status: Number(values.status || 1),
          level: Number(values.level || 3),
          remark: String(values.remark || ''),
        });
      }
      message.success('保存成功');
      closeDialog(false);
      form?.reset?.();
      resetForm();
      await wordsList.reload();
    } catch (error) {
      message.error(error, '保存失败');
    }
  };

  const onDelete = async (id: number) => {
    try {
      await deleteSensitiveWord(id);
      message.success('删除成功');
      await wordsList.reload();
    } catch (error) {
      message.error(error, '删除失败');
    }
  };

  const onToggleStatus = async (row: SensitiveWordRow) => {
    const id = Number(row?.id || 0);
    if (id <= 0) return;
    const nextStatus = row.status ? 0 : 1;
    try {
      setTogglingId(id);
      await updateSensitiveWord(id, { status: nextStatus });
      message.success(nextStatus ? '已启用' : '已禁用');
      await wordsList.reload();
    } catch (error) {
      message.error(error, '操作失败');
    } finally {
      setTogglingId(0);
    }
  };

  return (
    <PageContainer>
      <ListToolbar
        left={
          <>
            <Button theme="primary" onClick={() => openDialog(initialForm)}>
              新增敏感词
            </Button>
            <Button theme="default" variant="outline" onClick={() => wordsList.reload({ page: 1, word, status, level })}>
              刷新
            </Button>
            <span>共 {wordsList.total} 项</span>
          </>
        }
        right={
          <div style={{ display: 'flex', gap: 8 }}>
            <Input value={word} onChange={setWord} placeholder="敏感词关键词" clearable />
            <Select
              value={status}
              options={[
                { label: '全部状态', value: -1 },
                { label: '启用', value: 1 },
                { label: '禁用', value: 0 },
              ]}
              onChange={(value) => setStatus(Number(value))}
              style={{ width: 120 }}
            />
            <Select
              value={level}
              options={[
                { label: '全部等级', value: -1 },
                { label: '低危', value: 1 },
                { label: '中危', value: 2 },
                { label: '高危', value: 3 },
              ]}
              onChange={(value) => setLevel(Number(value))}
              style={{ width: 120 }}
            />
            <Button theme="primary" onClick={() => wordsList.reload({ page: 1, word, status, level })}>
              查询
            </Button>
          </div>
        }
      />

      <Table
        rowKey="id"
        data={wordsList.list}
        loading={wordsList.loading}
        columns={[
          { colKey: 'id', title: 'ID', width: 90 },
          { colKey: 'word', title: '敏感词', width: 220 },
          { colKey: 'status', title: '状态', width: 100, cell: ({ row }: { row: SensitiveWordRow }) => (row.status ? '启用' : '禁用') },
          {
            colKey: 'level',
            title: '等级',
            width: 100,
            cell: ({ row }: { row: SensitiveWordRow }) => (row.level === 3 ? '高危' : row.level === 2 ? '中危' : '低危'),
          },
          { colKey: 'remark', title: '备注', ellipsis: true },
          { colKey: 'createdAt', title: '创建时间', width: 180 },
          {
            colKey: 'operation',
            title: '操作',
            width: 220,
            fixed: 'right' as const,
            cell: ({ row }: { row: SensitiveWordRow }) => (
              <>
                <Button
                  size="small"
                  theme="primary"
                  variant="text"
                  onClick={() => openDialog({ id: row.id, word: row.word, status: row.status, level: row.level || 3, remark: row.remark || '' })}
                >
                  编辑
                </Button>
                <Popconfirm
                  content={row.status ? '确认禁用该敏感词吗？' : '确认启用该敏感词吗？'}
                  onConfirm={() => onToggleStatus(row)}
                >
                  <Button
                    size="small"
                    theme={row.status ? 'warning' : 'success'}
                    variant="text"
                    loading={togglingId === row.id}
                    disabled={togglingId === row.id}
                  >
                    {row.status ? '禁用' : '启用'}
                  </Button>
                </Popconfirm>
                <Popconfirm content="确认删除该敏感词吗？" onConfirm={() => onDelete(row.id)}>
                  <Button size="small" theme="danger" variant="text">
                    删除
                  </Button>
                </Popconfirm>
              </>
            ),
          },
        ]}
        hover
        bordered
        stripe
        pagination={{
          current: wordsList.query.page,
          pageSize: wordsList.query.pageSize,
          total: wordsList.total,
          onCurrentChange: (page) => wordsList.reload({ page }),
          onPageSizeChange: (pageSize) => wordsList.reload({ page: 1, pageSize }),
        }}
      />

      <Dialog header={Number(dialogData.id || 0) > 0 ? '编辑敏感词' : '新增敏感词'} visible={visible} onClose={() => closeDialog()} onConfirm={onSave}>
        <Form key={dialogKey} layout="vertical" form={form} initialData={dialogData} labelAlign="left">
          <FormItem label="ID" name="id">
            <Input disabled />
          </FormItem>
          <FormItem label="敏感词" name="word">
            <Input placeholder="请输入敏感词" />
          </FormItem>
          <FormItem label="状态" name="status">
            <Select options={[{ label: '启用', value: 1 }, { label: '禁用', value: 0 }]} />
          </FormItem>
          <FormItem label="等级" name="level">
            <Select options={[{ label: '低危', value: 1 }, { label: '中危', value: 2 }, { label: '高危', value: 3 }]} />
          </FormItem>
          <FormItem label="备注" name="remark">
            <Input placeholder="请输入备注（选填）" />
          </FormItem>
        </Form>
      </Dialog>
    </PageContainer>
  );
}
