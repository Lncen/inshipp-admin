import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace UserApi {
  // 用户信息接口定义
  export interface UserInfo {
    id: string;
    groups: string[];
    last_login: null | string;
    is_superuser: boolean;
    username: string;
    email: string;
    is_staff: boolean;
    is_active: boolean;
    date_joined: string;
    nickname: string;
    bio: string;
    gender: string;
    birth_date: null | string;
    phone: null | string;
    is_verified: boolean;
    level: number;
    is_deleted: boolean;
    deleted_at: null | string;
    user_permissions: number[];
    role: string[];
  }

  // 用户列表查询参数
  export interface UserQueryParams {
    page?: number;
    page_size?: number;
    username?: string;
    is_active?: boolean;
    // 可根据实际需求添加更多查询参数
  }

  // 用户列表响应数据
  export interface UserListResponse {
    count: number;
    next: null | string;
    previous: null | string;
    results: UserInfo[];
  }

  // 创建用户请求参数
  export interface CreateUserParams {
    username: string;
    email: string;
    nickname: string;
    gender: string;
    [key: string]: any; // 其他可选参数
  }

  // 更新用户请求参数
  export interface UpdateUserParams extends Partial<CreateUserParams> {
    id: number;
  }
}

/**
 * 获取分组列表数据
 */
async function getGroupsList() {
  return requestClient.get<Array<UserApi.UserInfo>>('user/active_groups');
}

/**
 * 获取角色列表数据
 */
async function getUserList(params: Recordable<any>) {
  return requestClient.get<Array<UserApi.UserInfo>>('user', {
    params,
  });
}

/**
 * 创建角色
 * @param data 角色数据
 */
async function createUser(data: Recordable<any>) {
  return requestClient.post('user', data);
}

/**
 * 密码修改
 * @param data 角色数据
 */
async function setPasswordUser(data: Recordable<any>) {
  return requestClient.post('user/change_password', data);
}

/**
 * 更新角色
 *
 * @param id 角色 ID
 * @param data 角色数据
 */
async function updateUser(id: string, data: Recordable<any>) {
  return requestClient.put(`user/${id}`, data);
}

/**
 * 删除角色
 * @param id 角色 ID
 */
async function deleteUser(id: string) {
  return requestClient.delete(`user//dele/${id}`);
}

export {
  createUser,
  deleteUser,
  getGroupsList,
  getUserList,
  setPasswordUser,
  updateUser,
};
