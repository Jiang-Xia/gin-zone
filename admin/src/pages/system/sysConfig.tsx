import { useEffect, useMemo, useState } from 'react';
import { Button, Dialog, Form, Input, Popconfirm, Table } from 'tdesign-react';
import PageContainer from '../../components/PageContainer';
import ListToolbar from '../../components/ListToolbar';
import { useApiMessage } from '../../hooks/useApiMessage';
import { useDialogForm } from '../../hooks/useDialogForm';
import {
  createSysConfig,
  deleteSysConfig,
  getSysConfigList,
  updateSysConfig,
  type SysConfigItem,
} from '../../api/modules/adminSystem';

type EditableConfig = SysConfigItem & { __key: string };
type SysConfigDialogForm = {
  id: number;
  configKey: string;
  configValue: string;
  remark: string;
};

const { FormItem } = Form;

export default function SysConfigPage() {
  const message = useApiMessage();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<EditableConfig[]>([]);
  const initialForm = useMemo<SysConfigDialogForm>(
    () => ({ id: 0, configKey: '', configValue: '', remark: '' }),
    [],
  );
  const {
    visible: dialogVisible,
    form: dialogForm,
    dialogKey,
    openDialog,
    closeDialog,
    resetForm,
  } = useDialogForm<SysConfigDialogForm>({
    initialValues: initialForm,
    enableRemountKey: true,
  });
  // 中文注释：新增/编辑共用一个弹窗，id=0 视为新增
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      const res = await getSysConfigList();
      const next = (res || []).map((item, idx) => ({ ...item, __key: `${item.configKey}-${idx}` }));
      setList(next);
    } catch (error) {
      message.error(error, '获取系统配置失败');
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const openCreateDialog = () => {
    openDialog(initialForm);
  };

  const openEditDialog = (row: EditableConfig) => {
    openDialog({
      id: Number(row.id || 0),
      configKey: row.configKey || '',
      configValue: row.configValue || '',
      remark: row.remark || '',
    });
  };

  const onSaveDialog = async () => {
    const values = (form?.getFieldsValue?.(true) ?? {}) as SysConfigDialogForm;
    const configKey = String(values.configKey || '').trim();
    if (!configKey) {
      message.warning('配置键不能为空');
      return;
    }
    try {
      if (Number(values.id || 0) > 0) {
        await updateSysConfig(Number(values.id), {
          configValue: String(values.configValue || ''),
          remark: String(values.remark || ''),
        });
      } else {
        await createSysConfig({
          configKey,
          configValue: String(values.configValue || ''),
          remark: String(values.remark || ''),
        });
      }
      message.success('保存成功');
      closeDialog(false);
      form?.reset?.();
      resetForm();
      await load();
    } catch (error) {
      message.error(error, '保存失败');
    }
  };

  const onDelete = async (id?: number) => {
    if (!id) return;
    try {
      await deleteSysConfig(id);
      message.success('删除成功');
      await load();
    } catch (error) {
      message.error(error, '删除失败');
    }
  };

  return (
    <PageContainer>
      <ListToolbar
        left={
          <>
            <Button theme="primary" onClick={openCreateDialog}>
              新增配置
            </Button>
            <Button theme="default" variant="outline" onClick={load}>
              刷新
            </Button>
          </>
        }
      />
      <Table
        rowKey="__key"
        data={list}
        loading={loading}
        columns={[
          { colKey: 'id', title: 'ID', width: 90 },
          { colKey: 'configKey', title: '配置键', width: 220 },
          { colKey: 'configValue', title: '配置值', ellipsis: true },
          { colKey: 'remark', title: '说明', width: 280, ellipsis: true },
          {
            colKey: 'operation',
            title: '操作',
            width: 160,
            fixed: 'right' as const,
            cell: ({ row }: { row: EditableConfig }) => (
              <>
                <Button size="small" theme="primary" variant="text" onClick={() => openEditDialog(row)}>
                  编辑
                </Button>
                <Popconfirm content="确认删除该配置吗？" onConfirm={() => onDelete(row.id)}>
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
      />

      <Dialog
        header={Number(dialogForm.id || 0) > 0 ? '编辑系统配置' : '新增系统配置'}
        visible={dialogVisible}
        onClose={() => closeDialog()}
        onConfirm={onSaveDialog}
      >
        <Form
          key={dialogKey}
          layout="vertical"
          form={form}
          initialData={dialogForm}
          labelAlign="left"
          className="ca-form-row"
          style={{ '--ca-form-label-width': '90px' } as React.CSSProperties}
        >
          <FormItem label="配置ID" name="id">
            <Input disabled />
          </FormItem>
          <FormItem label="配置键" name="configKey">
            <Input placeholder="例如：register.enabled" disabled={Number(dialogForm.id || 0) > 0} />
          </FormItem>
          <FormItem label="配置值" name="configValue">
            <Input placeholder="请输入配置值" />
          </FormItem>
          <FormItem label="说明" name="remark">
            <Input placeholder="请输入配置说明（选填）" />
          </FormItem>
        </Form>
      </Dialog>
    </PageContainer>
  );
}
