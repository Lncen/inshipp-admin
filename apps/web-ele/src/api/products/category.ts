import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace Api {
  // 会员等级接口定义
  export interface Item {
    id: string;
    name: string;
    parent: number;
    parent_name: string;
    is_active: boolean;
    icon: string;
    sort: number;
    path: string;
    children: Item[];
  }

  // 编辑或创建字段（假设可编辑的字段）
  export interface EditOrCreateParams {
    id?: number;
    name?: string;
    is_active?: boolean;
  }

  // 表查询参数
  export interface QueryParams {
    page?: number;
    page_size?: number;
    name?: string;
    is_active?: boolean;
    // 可根据实际需求添加更多查询参数
  }

  // 列表响应数据
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
  return requestClient.get<Array<Api.Item>>('categories', {
    params,
  });
}

/**
 * 创建
 * @param data 数据
 */
async function create(data: Recordable<any>) {
  return requestClient.post('categories', data);
}

/**
 * 更新
 *
 * @param id ID
 * @param data 数据
 */
async function update(id: string, data: Recordable<any>) {
  return requestClient.put(`categories/${id}`, data);
}

/**
 * 删除
 * @param id ID
 */
async function remove(id: Api.Item['id']) {
  return requestClient.delete(`categories/${id}`);
}

/**
 * 获取弹窗节点树
 */
async function getTreeSelect() {
  return requestClient.get<Array<Api.Item>>('categories/tree_select');
}

export { create, getList, getTreeSelect, remove, update };
