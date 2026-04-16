import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace Api {
  // 会员等级接口定义
  export interface Item {
    id: number;
    level_id: number;
    name: string;
    required_score: number;
    discount_rate: number;
    is_active: boolean;
    description: string;
    created_at: string;
    updated_at: string;
  }

  // 编辑或创建字段（假设可编辑的字段）
  export interface EditOrCreateParams {
    level_id?: number;
    name?: string;
    required_score?: number;
    discount_rate?: number;
    is_active?: boolean;
    description?: string;
  }

  // 会员等级列表查询参数
  export interface QueryParams {
    page?: number;
    page_size?: number;
    name?: string;
    is_active?: boolean;
    // 可根据实际需求添加更多查询参数
  }

  // 会员等级列表响应数据
  export interface ListResponse {
    current_page: number;
    page_size: number;
    total_pages: number;
    total: number;
    results: Item[];
  }
}

/**
 * 获取列表数据
 */
async function getList(params?: Api.QueryParams) {
  return requestClient.get<Array<Api.Item>>('user_level', {
    params,
  });
}

/**
 * 创建
 * @param data 数据
 */
async function create(data: Recordable<any>) {
  return requestClient.post('user_level', data);
}

/**
 * 更新
 *
 * @param id ID
 * @param data 数据
 */
async function update(id: string, data: Recordable<any>) {
  return requestClient.put(`user_level/${id}`, data);
}

/**
 * 删除
 * @param id ID
 */
async function remove(id: Api.Item['id']) {
  return requestClient.delete(`user_level/${id}`);
}

export { create, getList, remove, update };
