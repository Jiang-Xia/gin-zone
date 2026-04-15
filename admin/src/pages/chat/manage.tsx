import { useMemo, useState } from 'react';
import { Button, Input, Popconfirm, Table } from 'tdesign-react';
import { SearchIcon } from 'tdesign-icons-react';
import PageContainer from '../../components/PageContainer';
import ListToolbar from '../../components/ListToolbar';
import { useApiMessage } from '../../hooks/useApiMessage';
import {
  deleteFriend,
  deleteGroup,
  getChatLogs,
  getFriendList,
  getGroupList,
  getGroupMemberList,
} from '../../api/modules/chat';

export default function ChatManagePage() {
  const message = useApiMessage();
  const [friendId, setFriendId] = useState('');
  const [groupId, setGroupId] = useState('');
  const [groupName, setGroupName] = useState('');
  const [receiverId, setReceiverId] = useState('');
  const [friends, setFriends] = useState<Array<Record<string, unknown>>>([]);
  const [groups, setGroups] = useState<Array<Record<string, unknown>>>([]);
  const [groupMembers, setGroupMembers] = useState<Array<Record<string, unknown>>>([]);
  const [chatLogs, setChatLogs] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(false);

  const parsedGroupId = useMemo(() => Number(groupId || 0), [groupId]);

  const run = async (action: () => Promise<void>) => {
    setLoading(true);
    try {
      await action();
    } catch (error) {
      message.error(error, '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <ListToolbar
        left={<span>聊天管理（关系维护、记录查询）</span>}
        right={
          <Input
            value={receiverId}
            onChange={setReceiverId}
            placeholder="聊天对象 receiverId（用于查询聊天记录）"
            suffixIcon={<SearchIcon />}
            clearable
          />
        }
      />

      <div className="page-subsection">
        <div className="subsection-title">好友管理</div>
        <div className="form-grid inline-form">
          <Input value={friendId} onChange={setFriendId} placeholder="friendId" />
          <Button onClick={() => run(async () => setFriends(await getFriendList()))}>刷新好友列表</Button>
          <Popconfirm
            content="确认删除该好友关系吗？"
            onConfirm={() =>
              run(async () => {
                await deleteFriend(friendId);
                message.success('删除好友成功');
                setFriends(await getFriendList());
              })
            }
          >
            <Button theme="danger" disabled={!friendId.trim()}>
              删除好友
            </Button>
          </Popconfirm>
        </div>
        <Table
          rowKey="id"
          data={friends}
          loading={loading}
          columns={[
            { colKey: 'id', title: 'ID', width: 100 },
            { colKey: 'userId', title: '用户ID', width: 160 },
            { colKey: 'friendId', title: '好友ID', width: 160 },
            { colKey: 'groupId', title: '群组ID', width: 120 },
          ]}
          bordered
          stripe
          hover
        />
      </div>

      <div className="page-subsection">
        <div className="subsection-title">群组管理</div>
        <div className="form-grid inline-form">
          <Input value={groupName} onChange={setGroupName} placeholder="groupName（支持查询）" />
          <Input value={groupId} onChange={setGroupId} placeholder="groupId" />
          <Button onClick={() => run(async () => setGroups(await getGroupList(groupName)))}>刷新群组列表</Button>
          <Popconfirm
            content="确认删除该群组吗？"
            onConfirm={() =>
              run(async () => {
                await deleteGroup(parsedGroupId);
                message.success('删除群组成功');
                setGroups(await getGroupList(groupName));
              })
            }
          >
            <Button theme="danger" disabled={!parsedGroupId}>
              删除群组
            </Button>
          </Popconfirm>
          <Button onClick={() => run(async () => setGroupMembers(await getGroupMemberList(parsedGroupId)))}>
            查看群成员
          </Button>
        </div>
        <Table
          rowKey="id"
          data={groups}
          loading={loading}
          columns={[
            { colKey: 'id', title: '群ID', width: 100 },
            { colKey: 'groupName', title: '群名称', width: 200 },
            { colKey: 'userId', title: '创建者', width: 160 },
            { colKey: 'createdAt', title: '创建时间', width: 180 },
          ]}
          bordered
          stripe
          hover
        />
        <Table
          rowKey="id"
          data={groupMembers}
          loading={loading}
          columns={[
            { colKey: 'id', title: 'ID', width: 100 },
            { colKey: 'groupId', title: '群ID', width: 120 },
            { colKey: 'userId', title: '成员ID', width: 180 },
          ]}
          bordered
          stripe
          hover
        />
      </div>

      <div className="page-subsection">
        <div className="subsection-title">聊天记录</div>
        <Button
          theme="primary"
          onClick={() =>
            run(async () => {
              const res = await getChatLogs({
                page: 1,
                pageSize: 20,
                receiverId,
                groupId: parsedGroupId || undefined,
              });
              setChatLogs(res.list ?? []);
            })
          }
        >
          查询聊天记录
        </Button>
        <Table
          rowKey="id"
          data={chatLogs}
          loading={loading}
          columns={[
            { colKey: 'id', title: 'ID', width: 100 },
            { colKey: 'senderId', title: '发送者', width: 160 },
            { colKey: 'receiverId', title: '接收者', width: 160 },
            { colKey: 'content', title: '内容', ellipsis: true },
            { colKey: 'createdAt', title: '时间', width: 180 },
          ]}
          bordered
          stripe
          hover
        />
      </div>
    </PageContainer>
  );
}

