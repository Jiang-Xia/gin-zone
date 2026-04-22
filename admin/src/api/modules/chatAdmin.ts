import { del, get, patch } from '../http';

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

export function removeAdminChatGroupMember(groupId: number, userId: string) {
  return del<boolean>(`/admin/chat/groupMembers/${groupId}/${encodeURIComponent(userId)}`);
}

