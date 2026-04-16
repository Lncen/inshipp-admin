import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace Api {
  export interface Item {
    product?: string | undefined;
    id?: string | undefined;
    key: string;
    label: string;

    value: string;
    description: string;

    input_type: number | undefined;
    type_config: string;

    default_value: string;
    use_default: number;

    is_required: number;
    is_hidden: number;

    validate_min: number;
    validate_max: number;

    is_edit: number;
  }

  export interface QueryParams {
    page?: number;
    page_size?: number;
    product_id?: number;
  }
}

// 6. 输入类型 (InputType)
export const inputTypeOptions = [
  { value: 1, label: '单行文字' },
  { value: 2, label: '多行文字' },
  { value: 3, label: '单项选择' },
  { value: 4, label: '密码类型' },
  { value: 5, label: '多项选择' },
  { value: 6, label: '数字类型' },
  { value: 7, label: '累乘类型' },
  { value: 8, label: '累乘下拉单选' },
  { value: 9, label: '开关类型' },
  { value: 10, label: 'QQ 号码' },
  { value: 11, label: '手机号码' },
  { value: 12, label: '邮箱地址' },
  { value: 13, label: '通用链接提取' },
  { value: 14, label: '通用 ID 提取' },
  { value: 15, label: '说说 ID' },
] as const;

/**
 * 创建
 * @param data 数据
 */
async function create(data: Recordable<any>) {
  return requestClient.post('products-param', data);
}

/**
 * 更新
 *
 * @param id ID
 * @param data 数据
 */
async function update(id: string, data: Recordable<any>) {
  return requestClient.put(`products-param/${id}`, data);
}

/**
 * 删除
 * @param id ID
 */
async function remove(id: any) {
  return requestClient.delete(`products-param/${id}`);
}

export { create, remove, update };
