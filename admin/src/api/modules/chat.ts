import { del, get, patch, post } from '../http';
import type { PageResult } from '../types';

export interface AddFriendPayload {
  friendId?: string;
  groupId?: number;
}

export interface AddGroupPayload {
  groupName: string;
  avatar?: string;
  intro?: string;
}

export interface UpdateGroupPayload {
  avatar?: string;
  groupName?: string;
  intro?: string;
  notice?: string;
}

export interface ChatLogQueryPayload {
  page: number;
  pageSize: number;
  receiverId?: string;
  groupId?: number;
}

export interface UpdateReadTimePayload {
  receiverId?: string;
  groupId?: number;
}

export interface AddGroupMemberPayload {
  groupId: number;
}

export function getFriendList() {
  return get<Array<Record<string, unknown>>>('/mobile/chat/friends');
}

export function addFriend(payload: AddFriendPayload) {
  return post<Record<string, unknown>, AddFriendPayload>('/mobile/chat/friends', payload);
}

export function deleteFriend(friendId: string) {
  return del<boolean>(`/mobile/chat/friends/${friendId}`);
}

export function getGroupList(groupName = '') {
  return get<Array<Record<string, unknown>>>('/mobile/chat/groups', {
    params: { groupName },
  });
}

export function addGroup(payload: AddGroupPayload) {
  return post<number, AddGroupPayload>('/mobile/chat/groups', payload);
}

export function deleteGroup(groupId: number) {
  return del<boolean>(`/mobile/chat/groups/${groupId}`);
}

export function updateGroup(groupId: number, payload: UpdateGroupPayload) {
  return patch<boolean, UpdateGroupPayload>(`/mobile/chat/groups/${groupId}`, payload);
}

export function getGroupMemberList(groupId: number) {
  return get<Array<Record<string, unknown>>>('/mobile/chat/groupMembers', {
    params: { groupId },
  });
}

export function addGroupMember(payload: AddGroupMemberPayload) {
  return post<number, AddGroupMemberPayload>('/mobile/chat/groupMembers', payload);
}

export function exitGroup(groupId: number) {
  return del<boolean>(`/mobile/chat/groupMembers/${groupId}`);
}

export function getChatLogs(payload: ChatLogQueryPayload) {
  return post<PageResult<Record<string, unknown>>, ChatLogQueryPayload>('/mobile/chat/logs', payload);
}

export function updateReadTime(payload: UpdateReadTimePayload) {
  return post<boolean, UpdateReadTimePayload>('/mobile/chat/updateReadTime', payload);
}

