import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace Api {
  // 单个钱包记录的类型
  export interface Item {
    id: number;
    user_id: number;
    username: string;
    phone: string;
    email: string;
    balance: string;
    frozen_balance?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
  }

  export interface ListResponse {
    count: number;
    next: null | string;
    previous: null | string;
    results: Item[];
    total_balance: string; // 所有钱包余额总和，字符串格式
  }

  export interface ListQueryParams {
    keyword?: string; // 搜索关键词（用户名/手机/邮箱）
    page?: number;
    page_size?: number;
  }
}

/**
 * 获取列表数据
 */
async function getList(params?: Api.ListQueryParams) {
  return requestClient.get<Api.ListResponse>('admin/wallets', {
    params,
  });
}

/**
 * 查询用户
 */
async function getUserByUsername(params?: Api.ListQueryParams) {
  return requestClient.get<Api.ListResponse>('admin/users/exists', {
    params,
  });
}

/**
 * 创建
 * @param data 角色数据
 */
async function create(data: Recordable<any>) {
  return requestClient.post('system/role', data);
}

/**
 * 更新
 *
 * @param id 角色 ID
 * @param data 角色数据
 */
async function update(id: string, data: Recordable<any>) {
  return requestClient.put(`system/role/${id}`, data);
}

// /**
//  * 删除
//  * @param id ID
//  */
// async function del(id: string) {
//   return requestClient.delete(`system/role/${id}`);
// }

/**
 * 扣款
 * @param data 角色数据
 */
async function deduct(data: Recordable<any>) {
  return requestClient.post('admin/deduct', data);
}

/**
 * 存款
 * @param data 角色数据
 */
async function deposit(data: Recordable<any>) {
  return requestClient.post('admin/deposit', data);
}

export { create, deduct, deposit, getList, getUserByUsername, update };
