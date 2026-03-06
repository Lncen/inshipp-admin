import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace Api {
  // 单个钱包记录的类型
  export interface Item {
    // 基础信息
    id: number;
    name: string;
    code: string;
    category: number;
    status: number;

    // 余额
    balance: number;

    // 联系信息
    contact_name: string;
    contact_phone: string;
    contact_email: string;
    website: string;

    // 代理信息
    api_base_url: string;
    api_key: string;
    api_secret: string;
    priority: number;

    // 地址信息
    country: null | string;
    province: null | string;
    city: null | string;
    address: null | string;

    // 其他
    remark: null | string;

    // 继承自BaseModel和SoftDeleteModel的时间字段
    created_at: string; // ISO 8601 日期字符串
    updated_at: string; // ISO 8601 日期字符串
    deleted_at: null | string; // 软删除时间，null表示未删除
  }

  export interface ListResponse {
    count: number;
    next: null | string;
    previous: null | string;
    results: Item[];
    total_balance: string; // 所有钱包余额总和，字符串格式
  }

  export interface ListQueryParams {
    name?: string; // 搜索关键词（用户名/手机/邮箱）
    page?: number;
    page_size?: number;
  }
}

export const supplierCategoryOptions = [
  { label: '生产厂家', value: 1, type: 'primary' },
  { label: '批发商', value: 2, type: 'success' },
  { label: '代理商', value: 3, type: 'warning' },
  { label: '经销商', value: 4, type: 'info' },
  { label: '进口商', value: 5, type: 'default' },
  { label: '其他', value: 6, type: 'default' },
] as const;

export const supplierStatusOptions = [
  { label: '待审核', value: 0, type: 'warning' },
  { label: '合作中', value: 1, type: 'success' },
  { label: '暂停合作', value: 2, type: 'info' },
  { label: '终止合作', value: 3, type: 'danger' },
  { label: '黑名单', value: 4, type: 'danger' },
] as const;

/**
 * 获取列表数据
 */
async function getList(params?: Api.ListQueryParams) {
  return requestClient.get<Api.ListResponse>('sup', {
    params,
  });
}

/**
 * 创建
 * @param data 角色数据
 */
async function create(data: Recordable<any>) {
  return requestClient.post('sup', data);
}

/**
 * 更新
 *
 * @param id 角色 ID
 * @param data 角色数据
 */
async function update(id: string, data: Recordable<any>) {
  return requestClient.put(`sup/${id}`, data);
}

/**
 * 删除
 * @param id ID
 */
async function del(id: string) {
  return requestClient.delete(`sup/${id}`);
}

/**
 * 获取下拉选择器数据
 */
async function getSupSelectData() {
  return requestClient.get<Api.ListResponse>('sup/sup_select');
}

export { create, del, getList, getSupSelectData, update };
