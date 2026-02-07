import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace Api {
  // 会员等级接口定义
  export interface Item {
    id: string;
    name: string;
    price?: number;
    image?: string;
    categoryId?: string; // 所属分类 ID
    children?: Item[];
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
    category?: string;
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
  export interface MenuItem {
    id: string;
    name: string;
    path: string;
    children: MenuItem[];
  }

  export interface ProductItem {
    id: string;
    uid: string;
    name: string;
    images: string[];
    description: string;
    ordering_notes: string;
    is_card_product: boolean;
    is_refund_allowed: boolean;
    price: string;
    profit: number;
    stock: number;
    input_fields: any[]; // 若有具体结构可替换为更精确类型
    is_active: boolean;
    sort_weight: number;
    last_sync_at: null | string; // ISO 8601 格式时间字符串，如 "2026-01-06 22:17:03"
    sync_status: 'failed' | 'pending' | 'success' | string; // 可根据实际枚举值细化
    created_at: string; // "2026-01-06 22:17:03"
    updated_at: string;
    cost_price: string; // 同 price，建议保持 string
    min_quantity: number;
    max_quantity: number;
    upstream_tags: string; // 如 "self,自营"，也可考虑 string[]
    upstream_category_name: string;
    upstream_refund_allowed_statuses: any[]; // 若无内容或结构未知，保留 any[]
    supplier_name: string;
    category_name: string;
    category: number; // 分类 ID
  }
}

/**
 * 获取数据
 */
async function getList(params: Recordable<any>) {
  return requestClient.get<Array<Api.ListResponse>>('products', {
    params,
  });
}

/**
 * 创建
 * @param data 数据
 */
async function create(data: Recordable<any>) {
  return requestClient.post('products', data);
}

/**
 * 更新
 *
 * @param id ID
 * @param data 数据
 */
async function update(id: string, data: Recordable<any>) {
  return requestClient.put(`products/${id}`, data);
}

/**
 * 删除
 * @param id ID
 */
async function remove(id: Api.Item['id']) {
  return requestClient.delete(`products/${id}`);
}

/**
 * 获取分类数据
 */
async function getCategories() {
  return requestClient.get<Array<Api.MenuItem>>('categories/tree_menu');
}

/**
 * 获取详细数据
 */
async function getDetail(id: string) {
  return requestClient.get<Array<Api.ProductItem>>(`products/${id}`);
}

/**
 * 商品主图添加引用
 */
async function assetCreateReference(data: Recordable<any>) {
  return requestClient.post('products', data);
}
/**
 * 商品主图删除引用
 */
async function assetDeleteReference(data: Recordable<any>) {
  return requestClient.post('products', data);
}

export {
  assetCreateReference,
  assetDeleteReference,
  create,
  getCategories,
  getDetail,
  getList,
  remove,
  update,
};
