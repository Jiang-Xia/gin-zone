import { del, get, patch, post } from '../http';

export interface AdminListResult<T> {
  list: T[];
  total: number;
}

export interface AdminChatFriendsQuery {
  page?: number;
  pageSize?: number;
  userId?: string;
  friendId?: string;
  groupId?: number;
}

export interface AdminChatFriendRow {
  id: number;
  userId: string;
  userNickName?: string;
  userAvatar?: string;
  friendId?: string;
  friendNickName?: string;
  friendAvatar?: string;
  groupId?: number;
  groupName?: string;
  groupAvatar?: string;
  createdAt?: string;
}

export interface AdminChatGroupsQuery {
  page?: number;
  pageSize?: number;
  groupName?: string;
}

export interface AdminChatGroupRow {
  id: number;
  avatar?: string;
  groupName: string;
  intro?: string;
  notice?: string;
  userId: string;
  ownerNickName?: string;
  createdAt?: string;
}

export interface UpdateGroupPayload {
  avatar?: string;
  groupName?: string;
  intro?: string;
  notice?: string;
}

export interface AdminChatGroupDetail extends AdminChatGroupRow {
  ownerInfo?: {
    userId?: string;
    userName?: string;
    nickName?: string;
    avatar?: string;
  };
}

export interface AdminChatMessageQuery {
  page?: number;
  pageSize?: number;
  senderId?: string;
  groupId?: number;
  keyword?: string;
  msgType?: number;
  startAt?: string;
  endAt?: string;
}

export interface AdminChatMessageRow {
  id: number;
  senderId: string;
  receiverId: string;
  groupId: number;
  content: string;
  logType: number;
  msgType: number;
  isRevoked: boolean;
  isDeleted: boolean;
  createdAt?: string;
}

export function getAdminChatFriends(query: AdminChatFriendsQuery) {
  return get<AdminListResult<AdminChatFriendRow>>('/admin/chat/friends', { params: query });
}

export function deleteAdminChatFriendRelation(id: number) {
  return del<boolean>(`/admin/chat/friends/${id}`);
}

export function getAdminChatGroups(query: AdminChatGroupsQuery) {
  return get<AdminListResult<AdminChatGroupRow>>('/admin/chat/groups', { params: query });
}

export function updateAdminChatGroup(groupId: number, payload: UpdateGroupPayload) {
  return patch<boolean, UpdateGroupPayload>(`/admin/chat/groups/${groupId}`, payload);
}

export function getAdminChatGroupDetail(groupId: number) {
  return get<AdminChatGroupDetail>(`/admin/chat/groups/${groupId}`);
}

export function dissolveAdminChatGroup(groupId: number) {
  return del<boolean>(`/admin/chat/groups/${groupId}`);
}

export function transferAdminChatGroupOwner(groupId: number, targetUserId: string) {
  return post<boolean, { targetUserId: string }>(`/admin/chat/groups/${groupId}/transferOwner`, {
    targetUserId,
  });
}

export function removeAdminChatGroupMember(groupId: number, userId: string) {
  return del<boolean>(`/admin/chat/groupMembers/${groupId}/${encodeURIComponent(userId)}`);
}

export function getAdminChatMessages(query: AdminChatMessageQuery) {
  return get<AdminListResult<AdminChatMessageRow>>('/admin/chat/messages', { params: query });
}

export function revokeAdminChatMessage(id: number) {
  return post<boolean, { id: number }>('/admin/chat/messages/revoke', { id });
}

export function deleteAdminChatMessage(id: number) {
  return post<boolean, { id: number }>('/admin/chat/messages/delete', { id });
}

