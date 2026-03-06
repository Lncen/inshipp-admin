import type { Recordable } from '@vben/types';

import type { Api as BuyProductsApi } from '#/api/products/by_param';

import { requestClient } from '#/api/request';

export namespace Api {
  // 会员等级接口定义
  export interface Item {
    id?: string | undefined;
    name: string;
    source_type: number;
    source_type_display: string;
    status: number;
    status_display: string;
    type: number;
    type_display: string;
    price: string;
    cost_price: string;
    stock: number;
    is_closed: number;
    sort: number;
    category_name: string;
    created_at: string;
    images: string[];
  }

  export interface ProductItem {
    // ── 基础字段 ───────────────────────────────
    id?: string | undefined;
    name: string;
    after_sale_rules: string;
    description: string;
    unit: string;

    // ── 分类 ───────────────────────────────────
    category: number | undefined;

    // ── 价格（注意：Decimal 在 JSON 中为 string）────────
    cost_price: string; // e.g. "99.99000000"
    price: string; // e.g. "199.99000000"
    purchase_step: string; // e.g. "1.0000"
    price_display_precision: number;
    images: string[];

    // ── 库存与购买限制 ───────────────────────────
    stock: number; // -1 表示无限库存
    min_quantity: number;
    max_quantity: number;

    // ── 履约与功能标志 ───────────────────────────
    fulfillment_type: number;
    status: number;
    source_type: number;
    type: number;
    is_closed: number;
    is_repeatable: number;
    is_batch: number;
    can_refund: number;
    rule_type: number;
    buy_params: BuyProductsApi.Item[];

    // ── 其他 ───────────────────────────────────
    sort: number;
    input_fields_overridden: number;

    // ── 上游 ───────────────────────────────────
    owner_sup?: number;
    params_template: undefined[];

    // ── 时间 ───────────────────────────────────
    created_at: string;
    updated_at: string;
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
  return requestClient.get<Api.ProductItem>(`products/${id}`);
}
// utils/choices.ts

// 1. 兑换方式 (RedeemType)
export const redeemTypeOptions = [
  { label: '自动发货', value: 1 },
  { label: '人工处理', value: 2 },
  { label: '内部API触发', value: 3 },
] as const;

// 2. 商品类型 (ProductType)
export const productTypeOptions = [
  { label: '会员卡', value: 1 },
  { label: '优惠券', value: 2 },
  { label: '礼品卡 / 充值卡', value: 3 },
  { label: '数字内容（电子书 / 视频）', value: 4 },
  { label: '在线服务', value: 5 },
  { label: '在线课程', value: 6 },
  { label: '游戏道具 / 点卡', value: 7 },
  { label: '其他虚拟商品', value: 8 },
] as const;

// 3. 商品状态 (ProductStatus)
// utils/choices.ts
export const productStatusOptions = [
  { label: '待审核', value: 1, type: 'info' },
  { label: '未通过', value: 2, type: 'danger' },
  { label: '待上架', value: 3, type: 'warning' },
  { label: '已下架', value: 5, type: 'info' },
  { label: '已清退', value: 6, type: 'danger' },
  { label: '已上架', value: 7, type: 'success' },
  { label: '售罄', value: 8, type: 'warning' },
] as const;

// 4. 来源类型 (SourceType)
export const sourceTypeOptions = [
  { label: '供应商对接', value: 1 },
  { label: '本地商品', value: 2 },
  { label: '跨境进口', value: 3 },
  { label: '用户生成', value: 4 },
  { label: '联营合作', value: 5 },
  { label: 'API对接', value: 6 },
  { label: '手动录入', value: 7 },
  { label: '分销商品', value: 8 },
] as const;

// 5. 是/否 (FlagChoice)
export const flagOptions = [
  { label: '是', value: 1, type: 'success' },
  { label: '否', value: 2, type: 'danger' },
];

// 5. 是/否关闭下单 (FlagChoice)
export const isClosedOptions = [
  { label: '否', value: 1, type: 'success' },
  { label: '是', value: 2, type: 'danger' },
] as const;

// 7. 规则类型 (RuleType)
export const ruleTypeOptions = [
  { label: '固定', value: 1 },
  { label: '百分比', value: 2 },
] as const;

export {
  // assetCreateReference,
  // assetDeleteReference,
  create,
  getCategories,
  getDetail,
  getList,
  remove,
  update,
};
