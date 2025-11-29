import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace Api {
  // 单个钱包记录的类型
  export interface Item {
    id: number;
    username: string;
    phone: null | string;
    type: number;
    type_display: string;
    amount: string;
    amount_display: string;
    balance_before: string;
    balance_after: string;
    reference_id: string;
    remark: string;
    created_at: string;
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
  return requestClient.get<Api.ListResponse>('admin/wallet/user', {
    params,
  });
}

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

export { deduct, deposit, getList };
