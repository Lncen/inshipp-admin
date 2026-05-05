import { requestClient } from '#/api/request';

export namespace Api {
  // 单个钱包记录的类型
  export interface Item {
    id?: number | undefined;
    parent_id: string;
    name: string;
    description: string;
    parent_infos: Api.Item[];
  }

  export interface Detail {
    id: number;
    is_card_code: number; // 1: 卡密, 2: 其他类型
    buy_min_limit: number; // 最小购买数量
    buy_max_limit: number; // 最大购买数量
    is_repeat: number; // 是否重复购买: 1: 允许, 0: 不允许
    is_batch: number; // 是否批量: 1: 是, 0: 否
    particulars: string; // 商品详情（HTML格式）
    description: string; // 商品描述
    goods_category_name: string; // 商品分类名称
    buy_rate: number; // 购买比例/折扣率
    create_time: number; // 创建时间（时间戳）
    GoodsPrice: string; // 商品价格（字符串格式）
    price: number; // 实际价格
    CanTui: string; // 可退状态配置
    tui_status: string; // 退款状态
    ParamsTemplate: string; // 参数模板（JSON字符串）
    buy_params: BuyParam[]; // 购买参数数组
    refund_status: number[]; // 退款状态数组
    name: string; // 商品名称
    goodsThumb: string; // 商品缩略图
    image_urls: string[]; // 商品图片URL数组
    is_close: number; // 是否关闭: 1: 关闭, 2: 开启
    goods_category_id: number; // 商品分类ID
    price_show_num: number; // 价格显示位数
    stock: number; // 库存（-1表示无限）
    unit: string; // 单位
  }

  // 购买参数接口
  export interface BuyParam {
    description: string; // 参数描述
    is_default: boolean; // 是否默认
    key: string; // 参数键
    name: string; // 参数名称
    type: number; // 参数类型: 1: 文本, 2: 数字等
    type_config: string; // 类型配置
    value: string; // 参数值
    verify: {
      max: number; // 最大值验证
      min: number; // 最小值验证
    };
  }

  export interface ListResponse {
    count: number;
    next: null | string;
    previous: null | string;
    results: Item;
  }
}

/**
 * 获取列表数据
 */
async function getList(params?: Api.Item) {
  return requestClient.get<Api.ListResponse>('vendors', {
    params,
  });
}

async function getCategory(params: { vendor_id: number }) {
  return requestClient.get<Api.Item[]>('vendors-category', {
    params,
  });
}

async function getProducts(data: {
  category_id: number | undefined;
  vendor_id: number | undefined;
}) {
  return requestClient.post<Api.Detail[]>('vendors-product-list', data);
}

async function getDetail(id: string) {
  return requestClient.get<Api.Item>(`vendors/${id}`);
}

/**
 * 状态检擦
 * @param params 供应商ID
 */
async function health_check(params: any) {
  return requestClient.get<Api.Item>('vendors-info', { params });
}

/**
 * 创建
 * @param data 角色数据
 */
async function create(data: any) {
  return requestClient.post('vendors', data);
}

/**
 * 用来yile同步商品数据到本地
 * @param detail 数据
 */
export function mapDetailToBackendPayload(
  detail: Api.Detail,
): Record<string, any> {
  // 安全转价格为字符串（防止科学计数法，保留精度）
  const priceToStr = (val: number | string | undefined): string => {
    if (val === null) return '0.00000000';
    return typeof val === 'number' ? val.toFixed(8) : String(val);
  };

  // 解析 ParamsTemplate（如果非空）
  let paramsTemplate = [];
  if (detail.ParamsTemplate) {
    try {
      paramsTemplate = JSON.parse(detail.ParamsTemplate);
    } catch {
      // 解析失败则设为空数组
    }
  }

  // 转换 buy_params（仅结构适配，值不变）
  const buyParams = detail.buy_params.map((param: any) => {
    let typeConfig = {};
    try {
      if (typeof param.type_config === 'string') {
        typeConfig = JSON.parse(param.type_config || '{}');
      }
    } catch {
      // ignore
    }

    return {
      key: param.key,
      label: param.name,
      description: param.description,
      input_type: param.type,
      type_config: typeConfig,
      value: param.value || '',
      default_value: '',
      use_default: 2,
      is_required: 1,
      is_edit: 2,
      validate_min: param.verify?.min ?? 0,
      validate_max: param.verify?.max ?? 0,
    };
  });

  // 💡 关键：按你要求 —— 不转换值，只改字段名
  return {
    name: detail.name,
    category_id: null,
    stock: detail.stock,

    // 🔸 直接透传值，仅改名
    is_closed: detail.is_close, // 前端 is_close → 后端 is_closed（值不变）
    is_repeatable: detail.is_repeat, // 前端 is_repeat → 后端 is_repeatable（值不变）

    is_batch: detail.is_batch,
    images: detail.image_urls,
    min_quantity: detail.buy_min_limit,
    max_quantity: detail.buy_max_limit,
    description: detail.description,
    unit: detail.unit,

    // 💰 确保价格字段非空（解决 NOT NULL 错误）
    fixed_price: priceToStr(detail.price),
    cost_price: priceToStr(detail.price), // ← 用 price 填充，避免 null
    loss_price: priceToStr(detail.price), // 或根据业务调整

    price_display_precision: detail.price_show_num,
    buy_params: buyParams,
    params_template: paramsTemplate,

    // 固定值（根据你之前示例补充）
    source_type: 1,
    type: 8,
    status: 1,
    fulfillment_type: 3,
    purchase_step: '1.0000',
    input_fields_overridden: 1,
    rule_type: 3,
    sort: 0,
    vendor_id: null,
    vendor_sku_id: detail.id,
    item_coefficient: null,
  };
}

export { create, getCategory, getDetail, getList, getProducts, health_check };
