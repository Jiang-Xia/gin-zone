import { useMemo, useState } from 'react';
import { Button, Input } from 'tdesign-react';
import PageContainer from '../../components/PageContainer';
import ListToolbar from '../../components/ListToolbar';
import { useApiMessage } from '../../hooks/useApiMessage';
import { signInApi } from '../../api/modules/common';
import { chatGpt, chatGptApi, getGuShiCi } from '../../api/modules/third';
import {
  addFriend,
  addGroup,
  addGroupMember,
  deleteFriend,
  deleteGroup,
  exitGroup,
  getChatLogs,
  getFriendList,
  getGroupList,
  getGroupMemberList,
  updateReadTime,
} from '../../api/modules/chat';
import {
  getBlogArticleInfo,
  getBlogArticleViews,
  getBlogCategory,
  getBlogCommentAll,
  getBlogDailyImage,
  getBlogTag,
  getTradeQuery,
  postBlogArticleList,
  postPayH5OpenMini,
  postPayOpenid,
  postTradeClose,
  postTradeCreate,
  postTradeRefund,
} from '../../api/modules/blog';
import { getAdminMomentList } from '../../api/modules/admin';

function pretty(data: unknown) {
  return JSON.stringify(data, null, 2);
}

function safeJsonParse(value: string) {
  if (!value.trim()) {
    return {};
  }
  return JSON.parse(value) as Record<string, unknown>;
}

export default function ApiExplorerPage() {
  const message = useApiMessage();
  const [result, setResult] = useState('');
  const [groupName, setGroupName] = useState('');
  const [friendId, setFriendId] = useState('');
  const [groupId, setGroupId] = useState('');
  const [receiverId, setReceiverId] = useState('');
  const [chatPrompt, setChatPrompt] = useState('');
  const [chatApiMessage, setChatApiMessage] = useState('');
  const [queryJson, setQueryJson] = useState('{}');
  const [payloadJson, setPayloadJson] = useState('{}');

  const parsedGroupId = useMemo(() => Number(groupId || 0), [groupId]);

  const run = async (action: () => Promise<unknown>, successText: string) => {
    try {
      const data = await action();
      setResult(pretty(data));
      message.success(successText);
    } catch (error) {
      message.error(error, successText.replace('成功', '失败'));
    }
  };

  return (
    <PageContainer>
      <ListToolbar
        left={<span>接口控制台（覆盖 server 已开放接口）</span>}
        right={<span>说明：WebSocket 接口请在移动端页面联调</span>}
      />

      <div className="page-subsection">
        <div className="subsection-title">Common / Third / Admin</div>
        <div className="form-grid">
          <Button onClick={() => run(() => signInApi(), '调用 signIn 成功')}>POST /common/signIn</Button>
          <Button onClick={() => run(() => getGuShiCi(false), '获取古诗词成功')}>GET /third/gushici</Button>
          <Button onClick={() => run(() => getGuShiCi(true), '刷新古诗词成功')}>GET /third/gushici?refresh=1</Button>
          <Input value={chatPrompt} onChange={setChatPrompt} placeholder="chatGPT prompt" />
          <Button onClick={() => run(() => chatGpt({ prompt: chatPrompt }), '调用 chatGPT 成功')}>POST /third/chatGPT</Button>
          <Input value={chatApiMessage} onChange={setChatApiMessage} placeholder="chatGPTApi message" />
          <Button onClick={() => run(() => chatGptApi({ message: chatApiMessage }), '调用 chatGPTApi 成功')}>
            POST /third/chatGPTApi
          </Button>
          <Button onClick={() => run(() => getAdminMomentList(), '获取 admin moments 成功')}>GET /admin/moments</Button>
        </div>
      </div>

      <div className="page-subsection">
        <div className="subsection-title">Mobile Chat</div>
        <div className="form-grid">
          <Input value={friendId} onChange={setFriendId} placeholder="friendId" />
          <Input value={groupId} onChange={setGroupId} placeholder="groupId" />
          <Input value={groupName} onChange={setGroupName} placeholder="groupName" />
          <Input value={receiverId} onChange={setReceiverId} placeholder="receiverId" />
          <Button onClick={() => run(() => getFriendList(), '获取好友列表成功')}>GET /mobile/chat/friends</Button>
          <Button onClick={() => run(() => addFriend({ friendId }), '添加好友成功')}>POST /mobile/chat/friends</Button>
          <Button onClick={() => run(() => deleteFriend(friendId), '删除好友成功')}>DELETE /mobile/chat/friends/:friendId</Button>
          <Button onClick={() => run(() => getGroupList(groupName), '获取群组成功')}>GET /mobile/chat/groups</Button>
          <Button onClick={() => run(() => addGroup({ groupName }), '创建群组成功')}>POST /mobile/chat/groups</Button>
          <Button onClick={() => run(() => deleteGroup(parsedGroupId), '删除群组成功')}>DELETE /mobile/chat/groups/:groupId</Button>
          <Button onClick={() => run(() => getGroupMemberList(parsedGroupId), '获取群成员成功')}>
            GET /mobile/chat/groupMembers
          </Button>
          <Button onClick={() => run(() => addGroupMember({ groupId: parsedGroupId }), '添加群成员成功')}>
            POST /mobile/chat/groupMembers
          </Button>
          <Button onClick={() => run(() => exitGroup(parsedGroupId), '退出群成功')}>
            DELETE /mobile/chat/groupMembers/:groupId
          </Button>
          <Button
            onClick={() =>
              run(
                () =>
                  getChatLogs({
                    page: 1,
                    pageSize: 20,
                    receiverId,
                    groupId: parsedGroupId || undefined,
                  }),
                '获取聊天记录成功',
              )
            }
          >
            POST /mobile/chat/logs
          </Button>
          <Button
            onClick={() =>
              run(
                () =>
                  updateReadTime({
                    receiverId,
                    groupId: parsedGroupId || undefined,
                  }),
                '更新阅读时间成功',
              )
            }
          >
            POST /mobile/chat/updateReadTime
          </Button>
        </div>
      </div>

      <div className="page-subsection">
        <div className="subsection-title">Blog 代理接口</div>
        <div className="form-grid">
          <Input value={queryJson} onChange={setQueryJson} placeholder="query json" />
          <Input value={payloadJson} onChange={setPayloadJson} placeholder="payload json" />
          <Button onClick={() => run(() => postBlogArticleList(safeJsonParse(payloadJson)), '查询文章列表成功')}>
            POST /blog/article/list
          </Button>
          <Button onClick={() => run(() => getBlogArticleInfo(safeJsonParse(queryJson)), '获取文章详情成功')}>
            GET /blog/article/info
          </Button>
          <Button onClick={() => run(() => getBlogTag(safeJsonParse(queryJson)), '获取标签成功')}>GET /blog/tag</Button>
          <Button onClick={() => run(() => getBlogCategory(safeJsonParse(queryJson)), '获取分类成功')}>
            GET /blog/category
          </Button>
          <Button onClick={() => run(() => getBlogCommentAll(safeJsonParse(queryJson)), '获取评论成功')}>
            GET /blog/comment/findAll
          </Button>
          <Button onClick={() => run(() => getBlogArticleViews(safeJsonParse(queryJson)), '获取浏览统计成功')}>
            GET /blog/article/views
          </Button>
          <Button onClick={() => run(() => getBlogDailyImage(safeJsonParse(queryJson)), '获取每日图成功')}>
            GET /blog/resources/daily-img
          </Button>
          <Button onClick={() => run(() => postTradeCreate(safeJsonParse(payloadJson)), '创建交易成功')}>
            POST /blog/pay/trade/create
          </Button>
          <Button onClick={() => run(() => getTradeQuery(safeJsonParse(queryJson)), '查询交易成功')}>
            GET /blog/pay/trade/query
          </Button>
          <Button onClick={() => run(() => postTradeRefund(safeJsonParse(payloadJson)), '交易退款成功')}>
            POST /blog/pay/trade/refund
          </Button>
          <Button onClick={() => run(() => postTradeClose(safeJsonParse(payloadJson)), '关闭交易成功')}>
            POST /blog/pay/trade/close
          </Button>
          <Button onClick={() => run(() => postPayOpenid(safeJsonParse(payloadJson)), '获取 openid 成功')}>
            POST /blog/pay/openid
          </Button>
          <Button onClick={() => run(() => postPayH5OpenMini(safeJsonParse(payloadJson)), 'h5-open-mini 成功')}>
            POST /blog/pay/h5-open-mini
          </Button>
        </div>
      </div>

      <div className="page-subsection">
        <div className="subsection-title">响应结果</div>
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{result || '暂无结果'}</pre>
      </div>
    </PageContainer>
  );
}

