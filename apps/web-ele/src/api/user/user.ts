import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace Api {
  // 用户信息接口定义
  export interface Item {
    id: '';
    username: string;
    invite_code: string;
    date_joined: string;
    last_login: string;
    registration_ip: null | string;
    last_login_ip: null | string;
    order_count: number;
    invite_count: number;
    invited_by_nickname: string;
    source_display: string;
    is_verified: boolean;
    level: string;
    device_id: string;
    is_deleted: boolean;
    deleted_at: null | string;
    balance: string;
    nickname?: string;
    phone?: string;
    gender?: 'female' | 'male' | 'secret';
    bio?: string;
    email?: string;
    display_avatar?: string;
    remark?: string;
    is_active?: boolean;
    groups?: number[];
  }

  // 编辑字段
  export interface EditableFields {
    id?: string;
    nickname?: string;
    phone?: string;
    gender?: 'female' | 'male' | 'secret';
    bio?: string;
    email?: string;
    display_avatar?: string;
    remark?: string;
    is_active?: boolean;
    groups?: number[];
  }

  // 用户列表查询参数
  export interface QueryParams {
    page?: number;
    page_size?: number;
    username?: string;
    is_active?: boolean;
    // 可根据实际需求添加更多查询参数
  }

  // 用户列表响应数据
  export interface ListResponse {
    count: number;
    next: null | string;
    previous: null | string;
    results: Item[];
    group_names: [];
  }

  // 创建用户请求参数
  export interface CreateParams {
    username: string;
    email: string;
    nickname: string;
    gender: string;
    [key: string]: any; // 其他可选参数
  }

  // 更新用户请求参数
  export interface UpdateParams extends Partial<CreateParams> {
    id: number;
  }
}

/**
 * 获取分组列表数据
 */
async function getGroupsList() {
  return requestClient.get('role/all');
}

/**
 * 获取角色列表数据
 */
async function getList(params: Recordable<any>) {
  return requestClient.get<Array<Api.Item>>('user', {
    params,
  });
}

/**
 * 获取用户详情
 */
async function getInfo(id: Api.Item['id']) {
  return requestClient.get<Api.Item>(`user/${id}`);
}

/**
 * 创建角色
 * @param data 角色数据
 */
async function create(data: Recordable<any>) {
  return requestClient.post('add/user', data);
}

/**
 * 密码修改
 * @param data 角色数据
 */
async function setPassword(data: Recordable<any>) {
  return requestClient.post('user/change_password', data);
}

/**
 * 更新
 *
 * @param id ID
 * @param data 数据
 */
async function update(id: string, data: Recordable<any>) {
  return requestClient.put(`user/${id}`, data);
}

/**
 * 软删除用户
 * @param id 用户 ID
 */
async function del(id: Api.Item['id']) {
  return requestClient.post(`user/${id}/soft_delete`);
}

/**
 * 恢复用户
 * @param id 用户 ID
 */
async function drestore(id: string) {
  return requestClient.post(`user/${id}/restore`);
}

export {
  create,
  del,
  drestore,
  getGroupsList,
  getInfo,
  getList,
  setPassword,
  update,
};
