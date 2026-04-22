import { useMemo, useState } from 'react';
import { Avatar, Button, Dialog, Form, Input, Popconfirm, Table } from 'tdesign-react';
import { SearchIcon } from 'tdesign-icons-react';
import PageContainer from '../../components/PageContainer';
import ListToolbar from '../../components/ListToolbar';
import commonStyles from '../../styles/common.module.less';
import { useApiMessage } from '../../hooks/useApiMessage';
import { useDialogForm } from '../../hooks/useDialogForm';
import { useListPage } from '../../hooks/useListPage';
import { getGroupMemberList } from '../../api/modules/chat';
import {
  getAdminChatGroups,
  removeAdminChatGroupMember,
  updateAdminChatGroup,
  type AdminChatGroupRow,
} from '../../api/modules/chatAdmin';

type GroupMemberRow = {
  id?: number;
  userId: string;
  groupId: number;
  userInfo?: { nickName?: string; userName?: string; avatar?: string };
  __key: string;
};

const { FormItem } = Form;

export default function ChatGroupsManagePage() {
  const message = useApiMessage();
  const [groupName, setGroupName] = useState('');
  // 中文注释：编辑群弹窗的表单初始值（不依赖 hook，便于排查回显问题）
  const initialEditForm = useMemo(
    () => ({
      id: 0,
      groupName: '',
      avatar: '',
      intro: '',
      notice: '',
    }),
    [],
  );
  const {
    visible: showEditDialog,
    form: editDialogData,
    dialogKey: editDialogKey,
    openDialog: openEditDialog,
    closeDialog: closeEditDialog,
    resetForm: resetEditDialogForm,
  } = useDialogForm({
    initialValues: initialEditForm,
    enableRemountKey: true,
  });
  // 中文注释：TDesign Form 采用“表单实例”管理字段值，提交读取统一走 getFieldsValue
  const [editForm] = Form.useForm();

  const { query, list, total, loading, reload } = useListPage<
    AdminChatGroupRow,
    { page: number; pageSize: number; groupName: string }
  >({
    initialQuery: { page: 1, pageSize: 20, groupName: '' },
    request: async (q) => {
      try {
        const res = await getAdminChatGroups({
          page: q.page,
          pageSize: q.pageSize,
          groupName: q.groupName || undefined,
        });
        return { list: res.list ?? [], total: res.total ?? 0 };
      } catch (error) {
        message.error(error, '获取群组列表失败');
        return { list: [], total: 0 };
      }
    },
  });

  const [membersDialogVisible, setMembersDialogVisible] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);
  const [members, setMembers] = useState<GroupMemberRow[]>([]);
  const [membersGroupId, setMembersGroupId] = useState(0);
  // 中文注释：群成员是“列表型弹窗”，默认给更大宽度，避免内容挤压
  const membersDialogWidth = useMemo(() => '60%', []);

  const membersTitle = useMemo(() => (membersGroupId ? `群成员（群ID：${membersGroupId}）` : '群成员'), [membersGroupId]);

  const openMembers = async (gid: number) => {
    setMembersDialogVisible(true);
    setMembersGroupId(gid);
    setMembersLoading(true);
    try {
      const res = await getGroupMemberList(gid);
      const next = ((res ?? []) as Array<{
        id?: number;
        userId: string;
        groupId: number;
        userInfo?: { nickName?: string; userName?: string; avatar?: string };
      }>).map((m) => ({
        ...m,
        __key: `${m.groupId}-${m.userId}`,
      }));
      setMembers(next);
    } catch (error) {
      message.error(error, '获取群成员失败');
      setMembers([]);
    } finally {
      setMembersLoading(false);
    }
  };

  const onSaveGroup = async () => {
    const values = (editForm?.getFieldsValue?.(true) ?? {}) as typeof initialEditForm;
    const gid = Number(values.id || 0);
    if (!gid) return;
    try {
      await updateAdminChatGroup(gid, {
        groupName: values.groupName?.trim() || undefined,
        avatar: values.avatar?.trim() || undefined,
        intro: values.intro?.trim() || undefined,
        notice: values.notice?.trim() || undefined,
      });
      message.success('保存成功');
      closeEditDialog(false);
      editForm?.reset?.();
      resetEditDialogForm();
      await reload();
    } catch (error) {
      message.error(error, '保存失败');
    }
  };

  const onRemoveMember = async (gid: number, uid: string) => {
    try {
      await removeAdminChatGroupMember(gid, uid);
      message.success('删除成员成功');
      await openMembers(gid);
    } catch (error) {
      message.error(error, '删除成员失败');
    }
  };

  const columns = [
    { colKey: 'id', title: '群ID', width: 90 },
    {
      colKey: 'avatar',
      title: '群头像',
      width: 100,
      cell: ({ row }: { row: AdminChatGroupRow }) => <Avatar size="small" image={row.avatar} />,
    },
    { colKey: 'groupName', title: '群名称', width: 220 },
    { colKey: 'userId', title: '群主(userId)', width: 180 },
    { colKey: 'ownerNickName', title: '群主昵称', width: 140, cell: ({ row }: { row: AdminChatGroupRow }) => row.ownerNickName || '-' },
    { colKey: 'intro', title: '介绍', ellipsis: true },
    { colKey: 'createdAt', title: '创建时间', width: 180, cell: ({ row }: { row: AdminChatGroupRow }) => row.createdAt || '-' },
    {
      colKey: 'operation',
      title: '操作',
      width: 220,
      fixed: 'right' as const,
      cell: ({ row }: { row: AdminChatGroupRow }) => (
        <>
          <Button
            size="small"
            theme="primary"
            variant="text"
            onClick={() => {
              // 中文注释：openDialog 支持 patch 回填；避免 setState 异步导致弹窗打开时未回显
              openEditDialog({
                id: Number(row.id),
                groupName: row.groupName || '',
                avatar: row.avatar || '',
                intro: row.intro || '',
                notice: row.notice || '',
              });
            }}
          >
            编辑
          </Button>
          <Button size="small" theme="primary" variant="text" onClick={() => openMembers(Number(row.id))}>
            群成员
          </Button>
        </>
      ),
    },
  ];

  return (
    <PageContainer>
      <ListToolbar
        left={
          <>
            <Button theme="default" variant="outline" onClick={() => reload({ page: 1, groupName })}>
              刷新列表
            </Button>
            <span className={commonStyles.selectedInfo}>共 {total} 项</span>
          </>
        }
        right={
          <Input
            className={commonStyles.search}
            value={groupName}
            onChange={setGroupName}
            placeholder="请输入群名称"
            suffixIcon={<SearchIcon />}
            clearable
            onEnter={() => reload({ page: 1, groupName })}
          />
        }
      />

      <Table
        rowKey="id"
        data={list}
        loading={loading}
        columns={columns}
        hover
        bordered
        stripe
        pagination={{
          current: query.page,
          pageSize: query.pageSize,
          total,
          onCurrentChange: (page) => reload({ page }),
          onPageSizeChange: (pageSize) => reload({ page: 1, pageSize }),
        }}
      />

      <Dialog header="编辑群聊" visible={showEditDialog} onClose={() => closeEditDialog()} onConfirm={onSaveGroup}>
        <Form
          key={editDialogKey}
          layout="vertical"
          labelAlign="left"
          className="ca-form-row"
          style={{ '--ca-form-label-width': '90px' } as React.CSSProperties}
          form={editForm}
          initialData={editDialogData}
        >
          <FormItem label="群ID" name="id">
            <Input disabled />
          </FormItem>
          <FormItem label="群名称" name="groupName">
            <Input placeholder="请输入群名称" />
          </FormItem>
          <FormItem label="头像 URL" name="avatar">
            <Input placeholder="https://..." />
          </FormItem>
          <FormItem label="群介绍" name="intro">
            <Input placeholder="请输入群介绍" />
          </FormItem>
          <FormItem label="群公告" name="notice">
            <Input placeholder="请输入群公告" />
          </FormItem>
        </Form>
      </Dialog>

      <Dialog
        header={membersTitle}
        visible={membersDialogVisible}
        onClose={() => setMembersDialogVisible(false)}
        footer={false}
        width={membersDialogWidth}
      >
        <Table
          rowKey="__key"
          data={members}
          loading={membersLoading}
          columns={[
            {
              colKey: 'userInfo',
              title: '成员',
              width: 240,
              cell: ({ row }: { row: GroupMemberRow }) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Avatar size="small" image={row.userInfo?.avatar} />
                  <span>{row.userInfo?.nickName || row.userInfo?.userName || '-'}</span>
                </div>
              ),
            },
            { colKey: 'userId', title: '成员 userId', width: 200 },
            {
              colKey: 'userInfo.nickName',
              title: '昵称',
              width: 140,
              cell: ({ row }: { row: GroupMemberRow }) => row.userInfo?.nickName || '-',
            },
            {
              colKey: 'userInfo.userName',
              title: '用户名',
              width: 160,
              cell: ({ row }: { row: GroupMemberRow }) => row.userInfo?.userName || '-',
            },
            {
              colKey: 'op',
              title: '操作',
              width: 120,
              fixed: 'right' as const,
              cell: ({ row }: { row: GroupMemberRow }) => (
                <Popconfirm content="确认删除该成员吗？" onConfirm={() => onRemoveMember(membersGroupId, row.userId)}>
                  <Button size="small" theme="danger" variant="text">
                    删除
                  </Button>
                </Popconfirm>
              ),
            },
          ]}
          bordered
          stripe
          hover
        />
      </Dialog>
    </PageContainer>
  );
}

